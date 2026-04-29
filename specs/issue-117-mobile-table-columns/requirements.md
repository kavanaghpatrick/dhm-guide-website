# Requirements — Issue #117

## Acceptance criteria (this branch)

- [ ] `<th>Reviews</th>` has class `hidden md:table-cell` in Reviews.jsx.
- [ ] `<th>Per Serving</th>` has class `hidden md:table-cell` in Reviews.jsx.
- [ ] `<th>DHM</th>` has class `hidden md:table-cell` in Reviews.jsx.
- [ ] Each corresponding `<td>` (Reviews, Per Serving, DHM) inside the
      `topProducts.map()` row also has `hidden md:table-cell`.
- [ ] Mobile column count drops from 8 → 5 (Brand, Price, Rating, Score, Action).
- [ ] Desktop (≥`md:`, 768px) still shows all 8 columns.
- [ ] No JSX structure changes — only Tailwind class additions to existing
      `<th>` and `<td>` className attributes.
- [ ] Compare.jsx NOT modified (out of scope; different table structure
      already has its own mobile layout via `hidden lg:block`).
- [ ] No card-layout fallback added (directive: skip for v1).
- [ ] `npm run build` succeeds.
- [ ] At least one file under `dist/assets/*.js` contains the literal
      string `hidden md:table-cell`.
- [ ] Two commits with Co-Authored-By trailer:
      1. `feat(reviews): hide 3 secondary columns on mobile comparison table (#117)`
      2. `chore(spec): scaffold ralph spec artifacts for issue #117`

## In-scope for this branch

1. Add `hidden md:table-cell` to 6 cells in
   `src/pages/Reviews.jsx` (3 `<th>` headers + 3 `<td>` body cells).
2. Verify build, verify class string present in dist bundle.
3. Two clean commits, branch local only (no push, no PR).

## Explicitly out of scope

- Compare.jsx — different table structure, already responsive via
  `hidden lg:block` desktop wrapper.
- Mobile card-layout alternative — PRD lists this as "(optional)";
  user directive: skip for v1.
- "View details" expand toggle for hidden info — PRD acceptance
  criterion but adds complexity; defer until data shows it's needed.
- Renumbering breakpoints (e.g. `sm:` vs `md:`) — `md:` matches PRD
  example and Tailwind defaults.
- Any styling changes (padding, alignment, colors) on the kept columns.

## Definition of done

After `npm run build` exits 0:
- `grep -lE 'hidden md:table-cell' dist/assets/*.js` returns ≥1 file.
- Reviews.jsx still parses, table still renders, all 5 mobile columns
  display the correct data, all 8 desktop columns display the correct data.
- Branch `cleanup/issue-117-mobile-table-columns` has exactly 2 new commits
  on top of `main`, both with the Co-Authored-By trailer.
