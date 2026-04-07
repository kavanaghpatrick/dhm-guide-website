# Tasks: Make /reviews product cards and badges clickable (#258)

## Task 1: Add feature flag
- Add `useFeatureFlag('reviews-clickable-cards-v1', 'control')` to Reviews component
- Derive `isClickableCards` boolean

## Task 2: Make badge clickable in test variant
- Wrap Badge in `<a>` tag when `isClickableCards` is true
- Add data-placement="product_card_badge" and data-product-name
- Add aria-label for accessibility
- Add hover:opacity-80 visual feedback

## Task 3: Make trust signals clickable in test variant
- Change trust signal `<div>` to `<a>` tag when `isClickableCards` is true
- Add data-placement="product_card_trust" and data-product-name
- Add hover:text-green-700 visual feedback

## Task 4: Build verification
- Run `npm run build` to verify no errors

## Task 5: Commit
- Commit with message referencing #258
