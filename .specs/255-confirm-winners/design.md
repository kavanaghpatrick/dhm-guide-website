# Design: Issue #255 - Confirm and Ship 4 A/B Test Winners

## Architecture

All 4 tests use the existing PostHog feature flag infrastructure:
- `useFeatureFlag(flagKey, 'control')` hook in components
- PostHog dashboard controls the traffic split remotely
- No deploy needed to start/stop tests - just toggle flags in PostHog

## Code Changes Required

### 1. mobile-sticky-cta-v1 - NO CODE CHANGES
Already implemented in `src/components/StickyMobileCTA.jsx`.
Just needs PostHog flag configured as 50/50.

### 2. homepage-mobile-cta-v1 - Home.jsx modification
**Approach**: On mobile, conditionally simplify the hero CTA area.

```
Control: Current dual-button layout (both buttons visible)
Variant (simple-cta): Single prominent CTA button on mobile
```

Changes to `src/pages/Home.jsx`:
- Import `useFeatureFlag`
- Get variant: `const homepageCta = useFeatureFlag('homepage-mobile-cta-v1', 'control')`
- Wrap the secondary CTA button with `homepageCta !== 'simple-cta'` check on mobile
- Track clicks with `data-track="cta"` (already present)

### 3. scarcity-badges-v1 - Reviews.jsx + Home.jsx modification
**Approach**: Add dynamic urgency text to product card badges.

```
Control: Static badges (Editor's Choice, Best Value, etc.)
Variant (time-urgency): Add "X bought today" below existing badge
```

Changes to `src/pages/Reviews.jsx` and `src/pages/Home.jsx`:
- Import `useFeatureFlag`
- Get variant: `const scarcityVariant = useFeatureFlag('scarcity-badges-v1', 'control')`
- When variant === 'time-urgency', render urgency indicator below product badge
- Uses existing `trackElementClick` for tracking

### 4. nav-cta-copy-v1 - Layout.jsx modification
**Approach**: Replace hardcoded copy with flag-driven value.

```
Control: "Best Supplements"
Variant (see-top-picks): "See Top Picks"
```

Changes to `src/components/layout/Layout.jsx`:
- Import `useFeatureFlag`
- Replace `const navCtaCopy = 'Best Supplements'` with flag-driven logic
- Get variant: `const navCtaVariant = useFeatureFlag('nav-cta-copy-v1', 'control')`
- Set copy: `const navCtaCopy = navCtaVariant === 'see-top-picks' ? 'See Top Picks' : 'Best Supplements'`
- Add tracking attribute: `data-track="nav-cta"`

### 5. Experiment Management Script Updates
**File**: `scripts/posthog-experiment.sh`
- Add `reset-all` command to set all flags to 100% control
- Add `activate` command to set a single flag to 50/50
- Fix env var: check both `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_API_KEY`

### 6. Sequential Test Runbook
**File**: `scripts/ab-test-runbook.md`
- Step-by-step procedure for each test phase
- How to transition between tests
- Decision criteria for ship/kill

## PostHog Flag Configuration (per test)

### During Test 1 (mobile-sticky-cta-v1):
| Flag | Split |
|------|-------|
| mobile-sticky-cta-v1 | 50% control / 50% sticky-bar |
| homepage-mobile-cta-v1 | 100% control |
| scarcity-badges-v1 | 100% control |
| nav-cta-copy-v1 | 100% control |
| sticky-recommendation-bar-v1 | 100% control |

### During Test 2 (homepage-mobile-cta-v1):
| Flag | Split |
|------|-------|
| mobile-sticky-cta-v1 | 100% control |
| homepage-mobile-cta-v1 | 50% control / 50% simple-cta |
| scarcity-badges-v1 | 100% control |
| nav-cta-copy-v1 | 100% control |
| sticky-recommendation-bar-v1 | 100% control |

(Pattern repeats for tests 3 and 4)

## Monitoring Plan

### During Each Test
1. Check daily: `./scripts/posthog-experiment.sh results <experiment_id>`
2. Verify flag is active: `./scripts/posthog-experiment.sh flags`
3. Check conversion events: `./scripts/posthog-experiment.sh events affiliate_link_click 7`
4. PostHog dashboard: us.posthog.com -> Experiments

### Decision Criteria
- **Ship**: p-value < 0.05 AND lift > 0 after 7+ days with 100+ conversions per variant
- **Extend**: Directional but not significant after 14 days -> extend to 21 days
- **Kill**: Negative lift or no signal after 21 days -> hardcode control, remove variant code

## Risk Assessment
- **Low risk**: All changes are behind feature flags (control = current behavior)
- **No CLS risk**: Urgency badges add content below existing elements, not moving them
- **No performance risk**: `useFeatureFlag` is already async and lightweight
- **Rollback**: Set any flag to 100% control instantly via PostHog dashboard
