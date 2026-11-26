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

  test('Item 7 — H1 carries the current year with no stale month-year stamp', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('2026');
    const text = (await h1.textContent()) || '';
    // No parenthesised year and no month-year stamp ("(June 2026)", "June 2026")
    expect(text).not.toMatch(/\(\s*(?:[A-Za-z]+\s+)?20\d\d\s*\)/);
    expect(text).not.toMatch(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d\d\b/);
    await expect(page.getByText(/(?:January|June) 2026/)).toHaveCount(0);
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
