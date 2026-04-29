# Requirements: Issue #141 Schema Gaps

## In scope
- R1: Emit FAQPage schema on prerendered `/guide/index.html` mirroring 6 visible Q&As.
- R2: Emit FAQPage schema on prerendered `/dhm-dosage-calculator/index.html` mirroring 6 visible Q&As.
- R3: Emit ItemList schema on prerendered `/reviews/index.html` mirroring the 10 ranked products.
- R4: Schema text MUST match visible page content exactly (manual-action safety).
- R5: ItemList ordering MUST match the visible product display order on `/reviews`.
- R6: Each ItemList Product item must include at minimum: name, url, image, aggregateRating { ratingValue, reviewCount }.

## Out of scope (explicit skip)
- MedicalWebPage schema on `/research` or `/guide` — manual-action risk without a credentialed medical reviewer. Tracked in research.md.
- HowTo schema on `/guide` — already in flight on `cleanup/issue-154-guide-howto`.
- Phase 1 items (BreadcrumbList, Organization, HowTo blog post) — already shipped.

## Acceptance criteria
- AC1: `npm run build` completes successfully.
- AC2: `dist/guide/index.html` contains `"@type":"FAQPage"` and `"@type":"BreadcrumbList"`.
- AC3: `dist/dhm-dosage-calculator/index.html` contains `"@type":"FAQPage"` and `"@type":"BreadcrumbList"`.
- AC4: `dist/reviews/index.html` contains `"@type":"ItemList"` and `"@type":"BreadcrumbList"`.
- AC5: FAQ schema text matches visible JSX content character-for-character (modulo emoji prefix stripping in question titles).
- AC6: ItemList includes 10 items in the same order as `topProducts` array.
