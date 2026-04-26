# Research: Issue #298 — Mega-menu nav dropdown

## Current state of `src/components/layout/Layout.jsx`
- 309 lines, single component, exports `React.memo(Layout)`
- Uses `useRouter()` hook (`src/hooks/useRouter.js`) — single source of truth for ROUTES
- Nav items derived from `getNavItems()` which filters `ROUTES` by `inNav: true`
- Currently shows 7 nav items (Home, Hangover Relief, Best Supplements, Compare Solutions, The Science, Never Hungover, About) at lines 73-100
- Mobile: hamburger toggle in `useState(isMenuOpen)` at line 11; collapsible nav block lines 139-186
- Styling: Tailwind utilities, framer-motion for active-tab indicator, no separate CSS files
- Header styling: `bg-white/80 backdrop-blur-md border-b border-green-100`, `z-header`, fixed
- Hover state: `text-gray-600 hover:text-green-600`
- `ChevronDown` icon NOT currently used in Layout.jsx

## Cluster config (`scripts/cluster-config.json`)
- 6 clusters: dhm-master, liver-health, health-impact, alcohol-science, hangover-prevention, product-reviews
- Each cluster has: `name` (kebab-case), `pillar` (slug), `spokes[]` (array of slugs)
- Spoke counts: 7, 7, 10, 7, 8, 8 (range 7-10)
- Pillars and spokes are post slugs, NOT URLs — URL pattern is `/never-hungover/{slug}`
- Exception: `dhm-master` pillar slug `dhm-dosage-guide-2025` — also lives at `/never-hungover/dhm-dosage-guide-2025`

## Existing dropdown components
- `src/components/ui/navigation-menu.jsx` — Radix-based, full a11y, exists but unused in Layout
- `src/components/ui/dropdown-menu.jsx`, `menubar.jsx`, `context-menu.jsx` — also Radix-based
- Decision: building inline (lightweight, matches existing style) is simpler than adopting Radix — Layout already uses framer-motion + plain `<a>` tags. Adding Radix changes paradigm.
- However for a11y (keyboard nav, focus trap, escape-to-close), self-built solution needs care

## Post titles source
- `src/newblog/data/metadata/index.json` has all post titles indexed by slug
- 189 entries. Loading entire file into Layout would bloat bundle.
- Alternative: hardcode display titles in cluster-config.json OR derive from slug
- BEST: use `cluster.name` (Title-Case-d) for cluster label + format spoke slugs to titles
- Even simpler: hardcode 6 cluster display labels + use slug-as-label OR fetch lazily

## Mobile pattern
- Existing hamburger uses `useState(isMenuOpen)` toggle
- Mobile nav is full-width vertical list with `flex flex-col space-y-3`
- Mobile mega-menu: nest cluster sections inside the existing mobile menu (collapsible per cluster, or just show all expanded)

## Build verification
- `npm run build` runs Vite build, prerenders many static pages
- Need to verify nav HTML is in prerendered `dist/index.html`

## Implementation approach (simplest path)
1. Import `cluster-config.json` directly (pure data, ~3KB)
2. Import metadata index.json for spoke titles (single fetch at build time, tree-shakeable to titles only? or hardcode mapping)
3. Replace `Never Hungover` nav item (path `/never-hungover`) with a "Topics" dropdown
4. Keep all other nav items unchanged
5. Desktop: hover-to-open mega-panel, 3-column grid showing 6 clusters (2 rows × 3 cols)
6. Each cluster panel shows: cluster header (clickable → pillar URL) + 3-5 spoke links
7. Mobile: nest "Topics" as expandable section inside hamburger menu
8. Use slug-derived titles for spokes (kebab → Title Case) — zero-maintenance
9. Display label for cluster: format `cluster.name` (e.g. `dhm-master` → `DHM Master`, but better hand-tweaked labels)

## Display label decision
Auto-derive from `cluster.name`:
- `dhm-master` → "DHM Master Guide"
- `liver-health` → "Liver Health"
- `health-impact` → "Health Impact"
- `alcohol-science` → "Alcohol Science"
- `hangover-prevention` → "Hangover Prevention"
- `product-reviews` → "Product Reviews"

Simplest = kebab-to-Title-Case via small util. Auto-updates when cluster names change.

## A11y requirements
- Dropdown must open on hover (desktop) AND keyboard focus
- Escape closes dropdown
- Tab moves through links
- `aria-haspopup="true"` and `aria-expanded` on trigger
- Focus visible state on all links

## Risks
- **CLS**: dropdown panel positioned absolutely → no layout shift
- **Mobile screen squeeze**: collapse cluster sections by default OR show all (small lists are OK)
- **Bundle size**: cluster-config.json is ~3KB; metadata index full import would bloat — DON'T import it. Derive titles from slugs.
- **Keyboard a11y**: need explicit focus management or Radix
- **Decision**: Build lightweight self-contained dropdown using existing patterns; add minimal a11y attrs
