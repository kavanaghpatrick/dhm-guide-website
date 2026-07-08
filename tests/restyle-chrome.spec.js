// @ts-check
import { test, expect } from '@playwright/test';

/**
 * CONTRACT spec for the SHARED CHROME restyle (header + footer) to the modern
 * design system (docs/design-modernization-2026-06-25/, tokens in
 * src/styles/theme-modern.css).
 *
 * The header + footer live in src/components/layout/Layout.jsx and wrap EVERY
 * page (including the flag-gated modern pages). We visit "/" because the chrome
 * is present on every route.
 *
 * These assertions are RED against the current (pre-restyle) chrome and MUST
 * pass once the header/footer are restyled to the modern language:
 *   - warm-paper / white / neutral surfaces (NO gradient washes; footer is a
 *     WARM neutral, never a cold near-black bg-gray-900)
 *   - Fraunces display face on the logo / headings; NO gradient clip-text
 *   - orange (#F97316 / #EA580C) reserved for affiliate/buy CTAs only — the
 *     header nav CTA navigates to /reviews (internal), so it must be brand
 *     GREEN or secondary, never orange
 * while PRESERVING behavior:
 *   - every nav + footer + logo link and their hrefs
 *   - the mobile hamburger opens and lists the nav links
 *   - a11y: no horizontal overflow at mobile; >=44px tap targets on mobile
 *
 * Selectors are COMPUTED-STYLE based (getComputedStyle), not class-name based,
 * so they survive a Tailwind-utility → theme-modern-class refactor.
 *
 * NOTE: we assert against the CONTROL "/" (no experiment override). The modern
 * design is shipped to 100% on the primary pages, but the chrome is shared — the
 * restyle must land on the chrome itself, independent of the page A/B arm.
 */

/**
 * Direct header anchors that MUST be preserved. NOTE: "/never-hungover" is
 * deliberately excluded — on desktop it is the "Topics" mega-menu TRIGGER
 * ([data-track="nav-topics-trigger"]), not a plain <a href>. Its reachability is
 * asserted separately (trigger present + footer link present).
 */
const REQUIRED_HEADER_HREFS = [
  '/',
  '/guide',
  '/reviews',
  '/compare',
  '/research',
  '/about',
];
/** Footer destinations that must be preserved (Quick Links + Resources). */
const REQUIRED_FOOTER_HREFS = [
  '/',
  '/guide',
  '/reviews',
  '/compare',
  '/research',
  '/never-hungover',
  '/about',
  '/dhm-dosage-calculator',
];

