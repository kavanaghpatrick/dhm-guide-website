// @ts-check
import { test, expect } from '@playwright/test';

// Pixel 5 characteristics WITHOUT defaultBrowserType — spreading the full
// devices['Pixel 5'] descriptor forces a browser switch that Playwright forbids
// inside a describe group. We only need the mobile viewport + touch traits, so
// the spec runs cleanly under whichever project is selected (e.g. chromium).
const PIXEL_5 = {
  viewport: { width: 393, height: 851 },
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
};

/**
 * RED a11y / responsive spec for the modern-restyle surfaces.
 *
 * Surfaces under contract:
 *   - Shared chrome: <header> + <footer> in src/components/layout/Layout.jsx
 *     (used by EVERY page, including the flag-gated modern pages).
 *   - /about  (src/pages/About.jsx)
 *   - "/"     (home — only its chrome is asserted here; page body is out of scope)
 *
 * These tests are written to be RED against the CURRENT (un-restyled) chrome and
 * About page, and GREEN once the implementer wraps the surface in the modern
 * design system (`.theme-modern`, which supplies the shared
 * `:focus-visible { outline: 2px solid var(--color-info); outline-offset: 2px }`
 * rule) and cleans up the a11y/responsive issues below.
 *
 * Design notes for resilience:
 *   - All assertions are computed-style / geometry based (not class-name based),
 *     so they survive Tailwind class churn during the restyle.
 *   - Focus-outline is verified DIFFERENTIALLY: we snapshot the computed
 *     outline+box-shadow of an element while blurred, then focus it via keyboard
 *     semantics (element.focus() sets :focus but NOT always :focus-visible, so we
 *     dispatch a real focus and also verify with the :focus-visible pseudo via a
 *     probe stylesheet). A visible focus indicator = the focused style differs
 *     from the blurred style in outline-width/style or box-shadow.
 *   - Tap-target checks run in a Pixel 5 context (mobile), matching the contract.
 *   - Overflow checks assert documentElement.scrollWidth <= innerWidth (+1px slop
 *     for sub-pixel rounding) at 320 / 375 / 414 widths.
 */

const MOBILE_WIDTHS = [320, 375, 414];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gotoSettled(page, path) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  // The unified experiment wrapper + fonts settle shortly after load; give the
  // chrome time to paint. storageState seeds site-modern-v1=control by default.
  await page.waitForTimeout(1200);
}

/**
 * Does the computed style describe a VISIBLE focus indicator?
 * Accept a real outline (width>0 and style!=none) OR a non-'none' box-shadow.
 */
function describesVisibleIndicator(style) {
  const outlineWidth = parseFloat(style.outlineWidth || '0') || 0;
  const outlineStyle = style.outlineStyle || 'none';
  const hasOutline = outlineWidth > 0 && outlineStyle !== 'none';
  const boxShadow = style.boxShadow || 'none';
  const hasShadow = boxShadow !== 'none' && boxShadow.trim() !== '';
  return hasOutline || hasShadow;
}

/**
 * For an element handle, return {blurred, focused} computed indicator snapshots.
 *
 * We want to observe the :FOCUS-VISIBLE state a keyboard user sees, because the
 * modern design system supplies its ring via `:focus-visible { outline: 2px }`
 * and the shadcn primitives explicitly suppress the default ring except under
 * :focus-visible. Programmatic el.focus() alone does NOT set keyboard modality
 * in Chromium (so :focus-visible won't match for buttons). We nudge the engine
 * into keyboard modality by dispatching a real Tab keydown on the document
 * immediately before focusing — Chromium's :focus-visible heuristic then treats
 * the ensuing focus as keyboard-originated, matching the rule. Plain links get
 * their native ring either way. This keeps the assertion honest: it fails when
 * the surface has NO :focus-visible ring (the pre-restyle shadcn state) and
 * passes once the modern wrapper (or an explicit ring) is in place.
 */
async function focusIndicatorSnapshots(handle) {
  return await handle.evaluate((el) => {
    const read = () => {
      const s = getComputedStyle(el);
      return {
        outlineWidth: s.outlineWidth,
        outlineStyle: s.outlineStyle,
        outlineColor: s.outlineColor,
        boxShadow: s.boxShadow,
      };
    };
    const blurred = read();
    // Signal keyboard modality so :focus-visible matches on focus.
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true })
    );
    el.focus({ preventScroll: true });
    // Force style/layout flush so :focus-visible rules resolve.
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
    const focused = read();
    el.blur();
    return { blurred, focused };
  });
}

