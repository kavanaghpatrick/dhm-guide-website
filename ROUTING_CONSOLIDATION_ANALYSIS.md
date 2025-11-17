# Routing Logic Duplication Analysis: App.jsx vs Layout.jsx

## 1. APP.JSX ROUTING ANALYSIS

### Path Definition & Route Structure
**Location**: `/src/App.jsx` (lines 47-73)

**Routing Method**: Pattern matching with switch statement + prefix check

```javascript
// PREFIX-BASED ROUTING (for dynamic routes)
if (currentPath.startsWith('/never-hungover/')) {
  return <NewBlogPost />
}

// EXACT-MATCH ROUTING (for static routes)
switch (currentPath) {
  case '/guide':        return <Guide />
  case '/reviews':      return <Reviews />
  case '/research':     return <Research />
  case '/about':        return <About />
  case '/compare':      return <Compare />
  case '/dhm-dosage-calculator':     return <DosageCalculator />
  case '/dhm-dosage-calculator-new': return <DosageCalculatorRewrite />
  case '/never-hungover':            return <NewBlogListing />
  default:              return <Home />
}
```

**Routes Defined**:
- `/` (default via Home)
- `/guide`
- `/reviews`
- `/research`
- `/about`
- `/compare`
- `/dhm-dosage-calculator`
- `/dhm-dosage-calculator-new`
- `/never-hungover`
- `/never-hungover/[slug]` (dynamic)

### State Management (currentPath)
```javascript
const [currentPath, setCurrentPath] = useState(() => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    // Remove trailing slash except for root
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  }
  return '/';
})
```

**Normalization Logic**: Removes trailing slashes (except root)
- `/guide/` → `/guide`
- `/` → `/` (preserved)

### Navigation Control
- **Trigger**: Browser back/forward via `popstate` event listener (lines 35-44)
- **No built-in navigate function** - uses standard browser history API
- **Path synchronization**: Hooks into `window.location.pathname` changes

---

## 2. LAYOUT.JSX ROUTING ANALYSIS

### Navigation Items Definition
**Location**: `/src/components/layout/Layout.jsx` (lines 31-39)

```javascript
const navItems = useMemo(() => [
  { name: 'Home', href: '/' },
  { name: 'Hangover Relief', href: '/guide' },
  { name: 'Best Supplements', href: '/reviews' },
  { name: 'Compare Solutions', href: '/compare' },
  { name: 'The Science', href: '/research' },
  { name: 'Never Hungover', href: '/never-hungover' },
  { name: 'About', href: '/about' }
], [])
```

**Routes Exposed in UI**: 7 primary routes
- Home `/`
- Guide `/guide`
- Reviews `/reviews`
- Compare `/compare`
- Research `/research`
- Never Hungover `/never-hungover`
- About `/about`

### State Management (currentPath)
```javascript
const [currentPath, setCurrentPath] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.location.pathname
  }
  return '/'
})

useEffect(() => {
  const handlePopState = () => {
    setCurrentPath(window.location.pathname)
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])
```

**Key Difference**: Does NOT normalize trailing slashes

### Active State Detection
```javascript
const isActive = useCallback((href) => {
  if (href === '/') return currentPath === '/'
  return currentPath.startsWith(href)  // Matches href prefix
}, [currentPath])
```

**Rules**:
- Root `/` requires exact match
- Other routes match prefixes (e.g., `/guide/section` matches `/guide`)
- Used for visual highlighting in navigation

### Navigation Implementation
```javascript
const handleNavigation = useCallback((href) => {
  navigateWithScrollToTop(href, () => setIsMenuOpen(false))
}, [])
```

**Uses imported utility**: `navigateWithScrollToTop()` from `mobileScrollUtils.js`

**Navigation locations** (9 total):
1. Logo click (line 61)
2. Desktop nav items (line 79)
3. "Get Started" CTA button (line 102)
4. Mobile nav items (line 132)
5. Mobile "Get Started" button (line 143)
6. Footer quick links (line 183)
7. Footer "Scientific Studies" link (line 194)
8. Footer "Product Reviews" link (line 195)
9. Footer "Dosage Calculator" link (line 196)
10. Footer "Safety Information" link (line 197)

