// @ts-check
/**
 * Money-page acceptance contract (written RED, before the money-page rework).
 *
 * Scope: the five money routes (/reviews, /compare, /guide, /dhm-dosage-calculator, /)
 * and the eight commerce posts under /never-hungover/. Sources for every rule:
 *   - design audit and commerce-post audit, 2026-11-26
 *   - PostHog conversion read, Oct 27 to Nov 26 (47 of 57 Amazon clicks happened in the
 *     top 20% of the page, hence the "first commerce link within 1.5 screens" rule)
 *   - the owner's writing standard (banned phrases and patterns, enforced mechanically
 *     below so slop fails the suite rather than relying on review)
 *   - the owner's taste rules (system fonts only, no trust badges, no invented numbers,
 *     buy buttons at 4.5:1 contrast, no urgency copy)
 *
 * The modern variant is forced on every page (localStorage + query param), because the
 * suite must test the page real users get. Once the A/B wrapper is deleted the override
 * is a harmless no-op.
 *
 * Everything runs once, in the desktop "chromium" project, with the viewport set to
 * 390x844 (a phone) where the rule is about phones. The Pixel 5 project is skipped so the
 * red count is not doubled.
 *
 * Static checks (post JSON) need no browser and read files directly.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const EXPERIMENT_KEY = 'site-modern-v1';
const PRODUCTS = JSON.parse(readFileSync(new URL('../src/data/topProducts.json', import.meta.url), 'utf8'));
const PHONE = { width: 390, height: 844 };

// ── Pages ──────────────────────────────────────────────────────────────────────

/** Commerce posts. `buyIntent: false` marks the two question-intent posts where the
 *  audit judged a late product placement correct (a reader standing in a pharmacy, or
 *  asking whether pills work at all), so the 1.5-screen rule does not apply to them. */
const POSTS = [
  { slug: 'dhm-dosage-guide-2025', buyIntent: true },
  { slug: 'best-dhm-supplements', buyIntent: true },
  { slug: 'where-to-buy-dhm', buyIntent: true },
  { slug: 'dhm-price-per-mg-compared', buyIntent: true },
  { slug: 'best-hangover-pills', buyIntent: true },
  { slug: 'best-hangover-products-amazon', buyIntent: true },
  { slug: 'hangover-pills-at-cvs-walgreens', buyIntent: false },
  { slug: 'do-hangover-pills-actually-work', buyIntent: false },
];

/** `cta` is what counts as the page's first commerce link:
 *   amazon   an Amazon product link
 *   funnel   an Amazon link, or a link to /reviews or /compare (pages that sell no
 *            product directly, like /guide)
 *   none     the 1.5-screen rule is checked elsewhere (the calculator's next step
 *            appears only after a result) */
const PAGES = [
  { path: '/reviews', name: 'reviews', cta: 'amazon' },
  { path: '/compare', name: 'compare', cta: 'amazon' },
  { path: '/guide', name: 'guide', cta: 'funnel' },
  { path: '/dhm-dosage-calculator', name: 'calculator', cta: 'none' },
  { path: '/', name: 'home', cta: 'amazon' },
  ...POSTS.map((p) => ({
    path: `/never-hungover/${p.slug}`,
    name: `post:${p.slug}`,
    cta: p.buyIntent ? 'amazon' : 'none',
  })),
];

// ── Phrase lists ───────────────────────────────────────────────────────────────

/** The writing standard's banned phrases, as case-insensitive regexes. Where the
 *  standard bans a word only in one sense ("leverage" as a verb, "comprehensive" as
 *  self-praise, "elevate" as hype rather than "elevated liver enzymes"), the regex is
 *  narrowed to that sense. */
