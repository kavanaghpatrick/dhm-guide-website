import { test, expect } from '@playwright/test';

test.describe('Reviews page — tier-1 content (items 7 & 6)', () => {
  let errors;

  test.beforeEach(async ({ page }) => {
    // Item 6: register error listener BEFORE navigation
    errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/reviews');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('Item 7 — H1 date is current (June 2026), not stale (January 2026)', async ({ page }) => {
    // Must NOT contain the stale month
    await expect(page.getByText('January 2026')).toHaveCount(0);

    // Must contain the current month
    await expect(page.getByRole('heading', { level: 1 })).toContainText('June 2026');
  });

  test('Item 6 — hero renders without JS errors; H1 and quick-pick CTA are visible', async ({ page }) => {
    // No uncaught page errors on load
    expect(errors).toEqual([]);

    // Hero H1 is visible (regression guard: framer-motion fade-in removed)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Quick-pick "Check Price" CTA link is visible
    await expect(page.getByRole('link', { name: /check price/i }).first()).toBeVisible();
  });
});
