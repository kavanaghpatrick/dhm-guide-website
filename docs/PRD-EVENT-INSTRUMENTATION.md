# PRD: PostHog Event Instrumentation - DHM Guide

## Problem Statement
Current analytics only tracks affiliate link clicks. We can't answer:
- Which blog posts drive conversions?
- Where do users drop off before clicking affiliate links?
- What content engagement predicts conversion?
- Which CTAs/placements perform best?

## Current State
- PostHog initialized with autocapture (page views, page leaves)
- Affiliate link clicks tracked with placement, scroll depth, product name
- GA4 dataLayer integration for dual tracking
- NO blog post engagement tracking
- NO scroll depth events
- NO CTA tracking beyond affiliate links
- NO comparison widget/table interaction tracking

## Proposed Solution: 12 High-Impact Events

### Tier 1: Core Conversion Funnel (4 events)

#### 1. `scroll_depth_milestone`
**Why**: Identifies where users disengage before reaching CTAs
```javascript
{
  event: 'scroll_depth_milestone',
  properties: {
    depth: 25 | 50 | 75 | 90,
    page_path: '/never-hungover/best-dhm-supplements',
    page_type: 'blog' | 'review' | 'guide' | 'compare',
    time_to_reach_seconds: 45
  }
}
```

#### 2. `blog_post_viewed`
**Why**: Content-level attribution for conversions
```javascript
{
  event: 'blog_post_viewed',
  properties: {
    post_slug: 'no-days-wasted-vs-nusapure',
    post_category: 'comparison',
    tags: ['dhm', 'product-comparison'],
    word_count: 2500,
    has_affiliate_links: true
  }
}
```

#### 3. `cta_clicked`
**Why**: Measures non-affiliate CTA effectiveness
```javascript
{
  event: 'cta_clicked',
  properties: {
    cta_text: 'View All Reviews',
    cta_destination: '/reviews',
    cta_position: 'hero' | 'inline' | 'footer' | 'sidebar',
    page_path: '/',
    scroll_depth_at_click: 35
  }
}
```

#### 4. `product_card_clicked`
**Why**: Tracks product interest before affiliate click
```javascript
{
  event: 'product_card_clicked',
  properties: {
    product_name: 'No Days Wasted',
    product_id: '1',
    click_type: 'view_details' | 'add_to_compare' | 'affiliate_link',
    card_position: 1,
    page_path: '/reviews'
  }
}
```

### Tier 2: Engagement Quality (4 events)

#### 5. `comparison_interaction`
**Why**: High-intent signal - users actively comparing products
```javascript
{
  event: 'comparison_interaction',
  properties: {
    action: 'add_product' | 'remove_product' | 'view_comparison' | 'clear_all',
    product_name: 'Double Wood',
    products_count: 3,
    page_path: '/reviews'
  }
}
```

#### 6. `faq_expanded`
**Why**: Identifies objections and questions users have
```javascript
{
  event: 'faq_expanded',
  properties: {
    question: 'How long does DHM take to work?',
    category: 'Dosage & Timing',
    question_index: 2,
    page_path: '/'
  }
}
```

#### 7. `internal_link_clicked`
**Why**: Tracks content discovery and navigation patterns
```javascript
{
  event: 'internal_link_clicked',
  properties: {
    link_text: 'Learn more about DHM dosage',
    destination: '/guide',
    source_page: '/never-hungover/dhm-guide',
    link_type: 'inline' | 'related_posts' | 'toc' | 'nav'
  }
}
```

#### 8. `time_on_page_threshold`
**Why**: Distinguishes engaged readers from bouncers
```javascript
{
  event: 'time_on_page_threshold',
  properties: {
    threshold_seconds: 30 | 60 | 120,
    page_path: '/never-hungover/best-dhm-2025',
    page_type: 'blog',
    scroll_depth_at_threshold: 45
  }
}
```

### Tier 3: Content Optimization (4 events)

#### 9. `calculator_interaction`
**Why**: Tracks dosage calculator funnel
```javascript
{
  event: 'calculator_interaction',
  properties: {
    action: 'started' | 'field_changed' | 'completed',
    field_name: 'weight' | 'frequency' | 'drink_type',
    completion_rate: 75,
    result_dosage: '600mg'
  }
}
```

#### 10. `blog_reading_complete`
**Why**: Identifies highly engaging content
```javascript
{
  event: 'blog_reading_complete',
  properties: {
    post_slug: 'dhm-science-explained',
    total_time_seconds: 180,
    scroll_depth_final: 95
  }
}
```

#### 11. `search_performed`
**Why**: Reveals user intent and content gaps
```javascript
{
  event: 'search_performed',
  properties: {
    query: 'best budget dhm',
    results_count: 5,
    page_path: '/never-hungover'
  }
}
```

#### 12. `exit_intent_detected`
**Why**: Identifies when users are about to leave
```javascript
{
  event: 'exit_intent_detected',
  properties: {
    page_path: '/reviews',
    time_on_page_seconds: 45,
    scroll_depth: 60,
    had_any_interaction: true
  }
}
```

## Implementation Approach

### File Changes
1. **`src/lib/posthog.js`** - Add tracking utility functions
2. **`src/hooks/useScrollTracking.js`** (NEW) - Scroll depth + time thresholds
3. **`src/hooks/useContentTracking.js`** (NEW) - Blog post, CTA, internal links
4. **`src/pages/*.jsx`** - Integrate tracking hooks
5. **`src/components/*.jsx`** - Add event calls to interactive components

### Naming Convention
- snake_case for event names
- Past tense for completed actions (`clicked`, `viewed`, `completed`)
- Present tense for states (`detected`)
- Prefix by category: `blog_`, `product_`, `comparison_`, `calculator_`

### Properties Standard
Every event includes:
- `page_path` - Current URL path
- `page_type` - home/blog/review/guide/compare/calculator
- `timestamp` - ISO timestamp (added by PostHog)
- `device_type` - mobile/tablet/desktop (from viewport)

## Success Metrics
After 30 days of data collection:
1. Build conversion funnel: page_view → scroll_50 → cta_clicked → affiliate_click
2. Identify top 10 converting blog posts by affiliate_click rate
3. Measure scroll depth correlation with conversion
4. A/B test CTA placements based on position data

## Time Estimate
- Tier 1 events: 2 hours
- Tier 2 events: 2 hours
- Tier 3 events: 2 hours
- Testing + deploy: 1 hour
- **Total: 7 hours**

## Risks
1. **Event volume** - PostHog free tier has limits; use sampling if needed
2. **Performance** - Debounce scroll events; don't block main thread
3. **Ad blockers** - Already mitigated via /ingest proxy (~40% bypass)
