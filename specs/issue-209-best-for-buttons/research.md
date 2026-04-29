# Research — Issue #209

## Issue summary

Replace the existing `<select>` filter at `src/pages/Reviews.jsx:606-614`
with a horizontal "Best For" button row that lets users one-click filter
products by use-case.

Issue link: kavanaghpatrick/dhm-guide-website#209

## Existing state

- `src/pages/Reviews.jsx` defines `topProducts` (10 items) at line 103.
  Each product has both a `category` field (`premium`, `budget`,
  `comprehensive`, `convenience`) and a free-form `bestFor` string.
- `filterBy` state at line 35 is currently a category string and the
  filter predicate at line 420-421 compares `product.category === filterBy`.
- `filterOptions` at line 405-411 uses category values, rendered into a
  native `<select>` at line 606-614.
- `Filter` icon from `lucide-react` is already imported (line 18).
- `trackElementClick` from `../lib/posthog` is already imported (line 29)
  and used 3x on the page.
- Tailwind v4, no CSS modules. Existing button conventions on this page
  use `rounded-lg`, `min-h-[44px]` or `min-h-[48px]`, and the orange
  gradient family (`from-orange-500 to-orange-600`).

## bestFor strings (raw)

| Product | bestFor | category |
|---------|---------|----------|
| No Days Wasted | "Weekend warriors who want the best" | premium |
| Double Wood | "Value hunters who want pure DHM" | budget |
| Toniiq Ease | "Health-conscious drinkers who protect their liver" | comprehensive |
| NusaPure | "Bulk buyers who want maximum value" | budget |
| Cheers Restore | "Social drinkers who want a trusted brand" | premium |
| Flyby Recovery | "Party people who need serious protection" | comprehensive |
| Good Morning | "Travelers needing portable protection" | convenience |
| DHM1000 | "High-performers who want max potency" | premium |
| Fuller Health | "Trendsetters who appreciate celebrity picks" | premium |
| DHM Depot | "Research-driven buyers who trust reviews" | premium |

## Mapping decision

Issue body suggests four buckets — "Best Overall", "Best Value",
"Heavy Drinkers", "Budget Pick". The free-form `bestFor` strings do not
cluster cleanly into those four labels, so we use case-insensitive
substring matching on `bestFor` (per ultrathink scope note "case-insensitive
substring match is fine if labels don't perfectly align").

Filter buttons → predicate (matches if `bestFor` substring contains any term):

- **All Products** → no predicate (clears filter)
- **Best Overall** → `bestFor` contains `"best"` or `"trusted"`
  → No Days Wasted (Weekend warriors who want the **best**),
    Cheers (Social drinkers who want a **trusted** brand)
- **Best Value** → `bestFor` contains `"value"`
  → Double Wood (**Value** hunters), NusaPure (Bulk buyers who want
    maximum **value**)
- **Heavy Drinkers** → `bestFor` contains `"party"` or `"weekend"` or
  `"high-performer"`
  → No Days Wasted (**Weekend** warriors), Flyby (**Party** people),
    DHM1000 (**High-performer**s)
- **Health-Conscious** → `bestFor` contains `"health"` or `"liver"`
  → Toniiq (**Health**-conscious drinkers who protect their **liver**)

This gives every button at least one match (no empty states) and
respects what the data actually says without inventing badges.

## PostHog event

Per spec: fire `filter_clicked` event on each click with payload
`{ filter_value: '<button id>' }`. Use existing `trackEvent` import from
`src/lib/posthog.js` rather than `trackElementClick`, because the spec
asks for a custom event name not the generic `element_clicked`.

## Out of scope

- No schema changes to product data.
- No changes to Compare.jsx or any other page.
- No changes to the sort `<select>` (only the filter `<select>` is replaced).
- No animations, loading states, or scroll-position management beyond
  what React already does.
- No multi-select.
