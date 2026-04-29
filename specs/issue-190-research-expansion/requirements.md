---
spec: issue-190-research-expansion
phase: requirements
created: 2026-04-28
mode: quick
---

# Requirements: issue-190-research-expansion

## Goal

Expand `Research.jsx` from 11 to 25 verified DHM clinical studies. Drive all UI counters from `studies.length`. Emit one `ScholarlyArticle` JSON-LD block per study via prerender. Add a "Copy APA" button per study using the Clipboard API. Page becomes a citable, structured-data-rich linkable asset for E-E-A-T and backlinks.

## User Stories

### US-1: Crawler-recognizable research corpus
**As a** search engine crawler
**I want** each study to emit a `ScholarlyArticle` JSON-LD block in prerendered HTML
**So that** the page is recognized as a structured research resource and individual studies become rich-result eligible.

**Acceptance Criteria:**
- AC-1.1: Built `dist/research/index.html` contains ≥25 occurrences of `"@type":"ScholarlyArticle"`.
- AC-1.2: Each block validates against schema.org `ScholarlyArticle` (Google Rich Results Test compatible).
- AC-1.3: Block includes `headline`, `author[]`, `datePublished`, `publisher`, `sameAs` (PubMed URL), `identifier` (PMID).

### US-2: Citable backlink target
**As an** academic / health blogger backlinking
**I want** a citable URL listing 25+ DHM studies with PMID and copy-on-click APA citation
**So that** I can link to one authoritative DHM research index instead of stitching PubMed searches.

**Acceptance Criteria:**
- AC-2.1: Page lists 25 distinct DHM studies, each with PMID and PubMed link.
- AC-2.2: Per study, a "Copy APA" button copies a canonical APA-formatted citation to clipboard.
- AC-2.3: Visual feedback ("Copied!") appears for ~2s after successful copy.

### US-3: Filter UX preserved
**As a** returning consumer reader
**I want** existing year and category filters to keep working as the corpus expands
**So that** I can still narrow studies the same way as today.

**Acceptance Criteria:**
- AC-3.1: Year filter (2020–2026, pre2020) returns correct subset for 25-study corpus.
- AC-3.2: Category filter (metabolism, liver, neuroprotection) returns correct subset.
- AC-3.3: Filter combinations (year + category) work without React errors or empty-state regressions.

### US-4: Counter-of-record consolidation
**As a** maintainer
**I want** UI counters driven from `studies.length` (or computed from the array)
**So that** adding study #26 doesn't require N file edits and the "11" hardcode bug doesn't recur.

**Acceptance Criteria:**
- AC-4.1: All 5 hardcoded "11" counters in `Research.jsx` removed.
- AC-4.2: Total-study counter derives from `studies.length`.
- AC-4.3: Per-category counters derive from `studies.filter(s => s.category === X).length`.

### US-5: Anti-fabrication guarantee
**As a** site owner
**I want** every PMID verified as a real PubMed paper
**So that** Google trust and E-E-A-T are not damaged by fabricated citations.

**Acceptance Criteria:**
- AC-5.1: Every PMID in the array returns HTTP 200 from `https://pubmed.ncbi.nlm.nih.gov/<pmid>/`.
- AC-5.2: Title in array matches title returned by PubMed (keyword match).
- AC-5.3: Verification log committed (or at minimum, verification command rerun-able from tasks.md).

## Functional Requirements

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| FR-1 | `Research.jsx` `studies` array contains ≥25 entries (was 11) | High | `grep -c "id:" src/pages/Research.jsx` ≥ 25 in studies block |
| FR-2 | Each study includes: `id`, `title`, `authors[]` (or string), `journal`, `year`, `pmid`, `methodology`, `findings`, `category`. Optional: `doi`, `volume`, `issue`, `pages`, `sampleSize`, `limitations` | High | Code review + manual spot-check |
| FR-3 | Every PMID verifies against PubMed (HTTP 200 + title-keyword match) | High | `curl -sI` loop on all 25 PMIDs |
| FR-4 | All 5 hardcoded "11" counters removed from `Research.jsx`; counts derive from `studies.length` or `.filter().length` | High | `grep -nE '\b11\b' src/pages/Research.jsx` returns 0 study-counter hits |
| FR-5 | Helper `generateScholarlyArticleSchema(study)` exists in `src/utils/structuredDataHelpers.js` and emits the JSON-LD shape from research.md | High | File exists; helper exported; matches existing helper-fn pattern |
| FR-6 | Built `dist/research/index.html` contains ≥25 `"@type":"ScholarlyArticle"` blocks | High | `grep -c '"@type":"ScholarlyArticle"' dist/research/index.html` ≥ 25 |
| FR-7 | Built `dist/research/index.html` contains the headline text of ≥5 sampled studies (sanity check) | High | `grep -F "<headline-text>" dist/research/index.html` for 5 random samples |
| FR-8 | Per-study "Copy APA" button uses `navigator.clipboard.writeText`; "Copied!" feedback ~2s on success | High | Manual test in browser |
| FR-9 | APA format: `<authors>. (<year>). <title>. <journal>[, <vol>(<issue>), <pages>]. https://pubmed.ncbi.nlm.nih.gov/<pmid>/` — bracketed parts omitted when fields missing | High | Spot-check 5 random Copy outputs |
| FR-10 | Existing year/category filters work with 25 studies (no UX regression) | High | Manual filter test |
| FR-11 | `npm run build` exits 0; no React key warnings; no schema validation errors | High | CI / local build |
| FR-12 | Schema emission uses the same path Research.jsx already uses (`useSEO` or prerender helper) — no new schema-injection mechanism | High | Code review |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Zero new npm dependencies | `package.json` diff | 0 added deps |
| NFR-2 | Match existing component style | Card patterns, Tailwind utility usage | Visual parity with current studies |
| NFR-3 | Schema validates as ScholarlyArticle | Google Rich Results Test on deployed `/research` | All 25 entities recognized |
| NFR-4 | Build remains green; no new warnings | `npm run build` stdout | 0 warnings (above current baseline) |
| NFR-5 | Page bloat acceptable | Extra HTML from 25 schema blocks | ≤ ~15 KB |

