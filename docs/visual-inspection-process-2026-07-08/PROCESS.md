# Visual Inspection Process — Ground-Truth Capture + Automated Layout Invariants

**Status:** Active · **Created:** 2026-07-08 · **Owner:** test-infra

This replaces the old "capture thumbnails, eyeball them" visual-QA process that
let a broken `/compare` comparison table reach 100% of users. It has two parts:

1. **`scripts/visual-truth.mjs`** — artifact-free, ground-truth screenshot capture
   (for human review + a machine-readable invariant report).
2. **`tests/layout-invariants.spec.js`** — a Playwright gate that FAILS a build on
   measurable layout defects (the thing the old process could never do).

---

## Why the old process failed (the failure taxonomy)

The `/compare` "Detailed comparison" table shipped broken because **the entire
visual pipeline was artifact-prone capture + human eyeballing, with zero automated
layout invariant that could turn CI red.** Concretely:

### F0 — No visual assertion can fail the build
- `test:e2e` runs in CI, but the visual specs are `testIgnore`d from it
  (`playwright.config.js` → `testIgnore: ['**/visual/**', ...]`).
- The dedicated `visual` CI job is `continue-on-error: true` and runs
  `test:visual:update` — which only **generates** baselines with
  `--update-snapshots`. It never **compares** against them.
- Net: there is no configuration under which a visual regression, an overflowing
  table, a header overlap, or a layout shift can make CI red. The visual suite is
  a baseline *generator*, not a *gate*.

### F1 — Fixed ~1500px scroll bands miss mid-scroll states
`scripts/capture-modern-audit.mjs` captures at `y = i * 1500` → frames land at
0/1500/3000/4500. Any defect whose failure window is *between* those altitudes is
never sampled. Continuous scrolling by a real user is not modeled.

### F2 — fullPage / element-crop capture MANUFACTURES defects that don't exist
This is the subtle one, and it caused false "findings":
- **fullPage** composites the whole document into one image. A `position: fixed`
  header paints once at the top, leaving a large empty region below where it would
  have re-painted → the fake **"empty green band."** No real user sees it.
- **element (`.screenshot`) crops** re-render a node outside its scroll/stacking
  context, so a fixed nav can appear to **overlap** content it never overlaps in
  the real viewport → the fake **"header overlaps the table."**
- Both artifacts were initially attributed to `/compare` as real bugs. Ground-truth
  viewport capture proves the shipped page does **not** exhibit them at rest (the
  header is opaque; the green regions are intentional narrow-content sections).

### F3 — Downscaled thumbnails hide fine defects
1px misalignment, clipped text, and sub-pixel overlap vanish when a 1440px frame
is shrunk to a thumbnail. The reviewer literally cannot see them.

### F4 — The one relevant automated check is STRUCTURALLY BLIND to this bug
`compare-modern-behavior.spec.js` asserts "no horizontal overflow" via
`documentElement.scrollWidth <= clientWidth`. But the table lives inside
`.compare-scroll { overflow-x: auto }` (`theme-modern.css:817`), so the overflow is
absorbed **inside the scroll box** — `documentElement.scrollWidth` never grows. The
check passes while the table still requires sideways scrolling to read. The defect
is invisible to the exact assertion that looks like it should catch it.

### F5 — The laptop band (1024–1366) is never captured
The table is `hidden lg:block` (renders at ≥1024px) with `th { minWidth: 200px }`.
At the max 4 selected products it is ~1180px wide. In the 1024–1366 band it is
widest relative to the viewport — and the old tool captured only 390px and 1440px,
never the band where it breaks.

---

## The real `/compare` defect (verified on production)

At **`/compare?products=1,2,3,4` @ 1024px**, the comparison table's scroll box has
`scrollWidth = 1180px` inside `clientWidth = 974px` → the user must **swipe
sideways** to read all four product columns. `products=1,2,3,4` is a first-class,
documented feature ("Choose up to 4 supplements"). `documentElement` overflow is
`0` — so the existing "no horizontal overflow" check (F4) is blind to it.

`tests/layout-invariants.spec.js` catches exactly this, as invariant **(d)**:

