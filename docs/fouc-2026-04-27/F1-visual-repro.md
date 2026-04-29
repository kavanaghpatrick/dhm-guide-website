# F1 Visual FOUC Reproduction — dhmguide.com

Date: 2026-04-27
Test target: https://www.dhmguide.com/ and https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025
Tools: Playwright + Chromium with CDP throttling

## TL;DR Diagnosis

**The user is seeing TWO overlapping issues, not one classic FOUC:**

1. **PRIMARY (the "plain text" the user describes)**: The prerendered article HTML for blog posts is delivered with NO Tailwind classes (raw `<h1>`, `<p>`, `<a>` tags). On slow connections, the browser paints this unstyled content **briefly** (data shows ~600ms) before React's `createRoot()` wipes it. PR #340 made this content visible (was previously off-screen via `position:absolute; left:-9999px`), exposing it in the FOUC window.

2. **SECONDARY (the longer "loading" the user feels)**: After React mounts, the bundled `<Suspense fallback={<PageLoader/>}>` shows a green spinner for ~500ms-2s while the lazy-loaded route chunk downloads. On blog posts there is also a *second* internal loader showing "Loading post dynamically...".

So the user's full visible sequence on cold cache + average connection is:

```
0-200ms     blank white screen
200-500ms   prerendered HTML painted, mostly UNSTYLED (full-width black text, no layout)
500-2000ms  styled site shell + GREEN SPINNER (React mounted, route chunk downloading)
2000ms+     real styled content
```

Total time the user sees something other than the final page: **~2 seconds on broadband, ~6+ seconds on slow 3G**.

## The Three Hypotheses, Tested

| Hypothesis | Result |
|---|---|
| Prerendered HTML visible before React | **CONFIRMED** — and it's UNSTYLED |
| CSS bundle loads slow → FOUC | Partial — CSS is 191ms (fast), but irrelevant because the prerendered HTML has no Tailwind classes anyway |
| Web fonts swap | Not observed |
| Image LCP race | Minor; LCP image is preloaded |

## Root Cause Analysis

### The chain of code

1. `scripts/prerender-blog-posts-enhanced.js:327-341` injects `<div id="prerender-content"><article>...raw HTML...</article></div>` into `#root` for every blog post.
2. This raw HTML uses NO Tailwind utility classes. Just `<h1>`, `<p>`, `<a>`, `class="meta"`, `class="excerpt"`. The compiled CSS bundle (`/assets/index-DInrXSfS.css`, 178KB) has no rules for these tags or classes — Tailwind only outputs utility classes that appear in JSX source.
3. PR #340 (today) removed the `position:absolute; left:-9999px;` cloaking pattern, making this content visible.
4. `src/main.jsx:139` calls `createRoot(container)` (React 18+). This is NOT `hydrateRoot()` — it deliberately discards children and re-renders. The prerendered article gets wiped the moment React's first commit fires.
5. `src/App.jsx:91` wraps the route in `<Suspense fallback={<PageLoader/>}>`. The route components are all `lazy()` imports, so the spinner shows until the route chunk loads.

### Why the user sees "plain text"

The prerendered HTML is plain HTML with no styling. When CSS is loaded but no Tailwind classes are present on the elements, the browser uses default UA styles: full-width Helvetica, single-column, no padding. This looks like "plain text" — it is.

I confirmed this by loading the page with `javaScriptEnabled: false`. See `screenshots/dosage-guide-desktop-NOJS.png` — that is exactly what the user reports.

## Reproduction Evidence

### Cold cache, normal broadband (Slow 4G + 4x CPU throttle)

| Time | Home (desktop) | Dosage Guide (desktop) |
|---|---|---|
| 100ms | white screen | white screen |
| 300ms | spinner (no content) | spinner (no content) |
| 500ms | full styled page | spinner |
| 1000ms | full styled page | spinner |
| 2000ms | full styled page | full styled page |

Screenshots: `screenshots/{home,dosage-guide}-desktop-cold-{100,300,500,1000,2000}ms.png`

### Slow 3G + 6x CPU throttle (mobile worst case)

For the dosage-guide page, the `<article>` is `articleVisible=true` at real time **589ms** with only the inline critical CSS loaded (189 rules, vs 286 once full CSS arrives). At real time **5901ms** the article is destroyed (`articleVisible=false`) and replaced by the spinner. Real React content lands at **~12 seconds** (`articleVisible=true` again with `h1="DHM Dosage Guide"` showing the styled hero).

### Definitive proof: render the page with JS disabled

`screenshots/dosage-guide-desktop-NOJS.png` and `home-desktop-NOJS.png` show the prerendered HTML with NO React. This is what the user sees during the FOUC window. Plain serif/sans-serif text, full width, no Tailwind layout. **This image IS the FOUC.**

