# F3 — CSS Critical Path Analysis

**Date:** 2026-04-27
**Site:** https://www.dhmguide.com
**Bundle:** `/assets/index-DInrXSfS.css`

---

## 1. Live size measurements

### Single CSS bundle (render-blocking)

| Metric | Value |
|--------|-------|
| URL | `https://www.dhmguide.com/assets/index-DInrXSfS.css` |
| Raw size | **177,531 bytes (173.4 KB)** |
| Gzip transfer | **26,049 bytes (25.4 KB)** |
| Brotli transfer | **25,548 bytes (24.9 KB)** |
| `cache-control` | `public, max-age=0, must-revalidate` |
| Compression negotiated | `br` (Brotli, default) |
| Source | `src/App.css` → `@import "tailwindcss"` (Tailwind v4 via `@tailwindcss/vite`) |

### Reference HTML structure (homepage `<head>`)

```html
<link rel="modulepreload" crossorigin href="/assets/vendor-Ck8k_xBp.js">
<link rel="modulepreload" crossorigin href="/assets/ui-Djpt2aSh.js">
<link rel="modulepreload" crossorigin href="/assets/utils-D1Lh6doO.js">
<link rel="modulepreload" crossorigin href="/assets/icons-DVVApyE5.js">
<link rel="stylesheet" crossorigin href="/assets/index-DInrXSfS.css">  ← RENDER-BLOCKING
```

The CSS is loaded with a plain `<link rel="stylesheet">` — fully render-blocking. No `media="print"`/`onload` swap, no `rel=preload` + `onload` pattern, no `disabled` lazy-stylesheet trick. All four other pages tested (`/`, `/reviews`, `/guide`, `/never-hungover/...`) ship the **same single 173 KB bundle**.

---

## 2. `public/critical-lcp.css` — what's actually in it (and is it used?)

**File:** `/Users/patrickkavanagh/dhm-guide-website/public/critical-lcp.css`
**Size:** 533 bytes / 28 lines / last modified 2025-06-28
**Status: ORPHANED / UNUSED**

Full contents:

```css
/* Critical CSS for LCP image optimization */
img[src*="before-after-dhm"] {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1536 / 1024;
  background-color: #f3f4f6;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.w-full { width: 100%; }
.h-auto { height: auto; }
.rounded-2xl { border-radius: 1rem; }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
```

### Verification of orphan status

```
$ grep -rn "critical-lcp" src/ scripts/ index.html public/ --exclude-dir=node_modules
(no results — zero references anywhere in source, build scripts, or HTML)
```

