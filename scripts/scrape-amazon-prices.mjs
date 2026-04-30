#!/usr/bin/env node
/**
 * Amazon Price Scraper — autonomous edition.
 *
 * Reads data/amazon-asin-map.json, scrapes current price + per-serving for
 * each ASIN, writes data/amazon-prices.json. Designed to run unattended:
 * skip-and-continue on CAPTCHA, adaptive backoff, no stdin pauses.
 *
 * Stealth stack:
 *   - playwright-extra + puppeteer-extra-plugin-stealth (covers webdriver,
 *     chrome.runtime, navigator.permissions, plugins, languages, codecs,
 *     iframe.contentWindow, etc.)
 *   - persistent context at .playwright-userdata/ (cookies survive runs)
 *   - realistic Chrome 131 UA + en-US locale + America/New_York TZ
 *   - launch args that strip automation banners
 *   - sometimes hit homepage first then navigate (vs. always direct /dp/)
 *   - randomized inter-product delays + reading pauses + lazy scroll
 *
 * Usage:
 *   node scripts/scrape-amazon-prices.mjs                # autonomous, headed
 *   node scripts/scrape-amazon-prices.mjs --headless     # autonomous, headless
 *   node scripts/scrape-amazon-prices.mjs --limit=3      # test first 3 ASINs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// --- CLI args ---

function parseArgs(argv) {
  const out = { headless: false };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--asin-map=')) out.asinMap = a.slice('--asin-map='.length);
    else if (a.startsWith('--out=')) out.out = a.slice('--out='.length);
    else if (a.startsWith('--limit=')) out.limit = parseInt(a.slice('--limit='.length), 10);
    else if (a === '--headless') out.headless = true;
    else if (a === '--headed') out.headless = false;
  }
  return out;
}

const args = parseArgs(process.argv);
const ASIN_MAP_PATH = path.resolve(ROOT, args.asinMap || 'data/amazon-asin-map.json');
const OUT_PATH = path.resolve(ROOT, args.out || 'data/amazon-prices.json');
const USER_DATA_DIR = path.resolve(ROOT, '.playwright-userdata');
const LIMIT = Number.isFinite(args.limit) ? args.limit : null;

// --- Selectors ---
// Tried in order; first non-strikethrough match wins.
const PRICE_SELECTORS = [
  '#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price) span.a-offscreen',
  '#corePrice_feature_div .a-price:not(.a-text-price) span.a-offscreen',
  "span.a-price[data-a-size='xl'] span.a-offscreen",
  '#apex_desktop .priceToPay span.a-offscreen',
  '.priceToPay span.a-offscreen',
  '#price_inside_buybox',
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  'span.a-price:not(.a-text-price) span.a-offscreen',
];

const PER_SERVING_RE = /\$[\d.]+\s*\/\s*(?:count|serving|capsule|pill|tablet|fl\s*oz)/i;

// Realistic Mac Chrome 131
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const LAUNCH_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-site-isolation-trials',
  '--no-default-browser-check',
  '--no-first-run',
  '--disable-dev-shm-usage',
  '--disable-infobars',
];

// --- Utilities ---

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randInt = (min, max) => Math.floor(min + Math.random() * (max - min));
const randFloat = (min, max) => min + Math.random() * (max - min);

async function humanWait(min = 800, max = 2400) {
  await sleep(randInt(min, max));
}

async function humanReadingPause() {
  await sleep(randInt(3500, 8500));
}

async function humanScroll(page) {
  // 3-6 scroll chunks down, occasional small back-up
  const chunks = randInt(3, 6);
  for (let i = 0; i < chunks; i++) {
    const dy = randInt(280, 720);
    await page.mouse.wheel(0, dy).catch(() => {});
    await sleep(randInt(400, 1100));
    if (Math.random() < 0.15) {
      await page.mouse.wheel(0, -randInt(80, 200)).catch(() => {});
      await sleep(randInt(300, 700));
    }
  }
}

async function detectBlocking(page) {
  try {
    const url = page.url();
    if (url.includes('/errors/validateCaptcha')) return 'captcha';
    const title = (await page.title().catch(() => '')) || '';
    if (/Robot Check/i.test(title)) return 'captcha';
    if (/Page Not Found/i.test(title)) return 'not_found';
    const sample = await page.evaluate(() => (document.body?.innerText || '').slice(0, 4000)).catch(() => '');
    if (/Enter the characters you see below/i.test(sample)) return 'captcha';
    if (/Sorry, we just need to make sure you're not a robot/i.test(sample)) return 'captcha';
    if (/Looking for something\?/i.test(sample) && /We're sorry/i.test(sample)) return 'not_found';
    return null;
  } catch {
    return null;
  }
}

async function detectOOS(page) {
  try {
    const oos = await page.evaluate(() => {
      const el = document.querySelector('#availability span') || document.querySelector('#availability');
      if (!el) return false;
      const t = (el.textContent || '').trim().toLowerCase();
      return /currently unavailable|out of stock|temporarily out/i.test(t);
    }).catch(() => false);
    return !!oos;
  } catch {
    return false;
  }
}

async function extractPrice(page) {
  for (const sel of PRICE_SELECTORS) {
    try {
      const loc = page.locator(sel);
      const count = await loc.count().catch(() => 0);
      if (count === 0) continue;
      // Iterate matches; reject strikethrough/list-price wrappers.
      for (let i = 0; i < Math.min(count, 5); i++) {
        const el = loc.nth(i);
        const isStrike = await el.evaluate((node) => {
          let p = node.parentElement;
          while (p && p !== document.body) {
            if (p.classList && (p.classList.contains('a-text-price') || p.dataset?.aStrike === 'true')) return true;
            const cs = window.getComputedStyle(p);
            if (cs.textDecoration && cs.textDecoration.includes('line-through')) return true;
            p = p.parentElement;
          }
          return false;
        }).catch(() => false);
        if (isStrike) continue;
        const txt = (await el.textContent({ timeout: 1500 }).catch(() => null))?.trim();
        if (txt && /\$[\d,]+\.?\d*/.test(txt)) return { price: txt, selector: sel };
      }
    } catch { /* try next */ }
  }
  return { price: null, selector: null };
}

