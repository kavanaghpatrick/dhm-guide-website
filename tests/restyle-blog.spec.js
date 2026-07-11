// @ts-check
import { test, expect } from '@playwright/test';

/**
 * CONTRACT spec for the BLOG POST TEMPLATE restyle to the modern design system.
 *
 *   Template component: src/newblog/components/NewBlogPost.jsx
 *   Renders: ALL ~197 posts at /never-hungover/<slug>
 *   Sample URL under test: /never-hungover/when-to-take-dhm-timing-guide-2025
 *
 * This is the site's HIGHEST-TRAFFIC ORGANIC SURFACE — a single component
 * powers every post, so an SEO regression here degrades the whole site. Unlike
 * the hub/reviews/home pages, the post template has NO ".modern" A/B arm: it is
 * a DIRECT, in-place restyle. The spec therefore visits the PLAIN post URL (no
 * ?exp_site-modern-v1=modern override) and asserts the restyle is present for
 * every visitor.
 *
 * Modern language reference:
 *   - src/styles/theme-modern.css        (tokens + scoped .theme-modern classes)
 *   - src/newblog/pages/NewBlogListing.modern.jsx (the modern blog HUB — mirror
 *     its `import '../../styles/theme-modern.css'`, its <div className="theme-modern">
 *     wrapper, and preloadModernFonts() on mount)
 *   - src/pages/Reviews.modern.jsx
 *
 * Two axes of assertions:
 *   STYLE (must FLIP once restyled):
 *     - the article shell is inside a .theme-modern subtree (self or ancestor)
 *     - the post <h1> AND the in-article <h2>s render in Fraunces (display face)
 *     - NO gradient clip-text (transparent-filled + background-clip:text) anywhere
 *     - NO rainbow / two-hue gradient BACKGROUND on the page shell or article
 *     - the reserved conversion-orange appears ONLY on in-post affiliate/buy CTAs;
 *       internal nav/links (TOC, /reviews, /never-hungover, breadcrumbs) are NOT
 *       orange
 *
 *   SEO PRESERVED (must STAY green — the byte-for-byte contract):
 *     - exactly one <h1>
 *     - at least one parseable JSON-LD script[type="application/ld+json"] whose
 *       @type graph includes Article OR BlogPosting
 *     - a non-empty <title> and a meta[name="description"] exist
 *     - heading order has no skipped levels (single h1, no h2→h4 jumps)
 *
 *   BEHAVIOR:
 *     - IF any in-article affiliate <a> exists, it carries rel*="nofollow" +
 *       rel*="sponsored" + target="_blank" + a data-* attribute and NO inline
 *       onClick (the global useAffiliateTracking listener fires the event —
 *       a per-anchor onClick would double-count). (This sample post happens to
 *       have zero body affiliate links, so the assertion is conditional; it
 *       still guards every OTHER post that flows through the same template.)
 *     - the table-of-contents / in-page anchor links resolve to REAL element ids
 *     - related-posts render
 *     - zero console / page errors (third-party pixel noise filtered)
 *
 *   A11Y / RESPONSIVE:
 *     - no horizontal overflow at 375px (watch wide article tables / images)
 *     - TOC + CTA tap targets are >=44px on mobile
 *
 * All visual assertions use getComputedStyle (NOT class-name matching) so the
 * spec survives a Tailwind-utility → theme-modern refactor.
 */

const POST_URL = '/never-hungover/when-to-take-dhm-timing-guide-2025';
const MOBILE = { width: 375, height: 812 };

// ---------------------------------------------------------------------------
// Helpers (mirrors tests/restyle-secondary.spec.js house style)
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
    // Third-party analytics/pixel noise (PostHog/GA/Clarity) fails in local dev
    // with placeholder IDs; filter the generic resource error only.
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  // App-origin 4xx/5xx (a missing chunk/font) DO fail; third-party domains don't.
  page.on('response', (resp) => {
    if (resp.status() >= 400 && /localhost|127\.0\.0\.1/.test(resp.url())) {
      errors.push(`http ${resp.status()}: ${resp.url()}`);
    }
  });
}

