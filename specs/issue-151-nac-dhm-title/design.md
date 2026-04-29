# Design — Issue #151

## The change (1 line)

In `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`, line 2:

**Before:**
```json
  "title": "NAC vs DHM: Which Antioxidant Works Better for Liver Protection? (2025)",
```

**After:**
```json
  "title": "NAC vs DHM: Which Liver Supplement Works Better? [2025]",
```

## Why this exact string

- **55 chars** (under 60-char SERP threshold with 5-char margin for varying renderers)
- Preserves the head keyword "NAC vs DHM" intact for ranking continuity
- Replaces "Antioxidant" with "Liver Supplement" — better matches GSC search intent (per issue analysis)
- `[2025]` brackets out-perform `(2025)` parens in SERP CTR research
- Question mark retained — comparison queries pair well with question titles

## Files touched

- `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` (1 string change, line 2)
- `specs/issue-151-nac-dhm-title/tasks.md` (spec artifact, separate commit)

That's it. No JS, no schema, no prerender script changes. The prerender pipeline reads root-level `title` from the JSON and emits it as `<title>` (verified architecture from #143).

## Verification path

1. `npm run build` — exit 0
2. `grep -oE '<title>[^<]+' dist/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025/index.html` — should show `NAC vs DHM: Which Liver Supplement Works Better? [2025]`
3. Manual visual inspection of the JSON diff
