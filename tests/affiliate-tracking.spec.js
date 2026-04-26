// @ts-check
import { test, expect, devices } from '@playwright/test';

/**
 * Affiliate-click P0 regression suite.
 *
 * Why this exists:
 *   PostHog analytics on 2026-04-25 showed dead-click rate doubled
 *   (3.2% -> 6.9%, 1.68x worse on mobile). That means users are clicking
 *   on affiliate buttons that either don't navigate, are missing target/rel
 *   attributes, or aren't firing the `affiliate_link_click` event.
 *
 * Why this is asserted via `window.dataLayer` (not PostHog network requests):
 *   PostHog's `_is_bot()` UA heuristic detects `HeadlessChrome` and suppresses
 *   the `loaded` callback. Our `trackEvent()` wrapper in `src/lib/posthog.js`
 *   early-returns when `initialized === false`, so every `posthog.capture()`
 *   call is a silent no-op in headless Chromium -- even though tracking is
 *   healthy in real browsers (verified via HogQL query: 13 events in 7 days).
 *
 *   Forensics in `docs/posthog-analysis-2026-04-25/x1-real-browser-repro.md`
 *   and `x2-handler-forensics.md` confirm the React click handler runs
 *   end-to-end: it pushes a fully-formed payload to `window.dataLayer` AFTER
 *   the PostHog capture call. That dataLayer push is therefore the canonical
 *   proof the handler executed, and is what we assert here.
 *
 *   See `useAffiliateTracking.js:160-169`:
 *     if (window.dataLayer) {
 *       window.dataLayer.push({
 *         event: 'affiliate_link_click',
 *         affiliate_url, affiliate_product, affiliate_placement, page_path, ...
 *       });
 *     }
 *
 *   Note the `if (window.dataLayer)` guard -- the array MUST exist before the
 *   click. We pre-create it via `addInitScript`.
 *
 * What this suite verifies (per page, per viewport):
 *   1. The affiliate button exists, is visible, has the expected label.
 *   2. `target="_blank"` and `rel` contains `noopener` (security + UX).
 *   3. `href` matches a known affiliate pattern:
 *        - amzn.to shortlinks (Amazon's own affiliate-tagged shortener), OR
 *        - amazon.<tld>/... with a `tag=` affiliate query param.
 *   4. Clicking the button opens a NEW page/tab (popup event fires).
 *   5. Clicking the button pushes an `affiliate_link_click` entry to
 *      `window.dataLayer` with `affiliate_url` matching the original href.
 *
 * Pages covered:
 *   - /reviews
 *   - /compare
 *
 * Viewports:
 *   - Default (desktop)
 *   - iPhone 13 mobile (390x844) -- mobile dead-click rate is 1.68x desktop
 *
 * Sanity checks:
 *   - No console errors on page load (filtered to first-party origins)
 *   - No 404s for first-party assets
 *
 * Base URL:
 *   PLAYWRIGHT_BASE_URL env var, default https://www.dhmguide.com
 *   (so this can run against Vercel preview deployments too).
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.dhmguide.com';

// Affiliate URL pattern: amzn.to shortlinks OR amazon.<tld> with tag= query param.
const AFFILIATE_URL_REGEX =
  /^https?:\/\/(?:www\.)?(?:amzn\.to\/[A-Za-z0-9]+|amazon\.(?:com|co\.uk|ca|de)\/[^\s]*?(?:[?&]tag=[^&\s]+))/i;

const AFFILIATE_BUTTON_TEXT_REGEX = /(?:check\s+price|buy)\s+on\s+amazon/i;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Block actual Amazon nav at network layer; click handler still sees real href. */
async function blockAmazonNavigation(context) {
  await context.route(
    /^https?:\/\/(?:www\.)?(?:amzn\.to|amazon\.(?:com|co\.uk|ca|de))\//i,
    (route) => route.abort()
  );
}

/** Pre-seed window.dataLayer = [] before any page script runs. */
async function seedDataLayer(context) {
  await context.addInitScript(() => {
    window.dataLayer = window.dataLayer || [];
  });
}

/** Poll dataLayer for an affiliate_link_click entry matching expectedUrl. */
async function waitForAffiliateDataLayerPush(page, expectedUrl, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await page.evaluate(
      ({ expected }) => {
        const dl = window.dataLayer || [];
        for (const entry of dl) {
          if (
            entry &&
            typeof entry === 'object' &&
            entry.event === 'affiliate_link_click' &&
            entry.affiliate_url === expected
          ) {
            return entry;
          }
        }
        return null;
      },
      { expected: expectedUrl }
    );
    if (found) return found;
    await page.waitForTimeout(100);
  }
  return null;
}

