# R5: Comparison Post Schema Audit & Fix

**Branch:** `fix/comparison-posts-schema-audit`
**Commit:** `d43c5af`
**Status:** Fixed (not pushed/PRed per task constraints)

## Summary

Audited all 38 comparison-style posts under `src/newblog/data/posts`. Found 3 broken posts using the same array-of-typed-sections schema that the renderer (`renderContent` in `NewBlogPost.jsx`, lines 182-212) does not handle. Converted all 3 to markdown strings using the same conversion mapping as sibling agent C (commit `d2b6b09`).

## Audit results

| Post slug | Schema | Status | 30d PV | 30d scroll-50 |
|-----------|--------|--------|--------|---------------|
| flyby-vs-cheers-complete-comparison-2025 | array (broken) | C-fixed in d2b6b09 (do not touch) | 151 | 0 (0%) |
| flyby-vs-good-morning-pills-complete-comparison-2025 | array (broken) | C-fixed in d2b6b09 (do not touch) | 58 | 0 (0%) |
| **double-wood-vs-toniiq-ease-dhm-comparison-2025** | **array (broken)** | **R5 FIXED** | **34** | **0 (0%)** |
| **flyby-vs-dhm1000-complete-comparison-2025** | **array (broken)** | **R5 FIXED** | **4** | **0 (0%)** |
| **flyby-vs-fuller-health-complete-comparison** | **array (broken; section type with `title` not `heading`, missing subsections + tables)** | **R5 FIXED** | **0** | n/a |
| All other 33 comparison posts | string content | OK (already healthy) | varies | 3-15% on healthy posts |

For comparison, healthy comparison posts on the same site show 3-15% scroll-50 over the same 30d window (e.g. dhm-vs-zbiotics 14%, nac-vs-dhm 15%, double-wood-vs-no-days-wasted 3%, no-days-wasted-vs-dhm1000 10%). The 0% rate on the broken array-content posts is the same diagnostic signal C used.

## Files changed

- `src/newblog/data/posts/double-wood-vs-toniiq-ease-dhm-comparison-2025.json`
  - 36 sections array -> 10,257 char markdown string
  - Top-level `faqs` array (only file with this) inlined into markdown as `## Frequently Asked Questions`
- `src/newblog/data/posts/flyby-vs-dhm1000-complete-comparison-2025.json`
  - 56 sections array -> 11,568 char markdown string
- `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json`
  - 10 sections array -> 6,589 char markdown string
  - Different schema than the others (section/toc/cta) - was emitting `## undefined` because `section.title` was being read as `section.heading`. Subsections + tables were silently dropped. All now visible.

## Conversion mapping (matches C agent's d2b6b09 pattern)

| Section type | Markdown output |
|---|---|
| paragraph | `text` |
| heading | `##` / `###` based on `level` |
| subheading | `###` |
| quickComparison | `### title` + GFM table + product Amazon links |
| comparisonTable | `### title` + GFM pipe table |
| priceComparison | `### Cost Breakdown` + GFM table |
| list | bullets (ordered or unordered) |
| alert / callout | `> **Title:** content` blockquote (renderer recognizes via existing `**Tag:**` pattern) |
| productCard | `### name` + Rating + Price + features bullets + Amazon link |
| reviewSummary | `### What Customers Say` + Positives/Negatives bullets |
| verdict | `### Verdict: winner -- score` + summary |
| faq | `## Frequently Asked Questions` + `### Q` + A pairs |
| ctaSection | `### title` + content + cta links |
| section (fuller-health) | `## title` + content + table + subsections (### subsection title + content + bullets) |
| cta (fuller-health) | `### title` + content + button link |
| toc | dropped (renderer has its own TOC generator) |

## Verification

- **`npm run build`**: passes. 189 blog posts prerendered. Note: pre-existing prerender error `unsafe.replace is not a function` on `flyby-vs-fuller-health-complete-comparison` due to its `image` field being a dict (not a string). This is the same Pattern #8 bug previously identified; unrelated to my content fix. Build still succeeds and HTML is generated.
- **Validator**: My 3 fixed files no longer trigger "Content field is empty" error. Remaining warnings ("Missing metaDescription", "Missing alt_text for image") are pre-existing across many other comparison files - not caused by my fix.
- **Re-audit grep**: `grep -L '"content": "' src/newblog/data/posts/*comparison*.json | xargs -I {} grep -l '"type":\s*"paragraph"' {}` -> empty result. No comparison post still has typed-array content with `paragraph` sections (excluding the 2 owned by C agent on a separate unmerged branch).
- **Scroll-50 verification**: Cannot verify in-session (client-side tracking). After deploy, run within 24h:
  ```sql
  SELECT properties.$pathname, count() AS s50
  FROM events
  WHERE event = 'scroll_depth_milestone' AND properties.depth_percentage = 50
    AND timestamp > now() - INTERVAL 1 DAY
    AND (properties.$pathname LIKE '%double-wood-vs-toniiq-ease%'
         OR properties.$pathname LIKE '%flyby-vs-dhm1000%'
         OR properties.$pathname LIKE '%flyby-vs-fuller-health%')
  GROUP BY properties.$pathname
  ```

## Constraints honored

- Branch `fix/comparison-posts-schema-audit` created from `main`, not from C's `fix/flyby-comparison-pages` branch.
- Did not touch `flyby-vs-cheers-complete-comparison-2025.json` or `flyby-vs-good-morning-pills-complete-comparison-2025.json` (owned by C).
- Did not modify `src/newblog/components/NewBlogPost.jsx` (pure data fix; sibling R6 may modify the template).
- Did not add CTAs or change content semantics - only schema conversion (R6/R8 own CTA additions).
- Did not push or open a PR.

## Out of scope (flagged for follow-up)

- `flyby-vs-fuller-health-complete-comparison.json` has its `image` field as a dict instead of a string, causing a pre-existing prerender error. This is Pattern #8 from CLAUDE.md and should be fixed separately. The content is now rendered correctly but the `<meta og:image>` and JSON-LD image URL will be malformed until that field is also fixed.

## Multi-agent contention note

The shared working tree was being mutated by other agents during this session (HEAD was switching branches between commands). The fix commit `d43c5af` is reliably present on `fix/comparison-posts-schema-audit` and contains the correct markdown content (verified via `git show d43c5af:<path>`). Other branch switches by sibling agents did not affect the commit itself.

## Conversion script

`/tmp/convert_comparison_content.py` (one-off, not committed). Re-runnable on any future array-content posts.
