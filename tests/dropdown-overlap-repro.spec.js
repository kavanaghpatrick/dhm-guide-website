// @ts-check
import { test, expect, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * L3 Visual Repro: Hover-menu overlap bug
 *
 * Goal: Visually capture where the Topics mega-menu (Layout.jsx, PR #326)
 * is overlapped by page content. Saves screenshots + JSON diagnostics.
 *
 * Runs against PRODUCTION: https://www.dhmguide.com
 */

const SCREENSHOT_DIR = path.resolve(
  process.cwd(),
  'docs/layering-audit-2026-04-26/screenshots'
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const DROPDOWN_SELECTOR = '#topics-mega-menu';
const TRIGGER_SELECTOR = '[data-track="nav-topics-trigger"]';

/**
 * Walk the DOM ancestry of an element and collect computed styles
 * that affect stacking contexts and z-indexing.
 */
async function collectAncestorChain(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false, selector: sel };

    const props = ['position', 'z-index', 'transform', 'opacity', 'filter',
                   'will-change', 'isolation', 'mix-blend-mode',
                   'perspective', 'contain', 'backdrop-filter',
                   'overflow', 'overflow-x', 'overflow-y'];

    const chain = [];
    let cur = el;
    while (cur && cur !== document.body && cur.tagName !== 'HTML') {
      const cs = window.getComputedStyle(cur);
      const tagInfo = {
        tag: cur.tagName.toLowerCase(),
        id: cur.id || null,
        classes: cur.className && typeof cur.className === 'string'
          ? cur.className.slice(0, 200) : null,
        styles: {},
      };
      for (const p of props) {
        const v = cs.getPropertyValue(p);
        // Only include non-default values to keep payload tight
        if (v && v !== 'none' && v !== 'auto' && v !== 'visible' &&
            v !== 'normal' && v !== '0px' && v !== '1') {
          tagInfo.styles[p] = v;
        }
      }
      chain.push(tagInfo);
      cur = cur.parentElement;
    }
    return { found: true, selector: sel, chain };
  }, selector);
}

/**
 * Find an element that visually overlaps the dropdown.
 * Returns the element at the center of the dropdown that is NOT a child of it.
 */
async function findOverlappingElement(page, dropdownSelector) {
  return await page.evaluate((sel) => {
    const dropdown = document.querySelector(sel);
    if (!dropdown) return { overlap: false, reason: 'dropdown not found' };

    const r = dropdown.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      return { overlap: false, reason: 'dropdown has zero size' };
    }

    // Sample many points across the VISIBLE part of the dropdown.
    // elementsFromPoint only works inside the viewport.
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const visibleLeft = Math.max(0, r.left);
    const visibleTop = Math.max(0, r.top);
    const visibleRight = Math.min(vpW, r.right);
    const visibleBottom = Math.min(vpH, r.bottom);

    if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) {
      return { overlap: false, reason: 'dropdown fully outside viewport' };
    }

    // Build a 6x4 grid of sample points inside the visible portion
    const samples = [];
    const cols = 6, rows = 4;
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const x = visibleLeft + 5 + (cx * (visibleRight - visibleLeft - 10) / (cols - 1));
        const y = visibleTop + 5 + (cy * (visibleBottom - visibleTop - 10) / (rows - 1));
        samples.push([x, y]);
      }
    }

    const overlaps = [];
    for (const [x, y] of samples) {
      // elementsFromPoint gives the entire stack at this point
      const stack = document.elementsFromPoint(x, y);
      // Find the topmost element that is NOT inside the dropdown
      const topNonDropdown = stack.find(
        (el) => !dropdown.contains(el) && el !== dropdown
      );
      // Also note what's actually on top
      const topMost = stack[0];
      if (topNonDropdown && !dropdown.contains(topMost)) {
        // The topmost element is NOT inside the dropdown -> dropdown is overlapped here
        const cs = window.getComputedStyle(topMost);
        overlaps.push({
          x: Math.round(x),
          y: Math.round(y),
          tag: topMost.tagName.toLowerCase(),
          id: topMost.id || null,
          classes: typeof topMost.className === 'string'
            ? topMost.className.slice(0, 200) : null,
          dataTrack: topMost.getAttribute('data-track'),
          src: topMost.getAttribute('src'),
          alt: topMost.getAttribute('alt'),
          textPreview: (topMost.textContent || '').trim().slice(0, 80),
          computed: {
            position: cs.position,
            zIndex: cs.zIndex,
            transform: cs.transform,
            opacity: cs.opacity,
            filter: cs.filter,
            willChange: cs.willChange,
            isolation: cs.isolation,
          },
        });
      }
    }

    return {
      overlap: overlaps.length > 0,
      sampleCount: samples.length,
      overlapCount: overlaps.length,
      overlaps,
      dropdownRect: {
        left: r.left, top: r.top, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height,
      },
    };
  }, dropdownSelector);
}

