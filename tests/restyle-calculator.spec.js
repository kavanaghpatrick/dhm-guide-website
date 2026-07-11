// @ts-check
import { test, expect } from '@playwright/test';

/**
 * CONTRACT spec for the DHM DOSAGE CALCULATOR restyle to the modern design system.
 *   page:  src/pages/DosageCalculatorEnhanced.jsx  →  "/dhm-dosage-calculator"
 *
 * Modern language reference: src/pages/Reviews.modern.jsx (wraps the page body in
 * <div className="theme-modern">, imports src/styles/theme-modern.css, calls
 * preloadModernFonts() on mount) and the tokens/scoped classes in
 * src/styles/theme-modern.css.
 *
 * This is an INTERACTIVE TOOL. The restyle changes PRESENTATION ONLY — the React
 * state, hooks, event handlers and the dosage CALCULATION logic must survive
 * untouched. This suite therefore has two halves:
 *
 *   STYLE (RED until the restyle lands):
 *     - the page body is inside a .theme-modern subtree
 *     - the H1 renders in Fraunces (modern display face), no gradient clip-text
 *     - NO element in the page body carries a rainbow gradient wash or a
 *       purple/blue/indigo/pink multi-color background (scans computed
 *       backgroundImage + backgroundColor across every element in <main>)
 *     - the reserved conversion-orange appears ONLY on an affiliate/buy CTA.
 *       This tool has NO affiliate CTAs (its buttons are internal Links + the
 *       calculate/stepper controls), so orange must appear on ZERO elements —
 *       internal buttons/steppers must be brand-green or neutral, never orange.
 *
 *   BEHAVIOR PRESERVED (guards against regression — may already be GREEN):
 *     - driving the calculator (set a weight, press Calculate) still renders a
 *       plausible mg dose, proving the calculation logic is intact
 *     - every form control has an accessible name (label/aria)
 *     - no console/page errors, no horizontal overflow at 375px, and the primary
 *       result CTA meets the 44px mobile tap-target minimum.
 *
 * COMPUTED-STYLE assertions (getComputedStyle) — not class-name matching — so the
 * spec survives a Tailwind-utility → theme-modern refactor. Every style scan is
 * anchored to <main> (the page body) because the shared header/footer chrome has
 * its OWN legit .theme-modern scope and must not be swept into the page scans.
 */

const CALC_URL = '/dhm-dosage-calculator';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

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
    // Third-party pixels (Clarity/GA/PostHog) 404 in local dev with placeholder
    // IDs and log a generic "Failed to load resource" on every page — noise, not
    // an app fault. Real JS errors and app-origin HTTP failures still count.
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (resp) => {
    if (resp.status() >= 400 && /localhost|127\.0\.0\.1/.test(resp.url())) {
      errors.push(`http ${resp.status()}: ${resp.url()}`);
    }
  });
}

