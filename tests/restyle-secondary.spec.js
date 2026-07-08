// @ts-check
import { test, expect } from '@playwright/test';

/**
 * CONTRACT spec for the SECONDARY-PAGE restyle to the modern design system:
 *   - About  (src/pages/About.jsx)      → "/about"
 *   - 404    (src/pages/NotFound.jsx)    → "/this-page-does-not-exist"
 *
 * Modern language reference: src/pages/Reviews.modern.jsx (wraps body in
 * <div className="theme-modern">, imports src/styles/theme-modern.css) and the
 * tokens/scoped classes in src/styles/theme-modern.css.
 *
 * These assertions are RED against the current (pre-restyle) pages and MUST pass
 * once each page is wrapped in .theme-modern and restyled:
 *   - the page body is inside a .theme-modern subtree (self or ancestor)
 *   - the H1 renders in Fraunces (modern display face)
 *   - NO gradient clip-text (no transparent-filled + background-clip:text)
 *   - About's "See Tested Products" (internal → /reviews) is NOT conversion
 *     orange (orange is reserved for affiliate/buy CTAs)
 *   - the 404 page keeps a working link back to home ("/")
 *   - no console errors (third-party "Failed to load resource" filtered, per the
 *     reference spec) and no horizontal overflow.
 *
 * COMPUTED-STYLE assertions (getComputedStyle) — not class-name matching — so the
 * spec survives a Tailwind-utility → theme-modern refactor.
 */

/**
 * Resolve any CSS color string (rgb/hex/oklch/…) to sRGB using the browser's own
 * parser via a 1×1 canvas — Tailwind v4 emits oklch(…), which a naive regex
 * mis-parses. Runs page-side.
 */
async function toSRGB(page, color) {
  return page.evaluate((c) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a };
  }, color);
}

/** True if a resolved sRGB color reads as the reserved conversion-orange. */
function isOrangeRGB({ r, g, b, a }) {
  if (a === 0) return false;
  // #F97316 (249,115,22) / #EA580C (234,88,12): strong red, mid green, low blue.
  return r > 200 && g > 70 && g < 160 && b < 70;
}

