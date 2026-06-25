import { lazy, Suspense } from 'react'
import { useModernExperiment } from '../lib/experiment'

// Neutral, layout-stable hold (NOT the control page). Shown only during the brief
// FIRST-visit flag resolve (returning users are seeded from PostHog's localStorage
// cache → no hold) and during the modern chunk download. A modern-bucketed user
// therefore never sees the control design flash.
const HOLD = <div style={{ minHeight: '100vh' }} aria-hidden="true" />

/**
 * Build a flag-gated route for the unified modern experiment (site-modern-v1), with
 * zero control→modern flash:
 *  - returning users  → cache-seeded variant on first paint (modern or control)
 *  - first-time users → neutral hold during the one unavoidable resolve, then variant
 *  - control users + non-JS crawlers (prerendered stub) → control, unaffected
 *
 * @param {React.ComponentType} Control - the existing control page component
 * @param {() => Promise<{default: React.ComponentType}>} importModern - dynamic import of the .modern page
 * @returns {React.ComponentType}
 */
export function makeModernRoute(Control, importModern) {
  const Modern = lazy(importModern)
  return function ModernRoute() {
    const { variant, isLoading } = useModernExperiment()
    if (isLoading) return HOLD            // first-time visitor, assignment not yet known
    if (variant !== 'modern') return <Control />
    return <Suspense fallback={HOLD}><Modern /></Suspense>
  }
}
