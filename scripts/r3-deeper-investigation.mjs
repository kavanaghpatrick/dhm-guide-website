// Deeper investigation - the dropdown box is huge but mostly transparent.
// Need to find which actual visible content of the dropdown overlaps with hero img,
// and verify whether z-index 9999 actually moves it above the img at THAT point.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.dhmguide.com/';
const OUT = '/Users/patrickkavanagh/dhm-guide-website/docs/layering-audit-2026-04-26';
const SHOTS = path.join(OUT, 'screenshots', 'r3-live');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const topicsBtn = page.locator('button:has-text("Topics")').first();
  await topicsBtn.hover({ force: true });
  await page.waitForTimeout(800);

  // Inspect the dropdown's computed background and inner visible columns
  const data = await page.evaluate(() => {
    const dd = document.getElementById('topics-mega-menu');
    if (!dd) return { error: 'no dropdown' };
    const ddCs = window.getComputedStyle(dd);
    const ddRect = dd.getBoundingClientRect();

    // Find first-child container (the actual visible white card)
    const inner = dd.firstElementChild;
    const innerCs = inner ? window.getComputedStyle(inner) : null;
    const innerRect = inner ? inner.getBoundingClientRect() : null;

    // Find all visible rect descendants and report their backgrounds
    const visibleChildren = [];
    function walk(el, depth) {
      if (depth > 4) return;
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      visibleChildren.push({
        depth,
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 60),
        position: cs.position,
        zIndex: cs.zIndex,
        background: cs.backgroundColor,
        boxShadow: cs.boxShadow.slice(0, 60),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      });
      for (const c of el.children) walk(c, depth + 1);
    }
    walk(dd, 0);

    // Hero img
    const img = document.querySelector('img[src*="before-after"], picture img');
    const imgRect = img.getBoundingClientRect();
    const imgCs = window.getComputedStyle(img);

    // Check actual visible-column rect of dropdown (the white panel)
    return {
      dropdown: {
        rect: ddRect,
        background: ddCs.backgroundColor,
        position: ddCs.position,
        zIndex: ddCs.zIndex,
        boxShadow: ddCs.boxShadow.slice(0, 80),
        innerHTML_len: dd.innerHTML.length
      },
      inner: inner ? {
        tag: inner.tagName,
        cls: (inner.className || '').toString().slice(0, 80),
        rect: innerRect,
        background: innerCs.backgroundColor,
        position: innerCs.position,
        zIndex: innerCs.zIndex,
        boxShadow: innerCs.boxShadow.slice(0, 80)
      } : null,
      heroImg: {
        rect: imgRect,
        position: imgCs.position,
        zIndex: imgCs.zIndex
      },
      visibleChildren: visibleChildren.slice(0, 20)
    };
  });
  fs.writeFileSync(path.join(OUT, 'r3-deeper.json'), JSON.stringify(data, null, 2));
  console.log(JSON.stringify(data, null, 2));

  // Now find a point that's in the visible white panel of the dropdown AND overlaps hero img
  const pointTest = await page.evaluate(() => {
    const dd = document.getElementById('topics-mega-menu');
    const inner = dd.firstElementChild;
    const innerR = inner.getBoundingClientRect();
    const img = document.querySelector('img[src*="before-after"], picture img');
    const imgR = img.getBoundingClientRect();

    const ix = Math.max(innerR.left, imgR.left);
    const iy = Math.max(innerR.top, imgR.top);
    const ax = Math.min(innerR.right, imgR.right);
    const ay = Math.min(innerR.bottom, imgR.bottom);

    if (ix >= ax || iy >= ay) return { overlap: false, innerR, imgR };
    const cx = Math.round((ix + ax) / 2);
    const cy = Math.round((iy + ay) / 2);
    const top = document.elementFromPoint(cx, cy);
    return {
      overlap: true,
      cx, cy,
      innerVisibleRect: { x: innerR.x, y: innerR.y, w: innerR.width, h: innerR.height },
      imgRect: { x: imgR.x, y: imgR.y, w: imgR.width, h: imgR.height },
      elementFromPoint: top ? `${top.tagName}${top.id ? '#' + top.id : ''}.${(top.className || '').toString().slice(0, 60)}` : null,
      elementFromPointPath: (() => {
        let n = top, parts = [];
        while (n && n !== document.body && parts.length < 8) {
          let s = n.tagName.toLowerCase();
          if (n.id) s += '#' + n.id;
          if (n.className && typeof n.className === 'string') s += '.' + n.className.split(/\s+/).slice(0, 2).join('.');
          parts.unshift(s);
          n = n.parentElement;
        }
        return parts.join(' > ');
      })()
    };
  });
  console.log('\nPOINT TEST (visible panel vs img):', JSON.stringify(pointTest, null, 2));
  fs.writeFileSync(path.join(OUT, 'r3-point-test.json'), JSON.stringify(pointTest, null, 2));

  // Now rigorously test the fixes at THAT point
  const fixes = {};

  async function probe() {
    return await page.evaluate(() => {
      const dd = document.getElementById('topics-mega-menu');
      const inner = dd.firstElementChild;
      const innerR = inner.getBoundingClientRect();
      const img = document.querySelector('img[src*="before-after"], picture img');
      const imgR = img.getBoundingClientRect();
      const ix = Math.max(innerR.left, imgR.left);
      const iy = Math.max(innerR.top, imgR.top);
      const ax = Math.min(innerR.right, imgR.right);
      const ay = Math.min(innerR.bottom, imgR.bottom);
      if (ix >= ax || iy >= ay) return { overlap: false };
      const cx = Math.round((ix + ax) / 2);
      const cy = Math.round((iy + ay) / 2);
      const top = document.elementFromPoint(cx, cy);
      return {
        cx, cy,
        topAt: top ? top.tagName + (top.id ? '#' + top.id : '') : null
      };
    });
  }

  // Fix A - just bump z-index on dropdown
  await page.evaluate(() => {
    const d = document.getElementById('topics-mega-menu');
    d.dataset.origZ = d.style.zIndex;
    d.style.zIndex = '9999';
  });
  await page.waitForTimeout(120);
  fixes.A_dropdownZ9999 = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixA.png') });
  await page.evaluate(() => { const d = document.getElementById('topics-mega-menu'); d.style.zIndex = d.dataset.origZ || ''; });

  // Fix B - header isolation
  await page.evaluate(() => { const h = document.querySelector('header'); h.dataset.origIso = h.style.isolation || ''; h.style.isolation = 'isolate'; });
  await page.waitForTimeout(120);
  fixes.B_headerIsolate = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixB.png') });
  await page.evaluate(() => { const h = document.querySelector('header'); h.style.isolation = h.dataset.origIso || ''; });

  // Fix C - main relative + zIndex 0
  await page.evaluate(() => {
    const m = document.querySelector('main');
    m.dataset.origP = m.style.position; m.dataset.origZ = m.style.zIndex;
    m.style.position = 'relative'; m.style.zIndex = '0';
  });
  await page.waitForTimeout(120);
  fixes.C_mainContext = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixC.png') });
  await page.evaluate(() => { const m = document.querySelector('main'); m.style.position = m.dataset.origP || ''; m.style.zIndex = m.dataset.origZ || ''; });

  // Fix D - portal to body
  await page.evaluate(() => {
    const d = document.getElementById('topics-mega-menu');
    d.dataset.origParent = d.parentElement.tagName;
    document.body.appendChild(d);
  });
  await page.waitForTimeout(120);
  fixes.D_portalToBody = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixD.png') });

  // Fix E - z9999 + main context (combined)
  // Reload to get clean state with dropdown back in place
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('button:has-text("Topics")').first().hover({ force: true });
  await page.waitForTimeout(800);

  // Apply both
  await page.evaluate(() => {
    const m = document.querySelector('main');
    m.style.position = 'relative'; m.style.zIndex = '0';
  });
  await page.waitForTimeout(120);
  fixes.E_mainContextOnly = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixE-mainOnly.png') });

  // Fix F - body isolate
  await page.evaluate(() => { document.body.style.isolation = 'isolate'; });
  await page.waitForTimeout(120);
  fixes.F_bodyIsolate = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixF-bodyIso.png') });
  await page.evaluate(() => { document.body.style.isolation = ''; const m = document.querySelector('main'); m.style.position = ''; m.style.zIndex = ''; });

  // Fix G - put a z-index on the header itself
  await page.evaluate(() => { const h = document.querySelector('header'); h.style.zIndex = '50'; });
  await page.waitForTimeout(120);
  fixes.G_headerZ50 = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixG-headerZ50.png') });
  await page.evaluate(() => { const h = document.querySelector('header'); h.style.zIndex = ''; });

  // Fix H - put header z-index AND main wrapper isolation
  await page.evaluate(() => {
    const h = document.querySelector('header'); h.style.zIndex = '50';
    const m = document.querySelector('main'); m.style.isolation = 'isolate';
  });
  await page.waitForTimeout(120);
  fixes.H_headerZ50_mainIsolate = await probe();
  await page.screenshot({ path: path.join(SHOTS, 'd-fixH.png') });

  fs.writeFileSync(path.join(OUT, 'r3-fix-results-deeper.json'), JSON.stringify(fixes, null, 2));
  console.log('\nFIXES:', JSON.stringify(fixes, null, 2));

  await browser.close();
})();
