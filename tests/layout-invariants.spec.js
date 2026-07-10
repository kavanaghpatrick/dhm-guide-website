// @ts-check
import { test, expect } from '@playwright/test';

/**
 * LAYOUT INVARIANTS — the automated gate that replaces eyeballing thumbnails.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The broken /compare "Detailed comparison" table shipped to 100% of users
 * because the entire QA process was: capture artifact-prone screenshots
 * (fullPage / element crops / coarse 1500px bands) and have a human squint at
 * downscaled thumbnails. NOTHING in CI could turn red on a layout defect:
 *   - visual specs are testIgnore'd from the main e2e run, and
 *   - the dedicated "visual" CI job is continue-on-error and only *generates*
 *     baselines (--update-snapshots) — it never *compares*.
 * And the one behavioral check that looks relevant (compare-modern-behavior's
 * "no horizontal overflow") is STRUCTURALLY BLIND to this bug: the table lives
 * inside `.compare-scroll { overflow-x: auto }`, so the overflow is absorbed
 * INSIDE the scroll box and `documentElement.scrollWidth` never grows.
 *
 * These specs assert MEASURED layout invariants that CAN fail the build:
 *   (a) no horizontal PAGE overflow
 *   (b) no non-header content painting inside the fixed-header band (overlap)
 *   (c) no large BLANK vertical gap in any viewport (the "empty green band")
 *   (d) no data table that CLIPS content, or scrolls horizontally WITHOUT a visible scrollbar cue
 *   (e) no large late layout shift (scrollHeight stable after settle + CLS budget)
 *
 * They run under the main playwright.config.js (pnpm test:e2e), so wiring them
 * into the CI e2e job makes them a real gate. Parametrized over routes × widths;
 * the LAPTOP BAND (1024/1366) — where the /compare table is widest relative to
 * viewport and which the old filmstrip never captured — is explicitly included.
 *
 * BASE URL
 *   Defaults to the local dev server (playwright.config.js webServer). Point at
 *   any environment (incl. still-broken PROD) to prove a regression:
 *     BASE_URL=https://www.dhmguide.com npx playwright test tests/layout-invariants.spec.js
 *   When BASE_URL is set, we do NOT use the localhost storageState seed; instead
 *   we force the shipped modern arm via the ?exp_ override on every route.
 */

const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : '';
const EXP = 'exp_site-modern-v1=modern';

// Routes to guard. The primary shipped pages a user actually lands on.
// SEMICOLON-separated (not comma) so a route may carry a comma-listed query,
// e.g. INVARIANT_ROUTES='/compare?products=1,2,3,4;/reviews'.
// NOTE the two /compare entries: the default (3 pre-selected products) AND the
// widest reachable state (4 products via ?products=1,2,3,4). The 4-product state
// is where the comparison table is widest and, in the laptop band, requires
// horizontal scrolling — the real defect the old process missed. Guarding it
// permanently means the table can never silently outgrow the laptop viewport again.
const ROUTES = (process.env.INVARIANT_ROUTES || '/;/reviews;/guide;/research;/compare;/compare?products=1,2,3,4;/never-hungover;/about;/dhm-dosage-calculator')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

// Widths to guard. 1024 + 1366 are the LAPTOP BAND the /compare table breaks in;
// 390 is mobile (table swaps to cards); 1440 is a common desktop.
const WIDTHS = (process.env.INVARIANT_WIDTHS || '390,1024,1366,1440')
  .split(',')
  .map((s) => parseInt(s, 10))
  .filter((n) => n > 0);

const VIEWPORT_H = 900;
const STEP_RATIO = 0.85;        // overlapping scroll steps
const MAX_STEPS = 14;
const OVERFLOW_SLOP = 4;        // px, sub-pixel rounding
const BLANK_BAND_MAX = 600;     // px: tallest vertical interval in the viewport with NO content rect.
                                // 600 = 2/3 of the 900px viewport. Below this is normal section spacing;
                                // above is a genuinely empty band (collapsed/mis-sized section, failed render).
