// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Visual-regression baseline for the Home "modern" A/B variant.
 *
 * Runs under playwright.visual.config.js (pnpm test:visual) across the
 * Desktop Chrome + Pixel 5 projects, producing desktop + mobile baselines for
 * each screenshot (project name is encoded in the snapshot path).
 *
 * Determinism: reducedMotion/colorScheme/animations are frozen at config level;
 * we await document.fonts.ready and mask dynamic price/rating nodes so a data
 * refresh never flips a baseline.
 *
 * Baselines are generated later via: pnpm test:visual:update
 */

const MODERN_URL = '/?exp_home-modern-v1=modern';

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
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

/** @param {import('@playwright/test').Page} page */
function masks(page) {
  return DYNAMIC_MASK_SELECTORS.map((sel) => page.locator(sel));
}

test.describe('Visual — Home modern variant', () => {
  test('hero', async ({ page }) => {
    await prepare(page);
    const hero = page.locator('[data-testid="home-hero-modern"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('home-modern-hero.png', {
      mask: masks(page),
    });
  });

  test('full page', async ({ page }) => {
    await prepare(page);
    await expect(page).toHaveScreenshot('home-modern-full.png', {
      fullPage: true,
      mask: masks(page),
    });
  });
});