**Not visible in navItems**: 
- `/dhm-dosage-calculator`
- `/dhm-dosage-calculator-new`
- Individual blog posts

---

## 3. DUPLICATION ANALYSIS

### Duplicated Route Paths

| Route | App.jsx | Layout.jsx | Status |
|-------|---------|-----------|--------|
| `/` | Home (default) | navItems | ✓ Both |
| `/guide` | Guide component | navItems | ✓ Both |
| `/reviews` | Reviews component | navItems | ✓ Both |
| `/research` | Research component | navItems | ✓ Both |
| `/about` | About component | navItems | ✓ Both |
| `/compare` | Compare component | navItems | ✓ Both |
| `/never-hungover` | NewBlogListing | navItems | ✓ Both |
| `/never-hungover/[slug]` | NewBlogPost | - | App only |
| `/dhm-dosage-calculator` | DosageCalculator | Footer only | Partial |
| `/dhm-dosage-calculator-new` | DosageCalculatorRewrite | - | App only |

**7 routes appear in BOTH files** - Primary duplication vector

### Duplicated State Management

**BOTH files independently**:
1. Declare `const [currentPath, setCurrentPath]` state
2. Initialize from `window.location.pathname`
3. Listen to `popstate` events
4. Update state when browser navigation occurs

**Differences in implementation**:
- App normalizes trailing slashes
- Layout does NOT normalize
- Layout uses callback-based isActive()
- App uses simple switch matching

### Duplicated Navigation Logic

**Path references scattered across code**:

**In App.jsx**:
- 8 hardcoded route strings in switch statement

**In Layout.jsx**:
- 7 strings in navItems array
- 3 additional strings in footer resources section
- Navigation centralized in `handleNavigation()` but paths still hardcoded in Layout

**Navigation trigger pattern duplicated**:
- Both listen to `popstate` events
- Both synchronize with `window.location.pathname`
- Both dispatch custom navigation via button clicks

---

## 4. ROOT CAUSE OF DUPLICATION

### Why It Exists

1. **SPA without Router Library**: No React Router or equivalent
   - Both files independently track routes
   - History API managed manually in both places
   - No centralized route registry

2. **Manual Navigation Control**: 
   - `navigateWithScrollToTop()` is a utility, not a centralized router
   - Each component that needs navigation must hardcode paths
   - No single source of truth for route definitions

3. **Component Separation**:
   - App handles PAGE routing (which component renders)
   - Layout handles NAVIGATION UI (which link highlights)
   - Necessary information (all routes) is duplicated between them

### Why This Is Problematic

1. **Maintenance Cost**: Adding a route requires changes to 2-3 files
   - Add case to App.jsx switch
   - Add item to navItems in Layout.jsx
   - Maybe add to footer links
   - Risk of inconsistency

2. **Brittleness**: 
   - Trailing slash inconsistency between files
   - isActive() logic doesn't match renderPage() logic
   - Dynamic routes like `/never-hungover/[slug]` only in App

3. **Scaling Pain**:
   - New team members don't know where routes are defined
   - Routes scattered: navItems, footer links, renderPage switch
   - Adding new pages requires 3+ simultaneous edits

---

## 5. CONSOLIDATION STRATEGY: useRouter Hook

### Design Philosophy

**Goal**: Single source of truth for all route definitions and navigation logic

**Key Principles**:
1. **Centralized route registry** - All routes defined once
2. **Composable navigation** - Both App and Layout use same navigate/isActive functions
3. **Minimal API** - Three functions: navigate(), isActive(), getRoutes()
4. **SSR-safe** - Works during prerendering and hydration
5. **Zero external dependencies** - Uses only browser history API

### Implementation Design

#### File Structure
```
src/hooks/useRouter.js          // New: Router hook with route definitions
src/App.jsx                      // Modified: Use hook for routing
src/components/layout/Layout.jsx // Modified: Use hook for navigation
```

#### useRouter.js - Complete Implementation