/** Shared error-collector wiring (matches the reference specs). */
function wireErrors(page, errors) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return; // third-party pixel noise
    errors.push(`console: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
}

/** Assert the given element (or an ancestor) carries the .theme-modern scope. */
async function expectThemeModernScope(page, sel = 'h1') {
  const inScope = await page.locator(sel).first().evaluate((el) => {
    let node = /** @type {Element|null} */ (el);
    while (node) {
      if (node.classList && node.classList.contains('theme-modern')) return true;
      node = node.parentElement;
    }
    return false;
  });
  expect(
    inScope,
    `Expected "${sel}" to be inside a .theme-modern subtree (self or ancestor).`
  ).toBe(true);
}

/** Assert the first H1 renders in Fraunces. */
async function expectFrauncesH1(page) {
  const h1 = page.getByRole('heading', { level: 1 }).first();
  await expect(h1, 'a single visible H1 must exist').toBeVisible();
  const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(
    /fraunces/i.test(font),
    `H1 font-family "${font}" must include Fraunces (modern display face).`
  ).toBe(true);
}

/** Assert NO gradient clip-text anywhere in the given root selector's subtree. */
async function expectNoClipText(page, rootSel = 'main') {
  const offenders = await page.locator(`${rootSel} *`).evaluateAll((els) =>
    els
      .filter((el) => {
        const cs = getComputedStyle(el);
        const clip =
          cs.getPropertyValue('background-clip') ||
          cs.getPropertyValue('-webkit-background-clip');
        const fill = cs.getPropertyValue('-webkit-text-fill-color') || cs.color;
        return /text/i.test(clip) && /transparent|rgba\(0, 0, 0, 0\)/i.test(fill);
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
      .slice(0, 5)
  );
  expect(
    offenders,
    `No gradient clip-text allowed. Offenders: ${offenders.join(' | ')}`
  ).toEqual([]);
}

/** Assert exactly one H1 and no skipped heading levels. */
async function expectCleanHeadingOrder(page) {
  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));
  const h1Count = levels.filter((l) => l === 1).length;
  expect(h1Count, `Expected exactly one <h1>, found ${h1Count}.`).toBe(1);
}

/** Assert no horizontal overflow. */
async function expectNoOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    overflow.scrollWidth,
    `Horizontal overflow: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth} + 4`
  ).toBeLessThanOrEqual(overflow.clientWidth + 4);
}

// ===========================================================================
// About — /about
// ===========================================================================
test.describe('About page — modern restyle contract', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  });

  test('page body is wrapped in .theme-modern', async ({ page }) => {
    await expectThemeModernScope(page, 'h1');
  });

  test('H1 renders in Fraunces', async ({ page }) => {
    await expectFrauncesH1(page);
  });

  test('no gradient clip-text on the About surface', async ({ page }) => {
    await expectNoClipText(page, 'main');
  });

  test('"See Tested Products" (internal → /reviews) is NOT conversion orange', async ({
    page,
  }) => {
    // Internal nav CTA: must be brand green / secondary, never the reserved orange.
    // Locate by its stable data-cta-text hook (preserved through the restyle).
    const cta = page.locator('[data-cta-text="See Tested Products"]').first();
    await expect(
      cta,
      'About "See Tested Products" CTA ([data-cta-text]) must exist'
    ).toBeVisible();

    // Check the CTA element and any descendants (the color may live on an inner
    // <a> / label span) — none may be orange background or orange text.
    const targets = page.locator(
      '[data-cta-text="See Tested Products"], [data-cta-text="See Tested Products"] *'
    );
    const count = await targets.count();
    for (let i = 0; i < count; i++) {
      const el = targets.nth(i);
      if (!(await el.isVisible())) continue;
      const { bg, color } = await el.evaluate((node) => {
        const cs = getComputedStyle(node);
        return { bg: cs.backgroundColor, color: cs.color };
      });
      const bgRGB = await toSRGB(page, bg);
      const colorRGB = await toSRGB(page, color);
      expect(
        isOrangeRGB(bgRGB),
        `About internal CTA #${i} background ${bg} is the reserved conversion orange.`
      ).toBe(false);
      expect(
        isOrangeRGB(colorRGB),
        `About internal CTA #${i} text color ${color} is the reserved conversion orange.`
      ).toBe(false);
    }

    // It must still point at /reviews (destination preserved).
    const href = await cta.evaluate((el) => {
      const a = el.matches('a') ? el : el.querySelector('a');
      return a ? a.getAttribute('href') : el.getAttribute('data-cta-destination');
    });
    expect(href, 'About CTA must still target /reviews').toContain('/reviews');
  });

  test('NO reserved conversion-orange anywhere on About (no affiliate CTAs here)', async ({
    page,
  }) => {
    // About links only to internal pages + a mailto — it has ZERO affiliate/buy
    // CTAs, so the reserved orange must not appear on ANY button or link. (This
    // is the assertion that was missing when "Explore Our Research" / "Contact Us"
    // shipped orange.) Scan every interactive element's bg + text color.
    const offenders = await page.evaluate(() => {
      function reads(el, prop) {
        const c = getComputedStyle(el)[prop];
        const m = (c.match(/\d+(\.\d+)?/g) || []).map(Number);
        if (m.length < 3) return null;
        const [r, g, b, a = 1] = m;
        if (a === 0) return null;
        return r > 200 && g > 70 && g < 160 && b < 70 ? c : null;
      }
      const bad = [];
      for (const el of document.querySelectorAll('a, button, .btn')) {
        const bg = reads(el, 'backgroundColor');
        const fg = reads(el, 'color');
        if (bg || fg) {
          bad.push(`${el.tagName}.${el.className}: ${bg ? 'bg=' + bg : ''} ${fg ? 'fg=' + fg : ''} [${(el.textContent || '').trim().slice(0, 30)}]`);
        }
      }
      return bad;
    });
    expect(
      offenders,
      `Reserved conversion-orange found on About element(s):\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  test('clean heading order (single h1)', async ({ page }) => {
    await expectCleanHeadingOrder(page);
  });

  test('no console/page errors and no horizontal overflow', async ({ page }) => {
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);
    await expectNoOverflow(page);
  });
});

// ===========================================================================
// 404 — an unknown route
// ===========================================================================
test.describe('404 page — modern restyle contract', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  });

  test('page body is wrapped in .theme-modern', async ({ page }) => {
    await expectThemeModernScope(page, 'h1');
  });

  test('H1 renders in Fraunces', async ({ page }) => {
    await expectFrauncesH1(page);
  });

  test('no gradient clip-text on the 404 surface', async ({ page }) => {
    await expectNoClipText(page, 'main');
  });

  test('has a working link back to home', async ({ page }) => {
    // The 404 must keep an internal link back to "/". After the restyle it may be
    // a button-styled <a> or a Link — assert an anchor with href="/" that is
    // visible and navigates home.
    const home = page.locator('a[href="/"]:visible').first();
    await expect(home, 'A visible link to "/" must exist on the 404 page').toBeVisible();

    await home.click();
    await page.waitForTimeout(500);
    const path = await page.evaluate(() => window.location.pathname);
    expect(path, `Clicking the home link should navigate to "/"; got "${path}".`).toBe('/');
  });

  test('clean heading order (single h1)', async ({ page }) => {
    await expectCleanHeadingOrder(page);
  });

  test('no console/page errors and no horizontal overflow', async ({ page }) => {
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);
    await expectNoOverflow(page);
  });
});
