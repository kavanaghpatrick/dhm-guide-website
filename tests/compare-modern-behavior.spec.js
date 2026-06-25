// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Behavior contract for the /compare "modern" A/B variant (flag compare-modern-v1).
 *
 * These assertions define what the modern variant MUST satisfy to be
 * conversion-safe and shippable. They run under the main playwright.config.js
 * (pnpm test:e2e), across BOTH the chromium (desktop) and "Mobile Chrome"
 * (Pixel 5) projects.
 *
 * The variant is forced deterministically via the URL override:
 *   /compare?exp_compare-modern-v1=modern
 * (see src/lib/experimentOverride.js — ?exp_<key>=<variant> beats PostHog).
 *
 * NOTE: we deliberately do NOT click affiliate links here. This suite runs
 * against a local dev server; clicking would navigate off-site. We assert the
 * affiliate CTA *contract* (href + data-* attributes + rel/target) statically.
 */

const EXPERIMENT_KEY = 'compare-modern-v1';
const MODERN_URL = `/compare?exp_${EXPERIMENT_KEY}=modern`;

test.describe('Compare — modern variant behavior', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Ignore third-party network noise: analytics/pixels (Clarity, GA) fail in
      // local dev with placeholder IDs and produce a generic "Failed to load
      // resource" console error on every page (control included). Real JS errors
      // and app-origin HTTP failures are still captured below.
      if (/Failed to load resource/i.test(text)) return;
      errors.push(`console: ${text}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    // A genuinely broken variant asset (e.g. a missing font/chunk) is served from
    // localhost — those 4xx/5xx DO fail the suite; third-party domains do not.
    page.on('response', (resp) => {
      if (resp.status() >= 400 && /localhost|127\.0\.0\.1/.test(resp.url())) {
        errors.push(`http ${resp.status()}: ${resp.url()}`);
      }
    });

    await page.goto(MODERN_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('renders the modern hero and H1', async ({ page }) => {
    const hero = page.locator('[data-testid="compare-hero-modern"]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/compare dhm supplements/i);
  });

  test('preserves key internal links', async ({ page }) => {
    // Cross-page CTAs the control links to must survive the restyle.
    await expect(page.locator('a[href="/reviews"]').first()).toBeAttached();
    await expect(page.locator('a[href="/guide"]').first()).toBeAttached();
    // At least one head-to-head matchup link + the "explore more" hub link.
    expect(
      await page.locator('a[href^="/never-hungover/"]').count(),
      'Expected head-to-head matchup links to /never-hungover/<slug>'
    ).toBeGreaterThan(0);
    await expect(
      page.locator('a[href="/never-hungover?tag=comparison"]').first()
    ).toBeVisible();
  });

  test('every affiliate CTA carries the modern tracking contract and no onClick', async ({
    page,
  }) => {
    // All "Check Price on Amazon" affiliate anchors on the page.
    const ctas = page.locator('a', { hasText: /check price/i });
    const count = await ctas.count();
    expect(
      count,
      'Expected at least one "Check Price" affiliate link in the modern variant'
    ).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const a = ctas.nth(i);
      const [expKey, variant, componentId, rel, target, onclick] = await Promise.all([
        a.getAttribute('data-experiment-key'),
        a.getAttribute('data-variant'),
        a.getAttribute('data-component-id'),
        a.getAttribute('rel'),
        a.getAttribute('target'),
        a.getAttribute('onclick'),
      ]);

      expect(
        expKey,
        `CTA #${i}: data-experiment-key must be "${EXPERIMENT_KEY}" (got ${JSON.stringify(expKey)})`
      ).toBe(EXPERIMENT_KEY);
      expect(
        variant,
        `CTA #${i}: data-variant must be "modern" (got ${JSON.stringify(variant)})`
      ).toBe('modern');
      expect(
        (componentId || '').length,
        `CTA #${i}: data-component-id must be non-empty (got ${JSON.stringify(componentId)})`
      ).toBeGreaterThan(0);

      const relLower = (rel || '').toLowerCase();
      expect(relLower, `CTA #${i}: rel="${rel}" must contain "nofollow"`).toContain('nofollow');
      expect(relLower, `CTA #${i}: rel="${rel}" must contain "sponsored"`).toContain('sponsored');

      expect(
        target,
        `CTA #${i}: target must be "_blank" (got ${JSON.stringify(target)})`
      ).toBe('_blank');

      // The global listener fires affiliate_link_click; a per-link onClick would
      // double-count. The contract is: NO inline onClick.
      expect(
        onclick,
        `CTA #${i}: affiliate links must NOT carry an inline onClick (got ${JSON.stringify(onclick)})`
      ).toBeNull();
    }
  });

  test('no console/page errors and no horizontal overflow', async ({ page }) => {
    // Errors accumulated during load (see beforeEach).
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);

    // No horizontal scroll (4px tolerance for sub-pixel rounding).
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scrollWidth,
      `Horizontal overflow: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth} + 4`
    ).toBeLessThanOrEqual(overflow.clientWidth + 4);
  });
});
