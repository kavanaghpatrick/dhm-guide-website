# Tasks — Issue #117

## T1 — Hide DHM column on mobile [Reviews.jsx]
- [x] Edit `<th>DHM</th>` to add `hidden md:table-cell`.
- [x] Edit corresponding `<td>` in `topProducts.map` row.

## T2 — Hide Per Serving column on mobile [Reviews.jsx]
- [x] Edit `<th>Per Serving</th>` to add `hidden md:table-cell`.
- [x] Edit corresponding `<td>` in row.

## T3 — Hide Reviews column on mobile [Reviews.jsx]
- [x] Edit `<th>Reviews</th>` to add `hidden md:table-cell`.
- [x] Edit corresponding `<td>` in row.

## T4 — Verify build
- [x] `npm run build` exits 0.
- [x] `grep -lE 'hidden md:table-cell' dist/assets/*.js` returns ≥1.

## T5 — Commit feature change
- [x] Stage only `src/pages/Reviews.jsx`.
- [x] Commit message: `feat(reviews): hide 3 secondary columns on mobile comparison table (#117)`
- [x] Co-Authored-By trailer.

## T6 — Commit spec scaffold
- [x] Stage `specs/issue-117-mobile-table-columns/tasks.md` only.
- [x] Commit message: `chore(spec): scaffold ralph spec artifacts for issue #117`
- [x] Co-Authored-By trailer.

## T7 — Stay on branch
- [x] No push.
- [x] No PR.
