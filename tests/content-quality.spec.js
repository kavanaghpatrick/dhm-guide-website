// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * TDD HARNESS for the content roadmap (STRATEGY.md).
 *
 * Content is built test-first: add a new pillar/money post's slug to
 * NEW_CONTENT (or pass CONTENT_SLUGS=a,b), and these invariants define "done".
 * They are RED until the post exists and satisfies every SEO / depth / funnel /
 * health-content-compliance rule below — then the post ships GREEN.
 *
 *   CONTENT_SLUGS=how-to-prevent-a-hangover npx playwright test tests/content-quality.spec.js
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS = join(ROOT, 'src/newblog/data/posts');
const INDEX = join(ROOT, 'src/newblog/data/metadata/index.json');

const NEW_CONTENT = (process.env.CONTENT_SLUGS || 'how-to-prevent-a-hangover,best-liver-supplements,best-hangover-recovery-drinks,best-liver-detox-supplements')
  .split(',').map((s) => s.trim()).filter(Boolean);

// Unambiguous medical OVERCLAIMS that must never appear (health-content policy).
// Deliberately tight so honest discussion ("you can't truly cure a hangover")
// does NOT trip it — only guarantees / absolutes do.
const OVERCLAIMS = [
  // "guaranteed to prevent/cure a hangover" — but NOT honest hedges like
  // "the only guaranteed WAY to prevent…" or "not a guaranteed FIX".
  /guaranteed\s+(to\s+)?(prevent|cure|stop|avoid|eliminate|beat)\s+(a\s+|your\s+|the\s+|all\s+)?hangover/i,
  /guaranteed\s+hangover[-\s]?free/i,
  /100\s*%\s*(prevent|effective|proven|cure)/i,
  /\beliminates?\s+(your\s+)?hangovers?\b/i,
  /\bmiracle\s+(cure|hangover|remedy|pill)\b/i,
  /\bproven\s+to\s+(cure|prevent)\s+(all\s+)?hangovers?\b/i,
  /\bcompletely\s+prevents?\s+hangovers?\b/i,
];

function readJSON(p) { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; }

for (const slug of NEW_CONTENT) {
  test.describe(`content quality — ${slug}`, () => {
    const post = readJSON(join(POSTS, `${slug}.json`));

    test('post JSON exists, valid, registered once in the metadata index', () => {
      expect(post, `${slug}.json must exist and be valid JSON`).toBeTruthy();
      const idx = readJSON(INDEX) || [];
      expect(idx.filter((e) => e.slug === slug).length, `index must contain ${slug} exactly once`).toBe(1);
    });

    test('SEO: title (<=70), meta description (50-165, keyword), matching slug', () => {
      test.skip(!post, 'post missing');
      expect(post.title?.length, 'title present').toBeGreaterThan(10);
      expect(post.title.length, 'title <= 70 chars').toBeLessThanOrEqual(70);
      expect(post.metaDescription?.length, 'meta present').toBeGreaterThan(50);
      expect(post.metaDescription.length, 'meta <= 165 chars').toBeLessThanOrEqual(165);
      expect(post.slug).toBe(slug);
    });

    test('depth + structure: >=2000 words, >=4 H2 sections', () => {
      test.skip(!post, 'post missing');
      const c = post.content || '';
      expect(c.split(/\s+/).filter(Boolean).length, 'body >= 2000 words (not thin)').toBeGreaterThanOrEqual(2000);
      expect((c.match(/^##\s/gm) || []).length, '>= 4 H2 sections').toBeGreaterThanOrEqual(4);
    });

    test('FAQPage schema: >=5 well-formed faq items', () => {
      test.skip(!post, 'post missing');
      expect(Array.isArray(post.faq), 'faq is an array').toBe(true);
      expect(post.faq.length, '>= 5 FAQ items').toBeGreaterThanOrEqual(5);
      for (const f of post.faq) expect(!!(f.question && f.answer), 'each faq has question+answer').toBe(true);
    });

    test('funnels to money: >=1 affiliate CTA + >=2 internal links', () => {
      test.skip(!post, 'post missing');
      const c = post.content || '';
      expect(/amzn\.to\//.test(c), 'has >=1 amzn.to affiliate CTA').toBe(true);
      const internal = (c.match(/\]\(\/(reviews|guide|compare|research|dhm-dosage-calculator|never-hungover)[^)]*\)/g) || []).length;
      expect(internal, '>= 2 internal links to money pages / posts').toBeGreaterThanOrEqual(2);
    });

    test('health-content compliance: no overclaiming language', () => {
      test.skip(!post, 'post missing');
      const c = `${post.content || ''} ${post.title || ''} ${post.metaDescription || ''}`;
      const hits = OVERCLAIMS.filter((re) => re.test(c)).map((re) => re.source);
      expect(hits, `overclaim phrase(s) present: ${hits.join(' | ')}`).toEqual([]);
    });

    test('affiliate links: rel="nofollow sponsored" + amazon product links carry the tag', async ({ page }) => {
      test.skip(!post, 'post missing');
      await page.goto(`/never-hungover/${slug}?exp_site-modern-v1=modern`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const links = page.locator('main a[href*="amazon."], main a[href*="amzn.to"]');
      const n = await links.count();
      test.skip(n === 0, 'no affiliate links on this post');
      for (let i = 0; i < n; i++) {
        const a = links.nth(i);
        const rel = ((await a.getAttribute('rel')) || '').toLowerCase();
        const href = (await a.getAttribute('href')) || '';
        expect(rel, `affiliate link #${i} (${href}) must be rel="nofollow"`).toContain('nofollow');
        expect(rel, `affiliate link #${i} (${href}) must be rel="sponsored"`).toContain('sponsored');
        // Raw amazon.com product links must carry the Associates tag (attribution).
        if (/amazon\.[a-z.]+\/dp\//i.test(href)) {
          expect(href, `amazon product link #${i} must carry tag=dhmguide-20`).toContain('tag=dhmguide-20');
        }
      }
    });

    test('renders at its route: single h1, JSON-LD, no console errors', async ({ page }) => {
      const errs = [];
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errs.push(m.text()); });
      const resp = await page.goto(`/never-hungover/${slug}?exp_site-modern-v1=modern`, { waitUntil: 'domcontentloaded' }).catch(() => null);
      expect(resp, 'route responds').toBeTruthy();
      await page.waitForTimeout(1500);
      await expect(page.locator('main h1')).toHaveCount(1);
      expect(await page.locator('script[type="application/ld+json"]').count(), 'JSON-LD present').toBeGreaterThan(0);
      expect(errs, `console errors:\n${errs.join('\n')}`).toEqual([]);
    });
  });
}