/** Wait until the async-loaded post has actually rendered its article + body. */
async function waitForPost(page) {
  // The article body is populated via a dynamic import + markdown render.
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 });
  // A real post h2 (inside the article body) confirms markdown finished.
  await page.locator('article h2, main h2').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600); // let the TOC MutationObserver assign ids
}

/** Assert the article shell (its H1) is inside a .theme-modern subtree. */
async function expectThemeModernScope(page) {
  const inScope = await page.locator('h1').first().evaluate((el) => {
    let node = /** @type {Element|null} */ (el);
    while (node) {
      if (node.classList && node.classList.contains('theme-modern')) return true;
      node = node.parentElement;
    }
    return false;
  });
  expect(
    inScope,
    'Expected the post H1 to be inside a .theme-modern subtree (self or ancestor). ' +
      'Wrap the article shell in <div className="theme-modern"> and import theme-modern.css.'
  ).toBe(true);
}

/** Assert an element renders in Fraunces (modern display face). */
async function expectFraunces(locator, label) {
  const font = await locator.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(
    /fraunces/i.test(font),
    `${label} font-family "${font}" must include Fraunces (modern display face).`
  ).toBe(true);
}

// ---------------------------------------------------------------------------
// STYLE + SEO + BEHAVIOR — desktop (chromium)
// ---------------------------------------------------------------------------
test.describe('Blog post template — modern restyle contract', () => {
  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');
    await waitForPost(page);
  });

  // ---- STYLE ----

  test('article shell is wrapped in .theme-modern', async ({ page }) => {
    await expectThemeModernScope(page);
  });

  test('the post H1 renders in Fraunces', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1, 'a single visible H1 must exist').toBeVisible();
    await expectFraunces(h1, 'Post H1');
  });

  test('in-article H2s render in Fraunces', async ({ page }) => {
    // The body markdown emits multiple <h2> section headings — they are the
    // biggest typographic tell of the restyle (editorial Fraunces vs sans).
    const h2s = page.locator('article h2, main h2');
    const count = await h2s.count();
    expect(count, 'the post body must render at least one <h2>').toBeGreaterThan(0);
    // Check the first few visible h2s.
    const checkN = Math.min(count, 3);
    for (let i = 0; i < checkN; i++) {
      const h2 = h2s.nth(i);
      if (!(await h2.isVisible())) continue;
      await expectFraunces(h2, `Post H2 #${i}`);
    }
  });

  test('no gradient clip-text anywhere on the post', async ({ page }) => {
    const offenders = await page.locator('body *').evaluateAll((els) =>
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
        .slice(0, 8)
    );
    expect(
      offenders,
      `No gradient clip-text allowed (solid ink headings only). Offenders: ${offenders.join(' | ')}`
    ).toEqual([]);
  });

  test('no rainbow / two-hue gradient background on the page shell or article', async ({
    page,
  }) => {
    // The control shell uses bg-gradient-to-br from-green-50 to-blue-50 (rainbow
    // wash) and the article uses shadow-xl/rounded-xl white cards. After the
    // restyle the shell must read as warm paper (a solid --color-paper or an
    // approved single-hue paper→brand-soft wash), NEVER a saturated green→blue
    // gradient. We flag any element with a multi-stop linear-gradient whose stops
    // span clearly different hues (a green + a blue/purple).
    const offenders = await page.evaluate(() => {
      function hueOf(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const d = max - min;
        if (d < 0.04) return -1; // near-grey, no meaningful hue
        let h;
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        return h;
      }
      const bad = [];
      const nodes = Array.from(document.querySelectorAll('main *, [class*="min-h-screen"], article'));
      for (const el of nodes) {
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === 'none' || !/gradient/i.test(bg)) continue;
        // Pull rgb triples out of the gradient string.
        const rgbs = [...bg.matchAll(/rgba?\(([^)]+)\)/g)].map((m) =>
          m[1].split(',').slice(0, 3).map((n) => parseFloat(n))
        );
        const hues = rgbs
          .map(([r, g, b]) => hueOf(r, g, b))
          .filter((h) => h >= 0);
        if (hues.length < 2) continue;
        // green ≈ 90–170, blue/purple ≈ 200–290. A gradient that spans from a
        // green-ish stop to a blue/purple-ish stop is the banned rainbow wash.
        const hasGreen = hues.some((h) => h >= 80 && h <= 175);
        const hasBlue = hues.some((h) => h >= 195 && h <= 300);
        if (hasGreen && hasBlue) {
          bad.push(`${el.tagName.toLowerCase()}.${el.className}: ${bg.slice(0, 90)}`);
        }
      }
      return bad.slice(0, 6);
    });
    expect(
      offenders,
      `Banned rainbow (green→blue) gradient background found on:\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  test('reserved conversion-orange appears ONLY on affiliate/buy CTAs (internal links are NOT orange)', async ({
    page,
  }) => {
    // Walk every anchor. An affiliate/buy CTA = an external Amazon link (amzn.to
    // / amazon.<tld>) OR an <a> explicitly tagged as an affiliate CTA
    // (rel~=sponsored). Those MAY be orange. EVERY OTHER anchor — internal nav,
    // TOC (#), /reviews, /never-hungover, breadcrumbs — must NOT be orange.
    const offenders = await page.evaluate(() => {
      function reads(el, prop) {
        const c = getComputedStyle(el)[prop];
        const m = (c.match(/[\d.]+/g) || []).map(Number);
        if (m.length < 3) return null;
        const [r, g, b, a = 1] = m;
        if (a === 0) return null;
        return r > 200 && g > 70 && g < 160 && b < 70 ? c : null;
      }
      const bad = [];
      for (const el of document.querySelectorAll('a')) {
        const href = (el.getAttribute('href') || '').toLowerCase();
        const rel = (el.getAttribute('rel') || '').toLowerCase();
        const isAffiliate =
          /amzn\.to|amazon\./.test(href) || rel.includes('sponsored');
        if (isAffiliate) continue; // orange is ALLOWED here
        const bg = reads(el, 'backgroundColor');
        const fg = reads(el, 'color');
        if (bg || fg) {
          bad.push(
            `<a href="${href.slice(0, 40)}">: ${bg ? 'bg=' + bg : ''} ${fg ? 'fg=' + fg : ''} [${(el.textContent || '').trim().slice(0, 30)}]`
          );
        }
      }
      return bad;
    });
    expect(
      offenders,
      `Reserved conversion-orange found on NON-affiliate link(s) (internal nav/TOC/links must be brand green or ink, never orange):\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  // ---- SEO PRESERVED ----

  test('exactly one <h1>', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count, `Expected exactly one <h1>, found ${h1Count}.`).toBe(1);
  });

  test('at least one parseable Article/BlogPosting JSON-LD block', async ({ page }) => {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(
      blocks.length,
      'At least one JSON-LD script[type="application/ld+json"] must be present.'
    ).toBeGreaterThan(0);

    /** collect every @type across every graph, tolerating parse of each block */
    const types = new Set();
    let parsedAny = false;
    for (const raw of blocks) {
      let data;
      try {
        data = JSON.parse(raw);
        parsedAny = true;
      } catch {
        continue; // a single malformed block shouldn't crash the assertion
      }
      const visit = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) return node.forEach(visit);
        if (node['@type']) {
          const t = node['@type'];
          (Array.isArray(t) ? t : [t]).forEach((x) => types.add(String(x)));
        }
        if (node['@graph']) visit(node['@graph']);
        for (const k of Object.keys(node)) {
          if (k !== '@type' && k !== '@graph' && typeof node[k] === 'object') visit(node[k]);
        }
      };
      visit(data);
    }
    expect(parsedAny, 'At least one JSON-LD block must parse as valid JSON.').toBe(true);
    const hasArticle = types.has('Article') || types.has('BlogPosting');
    expect(
      hasArticle,
      `JSON-LD must include an Article/BlogPosting @type. Found types: [${[...types].join(', ')}]`
    ).toBe(true);
  });

  test('a non-empty <title> and meta description exist', async ({ page }) => {
    const title = await page.title();
    expect(title.trim().length, 'document <title> must be non-empty').toBeGreaterThan(0);
    expect(
      title,
      'the post title text must be preserved in the <title>'
    ).toContain('When to Take DHM');

    const desc = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect((desc || '').trim().length, 'meta[name="description"] must be non-empty').toBeGreaterThan(0);
  });

  test('heading order has no skipped levels', async ({ page }) => {
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));
    expect(levels.length, 'the post must render headings').toBeGreaterThan(1);
    expect(levels[0], 'the first heading on the page must be the <h1>').toBe(1);
    let prev = levels[0];
    const jumps = [];
    for (const lvl of levels) {
      if (lvl > prev + 1) jumps.push(`${prev}→${lvl}`);
      prev = lvl;
    }
    expect(
      jumps,
      `Heading order must not skip levels (e.g. h2→h4). Skips: ${jumps.join(', ')}`
    ).toEqual([]);
  });

  // ---- BEHAVIOR ----

  test('in-article affiliate <a> (if any) carries the compliance + tracking contract with NO onClick', async ({
    page,
  }) => {
    // This template auto-injects internal /reviews CTAs and renders body markdown
    // links; SOME posts contain Amazon affiliate links in the body. Wherever one
    // exists it MUST be a plain <a> with Google-compliance rel + target + a
    // data-* hook and NO inline onclick (the global listener fires the event).
    const ctas = page.locator(
      'article a[href*="amzn.to"], article a[href*="amazon."], main a[href*="amzn.to"], main a[href*="amazon."]'
    );
    const count = await ctas.count();
    // Conditional: the sample post has zero body affiliate links, so we don't
    // REQUIRE existence — but we DO enforce the contract on any that appear.
    for (let i = 0; i < count; i++) {
      const a = ctas.nth(i);
      const [rel, target, onclick, dataPlacement, dataTrack] = await Promise.all([
        a.getAttribute('rel'),
        a.getAttribute('target'),
        a.getAttribute('onclick'),
        a.getAttribute('data-placement'),
        a.getAttribute('data-track'),
      ]);
      const relLower = (rel || '').toLowerCase();
      expect(relLower, `affiliate #${i}: rel="${rel}" must contain "nofollow"`).toContain('nofollow');
      expect(relLower, `affiliate #${i}: rel="${rel}" must contain "sponsored"`).toContain('sponsored');
      expect(target, `affiliate #${i}: target must be "_blank"`).toBe('_blank');
      expect(
        onclick,
        `affiliate #${i}: must NOT have an inline onclick (global listener handles tracking)`
      ).toBeNull();
      expect(
        (dataPlacement || dataTrack || '').length,
        `affiliate #${i}: must carry a data-* hook (data-placement / data-track) for tracking`
      ).toBeGreaterThan(0);
    }
  });

  test('table-of-contents / in-page anchor links resolve to real element ids', async ({
    page,
  }) => {
    // The desktop TOC renders as a sidebar nav of <button>s that scroll to
    // generated heading ids; on mobile it collapses behind a toggle button.
    // in-body hash anchors (if present) also target real ids. Assert that every
    // TOC target corresponds to a heading id that exists in the DOM.
    // 1) A Table of Contents affordance must render (desktop sidebar OR mobile
    //    toggle — whichever is visible for the current viewport).
    const tocAny = page.getByText('Table of Contents', { exact: false });
    // The desktop sidebar copy is hidden on mobile and vice-versa; require that
    // AT LEAST ONE Table-of-Contents element is visible for this viewport.
    const tocCount = await tocAny.count();
    let anyTocVisible = false;
    for (let i = 0; i < tocCount; i++) {
      if (await tocAny.nth(i).isVisible()) { anyTocVisible = true; break; }
    }
    expect(
      anyTocVisible,
      'a Table of Contents affordance (desktop sidebar or mobile toggle) must render for a multi-heading post'
    ).toBe(true);

    // 2) Every heading the TOC is built from must carry a resolvable id.
    const headingIds = await page
      .locator('article h2, article h3, main h2, main h3')
      .evaluateAll((els) => els.map((e) => e.id).filter(Boolean));
    expect(
      headingIds.length,
      'Article h2/h3 headings must each receive a stable id (TOC anchor target).'
    ).toBeGreaterThan(0);

    // 3) Each id must resolve to exactly one element (no dangling anchors).
    const dangling = await page.evaluate((ids) => {
      return ids.filter((id) => !document.getElementById(id));
    }, headingIds);
    expect(
      dangling,
      `Every TOC/anchor id must resolve to a real element. Dangling: ${dangling.join(', ')}`
    ).toEqual([]);

    // 4) Any in-body hash anchor (<a href="#...">) must point at a real id too.
    const badHashes = await page.evaluate(() => {
      const bad = [];
      for (const a of document.querySelectorAll('article a[href^="#"], main a[href^="#"]')) {
        const id = a.getAttribute('href').slice(1);
        if (id && !document.getElementById(id)) bad.push(id);
      }
      return bad;
    });
    expect(
      badHashes,
      `In-body hash anchors must resolve to real ids. Broken: ${badHashes.join(', ')}`
    ).toEqual([]);
  });

  test('related posts render', async ({ page }) => {
    const relHeading = page.getByRole('heading', { name: /related articles/i }).first();
    await expect(relHeading, 'a "Related Articles" section must render').toBeVisible();
    // The related section links to other /never-hungover/<slug> posts.
    const relLinks = page.locator('a[href^="/never-hungover/"]');
    const count = await relLinks.count();
    expect(count, 'related posts must render internal /never-hungover/<slug> links').toBeGreaterThan(0);
  });

  test('no console / page errors', async ({ page }) => {
    // Currently RED because the control template renders the hero <Picture> with
    // a lowercase `fetchpriority` attribute, which React rejects
    // ("Invalid DOM property `fetchpriority`. Did you mean `fetchPriority`?").
    // The restyle touches that hero markup — fix the casing to `fetchPriority`
    // (JSX) so the console stays clean. Third-party pixel noise is already
    // filtered in wireErrors().
    expect(errors, `Page produced errors:\n${errors.join('\n')}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A11Y / RESPONSIVE — mobile viewport (375px)
// ---------------------------------------------------------------------------
test.describe('Blog post template — mobile a11y / responsive', () => {
  test.use({ viewport: MOBILE });

  /** @type {string[]} */
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = [];
    wireErrors(page, errors);
    await page.goto(POST_URL);
    await page.waitForLoadState('domcontentloaded');
    await waitForPost(page);
  });

  test('no horizontal overflow at 375px (watch wide tables/images)', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scrollWidth,
      `Horizontal overflow at 375px: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth} + 4`
    ).toBeLessThanOrEqual(overflow.clientWidth + 4);
  });

  test('the mobile Table-of-Contents toggle is a >=44px tap target', async ({ page }) => {
    // On mobile the TOC collapses behind a toggle control. It must meet the 44px
    // minimum touch target of the modern system.
    const toggle = page.getByRole('button', { name: /table of contents/i }).first();
    await expect(toggle, 'a mobile Table of Contents toggle must render').toBeVisible();
    const box = await toggle.boundingBox();
    expect(box, 'TOC toggle must have a layout box').not.toBeNull();
    expect(
      box.height,
      `mobile TOC toggle height ${box?.height}px must be >= 44px`
    ).toBeGreaterThanOrEqual(44);
  });

  test('the injected /reviews CTA link is a >=44px tap target', async ({ page }) => {
    // The template auto-injects an internal /reviews CTA ("See our top-rated
    // picks"). As an internal nav CTA it must be brand green (not orange) and a
    // comfortable mobile tap target. Scope to the article-body CTA via its stable
    // data-element-name hook so we don't match the header nav's /reviews link.
    const cta = page
      .locator('a[data-element-name="blog_template_reviews_cta"], article a[href="/reviews"], main a[href="/reviews"]')
      .first();
    if ((await cta.count()) === 0) test.skip(true, 'no /reviews CTA on this post');
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box, '/reviews CTA must have a layout box').not.toBeNull();
    expect(
      box.height,
      `/reviews CTA height ${box?.height}px must be >= 44px`
    ).toBeGreaterThanOrEqual(44);
  });
});
