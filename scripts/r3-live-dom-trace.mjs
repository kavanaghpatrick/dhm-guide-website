// R3 Live DOM Trace - Capture full DOM tree + computed styles + stacking contexts
// from production https://www.dhmguide.com/ to definitively explain why dropdown
// renders below page images even after PR #339.

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.dhmguide.com/';
const OUT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/layering-audit-2026-04-26';
const SHOTS = path.join(OUT_DIR, 'screenshots', 'r3-live');
const VIEWPORT = { width: 1280, height: 800 };

// Properties to capture per node that affect stacking context / overlap
const STYLE_KEYS = [
  'position', 'zIndex', 'transform', 'opacity', 'filter', 'backdropFilter',
  'willChange', 'isolation', 'mixBlendMode', 'contain', 'perspective',
  'clipPath', 'mask', 'overflow', 'display', 'pointerEvents'
];

const log = (...a) => console.log('[R3]', ...a);

async function dumpTree(page) {
  return await page.evaluate((styleKeys) => {
    function describe(el, depth, maxDepth) {
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const styles = {};
      for (const k of styleKeys) styles[k] = cs[k];

      // creates stacking context?
      const createsContext = (() => {
        if (cs.position === 'fixed' || cs.position === 'sticky') return true;
        if ((cs.position === 'relative' || cs.position === 'absolute') && cs.zIndex !== 'auto') return true;
        if (cs.opacity !== '1' && parseFloat(cs.opacity) < 1) return true;
        if (cs.transform && cs.transform !== 'none') return true;
        if (cs.filter && cs.filter !== 'none') return true;
        if (cs.backdropFilter && cs.backdropFilter !== 'none') return true;
        if (cs.willChange && /transform|opacity|filter|perspective/.test(cs.willChange)) return true;
        if (cs.isolation === 'isolate') return true;
        if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') return true;
        if (cs.contain && /(layout|paint|strict|content)/.test(cs.contain)) return true;
        if (cs.perspective && cs.perspective !== 'none') return true;
        if (cs.clipPath && cs.clipPath !== 'none') return true;
        if (cs.mask && cs.mask !== 'none' && cs.mask !== 'auto') return true;
        return false;
      })();

      const node = {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: el.className && typeof el.className === 'string' ? el.className.slice(0, 200) : null,
        styles,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        createsContext,
        children: []
      };

      if (depth < maxDepth) {
        for (const child of el.children) {
          // Skip script / style nodes from tree
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META'].includes(child.tagName)) continue;
          node.children.push(describe(child, depth + 1, maxDepth));
        }
      }
      return node;
    }

    return describe(document.body, 0, 12);
  }, STYLE_KEYS);
}

async function findKeyElements(page) {
  return await page.evaluate(() => {
    const out = {};

    // dropdown - look for visible nav menu / topics dropdown
    // It typically appears as an absolute / fixed element after hover
    const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // visible, not too small, has fixed/absolute position, intersects with hero area (y > header)
      return (cs.position === 'fixed' || cs.position === 'absolute') &&
             r.width > 100 && r.height > 100 &&
             r.top > 40 && r.top < 200 &&
             r.left > 100 && // not full-width
             cs.visibility !== 'hidden' &&
             cs.display !== 'none';
    });

    function pathOf(el) {
      const parts = [];
      let n = el;
      while (n && n !== document.body && parts.length < 12) {
        let s = n.tagName.toLowerCase();
        if (n.id) s += '#' + n.id;
        if (n.className && typeof n.className === 'string') {
          s += '.' + n.className.split(/\s+/).slice(0, 2).join('.');
        }
        parts.unshift(s);
        n = n.parentElement;
      }
      return parts.join(' > ');
    }

    out.dropdownCandidates = candidates.slice(0, 10).map(el => {
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        path: pathOf(el),
        text: (el.innerText || '').slice(0, 80),
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        position: cs.position,
        zIndex: cs.zIndex,
        transform: cs.transform,
        backdropFilter: cs.backdropFilter,
        opacity: cs.opacity
      };
    });

    // hero img
    const imgs = Array.from(document.querySelectorAll('img'));
    out.images = imgs.slice(0, 6).map(img => {
      const cs = window.getComputedStyle(img);
      const r = img.getBoundingClientRect();
      return {
        path: pathOf(img),
        src: (img.src || '').split('/').pop(),
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        position: cs.position,
        zIndex: cs.zIndex,
        transform: cs.transform,
        opacity: cs.opacity
      };
    });

    // header
    const header = document.querySelector('header');
    if (header) {
      const cs = window.getComputedStyle(header);
      const r = header.getBoundingClientRect();
      out.header = {
        path: pathOf(header),
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        position: cs.position,
        zIndex: cs.zIndex,
        transform: cs.transform,
        backdropFilter: cs.backdropFilter,
        isolation: cs.isolation,
        willChange: cs.willChange
      };
    }
    return out;
  });
}

