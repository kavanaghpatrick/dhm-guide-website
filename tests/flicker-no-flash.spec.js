// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Proves the unified modern experiment (site-modern-v1) has NO control→modern flash.
 *
 * A per-animation-frame sampler records what design is painted over the first ~2.5s,
 * so any flash of control is caught deterministically. We seed PostHog's own
 * localStorage cache directly (the same cache useExperiment seeds from synchronously),
 * which works even though dev skips posthog.init() — readCachedFlag reads localStorage,
 * not the SDK. This exercises the REAL render path, not the ?exp_ override.
 */

const PH_STORAGE_KEY = 'ph_phc_BxeZzVX7gh2w23tsDyCAWViH5v3rRF9ipPNNQYNdkS4_posthog';

async function installSampler(context) {
  await context.addInitScript(() => {
    // Only count what the user actually SEES on screen — the page has an off-screen
    // SEO stub (#prerender-main-stub at left:-9999px) whose h1 must NOT be treated as
    // a visible control flash.
    const onScreen = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 &&
        r.top < window.innerHeight && r.left < window.innerWidth;
    };
    // classify the painted page each frame: 'modern' | 'control' | 'blank'(hold)
    const classify = () => {
      const modern = document.querySelector('.theme-modern');
      if (onScreen(modern)) return 'modern';
      const h1s = Array.prototype.slice.call(document.querySelectorAll('h1'));
      const visibleControlH1 = h1s.some((h) => !h.closest('.theme-modern') && !h.closest('#prerender-main-stub') && onScreen(h));
      if (visibleControlH1) return 'control';
      return 'blank';
    };
    // @ts-ignore
    window.__frames = [];
    let start = performance.now();
    const tick = () => {
      // @ts-ignore
      window.__frames.push(classify());
      if (performance.now() - start < 2500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // @ts-ignore — let SPA-nav tests restart sampling after a client navigation
    window.__resetFrames = () => { window.__frames = []; start = performance.now(); requestAnimationFrame(tick); };
  });
}

async function seedFlag(context, variant) {
  await context.addInitScript(([key, v]) => {
    try { localStorage.setItem(key, JSON.stringify({ $enabled_feature_flags: { 'site-modern-v1': v } })); } catch { /* ignore */ }
  }, [PH_STORAGE_KEY, variant]);
}

test.describe('Experiment flicker — unified site-modern-v1', () => {
  test('returning MODERN user: zero control flash on first load', async ({ page, context }) => {
    await seedFlag(context, 'modern');
    await installSampler(context);
    await page.goto('/reviews');
    await expect(page.locator('.theme-modern')).toBeVisible();
    await page.waitForTimeout(1500);
    const frames = await page.evaluate(() => window.__frames || []);
    const seen = [...new Set(frames)];
    expect(frames.length, 'sampler should have recorded frames').toBeGreaterThan(3);
    expect(frames, `frames seen: ${seen.join(',')} — control must NEVER paint for a modern user`).not.toContain('control');
    expect(frames, 'modern must paint').toContain('modern');
  });

  test('returning MODERN user: stays modern across SPA navigation (no flip)', async ({ page, context }) => {
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    test.skip(isMobile, 'desktop nav links are collapsed on mobile; SPA-nav flip is covered on desktop');
    await seedFlag(context, 'modern');
    await installSampler(context);
    await page.goto('/reviews');
    await expect(page.locator('.theme-modern')).toBeVisible();
    await page.evaluate(() => window.__resetFrames && window.__resetFrames());
    await page.locator('a[href="/guide"]').first().click();
    await page.waitForURL('**/guide');
    await expect(page.locator('.theme-modern')).toBeVisible();
    await page.waitForTimeout(1000);
    const frames = await page.evaluate(() => window.__frames || []);
    expect(frames, `nav frames: ${[...new Set(frames)].join(',')} — must not drop to control on navigation`).not.toContain('control');
  });

  test('first-time visitor never sees the modern design appear-then-vanish', async ({ page, context }) => {
    // Clear the config's default 'control' seed → a genuine first-time visitor with no
    // cached assignment. In dev posthog.init is skipped, so they get the neutral hold
    // then control; the guarantee is a first-timer is never shown modern transiently.
    await context.addInitScript((key) => { try { localStorage.removeItem(key); } catch { /* ignore */ } }, PH_STORAGE_KEY);
    await installSampler(context);
    await page.goto('/reviews');
    await page.waitForTimeout(1500);
    const frames = await page.evaluate(() => window.__frames || []);
    expect(frames, `frames: ${[...new Set(frames)].join(',')}`).not.toContain('modern');
  });
});
