// Test: What does the prerendered HTML look like WITHOUT JS executing?
// This shows what Google bot, social crawlers, AND the user would see during the FOUC gap.
import { chromium } from 'playwright';

async function captureNoJS({ url, name, viewport, deviceLabel }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport,
    javaScriptEnabled: false, // KEY: disable JS to see ONLY prerendered HTML
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({
    path: `/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots/${name}-${deviceLabel}-NOJS.png`,
    fullPage: false,
  });
  await page.screenshot({
    path: `/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots/${name}-${deviceLabel}-NOJS-fullpage.png`,
    fullPage: true,
  });
  await browser.close();
  console.log(`Captured ${name} ${deviceLabel} (no JS)`);
}

const URLS = [
  { name: 'home', url: 'https://www.dhmguide.com/' },
  { name: 'dosage-guide', url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025' },
];

for (const u of URLS) {
  await captureNoJS({
    url: u.url,
    name: u.name,
    viewport: { width: 1280, height: 800 },
    deviceLabel: 'desktop',
  });
  await captureNoJS({
    url: u.url,
    name: u.name,
    viewport: { width: 390, height: 844 },
    deviceLabel: 'mobile',
  });
}
console.log('Done');
