# Requirements — Issue #300

## Problem Statement

The post `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` is a **504 PV/60d traffic asset** ranking **#5 for the long-tail "20+ hangover supplements tested"** but is **invisible for the head term "best hangover prevention supplement"**. The title, meta, and schema all index toward the long-tail. The body has 3,014 words, only 6 inline PubMed citations (3 of which point to broken / unrelated papers), 5 FAQ entries, no top-of-body comparison table, no `dateModified`, and a hardcoded "Last Updated: January 2025" stale date string.

Expected uplift after rewrite: **+600-1,000 PV/mo** (head-term capture + striking-distance to top-3 for current ranking).

## User Stories

### US1 — Searcher landing on head term wants a definitive answer
**As a** user searching "best hangover prevention supplement"
**I want** the H1, meta, and first paragraph to directly answer my query
**So that** I get the answer I came for and trust this source.

**Acceptance criteria**:
- Title contains "Best Hangover Prevention Supplements"
- Title is ≤65 chars
- Title contains current year (2026)
- `quickAnswer` field is a definitive 1-2 sentence head-term answer (NOT a duplicate of `excerpt`/`metaDescription`)
- `quickAnswer` names DHM as the strongest-evidence ingredient and states the dose threshold (≥300mg)

### US2 — Skim-reader wants comparison at a glance
**As a** user who has decided to buy and just wants the top picks
**I want** a comparison table at the top of the article (above the first H2)
**So that** I can decide in 30 seconds without scrolling.

**Acceptance criteria**:
- Markdown table is the first content block after the hero paragraph (before any `## H2`)
- Table has columns: Product, DHM dose, Price, $/serving, Rating, Score
- Table has 7 rows pulled directly from `src/pages/Reviews.jsx` `topProducts[0..6]`
- Table values match Reviews.jsx EXACTLY (no fabrication)
- Each product name links to its affiliate URL or to /reviews (so the table is monetizable)

### US3 — AI/LLM wants schema-readable Q&A
**As an** AI engine indexing this page
**I want** ≥15 FAQ entries with structured Q&A
**So that** I can extract answers for AI Overviews and conversational search.

**Acceptance criteria**:
- `faq[]` array contains 15-17 entries
- All existing 5 entries preserved verbatim
- Each new entry is unique question + 30-100 word answer
- Built dist HTML emits `<script type="application/ld+json">` with `"@type":"FAQPage"` and `mainEntity` matching `faq[]` count
- All entries pass schema.org validation

### US4 — Researcher wants citations that go somewhere real
**As a** user/AI clicking PubMed citations
**I want** every citation to point to a paper that supports the claim
**So that** I trust the article and can verify the science.

**Acceptance criteria**:
- All 3 broken PMC IDs (PMC4082193, PMC8429066, PMC8259720) are removed from the body
- 6+ NEW inline PubMed citations added from the verified Tier 1/Tier 2 list in research.md
- Each new citation is a markdown inline link `[anchor phrase](https://pmc.ncbi.nlm.nih.gov/articles/PMC{ID}/)`
- Total inline PubMed link count in body ≥8 (existing 2 valid + 6 new)
- No PubMed link points to PMC4082193, PMC8429066, or PMC8259720

### US5 — Crawler wants fresh-content signals
**As a** Googlebot or AI crawler
**I want** to see explicit `dateModified` in the rendered HTML
**So that** I treat this as freshly updated 2026 content.

**Acceptance criteria**:
- Post JSON has `"dateModified": "2026-04-26"` field
- Hardcoded "**Last Updated:** January 2025 | **Reading Time:** 15 minutes" line is REMOVED from body
- Built dist HTML's Article JSON-LD contains `"dateModified":"2026-04-26"`
- The `date` field (publication date) is preserved unchanged at `2025-07-09`

### US6 — Topic-cluster reader wants to dive deeper
**As a** reader who finishes the post and wants to learn more
**I want** ≥12 internal links to related deep-dive content
**So that** I stay on site and convert.

**Acceptance criteria**:
- Body contains ≥12 internal links matching `/never-hungover/...`, `/guide`, `/reviews`, or `/compare`
- All link targets resolve to real existing posts in `src/newblog/data/posts/` or real pages in `src/pages/`
- Includes at least 2 brand review links (e.g., dhm-depot, dhm1000)
- Includes at least 2 comparison links
- Includes 1 link each to: dhm-dosage-guide, dhm-science-explained, dhm-randomized-controlled-trials-2024, /reviews, /compare

## Quality Requirements

| Requirement | Threshold | Verification |
|---|---|---|
| Build green | `npm run build` exits 0 | CI |
| Total word count (body content) | 3,500-4,000 | wc on body field |
| FAQ count | 15-17 entries | count `faq[]` length |
| Inline PubMed citations | ≥8 (2 existing valid + 6 new) | grep `pmc.ncbi.nlm.nih.gov` |
| Internal links | ≥12 | regex on `/never-hungover/`, `/guide`, `/reviews`, `/compare` |
| Title char count | ≤65 | `.length` |
| FAQPage schema | renders in dist HTML | grep `"@type":"FAQPage"` in dist |
| `dateModified` schema | renders in dist HTML | grep `"dateModified":"2026-04-26"` in dist |
| Comparison table | exists before first H2 | manual / regex |
| Slug | UNCHANGED | grep slug field equals current value |

## Out of Scope

- **DO NOT change the slug** `hangover-supplements-complete-guide-what-actually-works-2025` (504 PV equity)
- DO NOT change the publication `date` (only add `dateModified`)
- DO NOT change Reviews.jsx product data (use it as read-only source-of-truth)
- DO NOT add prerender script changes (existing FAQ extraction is already sufficient — verified via existing pipeline)
- DO NOT redirect or split the post
- DO NOT modify any other post JSON files
- DO NOT modify any React components or hooks
- DO NOT add hero image (post has `image: null` and that's fine)
- DO NOT fabricate product ratings, prices, or scores — pull all values verbatim from `src/pages/Reviews.jsx`
- DO NOT use the 3 broken PMC IDs (PMC4082193, PMC8429066, PMC8259720)