const BANNED_PHRASES = [
  /\bdelv(e|es|ing)\b/i,
  /\bdive into\b/i,
  /\blet'?s dive\b/i,
  /\bunlock(s|ing)?\b/i,
  /\bunleash(es|ing)?\b/i,
  /\belevat(e|es|ing)\b(?! (liver|enzyme|blood|heart|risk|levels?))/i,
  /\bgame[- ]chang(er|ers|ing)\b/i,
  /\blet'?s face it\b/i,
  /\bin today'?s (fast[- ]paced )?world\b/i,
  /\bit'?s important to note\b/i,
  /\bit'?s worth noting\b/i,
  /\bwhether you'?re an? \w+(?: \w+)? or an?\b/i,
  /\blook no further\b/i,
  /\bthe ultimate guide\b/i,
  /\byour go-to\b/i,
  /\bseamless(ly)?\b/i,
  /\brobust\b/i,
  /\b(to |we |you |they )leverage\b|\bleverag(es|ed|ing)\b/i,
  /\bholistic\b/i,
  /\bsynerg(y|ies|istic|istically)\b/i,
  /\bthat'?s where .{1,40} comes in\b/i,
  /\bhere'?s the kicker\b/i,
  /\bthe best part\?/i,
  /\bbut here'?s the thing\b/i,
  /\bno[- ]fluff\b/i,
  /\bno-nonsense\b/i,
  /\bscience[- ]backed\b/i,
  /\bclinically[- ]proven\b/i,
  /\b(our|this|the most) comprehensive\b|\bcomprehensive (guide|comparison|review|reviews|analysis|breakdown|overview|resource)\b/i,
  /\barsenal\b/i,
  /\bsecret weapon\b/i,
  /\bprimary weapon\b/i,
  /\bpro tip\b/i,
  /\bevidence[- ]reviewed\b/i,
  /\bfact[- ]checked\b/i,
  /\bexpert[- ]verified\b/i,
  // Verbal tic the post audit found opening all seven commerce posts.
  /\bthe honest answer first\b/i,
];

/** Trust-badge slop and unverifiable credibility claims. Credibility has to come from
 *  specific writing, not chips. "Lab-tested" and "independently tested" are also false:
 *  there is no lab data anywhere in the repo. */
const BANNED_BADGES = [
  /\bevidence[- ]reviewed\b/i,
  /\bfact[- ]checked\b/i,
  /\bexpert[- ]verified\b/i,
  /\bdoctor[- ]approved\b/i,
  /\b\d[\d,]*\+?\s+(citations|studies cited|sources cited|references)\b/i,
  /\blab[- ]tested\b/i,
  /\bindependently tested\b/i,
  /\bthird[- ]party lab\b/i,
  /\bwe test the brands\b/i,
  /\bclinically[- ]proven\b/i,
];

/** Urgency-scam copy. */
const URGENCY = /order within|same-day|hurry|URGENT/i;

/** Numbers the audit found with no source behind them, plus the fabricated
 *  testimonials and the exit-intent popup. Each was seen on a money page. */
const INVENTED_CLAIMS = [
  /\b15,?000\+|\b15k\+/i,
  /\b20\+ brands\b/i,
  /\b5,?000\+ reviews\b/i,
  /\b20,?000\+ reviews\b/i,
  /\b6 months (of )?testing\b/i,
  /\b70% faster\b/i,
  /\bup to 70%/i,
  /\bup to 60%/i,
  /~?70% reduction\b/i,
  /\bvalued at \$\d/i,
  /\breal-time price/i,
  /\b15\+ comparison points\b/i,
  /\b1,?000\+ years\b/i,
  /\bworks within 30 minutes\b/i,
  /\b\d[\d,]*\+? (happy|hangover-free) users\b/i,
  /\b(Mike|Sarah|James|John),? Age \d/i,
  /\bSarah M\.|\bJohn K\./,
  /\bWait! Don'?t Leave/i,
  /\bstop hangovers forever\b/i,
  /\bnever wake up hungover\b/i,
  /\bthat actually work\b/i,
];

/** Hedging stacks ("may potentially help support"). */
const HEDGE_STACKS = /\b(may|might|could) (potentially|possibly)\b|\bpotentially help\b|\bhelp(s)? (to )?support\b/i;

/** Pictographs. ©, ® and ™ are Extended_Pictographic in Unicode but are not emoji in
 *  practice; ★ is allowed only in rendered rating UI, never in article copy. */
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;
const EMOJI_RENDERED = /(?![©®™★])\p{Extended_Pictographic}/u;

function findAll(text, patterns) {
  const hits = [];
  for (const re of patterns) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of text.matchAll(g)) {
      const at = m.index ?? 0;
      // A phrase quoted in order to criticise it ("doctor-approved cure" are signs of a
      // seller stretching) is not the site making the claim.
      if (/["\u201c]$/.test(text.slice(Math.max(0, at - 1), at))) continue;
      hits.push(`${re} -> "...${text.slice(Math.max(0, at - 40), at + m[0].length + 40).replace(/\s+/g, ' ')}..."`);
    }
  }
  return hits;
}

