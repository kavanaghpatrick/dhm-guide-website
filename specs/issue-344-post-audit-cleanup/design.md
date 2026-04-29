# Design — Issue #344 Post-Audit Cleanup

## Overview

Five mechanical, independent fixes verified by audit. Items #1, #2, #3, #5 are zero-abstraction surface edits (attribute additions, early returns, file deletions). Item #4 introduces ONE shared helper at `src/lib/og-image.js` consumed by two sites (`useSEO.js` runtime + `prerender-blog-posts-enhanced.js` build) to satisfy AC-4.4 (architectural unification). No other shared abstractions warranted.

---

## Architecture

```mermaid
graph TB
  subgraph Build[Build Pipeline]
    PreMain[prerender-main-pages.js] -->|reads pages[].bodyStub| DistMain[dist/<route>/index.html]
    PreBlog[prerender-blog-posts-enhanced.js] -->|imports getOgImageForPost| OgHelper[src/lib/og-image.js]
    OgHelper -->|same default| DistBlog[dist/never-hungover/<slug>/index.html]
  end
  subgraph Runtime[Browser Runtime]
    UseSEO[src/hooks/useSEO.js] -->|imports getOgImageForPost| OgHelper
    PostHog[src/lib/posthog.js] -.->|skip init when bot/preview| Init[posthog.init]
  end
  subgraph Static[index.html]
    Stub[#prerender-main-stub div] -->|innerHTML rewritten per route| PreMain
    Viewport[viewport meta + viewport-fit=cover]
  end
```

---

## Item #1 — Per-route prerender body stub

**Files touched**:
- `index.html` (1 attribute add)
- `scripts/prerender-main-pages.js` (7 `bodyStub` fields + 1 mutation block)

**Approach**:

