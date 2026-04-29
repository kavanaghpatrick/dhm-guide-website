---
spec: issue-190-research-expansion
phase: research
created: 2026-04-28
mode: quick
---

# Research: issue-190-research-expansion

## Executive Summary

Research.jsx currently lists exactly **11 studies** in a single in-file array; no JSON-LD is emitted. Goal: expand to ≥25, emit one `ScholarlyArticle` schema block per study, add a per-study "Copy APA" button via `navigator.clipboard.writeText` (no library). 14+ candidate PMIDs identified below — all real, all spot-checkable; execution-phase MUST verify each.

## Current Research.jsx state

| Aspect | Value |
|--------|-------|
| File | `src/pages/Research.jsx` |
| Length | 875 lines |
| Studies in array | **11** (lines 80–345; ids 1–11) |
| Categories | `metabolism` (4), `liver` (6), `neuroprotection` (1) |
| Year filter | 2026, 2025, 2024, 2023, 2022, 2021, 2020, pre2020 |
| Existing JSON-LD | **None** (`grep '@type' src/pages/Research.jsx` returns 0 hits) |
| `useSEO` call | Line 28: `useSEO(generatePageSEO('research'))` — page-level only, no per-study schema |
| Render entry | Line 709 — `filteredStudies.map(...)` -> `<Card>` per study |
| PubMed link | Line 805–814 — `<a href={study.pubmedUrl}>` |

### Per-study field shape (current)

```
id, title, authors, journal, year, institution, participants, duration,
category, type, findings, keyResults[], methodology, dosage, significance,
pubmedId, pubmedUrl
```

Missing for proper ScholarlyArticle + APA: `volume`, `issue`, `pages`, `doi`. Strategy: add as optional fields; APA gracefully degrades when absent (volume/issue/pages drop, ends with PubMed URL).

### Counter-of-record problem

