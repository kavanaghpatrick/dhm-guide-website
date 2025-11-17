# Routing Architecture: Before vs After

## CURRENT ARCHITECTURE (Before Consolidation)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER NAVIGATION                        │
│  (Back/Forward buttons, address bar, direct URL access)         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  popstate event triggered           │
        │  window.location.pathname changed   │
        └────┬────────────────────────────────┘
             │
             ├────────────────────┬────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐
        │    App.jsx     │  │  Layout.jsx     │  │ Other Routes │
        │                │  │                 │  │ (Footer, etc)│
        ├────────────────┤  ├─────────────────┤  └──────────────┘
        │ currentPath    │  │ currentPath     │
        │ state (26-33)  │  │ state (10-15)   │
        │                │  │                 │
        │ popstate       │  │ popstate        │
        │ listener       │  │ listener        │
        │ (35-44)        │  │ (21-28)         │
        │                │  │                 │
        │ Switch         │  │ navItems array  │
        │ statement      │  │ (hardcoded,     │
        │ (53-72)        │  │ lines 31-39)    │
        │ - /guide       │  │ - /guide        │
        │ - /reviews     │  │ - /reviews      │
        │ - /research    │  │ - /research     │
        │ - /about       │  │ - /about        │
        │ - /compare     │  │ - /compare      │
        │ - /never-      │  │ - /never-       │
        │   hungover     │  │   hungover      │
        │                │  │                 │
        │ Renders:       │  │ isActive()      │
        │ Page component │  │ callback        │
        │                │  │ (41-44)         │
        │                │  │                 │
        │                │  │ handleNavigation│
        │                │  │ (46-48)         │
        │                │  │ - Uses          │
        │                │  │   navigateWith  │
        │                │  │   ScrollToTop() │
        │                │  │                 │
        │                │  │ Footer links    │
        │                │  │ (hardcoded,     │
        │                │  │ lines 194-197)  │
        │                │  │ - /research     │
        │                │  │ - /reviews      │
        │                │  │ - /dhm-dosage   │
        │                │  │ - /about        │
        └────────────────┘  └─────────────────┘
             │                    │
             └────────┬───────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │  Page Content Rendered           │
        └─────────────────────────────────┘