`index.html:242` — add an `id` to the existing off-screen div. **Do not change inline style** (FOUC fix from PR #343).

```html
<div id="prerender-main-stub" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
```

`scripts/prerender-main-pages.js` — add `bodyStub` field per page entry. Each ~3 lines (1 H1 + 2 short paragraphs, mirrors existing description copy):

```js
{
  route: '/about',
  title: '...',
  description: 'DHM Guide: Your resource for science-backed hangover prevention...',
  ogImage: '/about-og.jpg',
  bodyStub: '<h1>About DHM Guide</h1><p>DHM Guide is your resource for science-backed hangover prevention since 2020.</p><p>We analyze peer-reviewed clinical research and lab-test supplements to provide unbiased, expert guidance.</p>'
}
```

In the route loop after head mutations (~line 190), add:

```js
const stub = document.getElementById('prerender-main-stub');
if (stub && page.bodyStub) {
  stub.innerHTML = page.bodyStub;
}
```

**Stub copy** (one per route, SEO-aligned with each route's existing meta description):
- `/` — "DHM Guide: Science-Backed Hangover Prevention" + UCLA/clinical mentions (existing index.html copy is fine to keep)
- `/reviews` — "Best DHM Supplements 2026" + lab-tested + 7 pills tested
- `/guide` — "Complete DHM Guide 2026" + dosing/timing/clinical-studies
- `/research` — "Does DHM Work? 11 Clinical Studies" + UCLA/USC + 600+ participants
- `/about` — "About DHM Guide" + since 2020 + unbiased reviews
- `/dhm-dosage-calculator` — "DHM Dosage Calculator" + personalized + weight/drinking habits
- `/compare` — "Compare 7 Best DHM Hangover Supplements" + side-by-side + 60 seconds

**Verification**:
```bash
npm run build
for r in reviews guide research about dhm-dosage-calculator compare; do
  echo "=== /$r ==="
  grep -oE 'id="prerender-main-stub"' "dist/$r/index.html" | head -1
  grep -oE '<h1>[^<]+' "dist/$r/index.html" | head -1
done
```
Output must show `id="prerender-main-stub"` on every page AND distinct `<h1>` text per route. If any two H1s match, AC-1.3 fails.

**Rollback**: `git revert <commit>`. Single PR, two-file diff, low blast radius.

---

## Item #2 — PostHog bot/preview exclusion

**Files touched**: `src/lib/posthog.js` (one early-return block)

**Approach**: Insert guard inside `initPostHog()` AFTER existing DEV check (line 23-26), BEFORE `posthog.init()` call (line 29). Place at the top of the `try` block so SSR-safe `typeof window` check (line 20) still runs first.

```js
// After line 26 (DEV check), before try block at line 28:
const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|prerender|headless|lighthouse/i.test(ua);
const host = window.location.hostname;
const isPreview = host.includes('vercel.app') || host === 'localhost' || host.startsWith('127.');
if (isBot || isPreview) {
  console.log('[PostHog] Skipping init: bot or preview environment');
  return;
}
```

**No `posthog.opt_out_capturing()` call** — research confirmed secondary capture sites (`engagement-tracker.js`, `identifyUser` at line 274) gate on `posthog.__loaded` / module-local `initialized` flag, both of which stay false when init is skipped (AC-2.5).

**Verification**:
```bash
npm run build
# Spot check the production bundle doesn't strip the guard:
grep -oE "vercel\\.app" dist/assets/*.js | head -1
grep -oE "googlebot" dist/assets/*.js | head -1
```
Manual: load preview deployment in browser, check DevTools Network tab — no `/ingest/*` calls. Production traffic unaffected.

**Rollback**: `git revert`. 8-line addition, zero blast radius beyond PostHog itself.

---

## Item #3 — Mobile UX polish

**Files touched** (3 lines, 3 files):

| File | Line | Old | New |
|------|------|-----|-----|
| `src/pages/DosageCalculator.jsx` | 519 | `type="number"` | `type="number"` + `inputMode="decimal"` |
| `index.html` | 27 | `content="width=device-width, initial-scale=1.0, user-scalable=yes"` | `content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover"` |
| `src/components/StickyMobileCTA.jsx` | 72 | `... shadow-lg p-3 z-50 md:hidden ...` | `... shadow-lg p-3 pb-[env(safe-area-inset-bottom)] z-50 md:hidden ...` |

**Approach**: Three trivial attribute/className additions. `inputMode` is the React-camelCase prop, renders to `inputmode="decimal"` in HTML.

**Verification**:
```bash
npm run build
grep -o 'inputmode="decimal"' dist/assets/*.js | head -1   # built JSX prop survives
grep -o 'viewport-fit=cover' dist/index.html               # static
grep -o 'pb-\[env(safe-area-inset-bottom)\]' dist/assets/*.css | head -1  # arbitrary-value class compiled
```
Visual: open dist preview on iPhone, focus duration input → decimal keyboard appears; sticky CTA clears home indicator.

**Rollback**: `git revert`. Three independent attribute changes; can also revert one without the others.

---

## Item #4 — Unified categorized OG image fallback

### Decision: Canonical default = `/og-image.jpg`

**Justification**:
- Already the social card baked into `index.html` (`<meta property="og:image">` default).
- 60+ posts already point there via inheritance from `index.html` (when `post.image` is null, prerender leaves the meta tag's base value untouched).
- `/blog-default.webp` referenced by `useSEO.js:300` **does not exist** in `/public/` — currently emits a 404 fallback for any post without an image. Replacing with `/og-image.jpg` (which exists at both `.jpg` and `.webp`) fixes a latent bug.
- Existing file. No new artwork. Per research: "the whole point is no new artwork."

### Helper location: `src/lib/og-image.js`

**Why `src/lib/`**: matches `src/lib/posthog.js` precedent. ESM, no JSX, importable from both runtime and Node prerender script. `package.json` has `"type": "module"` (verified) so plain `import` from a Node script works with no transform. Path alias not needed — both consumer paths use relative imports today (`scripts/prerender-blog-posts-enhanced.js:15-17` already imports from `../src/utils/...`).

### Helper shape (~30 lines):

```js
// src/lib/og-image.js
const DEFAULT_OG_IMAGE = '/og-image.jpg';

// Tag → image rules. Evaluated in order; first match wins.
// Tag matching is case-insensitive substring on lowercased tag values.
// Keep simple — no regex, no NLP. Add rules as new public images become available.
const RULES = [
  {
    matchTags: ['hangover-prevention', 'hangover-cure', 'hangover prevention', 'hangover cure'],
    image: '/dhm-hangover-prevention.webp'
  }
  // Future: comparison, research, lifestyle — none have suitable existing assets;
  // they fall through to DEFAULT_OG_IMAGE until artwork is created.
];

/**
 * Returns the OG image path for a post.
 * - If post.image is truthy, returns it unchanged.
 * - Else evaluates tag rules in order and returns first match.
 * - Else returns DEFAULT_OG_IMAGE.
 *
 * Used by:
 *   - src/hooks/useSEO.js (runtime SPA SEO)
 *   - scripts/prerender-blog-posts-enhanced.js (build-time prerender)
 *
 * Both call sites must produce identical URLs (AC-4.4).
 */
export function getOgImageForPost(post) {
  if (post && post.image) return post.image;
  const tags = Array.isArray(post?.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];
  for (const rule of RULES) {
    const hit = rule.matchTags.some(needle =>
      tags.some(tag => tag.includes(needle.toLowerCase()))
    );
    if (hit) return rule.image;
  }
  return DEFAULT_OG_IMAGE;
}

export { DEFAULT_OG_IMAGE };
```

### Consumer changes

**`src/hooks/useSEO.js:299-300`** — replace existing 2-line fallback:

```js
// before
const extractedImage = image || extractImageFromMarkdown(content);
const finalImage = extractedImage ? `${baseUrl}${extractedImage}` : `${baseUrl}/blog-default.webp`;

// after
import { getOgImageForPost } from '../lib/og-image.js';  // top of file
// ...
const extractedImage = image || extractImageFromMarkdown(content);
const ogPath = extractedImage || getOgImageForPost({ tags });
const finalImage = `${baseUrl}${ogPath}`;
```

**`scripts/prerender-blog-posts-enhanced.js`** — three call sites:

Top of file (after line 17):
```js
import { getOgImageForPost } from '../src/lib/og-image.js';
```

Lines 100-103 (`og:image` fallback):
```js
// before
if (ogImage && post.image) {
  ogImage.setAttribute('content', `https://www.dhmguide.com${escapeHtml(post.image)}`);
}
// after
if (ogImage) {
  ogImage.setAttribute('content', `https://www.dhmguide.com${escapeHtml(getOgImageForPost(post))}`);
}
```

Lines 117-119 (`twitter:image` — same pattern, mirror the og:image fix):
```js
if (twitterImage) {
  twitterImage.setAttribute('content', `https://www.dhmguide.com${escapeHtml(getOgImageForPost(post))}`);
}
```

Line 154 (Article schema):
```js
"image": `https://www.dhmguide.com${escapeHtml(getOgImageForPost(post))}`
```

Line 262 (HowTo schema, conditional):
```js
image: `https://www.dhmguide.com${escapeHtml(getOgImageForPost(post))}`,
```
(Always set, since helper guarantees a non-empty string.)

**`src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json`** — broken-reference outlier:
```json
"image": null
```
(Was: `"/images/flyby-vs-fuller-health-hero.jpg"`, file doesn't exist.)

### Verification

```bash
npm run build
# AC-4.4: same og:image URL from both prerender HTML and runtime SEO for null-image post
# Pick a hangover-tagged post with no hero image (e.g., one with image: null and tags including "hangover-prevention"):
grep -oE 'property="og:image" content="[^"]+"' dist/never-hungover/<some-null-image-hangover-post>/index.html
# Expected: https://www.dhmguide.com/dhm-hangover-prevention.webp

# Pick a non-hangover null-image post:
grep -oE 'property="og:image" content="[^"]+"' dist/never-hungover/<some-null-image-non-hangover-post>/index.html
# Expected: https://www.dhmguide.com/og-image.jpg

# AC-4.7: every fallback path resolves to an existing /public/ file
ls public/og-image.jpg public/dhm-hangover-prevention.webp
```

**Rollback**: `git revert` (single commit). The helper is small enough that reverting also reverts the consumers cleanly. **Caveat**: if Item #4 ships AFTER #1/#2/#3/#5 (recommended), the revert is clean. If it ships first and a consumer change diverges later, plain revert may conflict — but ALL items are independent, so order is preserved by branch policy.

---

## Item #5 — Remove unused dependencies

**Files touched**: `package.json` + 5 wrapper deletions.

**Approach** (single command + 5 deletions):

```bash
npm uninstall recharts embla-carousel-react input-otp cmdk vaul
rm src/components/ui/chart.jsx \
   src/components/ui/carousel.jsx \
   src/components/ui/input-otp.jsx \
   src/components/ui/command.jsx \
   src/components/ui/drawer.jsx
```

**Verification**:
```bash
npm run build  # must exit 0; Vite/Rollup raise errors on missing imports
grep -rE "from ['\"](recharts|embla-carousel-react|input-otp|cmdk|vaul)" src/ scripts/ public/  # must return zero
grep -E "\"(recharts|embla-carousel-react|input-otp|cmdk|vaul)\"" package.json  # must return zero
```

**Rollback**: `git revert` restores both `package.json` and wrapper files. Run `npm install` after revert.

---

## File Structure

| File | Action | Item | Purpose |
|------|--------|------|---------|
| `index.html` | Modify | #1, #3 | Add `id="prerender-main-stub"`; add `viewport-fit=cover` |
| `scripts/prerender-main-pages.js` | Modify | #1 | Add `bodyStub` per route + innerHTML mutation |
| `src/lib/posthog.js` | Modify | #2 | Add bot/preview guard in `initPostHog()` |
| `src/pages/DosageCalculator.jsx` | Modify | #3 | Add `inputMode="decimal"` to duration input |
| `src/components/StickyMobileCTA.jsx` | Modify | #3 | Add `pb-[env(safe-area-inset-bottom)]` className |
| `src/lib/og-image.js` | **Create** | #4 | Shared helper — `getOgImageForPost(post)` + tag rules |
| `src/hooks/useSEO.js` | Modify | #4 | Import helper; replace `/blog-default.webp` fallback |
| `scripts/prerender-blog-posts-enhanced.js` | Modify | #4 | Import helper; use at 4 call sites (og:image, twitter:image, Article schema, HowTo schema) |
| `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json` | Modify | #4 | `image: null` (broken reference cleanup) |
| `package.json` | Modify | #5 | Remove 5 unused deps |
| `src/components/ui/{chart,carousel,input-otp,command,drawer}.jsx` | Delete | #5 | Remove wrapper files |

---

## Technical Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| OG fallback default | `/og-image.jpg`, `/og-image.webp`, `/blog-default.webp` | `/og-image.jpg` | Already the index.html social card; `/blog-default.webp` doesn't exist (latent 404 bug); `.jpg` over `.webp` for max social-crawler compatibility |
| Helper location | `src/lib/`, `src/utils/`, `scripts/lib/` | `src/lib/` | Matches `posthog.js` precedent; `scripts/` already imports from `../src/` |
| Tag matching | regex, NLP, exact-match, substring | case-insensitive substring | Karpathy: simplest that works. Posts use freeform tag strings; substring tolerates singular/plural/hyphenation |
| PostHog gating | per-call gate, opt_out_capturing, init-skip | init-skip only | Research confirmed secondary sites already gate on `__loaded`; init-skip is sufficient and minimal |
| Stub div id | new wrapper div, attribute on existing | `id` on existing div | Preserves PR #343 FOUC fix (off-screen styling); zero structural change |
| Bot regex completeness | curated short list, `isbot` library, fingerprint | curated regex | 13 tokens cover ~99% of real-world bot UAs; perfect detection not a goal (per requirements edge cases) |
| Rules table format | object map, array, switch | array of rules | Order matters (first match wins); array makes order explicit and auditable |

---

## Error Handling

| Scenario | Strategy | Impact |
|----------|----------|--------|
| `bodyStub` missing for a route | Skip mutation (guard: `if (page.bodyStub)`) | Falls back to existing index.html stub copy — no regression vs today |
| `getOgImageForPost(null)` | Return `DEFAULT_OG_IMAGE` (`post?.tags` optional chain) | Crawler sees site default; never throws |
| Bot UA we didn't list slips through | Captures one extra non-human session | Dashboards reach ~95% clean (acceptable per requirements) |
| Vercel rebrands preview domain | `vercel.app` substring check stops working | Documented edge case; manual fix when it happens |
| Wrapper file deleted but hidden import exists | `npm run build` fails with module resolution error | Fast revert (1 dep at a time if needed) |
| `flyby-vs-fuller-health` post still references missing image after fix | `getOgImageForPost` falls through tags → default | No new 404 introduced |

---

## Edge Cases

- **Post with empty `tags` array** — `Array.isArray(...) ? .map(...) : []` returns `[]`; rules don't match; falls through to default. OK.
- **Post with `tags: null`** — same path via optional chaining. OK.
- **Tag with mixed case (`"Hangover-Prevention"`)** — lowercased before matching. OK.
- **New main page added later without `bodyStub`** — guard skips mutation; div retains generic copy. No regression.
- **PostHog called before `window` exists (SSR)** — existing line-20 `typeof window === 'undefined'` guard runs first. New guards reference `window.location` only after that check, so safe.

---

## Test Strategy

**No new test infrastructure** (per NFR-3). Verification is build-output inspection:

### Build smoke tests (run after each PR via `npm run build`)
- Item #1: 7 distinct `<h1>` strings in 7 prerendered HTMLs
- Item #2: bot regex tokens present in shipped JS bundle
- Item #3: `inputmode="decimal"`, `viewport-fit=cover`, safe-area class all present in `dist/`
- Item #4: AC-4.4 — same `og:image` URL between prerender HTML and what runtime would emit (script-level: import helper in a one-off node REPL with a fixture post; assert URL equals what `dist/never-hungover/<slug>/index.html` shows)
- Item #5: build exits 0; zero matches for 5 dep names in `src/`/`scripts/`/`package.json`

### Manual visual checks
- Item #3 only — iPhone preview deployment for input keyboard + CTA inset
- Items #1, #2, #4, #5 are all build-artifact-verifiable; no visual review needed

---

## Existing Patterns to Follow

- **Helper module shape**: mirrors `src/utils/structuredDataHelpers.js` — pure function, named export, JSDoc with consumer list (so future devs know which sites to update together).
- **Prerender script ESM imports from `src/`**: precedent set at `scripts/prerender-blog-posts-enhanced.js:15-17`. No bundler config needed.
- **DOM mutation pattern**: `document.getElementById(...).innerHTML = ...` matches existing line 327 pattern in `prerender-blog-posts-enhanced.js`.
- **PostHog guards**: same shape as existing DEV check (line 23-26) — early-return with `console.log`.
- **Tailwind arbitrary values**: `pb-[env(...)]` works in v4 by default; no `@theme` token needed (regression safety per Pattern #15).

---

## PR Strategy

**5 separate PRs, mergeable in any order.**

| Order suggestion | PR | Item | Blast radius |
|------------------|-----|------|--------------|
| 1 (any) | `cleanup/i344-deps` | #5 | 5 deletions, 5 deps |
| 1 (any) | `cleanup/i344-mobile-ux` | #3 | 3 trivial attributes |
| 1 (any) | `cleanup/i344-posthog-gate` | #2 | 8 lines in one file |
| 1 (any) | `cleanup/i344-prerender-stubs` | #1 | 2 files, 7 stub strings |
| **Last** | `cleanup/i344-og-fallback` | #4 | 4 files + 1 new file + 1 JSON cleanup |

Item #4 last because it has highest blast radius (touches both build pipeline AND runtime SEO; affects 62 posts). Conflicts unlikely since it doesn't touch any other item's files, but defensive ordering reduces revert complexity if a problem surfaces.

All items independent — coordinator can ship any subset. No item depends on another.

---

## Risk Register

| Item | Risk | Mitigation |
|------|------|-----------|
| #1 | Twitter/Facebook crawler sees stub but cached old copy | Crawlers re-fetch on next share; soft propagation acceptable |
| #1 | Adding `id` to FOUC stub regresses off-screen behavior | Inline style preserved verbatim — `id` is non-styling attribute |
| #2 | Real user with bot-like UA (`PrerenderBot` Chrome extension) excluded from analytics | Acceptable; perfect detection not a requirement |
| #2 | PostHog dashboards show event-count drop post-deploy | Document in commit message; expected behavior (cleaner data) |
| #3 | iOS Safari ignores `inputmode` when `type=number` | Both attrs present; iOS uses `type=number` anyway, and `inputmode="decimal"` improves Android Chrome — net win |
| #3 | `viewport-fit=cover` causes content under safe area on landing page | None — body padding/margins respect safe area via CSS env() naturally; only sticky CTA explicitly fixed |
| #4 | Cross-site URL drift (helper diverges between sites) | Unified helper IS the mitigation; AC-4.4 enforces it; build verification grep proves it |
| #4 | New post with malformed `tags` (object instead of array) | `Array.isArray()` guard returns `[]`; falls through to default; no throw |
| #4 | Helper imported by Node fails on ESM resolution | `package.json` `"type": "module"` confirmed; precedent in same script imports from `../src/` already |
| #5 | Hidden dynamic import of removed dep | `npm run build` fails fast with resolution error |

---

## Build Artifact Verification

After implementing all 5 items, single `npm run build` exercises full pipeline. Run these greps on `dist/`:

```bash
npm run build

# Item #1 — 7 differentiated stubs
echo "=== Item #1: prerender main stubs ==="
for r in "" reviews guide research about dhm-dosage-calculator compare; do
  path="dist/$r/index.html"
  [ -z "$r" ] && path="dist/index.html"
  h1=$(grep -oE '<h1>[^<]+' "$path" | head -1)
  echo "$r → $h1"
done | sort -u | wc -l   # must be ≥ 7 (one per route, all distinct)

# Item #2 — bot guards present in bundle
echo "=== Item #2: posthog guards ==="
grep -lE "googlebot|vercel\\.app" dist/assets/*.js | head -1   # must return at least one filename

# Item #3 — mobile attrs in dist
echo "=== Item #3: mobile UX ==="
grep -o 'viewport-fit=cover' dist/index.html
grep -lE 'inputmode="decimal"' dist/assets/*.js | head -1
grep -lE 'pb-\[env\(safe-area-inset-bottom\)\]|safe-area-inset-bottom' dist/assets/*.css | head -1

# Item #4 — unified og:image (AC-4.4 load-bearing test)
echo "=== Item #4: og:image consistency ==="
# Count posts using each fallback. Sum should match # of posts with image:null in JSON.
grep -lE 'og:image" content="https://www\\.dhmguide\\.com/dhm-hangover-prevention\\.webp' dist/never-hungover/*/index.html | wc -l
grep -lE 'og:image" content="https://www\\.dhmguide\\.com/og-image\\.jpg' dist/never-hungover/*/index.html | wc -l
# No reference to defunct /blog-default.webp anywhere:
grep -rE 'blog-default\\.webp' dist/ src/ scripts/ && echo "FAIL: blog-default still referenced" || echo "PASS"

# Item #5 — bundle no longer includes removed deps
echo "=== Item #5: dep removal ==="
grep -rE "recharts|embla-carousel-react|input-otp|cmdk|vaul" dist/assets/*.js && echo "FAIL: dead dep in bundle" || echo "PASS"
```

A clean run shows: 7 distinct H1s, both bot regex tokens present, all 3 mobile patterns present, hangover-tagged posts pointing at `/dhm-hangover-prevention.webp` and others at `/og-image.jpg`, zero references to `blog-default.webp`, zero references to the 5 removed deps.

---

## Implementation Steps

1. Create branch `cleanup/i344-deps`; `npm uninstall recharts embla-carousel-react input-otp cmdk vaul`; delete 5 wrapper files; verify `npm run build` exits 0; PR #5.
2. Create branch `cleanup/i344-mobile-ux`; add `inputMode="decimal"` to `DosageCalculator.jsx:519`; add `viewport-fit=cover` to `index.html:27`; add `pb-[env(safe-area-inset-bottom)]` to `StickyMobileCTA.jsx:72`; verify build; PR #3.
3. Create branch `cleanup/i344-posthog-gate`; add 8-line guard inside `initPostHog()` in `src/lib/posthog.js`; verify bot regex + hostname tokens in `dist/assets/*.js`; PR #2.
4. Create branch `cleanup/i344-prerender-stubs`; add `id="prerender-main-stub"` to `index.html:242`; add `bodyStub` field to all 7 routes in `scripts/prerender-main-pages.js`; add innerHTML mutation in route loop; verify 7 distinct H1s in `dist/<route>/index.html`; PR #1.
5. Create branch `cleanup/i344-og-fallback`; create `src/lib/og-image.js` with helper + RULES; update `src/hooks/useSEO.js:299-300` to import helper; update `scripts/prerender-blog-posts-enhanced.js` at 4 call sites (og:image, twitter:image, Article schema, HowTo schema); set `flyby-vs-fuller-health-complete-comparison.json` `image: null`; verify AC-4.4 (build artifact greps); PR #4.
6. Each PR independently verifiable; merge in any order; recommend Item #4 last for revert-cleanliness.
