/**
 * visual-truth.mjs — GROUND-TRUTH visual capture + layout-invariant report.
 *
 * WHY THIS EXISTS
 * ---------------
 * The old audit tool (scripts/capture-modern-audit.mjs) captured fixed ~1500px
 * "filmstrip" bands and, on some pages, fullPage or element (.screenshot) crops.
 * Those three techniques MANUFACTURE ARTIFACTS that no real user ever sees:
 *   - fullPage capture composites the whole document into one image; a fixed/
 *     sticky header is painted ONCE at the top and then leaves a giant empty
 *     band (the "empty green band") below where it would have re-painted.
 *   - element (.screenshot) crops re-render the node out of its scroll/stacking
 *     context, so a fixed nav can appear to overlap content it never overlaps
 *     in the real viewport.
 *   - a coarse 1500px scroll grid lands at 0/1500/3000… and SKIPS the exact
 *     scroll offsets where a static <thead> parks under the 81px fixed header —
 *     the /compare overlap window is never sampled.
 *   - downscaled thumbnails hide fine defects (1px misalignment, clipped text).
 *
 * GROUND TRUTH = what a real user's viewport shows.
 * This tool captures VIEWPORT-SIZED frames (page.screenshot, NO fullPage, NO
 * element crop) at REAL scroll offsets, stepping the page by ~85% of viewport
 * height (overlapping steps so nothing falls between frames), at the REAL
 * device widths users have, at deviceScaleFactor 2 (retina — no downscaling),
 * after fonts are ready and layout has settled.
 *
 * It ALSO emits, per route × width, a JSON report of the same layout invariants
 * the Playwright gate (tests/layout-invariants.spec.js) asserts — so a human
 * scanning frames AND the machine gate look at the same measured facts.
 *
 * USAGE
 *   node scripts/visual-truth.mjs                       # prod (www.dhmguide.com)
 *   BASE_URL=http://localhost:5173 node scripts/visual-truth.mjs
 *   node scripts/visual-truth.mjs --routes /compare,/reviews --widths 1024,1440
 *   node scripts/visual-truth.mjs --out /tmp/shots      # override output dir
 *
 * OUTPUT
 *   <out>/<route-slug>/<width>px-scroll-NNNNN.png   (viewport-sized frames)
 *   <out>/report.json                               (invariant measurements)
 *   <out>/manifest.json                             (what was captured)
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- CLI / env config -------------------------------------------------------
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const BASE = (process.env.BASE_URL || arg('--base', 'https://www.dhmguide.com')).replace(/\/$/, '');
const IS_LOCAL = /localhost|127\.0\.0\.1/.test(BASE);

// Force the shipped modern variant. On prod it is 100% modern, but the override
// makes the capture deterministic even if the flag ever changes. Harmless on any
// route (see src/lib/experimentOverride.js — ?exp_<key>=<variant>).
const EXP = 'exp_site-modern-v1=modern';

const DEFAULT_ROUTES = [
  '/',
  '/reviews',
  '/guide',
  '/research',
  '/compare',
  '/never-hungover',
  '/about',
  '/dhm-dosage-calculator',
];

// The device-width matrix. 1024 and 1366 are the LAPTOP BAND the old tool never
// captured and where the /compare table is widest relative to its viewport.
const DEFAULT_WIDTHS = [390, 768, 1024, 1366, 1440];

const ROUTES = (arg('--routes', null)?.split(',').map((s) => s.trim()).filter(Boolean)) || DEFAULT_ROUTES;
const WIDTHS = (arg('--widths', null)?.split(',').map((s) => parseInt(s, 10)).filter((n) => n > 0)) || DEFAULT_WIDTHS;
const OUT = arg('--out', join(__dirname, `../docs/visual-inspection-process-2026-07-08/ground-truth`));

const VIEWPORT_H = 900;          // logical viewport height per frame
const STEP_RATIO = 0.85;         // overlap steps: advance 85% of viewport so nothing falls between frames
const MAX_FRAMES = 16;           // safety cap per route×width
const SETTLE_MS = 1800;          // post-load settle before measuring/capturing
const HEADER_BAND_PROBE = 6;     // horizontal probe points across the header band

function slugify(route) {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
}

/**
 * The invariant-measurement function, run IN THE PAGE. Returns pure numbers /
 * booleans describing the CURRENT rest state of the layout. Kept in one place so
 * the capture report and the Playwright gate can share identical logic if desired.
 *
 * @param {{headerProbePoints:number}} opts
 */
