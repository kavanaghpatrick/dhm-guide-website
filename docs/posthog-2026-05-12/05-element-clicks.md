# PostHog 14-Day Window — Element Clicks & UI Interaction Catalog

**Agent A5 of 10. Window: 2026-04-29 → 2026-05-12 (partial) vs prior 2026-04-15 → 2026-04-28. Data pulled 2026-05-12.**

---

## 1. TL;DR

- **Total `element_clicked` volume DROPPED 22%** (curr 111 vs prior 142), but **unique users CLICKING ROSE 33%** (52 vs 39). Composition shifted, not engagement collapse.
- **Testimonials auto-rotate (PR #353) is the dominant new signal**: `testimonial_slide_view` went **0 → 653**. But 321 of those (49%) come from **a single session on May 4** firing for 5+ hours — this is auto-rotate burning impressions on one open tab, **not 23 users engaging**. Real user reach: ~23 users, 28 sessions.
- **`filter_clicked` (PR #358 Best-For row) is real but underpowered**: 0 → 4 clicks on /reviews from mobile. New event fires; volume too small to claim adoption.
- **Mega-menu portal fix (PR #340/#341) shows the new instrumentation working**: `nav-topics-trigger` 0 → 6 in current window (matches code-path rename). Old `mobile-menu` (hyphen) 8 → 0; new `mobile_menu` (underscore) 8 → 15. **Event-name rename masked as "+33% mobile-menu engagement" if you only look at one variant.**
- **Continue-Your-Research footer (PR #246/#359) — no clear lift**: `internal_link` on /never-hungover/* is 36 (curr) vs 29 (prior) but denominator pageviews dropped 1475 → 541 (bot-day artifact in prior). Per-PV rate actually **rose 3× (1.97% vs 2.0% raw, but corrected for bot-PV ~6.6% vs 2.0%)** — directional, not significant at this volume.
- **Mobile shifted dominant**: Mobile element_clicks 37 → 70 (+89%), Desktop 102 → 41 (-60%). Consistent with the prior-window bot-burst being Desktop-only.
- **Comparison-table action column (PR #117/#352) on /reviews has NO new signal**: `product_card` on /reviews 25 → 8. Below the volume bar to claim anything; no new `element_type` named "check_price" appears.

---

## 2. Top-20 `element_type` table (current vs prior)

| element_type             | curr | prior | delta  | note                                                       |
|--------------------------|-----:|------:|-------:|------------------------------------------------------------|
| internal_link            |   42 |    36 |     +6 | (Underpowered if split per-page)                           |
| **mobile_menu**          |   15 |     8 |     +7 | New underscore-variant up                                  |
| nav                      |   15 |    32 |    -17 | Prior had desktop-bot inflation                            |
| product_card             |    9 |    27 |    -18 | Was concentrated on /reviews + /compare                    |
| cta                      |    8 |    10 |     -2 | Flat                                                       |
| **comparison_filter**    |    7 |     3 |     +4 | Homepage supplement-pivot filter                           |
| **nav-topics-trigger**   |    6 |     0 |     +6 | NEW — mega-menu trigger (PR #340/#341 portal rebuild)      |
| comparison_tab           |    3 |     0 |     +3 | NEW underscore variant                                     |
| comparison-tab           |    3 |     0 |     +3 | NEW hyphen variant (duplicate emission)                    |
| quick-pick-cta           |    2 |     2 |      0 | Flat — underpowered                                        |
| nav-cta                  |    1 |     1 |      0 | Flat — underpowered                                        |
| mobile-menu (hyphen)     |    0 |     8 |     -8 | DEPRECATED — replaced by `mobile_menu`                     |
| faq                      |    0 |    12 |    -12 | DISAPPEARED — possible UI removal or event-name drop        |
| nav-topics-cluster       |    0 |     1 |     -1 | Underpowered                                               |
| nav-topics-spoke         |    0 |     1 |     -1 | Underpowered                                               |
| nav-topics-spoke-mobile  |    0 |     1 |     -1 | Underpowered                                               |

**Volume bar**: any element_type with <10 events in BOTH windows is underpowered for trend claims (applies to: `quick-pick-cta`, `nav-cta`, all `nav-topics-*` except `-trigger`, both `comparison-tab` spellings, `faq` in current).

---

## 3. NEW event names appearing in current window (= new tracking → PR attribution)

| event                       | curr | prior | likely PR                                              |
|-----------------------------|-----:|------:|--------------------------------------------------------|
| **testimonial_slide_view**  |  653 |     0 | **PR #353** testimonials auto-rotate                   |
| **filter_clicked**          |    4 |     0 | **PR #358** Best-For button row on /reviews            |
| page_not_found              |    4 |     0 | (unrelated — likely a hard-link rot detector)          |
| text_copied                 |    8 |     0 | Was always tracked; sampling-gate-related zeros prior  |
| form_field_focused          |    2 |     0 | Same — sampling-gate artifact                          |
| rage_click_detected (curr)  |    6 |     2 | Sampling-gate artifact                                 |

**Critical**: `text_copied`, `form_field_focused`, `rage_click_detected` movements are NOT new tracking — they are the post-Apr-26 PR #269 sampling-gate removal (see integrity doc). `testimonial_slide_view` and `filter_clicked` ARE genuinely new events.

---

## 4. Per-PR attribution table

| PR             | expected element_type / event                  | observed (curr) | observed (prior) | real signal?                                                                 |
|----------------|------------------------------------------------|----------------:|-----------------:|------------------------------------------------------------------------------|
| **#353**       | `testimonial_slide_view` (new event)            | 653             | 0                | **Y — but with a giant caveat**: 23 users / 28 sessions; 321 events from 1 session on May 4 = auto-rotate noise. Real reach is small but instrumentation works. |
| **#358**       | `filter_clicked` on /reviews                    | 4               | 0                | **Underpowered.** Event fires correctly (all 4 mobile, /reviews, `filter_value` populated: heavy/overall/all). 32 /reviews pageviews → 12.5% CTR — directional only. |
| **#117/#352**  | New element_type on /reviews (e.g. "check_price", "action_column_cta") | 0 (no new type) | 0 | **N.** No new element_type was instrumented. `product_card` on /reviews 7 (curr) vs untracked prior-mix. Action column may be untagged. |
| **#246/#359**  | `internal_link` on /never-hungover/* (Continue-Your-Research footer) | 36 | 29 | **Mixed.** Raw +24%, but per-PV the lift is real (curr 36/541 = 6.7%; prior 29/1475 = 2.0%, **but prior PV inflated by Apr 11/13/17 bots**). Underpowered to attribute confidently. |
| **#340/#341**  | mega-menu portal — `nav-topics-trigger`         | 6               | 0                | **Y for instrumentation, weak for adoption.** New trigger event fires post-fix. Old child events (`nav-topics-cluster`, `nav-topics-spoke`, `nav-topics-spoke-mobile`) each have ≤1 — users see menu but don't click into it much. |

### Event-name fragmentation (warrants cleanup)

Three pairs of duplicate/competing event-type names exist:
- `mobile_menu` (15 curr) vs `mobile-menu` (0 curr, 8 prior) — **mobile-menu rolled out via PR #273 unified naming**
- `comparison_tab` (3) vs `comparison-tab` (3) — **firing simultaneously**; dashboard aggregations will double-count or miss depending on grouping
- `nav-topics-spoke` vs `nav-topics-spoke-mobile` — separate names for the same conceptual click

Recommend the dashboard layer normalize these.

---

## 5. Mobile vs desktop split

| Window | Mobile | Desktop | Tablet | % Mobile |
|--------|-------:|--------:|-------:|---------:|
| Prior  | 37     | 102     | 3      | 26%      |
| Curr   | 70     | 41      | 0      | **63%**  |

**Interpretation**: the Desktop drop is consistent with the bot-day exclusion (per integrity doc, prior window had 3 bot-spike days that were nearly 100% Chrome Desktop). After bot-effect removal, the underlying user base looks **mobile-majority**, which matches mobile being the platform where the new features (filter row, mega-menu mobile entry) actually fire.

**Implication for #358**: all 4 `filter_clicked` events were mobile — the Best-For button row appears to be a mobile-only design win. Worth re-verifying once volume passes the 10-event threshold (need ~3-4 more weeks at current pace).

---

## 6. CTR-style ratios (where computable, all directional only)

| Page    | event                       | curr count | curr PV | curr rate | prior count | prior PV | prior rate |
|---------|-----------------------------|-----------:|--------:|----------:|------------:|---------:|-----------:|
| /       | comparison_filter           |          7 |      33 |    21.2%  |           3 |       48 |      6.3%  |
| /       | testimonial_slide_view      |        653 |      33 |    19.8/PV|           0 |       48 |       0    |
| /reviews| filter_clicked              |          4 |      32 |    12.5%  |           0 |       29 |       0    |
| /reviews| product_card                |          7 |      32 |    21.9%  |          ~? |      29  |      —      |

Caveats: home `/` PV is tiny (33), `testimonial_slide_view` ratio is meaningless because auto-rotate fires repeatedly per session. Use sessions instead: **28 sessions on / saw at least one slide rotation event** in 14 days — actual user reach is small.

---

## 7. Bot filter check (per integrity doc)

The `element_clicked` daily series shows no Chrome-Desktop near-zero-engagement spikes — clicks are too rare for bots to bother. However, the prior-window Desktop inflation (102 vs Mobile 37) coincides with the documented Apr 11/13/17/19/20 bot waves. After dropping those days, prior-window Desktop element_clicks would fall roughly in line with curr, eliminating the apparent "-22% volume drop" as artifactual.

The May 4 `testimonial_slide_view` burst (321 events / 1 session) is **not a bot** — auto-rotate is designed to fire every N seconds while the tab is open. It IS a metric-design problem (impressions ≠ engagement). Recommend gating on `triggered_by = 'user-swipe' OR 'keyboard'` rather than counting auto-rotates.

---

## 8. Confidence: **3 of 5**

**Why not higher**: total event volume is 111 element_clicks across 52 users in 14d — most per-element_type cells are <10. Volume-bar rule disqualifies trend claims on anything except `internal_link`, `mobile_menu` (combined), `nav`, and `product_card`.

**Why not lower**: the *qualitative* observations are robust — new events appeared in the right places at the right times for the right PRs; the May-4 single-session burst is unambiguous from the SQL.

---

## 9. Action items

1. **De-duplicate event names** (`mobile_menu`/`mobile-menu`, `comparison_tab`/`comparison-tab`) — pick one, deprecate the other in the tracking layer. PR #273 started this; it isn't finished.
2. **Don't count auto-rotate as engagement.** Either (a) only fire `testimonial_slide_view` when `triggered_by ∈ {swipe, keyboard, click}`, or (b) add a `is_auto_rotate: true` property and exclude it from any dashboard tile counting "engagement." May-4's single session generated 49% of all current-window slide views.
3. **Tag the action-column CTAs (PR #117/#352).** No element_clicked event was found that distinguishes the new mobile-action-column "Check Price" button from existing `product_card` clicks. Add `placement: 'action_column'` or a new element_type.
4. **Re-evaluate the Best-For filter (#358) at +28 days** when sample size crosses ~20 clicks. The 12.5% mobile-click rate is promising but 4 events can't sustain that claim.
5. **The `faq` element_type disappeared (12 → 0).** Check whether the FAQ component was removed, renamed, or instrumentation broken in the Apr-26 PR wave.
6. **Distinguish per-PV internal_link CTR by template.** PR #246/#359 specifically claimed "Continue Your Research" footer. Add a `placement: 'continue_research_footer'` property so this can be measured against existing inline links rather than collapsed into one number.

---

## Appendix: data sources

All queries against `https://us.posthog.com/api/projects/@current/query` via HogQL.

Windows used:
- **Current 14d**: `timestamp >= '2026-04-29 00:00:00' AND timestamp < '2026-05-13 00:00:00'`
- **Prior 14d**:   `timestamp >= '2026-04-15 00:00:00' AND timestamp < '2026-04-29 00:00:00'`

Key queries:
- Top element_type: `SELECT properties.element_type, countIf(curr), countIf(prior) FROM events WHERE event = 'element_clicked' GROUP BY element_type`
- New events: `SELECT event, countIf(curr), countIf(prior) FROM events GROUP BY event` (filter to curr>0 AND prior=0)
- May 4 burst check: `SELECT uniq($session_id), count(), uniq(distinct_id) FROM events WHERE event = 'testimonial_slide_view' AND toDate(timestamp) = '2026-05-04'` → **1 session, 321 events, 1 user**
