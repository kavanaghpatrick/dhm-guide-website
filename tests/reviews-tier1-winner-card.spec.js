import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PRODUCTS = JSON.parse(readFileSync(new URL('../src/data/topProducts.json', import.meta.url), 'utf8'));

// The site-modern-v1 A/B wrapper and the legacy Reviews.jsx are deleted: /reviews
// always serves the modern page, so no variant override is needed.
const REVIEWS_URL = '/reviews';

/**
 * Acceptance spec for item 1a — "Crown the #1 product card"
 *
 * History: written RED when `data-testid="reviews-winner-card"` did not exist.
 * 1a-3 changed on 2026-11-26 (see the comment on that test).
 */

test.describe('Reviews page — winner card (item 1a)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REVIEWS_URL);
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
      hasText: /best pick|editor['\u2019]?s (choice|pick)|our pick|#1 pick|top pick/i
    }).first();
    await expect(badge).toBeVisible();
  });

  // Contract change (money-page rework, 2026-11-26): 1a-3 used to require the winner's
  // button to be taller than the others. Modern cards all share one button size, and the
  // owner's rule is calm before clever, so a bigger orange button is dropped on purpose.
  // The winner is marked by its badge and its position. What the winner card must do
  // instead is show the two numbers a buyer compares: the DHM dose and the price per
  // serving, both exactly as in topProducts.json.
  test('1a-3: winner card shows its DHM dose and price per serving from the data', async ({ page }) => {
    const winnerCard = page.locator('[data-testid="reviews-winner-card"]');
    await expect(winnerCard).toHaveCount(1);
    const name = await winnerCard.getAttribute('data-product-name');
    const product = PRODUCTS.find((p) => p.name === name) || PRODUCTS.find((p) => p.badge === "Editor's Choice");
    const text = ((await winnerCard.innerText()) || '')
      .replace(/(\d),(\d{3})/g, '$1$2').replace(/(\d)\s+mg\b/gi, '$1mg');
    expect(text, `winner card lacks the dose ${product.dhm}`).toContain(product.dhm);
    expect(text, `winner card lacks the price per serving ${product.pricePerServing}`).toContain(product.pricePerServing);
  });
});