function measureInvariants(opts) {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const vh = window.innerHeight;

  // (a) Horizontal page overflow.
  const horizontalOverflow = {
    scrollWidth: doc.scrollWidth,
    clientWidth: vw,
    overflowPx: doc.scrollWidth - vw,
  };

  // Identify the fixed/sticky site header (position:fixed, pinned to top).
  let headerRect = null;
  const candidates = Array.from(document.querySelectorAll('header, [role="banner"]'));
  for (const el of candidates) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 2 && r.height > 0 && r.width > vw * 0.5) {
      headerRect = { top: r.top, bottom: r.bottom, height: r.height, left: r.left, right: r.right };
      break;
    }
  }

  // (b) Non-header content painting inside the fixed-header band.
  // At rest (scrollY=0 handled by caller stepping) we probe a horizontal line a
  // few px above the header's bottom edge. If elementsFromPoint returns any node
  // that is NOT the header (or its descendant) and IS real content, that content
  // is painting through / over the fixed header — the exact /compare thead-under-
  // header artifact class.
  const headerOverlap = { checked: false, band: headerRect, offenders: [] };
  if (headerRect && window.scrollY > headerRect.height) {
    headerOverlap.checked = true;
    const probeY = headerRect.bottom - 3;
    const n = opts.headerProbePoints;
    for (let i = 0; i < n; i++) {
      const x = Math.round((vw * (i + 0.5)) / n);
      const stack = document.elementsFromPoint(x, probeY);
      // The topmost painted element at this point:
      const top = stack[0];
      if (!top) continue;
      const inHeader = candidates.some((h) => h.contains(top));
      if (inHeader) continue;
      // Is it real, visible content (has text or is media/interactive)?
      const cs = getComputedStyle(top);
      const hasInk =
        (top.textContent || '').trim().length > 0 ||
        /^(IMG|SVG|VIDEO|CANVAS|BUTTON|A|INPUT|SELECT|TABLE|TH|TD)$/.test(top.tagName);
      const visible = cs.visibility !== 'hidden' && cs.opacity !== '0' && cs.display !== 'none';
      if (hasInk && visible) {
        headerOverlap.offenders.push({
          x,
          y: Math.round(probeY),
          tag: top.tagName.toLowerCase(),
          cls: (top.className && top.className.toString ? top.className.toString() : '').slice(0, 80),
          text: (top.textContent || '').trim().slice(0, 60),
        });
      }
    }
  }

  // (c) Large BLANK vertical band in the current viewport (the "empty band"
  // class). Uses REAL element geometry — the tallest vertical interval in the
  // viewport that NO leaf-content rect covers — NOT point-probing on background
  // pixels (which false-fires on centered cards over gradients, exactly the fake
  // "empty green band" the old fullPage capture invented). Matches the invariant
  // asserted by tests/layout-invariants.spec.js.
  const blank = { maxGapPx: 0, gapTopY: null };
  {
    const isLeafContent = (el) => {
      const tag = el.tagName;
      if (/^(IMG|SVG|VIDEO|CANVAS|BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL)$/.test(tag)) return true;
      if (el.children.length > 0) return false;
      return (el.textContent || '').trim().length > 0;
    };
    const intervals = [];
    const nodes = document.body ? document.body.querySelectorAll('*') : [];
    for (const el of nodes) {
      if (!isLeafContent(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.width <= 0) continue;
      if (r.bottom <= 0 || r.top >= vh) continue;
      intervals.push([Math.max(0, r.top), Math.min(vh, r.bottom)]);
    }
    intervals.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [top, bottom] of intervals) {
      if (top > cursor) {
        const gap = top - cursor;
        if (gap > blank.maxGapPx) { blank.maxGapPx = gap; blank.gapTopY = cursor; }
      }
      if (bottom > cursor) cursor = bottom;
    }
    if (vh - cursor > blank.maxGapPx) { blank.maxGapPx = vh - cursor; blank.gapTopY = cursor; }
  }

  // (d) Data table not fully readable: CLIPPED (wider than container, no scroller)
  // OR requires HORIZONTAL SCROLLING (an overflow-x:auto scroller whose scrollWidth
  // exceeds its clientWidth — user must swipe sideways to read all columns). Both
  // are "table doesn't fit" defects. The page-level overflow check (a) is BLIND to
  // the scroll case because the overflow is absorbed inside the scroll box.
  const tables = [];
  for (const table of Array.from(document.querySelectorAll('table'))) {
    const tcs = getComputedStyle(table);
    if (tcs.display === 'none') continue;
    const tw = table.scrollWidth;
    let scroller = null;
    let anc = table.parentElement;
    while (anc && anc !== document.body) {
      const acs = getComputedStyle(anc);
      if (acs.overflowX === 'auto' || acs.overflowX === 'scroll') { scroller = anc; break; }
      anc = anc.parentElement;
    }
    const containerW = scroller ? scroller.clientWidth : (table.parentElement ? table.parentElement.clientWidth : vw);
    const clipped = !scroller && tw > containerW + 2;
    const needsHorizontalScroll = !!scroller && scroller.scrollWidth > scroller.clientWidth + 2;
    tables.push({
      tableWidth: tw,
      containerWidth: containerW,
      scrollerScrollWidth: scroller ? scroller.scrollWidth : null,
      scrollerClientWidth: scroller ? scroller.clientWidth : null,
      hasHorizontalScroller: !!scroller,
      clipped,
      needsHorizontalScroll,
      notFullyReadable: clipped || needsHorizontalScroll,
    });
  }

  // (e) Late layout shift / content pop-in: caller diffs scrollHeight before/after
  // settle. Here we just report the current documentElement scrollHeight so the
  // caller can compare across time.
  const scrollHeight = doc.scrollHeight;

  return { horizontalOverflow, headerOverlap, blank, tables, scrollHeight, viewport: { width: vw, height: vh }, scrollY: window.scrollY };
}

