# P0D - Affiliate-Click Regression Test Suite

**Date:** 2026-04-25
**Branch:** `test/affiliate-regression`
**Status:** Test suite created and run against production. **All 4 tests FAIL — confirming the regression.**

## What was built

New test file: [`tests/affiliate-tracking.spec.js`](../../tests/affiliate-tracking.spec.js)
Companion config: [`playwright.affiliate.config.js`](../../playwright.affiliate.config.js) (separate config so the suite hits production without spinning up a local dev server, which the main `playwright.config.js` does for `tests/user-journey.spec.js`).

## Scenarios covered

For both `/reviews` and `/compare`, on both desktop (default Chromium) and iPhone-13 mobile (390x844, touch, mobile UA) — 4 tests total:

1. **Locate first visible affiliate button** — anchor pointing at `amzn.to` or `amazon.<tld>`.
2. **Button label** matches `/(check\s+price|buy)\s+on\s+amazon/i`.
3. **`target="_blank"`** strictly equal to `_blank`.
4. **`rel`** contains `noopener`.
5. **`href`** matches `^https?://(?:www\.)?(?:amzn\.to/[A-Za-z0-9]+|amazon\.(?:com|co\.uk|ca|de)/...?(?:[?&]tag=[^&\s]+))`.
   - `amzn.to` short-codes are accepted because they are Amazon's own affiliate-tagged shortener; the site uses these almost exclusively.
6. **Click opens a new tab** — uses `context.waitForEvent('page')` racing the click. Test temporarily rewrites `href` to `about:blank` so the popup opens instantly and we don't actually hit Amazon (avoids rate-limits and flakiness).
7. **PostHog `affiliate_link_click` event fires** — listens to all `request` events whose URL matches `(/ingest|us\.i\.posthog\.com|app\.posthog\.com)/(e|i/v0/e|batch|capture)/?`, decodes the body (raw JSON, JSON array, or `data=` form-encoded base64), and asserts an event named `affiliate_link_click` is captured within 8 s.

Sanity checks per scenario:
- Console: no first-party errors during page load (3rd-party tracker noise filtered).
- Network: no 4xx/5xx responses for `*.dhmguide.com` assets.

## How to run

```bash
# Production (default)
npx playwright test --config=playwright.affiliate.config.js

# Vercel preview
PLAYWRIGHT_BASE_URL=https://dhm-guide-website-<branch>.vercel.app \
  npx playwright test --config=playwright.affiliate.config.js

# Single test
npx playwright test --config=playwright.affiliate.config.js \
  -g "/reviews: first product card"
```

## Run result (2026-04-25, against `https://www.dhmguide.com`)

```
Running 4 tests using 4 workers
✘ desktop /reviews: first product card affiliate button works end-to-end (12.3s)
✘ desktop /compare: affiliate button works end-to-end (11.6s)
✘ mobile /reviews: affiliate button works on mobile viewport (12.4s)
✘ mobile /compare: affiliate button works on mobile viewport (12.3s)
4 failed
```

### What this tells us about the bug

All 4 tests fail at the **PostHog tracking** step (assertion #7). They pass everything earlier:

- Button is found and visible
- Label matches "Check Price on Amazon"
- `target="_blank"` and `rel` includes `noopener`
- `href` is a valid `amzn.to/...` shortlink
- Clicking the button **does open a new tab** (popup event fires)

But:

- **0 PostHog ingest requests** are seen during the click window
- **0 events** with name `affiliate_link_click` are captured

This is the dead-click signature: the user's click *navigates* (so they leave the page), but the `affiliate_link_click` event never reaches PostHog, so the click is invisible to analytics — which is exactly why dead-click rate looks like it doubled (3.2% → 6.9%, 1.68× worse on mobile). The clicks aren't being tracked at all, so legitimate affiliate clicks are being miscounted as dead clicks elsewhere on the page.

Likely root cause to investigate (sibling agent's job, NOT this suite's job to fix):
- `useAffiliateTracking` hook may not be mounted on `/reviews` or `/compare`
- PostHog `posthog.capture()` may be returning before the `sendBeacon`/`fetch` fires (no `posthog.flush()` on click)
- Click handler may be `preventDefault`-ed in a way that prevents the capture-phase listener from running
- A recent change to the `Reviews.jsx` / `Compare.jsx` `onClick` handlers may be calling `e.stopPropagation()` and breaking the capture-phase listener in `useAffiliateTracking`

## Why this test would have caught the regression

Pre-regression, the click would fire `posthog.capture('affiliate_link_click', ...)` synchronously during the React `onClick`, which queues an HTTP POST to `/ingest/e/`. The Playwright `request` listener intercepts that POST, decodes the body, finds `event: 'affiliate_link_click'`, and the assertion passes. Today, no such request is fired → assertion fails with a clear, attributable error message that points directly at PostHog tracking, not at unrelated UI changes.

## Files added

- `tests/affiliate-tracking.spec.js` (new, 396 lines)
- `playwright.affiliate.config.js` (new, 36 lines)
- `docs/posthog-analysis-2026-04-25/p0d-test-suite.md` (this file)

## Files NOT modified

Per task constraints, no application source was touched:
- `src/hooks/useAffiliateTracking.js` — untouched
- `src/pages/Reviews.jsx` — untouched
- `src/pages/Compare.jsx` — untouched
- `src/lib/posthog.js` — untouched
- `playwright.config.js` — untouched (kept separate config for production runs)

Sibling agents own the fix.
