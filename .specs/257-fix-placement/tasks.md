# Tasks: Fix broken placement property (#257)

## Task 1: Update detectPlacement default (useAffiliateTracking.js)
- Change default return from `'content'` to `'unknown_placement'`
- ~1 line change

## Task 2: Add data-placement and data-product-name to Reviews.jsx
- Quick Pick CTA (~line 507): add `data-placement="hero"` and `data-product-name={topProducts[0].name}`
- Hero Card CTA (~line 562): add `data-placement="hero"` and `data-product-name={topProducts[0].name}`
- All comparison table `<a>` tags: add `data-placement="comparison_table"` (data-product-name already present)
- All product card `<a>` tags: add `data-placement="product_card"` (data-product-name already present)
- Sticky bar CTA (~line 1086): add `data-placement="sticky_bar"` and `data-product-name={topProducts[0].name}`

## Task 3: Add data-placement and data-product-name to Home.jsx
- Product card CTA: add `data-placement="home_product_card"` and `data-product-name={product.name}`

## Task 4: Add data-placement and data-product-name to Compare.jsx
- Table CTA buttons: add `data-placement="compare_table"` and `data-product-name={product.name}`

## Task 5: Add data-placement and data-product-name to ComparisonWidget.jsx
- Buy Now link: add `data-placement="comparison_widget"` and `data-product-name={selectedProducts[0].brand}`

## Task 6: Add data-placement and data-product-name to MobileComparisonWidget.jsx
- Buy Now link: add `data-placement="comparison_widget"` and `data-product-name={selectedProducts[0].brand}`

## Task 7: Build verification
- Run `npm run build` to confirm no errors

## Task 8: Commit
- Commit with message referencing #257
