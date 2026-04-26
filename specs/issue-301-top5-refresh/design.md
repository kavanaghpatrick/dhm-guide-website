# Design: issue-301-top5-refresh

## Architecture

Pure data-edit task. No new components, no schema changes, no migration code. Edits target two file groups:

1. **Post JSON files** (4 in `src/newblog/data/posts/`): add `dateModified`, replace 9 broken PMC URLs, insert canonical citation links inline.
2. **Citation map** (`scripts/pubmed-citation-map.json`): remove 16 entries that map natural-language phrases to broken PMC IDs.

## Replacement mapping (verified against research.md "canonical PMC IDs")

| Old (broken) | New (canonical) | Justification |
|---|---|---|
| PMC4082193 | PMC7902334 | Silva 2020 — mitochondrial restoration; matches "liver protection" / "hepatoprotective" semantic load |
| PMC8429066 | PMC11675335 | 2024 Foods RCT — actual peer-reviewed Hovenia/DHM hangover trial; matches phrases "Foods journal", "2024 clinical trial", "Hovenia dulcis" |
| PMC8259720 | (delete from map) | No occurrences in the 4 target posts; map entries deleted to prevent future propagation |

Replacement strategy is **direct URL string substitution** — `https://pmc.ncbi.nlm.nih.gov/articles/PMC4082193/` → `https://pmc.ncbi.nlm.nih.gov/articles/PMC7902334/` (etc.). Anchor text untouched (the linked phrase still describes "liver protection" / "Foods journal" — both consistent with the new target paper).

## Per-post edit plan

### `dhm-dosage-guide-2025.json`
- Top-level: insert `"dateModified": "2026-04-26"` after `"date"`
- Body content: 2× `PMC4082193` → `PMC7902334` (lines around "Liver protection" stat and "UCLA's landmark 2014 research")
- No new citation needed (already has 3 canonical IDs in body)

### `dhm-randomized-controlled-trials.json`
- Top-level: insert `"dateModified": "2026-04-26"`
- Body content: 3× `PMC8429066` → `PMC11675335`; 2× `PMC4082193` → `PMC7902334`
- Stale language: "A groundbreaking" → "A key"; "examines the latest peer-reviewed" → "examines recent peer-reviewed"; "## 2024 Clinical Trial Breakthrough" → "## 2024 Clinical Trial Findings"

### `dhm-vs-zbiotics.json`
- Top-level: insert `"dateModified": "2026-04-26"`
- Body content: 1× `PMC4082193` → `PMC7902334`; 1× `PMC8429066` → `PMC11675335`
- Add inline link: extend "[Hovenia dulcis]" sentence with reference to PMC11033337 (He 2024 review) — appended as separate citation, not inline anchor swap

### `when-to-take-dhm-timing-guide-2025.json`
- Top-level: insert `"dateModified": "2026-04-26"`
- Add 2 inline citations to PMC11675335 and PMC3292407 in existing science paragraphs
- (No broken PMCs to fix in this post)

## Citation map cleanup
Delete 16 entries from `scripts/pubmed-citation-map.json`:
- 8 entries mapping to PMC4082193 (lines 6-15, 73-84, 276-295, 313-324, 348-355)
- 5 entries mapping to PMC8259720 (lines 87-117, 305-311)
- 4 entries mapping to PMC8429066 (lines 119-124, 254-273)

After deletion: 16 fewer entries, JSON still valid array of mapping objects.

## Validation gates
1. `python3 -c "import json; json.load(open('scripts/pubmed-citation-map.json'))"` — JSON valid
2. `python3 -c "import json; [json.load(open(f)) for f in ['src/newblog/data/posts/dhm-dosage-guide-2025.json','src/newblog/data/posts/dhm-randomized-controlled-trials.json','src/newblog/data/posts/dhm-vs-zbiotics.json','src/newblog/data/posts/when-to-take-dhm-timing-guide-2025.json']]"` — all 4 posts valid
3. `grep -c "PMC4082193\|PMC8259720\|PMC8429066" src/newblog/data/posts/*.json scripts/pubmed-citation-map.json` — all return `:0`
4. `npm run build` — 189 posts prerender (current baseline)
5. `grep dateModified dist/never-hungover/dhm-dosage-guide-2025/index.html` — confirm field surfaces

## Risk register
- **Low**: anchor-text/URL semantic mismatch after substitution (mitigated: PMC7902334 is bona-fide hepatoprotective DHM paper; PMC11675335 is actual Foods/Hovenia RCT)
- **Low**: build breakage from bad JSON (mitigated: validation gate 1-2)
- **None**: slug change cascade (NFR1 forbids; no slugs touched)
