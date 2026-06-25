/**
 * Capture the MODERN variant of all 6 primary pages as readable filmstrip frames
 * for the visual audit. Forces the modern variant via the ?exp_site-modern-v1=modern
 * override and waits for .theme-modern so we capture the settled design (not the hold).
 *
 * Run: node scripts/capture-modern-audit.mjs
 * Out: docs/modern-audit-2026-06-25/screenshots/<slug>/{desktop,mobile}-NN.png
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/modern-audit-2026-06-25/screenshots');
const BASE = 'https://www.dhmguide.com';
const EXP = 'exp_site-modern-v1=modern';

const PAGES = [
  { slug: 'home', path: '/', label: 'Homepage', source: 'src/pages/Home.modern.jsx' },
  { slug: 'reviews', path: '/reviews', label: 'Best DHM Supplements (Reviews)', source: 'src/pages/Reviews.modern.jsx' },
  { slug: 'guide', path: '/guide', label: 'DHM Guide', source: 'src/pages/Guide.modern.jsx' },
  { slug: 'research', path: '/research', label: 'The Science (Research)', source: 'src/pages/Research.modern.jsx' },
  { slug: 'compare', path: '/compare', label: 'Compare', source: 'src/pages/Compare.modern.jsx' },
  { slug: 'never-hungover', path: '/never-hungover', label: 'Never Hungover Blog Hub', source: 'src/newblog/pages/NewBlogListing.modern.jsx' },
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
  const url = `${BASE}${pdef.path}${pdef.path.includes('?') ? '&' : '?'}${EXP}`;
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
  // Wait for the modern variant to actually render (not the neutral hold).
  try { await page.waitForSelector('.theme-modern', { timeout: 15000 }); } catch {}
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(2000);
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
  console.log(`  ✓ ${pdef.slug.padEnd(16)} [${profile.name}] ${made} frames (page ${pageH}px)`);
  return made;
}

(async () => {
  console.log(`Capturing MODERN variant of ${PAGES.length} pages from ${BASE} (${EXP})\n`);
  const browser = await chromium.launch();
  const manifest = { base: BASE, variant: 'modern', override: EXP, pages: [] };
  for (const pdef of PAGES) {
    const dir = join(OUT, pdef.slug);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) if (f.endsWith('.png')) rmSync(join(dir, f));
    const counts = {};
    for (const profile of PROFILES) {
      try { counts[profile.name] = await capture(browser, pdef, profile); }
      catch (e) { counts[profile.name] = 0; console.log(`  ✗ ${pdef.slug} [${profile.name}]: ${e.message}`); }
    }
    writeFileSync(join(dir, 'README.md'), `# ${pdef.label} — MODERN variant\n\n- URL: ${BASE}${pdef.path}?${EXP}\n- Source: \`${pdef.source}\`\n- Desktop frames: ${counts.desktop} · Mobile frames: ${counts.mobile}\n\nFilmstrip (NN = top→bottom). This is the CURRENTLY DEPLOYED modern variant — audit for visual bugs, inconsistencies, alignment, spacing, type, color, responsive.\n`);
    manifest.pages.push({ slug: pdef.slug, label: pdef.label, source: pdef.source, route: pdef.path, desktopFrames: counts.desktop, mobileFrames: counts.mobile });
  }
  await browser.close();
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${join(OUT, 'manifest.json')}`);
})();
