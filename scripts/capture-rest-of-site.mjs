/**
 * Capture the NON-restyled surfaces (still on the old design) as filmstrip frames
 * for the site-consistency audit: About, Dosage Calculator, a blog post, 404.
 * The shared header + footer are captured within these full-height filmstrips.
 *
 * Run: node scripts/capture-rest-of-site.mjs
 * Out: docs/site-consistency-audit-2026-07-08/screenshots/<slug>/{desktop,mobile}-NN.png
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/site-consistency-audit-2026-07-08/screenshots');
const BASE = 'https://www.dhmguide.com';

const PAGES = [
  { slug: 'about', path: '/about', label: 'About', source: 'src/pages/About.jsx' },
  { slug: 'calculator', path: '/dhm-dosage-calculator', label: 'DHM Dosage Calculator', source: 'src/pages/DosageCalculatorEnhanced.jsx' },
  { slug: 'blog-post', path: '/never-hungover/when-to-take-dhm-timing-guide-2025', label: 'Blog post template (197 posts)', source: 'src/newblog/components/NewBlogPost.jsx' },
  { slug: 'not-found', path: '/this-page-definitely-does-not-exist-404', label: '404 Not Found', source: 'src/pages/NotFound.jsx' },
];

const PROFILES = [
  { name: 'desktop', frameH: 1500, maxFrames: 12, context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  { name: 'mobile', frameH: 1300, maxFrames: 12, context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0; const step = 700;
      const t = setInterval(() => { window.scrollBy(0, step); total += step; if (total >= document.body.scrollHeight) { clearInterval(t); resolve(); } }, 110);
    });
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

async function capture(browser, pdef, profile) {
  const ctx = await browser.newContext({ ...profile.context, viewport: { width: profile.context.viewport.width, height: profile.frameH } });
  const page = await ctx.newPage();
  try { await page.goto(BASE + pdef.path, { waitUntil: 'networkidle', timeout: 45000 }); }
  catch { await page.goto(BASE + pdef.path, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(2500);
  await autoScroll(page);
  const pageH = await page.evaluate(() => document.documentElement.scrollHeight);
  const frames = Math.min(profile.maxFrames, Math.max(1, Math.ceil(pageH / profile.frameH)));
  let made = 0;
  for (let i = 0; i < frames; i++) {
    const y = i * profile.frameH;
    if (y >= pageH) break;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: join(OUT, pdef.slug, `${profile.name}-${String(i + 1).padStart(2, '0')}.png`), fullPage: false });
    made++;
  }
  await ctx.close();
  console.log(`  ✓ ${pdef.slug.padEnd(12)} [${profile.name}] ${made} frames (page ${pageH}px)`);
  return made;
}

(async () => {
  console.log(`Capturing ${PAGES.length} non-restyled surfaces from ${BASE}\n`);
  const browser = await chromium.launch();
  for (const pdef of PAGES) {
    const dir = join(OUT, pdef.slug);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) if (f.endsWith('.png')) rmSync(join(dir, f));
    const counts = {};
    for (const profile of PROFILES) {
      try { counts[profile.name] = await capture(browser, pdef, profile); }
      catch (e) { counts[profile.name] = 0; console.log(`  ✗ ${pdef.slug} [${profile.name}]: ${e.message}`); }
    }
    writeFileSync(join(dir, 'README.md'), `# ${pdef.label} — CURRENT (old, non-restyled) design\n\n- URL: ${BASE}${pdef.path}\n- Source: \`${pdef.source}\`\n- Desktop: ${counts.desktop} frames · Mobile: ${counts.mobile} frames\n\nThis surface was NOT restyled to the modern design system. Audit it for consistency gaps vs the modern pages (paper palette, Fraunces+Inter, border-first cards, orange-only CTAs).\n`);
  }
  await browser.close();
  console.log(`\nDone. ${OUT}`);
})();
