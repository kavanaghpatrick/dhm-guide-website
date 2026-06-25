// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Visual-regression baseline for the /reviews "modern" A/B variant.
 *
 * Runs under playwright.visual.config.js (pnpm test:visual) across the
 * Desktop Chrome + Pixel 5 projects, so each toHaveScreenshot below produces
 * BOTH a desktop and a mobile baseline automatically (project name is in the
 * snapshot path — no per-viewport duplication needed here).
 *
 * Determinism:
 *   - reducedMotion 'reduce' + colorScheme 'light' + animations:'disabled'
 *     (config-level) freeze motion/scheme.
 *   - We await document.fonts.ready so Fraunces/Inter are painted before capture.
 *   - Dynamic price/rating nodes are masked so a data refresh never flips the
 *     baseline. Add a data-visual-mask attribute (or matching class) on any node
 *     whose text legitimately changes between runs.
 *
 * Baselines are generated later via: pnpm test:visual:update
 */

const MODERN_URL = '/reviews?exp_reviews-modern-v1=modern';

/** Selectors whose CONTENT is dynamic and must be masked out of the diff. */
const DYNAMIC_MASK_SELECTORS = [
  '[data-visual-mask]',
  '[data-testid="product-price"]',
  '[data-testid="product-rating"]',
  '.product-price',
  '.product-rating',
];

/** @param {import('@playwright/test').Page} page */
async function prepare(page) {
  await page.goto(MODERN_URL);
  await page.waitForLoadState('domcontentloaded');
  // Fonts must be painted before we screenshot, or the baseline flickers.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

/** @param {import('@playwright/test').Page} page */
function masks(page) {
  return DYNAMIC_MASK_SELECTORS.map((sel) => page.locator(sel));
}

test.describe('Visual — /reviews modern variant', () => {
  test('hero', async ({ page }) => {
    await prepare(page);
    const hero = page.locator('[data-testid="reviews-hero-modern"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('reviews-modern-hero.png', {
      mask: masks(page),
    });
  });

  test('winner card', async ({ page }) => {
    await prepare(page);
    const winner = page.locator('[data-testid="reviews-winner-card"]');
    await expect(winner).toBeVisible();
    await expect(winner).toHaveScreenshot('reviews-modern-winner-card.png', {
      mask: masks(page),
    });
  });

  // NOTE: the comparison table is covered by the full-page snapshot below. An
  // element-level snapshot of #comparison-table proved non-deterministic on the
  // desktop project (sub-pixel column reflow on a wide table) while stable on
  // mobile, so we rely on the full-page capture to catch table regressions.

  test('full page', async ({ page }) => {
    await prepare(page);
    await expect(page).toHaveScreenshot('reviews-modern-full.png', {
      fullPage: true,
      mask: masks(page),
    });
  });
});