async function buildAncestorTrace(page, selectorScript) {
  return await page.evaluate((script) => {
    // eslint-disable-next-line no-new-func
    const target = new Function('return ' + script)();
    if (!target) return null;
    const chain = [];
    let n = target;
    while (n && n !== document.documentElement) {
      const cs = window.getComputedStyle(n);
      let creates = false;
      let reasons = [];
      if (cs.position === 'fixed' || cs.position === 'sticky') { creates = true; reasons.push(`position:${cs.position}`); }
      if ((cs.position === 'relative' || cs.position === 'absolute') && cs.zIndex !== 'auto') { creates = true; reasons.push(`position:${cs.position}+zIndex:${cs.zIndex}`); }
      if (cs.opacity !== '1' && parseFloat(cs.opacity) < 1) { creates = true; reasons.push(`opacity:${cs.opacity}`); }
      if (cs.transform && cs.transform !== 'none') { creates = true; reasons.push(`transform`); }
      if (cs.filter && cs.filter !== 'none') { creates = true; reasons.push(`filter`); }
      if (cs.backdropFilter && cs.backdropFilter !== 'none') { creates = true; reasons.push(`backdropFilter`); }
      if (cs.willChange && /transform|opacity|filter|perspective/.test(cs.willChange)) { creates = true; reasons.push(`willChange:${cs.willChange}`); }
      if (cs.isolation === 'isolate') { creates = true; reasons.push(`isolation:isolate`); }
      if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') { creates = true; reasons.push(`mixBlendMode:${cs.mixBlendMode}`); }
      if (cs.contain && /(layout|paint|strict|content)/.test(cs.contain)) { creates = true; reasons.push(`contain:${cs.contain}`); }

      let s = n.tagName.toLowerCase();
      if (n.id) s += '#' + n.id;
      if (n.className && typeof n.className === 'string') s += '.' + n.className.split(/\s+/).slice(0, 2).join('.');

      chain.push({
        sel: s,
        position: cs.position,
        zIndex: cs.zIndex,
        transform: cs.transform,
        opacity: cs.opacity,
        backdropFilter: cs.backdropFilter,
        isolation: cs.isolation,
        willChange: cs.willChange,
        contain: cs.contain,
        createsStackingContext: creates,
        reasons: reasons.join(', ')
      });
      n = n.parentElement;
    }
    return chain;
  }, selectorScript);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  log('Navigate', URL);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);

  // Snapshot 1 - initial
  await page.screenshot({ path: path.join(SHOTS, '01-initial.png'), fullPage: false });

  // Find Topics nav button via its visible text
  log('Locating Topics button');
  const topicsButton = page.locator('button:has-text("Topics"), [role="menuitem"]:has-text("Topics"), a:has-text("Topics")').first();
  const exists = await topicsButton.count();
  log('Topics button count', exists);

  if (exists === 0) {
    // fallback - any nav element with text Topics
    const alt = page.getByText('Topics', { exact: false }).first();
    await alt.scrollIntoViewIfNeeded();
    await alt.hover({ force: true });
  } else {
    await topicsButton.scrollIntoViewIfNeeded();
    await topicsButton.hover({ force: true });
  }

  // Wait for dropdown to appear (try waiting on various menus)
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(SHOTS, '02-hovered.png'), fullPage: false });

  // Capture key elements
  log('Finding key elements');
  const keys = await findKeyElements(page);
  fs.writeFileSync(path.join(OUT_DIR, 'r3-key-elements.json'), JSON.stringify(keys, null, 2));

  // Build a JS expression that returns the dropdown element
  // We'll use the largest visible absolute/fixed candidate that's near the header
  const dropdownSelectorScript = `(() => {
    const all = Array.from(document.querySelectorAll('*'));
    let best = null, bestArea = 0;
    for (const el of all) {
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
      // Likely dropdown: width > 200, height > 100, top in 40-180px range, has multiple children
      if (r.width < 200 || r.height < 100) continue;
      if (r.top < 40 || r.top > 200) continue;
      if (r.width >= window.innerWidth - 10) continue; // ignore full-width overlays/header
      const childCount = el.querySelectorAll('a, [role="menuitem"]').length;
      if (childCount < 2) continue;
      const area = r.width * r.height;
      if (area > bestArea) { bestArea = area; best = el; }
    }
    return best;
  })()`;

  // Build a JS expression to find the most prominent hero img near top of page
  const heroImgSelectorScript = `(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    let best = null, bestArea = 0;
    for (const img of imgs) {
      const r = img.getBoundingClientRect();
      if (r.width < 200 || r.height < 150) continue;
      if (r.top > 800) continue; // visible on screen
      const area = r.width * r.height;
      if (area > bestArea) { bestArea = area; best = img; }
    }
    return best;
  })()`;

  log('Building ancestor chains');
  const dropdownChain = await buildAncestorTrace(page, dropdownSelectorScript);
  const heroImgChain = await buildAncestorTrace(page, heroImgSelectorScript);

  fs.writeFileSync(path.join(OUT_DIR, 'r3-dropdown-chain.json'), JSON.stringify(dropdownChain, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'r3-hero-chain.json'), JSON.stringify(heroImgChain, null, 2));

  // Compute overlap & elementFromPoint
  const overlap = await page.evaluate(({ dScript, hScript }) => {
    const dropdown = new Function('return ' + dScript)();
    const img = new Function('return ' + hScript)();
    if (!dropdown || !img) return { error: 'missing element', hasDropdown: !!dropdown, hasImg: !!img };
    const dr = dropdown.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    const ix = Math.max(dr.left, ir.left);
    const iy = Math.max(dr.top, ir.top);
    const ax = Math.min(dr.right, ir.right);
    const ay = Math.min(dr.bottom, ir.bottom);
    const overlap = ix < ax && iy < ay;
    let center = null, who = null;
    if (overlap) {
      const cx = Math.round((ix + ax) / 2);
      const cy = Math.round((iy + ay) / 2);
      const top = document.elementFromPoint(cx, cy);
      who = top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null;
      center = { cx, cy };
    }
    return {
      dropdownRect: dr,
      imgRect: ir,
      overlap,
      center,
      elementFromPoint: who
    };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });
  fs.writeFileSync(path.join(OUT_DIR, 'r3-overlap.json'), JSON.stringify(overlap, null, 2));
  log('Overlap', overlap);

  // Empirical fix tests
  const fixes = {};

  // Fix A - bump dropdown z-index to 9999
  log('Fix A - dropdown.style.zIndex = 9999');
  await page.evaluate(({ dScript }) => {
    const d = new Function('return ' + dScript)();
    if (d) {
      d.dataset.r3OrigZ = d.style.zIndex || '';
      d.style.zIndex = '9999';
    }
  }, { dScript: dropdownSelectorScript });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '03-fixA-zIndex9999.png'), fullPage: false });
  fixes.A = await page.evaluate(({ dScript, hScript }) => {
    const d = new Function('return ' + dScript)();
    const i = new Function('return ' + hScript)();
    if (!d || !i) return { error: 'missing' };
    const dr = d.getBoundingClientRect(); const ir = i.getBoundingClientRect();
    const cx = Math.round(Math.max(dr.left, ir.left) + 10);
    const cy = Math.round(Math.max(dr.top, ir.top) + 10);
    const top = document.elementFromPoint(cx, cy);
    return { topAtOverlap: top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });
  // restore
  await page.evaluate(({ dScript }) => {
    const d = new Function('return ' + dScript)();
    if (d) d.style.zIndex = d.dataset.r3OrigZ || '';
  }, { dScript: dropdownSelectorScript });

  // Fix B - header isolation: isolate
  log('Fix B - header.style.isolation = isolate');
  await page.evaluate(() => {
    const h = document.querySelector('header');
    if (h) { h.dataset.r3OrigIso = h.style.isolation || ''; h.style.isolation = 'isolate'; }
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '04-fixB-headerIsolate.png'), fullPage: false });
  fixes.B = await page.evaluate(({ dScript, hScript }) => {
    const d = new Function('return ' + dScript)();
    const i = new Function('return ' + hScript)();
    if (!d || !i) return { error: 'missing' };
    const dr = d.getBoundingClientRect(); const ir = i.getBoundingClientRect();
    const cx = Math.round(Math.max(dr.left, ir.left) + 10);
    const cy = Math.round(Math.max(dr.top, ir.top) + 10);
    const top = document.elementFromPoint(cx, cy);
    return { topAtOverlap: top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });
  await page.evaluate(() => {
    const h = document.querySelector('header');
    if (h) h.style.isolation = h.dataset.r3OrigIso || '';
  });

  // Fix C - main set position:relative; z-index:0 (creates context, traps img stacking)
  log('Fix C - main {position:relative; z-index:0}');
  await page.evaluate(() => {
    const m = document.querySelector('main');
    if (m) {
      m.dataset.r3OrigPos = m.style.position || '';
      m.dataset.r3OrigZ = m.style.zIndex || '';
      m.style.position = 'relative';
      m.style.zIndex = '0';
    }
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '05-fixC-mainContext.png'), fullPage: false });
  fixes.C = await page.evaluate(({ dScript, hScript }) => {
    const d = new Function('return ' + dScript)();
    const i = new Function('return ' + hScript)();
    if (!d || !i) return { error: 'missing' };
    const dr = d.getBoundingClientRect(); const ir = i.getBoundingClientRect();
    const cx = Math.round(Math.max(dr.left, ir.left) + 10);
    const cy = Math.round(Math.max(dr.top, ir.top) + 10);
    const top = document.elementFromPoint(cx, cy);
    return { topAtOverlap: top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });
  await page.evaluate(() => {
    const m = document.querySelector('main');
    if (m) {
      m.style.position = m.dataset.r3OrigPos || '';
      m.style.zIndex = m.dataset.r3OrigZ || '';
    }
  });

  // Fix D - move dropdown to body (portal)
  log('Fix D - body.appendChild(dropdown)');
  await page.evaluate(({ dScript }) => {
    const d = new Function('return ' + dScript)();
    if (d) {
      d.dataset.r3MovedFrom = 'body-portal-test';
      d.dataset.r3OrigParent = d.parentElement && d.parentElement.tagName;
      document.body.appendChild(d);
    }
  }, { dScript: dropdownSelectorScript });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '06-fixD-bodyPortal.png'), fullPage: false });
  fixes.D = await page.evaluate(({ dScript, hScript }) => {
    const d = new Function('return ' + dScript)();
    const i = new Function('return ' + hScript)();
    if (!d || !i) return { error: 'missing' };
    const dr = d.getBoundingClientRect(); const ir = i.getBoundingClientRect();
    const cx = Math.round(Math.max(dr.left, ir.left) + 10);
    const cy = Math.round(Math.max(dr.top, ir.top) + 10);
    const top = document.elementFromPoint(cx, cy);
    return {
      newParent: d.parentElement && d.parentElement.tagName,
      topAtOverlap: top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null
    };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });

  // Fix E (combined) - z-index 9999 + main isolated context
  log('Fix E - dropdown z=9999 AND main relative z=0');
  await page.evaluate(({ dScript }) => {
    const d = new Function('return ' + dScript)();
    if (d) d.style.zIndex = '9999';
    const m = document.querySelector('main');
    if (m) { m.style.position = 'relative'; m.style.zIndex = '0'; }
  }, { dScript: dropdownSelectorScript });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '07-fixE-combined.png'), fullPage: false });
  fixes.E = await page.evaluate(({ dScript, hScript }) => {
    const d = new Function('return ' + dScript)();
    const i = new Function('return ' + hScript)();
    if (!d || !i) return { error: 'missing' };
    const dr = d.getBoundingClientRect(); const ir = i.getBoundingClientRect();
    const cx = Math.round(Math.max(dr.left, ir.left) + 10);
    const cy = Math.round(Math.max(dr.top, ir.top) + 10);
    const top = document.elementFromPoint(cx, cy);
    return { topAtOverlap: top ? `${top.tagName}.${(top.className || '').toString().slice(0, 60)}` : null };
  }, { dScript: dropdownSelectorScript, hScript: heroImgSelectorScript });

  fs.writeFileSync(path.join(OUT_DIR, 'r3-fix-results.json'), JSON.stringify(fixes, null, 2));
  log('Fixes', JSON.stringify(fixes, null, 2));

  // Capture full DOM tree (post-fix-E state, but we don't care; we want pre-fix mostly)
  // Reload first to be clean
  log('Reload for clean tree dump');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  // Re-hover Topics
  const t2 = page.locator('button:has-text("Topics"), [role="menuitem"]:has-text("Topics"), a:has-text("Topics")').first();
  if (await t2.count()) await t2.hover({ force: true });
  else await page.getByText('Topics', { exact: false }).first().hover({ force: true });
  await page.waitForTimeout(700);

  log('Dumping DOM tree (depth-first)');
  const tree = await dumpTree(page);
  fs.writeFileSync(path.join(OUT_DIR, 'r3-dom-tree.json'), JSON.stringify(tree, null, 2));

  log('Done');
  await browser.close();
})();
