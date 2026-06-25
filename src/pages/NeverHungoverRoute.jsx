import NewBlogListing from '../newblog/pages/NewBlogListing.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated /never-hungover — control vs the unified modern variant (site-modern-v1). */
const NeverHungoverRoute = makeModernRoute(NewBlogListing, () => import('../newblog/pages/NewBlogListing.modern.jsx'))
export default NeverHungoverRoute
