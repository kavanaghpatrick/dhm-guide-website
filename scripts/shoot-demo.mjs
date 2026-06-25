/**
 * Render the static theme demo and capture preview screenshots.
 * Loads the local file, waits for web fonts, captures desktop + mobile.
 *
 * Run: node scripts/shoot-demo.mjs
 * Out: docs/design-modernization-2026-06-25/demo/preview/
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, '../docs/design-modernization-2026-06-25/demo');
const OUT = join(DEMO, 'preview');
const URL = pathToFileURL(join(DEMO, 'index.html')).href;

mkdirSync(OUT, { recursive: true });

async function shoot(browser, name, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(OUT, `${name}-abovefold.png`), fullPage: false });
  await page.screenshot({ path: join(OUT, `${name}-full.png`), fullPage: true });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await ctx.close();
  console.log(`  ✓ ${name} (page ${h}px) -> ${name}-abovefold.png, ${name}-full.png`);
}

const browser = await chromium.launch();

// Emulate prefers-reduced-motion so the demo's one-shot scroll reveals (which
// hold .reveal at opacity:0 until an IntersectionObserver fires) render fully
// in a fullPage capture. The demo gates that hide-until-reveal behavior behind
// `prefers-reduced-motion: no-preference`, so reduced-motion shows all content
// deterministically — the accessible reading path, and a faithful screenshot.
const reducedMotion = 'reduce';

await shoot(browser, 'desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion });
await shoot(browser, 'mobile', {
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
await browser.close();
console.log(`\nPreviews in: ${OUT}`);
