// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Behavior contract for the /guide "modern" A/B variant (flag site-modern-v1).
 *
 * These assertions define what the modern variant MUST satisfy to be
 * conversion-safe and shippable. They run under the main playwright.config.js
 * (pnpm test:e2e), across BOTH the chromium (desktop) and "Mobile Chrome"
 * (Pixel 5) projects.
 *
 * The variant is forced deterministically via the URL override:
 *   /guide?exp_site-modern-v1=modern
 * (see src/lib/experimentOverride.js — ?exp_<key>=<variant> beats PostHog).
 *
 * NOTE: /guide has NO affiliate links — every CTA is an internal <Link> (to
 * /reviews, /research, /dhm-dosage-calculator, /never-hungover/*). So there is
 * no affiliate-CTA tracking contract to assert here; we verify the editorial
 * restyle (hero testid, H1, internal links) and conversion-safety guardrails
 * (no same-origin 4xx, no page errors, no horizontal overflow).
 */

const EXPERIMENT_KEY = 'site-modern-v1';
const MODERN_URL = `/guide?exp_${EXPERIMENT_KEY}=modern`;

test.describe('Guide — modern variant behavior', () => {
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

  test('renders the modern hero', async ({ page }) => {
    const hero = page.locator('[data-testid="guide-hero-modern"]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();
  });

  test('H1 is visible', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/complete guide to dhm/i);
  });

  test('key internal links are preserved', async ({ page }) => {
    // The primary funnel link to /reviews must exist (the page's whole job).
    await expect(
      page.locator('a[href="/reviews"]').first(),
      'A link to /reviews must be present in the modern variant'
    ).toBeAttached();

    // Secondary internal destinations preserved from the control.
    for (const href of ['/research', '/dhm-dosage-calculator']) {
      await expect(
        page.locator(`a[href="${href}"]`).first(),
        `A link to ${href} must be preserved`
      ).toHaveCount(1);
    }

    // At least one /never-hungover/* deep link preserved (rich internal linking).
    expect(
      await page.locator('a[href^="/never-hungover/"]').count(),
      'Expected the modern variant to preserve /never-hungover/* internal links'
    ).toBeGreaterThan(0);
  });

  test('primary CTAs are internal links with no onClick and no affiliate rel', async ({
    page,
  }) => {
    // The /guide CTAs are internal <Link>s — they must NOT be marked as affiliate
    // (no nofollow/sponsored/_blank) and must carry no inline onClick handler.
    const reviewsCtas = page.locator('a[href="/reviews"]');
    const count = await reviewsCtas.count();
    expect(count, 'Expected at least one /reviews CTA').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const a = reviewsCtas.nth(i);
      const [rel, target, onclick] = await Promise.all([
        a.getAttribute('rel'),
        a.getAttribute('target'),
        a.getAttribute('onclick'),
      ]);
      expect(rel, `Internal CTA #${i} must not carry an affiliate rel`).toBeNull();
      expect(target, `Internal CTA #${i} must not open a new tab`).toBeNull();
      expect(onclick, `Internal CTA #${i} must not have an inline onClick`).toBeNull();
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
