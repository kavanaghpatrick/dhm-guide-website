// Critical investigation: dropdown is white, fixed, z-index 50, but elementFromPoint
// returns IMG when overlap point is checked. Check pointer-events.
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
  await page.locator('button:has-text("Topics")').first().hover({ force: true });
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const dd = document.getElementById('topics-mega-menu');
    const ddCs = window.getComputedStyle(dd);
    const ddRect = dd.getBoundingClientRect();
    const visibility = ddCs.visibility;
    const display = ddCs.display;
    const opacity = ddCs.opacity;
    const pointerEvents = ddCs.pointerEvents;
    const transform = ddCs.transform;

    // Find absolutely all visible "barriers" between img and dropdown
    const img = document.querySelector('img[src*="before-after"], picture img');
    const imgR = img.getBoundingClientRect();
    const cx = Math.round((Math.max(ddRect.left, imgR.left) + Math.min(ddRect.right, imgR.right)) / 2);
    const cy = Math.round((Math.max(ddRect.top, imgR.top) + Math.min(ddRect.bottom, imgR.bottom)) / 2);

    // Use elementsFromPoint (plural) to get the full hit-test stack
    const stack = document.elementsFromPoint(cx, cy);
    const stackInfo = stack.slice(0, 12).map(el => {
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      let path = el.tagName.toLowerCase();
      if (el.id) path += '#' + el.id;
      if (el.className && typeof el.className === 'string') path += '.' + el.className.split(/\s+/).slice(0, 2).join('.');
      return {
        path,
        position: cs.position,
        zIndex: cs.zIndex,
        background: cs.backgroundColor,
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
        visibility: cs.visibility,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      };
    });

    // Check parent chain pointer-events (could be inherited)
    const peChain = [];
    let n = dd;
    while (n) {
      const cs = window.getComputedStyle(n);
      peChain.push({
        sel: n.tagName + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' ? '.' + n.className.split(/\s+/).slice(0, 2).join('.') : ''),
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
        visibility: cs.visibility,
        display: cs.display
      });
      n = n.parentElement;
    }

    return {
      dropdown: { rect: ddRect, visibility, display, opacity, pointerEvents, transform, zIndex: ddCs.zIndex, position: ddCs.position },
      probePoint: { cx, cy },
      hitStackAtPoint: stackInfo,
      pointerEventsChain: peChain
    };
  });

  fs.writeFileSync(path.join(OUT, 'r3-pointer-events.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  // Take a careful screenshot to see what's actually rendering
  await page.screenshot({ path: path.join(SHOTS, 'pe-full.png'), fullPage: false });

  // Now let's check actual visual rendering - use page.locator screenshot of the dropdown
  const dd = page.locator('#topics-mega-menu');
  if (await dd.count()) {
    await dd.screenshot({ path: path.join(SHOTS, 'pe-dropdown-only.png') });
  }

  // Also check: is there an animation or transition keeping opacity at 0?
  const animState = await page.evaluate(() => {
    const dd = document.getElementById('topics-mega-menu');
    return {
      offsetWidth: dd.offsetWidth,
      offsetHeight: dd.offsetHeight,
      clientRect: dd.getBoundingClientRect(),
      animations: dd.getAnimations ? dd.getAnimations().map(a => ({
        playState: a.playState,
        currentTime: a.currentTime
      })) : null,
      computedOpacity: window.getComputedStyle(dd).opacity,
      computedVisibility: window.getComputedStyle(dd).visibility
    };
  });
  console.log('\nANIMATION STATE:', JSON.stringify(animState, null, 2));

  await browser.close();
})();
