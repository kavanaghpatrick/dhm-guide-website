// Definitive test: Block JS execution but allow CSS, see if prerendered article paints styled
import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';

async function test({ url, name, viewport, deviceLabel, blockJS, blockCSS }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, javaScriptEnabled: !blockJS });
  const page = await ctx.newPage();

  if (blockCSS) {
    await page.route('**/assets/*.css', (r) => r.abort());
  }
  if (blockJS) {
    // Already blocked via context, but also block requests just in case
    await page.route('**/assets/*.js', (r) => r.abort());
  }

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}-${deviceLabel}-${blockJS ? 'noJS' : 'withJS'}-${blockCSS ? 'noCSS' : 'withCSS'}.png`,
    fullPage: false,
  });
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}-${deviceLabel}-${blockJS ? 'noJS' : 'withJS'}-${blockCSS ? 'noCSS' : 'withCSS'}-full.png`,
    fullPage: true,
  });
  await browser.close();
  console.log(`Captured: ${name} ${deviceLabel} blockJS=${blockJS} blockCSS=${blockCSS}`);
}

// What user sees IF CSS loads but JS is blocked (the "ideal" prerender experience):
// This shows the styled prerendered article
await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  blockJS: true,
  blockCSS: false,
});

await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 390, height: 844 },
  deviceLabel: 'mobile',
  blockJS: true,
  blockCSS: false,
});

// Worst case: nothing loaded (the "first paint" frame potentially)
await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  blockJS: true,
  blockCSS: true,
});

console.log('Done');
