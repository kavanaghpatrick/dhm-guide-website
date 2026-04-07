# Tasks: Issue #255 - Confirm and Ship 4 A/B Test Winners

## Task 1: Implement homepage-mobile-cta-v1 flag in Home.jsx
- [ ] Import `useFeatureFlag` in Home.jsx
- [ ] Add flag: `const homepageCta = useFeatureFlag('homepage-mobile-cta-v1', 'control')`
- [ ] Wrap secondary CTA button with mobile-only conditional hide when variant is 'simple-cta'
- [ ] Add tracking event data attributes

## Task 2: Implement scarcity-badges-v1 flag in Reviews.jsx
- [ ] Add flag: `const scarcityVariant = useFeatureFlag('scarcity-badges-v1', 'control')`
- [ ] Add urgency indicator below product badges when variant is 'time-urgency'
- [ ] Apply to product card grid (all products)

## Task 3: Implement scarcity-badges-v1 flag in Home.jsx
- [ ] Reuse same flag from Task 1's hook call
- [ ] Add urgency indicator below product badges in top products section
- [ ] Keep consistent styling with Reviews.jsx implementation

## Task 4: Re-activate nav-cta-copy-v1 flag in Layout.jsx
- [ ] Import `useFeatureFlag`
- [ ] Replace hardcoded `navCtaCopy = 'Best Supplements'` with flag-driven logic
- [ ] Add `data-track="nav-cta"` to CTA button
- [ ] Track clicks with element_type 'nav-cta'

## Task 5: Update posthog-experiment.sh
- [ ] Fix env var to check both `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_API_KEY`
- [ ] Add `reset-all` command
- [ ] Add `activate` command

## Task 6: Create sequential test runbook
- [ ] Write `scripts/ab-test-runbook.md` with step-by-step procedure

## Task 7: Build verification
- [ ] Run `npm run build` to confirm no errors
- [ ] Verify all flag defaults are 'control' (zero behavior change without PostHog)

## Task 8: Commit
- [ ] Commit all changes with descriptive message referencing #255
