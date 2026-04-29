# Design — Issue #117

## File: `src/pages/Reviews.jsx`

### Header row (line 656-665)

Current:
```jsx
<tr className="bg-green-700 text-white">
  <th className="py-3 px-4 text-left font-semibold">Brand</th>
  <th className="py-3 px-4 text-center font-semibold">DHM</th>
  <th className="py-3 px-4 text-center font-semibold">Price</th>
  <th className="py-3 px-4 text-center font-semibold">Per Serving</th>
  <th className="py-3 px-4 text-center font-semibold">Rating</th>
  <th className="py-3 px-4 text-center font-semibold">Reviews</th>
  <th className="py-3 px-4 text-center font-semibold">Score</th>
  <th className="py-3 px-4 text-center font-semibold">Action</th>
</tr>
```

Three `<th>` elements gain `hidden md:table-cell`:
- DHM (line 658)
- Per Serving (line 660)
- Reviews (line 662)

### Body row (within `topProducts.map`, lines 668-754)

Three `<td>` elements gain `hidden md:table-cell` to match:
- DHM cell (line 688): `<td className="py-3 px-4 text-center font-medium text-green-700">`
- Per Serving cell (line 701): `<td className="py-3 px-4 text-center">`
- Reviews cell (line 726): `<td className="py-3 px-4 text-center text-gray-700">`

## Class concatenation pattern

Tailwind class strings are space-separated; new classes are appended. The
order convention in this file is: layout/spacing first, then color, then
modifiers. `hidden md:table-cell` is a display-mode pair and is appended
to the END of the existing class string for clarity.

Example transformation:
```diff
- <th className="py-3 px-4 text-center font-semibold">DHM</th>
+ <th className="py-3 px-4 text-center font-semibold hidden md:table-cell">DHM</th>
```

## Why `md:` (768px) and not `sm:` (640px)

PRD example uses `md:`. Tailwind default `md:` is 768px which corresponds
to portrait tablet and up — landscape phones (iPhone Pro Max landscape ~932px)
already get the full table. At 640px-767px (sm-to-md range, e.g. Galaxy Fold
unfolded, small tablets in portrait) we still hide the 3 columns; this is
defensive — those viewports are still tight. Acceptable.

## What stays put

- Wrapper `<div className="overflow-x-auto ...">` at line 653 — kept as
  belt-and-braces. Even with 5 columns, edge cases (very wide content,
  font-scaling accessibility settings) might still produce overflow. The
  `overflow-x-auto` is harmless when content fits; it only kicks in when
  it doesn't.
- All affiliate-link wrappers, data attributes, hover states — untouched.
- Row striping (`bg-white` / `bg-gray-50`) — works regardless of column
  count.
- The "Scroll down for detailed reviews" footer copy — still relevant
  since per-product details are below.

## Out-of-scope: Compare.jsx

Compare.jsx (`src/pages/Compare.jsx:546`) wraps its desktop table in
`<div className="hidden lg:block">` and renders a separate card-based
mobile layout at smaller breakpoints. It already implements the
"reduce-on-mobile" pattern via different markup, not via class hiding.
No change needed.

## Verification

```bash
npm run build
grep -lE 'hidden md:table-cell' dist/assets/*.js
```

Expected: at least one matching file. (Tailwind class names appear verbatim
in compiled JSX bundles.)