// ---------------------------------------------------------------------------
// 1) Heading structure: single <h1>, no skipped levels
// ---------------------------------------------------------------------------

test.describe('a11y — heading structure', () => {
  test('/about has exactly one <h1> and no skipped heading levels', async ({ page }) => {
    await gotoSettled(page, '/about');

    const levels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) =>
        parseInt(h.tagName.substring(1), 10)
      )
    );

    const h1Count = levels.filter((l) => l === 1).length;
    expect(h1Count, `Expected exactly one <h1> on /about, found ${h1Count}`).toBe(1);

    // No skipped levels: each heading is at most one deeper than the max depth
    // seen so far.
    let maxSoFar = 0;
    const skips = [];
    for (const lvl of levels) {
      if (maxSoFar > 0 && lvl > maxSoFar + 1) {
        skips.push(`jumped from h${maxSoFar} to h${lvl}`);
      }
      maxSoFar = Math.max(maxSoFar, lvl);
    }
    expect(skips, `Heading level skips on /about: ${skips.join('; ')}`).toEqual([]);
  });

  test('home chrome contributes no rogue <h1> (page owns the single h1)', async ({ page }) => {
    await gotoSettled(page, '/');

    // The shared header/footer must NOT introduce an <h1> — that would create a
    // second/duplicate h1 alongside the page's own. Footer section titles must be
    // h2+ (they currently are h3, which is fine relative to the page h1/h2s).
    const chromeH1 = await page.evaluate(() => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const count = (root) => (root ? root.querySelectorAll('h1').length : 0);
      return count(header) + count(footer);
    });
    expect(chromeH1, 'Header/footer chrome must not contain an <h1>').toBe(0);

    const h1Count = await page.locator('h1').count();
    expect(h1Count, `Expected exactly one <h1> on "/", found ${h1Count}`).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 2) Visible focus outline on interactive elements (header / footer / About)
// ---------------------------------------------------------------------------

