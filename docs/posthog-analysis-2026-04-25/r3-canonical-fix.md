# R3 - Canonical Script 404 Fix

**Date:** 2026-04-26
**Branch:** `fix/canonical-script-404`
**Files changed:** 2 — `index.html` (script tag removed), `canonical-fix.js` (deleted)

## The bug

Every page load on `https://www.dhmguide.com` throws `SyntaxError: Unexpected token '<'` in the console.

`index.html:80` referenced `<script src="/canonical-fix.js"></script>`, but no such file exists in the deployed `dist/`. Vercel serves the SPA fallback (`index.html`) at any unknown path, so the browser receives HTML at a URL it expected to be JavaScript and the parser throws.

Verified live with `curl -sI https://www.dhmguide.com/canonical-fix.js`:

```
HTTP/2 200
content-type: text/html; charset=utf-8
content-disposition: inline; filename="index.html"
```

## Why the file was missing

The file `canonical-fix.js` was committed at the **repo root**, not in `public/`. Vite only copies `public/*` to `dist/` at the site root — root-level files in the repo are NOT served. So the script tag has been broken on production since the day it was added.

**History:**
- `47c655b` (2025-07-11) — Created `canonical-fix.js` at repo root for SPA canonical normalization.
- `c04204b` (2025-10-20) — Added `<script src="/canonical-fix.js"></script>` to `index.html` (commit message: "Code Review Results: Grok no critical issues, Gemini found 1 critical missing step — script was created but never included in HTML"). Both AI reviewers missed that the file is at the wrong path. Bug shipped.
- The bug has been firing on every visitor's console for ~6 months.

## Choice: (a) DELETE — script tag and file

Per CLAUDE.md prime directive ("What can I DELETE to fix this?"), the runtime canonical fixer is **redundant** with what the codebase already does:

1. **Crawlers** (Googlebot, social bots — the only audience that matters for canonicals) see prerendered static HTML produced by `scripts/prerender-blog-posts-enhanced.js` and `scripts/prerender-main-pages.js`. Both bake the correct per-route canonical into each `dist/<route>/index.html`. Verified:
   - `dist/reviews/index.html` → `<link rel="canonical" href="https://www.dhmguide.com/reviews">`
   - `dist/never-hungover/dhm-dosage-guide-2025/index.html` → correct slug-specific canonical.
2. **Client-side SPA navigation** (humans clicking React Router links) is handled by `src/hooks/useSEO.js:80-89`, which already does `document.querySelector('link[rel="canonical"]').setAttribute('href', canonicalUrl)` whenever the route changes. The standalone `canonical-fix.js` was a duplicate of this same logic.

Both code paths exist, work, and have been working — the standalone script was an Oct-2025 belt-and-braces addition that ended up throwing console errors instead of providing belt or braces.

Rejected alternatives:
- **(b) Restore the file at `public/canonical-fix.js`** — would re-introduce dead code. Pattern #11 in CLAUDE.md plus the existing `useSEO` hook make this redundant. Adds bytes + a network round-trip + a `MutationObserver` that fires on every DOM mutation, with zero benefit over what `useSEO` already does on route change.
- **(c) Inline the logic into `index.html`** — same redundancy problem; just inline-redundant instead of remote-redundant.

## The diff

```diff
--- a/index.html
+++ b/index.html
@@ -74,10 +74,8 @@
     <meta name="keywords" content="DHM, ..." />
     <meta name="author" content="DHM Guide" />
     <meta name="robots" content="index, follow" />
-    <!-- Base canonical tag - dynamically updated by application for specific pages -->
+    <!-- Base canonical tag - rewritten per route by prerender scripts; updated client-side by useSEO hook -->
     <link rel="canonical" href="https://www.dhmguide.com" />
-    <!-- Canonical tag normalization script for SPA navigation -->
-    <script src="/canonical-fix.js"></script>
     <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
```

Plus `git rm canonical-fix.js` (36 lines of dead JS at repo root).

Net change: **-4 lines from index.html, -36 lines deleted file = -40 lines.**

## Verification

- `npm run build` — passed (189 blog posts prerendered, 7 main pages prerendered, no errors)
- `grep -rln "canonical-fix" dist/` — returns nothing (zero references across all 196 prerendered HTML files)
- `grep canonical dist/reviews/index.html` → `https://www.dhmguide.com/reviews` (correct, prerender still working)
- `grep canonical dist/never-hungover/dhm-dosage-guide-2025/index.html` → correct slug-specific canonical (correct, prerender still working)
- Live `curl -sI https://www.dhmguide.com/canonical-fix.js` — currently returns HTML with content-type `text/html`. Cannot fully verify until merge + deploy; after deploy the script tag is gone and the broken URL is no longer requested.

## Concurrent canonical work check

`git log --since="2025-10-01" -- src/hooks/useSEO.js scripts/prerender-main-pages.js scripts/prerender-blog-posts-enhanced.js` shows no recent canonical-handling changes (most recent: `38b4466` for schemas, not canonicals). Safe to delete.

## Expected impact

- Removes `SyntaxError: Unexpected token '<'` from every page load console (currently affects 100% of sessions)
- Eliminates one failed network request per page load (the 200-OK-but-html response for `/canonical-fix.js`)
- Removes dead code from repo (one stranded JS file that has never been served)
- No SEO impact — canonical tags continue to be set correctly by prerender (crawlers) and `useSEO` hook (client navigation)