async function captureDropdownData(page, label, scenario, viewport) {
  const safeLabel = label.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const beforePath = path.join(SCREENSHOT_DIR, `${safeLabel}-before.png`);
  const duringPath = path.join(SCREENSHOT_DIR, `${safeLabel}-during.png`);
  const jsonPath = path.join(SCREENSHOT_DIR, `${safeLabel}.json`);

  // 1. Screenshot BEFORE hover (viewport only)
  await page.screenshot({ path: beforePath, fullPage: false });

  // 2. Trigger hover (or click on mobile)
  const trigger = page.locator(TRIGGER_SELECTOR);
  let dropdownOpened = false;
  try {
    await trigger.scrollIntoViewIfNeeded({ timeout: 3000 });
    if (viewport.width >= 1024) {
      // Desktop: hover
      await trigger.hover({ timeout: 3000 });
    } else {
      // Mobile: dropdown is in hamburger menu, won't appear from desktop trigger
      await trigger.click({ timeout: 3000 }).catch(() => {});
    }
    // Wait for dropdown to render
    await page.waitForSelector(DROPDOWN_SELECTOR, { timeout: 3000, state: 'visible' });
    dropdownOpened = true;
  } catch (err) {
    // Trigger not visible (e.g. mobile, hidden behind hamburger)
    dropdownOpened = false;
  }

  await page.waitForTimeout(400);

  // 3. Screenshot DURING hover (viewport AND a tall viewport version that captures the whole dropdown)
  await page.screenshot({ path: duringPath, fullPage: false });
  // To see the full dropdown which extends beyond viewport, set viewport tall and re-screenshot
  if (dropdownOpened) {
    const dropdownBottom = await page.evaluate((s) => {
      const d = document.querySelector(s);
      return d ? d.getBoundingClientRect().bottom + window.scrollY : 0;
    }, DROPDOWN_SELECTOR);
    if (dropdownBottom > viewport.height) {
      // Take a screenshot tall enough to capture the whole dropdown
      const tallPath = duringPath.replace('.png', '-fulldrop.png');
      await page.setViewportSize({ width: viewport.width, height: Math.ceil(dropdownBottom + 60) });
      // Need to re-trigger hover since viewport change can close the dropdown
      try {
        await trigger.hover({ timeout: 2000 });
        await page.waitForSelector(DROPDOWN_SELECTOR, { timeout: 2000, state: 'visible' });
        await page.waitForTimeout(300);
        await page.screenshot({ path: tallPath, fullPage: false });
      } catch (err) {}
      // Reset viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    }
  }

  // 4. Collect diagnostic data
  const diagnostics = {
    scenario,
    label,
    viewport,
    url: page.url(),
    timestamp: new Date().toISOString(),
    dropdownOpened,
  };

  if (dropdownOpened) {
    diagnostics.dropdownChain = await collectAncestorChain(page, DROPDOWN_SELECTOR);
    diagnostics.overlapAnalysis = await findOverlappingElement(page, DROPDOWN_SELECTOR);
    // Also collect the header chain since we know header has fixed z-30
    diagnostics.headerChain = await collectAncestorChain(page, 'header');
    // Find every element on the page that creates a stacking context AND has z-index >= dropdown's
    diagnostics.competingStackingContexts = await page.evaluate(() => {
      const props = ['transform', 'opacity', 'filter', 'will-change', 'isolation',
                     'mix-blend-mode', 'perspective', 'backdrop-filter', 'contain'];
      const matches = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const cs = window.getComputedStyle(el);
        const z = cs.zIndex;
        const pos = cs.position;
        const opacity = parseFloat(cs.opacity);
        const transform = cs.transform;
        const filter = cs.filter;
        const willChange = cs.willChange;
        const isolation = cs.isolation;
        const backdropFilter = cs.backdropFilter;

        // Stacking context creators that aren't position+z-index
        const createsContext =
          (transform && transform !== 'none') ||
          opacity < 1 ||
          (filter && filter !== 'none') ||
          (willChange && willChange !== 'auto' && willChange !== '') ||
          (isolation && isolation === 'isolate') ||
          (backdropFilter && backdropFilter !== 'none') ||
          (pos === 'fixed') ||
          (pos === 'sticky');

        const zNum = z === 'auto' ? null : parseInt(z, 10);

        // Capture if (creates context) OR (has explicit positive z-index)
        if (createsContext || (zNum && zNum >= 10)) {
          // Don't include the dropdown itself or its descendants
          const dd = document.getElementById('topics-mega-menu');
          if (dd && (el === dd || dd.contains(el))) continue;
          // Skip body/html
          if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;

          const rect = el.getBoundingClientRect();
          matches.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: typeof el.className === 'string' ? el.className.slice(0, 150) : null,
            zIndex: z,
            position: pos,
            opacity: cs.opacity,
            transform: transform === 'none' ? null : transform.slice(0, 80),
            filter: filter === 'none' ? null : filter,
            willChange: willChange === 'auto' ? null : willChange,
            isolation: isolation === 'auto' ? null : isolation,
            backdropFilter: backdropFilter === 'none' ? null : backdropFilter,
            rect: {
              top: Math.round(rect.top),
              left: Math.round(rect.left),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            createsContext,
          });
          // Cap to keep payload manageable
          if (matches.length >= 50) break;
        }
      }
      return matches;
    });
    // Collect overlapping element ancestor chain too if found
    if (diagnostics.overlapAnalysis.overlap && diagnostics.overlapAnalysis.overlaps.length > 0) {
      const top = diagnostics.overlapAnalysis.overlaps[0];
      // Build a unique selector for the overlapping element
      let overlapSel = top.tag;
      if (top.id) overlapSel = `#${top.id}`;
      else if (top.dataTrack) overlapSel = `[data-track="${top.dataTrack}"]`;
      else if (top.classes) {
        const firstClass = top.classes.split(' ')[0];
        if (firstClass) overlapSel = `${top.tag}.${firstClass}`;
      }
      diagnostics.overlappingElementChain = await collectAncestorChain(page, overlapSel);
      diagnostics.overlappingElementSelectorUsed = overlapSel;
    }
  } else {
    diagnostics.note = 'Dropdown did not open in this viewport (likely mobile - hidden in hamburger)';
  }

  fs.writeFileSync(jsonPath, JSON.stringify(diagnostics, null, 2));

  // Move mouse away to close
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);

  return diagnostics;
}

