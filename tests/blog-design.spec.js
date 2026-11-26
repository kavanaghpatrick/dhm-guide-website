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
 *       .post-meta               "Published|Updated <date in words> · N min read" (no date in the H1)
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
    hooks: ['[data-blog="post"]', 'article.post', 'h1.post-title', 'p.post-lead', '.post-meta', '.article-body', 'nav.post-toc', 'section.post-related'],
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
      // Post: the one button near the top is the "Contents" <summary>, which
      // only shows below 1024px (the desktop rail is plain links).
      await open(page, cfg, cfg.name === 'post' ? PHONE : DESKTOP);
      const root = await rootSel(page, cfg);
      const seen = { a: null, button: null };
      for (let i = 0; i < 120 && (!seen.a || !seen.button); i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate((root) => {
          const el = document.activeElement;
          if (!el || !el.closest(root)) return null;
          // A <summary> is the native disclosure button (the post TOC).
          const kind = el.tagName === 'A' ? 'a' : ['BUTTON', 'SUMMARY'].includes(el.tagName) || el.getAttribute('role') === 'button' ? 'button' : null;
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
      await page.evaluate((root) => document.querySelectorAll(`${root} details.contents`).forEach((d) => { d.open = true; }), root);
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

/**
 * POST HEADER + TABLE OF CONTENTS (owner-selected design, 26 Nov 2026).
 *
 *   .post-head                 one header block (a div, never <header>)
 *     .post-eyebrow            category label
 *     h1.post-title
 *     p.post-lead              standfirst from the excerpt
 *     p.post-meta              exactly "Published <date> · N min read" (never edited) or
 *                              "Updated <date> · N min read" (dateModified after date)
 *     p.post-disclosure        affiliate pages only, small quiet print
 *     hr.post-rule             the hairline that closes the header
 *   details.contents           below 1024px: collapsed native "Contents" block
 *   .post-main > .post-answer  Quick answer card, first block of the article column
 *                              (level with the top of the rail), only when the post has one
 *   nav.post-toc--rail         from 1024px: sticky docs-style rail, "On this page" label,
 *                              a 1px hairline track down the list, active link gets
 *                              .is-active (green, weight 500, 2px bar over the track)
 *
 * TOC TYPE CONTRACT (changed 26 Nov 2026, intentionally):
 *   - Desktop rail links are 14px (H3s 13px), line-height 1.4, ONE line each
 *     (white-space: nowrap + ellipsis; full heading in title/aria-label).
 *     The old ">=16px" floor no longer applies to the rail: it is a mouse-first
 *     index, not reading text, and 16px wrapped every label to two lines.
 *   - The 44px tap-target rule applies to the PHONE/TABLET details.contents
 *     links only (they stay 16px with 44px+ targets). The desktop rail is
 *     exempt because it only renders from 1024px, for pointer users.
 */
const TOC_SLUGS = ['metronidazole-and-alcohol', 'best-soups-for-hangover', 'hangover-supplements-complete-guide-what-actually-works-2025'];
const postUrl = (slug) => `${BASE}/never-hungover/${slug}`;
async function openPost(page, slug, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(postUrl(slug), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.article-body p', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
// Trust-badge language the owner has banned from the page chrome.
const BANNED = /evidence[- ]reviewed|fact[- ]checked|medically reviewed|\b\d+\s+(citations|sources cited|studies cited|references)\b/i;

test.describe('blog design: post header + table of contents', () => {
  for (const slug of TOC_SLUGS) {
    test(`header order, exact meta line, no trust badges: ${slug}`, async ({ page }) => {
      await openPost(page, slug, PHONE);
      const r = await page.evaluate((months) => {
        const head = document.querySelector('.post-head');
        const kids = head ? [...head.children].map((e) => e.className.split(/\s+/).find((c) => c.startsWith('post-')) || e.tagName.toLowerCase()) : [];
        const meta = document.querySelector('.post-head .post-meta');
        const text = meta ? meta.innerText.replace(/\s+/g, ' ').trim() : '';
        const chrome = [...document.querySelectorAll('[data-blog="post"] > *')]
          .map((e) => e.innerText).join('\n')
          .replace(document.querySelector('.article-body')?.innerText || '', '');
        return {
          kids,
          text,
          dates: (text.match(new RegExp(`\\b\\d{1,2} (${months}) \\d{4}\\b|\\b(${months}) \\d{1,2},? \\d{4}\\b`, 'g')) || []).length,
          times: meta ? meta.querySelectorAll('time').length : 0,
          headerEl: !!document.querySelector('[data-blog="post"] header'),
          disclosure: !!document.querySelector('.post-head > .post-disclosure'),
          chrome,
        };
      }, MONTHS);
      const order = ['post-eyebrow', 'post-title', 'post-lead', 'post-meta'];
      if (r.disclosure) order.push('post-disclosure');
      order.push('post-rule');
      expect(r.kids, '.post-head children in order').toEqual(order);
      expect(r.headerEl, 'post header is a div, not <header>').toBe(false);
      expect(r.text, 'meta line reads exactly "Published|Updated <date> · N min read"').toMatch(/^(Updated|Published) .+ · \d+ min read$/);
      expect(r.dates, `meta line "${r.text}" has exactly one date`).toBe(1);
      expect(r.times, 'the one date is a <time>').toBe(1);
      expect(r.chrome, 'no trust-badge language (Evidence reviewed, citation counts, Fact-checked)').not.toMatch(BANNED);
    });
  }

  test('affiliate post shows the disclosure as small quiet print', async ({ page }) => {
    await openPost(page, 'hangover-supplements-complete-guide-what-actually-works-2025', PHONE);
    const d = await page.evaluate(() => {
      const el = document.querySelector('.post-head > .post-disclosure');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { fs: parseFloat(cs.fontSize), lead: parseFloat(getComputedStyle(document.querySelector('.post-lead')).fontSize) };
    });
    expect(d, 'disclosure rendered in the header').not.toBeNull();
    expect(d.fs, 'smaller than the standfirst').toBeLessThan(d.lead);
  });

  test('quick answer opens the article column as a soft green panel with a left accent', async ({ page }) => {
    await openPost(page, 'hangover-supplements-complete-guide-what-actually-works-2025', DESKTOP);
    const qa = await page.evaluate(() => {
      const el = document.querySelector('.post-main > .post-answer');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        label: el.querySelector('.post-block-label')?.textContent.trim(),
        bg: cs.backgroundColor,
        bl: parseFloat(cs.borderLeftWidth),
        blc: cs.borderLeftColor,
        copies: document.querySelectorAll('.post-answer').length,
        belowRule: Math.round(el.getBoundingClientRect().top - document.querySelector('.post-rule').getBoundingClientRect().bottom),
        railDelta: Math.round(Math.abs(el.getBoundingClientRect().top - document.querySelector('nav.post-toc--rail').getBoundingClientRect().top)),
        beforeBody: !!(el.compareDocumentPosition(document.querySelector('.article-body')) & Node.DOCUMENT_POSITION_FOLLOWING),
      };
    });
    expect(qa, 'quick answer is a child of .post-main').not.toBeNull();
    expect(qa.belowRule, 'opens the article column ~30px under the header rule').toBeGreaterThanOrEqual(24);
    expect(qa.belowRule).toBeLessThanOrEqual(36);
    expect(qa.railDelta, 'top-aligned with the rail').toBeLessThanOrEqual(4);
    expect(qa.beforeBody, 'comes before the article body').toBe(true);
    expect(qa.label).toMatch(/^quick answer$/i);
    expect(qa.bg, 'tinted panel').not.toBe('rgba(0, 0, 0, 0)');
    expect(qa.bl, 'left accent border').toBeGreaterThanOrEqual(2);
    expect(qa.blc).toBe('rgb(22, 101, 52)');
    expect(qa.copies, 'rendered once').toBe(1);
  });

  for (const vp of [PHONE, { width: 768, height: 1024 }]) {
    test(`contents block at ${vp.width}px: native details, collapsed, section count, 16px links, >=44px targets`, async ({ page }) => {
      await openPost(page, 'best-soups-for-hangover', vp);
      const d = page.locator('details.contents');
      expect(await d.count(), 'one native details.contents').toBe(1);
      await expect(d).toBeVisible();
      expect(await d.evaluate((e) => e.open), 'collapsed by default').toBe(false);
      expect(await d.evaluate((e) => !!e.previousElementSibling?.classList.contains('post-head')), 'sits right after the header').toBe(true);
      expect(await page.locator('nav.post-toc--rail').isVisible(), 'no rail below 1024px').toBe(false);
      const sum = await d.locator('summary').boundingBox();
      expect(sum.height, 'summary >= 44px').toBeGreaterThanOrEqual(44);
      const s = await d.locator('summary').evaluate((e) => ({ text: e.textContent.trim(), fs: parseFloat(getComputedStyle(e).fontSize), n: document.querySelectorAll('nav.post-toc--rail > ol > li').length }));
      expect(s.text, 'plain-text section count').toBe(`Contents · ${s.n} sections`);
      expect(s.fs, 'summary 14px').toBe(14);
      await d.locator('summary').click();
      const r = await page.evaluate(() => {
        const links = [...document.querySelectorAll('details.contents a')].filter((a) => a.getClientRects().length);
        return {
          count: links.length,
          bad: links.map((a) => {
            const b = a.getBoundingClientRect(); const cs = getComputedStyle(a);
            return { t: a.textContent.trim().slice(0, 30), fs: parseFloat(cs.fontSize), h: Math.round(b.height), brace: /\{#/.test(a.textContent) };
          }).filter((x) => x.fs < 16 || x.h < 44 || x.brace),
        };
      });
      expect(r.count, 'contents links render').toBeGreaterThan(3);
      expect(r.bad, 'links >=16px, >=44px tall, no {#id} residue').toEqual([]);
    });
  }

  for (const width of [1024, 1366]) {
    test(`docs rail at ${width}px: sticky, no box, hairline track, 14px one-line links, active bar after scroll, H3s only under active H2`, async ({ page }) => {
      await openPost(page, 'best-soups-for-hangover', { width, height: 900 });
      expect(await page.locator('details.contents').isVisible(), 'no contents block on desktop').toBe(false);
      const r = await page.evaluate(() => {
        const nav = document.querySelector('nav.post-toc--rail');
        const all = [nav, ...nav.querySelectorAll('*')];
        const links = [...nav.querySelectorAll('a')].filter((a) => a.getClientRects().length);
        const list = nav.querySelector(':scope > ol');
        const lcs = getComputedStyle(list);
        const labelCs = getComputedStyle(nav.querySelector('.post-toc__label'));
        return {
          sticky: getComputedStyle(nav).position,
          label: nav.querySelector('.post-toc__label')?.textContent.trim(),
          labelFs: parseFloat(labelCs.fontSize),
          labelAboveTrack: nav.querySelector('.post-toc__label').getBoundingClientRect().bottom <= list.getBoundingClientRect().top,
          track: { w: parseFloat(lcs.borderLeftWidth), style: lcs.borderLeftStyle, color: lcs.borderLeftColor },
          boxed: all.filter((e) => { const cs = getComputedStyle(e); return cs.boxShadow !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'; }).map((e) => e.className || e.tagName),
          bad: links.map((a) => {
            const cs = getComputedStyle(a);
            const fs = parseFloat(cs.fontSize);
            const lhPx = parseFloat(cs.lineHeight);
            const textH = a.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
            return {
              t: a.textContent.trim().slice(0, 30), fs, lh: +(lhPx / fs).toFixed(2),
              lines: Math.round(textH / lhPx),
              titled: a.title.length >= a.textContent.trim().length && a.getAttribute('aria-label') === a.title,
            };
          }).filter((x) => x.fs !== 14 || x.lh !== 1.4 || x.lines !== 1 || !x.titled || /\{#/.test(x.t)),
          h3Visible: [...nav.querySelectorAll('ol ol a')].filter((a) => a.getClientRects().length).length,
          railRight: nav.getBoundingClientRect().right,
          bodyLeft: document.querySelector('.article-body').getBoundingClientRect().left,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(r.sticky).toBe('sticky');
      expect(r.label).toMatch(/^on this page$/i);
      expect(r.labelFs, '"On this page" label is 11px').toBe(11);
      expect(r.labelAboveTrack, 'label sits above the track').toBe(true);
      expect(r.track, '1px hairline track on the list').toEqual({ w: 1, style: 'solid', color: 'rgb(231, 227, 219)' });
      expect(r.boxed, 'no box, shadow or background anywhere in the rail').toEqual([]);
      expect(r.bad, 'rail links 14px, line-height 1.4, one line, full text in title + aria-label').toEqual([]);
      expect(r.railRight, 'rail sits left of the reading column').toBeLessThanOrEqual(r.bodyLeft);
      expect(r.overflow, 'no horizontal page scroll').toBe(false);
      expect(r.h3Visible, 'no H3s shown before any section is active').toBe(0);

      // Scroll to an H2 that has H3 children.
      const target = await page.evaluate(() => {
        const li = [...document.querySelectorAll('nav.post-toc--rail > ol > li')].find((l) => l.querySelector('ol'));
        return li?.querySelector('a').getAttribute('href').slice(1);
      });
      expect(target, 'a section with H3 children').toBeTruthy();
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' });
      }, target);
      await page.waitForTimeout(600);
      const a = await page.evaluate((id) => {
        const link = document.querySelector(`nav.post-toc--rail a[href="#${id}"]`);
        const cs = getComputedStyle(link);
        const visibleSubs = [...document.querySelectorAll('nav.post-toc--rail ol ol')].filter((o) => o.getClientRects().length);
        const list = document.querySelector('nav.post-toc--rail > ol');
        return {
          cls: link.className,
          color: cs.color,
          weight: cs.fontWeight,
          bar: parseFloat(cs.borderLeftWidth),
          barColor: cs.borderLeftColor,
          barOnTrack: link.getBoundingClientRect().left - list.getBoundingClientRect().left,
          oneLine: Math.round((link.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / parseFloat(cs.lineHeight)),
          subsVisible: visibleSubs.length,
          subsUnderActive: visibleSubs.every((o) => o.parentElement.contains(link)),
        };
      }, target);
      expect(a.cls, 'active class after scrolling').toContain('is-active');
      expect(a.color, 'active link is green').toBe('rgb(22, 101, 52)');
      expect(a.weight, 'active link is weight 500').toBe('500');
      expect(a.oneLine, 'bolder active label still one line (no reflow)').toBe(1);
      expect(a.bar, '2px left accent').toBe(2);
      expect(a.barColor).toBe('rgb(22, 101, 52)');
      expect(a.barOnTrack, 'bar starts exactly on the 1px track').toBe(0);
      expect(a.subsVisible, 'only the active section shows its H3s').toBe(1);
      expect(a.subsUnderActive).toBe(true);
    });
  }
});

/* Typography: the blog uses the same native system stack as the rest of the
 * site. The real invariant is cross-page consistency: the post H1 and body text
 * resolve to the same font-family as the /reviews H1 and body text. */
test.describe('blog design: typography matches the rest of the site', () => {
  const fontsOf = (page) =>
    page.evaluate(() => {
      const ff = (el) => (el ? getComputedStyle(el).fontFamily.replace(/["']/g, "") : null); // quoting differs, families do not
      return { h1: ff(document.querySelector('main h1')), p: ff(document.querySelector('main p')) };
    });

  test('post H1 and body use the same system font as /reviews', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE}/reviews`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main h1', { timeout: 20000 });
    const site = await fontsOf(page);
    await openPost(page, 'dry-january', DESKTOP);
    const blog = await fontsOf(page);
    expect(blog.h1, 'post H1 leads with the system stack').toMatch(/^-apple-system,/);
    expect(blog.h1, 'post H1 font matches /reviews H1').toBe(site.h1);
    expect(blog.p, 'post body font matches /reviews body').toBe(site.p);
    const webFonts = await page.evaluate(() => [...document.fonts].map((f) => f.family));
    expect(webFonts.filter((f) => /fraunces|inter/i.test(f)), 'no Fraunces/Inter web fonts are declared').toEqual([]);
  });

  for (const slug of ['dry-january', 'metronidazole-and-alcohol']) {
    test(`long post title fits the 390px column without clipping: ${slug}`, async ({ page }) => {
      await openPost(page, slug, PHONE);
      const t = await page.evaluate(() => {
        const h = document.querySelector('h1.post-title');
        const cs = getComputedStyle(h);
        return { lines: Math.round(h.getBoundingClientRect().height / parseFloat(cs.lineHeight)), over: h.scrollWidth - h.clientWidth };
      });
      expect(t.over, 'title does not overflow horizontally').toBeLessThanOrEqual(0);
      expect(t.lines, 'title wraps to a sane number of lines').toBeLessThanOrEqual(4);
    });
  }
});
