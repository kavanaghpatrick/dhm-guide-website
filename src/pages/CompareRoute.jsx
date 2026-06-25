import Compare from './Compare.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated /compare — control vs the unified modern variant (site-modern-v1). */
const CompareRoute = makeModernRoute(Compare, () => import('./Compare.modern.jsx'))
export default CompareRoute
