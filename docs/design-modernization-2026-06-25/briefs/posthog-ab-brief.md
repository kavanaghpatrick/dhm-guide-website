# PostHog A/B Brief — how a modernized page gets tested (recommendations must fit this)

The end goal is **parallel page variants A/B-tested via PostHog Experiments**. Every
recommendation should be framable as a testable variant. The mechanism already exists and
is proven in production — do NOT propose a new testing framework.

## The hook (already built)
`src/hooks/useFeatureFlag.js`:
```js
const { variant, payload, isLoading } = useExperiment('experiment-key', { fallback: 'control' })
```
- `variant`: string assigned by PostHog (e.g. `'control'`, `'modern'`).
- `payload`: JSON config from PostHog (lets you tune copy/values without redeploy).
- `isLoading`: true until flags resolve — gate above-the-fold swaps on this to avoid flicker.
- **Exposure is auto-tracked** once per (user, flag) via `experiment_exposure`.

## How a full-page variant slots in
Route components are lazy-loaded in `src/App.jsx`'s `pageComponents` map. Pattern for a
page-level variant:
```
src/pages/Reviews.jsx          // control
src/pages/Reviews.modern.jsx   // variant
```
A small wrapper reads `useExperiment('reviews-modern-v1')` and renders control vs modern
(gate on `isLoading`). Smaller component-level swaps can use the flag inline (as the 5 live
experiments already do — e.g. `homepage-mobile-cta-v1`, `scarcity-badges-v1`).

## Conversion tracking (already built — reuse, don't reinvent)
`src/lib/posthog.js` helpers:
- `trackAffiliateClick({...})` — already accepts `experimentKey` + `variant`. Amazon clicks are the primary conversion.
- `trackFunnelStep(step, props)`, `trackElementClick(type, props)`, `trackEvent(name, props)`.

## What this means for recommendations
- Prefer changes that are **cleanly togglable** (a variant component or a flag-gated block).
- Always name a **primary metric** (usually `affiliate_link_click` rate; secondary: scroll depth, time-on-page, funnel step).
- Flag **CLS/LCP risk** for any above-the-fold change (the site is SEO/Core-Web-Vitals sensitive).
- Keep variants **isolated** so the control is untouched and the test is clean.
