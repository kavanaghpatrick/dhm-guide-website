# Research: Issue #344 Post-Audit Cleanup

## Executive Summary

All 5 verified items from issue #344 confirmed real against current codebase (commit `d9e36ae`, branch `cleanup/issue-344-post-audit`). One scope refinement uncovered: OG image fallback affects **62 posts** (not 61 as claimed) and has a latent architectural inconsistency — `prerender-blog-posts-enhanced.js` falls back to `/og-image.jpg` while `useSEO.js` falls back to `/blog-default.webp`. Recommend unifying these as part of Item #4.

**Feasibility: High** | **Risk: Low** | **Effort: S–M** (~2 hrs across 5 fixes)

All fixes are additive (no removal of existing behavior except dead deps). No regressions expected. Items #1, #2, #3, #5 are mechanical; Item #4 needs a pragmatic decision (see below).

---

## Item 1 — Prerender body stub: per-route content

**Status**: VERIFIED. Both claims accurate.

**Current state**:
- `scripts/prerender-main-pages.js` iterates 7 routes (homepage, /reviews, /guide, /research, /about, /dhm-dosage-calculator, /compare) at `scripts/prerender-main-pages.js:7-96`
- Script mutates `<head>` only at `scripts/prerender-main-pages.js:137-190` (title, description, OG tags, Twitter Card, canonical, FAQ schema, breadcrumb schema)
- Off-screen body stub originates in `index.html:242-246`:
  ```html
  <div style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
    <h1>DHM Guide: Science-Backed Hangover Prevention</h1>
    <p>Discover how DHM (Dihydromyricetin) prevents hangovers...</p>
    <p>Learn about proper DHM dosage, timing...</p>
  </div>
  ```
- Inherited unchanged by every prerendered main page (verified in `dist/reviews/index.html:239-243`, `dist/guide/index.html:239-243` etc.)

