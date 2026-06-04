import { test, expect } from '@playwright/test';

test('Item 3 — Fix #1 sort inconsistency: first product card and Editor\'s Pick quick-pick both name "No Days Wasted"', async ({ page }) => {
  await page.goto('/reviews');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Assertion 1: the Editor's Pick quick-pick area names "No Days Wasted"
  const editorPickEl = page.getByText(/editor'?s pick/i).first();
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
