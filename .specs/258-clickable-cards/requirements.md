# Requirements: Make /reviews product cards and badges clickable (#258)

## Feature Flag
- Key: `reviews-clickable-cards-v1`
- Type: multivariate (control / test)
- Control: current /reviews (badges are plain text, card areas not linked)
- Test: badges and additional card areas become clickable affiliate links

## Goal Metrics
- Primary: increase `affiliate_link_click` events on /reviews
- Secondary: reduce dead clicks (rage_click_detected / element_clicked with no target)

## Requirements

### R1: Badge becomes clickable (test variant)
- The product badge (e.g., "Editor's Choice", "Best Value") wraps in an `<a>` tag
- Links to the same `product.affiliateLink`
- Uses `data-placement="product_card_badge"` for tracking
- Uses `data-product-name={product.name}` for product identification

### R2: Trust signals near CTA become clickable (test variant)
- The rating/review count trust signal text below CTA wraps in an `<a>` tag
- Links to `product.affiliateLink`
- Uses `data-placement="product_card_trust"` for tracking

### R3: Maintain existing CTA button
- The "Check Price on Amazon" button remains unchanged
- All existing clickable elements remain as-is

### R4: Proper affiliate link attributes
- All new `<a>` tags use: `target="_blank" rel="nofollow sponsored noopener noreferrer"`
- All new links include `data-product-name={product.name}`

### R5: Accessibility
- New links have clear visual affordances (hover underline/color change)
- No nested interactive elements (no `<a>` inside `<a>` or `<button>` inside `<a>`)
- Badge links get `aria-label` for screen readers

### R6: Tracking fires correctly
- Existing `useAffiliateTracking` hook auto-detects clicks on `<a>` tags with Amazon URLs
- New links include `data-placement` so detectPlacement() returns the correct value
- No additional tracking code needed beyond data attributes