async function extractPerServing(page) {
  try {
    const body = await page.evaluate(() => document.body?.innerText || '');
    const m = body.match(PER_SERVING_RE);
    if (!m) return null;
    // Strip the unit suffix; JSX already renders "per serving" itself.
    const dollar = m[0].match(/\$[\d.]+/);
    return dollar ? dollar[0] : null;
  } catch {
    return null;
  }
}

async function extractProductName(page) {
  try {
    const el = page.locator('#productTitle').first();
    if (await el.count() === 0) return null;
    const txt = (await el.textContent({ timeout: 1000 }).catch(() => null))?.trim();
    return txt || null;
  } catch {
    return null;
  }
}

// --- Per-ASIN scrape ---

async function navigateToProduct(page, asin, viaHomepage) {
  if (viaHomepage) {
    try {
      await page.goto('https://www.amazon.com/', { waitUntil: 'commit', timeout: 15000 });
      await humanWait(1200, 2800);
      await page.mouse.move(randInt(200, 800), randInt(80, 200)).catch(() => {});
      await humanWait(400, 1200);
    } catch {
      // Skip detour on timeout; direct nav below still works
    }
  }
  await page.goto(`https://www.amazon.com/dp/${asin}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Wait for price hydration (any of the buybox containers). Tolerate timeout —
  // OOS/delisted pages legitimately won't have these.
  await page.waitForSelector(
    '#corePrice_feature_div .a-price, #corePriceDisplay_desktop_feature_div .a-price, #priceblock_ourprice, #availability',
    { timeout: 8000 }
  ).catch(() => {});
}

// Sets US delivery location (zip 10001 = NYC) so Amazon serves USD prices.
// Profile persists the location cookies for future runs. Idempotent.
async function ensureUSDeliveryLocation(page) {
  await page.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(randInt(1500, 3000));

  const currentLoc = (await page.locator('#glow-ingress-line2').textContent({ timeout: 5000 }).catch(() => '')) || '';
  const looksUS = /\b\d{5}\b|United States/i.test(currentLoc);
  if (looksUS) {
    console.log(`Delivery location already US: "${currentLoc.trim()}"`);
    return;
  }
  console.log(`Delivery location: "${currentLoc.trim() || 'unknown'}". Setting to US 10001...`);

  await page.click('#nav-global-location-popover-link', { timeout: 10000 });
  await page.waitForSelector('#GLUXZipUpdateInput', { timeout: 10000 });
  await page.fill('#GLUXZipUpdateInput', '10001');
  await sleep(600);
  await page.locator('#GLUXZipUpdate input[type="submit"], #GLUXZipUpdate-announce').first().click({ timeout: 5000 }).catch(async () => {
    await page.keyboard.press('Enter');
  });
  await sleep(3000);

  // Some flows pop a confirmation/continue button
  const cont = page.locator('button[name="glowDoneButton"], .a-popover-footer button.a-button-primary, [name="glowDoneButton"]');
  if (await cont.count() > 0) {
    await cont.first().click({ timeout: 3000 }).catch(() => {});
    await sleep(1500);
  }

  await page.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(randInt(1200, 2200));
  const newLoc = (await page.locator('#glow-ingress-line2').textContent({ timeout: 5000 }).catch(() => '')) || '';
  console.log(`Delivery location now: "${newLoc.trim()}"`);
}

async function scrapeOnce(page, asin, opts = {}) {
  const viaHomepage = opts.viaHomepage ?? Math.random() < 0.35;
  await navigateToProduct(page, asin, viaHomepage);

  // Let lazy elements mount
  await sleep(randInt(900, 1800));

  const block = await detectBlocking(page);
  if (block) return { status: block, sourceUrl: page.url() };

  // Human-like dwell
  await humanScroll(page);
  await humanReadingPause();

  if (await detectOOS(page)) {
    const productName = await extractProductName(page);
    return { status: 'oos', sourceUrl: page.url(), productName };
  }

  const [{ price, selector }, pricePerServing, productName] = await Promise.all([
    extractPrice(page),
    extractPerServing(page),
    extractProductName(page),
  ]);

  if (!price) {
    return { status: 'price_missing', sourceUrl: page.url(), productName, selector };
  }

  return {
    status: 'ok',
    sourceUrl: page.url(),
    price,
    pricePerServing,
    productName,
    selector,
  };
}

// --- Main ---

async function main() {
  if (!fs.existsSync(ASIN_MAP_PATH)) {
    console.error(`asin map not found: ${ASIN_MAP_PATH}`);
    process.exit(1);
  }

  const all = JSON.parse(fs.readFileSync(ASIN_MAP_PATH, 'utf8'));
  let entries = all.filter((e) => e && e.asin);
  if (LIMIT != null) entries = entries.slice(0, LIMIT);

  console.log(`Scraping ${entries.length} of ${all.length} entries (skipped ${all.length - entries.length} without asin)`);
  console.log(`Mode: ${args.headless ? 'headless' : 'headed (visible Chrome)'}`);
  console.log(`User data: ${USER_DATA_DIR}`);

  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: args.headless,
    viewport: { width: 1280, height: 800 },
    userAgent: UA,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    args: LAUNCH_ARGS,
    ignoreDefaultArgs: ['--enable-automation'],
  });

  // Patch a couple things stealth plugin doesn't always cover
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    if (!window.chrome) window.chrome = { runtime: {} };
  });

  const page = context.pages()[0] || await context.newPage();

  // Make sure Amazon serves the US site (USD prices, US-only buy box)
  await ensureUSDeliveryLocation(page);

  const byAsin = {};
  const failed = [];
  let successful = 0;
  let consecutiveCaptchas = 0;
  let baseDelayFloor = 4000;
  let baseDelayCeil = 9000;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`\n[${i + 1}/${entries.length}] ${entry.asin}  ${entry.name}`);

    let result;
    try {
      result = await scrapeOnce(page, entry.asin);
    } catch (err) {
      const msg = err?.message || String(err);
      console.log(`  error: ${msg.split('\n')[0]}`);
      result = { status: 'error', sourceUrl: page.url?.() || null, error: msg };
    }
    let attempt = 1;

    if (result.status === 'captcha') {
      consecutiveCaptchas += 1;
      console.log(`  CAPTCHA detected on attempt ${attempt}. Cooling down + retrying via homepage detour...`);
      const cooldown = randInt(45000, 90000) * Math.min(consecutiveCaptchas, 3);
      console.log(`  cooldown ${(cooldown / 1000).toFixed(0)}s`);
      await sleep(cooldown);
      try {
        result = await scrapeOnce(page, entry.asin, { viaHomepage: true });
      } catch (err) {
        const msg = err?.message || String(err);
        console.log(`  retry error: ${msg.split('\n')[0]}`);
        result = { status: 'error', sourceUrl: page.url?.() || null, error: msg };
      }
      attempt = 2;
    } else if (result.status === 'price_missing') {
      console.log(`  price not found on first pass; retrying after short cooldown...`);
      await sleep(randInt(8000, 14000));
      try {
        result = await scrapeOnce(page, entry.asin, { viaHomepage: false });
      } catch (err) {
        const msg = err?.message || String(err);
        console.log(`  retry error: ${msg.split('\n')[0]}`);
        result = { status: 'error', sourceUrl: page.url?.() || null, error: msg };
      }
      attempt = 2;
    }

    if (result.status === 'ok') {
      console.log(`  ok price=${result.price}${result.pricePerServing ? ' (' + result.pricePerServing + ')' : ''}  via ${result.selector}`);
      byAsin[entry.asin] = {
        asin: entry.asin,
        productName: result.productName || entry.name,
        price: result.price,
        pricePerServing: result.pricePerServing || null,
        currency: 'USD',
        scrapedAt: new Date().toISOString(),
        sourceUrl: result.sourceUrl,
      };
      successful += 1;
      consecutiveCaptchas = 0;
    } else {
      console.log(`  ${result.status}${result.selector ? ' (last selector tried: ' + result.selector + ')' : ''}`);
      failed.push({
        asin: entry.asin,
        name: entry.name,
        status: result.status,
        sourceUrl: result.sourceUrl,
        productName: result.productName || null,
      });
      if (result.status === 'captcha') {
        // After a 2nd consecutive captcha, double base delays for the rest of the run
        if (consecutiveCaptchas >= 2) {
          baseDelayFloor = Math.min(baseDelayFloor * 2, 30000);
          baseDelayCeil = Math.min(baseDelayCeil * 2, 60000);
          console.log(`  adaptive backoff: inter-product delay now ${baseDelayFloor}-${baseDelayCeil}ms`);
        }
      }
    }

    if (i < entries.length - 1) {
      const wait = randInt(baseDelayFloor, baseDelayCeil);
      console.log(`  waiting ${(wait / 1000).toFixed(1)}s...`);
      await sleep(wait);
    }
  }

  const output = {
    _meta: {
      scrapedAt: new Date().toISOString(),
      totalProducts: entries.length,
      successful,
      failed: failed.length,
      headless: args.headless,
    },
    ...byAsin,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\nScraped ${successful}/${entries.length} successful.`);
  if (failed.length > 0) {
    const captchas = failed.filter((f) => f.status === 'captcha').map((f) => f.asin);
    const oos = failed.filter((f) => f.status === 'oos').map((f) => f.asin);
    const missing = failed.filter((f) => f.status === 'price_missing').map((f) => f.asin);
    const errors = failed.filter((f) => f.status === 'error' || f.status === 'not_found').map((f) => f.asin);
    if (captchas.length) console.log(`  CAPTCHA-blocked: ${captchas.join(', ')}`);
    if (oos.length) console.log(`  Out of stock:    ${oos.join(', ')}`);
    if (missing.length) console.log(`  Price missing:   ${missing.join(', ')}`);
    if (errors.length) console.log(`  Errors:          ${errors.join(', ')}`);
  }
  console.log(`Wrote: ${OUT_PATH}`);

  await context.close();
  process.exit(successful > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
