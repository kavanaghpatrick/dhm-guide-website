# Design — Issue #143

## The change (1 line)

In `src/newblog/data/posts/dhm-randomized-controlled-trials.json`, line 3:

**Before:**
```json
  "title": "DHM Clinical Trials 2026: The Science Behind 70% Hangover Prevention",
```

**After:**
```json
  "title": "DHM Clinical Trials 2026: 70% Hangover Reduction Proven",
```

## Why this exact string

- 55 chars (under 60-char SERP threshold with comfortable margin)
- Preserves the head keyword "DHM Clinical Trials 2026" intact for ranking continuity
- Replaces vague "The Science Behind 70% Hangover Prevention" with the more concrete "70% Hangover Reduction Proven"
- "Proven" matches search intent (users searching for clinical evidence want validation language)

## Files touched

- `src/newblog/data/posts/dhm-randomized-controlled-trials.json` (1 string change)
- `specs/issue-143-clinical-trials-title/tasks.md` (spec artifact, separate commit)

That's it. No JS, no schema, no prerender script changes. The prerender pipeline reads `title` from the JSON and emits it as `<title>`.

## Verification path

1. `npm run build` — exit 0
2. `grep -oE '<title>[^<]+' dist/never-hungover/dhm-randomized-controlled-trials/index.html` — should show new title
3. Manual visual inspection of the JSON diff
