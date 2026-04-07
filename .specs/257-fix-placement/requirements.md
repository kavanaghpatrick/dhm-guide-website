# Requirements: Fix broken placement property (#257)

## Problem
100% of `affiliate_link_click` events report `placement=content`. Hero, comparison_table, sticky, footer values are NOT recorded. 17.7% have `product_name=unknown`.

## Requirements

### R1: Every affiliate link MUST have a `data-placement` attribute
Each affiliate `<a>` element must include `data-placement="<value>"` with one of these specific values:
- `hero` -- above-fold quick pick / hero card CTA
- `comparison_table` -- links within the comparison table
- `product_card` -- links within individual product review cards
- `sticky_bar` -- sticky recommendation bar CTA
- `home_product_card` -- product cards on the home page
- `compare_table` -- links on the /compare page
- `comparison_widget` -- floating comparison widget CTAs

### R2: Every affiliate link MUST have a `data-product-name` attribute
Each affiliate `<a>` element must include `data-product-name="<product name>"` so `extractProductName()` returns the correct value on the first check.

### R3: Remove fallback to "content"
Change the default return in `detectPlacement()` from `'content'` to `'unknown_placement'` so any new untagged links are immediately visible in analytics as a problem, not silently bucketed into "content".

### R4: No changes to PostHog event schema
The `trackAffiliateClick` function and PostHog event structure remain unchanged. Only the input data quality improves.
