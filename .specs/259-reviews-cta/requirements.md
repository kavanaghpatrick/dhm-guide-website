# Requirements: Add /reviews CTA to 5 High-Traffic Zero-Conversion Blog Posts (#259)

## Problem Statement
5 blog posts have 100+ pageviews (915 combined over 90 days) but ZERO affiliate clicks. Meanwhile, /reviews converts at 46.7%. These posts need a bridge to the conversion page.

## Feature Flag
- **Key**: `content-to-reviews-cta-v1`
- **Type**: Multivariate (PostHog experiment)
- **Variants**: `control` (no end-of-post CTA on target slugs), `test` (show end-of-post CTA)
- **Traffic split**: 50/50

## Control Behavior
- Target slug pages show NO end-of-post ReviewsCTA (current state for experiment baseline)
- Non-target pages continue showing ReviewsCTA as they do today (unchanged)

## Test Variant Behavior
- Target slug pages show the ReviewsCTA at end of post
- CTA copy: "See Our Top-Rated DHM Supplements" with arrow, linking to /reviews
- Placement: end of article, before related posts (to be in higher scroll zone)

## Target Slugs
1. `hangover-supplements-complete-guide-what-actually-works-2025`
2. `dhm-randomized-controlled-trials-2024`
3. `dhm-vs-zbiotics`
4. `when-to-take-dhm-timing-guide-2025`
5. `nac-vs-dhm-which-antioxidant-better-liver-protection-2025`

## Tracking
- Track clicks as `element_clicked` event via existing `trackElementClick`
- Properties:
  - `element_type`: `cta`
  - `placement`: `end_of_post_cta`
  - `destination`: `/reviews`
  - `experiment`: `content-to-reviews-cta-v1`
  - `post_slug`: (current post slug)
- Use `data-track="cta"` attribute for automatic tracking via useElementTracking

## Goal Metrics (PostHog Experiment)
- **Primary**: Click-through to /reviews from target posts
- **Secondary**: Downstream `affiliate_link_click` events from users who clicked CTA

## Success Criteria
- Statistically significant increase in /reviews visits from target posts
- No negative impact on scroll depth or time on page

## Non-Goals
- No mid-content CTA (proven to lose by 12-13pp)
- No urgency/buy-now copy (simple CTA won by +6.6pp)
- No changes to non-target blog posts
- No new component -- modify existing ReviewsCTA
