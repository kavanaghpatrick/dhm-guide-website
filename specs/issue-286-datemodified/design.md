# Design: Issue #286

## Architecture

Single shared helper module: `scripts/lib/get-date-modified.js`

### Helper signature
```js
// scripts/lib/get-date-modified.js
import { execSync } from 'child_process';

const cache = new Map();

export function getDateModified(post, jsonFilePath) {
  // 1. Explicit override on post object
  if (post && typeof post.dateModified === 'string' && post.dateModified.length > 0) {
    return post.dateModified;
  }
  // 2. Cached git lookup
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
        const isoDate = out.split('T')[0]; // YYYY-MM-DD for sitemap; full ISO for JSON-LD
        cache.set(jsonFilePath, out);
        return out;
      }
    } catch (_) {
      // git unavailable or file untracked — fall through
    }
  }
  // 4. Final fallback: original publish date
  return post && post.date ? post.date : null;
}
```

Returns full ISO-8601 with timezone (`2026-02-01T12:57:44+05:00`). JSON-LD accepts ISO-8601. For sitemap, callers can `.split('T')[0]` to get `YYYY-MM-DD`.

## File-by-file changes

### 1. `scripts/lib/get-date-modified.js` (new, ~30 lines)
Helper as above. ESM. Exports `getDateModified(post, jsonFilePath)`.

### 2. `scripts/prerender-blog-posts-enhanced.js` (1 line + import)
- Add: `import { getDateModified } from './lib/get-date-modified.js';`
- Need access to JSON file path. Find where post is read (around `processBatch`/`prerenderPost`).
- Change line 140 from `"dateModified": post.date` to `"dateModified": getDateModified(post, post._sourcePath)` where `_sourcePath` is set when post is loaded.

### 3. `scripts/generate-sitemap.js` (1 line + import)
- Add: `import { getDateModified } from './lib/get-date-modified.js';`
- Change line 75 to `lastmod: (getDateModified(post, filePath) || today).split('T')[0]`

### 4. `scripts/prerender-blog-posts.js` (legacy, parity patch)
- Same change as #2. Not used by `npm run build` but patched for consistency.

### 5. `src/utils/blogSchemaEnhancer.js` (1-line, no helper — runs in browser)
- Cannot use `child_process` (browser context). Just fix the bug: prefer explicit `metadata.dateModified` over `metadata.lastModified`.
- Change line 174 from `metadata.lastModified || metadata.date` to `metadata.dateModified || metadata.lastModified || metadata.date`.
- Browser-side fallback is OK because crawlers see prerendered HTML which gets the git-derived date.

## Verification approach

After `npm run build`:
1. `grep -A1 '"dateModified"' dist/never-hungover/dhm-dosage-guide-2025/index.html` — confirm distinct from datePublished
2. `grep -B1 -A1 '<loc>https://www.dhmguide.com/never-hungover/' dist/sitemap.xml | head -30` — confirm `<lastmod>` looks like git commit dates not all `2025-01-XX`
3. Spot-check 3 posts: one with explicit `dateModified` (e.g., `zebra-striping-drinking-trend-2025`), one without (e.g., `activated-charcoal-hangover`), one likely freshly committed
4. Run a Google Rich Results validation manually post-deploy (out of CI)

## Risks
- **Vercel build env has git history?** Yes — confirmed via existing scripts that use git in build (e.g., `generate-blog-canonicals.js` if it does, or just by Vercel's default checkout depth being full). If shallow clone causes issue, the helper falls back to `post.date` gracefully — no crash, just stale dateModified for affected posts.
- **Build perf:** 189 git calls, each ~5ms = ~1s extra build time. Cached per-file. Acceptable.
- **execSync error in worktree-less context:** wrapped in try/catch.