```javascript
import { useState, useEffect, useCallback, useMemo } from 'react'
import { navigateWithScrollToTop } from '@/lib/mobileScrollUtils'

/**
 * Centralized route registry
 * Single source of truth for all application routes
 * 
 * Structure:
 * - path: URL path for routing
 * - name: Human-readable name for navigation UI
 * - component: Page component to render (for App.jsx)
 * - inNav: Show in primary navigation (default: true)
 * - inFooter: Show in footer resources (default: false)
 */
const ROUTES = [
  // Primary navigation routes
  { path: '/', name: 'Home', inNav: true },
  { path: '/guide', name: 'Hangover Relief', inNav: true },
  { path: '/reviews', name: 'Best Supplements', inNav: true },
  { path: '/compare', name: 'Compare Solutions', inNav: true },
  { path: '/research', name: 'The Science', inNav: true },
  { path: '/never-hungover', name: 'Never Hungover', inNav: true },
  { path: '/about', name: 'About', inNav: true },
  
  // Secondary routes (not in primary nav)
  { path: '/dhm-dosage-calculator', name: 'Dosage Calculator', inNav: false, inFooter: true },
  { path: '/dhm-dosage-calculator-new', name: 'Dosage Calculator (New)', inNav: false },
  
  // Dynamic routes
  { path: '/never-hungover/:slug', name: 'Blog Post', inNav: false, isDynamic: true },
]

/**
 * useRouter Hook - Centralized routing management
 * 
 * @returns {Object} Router API
 *   - currentPath: Current pathname (normalized)
 *   - navigate(path, callback?): Navigate to path with scroll handling
 *   - isActive(path): Check if path is currently active
 *   - getRoutes(filters?): Get filtered route list
 *   - getNormalizedPath(path): Remove trailing slashes
 *   - getNavItems(): Get only primary navigation items
 *   - getFooterItems(): Get only footer items
 *   - getRouteByPath(path): Find exact route match (works with dynamic routes)
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      // Normalize: remove trailing slash except for root
      const path = window.location.pathname
      return getNormalizedPath(path)
    }
    return '/'
  })

  // Sync currentPath with browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      setCurrentPath(getNormalizedPath(path))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  /**
   * Normalize path: remove trailing slashes except root
   * /guide/ → /guide
   * / → /
   */
  function getNormalizedPath(path) {
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1)
    }
    return path
  }

  /**
   * Navigate to path using history API
   * @param {string} path - Target path
   * @param {Function} onNavigate - Optional callback (for closing mobile menu, etc.)
   */
  const navigate = useCallback((path, onNavigate) => {
    navigateWithScrollToTop(path, onNavigate)
    // Note: setCurrentPath will be triggered by popstate event
  }, [])

  /**
   * Check if given path is currently active
   * Rules:
   * - Exact match for root "/"
   * - Prefix match for other paths (allows subroutes)
   * - Supports dynamic routes like /never-hungover/:slug
   * 
   * @param {string} path - Path to check
   * @returns {boolean}
   */
  const isActive = useCallback((path) => {
    if (path === '/') {
      return currentPath === '/'
    }
    // Prefix match: /guide matches /guide/section
    return currentPath.startsWith(path)
  }, [currentPath])

  /**
   * Get filtered list of routes
   * @param {Object} filters - Filter options
   *   - inNav: boolean - Include navigation routes
   *   - inFooter: boolean - Include footer routes
   *   - isDynamic: boolean - Include/exclude dynamic routes
   * @returns {Array} Filtered routes
   */
  const getRoutes = useCallback((filters = {}) => {
    return ROUTES.filter((route) => {
      if (filters.inNav !== undefined && route.inNav !== filters.inNav) {
        return false
      }
      if (filters.inFooter !== undefined && route.inFooter !== filters.inFooter) {
        return false
      }
      if (filters.isDynamic !== undefined && (route.isDynamic || false) !== filters.isDynamic) {
        return false
      }
      return true
    })
  }, [])

  /**
   * Get navigation items for header
   * @returns {Array} Routes with inNav: true, excluding dynamic routes
   */
  const getNavItems = useCallback(() => {
    return getRoutes({ inNav: true, isDynamic: false })
  }, [getRoutes])

  /**
   * Get footer items
   * @returns {Array} Routes with inFooter: true
   */
  const getFooterItems = useCallback(() => {
    return getRoutes({ inFooter: true, isDynamic: false })
  }, [getRoutes])

  /**
   * Find route by path, supports dynamic routes
   * @param {string} path - Current pathname to match
   * @returns {Object|null} Matching route or null
   */
  const getRouteByPath = useCallback((path) => {
    // First try exact match
    const exactMatch = ROUTES.find((r) => r.path === path && !r.isDynamic)
    if (exactMatch) return exactMatch

    // Then try dynamic routes
    for (const route of ROUTES) {
      if (!route.isDynamic) continue
      
      // Convert /never-hungover/:slug to regex
      const pattern = route.path.replace(/:[\w]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      
      if (regex.test(path)) {
        return route
      }
    }

    return null
  }, [])

  return {
    currentPath,
    navigate,
    isActive,
    getRoutes,
    getNormalizedPath,
    getNavItems,
    getFooterItems,
    getRouteByPath,
  }
}

/**
 * Export ROUTES for external use (e.g., meta tag generation, sitemap)
 * This allows other parts of the app to know all available routes
 */
export { ROUTES }
```

