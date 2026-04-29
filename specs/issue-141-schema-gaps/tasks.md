# Tasks: Issue #141 Schema Gaps

## Status: in progress

- [x] T1: Spec scaffold (research/requirements/design/tasks)
- [x] T2: Extract `topProducts` to `src/data/topProducts.json`
- [x] T3: Update `Reviews.jsx` to import from JSON
- [x] T4: Add `generateItemListSchema` helper to `structuredDataHelpers.js`
- [x] T5: Add `faqSchema` field to `/guide` entry in prerender-main-pages.js
- [x] T6: Add `faqSchema` field to `/dhm-dosage-calculator` entry in prerender-main-pages.js
- [x] T7: Add `itemListSchema` field to `/reviews` entry, built from topProducts.json
- [x] T8: Add `itemListSchema` injection block in prerender loop
- [x] T9: Run `npm run build` and verify schemas emit correctly
- [x] T10: Verify text-exact match between schema and visible JSX
- [x] T11: Commit feat + chore commits with Co-Authored-By trailer