```
[d: table-fit] A data <table> is not fully readable on /compare?products=1,2,3,4 @ 1024px:
requires HORIZONTAL SCROLLING (scroll box content 1180px > visible 974px — the user must
swipe sideways to read all columns). The page-level overflow check (a) is BLIND to this
because the overflow is absorbed inside the overflow-x:auto box.
```

Full prod matrix (8 routes × 4 widths + the 4-product compare state): **35 passed,
1 failed** — the single failure is this real defect. No false positives. The same
test goes RED against **local dev** too, so wired into CI it blocks the defect
*before* deploy.

---

## Part 1 — Ground-truth capture: `scripts/visual-truth.mjs`

Replaces fixed-band/fullPage/element-crop capture with **what a real user's
viewport shows**:

- **Viewport-sized frames only** — `page.screenshot()` with **NO `fullPage`, NO
  element clip**. This is the single most important rule (kills F2).
- **Real scroll offsets**, stepping ~85% of viewport height (overlapping steps so
  nothing falls between frames — kills F1).
- **Real device widths**: `390, 768, 1024, 1366, 1440` — includes the laptop band
  (kills F5).
- **`deviceScaleFactor: 2`** (retina) — no downscaling that hides fine defects
  (kills F3).
- Waits for `document.fonts.ready`, the `.theme-modern` root, and a settle delay.
- Emits **`report.json`**: per route×width invariant measurements (overflow,
  header-overlap offenders, blank-band px, table fit, scrollHeight growth) so a
  human scanning frames and the machine gate look at the same measured facts.

### Usage

```bash
# Production (default www.dhmguide.com), all routes × widths:
node scripts/visual-truth.mjs

# Local dev:
BASE_URL=http://localhost:5173 node scripts/visual-truth.mjs

# A subset:
node scripts/visual-truth.mjs --routes /compare,/reviews --widths 1024,1440
node scripts/visual-truth.mjs --out /tmp/shots
```

Output: `docs/visual-inspection-process-2026-07-08/ground-truth/<route>/<width>px-scroll-NNNNN.png`
plus `report.json` and `manifest.json`.

---

## Part 2 — The automated gate: `tests/layout-invariants.spec.js`

Runs under the main `playwright.config.js` (`pnpm test:e2e`), parametrized over
routes × widths. Each route×width is one test that steps through the page at
overlapping viewport offsets and asserts (via `expect.soft`, so every invariant is
reported in one run) five invariants:

| # | Invariant | Fails when | Why the old process missed it |
|---|-----------|-----------|-------------------------------|
| **a** | Horizontal page overflow | `documentElement.scrollWidth > clientWidth + 4px` | (existing check — kept) |
| **b** | Fixed-header overlap | Non-header content paints inside the fixed 81px header band (via `elementsFromPoint`), when scrolled past it | F2 faked this in element crops; real check uses live paint order |
| **c** | Large blank vertical band | Tallest viewport interval covered by NO content-element rect exceeds 600px | F2 faked the "empty green band"; uses real element geometry, not background-pixel probing, so it does NOT fire on centered cards over gradients |
| **d** | Table not fully readable | A `<table>` is CLIPPED (wider than container, no scroller) **or** requires HORIZONTAL SCROLLING (`scroller.scrollWidth > clientWidth`) | **F4** — the real `/compare` defect; page-overflow (a) is blind to scroll-box-absorbed overflow |
| **e** | Late layout shift | `scrollHeight` grows >1.5× after settle, **or** CLS > 0.25 | No CLS/pop-in assertion existed |

### Design decisions worth knowing

- **`expect.soft`**: all five invariants evaluate every run. Fixing one defect
  cannot hide another, and one failure surfaces the full picture.
- **Invariant (c) uses real element geometry**, not `elementFromPoint` on
  background pixels. Point-probing false-fires on the site's ubiquitous
  centered-card-over-gradient and narrow-content-in-colored-section patterns
  (that is literally the fake "empty green band" from F2). The rect-based version
  measures the tallest vertical interval no *content element's box* covers — a
  genuine collapsed/mis-sized section, not intentional whitespace. Threshold 600px
  (2/3 of the 900px viewport).
