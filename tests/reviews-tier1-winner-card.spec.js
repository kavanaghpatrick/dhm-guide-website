import { test, expect } from '@playwright/test';

/**
 * Acceptance spec for item 1a — "Crown the #1 product card"
 *
 * RED phase: All three tests must FAIL against current code because
 * `data-testid="reviews-winner-card"` does not exist yet.
 *
 * GREEN phase: Once the implementer adds the winner-card treatment, all
 * three assertions will pass without any change to this file.
 */

test.describe('Reviews page — winner card (item 1a)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('1a-1: exactly one winner card exists and is visible', async ({ page }) => {
    const winnerCard = page.locator('[data-testid="reviews-winner-card"]');
    await expect(winnerCard).toHaveCount(1);
    await expect(winnerCard).toBeVisible();
  });

  test('1a-2: winner card contains a visible best-pick badge', async ({ page }) => {
    const winnerCard = page.locator('[data-testid="reviews-winner-card"]');
    // The badge text must match one of the accepted label variants
    const badge = winnerCard.locator(':scope *').filter({
      hasText: /best pick|editor'?s choice|#1 pick|top pick/i
    }).first();
    await expect(badge).toBeVisible();
  });

  test('1a-3: winner card CTA is taller than a non-winner card CTA', async ({ page }) => {
    // The winner card must exist before we can measure anything — fail fast
    // with a clear count assertion rather than a 30-second locator timeout.
    const winnerCard = page.locator('[data-testid="reviews-winner-card"]');
    await expect(winnerCard).toHaveCount(1);

    // CTA inside the winner card
    const winnerCta = winnerCard
      .getByRole('link', { name: /check price/i })
      .first();

    // Any product card that is NOT the winner card
    const nonWinnerCta = page
      .locator('[data-track="product"]:not([data-testid="reviews-winner-card"])')
      .getByRole('link', { name: /check price/i })
      .first();

    const winnerBox = await winnerCta.boundingBox();
    const nonWinnerBox = await nonWinnerCta.boundingBox();

    // Both elements must be measurable
    expect(winnerBox).not.toBeNull();
    expect(nonWinnerBox).not.toBeNull();

    // Winner CTA must be strictly taller
    expect(winnerBox.height).toBeGreaterThan(nonWinnerBox.height);
  });
});