// ── Post JSON helpers ──────────────────────────────────────────────────────────

function loadPost(slug) {
  return JSON.parse(readFileSync(new URL(`../src/newblog/data/posts/${slug}.json`, import.meta.url), 'utf8'));
}

/** Every reader-visible string in a post (content, title, excerpt, meta, FAQ, howTo).
 *  Keys and ids are left out. */
function postStrings(post) {
  const out = [];
  const skip = new Set(['id', 'slug', 'image', 'date', 'relatedPosts', 'tags', 'readTime']);
  const walk = (v, key) => {
    if (skip.has(key)) return;
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x, ''));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(post, '');
  return out.join('\n\n');
}

/** Prose paragraphs of a markdown body: no headings, tables, lists, quotes or markers. */
function proseParagraphs(md) {
  return md
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^(#|\||[-*+] |\d+\. |>|\{\{|<!--|```)/.test(p));
}

// ── Browser helpers ────────────────────────────────────────────────────────────

async function open(page, path) {
  await page.addInitScript((key) => {
    try { localStorage.setItem(`exp_${key}`, 'modern'); } catch { /* storage blocked */ }
  }, EXPERIMENT_KEY);
  const sep = path.includes('?') ? '&' : '?';
  await page.goto(`${path}${sep}exp_${EXPERIMENT_KEY}=modern`);
  await page.waitForLoadState('domcontentloaded');
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1200);
}

async function pageText(page) {
  return page.evaluate(() => document.body.innerText);
}

/** Converts any CSS color (oklch, color-mix, hex) to [r,g,b,a] via a 1x1 canvas, and
 *  computes WCAG contrast of every visible Amazon link against its painted background.
 *  For gradient backgrounds the worst color stop is used. */
async function amazonLinkContrast(page) {
  return page.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const rgba = (c) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const backgrounds = (el) => {
      for (let n = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        const img = cs.backgroundImage;
        if (img && img !== 'none' && /gradient/.test(img)) {
          const stops = img.match(/(rgba?|oklch|oklab|lab|lch|hsla?|color)\([^()]*(\([^()]*\)[^()]*)*\)|#[0-9a-f]{3,8}\b/gi) || [];
          const cols = stops.map(rgba).filter((c) => c[3] > 0.5);
          if (cols.length) return cols;
        }
        const bg = rgba(cs.backgroundColor);
        if (bg[3] > 0.5) return [bg];
      }
      return [[255, 255, 255, 1]];
    };
    const out = [];
    for (const a of document.querySelectorAll('a[href*="amazon."]')) {
      const r = a.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(a).visibility === 'hidden') continue;
      const fg = rgba(getComputedStyle(a).color);
      const worst = Math.min(...backgrounds(a).map((bg) => ratio(fg, bg)));
      out.push({ text: (a.innerText || '').trim().slice(0, 40), ratio: Math.round(worst * 100) / 100 });
    }
    return out;
  });
}

// ── Rendered-page contracts ────────────────────────────────────────────────────

