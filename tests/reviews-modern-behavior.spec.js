// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Behavior contract for the /reviews "modern" A/B variant (flag site-modern-v1).
 *
 * RED until the variant is built. These assertions define what the modern
 * variant MUST satisfy to be conversion-safe and shippable. They run under the
 * main playwright.config.js (pnpm test:e2e), across BOTH the chromium (desktop)
 * and "Mobile Chrome" (Pixel 5) projects — the mobile-only CTA tap-target check
 * is gated to the mobile viewport so it exercises the Pixel 5 project.
 *
 * The variant is forced deterministically via the URL override:
 *   /reviews?exp_site-modern-v1=modern
 * (see src/lib/experimentOverride.js — ?exp_<key>=<variant> beats PostHog).
 *
 * NOTE: we deliberately do NOT click affiliate links here. This suite runs
 * against a local dev server; clicking would navigate to Amazon. We assert the
 * affiliate CTA *contract* (href + data-* attributes + rel/target) statically.
 * Click-through end-to-end behavior is covered by tests/affiliate-tracking.spec.js.
 */

const EXPERIMENT_KEY = 'site-modern-v1';
const MODERN_URL = `/reviews?exp_${EXPERIMENT_KEY}=modern`;

/** Tailwind/oklch rgb values for the orange CTA hue (must NOT appear on filters). */
const ORANGE_RGB = [
  'rgb(249, 115, 22)', // orange-500
  'rgb(234, 88, 12)', // orange-600 / cta-hover
];

test.describe('Reviews — modern variant behavior', () => {
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

  test('renders the modern winner card', async ({ page }) => {
    const winnerCard = page.locator('[data-testid="reviews-winner-card"]');
    await expect(winnerCard).toHaveCount(1);
    await expect(winnerCard).toBeVisible();
  });

  test('comparison table marks exactly one winner (responsive: row on desktop, card on mobile)', async ({ page }) => {
    // The modern table renders a desktop <table> (winner = comparison-winner-row) and,
    // below 640px, stacked product cards (winner = comparison-winner-card). Exactly one
    // winner marker is VISIBLE in whichever layout the viewport gets.
    const visibleWinner = page.locator(
      '[data-testid="comparison-winner-row"]:visible, [data-testid="comparison-winner-card"]:visible'
    );
    await expect(visibleWinner).toHaveCount(1);
  });

  test('every Check Price affiliate link carries the modern tracking contract', async ({
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
      const [expKey, variant, componentId, rel, target] = await Promise.all([
        a.getAttribute('data-experiment-key'),
        a.getAttribute('data-variant'),
        a.getAttribute('data-component-id'),
        a.getAttribute('rel'),
        a.getAttribute('target'),
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
      expect(
        relLower,
        `CTA #${i}: rel="${rel}" must contain "nofollow"`
      ).toContain('nofollow');
      expect(
        relLower,
        `CTA #${i}: rel="${rel}" must contain "sponsored"`
      ).toContain('sponsored');

      expect(
        target,
        `CTA #${i}: target must be "_blank" (got ${JSON.stringify(target)})`
      ).toBe('_blank');
    }
  });

  test('active "Best For" filter is GREEN, not orange (orange discipline)', async ({
    page,
  }) => {
    // Activate a Best-For filter. The modern variant must color the active
    // state green (brand), reserving orange exclusively for affiliate CTAs.
    const filterBtn = page.getByRole('button', { name: /best overall/i }).first();
    await expect(
      filterBtn,
      'A "Best Overall" Best-For filter button must exist in the modern variant'
    ).toBeVisible();
    await filterBtn.click();
    await page.waitForTimeout(300);

    // The modern variant styles the active state via scoped theme CSS (not
    // Tailwind bg-* utilities), so assert on the COMPUTED color, which is the
    // real contract: the active filter reads as brand green and is never orange.
    const bg = await filterBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const rgb = (bg.match(/\d+/g) ?? []).map(Number);
    const [r, g, b] = rgb;

    expect(
      ORANGE_RGB.includes(bg),
      `Active filter computed backgroundColor ${bg} must not be the orange CTA hue. Orange is reserved for affiliate CTAs.`
    ).toBe(false);
    expect(
      rgb.length >= 3 && g > r && g > b,
      `Active "Best Overall" filter must read as brand green (green channel dominant); got ${bg}.`
    ).toBe(true);
  });

  test('mobile Check Price CTA meets the 44px tap-target minimum', async ({
    page,
  }) => {
    // Runs meaningfully under the Pixel 5 ("Mobile Chrome") project. On desktop
    // viewports the WCAG mobile tap-target rule does not apply, so skip there.
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    test.skip(!isMobile, 'mobile tap-target check only applies on mobile viewport');

    const ctas = page.locator('a', { hasText: /check price/i });
    const count = await ctas.count();
    expect(count, 'Expected at least one Check Price CTA on mobile').toBeGreaterThan(0);

    let measuredAny = false;
    for (let i = 0; i < count; i++) {
      const a = ctas.nth(i);
      if (!(await a.isVisible())) continue;
      const box = await a.boundingBox();
      if (!box) continue;
      measuredAny = true;
      expect(
        box.height,
        `Mobile CTA #${i} height ${box.height}px is below the 44px tap-target minimum`
      ).toBeGreaterThanOrEqual(43.5); // 43.5 tolerates sub-pixel rounding
    }
    expect(measuredAny, 'No visible mobile CTA could be measured').toBe(true);
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
