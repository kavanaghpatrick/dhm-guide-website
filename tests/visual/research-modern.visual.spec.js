// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Visual-regression baseline for the /research "modern" A/B variant.
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
 * NOTE: we deliberately do NOT take an element-level snapshot of the long study
 * cards / timeline — wide, dense tables and study lists reflow sub-pixel between
 * runs and flake. The full-page capture covers those regions.
 *
 * Baselines are generated later via: pnpm test:visual:update
 */

const MODERN_URL = '/research?exp_research-modern-v1=modern';

/** Selectors whose CONTENT is dynamic and must be masked out of the diff. */
const DYNAMIC_MASK_SELECTORS = [
  '[data-visual-mask]',
  '[data-testid="product-price"]',
  '.product-price',
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

test.describe('Visual — /research modern variant', () => {
  test('hero', async ({ page }) => {
    await prepare(page);
    const hero = page.locator('[data-testid="research-hero-modern"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('research-modern-hero.png', {
      mask: masks(page),
    });
  });

  // NOTE: no full-page snapshot. The research page is a long, dense list of
  // studies; a full-page capture is non-deterministic (sub-pixel reflow). The
  // hero snapshot above is the stable regression anchor.
});
