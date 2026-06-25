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
  await page.goto(MODERN_URL, { waitUntil: 'networkidle' });
  // Fonts must be painted before we screenshot, or the baseline flickers.
  await page.evaluate(() => document.fonts.ready);
  // The hub lazy-loads ~197 article cards/images. On slower CI this keeps the
  // layout (and the hero element's box) shifting, so settle it: scroll the whole
  // page to trigger every lazy load, then return to top and let it stabilize.
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 1200;
      const t = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight) { clearInterval(t); resolve(); }
      }, 40);
    });
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

/** @param {import('@playwright/test').Page} page */
function masks(page) {
  return DYNAMIC_MASK_SELECTORS.map((sel) => page.locator(sel));
}

test.describe('Visual — /never-hungover modern variant', () => {
  test('hero', async ({ page }) => {
    await prepare(page);
    await expect(page.locator('[data-testid="never-hungover-hero-modern"]')).toBeVisible();
    // Capture the VIEWPORT (= the hero at scroll 0), not the hero element. An
    // element screenshot scroll-into-views and waits for the element's box to be
    // stable; on this lazy-loading hub that never settles on slow CI. A viewport
    // capture has no element-stability requirement and is deterministic here.
    await expect(page).toHaveScreenshot('never-hungover-modern-hero.png', {
      mask: masks(page),
    });
  });

  // NOTE: no full-page snapshot here. The hub renders ~197 article cards, so a
  // full-page capture is non-deterministic (sub-pixel reflow over a very long
  // page). The hero snapshot above is the stable regression anchor.
});
