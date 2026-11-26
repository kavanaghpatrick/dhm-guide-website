import { test, expect } from '@playwright/test';

// Contract change (money-page rework, 2026-11-26): this spec now forces the modern
// variant. Before, no override was set, so the suite ran against the legacy Reviews.jsx
// that almost no real visitor sees (modern ships to 100%). Once the A/B wrapper is
// deleted the query param is a harmless no-op.
const REVIEWS_URL = '/reviews?exp_site-modern-v1=modern';

// Contract change (money-page rework, 2026-11-26): below 640px the modern page swaps the
// table for stacked cards, so the winner "row" on a phone is
// [data-testid="comparison-winner-card"]. WINNER matches whichever of the two is visible,
// and exactly one must be. The highlight and label rules are unchanged.
const WINNER = '[data-testid="comparison-winner-row"]:visible, [data-testid="comparison-winner-card"]:visible';

test.describe('Reviews page — comparison table winner row (item 1b)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REVIEWS_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('first data row has data-testid="comparison-winner-row" and is visible', async ({ page }) => {
    const winnerRow = page.locator(WINNER);
    await expect(winnerRow).toHaveCount(1);
    await expect(winnerRow).toBeVisible();
  });

  test('winner row has a real highlight background (not transparent, not white)', async ({ page }) => {
    const winnerRow = page.locator(WINNER);
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

  // Contract change (money-page rework, 2026-11-26): the label regex also accepts
  // "Editor's pick" and "Our pick", because the winner gets one name everywhere (see
  // tier1-sort-consistency 3b) and the table must use that same name.
  test('winner row contains a visible best-pick / #1 / winner / top-pick label', async ({ page }) => {
    const winnerRow = page.locator(WINNER);
    await expect(winnerRow).toHaveCount(1);

    // At least one visible descendant whose text matches the badge pattern
    const badge = winnerRow.locator(':visible').filter({ hasText: /best pick|#1|winner|top pick|editor['\u2019]?s (pick|choice)|our pick/i });
    await expect(badge.first()).toBeVisible();
  });
});
