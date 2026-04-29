# Research — Issue #143

## Current state

**File**: `src/newblog/data/posts/dhm-randomized-controlled-trials.json`

**Current `title`** (root level, line 3):
```
DHM Clinical Trials 2026: The Science Behind 70% Hangover Prevention
```
Length: **68 chars** — exceeds Google's ~60-char desktop SERP truncation threshold.

**Note**: The issue body (filed Q1 2026) references an older filename (`dhm-randomized-controlled-trials-2024.json`) and an older title (`DHM Clinical Trial 2024: Randomized Study Shows Results (Foods Journal) | DHM Guide`). That title was previously revised to the current 68-char "Science Behind" wording, but never reduced under 60. The CTR problem persists because the still-truncating title is the one Google sees.

The post does NOT have a separate `seo` object — the root-level `title` field is what the prerender pipeline picks up and emits as `<title>` (verified by `dist/never-hungover/dhm-randomized-controlled-trials/index.html` after build). One edit, one source.

## Recommended new title

```
DHM Clinical Trials 2026: 70% Hangover Reduction Proven
```
Length: **55 chars**. Under the 60-char threshold. Front-loads the year + the specific outcome (70% reduction), removes the lower-information "The Science Behind" filler.

## CTR rationale

- Front-loaded keyword: "DHM Clinical Trials" (the GSC query head)
- Year for freshness: "2026"
- Specific benefit: "70% Hangover Reduction"
- Trust word: "Proven"
- No truncation = full title visible in mobile + desktop SERPs

## What we're NOT touching

- `metaDescription` already reads well at 130 chars and includes "70% hangover reduction" — leave it alone for this PR. Issue allows narrowing scope; ship the title win first, measure, iterate if needed.
- Article body, FAQ, and schema are unchanged.

## Risk

Near-zero. Pure data edit to a content JSON. No JS code change. No build config change. Standard JSON parse path. Build will fail loudly if JSON is malformed.