PROBLEMS:
✗ Routes defined in TWO separate files
✗ State management duplicated
✗ Event listeners duplicated
✗ Trailing slash normalization inconsistent
✗ Adding a route requires 3+ edits
✗ Risk of divergence between files
✗ No single source of truth
```

---

## CONSOLIDATED ARCHITECTURE (After useRouter Hook)

```
┌─────────────────────────────────────────────────────────────────┐
│                    src/hooks/useRouter.js                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  ROUTES = [                                                ││
│  │    { path: '/', name: 'Home', inNav: true },             ││
│  │    { path: '/guide', name: 'Hangover Relief', ... },     ││
│  │    { path: '/reviews', name: 'Best Supplements', ... },  ││
│  │    { path: '/research', name: 'The Science', ... },      ││
│  │    { path: '/about', name: 'About', ... },               ││
│  │    { path: '/compare', name: 'Compare', ... },           ││
│  │    { path: '/never-hungover', name: 'Never Hungover', ...││
│  │    { path: '/dhm-dosage-calculator', inFooter: true },   ││
│  │    { path: '/never-hungover/:slug', isDynamic: true },   ││
│  │  ]                                                        ││
│  │                                                            ││
│  │  useRouter() hook {                                        ││
│  │    • currentPath state (normalized)                        ││
│  │    • popstate listener (single instance)                  ││
│  │    • navigate(path) function                              ││
│  │    • isActive(path) logic                                 ││
│  │    • getNavItems() - returns inNav: true routes           ││
│  │    • getFooterItems() - returns inFooter: true routes     ││
│  │    • getRouteByPath(path) - matches static/dynamic routes ││
│  │  }                                                         ││
│  └────────────────────────────────────────────────────────────┘│
└────────┬─────────────────────────────────┬─────────────────────┘
         │                                 │
         ▼                                 ▼
    ┌────────────────┐             ┌──────────────────┐
    │   App.jsx      │             │  Layout.jsx      │
    ├────────────────┤             ├──────────────────┤
    │ Uses:          │             │ Uses:            │
    │ const {        │             │ const {          │
    │   currentPath, │             │   currentPath,   │
    │   getRoute     │             │   navigate,      │
    │   ByPath       │             │   isActive,      │
    │ } = useRouter()│             │   getNavItems,   │
    │                │             │   getFooterItems │
    │ renderPage():  │             │ } = useRouter()  │
    │   route =      │             │                  │
    │   getRouteBy   │             │ navItems =       │
    │   Path(...)    │             │ getNavItems()    │
    │   render       │             │                  │
    │   component    │             │ footerItems =    │
    │                │             │ getFooterItems() │
    │                │             │                  │
    │                │             │ handleNavigation:│
    │                │             │   navigate(path) │
    │                │             │                  │
    │                │             │ isActive checks: │
    │                │             │   isActive(path) │
    └────────────────┘             └──────────────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────┐
        │  Page Content Rendered           │
        └─────────────────────────────────┘

BENEFITS:
✓ Routes defined in ONE place (ROUTES constant)
✓ State management centralized
✓ Single popstate listener
✓ Consistent trailing slash normalization
✓ Adding a route = ONE edit (ROUTES) + one component mapping
✓ Perfect alignment between files
✓ Single source of truth for all routes
✓ Easy to extend (sitemap, meta tags, etc.)
```

---

## DATA FLOW COMPARISON

### Before Consolidation

```
User clicks nav link
         │
         ▼
handleNavigation() [Layout.jsx:46]
         │
         ├─ navigateWithScrollToTop() ──┐
         │                               │
         │                    window.history.pushState()
         │                    window.dispatchEvent(popstate)
         │                               │
         ├───────────────────────────────┘
         │
         ├──────────────────┬─────────────────┐
         │                  │                 │
         ▼ [App.jsx]        ▼ [Layout.jsx]   ▼ [Footer]
     popstate            popstate            (no listener)
     handler             handler
      (35-44)            (21-28)
         │                  │
         ▼                  ▼
  setCurrentPath      setCurrentPath
   (App state)        (Layout state)
         │                  │
         │                  ▼
         │              Re-render Layout
         │              - isActive() checks
         │              - Nav highlighting
         │              - Scroll to top
         │
         ▼
    renderPage()
    switch(currentPath)
    Render new component
         │
         ▼
    Re-render App

PROBLEMS:
- Two separate state updates (might be out of sync)
- Two separate re-renders
- Footer links don't update (no listener)
```

### After Consolidation

```
User clicks nav link
         │
         ▼
handleNavigation() [Layout.jsx - uses hook]
         │
         ├─ navigate(path) [from useRouter]
         │       │
         │       ├─ navigateWithScrollToTop() ──┐
         │       │                               │
         │       │                    window.history.pushState()
         │       │                    window.dispatchEvent(popstate)
         │       │                               │
         │       └───────────────────────────────┘
         │
         └──────────────────┬──────────────────┐
                            │                  │
                      [useRouter.js]          (Other hooks)
                      Single popstate
                      listener (21-28)
                            │
                            ▼
                      setCurrentPath
                      (Hook state)
                            │
                            ├─────────────────┬────────────────┐
                            │                 │                │
                      [App.jsx]        [Layout.jsx]      [Other components]
                      getRouteByPath()   getNavItems()     can use hook
                            │             isActive()
                            │             navigate()
                            ▼             getFooterItems()
                       renderPage()            │
                       Render component       ▼
                            │            Re-render Layout
                            │            - Nav highlighting
                            │            - Scroll to top
                            │
                            ├────────────────┬─────────────────┐
                            │                │                 │
                            ▼                ▼                 ▼
                        New page         Responsive nav   Footer links
                                        Responsive       (consistent)

BENEFITS:
- Single state update (guaranteed sync)
- Efficient re-renders (only affected components)
- Footer and all components use same source
- Easier to debug (one place to check routing logic)
```

---

## Route Registry: Before vs After

### Before (Scattered)

```
Routes are DEFINED in:
├── App.jsx (switch statement, lines 53-72)
├── Layout.jsx (navItems array, lines 31-39)
├── Layout.jsx (footer links, lines 194-197)
└── Many other components might hardcode paths

Routes are USED by:
├── App.jsx (renderPage switch)
├── Layout.jsx (navItems mapping)
├── Layout.jsx (footer mapping)
├── Layout.jsx (handleNavigation onClick handlers)
├── Maybe other components?

Result: 30+ path references spread across 3+ files
Consistency risk: HIGH
Maintenance cost: HIGH
```

### After (Centralized)

```
Routes are DEFINED in:
└── src/hooks/useRouter.js (ROUTES constant, lines 1-20)

Routes are USED by:
├── App.jsx (via getRouteByPath)
├── Layout.jsx (via getNavItems, getFooterItems)
├── sitemap.js (via ROUTES export)
├── meta-tags.js (via ROUTES export)
├── Any future component (via useRouter hook)

Result: Single definition, reused everywhere
Consistency risk: ZERO
Maintenance cost: MINIMAL
```

---

## Migration Impact Summary

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| Files with route definitions | 3 | 1 | -67% |
| Path definitions | ~20 | 1 constant | Centralized |
| popstate listeners | 2 (App + Layout) | 1 (in hook) | Simplified |
| State duplication | Yes (currentPath in 2 places) | No | Eliminated |
| Adding new route | 3+ edits | 2 edits | Simpler |
| Active state logic | Different per file | Same everywhere | Consistent |
| SSR impact | None | None | Safe |
| Performance impact | None | Potentially better | Single listener |
| New dependencies | None | None | Zero |

---

## Code Volume Comparison

### Before Consolidation

**App.jsx** (87 lines total)
```javascript
const [currentPath, setCurrentPath] = useState(...)  // 8 lines
useEffect(() => { /* popstate handler */ })         // 10 lines
const renderPage = () => {                           // 28 lines
  if (currentPath.startsWith('/never-hungover/'))
  switch (currentPath) {
    case '/guide': ...
    case '/reviews': ...
    // 8 more cases
  }
}
// Total routing code: 46 lines
```

**Layout.jsx** (207 lines total)
```javascript
const [currentPath, setCurrentPath] = useState(...)  // 6 lines
useEffect(() => { /* popstate handler */ })         // 8 lines
const navItems = useMemo(() => [...], [])           // 9 lines (7 items hardcoded)
const isActive = useCallback((href) => {...})       // 5 lines
const handleNavigation = useCallback(...)           // 4 lines
// Footer links: 4 hardcoded links
// Total routing code: 36 lines
```

**Total Before**: ~82 lines of routing code spread across 2 files

### After Consolidation

**useRouter.js** (New file)
```javascript
const ROUTES = [...]  // ~20 lines
export function useRouter() {
  // All hooks and logic: ~80 lines
}
// Total: ~100 lines (but includes all routing logic)
```

**App.jsx** (Simplified)
```javascript
const { currentPath, getRouteByPath } = useRouter()  // 1 line
const renderPage = () => {
  const route = getRouteByPath(currentPath)          // 6 lines total
  if (!route) return <Home />
  return <Component />
}
// Total routing code: ~7 lines (from 46)
```

**Layout.jsx** (Simplified)
```javascript
const { currentPath, navigate, isActive, getNavItems, getFooterItems } = useRouter()  // 1 line
const navItems = useMemo(() => getNavItems(), [getNavItems])  // 1 line
const footerItems = useMemo(() => getFooterItems(), [getFooterItems])  // 1 line
const handleNavigation = useCallback((href) => navigate(href, ...), [navigate])  // 1 line
// No more hardcoded routes in Footer
// Total routing code: ~4 lines (from 36)
```

**Total After**: ~100 lines centralized + ~11 lines in components = ~111 lines (but cleaner, more maintainable)

The code isn't shorter overall, but it's:
- Centralized (easier to find)
- DRY (no duplication)
- Consistent (single source of truth)
- Extensible (easy to reuse ROUTES elsewhere)

---

## Summary

The consolidation transforms routing from a scattered, duplicated concern into a clean, single-source-of-truth hook that can be used throughout the application. This is a refactoring that improves maintainability without changing behavior.

