import Home from './Home.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated / — control vs the unified modern variant (site-modern-v1). */
const HomeRoute = makeModernRoute(Home, () => import('./Home.modern.jsx'))
export default HomeRoute
