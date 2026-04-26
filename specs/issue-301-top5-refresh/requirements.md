# Requirements: issue-301-top5-refresh

## Goal
Refresh the 4 top-traffic posts (5th covered by #300) to restore freshness signals, replace verified-broken PMC citations, and clean the citation map to prevent future propagation of broken IDs.

## In-scope posts
1. `dhm-dosage-guide-2025.json` (1,168 PV/mo)
2. `dhm-randomized-controlled-trials.json` (494 PV/mo)
3. `dhm-vs-zbiotics.json` (236 PV/mo)
4. `when-to-take-dhm-timing-guide-2025.json` (229 PV/mo)

## Functional requirements

### FR1: dateModified field
Every target post MUST have `"dateModified": "2026-04-26"` at the JSON top level immediately following the existing `"date"` field. Schema mirrors the pattern established by issue #286 / #300 (verified in `hangover-supplements-complete-guide-what-actually-works-2025.json`).

### FR2: Broken PMC citation replacement
All occurrences of these verified-broken IDs MUST be removed from the 4 posts:
- `PMC4082193` (Norway terror research — NOT DHM) → replace with `PMC7902334` (Silva 2020 mitochondrial)
- `PMC8429066` (transdermal alcohol biosensor — NOT DHM) → replace with `PMC11675335` (2024 Foods journal RCT)
- `PMC8259720` (gut microbiome — NOT DHM) → no occurrences in these 4 posts; verify

Expected occurrences to fix: 9 total across 3 of the 4 posts.

### FR3: Targeted citation additions
- `dhm-vs-zbiotics.json`: add 1 inline citation referencing `PMC11033337` (He 2024 Hovenia/DHM review)
- `when-to-take-dhm-timing-guide-2025.json`: add 2 inline citations referencing `PMC11675335` (2024 RCT) and `PMC3292407` (Shen 2012 GABAA)

### FR4: Stale-language refresh in `dhm-randomized-controlled-trials.json`
Replace stale framing words to match 2026 publication date:
- "groundbreaking" → "key"
- "the latest peer-reviewed clinical evidence" → "recent peer-reviewed clinical evidence"
- "Breakthrough" (heading) → "Findings"
- "2024" framing where appropriate → "2024-2026 evidence"

### FR5: Citation map cleanup
`scripts/pubmed-citation-map.json` MUST have all entries pointing to broken IDs (PMC4082193, PMC8259720, PMC8429066) deleted outright. This prevents future agents from re-propagating broken citations via `scripts/issue-294-pubmed-backfill.mjs`-style automation.

## Non-functional requirements

### NFR1: Slug preservation
All 4 slugs MUST remain unchanged (preserves 404 PV per post worth of equity).

### NFR2: JSON validity
All edited JSON files MUST parse successfully via `JSON.parse` / `node -e`.

### NFR3: Build integrity
`npm run build` MUST emit 189 prerendered post HTML files (no regressions vs HEAD~1).

### NFR4: Sitewide broken-PMC zero hits
After execution, `grep "PMC4082193\|PMC8259720\|PMC8429066"` across `src/newblog/data/posts/*.json` AND `scripts/pubmed-citation-map.json` MUST return 0 hits.

## Out of scope
- Image asset changes (post 5 already covered hero refresh patterns)
- Slug renames (FR NFR1 forbids)
- New body sections / word count expansion (separate issues)
- Re-crawl submission to GSC (manual followup)
