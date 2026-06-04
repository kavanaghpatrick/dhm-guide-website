import { test, expect } from '@playwright/test';

test.describe('Reviews page — comparison table winner row (item 1b)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('first data row has data-testid="comparison-winner-row" and is visible', async ({ page }) => {
    const winnerRow = page.locator('[data-testid="comparison-winner-row"]');
    await expect(winnerRow).toHaveCount(1);
    await expect(winnerRow).toBeVisible();
  });

  test('winner row has a real highlight background (not transparent, not white)', async ({ page }) => {
    const winnerRow = page.locator('[data-testid="comparison-winner-row"]');
    await expect(winnerRow).toHaveCount(1);

    // Primary: check background on the row element itself.
    // If the row is a <tr>, highlights are often applied to child <td>s,
    // so we fall back to checking the first cell if the row itself is transparent/white.
    const rowBg = await winnerRow.evaluate(el => getComputedStyle(el).backgroundColor);

    const isTransparent = rowBg === 'rgba(0, 0, 0, 0)';
    const isWhite = rowBg === 'rgb(255, 255, 255)';

    if (isTransparent || isWhite) {
      // Fall back: check the first child cell
      const firstCell = winnerRow.locator('td, th').first();
      const cellBg = await firstCell.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(cellBg).not.toBe('rgba(0, 0, 0, 0)');
      expect(cellBg).not.toBe('rgb(255, 255, 255)');
    } else {
      expect(rowBg).not.toBe('rgba(0, 0, 0, 0)');
      expect(rowBg).not.toBe('rgb(255, 255, 255)');
    }
  });

  test('winner row contains a visible best-pick / #1 / winner / top-pick label', async ({ page }) => {
    const winnerRow = page.locator('[data-testid="comparison-winner-row"]');
    await expect(winnerRow).toHaveCount(1);

    // At least one visible descendant whose text matches the badge pattern
    const badge = winnerRow.locator(':visible').filter({ hasText: /best pick|#1|winner|top pick/i });
    await expect(badge.first()).toBeVisible();
  });
});
