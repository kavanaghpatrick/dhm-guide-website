# Design — Issue #158

## The change (1 line)

In `src/newblog/data/posts/no-days-wasted-dhm-review-analysis.json`, line 3:

**Before:**
```json
  "title": "No Days Wasted DHM Detox Review Analysis: What 201+ Amazon Customers Say About This Premium Formula",
```

**After:**
```json
  "title": "No Days Wasted DHM Review 2025: 201+ Customer Analysis",
```

## Why this exact string

- **54 chars** (under 60-char SERP threshold with 6-char margin for varying renderers)
- Brand "No Days Wasted" front-loaded — protects brand-search ranking continuity
- "DHM" head keyword preserved
- "Review 2025" adds freshness signal absent from current title
- "201+ Customer Analysis" preserves the highest-converting hook (specific number, social proof)
- Drops "Detox" (not a primary GSC query), "Premium Formula" (filler), "Amazon" (implied), and the verbose "What ... Say About This"
- No "Side Effects" framing — keeps users on a positive, purchase-ready intent path (affiliate-conversion preserved)

## Files touched (this branch)

- `src/newblog/data/posts/no-days-wasted-dhm-review-analysis.json` (1 string change, line 3)
- `specs/issue-158-product-review-titles/{research,requirements,design,tasks}.md` (spec artifacts, separate commit)

That's it. No JS, no schema, no prerender script changes. The prerender pipeline reads root-level `title` from the JSON and emits it as `<title>` (verified architecture from #143 and #151 — no `seo.title` or `seoTitle` field exists in this post).

## Files NOT touched (deliberate scope exclusion)

- `src/newblog/data/posts/dhm1000-review-2025.json` — current title is 64 chars (acceptable); benefit framing is conversion-friendly.
- `src/newblog/data/posts/toniiq-ease-dhm-review-analysis.json` — current title is 68 chars (marginal); customer-count social-proof is too valuable to trade.

Rationale recorded in `research.md`.

## Verification path

1. `npm run build` — exit 0
2. `grep -oE '<title>[^<]+' dist/never-hungover/no-days-wasted-dhm-review-analysis/index.html` should include `No Days Wasted DHM Review 2025: 201+ Customer Analysis`
3. Manual visual inspection of the JSON diff (no other fields touched)
4. `git diff --name-only main` should list exactly: the one JSON file (commit 1) and the four spec markdown files (commit 2)

## Why follow #151 pattern exactly

Issues #143 (clinical-trials-title) and #151 (nac-dhm-title) successfully trimmed long titles using this exact mechanic: edit root `title`, verify in prerendered dist HTML. Same content pipeline, same JSON structure. No reason to deviate.
