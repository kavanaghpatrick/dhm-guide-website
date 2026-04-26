# Research: Issue #286 — dateModified field site-wide

## Problem confirmed
- 175 of 189 active post JSONs (93%) lack explicit `dateModified` field
- Schema generators fall back `dateModified := datePublished`, so JSON-LD emits identical dates
- Google's freshness signal is invisible in SERP

## Files emitting dateModified

| File | Line | Current behavior |
|---|---|---|
| `scripts/prerender-blog-posts-enhanced.js` | 140 | `"dateModified": post.date` (used in build) |
| `scripts/prerender-blog-posts.js` | 122 | `"dateModified": post.date` (legacy, unused in `npm run build`) |
| `src/utils/blogSchemaEnhancer.js` | 174 | `metadata.lastModified || metadata.date` (issue body said `src/lib/...` but actual path is `src/utils/...`) |
| `scripts/generate-sitemap.js` | 75 | `lastmod: post.date || today` |
| `src/hooks/useSEO.js` | 331 | `"dateModified": dateString` (client-side, mostly redundant after prerender) |

## Field naming inconsistency
- Most JSON files that have an override use `dateModified` at top level
- `blogSchemaEnhancer.js` reads `metadata.lastModified` (different name, **bug**)
- 14 posts already set `dateModified`; **0 posts use `lastModified`**, so the schema enhancer's fallback only ever resolves to `metadata.date`

## Build pipeline
`npm run build` runs:
1. `validate-posts.js` 
2. `generate-blog-canonicals.js`
3. `generate-sitemap.js` ← needs patch #3
4. `vite build`
5. `prerender-blog-posts-enhanced.js` ← needs patch #1
6. `prerender-main-pages.js`

`blogSchemaEnhancer.js` is imported only by `useSEO.js` (client-side). Crawlers see prerendered HTML, so prerender script + sitemap matter most for SEO. But fixing all three keeps everything consistent.

## Recommendation: on-the-fly with explicit override

Two options considered:

| Approach | Pros | Cons |
|---|---|---|
| Bulk-update all 175 JSONs | Stable, audit-able | 175 file edits; static snapshot drift |
| On-the-fly from git mtime | Zero-friction, always fresh | Requires git available at build (we're on Vercel — git is available) |

**Pick: on-the-fly with override.** Helper resolves in this order:
1. `post.dateModified` if explicitly set in JSON (durable override)
2. `git log -1 --format=%cI -- <json-file>` (auto-derived from history)
3. `post.date` (final fallback for files not yet in git or first commit)

Vercel's build runner has git; verified via `git log -1` returns a 2026-02-01 commit date for `activated-charcoal-hangover.json` even though `post.date` is `2025-01-10`. **That is exactly the freshness signal we want.**

## Sample before/after
- Post: `activated-charcoal-hangover`
- Current: `datePublished: 2025-01-10`, `dateModified: 2025-01-10` (identical)
- After: `datePublished: 2025-01-10`, `dateModified: 2026-02-01` (git commit date)

## Out of scope
- Backfilling `dateModified` into all 175 JSONs (deferred — auto-derive is sufficient)
- Updating `prerender-blog-posts.js` (legacy, not used by `npm run build`) — will patch anyway for consistency
- Updating `useSEO.js` (client-side fallback, after prerender it never renders) — will patch for parity