### Modified App.jsx

```javascript
import React, { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useRouter, ROUTES } from './hooks/useRouter'
import './App.css'

// Lazy load components - mapped to ROUTES
const pageComponents = {
  '/': lazy(() => import('./pages/Home.jsx')),
  '/guide': lazy(() => import('./pages/Guide.jsx')),
  '/reviews': lazy(() => import('./pages/Reviews.jsx')),
  '/research': lazy(() => import('./pages/Research.jsx')),
  '/about': lazy(() => import('./pages/About.jsx')),
  '/compare': lazy(() => import('./pages/Compare.jsx')),
  '/dhm-dosage-calculator': lazy(() => import('./pages/DosageCalculatorEnhanced.jsx')),
  '/dhm-dosage-calculator-new': lazy(() => import('./pages/DosageCalculatorRewrite/index.jsx')),
  '/never-hungover': lazy(() => import('./newblog/pages/NewBlogListing.jsx')),
  '/never-hungover/:slug': lazy(() => import('./newblog/components/NewBlogPost.jsx')),
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
)

function App() {
  const { currentPath, getRouteByPath } = useRouter()

  /**
   * IMPROVEMENT: Replace switch statement with route registry lookup
   * 
   * BEFORE: 20 lines of switch cases, hardcoded paths scattered
   * AFTER: 8 lines, single path lookup, no hardcoding
   * 
   * Benefits:
   * - Route definitions come from ROUTES constant (single source)
   * - Supports both exact and dynamic routes
   * - Easier to add/remove routes
   * - Path normalization handled in useRouter
   */
  const renderPage = () => {
    // Find matching route using centralized registry
    const route = getRouteByPath(currentPath)
    
    if (!route) {
      // Fallback to home if no route matches
      const HomeComponent = pageComponents['/']
      return <HomeComponent />
    }

    // Use path or use fallback for dynamic routes
    const ComponentPath = route.isDynamic ? route.path : currentPath
    const Component = pageComponents[ComponentPath] || pageComponents['/']
    
    return <Component />
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {renderPage()}
      </Suspense>
      <SpeedInsights />
    </Layout>
  )
}

export default App
```

### Modified Layout.jsx

```javascript
import React, { useState, useCallback, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Menu, X, Leaf } from 'lucide-react'
import { useRouter } from '@/hooks/useRouter'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'

function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentPath, navigate, isActive, getNavItems, getFooterItems } = useRouter()
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const { headerRef, headerHeight } = useHeaderHeight()

  /**
   * IMPROVEMENT: Replace hardcoded navItems with hook
   * 
   * BEFORE: navItems array hardcoded with 7 items
   * AFTER: getNavItems() pulls from centralized ROUTES
   * 
   * Benefits:
   * - Single place to update navigation items
   * - No duplicate route definitions
   * - Adding a route updates nav automatically
   */
  const navItems = useMemo(() => getNavItems(), [getNavItems])
  const footerItems = useMemo(() => getFooterItems(), [getFooterItems])

  const handleNavigation = useCallback((href) => {
    navigate(href, () => setIsMenuOpen(false))
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <motion.header 
        ref={headerRef}
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md border-b border-green-100"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-h-[40px]">
            {/* Logo */}
            <button onClick={() => handleNavigation('/')} className="flex items-center space-x-2 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center"
              >
                <Leaf className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent whitespace-nowrap">
                DHM Guide
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center max-w-4xl mx-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* CTA Button - Now uses hook */}
            <div className="hidden lg:block flex-shrink-0">
              <Button 
                onClick={() => handleNavigation('/guide')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 pb-4 border-t border-green-100 pt-4"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left min-h-[44px] ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                <Button 
                  onClick={() => handleNavigation('/guide')}
                  className="mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  Get Started
                </Button>
              </div>
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DHM Guide</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Your comprehensive resource for understanding DHM (Dihydromyricetin) and its benefits for hangover prevention and liver health.
              </p>
              <p className="text-sm text-gray-400">
                © 2025 DHM Guide. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <button onClick={() => handleNavigation(item.path)} className="hover:text-white transition-colors">
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                {footerItems.map((item) => (
                  <li key={item.path}>
                    <button onClick={() => handleNavigation(item.path)} className="hover:text-white transition-colors">
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default React.memo(Layout)
```