The file lives in `public/` so Vite copies it verbatim into `dist/critical-lcp.css`, but **nothing links to or inlines it**. It is dead code (per CLAUDE.md Pattern #10).

### What IS inlined in production HTML

`index.html` lines 49-68 contain a hand-written inline `<style>` that **duplicates** the same rules (verified via `awk '/<style>/,/<\/style>/' /tmp/dhm_home.html`). This inlined block ships in every page's HTML response. So the public file is a leftover from when someone planned to `<link>` it but switched to inlining instead.

**Recommendation:** delete `public/critical-lcp.css` (pure deletion, zero risk).

---

## 3. Empirical inline-CSS impact

### What's inlined today (~700 bytes)

Only the LCP-image hint (5 selectors total). Production HTML headers verified across `/`, `/reviews`, `/guide`, and a real blog post — all four contain the same `<style>` block.

### What's NOT inlined (and thus blocks first paint)

Everything that styles the visible above-the-fold area arrives via the 173 KB CSS bundle, including:

- `body`/`html` base resets and color variables
- Header/nav layout (`flex`, `items-center`, `bg-white`, container widths)
- Hero section typography (`text-4xl`, `font-bold`, gradient text)
- Primary CTA button styling (orange gradient, padding, rounded)
- Tailwind preflight (the part that makes the noscript-rendered `<h1>`/`<p>` not look like a 1990s page)

The `<div id="root">` server-rendered fallback in `index.html` lines 240-244 is *unstyled* until the bundle arrives — this is a measurable contributor to FOUC.

### Selector audit on bundle

```
@font-face count:        0
woff/woff2 references:   0
font-display rules:      0
font-family declarations: 8 (all system-font stacks — see §4)
```

### Proposed inline addition (~1.5–2 KB extra in HTML, would unblock first paint of header + hero)

```html
<style>
  /* Existing LCP block stays */
  /* + add: */
  *,*::before,*::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; line-height: 1.5; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system,
         BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;
         background: #fff; }
  h1 { font-size: 2.25rem; line-height: 1.1; font-weight: 700;
       font-family: Georgia, 'Times New Roman', serif; margin: 0 0 1rem; }
  /* Header skeleton */
  header { position: sticky; top: 0; z-index: 50; background: #fff;
           border-bottom: 1px solid #e5e7eb; }
  /* Hero CTA fallback (orange gradient is the new conversion-tested colour) */
  .btn-cta { display: inline-block; padding: .75rem 1.5rem;
             background: linear-gradient(to right, #f97316, #ea580c);
             color: #fff; font-weight: 600; border-radius: .5rem; }
</style>
```

This is a manual approach. For an automated approach, `beasties` (the maintained fork of Google's `critters`, now under `danielroe/beasties`) is the canonical Vite-compatible inliner — it integrates as a Rollup post-build hook and rewrites the emitted HTML.

---

## 4. Font loading audit

**Result: NO web fonts are loaded. The site uses 100% system fonts.**

Evidence:

| Check | Result |
|-------|--------|
| `@font-face` rules in source CSS | 0 |
| `@font-face` rules in production CSS bundle | 0 |
| `.woff`/`.woff2` references in bundle | 0 |
| `fonts.googleapis.com` `<link>` | None (only `dns-prefetch` line 32 — useless without an actual font request) |
| Font preload tags | None |

All `font-family` declarations resolve to OS-installed fonts:

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
font-family: Georgia, 'Times New Roman', serif
font-family: Monaco, Menlo, 'Ubuntu Mono', monospace
font-family: var(--font-sans)   ← Tailwind default = system stack
```

### Implications

- **No FOIT/FOUT from fonts.** Whatever flash users perceive is **not** font-related.
- The `<link rel="dns-prefetch" href="//fonts.googleapis.com">` on line 32 is a **leftover** that does nothing useful (no Google Fonts request follows). Recommend deleting it.
- `font-display: swap` discussion is moot here — there are no `@font-face` rules to apply it to.

---

## 5. Render-blocking resource inventory

```
$ grep -oE '<link [^>]*rel="(stylesheet|preload|modulepreload)"[^>]*>' /tmp/dhm_home.html
<link rel="preload" as="image" href="/images/before-after-dhm-500w.webp"  media="(max-width: 640px)" fetchpriority="high">
<link rel="preload" as="image" href="/images/before-after-dhm-1024w.webp" media="(min-width: 641px)" fetchpriority="high">
<link rel="modulepreload" crossorigin href="/assets/vendor-Ck8k_xBp.js">
<link rel="modulepreload" crossorigin href="/assets/ui-Djpt2aSh.js">
<link rel="modulepreload" crossorigin href="/assets/utils-D1Lh6doO.js">
<link rel="modulepreload" crossorigin href="/assets/icons-DVVApyE5.js">
<link rel="stylesheet" crossorigin href="/assets/index-DInrXSfS.css">
```

### Render-blocking critical path

| Resource | Render-blocking? | Notes |
|----------|------------------|-------|
| `index-DInrXSfS.css` (173 KB / 25 KB br) | **YES** | The single biggest blocker |
| `<script type="module" src="/src/main.jsx">` | No (modules are deferred by spec) | But execution waits for CSS in some flows |
| 4 modulepreloaded JS chunks | No (preload only) | `vendor`, `ui`, `utils`, `icons` |
| LCP image preload | No | Correct use of `fetchpriority="high"` |
| GTM/Clarity scripts | No | Correctly deferred via `addEventListener('load', ...)` |

Verdict: **the CSS bundle is the only render-blocker on the page.** That makes it the highest-leverage optimisation target.

---

## 6. Recommendations (ranked by ROI)

### Short-term (≤1 hour) — biggest win

**Inline a real critical-CSS payload (~1.5 KB) into `index.html`** covering: preflight reset, body font, header sticky bar, h1 typography, primary CTA gradient. Then mark the main bundle non-blocking using the standard pattern:

```html
<link rel="preload" href="/assets/index-DInrXSfS.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/index-DInrXSfS.css"></noscript>
```

Caveat: the build hash changes each deploy. Either (a) leave the bundle as `<link rel="stylesheet">` and accept that the inlined critical block at least paints the header + hero text instantly while the bundle finishes downloading, or (b) inject the preload pattern post-build via a small Rollup hook that knows the hashed filename.

Expected impact: 50–150 ms FCP improvement on cold-cache mobile (the entire CSS bundle currently sits on the critical path; with inline CSS painting first, the network wait stops blocking visible content).

### Mid-term (≤1 day)

1. **Delete `public/critical-lcp.css`** — pure deletion of orphaned 533-byte file (Pattern #10 in CLAUDE.md). Zero risk, removes confusion.
2. **Delete the `<link rel="dns-prefetch" href="//fonts.googleapis.com">` line** — there are no Google Fonts requests; this is a leftover hint.
3. **Adopt `beasties`** (maintained fork of `critters`) as a Vite plugin to auto-extract critical CSS per page during the existing prerender step (`scripts/prerender-blog-posts-enhanced.js` already mutates HTML — adding a critical-CSS pass there is natural). This automates short-term step 1 and keeps it in sync with code.
4. **`font-display: swap` is N/A** — no web fonts. Skip this row in any general audit checklist for this site.

### Long-term

The 173 KB raw bundle is already mostly Tailwind v4 utilities (which v4 prunes well). True bundle reduction requires:

- Auditing whether all of `App.css` + custom `index.css` (585 lines, mostly `.enhanced-typography` rules used only on blog posts) belongs in the global bundle vs being lazy-loaded with the blog-post route.
- Splitting blog-post-specific styles (`.enhanced-typography .quick-answer`, `.gradient-text-green`, etc.) into a separate route-level chunk.

But at 25 KB Brotli on the wire, the bundle SIZE is not the immediate problem — it's the render-blocking POSITION.

---

## 7. Source files referenced

- `/Users/patrickkavanagh/dhm-guide-website/index.html` (lines 32, 47-68, 240-244)
- `/Users/patrickkavanagh/dhm-guide-website/src/index.css` (585 lines, 5 system-font stacks, 0 web fonts)
- `/Users/patrickkavanagh/dhm-guide-website/src/App.css` (line 1: `@import "tailwindcss"`)
- `/Users/patrickkavanagh/dhm-guide-website/src/main.jsx` (line 3: `import './index.css'`)
- `/Users/patrickkavanagh/dhm-guide-website/public/critical-lcp.css` (orphaned, recommend delete)
- `/Users/patrickkavanagh/dhm-guide-website/vite.config.js` (Tailwind v4 plugin, terser, manualChunks for JS — no critical-CSS plugin)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js` (no CSS handling — opportunity for beasties integration)

## 8. Sources

- [Beasties — danielroe/beasties (maintained fork of Google's critters)](https://github.com/danielroe/beasties)
- [rollup-plugin-critical (nystudio107)](https://github.com/nystudio107/rollup-plugin-critical)
- [Vite + React + Vercel critical CSS LCP improvements (Medium)](https://medium.com/@fadingbeat/how-i-improved-my-websites-lcp-and-seo-with-critical-css-in-vite-react-vercel-257aede4f22c)
- [font-display CSS at-rule descriptor — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display)
- [Preload optional fonts — web.dev](https://web.dev/preload-optional-fonts/)
- [Tailwind CSS v4.0 release notes](https://tailwindcss.com/blog/tailwindcss-v4)
