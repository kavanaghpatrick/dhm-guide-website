// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Behavior contract for the Home "modern" A/B variant (flag site-modern-v1).
 *
 * RED until the variant is built. Runs under the main playwright.config.js
 * (pnpm test:e2e) across the chromium + "Mobile Chrome" (Pixel 5) projects.
 *
 * Variant forced via URL override:
 *   /?exp_site-modern-v1=modern
 * (see src/lib/experimentOverride.js — ?exp_<key>=<variant> beats PostHog).
 *
 * We assert the affiliate CTA *contract* statically (no click) — end-to-end
 * click behavior is covered by tests/affiliate-tracking.spec.js.
 */

const EXPERIMENT_KEY = 'site-modern-v1';
const MODERN_URL = `/?exp_${EXPERIMENT_KEY}=modern`;

test.describe('Home — modern variant behavior', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Ignore third-party analytics/pixel network noise (Clarity, GA) that fails
      // in local dev with placeholder IDs on every page (control included).
      if (/Failed to load resource/i.test(text)) return;
      errors.push(`console: ${text}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('response', (resp) => {
      if (resp.status() >= 400 && /localhost|127\.0\.0\.1/.test(resp.url())) {
        errors.push(`http ${resp.status()}: ${resp.url()}`);
      }
    });

    await page.goto(MODERN_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('renders the modern hero with a visible H1', async ({ page }) => {
    const hero = page.locator('[data-testid="home-hero-modern"]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();

    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible();
  });

  test('exposes internal links to /reviews and /guide', async ({ page }) => {
    const reviewsLink = page.locator('a[href="/reviews"], a[href^="/reviews?"], a[href^="/reviews#"]');
    const guideLink = page.locator('a[href="/guide"], a[href^="/guide?"], a[href^="/guide#"]');

    expect(
      await reviewsLink.count(),
      'Modern home must link to /reviews'
    ).toBeGreaterThan(0);
    expect(
      await guideLink.count(),
      'Modern home must link to /guide'
    ).toBeGreaterThan(0);
  });

  test('any affiliate CTA carries the modern tracking contract', async ({
    page,
  }) => {
    // The home variant may or may not surface affiliate product CTAs; if it
    // does, EVERY one must carry the home-modern tracking attributes.
    const ctas = page.locator('a', { hasText: /check price/i });
    const count = await ctas.count();

    for (let i = 0; i < count; i++) {
      const a = ctas.nth(i);
      const [expKey, variant, componentId] = await Promise.all([
        a.getAttribute('data-experiment-key'),
        a.getAttribute('data-variant'),
        a.getAttribute('data-component-id'),
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
    }
  });

  test('no console errors and no horizontal overflow', async ({ page }) => {
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);

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
