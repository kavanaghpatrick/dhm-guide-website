# Design: Issue #298 — Mega-menu nav dropdown

## Approach
Build inline mega-menu in Layout.jsx using existing Tailwind + framer-motion patterns. Avoid Radix primitives (paradigm shift, extra deps already imported but unused in this Layout).

## Data flow
1. Import `clusterConfig` from `/scripts/cluster-config.json` at module level (Vite handles JSON, ~3KB)
2. Derive cluster display label from `cluster.name` via `kebabToTitle()` util
3. Derive spoke link label from slug via `slugToTitle()` util (kebab + remove year + Title Case + clean)
4. Take first 5 spokes per cluster (`cluster.spokes.slice(0, 5)`)
5. Pillar link → `/never-hungover/{cluster.pillar}` (special case: dhm-dosage-guide-2025 lives there too)
6. Spoke link → `/never-hungover/{spoke}`

## Component structure (within Layout.jsx)
- New util: `kebabToTitle(s)` — `dhm-master` → `DHM Master`
- New util: `slugToSpokeTitle(slug)` — strips trailing `-2025`/year, Title-Cases, replaces hyphens with spaces, ensures common acronyms (DHM, NAC, BAC, REM, GI) are uppercase
- Inline `<TopicsDropdown />` component (or kept inline JSX) — desktop dropdown panel
- Mobile: nested collapsible block inside existing mobile nav

## Replacement strategy
- Filter out `/never-hungover` route from `navItems` rendering
- Insert new "Topics" dropdown trigger in its place (same loop position)
- The dropdown's "Topics" label → links to `/never-hungover` (preserves direct hub access)

## Desktop dropdown UI
- Trigger: `<button>` styled like nav link, with ChevronDown icon
- On hover OR focus → open panel
- Panel: absolute positioned below trigger, `mt-2`, full-width container, max-w-6xl, white bg, shadow-xl, rounded-lg, p-6
- Grid: `grid-cols-3 gap-6` (2 rows × 3 cols)
- Each cluster section:
  - `<a>` linked to pillar slug — bold cluster name, hover highlight, with arrow
  - `<ul>` of 5 spoke links underneath, smaller text, gray hover
- Close on: mouse leave, escape key, link click
- z-index above page content (`z-50`)

## Mobile UI
- Inside existing mobile nav, replace the "Never Hungover" link with collapsible "Topics" header
- Tap header → expand/collapse (arrow flips)
- Expanded: list 6 clusters, each with cluster name (linked to pillar) + spokes underneath
- Use `useState` to track which cluster section is expanded (null or cluster name)

## A11y
- Trigger: `aria-haspopup="true"`, `aria-expanded={isOpen}`, `aria-controls="topics-panel"`
- Panel: `role="region"`, `id="topics-panel"`
- Escape closes
- Focus styles preserved on all links
- Hover-only is bad — also open on focus (`onFocus`) and click (toggle)
- Keyboard: Tab moves to trigger, Enter opens, Tab through links, Escape closes

## State
- `isTopicsOpen` (bool, desktop)
- `expandedClusterMobile` (string|null, mobile)
- Close logic on outside click / escape

## Auto-derivation guarantee
Adding/modifying a cluster in `cluster-config.json` automatically:
- Adds new section to dropdown
- Updates pillar link
- Updates spoke list
- No code changes required

## Things NOT doing (cut for simplicity)
- Per-cluster icons — adds 6 more imports, marginal value
- Visit counts / "popular" badges — no data source
- "View all in this topic" link — pillar IS the view-all
- Animated entrance per cluster — single fade is enough
- Persisting open state in URL — overkill
