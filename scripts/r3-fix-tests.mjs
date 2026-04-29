// Empirical fix tests, each on a fresh page load to avoid state pollution
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.dhmguide.com/';
const OUT = '/Users/patrickkavanagh/dhm-guide-website/docs/layering-audit-2026-04-26';
const SHOTS = path.join(OUT, 'screenshots', 'r3-live');

async function setup(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.locator('button:has-text("Topics")').first().hover({ force: true });
  await page.waitForTimeout(700);
  return { ctx, page };
}

async function probe(page) {
  return await page.evaluate(() => {
    const dd = document.getElementById('topics-mega-menu');
    if (!dd) return { error: 'no dropdown' };
    const ddRect = dd.getBoundingClientRect();
    const img = document.querySelector('img[src*="before-after"], picture img');
    const imgRect = img.getBoundingClientRect();
    const ix = Math.max(ddRect.left, imgRect.left);
    const iy = Math.max(ddRect.top, imgRect.top);
    const ax = Math.min(ddRect.right, imgRect.right);
    const ay = Math.min(ddRect.bottom, imgRect.bottom);
    if (ix >= ax || iy >= ay) return { overlap: false };
    const cx = Math.round((ix + ax) / 2);
    const cy = Math.round((iy + ay) / 2);
    const top = document.elementFromPoint(cx, cy);
    const tag = top ? top.tagName : null;
    const stack = document.elementsFromPoint(cx, cy).slice(0, 4).map(e => e.tagName + (e.id ? '#' + e.id : ''));
    return {
      cx, cy,
      topAt: tag,
      stack,
      dropdownIsAbove: stack[0] !== 'IMG' || stack.indexOf('DIV#topics-mega-menu') === 0
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const fixes = {};

  // BASELINE
  {
    const { ctx, page } = await setup(browser);
    fixes.baseline = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-00-baseline.png') });
    await ctx.close();
  }

  // Fix A - dropdown z-index 9999
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const d = document.getElementById('topics-mega-menu');
      if (d) d.style.zIndex = '9999';
    });
    await page.waitForTimeout(150);
    fixes.A_dropdown_z9999 = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-A-dropdown-z9999.png') });
    await ctx.close();
  }

  // Fix B - header isolation:isolate
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const h = document.querySelector('header');
      if (h) h.style.isolation = 'isolate';
    });
    await page.waitForTimeout(150);
    fixes.B_header_isolate = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-B-header-isolate.png') });
    await ctx.close();
  }

  // Fix C - main {position:relative; z-index:0}  (creates stacking context for img)
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const m = document.querySelector('main');
      if (m) {
        m.style.position = 'relative';
        m.style.zIndex = '0';
      }
    });
    await page.waitForTimeout(150);
    fixes.C_main_relative_z0 = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-C-main-rel-z0.png') });
    await ctx.close();
  }

  // Fix D - portal: move dropdown to body
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const d = document.getElementById('topics-mega-menu');
      if (d) document.body.appendChild(d);
    });
    await page.waitForTimeout(150);
    fixes.D_portal_to_body = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-D-portal-body.png') });
    await ctx.close();
  }

  // Fix E - header z-index:50 (give the header itself a z-index value)
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const h = document.querySelector('header');
      if (h) h.style.zIndex = '50';
    });
    await page.waitForTimeout(150);
    fixes.E_header_z50 = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-E-header-z50.png') });
    await ctx.close();
  }

  // Fix F - header z-index:50 + position:fixed (already fixed). Just z-index alone.
  // This is same as E. Skipping.

  // Fix G - main isolation:isolate (instead of position+z-index)
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const m = document.querySelector('main');
      if (m) m.style.isolation = 'isolate';
    });
    await page.waitForTimeout(150);
    fixes.G_main_isolate = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-G-main-isolate.png') });
    await ctx.close();
  }

  // Fix H - simulate the most likely real fix: give header z-index:50 AND keep dropdown z-index:50
  // (header gives it its own positioned context above non-positioned siblings)
  // Already covered by E.

  // Fix I - the css override per W3C: combine D-style portal + dropdown z-index:9999
  {
    const { ctx, page } = await setup(browser);
    await page.evaluate(() => {
      const d = document.getElementById('topics-mega-menu');
      if (d) {
        document.body.appendChild(d);
        d.style.zIndex = '9999';
      }
    });
    await page.waitForTimeout(150);
    fixes.I_portal_plus_z9999 = await probe(page);
    await page.screenshot({ path: path.join(SHOTS, 'fix-I-portal-z9999.png') });
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, 'r3-empirical-fixes.json'), JSON.stringify(fixes, null, 2));
  console.log(JSON.stringify(fixes, null, 2));
  await browser.close();
})();
