# Layering Strategy — Master Roadmap (2026-04-27)

**Status:** v2 (re-synthesized with all 9 sibling reports complete)
**Author:** A10 (synthesis)
**Horizon:** 6–12 months (P0/P1) + Q3 2026 outlook (P2/P3)
**Inputs:** A1-A9 (complete) + L1-L5 / R1-R4 prior audit + PRs #339, #340, #341
**Supersedes:** A10v1 partial (only A6 was complete at v1 write-time)

---

## Where we are today (one paragraph)

Across April 26–27 we shipped four PRs (#339 portal-attempt-1, #340 portal-attempt-2 with `createPortal`, #341 the actual fix that moved 12 z-index tokens from a silently-ignored `tailwind.config.js` v3 stub into Tailwind v4 `@theme inline`). The mega-menu trap is closed: the dropdown is portaled to `document.body`, the header is at an explicit `z-40`, and 12 semantic z-tokens emit real CSS for the first time in ~6 months. **Three latent issues remain from the #341 renumber** (ComparisonWidget intent inversion, blog scroll-progress trapped under header, Reviews banner tied with header at z-40), and the codebase has zero CI gating to catch the next instance of any of these regressions. Tailwind v4 itself is now certified clean (A4); the `@theme` block holds. The shadcn primitives are stable at `z-50` and we should design around them, not refactor them.

---

## 1. Top-priority next actions (ranked by ROI)

### P0 — This week (5–7 hours total)

These are the items where the cost of *not* doing them is concrete and actively bleeding: live UI is broken or guaranteed to regress.

#### P0.1 — Adopt A1's redesigned z-scale + fix the 3 latent issues from #341 (~90 min)

**Source:** [A1 §3, §6, §9](./A1-zscale-design.md)

Replace the current `App.css` `@theme inline` z-block with A1's 16-token canonical scale. This is the **single change that fixes all three latent issues simultaneously** because they're all tokenized — only the values move:

```css
@theme inline {
  /* Band A — under/at flow */
  --z-index-behind:           -1;
  --z-index-base:              0;

  /* Band B — in-page elevated content */
  --z-index-content:          10;

  /* Band C — site chrome */
  --z-index-sticky:           20;
  --z-index-fixed-low:        30;
  --z-index-header:           40;
  --z-index-banner:           45;   /* NEW — fixes Reviews tie */

  /* Band D — Radix/shadcn overlays (anchored at 50) */
  --z-index-modal-backdrop:   49;
  --z-index-modal:            50;   /* IMMOVABLE — Radix anchor */
  --z-index-comparison:       55;   /* WAS 35 — fixes Issue #1 */

  /* Band E — notifications & guidance */
  --z-index-popover-elevated: 60;
  --z-index-toast:            70;
  --z-index-tooltip:          80;
  --z-index-progress-bar:     90;   /* NEW — fixes Issue #2 */

  /* Band F — ceiling */
  --z-index-skip-link:       100;
  --z-index-debug:           999;
}
```

Plus the 7 per-element edits in [A1 §6](./A1-zscale-design.md#6-per-element-reassignments) — every one is a 1-line className swap, no logic changes.

**Why this beats A10v1's approach.** A10v1 proposed reusing `z-overlay` for the progress bar and bumping it to a higher value. **A1's approach is better** because:
1. It introduces a *dedicated* `progress-bar:90` semantic token rather than overloading `overlay`. Overlay/banner are conceptually distinct (backdrop vs. promotional bar) — keeping them as separate tokens prevents the next dev from making the same overload mistake.
2. It introduces `banner:45` for the Reviews sticky bar, which is the third issue A10v1 sidestepped.
3. It anchors everything around the immovable Radix `z-50`, making the scale stable for shadcn upgrades.
4. The migration is *additive*: 4 new tokens, 3 renames, 3 value changes, 0 deletions. Old tokens can be aliased for one release if needed.

**Conflict resolved:** A1 wins on every sub-decision. A10v1 was operating without A1's research.

**Effort:** 90 min (token block + 7 element edits + Vercel preview verify).
**Impact:** Closes 3 latent visual bugs (comparison overlap, scroll progress trap, banner tie). Establishes the 6-12 month canonical scale.

---

#### P0.2 — Ship the lint catch-net (A7's bundle + A2's shell rule) (~3 hours)

**Source:** [A7 §3](./A7-lint-static.md#3-the-four-rules-to-ship-concrete-configs) + [A2 §6.1](./A2-stacking-discipline.md#61-eslint-rule-1--ban-transform-style-props-on-layout-shell)

**Conflict resolved (A2 vs A7 lint rules):** Not actually conflicting — they're complementary. Ship the full A7 bundle (Rules 1–4) **plus** A2's `no-shell-stacking-context` rule. Both cover the layout-shell trap, but from different angles:

| Rule | Source | Catches |
|------|--------|---------|
| **`scripts/verify-z-classes.mjs`** | A7 Rule 1 | Bug #341 class-of-bug — token defined in source but missing from compiled CSS. **The killer rule.** Build-time check, runs in CI/Vercel. |
| `no-restricted-syntax`: ban `z-{number}` literals in JSX | A7 Rule 2 | Raw `z-50` outside `src/components/ui/`. Forces semantic tokens. |
| `no-restricted-syntax`: ban transform/opacity/filter on shells | A7 Rule 3 | The PR #339 trap — `style={{ opacity }}` on `<header>`. |
| `eslint-plugin-better-tailwindcss` `no-unregistered-classes` (warn) | A7 Rule 4 | In-editor v3→v4 typo detection. |
| Custom `no-shell-stacking-context` ESLint rule | A2 §6.1 | Same scope as A7 Rule 3 but ALSO catches `<motion.header>`, `<motion.main>`, and `motion.*` member-expression element types. Adds Tailwind utility-class detection (`backdrop-*`, `mix-blend-*`, `contain-*`). |

A7 Rule 3 is selector-based (concise but `motion.header` requires a separate selector). A2's rule is a full custom plugin with a richer pattern list and clearer error messages. **Ship both:** A7 Rule 3 catches the common case in 2 lines of config; A2's custom rule is the belt-and-suspenders that catches the long tail.

**Build script wire-up (A7 Rule 1):**
```jsonc
// package.json
"scripts": {
  "build": "node scripts/validate-posts.js && node scripts/generate-blog-canonicals.js && node scripts/generate-sitemap.js && vite build && node scripts/verify-z-classes.mjs && node scripts/prerender-blog-posts-enhanced.js && node scripts/prerender-main-pages.js"
}
```

**Effort:** 2.75 hrs (A7) + 30 min (A2 shell rule integration) = ~3 hours.
**Impact:** Structurally prevents PR #339, #340, #341 class of bugs from reaching `main`. The build-time check (`verify-z-classes.mjs`) is the single highest-leverage item in the entire roadmap — it makes the v3→v4 silent-ignore bug *impossible* to ship.

---

#### P0.3 — Document the latent-issue fix in CLAUDE.md (~30 min)

**Source:** [A9 §7](./A9-documentation.md#7-lessons-codified-as-claudemd-pattern-entries)

Append A9's three paste-ready Pattern entries (#14 stacking-context trap, #15 Tailwind v4 `@theme`, #16 renumbering inverts relationships) to `CLAUDE.md`. These three patterns crystallize the lessons from PRs #339, #340, #341 in the form the project's existing conventions expect.

**Effort:** 30 min (paste, light edits to match house style).
**Impact:** Future Claude sessions and human contributors get the rules at the top of every conversation. Without this, the next layering bug costs 4+ hours; with it, 30 minutes.

---

### P1 — This month (12–18 hours total)

These are high-leverage items independent of any active bug, recommended for the next 4 weeks.

#### P1.1 — Tier-1 visual-regression CI (Playwright behavioural assertions) (~3 hours)

**Source:** [A3 §3, §4](./A3-visual-regression.md#3-recommended-ci-gate-tier-1--ship-this-week)

Five Playwright tests using `getComputedStyle()` and `elementsFromPoint()` — no screenshot baselines, no SaaS, $0/mo. Catches all 5 of the bugs we shipped in the last 30 days *and* the 3 latent issues. CI runtime ~90 sec per PR.

The crucial design decision: **do not jump to `toHaveScreenshot()` or Argos.** A3's analysis is right — 4 of 5 bugs are *behavioural* (z-index value, stacking order at a coord, dropdown actually on top). DOM assertions catch them with zero false positives. Pixel diffs are conditionally added in P2 if Tier 1 misses something over 4 weeks.

**Tests to ship:**
1. Header has explicit z-index ≠ `auto` (catches PR #341).
2. Topics dropdown is on top when hovered (catches PR #339/#340).
3. No two fixed/sticky siblings share the same z-index (catches Reviews banner tie).
4. Scroll progress bar reachable at viewport y=2 (catches blog-progress trap).
5. Header z-index matches `--z-index-header` CSS custom property (catches token desync).

Plus a `.github/workflows/layering-check.yml` that mirrors the existing `lockfile-check.yml` pattern.

**Effort:** 3 hours.
**Impact:** Closes the loop. Combined with P0.2's lint, every regression class we've seen is now caught at PR review.

---

#### P1.2 — Adopt A2's stacking-discipline (the 7 Rules) for the layout shell (~2 hours)

**Source:** [A2 §3, §4](./A2-stacking-discipline.md#3-layout-shell-template-the-discipline-codified)

Add the 7 stacking-discipline rules to `CLAUDE.md` (separate from A9's three patterns — the Rules are operating procedure, the Patterns are war-stories). Add the inline comment block to `Layout.jsx` reaffirming "shell is inert; effects live in sections."

This is *organizationally* P1, not P0, because nothing is currently broken — the discipline is preventive. But it's the framework that makes P0.2's lint rules legible.

**Effort:** 2 hours (paste rules into CLAUDE.md + add the runtime `warnIfTrapped` dev helper from A2 §6.3).
**Impact:** Future devs (Claude or human) get a checklist they can apply during PR review without re-deriving stacking-context theory. Pairs with P0.2's lint rules: lint catches the bug after it's written; the 7 Rules prevent it from being written.

---

#### P1.3 — A8 design-token quick wins (95 min)

**Source:** [A8 §7](./A8-design-tokens.md#7-quick-wins-1-hour-each)

Six pure-additive design-token wins — completely independent of layering. None move existing values. Adopt because they cost ~95 min total and unlock the rest of A8's Phase 2 plan:

1. Add 4 animation duration tokens (`--duration-{fast,normal,slow,slower}`) — 15 min
2. Add 4 ease tokens (`--ease-{standard,decelerate,accelerate,spring}`) — 15 min
3. Add `--spacing-touch: 2.75rem` + `--spacing-touch-lg: 3rem` — 10 min
4. Add `--container-{prose,content,wide,page}` — 15 min
5. Add `--color-brand` + `--color-brand-hover` aliasing existing greens — 30 min
6. Extend radius ramp with `--radius-xs` (4px) and `--radius-3xl` (24px) — 10 min

**Effort:** 95 min. **Impact:** Establishes design vocabulary; foundation for any future design-system work; zero migration risk. Recommended for inclusion in this month because it pairs naturally with the `@theme` edit happening in P0.1.

---

#### P1.4 — Delete `tailwind.config.js` stub (~10 min)

**Source:** [A4 §"Recommended follow-up"](./A4-tailwind-v4-audit.md)

The stub serves no functional purpose post-#341. The header comment helps but deletion is stronger — it removes the temptation for a future contributor to add `theme.extend` thinking it works.

**Effort:** 10 min (delete file + verify build).
**Impact:** Removes a footgun. Pure deletion (Pattern #6, #10).

---

### P2 — This quarter (15–20 hours total)

Bigger refactors. None blocks anything; all are organizational improvements.

#### P2.1 — Optional: A6's Option-A z-50 refactor (defer or skip)

**Source:** [A6 §"Recommendations"](./A6-component-zaudit.md#recommendations)

A6 recommends refactoring 21 shadcn `ui/*` files from raw `z-50` to semantic classes (`z-dialog`, `z-tooltip`, etc.).

**Conflict resolved (A6 vs A1):** A1 is correct. **Don't fight Radix** — `z-50` is the Radix anchor and we *design around it*, not refactor it. The 21 files are vendored code regenerated by shadcn upgrades; touching them creates merge conflicts every time we update a primitive.

A1's stance ("21 z-50 elements are immovable; the scale lives below at chrome and above at notify") is the right architecture. A6's refactor would deliver semantic clarity at the cost of a permanent maintenance burden every shadcn version bump.

**Verdict:** **Skip**, or do only after a shadcn version that exposes a config-level z-index option (none exists today). The lint rule from P0.2 already exempts `src/components/ui/**`, so the raw `z-50` literals there don't violate the discipline.

---

#### P2.2 — A8 Phase 2 design-token migration (6–10 hours)

**Source:** [A8 §4 Phase 2](./A8-design-tokens.md#phase-2--this-month-effort-m-6-10-hours-total)

Brand color system (Phase 2A), animation tokens migration of existing `duration-*` callsites (Phase 2B), typography semantic ramp on 3 proof-of-concept components (Phase 2C). Builds on P1.3's quick wins.

**Why P2 not P1:** Phase 2 is a *migration*, not an addition — touches 15+ component files. Worth doing this quarter to unblock dark-mode parity (currently half-broken because brand greens are stock Tailwind, not aliased), but no current bug forces it.

**Effort:** 6–10 hours. **Impact:** Brand color tweak goes from "~50 file edits" to "1 token edit"; dark mode becomes consistent across brand surfaces.

---

#### P2.3 — Tier-2 visual-regression baselines IF Tier-1 misses regressions (6 hours)

**Source:** [A3 §5, §7](./A3-visual-regression.md#5-tier-2--visual-baselines-add-only-if-behavioural-tests-miss-something)

Conditional. If P1.1 catches <70% of layering regressions over 4 weeks, add Playwright `toHaveScreenshot()` for 4 routes × 2 viewports = 8 baselines. Free, baselines committed to git.

**Effort:** 6 hours. **Impact:** Catches widget visual regressions that don't change z-index. Don't ship preemptively — Pattern #3 (pilot first).

---

### P3 — Someday (future quarters)

Things to revisit when their preconditions are met. Don't do these now.

#### P3.1 — Native Popover API + CSS Anchor Positioning migration

**Source:** [A5 §5](./A5-native-popover.md#5-recommendation-stay-with-createportal-for-now-migrate-when-ios-26-reaches-95-of-our-mobile-traffic)

A5's recommendation: **stay with `createPortal` for now**. CSS Anchor Positioning needs Safari 26+ (Sept 2025) which is ~76-85% adoption — the iOS 17/18 long tail makes a native rollout require ugly `@supports` fallback CSS.

**Migrate when ALL of these are true** (likely Q4 2026 – Q1 2027):
- iOS 26+ adoption ≥ 95% of mobile traffic (PostHog-trackable)
- Radix UI ships native popover internally (currently stalled at issue #2941)
- A new requirement appears that *needs* top-layer (e.g., adding `transform` to header)

**Conflict resolved (A5 vs A1):** Not actually conflicting. A1's `z-progress-bar:90` is for our reading-progress bar; A5's "stay with portal" is for the mega-menu dropdown. Both apply simultaneously — the progress bar gets a token; the dropdown stays portaled.

---

#### P3.2 — A8 Phase 3 (full design-token coverage)

**Source:** [A8 §4 Phase 3](./A8-design-tokens.md#phase-3--next-quarter-effort-l-15-20-hours)

Shadow elevation scale, full neutral ramp + text-token migration (~593 `text-gray-*` callsites), long-tail brand-color migration (~440 `bg-green-*` callsites), border tokens, component-tier tokens for the top 5 components.

**Effort:** 15–20 hours over 4–6 weeks. **Trigger:** completion of P2.2 + dark-mode parity decision.

---

## 2. Risk register

What goes wrong if we *don't* do each priority.

| Priority | If skipped | Probability | Severity | Time to surface |
|---|---|---|---|---|
| **P0.1 — A1 z-scale fix** | 3 visible UI bugs persist: comparison widget hidden under header on small viewports, blog reading-progress bar invisible to users on Safari (clipped under header's backdrop-blur), Reviews sticky banner ties with header at z-40 → DOM-order-flaky | **100% — they're already shipped** | Medium (UX, not data loss) | Already happening |
| **P0.2 — Lint catch-net** | The next Tailwind major upgrade (or a typo'd `z-haedr`) silently ships broken. We discover it when crawlers hit a page where the header doesn't paint above page content. | High (4-6 month interval based on 2025 history) | High — repeats the #341 cascade (was unfixed for 6 months) | Months |
| **P0.3 — CLAUDE.md patterns** | Next stacking-context bug costs 4+ hrs of investigation. Pattern #14 reduces it to 30 min. | High (1-2 incidents/quarter based on rate of UI work) | Low–Medium individual cost; compounds | Per incident |
| **P1.1 — Visual-regression Tier 1** | Lint catches static patterns; runtime catches behavioural truth. Without it, a `motion.div` somewhere creates a stacking-context trap that lint can't see. | Medium | High (visible UI breakage at user level) | 1-2 months |
| **P1.2 — A2 7 Rules** | Devs without context re-introduce shell-effect traps. Lint partially covers, but lint is a backstop, not training. | Medium | Medium | 2-4 months |
| **P1.3 — A8 quick wins** | None. Pure additive; cost of skipping = zero design-system foundation when we want it later. | Low | Low | N/A |
| **P1.4 — Delete config.js stub** | Future contributor adds `theme.extend.something` thinking it works. We re-discover the bug. | Low–Medium | Medium (#341 was a 6-month outage) | 6+ months |
| **P2.1 — A6 z-50 refactor** | None. Don't do this — it actively *creates* maintenance burden every shadcn upgrade. | n/a | n/a | n/a |
| **P2.2 — A8 Phase 2** | Brand color tweaks remain ~50-file changes. Dark mode stays half-broken. | Low (UX rather than functional) | Low | When dark mode is prioritized |
| **P3.1 — Native popover** | Long tail Safari users get fallback CSS. We control the header so the trap is preventable without anchor positioning. | Low (no current trigger) | Low | 12+ months |

---

## 3. Effort × Impact matrix

| Priority | Effort (hrs) | Impact (1-5) | Risk reduction (1-5) | ROI rank |
|---|---|---|---|---|
| **P0.1** A1 z-scale + 7 element edits | **1.5** | 5 (closes 3 active bugs) | 5 | **1** |
| **P0.2a** A7 Rule 1 verify-z-classes.mjs | **0.5** | 5 (kills the v3→v4 bug class) | 5 | **2** |
| **P0.2b** A7 Rules 2-4 + A2 shell rule | **2.5** | 4 | 4 | **3** |
| **P0.3** CLAUDE.md patterns #14/#15/#16 | **0.5** | 4 (org leverage) | 3 | **4** |
| **P1.1** Tier-1 Playwright invariants | **3** | 5 (catches behavioural bugs) | 5 | **5** |
| **P1.2** A2 7 Rules + dev warning | **2** | 3 | 3 | **6** |
| **P1.3** A8 quick wins | **1.5** | 3 (vocabulary) | 1 | **7** |
| **P1.4** Delete config.js stub | **0.2** | 2 | 2 | **8** |
| **P2.1** A6 z-50 refactor | n/a (skip) | n/a | n/a | — |
| **P2.2** A8 Phase 2 migration | **8** | 4 (dark-mode parity) | 1 | **9** |
| **P2.3** Tier-2 visual baselines (conditional) | **6** | 2 (only what Tier 1 misses) | 2 | **10** |
| **P3.1** Native popover | **3** | 1 | 1 | — |
| **P3.2** A8 Phase 3 | **17** | 3 | 1 | — |

**Cumulative phase totals:**
- P0 total: ~5 hours
- P1 total: ~7 hours (8.7 incl. delete)
- P2 total (excl. skip): ~14 hours conditional
- P3 total: ~20 hours

**P0 + P1 = ~12.5 hours** — that's the next 30 days of layering work. Everything beyond that is conditional or nice-to-have.

---

## 4. The single Monday-morning action

**Ship P0.1 + P0.2a in one ~2-hour session, in this order:**

1. **(0–10 min)** Read [A1 §4 the paste-ready `@theme` block](./A1-zscale-design.md#4-the-full-theme-block-to-ship-paste-ready) and [A1 §6 the 7 element edits](./A1-zscale-design.md#6-per-element-reassignments-fixing-the-3-latent-issues--cleanup).
2. **(10–25 min)** Replace `src/App.css` `@theme inline` z-block with A1's 16-token canonical scale.
3. **(25–55 min)** Apply the 7 per-element edits (`ComparisonWidget`, `MobileComparisonWidget`, `NewBlogPost.jsx:719`, `Reviews.jsx:1139`, `DosageCalculatorEnhanced.jsx:802` and `:377`, `StickyMobileCTA.jsx:72`, plus skip-link CSS).
4. **(55–85 min)** Drop in `scripts/verify-z-classes.mjs` ([A7 §3 Rule 1](./A7-lint-static.md#rule-1--ci-build-time-check-scriptsverify-z-classesmjs-primary)) and wire it into `package.json` build pipeline before prerender scripts.
5. **(85–105 min)** Run `npm run build` locally — verify the script exits 0 with output `[verify-z-classes] OK — N classes verified`. Push to a feature branch, watch the Vercel preview, eyeball /reviews, /compare, and a blog post for the 3 latent issues.
6. **(105–120 min)** Open PR, copy the [A1 §3](./A1-zscale-design.md#3-proposed-canonical-scale) summary into the PR body, ship.

**Why this combination is the highest-ROI 2-hour spend:**
- P0.1 fixes 3 active bugs — visible to users *today*.
- P0.2a (the build-time check) makes the v3→v4 class of bug structurally impossible going forward.
- Both are pure CSS / pure script — no logic changes, no new dependencies, no risk of new bugs.
- Vercel preview catches anything that goes wrong before merge.

Everything else in this roadmap is sequenceable from there.

---

## 5. Conflict resolution log

Recording where sibling agents disagreed and how this synthesis resolves each.

| # | Conflict | Agents | Resolution | Why |
|---|---|---|---|---|
| 1 | **Latent-issue token approach.** A1 proposes new dedicated tokens (`progress-bar:90`, `banner:45`); A10v1 reused `z-overlay`. | A1 vs A10v1 | **Adopt A1.** Dedicated tokens prevent the next dev from making the overload mistake; A10v1 was operating without A1's research. Detailed in [A1 §3.1, §6](./A1-zscale-design.md). | Semantic clarity > token economy; new tokens are free in Tailwind v4. |
| 2 | **Lint rule architecture.** A2 has one big custom rule (`no-shell-stacking-context`); A7 has 4 separate rules. | A2 vs A7 | **Ship both.** They're complementary, not competing — A7 covers literal patterns, A2 covers framer-motion + Tailwind utilities. Total cost is 2.75 hrs (A7) + 30 min (A2 integration) = ~3 hrs. | Defense in depth: one missed catch by either ruleset still fails on the other. |
| 3 | **A6's z-50 refactor vs A1's "Radix anchor at modal:50 immovable."** A6 recommends Option A (refactor 21 ui/* files); A1 says don't fight Radix. | A6 vs A1 | **Adopt A1.** Skip A6's refactor. The lint rule from P0.2 exempts `src/components/ui/**`. | A6 underweighted the perpetual merge-conflict cost on every shadcn upgrade. A1's design-around approach is sustainable. |
| 4 | **Native popover vs portal.** A5 says stay with portal; A1 introduces `z-progress-bar:90` for a different element. | A5 vs A1 | **Both apply (no actual conflict).** A5 is for the mega-menu dropdown (stay portaled until iOS 26 is 95%). A1 is for the reading-progress bar (gets its own token now). | Different elements, different problems, different solutions — both right. |
| 5 | **A8 design-tokens scope.** A8 proposes 3 phases (already done / Phase 2 / Phase 3). | A8 standalone | **Phase 2A quick wins only in P1.** The 95-min subset is pure additive; the full Phase 2 migration is P2 because it touches 15+ files. | Pattern #3 — pilot the additions, defer the migrations. |
| 6 | **Visual regression depth.** A3 proposes 3 tiers conditionally. | A3 standalone | **Tier 1 only in P1.** Tier 2/3 are conditional on Tier 1 falling short. | Pattern #3 again — pilot first. Don't add SaaS or pixel-diff baselines preemptively. |

---

## 6. Document map

For navigation:

| Doc | What it covers |
|---|---|
| [A1-zscale-design.md](./A1-zscale-design.md) | The canonical 16-token z-scale + all 3 latent-issue fixes. **The single most important sibling.** |
| [A2-stacking-discipline.md](./A2-stacking-discipline.md) | The 7 Rules + ESLint custom rule + dev-mode runtime warning. |
| [A3-visual-regression.md](./A3-visual-regression.md) | The 3-tier CI strategy; ship Tier 1, defer 2/3. |
| [A4-tailwind-v4-audit.md](./A4-tailwind-v4-audit.md) | Clean — only optional cleanup is deleting `tailwind.config.js` stub. |
| [A5-native-popover.md](./A5-native-popover.md) | Defer native popover. Revisit Q4 2026 / Q1 2027. |
| [A6-component-zaudit.md](./A6-component-zaudit.md) | 21 z-50 elements catalogued. **A1 supersedes A6's recommendation** — design around, don't refactor. |
| [A7-lint-static.md](./A7-lint-static.md) | 4 lint rules, ~2.75 hrs total. The build-time `verify-z-classes.mjs` is the killer. |
| [A8-design-tokens.md](./A8-design-tokens.md) | 6 quick wins (~95 min P1) + Phase 2 (P2) + Phase 3 (P3). |
| [A9-documentation.md](./A9-documentation.md) | The canonical reference doc for layering. Source of CLAUDE.md Patterns #14, #15, #16. |
| **This file (00-ROADMAP.md)** | Master prioritization. Read first. |

---

**End of roadmap.** When you ship a P0/P1 item, edit this file's effort table and risk register to mark it done. When new layering issues surface, add them to the priority list with their A-source citation.
