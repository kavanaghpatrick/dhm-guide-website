# Design — Issue #294

## Components

### 1. `scripts/pubmed-citation-map.json`
Curated phrase→PMC mapping with optional `requires` context guards.

```json
{
  "version": 1,
  "mappings": [
    {
      "phrase": "UCLA's landmark 2014 research",
      "pmcid": "PMC4082193",
      "confidence": "high"
    },
    {
      "phrase": "Korean study, 2012",
      "pmcid": "PMC3292407",
      "confidence": "high"
    },
    ...
  ]
}
```

### 2. `scripts/posts-pubmed-citation-backfill.mjs`
- CLI: `node scripts/posts-pubmed-citation-backfill.mjs [--apply]`
- Reads top-30 slug list (hardcoded, derived from PostHog query)
- Loads `pubmed-citation-map.json`
- For each post:
  1. Read JSON, extract `content`
  2. For each mapping, find first unlinked occurrence (skip if inside `[...]` already, skip if inside ``` blocks, skip if line starts with `#`, skip if line is a bare reference URL)
  3. Replace with markdown link
  4. Cap at 8 substitutions per post
  5. If `--apply`, rewrite JSON
- Outputs table: slug, substitutions count, phrases used

### 3. Detection logic for "already linked"
Walk text. For each mapping phrase match (case-insensitive, word-boundary):
- Look at chars between previous `[` (within last 200 chars) and matched start: if no `]` between them and there is no closing `)` after the match, treat as inside link → skip.
- Simpler: regex search for `\[[^\]]*PHRASE[^\]]*\]\(` — if it matches anywhere overlapping the candidate, skip that occurrence and find next.

### 4. Block-skipping logic
Split content into segments by:
- Code fence ``` (toggle in/out)
- Lines starting with `#` (headings)
- Lines that are just `[http...](http...)` (reference list)
- Lines starting with `\d+\.` followed only by a markdown URL link (numbered reference list)

Only attempt substitutions in body-text segments.
