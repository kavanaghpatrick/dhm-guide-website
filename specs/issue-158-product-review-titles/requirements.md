# Requirements — Issue #158

## Acceptance criteria (this branch)

- [x] No Days Wasted title trimmed to under 60 characters (target ~55).
- [x] Brand "No Days Wasted" remains front-loaded.
- [x] Social-proof number ("201+ Customer Analysis") retained in compressed form.
- [x] Benefit/positive framing preserved (no "Side Effects" pivot).
- [x] No `metaDescription`, body, schema, slug, or other field changes.
- [x] DHM1000 and Toniiq Ease JSON files NOT modified (deliberate scope reduction).
- [x] Two clean commits with Co-Authored-By trailer.
- [ ] Build (`npm run build`) succeeds.
- [ ] New title verified in `dist/never-hungover/no-days-wasted-dhm-review-analysis/index.html`.

## In-scope for this branch

1. Trim `title` field in `src/newblog/data/posts/no-days-wasted-dhm-review-analysis.json` from 99 chars → 54 chars.
2. Verify build succeeds.
3. Verify dist HTML contains the new title.
4. Two commits, no unrelated WIP staged.

## Explicitly out of scope (documented in research.md)

- DHM1000 title rewrite — current 64 chars is acceptable; current benefit framing is conversion-friendly.
- Toniiq Ease title rewrite — current 68 chars is marginal; current customer-count is too valuable to trade.
- Side-effects keyword pivot for NDW — conflicts with affiliate/conversion strategy.
- Meta description rewrite — separate decision; ship title fix first, measure.
- GSC reindex — user task post-deploy.

## Definition of done

`npm run build` exits 0 AND `<title>No Days Wasted DHM Review 2025: 201+ Customer Analysis</title>` appears in the prerendered HTML for the post.
