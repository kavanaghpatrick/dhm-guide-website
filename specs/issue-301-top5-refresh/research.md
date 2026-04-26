# Research: issue-301-top5-refresh

## Executive summary

4 of the 5 top-traffic posts need refresh (#5 — hangover-supplements — already updated by #300). Two cross-cutting fixes required:

1. **Add `dateModified: "2026-04-26"`** — missing from all 4 posts; Google freshness signal absent
2. **Remove 9 broken PMC citation occurrences** + cleanup `scripts/pubmed-citation-map.json` (16 stale entries across 3 verified-broken IDs)

Plus citation diversity gaps: 4 high-value canonical IDs (PMC7211127, PMC7902334, PMC11675335, PMC11033337) absent from all 4 posts.

## Per-post audit

| Post | dateModified | Broken PMCs | Canonical citations present | Severity |
|---|---|---|---|---|
| `dhm-dosage-guide-2025.json` | missing | PMC4082193 ×2 | 3 of 7 | High |
| `dhm-randomized-controlled-trials.json` | missing | PMC4082193 ×2 + PMC8429066 ×3 = 5 broken | needs audit | **Critical** |
| `dhm-vs-zbiotics.json` | missing | PMC4082193 + PMC8429066 = 2 broken | needs audit | Moderate |
| `when-to-take-dhm-timing-guide-2025.json` | missing | none | only 1 citation total | Moderate |

(`hangover-supplements-complete-guide-what-actually-works-2025.json` — covered by #300 / PR #330)

## Broken PMC IDs to remove/replace globally

Verified via WebFetch in #300's research:

- **PMC4082193** = Norway terror research (NOT DHM)
- **PMC8429066** = transdermal alcohol biosensor (NOT DHM)
- **PMC8259720** = gut microbiome / autoimmune (NOT DHM)

Total occurrences in to-fix posts:
- PMC4082193: 5 occurrences (across 3 files)
- PMC8429066: 4 occurrences (across 2 files)
- PMC8259720: 0 in these 4 posts (but 5 in citation map)

## scripts/pubmed-citation-map.json cleanup needed

16 entries reference broken IDs:
- PMC4082193: 8 entries (lines 7, 13, 74, 81, 277, 283, 321, 350)
- PMC8259720: 5 entries (lines 88, 94, 100, 107, 113, 307)
- PMC8429066: 4 entries (lines 120, 255, 262, 270)

Must be removed or remapped to valid IDs to prevent future agents propagating the issue.

## Canonical PMC IDs to use (verified valid)

- **PMC3292407** (Shen 2012, GABA-A modulation) ✅
- **PMC7211127** (Silva 2020, ADH/ALDH upregulation) ✅
- **PMC7902334** (Silva 2020, mitochondrial restoration) ✅
- **PMC11675335** (2024 Foods journal RCT — newest human data) ✅
- **PMC11033337** (He 2024 Hovenia/DHM review) ✅
- **PMC8603706** (Skotnicová 2020 honest negative finding) ✅
- **PMC3484320** (Cederbaum 2012 alcohol metabolism) ✅
- **PMC2680547** (Brooks 2009 ALDH2 / Asian flush) ✅

## Stale language in dhm-randomized-controlled-trials.json

- Line 18: "A groundbreaking [2024 clinical trial]..." → remove "groundbreaking"; 2024 is 2 years old
- Line 20-21: "examines the **latest** peer-reviewed clinical evidence" → remove "latest"
- Line 23: "## 2024 Clinical Trial **Breakthrough**" → remove "Breakthrough" or contextualize

## Recommended approach

1. Add `dateModified: "2026-04-26"` to all 4 posts
2. Replace all 9 broken citation occurrences with verified canonical IDs (try to match the original claim semantically, not just swap arbitrarily)
3. Add 1-2 canonical citations to each post (especially the 2024 RCT and Hovenia review)
4. Update stale language in dhm-randomized-controlled-trials
5. Clean up `scripts/pubmed-citation-map.json` (remove 16 stale entries; either delete outright or remap valid phrase→ID)
6. `npm run build` — confirm
