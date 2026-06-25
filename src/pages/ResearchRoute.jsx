import Research from './Research.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated /research — control vs the unified modern variant (site-modern-v1). */
const ResearchRoute = makeModernRoute(Research, () => import('./Research.modern.jsx'))
export default ResearchRoute
