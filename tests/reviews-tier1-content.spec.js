import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PRODUCTS = JSON.parse(readFileSync(new URL('../src/data/topProducts.json', import.meta.url), 'utf8'));

// Contract change (money-page rework, 2026-11-26): this spec now forces the modern
// variant. Before, no override was set, so the suite ran against the legacy Reviews.jsx
// that almost no real visitor sees (modern ships to 100%). Once the A/B wrapper is
// deleted the query param is a harmless no-op.
const REVIEWS_URL = '/reviews?exp_site-modern-v1=modern';

test.describe('Reviews page — tier-1 content (items 7 & 6)', () => {
  let errors;

  test.beforeEach(async ({ page }) => {
    // Item 6: register error listener BEFORE navigation
    errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(REVIEWS_URL);
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

  // New contract (design audit, /reviews item 1): the first phone screen answers "which
  // one should I buy". A plain paragraph near the H1 names the pick, so the verdict is in
  // prose, not only in a badge or in a card further down.
  test('a plain verdict paragraph naming the pick sits in the first phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(REVIEWS_URL);
    await page.locator('h1').first().waitFor();
    await page.waitForTimeout(1000);
    const pick = PRODUCTS.find((p) => p.badge === "Editor's Choice") || PRODUCTS[0];
    const found = await page.evaluate((brand) =>
      [...document.querySelectorAll('main p')].some((p) => {
        const r = p.getBoundingClientRect();
        return r.height > 0 && r.top + window.scrollY < 844
          && !p.closest('[data-track="product"], table, nav, header')
          && p.innerText.includes(brand);
      }), pick.brand);
    expect(found, `no paragraph naming "${pick.brand}" in the first 844px`).toBe(true);
  });
});
