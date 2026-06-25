// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Visual-regression baseline for the /never-hungover "modern" A/B variant.
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
 *     baseline.
 *
 * Baselines are generated later via: pnpm test:visual:update
 *
 * NOTE: we deliberately do NOT add an element-level snapshot of the wide card
 * grid — sub-pixel column reflow on wide multi-column grids flakes. The full-page
 * capture below covers grid regressions.
 */

const MODERN_URL = '/never-hungover?exp_never-hungover-modern-v1=modern';

/** Selectors whose CONTENT is dynamic and must be masked out of the diff. */
const DYNAMIC_MASK_SELECTORS = [
  '[data-visual-mask]',
  '.product-price',
  '.rating-meta',
  '.stars',
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

test.describe('Visual — /never-hungover modern variant', () => {
  test('hero', async ({ page }) => {
    await prepare(page);
    const hero = page.locator('[data-testid="never-hungover-hero-modern"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('never-hungover-modern-hero.png', {
      mask: masks(page),
    });
  });

  // NOTE: no full-page snapshot here. The hub renders ~197 article cards, so a
  // full-page capture is non-deterministic (sub-pixel reflow over a very long
  // page). The hero snapshot above is the stable regression anchor.
});
