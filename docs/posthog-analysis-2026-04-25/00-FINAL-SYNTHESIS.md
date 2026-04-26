# PostHog Analysis → Action — Final Synthesis

**Date:** 2026-04-26
**Window analyzed:** Apr → 25, 2026 (PostHog project 275753)
**Total agents:** 10 analysis + 5 P0 + 3 investigation + 10 R-batch = **28**
**Branches produced:** 12 (2 already pushed: `fix/time-on-page-milestone`, `fix/flyby-comparison-pages`)

---

## What we found (corrected)

The Apr 11 traffic spike (+78% PV, +93% affiliate clicks) was a **Google ranking event** lifting the entire `/never-hungover/*` cluster — confirmed by 81.7% of growth being Google organic, distributed across the cluster on a single day. Already decelerating (peak Apr 17, back near baseline by Apr 25). Mostly desktop (+104%); mobile flat in volume but converts 2.9× better per session.

**Two things in the original master synthesis were wrong:**

1. **The "38.5% click failure rate" was a measurement artifact.** PostHog's `$dead_click` heuristic false-fires on `target="_blank"` links because the source tab doesn't change. X3's pairing analysis: 100% of Amazon dead-clicks had a paired `affiliate_link_click` within ±5s. X2 confirmed at code level. X1 reproduced and identified PostHog's `_is_bot()` UA suppression as the reason Agent D's Playwright test got zero events.
2. **The "dhm-vs-zbiotics −31% decline" was a measurement artifact.** R8 found Google traffic to that page actually grew **+238%** like its peers; the trailing-30-day window comparison happened to capture a March direct-traffic anomaly in the "before" window. The page is healthy.

**One thing was hidden under the spike noise:**

3. **Engagement event volume crashed Apr 7** (`time_on_page_milestone` from ~70/day to ~10/day). PR #261 silently re-shipped a `Math.random() < 0.1` sampling gate. Fixed (B).

---

## Branches ready to merge

Sorted by recommended merge order:

| # | Branch | Status | Commit | What it does |
|---|---|---|---|---|
| 1 | `fix/time-on-page-milestone` | **PUSHED** | `369dd0b` | Removes 10× sampling gate from engagement tracking. Recovers full event volume. Pure deletion. |
| 2 | `fix/flyby-comparison-pages` | **PUSHED** | `d2b6b09` | flyby-vs-cheers (#4 traffic) + flyby-vs-good-morning-pills now render content (was blank). |
| 3 | `fix/canonical-script-404` | local | `29cb210` | Removes broken `/canonical-fix.js` reference that's been throwing `SyntaxError` on every page load for ~6 months. Could be hurting SEO via INP/Core Web Vitals. |
| 4 | `fix/comparison-posts-schema-audit` | local | `d43c5af` | 3 more comparison posts converted from broken array schema to markdown (was 0% scroll-50). |
| 5 | `fix/widget-attribution-and-mobile-menu` | local | `b06e18b` | `data-product-name` uses canonical `name` field; mobile-menu event name unified to snake_case. |
| 6 | `fix/affiliate-regex-and-urls` | local | `f36e8dc` | Fuller Health link now tracked (was silently lost); 2 placeholder Amazon URLs replaced with real `amzn.to` links. |
| 7 | `fix/affiliate-button-audit` | local (amended) | `cdb436c` | Inline blog Amazon links now tagged with proper `rel`/`data-placement`. **Needs `git push --force-with-lease`** since commit was amended. |
| 8 | `fix/nac-vs-dhm-dead-clicks` | local | `3bfa474` | Worst dead-click page on site — code-block dosing cards converted to lists, 2 inline `/reviews` CTAs added where users were tapping. |
| 9 | `feat/template-reviews-cta` | local (worktree `/tmp/r6-template-cta`) | `68372cd` | **Highest-leverage change.** Auto-renders `/reviews` CTA at mid-content + end on every blog post (188 of 189). Estimated +90–225 affiliate clicks/month (≈2× site total). |
| 10 | `feat/mobile-comparison-above-fold` | local (worktree `/tmp/r7-mobile-comparison`) | `4269916` | Comparison table moved above-fold on mobile only. Mobile CR is 2.9× desktop — this targets that gap. CLS reserved with `min-h-*`. |
| 11 | `test/affiliate-regression` | local | `a1f036c` | Playwright regression test now passes 4/4 (was 4/4 fail) — asserts via `window.dataLayer` since PostHog suppresses init in headless. Catches future regressions. |
| 12 | `chore/hygiene-and-utm` | local | `3abd076` | API key fallback rotated; `dead-clicks-raw`/`-real` query subcommands; UTM tagging convention + `scripts/utm-tag.sh`. |

## Branches NOT to merge

| Branch | Status | Reason |
|---|---|---|
| `fix/affiliate-dead-clicks` (commit `bd2461f`) | **Don't merge** | Globally disables `capture_dead_clicks: true`. Solves the amzn `target="_blank"` false-positives but kills genuine UX signal site-wide. Use the `dead-clicks-real` query filter from R10 instead. |

---

## Open follow-ups (not addressed in this batch)

1. **Pre-existing build warning on `flyby-vs-fuller-health`**: `unsafe.replace is not a function` — a Pattern #8 image-as-dict bug. Schema is now string but the image field still has the old shape. Quick follow-up: same fix as Issue #38.
2. **DHM1000 brand mismatch**: `Compare.jsx` calls it "Double Wood Supplements"; `Reviews.jsx` (and the real Amazon listing) calls it "Dycetin". Will split PostHog product attribution. Reconcile.
3. **3 blog post JSONs reference the same placeholder Amazon URLs R1 fixed in `Compare.jsx`.** Apply the same fix to those JSONs.
4. **Methodology**: R8 found the period-over-period framing in `02-top-pages.md` is fooled by isolated direct-traffic spikes in either window. Future analyses should use longer baselines or break out by referrer.
5. **Other zero-conversion blog posts** that aren't in the dead-bridge list flagged earlier — the template CTA from R6 covers them automatically once shipped. PR #259's manual approach is now superseded.
6. **Dropping the redundant `<ReviewsCTA />` card from related-posts**, since R6's template CTA gives every post mid + end /reviews CTAs. Three CTAs per post is overkill.

---

## Coordination retrospective

**6 of 10 R-batch agents reported branch contention** in the shared worktree (`/Users/patrickkavanagh/dhm-guide-website`). Agents fixed it by various means: cherry-pick recovery, `git update-ref`, isolated `/tmp` worktrees (R6, R7), and abort-and-retry. **Final state is clean** — every branch contains exactly its intended scope, verified.

**For future parallel runs**: launch each agent with `isolation: "worktree"` so they never share a working tree. The `Agent` tool supports it. Saves an hour of recovery per batch.

---

## Numbers to watch (post-merge)

After deploying B, C, R3, R5, R9 (engagement + content):
- `time_on_page_milestone` daily volume should return to ~70/day (was ~10) within 24h
- Scroll-50 events should start firing on the 5 fixed comparison posts
- Dead-click rate should drop on `/never-hungover/nac-vs-dhm-…`

After deploying R6 (template CTA):
- /reviews PV should rise ~2–5× over 4–6 weeks (currently 60/mo)
- Site-wide affiliate clicks should rise +60–120% (current baseline ~56/30d)

After deploying R7 (mobile-first comparison):
- Mobile CR should rise from 3.57% (already good) closer to desktop's deep-engagement profile
- Mobile share should re-balance toward 25%+ (currently 15%)

After deploying R1 (regex extension):
- Fuller Health click count should appear in PostHog (currently 0 attributable)
