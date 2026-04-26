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

const cache = new Map();

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
        `git log -1 --format=%cI -- "${jsonFilePath}"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (out) {
        cache.set(jsonFilePath, out);
        return out;
      }
    } catch (_) {
      // git unavailable, file untracked, or shallow clone — fall through
    }
  }

  // 4. Final fallback: original publish date
  return post && post.date ? post.date : null;
}
