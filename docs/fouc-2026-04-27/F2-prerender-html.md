# F2 — Prerender HTML Inspection

> Note: F2 ran as Explore (read-only) so it couldn't write directly. Coordinator persisted output verbatim.

## Executive summary

**FOUC risk: YES — moderate.** The prerendered article is visible in the DOM *before* React hydrates, but styled with Tailwind classes (not raw-HTML FOUC). Critical bottleneck: the Tailwind CSS bundle is **render-blocking**.

## Head + stylesheet ordering (live blog post)

Order in `<head>`:
1. Favicon + manifest
2. Preconnect/DNS-prefetch (GTM, GA)
3. **Preload CSS**: `<link rel="preload" href="/src/index.css" as="style">` (non-blocking discovery hint)
4. **Inline critical CSS** (~80 bytes): hero img aspect-ratio + 4 utility classes
5. Meta tags (title, description, OG, Twitter, canonical)
6. **6 structured data blocks** (Article, Breadcrumb, FAQ, HowTo schema)
7. GTM + Clarity (deferred to `window.load`)
8. **Main JS entry**: `<script type="module" src="/assets/index-wj3yLnQH.js">`
9. Module preload (vendor/ui/utils/icons chunks)
10. **Stylesheet link (RENDER-BLOCKING)**: `<link rel="stylesheet" href="/assets/index-DInrXSfS.css">`

**Bug**: stylesheet link sits AFTER `<script type="module">`. Parsing chain: parse → preload CSS (good) → inline 80B critical (good) → enqueue module script → hit stylesheet link → BLOCK render until CSS arrives.

## Prerendered structure inside `<div id="root">`

```html
<div id="prerender-content">
  <article>
    <h1>...</h1>
    <div class="meta">
      <time datetime="...">...</time>
      <span>...</span>
      <span>... min read</span>
    </div>
    <p class="excerpt">...</p>
    <h2>Quick Answers...</h2>
    [Full HTML via micromark: 5+ sections, tables, lists]
  </article>
</div>
```

Styling: Tailwind classes only. NO `<style>` blocks embedded in the article. NO hero, comparison table, sidebar, related posts, newsletter form — those are React-only.

## Hydration strategy: `createRoot` (NOT `hydrateRoot`)

`src/main.jsx`: `ReactDOM.createRoot(...).render(<App />)`. React **replaces** the entire `#root` content on mount.

Sequence (cold cache, ~200ms latency):
1. **t=0**: Browser receives HTML, parses `<head>`
2. **t=30ms**: Hits stylesheet link → BLOCK
3. **t=230ms**: CSS arrives → first paint (article visible, styled)
4. **t=250ms**: `<script type="module">` executes; vendor chunk loads
5. **t=450ms**: React mounts, REPLACES `#prerender-content` with full interactive UI

**FOUC window: ~200ms (paint→React-mount).** User reports "a few seconds" — implies slower network, larger bundle, or slow CPU exposing more of the gap.

## What's missing from the prerender

Article is content-only. Missing initial view:
- Hero image with overlay
- Side nav / table of contents
- Related posts sidebar
- Product comparison table
- Newsletter signup form

Visual impact: article looks **bare** — no branding, no hero, just text. Users see a stark article, then full page swaps in.

## CSS bundle

Tailwind via `@tailwindcss/vite` plugin generates ONE monolithic CSS file. No critical-CSS inlining strategy beyond the 80-byte hero inline. Estimated 80-150KB uncompressed (20-40KB gzip). On 3G: 150-400ms load.

## Top 3 fixes (ROI ranked)

### 1. Move stylesheet link earlier; consider `<link rel="stylesheet">` as `media="print" onload="this.media='all'"` non-blocking pattern
**Saves 150-250ms.** Article paints immediately with Tailwind classes; CSS swaps in as it loads. Risk: 50-100ms unstyled flash before classes apply.

### 2. Switch to `hydrateRoot()`
**Saves 50-150ms** of effective FOUC. DOM is reused; React attaches event listeners instead of rebuilding. Risk: hydration mismatch warnings (the prerender's manual HTML must match React's first-render output exactly).

### 3. Split Tailwind by route; inline real critical CSS per page
**Saves 20-40% CSS size.** Vite supports CSS code splitting. Critical extraction (hero, header, article typography) inlined per-page. Effort: medium (build pipeline change).
