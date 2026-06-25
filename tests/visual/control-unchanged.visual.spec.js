// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Control-unchanged guard for the design-modernization sprint.
 *
 * The modern build is flag-gated: with NO experiment override, /reviews and /
 * MUST render the CONTROL pages byte-identical to today. This suite pins their
 * appearance so any accidental bleed from the modern variant into shared/control
 * code (Reviews.jsx, Home.jsx, Layout.jsx, ui/card.jsx, ui/button.jsx, etc.)
 * shows up as a pixel diff.
 *
 * Runs under playwright.visual.config.js (pnpm test:visual) across Desktop
 * Chrome + Pixel 5, so each screenshot yields desktop + mobile control baselines.
 *
 * IMPORTANT: visit the bare URLs with NO ?exp_ override — these are control.
 *
 * Baselines are generated later via: pnpm test:visual:update
 */

/** Selectors whose CONTENT is dynamic and must be masked out of the diff. */
const DYNAMIC_MASK_SELECTORS = [
  '[data-visual-mask]',
  '[data-testid="product-price"]',
  '[data-testid="product-rating"]',
  '.product-price',
  '.product-rating',
];

/** @param {import('@playwright/test').Page} page @param {string} url */
async function prepare(page, url) {
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

/** @param {import('@playwright/test').Page} page */
function masks(page) {
  return DYNAMIC_MASK_SELECTORS.map((sel) => page.locator(sel));
}

test.describe('Visual — control pages unchanged (no override)', () => {
  test('reviews control', async ({ page }) => {
    await prepare(page, '/reviews');
    await expect(page).toHaveScreenshot('reviews-control.png', {
      fullPage: true,
      mask: masks(page),
    });
  });

  test('home control', async ({ page }) => {
    await prepare(page, '/');
    await expect(page).toHaveScreenshot('home-control.png', {
      fullPage: true,
      mask: masks(page),
    });
  });
});
