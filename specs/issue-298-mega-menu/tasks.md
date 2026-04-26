# Tasks: Issue #298

## T1: Add util functions + import cluster-config
- Inside `src/components/layout/Layout.jsx`:
  - Import `clusterConfig from '../../../scripts/cluster-config.json'`
  - Add `kebabToTitle(s)` and `slugToSpokeTitle(slug)` helper functions

## T2: Add desktop dropdown trigger + panel
- Replace `/never-hungover` item rendering in desktop `<nav>` map
- Add inline JSX: `<div onMouseEnter|onMouseLeave|onFocus>` wrapping `<button>` (Topics + ChevronDown) and `<div role="region">` panel
- Panel uses 3-col grid with 6 cluster sections

## T3: Add mobile collapsible "Topics" section
- Replace `/never-hungover` rendering in mobile nav map
- Use `expandedClusterMobile` state, render 6 cluster headers as buttons
- Each button toggles its spokes list

## T4: Build verification
- `npm run build`
- Confirm `dist/index.html` contains "Topics" + cluster links

## T5: Commit + PR + merge