const HEADER_PROBES = 6;
const CLS_BUDGET = 0.25;        // Cumulative Layout Shift budget. 0.25 = Google's "poor" boundary; the
                                // site's baseline mobile font-swap shift (~0.13) is "needs improvement",
                                // not a shipping blocker — we gate genuinely broken shift (> 0.25).
const SCROLLHEIGHT_GROWTH_MAX = 1.5; // documentElement height must not >1.5x after settle

function buildUrl(route) {
  const base = BASE_URL || 'http://localhost:5173';
  const sep = route.includes('?') ? '&' : '?';
  // Always force the shipped modern arm so we test what users see.
  return `${base}${route}${sep}${EXP}`;
}

/**
 * IN-PAGE measurement. Returns pure numbers/booleans for the current rest state.
 * @param {{headerProbes:number}} opts
 */
function measure(opts) {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const vh = window.innerHeight;

  // (a) Horizontal PAGE overflow.
  const horizontal = { scrollWidth: doc.scrollWidth, clientWidth: vw, overflowPx: doc.scrollWidth - vw };

  // Locate the fixed/sticky site header pinned to the top.
  const headerEls = Array.from(document.querySelectorAll('header, [role="banner"]'));
  let headerRect = null;
  let headerNode = null;
  for (const el of headerEls) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 2 && r.height > 0 && r.width > vw * 0.5) {
      headerRect = { top: r.top, bottom: r.bottom, height: r.height };
      headerNode = el;
      break;
    }
  }

  // (b) Header-band overlap: probe a horizontal line just inside the header's
  // bottom edge. If the TOP painted element there is not the header (nor its
  // descendant) but IS real visible content, that content paints through/over
  // the fixed header. Only meaningful once scrolled past the header.
  const overlap = { checked: false, offenders: [] };
  if (headerRect && headerNode && window.scrollY > headerRect.height + 20) {
    overlap.checked = true;
    const probeY = headerRect.bottom - 3;
    for (let i = 0; i < opts.headerProbes; i++) {
      const x = Math.round((vw * (i + 0.5)) / opts.headerProbes);
      const stack = document.elementsFromPoint(x, probeY);
      const top = stack[0];
      if (!top) continue;
      if (headerNode.contains(top) || headerEls.some((h) => h.contains(top))) continue;
      const cs = getComputedStyle(top);
      const visible = cs.visibility !== 'hidden' && cs.opacity !== '0' && cs.display !== 'none';
      const hasInk =
        (top.textContent || '').trim().length > 0 ||
        /^(IMG|SVG|VIDEO|CANVAS|BUTTON|A|INPUT|SELECT|TABLE|TH|TD)$/.test(top.tagName);
      if (visible && hasInk) {
        overlap.offenders.push({
          x, y: Math.round(probeY),
          tag: top.tagName.toLowerCase(),
          text: (top.textContent || '').trim().slice(0, 50),
        });
      }
    }
  }

  // (c) Large BLANK vertical band inside the viewport (the "empty band" class).
  // We use REAL element geometry, not point-probing on background pixels (which
  // fires on centered cards over gradients — the same false "empty green band"
  // the old fullPage capture invented). We collect the bounding rects of LEAF
  // content elements (text/media/interactive with a real box) that intersect the
  // viewport, project them onto the vertical axis, and find the tallest vertical
  // interval within the viewport that NO content rect covers. A genuine empty band
  // (mis-sized/collapsed section, failed render) leaves a tall uncovered interval;
  // normal section spacing between blocks is small relative to the whole viewport.
  let blankBand = 0;
  let blankBandTop = null;
  {
    const isLeafContent = (el) => {
      // Only elements that themselves render ink: text-bearing leaves, media,
      // controls. Structural wrappers are excluded (their box is the whole
      // section and would hide gaps).
      const tag = el.tagName;
      if (/^(IMG|SVG|VIDEO|CANVAS|BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL)$/.test(tag)) return true;
      if (el.children.length > 0) return false; // not a leaf; its children carry the ink
      return (el.textContent || '').trim().length > 0;
    };
    // Collect covered vertical intervals (clamped to the viewport) from content leaves.
    const intervals = [];
    const nodes = document.body ? document.body.querySelectorAll('*') : [];
    for (const el of nodes) {
      if (!isLeafContent(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.width <= 0) continue;
      if (r.bottom <= 0 || r.top >= vh) continue; // outside viewport
      intervals.push([Math.max(0, r.top), Math.min(vh, r.bottom)]);
    }
    // Merge intervals and find the largest uncovered gap in [0, vh].
    intervals.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [top, bottom] of intervals) {
      if (top > cursor) {
        const gap = top - cursor;
        if (gap > blankBand) { blankBand = gap; blankBandTop = cursor; }
      }
      if (bottom > cursor) cursor = bottom;
    }
    if (vh - cursor > blankBand) { blankBand = vh - cursor; blankBandTop = cursor; }
  }

  // (d) Data table not readable in the viewport: CLIPPED (wider than its container
  // with NO overflow-x scroller — content cut off and unreachable) OR scrollable
  // but UNSIGNPOSTED (an overflow-x:auto scroller wider than its clientWidth that
  // exposes NO visible scrollbar — the user has no cue the extra columns exist:
  // the original /compare bug). A horizontal scroll WITH a visible scrollbar cue
  // is ACCEPTABLE (the design decision). This is what the page-level "no horizontal
  // overflow" check is STRUCTURALLY BLIND to, because the overflow lives INSIDE the
  // scroll box (documentElement never grows).
  const tables = [];
  for (const table of Array.from(document.querySelectorAll('table'))) {
    if (getComputedStyle(table).display === 'none') continue;
    const tw = table.scrollWidth;
    let scroller = null;
    let anc = table.parentElement;
    while (anc && anc !== document.body) {
      const ox = getComputedStyle(anc).overflowX;
      if (ox === 'auto' || ox === 'scroll') { scroller = anc; break; }
      anc = anc.parentElement;
    }
    const containerW = scroller ? scroller.clientWidth : (table.parentElement ? table.parentElement.clientWidth : vw);
    const clipped = !scroller && tw > containerW + 2;
    const needsHorizontalScroll = !!scroller && scroller.scrollWidth > scroller.clientWidth + 2;
    // A horizontally-scrollable table is ACCEPTABLE only when the scroll is
    // SIGNPOSTED by a VISIBLE scrollbar the user can actually see (the design
    // decision on /compare). Measure the horizontal scrollbar's height, isolating
    // it from the container's borders; a space-consuming scrollbar (forced via
    // `::-webkit-scrollbar { height }` / `scrollbar-width: thin`, not overlay/none)
    // yields offsetHeight − clientHeight − bordersY ≥ ~a few px.
    let scrollbarH = 0;
    let scrollbarHidden = false;
    let scrollbarStyled = false;
    if (scroller) {
      const cs = getComputedStyle(scroller);
      const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      scrollbarH = scroller.offsetHeight - scroller.clientHeight - borderY;
      scrollbarHidden = cs.scrollbarWidth === 'none';
      // A set `scrollbar-color` = an explicitly STYLED, always-visible (branded)
      // scrollbar — the intentional "swipe me" cue. Modern Chromium honors the
      // standard `scrollbar-width: thin` and renders a non-space-consuming
      // scrollbar (scrollbarH ≈ 0), so we cannot rely on consumed space alone;
      // the styled color is what distinguishes a signposted scroller from the
      // default auto-hiding overlay scrollbar that WAS the original /compare bug.
      const sc = (cs.scrollbarColor || '').trim().toLowerCase();
      scrollbarStyled = sc !== '' && sc !== 'auto';
    }
    // Signposted = a visible scrollbar cue: either it consumes layout space
    // (classic scrollbar) OR it is explicitly styled/always-visible.
    const hasVisibleScrollbar = !!scroller && !scrollbarHidden && (scrollbarH >= 3 || scrollbarStyled);
    // FAIL only when content is CLIPPED (no scroller — unreachable) or scrollable
    // but UNSIGNPOSTED (a scroll box with no visible scrollbar cue — the original
    // /compare bug). A signposted horizontal scroll passes.
    const notFullyReadable = clipped || (needsHorizontalScroll && !hasVisibleScrollbar);
    tables.push({
      tableWidth: tw,
      containerWidth: containerW,
      scrollerScrollWidth: scroller ? scroller.scrollWidth : null,
      scrollerClientWidth: scroller ? scroller.clientWidth : null,
      hasHorizontalScroller: !!scroller,
      scrollbarH: Math.round(scrollbarH),
      hasVisibleScrollbar,
      clipped,
      needsHorizontalScroll,
      notFullyReadable,
    });
  }

  return {
    horizontal,
    overlap,
    blankBand: { px: blankBand, top: blankBandTop },
    tables,
    scrollHeight: doc.scrollHeight,
    viewport: { width: vw, height: vh },
    scrollY: window.scrollY,
  };
}