test.describe('Money pages — rendered contract', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Runs once; viewport is set per test.');
    await page.setViewportSize(PHONE);
  });

  /** Reference h1 font from /reviews, read once per worker. */
  let reviewsH1Font = '';

  for (const pg of PAGES) {
    test.describe(pg.name, () => {
      if (pg.cta !== 'none') {
        test('first commerce link sits within 1.5 screens at 390px', async ({ page }) => {
          await open(page, pg.path);
          const sel = pg.cta === 'amazon'
            ? 'a[href*="amazon."]'
            : 'a[href*="amazon."], a[href^="/reviews"], a[href^="/compare"]';
          const firstTop = await page.evaluate((s) => {
            const tops = [...document.querySelectorAll(s)]
              .filter((a) => !a.closest('header, nav, footer'))
              .map((a) => a.getBoundingClientRect())
              .filter((r) => r.width && r.height)
              .map((r) => r.top + window.scrollY);
            return tops.length ? Math.min(...tops) : null;
          }, sel);
          expect(firstTop, `no visible ${pg.cta} link in the page body`).not.toBeNull();
          expect(firstTop, `first ${pg.cta} link is at ${firstTop}px; limit is ${1.5 * PHONE.height}px`)
            .toBeLessThanOrEqual(1.5 * PHONE.height);
        });
      }

      test('Amazon links have at least 4.5:1 text contrast', async ({ page }) => {
        await open(page, pg.path);
        const links = await amazonLinkContrast(page);
        const failing = links.filter((l) => l.ratio < 4.5);
        expect(failing, `${failing.length} of ${links.length} Amazon links under 4.5:1`).toEqual([]);
      });

      test('every Amazon link carries tag=dhmguide-20 and none is an amzn.to short link', async ({ page }) => {
        await open(page, pg.path);
        const hrefs = await page.evaluate(() =>
          [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || ''));
        const shortLinks = hrefs.filter((h) => /amzn\.to\//i.test(h));
        const untagged = hrefs.filter((h) => /amazon\.com/i.test(h) && !/[?&]tag=dhmguide-20\b/.test(h));
        expect(shortLinks, 'amzn.to links found').toEqual([]);
        expect(untagged, 'Amazon links without tag=dhmguide-20').toEqual([]);
      });

      test('no urgency copy, trust badges, invented numbers or banned phrases', async ({ page }) => {
        await open(page, pg.path);
        const text = await pageText(page);
        expect(findAll(text, [URGENCY]), 'urgency copy').toEqual([]);
        expect(findAll(text, BANNED_BADGES), 'trust-badge phrases').toEqual([]);
        expect(findAll(text, INVENTED_CLAIMS), 'invented numbers / fake testimonials').toEqual([]);
        expect(findAll(text, BANNED_PHRASES), 'writing-standard banned phrases').toEqual([]);
        expect(findAll(text, [HEDGE_STACKS]), 'hedging stacks').toEqual([]);
      });

      test('no emoji in headings or body copy', async ({ page }) => {
        await open(page, pg.path);
        const hits = await page.evaluate((src) => {
          const re = new RegExp(src, 'u');
          return [...document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main td, main th, main button, main a')]
            .map((el) => el.innerText || '')
            .filter((t) => re.test(t))
            .map((t) => t.trim().slice(0, 80));
        }, EMOJI_RENDERED.source);
        expect(hits).toEqual([]);
      });

      test('no "In conclusion" or "Final thoughts" headings', async ({ page }) => {
        await open(page, pg.path);
        const heads = await page.evaluate(() =>
          [...document.querySelectorAll('main h2, main h3')].map((h) => h.innerText.trim()));
        expect(heads.filter((h) => /^(in conclusion|final thoughts|conclusion)\b/i.test(h))).toEqual([]);
      });

      test('orange buy styling is used only on Amazon links', async ({ page }) => {
        // Extends tier1-orange-discipline: orange means "buy on Amazon". The audit found
        // orange .btn-cta on internal links on /guide (6) and home (hero + closing band).
        await open(page, pg.path);
        const offenders = await page.evaluate(() =>
          [...document.querySelectorAll('.btn-cta')]
            .filter((el) => el.getBoundingClientRect().width > 0)
            .filter((el) => !/amazon\./i.test(el.getAttribute('href') || el.closest('a')?.getAttribute('href') || ''))
            .map((el) => `${el.tagName} "${(el.innerText || '').trim().slice(0, 40)}" -> ${el.getAttribute('href') || '(no href)'}`));
        expect(offenders).toEqual([]);
      });

      test('affiliate disclosure appears before the first Amazon link', async ({ page }) => {
        await open(page, pg.path);
        const r = await page.evaluate(() => {
          const links = [...document.querySelectorAll('a[href*="amazon."]')]
            .map((a) => a.getBoundingClientRect()).filter((b) => b.width && b.height)
            .map((b) => b.top + window.scrollY);
          if (!links.length) return { none: true };
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let disclosure = null;
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (/Amazon Associate|earn (a )?commission|we may earn|affiliate links?/i.test(n.textContent || '')) {
              const b = n.parentElement?.getBoundingClientRect();
              if (b && b.height) {
                const y = b.top + window.scrollY;
                if (disclosure === null || y < disclosure) disclosure = y;
              }
            }
          }
          return { firstLink: Math.min(...links), disclosure };
        });
        test.skip(!!r.none, 'page has no Amazon links');
        expect(r.disclosure, 'no affiliate disclosure found on the page').not.toBeNull();
        expect(r.disclosure, `disclosure at ${r.disclosure}px, first Amazon link at ${r.firstLink}px`)
          .toBeLessThan(r.firstLink);
      });

      test('wide comparison tables are signposted as scrollable at 390px', async ({ page }) => {
        // Signpost contract = the pattern the blog already uses for markdown tables
        // (NewBlogPost.jsx .table-scroll): the overflowing wrapper is a focusable
        // region (tabindex=0, role=region) whose aria-label says it scrolls. The page
        // body itself must never scroll sideways.
        await open(page, pg.path);
        const r = await page.evaluate(() => {
          const bad = [];
          for (const t of document.querySelectorAll('main table')) {
            if (!t.getBoundingClientRect().width) continue;
            let box = t.parentElement;
            while (box && box !== document.body && box.scrollWidth <= box.clientWidth + 1) box = box.parentElement;
            if (!box || box === document.body) continue; // table fits, nothing to signpost
            const ok = box.getAttribute('tabindex') === '0'
              && box.getAttribute('role') === 'region'
              && /scroll/i.test(box.getAttribute('aria-label') || '');
            if (!ok) bad.push(`${(t.innerText || '').trim().slice(0, 50)} (wrapper .${box.className})`);
          }
          return { bad, pageOverflow: document.scrollingElement.scrollWidth - window.innerWidth };
        });
        expect(r.pageOverflow, 'page scrolls horizontally').toBeLessThanOrEqual(1);
        expect(r.bad, 'overflowing tables with no scroll signpost').toEqual([]);
      });

      test('system fonts only: no webfont downloads, h1 uses the same stack as /reviews', async ({ page, browser }) => {
        if (!reviewsH1Font) {
          const ref = await browser.newPage({ viewport: PHONE });
          await open(ref, '/reviews');
          reviewsH1Font = await ref.locator('h1').first().evaluate((h) => getComputedStyle(h).fontFamily);
          await ref.close();
        }
        const fonts = [];
        page.on('request', (req) => { if (/\.(woff2?|ttf|otf)(\?|$)/i.test(req.url())) fonts.push(req.url()); });
        await open(page, pg.path);
        const h1Font = await page.locator('h1').first().evaluate((h) => getComputedStyle(h).fontFamily);
        expect(fonts, 'webfont files requested').toEqual([]);
        expect(h1Font, 'h1 names a webfont').not.toMatch(/Fraunces|Inter\b/i);
        expect(h1Font, 'h1 stack differs from /reviews').toBe(reviewsH1Font);
      });

      test('product doses and prices in tables match topProducts.json', async ({ page }) => {
        // Heuristic, column-aware: for every table row that names a catalog product in
        // its first cell, a column headed "price per serving" must equal pricePerServing,
        // a column headed "price" must equal price, and a dose column (DHM / dose / mg)
        // must exact-match the product's dhm string after normalising "1,000 mg" to
        // "1000mg". Columns for derived values (per 100 mg, per 500 mg dose, yearly cost)
        // are ignored.
        await open(page, pg.path);
        const rows = await page.evaluate(() => {
          const out = [];
          for (const t of document.querySelectorAll('main table')) {
            const head = [...(t.querySelector('thead tr') || t.querySelector('tr'))?.children || []]
              .map((c) => (c.innerText || '').trim());
            for (const tr of t.querySelectorAll('tbody tr')) {
              const cells = [...tr.children].map((c) => (c.innerText || '').trim());
              if (cells.length > 1) out.push({ head, cells });
            }
          }
          return out;
        });
        // DHM Depot before Double Wood: its listing names Double Wood as the brand.
        const aliases = [
          [10, /DHM Depot/i], [1, /No Days Wasted/i], [2, /Double Wood/i], [3, /Toniiq/i],
          [4, /NusaPure/i], [5, /Cheers/i], [6, /Flyby/i], [9, /Fuller Health/i],
        ];
        const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
        const mg = (s) => { const m = s.match(/(\d[\d,]*)\s*mg\b/i); return m ? `${m[1].replace(/,/g, '')}mg` : null; };
        const usd = (s) => { const m = s.match(/\$\d[\d,]*(\.\d+)?/); return m ? m[0] : null; };
        const errors = [];
        for (const { head, cells } of rows) {
          const hit = aliases.find(([, re]) => re.test(cells[0]));
          if (!hit) continue;
          const p = byId[hit[0]];
          head.forEach((h, i) => {
            const cell = cells[i] ?? '';
            if (!cell || /per 100|per mg|100 ?mg|500 ?mg|year|annual|month|per dose|per gram|total|per bottle|per container/i.test(h)) return;
            if (/per serving|\/serving|per serve/i.test(h) && /\$|price|cost/i.test(h + cell)) {
              const v = usd(cell);
              if (v && v !== p.pricePerServing) errors.push(`${p.name}: "${h}" shows ${v}, data says ${p.pricePerServing}`);
            } else if (/^(price|bottle price|price \(bottle\)|list price)$/i.test(h)) {
              const v = usd(cell);
              if (v && v !== p.price) errors.push(`${p.name}: "${h}" shows ${v}, data says ${p.price}`);
            } else if (/\b(dhm|dose|dosage)\b/i.test(h) && !/\$|price|cost/i.test(h)) {
              const v = mg(cell);
              if (v && v !== p.dhm) errors.push(`${p.name}: "${h}" shows ${v}, data says ${p.dhm}`);
            }
          });
        }
        expect(errors).toEqual([]);
      });
    });
  }

  test('reviews: every product card states its DHM dose from topProducts.json', async ({ page }) => {
    // Audit /reviews item 6: the cards never show the one number the category is about.
    await open(page, '/reviews');
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll('[data-product-name][data-product-position]')]
        .map((c) => ({ name: c.getAttribute('data-product-name'), text: c.innerText || '' })));
    expect(cards.length, 'no product cards found').toBeGreaterThan(0);
    const norm = (s) => s.replace(/(\d),(\d{3})/g, '$1$2').replace(/(\d)\s+mg\b/gi, '$1mg');
    const missing = cards
      .map((c) => ({ ...c, p: PRODUCTS.find((p) => p.name === c.name) }))
      .filter((c) => c.p && !norm(c.text).includes(c.p.dhm))
      .map((c) => `${c.name} (expects ${c.p.dhm})`);
    expect(missing).toEqual([]);
  });

  test('compare: "Most DHM per dollar" is computed from the data (NusaPure beats Double Wood)', async ({ page }) => {
    // Audit /compare item 4: dhmPerDollar was hand-typed and crowned the wrong product.
    // NusaPure: 1000mg at $0.48 a serving (about 2,083 mg per dollar). Double Wood:
    // 1000mg at $0.80 (1,250 mg per dollar).
    await open(page, '/compare?products=2,4');
    const card = page.locator('h3', { hasText: /^Best Value$/ }).locator('xpath=ancestor::*[contains(@class,"card")][1]');
    await expect(card).toContainText(/NusaPure/i);
  });

  test('calculator: a result shows a dose in mg and a next step to a product', async ({ page }) => {
    // Audit calculator item 1: after "350 mg" the page dead-ends. The result block
    // (#results) must show the dose and at least one visible link onward: an Amazon
    // product link, /reviews or /compare.
    await open(page, '/dhm-dosage-calculator');
    await page.getByRole('button', { name: /Calculate My Personalized Dosage/i }).click();
    const results = page.locator('#results');
    await expect(results).toBeVisible({ timeout: 8000 });
    await expect(results).toContainText(/\d{2,4}\s?mg/i, { timeout: 8000 });
    const next = results.locator('a[href*="amazon."], a[href^="/reviews"], a[href^="/compare"]');
    await expect(next.first(), 'no product or comparison link inside the result').toBeVisible();
  });

  test('calculator: no dead buttons in the result area', async ({ page }) => {
    // Audit calculator item 2: "Alcohol Unit Converter" / "BAC Calculator" are buttons
    // with no handler. Anything that looks clickable must go somewhere.
    await open(page, '/dhm-dosage-calculator');
    const dead = await page.getByRole('button', { name: /alcohol unit converter|bac calculator/i }).count();
    expect(dead).toBe(0);
  });
});

