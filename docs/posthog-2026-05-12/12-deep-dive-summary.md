# Deep-dive synthesis: B-series 10-agent investigation

**Date**: 2026-05-12. Investigation of the P0/P1 findings from the A-series 10-agent PostHog assessment.

---

## 1. Headline: four A-series findings significantly REFRAMED

The first 10-agent pass surfaced findings that, on deep investigation, look quite different:

| A-finding | A-verdict | B-verdict |
|---|---|---|
| A2: Mobile r30 +38.5pp jump is "possibly real UX win" | Open question | **Mostly emission artifact (B9, 4/5).** Don't report to stakeholders. |
| A7: −68% sitewide Google referrer is "the elephant" | Confidence 3/5 | **93% bot variance (B6, 4/5).** Real-user Google referrer is −16%; total real-user PV is −37%. |
| A8: 16 of 22 converters "never hit /reviews PV" — funnel broken | Confidence 3/5 | **Not a behavior issue (B5, 4/5).** A tracking bug — `pushState` in `mobileScrollUtils.js` doesn't fire `$pageview`. Users DO visit /reviews. |
| A9: GABA slug −95% PV is "likely a PR #367 redirect bug" | P0 today | **No bug exists (B1, 5/5).** URL is healthy end-to-end. Likely SERP-decay + small-n on a 19-PV baseline. |

The other A-findings hold. The "/reviews mobile UX won" remains the cleanest real result. Real-user dead-click drop ~50% holds. Continue-Your-Research footer failure holds (and B7 strengthens it).

---

## 2. Code patches ready to apply (all single-file, no mass edit)

| # | File | Change | Lines | Source | Conf |
|---|---|---|---|---|---|
| **1** | `src/lib/posthog.js` line 47 | **Delete** `element_allowlist: [...]` array | −1 / +0 | B2 | 4/5 |
| **2** | `src/pages/Guide.jsx` line 361 | **Delete** `hover:shadow-lg transition-all duration-300` from Card | −1 / +0 | B3 | 5/5 |
| **3** | `src/pages/Reviews.jsx` line 470 | Change `data-placement="comparison_table"` → `data-placement="action_column"` | +0 / +0 (1-line swap) | B4 | 5/5 |
| **4** | `src/App.jsx` lines 62-64 | Add `posthog.capture('$pageview')` inside existing `useEffect([currentPath])` | +6 | B5 | 4/5 |
| **5** | `src/newblog/data/posts/dhm-dosage-guide-2025.json` | Replace dose-only table with hybrid dose+product table (4 inline /reviews links); optionally remove from `REVIEWS_CTA_SKIP_SLUGS` in `NewBlogPost.jsx:30-32` | ~30 (single JSON) | B8 | 4/5 |

Each patch is in its respective B-series deliverable. Total impact:
- Fix #1 restores `$rageclick` instrumentation site-wide (probably ~10-30 events/14d once active)
- Fix #2 removes hover-trap on one of the highest-dead-click elements
- Fix #3 makes the action-column "Check Price" button measurable in PostHog
- Fix #4 restores accurate `$pageview` for ~16 of 22 converting sessions, repairs A8's "broken funnel" measurement
- Fix #5 targets the single biggest monetization gap on the site (161 PV → 0 affiliate clicks). Expected 2-4× CVR lift.

---

## 3. Code-hygiene cleanup (11+ files, but each a single-line edit)

B3 discovered the `Card hover:shadow-lg` anti-pattern in **~11 additional locations** outside `/guide`: Home.jsx (×2), About.jsx (×2), Research.jsx (×3), Reviews.jsx, DosageCalculatorEnhanced.jsx (×2), UserTestimonials.jsx. Each is a single-line `hover:shadow-lg transition-all duration-300` removal. Plus the deferred Research.jsx:505 fix from the prior RCA (wrap `<Card>` in `<a href={study.pubmedUrl}>` since each study has a real destination).

These can be one PR. None of these are post JSONs, so the mass-edit moratorium does not apply.

---

## 4. The mass-edit decision

**B6 + B7 converge on the same answer.** B6 found the real-user dip is most likely a Google recrawl wave triggered by PR #246/#359 (Continue-Your-Research footer mass-edited 197 posts on 2026-04-29 — exactly the pattern the moratorium #370 was created to prevent, but #370 merged 4 hours too late). B7 found the footer itself is duplicate-footprint SEO poison: identical content on 197 posts, ~788 redundant internal links pointing to 4 destinations.

**The pure-deletion fix is correct, AND the fix is itself a mass edit.**

Two options:

| Option | Approach | Risk |
|---|---|---|
| **A — Wait** | Let Google's natural 2-8 week recrawl cycle re-evaluate the corpus. Don't lift the moratorium. Use the time to clean code-hygiene + ship the single-file fixes above. | Slowest. The duplicate footprint may continue dragging quality signals. |
| **B — Remove now with `[mass-edit-allowed]` rationale** | Open a PR titled "Remove Continue-Your-Research footer from 197 posts (corpus cleanup, refs #366)". Body cites B6/B7 findings + the DCNI recovery context. The moratorium policy explicitly allows this with rationale. | Triggers another recrawl wave — adds noise to the recovery measurement. Compounds short-term traffic instability. |

