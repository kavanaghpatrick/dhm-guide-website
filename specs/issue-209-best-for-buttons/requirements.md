# Requirements — Issue #209

## Acceptance criteria (this branch)

- [ ] The native `<select>` for filtering at `src/pages/Reviews.jsx:606-614`
      is replaced by a horizontal flex of buttons (one per filter).
- [ ] Five filter buttons render in this order: "All Products",
      "Best Overall", "Best Value", "Heavy Drinkers", "Health-Conscious".
- [ ] Active button has visually distinct styling (orange background +
      white text, matching the page's existing orange-500 system).
- [ ] Inactive buttons are styled as outlined / muted.
- [ ] Clicking a filter button sets it as active. Clicking the active
      button again clears the filter back to "All Products" (toggle).
- [ ] Each filter applies a predicate against `product.bestFor`
      (case-insensitive substring match) — see `research.md` for the
      term list per filter.
- [ ] Filter buttons wrap on narrow viewports (`flex-wrap`).
- [ ] Each button has `min-h-[44px]` minimum touch target.
- [ ] Each button click fires `trackEvent('filter_clicked', { filter_value })`
      via existing `trackEvent` (or equivalent) from `../lib/posthog`.
- [ ] No new dependencies introduced.
- [ ] `npm run build` succeeds.
- [ ] Built dist contains the literal labels "Best Overall", "Best Value",
      "Heavy Drinkers" (verified via grep over `dist/assets/*.js`).
- [ ] Two commits with Co-Authored-By trailer:
      1. `feat(reviews): replace select filter with Best-For button row (#209)`
      2. `chore(spec): scaffold ralph spec artifacts for issue #209`
- [ ] No push, no PR.

## In-scope for this branch

1. Edit `src/pages/Reviews.jsx`:
   - Replace `filterOptions` array shape (categories) with a new
     `bestForFilters` array of `{ id, label, match }` where `match` is a
     predicate function over `product.bestFor`.
   - Replace `<select>...</select>` block with a button row.
   - Update the filter logic at line 420-421 to use the predicate from
     the active filter.
   - Add `trackEvent` import from `../lib/posthog`.
   - Wire `onClick` handlers that toggle the active filter and fire
     the PostHog event.
2. Add scaffolded spec artifacts under
   `specs/issue-209-best-for-buttons/`.
3. Verify with `npm run build`, grep dist for the new labels.
4. Two clean commits on local branch.

## Out of scope

- Changes to Compare.jsx or any other page.
- Changes to the sort `<select>` (only the filter is replaced).
- Adding new badges to product data.
- Changing the `category` field — kept for any other consumers.
- Match-count display (issue suggested but not required for this branch).
- Filter animations.
