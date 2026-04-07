# Design: Fix broken placement property (#257)

## Approach: Add data attributes to source elements

The `detectPlacement()` function already checks `link.dataset.placement` (line 44). The fix is adding `data-placement` to every affiliate `<a>` tag. Same for `data-product-name`.

## Component -> Placement mapping

| Component/Location | data-placement value | data-product-name source |
|---|---|---|
| Reviews.jsx Quick Pick CTA | `hero` | `topProducts[0].name` |
| Reviews.jsx Hero Card CTA | `hero` | `topProducts[0].name` |
| Reviews.jsx Comparison Table links | `comparison_table` | `product.name` |
| Reviews.jsx Product Card links | `product_card` | `product.name` |
| Reviews.jsx Sticky Bar CTA | `sticky_bar` | `topProducts[0].name` |
| Home.jsx Product Card CTA | `home_product_card` | `product.name` |
| Compare.jsx Table CTA | `compare_table` | `product.name` |
| ComparisonWidget.jsx Buy Now | `comparison_widget` | `selectedProducts[0].brand` |
| MobileComparisonWidget.jsx Buy Now | `comparison_widget` | `selectedProducts[0].brand` |

## Change to detectPlacement default

Change line 47 from `return 'content'` to `return 'unknown_placement'` so missing data-placement is detectable.

## No structural changes

- No new components
- No new hooks
- No schema changes
- Just adding HTML data attributes to existing `<a>` elements
