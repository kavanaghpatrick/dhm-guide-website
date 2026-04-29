# Research — Issue #151

## Current state

**File**: `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`

**Current `title`** (root level, line 2):
```
NAC vs DHM: Which Antioxidant Works Better for Liver Protection? (2025)
```
Length: **71 chars** — exceeds Google's ~60-char desktop SERP truncation threshold. The "(2025)" tail gets cut off, which removes the freshness signal AND the bracket pattern that boosts CTR.

**Note**: The issue body lists current length as 68 chars (close enough; counting the leading question mark and parens varies by tool). Either way, the title is well over the 60-char threshold and is empirically truncating in live SERPs.

The post does NOT have a separate `seo` object — the root-level `title` field is what the prerender pipeline picks up and emits as `<title>` (same architecture as the post fixed in #143). One edit, one source.

## Recommended new title

```
NAC vs DHM: Which Liver Supplement Works Better? [2025]
```
Length: **55 chars**. Under the 60-char threshold by 5 chars (comfortable margin for varying SERP rendering).

## CTR rationale

- Front-loaded keyword "NAC vs DHM" preserved verbatim — protects existing rank for the comparison query
- "Antioxidant" → "Liver Supplement": the issue's GSC data shows users search for liver supplements, not antioxidants. Better keyword/intent match.
- Year switched from `(2025)` to `[2025]`: brackets out-perform parens in SERP CTR studies (Backlinko, HubSpot data); also visually breaks the title for scannability.
- "Works Better" preserved — natural language, matches voice-search patterns.
- Question mark retained — questions in titles are statistically associated with higher CTR for comparison queries.

## What we're NOT touching

- `metaDescription` — current copy reads well at 137 chars, includes pricing detail ($6-15/mo) and clear use-case framing. The issue suggests a more curiosity-driven rewrite, but per the proven #143 pattern we ship the title win first, measure, and iterate on meta if data warrants. Narrowed scope reduces risk and preserves a clean A/B-style attribution window for the title impact.
- Article body, FAQ, and schema are unchanged.
- `slug` is unchanged — no redirect needed.

## Risk

Near-zero. Pure data edit to a content JSON. No JS code change. No build config change. Standard JSON parse path. Build will fail loudly if JSON is malformed.
