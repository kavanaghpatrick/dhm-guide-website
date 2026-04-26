# Tasks — Issue #300

## Execution Plan (12 fine-grained tasks)

### Task 1 — Audit existing JSON post and identify exact strings to replace
- Locate exact line of "**Last Updated:** January 2025 | **Reading Time:** 15 minutes"
- Locate all 6 inline PubMed link occurrences with line context
- Note the existing FAQ array structure verbatim (must be preserved)
- Note all existing internal links to ensure none are accidentally lost
- **Output**: Mental model of what to keep vs replace
- **Verify**: Read the JSON file before edits

### Task 2 — Update top-level metadata fields (title, excerpt, dates, tags, readTime)
- Set `title` = "Best Hangover Prevention Supplements 2026: 7 Tested" (51 chars — verify)
- Set `excerpt` = head-term-focused 140-160 chars
- Set `metaDescription` = head-term-focused 150-160 chars
- Set `quickAnswer` = definitive 1-2 sentence head-term answer mentioning DHM ≥300mg
- ADD `dateModified`: "2026-04-26"
- KEEP `date`: "2025-07-09" (publication)
- Update `tags`: replace "hangover cure supplements" with "best hangover prevention supplement 2026"
- Update `readTime`: 12 → 16
- **Verify**: title ≤65 chars; dateModified field present; slug unchanged

### Task 3 — Remove the hardcoded "Last Updated" line from body
- Open `content` field
- Remove the first body line: `**Last Updated:** January 2025 | **Reading Time:** 15 minutes\n\n`
- **Verify**: First content line is now the cluster-pillar comment or hero paragraph

### Task 4 — Replace ALL 3 broken PMC IDs in body
- Find every occurrence of `PMC4082193`, `PMC8429066`, `PMC8259720` in `content`
- Replace with appropriate valid PMC ID per design.md mapping:
  - "Liver protection" PMC4082193 → PMC9905036 (milk thistle silymarin)
  - "USC Research (2020)" PMC4082193 → PMC7211127 (Silva 2020)
  - Hovenia Dulcis PMC8429066 → PMC7914479 (Sferrazza 2021)
- **Verify**: `grep -c "PMC4082193\|PMC8429066\|PMC8259720"` returns 0

### Task 5 — Insert hero paragraph + comparison table at top of body
- Replace the existing intro paragraph ("The hangover supplement market has exploded...") with the new hero paragraph framing 12 tested / 3 actually work
- Immediately after hero, insert markdown comparison table with 7 rows from Reviews.jsx (verify product names, DHM dose, price, $/serving, rating, score match Reviews.jsx exactly)
- Each product name in table cell links to `/reviews`
- **Verify**: Table appears before first `## H2`

### Task 6 — Add new H2 section "Why Most Hangover Supplements Fail" (~250 words)
- Place after "How We Evaluated" section, before "The Science Behind Hangover Prevention"
- Reference 2022 systematic review (cited via PMC8603706 negative result)
- Frame honest expectations
- Include 1 internal link to `/never-hungover/dhm-randomized-controlled-trials-2024`
- **Verify**: Word count of new section 200-300 words

### Task 7 — Add new H2 section "The 2024 Hovenia Human RCT" (~300 words)
- Place after "The Science Behind Hangover Prevention" section, before product reviews
- Cite [PMC11675335](https://pmc.ncbi.nlm.nih.gov/articles/PMC11675335/)
- Describe trial design (n=25 crossover), GI improvement p<0.05, BAC reduction at 0.25/0.5h
- Include internal link to `/never-hungover/dhm-randomized-controlled-trials-2024`
- **Verify**: Word count 250-350 words; PMC11675335 linked once

### Task 8 — Condense product reviews from 20 → 12 (cut weakest 8)
- Remove these 8 product sections: PartySmart, RU-21, Zaca Recovery Patches, Survivor Vitamins, Toast! Gummies, Liquid I.V., Drinkwel, Rally Recovery
- KEEP: DHM Depot, Cheers, Morning Recovery, Flyby, No Days Wasted, More Labs, H-Proof, DHM Warehouse, AfterDrink, Life Happns, Purple Tree, Blowfish
- Update H2 from "Top 20 Hangover Supplements Reviewed" → "12 Hangover Supplements Tested"
- Renumber remaining products 1-12
- **Verify**: 12 product sections; total H3 count = 12 in this section

### Task 9 — Add new H2 section "How DHM Stacks Up: Mechanism in 3 Sentences" (~200 words)
- Place after "Ingredient Analysis Guide", before "Red Flags"
- 3 mechanisms: GABA-A (PMC3292407), liver enzymes (PMC7211127), ALDH2 (PMC2680547)
- Add internal link to `/never-hungover/dhm-science-explained`
- Add internal link to `/never-hungover/is-dhm-safe-science-behind-side-effects-2025`
- **Verify**: Word count 150-250 words; 3 PMC links inline; 2 internal links

### Task 10 — Expand FAQ from 5 → 17 entries
- Preserve existing 5 entries verbatim (do not edit)
- Append 12 new Q&A entries per design.md list
- Each new answer: 30-100 words
- Where natural, embed inline link or citation in answer
- Maintain exact `{"question": "...", "answer": "..."}` structure
- **Verify**: `faq[]` array length = 17; all entries have non-empty question + answer

### Task 11 — Add remaining internal links throughout body
- Add link to `/compare` in "Buying Guide → Where to Buy" section
- Add link to `/never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025` in "Buying Guide" or ingredient section
- Add link to `/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025` in NAC discussion
- Add link to `/never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025` in "Final Recommendations" or product comparison
- **Verify**: Body contains ≥12 internal links matching `/never-hungover/`, `/guide`, `/reviews`, or `/compare`

### Task 12 — Run npm build, verify dist HTML, count metrics
- Run `npm run build` (or `pnpm build`)
- Locate built file at `dist/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025/index.html`
- Verify: `grep -c '"@type":"FAQPage"'` ≥ 1
- Verify: `grep -c '"dateModified":"2026-04-26"'` ≥ 1
- Verify: `<title>` content ≤65 chars
- Verify: word count in main `<article>` or rendered body ≥ 3,500
- Count inline PMC links in body
- **If any check fails**: Fix and rerun build
- **Verify**: All quality requirements per requirements.md met

## Sequencing & Dependencies

- Task 1 must precede all others (audit)
- Tasks 2-3 can be done in single edit pass (top-of-JSON metadata + first content line)
- Tasks 4-11 are body-content edits, can be sequenced 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
- Task 12 is final validation, must be last

## Acceptance Gate

All requirements.md acceptance criteria pass via Task 12 verification.
