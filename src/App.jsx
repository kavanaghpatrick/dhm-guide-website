import React, { lazy, Suspense, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useRouter } from './hooks/useRouter'
import { initPostHog } from './lib/posthog'
import { useAffiliateTracking } from './hooks/useAffiliateTracking'
import { useScrollTracking } from './hooks/useScrollTracking'
import { useElementTracking } from './hooks/useElementTracking'
import { useEngagementTracking } from './hooks/useEngagementTracking'
import './App.css'

// Lazy load all page components - mapped to route paths
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

// 404 Not Found component (loaded separately to avoid adding to route registry)
const NotFoundComponent = lazy(() => import('./pages/NotFound.jsx'))

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
)

function App() {
  const { currentPath, getRouteByPath } = useRouter()

  // Initialize PostHog analytics (deferred for performance)
  useEffect(() => {
    // Defer initialization until after page load
    if (document.readyState === 'complete') {
      initPostHog();
    } else {
      window.addEventListener('load', initPostHog, { once: true });
    }
  }, []);

  // Enable automatic affiliate link tracking
  useAffiliateTracking({ enabled: true });

  // Enable scroll depth tracking (25%, 50%, 75%, 90%)
  const { resetMilestones } = useScrollTracking({ enabled: true });

  // Enable element click tracking (CTAs, product cards, comparisons)
  useElementTracking({ enabled: true });

  // Enable deep engagement tracking (time on page, rage clicks, copy, tab visibility)
  useEngagementTracking({ enabled: true });

  // Reset scroll milestones on route change
  useEffect(() => {
    resetMilestones();
  }, [currentPath, resetMilestones]);

  // Replace switch statement with route registry lookup
  const renderPage = () => {
    // Find matching route using centralized registry
    const route = getRouteByPath(currentPath)

    if (!route) {
      // Show 404 page for unrecognized routes
      return <NotFoundComponent />
    }

    // Use path for exact routes, use route.path for dynamic routes
    const ComponentPath = route.isDynamic ? route.path : currentPath
    const Component = pageComponents[ComponentPath]

    // If component not found in registry, show 404
    if (!Component) {
      return <NotFoundComponent />
    }

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

// React import fix for blog post rendering
// Trigger Vercel deployment test - Fri Jun 27 09:57:17 EDT 2025
// Force deployment trigger
