# A/B Test Re-confirmation Runbook (Issue #255)

Sequential isolated re-tests for 4 winning variants from the Jan 3 batch test.

## Test Schedule

| Order | Flag Key | Variant | Original Lift | Duration |
|-------|----------|---------|--------------|----------|
| 1 | `mobile-sticky-cta-v1` | `sticky-bar` | +9.95pp | 7-14 days |
| 2 | `homepage-mobile-cta-v1` | `simple-cta` | +6.6pp | 7-14 days |
| 3 | `scarcity-badges-v1` | `time-urgency` | +6.3pp | 7-14 days |
| 4 | `nav-cta-copy-v1` | `see-top-picks` | +3.1pp | 7-14 days |

## Before Starting Any Test

### Step 1: Reset all flags to control
```bash
./scripts/posthog-experiment.sh reset-all
```

### Step 2: Verify all flags are at 100% control
```bash
./scripts/posthog-experiment.sh flags
```

## Running Test 1: mobile-sticky-cta-v1

### Activate
```bash
./scripts/posthog-experiment.sh activate mobile-sticky-cta-v1 sticky-bar
```

### Monitor (daily)
```bash
./scripts/posthog-experiment.sh events affiliate_link_click 7
./scripts/posthog-experiment.sh events element_clicked 7
```

### Check results in PostHog
1. Go to us.posthog.com -> Experiments
2. Find the mobile-sticky-cta-v1 experiment
3. Check conversion rate difference and p-value

### Decision after 7-14 days
- **Ship**: p < 0.05 and lift > 0 -> hardcode `sticky-bar` variant, remove flag check
- **Extend**: Directional but p > 0.05 -> continue to 21 days
- **Kill**: Negative or flat -> hardcode control, remove StickyMobileCTA component

### Transition to Test 2
```bash
./scripts/posthog-experiment.sh reset-all
./scripts/posthog-experiment.sh activate homepage-mobile-cta-v1 simple-cta
```

## Running Test 2: homepage-mobile-cta-v1

### What it does
On mobile, replaces the two-button hero CTA (Stop Your Next Hangover + Find Best Supplements) with a single focused "See Top DHM Picks" button linking to /reviews.

### Activate
```bash
./scripts/posthog-experiment.sh activate homepage-mobile-cta-v1 simple-cta
```

### Decision criteria
Same as Test 1. If shipped, hardcode the simple CTA and remove the control branch.

## Running Test 3: scarcity-badges-v1

### What it does
Adds urgency text (e.g., "1K+ bought this month", "Selling fast") to product card badges on Reviews and Home pages.

### Activate
```bash
./scripts/posthog-experiment.sh activate scarcity-badges-v1 time-urgency
```

### Decision criteria
Same as Test 1. Watch `affiliate_link_click` rate specifically.

## Running Test 4: nav-cta-copy-v1

### What it does
Changes the navigation CTA button text from "Best Supplements" to "See Top Picks".

### Activate
```bash
./scripts/posthog-experiment.sh activate nav-cta-copy-v1 see-top-picks
```

### Note
This was previously tested as #134 where control won. The Jan 3 batch test showed +3.1pp in isolation-noisy conditions. This re-test confirms whether the lift is real.

## After All Tests Complete

For each confirmed winner:
1. Hardcode the winning variant (remove the `useFeatureFlag` call)
2. Delete the control branch code
3. Archive the PostHog experiment

For each confirmed loser:
1. Hardcode control
2. Delete the variant code
3. Archive the PostHog experiment

## Troubleshooting

### Flags not loading
- Check PostHog is initialized: browser console should show `[PostHog] Loaded with MAXIMUM data collection`
- Verify proxy is working: `/ingest` endpoint should return 200
- Check `useFeatureFlag` default is 'control' (safe fallback)

### Low sample size
- Each variant needs 100+ conversions for meaningful results
- If daily traffic is low, extend test to 21 days
- Consider reducing to 70/30 split if traffic is very low
