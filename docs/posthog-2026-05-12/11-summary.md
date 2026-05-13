# Did the recent changes drive engagement? — 10-agent assessment

**Synthesized 2026-05-12 from 10 parallel agent investigations.**

**Window (verified by A10):**
- **Current 14d**: 2026-04-29 → 2026-05-11 (May 11 partial, ~67% elapsed at query time. **Note: original spec said "May 12 partial" but PostHog data ends May 11; the date label was wrong, queries caught all data correctly.**)
- **Prior 14d**: 2026-04-15 → 2026-04-28 (3 bot-suspect days: Apr 17/19/20, excluded for botless comparisons)

---

## 1. Headline answer

**Mixed, with one elephant.** One change is clearly working. Several other shipped changes are instrumented but haven't yet moved real engagement. And underneath it all, the site is bleeding traffic.

| Claim | Verdict | Confidence |
|---|---|---|
| "Time on page is up" | **Mostly a measurement artifact** — the Apr 26 sampling-gate removal restored 100% emission on engagement events; per-session engagement is FLAT at 3.3 milestones/session | A2/A10: 4/5 |
| Affiliate clicks went up | **Yes, genuinely** — +12 raw / +19 botless; all on /reviews mobile (clicks tripled 6→20) | A3/A10: 4/5 |
| Scroll engagement improved | **Yes, materially** — site-wide 90% reach 3.61% → 4.65% (+1.04 pp). Desktop-driven; mobile actually regressed | A4: 3/5 |
| Real-user dead clicks improved | **Yes, −50%** — but conditional on excluding one persistent Apr 29 user. Without exclusion: flat | A6/A10: 4/5 |
| Engagement (element clicks) is up | **No** — total volume −22%, unique users +33%. Composition shifted to mobile | A5: 3/5 |
| /compare recovered | **No** — went 34→6 PV; ZERO Google referrers in 14 days (prior had 25). Mirrors sitewide collapse | A7/A10: 3/5 |
| Funnel improved | **Broken canonical model** — 16/22 affiliate converters never hit /compare or /reviews PV; tracking semantics issue | A8: 3/5 |
| Continue-Your-Research footer (#246/#359) worked | **No** — long-form 90% reach went DOWN 3.74% → 3.19% | A4/A9/A10: 4/5 |

**🐘 The elephant in the room**: Sitewide Google referrer PV is **down −68% (882 → 282)**, sitewide total PV down **−59% (1641 → 671)** in the same window. The affiliate-CTR win is monetizing better on a shrinking base. **This is a GSC investigation, not a PostHog problem** — the agents can't see crawl/index data. Recommend pulling the DCNI Recovery Watchlist provisioned in PR #371.

---

## 2. The one genuine win: /reviews mobile UX (PR #352 + #358)

Both shipped 2026-04-29 ~15:40 BST. Both target /reviews mobile only.

| | Prior 14d | Current 14d | Δ |
|---|---:|---:|---:|
| /reviews mobile PV | 9 | 7 | −2 (flat) |
| /reviews mobile affiliate clicks | 6 | **20** | **+14** |
| /reviews mobile clicks-per-PV | 0.67 | **2.86** | +4.3× |
| Desktop /reviews (control) | 16 | 16 | 0 |

The mobile-only / /reviews-only selectivity is the attribution evidence — generic seasonality or traffic growth would move desktop too. **Replicate this pattern on other revenue pages.**

---

## 3. The "time on page" claim, decoded

User feeling: "time on page increased." Reality:

- **Site-wide raw event counts** for `time_on_page_milestone` jumped because PR #269 (Apr 26) removed a 10% sampling gate. The events were always happening; the site just started recording them all.
- **Per-session engagement is flat**: 3.30 → 3.39 milestones/session. **Conditional median session duration: 60s in both windows.**
- **Per-page reach on the #1 page** (`dhm-dosage-guide-2025`, 150 sessions): r30 71% → 71%, r120 34% → 33% across the current window's halves. No within-page improvement.
- The r10 (entry milestone) climbing in step with deeper milestones (28.5% → 41.2% → 49.4%) is the signature of denominator widening, not behavior change.

**The one open mystery:** Mobile r30 jumped 29.9% → 68.4% (+38.5pp); Desktop barely moved. Could be a real mobile UX win (FOUC fix #343, mega-menu portal #340) OR a mobile SDK cache lag adopting the unsampled emission. **Re-measure on May 19+** for a fully ramp-cleared window.

---

## 4. What didn't move: things you might expect to

| Change | Expected metric | Actual | Verdict |
|---|---|---|---|
| #246/#359 Continue-Your-Research footer (197 posts) | Long-form scroll-90 reach up | 3.74% → 3.19% (DOWN) | Did not work |
| #117/#352 action-column "Check Price" buttons | New tracked element_type | No new tag; rolling up into untracked `product_card` | Not instrumented |
| #353 testimonial auto-rotate | User engagement (slide views) | 653 events but 49% from ONE 5h auto-rotating session; real reach = 23 users / 28 sessions | Real reach is small; auto-rotates shouldn't count |
| #251/#355 HowTo schema on 4 Tier-1 guides | Search traffic | Zero PV both windows | Google removed HowTo eligibility for health content Sept 2023 (known limitation); re-check via GSC |
| #368 2 promoted pillar hubs | New entry traffic | Zero PV both windows | Awaiting indexing; re-check 30-60d |
| #340/#341 mega-menu portal | Click-through to clusters/spokes | Trigger fires (6 clicks); cluster/spoke clicks ≤1 | Users see menu, don't click in |

---

## 5. P0 issues uncovered by the investigation

| # | Issue | Source |
|---|---|---|
| 1 | **Sitewide organic collapse: Google referrer PV −68%.** Single biggest finding. PostHog can't diagnose this — pull GSC. | A7 |
| 2 | **`/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025` dropped 19 → 1 PV (−95%).** Collapse-shaped, likely a PR #367 redirect bug. **Verify the 301 chain.** | A9 |
| 3 | **`$rageclick` instrumentation is broken** — 0 events in 30 days. Likely missing `rageclick: true` in `posthog.init()` in `src/lib/posthog.js`, OR Framer `<motion.div>` wrappers defeating PostHog's same-element heuristic. The May 10 `/guide` "Mental Clarity" cluster (4 same-element clicks in ~3s) should have fired one. | A6 |
| 4 | **Affiliate-click `$pathname=/reviews` semantics issue.** 16 of 22 affiliate-converting sessions never hit /compare or /reviews PV, yet the click stamps `/reviews`. Likely the inline-blog widget pulls path from a hardcoded constant. Confirm in `useAffiliateTracking.js`. | A8 |
| 5 | **New dead-click hotspot:** `/guide` line 361 — `<Card hover:shadow-lg transition-all duration-300>` on `keyBenefits.map(...)`. Same anti-pattern as the previously-RCA'd `/research` Hotspot D. **File as bug.** | A6 |
| 6 | **Tagging gap: action-column "Check Price" buttons on /reviews.** PR #117/#352 effect is invisible in PostHog because the new buttons share `product_card` element_type with the existing table. Add `placement: 'action_column'`. | A5 |

---

## 6. P1 improvements

| Action | Why |
|---|---|
| Audit `dhm-dosage-guide-2025` for missing affiliate widgets | Same template as `hangover-supplements-complete-guide` but 12× lower CVR (1.04% vs 12.7%); 161 PV → 0 affiliate clicks |
| Replicate the /reviews mobile UX pattern (#352 + #358) on other revenue pages | Demonstrably moved clicks 6 → 20 in 14d on /reviews mobile |
| Implement deferred RCA P0 fix on `src/pages/Research.jsx:505` (`<Card>` → `<a>`) | Recurring dead-click hotspot from prior RCA, never fixed |
| Ship the working-tree `CompareCTA.jsx` | /compare has zero internal-link routing today; this directly addresses it |
| Filter `testimonial_slide_view` on `trigger != 'auto'` before any dashboard claim | One 5h session = 49% of all events. Reach metric is 23 users, not 653 events |
| De-dupe `comparison_tab`/`comparison-tab` event names | Both firing simultaneously; dashboards double-count or miss |
| Investigate FAQ element_type disappearance (12 → 0) | Possible UI regression |

---

## 7. Methodology caveats (read before quoting any number)

1. **Date label was wrong across agents** — "May 12 partial" should be "May 11 partial." Numerical results are correct (queries spanned `< 2026-05-13` and caught all data).
2. **PR #269 (Apr 26)** removed a 10% sampling gate. Any raw-volume comparison of `time_on_page_milestone`, `rage_click_detected`, `text_copied`, `tab_*`, `form_field_focused`, `page_exit` across that boundary is invalid. **Unaffected events**: `$pageview`, `scroll_depth_milestone`, `affiliate_link_click`, `element_clicked`.
3. **PR #346 (Apr 29)** added bot/preview UA filter. Current window has bot filter; prior window does not. Some of the apparent scroll-reach lift (0.3-0.7 pp at 90%) is denominator-cleaning, not behavior.
4. **Single-user concentration**: `testimonial_slide_view` 49% from one session; `$dead_click` 40% from one user. Both correctly flagged by A5/A6; both require exclusion before claims.
5. **Sample sizes are small.** Only 6 pages clear PV≥30 in either window. n=38 affiliate clicks in current window. Treat per-page and per-subgroup deltas as directional. The cross-validation strength is *consistent direction across slices*, not statistical significance on any single slice.
6. **`dhm-randomized-controlled-trials` +2100% PV is redirect absorption**, not new traffic — PR #316 (Apr 26) renamed the slug.

---

## 8. Re-measurement schedule

| Date | What to check |
|---|---|
| **May 19** (1w out) | Time-on-page per-session metrics, fully past PR #269 ramp tail. Confirms whether mobile r30 jump is real |
| **May 26** (2w out) | Affiliate clicks at 28d post-#352/#358. Confirms /reviews mobile lift sticks beyond novelty |
| **Jun 1-15** (30-60d) | GSC indexing for 4 HowTo guides + 2 promoted pillar hubs |
| **Now** | GSC pull to diagnose sitewide Google referrer −68% (this is urgent) |

---

## 9. Overall confidence

**3/5** in the overall story. High on the one genuine win (/reviews mobile UX); high on the artifacts being correctly identified; medium-low on most subgroup deltas (n is small); and a fundamental unknown about why sitewide traffic is collapsing that PostHog alone cannot answer.

---

## Agent reports

| # | Agent | File | Key finding |
|---|---|---|---|
| A1 | Change inventory | `01-change-inventory.md` | 65 PRs in two clusters Apr 26 (41) + Apr 29 (17); CompareCTA unshipped |
| A2 | Time on page | `02-time-on-page.md` | Mostly artifact; per-session engagement flat; mobile r30 jump open question |
| A3 | Affiliate clicks | `03-affiliate.md` | +12 raw / +19 botless; all /reviews mobile; PR #352+#358 attribution |
| A4 | Scroll depth | `04-scroll-depth.md` | Site-wide r90 +1.04 pp (Desktop-driven); CYR footer null result; mobile regressed |
| A5 | Element clicks | `05-element-clicks.md` | Composition shift mobile-majority; testimonial auto-rotate noise; action-column untagged |
| A6 | Dead/rage clicks | `06-dead-rage.md` | Real-user −50% (one user excluded); `$rageclick` broken 30d; new /guide hotspot |
| A7 | /compare recovery | `07-compare-recovery.md` | Did NOT recover; sitewide organic −68%; /compare is the mirror |
| A8 | Funnel | `08-funnel.md` | Canonical funnel broken; mobile 6× desktop CVR; same-template 12× CVR variance |
| A9 | Per-page | `09-per-page.md` | Only 6 pages clear PV≥30; gaba slug −95% (likely redirect bug); HowTo/pillars zero |
| A10 | Integrity | `10-integrity.md` | Date label wrong (May 11 not May 12); no new bot days current; all flagged claims survive integrity filter |
