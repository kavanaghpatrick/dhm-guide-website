PostHog deep-eval action plan — 10 branches to merge + follow-ups

Tracking issue for the work coming out of the PostHog deep evaluation on 2026-04-25/26.

Full analysis lives in `docs/posthog-analysis-2026-04-25/` — see `00-FINAL-SYNTHESIS.md` for the corrected master synthesis.

## Context

- Apr 11, 2026 brought a Google ranking lift to the `/never-hungover/*` cluster: **+78% PV, +93% affiliate clicks** over the prior 30 days. 81.7% of growth was Google organic, distributed across the cluster on a single day.
- Spike was already decelerating by Apr 17; back near baseline by Apr 25.
- Mostly desktop (+104%); mobile flat in volume but converts **2.9× better per session** (3.57% vs 1.23%).
- `/reviews` converts at **75% CTR** but only sees ~60 PV/month. **89% of site traffic produces 0 affiliate clicks** because most blog posts have no bridge to `/reviews`.

Two findings from the original master synthesis turned out to be **measurement artifacts**, not real bugs:
- "38.5% affiliate click failure rate" — PostHog's `$dead_click` heuristic false-fires on `target=\"_blank\"` links because the source tab doesn't change. 100% of Amazon dead-clicks pair with `affiliate_link_click` within ±5s. Tracking is healthy.
- "dhm-vs-zbiotics −31% decline" — actually grew Google traffic +238% like its peers; the trailing-30-day comparison window happened to capture a March direct-traffic anomaly in the \"before\" period.

One real regression was hidden under the spike noise:
- `time_on_page_milestone` event volume crashed Apr 7 (from ~70/day to ~10/day) because PR #261 silently re-shipped a `Math.random() < 0.1` sampling gate.

## Branches to merge (in recommended order)

