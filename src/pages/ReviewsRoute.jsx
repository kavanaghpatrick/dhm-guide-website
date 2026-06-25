import Reviews from './Reviews.jsx'
import { makeModernRoute } from './ModernRoute.jsx'

/** Flag-gated /reviews — control vs the unified modern variant (site-modern-v1). */
const ReviewsRoute = makeModernRoute(Reviews, () => import('./Reviews.modern.jsx'))
export default ReviewsRoute
