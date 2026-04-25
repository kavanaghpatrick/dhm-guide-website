// @ts-check
import { test, expect, devices } from '@playwright/test';

/**
 * Affiliate-click P0 regression suite.
 *
 * Why this exists:
 *   PostHog analytics on 2026-04-25 showed dead-click rate doubled
 *   (3.2% -> 6.9%, 1.68x worse on mobile). That means users are clicking
 *   on affiliate buttons that either don't navigate, are missing target/rel
 *   attributes, or aren't firing the `affiliate_link_click` PostHog event.
 *
 * What this suite verifies (per page, per viewport):
 *   1. The affiliate button exists, is visible, has the expected label.
 *   2. `target="_blank"` and `rel` contains `noopener` (security + UX).
 *   3. `href` matches a known affiliate pattern:
 *        - amzn.to shortlinks (Amazon's own affiliate-tagged shortener), OR
 *        - amazon.<tld>/... with a `tag=` affiliate query param.
 *   4. Clicking the button opens a NEW page/tab (popup event fires).
 *   5. Clicking the button fires a PostHog event whose payload decodes
 *      to event name `affiliate_link_click`.
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
 *   - No console errors on page load
 *   - No 404s for affiliate-button-relevant assets
 *
 * Base URL:
 *   PLAYWRIGHT_BASE_URL env var, default https://www.dhmguide.com
 *   (so this can run against Vercel preview deployments too).
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.dhmguide.com';

// Affiliate URL pattern: amzn.to shortlinks OR amazon.<tld> with tag= query param.
// amzn.to is Amazon's own affiliate-tagged shortener; the tag is server-side
// on redirect, so its presence alone is sufficient evidence of affiliate intent.
const AFFILIATE_URL_REGEX =
  /^https?:\/\/(?:www\.)?(?:amzn\.to\/[A-Za-z0-9]+|amazon\.(?:com|co\.uk|ca|de)\/[^\s]*?(?:[?&]tag=[^&\s]+))/i;

// PostHog ingest endpoints we care about. Site proxies via /ingest/* to
// us.i.posthog.com/*, so accept both proxied and direct hosts.
const POSTHOG_EVENT_URL_REGEX =
  /(?:\/ingest|us\.i\.posthog\.com|app\.posthog\.com|us\.posthog\.com)\/(?:e\/?|i\/v0\/e\/?|batch\/?|capture\/?)(?:\?|$)/;

const AFFILIATE_BUTTON_TEXT_REGEX = /(?:check\s+price|buy)\s+on\s+amazon/i;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Decode a PostHog request body into an array of captured events.
 * PostHog sends bodies in a few different formats:
 *   - JSON object  ({ event, properties, ... })
 *   - JSON array   ([ { event, ... }, ... ])
 *   - x-www-form-urlencoded with `data=<base64-or-json>` (older clients)
 *   - lz-string compressed (we don't decompress; we still inspect URL params)
 * Returns [] if the body cannot be parsed.
 */
