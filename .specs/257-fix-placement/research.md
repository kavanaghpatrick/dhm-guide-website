# Research: Fix broken placement property in affiliate_link_click events (#257)

## Root Cause

The `detectPlacement()` function in `src/hooks/useAffiliateTracking.js` (lines 28-48) uses CSS class-based DOM detection to determine placement. It looks for classes like `.hero`, `.comparison`, `.product-card`, `.cta`. **None of these classes exist on the actual affiliate link elements.** The function falls through every check and returns `'content'` (line 47).

### Why detection fails for each placement:

1. **Hero/Quick Pick CTA** (Reviews.jsx ~line 507-519): The `<a>` is inside a `<section>` with no `.hero` class. `detectPlacement` checks `link.closest('.hero, .hero-section, [class*="hero"]')` -- no match.

2. **Comparison Table** (Reviews.jsx ~line 662-732): Links are in `<table>` inside a `<section>`. `detectPlacement` checks `link.closest('.comparison, .compare, [class*="comparison"]')` -- no match. The table uses standard HTML table elements, not comparison-classed divs.

3. **Product Review Cards** (Reviews.jsx ~line 771-904): Links are inside `<Card>` components (shadcn/ui). `detectPlacement` checks `link.closest('.product-card, .review-card, [class*="product"]')` -- partial match possible via `data-track="product"` on the motion.div wrapper, but `detectPlacement` doesn't check `data-track`, only class patterns.

4. **Sticky Recommendation Bar** (Reviews.jsx ~line 1086-1098): The `<a>` is in a `fixed` div with no relevant class names. Falls to `'content'`.

5. **Home Page Product Cards** (Home.jsx ~line 830): Inside shadcn Card components with `data-track="product"` but no `.product-card` class.

6. **Compare Page CTAs** (Compare.jsx ~line 796-806): Inside table cells. No matching classes.

7. **ComparisonWidget/MobileComparisonWidget**: Fixed/floating widgets with affiliate links. No matching classes.

### Why `data-placement` isn't used:

Line 44: `if (link.dataset.placement) return link.dataset.placement;`

This check exists but **no affiliate links in the codebase have `data-placement` attributes**. It's a dead code path.

### Why product_name is "unknown" (17.7%):

The `extractProductName()` function (lines 53-78) tries these in order:
1. `data-product-name` on the link -- **many links DO have this** (e.g., comparison table links)
2. `data-product` -- not used
3. `aria-label` -- not set on affiliate links
4. `title` -- not set
5. `textContent` -- filtered out if it contains "check price" (line 66)
6. Parent context `[data-product-name]` -- works for product cards

The "unknown" cases are links where:
- The link text IS "Check Price on Amazon" (filtered out at line 66)
- No `data-product-name` attribute on the link itself
- The parent card has `data-product-name` but `link.closest('[data-product-name]')` doesn't traverse far enough (e.g., the CTA button is deeply nested)

Specific cases producing "unknown":
- Quick pick CTA (no `data-product-name` on link)
- Sticky recommendation bar (no `data-product-name` on link)
- ComparisonWidget "Buy Now" button (no product name context)

## All Affiliate Link Locations

| Location | File | Line(s) | Current placement | Has data-product-name? |
|----------|------|---------|-------------------|----------------------|
| Quick Pick CTA | Reviews.jsx | 507-519 | content | No |
| Hero Card CTA | Reviews.jsx | 562-574 | content | No |
| Comparison Table (brand name) | Reviews.jsx | 662-671 | content | Yes |
| Comparison Table (price) | Reviews.jsx | 675-683 | content | Yes |
| Comparison Table (per-serving) | Reviews.jsx | 686-694 | content | Yes |
| Comparison Table (rating) | Reviews.jsx | 697-706 | content | Yes |
| Comparison Table (score) | Reviews.jsx | 710-718 | content | Yes |
| Comparison Table (action btn) | Reviews.jsx | 721-732 | content | Yes |
| Product Card (title) | Reviews.jsx | 771-778 | content | Yes |
| Product Card (rating) | Reviews.jsx | 783-793 | content | Yes |
| Product Card (price) | Reviews.jsx | 801-808 | content | Yes |
| Product Card (best for) | Reviews.jsx | 879-888 | content | Yes |
| Product Card (main CTA) | Reviews.jsx | 893-904 | content | Yes |
| Sticky Recommendation Bar | Reviews.jsx | 1086-1098 | content | No |
| Home Page product cards | Home.jsx | 830 | content | No (on parent div) |
| Compare Page table CTA | Compare.jsx | 796-806 | content | No (on parent div) |
| ComparisonWidget "Buy Now" | ComparisonWidget.jsx | 176-186 | content | No |
| MobileComparisonWidget "Buy Now" | MobileComparisonWidget.jsx | 179-189 | content | No |

## The Simple Fix

**Add `data-placement` and `data-product-name` attributes directly to affiliate `<a>` elements.** The detection code at line 44 already checks `link.dataset.placement` -- it just needs the data to be there.

This is the simplest approach: no changes to the detection logic, just add the data attributes the existing code already reads.
