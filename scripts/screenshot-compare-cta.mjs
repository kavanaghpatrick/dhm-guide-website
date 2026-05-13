/**
 * One-off QA screenshot script for CompareCTA visual review.
 *
 * Loads two blog posts (one with CTA, one without per slug rules) at three
 * viewports each, plus a focused close-up of the CTA region.
 *
 * Run with `npm run preview` already serving on http://localhost:5173.
 *
 * Output: docs/compare-cta-2026-04-30/screenshots/{slug}-{viewport}.png
 *
 * Marked for deletion after QA pass.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_DIR = resolve(
  process.cwd(),
  'docs/compare-cta-2026-04-30/screenshots'
);
mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const POSTS = [
  {
    slug: 'dhm-dosage-guide-2025',
    label: 'has-cta',
    expectCta: true,
  },
  {
    slug: 'flyby-vs-double-wood-complete-comparison-2025',
    label: 'no-cta',
    expectCta: false,
  },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();

for (const post of POSTS) {
  for (const vp of VIEWPORTS) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const url = `${BASE}/never-hungover/${post.slug}`;
    console.log(`[${post.label}] ${vp.name}: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (err) {
      console.warn(`navigation slow/failed: ${err.message} — continuing`);
    }
    // Give React a moment to hydrate and any lazy components to render.
    await page.waitForTimeout(1500);

    const fullPath = `${OUT_DIR}/${post.label}-${vp.name}-full.png`;
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`  saved ${fullPath}`);

    // Try to capture a focused close-up of the CTA. Multiple selectors as
    // fallback per the prompt's hints.
    const ctaSelectors = [
      'a[href="/compare"][data-track="cta"]',
      'a[href="/compare"][data-cta-destination="/compare"]',
      'a[href="/compare"]',
    ];
    let ctaFound = false;
    for (const sel of ctaSelectors) {
      const link = page.locator(sel).first();
      if ((await link.count()) === 0) continue;
      // Walk up to the nearest card container for a tighter visual.
      const card = link.locator('xpath=ancestor::div[contains(@class, "bg-orange-50")][1]');
      if ((await card.count()) > 0) {
        try {
          await card.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          const crop = `${OUT_DIR}/${post.label}-${vp.name}-cta.png`;
          await card.screenshot({ path: crop });
          console.log(`  saved ${crop} (selector: ${sel})`);
          ctaFound = true;
          break;
        } catch (err) {
          console.warn(`  card screenshot failed: ${err.message}`);
        }
      }
    }
    if (!ctaFound) {
      console.log(`  CTA not found on page (expected: ${post.expectCta})`);
    }

    // Context shot: viewport-sized window centered on the CTA so we can
    // see surrounding whitespace, the paragraph above, and the related-
    // posts section below.
    if (post.expectCta) {
      const link = page.locator('a[href="/compare"][data-track="cta"]').first();
      if ((await link.count()) > 0) {
        await link.scrollIntoViewIfNeeded();
        // Scroll up a bit so we see what's above the CTA too.
        await page.evaluate(() => window.scrollBy(0, -200));
        await page.waitForTimeout(300);
        const ctxPath = `${OUT_DIR}/${post.label}-${vp.name}-context.png`;
        await page.screenshot({ path: ctxPath, fullPage: false });
        console.log(`  saved ${ctxPath}`);
      }
    }
    await page.close();
  }
}

await ctx.close();
await browser.close();
console.log('done');
