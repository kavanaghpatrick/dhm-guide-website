# Design — Issue #208

## Overall approach
Add three hooks and a small handler set to the existing `UserTestimonials` component. All state and effects live inside the component — no shared state, no prop drilling.

## State additions
```js
const [paused, setPaused] = useState(false)
const touchStartXRef = useRef(0)
const carouselRef = useRef(null)
```

## Single source of truth: `goToSlide(index, trigger)`
Wrap the existing two slide-change paths (next, prev) plus a new dot-click path through a single function so we can fire one tracking call per slide change. Signature:
```js
const goToSlide = (nextIndex, trigger) => {
  setCurrentTestimonial(((nextIndex % L) + L) % L) // safe modulo for negative
  trackEvent('testimonial_slide_view', { slide_index: ((nextIndex % L) + L) % L, trigger })
}
```
- `next` calls `goToSlide(currentTestimonial + 1, trigger)`
- `prev` calls `goToSlide(currentTestimonial - 1, trigger)`
- Dot calls `goToSlide(index, 'click')`

## Effects

### Effect 1: auto-rotation
```js
useEffect(() => {
  if (paused) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const id = setInterval(() => {
    setCurrentTestimonial((prev) => {
      const next = (prev + 1) % testimonials.length
      trackEvent('testimonial_slide_view', { slide_index: next, trigger: 'auto' })
      return next
    })
  }, 5000)
  return () => clearInterval(id)
}, [paused, testimonials.length])
```
Note: tracking is fired inside the setState updater for the auto path, because we don't have a current `currentTestimonial` snapshot in the closure (interval was started potentially many seconds ago). The functional updater gives us the freshest value.

### Effect 2: keyboard
```js
useEffect(() => {
  const el = carouselRef.current
  if (!el) return
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToSlide(currentTestimonial - 1, 'keyboard')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToSlide(currentTestimonial + 1, 'keyboard')
    }
  }
  el.addEventListener('keydown', onKey)
  return () => el.removeEventListener('keydown', onKey)
}, [currentTestimonial, testimonials.length])
```

## Touch handlers
```js
const onTouchStart = (e) => { touchStartXRef.current = e.touches[0].clientX }
const onTouchEnd = (e) => {
  const dx = e.changedTouches[0].clientX - touchStartXRef.current
  if (Math.abs(dx) < 50) return
  if (dx < 0) goToSlide(currentTestimonial + 1, 'swipe')
  else goToSlide(currentTestimonial - 1, 'swipe')
}
```

## Container wiring
The outermost `<Card className="mb-12 overflow-hidden shadow-2xl">` is the carousel root. Add:
- `ref={carouselRef}`
- `tabIndex={0}`
- `role="region"`
- `aria-label="Customer testimonials"`
- `aria-roledescription="carousel"`
- `onMouseEnter={() => setPaused(true)}`
- `onMouseLeave={() => setPaused(false)}`
- `onTouchStart={onTouchStart}`
- `onTouchEnd={onTouchEnd}`
- `outline-none focus-visible:ring-2 focus-visible:ring-purple-500` (visible focus)

## Existing handlers
- `nextTestimonial` / `prevTestimonial` redirect to `goToSlide(..., 'click')`.
- Dot button onClick redirects to `goToSlide(index, 'click')`.

## PostHog payload
Event name: `testimonial_slide_view`
Properties:
- `slide_index`: integer 0..(testimonials.length - 1)
- `trigger`: `'auto' | 'click' | 'swipe' | 'keyboard'`

## Risk and mitigation
- **Auto-rotate vs manual click race**: auto rotate uses functional setState; manual click sets directly. Cleanup on unmount and on `paused` flip prevents stale intervals.
- **CLS**: no DOM size change introduced; we only added handlers and a ref to existing nodes.
- **Build/test impact**: pure React additions, no new deps. Build should pass with no warnings.
