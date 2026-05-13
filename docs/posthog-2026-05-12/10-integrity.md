# PostHog 14-Day Window — Integrity Cross-Check (Agent A10)

**Skeptic. Pulled 2026-05-11 16:17 UTC.** Cross-checks agents A1-A9 for bot pollution, denominator effects, tracking-rate artifacts, partial-day truncation, and single-user concentration.

---

## 1. TL;DR

**The story largely survives integrity scrutiny — with one major caveat.** Of the ~12 significant claims across A2-A9, three are real signal, six are real but underpowered or composition-driven, two are explicit measurement artifacts that the agents themselves correctly flagged, and one (the headline framing date) is wrong.

The current window has **zero bot-spike days** (verified independently — PR #346's UA filter is working). The prior window's bot inflation is real and the agents handled it correctly. The two material risks to the user-facing summary are:

1. **The "today is 2026-05-12" framing is incorrect.** PostHog's last event is `2026-05-11T15:09 UTC`; the data ends mid-day May 11, not "May 12 partial." This is cosmetic to most analyses but means "current 14d" is really 2026-04-28 → 2026-05-11. Several agents wrote "May 12 partial (~12h)" or "(~30% of day)" — neither is consistent with the actual data.
2. **`time_on_page_milestone` per-PV ratio is still climbing post-Apr-26 (1.0 → 2.24)**, but this is a denominator effect: pageviews are falling faster than TPM events. Per-session TPM is flat at ~3.2-3.8. A2's call of "mostly artifact" is correct.

**Overall confidence in the synthesis story: 3/5.** The one genuine win (affiliate clicks on /reviews mobile) is real and material. Everything else is directionally consistent but volume-thin.

---

## 2. Bot-Day Filter — Current Window

**Method**: per-day PV, segmented by `$browser`/`$device_type`. Flag any day with $browser='Chrome' AND $device_type='Desktop' AND PV >2× the median day AND mean session events <2.

**Result: NO bot-spike days in current window (2026-04-29 → 2026-05-11).**

| Day | PV | Chrome-Desktop PV | %CD | pv/user | scroll rate | Verdict |
|---|---:|---:|---:|---:|---:|---|
| 2026-04-29 | 110 | 68 | 61.8% | 1.05 | 8.4% | Borderline (highest day; just over 2× median 50) — scroll 8.4% above 6% bot threshold |
| 2026-04-30 | 47 | 33 | 70.2% | 1.07 | 20.5% | Clean |
| 2026-05-01 | 52 | 22 | 42.3% | 1.08 | 29.2% | Clean |
| 2026-05-02 | 56 | 32 | 57.1% | 1.02 | 23.2% | Clean |
| 2026-05-03 | 46 | 28 | 60.9% | 1.05 | 20.5% | Clean |
| 2026-05-04 | 51 | 27 | 52.9% | 1.04 | 14.3% | Clean |
| 2026-05-05 | 53 | 23 | 43.4% | 1.08 | 10.2% | Clean |
| 2026-05-06 | 50 | 27 | 54.0% | 1.02 | 22.0% | Clean |
| 2026-05-07 | 38 | 21 | 55.3% | 1.00 | 15.8% | Clean |
| 2026-05-08 | 50 | 26 | 52.0% | 1.09 | 15.2% | Clean |
| 2026-05-09 | 48 | 18 | 37.5% | 1.00 | 16.7% | Clean |
| 2026-05-10 | 41 | 10 | 24.4% | 1.05 | 28.2% | Clean |
| 2026-05-11 | 29 | 21 | 72.4% | 1.00 | 17.2% | Clean (partial day) |

Median PV = 50. No day exceeds 2× median (100). Apr 29 at 110 is just above. PR #346's bot-UA filter is doing its job — the current window's PV stability (mostly 38-56/day) and elevated scroll rates (8-29% vs prior-bot-day 3-6%) confirm clean signal.

**Implication for A2-A9**: the current window does NOT need bot-day exclusions; only the prior 14d does (Apr 17/19/20 per the established Apr 30 integrity doc).

---

## 3. Emission-Rate Audit — `time_on_page_milestone`

| Period | mean TPM / pv | mean TPM / session-with-TPM | sessions firing TPM |
|---|---:|---:|---:|
| Apr 15-25 (sampling gate active) | **0.10** | 3.2 | thin |
| Apr 26-30 (gate removed) | **1.18** | 3.30 | rising |
| May 1-11 (current window post-gate) | **1.73** | **3.39** | stable |

**Step-change interpretation**:
- Apr 25 → Apr 26: 11.8× jump (sampling gate removal — already known)
- Apr 26-30 → May 1-11: **1.47× additional rise on per-PV basis, but per-session TPM is essentially flat (3.30 → 3.39)**

**No new emission step-change.** The per-PV rise is a denominator effect: PV fell from ~50-110/day (Apr 26-30) to ~38-56/day (May 1-11). TPM per session is stable. **A2's "mostly artifact" verdict is correct.**

Milestone-bucket distribution (10s/30s/60s/120s/300s) is stable across the period — no new bucket appeared and the relative split is consistent. Confirms no schema change since Apr 26.

**Other engagement events** (`rage_click_detected`, `text_copied`, `tab_*`, `form_field_focused`, `page_exit`): same PR-#269 jump applies; no new step-changes detected.

---

## 4. Partial-Day Truncation Handling

**CRITICAL: The date framing across agent docs is internally inconsistent and the "May 12" claim is wrong.**

- Spec said: "today is 2026-05-12 ... May 12 is PARTIAL (~12h of data)"
- A3 said: "May 12 partial; ~30% of day captured"
- Latest event in PostHog: `2026-05-11T15:09:00 UTC`
- Server wall clock at query time: `2026-05-11T16:17 UTC`

**Actual partial day = May 11, ~16h into 24h day = ~67% elapsed.** May 12 has no data yet.

A2, A4, A7, A8, A9 wrote "May 12 partial" but their underlying queries spanned `timestamp < '2026-05-13'`, which simply caught all data up to the moment of run — there is no data in May 12, just May 11 truncated mid-day. The numerical results are correct; only the date label is wrong.

**Recommended caveat in user-facing summary**: "Current 14d window is 2026-04-28 → 2026-05-11 (May 11 partial, ~67% elapsed at run time). Replace any 'May 12' reference."

**Why it matters operationally**: if anyone re-runs these queries 24h later assuming "May 12 partial," they'll get a different set of days and different totals. The framing-vs-data inconsistency is a footgun.

---

## 5. Findings Cross-Check Table

| Agent | Claim | Verified | Verdict | Restated delta after integrity filter |
|---|---|---|---|---|
| A2 | "Time on page mostly artifact (4/5 conf)" | YES — TPM per session is 3.30 → 3.39 (flat); per-PV rise is denominator effect | **Survives** | Headline "time up" is **artifact only**; per-session engagement is FLAT |
| A2 | Mobile r30 jumped 29.9% → 68.4% (+38.5pp) | NOT independently re-verified; flagged by A2 as needs-re-measure | **Partially survives** | Treat as directional pending May 19+ re-measure |
| A3 | Affiliate clicks +12 raw / +19 botless | YES — 38 clicks confirmed, distribution checks pass (mobile/desktop 22/16, 19 distinct users on /reviews) | **Survives** | +19 vs botless prior holds; +100% click growth on /reviews is genuine |
| A3 | /reviews mobile 6 → 20 clicks on flat 9 → 7 PV (CTR 2.86 clicks/PV) | YES — confirmed (Mobile 7 PV, 20 clicks). **Note: clicks > pageviews = users clicking multiple affiliate buttons per visit** | **Survives with caveat** | This is exceptional but not impossible — 12 unique mobile users producing 20 clicks = 1.67 clicks/user. Real, not artifact. |
| A3 | "Chronic 0% CTR on top content posts persists" | YES — dosage/supplements/RCT/timing pages = 310 PV, 0 affiliate clicks | **Survives** | This is the most important finding the user-facing summary should retain |
| A4 | Scroll engagement materially improved sitewide | Cross-check: prior-botless scroll-rate ~5-12%, current 8-29%. **But** A4's r25/r50 deltas of +3.8pp / +0.8pp are within sampling noise for n=66-114 | **Partially survives** | Real on r25 (significant); r50/r75/r90 are directional only at this n |
| A4 | "Continue-Your-Research footer (#359) — no detectable effect on long-form 90% reach" | Confirmed: top-20 matched posts went 3.74% → 3.19% | **Survives** | Footer hasn't moved its target metric |
| A5 | Total element_clicked DOWN 22% (142→111) but users +33% (39→52) | YES — confirmed | **Survives** | Composition shift, not engagement loss |
| A5 | testimonial_slide_view: 49% from one 5-hour session | YES — verified: top session = 321/653 = 49.2% | **Survives — artifact only** | **Real engagement reach is ~23 users / 28 sessions, NOT 653 "engagements"** |
| A5 | comparison_tab/comparison-tab duplicate firing | Plausible (3 + 3 events both windows post-#273) | **Survives** | Action item: dedupe before any dashboard claim |
| A6 | Dead-click frustration FLAT raw, -50% excluding one user | YES — confirmed: top user has 40/100 = 40% (matches A6's 49% filtered) | **Survives** | "Frustration improved 50%" claim depends on excluding `019dc7ea...` — must always state this. Without exclusion, flat. |
| A6 | `$rageclick` 0 events / 30 days = instrumentation gap | YES — confirmed not tagged | **Survives** | Real gap, action item, not a UX win |
| A7 | /compare 34 → 6 PV (-82% raw / -65% botless) | Plausible given prior bot-day exclusions | **Survives** | But A7's own caveat is the right framing: n=6 vs n=17 is Poisson; not a /compare-specific regression |
| A8 | Funnel S3→S4: 0/26 deep-scroll sessions navigated to /compare or /reviews | YES — 26 deep-scroll sessions confirmed, 0 navigation verified | **Survives** | But A8 correctly notes funnel framing is wrong — affiliate clicks fire from `/reviews` widgets embedded inline on blog pages, not via nav |
| A9 | /reviews +167% PV, +112% affiliate clicks | YES — but PV growth (12→32) is on tiny base. Click delta (17→36) is solid | **Partially survives** | "Cannot disentangle volume vs UX" — A9 says this themselves; correct framing |
| A9 | dhm-rct slug +2100% PV | Cosmetic — old slug → new slug after PR #316 rename | **Artifact only** | Restated: this is redirection traffic absorbing, not new traffic |
| A1 | "65 PRs shipped 2026-04-25 → 2026-05-12" | Cannot independently verify, but the change calendar is consistent with the data signals | **Survives** | The two-cluster ship pattern is real |

---

## 6. Single-User Concentration Callouts

| Event | Total | Top user/session % | Risk |
|---|---:|---:|---|
| `testimonial_slide_view` | 653 | 49.2% (one session, 5h auto-rotate) | A5 already flagged. **Critical to filter on `trigger ∈ {next, prev, dot, swipe, keyboard, click}` not `auto`.** |
| `$dead_click` (raw) | 100 | 40% (one user `019dc7ea...`) | A6 already flagged. The "frustration -50%" claim is conditional on this exclusion. |
| `time_on_page_milestone` | ~1,170 | Not concentrated — top distinct_id has 10 PV in window | Clean |
| `$pageview` | 645 | Top distinct_id has 10 (1.5%) | Clean — no power-user inflation |
| `affiliate_link_click` | 38 | Top user has ≤3 clicks; 12 unique mobile users on /reviews | Clean enough |
| `element_clicked` | 111 | Not concentrated by user; A5's top-20 element_type table is the right view | Clean |

**The two events that REQUIRE single-user exclusion before claims are made: `testimonial_slide_view` and `$dead_click`. Both A5 and A6 caught this.**

---

## 7. Recommended Caveats for User-Facing Summary

1. **Date framing**: Replace "current 14d ends May 12" → "current 14d = 2026-04-28 → 2026-05-11 (last day partial, ~67% elapsed)." May 12 has no data.

2. **TPM artifact**: "Time on page is up" should be reframed as "site is now capturing time-on-page at full sample rate (was 10% before Apr 26); per-session engagement is **flat** at 3.3 milestones/session."

3. **Affiliate win is real but narrow**: +19 clicks on /reviews mobile only. Desktop flat. Other revenue pages (dosage/supplements/RCT/timing — 310 PV) still 0% CTR. The win is real but does not yet generalize.

4. **Testimonial views**: Use the **23-user / 28-session** reach number, not the 653 event count. Filter on `trigger != 'auto'` for any future dashboards.

5. **Dead-click "improvement"**: "−50% dead clicks" is conditional on excluding one outlier user (`019dc7ea...`). Without exclusion, frustration is flat. State explicitly.

6. **`$rageclick` zero is a gap, not a win**: PostHog autocapture isn't firing it. Action item, not a UX result.

7. **/compare collapse**: Real but A7's framing is correct — /compare did not break independently; it mirrors a sitewide organic search decline. Cite A7's −68% sitewide Google referrer figure.

8. **Sample sizes**: Most subgroup deltas are on n=20-100. Treat as directional unless explicitly flagged significant (only A2 r30/r60 vs Apr 25-28 clears z>3).

9. **Continue-Your-Research footer (#359)**: No detectable lift on its target metric (long-form 90% scroll reach). Don't claim the mass-edit footer worked.

10. **dhm-rct slug "+2100%"**: This is redirect absorption, not new traffic. Don't lead with it.

---

## 8. Overall Confidence

**3/5 in the overall story.**

- **What's solid**: Affiliate clicks on /reviews mobile (+19 vs botless, 5+ click materiality bar cleared); chronic 0% CTR on content pages (310 PV → 0 clicks); composition shift in element_clicked (mobile share 26→63%); /compare = sitewide-organic-mirror, not independent regression.
- **What's artifact**: "Time on page up" (denominator effect from PV falling), testimonial 653 (one 5h session), dhm-rct +2100% (slug redirect).
- **What's underpowered**: Most per-page deltas; the funnel S3→S4 zero (n=26 is too small to differentiate 0/26 from 1/26 statistically); the Continue-Your-Research footer null result.
- **What's wrong**: The "May 12" date framing across the synthesis.

The user-facing summary is fundamentally accurate but should adopt the caveats in §7. The dominant risk is over-claiming on the time-on-page improvement and over-counting testimonial reach.
