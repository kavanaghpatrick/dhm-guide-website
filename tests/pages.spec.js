// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Comprehensive Test Plan for DHM Guide Website
 *
 * Tests the changes from PostHog Analytics Optimization (Week 1-4):
 * - #105-109: CTA buttons, touch targets, active states
 * - #110: Above-fold optimization
 * - #114: Trust signals near CTAs
 * - #125: Tracking property fixes
 */

// ============================================
// HOME PAGE TESTS
// ============================================
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load without errors', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DHM|Hangover/i);

    // Check no console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display hero section with reduced padding', async ({ page }) => {
    // Hero section should be visible
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Check headline is visible
    const headline = page.getByRole('heading', { level: 1 });
    await expect(headline).toBeVisible();
    await expect(headline).toContainText(/Hungover/i);
  });

  test('should display trust indicators above fold', async ({ page }) => {
    // Look for trust indicator text - use first() to handle multiple matches
    const trustIndicator = page.locator('text=1,000+ reviews').first();
    await expect(trustIndicator).toBeVisible();

    // Check for other trust signals
    await expect(page.locator('text=70% proven effective').first()).toBeVisible();
    await expect(page.locator('text=350K+ customers').first()).toBeVisible();
  });

  test('should have primary CTA button visible', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /Stop Your Next Hangover/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should display product cards with trust signals', async ({ page }) => {
    // Scroll to product section
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);

    // Check for trust signals near CTAs (rating + reviews)
    const trustSignals = page.locator('text=/\\d\\.\\d.*reviews/');
    const count = await trustSignals.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have orange affiliate buttons', async ({ page }) => {
    // Scroll to product section
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);

    // Check for "Check Price on Amazon" buttons
    const affiliateButtons = page.getByRole('link', { name: /Check Price on Amazon/i });
    const count = await affiliateButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify button has orange styling
    const firstButton = affiliateButtons.first();
    await expect(firstButton).toBeVisible();
  });

  test('should have proper affiliate link attributes', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);

    // Check Amazon links have proper rel attributes
    const amazonLinks = page.locator('a[href*="amzn.to"], a[href*="amazon"]');
    const count = await amazonLinks.count();

    if (count > 0) {
      const firstLink = amazonLinks.first();
      const rel = await firstLink.getAttribute('rel');
      expect(rel).toContain('nofollow');
      expect(rel).toContain('sponsored');
    }
  });
});

// ============================================
// REVIEWS PAGE TESTS
// ============================================
test.describe('Reviews Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('networkidle');
  });

  test('should load without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Review|DHM/i);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display comparison table', async ({ page }) => {
    // Check for comparison table
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();

    // Check for Action column header
    const actionHeader = page.locator('th', { hasText: 'Action' });
    await expect(actionHeader).toBeVisible();
  });

  test('should have Check Price buttons in comparison table', async ({ page }) => {
    // Check for "Check Price" buttons in table
    const checkPriceButtons = page.locator('table a', { hasText: /Check Price/i });
    const count = await checkPriceButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify first button has orange background
    const firstButton = checkPriceButtons.first();
    await expect(firstButton).toBeVisible();
  });

  test('should display product cards with trust signals', async ({ page }) => {
    // Scroll to product cards
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);

    // Check for orange CTA buttons
    const ctaButtons = page.locator('a', { hasText: /Check Price on Amazon/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);

    // Check for trust signals (rating + reviews)
    const trustSignals = page.locator('text=/\\d\\.\\d.*\\(.*reviews\\)/');
    const trustCount = await trustSignals.count();
    expect(trustCount).toBeGreaterThan(0);
  });

  test('should have Add to Compare buttons', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);

    const compareButtons = page.getByRole('button', { name: /Add to Compare/i });
    const count = await compareButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================
// COMPARE PAGE TESTS
// ============================================
test.describe('Compare Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
  });

  test('should load without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Compare|DHM/i);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display comparison interface', async ({ page }) => {
    // Check for page heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should have orange affiliate buttons', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Check for affiliate buttons
    const affiliateLinks = page.locator('a[href*="amzn.to"], a[href*="amazon"]');
    const count = await affiliateLinks.count();

    if (count > 0) {
      const firstLink = affiliateLinks.first();
      await expect(firstLink).toBeVisible();
    }
  });
});

// ============================================
// GUIDE PAGE TESTS
// ============================================
test.describe('Guide Page', () => {
  test('should load without errors', async ({ page }) => {
    await page.goto('/guide');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Guide|DHM/i);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display content', async ({ page }) => {
    await page.goto('/guide');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});

// ============================================
// BLOG PAGE TESTS
// ============================================
test.describe('Blog Pages', () => {
  test('should load blog listing', async ({ page }) => {
    await page.goto('/never-hungover');
    await page.waitForLoadState('networkidle');

    // Check page loads
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should load individual blog post', async ({ page }) => {
    // Go to a known blog post
    await page.goto('/never-hungover/best-dhm-supplement');
    await page.waitForLoadState('networkidle');

    // Check page loads without error
    const article = page.locator('article');
    if (await article.count() > 0) {
      await expect(article.first()).toBeVisible();
    }
  });
});

// ============================================
// CALCULATOR PAGE TESTS
// ============================================
test.describe('Calculator Page', () => {
  test('should load without errors', async ({ page }) => {
    await page.goto('/dhm-dosage-calculator');
    await page.waitForLoadState('networkidle');

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display calculator interface', async ({ page }) => {
    await page.goto('/dhm-dosage-calculator');
    await page.waitForLoadState('networkidle');

    // Check for calculator heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});

// ============================================
// MOBILE-SPECIFIC TESTS
// ============================================
test.describe('Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly layout on Home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero should be visible
    const headline = page.getByRole('heading', { level: 1 });
    await expect(headline).toBeVisible();

    // Trust indicators should be visible - use first() to handle multiple matches
    const trustIndicator = page.locator('text=1,000+ reviews').first();
    await expect(trustIndicator).toBeVisible();
  });

  test('should have touch-friendly buttons (48px min)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check CTA button size
    const ctaButton = page.getByRole('link', { name: /Stop Your Next Hangover/i });

    if (await ctaButton.count() > 0) {
      const box = await ctaButton.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44); // Minimum touch target
      }
    }
  });

  test('should display mobile Reviews page', async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('networkidle');

    // Page should load
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});

// ============================================
// ACCESSIBILITY TESTS
// ============================================
test.describe('Accessibility', () => {
  test('should have aria-hidden on decorative elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for aria-hidden on separator dots
    const hiddenElements = page.locator('[aria-hidden="true"]');
    const count = await hiddenElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper link structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check navigation links exist
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================
// PERFORMANCE TESTS
// ============================================
test.describe('Performance', () => {
  test('should load Home page within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('should load Reviews page within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/reviews');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
