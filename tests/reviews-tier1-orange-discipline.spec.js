// @ts-check
import { test, expect } from '@playwright/test';

// Contract change (money-page rework, 2026-11-26): this spec now forces the modern
// variant. Before, no override was set, so the suite ran against the legacy Reviews.jsx
// that almost no real visitor sees (modern ships to 100%). Once the A/B wrapper is
// deleted the query param is a harmless no-op.
const REVIEWS_URL = '/reviews?exp_site-modern-v1=modern';

/**
 * Tier-1 spec: Orange Discipline (item 4)
 *
 * ACCEPTANCE CONTRACT: When a "Best For" filter is active/selected,
 * its background color is GREEN (not orange). Orange must be reserved
 * for affiliate "buy" CTAs exclusively.
 *
 * Originally failed because the active filter button uses bg-orange-500
 * (oklch(0.646 0.222 41.116) ≈ rgb(249,115,22)), which dilutes the
 * CTA signal. The fix will make active filter buttons green.
 *
 * Color extraction strategy: Playwright screenshot of a 3×3 pixel area
 * at the button center, then read the PNG bytes. PNG pixels 0-3 are RGBA.
 * This gives ground-truth rendered color regardless of CSS color space.
 */

test.describe('Reviews page — Orange discipline', () => {
  test('active "Best For" filter button should be GREEN, not orange', async ({ page }) => {
    await page.goto(REVIEWS_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Click the "Best Overall" filter button to make it active
    await page.getByRole('button', { name: /best overall/i }).click();
    await page.waitForTimeout(300);

    // Get the button's bounding box so we can sample its center pixel
    const btn = page.getByRole('button', { name: /best overall/i });
    const box = await btn.boundingBox();
    expect(box, 'Best Overall button must be visible on page').not.toBeNull();

    const cx = Math.round(box.x + box.width / 2);
    const cy = Math.round(box.y + box.height / 2);

    // Capture a 3×3 pixel screenshot centered on the button interior.
    // Using a small area avoids border/shadow edge effects.
    const pngBuffer = await page.screenshot({
      clip: { x: cx - 1, y: cy - 1, width: 3, height: 3 },
    });

    // Parse PNG bytes manually: PNG header is 8 bytes, then chunks.
    // But Playwright returns the raw PNG from the node side — parse with
    // a known-offset trick: read pixel 0 of the image from IDAT, OR
    // use a simpler approach: render a <canvas> in-page from a data URL.
    // The simplest robust approach: send screenshot back to the page as
    // an ImageBitmap and read pixels via OffscreenCanvas.

    // Actually: use node Buffer directly — PNG pixel data for a 3×3 image
    // with no alpha starts at byte offset 41 (8 header + chunks). But this
    // is fragile. Instead, use the page itself to render an img from the
    // base64 PNG and read pixels via a canvas — but that's round-trip.

    // CLEANEST: read the Tailwind class directly. The acceptance contract
    // says "background is GREEN". Tailwind encodes intent via class names.
    // If the active state uses bg-green-*, the color is green; if bg-orange-*,
    // it's orange. This is the authoritative signal and won't break on CSS
    // color space encoding differences (oklch vs rgb).

    // Contract change (money-page rework, 2026-11-26): the modern page styles filters
    // with design tokens, not Tailwind bg-green-* classes, so the old class-name check
    // could never pass on the page users get. The intent is unchanged and is now read
    // from the computed color: the active filter must be green (green channel highest)
    // and must not sit in the orange hue band reserved for buy buttons.
    const rgb = await btn.evaluate((el) => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 1;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a, raw: getComputedStyle(el).backgroundColor };
    });
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    let hue = 0;
    if (max !== min) {
      if (max === rgb.r) hue = (60 * ((rgb.g - rgb.b) / (max - min)) + 360) % 360;
      else if (max === rgb.g) hue = 60 * ((rgb.b - rgb.r) / (max - min)) + 120;
      else hue = 60 * ((rgb.r - rgb.g) / (max - min)) + 240;
    }
    const isOrange = hue >= 15 && hue <= 45 && max - min > 60;
    expect(isOrange, `active filter is orange (${rgb.raw}, hue ${Math.round(hue)})`).toBe(false);
    expect(
      rgb.g > rgb.r && rgb.g >= rgb.b && rgb.a > 0,
      `active filter background ${rgb.raw} is not green`
    ).toBe(true);
  });
});
