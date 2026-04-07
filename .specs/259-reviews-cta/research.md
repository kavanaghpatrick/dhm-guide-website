# Research: Add /reviews CTA to 5 High-Traffic Zero-Conversion Blog Posts (#259)

## Current State

### Existing Components
- **ReviewsCTA** (`src/components/ReviewsCTA.jsx`): Already exists with `default` and `compact` variants. Currently rendered unconditionally on ALL blog posts at end-of-article (line 1377 of NewBlogPost.jsx). No feature flag gating, no click tracking, no slug targeting.
- **StickyMobileCTA** (`src/components/StickyMobileCTA.jsx`): Feature-flagged mobile CTA using `useFeatureFlag('mobile-sticky-cta-v1', 'control')`. Good pattern to follow for flag + tracking.
- **useFeatureFlag** (`src/hooks/useFeatureFlag.js`): Works with PostHog multivariate flags. Returns variant string or boolean.
- **trackElementClick** (`src/lib/posthog.js`): Fires `element_clicked` event with `element_type`, `page_path`, `device_type`, and custom properties.
- **useElementTracking** (`src/hooks/useElementTracking.js`): Auto-tracks clicks via event delegation on `[data-track="cta"]` elements.

### Blog Post Rendering
- `NewBlogPost.jsx` renders all blog posts from JSON data in `src/newblog/data/posts/`
- End-of-article section order: Related Posts > ReviewsCTA > Performance Info
- ReviewsCTA at line 1377 is unconditional: `<ReviewsCTA />`

### Target Posts (915 PV / 90 days, 0 affiliate clicks)
1. `hangover-supplements-complete-guide-what-actually-works-2025` (304 PV)
2. `dhm-randomized-controlled-trials-2024` (222 PV)
3. `dhm-vs-zbiotics` (189 PV)
4. `when-to-take-dhm-timing-guide-2025` (152 PV)
5. `nac-vs-dhm-which-antioxidant-better-liver-protection-2025` (136 PV)

### Prior A/B Test Data (Critical Constraints)
- Mid-content CTAs LOST by 12-13pp -- do NOT place CTA mid-content
- 77% of affiliate clicks happen in 0-25% scroll zone
- Simple CTA copy won by +6.6pp over urgency/buy-now
- Place CTA either above-the-fold or end-of-article

### Key Insight: Simplification Opportunity
The ReviewsCTA already renders on ALL posts. The experiment should:
1. Add feature flag gating to the EXISTING ReviewsCTA render
2. Add tracking properties to the existing component
3. For target slugs: show test variant (with tracking) vs control (no CTA)
4. For non-target slugs: keep current behavior (always show)

This means we modify existing code rather than creating a new component. We just need to:
- Add a `placement` prop and `data-track` attribute to ReviewsCTA
- Wrap the ReviewsCTA render in NewBlogPost.jsx with feature flag logic for target slugs
