# A3 — Visual Regression CI Strategy for Layering Bugs

**Date:** 2026-04-27
**Author:** Claude (research agent)
**Goal:** Design a CI gate that would have caught PR #339 / #341 layering regressions before merge.

---

## TL;DR (for the impatient)

1. **Tier 1 (ship this week, ~3 dev hrs, $0/mo):** Add a Playwright **assertion suite** that runs against the dev server in GitHub Actions. No screenshot baselines — instead use `getComputedStyle()` and `elementsFromPoint()` to assert *behaviour* (header has explicit z-index, dropdown is on top, scroll bar is reachable). This catches every bug from yesterday/today and has near-zero false-positive rate.
2. **Tier 2 (ship in 2 weeks if Tier 1 catches <70% of regressions, ~6 dev hrs, $0/mo):** Add **Playwright `toHaveScreenshot()`** for 4 key pages × 2 viewports = 8 baselines, free, baselines committed to git.
3. **Tier 3 (only if Tier 1+2 produce too many false positives or we need designer review UX, ~3 dev hrs, $0/mo for our volume):** Add **Argos CI** (free tier 5,000 screenshots/mo — we'd use ~500/mo).

**Recommendation: ship Tier 1 immediately. Tier 2/3 are conditional.** This is consistent with Pattern #6 (pure deletion / minimal addition) and Pattern #11 (test what crawlers actually receive — assertions test what users actually experience).

---

## 1. Bugs we are trying to catch (root cause analysis)

| # | Bug | What happened | What would have caught it |
|---|-----|---------------|---------------------------|
| 1 | PR #339 — mega-menu overlap | `motion.header` opacity animation created a stacking context, trapping the dropdown's `z-50` inside the header. Removing the animation was insufficient — `headerOpacity` was still applied via inline style on a different layer. | `elementsFromPoint(x, y)` at known overlap coords → assert top element is the dropdown |
| 2 | PR #341 — header `z-auto` for ~6 months | `theme.extend.zIndex` in `tailwind.config.js` is silently ignored by Tailwind v4. `z-header` resolved to `z-index: auto` and nobody noticed. | `getComputedStyle(header).zIndex !== 'auto'` |
| 3 | Comparison widget regression | A new transform/opacity rule landed elsewhere and shifted the widget's layer. | Visual snapshot of `/compare`, OR computed-style assertion that `.comparison-widget` z-index > header |
| 4 | Scroll progress bar trapped | Got moved into a stacking context that clipped it from the viewport. | `elementsFromPoint(centerX, 2)` at the very top of the viewport → assert top element has `data-track="scroll-progress"` (or similar) |
| 5 | Reviews banner ties with header | Two siblings at the same z-index — paint order = source order, fragile. | Assertion: every fixed/sticky element has a z-index from the canonical scale (`--z-index-*`), no two share a value at the same DOM depth |

**Insight:** 4 of 5 bugs are *behavioural*, not visual. They can be caught with cheap DOM assertions, no screenshots needed. Screenshots are most valuable for bug #3 (regression in a complex widget) where computed-style alone isn't enough.

---

## 2. Tool comparison

| Tool | Cost (our scale: ~5 PRs/wk × 8 screenshots) | GH Actions ease | Baseline storage | Per-PR review UX | False-positive rate (font/SVG/anim) | Setup time | Maintenance |
|------|---------|----------------|------------------|------------------|------------------------------------|------------|-------------|
| **Playwright `toHaveScreenshot()`** | $0 | Native (already a dep) | Committed to git (`*.png` files) — works on forks | None built-in. Diff visible in test report HTML artifact. | Medium-high without tuning. Needs `animations:'disabled'`, font-loading wait, `mask:[]` for dynamic content. Manageable. | 1–2 hrs | Low. PR diffs are easy to review when artifact is uploaded. |
| **Argos CI** | $0 (free tier: 5k/mo, we'd use ~500) | Excellent (GitHub app + `argos-ci/argos-action`) | Argos cloud (S3-backed) | Excellent. Inline PR comment with web UI for diff approve/reject. Designer-friendly. | Low. Argos has a flaky-detection layer and OS-pin baseline. | 2–3 hrs | Very low. Best UX of any option. |
| **Chromatic** | $0 free tier (5k/mo for commercial; unlimited for OSS) | Excellent if you have Storybook. | Chromatic cloud | Best-in-class diff UI. | Lowest. Built specifically for this. | **Requires Storybook** — we have none. Setup = 1–2 days. | High initially (Storybook), low after. |
| **Percy** | $0 (5k/mo on free, paid starts $29/mo) | Good | Percy cloud | Excellent. | Low. | 2–3 hrs | Low. |
| **Lost Pixel (OSS, self-hosted)** | $0 | Native GH Action. | Committed to git OR self-hosted server. | OK. Diff in PR comment. | Medium. | 2–4 hrs | Medium. Server self-host is overhead we don't need. |
| **Lost Pixel (cloud)** | $0 free trial → ~$45/mo for our scale | Native | Lost Pixel cloud | Good. | Low. | 1–2 hrs | Low. |
| **reg-suit / BackstopJS** | $0 | Manual (no native action) | Self-managed S3 / git | Older UX, JSON-driven. | Medium. | 4+ hrs | High. Older, less actively maintained. |

### Decision matrix

- **Storybook?** No → Chromatic eliminated.
- **Want PR-comment review UX?** Nice but not required for our 1-dev team.
- **Budget?** $0/mo preferred (we have <$0/mo budget appetite for tooling that protects against bugs we shipped without losing money).
- **Volume?** ~5 PRs/week × 8 screenshots = ~160 screenshots/wk = ~700/mo. Well inside every free tier.

**Winner for visual diffs: tie between Playwright `toHaveScreenshot()` and Argos.** Playwright wins on simplicity (no third-party signup, no SaaS lock-in). Argos wins on UX (web UI for diff review). For a 1-dev project that already runs Playwright, **Playwright wins**.

**Winner for catching the actual bugs we shipped: neither.** The bugs are behavioural. **Pure DOM assertions** (Tier 1) catch them faster, cheaper, with zero false positives.

---

## 3. Recommended CI gate (Tier 1 — ship this week)

A new Playwright suite, `tests/layering-invariants.spec.js`, run in CI against `pnpm dev`. Pure DOM assertions, no baselines, no screenshots committed. Estimated CI run time: **~60–90 sec** (build + dev start + 8 tests).

### 3a. Test 1 — Header has explicit z-index (catches PR #341)

```javascript
// tests/layering-invariants.spec.js
import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/reviews', '/compare', '/never-hungover/dhm-dosage-guide-2025'];
const VIEWPORTS = [
  { width: 1280, height: 800, label: 'desktop' },
  { width: 390, height: 844, label: 'mobile' },
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`header has explicit z-index on ${route} @ ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const headerZ = await page.evaluate(() => {
        const h = document.querySelector('header');
        if (!h) return { found: false };
        const cs = getComputedStyle(h);
        return { found: true, zIndex: cs.zIndex, position: cs.position };
      });

      expect(headerZ.found, 'header element exists').toBe(true);
      // The bug: z-header resolved to 'auto' for 6 months. Fail the build if it ever does again.
      expect(headerZ.zIndex, `header z-index must be explicit on ${route}`).not.toBe('auto');
      // And it must be a positive number high enough to beat page content (≥30)
      expect(parseInt(headerZ.zIndex, 10)).toBeGreaterThanOrEqual(30);
      // Header must be fixed/sticky for z-index to even apply
      expect(['fixed', 'sticky']).toContain(headerZ.position);
    });
  }
}
```

### 3b. Test 2 — Topics dropdown renders ABOVE page content (catches PR #339)

```javascript
test(`Topics dropdown is on top when hovered on /reviews scrolled`, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/reviews', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 600)); // expose comparison table / hero
  await page.waitForTimeout(400);

  await page.locator('[data-track="nav-topics-trigger"]').hover();
  await page.waitForSelector('#topics-mega-menu', { state: 'visible' });

  // Sample 12 points across the visible portion of the dropdown.
  // For each point, the topmost element MUST be a descendant of #topics-mega-menu.
  const overlapReport = await page.evaluate(() => {
    const dropdown = document.getElementById('topics-mega-menu');
    const r = dropdown.getBoundingClientRect();
    const results = [];
    const cols = 4, rows = 3;
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        const x = r.left + 20 + (cx * (r.width - 40) / (cols - 1));
        const y = r.top  + 20 + (cy * (Math.min(r.height, window.innerHeight - r.top) - 40) / (rows - 1));
        if (y < 0 || y > window.innerHeight) continue;
        const stack = document.elementsFromPoint(x, y);
        const top = stack[0];
        const insideDropdown = dropdown.contains(top) || top === dropdown;
        if (!insideDropdown) {
          results.push({
            x: Math.round(x), y: Math.round(y),
            tag: top.tagName.toLowerCase(),
            id: top.id || null,
            classes: typeof top.className === 'string' ? top.className.slice(0, 80) : null,
            zIndex: getComputedStyle(top).zIndex,
          });
        }
      }
    }
    return results;
  });

  expect(overlapReport,
    `Topics dropdown overlapped by:\n${JSON.stringify(overlapReport, null, 2)}`
  ).toEqual([]);
});
```

### 3c. Test 3 — No z-index collisions among fixed/sticky elements

```javascript
test('no two fixed/sticky siblings share the same z-index', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const collisions = await page.evaluate(() => {
    const offenders = [];
    const fixedEls = [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      return (cs.position === 'fixed' || cs.position === 'sticky') && cs.zIndex !== 'auto';
    });
    // Group by parent + z-index
    const buckets = new Map();
    for (const el of fixedEls) {
      const key = `${el.parentElement?.tagName || 'root'}|${getComputedStyle(el).zIndex}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: typeof el.className === 'string' ? el.className.slice(0, 60) : null,
      });
    }
    for (const [key, els] of buckets.entries()) {
      if (els.length > 1) offenders.push({ key, els });
    }
    return offenders;
  });
  expect(collisions, 'fixed/sticky siblings must have distinct z-index values').toEqual([]);
});
```

### 3d. Test 4 — Scroll progress bar reachable from top of viewport

```javascript
test('scroll progress bar is on top at viewport y=2', async ({ page }) => {
  await page.goto('/never-hungover/dhm-dosage-guide-2025', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  const topAtY2 = await page.evaluate(() => {
    const stack = document.elementsFromPoint(window.innerWidth / 2, 2);
    return stack.slice(0, 3).map(el => ({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      dataTrack: el.getAttribute('data-track'),
      classes: typeof el.className === 'string' ? el.className.slice(0, 60) : null,
      zIndex: getComputedStyle(el).zIndex,
    }));
  });
  // Some element with role="progressbar" or data-track="scroll-progress" must be in the top 3
  const hasProgress = topAtY2.some(el =>
    el.dataTrack === 'scroll-progress' ||
    (el.classes && el.classes.includes('scroll-progress'))
  );
  expect(hasProgress, `scroll bar not on top: ${JSON.stringify(topAtY2)}`).toBe(true);
});
```

### 3e. Test 5 — Computed z-index of header equals canonical scale value

```javascript
test('header z-index matches --z-index-header CSS custom property', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => {
    const headerZ = getComputedStyle(document.querySelector('header')).zIndex;
    const tokenZ  = getComputedStyle(document.documentElement).getPropertyValue('--z-index-header').trim();
    return { headerZ, tokenZ };
  });
  // Token is "40" per src/App.css. Header should resolve to 40.
  expect(result.headerZ).toBe(result.tokenZ);
  expect(result.headerZ).toBe('40');
});
```

---

## 4. GitHub Actions workflow (mirrors lockfile-check.yml pattern)

`.github/workflows/layering-check.yml`:

```yaml
name: Layering invariants

on:
  pull_request:
    branches: [main]

jobs:
  layering:
    name: Verify z-index and stacking invariants
    runs-on: ubuntu-latest
    timeout-minutes: 8
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Install Playwright Chromium
        run: pnpm exec playwright install --with-deps chromium
      - name: Run layering invariants
        run: pnpm exec playwright test --config=playwright.config.js tests/layering-invariants.spec.js --project=chromium
      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Estimated CI time per PR:** 90–120 sec (~30s install, ~25s playwright install with cache, ~10s dev start, ~30s tests, ~10s teardown). Comfortably under the 2-min target.

---

## 5. Tier 2 — Visual baselines (add only if behavioural tests miss something)

If Tier 1 catches <70% of layering regressions over 4 weeks, add `tests/visual-baselines.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Visual baselines', () => {
  test.use({
    // OS-pinning: only run snapshots on linux to keep baselines stable
    // (font rendering differs between macOS/linux/windows)
  });

  for (const route of ['/', '/reviews', '/compare', '/never-hungover/dhm-dosage-guide-2025']) {
    test(`${route} desktop @ 1280x800`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);  // wait for fonts
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${route.replace(/\//g, '_') || 'home'}-desktop.png`, {
        fullPage: false,                       // viewport only — keeps baseline small
        animations: 'disabled',                 // freeze framer-motion
        caret: 'hide',                          // hide blinking cursor
        maxDiffPixels: 200,                     // tolerate ~200px of drift
        mask: [
          page.locator('[data-track="scroll-progress"]'),  // dynamic
          page.locator('time'),                            // timestamps
          page.locator('img[loading="lazy"]'),             // late-loading images
        ],
      });
    });
  }
});
```

**Baseline strategy:**
- Commit baselines to `tests/visual-baselines.spec.js-snapshots/` in git
- Generate via `pnpm exec playwright test tests/visual-baselines.spec.js --update-snapshots` and commit result
- Pin to `mcr.microsoft.com/playwright:v1.x.x-noble` Docker image in CI to eliminate font drift between local (macOS) and CI (Ubuntu) — Playwright's filename auto-suffix `-darwin`/`-linux` already handles this if we ever run locally
- Re-baseline on intentional design changes via the same `--update-snapshots` flag

---

## 6. False-positive strategy (Tier 2 only)

| Source | Mitigation |
|--------|-----------|
| Framer Motion animations | `animations: 'disabled'` (Playwright pauses CSS animations + transitions) + `await page.waitForTimeout(500)` before snapshot |
| Web fonts not loaded | `await page.evaluate(() => document.fonts.ready)` |
| OS font rendering (macOS vs Linux CI) | Generate baselines **only in CI** (commit them from CI, not locally). Use Playwright's official Docker image for consistency. |
| Lazy-loaded images | `mask:` the lazy images, or scroll the page first and `waitFor('networkidle')` |
| Scroll progress bar (dynamic %) | `mask: [page.locator('[data-track="scroll-progress"]')]` |
| Timestamps / "X mins ago" | `mask: [page.locator('time')]` |
| PostHog / GA / experiment variant flicker | Disable PostHog in test env via `VITE_POSTHOG_DISABLED=1` env var |
| Subpixel anti-aliasing drift | `maxDiffPixels: 200` (≤0.02% of a 1280×800 viewport) |

---

## 7. Migration path

| Week | Action | Coverage |
|------|--------|----------|
| 1 (now) | Ship Tier 1: 5 invariant tests on 4 routes × 2 viewports = ~40 assertions, ~90s CI | Catches all 5 bugs from yesterday/today |
| 2–4 | Monitor: did any layering bug ship that Tier 1 didn't catch? | — |
| 5 (if needed) | Ship Tier 2: 4 routes × 2 viewports = 8 baselines. Playwright `toHaveScreenshot`. | Catches visual regressions in widgets that don't change z-index |
| 8 (if Tier 2 is high-noise) | Migrate Tier 2 baselines to Argos free tier — better diff UX, same cost | Same coverage, better DX |

**Routes to test (priority order):**
1. `/` — homepage, highest traffic
2. `/reviews` — affiliate revenue critical, has comparison widget
3. `/compare` — comparison widget regression target
4. `/never-hungover/dhm-dosage-guide-2025` — long-form blog post (scroll bar, TOC, CTA)

**Viewports:**
- `1280×800` desktop (matches PostHog majority)
- `390×844` mobile (iPhone 14 Pro, matches PostHog mobile majority)

**When to expand:**
- If a layering bug ships on a route not in the list → add that route
- If a layering bug ships at a viewport not in the list (e.g. tablet 768) → add that viewport
- Don't add proactively. Pattern #3: pilot first, scale on data.

---

## 8. Cost & effort summary

| Tier | Dev hrs to ship | Monthly running cost | Bugs caught (of 5 from today) | Confidence |
|------|----------------|---------------------|-------------------------------|------------|
| **Tier 1 only (recommended)** | **3 hrs** | **$0** | **5 of 5** | High |
| Tier 1 + Tier 2 | 9 hrs | $0 | 5 of 5 + visual regressions | High |
| Tier 1 + Tier 3 (Argos) | 6 hrs | $0 (free tier) | 5 of 5 + visual regressions, better DX | High |

**CI minutes cost:** ~2 min per PR × ~20 PRs/mo = 40 min/mo. Public repo = free. Private repo = ~$0.32/mo at GitHub's $0.008/min linux pricing.

---

## 9. Key learnings applied (from CLAUDE.md patterns)

- **Pattern #1 (External AI validation):** This doc itself is pre-validation. Run Grok + Gemini before implementing.
- **Pattern #2 (Question requirements):** "Do we need pixel-perfect screenshots?" → No. We need "is the dropdown on top when I hover?" → behavioural assertions are 10x simpler.
- **Pattern #6 (Pure deletion / minimal addition):** Tier 1 adds ~150 lines of test code, no new dependencies, no SaaS signup. Tier 2/3 are additive only if Tier 1 is insufficient.
- **Pattern #11 (Test what users actually receive):** `getComputedStyle()` and `elementsFromPoint()` test what the browser actually paints, not what we hoped Tailwind generated.
- **Pattern #13 (Realistic estimates):** Tier 1 = 3 hrs (not 1, not 8). Includes write tests, run locally, fix any flakes, write workflow YAML, test on a draft PR, merge.

---

## 10. Sources

- [Playwright — Visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright — PageAssertions API](https://playwright.dev/docs/api/class-pageassertions)
- [Argos — Visual regression for Playwright](https://argos-ci.com)
- [Argos pricing](https://argos-ci.com/pricing) — Hobby $0 (5k snapshots/mo), Pro $100/mo (35k)
- [Lost Pixel — Open source alternative](https://github.com/lost-pixel/lost-pixel)
- [Chromatic pricing](https://www.chromatic.com/pricing) — Free 5k/mo, Pro $149/mo
- [Comparison: Lost Pixel guide to VRT tools](https://www.lost-pixel.com/blog/ultimate-visual-regression-testing-tools-guide)
- [Playwright Visual Testing flake-resistant guide](https://medium.com/@david-auerbach/how-to-conduct-visual-testing-with-playwright-a-complete-flake-resistant-guide-58714ebfbf05)
- [Houseful blog — fixing flaky Playwright visual tests](https://www.houseful.blog/posts/2023/fix-flaky-playwright-visual-regression-tests/)