test.describe('a11y — visible focus indicator', () => {
  test('header interactive elements show a visible focus indicator', async ({ page }) => {
    await gotoSettled(page, '/');

    // Sample a representative set of header controls: logo link, a desktop nav
    // link, the Topics trigger button, the CTA link, and the mobile menu button.
    const header = page.locator('header');
    const candidates = header.locator('a[href], button');
    const n = await candidates.count();
    expect(n, 'Header should expose interactive elements').toBeGreaterThan(0);

    const failures = [];
    const sample = Math.min(n, 8);
    for (let i = 0; i < sample; i++) {
      const el = candidates.nth(i);
      if (!(await el.isVisible())) continue;
      const handle = await el.elementHandle();
      if (!handle) continue;
      const { blurred, focused } = await focusIndicatorSnapshots(handle);
      const before = describesVisibleIndicator(blurred);
      const after = describesVisibleIndicator(focused);
      // Contract: focusing produces a visible indicator that was not there when
      // blurred (i.e. focus MEANINGFULLY changes outline/shadow).
      const label = await el.evaluate(
        (e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 40)
      );
      if (!(after && !before)) {
        failures.push(
          `"${label}" — blurred=${JSON.stringify(blurred)} focused=${JSON.stringify(focused)}`
        );
      }
    }

    expect(
      failures,
      `Header controls without a visible :focus-visible indicator:\n${failures.join('\n')}`
    ).toEqual([]);
  });

  test('footer links show a visible focus indicator', async ({ page }) => {
    await gotoSettled(page, '/');

    const links = page.locator('footer a[href]');
    const n = await links.count();
    expect(n, 'Footer should expose links').toBeGreaterThan(0);

    const failures = [];
    const sample = Math.min(n, 8);
    for (let i = 0; i < sample; i++) {
      const el = links.nth(i);
      if (!(await el.isVisible())) continue;
      const handle = await el.elementHandle();
      if (!handle) continue;
      const { blurred, focused } = await focusIndicatorSnapshots(handle);
      if (!(describesVisibleIndicator(focused) && !describesVisibleIndicator(blurred))) {
        const label = await el.evaluate((e) => (e.textContent || 'link').trim().slice(0, 40));
        failures.push(`"${label}" — focused=${JSON.stringify(focused)}`);
      }
    }

    expect(
      failures,
      `Footer links without a visible :focus-visible indicator:\n${failures.join('\n')}`
    ).toEqual([]);
  });

  test('About page CTAs/links show a visible focus indicator', async ({ page }) => {
    await gotoSettled(page, '/about');

    // Scope to the main content (exclude shared chrome, tested above).
    const controls = page.locator('main a[href], main button');
    const n = await controls.count();
    expect(n, 'About main content should expose interactive elements').toBeGreaterThan(0);

    const failures = [];
    const sample = Math.min(n, 8);
    for (let i = 0; i < sample; i++) {
      const el = controls.nth(i);
      if (!(await el.isVisible())) continue;
      const handle = await el.elementHandle();
      if (!handle) continue;
      const { blurred, focused } = await focusIndicatorSnapshots(handle);
      if (!(describesVisibleIndicator(focused) && !describesVisibleIndicator(blurred))) {
        const label = await el.evaluate(
          (e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 40)
        );
        failures.push(`"${label}" — focused=${JSON.stringify(focused)}`);
      }
    }

    expect(
      failures,
      `About controls without a visible :focus-visible indicator:\n${failures.join('\n')}`
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3) Mobile tap targets >= 44px for nav + footer links (Pixel 5)
// ---------------------------------------------------------------------------

test.describe('a11y — mobile tap targets (Pixel 5)', () => {
  test.use(PIXEL_5);

  test('mobile nav links are >= 44px tall', async ({ page }) => {
    await gotoSettled(page, '/');

    // Open the mobile hamburger menu so the mobile nav links exist in the DOM.
    const menuBtn = page.getByRole('button', { name: /open menu|close menu/i });
    await expect(menuBtn).toBeVisible();

    // The hamburger button itself is a nav tap target.
    const menuBox = await menuBtn.boundingBox();
    expect(menuBox, 'Hamburger button must be measurable').not.toBeNull();
    expect(
      Math.round(menuBox.height),
      `Hamburger button height ${menuBox && menuBox.height}px < 44px`
    ).toBeGreaterThanOrEqual(44);

    await menuBtn.click();
    await page.waitForTimeout(300);

    // The mobile nav is the <nav> inside the header that appears after opening.
    const mobileNav = page.locator('header nav');
    const links = mobileNav.locator('a[href], > div > button, button');
    const n = await links.count();
    expect(n, 'Mobile menu should list nav links').toBeGreaterThan(0);

    const small = [];
    const sample = Math.min(n, 12);
    for (let i = 0; i < sample; i++) {
      const el = links.nth(i);
      if (!(await el.isVisible())) continue;
      const box = await el.boundingBox();
      if (!box) continue;
      if (Math.round(box.height) < 44) {
        const label = await el.evaluate((e) => (e.textContent || 'link').trim().slice(0, 40));
        small.push(`"${label}" = ${Math.round(box.height)}px`);
      }
    }

    expect(
      small,
      `Mobile nav tap targets below 44px:\n${small.join('\n')}`
    ).toEqual([]);
  });

  test('footer links are >= 44px tall on mobile', async ({ page }) => {
    await gotoSettled(page, '/');

    const links = page.locator('footer a[href]');
    const n = await links.count();
    expect(n, 'Footer should expose links').toBeGreaterThan(0);

    const small = [];
    for (let i = 0; i < n; i++) {
      const el = links.nth(i);
      if (!(await el.isVisible())) continue;
      const box = await el.boundingBox();
      if (!box) continue;
      if (Math.round(box.height) < 44) {
        const label = await el.evaluate((e) => (e.textContent || 'link').trim().slice(0, 40));
        small.push(`"${label}" = ${Math.round(box.height)}px`);
      }
    }

    expect(
      small,
      `Footer tap targets below 44px:\n${small.join('\n')}`
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4) No horizontal overflow at 320 / 375 / 414 on /about and "/"
// ---------------------------------------------------------------------------

test.describe('responsive — no horizontal overflow', () => {
  // Collect elements (within `rootSel`) whose box extends past the viewport.
  async function offendersFor(page, rootSel) {
    return page.evaluate((sel) => {
      const vw = window.innerWidth;
      const nodes = sel === 'body'
        ? document.body.querySelectorAll('*')
        : document.querySelectorAll(`${sel}, ${sel} *`);
      const out = [];
      for (const el of Array.from(nodes)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          const cls = (el.className || '').toString().trim().split(/\s+/).slice(0, 3).join('.');
          out.push(`${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} [left=${Math.round(r.left)} right=${Math.round(r.right)}]`);
        }
      }
      return { scrollWidth: document.documentElement.scrollWidth, innerWidth: vw, offenders: out.slice(0, 8) };
    }, rootSel);
  }

  // /about is restyled in THIS batch → its whole page must not overflow.
  for (const width of MOBILE_WIDTHS) {
    test(`no horizontal overflow at ${width}px on /about`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoSettled(page, '/about');
      const { scrollWidth, innerWidth, offenders } = await offendersFor(page, 'body');
      expect(
        scrollWidth,
        `Horizontal overflow on /about @ ${width}px: scrollWidth=${scrollWidth} > innerWidth=${innerWidth}.\n` +
          `Offending elements:\n  ${offenders.join('\n  ')}`
      ).toBeLessThanOrEqual(innerWidth + 1);
    });
  }

  // On "/", the home page BODY is owned by a different batch (the modern/control
  // home), so only the SHARED CHROME restyled here is in scope: the header + the
  // footer must never push an element past the viewport at any mobile width.
  for (const width of MOBILE_WIDTHS) {
    test(`shared chrome (header + footer) no overflow at ${width}px on /`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoSettled(page, '/');
      const header = await offendersFor(page, 'header');
      const footer = await offendersFor(page, 'footer');
      const offenders = [...header.offenders, ...footer.offenders];
      expect(
        offenders,
        `Shared chrome overflow on / @ ${width}px:\n  ${offenders.join('\n  ')}`
      ).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 5) Decorative icons are aria-hidden OR their control has an accessible name
// ---------------------------------------------------------------------------

test.describe('a11y — decorative icons vs accessible names', () => {
  test('header/footer icons are hidden or their control is named', async ({ page }) => {
    await gotoSettled(page, '/');

    // Any inline SVG (lucide icon) that is NOT aria-hidden AND whose closest
    // interactive ancestor (a/button) has NO accessible name is a violation:
    // screen readers will announce an unlabeled graphic or an unnamed control.
    const violations = await page.evaluate(() => {
      const problems = [];
      const roots = [document.querySelector('header'), document.querySelector('footer')].filter(
        Boolean
      );
      const accName = (el) => {
        if (!el) return '';
        const aria = el.getAttribute('aria-label');
        if (aria && aria.trim()) return aria.trim();
        // visible text content minus SVG-only content
        const text = (el.textContent || '').trim();
        return text;
      };
      for (const root of roots) {
        for (const svg of Array.from(root.querySelectorAll('svg'))) {
          const hidden =
            svg.getAttribute('aria-hidden') === 'true' ||
            svg.getAttribute('focusable') === 'false' && svg.getAttribute('role') === 'presentation';
          if (hidden) continue;
          const ctrl = svg.closest('a[href], button');
          const name = accName(ctrl);
          if (!name) {
            problems.push(
              `<svg> in ${ctrl ? ctrl.tagName : 'no-control'} has no aria-hidden and control has no accessible name`
            );
          }
        }
      }
      return problems;
    });

    expect(
      violations,
      `Decorative icons that are neither aria-hidden nor inside a named control:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  test('About decorative icons are aria-hidden or their control is named', async ({ page }) => {
    await gotoSettled(page, '/about');

    const violations = await page.evaluate(() => {
      const problems = [];
      const main = document.querySelector('main');
      if (!main) return problems;
      const accName = (el) => {
        if (!el) return '';
        const aria = el.getAttribute('aria-label');
        if (aria && aria.trim()) return aria.trim();
        return (el.textContent || '').trim();
      };
      for (const svg of Array.from(main.querySelectorAll('svg'))) {
        if (svg.getAttribute('aria-hidden') === 'true') continue;
        const ctrl = svg.closest('a[href], button');
        // Icons OUTSIDE any control are purely decorative and MUST be aria-hidden.
        if (!ctrl) {
          problems.push('decorative <svg> outside any control is not aria-hidden');
          continue;
        }
        // Icons inside a control are fine IF the control has an accessible name.
        if (!accName(ctrl)) {
          problems.push('<svg> inside a control that has no accessible name');
        }
      }
      return problems.slice(0, 12);
    });

    expect(
      violations,
      `About icons needing aria-hidden or a named control:\n${violations.join('\n')}`
    ).toEqual([]);
  });
});
