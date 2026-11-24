/**
 * Resolve the dateModified value for a blog post, used in both JSON-LD and sitemap.
 *
 * Resolution order:
 *   1. Explicit `post.dateModified` set in the JSON file (durable override)
 *   2. Latest git commit date for the JSON file (auto-derived freshness signal)
 *   3. `post.date` (final fallback for files not yet in git or shallow clones)
 *
 * Returns ISO-8601 strings (e.g. "2026-02-01T12:57:44+05:00") so JSON-LD validators
 * pass. Sitemap callers can `.split('T')[0]` for `YYYY-MM-DD`.
 *
 * Issue: #286. Refs #283.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cache = new Map();
const shallowCache = new Map();

// Hashes in the repo's shallow boundary file (`.git/shallow`). In a shallow
// clone (Vercel checks out ~10 commits) `git log -1 -- file` on any file
// untouched inside that window returns the boundary commit — whose date is the
// clone cutoff, not the file's real modification date. Issue: #415.
function shallowBoundary(cwd) {
  if (!shallowCache.has(cwd)) {
    let hashes = new Set();
    try {
      const p = execSync('git rev-parse --git-path shallow', {
        cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();
      const abs = path.resolve(cwd, p);
      if (fs.existsSync(abs)) {
        hashes = new Set(fs.readFileSync(abs, 'utf8').split('\n').filter(Boolean));
      }
    } catch (_) {
      // not a git repo — treat as no boundary
    }
    shallowCache.set(cwd, hashes);
  }
  return shallowCache.get(cwd);
}

export function getDateModified(post, jsonFilePath) {
  // 1. Explicit override on the post object
  if (post && typeof post.dateModified === 'string' && post.dateModified.length > 0) {
    return post.dateModified;
  }

  // 2. Cached git lookup for this file
  if (jsonFilePath && cache.has(jsonFilePath)) {
    return cache.get(jsonFilePath);
  }

  // 3. Git commit date for this JSON file
  if (jsonFilePath) {
    try {
      const out = execSync(
        `git log -1 --format=%H%x09%cI -- "${jsonFilePath}"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      const [hash, date] = out.split('\t');
      // Shallow-clone guard: a boundary commit's date is the clone cutoff, not
      // a real modification date — fall through to post.date instead.
      if (date && !shallowBoundary(path.dirname(jsonFilePath)).has(hash)) {
        cache.set(jsonFilePath, date);
        return date;
      }
    } catch (_) {
      // git unavailable or file untracked — fall through
    }
  }

  // 4. Final fallback: original publish date
  return post && post.date ? post.date : null;
}
