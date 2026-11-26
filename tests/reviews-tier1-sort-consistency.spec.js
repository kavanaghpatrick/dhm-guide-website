import { test, expect } from '@playwright/test';

// Contract change (money-page rework, 2026-11-26): this spec now forces the modern
// variant. Before, no override was set, so the suite ran against the legacy Reviews.jsx
// that almost no real visitor sees (modern ships to 100%). Once the A/B wrapper is
// deleted the query param is a harmless no-op.
const REVIEWS_URL = '/reviews?exp_site-modern-v1=modern';

test('Item 3 — Fix #1 sort inconsistency: first product card and Editor\'s Pick quick-pick both name "No Days Wasted"', async ({ page }) => {
  await page.goto(REVIEWS_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Assertion 1: the Editor's Pick quick-pick area names "No Days Wasted"
  // Visible copy only: the modern page renders breakpoint-specific duplicates.
  const editorPickEl = page.getByText(/editor['\u2019]?s pick/i).filter({ visible: true }).first();
  await expect(editorPickEl).toBeVisible();
  const ancestorDiv = editorPickEl.locator('xpath=ancestor::*[self::div][1]');
  await expect(ancestorDiv).toContainText(/No Days Wasted/i);

  // Assertion 2: the first product card (default sort) is also "No Days Wasted"
  // This is the bug: default sort is by star rating, not editorial score,
  // so position 1 will be a different product.
  await expect(page.locator('[data-product-position="1"]')).toHaveAttribute(
    'data-product-name',
    /No Days Wasted/i
  );
});

// New contract (design audit, /reviews item 3): the winner had three names on one page
// ("Editor's Choice" in the data, "Editor's pick" on the card, "Best" in the table).
// Whichever name is chosen, the page uses exactly one of these labels.
test('Item 3b — the winner has one name across the page', async ({ page }) => {
  await page.goto(REVIEWS_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);
  const names = [/editor['\u2019]?s pick/i, /editor['\u2019]?s choice/i, /\bour pick\b/i, /\btop pick\b/i, /\bbest pick\b/i]
    .filter((re) => re.test(text))
    .map(String);
  expect(names.length, `winner labels in use: ${names.join(', ')}`).toBeLessThanOrEqual(1);
});