Already pushed:
- [x] `fix/time-on-page-milestone` — `369dd0b` — Removes 10× sampling gate from engagement tracking. Pure deletion.
- [x] `fix/flyby-comparison-pages` — `d2b6b09` — flyby-vs-cheers (#4 traffic) + flyby-vs-good-morning-pills now render content (was blank).

Local, awaiting push + PR:
- [ ] `fix/canonical-script-404` — `29cb210` — Removes `/canonical-fix.js` script reference that's been throwing `SyntaxError: Unexpected token '<'` on every page load for ~6 months. File was committed to repo root instead of `public/`, so Vite never deployed it. Likely contributing to INP/Core Web Vitals scores. Pure deletion (-40 lines).
- [ ] `fix/comparison-posts-schema-audit` — `d43c5af` — 3 more comparison posts converted from broken array-section schema to markdown (was 0% scroll-50): `double-wood-vs-toniiq-ease-dhm-comparison-2025`, `flyby-vs-dhm1000-complete-comparison-2025`, `flyby-vs-fuller-health-complete-comparison`.
- [ ] `fix/widget-attribution-and-mobile-menu` — `b06e18b` — `data-product-name` now uses canonical `name` field (was `brand`); `mobile-menu`/`mobile_menu` event names unified to snake_case. Confirmed via PostHog: 37 hyphen-name vs 13 snake_case events over 60d.
- [ ] `fix/affiliate-regex-and-urls` — `f36e8dc` — Adds `fullerhealth.com` to `AFFILIATE_URL_PATTERN` (Fuller Health clicks were silently lost); replaces 2 placeholder Amazon URLs at `Compare.jsx:274,336` with real `amzn.to` links.
- [ ] `fix/affiliate-button-audit` — `cdb436c` — Inline blog Amazon links (in markdown content) now tagged with proper `rel`/`data-placement=\"blog_content_inline\"`. **Needs `git push --force-with-lease`** (commit was amended to fix message).
- [ ] `fix/nac-vs-dhm-dead-clicks` — `3bfa474` — Worst dead-click hot spot on site (78 dead clicks / 73 PV, ~13/session). Code-block dosing cards (looked like tappable buttons) → bullet lists; 2 inline `/reviews` CTAs added where users were tapping; FAQ `**Q:**` green-pill markers → `### ` h3 headings.
- [ ] `feat/template-reviews-cta` — `68372cd` — **Highest-leverage change.** Auto-renders `/reviews` CTA at mid-content (~30%) + end on every blog post (188 of 189). Estimated **+90–225 affiliate clicks/month, ≈2× site total**. Lives in worktree `/tmp/r6-template-cta` — fetch from there.
- [ ] `feat/mobile-comparison-above-fold` — `4269916` — Comparison table moved above-fold on mobile only (`order-first md:order-none`). Targets the 2.9× mobile CR advantage. CLS reserved with `min-h-*`. Lives in worktree `/tmp/r7-mobile-comparison`.
- [ ] `test/affiliate-regression` — `a1f036c` — Playwright regression test now passes 4/4 (was 4/4 fail). Asserts via `window.dataLayer` since PostHog suppresses init in headless Chromium (`_is_bot()` heuristic). Catches future click-handler regressions.
- [ ] `chore/hygiene-and-utm` — `3abd076` — Rotates dead PostHog API key fallback in `scripts/posthog-query.sh`; adds `dead-clicks-raw` and `dead-clicks-real` query subcommands (the 11-event delta is exactly the amzn `target=\"_blank\"` false-positives); `scripts/utm-tag.sh` + UTM standard documented in `docs/posthog-analysis-2026-04-25/r10-utm-standard.md`.

## Branch NOT to merge

- [ ] `fix/affiliate-dead-clicks` — `bd2461f` — Globally disables `capture_dead_clicks: true`. Solves the amzn `target=\"_blank\"` false-positives but kills genuine UX signal site-wide (e.g., the nac-vs-dhm hot spot we just fixed). Use the `dead-clicks-real` query filter from `chore/hygiene-and-utm` instead. Recommend deleting this branch.

## Open follow-ups (not addressed in this batch)

- [ ] **Pre-existing build warning on `flyby-vs-fuller-health`**: `unsafe.replace is not a function` — Pattern #8 image-as-dict bug. Schema is now string but the image field still has the old shape. Apply same fix as Issue #38.
- [ ] **DHM1000 brand mismatch**: `Compare.jsx` calls it \"Double Wood Supplements\"; `Reviews.jsx` (and the real Amazon listing) calls it \"Dycetin\". Splits PostHog product attribution.
- [ ] **3 blog post JSONs** also reference the placeholder Amazon URLs that R1 fixed in `Compare.jsx`. Apply the same fix to those JSONs (`amazon.com/dhm1000-dihydromyricetin`, `amazon.com/dhm-depot-dihydromyricetin`).
- [ ] **Methodology**: Period-over-period framing in `02-top-pages.md` is fooled by isolated direct-traffic spikes in either window. Future analyses should use longer baselines or break out by referrer.
- [ ] **Drop the redundant `<ReviewsCTA />` card** from the related-posts area, since `feat/template-reviews-cta` will give every post mid + end /reviews CTAs. Three CTAs per post is overkill.
- [ ] **PR #259 is now superseded** by `feat/template-reviews-cta` (template-level CTA covers all posts automatically). Decide whether to close #259 unmerged or merge it first then redo.
- [ ] **Add `POSTHOG_PERSONAL_API_KEY` to `~/.zshrc`** per CLAUDE.md (currently missing despite docs saying it should be there). The working key is in `~/.claude/history.jsonl` and was rotated into `scripts/posthog-query.sh` fallback by R10.

## Numbers to watch post-merge

After deploying B + C + R3 + R5 + R9 (engagement + content):
- `time_on_page_milestone` daily volume should return to ~70/day (was ~10) within 24h
- Scroll-50 events should start firing on the 5 fixed comparison posts
- Dead-click rate should drop on `/never-hungover/nac-vs-dhm-...`

After deploying R6 (template CTA):
- `/reviews` PV should rise ~2–5× over 4–6 weeks (currently ~60/mo)
- Site-wide affiliate clicks should rise +60–120% (current baseline ~56/30d)

After deploying R7 (mobile-first comparison):
- Mobile CR should rise from 3.57% closer to desktop's deep-engagement profile
- Mobile share should re-balance toward 25%+ (currently 15%)

After deploying R1 (regex extension):
- Fuller Health click count should appear in PostHog (currently 0 attributable)

## Coordination retro

6 of 10 R-batch agents reported branch contention in the shared worktree. Recovered cleanly via cherry-picks, `git update-ref`, and isolated `/tmp` worktrees. Future parallel runs should launch each agent with worktree isolation to avoid the friction.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