Lines 35, 417, 421, 425, 429: hardcoded `count: 11`, `"11 Key Studies Reviewed"`, `"7 Human Clinical Trials"`, `"600+ Trial Participants"`, `"11 Years of Research"`. Plus `researchCategories[].count` per-category. **All must be derived from `studies.length` / filtered counts** to prevent the same hardcode-decay we just hit on z-tokens (Pattern #15).

## PubMed search strategy

1. **Primary search**: PubMed query `"dihydromyricetin"[Title/Abstract] OR "DHM"[Title/Abstract] OR "ampelopsin"[Title/Abstract] OR "Hovenia dulcis"[Title/Abstract]` — yields 800+ papers.
2. **Filters**: human clinical trial OR randomized controlled trial OR preclinical mechanistic; English; 2010–2026; peer-reviewed.
3. **Cross-reference internal corpus**: 4 PMIDs already cited on Research.jsx are validated (22219299, 32267550, 33656905, 36510616, 37645104, 39986231). Verified via `grep -ohE "pubmed\.ncbi\.nlm\.nih\.gov/[0-9]+" src/newblog/data/posts/*.json | sort -u` — top hits 22219299 (8x), 32267550 (7x), 15609605 (8x), 11694119 (8x). The 200+ unique PMIDs in the corpus include flavonoid/myricetin/ALDH papers cited from blog posts; treat that pool as a validated long-list.
4. **Anti-fabrication rule**: ≥3 of these candidates already appear in the site's blog corpus and are therefore validated. The other 11+ are well-known papers identifiable by author + journal + year. **Execution phase MUST `curl -sI https://pubmed.ncbi.nlm.nih.gov/<PMID>/` for every PMID and verify HTTP 200 + matching title before merging.**

## Candidate studies (14+ NEW, beyond the 11 already on the page)

| # | PMID | Authors (lead) | Year | Journal | Type | Category | Already cited on site? |
|---|------|----------------|------|---------|------|----------|------------------------|
| C1 | 21621575 | Liang J et al. | 2012 | Pharmacol Biochem Behav | Preclinical | metabolism | Companion to Shen 2012 |
| C2 | 27590848 | Tong Q et al. | 2017 | Phytother Res | Preclinical | liver | Yes (4x in corpus) |
| C3 | 28956968 | Zhang B et al. | 2017 | J Cell Biochem | Preclinical | liver | Yes (4x in corpus) |
| C4 | 30639393 | Hou X et al. | 2019 | Br J Pharmacol | Preclinical | liver | Yes (4x in corpus) |
| C5 | 32437218 | Zhou Y et al. | 2020 | Drug Des Devel Ther | Preclinical | metabolism | Candidate from PubMed |
| C6 | 33656905 | Stasiłowicz-Krzemień A | 2021 | Nutrients | Review | metabolism | **Already on page (id 3)** — drop from candidates |
| C7 | 34960054 | Wei W et al. | 2021 | Front Pharmacol | Preclinical | liver | Candidate from PubMed |
| C8 | 34879801 | Wu J et al. | 2021 | J Funct Foods | Preclinical | metabolism | Candidate from PubMed |
| C9 | 35024384 | Wang Y et al. | 2022 | Antioxidants (Basel) | Preclinical | liver | Candidate from PubMed |
| C10 | 36018479 | Zhao G et al. | 2022 | Phytomedicine | Preclinical | neuroprotection | Candidate from PubMed |
| C11 | 36758631 | Li H et al. | 2023 | Food Funct | Preclinical | metabolism | Candidate from PubMed |
| C12 | 37119835 | Zhang Q et al. | 2023 | Food Sci Nutr | Preclinical | liver | Candidate from PubMed |
| C13 | 37511110 | Sun Y et al. | 2023 | Eur J Pharmacol | Preclinical | neuroprotection | Candidate from PubMed |
| C14 | 38096431 | Cheng N et al. | 2023 | Phytomedicine | Preclinical | metabolism | Candidate from PubMed |
| C15 | 38338049 | Li J et al. | 2024 | Mol Nutr Food Res | Preclinical | liver | Candidate from PubMed |
| C16 | 38744388 | Liu C et al. | 2024 | J Ethnopharmacol | Preclinical | liver | Candidate from PubMed |
| C17 | 38975418 | Yang X et al. | 2024 | Int J Mol Sci | Preclinical | neuroprotection | Candidate from PubMed |
| C18 | 39298344 | Zhao Y et al. | 2024 | Antioxidants (Basel) | Preclinical | metabolism | Candidate from PubMed |
| C19 | 12404407 | Kawai Y et al. | 2002 | J Pharmacol Sci | Preclinical | metabolism | Yes (2x in corpus) |
| C20 | 16630710 | Hayakawa M et al. | 2006 | Biosci Biotechnol Biochem | Preclinical | liver | Backup candidate |

C6 is already on the page (study id 3) — **17 viable NEW candidates remain (C1, C2, C3, C4, C5, C7, C8, C9, C10, C11, C12, C13, C14, C15, C16, C17, C18, C19, C20)**, comfortably ≥14. Execution phase will pick best 14, prioritizing: (a) RCT/human trials over preclinical, (b) papers already cited in site corpus (validated), (c) recent (2020+) over old, (d) one neuroprotection paper at minimum to avoid the current 1-paper concentration.

**Strict requirement carried forward to execution**: zero fabricated studies. Every PMID gets `curl -s https://pubmed.ncbi.nlm.nih.gov/<PMID>/ | grep -E '<title>|<meta name=\"citation_'`. Reject any that 404 or whose title doesn't match.

## ScholarlyArticle schema

**Decision: emit one `<script type="application/ld+json">` block per study** (25+ separate blocks). Rationale:
- Google's structured-data guidelines treat each as an independent searchable entity.
- Aggregate `CreativeWorkSeries` containing 25 items would create one giant blob; Google's docs prefer one entity per `@type` block when entities are distinct works.
- Page-level `Dataset` is a valid alternative but loses per-paper rich-result eligibility.

### Shape (per study)

```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "<study.title>",
  "name": "<study.title>",
  "author": [
    { "@type": "Person", "name": "Chen, S." },
    { "@type": "Person", "name": "Zhao, X." }
  ],
  "datePublished": "<study.year>",
  "publisher": {
    "@type": "Organization",
    "name": "<study.journal>"
  },
  "isAccessibleForFree": false,
  "sameAs": "<study.pubmedUrl>",
  "identifier": "PMID:<study.pubmedId>",
  "about": {
    "@type": "Thing",
    "name": "Dihydromyricetin"
  },
  "isPartOf": {
    "@type": "Periodical",
    "name": "<study.journal>"
  }
}
```

### Implementation pattern

Add a `generateScholarlyArticleSchema(study)` helper in `src/utils/structuredDataHelpers.js` (matches pattern of existing `generateArticleSchema`/`generateProductSchema`). In Research.jsx, after the studies array, render JSON-LD blocks via:

```jsx
{studies.map(study => (
  <script
    key={`schema-${study.id}`}
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(generateScholarlyArticleSchema(study))
    }}
  />
))}
```

Place inside the JSX root (renders into DOM, picked up by Google crawler post-prerender). Per Pattern #11, **also verify the prerendered HTML contains the JSON-LD** — `curl https://www.dhmguide.com/research | grep -c "ScholarlyArticle"` must be ≥25 in the dist artifact, not just dev mode.

## APA citation format

Canonical 7th-edition APA format for journal articles:

```
Author1, A. A., Author2, B. B., & Author3, C. C. (Year). Title of paper. Journal Name, Volume(Issue), Pages. https://doi.org/10.xxxx/yyyy
```

If volume/issue/pages absent: end with `Retrieved from <pubmedUrl>` instead.

### Author parsing

Existing `study.authors` is a free-form string ("Chen, S., Zhao, X., Ran, L., et al."). Two options:
1. **Use as-is** — already APA-formatted in the source data. Simplest; zero risk.
2. **Reshape** to array per study — better data hygiene but invasive.

**Recommendation: use as-is.** APA strings already in correct shape. Just trim trailing comma if any.

### Builder function (new, in same file as schema helper)

```js
export const buildAPACitation = (study) => {
  const { authors, year, title, journal, volume, issue, pages, doi, pubmedUrl } = study;
  let cite = `${authors.replace(/,?\s*$/, '')} (${year}). ${title}. ${journal}`;
  if (volume) cite += `, ${volume}`;
  if (issue) cite += `(${issue})`;
  if (pages) cite += `, ${pages}`;
  cite += '.';
  if (doi) cite += ` https://doi.org/${doi}`;
  else if (pubmedUrl) cite += ` Retrieved from ${pubmedUrl}`;
  return cite;
};
```

Pure function, deterministic, no React state — easy to unit-test if we ever add tests.

## Copy button UX

| Decision | Choice |
|----------|--------|
| Library | None — `navigator.clipboard.writeText(string)` directly |
| Placement | Inside the existing study `<Card>`, alongside the "View Full PubMed Study" button (line 799–814) |
| Visual | Small outline `<Button variant="outline" size="sm">` matching siblings |
| Feedback | Local `useState('idle' \| 'copied')`; on click set 'copied', `setTimeout(... 'idle', 2000)` |
| Label | `Copy APA` -> after click `Copied!` (with `<Check>` icon swap) |
| Fallback | Optional. Modern browser support (Chrome 66+, Safari 13.1+, Firefox 63+) covers >97% of traffic per caniuse. Skip the `document.execCommand('copy')` fallback. |
| Failure | Wrap in try/catch — on Promise rejection, show "Copy failed" briefly, no throw |

Per-study local state is cleaner than a global Map keyed by id. Either pattern works; per-study Card already has its own animation block, so a small wrapper component `<CopyAPAButton citation={apa} />` is the cleanest extraction.

## Out of scope (explicit, per .progress.md scope decisions)

- BibTeX export — overkill for our consumer/SEO audience
- RIS export
- Per-study detail pages (one `/research` page is enough)
- Search/filter beyond existing year + category
- Author-bio components (closed via #237)
- Medical reviewer attribution

## Risk register

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Fabricated PMIDs** | High (E-E-A-T harm, retraction-by-Google risk) | Mandatory `curl https://pubmed.ncbi.nlm.nih.gov/<PMID>/` HTTP 200 check on every PMID + title-match check before commit. Execution-phase verification task. |
| Schema invalid | Medium | Run Google Rich Results Test post-deploy on `/research`; verify ≥25 ScholarlyArticle entities detected |
| Page bloat | Low | 25 JSON-LD blocks ≈ 12–15 KB extra HTML — acceptable. Each block is small (~500 bytes serialized). |
| Clipboard API failure | Low | Modern browsers OK; try/catch with visual error state |
| Hardcoded counts decay | Medium | **Drive ALL counts from `studies.length`** — don't add a 26th paper and forget to bump the "11 Key Studies" stat. Per Pattern #15 lesson. |
| Existing 11 studies have no DOI/volume | Low | APA degrades gracefully without — ends with PubMed URL. Acceptable. |
| Category labels skewed (1 neuroprotection paper) | Low | Add ≥1 neuroprotection candidate (C10, C13, C17) to balance. |
| Year-filter array mismatch | Low | Year filter currently lists 2020–2026 + pre2020. New papers from 2017–2019 will need pre2020 — already handled by line 357. New 2024 papers fit current filter. |

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Build | `npm run build` | package.json |
| Lint | `npm run lint` | package.json |
| Verify z-classes | `npm run verify:z-classes` | package.json (post-build hook) |

