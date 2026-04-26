# Research — Issue #290: BreadcrumbList + dedupe Article

## Findings

### 1. Duplicate Article schema source
- `index.html` lines 137-168: hard-coded generic Article JSON-LD ("The Complete Guide to DHM (Dihydromyricetin) for Hangover Prevention"). This is built into `dist/index.html` and inherited by every prerendered post via JSDOM.
- `scripts/prerender-blog-posts-enhanced.js` lines 130-160: per-post Article JSON-LD (`headline`, `datePublished`, `dateModified`, post-specific image, etc.). Richer, post-accurate.

**Verified duplicate**: `dist/never-hungover/dhm-dosage-guide-2025/index.html` contains 2 `"@type": "Article"` matches (regex with `\s*`):
- one indented (from base HTML)
- one minified (injected by prerender)

→ **Decision: keep prerender per-post Article, delete the static one in `index.html`.**

### 2. BreadcrumbList helper already exists
- `src/utils/structuredDataHelpers.js` lines 237-311: `generateBreadcrumbSchema({ path, pageTitle })`.
- Used client-side only via `src/hooks/useSEO.js` (lines 133, 162, 188, 213, 232, 250, 272, 290, 353).
- **Crawlers do not see it** — it's appended after hydration, not in prerendered HTML.

**Spec wants:** `Home → Never Hungover → <post title>`.
**Helper currently emits:** `Home → Blog → <post title>` (segmentNames maps `'never-hungover': 'Blog'`).

→ Update `segmentNames['never-hungover']` to `'Never Hungover'` in helper to match spec, naturally aligning client-side and prerender output.

### 3. Main pages prerender
- `scripts/prerender-main-pages.js` covers `/`, `/guide`, `/reviews`, `/research`, `/about`, `/dhm-dosage-calculator`, `/compare`. Currently emits **no JSON-LD** beyond what's inherited from base `index.html` (and one optional FAQ for `/research`).
- After deleting static Article from `index.html`, main pages will no longer carry an Article schema. Spec wants BreadcrumbList added for these → use `generateBreadcrumbSchema`.

### 4. Other static schemas in index.html (KEEP)
- WebSite (line 106-132) — site-wide, valid on all pages
- Product / AggregateRating (line 170-212) — aggregate review across DHM supplements; appropriate site-wide for DHM Guide
- Organization (line 215-231) — knowledge panel signal

→ **Only the Article block (lines 137-168) is the duplicate. Delete it.**

## Plan
1. Edit `src/utils/structuredDataHelpers.js`: remap `'never-hungover'` → `'Never Hungover'`.
2. Edit `scripts/prerender-blog-posts-enhanced.js`: import `generateBreadcrumbSchema`, emit `<script type="application/ld+json">` for each post (`Home → Never Hungover → post title`).
3. Edit `scripts/prerender-main-pages.js`: import helper, emit BreadcrumbList per route.
4. Edit `index.html`: delete the static Article JSON-LD (lines 137-168) plus surrounding comments.
5. `npm run build` + verify grep counts.

## Acceptance criteria
- `grep -cE '"@type":\s*"Article"' dist/index.html` → `0` (was 1)
- `grep -cE '"@type":\s*"Article"' dist/never-hungover/<any>/index.html` → `1` (was 2)
- `grep -cE '"@type":\s*"BreadcrumbList"' dist/never-hungover/<any>/index.html` → `1` (was 0)
- `grep -cE '"@type":\s*"BreadcrumbList"' dist/reviews/index.html` → `1` (was 0)
