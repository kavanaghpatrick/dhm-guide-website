// @ts-check
import { test, expect } from '@playwright/test';

/**
 * BLOG DESIGN ACCEPTANCE SPEC (TDD red first, then build to green).
 *
 * Source of the rules: the blog design brief (tokens, measure, one motion,
 * contrast) distilled from the wedding Design Forge, plus the current-state
 * blog audit. Token emission in the BUILT CSS is checked separately by
 * scripts/verify-blog-tokens.mjs; this spec checks what a reader actually gets,
 * measured with getComputedStyle and bounding boxes (never screenshots).
 *
 * ---------------------------------------------------------------------------
 * MARKUP CONTRACT. Implementers build to these hooks. Measurements fall back to
 * selectors that exist today (.article-body, h1) so they report real numbers,
 * but the "contract hooks" tests fail until the hooks exist.
 *
 *   POST  /never-hungover/<slug>   (component: src/newblog/components/NewBlogPost.jsx)
 *     [data-blog="post"]         the .theme-modern page root inside <main>
 *     article.post               the single reading column (no white card, no motion.*)
 *       h1.post-title            exactly one H1, the FULL post title (matches prerender)
 *       p.post-lead              ONE standfirst under the H1 (not two stacked leads)
 *       .post-byline             "Updated <date in words>", author, read time (no date in the H1)
 *       .article-body            markdown prose: p, ul/ol, h2, h3, table, .callout
 *     nav.post-toc               table of contents (H2 entries), links >= 44px tall on phones
 *     section.post-related       related posts; each tile is a link >= 44px tall
 *
 *   LISTING  /never-hungover      (component: src/newblog/pages/NewBlogListing.modern.jsx)
 *     [data-blog="listing"]      the .theme-modern page root inside <main>
 *       h1                       one H1 set in --text-display
 *       .blog-card               one per post in the grid
 *         .blog-card__title      the post title (h2 or h3), inside or wrapping the card link
 *         .blog-card__excerpt    optional excerpt paragraph
 *
 * RULES ASSERTED (both pages unless noted)
 *   1. reading text (paragraphs, list items) >= 17px; nothing in .article-body under 16px (post)
 *   2. prose measure: post body paragraphs 55-80ch wide at 1440px, max-width 34-38em;
 *      no listing paragraph wider than 80ch
 *   3. heading sizes strictly decrease: h1 > every h2 > every h3
 *   4. body line-height >= 1.5
 *   5. keyboard focus (:focus-visible) draws a visible outline (>= 2px, not none)
 *      on links AND buttons inside the page root
 *   6. touch targets >= 44x44px at 390px for nav / button / card links
 *      (inline links inside running text are exempt, as WCAG 2.5.8 allows)
 *   7. at most ONE element animates on load (CSS animations, WAAPI, or inline
 *      opacity/transform tweens such as framer-motion); spinners excluded
 *   8. body text contrast >= 4.5:1 against its effective background; on the post,
 *      the buy button (.btn-cta) label is >= 4.5:1 too (white on #F97316 is 2.8:1)
 *
 * BASE URL: BLOG_BASE_URL (default http://localhost:5173). The audit found 5173
 * may be served from a stale worktree, so run your own vite from this checkout:
 *   npx vite --port 5199 --strictPort &
 *   BLOG_BASE_URL=http://localhost:5199 npx playwright test tests/blog-design.spec.js --project=chromium
 * ---------------------------------------------------------------------------
 */

