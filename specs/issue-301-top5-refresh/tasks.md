# Tasks: issue-301-top5-refresh

## Order of operations

### T1: Citation map cleanup
File: `scripts/pubmed-citation-map.json`
- Delete 8 entries mapping to PMC4082193
- Delete 5 entries mapping to PMC8259720
- Delete 4 entries mapping to PMC8429066
- Verify with `python3 -c "import json; json.load(open('scripts/pubmed-citation-map.json'))"`

### T2: dhm-dosage-guide-2025 refresh
File: `src/newblog/data/posts/dhm-dosage-guide-2025.json`
- Insert `"dateModified": "2026-04-26"` after `"date"`
- Replace 2× PMC4082193 URL → PMC7902334 URL

### T3: dhm-randomized-controlled-trials refresh
File: `src/newblog/data/posts/dhm-randomized-controlled-trials.json`
- Insert `"dateModified": "2026-04-26"` after `"date"`
- Replace 3× PMC8429066 URL → PMC11675335 URL
- Replace 2× PMC4082193 URL → PMC7902334 URL
- Replace stale language: "groundbreaking" → "key", "latest peer-reviewed" → "recent peer-reviewed", "## 2024 Clinical Trial Breakthrough" → "## 2024 Clinical Trial Findings"

### T4: dhm-vs-zbiotics refresh
File: `src/newblog/data/posts/dhm-vs-zbiotics.json`
- Insert `"dateModified": "2026-04-26"` after `"date"`
- Replace 1× PMC4082193 URL → PMC7902334 URL
- Replace 1× PMC8429066 URL → PMC11675335 URL
- Add inline reference to PMC11033337 (He 2024 review) in DHM intro paragraph

### T5: when-to-take-dhm-timing-guide-2025 refresh
File: `src/newblog/data/posts/when-to-take-dhm-timing-guide-2025.json`
- Insert `"dateModified": "2026-04-26"` after `"date"`
- Add 2 inline citations: PMC11675335 (2024 RCT) and PMC3292407 (Shen 2012 GABA)

### T6: Validation
- JSON parse check on all 4 posts + citation map
- Sitewide grep for broken PMCs returns 0
- `npm run build` — 189 posts
- Sample dist HTML inspection for dateModified

### T7: Commit, PR, merge
- Single commit with all changes
- PR title: `feat: refresh top-5 traffic posts + remove 9 broken PMC citations + clean citation map (#301)`
- Body: `Closes #301. Refs #283.` + before/after metrics table
- Squash-merge with `--admin`