/** Install a PerformanceObserver that accumulates layout-shift score. Call before nav. */
async function armCLS(page) {
  await page.addInitScript(() => {
    // @ts-ignore
    window.__cls = 0;
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore — layout-shift entries
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      });
      po.observe({ type: 'layout-shift', buffered: true });
    } catch (e) { /* not supported — CLS check will no-op */ }
  });
}

async function settle(page) {
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch { /* noop */ }
  try { await page.waitForSelector('.theme-modern', { timeout: 8000 }); } catch { /* control/slow */ }
  await page.waitForTimeout(1800);
}

// One describe block per route × width so failures name the exact combination.
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test.describe(`layout invariants — ${route} @ ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_H } });
      // When targeting an external BASE_URL (e.g. prod), drop the localhost
      // storageState seed (it's origin-scoped to localhost anyway) and rely on
      // the ?exp_ override to force the modern arm.
      if (BASE_URL) test.use({ storageState: { cookies: [], origins: [] } });

      test('page has no horizontal overflow, no header overlap, no blank band, no clipped table, no large late shift', async ({ page }) => {
        await armCLS(page);

        const url = buildUrl(route);
        const hBefore = await (async () => {
          try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
          catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
          return page.evaluate(() => document.documentElement.scrollHeight);
        })();

        await settle(page);

        const hAfter = await page.evaluate(() => document.documentElement.scrollHeight);

        // Step through the page at overlapping viewport offsets, measuring at each.
        const pageH = hAfter;
        const stepPx = Math.round(VIEWPORT_H * STEP_RATIO);
        const steps = Math.min(MAX_STEPS, Math.max(1, Math.ceil((pageH - VIEWPORT_H) / stepPx) + 1));

        /** @type {Array<{scrollY:number} & ReturnType<typeof measure>>} */
        const readings = [];
        for (let i = 0; i < steps; i++) {
          const y = Math.min(i * stepPx, Math.max(0, pageH - VIEWPORT_H));
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(250);
          const r = await page.evaluate(measure, { headerProbes: HEADER_PROBES });
          readings.push({ scrollY: y, ...r });
          if (y >= pageH - VIEWPORT_H) break;
        }

        const cls = await page.evaluate(() => (window.__cls) || 0);

        // Use expect.soft so EVERY invariant is evaluated and reported in one
        // run (a single test still fails if any soft assertion fails). This is
        // the right ergonomics for a layout gate: fixing one defect must not
        // hide the others, and a human reading the failure sees the full picture.

        // ---- (a) Horizontal overflow ----
        const worstOverflow = readings.reduce((m, r) => Math.max(m, r.horizontal.overflowPx), 0);
        expect.soft(
          worstOverflow,
          `[a: horizontal-overflow] ${worstOverflow}px > ${OVERFLOW_SLOP}px slop on ${route} @ ${width}px ` +
          `(documentElement.scrollWidth exceeds clientWidth — content is cut off horizontally). ` +
          `NOTE: this check is deliberately BLIND to overflow absorbed inside an overflow-x:auto ` +
          `scroll box (that is what invariant d guards).`
        ).toBeLessThanOrEqual(OVERFLOW_SLOP);

        // ---- (b) Fixed-header overlap ----
        const overlapReadings = readings.filter((r) => r.overlap.checked);
        const offending = overlapReadings.find((r) => r.overlap.offenders.length > 0);
        expect.soft(
          offending ? offending.overlap.offenders : [],
          `[b: header-overlap] Non-header content paints inside the fixed-header band on ${route} @ ${width}px ` +
          `at scrollY=${offending?.scrollY}. Offenders: ${JSON.stringify(offending?.overlap.offenders)}. ` +
          `A fixed/sticky header must never have page content painting through it (make the header opaque above ` +
          `content, or give scrolled-to targets scroll-margin-top).`
        ).toEqual([]);

        // ---- (c) Large blank vertical band (empty-band class) ----
        // Uses real element geometry (largest viewport interval no content rect
        // covers), so it does NOT fire on centered cards over gradients — the
        // false "empty green band" the old fullPage capture invented.
        const worstBand = readings.reduce((acc, r) => (r.blankBand.px > acc.blankBand.px ? r : acc), readings[0]);
        expect.soft(
          worstBand.blankBand.px,
          `[c: blank-band] A ${Math.round(worstBand.blankBand.px)}px vertical band (top y=${Math.round(worstBand.blankBand.top)}) ` +
          `has NO content element at scrollY=${worstBand.scrollY} on ${route} @ ${width}px (budget ${BLANK_BAND_MAX}px) — ` +
          `an empty band this tall is a collapsed/mis-sized section or failed render.`
        ).toBeLessThanOrEqual(BLANK_BAND_MAX);

        // ---- (d) Data table not fully readable (clipped OR needs horizontal scroll) ----
        const badTableReading = readings.find((r) => r.tables.some((t) => t.notFullyReadable));
        const badTable = badTableReading?.tables.find((t) => t.notFullyReadable);
        expect.soft(
          badTable ? badTable : null,
          `[d: table-fit] A data <table> is not readable on ${route} @ ${width}px at scrollY=${badTableReading?.scrollY}: ` +
          (badTable?.clipped
            ? `CLIPPED (table ${badTable.tableWidth}px wider than its ${badTable.containerWidth}px container with NO overflow-x scroller — content is cut off and unreachable). `
            : `requires HORIZONTAL SCROLL but the scroll is UNSIGNPOSTED (scroll box content ${badTable?.scrollerScrollWidth}px > visible ${badTable?.scrollerClientWidth}px, visible scrollbar height ${badTable?.scrollbarH}px — the extra columns exist but the user has no visible cue to swipe to them; this was the original /compare bug). `) +
          `Page-level overflow check (a) is BLIND to this (overflow absorbed inside the scroll box). ` +
          `Fix: make the table responsive at this width, OR give the scroll container a VISIBLE scrollbar cue ` +
          `(e.g. .compare-scroll { scrollbar-width: thin } + a styled ::-webkit-scrollbar). A signposted horizontal scroll IS acceptable.`
        ).toBeNull();

        // ---- (e) Late layout shift / pop-in ----
        const growth = hBefore > 0 ? hAfter / hBefore : 1;
        expect.soft(
          growth,
          `[e1: scrollHeight-growth] Page scrollHeight grew ${hBefore}px → ${hAfter}px (x${growth.toFixed(2)}) after settle ` +
          `on ${route} @ ${width}px — large late content pop-in (CLS risk / hydration reflow).`
        ).toBeLessThanOrEqual(SCROLLHEIGHT_GROWTH_MAX);

        expect.soft(
          cls,
          `[e2: CLS] Cumulative Layout Shift ${cls.toFixed(3)} exceeds budget ${CLS_BUDGET} on ${route} @ ${width}px.`
        ).toBeLessThanOrEqual(CLS_BUDGET);
      });
    });
  }
}