/**
 * Resolve any CSS color string (rgb/hex/oklch/…) to sRGB [r,g,b] using the
 * browser's own parser via a 1×1 canvas. Runs page-side. Tailwind v4 emits
 * colors as oklch(…), which a naive regex mis-parses — the canvas normalizes.
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
  if (a === 0) return false; // transparent
  // #F97316 = (249,115,22); #EA580C = (234,88,12). Generic saturated orange:
  // strong red, mid green, low blue.
  return r > 200 && g > 70 && g < 160 && b < 70;
}

test.describe('Shared chrome — modern restyle contract', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Third-party analytics/pixel noise (Clarity, GA) fails in local dev with
      // placeholder IDs on every page — ignore, like the reference specs.
      if (/Failed to load resource/i.test(text)) return;
      errors.push(`console: ${text}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  });

  test('logo/brand wordmark renders in Fraunces, NOT gradient clip-text', async ({
    page,
  }) => {
    // The logo wordmark links to "/". It is the brand mark for the chrome and
    // must adopt the modern display face (Fraunces) with SOLID ink — never the
    // old bg-clip-text:text gradient wordmark.
    const brand = page.locator('header a[href="/"]').first();
    await expect(brand, 'header logo link to "/" must exist').toBeVisible();

    // The visible wordmark text ("DHM Guide") element.
    const wordmark = brand.getByText(/DHM Guide/i).first();
    await expect(wordmark).toBeVisible();

    const font = await wordmark.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(
      /fraunces/i.test(font),
      `Logo wordmark font-family "${font}" must include Fraunces (modern display face).`
    ).toBe(true);

    // No gradient clip-text: text must be painted, not clipped-to-transparent.
    const clip = await wordmark.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        bgClip:
          cs.getPropertyValue('background-clip') ||
          cs.getPropertyValue('-webkit-background-clip'),
        fillColor:
          cs.getPropertyValue('-webkit-text-fill-color') || cs.color,
        color: cs.color,
      };
    });
    expect(
      /text/i.test(clip.bgClip),
      `Logo wordmark must NOT use background-clip:text (got "${clip.bgClip}").`
    ).toBe(false);
    expect(
      /transparent|rgba\(0, 0, 0, 0\)/i.test(clip.fillColor),
      `Logo wordmark text must be a solid ink color, not transparent-filled clip-text (got "${clip.fillColor}").`
    ).toBe(false);
  });

  test('no gradient clip-text anywhere in header or footer', async ({ page }) => {
    for (const region of ['header', 'footer']) {
      const offenders = await page.locator(`${region} *`).evaluateAll((els) =>
        els
          .filter((el) => {
            const cs = getComputedStyle(el);
            const clip =
              cs.getPropertyValue('background-clip') ||
              cs.getPropertyValue('-webkit-background-clip');
            const fill =
              cs.getPropertyValue('-webkit-text-fill-color') || cs.color;
            const clipsText = /text/i.test(clip);
            const transparentText = /transparent|rgba\(0, 0, 0, 0\)/i.test(fill);
            return clipsText && transparentText;
          })
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
          .slice(0, 5)
      );
      expect(
        offenders,
        `${region} must have NO gradient clip-text (transparent-filled + background-clip:text). Offenders: ${offenders.join(
          ' | '
        )}`
      ).toEqual([]);
    }
  });

  test('footer background is a WARM modern neutral, not cold near-black', async ({
    page,
  }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    // Resolve the footer background to sRGB in the browser regardless of the
    // authored color space. Tailwind v4 emits colors as oklch(...) (e.g.
    // bg-gray-900 → oklch(0.21 …)), which getComputedStyle returns verbatim; a
    // naive rgb() regex mis-parses it. We paint the color onto a probe element
    // and read it back through a canvas 2d context, which always yields rgb.
    const bg = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);
    const srgb = await page.evaluate((color) => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillStyle = color; // browser parses oklch/rgb/hex → canvas rgb
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b };
    }, bg);

    // Reject the current cold near-black. Tailwind bg-gray-900 resolves to
    // rgb(16,24,40) — a very dark, blue-tinted neutral (note b=40 > any r/g). The
    // modern footer must read as a WARM neutral surface (paper / white / warm ink),
    // never this near-black. The robust signal is overall darkness: if the
    // brightest channel is still dark (< 60), the footer is near-black regardless
    // of the exact hue. A warm paper/white footer has channels ~240–255.
    const brightest = Math.max(srgb.r, srgb.g, srgb.b);
    const nearBlack = brightest < 60;
    // Additionally flag the specific "cold" tell: dark AND blue-dominant.
    const coldDark = brightest < 90 && srgb.b > srgb.r && srgb.b > srgb.g;
    expect(
      nearBlack || coldDark,
      `Footer background ${bg} → rgb(${srgb.r}, ${srgb.g}, ${srgb.b}) is a cold near-black (brightest channel ${brightest}). The modern footer must be a warm neutral surface (no bg-gray-900 / #111-ish).`
    ).toBe(false);
  });

  test('header nav CTA is brand GREEN / secondary, never conversion orange', async ({
    page,
  }) => {
    // The header CTA navigates to /reviews (internal nav), so it must NOT wear the
    // reserved conversion orange.
    //
    // Desktop: the CTA is always visible and carries [data-track="nav-cta"].
    // Mobile: the CTA lives inside the hamburger menu (no data-track hook there),
    // so open the menu and evaluate the visible /reviews CTA/link instead.
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;

    let targets;
    if (isMobile) {
      await page.locator('[data-track="mobile_menu"]').first().click();
      await page.waitForTimeout(300);
      // The visible in-menu /reviews CTA and its descendants.
      const menuCta = page.locator('header a[href="/reviews"]:visible').first();
      await expect(
        menuCta,
        'the opened mobile menu must expose a visible /reviews CTA'
      ).toBeVisible();
      targets = page.locator(
        'header a[href="/reviews"]:visible, header a[href="/reviews"]:visible *'
      );
    } else {
      const cta = page.locator('header [data-track="nav-cta"]').first();
      await expect(
        cta,
        'header nav CTA ([data-track="nav-cta"]) must exist'
      ).toBeVisible();
      targets = page.locator(
        'header [data-track="nav-cta"], header [data-track="nav-cta"] *'
      );
    }

    // Compute the effective background/text color over every candidate element —
    // none may resolve to the reserved conversion orange.
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
        `Header nav CTA element #${i} background ${bg} is the reserved conversion orange. Internal nav CTAs must be brand green / secondary.`
      ).toBe(false);
      expect(
        isOrangeRGB(colorRGB),
        `Header nav CTA element #${i} text color ${color} is the reserved conversion orange.`
      ).toBe(false);
    }
  });

  test('all nav + footer + logo destinations are preserved', async ({ page }) => {
    // Collect every href on the whole document from within the chrome regions.
    const hrefs = await page.evaluate(() => {
      const collect = (sel) =>
        Array.from(document.querySelectorAll(`${sel} a[href]`)).map((a) =>
          a.getAttribute('href')
        );
      return { header: collect('header'), footer: collect('footer') };
    });

    // Required direct header anchors must all be present.
    for (const href of REQUIRED_HEADER_HREFS) {
      expect(
        hrefs.header.includes(href),
        `Header must still link to "${href}". Header hrefs: ${hrefs.header.join(', ')}`
      ).toBe(true);
    }
    // The "/never-hungover" destination is reached via the Topics mega-menu
    // trigger on desktop — assert the trigger is preserved (its dropdown is
    // portaled to document.body, so its links aren't inside <header>).
    const topicsTrigger = page.locator('[data-track="nav-topics-trigger"]');
    const footerNeverHungover = hrefs.footer.includes('/never-hungover');
    expect(
      (await topicsTrigger.count()) > 0 || footerNeverHungover,
      'The /never-hungover destination must remain reachable (Topics trigger and/or footer link).'
    ).toBe(true);

    // Required footer destinations must all be present.
    for (const href of REQUIRED_FOOTER_HREFS) {
      expect(
        hrefs.footer.includes(href),
        `Footer must still link to "${href}". Footer hrefs: ${hrefs.footer.join(', ')}`
      ).toBe(true);
    }

    // Sanity: a reasonable minimum count of distinct internal destinations across
    // chrome (currently 8: the 7 nav routes + /dhm-dosage-calculator). This is a
    // behavior-preservation floor — the restyle must not drop destinations.
    const allInternal = [...hrefs.header, ...hrefs.footer].filter(
      (h) => h && h.startsWith('/')
    );
    const distinct = new Set(allInternal);
    expect(
      distinct.size,
      `Expected chrome to expose a healthy set of internal links; got ${distinct.size} (${[...distinct].join(', ')})`
    ).toBeGreaterThanOrEqual(8);
  });

  test('every visible focusable link/button exposes a :focus-visible outline', async ({
    page,
  }) => {
    // Contract: focus-visible must produce a visible outline (a11y). Check the
    // logo link as a representative chrome control (theme-modern sets a global
    // :focus-visible outline; the control chrome relies on browser default only
    // inconsistently). This is a smoke check, not exhaustive.
    const brand = page.locator('header a[href="/"]').first();
    await brand.focus();
    const outline = await brand.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        style: cs.outlineStyle,
        width: cs.outlineWidth,
      };
    });
    // A visible outline means style !== 'none' AND width > 0 — OR a box-shadow ring.
    const hasOutline =
      outline.style !== 'none' && parseFloat(outline.width) > 0;
    const boxShadow = await brand.evaluate(
      (el) => getComputedStyle(el).boxShadow
    );
    const hasRing = boxShadow && boxShadow !== 'none';
    expect(
      hasOutline || hasRing,
      `Focused chrome link must show a visible focus outline/ring (outline ${outline.style}/${outline.width}, box-shadow "${boxShadow}").`
    ).toBe(true);
  });

  test('mobile hamburger opens and lists the nav links', async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    test.skip(!isMobile, 'hamburger menu only renders below the lg breakpoint');

    const hamburger = page.locator('[data-track="mobile_menu"]').first();
    await expect(hamburger, 'mobile hamburger ([data-track="mobile_menu"]) must exist').toBeVisible();

    await hamburger.click();
    await page.waitForTimeout(300);

    // After opening, the mobile nav must list the primary destinations. Match the
    // VISIBLE (mobile-menu) anchor — the desktop nav also holds these links but is
    // hidden below the lg breakpoint.
    for (const href of ['/guide', '/reviews', '/about']) {
      const link = page.locator(`header a[href="${href}"]:visible`).first();
      await expect(
        link,
        `Opened mobile menu must list a visible link to "${href}".`
      ).toBeVisible();
    }
  });

  test('chrome (header + footer) introduces no horizontal overflow at mobile', async ({
    page,
  }) => {
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    test.skip(!isMobile, 'horizontal-overflow check targets the mobile viewport');

    // Scope the overflow contract to the chrome the restyle OWNS (header +
    // footer). Whole-document overflow can be driven by page-body content (e.g. a
    // wide comparison table in <main>) that a chrome restyle cannot fix; asserting
    // it here would be untestable for chrome implementers. We assert no header/
    // footer descendant extends past the viewport's right edge — that IS the
    // chrome restyle's responsibility, and a regression here (e.g. a nav pill row
    // that no longer wraps) must fail.
    const worst = await page.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      let maxRight = 0;
      let offender = null;
      for (const el of document.querySelectorAll('header *, footer *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue; // skip collapsed nodes
        if (r.right > maxRight) {
          maxRight = r.right;
          offender = `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 60)}`;
        }
      }
      return { cw, maxRight: Math.round(maxRight), offender };
    });
    expect(
      worst.maxRight,
      `A chrome element extends past the viewport (right=${worst.maxRight} > clientWidth=${worst.cw} + 4). Widest: ${worst.offender}`
    ).toBeLessThanOrEqual(worst.cw + 4);
  });

  test('mobile nav + footer tap targets meet the 44px minimum', async ({
    page,
  }) => {
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    test.skip(!isMobile, 'tap-target rule only applies on mobile viewport');

    // Open the mobile menu so the nav links are laid out.
    const hamburger = page.locator('[data-track="mobile_menu"]').first();
    await hamburger.click();
    await page.waitForTimeout(300);

    // Measure the primary nav links (in the opened menu) and footer links.
    const targets = page.locator(
      'header nav a[href="/reviews"], footer a[href="/reviews"]'
    );
    const count = await targets.count();
    expect(count, 'Expected nav+footer /reviews links to measure').toBeGreaterThan(0);

    let measuredAny = false;
    for (let i = 0; i < count; i++) {
      const el = targets.nth(i);
      if (!(await el.isVisible())) continue;
      const box = await el.boundingBox();
      if (!box) continue;
      measuredAny = true;
      expect(
        box.height,
        `Mobile chrome tap target #${i} height ${box.height}px is below the 44px minimum.`
      ).toBeGreaterThanOrEqual(43.5); // sub-pixel tolerance
    }
    expect(measuredAny, 'No visible mobile chrome tap target could be measured').toBe(true);
  });

  test('no console/page errors on the chrome-bearing page', async ({ page }) => {
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
