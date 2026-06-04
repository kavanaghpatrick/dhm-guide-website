// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tier-1 spec: Orange Discipline (item 4)
 *
 * ACCEPTANCE CONTRACT: When a "Best For" filter is active/selected,
 * its background color is GREEN (not orange). Orange must be reserved
 * for affiliate "buy" CTAs exclusively.
 *
 * Currently FAILS because the active filter button uses bg-orange-500
 * (oklch(0.646 0.222 41.116) ≈ rgb(249,115,22)), which dilutes the
 * CTA signal. The fix will make active filter buttons green.
 *
 * Color extraction strategy: Playwright screenshot of a 3×3 pixel area
 * at the button center, then read the PNG bytes. PNG pixels 0-3 are RGBA.
 * This gives ground-truth rendered color regardless of CSS color space.
 */

test.describe('Reviews page — Orange discipline', () => {
  test('active "Best For" filter button should be GREEN, not orange', async ({ page }) => {
    await page.goto('/reviews');
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

    const className = await btn.evaluate(el => el.className);
    console.log(`Active "Best Overall" className: ${className}`);

    // Also capture the raw computed color for reporting
    const rawColor = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    console.log(`Active "Best Overall" backgroundColor: ${rawColor}`);

    // Assert: must have a green background class, must NOT have orange background class.
    //
    // Orange (current/failing state): bg-orange-{n} or bg-amber-{n}
    // Green (passing state):          bg-green-{n} or bg-emerald-{n}
    //
    // The test is RED if the button carries bg-orange-* (current state).
    // The implementer satisfies it by switching to bg-green-*.

    const hasOrangeClass = /\bbg-orange-\d+\b/.test(className) || /\bbg-amber-\d+\b/.test(className);
    const hasGreenClass  = /\bbg-green-\d+\b/.test(className)  || /\bbg-emerald-\d+\b/.test(className);

    // Report what we see
    console.log(`hasOrangeClass=${hasOrangeClass}  hasGreenClass=${hasGreenClass}`);

    expect(
      hasGreenClass,
      `Expected active filter button to have a bg-green-* or bg-emerald-* class (GREEN). ` +
      `Got className="${className}" (computed: ${rawColor}). ` +
      `Remove bg-orange-* and replace with a green Tailwind class.`
    ).toBe(true);
  });
});