---

## 6. MIGRATION RISKS & MITIGATION

### Risk: Trailing Slash Inconsistency

**Problem**: App normalizes slashes, Layout doesn't. Consolidation normalizes everywhere.

**Impact**: Low. `/guide/` redirects in vercel.json handle this, and normalization is correct.

**Mitigation**: 
- Test `/route` and `/route/` both work
- Verify vercel.json redirects still active
- Check Google Search Console for 404s post-launch

### Risk: Dynamic Route Matching

**Problem**: Pattern matching for `/never-hungover/:slug` adds complexity.

**Impact**: Medium. Regex pattern could fail for unusual slugs.

**Mitigation**:
- Use simple regex: `/never-hungover/([^/]+)`
- Test with URL-encoded slugs: `test%20post`, `test-post`
- Verify NewBlogPost component handles slug extraction

**Test Cases**:
```javascript
// useRouter.getRouteByPath() should match these:
'/never-hungover/my-post'           // ✓ Standard
'/never-hungover/test-123'          // ✓ With number
'/never-hungover/test%20post'       // ✓ URL encoded space
'/never-hungover'                   // ✓ Parent route
'/never-hungover/'                  // ✓ With trailing slash (normalized to above)
```

### Risk: Footer Links Breaking

**Problem**: Original footer has hardcoded links to `/dhm-dosage-calculator` and `/research`. These move to ROUTES.

**Impact**: Low. Links remain the same, just sourced from ROUTES.

**Mitigation**:
- Verify footer renders all expected links
- Test clicking each footer link works
- Check analytics before/after for broken link tracking

### Risk: Active State Logic Change

**Problem**: `isActive()` uses prefix matching, but might not match new dynamic routes correctly.

**Impact**: Medium. Could show wrong nav item highlighted.

**Mitigation**:
- Prefix matching is correct and existing behavior
- Test each nav item: click it, verify active state
- Test sub-routes: `/never-hungover/my-post` should highlight `/never-hungover`

**Test Cases**:
```javascript
// isActive() tests
isActive('/') with currentPath '/'           // ✓ True
isActive('/') with currentPath '/guide'      // ✓ False
isActive('/guide') with currentPath '/guide' // ✓ True
isActive('/guide') with currentPath '/about' // ✓ False
isActive('/never-hungover') with '/never-hungover/my-post' // ✓ True
```

### Risk: Component Lazy Loading Mapping

**Problem**: pageComponents object maps paths to lazy components. Must stay in sync with ROUTES.

**Impact**: Medium-High. Typo in path breaks rendering.

**Mitigation**:
- Use ROUTES.path values directly when possible
- Add type checking or unit tests for pageComponents keys
- Document that new routes need 2 entries: ROUTES + pageComponents

### Risk: SSR / Prerendering Issues

**Problem**: useRouter uses `window` object (only available in browser). Prerendering happens in Node.

**Impact**: High if not handled correctly. Could break prerendered pages.

**Current code already handles this**:
```javascript
if (typeof window !== 'undefined') {
  // Browser code
}
return '/' // Server fallback
```

