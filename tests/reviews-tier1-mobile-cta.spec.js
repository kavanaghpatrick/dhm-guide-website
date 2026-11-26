/**
 * TDD Tier-1 spec — Item 2: Fix mobile comparison-table CTA
 *
 * Acceptance contract (RED until implemented):
 *   1. EVERY product row exposes a VISIBLE, tappable "Check Price" affiliate
 *      control (>= 10 total) inside #comparison-table on Pixel 5 viewport.
 *   2. Each visible CTA rendered height >= 44px (WCAG tap-target standard).
 *   3. The table does NOT overflow horizontally (scrollWidth <= clientWidth + 4).
 *
 * Contract change (money-page rework, 2026-11-26): the design audit counted 16 orange
 * buy slabs on a phone (8 in this table, 8 on the cards), so orange stopped marking
 * anything. Every row still needs its own visible, 44px-tall "Check price" link
 * (assertions 1 and 2 are unchanged), but the table must now be quiet: at most ONE row
 * (the winner) may use the filled orange .btn-cta. The others become text links.
 * Assertion 4 is new.
 *
 * Contract change, same date: `#comparison-table` must wrap the WHOLE comparison
 * block, the desktop table and the phone stack alike. On the modern page the id sits on
 * the <table>, which is display:none below 640px, while the phone cards live in a
 * sibling div, so on a phone this spec saw 8 CTAs in the DOM and 0 visible. Move the id
 * to the wrapper (or render one structure at every width).
 *
 * Scroll-container note:
 *   InlineComparisonTable wraps its <table> in
 *   `<div className="overflow-x-auto …">`.  We target that div by querying
 *   the first child element of #comparison-table that contains a <table>.
 *   If that heuristic changes, update the querySelector in assertion 3.
 */

import { test, expect, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The site-modern-v1 A/B wrapper and the legacy Reviews.jsx are deleted: /reviews
// always serves the modern page, so no variant override is needed.
const REVIEWS_URL = '/reviews';

// One CTA per catalog product (was a hardcoded 10 before the catalog shrank to 8).
const PRODUCT_COUNT = JSON.parse(readFileSync(new URL('../src/data/topProducts.json', import.meta.url), 'utf8')).length;

// Mobile viewport for all tests in this file
test.use({ ...devices['Pixel 5'] });

test('comparison table: one visible Check Price CTAs, 44px tap targets, no horizontal overflow', async ({ page }) => {
  // ── Navigate ────────────────────────────────────────────────────────────────
  await page.goto(REVIEWS_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // ── 1. Visible CTA count ────────────────────────────────────────────────────
  // Collect all <a> elements with text matching /check price/i inside the table
  const allCtas = page.locator('#comparison-table a', { hasText: /check price/i });
  const totalCount = await allCtas.count();

  const visibleCtas = [];
  for (let i = 0; i < totalCount; i++) {
    const el = allCtas.nth(i);
    if (await el.isVisible()) {
      visibleCtas.push(el);
    }
  }

  // ASSERTION 1: at least one visible CTA (one per product row)
  expect(
    visibleCtas.length,
    `Expected >= ${PRODUCT_COUNT} visible "Check Price" CTAs inside #comparison-table but found ${visibleCtas.length} (total in DOM: ${totalCount})`
  ).toBeGreaterThanOrEqual(PRODUCT_COUNT);

  // ── 2. Tap-target height ≥ 44px ────────────────────────────────────────────
  for (let i = 0; i < visibleCtas.length; i++) {
    const box = await visibleCtas[i].boundingBox();
    expect(
      box,
      `CTA #${i} had no bounding box — not rendered in layout`
    ).not.toBeNull();
    expect(
      box.height,
      `CTA #${i} height ${box.height}px is below the 44px tap-target minimum`
    ).toBeGreaterThanOrEqual(43.5); // 43.5 tolerates sub-pixel rounding
  }

  // ── 4. Quiet table: at most one filled orange button ───────────────────────
  let filled = 0;
  for (const el of visibleCtas) {
    if (await el.evaluate((a) => a.matches('.btn-cta') || !!a.querySelector('.btn-cta'))) filled++;
  }
  expect(
    filled,
    `${filled} of ${visibleCtas.length} table CTAs are filled orange buttons; at most 1 (the winner row) is allowed`
  ).toBeLessThanOrEqual(1);

  // ── 3. No horizontal overflow in the scroll container ──────────────────────
  // The table is wrapped in the first div[class*="overflow"] inside #comparison-table.
  // We read scrollWidth vs clientWidth via JS evaluation to avoid Playwright's
  // "visible size" abstraction.
  const overflowInfo = await page.evaluate(() => {
    const section = document.querySelector('#comparison-table');
    if (!section) return { error: '#comparison-table not found' };

    // Walk direct children to find the overflow-x-auto wrapper div
    // (InlineComparisonTable renders <div class="overflow-x-auto …"><table>…)
    let scrollContainer = null;
    const candidates = section.querySelectorAll('div');
    for (const div of candidates) {
      if (div.scrollWidth > div.clientWidth + 4) {
        scrollContainer = div;
        break;
      }
    }

    if (!scrollContainer) {
      // No div overflows — check the table element itself as fallback
      const table = section.querySelector('table');
      if (table) {
        return {
          element: 'table',
          scrollWidth: table.scrollWidth,
          clientWidth: table.clientWidth,
        };
      }
      // Nothing overflows; pick the first overflow-x-auto div for measurement
      const overflowDiv = section.querySelector('div[class*="overflow"]');
      if (overflowDiv) {
        return {
          element: 'div[overflow-x-auto] (no overflow detected)',
          scrollWidth: overflowDiv.scrollWidth,
          clientWidth: overflowDiv.clientWidth,
        };
      }
      return { error: 'Could not find scroll container inside #comparison-table' };
    }

    return {
      element: scrollContainer.className || scrollContainer.tagName,
      scrollWidth: scrollContainer.scrollWidth,
      clientWidth: scrollContainer.clientWidth,
    };
  });

  // Guard: make sure the evaluation itself didn't fail
  expect(
    overflowInfo.error,
    `Scroll-container evaluation error: ${overflowInfo.error}`
  ).toBeUndefined();

  // ASSERTION 3: table must not exceed viewport width (with 4px rounding tolerance)
  expect(
    overflowInfo.scrollWidth,
    `Table scroll container overflows: scrollWidth=${overflowInfo.scrollWidth} > clientWidth=${overflowInfo.clientWidth} + 4 on element "${overflowInfo.element}"`
  ).toBeLessThanOrEqual(overflowInfo.clientWidth + 4);
});
