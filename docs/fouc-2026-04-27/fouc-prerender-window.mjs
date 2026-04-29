// Capture the FOUC window: when prerender is painted but React hasn't mounted
// Strategy: aggressively delay JS execution so the prerendered article is visible for screenshots
import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';

async function test({ url, name, viewport, deviceLabel, jsDelayMs }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  // Delay all JS bundles so we can see what user sees BEFORE React mounts
  await page.route('**/assets/*.js', async (route) => {
    await new Promise((r) => setTimeout(r, jsDelayMs));
    await route.continue();
  });

  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'commit' });

  // Take screenshots while JS is still delayed
  const stamps = [300, 600, 1000, 1500];
  let last = 0;
  for (const ms of stamps) {
    await page.waitForTimeout(ms - last);
    last = ms;
    try {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${name}-${deviceLabel}-FOUC-window-${ms}ms.png`,
        fullPage: false,
        timeout: 5000,
      });
      const state = await page.evaluate(() => {
        const article = document.querySelector('article');
        const articleVisible = article ? (() => {
          const cs = window.getComputedStyle(article);
          const rect = article.getBoundingClientRect();
          return cs.display !== 'none' && rect.height > 0;
        })() : false;
        return {
          articleVisible,
          h1: document.querySelector('h1')?.innerText.slice(0, 60),
          textLen: document.body.innerText.length,
        };
      });
      console.log(`  ${ms}ms (real ${Date.now() - navStart}ms): articleVisible=${state.articleVisible}, h1="${state.h1}", text=${state.textLen}c`);
    } catch (e) {
      console.warn(`Screenshot failed at ${ms}ms:`, e.message.slice(0, 100));
    }
  }

  await browser.close();
}

console.log('=== Dosage guide desktop, JS delayed 3s ===');
await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  jsDelayMs: 3000,
});

console.log('\n=== Dosage guide mobile, JS delayed 3s ===');
await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 390, height: 844 },
  deviceLabel: 'mobile',
  jsDelayMs: 3000,
});

console.log('\n=== Home desktop, JS delayed 3s ===');
await test({
  url: 'https://www.dhmguide.com/',
  name: 'home',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  jsDelayMs: 3000,
});

console.log('Done');