**Why this stub exists**: Recent commit `d9e36ae` (PR #343, FOUC fix) restored off-screen positioning for the prerender div. The stub itself is intentional (gives crawlers parsable body content) but the **content** is generic. Twitter/Facebook crawlers parse the prerendered HTML and see correct `<head>` OG tags but generic homepage body — content mismatch.

**Reference for fix shape**: `scripts/prerender-blog-posts-enhanced.js:328` already does per-route body content injection via:
```html
<div id="prerender-content" style="position: absolute; ...">
  <article>...per-post HTML...</article>
</div>
```

**Implementation path**: Add an `id="prerender-main-stub"` to the existing div in `index.html`, then in `prerender-main-pages.js` add a `bodyStub` field to each route entry and replace that div's innerHTML in the same loop that updates `<head>`. Preserves FOUC behavior (div stays off-screen) while differentiating crawler content per route.

---

## Item 2 — PostHog bot/preview exclusion

**Status**: VERIFIED. No guards beyond a dev mode check.

**Current state** (`src/lib/posthog.js:19-103`):
```javascript
export function initPostHog() {
  if (import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_DEV) {
    console.log('[PostHog] Skipping initialization in development');
    return;
  }
  posthog.init(POSTHOG_API_KEY, { api_host: '/ingest', ... });
}
```

- No user-agent check, no Vercel preview detection, no hostname filter
- `VITE_VERCEL_ENV` / `VITE_VERCEL_URL` — not set in `.env.example`, never referenced anywhere in the codebase
- `initPostHog()` called from `src/App.jsx:41-47` on page load
- **Secondary capture sites that bypass init guards**:
  - `src/utils/engagement-tracker.js` calls `window.posthog.capture()` directly
  - `src/lib/posthog.js:275` `identifyUser()` calls `posthog.identify()` directly
  - The existing `initialized` flag check (lines 111, 219, 274) only verifies init completion, not whether bots should be filtered

**Recent A/B experiments at risk**: PR #259 (/reviews CTA), PR #258 (clickable product cards), PR #255 (winning-variant retests) — all enrolled bots/previews into experiment cohorts.

**Implementation path**: Gate at top of `initPostHog()` with bot UA regex and hostname check (`vercel.app` substring is the canonical Vercel preview signal). Optional: also call `posthog.opt_out_capturing()` to neutralize the secondary capture sites without needing to gate each one. Issue's suggested 5-10 line fix is adequate.

```javascript
const ua = navigator.userAgent || '';
const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|prerender|headless|phantomjs|lighthouse/i.test(ua);
const host = window.location.hostname;
const isPreview = host.includes('vercel.app') || host === 'localhost' || host.startsWith('127.');
if (isBot || isPreview) {
  return; // skip init entirely; secondary sites check posthog.__loaded
}
```

---

## Item 3 — Mobile inputmode + safe-area-inset

**Status**: VERIFIED. All 3 claims accurate, line numbers match.

| Claim | File:Line | Current | Fix |
|-------|-----------|---------|-----|
| Duration input missing `inputmode="decimal"` | `src/pages/DosageCalculator.jsx:519-522` | `type="number"` + `step="0.5"` (no inputmode) | Add `inputmode="decimal"` |
| Viewport meta missing `viewport-fit=cover` | `index.html:27` | `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />` | Add `, viewport-fit=cover` |
| Sticky CTA bottom inset | `src/components/StickyMobileCTA.jsx:72` | `className="fixed bottom-0 left-0 right-0 ... p-3 ..."` | Add `pb-[env(safe-area-inset-bottom)]` |

**Bonus opportunities** (not in issue, but noted by research):
- `DosageCalculator.jsx:425` (weight) and `DosageCalculator.jsx:481` (drinks) are integer inputs that could benefit from `inputmode="numeric"`. **Out of scope** — issue only specified duration. Stay literal.

---

## Item 4 — OG image fallback for posts without hero images

**Status**: VERIFIED with scope refinement. **62 posts affected** (not 61 as issue claims).

**Fallback points found**:

1. **`scripts/prerender-blog-posts-enhanced.js:100-103`** — only sets `og:image` if `post.image` truthy:
   ```javascript
   if (ogImage && post.image) {
     ogImage.setAttribute('content', `https://www.dhmguide.com${escapeHtml(post.image)}`);
   }
   ```
   When null, the meta tag retains its base value (`/og-image.jpg` from `index.html`).

2. **`scripts/prerender-blog-posts-enhanced.js:154`** — Article schema fallback:
   ```javascript
   "image": post.image ? `...${escapeHtml(post.image)}` : "https://www.dhmguide.com/og-image.jpg"
   ```

3. **`src/hooks/useSEO.js:298-300`** — Client-side fallback (different default):
   ```javascript
   const finalImage = extractedImage ? `${baseUrl}${extractedImage}` : `${baseUrl}/blog-default.webp`;
   ```

**Architectural inconsistency**: Prerender → `/og-image.jpg`, client SEO hook → `/blog-default.webp`. Two different fallback paths for the same logical case. **Recommend unifying** as part of this fix.

**Schema reality**:
- No `category` field on post JSONs. Posts use freeform `tags` arrays.
- Top tag clusters: hangover prevention (~38 posts), comparison (~13), DHM/supplements (~21), research/lifestyle (mixed)
- `/public/` already has hangover-themed hero images (`hangover-cure-hero.webp`, `dhm-hangover-prevention.webp`, etc.) but **no research/comparison/lifestyle category images**

**Pragmatic Option B variant** (keeps issue's intent without commissioning new artwork):
1. Add a `getCategoryImage(post)` helper that maps tags → existing public images
2. Define a small mapping table:
   - `hangover-prevention`/`hangover-cure` tags → `/dhm-hangover-prevention.webp`
   - `comparison`/`vs` tags → `/og-image.jpg` (until a comparison image exists)
   - `research`/`science`/`study` tags → `/og-image.jpg`
   - `lifestyle`/`college`/`business` tags → `/og-image.jpg`
   - default → `/og-image.jpg`
3. Apply in BOTH fallback sites (prerender + useSEO) so they stay consistent
4. Unify the default — pick `/og-image.jpg` (it's the social card; `/blog-default.webp` was inconsistent)

This delivers ~38 posts (hangover-tagged) onto a more relevant image immediately. Other categories stay on unified default until images get created. Zero new asset creation needed.

**One broken-reference outlier**: `flyby-vs-fuller-health-complete-comparison.json` references `/images/flyby-vs-fuller-health-hero.jpg` which doesn't exist. Fix: set its `image` to `null` so it falls through to the new categorized fallback. (Cleaner than a broken path.)

---

## Item 5 — Remove 5 unused dependencies

**Status**: VERIFIED. Zero-import confirmed for all 5; the 3 to-keep are all confirmed in active use.

| Package | Wrapper | Imports outside wrapper |
|---------|---------|-------------------------|
| `recharts` | `src/components/ui/chart.jsx` | none |
| `embla-carousel-react` | `src/components/ui/carousel.jsx` | none |
| `input-otp` | `src/components/ui/input-otp.jsx` | none |
| `cmdk` | `src/components/ui/command.jsx` | none |
| `vaul` | `src/components/ui/drawer.jsx` | none |

**Confirmed-in-use (do NOT remove)**:
- `micromark` — `scripts/prerender-blog-posts-enhanced.js:1`
- `next-themes` — `src/components/ui/sonner.jsx:1`
- `posthog-js` — `src/lib/posthog.js:1`

Removing these 5 deletes 5 wrapper files + 5 npm deps. Estimated bundle savings: ~340KB raw / ~75KB Brotli.

---

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|-----------|
| #1 prerender bodyStub | Low — additive, opt-in per route | Verify built HTML for all 7 routes after build |
| #2 posthog gate | Low — fewer events captured, dashboards may show drop | Document the data-quality reason; backward-compatible (existing event shape unchanged) |
| #3 mobile UX | Very low — three attribute additions | Manual viewport check on mobile or just trust visual inspection of build output |
| #4 OG fallback | Low if we unify; medium if we leave both paths different | Unify default in BOTH prerender + useSEO; hardcoded mapping table is auditable |
| #5 dep removal | Very low — verified zero imports | `npm run build` post-removal |

---

## Out of Scope (False Positives Per Issue)

- /reviews experiment overlap (flags isolated)
- Tailwind v4 `@source` (v4 auto-detects)
- Blog inline affiliate placement (already has `data-placement`)
- lucide-react bundle (39.2KB Brotli is fine)
- engagement-tracker.js orphan (actively imported)
- comparison/header z-index (no geometric overlap)

Plus, deferred opportunities found during research that should NOT be added to this scope:
- inputmode for weight/drinks fields (not specified in issue)
- Migrating secondary capture sites (`engagement-tracker.js`, `identifyUser`) to use the init guard — `posthog.init()` skipping is sufficient if we never call init; the secondary sites check `posthog.__loaded` before firing, which only goes true after init succeeds

---

## Recommendations

1. **Bundle items 1, 2, 3, 5 into one PR each** — small, mechanical, easy to review. The issue suggests 5 separate PRs but each is genuinely independent.
2. **Item 4 deserves its own PR** — touches multiple files, has a unification decision worth reviewing in isolation.
3. **No external AI validation needed at design phase** — all 5 are mechanical fixes from a verified audit. Per CLAUDE.md Patterns #6, #7, #10, deletion/data-only changes are lowest risk; these all fit that profile.
4. **`npm run build` after each item** is the primary verification. No new tests warranted (these aren't behavioral changes — they're SEO/data-quality/hygiene fixes).

---

**Next phase**: Requirements (single product-manager agent, since scope is verified).