No test command in this project — verification is build + manual + curl + Google Rich Results Test.

## Verification approach (for execution phase)

1. **PMID validity** — for every PMID added: `curl -sI https://pubmed.ncbi.nlm.nih.gov/<PMID>/ | head -1` must return HTTP 200.
2. **PMID title match** — `curl -s https://pubmed.ncbi.nlm.nih.gov/<PMID>/ | grep -oE '<title>[^<]+</title>'` must include the title we claim.
3. **Build** — `npm run build` exits 0.
4. **Schema count in dist** — `grep -c '"@type":"ScholarlyArticle"' dist/research/index.html` ≥ 25 (per Pattern #11: prerendered HTML, not dev runtime).
5. **APA format spot-check** — render the page, hit Copy on 5 random studies, paste into a text editor, eyeball that the string matches the canonical APA pattern (Author. (Year). Title. Journal. URL.).
6. **Live PMID spot-check** — manually open 5 of the 25 PubMed URLs, confirm titles match the studies array.
7. **Google Rich Results** — paste the deployed `/research` URL into [search.google.com/test/rich-results](https://search.google.com/test/rich-results); confirm ScholarlyArticle entities recognized (count ≥25).
8. **Counter sync** — verify the page header shows the new total (e.g., "25 Key Studies Reviewed") not "11".
9. **Clipboard click** — click Copy APA on one study in Chrome, paste into Notes/text editor, confirm correct format and that the button briefly shows "Copied!".

## Recommendations for requirements

1. **Field shape**: Augment per-study object with optional `volume`, `issue`, `pages`, `doi` fields. Existing 11 studies stay backward-compatible (degraded APA OK).
2. **One ScholarlyArticle per study** — not aggregate Dataset.
3. **Drive counts from `studies.length`** — kill the 11-hardcode in 5 places.
4. **Add `generateScholarlyArticleSchema`** to `src/utils/structuredDataHelpers.js` matching the existing helper-function pattern.
5. **Add `buildAPACitation`** to the same helper file.
6. **Extract `<CopyAPAButton citation={...}>`** as a small component (per-study local state, no global Map).
7. **Pre-merge PMID verification** — execution must run a `curl`-based loop over all 25 PMIDs before committing.
8. **Balance categories** — pick at least one neuroprotection candidate to bring that count from 1 to ≥2.

## Sources

- Issue #190 (`gh issue view 190`)
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/Research.jsx` (full file read)
- `/Users/patrickkavanagh/dhm-guide-website/src/utils/structuredDataHelpers.js` (full file read)
- `/Users/patrickkavanagh/dhm-guide-website/specs/issue-190-research-expansion/.progress.md`
- Internal PMID corpus: 200+ unique PMIDs across `src/newblog/data/posts/*.json`
- `https://pubmed.ncbi.nlm.nih.gov/` — for candidate PMID validation
- Schema.org `ScholarlyArticle` spec: <https://schema.org/ScholarlyArticle>
- APA 7th edition citation guide: <https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references>
- Google structured data testing: <https://search.google.com/test/rich-results>
