import { test, expect } from '@playwright/test';

// Contract change (money-page rework, 2026-11-26): this spec now forces the modern
// variant. Before, no override was set, so the suite ran against the legacy Reviews.jsx
// that almost no real visitor sees (modern ships to 100%). Once the A/B wrapper is
// deleted the query param is a harmless no-op.
const REVIEWS_URL = '/reviews?exp_site-modern-v1=modern';

test.describe('Reviews page — Tier 1 Trust / E-E-A-T (item 5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REVIEWS_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('has a visible byline near H1 containing a review verb and "2026"', async ({ page }) => {
    const byline = page.locator('[data-testid="reviews-byline"]');
    await expect(byline).toBeVisible();
    await expect(byline).toHaveText(/(reviewed|tested|written|updated)/i);
    await expect(byline).toContainText('2026');
  });

  // Contract change (money-page rework, 2026-11-26): the old regex passed only on the
  // legacy page ("Amazon reviews"). The modern cards say "4.3 · 359 reviews", which reads
  // as the site's own score. The label must tie the number to Amazon, for example
  // "4.3 on Amazon (359 ratings)". "Check Price on Amazon" buttons do not count.
  test('ratings are labeled with their source (Amazon)', async ({ page }) => {
    await expect(
      page.getByText(/\d\.\d\s*(stars?\s*)?on Amazon|Amazon (reviews|ratings)|\(Amazon\)/i).first()
    ).toBeVisible();
  });

  // Contract change (money-page rework, 2026-11-26): the old test required a visible
  // "Lab-Tested" badge link. There is no lab data anywhere in the repo, so the badge is a
  // false claim and a banned trust badge. The contract is inverted: no lab badge and no
  // lab-testing wording anywhere on the page.
  test('no "Lab-Tested" badge or lab-testing claim', async ({ page }) => {
    await expect(page.locator('[data-testid="lab-tested-link"]')).toHaveCount(0);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/lab[- ]tested|independently tested|third[- ]party lab/i);
  });
});
