# Tasks — Issue #208

## Implementation tasks

- [x] T1. Read existing `UserTestimonials.jsx` to confirm current state matches research.md.
- [x] T2. Confirm `trackEvent` is exported from `src/lib/posthog.js` (line 109).
- [ ] T3. Edit `src/components/UserTestimonials.jsx`:
  - [ ] T3.1. Add `useEffect, useRef` to React import.
  - [ ] T3.2. Add `import { trackEvent } from '@/lib/posthog'`.
  - [ ] T3.3. Add state: `paused`, refs `touchStartXRef`, `carouselRef`.
  - [ ] T3.4. Add `goToSlide(nextIndex, trigger)` helper and route prev/next/dot through it.
  - [ ] T3.5. Add auto-rotate `useEffect` (gated by `paused` and reduced-motion).
  - [ ] T3.6. Add keyboard `useEffect` attached to `carouselRef.current`.
  - [ ] T3.7. Add `onTouchStart` / `onTouchEnd` handlers.
  - [ ] T3.8. Wire all handlers + a11y attributes onto the outermost testimonial Card.
- [ ] T4. Run `npm run build`. Must succeed.
- [ ] T5. Verify dist contains the new behavior tokens:
      `grep -oE '(setInterval|onTouchStart|prefers-reduced-motion|testimonial_slide_view)' dist/assets/*.js | sort -u`
- [ ] T6. Stage and commit `src/components/UserTestimonials.jsx` only as
      `feat(testimonials): add auto-rotation, swipe, keyboard nav, PostHog tracking (#208)`
      with Co-Authored-By trailer.
- [ ] T7. Stage and commit `specs/issue-208-testimonial-polish/` only as
      `chore(spec): scaffold ralph spec artifacts for issue #208`
      with Co-Authored-By trailer.
- [ ] T8. Stay on branch — do not push, do not open PR.

## Done when
- Branch `cleanup/issue-208-testimonial-polish` has 2 new commits on top of `main`.
- `npm run build` exits 0 on the branch.
- Grep verification finds `setInterval`, `onTouchStart`, `prefers-reduced-motion`, and `testimonial_slide_view` in dist.
- `git status` clean for tracked files in the diff (sitemap.xml may remain modified — pre-existing WIP, not staged here).
