# Research — Issue #117 (Mobile comparison table columns)

## Problem (from issue body)

PRD: comparison table requires horizontal scrolling on mobile (57% of traffic).
Mobile UX research recommends 3-4 columns max. Current table has 8 columns
shown identically at every breakpoint. CTA may be hidden behind scroll on
narrow viewports (≈360px).

## Where the table actually lives

**`src/pages/Reviews.jsx`, lines 653-756** — Quick Comparison Table section.

Header row (line 656-665) has 8 `<th>` columns:
1. Brand (left-aligned, primary identifier)
2. DHM (center, mg amount)
3. Price (center, USD)
4. Per Serving (center, USD/dose — derived metric)
5. Rating (center, star + numeric)
6. Reviews (center, count — secondary social proof)
7. Score (center, X/10 editorial score)
8. Action (center, affiliate CTA — must always be visible)

Body uses literal `<td>` per row (NOT a `.map()` over column defs), one row
per product via `topProducts.map((product, index) => ...)`. Eight `<td>`
elements per row, structurally parallel to the eight `<th>`.

The wrapper `<div>` at line 653 has `overflow-x-auto`, so the current
behaviour on narrow screens is "scroll horizontally" rather than "wrap" or
"break layout". That's the friction the PRD targets: scroll hides columns
including the CTA.

## Compare.jsx — out of scope

Compare.jsx (`src/pages/Compare.jsx:548`) ALSO has a comparison table, but
its structure is fundamentally different:

- Products are COLUMNS (one `<th>` per product), comparison factors are ROWS.
- The desktop table wrapper has `hidden lg:block` (line 546) — so this
  table is already hidden below `lg`. A separate mobile/tablet card layout
  picks up below `lg:1024px`.

Compare.jsx is therefore NOT the same 8-column table and does not have the
mobile horizontal-scroll problem Reviews.jsx has. **Out of scope for this
issue.** PR #278's "front-load on both /reviews and /compare" referred to
table placement, not column visibility — Compare.jsx already has a
separate mobile layout.

## Column priority decision (mobile, 4 columns max)

The PRD section "Column Priority (Mobile)" lists Product/Score/Price/Action
as always-visible. Mapping to the actual Reviews.jsx columns (PRD column
names don't match exactly — Reviews.jsx has no "Purity" or "Servings"):

**Keep visible at all breakpoints (4 columns):**
- Brand (= "Product Name")
- Price
- Score (the X/10 editorial score — the most visible "rating-like" metric)
- Action (always-visible CTA per PRD)

**Hide on mobile, restore at `md:` (3 columns):**
- Reviews — secondary social proof, redundant with Rating
- Per Serving — derived metric, redundant with Price for at-a-glance scan
- DHM — important for the technically-curious user but not for first-pass
  scan; full detail is in the per-product review cards below the table

**Note on Rating vs. Score**: Reviews.jsx has BOTH a 5-star Rating column
AND a /10 editorial Score column. Per the user's ultrathink directive,
Score is the one we keep on mobile. Rating is also kept (still 4 columns
visible: Brand/Price/Rating/Score/Action would be 5 — wait, recount).

**Recount of "always visible" columns:**
The user's directive specifies hiding `Reviews`, `Per Serving`, `DHM`.
That leaves visible on mobile: Brand, Price, Rating, Score, Action = **5 columns**.

This is one over the PRD's "4 max" target but matches the user's explicit
ultrathink directive. The user's reasoning is sound: Rating and Score are
both single-glyph cells (a star+number, an X/10) — they're narrow enough
that 5 such cells fit on a 360px viewport without scroll, whereas the 3
hidden ones (Reviews count "1,234", Per Serving "$0.83", DHM "300mg") are
the wider ones that force horizontal scroll. Honoring directive over PRD.

## Why `hidden md:table-cell` and not `hidden md:block`

`<th>` and `<td>` need `display: table-cell` (their default) to participate
in the table's column-width algorithm. Tailwind's `hidden` sets
`display: none`, which removes them. To restore at `md:`, the modifier
must explicitly set `display: table-cell`, NOT `block`. Using `block` would
break the table layout. This is the standard idiom and is what the PRD's
own code sample uses.

## Approach

Three Edit calls — one per hidden column. Each Edit replaces `<th>` AND
its corresponding `<td>` (per row, one row pattern, applied within the
single `topProducts.map()` block). Total = 6 class changes (3 `<th>` + 3
`<td>` cells per row, but `<td>` only appears once in source — inside the
.map — so the actual file delta is 3 `<th>` + 3 `<td>` = 6 lines edited).

Skip the card-layout fallback per directive. Placement-first plus column
hiding addresses the friction; the card layout would be ~50 lines of
duplicate JSX for marginal gain over what the simplified table provides.
