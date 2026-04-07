# Design: Make /reviews product cards and badges clickable (#258)

## Approach
Minimal changes: wrap two currently non-clickable elements in `<a>` tags behind a feature flag.

## Change 1: Badge becomes clickable

**Current (line 767-769):**
```jsx
<Badge className={getBadgeColor(product.badgeColor)}>
  {product.badge}
</Badge>
```

**Test variant:**
```jsx
<a
  href={product.affiliateLink}
  target="_blank"
  rel="nofollow sponsored noopener noreferrer"
  data-placement="product_card_badge"
  data-product-name={product.name}
  aria-label={`${product.badge} - ${product.name} on Amazon`}
  className="inline-flex"
>
  <Badge className={`${getBadgeColor(product.badgeColor)} hover:opacity-80 transition-opacity cursor-pointer`}>
    {product.badge}
  </Badge>
</a>
```

## Change 2: Trust signals near CTA become clickable

**Current (lines 931-940):**
```jsx
<div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
  <Star ... />
  <span>{product.rating} (...)</span>
  ...
</div>
```

**Test variant:**
```jsx
<a
  href={product.affiliateLink}
  target="_blank"
  rel="nofollow sponsored noopener noreferrer"
  data-placement="product_card_trust"
  data-product-name={product.name}
  className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2 hover:text-green-700 transition-colors"
>
  <Star ... />
  <span>{product.rating} (...)</span>
  ...
</a>
```

## Feature Flag Integration
```jsx
const clickableCardsVariant = useFeatureFlag('reviews-clickable-cards-v1', 'control')
const isClickableCards = clickableCardsVariant === 'test'
```

Conditional rendering uses `isClickableCards` ternary for each element.

## What we are NOT doing
- NOT making the entire card clickable (would create nested link issues with existing links)
- NOT adding click handlers or custom tracking code (useAffiliateTracking auto-detects)
- NOT changing the comparison table (already mostly linked)
- NOT changing the CTA button (already works)