// ── Post JSON contracts (static, no browser) ──────────────────────────────────

test.describe('Commerce posts — source contract', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Static checks run once.');
  });

  for (const { slug } of POSTS) {
    test.describe(slug, () => {
      const post = loadPost(slug);
      const all = postStrings(post);
      const body = post.content || '';

      test('no amzn.to links; every Amazon link is tagged dhmguide-20', () => {
        expect(all.match(/https?:\/\/amzn\.to\/\S+/gi) || []).toEqual([]);
        const amazon = all.match(/https?:\/\/(www\.)?amazon\.com\/[^\s)"'\]]+/gi) || [];
        expect(amazon.filter((u) => !/[?&]tag=dhmguide-20\b/.test(u))).toEqual([]);
      });

      test('no banned phrases, badges, urgency, invented numbers or hedging stacks', () => {
        expect(findAll(all, BANNED_PHRASES), 'banned phrases').toEqual([]);
        expect(findAll(all, BANNED_BADGES), 'badge phrases').toEqual([]);
        expect(findAll(all, [URGENCY]), 'urgency copy').toEqual([]);
        expect(findAll(all, INVENTED_CLAIMS), 'invented numbers').toEqual([]);
        expect(findAll(all, [HEDGE_STACKS]), 'hedging stacks').toEqual([]);
      });

      test('no emoji', () => {
        const hits = all.split('\n').filter((l) => EMOJI.test(l)).map((l) => l.slice(0, 80));
        expect(hits).toEqual([]);
      });

      test('at most one em dash per paragraph', () => {
        const heavy = proseParagraphs(body).filter((p) => (p.match(/—/g) || []).length > 1).map((p) => p.slice(0, 80));
        expect(heavy).toEqual([]);
      });

      test('lists do not bold-lead every item', () => {
        const LABEL_LEAD = /^\s*([-*+]|\d+\.)\s+\*\*[^*]+?([:.]\*\*|\*\*\s*[:.\u2014-])/;
        // The banned pattern is a run of 3+ list items that all open with a bold label
        // followed by its explanation ("**Speed**: it works fast", "**Speed.** It..."). A
        // bold product name followed by ordinary prose is not a label and is allowed, as
        // are the Pros / Cons / Best for blocks the post audit judged fine.
        const runs = [];
        let run = [];
        for (const line of body.split('\n')) {
          if (/^\s*([-*+]|\d+\.)\s+/.test(line)) run.push(line);
          else if (line.trim()) { if (run.length) runs.push(run); run = []; }
        }
        if (run.length) runs.push(run);
        const bad = runs
          .filter((r) => r.length >= 3 && r.every((l) => LABEL_LEAD.test(l)))
          .filter((r) => !r.every((l) => /^\s*([-*+]|\d+\.)\s+\*\*(pros|cons|best for|skip it if|skip if|who it'?s for)\b/i.test(l)))
          .map((r) => r[0].trim().slice(0, 80));
        expect(bad).toEqual([]);
      });

      test('does not open with a rhetorical question', () => {
        const first = proseParagraphs(body)[0] || '';
        const sentence = (first.replace(/\*\*/g, '').match(/^[^.!?]*[.!?]/) || [''])[0];
        expect(sentence.trim().endsWith('?'), `opens with: "${sentence}"`).toBe(false);
      });

      test('no triadic punch (three clipped sentences in a row)', () => {
        const triads = [];
        for (const p of proseParagraphs(body)) {
          const s = p.replace(/\*\*/g, '').split(/(?<=[.!?])\s+/);
          for (let i = 0; i + 2 < s.length; i++) {
            const short = (x) => x.trim().split(/\s+/).length <= 4 && /[.!?]$/.test(x.trim());
            if (short(s[i]) && short(s[i + 1]) && short(s[i + 2])) triads.push(s.slice(i, i + 3).join(' '));
          }
        }
        expect(triads).toEqual([]);
      });

      test('no "In conclusion" / "Final thoughts" headings', () => {
        expect(body.match(/^#{2,4}\s*(in conclusion|final thoughts|conclusion)\b.*$/gim) || []).toEqual([]);
      });

      test('"honest" is not a verbal tic (2 uses at most)', () => {
        // The post audit counted 4 to 7 uses of "honest" in each of seven posts
        // ("Honest verdict", "Our Honest Bottom Line", "Here's the honest catch").
        const n = (all.match(/\bhonest(ly)?\b/gi) || []).length;
        expect(n).toBeLessThanOrEqual(2);
      });
    });
  }
});
