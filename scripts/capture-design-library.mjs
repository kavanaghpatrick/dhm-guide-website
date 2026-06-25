/**
 * Design Modernization — Screenshot Library Builder
 *
 * Captures the 6 primary pages from PRODUCTION (www.dhmguide.com) as a readable
 * "filmstrip": sequential, legible frames down each page (one design-screen per frame)
 * for BOTH desktop (1440) and mobile (390). A single full-page PNG of a 16,000px+ page
 * downscales into an illegible sliver — frames stay readable so agents can actually
 * judge type, color, spacing, and layout.
 *
 * Output: docs/design-modernization-2026-06-25/screenshots/<slug>/
 *   <profile>-01.png ... <profile>-NN.png   (01 = above the fold / top of page)
 *   README.md  (per page)   +   ../manifest.json
 *
 * Run: node scripts/capture-design-library.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIB = join(ROOT, 'docs/design-modernization-2026-06-25/screenshots');
const BASE = 'https://www.dhmguide.com';

const PAGES = [
  { slug: 'home', path: '/', label: 'Homepage', source: 'src/pages/Home.jsx',
    purpose: 'Primary marketing landing page: hero (before/after), dual-pathway science explainer, benefits grid, top-3 product showcase, testimonials, competitor comparison, FAQ, final CTA.' },
  { slug: 'reviews', path: '/reviews', label: 'Best DHM Supplements (Reviews)', source: 'src/pages/Reviews.jsx',
    purpose: 'Highest-value conversion page: filterable/sortable product listings, quick comparison table, pros/cons per product, affiliate CTAs to Amazon.' },
  { slug: 'guide', path: '/guide', label: 'DHM Hangover Relief Guide', source: 'src/pages/Guide.jsx',
    purpose: 'Educational conversion funnel: DHM science, 3-step prevention protocol, dosing scenarios, mechanism explainer, FAQ.' },
  { slug: 'research', path: '/research', label: 'The Science Behind DHM (Research)', source: 'src/pages/Research.jsx',
    purpose: 'Authority/trust page: 25+ peer-reviewed studies categorized by type, APA citation copy tools, year/category filters.' },
  { slug: 'compare', path: '/compare', label: 'Compare DHM Supplements', source: 'src/pages/Compare.jsx',
    purpose: 'Side-by-side comparison tool: select up to 4 supplements, compare specs, price, DHM content, features.' },
  { slug: 'never-hungover', path: '/never-hungover', label: 'Never Hungover Blog Hub', source: 'src/newblog/pages/NewBlogListing.jsx',
    purpose: 'Organic-discovery content hub: searchable/taggable article index linking to 30+ blog posts.' },
];

const PROFILES = [
  { name: 'desktop', frameH: 1600, maxFrames: 10,
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  { name: 'mobile', frameH: 1300, maxFrames: 10,
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0; const step = 700;
      const timer = setInterval(() => {
        window.scrollBy(0, step); total += step;
        if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
      }, 110);
    });
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

async function capture(browser, pdef, profile) {
  const dir = join(LIB, pdef.slug);
  mkdirSync(dir, { recursive: true });
  // Use a tall viewport (= frame height) and scroll band-by-band. Playwright's `clip`
  // can't reach below the viewport, so each frame is a full-viewport capture of one band.
  const ctx = await browser.newContext({
    ...profile.context,
    viewport: { width: profile.context.viewport.width, height: profile.frameH },
  });
  const page = await ctx.newPage();
  const url = BASE + pdef.path;
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
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
    const n = String(i + 1).padStart(2, '0');
    await page.screenshot({ path: join(dir, `${profile.name}-${n}.png`), fullPage: false });
    made++;
  }
  await ctx.close();
  const capped = frames < Math.ceil(pageH / profile.frameH);
  console.log(`  ✓ ${pdef.slug.padEnd(16)} [${profile.name}] ${made} frames (page ${pageH}px${capped ? ', CAPPED' : ''})`);
  return made;
}

function writePageReadme(pdef, counts) {
  const dir = join(LIB, pdef.slug);
  const md = `# ${pdef.label}

- **Route:** \`${pdef.path}\`  ·  **Live:** ${BASE}${pdef.path}
- **Source component:** \`${pdef.source}\`

## Purpose
${pdef.purpose}

## Screenshots (filmstrip — read in order, 01 = top of page)
- **Desktop (1440px):** \`desktop-01.png\` … \`desktop-${String(counts.desktop).padStart(2, '0')}.png\` (${counts.desktop} frames)
- **Mobile (390px):** \`mobile-01.png\` … \`mobile-${String(counts.mobile).padStart(2, '0')}.png\` (${counts.mobile} frames)

Frame 01 is the above-the-fold / first impression. Each later frame is the next screen down.
These are the CURRENT production design — propose how to modernize it.
`;
  writeFileSync(join(dir, 'README.md'), md);
}

(async () => {
  console.log(`Capturing ${PAGES.length} pages × ${PROFILES.length} profiles (filmstrip) from ${BASE}\n`);
  const browser = await chromium.launch();
  const manifest = { base: BASE, capturedFrom: 'production', generated: 'design-modernization-2026-06-25', pages: [] };
  for (const pdef of PAGES) {
    const dir = join(LIB, pdef.slug);
    mkdirSync(dir, { recursive: true });
    // Clean stale PNGs from prior runs so the folder is unambiguous.
    for (const f of readdirSync(dir)) if (f.endsWith('.png')) rmSync(join(dir, f));
    const counts = {};
    for (const profile of PROFILES) {
      try { counts[profile.name] = await capture(browser, pdef, profile); }
      catch (e) { counts[profile.name] = 0; console.log(`  ✗ ${pdef.slug} [${profile.name}]: ${e.message}`); }
    }
    writePageReadme(pdef, counts);
    manifest.pages.push({
      slug: pdef.slug, label: pdef.label, route: pdef.path, source: pdef.source,
      dir: `docs/design-modernization-2026-06-25/screenshots/${pdef.slug}`,
      desktopFrames: counts.desktop, mobileFrames: counts.mobile,
    });
  }
  await browser.close();
  writeFileSync(join(LIB, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDone. Manifest: ${join(LIB, 'manifest.json')}`);
})();
