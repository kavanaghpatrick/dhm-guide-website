import { useState, useEffect, useCallback } from 'react'
import { navigateWithScrollToTop } from '@/lib/mobileScrollUtils'

/**
 * Centralized route registry
 * Single source of truth for all application routes
 *
 * Structure:
 * - path: URL path for routing
 * - name: Human-readable name for navigation UI
 * - inNav: Show in primary navigation (default: true)
 * - inFooter: Show in footer resources (default: false)
 * - isDynamic: Route contains parameters like :slug
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
   * Navigate to path using history API
   * @param {string} path - Target path
   * @param {Function} onNavigate - Optional callback (for closing mobile menu, etc.)
   */
  const navigate = useCallback((path, onNavigate) => {
    navigateWithScrollToTop(path, onNavigate)
    setCurrentPath(getNormalizedPath(path))
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
    getNormalizedPath: useCallback(getNormalizedPath, []),
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