/** Snapshot dataLayer for diagnostic logging on failure. */
async function snapshotDataLayer(page) {
  return page
    .evaluate(() => {
      const dl = window.dataLayer || [];
      return dl.map((e) => {
        if (!e || typeof e !== 'object') return e;
        const out = {};
        for (const k of Object.keys(e)) {
          const v = e[k];
          if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) {
            out[k] = v;
          } else {
            out[k] = `[${typeof v}]`;
          }
        }
        return out;
      });
    })
    .catch(() => []);
}

/** Find the first visible affiliate button. */
async function locateFirstAffiliateButton(page) {
  const candidates = page.locator(
    'a[href*="amzn.to/"], a[href*="amazon.com/"], a[href*="amazon.co.uk/"], a[href*="amazon.ca/"], a[href*="amazon.de/"]'
  );

  const count = await candidates.count();
  for (let i = 0; i < count; i++) {
    const link = candidates.nth(i);
    if (!(await link.isVisible().catch(() => false))) continue;
    const href = await link.getAttribute('href');
    const target = await link.getAttribute('target');
    const rel = await link.getAttribute('rel');
    const text = (await link.textContent())?.trim() ?? '';
    return { link, href, target, rel, text, index: i, totalCount: count };
  }
  return null;
}

async function runAffiliateButtonChecks(page, urlPath, label) {
  const context = page.context();

  // Pre-seed window.dataLayer + block Amazon nav before any page load.
  await seedDataLayer(context);
  await blockAmazonNavigation(context);

  /** @type {Array<{text:string, location:string}>} */
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location();
    consoleErrors.push({
      text: msg.text(),
      location: (loc && loc.url) || '',
    });
  });

  /** @type {Array<{url:string, status:number}>} */
  const badResponses = [];
  page.on('response', (resp) => {
    const status = resp.status();
    if (status >= 400 && status !== 401 && status !== 403) {
      badResponses.push({ url: resp.url(), status });
    }
  });

  const fullUrl = new URL(urlPath, BASE_URL).toString();
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});

  // ----- 1. Locate first affiliate button -----
  const found = await locateFirstAffiliateButton(page);
  expect(
    found,
    `[${label}] No visible affiliate button found on ${urlPath}. ` +
      `Looked for anchors targeting amzn.to or amazon.<tld>.`
  ).not.toBeNull();
  if (!found) return;

  // ----- 2. Button text sanity -----
  const fullText =
    (await found.link.innerText().catch(() => found.text)) || found.text;
  expect(
    AFFILIATE_BUTTON_TEXT_REGEX.test(fullText),
    `[${label}] First affiliate button text "${fullText}" does not match ` +
      `expected "Check Price on Amazon" / "Buy on Amazon".`
  ).toBe(true);

  // ----- 3. target / rel -----
  expect(
    found.target,
    `[${label}] Affiliate button is missing target="_blank" (got ${JSON.stringify(found.target)}).`
  ).toBe('_blank');
  expect(
    (found.rel || '').toLowerCase(),
    `[${label}] Affiliate button rel="${found.rel}" does not include "noopener".`
  ).toContain('noopener');

  // ----- 4. href format -----
  expect(found.href, `[${label}] Affiliate button has no href.`).toBeTruthy();
  expect(
    AFFILIATE_URL_REGEX.test(found.href || ''),
    `[${label}] Affiliate href "${found.href}" does not match expected ` +
      `affiliate format (amzn.to/<id> OR amazon.<tld>/... with tag= param).`
  ).toBe(true);

  // ----- 5. Click opens new page + click handler runs (dataLayer push) -----
  // We do NOT modify the href -- the hook checks `isAffiliateLink(href)` and
  // would early-return for `about:blank`. Instead we abort the network nav
  // (already done above via context.route), so the click handler sees the
  // real Amazon URL, runs to completion, and pushes to dataLayer.
  const originalHref = found.href;

  let popup = null;
  [popup] = await Promise.all([
    context.waitForEvent('page', { timeout: 8_000 }).catch(() => null),
    found.link.click({ force: true }),
  ]);

  expect(
    popup,
    `[${label}] Clicking affiliate button (${originalHref}) did not open a new ` +
      `tab. This is the dead-click signature -- onClick handler may be ` +
      `swallowing the event, or the anchor is being blocked.`
  ).not.toBeNull();
  if (popup) await popup.close().catch(() => {});

  const pushed = await waitForAffiliateDataLayerPush(page, originalHref, 5_000);

  if (!pushed) {
    const dlSnapshot = await snapshotDataLayer(page);
    console.log(
      `[${label}] dataLayer snapshot (${dlSnapshot.length} entries):`,
      JSON.stringify(dlSnapshot, null, 2)
    );
  }

  expect(
    pushed,
    `[${label}] Clicking the affiliate button did NOT push an ` +
      `'affiliate_link_click' entry to window.dataLayer within 5s. ` +
      `Expected affiliate_url="${originalHref}". ` +
      `This means the React click handler in useAffiliateTracking.js ` +
      `did not execute end-to-end -- the regression we care about.`
  ).not.toBeNull();

  if (pushed) {
    expect(
      pushed.affiliate_url,
      `[${label}] dataLayer push has wrong affiliate_url.`
    ).toBe(originalHref);
    expect(
      typeof pushed.affiliate_product === 'string' &&
        pushed.affiliate_product.length > 0,
      `[${label}] dataLayer push is missing affiliate_product (got ${JSON.stringify(pushed.affiliate_product)}).`
    ).toBe(true);
    expect(
      typeof pushed.affiliate_placement === 'string' &&
        pushed.affiliate_placement.length > 0,
      `[${label}] dataLayer push is missing affiliate_placement (got ${JSON.stringify(pushed.affiliate_placement)}).`
    ).toBe(true);
    expect(
      typeof pushed.page_path === 'string' && pushed.page_path.length > 0,
      `[${label}] dataLayer push is missing page_path (got ${JSON.stringify(pushed.page_path)}).`
    ).toBe(true);
  }

  // ----- Sanity: no console errors -----
  // We only care about FIRST-PARTY errors. Generic browser network-failure
  // messages ("Failed to load resource: 400") don't include the URL in
  // `msg.text()` -- the URL is only in `msg.location().url`. Many third-party
  // scripts (PostHog, Microsoft Clarity, GTM, ads) bot-detect headless
  // Chromium and 400 their own beacons; that's noise, not a regression.
  //
  // Decision rule: an error is significant ONLY if its location URL is
  // first-party (dhmguide.com) AND its text isn't a known-noisy keyword.
  // Errors with no location (inline / unknown origin) fall back to keyword
  // filtering.
  const NOISY_KEYWORD = /posthog|\/ingest\/|gtm|google|facebook|tiktok|hotjar|sentry|extension|clarity|amzn\.to|amazon\.(?:com|co\.uk|ca|de)/i;
  const significantErrors = consoleErrors.filter((e) => {
    let isFirstParty = true;
    if (e.location) {
      try {
        const u = new URL(e.location);
        isFirstParty = u.hostname.endsWith('dhmguide.com');
      } catch {
        isFirstParty = false;
      }
    }
    if (!isFirstParty) return false;
    if (NOISY_KEYWORD.test(e.text)) return false;
    return true;
  });
  expect(
    significantErrors,
    `[${label}] Console errors during page load:\n` +
      significantErrors.map((e) => `  ${e.text} (${e.location})`).join('\n')
  ).toEqual([]);

  // ----- Sanity: no 404s for first-party assets -----
  const significantBadResponses = badResponses.filter((r) => {
    try {
      const u = new URL(r.url);
      return u.hostname.endsWith('dhmguide.com');
    } catch {
      return false;
    }
  });
  expect(
    significantBadResponses,
    `[${label}] First-party 4xx/5xx responses during page load:\n` +
      significantBadResponses
        .map((r) => `  ${r.status} ${r.url}`)
        .join('\n')
  ).toEqual([]);
}

// -----------------------------------------------------------------------------
// Test groups
// -----------------------------------------------------------------------------

test.describe('Affiliate tracking regression (desktop)', () => {
  test.use({ baseURL: BASE_URL });

  test('/reviews: first product card affiliate button works end-to-end', async ({
    page,
  }) => {
    await runAffiliateButtonChecks(page, '/reviews', 'desktop /reviews');
  });

  test('/compare: affiliate button works end-to-end', async ({ page }) => {
    await runAffiliateButtonChecks(page, '/compare', 'desktop /compare');
  });
});

test.describe('Affiliate tracking regression (mobile - iPhone 13)', () => {
  test.use({
    baseURL: BASE_URL,
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });

  test('/reviews: affiliate button works on mobile viewport', async ({
    page,
  }) => {
    await runAffiliateButtonChecks(page, '/reviews', 'mobile /reviews');
  });

  test('/compare: affiliate button works on mobile viewport', async ({
    page,
  }) => {
    await runAffiliateButtonChecks(page, '/compare', 'mobile /compare');
  });
});
