# Requirements: Issue #255 - Confirm and Ship 4 A/B Test Winners

## Goal
Set up clean isolated re-tests for 4 winning A/B test variants. One test at a time, all other flags at 100% control. Confirm each winner independently before shipping permanently.

## Sequential Test Plan

### Test Order (by lift magnitude, highest first)
1. **Test 1**: `mobile-sticky-cta-v1` (sticky-bar, +9.95pp) - ALREADY IMPLEMENTED
2. **Test 2**: `homepage-mobile-cta-v1` (simple-cta, +6.6pp) - NEEDS IMPLEMENTATION
3. **Test 3**: `scarcity-badges-v1` (time-urgency, +6.3pp) - NEEDS IMPLEMENTATION
4. **Test 4**: `nav-cta-copy-v1` (see-top-picks, +3.1pp) - NEEDS RE-ACTIVATION

### Test Duration
- Each test: 7-14 days minimum (need 100+ conversions per variant for significance)
- Total timeline: 4-8 weeks for all 4 tests

## Requirements per Test

### R1: Flag Isolation (CRITICAL)
- When running test N, ALL other flags must be set to 100% control
- Only ONE flag active as 50/50 split at a time
- `sticky-recommendation-bar-v1` (test #139) must also be set to control during re-tests

### R2: Test 1 - mobile-sticky-cta-v1 (Ready Now)
- Code: Already implemented in `StickyMobileCTA.jsx`
- PostHog config: Set to 50/50 (control vs sticky-bar)
- Goal metric: `affiliate_link_click` + `element_clicked` where element_type = 'sticky-mobile-cta'
- All other flags: 100% control

### R3: Test 2 - homepage-mobile-cta-v1 (Needs Code)
- Build: Simple mobile CTA component on homepage
- Variant `simple-cta`: Simplified single-button CTA replacing the dual-button hero CTA on mobile
- Control: Current dual-button layout (unchanged)
- Goal metric: `element_clicked` where element_type = 'homepage-cta'
- Mobile only (md:hidden)

### R4: Test 3 - scarcity-badges-v1 (Needs Code)
- Build: Time-urgency badges on product cards (Reviews + Home)
- Variant `time-urgency`: Add urgency text like "X bought today" or "Limited stock" to product badges
- Control: Current static badges (Editor's Choice, Best Value, etc.)
- Goal metric: `affiliate_link_click`

### R5: Test 4 - nav-cta-copy-v1 (Needs Re-activation)
- Un-hardcode: Replace hardcoded "Best Supplements" with flag-driven copy
- Variant `see-top-picks`: CTA text = "See Top Picks"
- Control: CTA text = "Best Supplements"
- Goal metric: `element_clicked` where element_type = 'nav-cta'

### R6: Experiment Management Script
- Fix `posthog-experiment.sh` to use correct env var name
- Add new commands for batch flag management:
  - `reset-all` - Set all experiment flags to 100% control
  - `activate <flag-key>` - Set specific flag to 50/50

### R7: Sequential Procedure Documentation
- Clear step-by-step runbook for each test transition
- How to read results and decide ship/kill
- How to transition between tests

## Success Criteria
- Each test runs in clean isolation (one flag active at a time)
- Minimum 100 conversions per variant before deciding
- P-value < 0.05 or clear directional signal after 14 days
- Winners are hardcoded permanently, losers removed

## Out of Scope
- Changing goal metrics or tracking code (already solid)
- Modifying PostHog dashboard configuration
- Running multiple tests simultaneously
