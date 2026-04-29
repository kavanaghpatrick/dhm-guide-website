import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';
const URLS = [
  { name: 'home', url: 'https://www.dhmguide.com/' },
  { name: 'dosage-guide', url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025' },
];

const STAMPS = [100, 300, 500, 1000, 2000, 3000, 5000];

// Throttling: simulate slow 4G + 4x CPU throttling
const NETWORK_THROTTLE = {
  offline: false,
  latency: 50,
  downloadThroughput: (1500 * 1024) / 8, // 1.5 Mbps
  uploadThroughput: (750 * 1024) / 8,
};
const CPU_THROTTLE = 4;

async function captureSequence({ url, name, viewport, deviceLabel, cache }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport,
    userAgent: viewport.width === 390
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  await cdp.send('Network.emulateNetworkConditions', NETWORK_THROTTLE);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });

  // Track resource timing
  const resources = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    if (
      url.endsWith('.css') ||
      url.endsWith('.js') ||
      url.includes('.css?') ||
      url.includes('.js?') ||
      url.match(/\.(woff2?|ttf|otf)/)
    ) {
      try {
        const timing = resp.request().timing();
        resources.push({
          url: url.replace('https://www.dhmguide.com', ''),
          status: resp.status(),
          type: url.match(/\.css/) ? 'css' : url.match(/\.js/) ? 'js' : 'font',
          requestStart: timing.requestStart,
          responseEnd: timing.responseEnd,
        });
      } catch (e) {}
    }
  });

  const observations = [];
  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  const commitTime = Date.now() - navStart;

  let lastMs = 0;
  for (const ms of STAMPS) {
    await page.waitForTimeout(ms - lastMs);
    lastMs = ms;
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `${name}-${deviceLabel}-${cache}-${ms}ms.png`
    );
    try {
      await page.screenshot({ path: screenshotPath, fullPage: false });
    } catch (e) {
      console.warn(`Screenshot failed at ${ms}ms:`, e.message);
    }

    const state = await page.evaluate(() => {
      const root = document.getElementById('root');
      const rootChildren = root ? root.children.length : 0;
      const rootHTMLLength = root ? root.innerHTML.length : 0;
      const bodyTextLength = document.body.innerText.length;
      const bodyHTMLLength = document.body.innerHTML.length;

      // Detect React markers (data-reactroot is gone in React 18+, so look for typical class hashing)
      const hasReactComponentClasses = !!document.querySelector('[class*="bg-gradient"]');
      const hasTailwind = !!document.querySelector('style[data-vite-dev-id], link[href*="assets"]');

      // Check if hero section has rendered (visible signal of React mount)
      const heroH1 = document.querySelector('h1');
      const h1Text = heroH1 ? heroH1.innerText.slice(0, 100) : '';

      // Check for prerendered article content (the hidden-then-visible thing)
      const prerenderArticle = document.querySelector('article[itemtype*="schema.org/Article"]');
      const hasPrerenderContent = !!prerenderArticle;
      const prerenderVisible = prerenderArticle
        ? (() => {
            const cs = window.getComputedStyle(prerenderArticle);
            return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
          })()
        : false;

      // Stylesheet count
      const stylesheets = document.styleSheets.length;
      let cssRulesCount = 0;
      for (const ss of document.styleSheets) {
        try {
          cssRulesCount += ss.cssRules ? ss.cssRules.length : 0;
        } catch (e) {}
      }

      // Sample top-of-page visible text
      const visibleText = document.body.innerText.slice(0, 500);

      return {
        rootChildren,
        rootHTMLLength,
        bodyTextLength,
        bodyHTMLLength,
        hasReactComponentClasses,
        hasTailwind,
        h1Text,
        hasPrerenderContent,
        prerenderVisible,
        stylesheets,
        cssRulesCount,
        visibleText,
      };
    });

    observations.push({ ms, ...state });
  }

  // Capture nav + resource timing
  const perfData = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = performance.getEntriesByType('paint').map((p) => ({
      name: p.name,
      startTime: p.startTime,
    }));
    const resources = performance.getEntriesByType('resource').map((r) => ({
      name: r.name.replace('https://www.dhmguide.com', ''),
      type: r.initiatorType,
      startTime: r.startTime,
      responseEnd: r.responseEnd,
      duration: r.duration,
      transferSize: r.transferSize,
    }));
    return {
      nav: {
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEvent: nav.loadEventEnd,
        responseStart: nav.responseStart, // ~ TTFB
        domInteractive: nav.domInteractive,
        domComplete: nav.domComplete,
      },
      paints,
      resources: resources.filter((r) => r.name.match(/\.(css|js|woff2?)/)),
    };
  });

  await browser.close();
  return {
    name,
    deviceLabel,
    cache,
    url,
    commitTime,
    observations,
    perfData,
  };
}

async function main() {
  const allResults = [];

  // Desktop, cold cache
  for (const u of URLS) {
    console.log(`Testing ${u.name} desktop cold...`);
    const result = await captureSequence({
      url: u.url,
      name: u.name,
      viewport: { width: 1280, height: 800 },
      deviceLabel: 'desktop',
      cache: 'cold',
    });
    allResults.push(result);
  }

  // Mobile, cold cache
  for (const u of URLS) {
    console.log(`Testing ${u.name} mobile cold...`);
    const result = await captureSequence({
      url: u.url,
      name: u.name,
      viewport: { width: 390, height: 844 },
      deviceLabel: 'mobile',
      cache: 'cold',
    });
    allResults.push(result);
  }

  // Save full results
  await fs.writeFile(
    '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/timing.json',
    JSON.stringify(allResults, null, 2)
  );

  // Print summary
  for (const r of allResults) {
    console.log(`\n=== ${r.name} ${r.deviceLabel} ${r.cache} ===`);
    console.log(`URL: ${r.url}`);
    console.log(`Commit time: ${r.commitTime}ms`);
    console.log(`Paints:`, r.perfData.paints);
    console.log(`Nav:`, r.perfData.nav);
    console.log(`Observations:`);
    for (const o of r.observations) {
      console.log(
        `  ${o.ms}ms: rootChildren=${o.rootChildren}, bodyText=${o.bodyTextLength}c, h1="${o.h1Text}", prerenderVisible=${o.prerenderVisible}, hasReactClasses=${o.hasReactComponentClasses}, sheets=${o.stylesheets}, cssRules=${o.cssRulesCount}`
      );
    }
  }

  console.log('\nDone. Screenshots in:', SCREENSHOT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
