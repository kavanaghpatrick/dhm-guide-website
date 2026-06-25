import { lazy, Suspense } from 'react'
import { useVariant } from '../hooks/useVariant'
import Compare from './Compare.jsx'

// Modern variant is its own chunk — only fetched for users actually in 'modern'.
const CompareModern = lazy(() => import('./Compare.modern.jsx'))

const EXPERIMENT_KEY = 'compare-modern-v1'

/**
 * Flag-gated route wrapper for /compare.
 *
 * Renders the CONTROL page (Compare.jsx) synchronously for everyone who is NOT in
 * the 'modern' variant. This is deliberate: prerender, LCP, and SEO crawlers must
 * see real control content immediately — never a blank spinner.
 *
 * For users in 'modern', the modern chunk is rendered inside <Suspense> with the
 * CONTROL page as the fallback, so even mid-chunk-load the visitor sees real
 * content rather than a spinner.
 */
export default function CompareRoute() {
  const variant = useVariant(EXPERIMENT_KEY)

  if (variant !== 'modern') {
    return <Compare />
  }

  return (
    <Suspense fallback={<Compare />}>
      <CompareModern />
    </Suspense>
  )
}
