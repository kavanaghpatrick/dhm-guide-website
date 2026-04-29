# Requirements — Issue #208

## Goal
Polish the existing `UserTestimonials` component so it satisfies the issue's acceptance criteria — specifically: auto-rotation, swipe gestures, keyboard navigation, and PostHog instrumentation. Do not extract into a new component; modify the existing file in place.

## Functional requirements

### FR-1 Auto-rotation
- The carousel advances every 5,000 ms while not paused.
- Rotation is paused when:
  - `prefers-reduced-motion: reduce` is true (auto-rotation disabled entirely)
  - User is hovering the carousel container (`onMouseEnter` flips `paused` to true; `onMouseLeave` flips back to false)
- Manual navigation (button click, dot click, swipe, keyboard) does not stop auto-rotation but resets the 5-second timer (the interval restarts on every slide change).

### FR-2 Pause-on-hover
- `onMouseEnter` on carousel container sets `paused = true`.
- `onMouseLeave` on carousel container sets `paused = false`.

### FR-3 Swipe gestures (mobile)
- `onTouchStart` records the starting clientX in a ref.
- `onTouchEnd` measures delta-x against the ref. If `|deltaX| > 50px`, fire prev (positive) or next (negative).
- Below 50px threshold, no action (treats as tap not swipe).

### FR-4 Keyboard navigation
- Carousel container has `tabIndex={0}` so it can receive focus.
- An effect attaches a `keydown` listener that fires when:
  - `e.key === 'ArrowLeft'` → prev
  - `e.key === 'ArrowRight'` → next
- Listener is on the carousel container (not window), so it only fires when carousel has focus — does not interfere with global keyboard usage.

### FR-5 PostHog tracking
- Every slide change fires `trackEvent('testimonial_slide_view', { slide_index, trigger })`.
- `trigger` is one of `'auto' | 'click' | 'swipe' | 'keyboard'`.

### FR-6 Reduced motion
- On mount, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- If true, skip the auto-rotate effect entirely. Manual controls still work.

## Non-functional requirements
- Modify `src/components/UserTestimonials.jsx` only (no new files).
- Vanilla React only — no carousel library, no embla.
- ~30 lines added (excluding spec).
- Build must pass: `npm run build`.

## Out of scope
- New visual design / layout changes
- New testimonial data
- Animation transitions between slides (current cross-fade via React re-render is acceptable)
- Server-side rendering of carousel state
