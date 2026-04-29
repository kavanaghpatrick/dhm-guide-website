// Test: Capture the moment between HTML parsed and CSS applied
// Using request interception to delay the CSS bundle.
import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';

async function captureWithDelayedCSS({ url, name, viewport, deviceLabel, cssDelayMs }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  // Delay CSS responses
  await page.route('**/assets/*.css', async (route) => {
    await new Promise((r) => setTimeout(r, cssDelayMs));
    await route.continue();
  });
  // Delay JS too so it doesn't mount immediately
  await page.route('**/assets/*.js', async (route) => {
    await new Promise((r) => setTimeout(r, cssDelayMs));
    await route.continue();
  });

  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  const commitTime = Date.now() - navStart;
  console.log(`Commit at ${commitTime}ms (${name} ${deviceLabel})`);

  // Take screenshot at points BEFORE css/js arrive (during the FOUC window)
  const stamps = [200, 500, 1000, 2000, 4000];
  let last = 0;
  for (const ms of stamps) {
    await page.waitForTimeout(ms - last);
    last = ms;
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${name}-${deviceLabel}-DELAY${cssDelayMs}-${ms}ms.png`,
      fullPage: false,
    });

    // Check what the user sees
    const state = await page.evaluate(() => {
      const sheets = document.styleSheets.length;
      let rules = 0;
      for (const s of document.styleSheets) {
        try { rules += s.cssRules ? s.cssRules.length : 0; } catch (e) {}
      }
      const article = document.querySelector('article');
      const articleVisible = article
        ? (() => {
            const cs = window.getComputedStyle(article);
            const rect = article.getBoundingClientRect();
            return cs.display !== 'none' && cs.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          })()
        : false;
      const root = document.getElementById('root');
      const rootChildren = root ? root.children.length : 0;
      return { sheets, rules, articleVisible, rootChildren, body: document.body.innerText.slice(0, 200) };
    });
    console.log(`  ${ms}ms: sheets=${state.sheets}, rules=${state.rules}, articleVisible=${state.articleVisible}, rootChildren=${state.rootChildren}`);
  }

  await browser.close();
}

const URLS = [
  { name: 'home', url: 'https://www.dhmguide.com/' },
  { name: 'dosage-guide', url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025' },
];

// Test with 1500ms delay on CSS+JS to expose the FOUC window
for (const u of URLS) {
  await captureWithDelayedCSS({
    url: u.url,
    name: u.name,
    viewport: { width: 1280, height: 800 },
    deviceLabel: 'desktop',
    cssDelayMs: 1500,
  });
  await captureWithDelayedCSS({
    url: u.url,
    name: u.name,
    viewport: { width: 390, height: 844 },
    deviceLabel: 'mobile',
    cssDelayMs: 1500,
  });
}

console.log('Done');