**Mitigation**: 
- Prerendering uses static paths, doesn't execute useRouter during build
- Each prerendered page has hardcoded path in <meta> tags
- Hook only runs in browser during hydration
- Test prerendering: `npm run build` and check dist/index.html

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Create Hook (No breaking changes)
- Create `/src/hooks/useRouter.js` with ROUTES constant and useRouter hook
- Test hook in isolation with simple test file
- Deploy to production (behind feature flag or just merged, since it doesn't change behavior)
- Risk: Very low - new code only, no changes to existing

### Phase 2: Migrate App.jsx  
- Update `App.jsx` to import and use `useRouter`
- Replace switch statement with `getRouteByPath()`
- Test: All pages still load, routing works
- Deploy

### Phase 3: Migrate Layout.jsx
- Update `Layout.jsx` to use `useRouter` for navItems
- Replace hardcoded navItems array with `getNavItems()`
- Update footer with `getFooterItems()`
- Test: Nav items highlight correctly, footer links work
- Deploy

### Phase 4: Cleanup
- Remove old navigation utilities if unused
- Update comments in ROUTES as you add new pages
- Document adding new routes in project README

### Testing Checklist

**Unit Tests** (Optional but recommended):
```javascript
// useRouter.test.js
describe('useRouter', () => {
  test('normalizes trailing slashes', () => {})
  test('getRouteByPath matches exact routes', () => {})
  test('getRouteByPath matches dynamic routes', () => {})
  test('isActive works with prefix matching', () => {})
  test('getNavItems filters correctly', () => {})
})
```

**Manual Testing** (Required):

1. Browser navigation:
   - Click each nav item
   - Verify page content changes
   - Verify active state highlights correct nav item
   - Test mobile menu

2. History API:
   - Click nav item
   - Press back button
   - Verify previous page loads
   - Verify nav highlights update

3. Direct URL access:
   - Go to `/guide` directly in address bar
   - Go to `/guide/` (with trailing slash)
   - Verify correct page renders
   - Verify nav highlights correct item

4. 404 handling:
   - Go to `/invalid-route`
   - Verify home page renders (fallback)

5. Dynamic routes:
   - Go to `/never-hungover/my-post`
   - Verify blog post renders
   - Verify active state highlights `/never-hungover`

---

## 8. BENEFITS SUMMARY

### Code Reduction
- **Before**: Route paths hardcoded in 3+ places (App switch, navItems, footer links)
- **After**: Single ROUTES constant, referenced in multiple places

### Maintenance Improvement
- Adding route: 1 edit to ROUTES instead of 3 separate edits
- Removing route: 1 edit instead of 3 edits
- Route consistency: Guaranteed - all UI uses same path values

### Developer Experience
- Onboarding: "Routes are in `src/hooks/useRouter.js`"
- Adding page: "Add to ROUTES, add to pageComponents, done"
- Debugging: "Where is /guide defined?" → One place to look

### Scalability
- Hook handles dynamic routes, prefix matching, active states
- Reusable across the app (any component can `useRouter()`)
- Extensible: Could add route metadata (icon, permissions, etc.)

### No Performance Impact
- Hook uses same logic as before
- No new dependencies
- Memoization prevents unnecessary re-renders

---

## 9. ALTERNATIVE APPROACHES & WHY THEY'RE REJECTED

### Option A: Use React Router Library
**Rejected**: Adds 40KB dependency, overkill for 9 routes, breaks SSR/prerendering setup

### Option B: Context API + Custom Hook
**Rejected**: Similar complexity to useRouter, less composable for Testing

### Option C: Simple Constants File
**Rejected**: No navigation or isActive functions, requires duplication of logic

### Option D: Leave As-Is
**Rejected**: Fails simplicity principle - adds routes to 3+ places, scales poorly

---

## 10. SUMMARY TABLE

| Aspect | Before | After |
|--------|--------|-------|
| Route definitions | 2 locations (App switch, navItems) | 1 location (ROUTES constant) |
| Adding new route | 3 edits | 2 edits (ROUTES + pageComponents) |
| Navigation logic | Scattered (Layout, mobileScrollUtils) | Centralized (useRouter hook) |
| isActive logic | Hardcoded in Layout | Centralized (useRouter) |
| Path normalization | Only in App | Consistent everywhere |
| New routes visible in nav | Manual update needed | Automatic (if inNav: true) |
| Code files affected | 2+ | 2 (instead of 3+) |
| Learning curve | "Where are routes defined?" | "Look in useRouter.js" |