**Recommendation: Option A.** The moratorium exists precisely to prevent this scenario; bypassing it within 2 weeks would undermine the policy. Re-evaluate at the natural 2026-07-15 moratorium expiry — by then the prior recrawl will have settled. In the interim, ship the single-file fixes and do the 5-slug DELETE pilot from `docs/dcni-2026-04-29/buckets.md` (under the 20-file cap, doesn't trigger the moratorium guard).

---

## 5. Ralph hook — fixed

`specs/.current-spec` and `specs/issue-366-moratorium/.ralph-state.json` and `specs/issue-366-moratorium/.progress.md` survived PR #370's merge with `phase: "complete"` + `quickMode: true`. The `stop-watcher.sh` hook's predicate (`QUICK_MODE=true && PHASE!=execution`) treated `"complete"` as a non-terminal phase name and blocked every stop. B10 deleted the three gitignored files (spec artifacts preserved per CLAUDE.md policy). Hook replay against cleaned state exits with no `block` JSON.

Upstream bug noted: the quick-mode predicate should *whitelist* progress phases, not *blacklist* `execution`, or any coordinator crash between "mark phase=complete" and "delete state file" leaves the same poison pill. File this upstream with ralph-speckit/specum plugin.

---

## 6. Final P0 / P1 prioritized action list (post deep-dive)

### Today (single-file fixes — no risk)
1. Apply patch #1 (`src/lib/posthog.js` — remove element_allowlist) → restores $rageclick site-wide
2. Apply patch #2 (`src/pages/Guide.jsx:361` — remove hover styles) → kills /guide dead-click hotspot
3. Apply patch #3 (`src/pages/Reviews.jsx:470` — fix data-placement) → makes action-column measurable
4. Apply patch #4 (`src/App.jsx:62-64` — fire $pageview on SPA navigation) → repairs funnel measurement
5. Apply patch #5 (`dhm-dosage-guide-2025.json` — hybrid table) → unlocks 161 PV → 0 click gap

### This week (one PR, code-hygiene)
6. Sweep 11+ remaining `Card hover:shadow-lg` anti-patterns site-wide
7. Implement the deferred `<Card>` → `<a>` wrap on `Research.jsx:505`
8. De-dupe `comparison_tab`/`comparison-tab` event names

### This month (SEO/content)
9. 5-slug DELETE pilot from `docs/dcni-2026-04-29/buckets.md` (under moratorium cap)
10. Track DCNI Recovery Watchlist dashboard weekly (PR #371)

### At moratorium expiry (2026-07-15)
11. Remove the Continue-Your-Research footer from 197 posts (B7's pure-deletion recommendation)

### Re-measurement (don't do anything but watch)
12. May 19: clean engagement baseline (past PR #269 ramp)
13. May 26: confirm /reviews mobile lift sticks at 28d
14. Jun-Jul: GSC indexing for 4 HowTo guides + 2 promoted pillars

---

## 7. Things that aren't problems (cancelled P0s)

- **GABA slug "redirect bug"** — no bug exists. Don't 301.
- **"Time on page is up"** — was an artifact; mobile r30 jump also an artifact. Don't claim wins on time-on-page yet.
- **"Funnel is broken / 16 of 22 skip /reviews"** — was a tracking bug, not user behavior. Patch #4 fixes the measurement.
- **"−68% sitewide Google referrer / SEO crisis"** — was 93% bot variance. Real-user dip is moderate (−16% Google referrer / −37% total) and aligns with the mass-edit recrawl wave, not a structural SEO collapse.

---

## 8. Confidence in the deep-dive overall

**4/5.** B-agents validated each other and overlapped cleanly — B6 + B7 converge on the mass-edit recrawl wave; B5 explains A8's "broken funnel"; B9 closes the last open question from A2. The reframings are stronger evidence than the original framings because each B-agent verified directly against PostHog data + source code rather than working from the A-summary alone.

The 5 single-file patches are low-risk and ready to apply. The mass-edit footer removal is the right move but should wait for the natural moratorium window.

---

## Agent reports

| # | Agent | File | One-line finding |
|---|---|---|---|
| B1 | GABA redirect | `B1-gaba-redirect.md` | No bug. URL healthy. SERP decay + small-n. |
| B2 | $rageclick | `B2-rageclick.md` | `element_allowlist` blocks rage detection on `<div>`/`<Card>`. 1-line delete fix. |
| B3 | /guide hotspot | `B3-guide-hotspot.md` | Guide.jsx:361 confirmed. 11+ similar patterns site-wide. |
| B4 | Action column | `B4-action-column.md` | Reviews.jsx:470 — one attribute change. |
| B5 | Affiliate path | `B5-affiliate-path.md` | pushState in mobileScrollUtils.js doesn't fire $pageview. 6-line fix. |
| B6 | Organic collapse | `B6-organic-collapse.md` | 93% bot variance; real-user dip −16% Google referrer, recrawl-wave hypothesis. |
| B7 | CYR footer RCA | `B7-cyr-footer-rca.md` | Remove footer (pure deletion). Duplicate-footprint SEO poison. |
| B8 | CVR variance | `B8-cvr-variance.md` | dosage guide in `REVIEWS_CTA_SKIP_SLUGS`. Smoking gun. |
| B9 | Mobile r30 | `B9-mobile-r30.md` | Mostly emission artifact. Don't report to stakeholders. |
| B10 | Ralph hook | `B10-ralph-hook-cleanup.md` | Stale state deleted. Hook fixed. Upstream bug filed conceptually. |
