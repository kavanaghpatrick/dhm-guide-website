// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * After-portal-fix verification.
 *
 * Tests that the Topics mega-menu dropdown renders ABOVE all page content
 * by checking that the topmost element at points inside the dropdown
 * are descendants of the dropdown itself (not page content underneath).
 *
 * Runs against PRODUCTION: https://www.dhmguide.com
 */

const SCREENSHOT_DIR = path.resolve(
  process.cwd(),
  'docs/layering-audit-2026-04-26/screenshots'
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TRIGGER_SELECTOR = '[data-track="nav-topics-trigger"]';
const DROPDOWN_SELECTOR = '#topics-mega-menu';

test.describe('Mega-menu portal fix verification', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('dropdown is portaled to body and renders above page content', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle' });

    // Confirm trigger present
    const trigger = page.locator(TRIGGER_SELECTOR);
    await expect(trigger).toBeVisible();

    // Hover trigger to open dropdown
    await trigger.hover();
    await page.waitForSelector(DROPDOWN_SELECTOR, { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(500);

    // Verify dropdown is a direct child of <body>, not nested inside <header>
    const isPortaled = await page.evaluate((sel) => {
      const dd = document.querySelector(sel);
      if (!dd) return { exists: false };
      // Walk up: should hit document.body before any <header>
      let cur = dd.parentElement;
      let firstAncestorTag = cur ? cur.tagName.toLowerCase() : null;
      while (cur) {
        if (cur.tagName === 'HEADER') return { exists: true, portaled: false, parent: firstAncestorTag };
        if (cur === document.body) return { exists: true, portaled: true, parent: firstAncestorTag };
        cur = cur.parentElement;
      }
      return { exists: true, portaled: false, parent: firstAncestorTag };
    }, DROPDOWN_SELECTOR);

    console.log('Portal check:', isPortaled);
    expect(isPortaled.exists).toBe(true);
    expect(isPortaled.portaled).toBe(true);

    // Take screenshot showing dropdown over hero
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'after-portal-fix.png'),
      fullPage: false,
    });

    // Verify NO overlap: sample points inside the dropdown's visible portion
    // and confirm topmost element at each point is the dropdown or a descendant.
    const overlap = await page.evaluate((sel) => {
      const dd = document.querySelector(sel);
      if (!dd) return { error: 'dropdown not found' };
      const r = dd.getBoundingClientRect();
      const vpW = window.innerWidth, vpH = window.innerHeight;
      const left = Math.max(0, r.left + 5);
      const top = Math.max(0, r.top + 5);
      const right = Math.min(vpW, r.right - 5);
      const bottom = Math.min(vpH, r.bottom - 5);
      const cols = 6, rows = 4;
      const overlaps = [];
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          const x = left + (cx * (right - left) / (cols - 1));
          const y = top + (cy * (bottom - top) / (rows - 1));
          const stack = document.elementsFromPoint(x, y);
          const topMost = stack[0];
          if (topMost && !dd.contains(topMost) && topMost !== dd) {
            overlaps.push({
              x: Math.round(x),
              y: Math.round(y),
              tag: topMost.tagName.toLowerCase(),
              id: topMost.id || null,
              classes: typeof topMost.className === 'string' ? topMost.className.slice(0, 100) : null,
              src: topMost.getAttribute('src'),
            });
          }
        }
      }
      return {
        dropdownRect: { left: r.left, top: r.top, width: r.width, height: r.height },
        sampleCount: cols * rows,
        overlapCount: overlaps.length,
        overlaps: overlaps.slice(0, 5),
      };
    }, DROPDOWN_SELECTOR);

    console.log('Overlap check:', JSON.stringify(overlap, null, 2));
    expect(overlap.overlapCount).toBe(0);
  });

  test('dropdown stays open when cursor moves trigger -> dropdown', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle' });

    const trigger = page.locator(TRIGGER_SELECTOR);
    await trigger.hover();
    await page.waitForSelector(DROPDOWN_SELECTOR, { state: 'visible', timeout: 5000 });

    // Move mouse to dropdown center
    const box = await page.locator(DROPDOWN_SELECTOR).boundingBox();
    if (!box) throw new Error('No bounding box for dropdown');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Dropdown should still be visible
    await expect(page.locator(DROPDOWN_SELECTOR)).toBeVisible();
  });

  test('dropdown closes when cursor leaves both trigger and dropdown', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle' });

    const trigger = page.locator(TRIGGER_SELECTOR);
    await trigger.hover();
    await page.waitForSelector(DROPDOWN_SELECTOR, { state: 'visible', timeout: 5000 });

    // Move mouse far away
    await page.mouse.move(10, 500);
    await page.waitForTimeout(300);

    // Dropdown should be gone
    await expect(page.locator(DROPDOWN_SELECTOR)).not.toBeVisible({ timeout: 2000 });
  });
});
