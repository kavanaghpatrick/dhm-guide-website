# R7: Mobile-First Comparison Table (Front-Loaded Above Fold)

**Status:** Implemented and verified.
**Branch:** `feat/mobile-comparison-above-fold-r7` (worktree at `/tmp/r7-mobile-comparison`)
**Date:** 2026-04-26

## Hypothesis
PostHog analysis showed:
- Mobile CR **3.57%** vs desktop **1.23%** (mobile converts **2.9x better**)
- Mobile users only **17%** reach 90% scroll depth (desktop: 38%)
- `comparison_table` placement drove `/compare` CTR from 1.5% to 8.3% (5.6x)
- Mobile users are bouncing on long content before reaching the table

**Bet:** Front-load the comparison table above-fold on mobile, leave desktop layout untouched.

## Layout change

### Approach: CSS `order-first md:order-none` on a flex-col page wrapper
- Single-source single-DOM solution (no component duplication)
- Root page `<div>` becomes `flex flex-col`
- Comparison-table `<section>` gets `order-first md:order-none`
- All other sections stay default (`order: 0`); on mobile the table jumps to top, on desktop natural DOM order is preserved

### Files modified

#### `src/pages/Reviews.jsx`
| Line | Change |
|-----:|--------|
| 451  | Root: added `flex flex-col` to `min-h-screen` wrapper |
| 634-637 | Comparison Table `<section>`: added `id="comparison-table"`, classes `order-first md:order-none ... min-h-[520px] md:min-h-0` |

The `id="comparison-table"` was missing previously — it is referenced by line 589 (`href="#comparison-table"`) in the hero-card variant, fixing a broken anchor.

#### `src/pages/Compare.jsx`
| Line | Change |
|-----:|--------|
| 437  | Root: added `flex flex-col` to `min-h-screen` wrapper |
| 532-534 | Comparison Table `<section>`: added classes `order-first md:order-none ... min-h-[600px] md:min-h-0` |

**No** changes to `MobileComparisonWidget.jsx`, `ComparisonWidget.jsx`, `useAffiliateTracking.js` (R1/R2/X2 territory). No new components. No state changes. No hidden duplicates.

## CLS mitigation

1. **Mobile reserved heights** via `min-h-[520px]` (Reviews) / `min-h-[600px]` (Compare).
   - Reset to `md:min-h-0` on tablet/desktop so layout is unchanged there.
   - Compare's table has a `selectedProductsData.length > 0` gate (filled by `useEffect`); if React waits to mount, the reserved height keeps the hero from jumping when the table appears at the top.
2. **No image moves** — only the existing inline `<table>` (Reviews) and existing comparison cards (Compare) are reordered. Images already present in those sections retain their original layouts.
3. **Single CSS reorder** — Tailwind `order-*` triggers no DOM remount and no animation; layout cost is one paint.

## Verification

### Build
```
npm run build  →  PASS
✅ Successfully prerendered 189 blog posts
✅ Generated 7 prerendered pages (incl. /reviews, /compare)
```
Both `order-first md:order-none py-8 px-4 bg-gray-50 min-h-[520px]` and `order-first md:order-none py-8 px-4 min-h-[600px]` strings present in production bundles (`Reviews-*.js`, `Compare-*.js`, `index-*.css`).

### Mobile (iPhone 14, 390x844, vite preview)
| Page | Hero H1 Y | Table top Y | Above-fold? |
|------|----------:|------------:|:-----------:|
| `/reviews` | 1414 | **81** | YES (within first 844px) |
| `/compare` | 3946 | **81** | YES |

### Desktop (1280x800, vite preview)
| Page | Hero H1 Y | Table top Y | Hero-first? |
|------|----------:|------------:|:-----------:|
| `/reviews` | 147 | 633 | YES (unchanged from main) |
| `/compare` | 160 | 1288 | YES (unchanged from main) |

### Affiliate tracking still fires (X2's `window.dataLayer` test)
Clicked first `data-placement="comparison_table"` link on `/reviews` (mobile). Captured payload:
```json
{
  "event": "affiliate_link_click",
  "affiliate_url": "https://amzn.to/3HSHjgu",
  "affiliate_product": "No Days Wasted DHM Detox",
  "affiliate_placement": "comparison_table",
  "page_path": "/reviews",
  "ratings_version": null
}
```
Handler executes end-to-end. **No regression to /reviews 75% CTR primary conversion path.**

### Console errors
11 pre-existing 404s on `canonical-fix.js`, `_vercel/speed-insights/script.js`, `ingest/static/*.js` — all are Vercel-prod-only resources missing in vite preview. **Zero new errors from this change.**

## Risk analysis

- **Conversion regression risk on `/reviews` (75% CTR):** LOW. The comparison table itself (the converting element) is moved to *more* prominent position. The hero/quick-pick CTA bar still loads on the same page; mobile users now see table → hero → quick-pick → reviews instead of hero → quick-pick → table → reviews. Quick-pick is still on the page, just below the table.
- **Layout shift on initial mount of `/compare`:** Possible one-time CLS when `useEffect` populates `selectedProducts` after mount. Mitigated by `min-h-[600px]` reservation on the wrapping section so the hero/selection don't shift even when the table content fills in late.
- **Desktop regression:** None observed — `md:order-none` resets order, `md:min-h-0` removes the height reservation.

## Files modified
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/Reviews.jsx` (lines 451, 634-637)
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/Compare.jsx` (lines 437, 532-534)

## Branch + commit
- Branch: `feat/mobile-comparison-above-fold`
- Worktree: `/tmp/r7-mobile-comparison`
- Commit: `4269916` — "feat: front-load comparison table above-fold on mobile (/reviews, /compare)"