- **CLS budget is 0.25** (Google's "poor" boundary), not 0.1. The site has a
  uniform ~0.13 baseline mobile font-swap shift across *every* page — "needs
  improvement," not a shipping blocker. Gating at 0.1 would fail every mobile page
  and make the gate un-mergeable (repeating F0's "false confidence"). Gate genuinely
  broken shift (>0.25); track the 0.13 baseline separately.
- **Two `/compare` entries by default**: the plain page (3 pre-selected products)
  AND the widest reachable state (`?products=1,2,3,4`). The 4-product state is where
  the table breaks in the laptop band; guarding it permanently means the table can
  never silently outgrow the laptop viewport again.

### Usage

```bash
# Local dev (CI target — webServer auto-starts, storageState seeds the modern arm):
pnpm exec playwright test tests/layout-invariants.spec.js --project=chromium

# Point at any environment (prod / preview) — proves a live regression:
BASE_URL=https://www.dhmguide.com pnpm exec playwright test tests/layout-invariants.spec.js --project=chromium

# Narrow to a route/width while iterating (ROUTES are SEMICOLON-separated so a
# route may carry a comma-listed query):
INVARIANT_ROUTES='/compare?products=1,2,3,4' INVARIANT_WIDTHS=1024 \
  BASE_URL=https://www.dhmguide.com pnpm exec playwright test tests/layout-invariants.spec.js --project=chromium
```

Env knobs: `BASE_URL` (target), `INVARIANT_ROUTES` (`;`-separated), `INVARIANT_WIDTHS` (`,`-separated).

---

## When to run

| Situation | Run |
|-----------|-----|
| **Every PR (CI)** | `tests/layout-invariants.spec.js` in the e2e job (see below) |
| Before shipping a page/component/CSS change | The spec locally against dev, at the widths you touched |
| Investigating a reported visual bug | `visual-truth.mjs` against prod for the affected route + read `report.json` |
| After a build-tool/CSS-framework upgrade | Both — capture for eyeball diff, spec for regressions |
| Auditing a redesign before rollout | `visual-truth.mjs` full matrix; review frames + report |

**Rule:** never conclude "looks fine" from a fullPage capture, an element crop, or a
downscaled thumbnail. Ground truth = viewport-sized frames at real scroll offsets
and real widths, plus the invariant report.

---

## How to add a route

1. **Capture:** add the path to `DEFAULT_ROUTES` in `scripts/visual-truth.mjs`
   (or pass `--routes`). New device widths go in `DEFAULT_WIDTHS`.
2. **Gate:** add the path to the default `ROUTES` string in
   `tests/layout-invariants.spec.js` (semicolon-separated). If the route has a
   state worth guarding at its widest (like `/compare?products=1,2,3,4`), add that
   query variant as its own entry.
3. Run the spec against prod first to confirm the route is GREEN in its current
   shipped state (or RED for a known defect you're documenting), then wire it in.

Both files share identical invariant logic and thresholds, so a route added to one
behaves the same in the other.

---

## Recommendation — wire the gate into CI (makes it a real gate)

The infrastructure exists but is inert until CI runs it. Add
`tests/layout-invariants.spec.js` to the **`e2e` job** in
`.github/workflows/test-and-build.yml` so it runs against the local dev server on
every PR and can turn the build **red**:

```yaml
  e2e:
    name: E2E tests
    needs: [unit, build]
    # ... existing steps: checkout, pnpm, node, install, playwright install ...
      - name: E2E tests
        run: pnpm run test:e2e            # existing behavior specs
      - name: Layout invariants           # NEW — the durable visual gate
        run: pnpm exec playwright test tests/layout-invariants.spec.js --project=chromium
```

Notes:
- It runs under the existing `playwright.config.js` webServer (local dev on :5173),
  so no new infra — just chromium (already installed in that job).
- Keep it a **hard gate** (no `continue-on-error`), unlike the inert `visual` job.
  A hard gate is the entire point: F0 is what let `/compare` ship.
- The default route set includes the 4-product compare state, so this exact class
  of defect is blocked pre-deploy.
- Optional follow-up: once this is green in CI, retire or fix the inert `visual`
  baseline-bootstrap job (it generates baselines it never compares).

---

## Files owned by this process

- `scripts/visual-truth.mjs` — ground-truth capture + invariant report.
- `tests/layout-invariants.spec.js` — the automated layout-invariant gate.
- `docs/visual-inspection-process-2026-07-08/PROCESS.md` — this document.