async function settle(page) {
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch { /* noop */ }
  // Modern variant renders after the flag resolves; wait for its themed root.
  try { await page.waitForSelector('.theme-modern', { timeout: 8000 }); } catch { /* control-only or slow */ }
  await page.waitForTimeout(SETTLE_MS);
}

async function captureRouteWidth(browser, route, width, report) {
  const ctx = await browser.newContext({
    viewport: { width, height: VIEWPORT_H },
    deviceScaleFactor: 2, // retina — no downscaling that would hide fine defects
    isMobile: width <= 430,
    hasTouch: width <= 768,
  });
  const page = await ctx.newPage();
  const slug = slugify(route);
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });

  const url = `${BASE}${route}${route.includes('?') ? '&' : '?'}${EXP}`;
  const entry = { route, width, url, frames: [], invariants: [], errors: [] };

  page.on('pageerror', (e) => entry.errors.push(`pageerror: ${e.message}`));

  try {
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
    catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
  } catch (e) {
    entry.errors.push(`goto failed: ${e.message}`);
    await ctx.close();
    report.push(entry);
    console.log(`  ✗ ${slug.padEnd(20)} ${width}px — goto failed: ${e.message}`);
    return;
  }

  // Measure scrollHeight BEFORE settle (initial layout), then AFTER settle.
  const hBefore = await page.evaluate(() => document.documentElement.scrollHeight);
  await settle(page);
  const hAfter = await page.evaluate(() => document.documentElement.scrollHeight);
  entry.scrollHeightBefore = hBefore;
  entry.scrollHeightAfter = hAfter;
  entry.scrollHeightGrowthRatio = hBefore > 0 ? +(hAfter / hBefore).toFixed(2) : null;

  const pageH = hAfter;
  const stepPx = Math.round(VIEWPORT_H * STEP_RATIO);
  const frameCount = Math.min(MAX_FRAMES, Math.max(1, Math.ceil((pageH - VIEWPORT_H) / stepPx) + 1));

  for (let i = 0; i < frameCount; i++) {
    const y = Math.min(i * stepPx, Math.max(0, pageH - VIEWPORT_H));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(300);

    // GROUND TRUTH: viewport-sized, NO fullPage, NO element clip.
    const fname = `${width}px-scroll-${String(y).padStart(5, '0')}.png`;
    await page.screenshot({ path: join(dir, fname), fullPage: false });
    entry.frames.push(fname);

    // Measure invariants at this real scroll offset (header overlap only
    // meaningful once we've scrolled past the header).
    const inv = await page.evaluate(measureInvariants, { headerProbePoints: HEADER_BAND_PROBE });
    entry.invariants.push({ scrollY: y, ...inv });

    if (y >= pageH - VIEWPORT_H) break;
  }

  await ctx.close();
  report.push(entry);

  // Concise console summary of the worst invariant readings for this route×width.
  // Thresholds mirror tests/layout-invariants.spec.js so the capture flags line up
  // with what the gate would fail on.
  const worstOverflow = Math.max(...entry.invariants.map((i) => i.horizontalOverflow.overflowPx), 0);
  const anyHeaderOverlap = entry.invariants.some((i) => i.headerOverlap.offenders.length > 0);
  const worstBlank = Math.max(...entry.invariants.map((i) => i.blank.maxGapPx), 0);
  const badTable = entry.invariants.some((i) => i.tables.some((t) => t.notFullyReadable));
  const flags = [];
  if (worstOverflow > 4) flags.push(`overflow+${worstOverflow}px`);
  if (anyHeaderOverlap) flags.push('HEADER-OVERLAP');
  if (worstBlank > 600) flags.push(`blank ${Math.round(worstBlank)}px`);
  if (badTable) flags.push('TABLE-NOT-READABLE');
  if (entry.scrollHeightGrowthRatio && entry.scrollHeightGrowthRatio > 1.5) flags.push(`grew x${entry.scrollHeightGrowthRatio}`);
  const flagStr = flags.length ? `  ⚠ ${flags.join(' ')}` : '';
  console.log(`  ✓ ${slug.padEnd(20)} ${String(width).padStart(4)}px  ${entry.frames.length} frames (page ${pageH}px)${flagStr}`);
}

(async () => {
  console.log(`\nGROUND-TRUTH capture — ${BASE}${IS_LOCAL ? ' (local)' : ' (prod)'}`);
  console.log(`Routes: ${ROUTES.join(', ')}`);
  console.log(`Widths: ${WIDTHS.join(', ')}`);
  console.log(`Out:    ${OUT}\n`);

  mkdirSync(OUT, { recursive: true });
  // Clean previous run's PNGs (keep dir).
  for (const route of ROUTES) {
    const dir = join(OUT, slugify(route));
    if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.png')) rmSync(join(dir, f));
  }

  const browser = await chromium.launch();
  const report = [];
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      try { await captureRouteWidth(browser, route, width, report); }
      catch (e) { console.log(`  ✗ ${slugify(route)} ${width}px: ${e.message}`); }
    }
  }
  await browser.close();

  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(
    join(OUT, 'manifest.json'),
    JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), routes: ROUTES, widths: WIDTHS, override: EXP }, null, 2)
  );
  console.log(`\nDone.`);
  console.log(`  Frames + report: ${OUT}`);
  console.log(`  report.json holds per route×width invariant measurements (overflow, header-overlap, blank-gap, table-clip, scrollHeight growth).`);
})();