// ============================================
// DESKTOP TESTS (1280x800)
// ============================================
test.describe('Desktop overlap repro @ 1280x800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('1. Homepage - hover Topics at top', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const data = await captureDropdownData(page, 'desktop-1-homepage-top', 'Homepage at top, hover Topics', { width: 1280, height: 800 });
    console.log('Case 1 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });

  test('2. Homepage - scrolled', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(800);
    const data = await captureDropdownData(page, 'desktop-2-homepage-scrolled', 'Homepage scrolled to product cards', { width: 1280, height: 800 });
    console.log('Case 2 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });

  test('3. /reviews scrolled to comparison table', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/reviews', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(800);
    const data = await captureDropdownData(page, 'desktop-3-reviews-table', '/reviews scrolled to expose comparison table', { width: 1280, height: 800 });
    console.log('Case 3 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });

  test('4. /compare', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/compare', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    const data = await captureDropdownData(page, 'desktop-4-compare', '/compare hover Topics', { width: 1280, height: 800 });
    console.log('Case 4 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });

  test('5. Blog post (DHM dosage guide) scrolled', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(800);
    const data = await captureDropdownData(page, 'desktop-5-blog-post', 'Blog post scrolled into article', { width: 1280, height: 800 });
    console.log('Case 5 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });

  test('6. Hangxiety pillar page scrolled', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/never-hungover/hangxiety-complete-guide-2026-supplements-research', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(800);
    const data = await captureDropdownData(page, 'desktop-6-hangxiety-pillar', 'Hangxiety pillar page scrolled', { width: 1280, height: 800 });
    console.log('Case 6 overlap:', data.overlapAnalysis?.overlap, 'count:', data.overlapAnalysis?.overlapCount);
  });
});

// ============================================
// MOBILE TESTS (390x844)
// ============================================
test.describe('Mobile overlap repro @ 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('M1. Homepage - hamburger expanded Topics', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);

    // Take a "before" screenshot of the unexpanded mobile state
    const beforePath = path.join(SCREENSHOT_DIR, 'mobile-1-homepage-before.png');
    await page.screenshot({ path: beforePath });

    // Tap hamburger
    const hamburger = page.locator('header button.lg\\:hidden').first();
    await hamburger.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);

    // Tap Topics
    const topicsBtn = page.getByRole('button', { name: /Topics/i });
    await topicsBtn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);

    const duringPath = path.join(SCREENSHOT_DIR, 'mobile-1-homepage-during.png');
    await page.screenshot({ path: duringPath });

    const diagnostics = {
      scenario: 'Mobile homepage, tap hamburger, expand Topics inline',
      label: 'mobile-1-homepage',
      viewport: { width: 390, height: 844 },
      url: page.url(),
      timestamp: new Date().toISOString(),
    };

    // Check if topics-mobile expanded
    const inlineList = await page.evaluate(() => {
      const drawer = document.querySelector('[aria-expanded="true"]');
      if (!drawer) return { expanded: false };
      const rect = drawer.getBoundingClientRect();
      return {
        expanded: true,
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
        ariaControls: drawer.getAttribute('aria-controls'),
      };
    });
    diagnostics.mobileTopicsState = inlineList;

    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'mobile-1-homepage.json'), JSON.stringify(diagnostics, null, 2));
  });

  test('M2. /reviews mobile, hamburger expanded Topics', async ({ page }) => {
    await page.goto('https://www.dhmguide.com/reviews', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);

    const beforePath = path.join(SCREENSHOT_DIR, 'mobile-2-reviews-before.png');
    await page.screenshot({ path: beforePath });

    const hamburger = page.locator('header button.lg\\:hidden').first();
    await hamburger.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);

    const topicsBtn = page.getByRole('button', { name: /Topics/i });
    await topicsBtn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);

    const duringPath = path.join(SCREENSHOT_DIR, 'mobile-2-reviews-during.png');
    await page.screenshot({ path: duringPath });

    const diagnostics = {
      scenario: 'Mobile /reviews, tap hamburger, expand Topics inline',
      label: 'mobile-2-reviews',
      viewport: { width: 390, height: 844 },
      url: page.url(),
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'mobile-2-reviews.json'), JSON.stringify(diagnostics, null, 2));
  });
});
