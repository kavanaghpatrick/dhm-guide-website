# Research: Issue #141 Schema Markup Gaps

## Issue summary
GitHub issue #141 enumerates ~10 schema gaps across 3 phases.

## Phase status
- **Phase 1**: Already shipped on `main`
  - BreadcrumbList: emitted everywhere by `scripts/prerender-main-pages.js` and the blog prerender via `generateBreadcrumbSchema` helper.
  - HowTo on `dosage-guide` blog post: backfilled via #251 (Tier-1 JSONs).
  - HowTo on `/guide` route: in flight on branch `cleanup/issue-154-guide-howto` (not yet merged at time of writing).
  - Organization on homepage: `index.html` static block.
- **Phase 2 / Phase 3 remainders this PR addresses**:
  - (a) FAQPage on `/guide` route — content visible in `Guide.jsx` lines 528-571, 6 Q&As.
  - (b) FAQPage on `/dhm-dosage-calculator` route — content visible in `DosageCalculatorEnhanced.jsx` lines 1864-1928, 6 Q&As.
  - (c) ItemList carousel on `/reviews` route — `Reviews.jsx` `topProducts` array, 10 ranked products.

## Skip decision: MedicalWebPage
Per ultrathink schema agent and the precedent set by issue #237 closure rationale:
- **Skip MedicalWebPage on `/research` and `/guide`**.
- Reason: Google manual-action risk. MedicalWebPage requires a credentialed medical reviewer named in `reviewedBy.Person`. We do not have a licensed clinician on the editorial team. Lying about medical reviewer credentials is a YMHL policy violation and triggers manual actions that are far worse for SEO than the marginal "trust signal" gain.
- This decision is final until/unless we hire a medical advisor.

## Source-of-truth strategy
- `/guide` and `/dhm-dosage-calculator` FAQs: schema text MUST match the visible Q&A text exactly (Google manual-action risk if mismatched). Extracted verbatim from the JSX.
- `/reviews` ItemList: must mirror visible product display order and content. Source from a single shared data file that both Reviews.jsx and the prerender script can import.

## Files identified
- `scripts/prerender-main-pages.js` — single point where main-page schemas get injected.
- `src/pages/Guide.jsx:528-571` — visible FAQ (6 Q&As, emoji prefix in title only).
- `src/pages/DosageCalculatorEnhanced.jsx:1864-1928` — visible FAQ (6 Q&As, plain text).
- `src/pages/Reviews.jsx:103-403` — `topProducts` array (10 products, ranking order matches visible display).
- `src/utils/structuredDataHelpers.js` — already has `generateFAQSchema`. Need to add `generateItemListSchema`.

## Schema text exact-match rule
For FAQPage schema, Google's policy:
- "Question and answer text in your FAQ schema must match the question and answer text on the page."
- Emoji prefixes in visible UI are decorative; they do not need to be in schema. The actual question text ("How fast does DHM work?") is the exact match.
- Decision: Strip emoji prefixes from schema name field; keep question text and answer text verbatim.

## Approach summary
1. Add `faqSchema` field to `/guide` page entry — verbatim 6 Q&As.
2. Add `faqSchema` field to `/dhm-dosage-calculator` page entry — verbatim 6 Q&As.
3. Add `itemListSchema` field to `/reviews` page entry — built from a shared topProducts JSON.
4. Extract `topProducts` to `src/data/topProducts.json` so both `Reviews.jsx` and the prerender script have a single source of truth.
5. The prerender loop already handles `faqSchema` field generically (line 175-181). Add a parallel block for `itemListSchema`.
