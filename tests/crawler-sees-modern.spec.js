import { test, expect } from '@playwright/test';

// Regression guard for the deleted site-modern-v1 A/B wrapper. The wrapper fell back to
// the legacy pages whenever PostHog did not answer, so every crawler (Googlebot included)
// was served the old /reviews with invented stats. A bot-like visitor (crawler user agent,
// analytics blocked) must get the modern page, with none of the retired claims.
const GOOGLEBOT_UA =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BANNED = /Lab-Tested|5000\+|Brands Tested|Science-Backed|clinically-proven/i;

test.use({ userAgent: GOOGLEBOT_UA, storageState: { cookies: [], origins: [] } });

test('crawler with PostHog blocked gets the modern /reviews page', async ({ page }) => {
  await page.route(/posthog|\/ingest\//, (route) => route.abort());
  await page.goto('/reviews');
  await expect(page.getByTestId('reviews-hero-modern')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('reviews-winner-card')).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(BANNED);
  expect(await page.title()).not.toMatch(BANNED);
});
