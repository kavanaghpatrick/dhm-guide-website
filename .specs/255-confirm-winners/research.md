# Research: Issue #255 - Confirm and Ship 4 A/B Test Winners

## Problem Statement
14 simultaneous A/B tests ran Jan 3 with noisy results. 4 variants showed lifts but need clean isolated re-tests (one at a time, all other flags at 100% control).

## Current State of Each Winning Flag

### 1. `mobile-sticky-cta-v1` (winner: `sticky-bar`, +9.95pp)
- **Status: IMPLEMENTED** in `src/components/StickyMobileCTA.jsx`
- Uses `useFeatureFlag('mobile-sticky-cta-v1', 'control')`
- Renders when variant === 'sticky-bar' && !dismissed
- Shows floating CTA bar on mobile after 25% scroll
- CTA text: "See Top Picks" linking to /reviews
- Tracking: `trackElementClick('sticky-mobile-cta', {...})`
- Rendered in `src/components/layout/Layout.jsx` line 192

### 2. `homepage-mobile-cta-v1` (winner: `simple-cta`, +6.6pp)
- **Status: NOT IMPLEMENTED** - zero code references found
- No component exists for this flag
- Needs to be built: a simpler mobile CTA variant on the homepage
- Homepage (`src/pages/Home.jsx`) currently has two CTAs in hero section:
  - Primary: "Stop Your Next Hangover" -> /guide
  - Secondary: "Find Best Supplements" -> /reviews

### 3. `scarcity-badges-v1` (winner: `time-urgency`, +6.3pp)
- **Status: NOT IMPLEMENTED** - zero code references found
- No component exists for this flag
- Needs to be built: time-urgency badges on product cards
- Related existing code: `ComparisonWidget.jsx` has a hardcoded "Limited Time: Free Shipping" urgency indicator (line 200)
- Product cards on Reviews.jsx and Home.jsx have static badges (Editor's Choice, Best Value, etc.)

### 4. `nav-cta-copy-v1` (winner: `see-top-picks`, +3.1pp)
- **Status: PREVIOUSLY TESTED AND HARDCODED TO CONTROL**
- `Layout.jsx` line 16-17: `// Nav CTA copy - hardcoded after A/B test #134 showed control won`
- Currently hardcoded to `'Best Supplements'`
- The previous test (#134) concluded control won, but the Jan 3 batch test showed +3.1pp for `see-top-picks`
- Needs the flag re-added to test again in isolation

## PostHog Integration Architecture

### Feature Flag System
- **Hook**: `src/hooks/useFeatureFlag.js` - React hook wrapping PostHog's `getFeatureFlag()`
- **Library**: `src/lib/posthog.js` - Core init + `getFeatureFlag()`, `isFeatureEnabled()`, `onFeatureFlagsLoaded()`
- **Init**: PostHog initialized in `App.jsx` on window load event
- **Proxy**: Traffic routed through `/ingest` to bypass ad blockers

### Experiment Management Script
- **Script**: `scripts/posthog-experiment.sh`
- Commands: `list`, `create`, `start`, `stop`, `results`, `get`, `split`, `flags`, `delete`
- **API Key Issue**: Script expects `POSTHOG_PERSONAL_API_KEY` but env has `POSTHOG_API_KEY`, and the key lacks project access (permission_denied on project 337643)
- The script needs either a new API key or the env var name updated

### Active Feature Flags in Code
1. `mobile-sticky-cta-v1` - StickyMobileCTA.jsx (one of our 4 winners)
2. `sticky-recommendation-bar-v1` - Reviews.jsx (NOT one of the 4 winners, separate test #139)

### Hardcoded (previously A/B tested)
- Nav CTA copy: hardcoded to "Best Supplements" (test #134)
- Hero product variant: hardcoded to 'control' (hero-card was -77.7% conversion)
- CTA copy: hardcoded to "Check Price on Amazon" / "Check Price"
- Table CTA classes: hardcoded to control
- Button colors: hardcoded to orange gradient

## Tracking Events Used
- `affiliate_link_click` - primary conversion metric
- `element_clicked` - UI interaction tracking
- `sticky-mobile-cta` element type for StickyMobileCTA
- `sticky-recommendation-bar` element type for Reviews sticky bar

## Key Files
- `src/lib/posthog.js` - PostHog init and feature flag functions
- `src/hooks/useFeatureFlag.js` - React hook for flags
- `src/components/StickyMobileCTA.jsx` - mobile-sticky-cta-v1 implementation
- `src/components/layout/Layout.jsx` - nav CTA (hardcoded), renders StickyMobileCTA
- `src/pages/Home.jsx` - homepage CTAs (no flag integration)
- `src/pages/Reviews.jsx` - product cards, sticky-recommendation-bar-v1
- `scripts/posthog-experiment.sh` - experiment management API
