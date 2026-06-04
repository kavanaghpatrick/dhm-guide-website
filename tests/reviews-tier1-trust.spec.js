import { test, expect } from '@playwright/test';

test.describe('Reviews page — Tier 1 Trust / E-E-A-T (item 5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('has a visible byline near H1 containing a review verb and "2026"', async ({ page }) => {
    const byline = page.locator('[data-testid="reviews-byline"]');
    await expect(byline).toBeVisible();
    await expect(byline).toHaveText(/(reviewed|tested|written|updated)/i);
    await expect(byline).toContainText('2026');
  });

  test('ratings are labeled with their source (Amazon)', async ({ page }) => {
    await expect(page.getByText(/Amazon reviews|\(Amazon\)/i).first()).toBeVisible();
  });

  test('"Lab-Tested" badge is a link with a non-empty href', async ({ page }) => {
    const lab = page.locator('[data-testid="lab-tested-link"]');
    await expect(lab).toBeVisible();
    await expect(lab).toHaveAttribute('href', /.+/);
  });
});
