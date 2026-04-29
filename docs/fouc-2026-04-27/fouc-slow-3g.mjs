// Final test: Slow 3G + 6x CPU throttle to expose the FOUC reliably
import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';

async function test({ url, name, viewport, deviceLabel }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  // Slow 3G profile
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'commit' });

  const stamps = [200, 500, 800, 1200, 1800, 2500, 4000, 6000, 9000];
  let last = 0;
  const observations = [];

  for (const ms of stamps) {
    await page.waitForTimeout(ms - last);
    last = ms;
    const elapsed = Date.now() - navStart;
    try {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${name}-${deviceLabel}-slow3g-${ms}ms.png`,
        fullPage: false,
        timeout: 5000,
      });
    } catch (e) {
      console.warn(`Screenshot failed at ${ms}ms`);
    }

    const state = await page.evaluate(() => {
      const sheets = document.styleSheets.length;
      let rules = 0;
      for (const s of document.styleSheets) {
        try { rules += s.cssRules ? s.cssRules.length : 0; } catch {}
      }
      const root = document.getElementById('root');
      const article = document.querySelector('article');
      const articleVisible = article ? (() => {
        const cs = window.getComputedStyle(article);
        const rect = article.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && rect.height > 0;
      })() : false;
      const h1 = document.querySelector('h1');
      const text = document.body.innerText.slice(0, 200);
      return {
        sheets, rules,
        articleVisible,
        articleH1: h1 ? h1.innerText.slice(0, 60) : '',
        rootChildren: root ? root.children.length : 0,
        rootHTML: root ? root.innerHTML.slice(0, 100) : '',
        bodyText: text.slice(0, 200),
        textLen: document.body.innerText.length,
      };
    });
    observations.push({ ms, elapsed, ...state });
    console.log(`  ${ms}ms (real ${elapsed}ms): css=${state.rules}rules, articleVisible=${state.articleVisible}, h1="${state.articleH1}", text=${state.textLen}c`);
  }

  await browser.close();
  return observations;
}

const results = {};
console.log('=== HOME desktop slow3G ===');
results.homeDesktop = await test({
  url: 'https://www.dhmguide.com/',
  name: 'home',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
});

console.log('\n=== HOME mobile slow3G ===');
results.homeMobile = await test({
  url: 'https://www.dhmguide.com/',
  name: 'home',
  viewport: { width: 390, height: 844 },
  deviceLabel: 'mobile',
});

console.log('\n=== DOSAGE-GUIDE desktop slow3G ===');
results.dosageDesktop = await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
});

console.log('\n=== DOSAGE-GUIDE mobile slow3G ===');
results.dosageMobile = await test({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 390, height: 844 },
  deviceLabel: 'mobile',
});

const fs = await import('node:fs/promises');
await fs.writeFile(
  '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/timing-slow3g.json',
  JSON.stringify(results, null, 2)
);

console.log('\nDone');
