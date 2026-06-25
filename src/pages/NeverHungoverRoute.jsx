import { lazy, Suspense } from 'react'
import { useVariant } from '../hooks/useVariant'
import NewBlogListing from '../newblog/pages/NewBlogListing.jsx'

// Modern variant is its own chunk — only fetched for users actually in 'modern'.
const NewBlogListingModern = lazy(() =>
  import('../newblog/pages/NewBlogListing.modern.jsx')
)

const EXPERIMENT_KEY = 'never-hungover-modern-v1'

/**
 * Flag-gated route wrapper for /never-hungover.
 *
 * Renders the CONTROL hub (NewBlogListing.jsx) synchronously for everyone who is
 * NOT in the 'modern' variant. This is deliberate: prerender, LCP, and SEO
 * crawlers must see real control content immediately — never a blank spinner.
 *
 * For users in 'modern', the modern chunk is rendered inside <Suspense> with a
 * neutral full-height placeholder as the fallback (NOT the control page): the
 * modern chunk loads in milliseconds, and rendering the control here would both
 * flash control->modern and surface the control hub's pre-existing dev-only
 * duplicate-key warnings (the post metadata has some undefined/duplicate ids).
 */
export default function NeverHungoverRoute() {
  const variant = useVariant(EXPERIMENT_KEY)

  if (variant !== 'modern') {
    return <NewBlogListing />
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-hidden="true" />}>
      <NewBlogListingModern />
    </Suspense>
  )
}