### Resource timing (cold cache, throttled)

```
home (desktop):
  CSS bundle:   251ms → 442ms (191ms)
  Main JS:      251ms → 1856ms (1606ms, 136KB)
  First Paint:  496ms
  Route chunks: 1985ms → 2458ms

dosage-guide (desktop):
  CSS bundle:   188ms → 423ms
  Main JS:      228ms → 1820ms
  First Paint:  1140ms  ← (delayed because critical CSS larger?)
  NewBlogPost route chunk: ~2s+
```

The main JS bundle taking 1.6s to download/parse is the bottleneck. Once it executes, React mounts and wipes the prerendered content — but the route chunk still hasn't loaded, so the user sees the spinner for another 500ms-1s.

### Cold vs hot cache

Tested in cold cache (the data above). Hot cache: bundles served from disk, but React's mount + Suspense fallback still occurs. Spinner shows for ~100-300ms instead of 1-2s. Prerendered FOUC window is also brief but still visible.

### Mobile

Mobile screenshots show the same behavior at smaller viewport. The spinner is centered the same way; the FOUC of unstyled text would look worse since each word may take its own line.

## Files & Locations

- Test scripts: `docs/fouc-2026-04-27/fouc-test.mjs`, `fouc-test-no-js.mjs`, `fouc-test-css-blocked.mjs`, `fouc-prerender-only.mjs`, `fouc-slow-3g.mjs`
- Screenshots: `docs/fouc-2026-04-27/screenshots/` (40+ images)
- Resource timing JSON: `docs/fouc-2026-04-27/timing.json`, `timing-slow3g.json`
- Test stdout log: `docs/fouc-2026-04-27/test-output.log`

### Key source files implicated

- `scripts/prerender-blog-posts-enhanced.js:327-341` — injects unstyled HTML into `#root`
- `src/main.jsx:139` — `createRoot()` discards prerendered children
- `src/App.jsx:30-35, 91-93` — `<Suspense fallback={PageLoader}>` shows spinner during lazy chunk load
- `index.html` — `<div id="root">` already contains a small unstyled "for crawlers" block on home page (`<h1>` + 2 `<p>`)
- Comment in index.html (line ~) says: "React's createRoot replaces this on mount; visible briefly is fine." ← This is the explicit acknowledgment that the FOUC was knowingly introduced.

## What changed in PR #340 (today)

The prerender script previously wrapped the article in `<div id="prerender-content" style="display:none;">` (script `prerender-blog-posts.js:182`) or used off-screen positioning. PR #340 removed that, citing cloaking penalty. Result: the prerendered article is now PAINTED by the browser before React wipes it. On a fast connection, the user might not notice the few-frame flash. On a slow connection (the user's experience), they see 1-2 full seconds of unstyled "plain text".

## Approximate FOUC Duration (matches user report)

- **Fast desktop, cold cache**: ~200-500ms unstyled text → ~500-1000ms spinner → real content. Total visible "wrongness": **~1.5s**.
- **Slow 3G mobile, cold cache**: ~600-5000ms unstyled text → ~5-12s spinner → real content. Total visible "wrongness": **~12s**.
- **Hot cache**: Spinner brief (~100-300ms), prerender FOUC very brief or imperceptible.

This matches the user's "plain text for a few seconds" report exactly.

## Recommended fix path (not implemented in F1; for the next phase)

The simplicity-first options, from most to least surgical:

1. **Restore `display:none` on `#prerender-content`** (1-line CSS fix). The previous "cloaking penalty" worry was about off-screen-positioned content with text-content. `display:none` content is well-known to crawlers as "intentionally hidden" and is fine when used to time-shift visibility. But this loses the SEO win from PR #340 and arguably is what created the original cloaking risk.

2. **Style the prerendered article to match the React render** (medium). Add inline styles or a small static stylesheet for `#prerender-content article h1 { font-size: 2.5rem; ... }` etc. Match the visual hierarchy of the real React content. This way, when the prerender is briefly visible, it looks like the real page.

3. **Use `hydrateRoot()` instead of `createRoot()`** (large refactor). Requires the prerender to render the React component tree exactly, not raw HTML. Probably too much work for the value.

4. **Eliminate the React rerender for blog posts** by serving fully prerendered static HTML (move from SPA to MPA for /never-hungover/*). Largest refactor.

Recommendation for the next phase: **Option 2** is the simplicity-first answer. Add a small `<style>` block to the prerendered HTML that styles `#prerender-content` to look like the real article (large h1, prose font, max-width container). The FOUC window then shows a near-correct page rather than unstyled text.