## Glossary

- **DHM**: Dihydromyricetin — flavonoid extracted from *Hovenia dulcis*; central ingredient on this site.
- **PMID**: PubMed ID — canonical numeric identifier for biomedical literature.
- **APA**: American Psychological Association citation style (7th ed.).
- **ScholarlyArticle**: schema.org type for academic publications; google-recognized rich-result entity.
- **JSON-LD**: JSON for Linking Data — preferred structured-data format for Google.
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness — Google quality signals.
- **Prerender**: Build-time HTML generation that bakes initial DOM (and schema) into static files for crawlers.

## Out of Scope

- BibTeX export
- RIS export
- Per-study detail pages
- New search/filter UI beyond existing year + category
- AuthorBio components (closed via #237)
- Medical reviewer attribution
- 26th+ studies (cap at 25 for v1; backlog if needed)
- `document.execCommand('copy')` clipboard fallback (modern browser support >97%)

## Dependencies

- PubMed (https://pubmed.ncbi.nlm.nih.gov/) reachable for PMID verification (build-time only).
- Existing Vite prerender pipeline (`scripts/prerender-main-pages.js`) emits page HTML with React-rendered JSON-LD into `dist/research/index.html`.
- Existing `src/utils/structuredDataHelpers.js` helper-function pattern.
- `Research.jsx` schema-injection path (likely `useSEO(generatePageSEO('research'))` or in-JSX `<script>` element rendered through prerender).

## Edge Cases

- **Browser without Clipboard API**: button visible, click silently fails (caught by try/catch). Acceptable for v1; modern browsers >99% support `navigator.clipboard`.
- **Study missing optional fields** (volume/issue/pages/doi): APA degrades gracefully — bracketed parts dropped; never emits empty `, ,` or trailing `()`. Falls back to PubMed URL when no DOI.
- **Long author lists** (>20 authors): APA standard says first 6 + "..." + last author. Acceptable simpler alternative: truncate to "et al." after first 3. Choice deferred to design phase.
- **Schema emit at prerender time**: helper must work in Node/build context, not just runtime browser (no `window` references).
- **Existing 11 studies have inconsistent field shape**: during expansion, normalize all 25 to same shape; backfill optional fields for the original 11 where data is available; APA degrades for the rest.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Fabricated PMID** | High | Mandatory `curl`-verify-each rule (FR-3) before commit; titles must keyword-match. |
| Counter decay (6th hardcoded "11" missed) | Medium | Exhaustive `grep` + visual scan before commit; FR-4 verification. |
| Schema bloat | Low | 25 × 500B ≈ 12 KB extra HTML; acceptable per NFR-5. |
| Existing 11 studies have inconsistent shape | Low | Normalize all 25; APA degrades gracefully when optional fields absent. |
| Schema injection path mismatch | Medium | Use existing path Research.jsx already employs (`useSEO` + prerender); no new mechanism (FR-12). |

## Success Criteria

- **Quantitative**: 25 studies live; ≥25 ScholarlyArticle blocks in prerendered HTML; 5 hardcoded "11" counters → 0; `npm run build` green; Google Rich Results Test recognizes ≥25 entities on deployed `/research`.
- **Qualitative**: Page reads as authoritative DHM research index; backlink-worthy; existing reader UX (filters, scroll, layout) unchanged.

## Unresolved Questions

- **Schema-injection mechanism**: confirm in design phase whether `Research.jsx` currently injects schema via `useSEO`, an inline `<script type="application/ld+json">`, or via `prerender-main-pages.js`. Use whatever path is already standard. Research.md observed only page-level `useSEO(generatePageSEO('research'))` — no per-study schema yet exists.
- **Author-list truncation rule**: APA-strict (first 6 + "..." + last) vs simplified ("first 3 et al."). Decide in design.
- **"Copy APA" button placement**: sibling to "View Full PubMed Study" (preferred per research) vs below findings text — decide in design.

## Next Steps

1. Run `/ralph-specum:design` to translate requirements into a technical design (component shape, helper signatures, schema-emission path, file diff plan).
2. From design, generate tasks (`/ralph-specum:tasks`) — expect ~6–8 tasks (PMID verification loop, helper functions, counter refactor, Copy button component, schema emission, build verification, manual QA).
3. Execute tasks with hard `curl`-PMID verification gate before any commit.
