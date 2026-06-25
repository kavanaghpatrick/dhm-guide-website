import Guide from './Guide.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated /guide — control vs the unified modern variant (site-modern-v1). */
const GuideRoute = makeModernRoute(Guide, () => import('./Guide.modern.jsx'))
export default GuideRoute