/** Assert the given element (or an ancestor) carries the .theme-modern scope. */
async function expectThemeModernScope(page, sel) {
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

// ---------------------------------------------------------------------------
// suite
// ---------------------------------------------------------------------------

test.describe('DHM Dosage Calculator — modern restyle contract', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto(CALC_URL);
    await page.waitForLoadState('domcontentloaded');
    // The calculator lazy-loads (React.lazy) and animates in; give hooks +
    // framer-motion time to settle so computed styles are final.
    await page.waitForTimeout(1500);
  });

  // ======================= STYLE (RED until restyle) =======================

  test('page body is wrapped in .theme-modern', async ({ page }) => {
    // Anchor on the H1 — after the restyle the H1 lives inside the page's
    // .theme-modern root wrapper (mirrors Reviews.modern.jsx).
    await expectThemeModernScope(page, 'h1');
  });

  test('H1 renders in Fraunces (modern display face)', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1, 'a single visible H1 must exist').toBeVisible();
    const font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(
      /fraunces/i.test(font),
      `H1 font-family "${font}" must include Fraunces (modern display face).`
    ).toBe(true);
  });

  test('H1 has NO gradient clip-text (solid ink, not transparent-filled)', async ({
    page,
  }) => {
    // The control paints the H1 with bg-clip-text + text-transparent (a blue
    // gradient). Modern headings are SOLID ink. Scan the whole page body for any
    // clip-text offender, not just the H1, to catch section titles too.
    const offenders = await page.locator('main *').evaluateAll((els) =>
      els
        .filter((el) => {
          const cs = getComputedStyle(el);
          const clip =
            cs.getPropertyValue('background-clip') ||
            cs.getPropertyValue('-webkit-background-clip');
          const fill =
            cs.getPropertyValue('-webkit-text-fill-color') || cs.color;
          return /text/i.test(clip) && /transparent|rgba\(0, 0, 0, 0\)/i.test(fill);
        })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
        .slice(0, 8)
    );
    expect(
      offenders,
      `No gradient clip-text allowed on the calculator. Offenders: ${offenders.join(
        ' | '
      )}`
    ).toEqual([]);
  });

  test('no rainbow / multi-color gradient wash anywhere in the page body', async ({
    page,
  }) => {
    // The control is saturated with bg-gradient-to-* washes in purple/blue/indigo/
    // pink (hero badge, quiz section, calculator card, result cards, CTA band).
    // After the de-rainbow, every element in <main> must resolve to paper/surface/
    // brand tokens — NO gradient image, and NO purple/indigo/pink solid fill.
    //
    // We flag on TWO signals scanned page-side across every element in <main>:
    //   (a) backgroundImage contains a *-gradient(...) with a rainbow-ish hue, OR
    //       more than one color stop that isn't a plain paper/white/transparent.
    //   (b) backgroundColor resolves to a purple/indigo/pink/blue saturated fill.
    const offenders = await page.evaluate(() => {
      /** parse "rgb(a)(...)" → [r,g,b,a] or null */
      function parseRGB(str) {
        const m = (str.match(/-?\d+(\.\d+)?/g) || []).map(Number);
        if (m.length < 3) return null;
        const [r, g, b, a = 1] = m;
        return { r, g, b, a };
      }
      /** purple/indigo/pink/violet saturated fill: blue dominant-or-tied AND red
       *  present AND green suppressed → the rainbow families we're de-branding. */
      function isRainbowFill(str) {
        const c = parseRGB(str);
        if (!c || c.a === 0) return false;
        const { r, g, b } = c;
        // near-neutral / paper / white / light tints are fine.
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max - min < 40) return false; // low saturation → neutral, allow
        if (max > 235 && min > 200) return false; // very light tint → allow
        // purple / indigo / violet / pink: blue high, red mid-high, green lowest.
        const purpleish = b > 110 && r > 70 && g < b - 20 && g < r + 20;
        // saturated mid blue (indigo/blue washes): blue clearly dominant, green low.
        const blueish = b > 140 && b > g + 50 && b > r + 40;
        return purpleish || blueish;
      }
      const bad = [];
      const els = document.querySelectorAll('main *');
      for (const el of els) {
        const cs = getComputedStyle(el);
        const bgImg = cs.backgroundImage || '';
        const bgCol = cs.backgroundColor || '';
        let hit = null;
        // (a) any gradient image whose stops include a rainbow-family color.
        if (/gradient\(/i.test(bgImg)) {
          const stops = bgImg.match(/rgba?\([^)]*\)/g) || [];
          if (stops.some(isRainbowFill)) hit = `bgImage=${bgImg.slice(0, 90)}`;
        }
        // (b) a solid rainbow-family background fill.
        if (!hit && isRainbowFill(bgCol)) hit = `bgColor=${bgCol}`;
        if (hit) {
          const label = (el.textContent || '').trim().slice(0, 28);
          bad.push(`${el.tagName.toLowerCase()} [${label}] ${hit}`);
        }
      }
      return bad.slice(0, 12);
    });
    expect(
      offenders,
      `Rainbow gradient/fill found in the calculator body — de-rainbow to paper/` +
        `surface/brand tokens:\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  test('reserved conversion-orange appears ONLY on affiliate CTAs (none here)', async ({
    page,
  }) => {
    // ORANGE (#F97316 / #EA580C) is reserved for affiliate/buy CTAs. This tool has
    // NO affiliate CTAs — its interactive elements are internal <Link>s and the
    // calculate/stepper/unit controls — so orange must appear on ZERO of them.
    // If the implementer legitimately adds a single "Shop DHM" affiliate anchor,
    // it is exempt (identified by an affiliate signature: rel*="sponsored",
    // an Amazon href, or the data-experiment-key tracking hook).
    const offenders = await page.evaluate(() => {
      function reads(el, prop) {
        const c = getComputedStyle(el)[prop];
        const m = (c.match(/-?\d+(\.\d+)?/g) || []).map(Number);
        if (m.length < 3) return null;
        const [r, g, b, a = 1] = m;
        if (a === 0) return null;
        return r > 200 && g > 70 && g < 160 && b < 70 ? c : null;
      }
      function isAffiliate(el) {
        const a = el.closest('a');
        if (!a) return false;
        const rel = (a.getAttribute('rel') || '').toLowerCase();
        const href = (a.getAttribute('href') || '').toLowerCase();
        return (
          /sponsored/.test(rel) ||
          a.hasAttribute('data-experiment-key') ||
          /amzn\.to|amazon\.|tag=/.test(href)
        );
      }
      const bad = [];
      for (const el of document.querySelectorAll('main a, main button, main .btn, main [role="button"], main input, main [class*="slider"], main [role="slider"]')) {
        if (isAffiliate(el)) continue;
        const bg = reads(el, 'backgroundColor');
        const fg = reads(el, 'color');
        const bd = reads(el, 'borderColor');
        if (bg || fg || bd) {
          const label = (el.textContent || '').trim().slice(0, 30);
          bad.push(
            `${el.tagName.toLowerCase()} [${label}]${bg ? ' bg=' + bg : ''}${
              fg ? ' fg=' + fg : ''
            }${bd ? ' border=' + bd : ''}`
          );
        }
      }
      return bad;
    });
    expect(
      offenders,
      `Reserved conversion-orange found on non-affiliate calculator control(s) — ` +
        `internal buttons/steppers must be brand-green or neutral:\n${offenders.join(
          '\n'
        )}`
    ).toEqual([]);
  });

  test('clean heading order — exactly one h1', async ({ page }) => {
    const levels = await page
      .locator('main h1, main h2, main h3, main h4, main h5, main h6')
      .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));
    const h1Count = levels.filter((l) => l === 1).length;
    expect(h1Count, `Expected exactly one <h1> in the page body, found ${h1Count}.`).toBe(1);
  });

  // =================== BEHAVIOR PRESERVED (regression guard) ===================

  test('the calculator still computes a plausible dose after the restyle', async ({
    page,
  }) => {
    // Drive the tool like a user: the calculator's numeric inputs (weight, drinks,
    // duration) render regardless of the intro quiz. Set a known body weight, then
    // press the primary Calculate button and assert a plausible mg dose renders.
    //
    // Robust control location (survives a class refactor): the three spin inputs
    // are type="number"; the FIRST is body weight (default 150). The Calculate
    // action is the button whose text matches /calculate/ (not the hero scroll CTA
    // "Start Free Calculator", which is excluded by requiring "my"/"dosage").
    const numberInputs = page.locator('main input[type="number"]');
    await expect(
      numberInputs.first(),
      'the body-weight number input must exist'
    ).toBeVisible();

    // Set weight via real keyboard interaction (select-all → type), which fires the
    // component's onChange. The input clamps per-keystroke to its min/max window, so
    // we assert on a plausible RANGE below rather than an exact value — the point is
    // to prove the input → calculation wiring survives the restyle.
    const weight = numberInputs.first();
    await weight.click();
    await weight.press('ControlOrMeta+a');
    await weight.pressSequentially('200', { delay: 30 });
    await weight.blur();

    // Primary calculate action (the results-producing button, not the hero CTA).
    const calcBtn = page
      .getByRole('button', { name: /calculate (my )?(personalized )?dosage/i })
      .first();
    await expect(calcBtn, 'the Calculate button must exist').toBeVisible();
    await calcBtn.scrollIntoViewIfNeeded();
    await calcBtn.click();

    // The result renders after an intentional ~1500ms "calculating" delay in the
    // handler, inside the #results section as "<n> mg". Wait for it to appear.
    const results = page.locator('#results');
    await expect(results, 'the results section must reveal after Calculate').toBeVisible({
      timeout: 8000,
    });

    // Extract the primary dose figure and assert it is a plausible DHM dose.
    const doseText = await results.evaluate((el) => {
      const m = (el.textContent || '').match(/(\d{2,4})\s*mg/i);
      return m ? m[1] : null;
    });
    expect(doseText, 'a "<n> mg" dose must render in the results').not.toBeNull();
    const dose = Number(doseText);
    // Logic bounds: base >= 300, capped at 1200; 200lb prevention default ≈ 450mg.
    expect(
      dose >= 250 && dose <= 1200,
      `Recommended dose ${dose}mg is outside the plausible 250–1200mg range — ` +
        `the calculation logic may have been altered by the restyle.`
    ).toBe(true);
  });

  test('every form control has an accessible name (label / aria)', async ({
    page,
  }) => {
    // A11Y: each input/select must be programmatically labelled. The control
    // currently ships three bare number inputs (weight/drinks/duration) with a
    // visual <label> but NO htmlFor/id association and no aria — this assertion is
    // RED until the restyle wires accessible names to every control.
    const unnamed = await page.evaluate(() => {
      const bad = [];
      const controls = document.querySelectorAll(
        'main input:not([type="hidden"]), main select, main textarea'
      );
      for (const el of controls) {
        const id = el.getAttribute('id');
        const labelled =
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
          el.closest('label') ||
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.getAttribute('title');
        if (!labelled) {
          bad.push(
            `${el.tagName.toLowerCase()}[type=${el.getAttribute('type') || 'text'}]`
          );
        }
      }
      return bad;
    });
    expect(
      unnamed,
      `Form control(s) lack an accessible name (need <label for>/wrapping label/` +
        `aria-label): ${unnamed.join(', ')}`
    ).toEqual([]);
  });

  test('no console/page errors and no horizontal overflow', async ({ page }) => {
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scrollWidth,
      `Horizontal overflow: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth} + 4`
    ).toBeLessThanOrEqual(overflow.clientWidth + 4);
  });
});

// ===========================================================================
// Mobile — 375px viewport: no overflow + tap-target minimum on the result CTA
// ===========================================================================
test.describe('DHM Dosage Calculator — mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto(CALC_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
  });

  test('no horizontal overflow at 375px', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scrollWidth,
      `Horizontal overflow at 375px: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth} + 4`
    ).toBeLessThanOrEqual(overflow.clientWidth + 4);
  });

  test('primary Calculate control meets the 44px tap-target minimum', async ({
    page,
  }) => {
    const calcBtn = page
      .getByRole('button', { name: /calculate (my )?(personalized )?dosage/i })
      .first();
    await expect(calcBtn, 'the Calculate button must exist on mobile').toBeVisible();
    await calcBtn.scrollIntoViewIfNeeded();
    const box = await calcBtn.boundingBox();
    expect(box, 'the Calculate button must have a layout box').not.toBeNull();
    expect(
      box.height,
      `Mobile Calculate CTA height ${box?.height}px is below the 44px tap-target minimum`
    ).toBeGreaterThanOrEqual(43.5); // tolerate sub-pixel rounding
  });
});
