# Design: Add /reviews CTA to 5 High-Traffic Zero-Conversion Blog Posts (#259)

## Architecture Decision
Modify existing `ReviewsCTA` component and its usage in `NewBlogPost.jsx`. No new components needed.

## Changes

### 1. ReviewsCTA Component (`src/components/ReviewsCTA.jsx`)
- Add `placement` prop for tracking context
- Add `postSlug` prop for tracking context
- Add `data-track="cta"` to the link for automatic element tracking
- Add explicit `onClick` handler that calls `trackElementClick` with experiment properties
- Add experiment-specific CTA copy when `placement === 'end_of_post_cta'`

### 2. NewBlogPost.jsx (`src/newblog/components/NewBlogPost.jsx`)
- Import `useFeatureFlag` hook
- Define `TARGET_SLUGS` constant with the 5 target slugs
- For target slugs: check `content-to-reviews-cta-v1` flag
  - `test` variant: render ReviewsCTA with tracking props
  - `control` variant: render nothing (baseline)
- For non-target slugs: render ReviewsCTA as before (no change)

### 3. Component Flow
```
NewBlogPost renders
  -> Is slug in TARGET_SLUGS?
     -> YES: Check feature flag
        -> 'test': Render <ReviewsCTA placement="end_of_post_cta" postSlug={slug} />
        -> 'control'/default: Render nothing
     -> NO: Render <ReviewsCTA /> as before (unchanged)
```

### 4. Tracking Properties on Click
```json
{
  "element_type": "cta",
  "placement": "end_of_post_cta",
  "destination": "/reviews",
  "experiment": "content-to-reviews-cta-v1",
  "post_slug": "<slug>"
}
```

## Files Changed
1. `src/components/ReviewsCTA.jsx` -- add tracking props and data attributes
2. `src/newblog/components/NewBlogPost.jsx` -- add feature flag logic for target slugs
