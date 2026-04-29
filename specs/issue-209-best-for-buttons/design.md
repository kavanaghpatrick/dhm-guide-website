# Design — Issue #209

## Approach

Pure inline change inside `src/pages/Reviews.jsx`. No new files, no new
components, no new dependencies.

## Data shape

Replace existing `filterOptions` (category-based) with:

```jsx
const bestForFilters = [
  { id: 'all',     label: 'All Products',     match: null },
  { id: 'overall', label: 'Best Overall',     match: (p) => /\b(best|trusted)\b/i.test(p.bestFor) },
  { id: 'value',   label: 'Best Value',       match: (p) => /value/i.test(p.bestFor) },
  { id: 'heavy',   label: 'Heavy Drinkers',   match: (p) => /(party|weekend|high-performer)/i.test(p.bestFor) },
  { id: 'health',  label: 'Health-Conscious', match: (p) => /(health|liver)/i.test(p.bestFor) },
]
```

`filterBy` state default stays `'all'`.

Filter predicate becomes:

```jsx
const activeFilter = bestForFilters.find(f => f.id === filterBy)
const filteredProducts = activeFilter?.match
  ? topProducts.filter(activeFilter.match)
  : topProducts
```

## Markup

Replace the existing block:

```jsx
<select value={filterBy} ...>
  {filterOptions.map(...)}
</select>
```

with:

```jsx
<div className="flex flex-wrap gap-2">
  {bestForFilters.map(f => {
    const active = filterBy === f.id
    return (
      <button
        key={f.id}
        type="button"
        onClick={() => handleFilterClick(f.id)}
        aria-pressed={active}
        className={cn(
          'min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-orange-500 text-white border border-orange-500 shadow-sm'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        )}
      >
        {f.label}
      </button>
    )
  })}
</div>
```

`cn` from `@/lib/utils` is the project's standard class joiner (already
used by Button component). If a stricter no-import policy applies, use
template literal joining instead.

## Toggle behavior

```jsx
const handleFilterClick = (id) => {
  // Same button clicked twice → clear back to "all"
  const next = (filterBy === id && id !== 'all') ? 'all' : id
  setFilterBy(next)
  trackEvent('filter_clicked', { filter_value: next })
}
```

## Tracking

`trackEvent` already exists in `src/lib/posthog.js` (line 109). Add it to
the existing import line at the top of `Reviews.jsx`:

```jsx
import { trackElementClick, trackEvent } from '../lib/posthog'
```

Event: `filter_clicked`. Payload: `{ filter_value: '<id>' }` where `<id>`
is one of `all | overall | value | heavy | health`. The standard
`page_path`, `timestamp` etc. are added automatically by `trackEvent`.

## Risks / considerations

- The native `<select>` was wider than a button row. The wrapping flex
  container handles narrow viewports (`flex-wrap` + `gap-2`).
- If a future product is added whose `bestFor` matches none of the
  predicates, it only appears under "All Products". Acceptable.
- The existing `category` field is left in place. Other code (if any)
  that reads `product.category` is unaffected.
