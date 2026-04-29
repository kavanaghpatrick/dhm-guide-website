# Research — Issue #208 (Testimonial Carousel Polish)

## Component Under Test
- `src/components/UserTestimonials.jsx` (440 lines)
- Mounted on `src/pages/Home.jsx` line 899 (user-visible homepage section)
- Exists since at least mid-2024; well-established component

## Existing Behavior (verified by reading source)
| Capability | Status | Notes |
|---|---|---|
| Testimonial array | Present | 6 entries (Michael Chen, Sarah Martinez, James Thompson, Emily Rodriguez, David Kim, Lisa Anderson) |
| Manual prev/next buttons | Present | `nextTestimonial` / `prevTestimonial` (lines 141-147) using modulo wraparound |
| Dot indicators | Present | Lines 285-298, with `aria-label`, `aria-current`, expanding active dot via `w-8` |
| Star rating display | Present | Lines 222-226, fills `currentReview.rating` count of stars |
| Verified badge | Present | Line 213 |
| Before/after card grid | Present | Lines 252-267 |
| Quote/attribution | Present | Lines 207-211, 227-229 |
| Consistent height container | Reasonable | Card has `overflow-hidden`; testimonial blocks similar length |
| ARIA labels on dots | Present | `aria-label="Go to testimonial N by NAME"` (line 290) |

## Missing per ultrathink (the 4 deltas)
1. **Auto-rotation** — no `setInterval` anywhere in component
2. **Pause-on-hover** — no `onMouseEnter` / `onMouseLeave` handlers on carousel container
3. **Swipe gestures** — no `onTouchStart` / `onTouchEnd` handlers
4. **Keyboard navigation** — no `keydown` listener for arrow keys
5. **PostHog tracking** — no `trackEvent` calls; nav buttons rely only on autocapture
6. **Reduced motion respect** — no media-query check before auto-rotating

## Existing infrastructure to reuse
- `src/lib/posthog.js` exports `trackEvent(eventName, properties = {})` — used elsewhere in codebase via `data-track` autocapture but explicit calls also exist (e.g., `useAffiliateTracking.js`)
- React 18 is in use (codebase uses hooks throughout)
- No carousel library installed — implement in vanilla React per spec

## Risk surface
- `setInterval` cleanup must clear on unmount or on dependency change to avoid leaks
- Touch handlers must not break click handlers (touch + click both fire on mobile dots)
- Keyboard listener must be scoped (window-level keydown that triggers on any focused input would break form fields elsewhere) — gate by carousel-root focus or use a container-scoped listener
- `prefers-reduced-motion` requires runtime check; new sessions can change media-query state, but for our use a one-time check at mount is sufficient (auto-rotation interval doesn't need to recompute on theme switch)

## Acceptance Criteria mapping
| Issue AC | Status pre-fix | Plan |
|---|---|---|
| Auto-rotating carousel working | Missing | Add useEffect setInterval(5000), gated by `paused` |
| Manual navigation (arrows + dots) | Done | Keep, add tracking |
| Mobile swipe gestures | Missing | Add touch handlers |
| Accessible (keyboard, screen readers) | Partial (ARIA) | Add keydown for arrows + tabindex on root |
| No CLS from height changes | Likely OK | Visual only — current Card has fixed structure; testimonial bodies are similar |
| Tracking in PostHog | Missing | Fire `testimonial_slide_view` on every slide change |