const BASE = (process.env.BLOG_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const POST_SLUG = process.env.BLOG_POST_SLUG || 'dhm-dosage-guide-2025'; // tables + callouts + affiliate CTAs

const PAGES = [
  {
    name: 'post',
    url: `${BASE}/never-hungover/${POST_SLUG}`,
    ready: '.article-body p',
    root: '[data-blog="post"]',
    rootFallback: 'main .theme-modern',
    hooks: ['[data-blog="post"]', 'article.post', 'h1.post-title', 'p.post-lead', '.post-byline', '.article-body', 'nav.post-toc', 'section.post-related'],
    text: '.article-body > p, .article-body > ul > li, .article-body > ol > li',
    targets: 'nav.post-toc a, nav.post-toc button, section.post-related a, .article-body .btn, ROOT button',
  },
  {
    name: 'listing',
    url: `${BASE}/never-hungover?exp_site-modern-v1=modern`,
    ready: 'main h1',
    root: '[data-blog="listing"]',
    rootFallback: 'main .theme-modern',
    hooks: ['[data-blog="listing"]', '.blog-card', '.blog-card__title'],
    text: 'ROOT p',
    targets: '.blog-card a, ROOT button, ROOT nav a',
  },
];

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.beforeEach(({}, testInfo) => {
  // Viewports are set per test; one browser project is enough.
  test.skip(testInfo.project.name !== 'chromium', 'runs once, viewports set explicitly');
});

async function open(page, cfg, viewport = DESKTOP) {
  await page.setViewportSize(viewport);
  await page.goto(cfg.url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(cfg.ready, { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

/** Resolve the page root selector: the contract hook if present, else the fallback. */
async function rootSel(page, cfg) {
  return (await page.locator(cfg.root).count()) ? cfg.root : cfg.rootFallback;
}

for (const cfg of PAGES) {
  test.describe(`blog design: ${cfg.name}`, () => {
    test('contract hooks exist', async ({ page }) => {
      await open(page, cfg);
      const missing = [];
      for (const sel of cfg.hooks) if (!(await page.locator(sel).count())) missing.push(sel);
      expect(missing, `markup contract hooks missing on ${cfg.name}`).toEqual([]);
      expect(await page.locator('h1').count(), 'exactly one h1').toBe(1);
    });

    test('reading text is at least 17px', async ({ page }) => {
      await open(page, cfg);
      const root = await rootSel(page, cfg);
      const res = await page.evaluate(({ sel, root, isPost }) => {
        const els = [...document.querySelectorAll(sel.replaceAll('ROOT', root))].filter(
          (e) => e.getClientRects().length && (e.textContent || '').trim().length > 40,
        );
        const small = els
          .map((e) => ({ px: parseFloat(getComputedStyle(e).fontSize), text: e.textContent.trim().slice(0, 40) }))
          .filter((x) => x.px < 17);
        // Post only: no visible text at all inside the article body under 16px (tables, captions).
        const tiny = [];
        if (isPost) {
          const w = document.createTreeWalker(document.querySelector('.article-body') || document.body, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = w.nextNode())) {
            const el = n.parentElement;
            if (!el || !n.textContent.trim() || !el.getClientRects().length) continue;
            const px = parseFloat(getComputedStyle(el).fontSize);
            if (px < 16) tiny.push(`${el.tagName.toLowerCase()} ${px}px "${n.textContent.trim().slice(0, 30)}"`);
          }
        }
        return { count: els.length, small: small.slice(0, 5), tiny: [...new Set(tiny)].slice(0, 8) };
      }, { sel: cfg.text, root, isPost: cfg.name === 'post' });
      expect(res.count, 'found reading text to measure').toBeGreaterThan(0);
      expect(res.small, 'reading text under 17px').toEqual([]);
      expect(res.tiny, 'article text under 16px (tables, captions, labels)').toEqual([]);
    });

    test('prose measure is a readable line length', async ({ page }) => {
      await open(page, cfg, DESKTOP);
      const root = await rootSel(page, cfg);
      const res = await page.evaluate(({ sel, root }) => {
        const chOf = (el) => {
          const probe = document.createElement('span');
          probe.textContent = '0'.repeat(100);
          probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit';
          el.appendChild(probe);
          const w = probe.getBoundingClientRect().width / 100;
          probe.remove();
          return w;
        };
        return [...document.querySelectorAll(sel.replaceAll('ROOT', root))]
          .filter((e) => e.getClientRects().length && (e.textContent || '').trim().length > 200)
          .slice(0, 8)
          .map((e) => {
            const cs = getComputedStyle(e.closest('.article-body') || e);
            const fs = parseFloat(getComputedStyle(e).fontSize);
            return {
              text: e.textContent.trim().slice(0, 30),
              ch: +(e.getBoundingClientRect().width / chOf(e)).toFixed(1),
              maxWidthEm: cs.maxWidth === 'none' ? null : +(parseFloat(cs.maxWidth) / fs).toFixed(2),
            };
          });
      }, { sel: cfg.text, root });
      if (cfg.name === 'post') {
        expect(res.length, 'found long paragraphs').toBeGreaterThan(0);
        const off = res.filter((r) => r.ch < 55 || r.ch > 80);
        expect(off, 'post paragraphs outside 55-80ch').toEqual([]);
        const em = res[0].maxWidthEm;
        expect(em !== null && em >= 34 && em <= 38, `.article-body max-width ${em}em, want 34-38em (brief: 36em, not 68ch)`).toBe(true);
      } else {
        const off = res.filter((r) => r.ch > 80);
        expect(off, 'listing paragraphs wider than 80ch').toEqual([]);
      }
    });

    test('heading sizes strictly decrease h1 > h2 > h3', async ({ page }) => {
      await open(page, cfg);
      const root = await rootSel(page, cfg);
      const s = await page.evaluate((root) => {
        const sizes = (tag) =>
          [...document.querySelectorAll(`main ${tag}`)]
            .filter((e) => e.getClientRects().length && (!root || e.closest(root) || tag === 'h1'))
            .map((e) => ({ px: parseFloat(getComputedStyle(e).fontSize), text: (e.textContent || '').trim().slice(0, 40) }));
        return { h1: sizes('h1'), h2: sizes('h2'), h3: sizes('h3') };
      }, root);
      expect(s.h1.length, 'one visible h1').toBe(1);
      expect(s.h2.length, 'some h2s').toBeGreaterThan(0);
      const h1 = s.h1[0].px;
      const h2max = Math.max(...s.h2.map((h) => h.px));
      const h2min = Math.min(...s.h2.map((h) => h.px));
      expect(h1, `h1 ${h1}px must exceed every h2 (max ${h2max}px)`).toBeGreaterThan(h2max);
      if (s.h3.length) {
        const h3max = Math.max(...s.h3.map((h) => h.px));
        const big = s.h3.filter((h) => h.px >= h2min);
        expect(big, `h3s not smaller than the smallest h2 (${h2min}px)`).toEqual([]);
        expect(h2min).toBeGreaterThan(h3max);
      }
      // h2 sizes must be one value (one scale step), not a mix of in-between sizes.
      expect(new Set(s.h2.map((h) => h.px)).size, `h2 sizes ${[...new Set(s.h2.map((h) => h.px))]}`).toBe(1);
    });

    test('body line-height is at least 1.5', async ({ page }) => {
      await open(page, cfg);
      const root = await rootSel(page, cfg);
      const bad = await page.evaluate(({ sel, root }) =>
        [...document.querySelectorAll(sel.replaceAll('ROOT', root))]
          .filter((e) => e.getClientRects().length && (e.textContent || '').trim().length > 40)
          .map((e) => {
            const cs = getComputedStyle(e);
            const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
            return { lh: +lh.toFixed(2), text: e.textContent.trim().slice(0, 30) };
          })
          .filter((x) => x.lh < 1.5)
          .slice(0, 5), { sel: cfg.text, root });
      expect(bad, 'body line-height under 1.5').toEqual([]);
    });

    test('keyboard focus is visible on links and buttons', async ({ page }) => {
      await open(page, cfg);
      const root = await rootSel(page, cfg);
      const seen = { a: null, button: null };
      for (let i = 0; i < 120 && (!seen.a || !seen.button); i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate((root) => {
          const el = document.activeElement;
          if (!el || !el.closest(root)) return null;
          const kind = el.tagName === 'A' ? 'a' : el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' ? 'button' : null;
          if (!kind) return null;
          const cs = getComputedStyle(el);
          const ow = parseFloat(cs.outlineWidth) || 0;
          return {
            kind,
            label: (el.textContent || '').trim().slice(0, 30),
            outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
            visible: cs.outlineStyle !== 'none' && ow >= 2,
          };
        }, root);
        if (info && !seen[info.kind]) seen[info.kind] = info;
      }
      expect(seen.a, 'reached a link inside the page root by keyboard').not.toBeNull();
      expect(seen.button, 'reached a button inside the page root by keyboard').not.toBeNull();
      for (const k of /** @type {const} */ (['a', 'button'])) {
        const s = seen[k];
        if (s) expect(s.visible, `${k} "${s.label}" focus outline: ${s.outline}`).toBe(true);
      }
    });

    test('touch targets are at least 44px on a phone', async ({ page }) => {
      await open(page, cfg, PHONE);
      const root = await rootSel(page, cfg);
      // Open the mobile TOC if it is collapsed, so its links can be measured.
      const toggle = page.locator(`${root} button[aria-expanded="false"]`).first();
      if (await toggle.count()) await toggle.click().catch(() => {});
      await page.waitForTimeout(400);
      const res = await page.evaluate(({ sel, root }) => {
        const els = [...document.querySelectorAll(sel.replaceAll('ROOT', root))].filter((e) => {
          if (!e.getClientRects().length) return false;
          const cs = getComputedStyle(e);
          if (cs.visibility === 'hidden' || cs.display === 'none') return false;
          // Inline links inside running text are exempt.
          if (e.tagName === 'A' && e.closest('p, li, td') && !e.classList.contains('btn')) return false;
          return true;
        });
        const small = els
          .map((e) => {
            const r = e.getBoundingClientRect();
            return { tag: e.tagName.toLowerCase(), label: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
          })
          .filter((x) => x.w < 44 || x.h < 44);
        return { count: els.length, small: small.slice(0, 10) };
      }, { sel: cfg.targets, root });
      expect(res.count, 'found interactive targets').toBeGreaterThan(0);
      expect(res.small, 'targets under 44x44px at 390px').toEqual([]);
    });

    test('at most one element animates on load', async ({ page }) => {
      await page.addInitScript(() => {
        const hits = new Map();
        const key = (el) =>
          el && el.tagName
            ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).trim().split(/\s+/).slice(0, 3).join('.')}`
            : 'unknown';
        const note = (el, how) => {
          if (!el || !el.isConnected) return;
          if (el.closest && el.closest('.animate-spin')) return; // loading spinners are not entrance motion
          hits.set(el, `${key(el)} [${how}]`);
        };
        const t0 = performance.now();
        const poll = setInterval(() => {
          for (const a of document.getAnimations()) {
            const t = a.effect && a.effect.target;
            const iter = a.effect && a.effect.getTiming ? a.effect.getTiming().iterations : 1;
            if (iter === Infinity) continue;
            note(t, a.constructor.name);
          }
          if (performance.now() - t0 > 3000) clearInterval(poll);
        }, 30);
        // JS tweens (framer-motion) write opacity/transform into inline style.
        const start = () => {
          new MutationObserver((muts) => {
            if (performance.now() - t0 > 3000) return;
            for (const m of muts) {
              const el = /** @type {HTMLElement} */ (m.target);
              const old = m.oldValue || '';
              const now = el.getAttribute('style') || '';
              const prop = (s, p) => (s.match(new RegExp(p + '\\s*:\\s*([^;]+)')) || [])[1];
              if ((prop(old, 'opacity') !== prop(now, 'opacity') && (prop(old, 'opacity') || prop(now, 'opacity'))) ||
                  (prop(old, 'transform') !== prop(now, 'transform') && (prop(old, 'transform') || prop(now, 'transform')))) {
                note(el, 'inline-style tween');
              }
            }
          }).observe(document.documentElement, { attributes: true, attributeFilter: ['style'], attributeOldValue: true, subtree: true });
        };
        if (document.documentElement) start();
        else document.addEventListener('DOMContentLoaded', start);
        // @ts-ignore
        window.__animatedOnLoad = () => [...new Set(hits.values())];
      });
      await page.setViewportSize(DESKTOP);
      await page.goto(cfg.url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector(cfg.ready, { timeout: 20000 });
      await page.waitForTimeout(3200);
      // @ts-ignore
      const animated = await page.evaluate(() => window.__animatedOnLoad());
      expect(animated.length, `elements animated on load: ${JSON.stringify(animated.slice(0, 12))}`).toBeLessThanOrEqual(1);
    });

    test('body text contrast is at least 4.5:1', async ({ page }) => {
      await open(page, cfg);
      const root = await rootSel(page, cfg);
      const res = await page.evaluate(({ sel, root, isPost }) => {
        const parse = (c) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return { r, g, b, a };
        };
        const lum = ({ r, g, b }) => {
          const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bgOf = (el) => {
          for (let n = el; n; n = n.parentElement) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0.5) return c;
          }
          return { r: 255, g: 255, b: 255, a: 1 };
        };
        const ratio = (el) => {
          const fg = parse(getComputedStyle(el).color);
          const bg = bgOf(el);
          if (!fg) return 0;
          const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
        };
        const body = [...document.querySelectorAll(sel.replaceAll('ROOT', root))]
          .filter((e) => e.getClientRects().length && (e.textContent || '').trim().length > 40)
          .map((e) => ({ text: e.textContent.trim().slice(0, 30), ratio: ratio(e) }))
          .filter((x) => x.ratio < 4.5)
          .slice(0, 5);
        const cta = isPost
          ? [...document.querySelectorAll('.btn-cta')]
              .filter((e) => e.getClientRects().length)
              .map((e) => ({ text: e.textContent.trim().slice(0, 30), ratio: ratio(e) }))
              .filter((x) => x.ratio < 4.5)
              .slice(0, 3)
          : [];
        return { body, cta };
      }, { sel: cfg.text, root, isPost: cfg.name === 'post' });
      expect(res.body, 'body text under 4.5:1').toEqual([]);
      expect(res.cta, 'buy-button label under 4.5:1').toEqual([]);
    });
  });
}
