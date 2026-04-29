# Tasks — Issue #209

## Implementation tasks

- [x] T1. Read `Reviews.jsx`, capture `bestFor` strings for all 10 products
      (research.md table).
- [x] T2. Decide filter buttons + substring predicates (research.md).
- [ ] T3. Edit `src/pages/Reviews.jsx`:
  - [ ] T3.1. Add `trackEvent` to the existing posthog import.
  - [ ] T3.2. Replace `filterOptions` array with `bestForFilters` array
              (5 entries with `id`, `label`, `match` predicate).
  - [ ] T3.3. Update `filteredProducts` definition to use the active
              filter's `match` predicate.
  - [ ] T3.4. Replace the `<select>` filter block with a `flex-wrap`
              button row, including active/inactive variants and
              `min-h-[44px]` touch target.
  - [ ] T3.5. Add `handleFilterClick(id)` toggle handler that flips back
              to `'all'` when the same non-`'all'` button is clicked
              twice, and fires `trackEvent('filter_clicked',
              { filter_value })`.
- [ ] T4. Run `npm run build`. Must succeed.
- [ ] T5. Verify dist contains the new labels:
      `grep -oE '(Best Overall|Best Value|Heavy Drinkers)' dist/assets/*.js | head`
- [ ] T6. Commit Reviews.jsx as
      `feat(reviews): replace select filter with Best-For button row (#209)`
      with Co-Authored-By trailer.
- [ ] T7. Commit specs/ as
      `chore(spec): scaffold ralph spec artifacts for issue #209`
      with Co-Authored-By trailer.
- [ ] T8. Verify branch state (`git status`, `git log --oneline -3`).
      Stay on branch — no push, no PR.

## Done definition

- Build green.
- Dist grep finds the labels.
- Two commits exist on the local branch with the exact subjects above.
- No other files modified or staged outside this issue's scope.