function decodePosthogBody(request) {
  const out = [];
  try {
    const postData = request.postData();
    if (!postData) return out;

    // Try direct JSON first.
    try {
      const parsed = JSON.parse(postData);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch {
      // Not raw JSON.
    }

    // Try form-encoded `data=...`.
    if (postData.startsWith('data=') || postData.includes('&data=')) {
      const params = new URLSearchParams(postData);
      const data = params.get('data');
      if (data) {
        try {
          // base64-encoded JSON.
          const decoded = Buffer.from(data, 'base64').toString('utf8');
          const parsed = JSON.parse(decoded);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object') return [parsed];
        } catch {
          // try plain JSON in form value
          try {
            const parsed = JSON.parse(decoded);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return [parsed];
          } catch {
            // give up
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return out;
}

/**
 * Attach a PostHog event listener to a page. Returns a getter that resolves
 * (or rejects on timeout) when an event with the given name is seen.
 */
function watchPosthogEvent(page, eventName, { timeoutMs = 10_000 } = {}) {
  /** @type {Array<any>} */
  const seenEvents = [];
  /** @type {Array<{url:string, postLen:number}>} */
  const seenIngestRequests = [];

  const handler = (request) => {
    const url = request.url();
    if (!POSTHOG_EVENT_URL_REGEX.test(url)) return;
    const post = request.postData() || '';
    seenIngestRequests.push({ url, postLen: post.length });
    const events = decodePosthogBody(request);
    for (const ev of events) {
      if (ev && typeof ev === 'object') seenEvents.push(ev);
    }
  };
  page.on('request', handler);

  return {
    async waitFor() {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const hit = seenEvents.find((e) => e?.event === eventName);
        if (hit) return { event: hit, all: seenEvents, ingest: seenIngestRequests };
        await page.waitForTimeout(150);
      }
      return { event: null, all: seenEvents, ingest: seenIngestRequests };
    },
    detach() {
      page.off('request', handler);
    },
    seenEvents,
    seenIngestRequests,
  };
}

/**
 * Find the first visible affiliate button on the page and return its locator
 * + resolved metadata (href, target, rel).
 */
async function locateFirstAffiliateButton(page) {
  // Anchor that points at amzn.to or amazon.<tld>.
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

/**
 * Run the full affiliate-button check against a single URL on a single
 * viewport. Designed to be called from per-viewport test groups.
 */
async function runAffiliateButtonChecks(page, urlPath, label) {
  // ----- Console error capture -----
  /** @type {string[]} */
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ----- Failed-asset capture (404s etc.) -----
  /** @type {Array<{url:string, status:number}>} */
  const badResponses = [];
  page.on('response', (resp) => {
    const status = resp.status();
    if (status >= 400 && status !== 401 && status !== 403) {
      badResponses.push({ url: resp.url(), status });
    }
  });

  // ----- Load the page -----
  const fullUrl = new URL(urlPath, BASE_URL).toString();
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  // Give React hydration + above-fold render time.
  await page.waitForLoadState('networkidle').catch(() => {});

  // ----- 1. Locate first affiliate button -----
  const found = await locateFirstAffiliateButton(page);
  expect(
    found,
    `[${label}] No visible affiliate button found on ${urlPath}. ` +
      `Looked for anchors targeting amzn.to or amazon.<tld>.`
  ).not.toBeNull();
  if (!found) return; // narrow type for TS

  // ----- 2. Button text sanity -----
  // Many product cards' visible text comes from a child <span>; check both.
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
  expect(
    found.href,
    `[${label}] Affiliate button has no href.`
  ).toBeTruthy();
  expect(
    AFFILIATE_URL_REGEX.test(found.href || ''),
    `[${label}] Affiliate href "${found.href}" does not match expected ` +
      `affiliate format (amzn.to/<id> OR amazon.<tld>/... with tag= param).`
  ).toBe(true);

  // ----- 5. Click opens new page + fires PostHog event -----
  const watcher = watchPosthogEvent(page, 'affiliate_link_click', {
    timeoutMs: 8_000,
  });

  // Make sure we don't actually navigate Amazon. We strip the href and
  // re-attach after click + event capture so the click still triggers
  // the React onClick handler / PostHog tracker, but the new tab opens
  // about:blank instead of hitting amzn.to (faster + no rate-limiting).
  const originalHref = found.href;
  await found.link.evaluate((el) => {
    el.dataset._phOriginalHref = el.getAttribute('href') || '';
    el.setAttribute('href', 'about:blank');
  });

  let popup = null;
  try {
    [popup] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 8_000 }).catch(() => null),
      found.link.click({ force: true }),
    ]);
  } finally {
    // Restore href in case the page is reused. Best-effort.
    await found.link
      .evaluate((el) => {
        const orig = el.dataset._phOriginalHref;
        if (orig) el.setAttribute('href', orig);
        delete el.dataset._phOriginalHref;
      })
      .catch(() => {});
  }

  expect(
    popup,
    `[${label}] Clicking affiliate button (${originalHref}) did not open a new ` +
      `tab. This is the dead-click signature -- onClick handler may be ` +
      `swallowing the event, or the anchor is being blocked.`
  ).not.toBeNull();
  if (popup) await popup.close().catch(() => {});

  const result = await watcher.waitFor();
  watcher.detach();

  // Diagnostic: log seen ingest requests so a failure points at root cause.
  if (!result.event) {
    console.log(
      `[${label}] PostHog ingest requests seen during click ` +
        `(${result.ingest.length}):`,
      result.ingest.slice(0, 5)
    );
    console.log(
      `[${label}] Event names captured (${result.all.length}):`,
      result.all.map((e) => e?.event).filter(Boolean).slice(0, 20)
    );
  }

  expect(
    result.event,
    `[${label}] Clicking the affiliate button did NOT fire a PostHog ` +
      `'affiliate_link_click' event within 8s. ` +
      `Saw ${result.ingest.length} ingest request(s) and ` +
      `${result.all.length} decoded event(s). ` +
      `This is the regression -- tracking is broken so dead clicks aren't ` +
      `attributed.`
  ).not.toBeNull();

  // ----- Sanity: no console errors -----
  // Filter known-noisy entries (third-party scripts, ad blockers).
  const significantErrors = consoleErrors.filter(
    (e) =>
      !/posthog|gtm|google|facebook|tiktok|hotjar|sentry|extension/i.test(e)
  );
  expect(
    significantErrors,
    `[${label}] Console errors during page load:\n${significantErrors.join('\n')}`
  ).toEqual([]);

  // ----- Sanity: no 404s for first-party assets -----
  const significantBadResponses = badResponses.filter((r) => {
    // ignore 3rd-party tracking endpoints; we only care about own-domain assets.
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
