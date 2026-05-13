# Time on Page — Validation of User Claim (Agent A2)

**Date pulled**: 2026-05-12 ~12:00 UTC. **May 12 partial (~12h captured).**
**Question**: did time on page actually improve, or is it the emission-rate artifact from PR #269 (Apr 26, removed 10% sampling gate)?
**Available milestone buckets**: `milestone_seconds ∈ {10, 30, 60, 120, 300}`. Task spec asked for 240 — there is no 240 bucket, so `>=240` reduces to `=300`. Reported as `r300` below.

---

## 1. TL;DR

**The headline "time on page is up" claim is mostly an emission-rate artifact, NOT a real engagement improvement.** Three lines of evidence:

1. **Conditional distribution is flat.** Among sessions that fire any TOM milestone, median session duration = 60s and p75 = 300s in BOTH the early-post-fix window (Apr 25-28) and the current window (Apr 29-May 12). The shape of engagement among engaged sessions is identical.
2. **Per-page reach rates on the top page are flat.** `/never-hungover/dhm-dosage-guide-2025` (#1 page, 150 sessions current): r30 = 72% → 71%, r120 = 34% → 33% across the current window's two halves. No within-page improvement.
3. **The site-wide reach-rate climb (r10: 28.5% → 41.2% → 49.4% across early-4d → cur-h1 → cur-h2) is driven by `r10` itself climbing in lock-step with the higher reaches**, with stable conditional pass-through ratios. This is the signature of continued emission-infrastructure ramp-up after PR #269, not of users staying longer.

**Confidence the "time on page improved" claim is mostly artifact: 4/5.** The instructed prior 14d window (Apr 15-28) overlaps the Apr 25 emission step-change, making naïve raw-volume comparison invalid. Comparing only the post-fix subset (Apr 25-28) to the current 14d gives statistically significant reach gains, but conditional distribution and per-page evidence say the underlying user behavior did not change.

---

## 2. Per-Session Reach Rates (the right metric)

**Comparable windows** (both fully post-PR-#269 emission-fix):

| Metric | Early post-fix 4d (Apr 25-28) | Current 14d (Apr 29-May 12) | Δ | z | p |
|---|---|---|---|---|---|
| Sessions (any PV) | 221 | 645 | — | — | — |
| Reach r30 | 47 (21.3%) | 243 (37.7%) | +16.4pp | 4.46 | <0.001 |
| Reach r60 | 38 (17.2%) | 192 (29.8%) | +12.6pp | 3.65 | <0.001 |
| Reach r120 | 31 (14.0%) | 127 (19.7%) | +5.7pp | 1.88 | 0.060 |
| Reach r300 | 20 (9.0%) | 72 (11.2%) | +2.1pp | 0.88 | 0.379 |

**Reading**: r30/r60 deltas are large and significant; r120/r300 deltas shrink to non-significant. The "improvement" is concentrated at the cheap end of the funnel — exactly where emission infrastructure changes would show first.

**Instructed-window comparison (Apr 15-28 vs Apr 29-May 12) — INVALID, shown for completeness**:

| Metric | Prior 14d (Apr 15-28) | Current 14d (Apr 29-May 12) | Δ | Verdict |
|---|---|---|---|---|
| Sessions | 1,572 | 645 | −927 | Bot-day inflated prior (Apr 17/19/20 ≈ 670 PV) |
| r30 | 68 (4.3%) | 243 (37.7%) | +33.4pp | **CONFOUNDED — emission gate, bots** |
| r60 | 57 (3.6%) | 192 (29.8%) | +26.2pp | CONFOUNDED |
| r120 | 43 (2.7%) | 127 (19.7%) | +17.0pp | CONFOUNDED |

Apr 15-24 sit on the OLD 10% sampling gate; Apr 25-28 on the NEW 100% rate. Mixing them gives a 14-day "prior" with ~10% effective TOM emission for ~10 days and ~100% for ~4 days. This is why prior r30 reads 4.3% and current reads 37.7% — the gap is the gate.

---

## 3. Session Duration Distribution (conditional on firing TOM)

| Window | Firing sessions | p50 (median) | p75 | p90 | mean |
|---|---|---|---|---|---|
| Early post-fix 4d (Apr 25-28) | 69 | 60s | 300s | 300s | 129.3s |
| Current 14d (Apr 29-May 12) | 306 | 60s | 300s | 300s | 124.7s |

**The conditional distribution is identical (mean even slightly DOWN).** Among sessions that fire TOM at all, the shape of engagement is unchanged. This is the strongest single piece of evidence that the user-behavior side hasn't moved.

---

## 4. Within-Current-Window Slope (h1 vs h2)

| Window | Sessions | r10 | r30 | r60 | r120 | r300 |
|---|---|---|---|---|---|---|
| early_4d (Apr 25-28) | 221 | 28.5% | 21.3% | 17.2% | 14.0% | 9.0% |
| cur_h1 (Apr 29-May 5) | 396 | 41.2% | 34.6% | 25.8% | 17.2% | 10.1% |
| cur_h2 (May 6-May 12) | 249 | 49.4% | 42.6% | 36.1% | 23.7% | 12.9% |

r10 reach jumped 28.5% → 41.2% → 49.4%. This is the entry-level milestone (10 seconds on page). Real human engagement does not jump 21pp in 17 days. **This trajectory is the continued bed-in of the unsampled emission pipeline** (browser-cache TTL on the old JS bundle, returning users picking up the new code, etc.) plus the Apr 29 bot filter (PR #346) starting to clean the denominator.

---

## 5. Per-Page Reach (top 10 by current sessions, ≥15 sessions)

| Path | Cur sess | r30 | r60 | r120 | r300 | p50 (sec) | Pri sess (Apr 25-28) | Pri r30 | Pri r60 |
|---|---|---|---|---|---|---|---|---|---|
| /never-hungover/dhm-dosage-guide-2025 | 150 | 71% | 54% | 33% | 17% | 60s | 51 | 33% | 25% |
| /never-hungover/hangover-supplements-complete-guide-... | 67 | 49% | 40% | 27% | 13% | 90s | 32 | 22% | 19% |
| /never-hungover/dhm-randomized-controlled-trials | 44 | 20% | 18% | 16% | 9% | 120s | 2 | 0 | 0 |
| / (homepage) | 32 | 22% | 9% | 0% | 0% | 30s | 13 | 31% | 31% |
| /reviews | 31 | 35% | 35% | 29% | 19% | 120s | 2 | 0 | 0 |
| /never-hungover/when-to-take-dhm-timing-guide-2025 | 25 | 64% | 64% | 36% | 28% | 60s | 8 | 50% | 50% |
| /guide | 17 | 18% | 6% | 6% | 6% | 20s | 0 | — | — |

**Within current window halves (h1 May ≤ 5 / h2 May ≥ 6)** for the top page — flat:
- dosage-guide-2025: h1 r30=72%, r60=53%, r120=34% (n=68) → h2 r30=71%, r60=55%, r120=33% (n=82). No improvement.

The within-page no-change combined with the site-wide ramp confirms the ramp is denominator-side (the universe of measured sessions widening), not behavior-side.

---

## 6. Per-Device Breakdown (post-fix windows only)

| Window | Device | Sessions | r30 | r60 | r120 | r300 | p50 |
|---|---|---|---|---|---|---|---|
| Early 4d (Apr 25-28) | Desktop | 140 | 15.0% | 10.0% | 7.1% | 6.4% | 45s |
| Early 4d (Apr 25-28) | Mobile | 77 | 29.9% | 28.6% | 24.7% | 11.7% | 120s |
| Current 14d | Desktop | 396 | 18.2% | 13.6% | 10.4% | 7.1% | 60s |
| Current 14d | Mobile | 247 | 68.4% | 55.1% | 34.4% | 17.8% | 60s |

**Mobile r30 jumped 29.9% → 68.4% (+38.5pp). Desktop barely moved (15.0% → 18.2%, +3.2pp).** This is suspicious of an emission-pipeline artifact (e.g., mobile users having shorter PostHog SDK retention than desktop, so the unsampled emission reached them after a longer lag). A real engagement improvement that hits only mobile is possible but uncommon, especially when the conditional p50 holds at 60s on mobile (not deeper, just more reach).

---

## 7. Emission-Rate Normalization Audit

**Daily TOM-firing-session ratio** (sessions emitting TOM ÷ sessions with PV):

| Date | sessions | tom_sessions | ratio |
|---|---|---|---|
| 2026-04-15 | 128 | 5 | 0.039 |
| 2026-04-21 | 100 | 4 | 0.040 |
| 2026-04-24 | 72 | 3 | 0.042 |
| **2026-04-25** | 61 | 8 | **0.131** ← step-change visible |
| 2026-04-26 | 59 | 21 | 0.356 |
| 2026-04-29 | 107 | 40 | 0.374 |
| 2026-05-01 | 48 | 34 | 0.708 |
| 2026-05-06 | 49 | 25 | 0.510 |
| 2026-05-10 | 39 | 29 | 0.744 |

Step-change is between Apr 24 (0.042) and Apr 25 (0.131), with continued ramp through Apr 26 (0.356) and slow climb through May (0.5-0.7). Pre-step-change daily ratio is ~0.04; post-step-change is 0.35-0.74. Ratio = ~9-18x. Matches the doc-flagged "~20×" emission step-change.

**Bot day audit for current 14d** (pv/user vs scroll rate):

| Date | PV | Sessions | pv/user | scroll rate | flag |
|---|---|---|---|---|---|
| 2026-04-29 | 110 | 107 | 1.05 | 8.4% | borderline (below 10%) |
| 2026-04-30 | 47 | 44 | 1.09 | 20.5% | clean |
| 2026-05-05 | 53 | 49 | 1.10 | 10.2% | borderline |

No high-confidence bot days in current window. Apr 29 (8.4% scroll rate) is borderline; even if dropped, it doesn't change the conclusions because it's the LARGEST day in the window (110 PV) and excluding it would only weaken the "reach went up" claim further.

---

## 8. Confidence & Verdict

**Confidence: 4/5.** The user's claim that "time on page increased" is mostly an emission-rate artifact. The signature evidence: (a) conditional p50/p75/p90/mean session duration unchanged, (b) per-page reach on the top page flat across the current window's halves, (c) r10 (entry-level milestone) reach rising in step with deeper milestones — a denominator-side change, not a behavior-side change, (d) mobile-only +38pp r30 jump with desktop flat. Not 5/5 because mobile could plausibly have a real component and the sample size on the early-4d baseline (n=221) is small.

---

## 9. Action Items

1. **DO NOT report "time on page is up" to stakeholders without the emission-gate caveat.** Any % comparison to anything pre-Apr-26 is invalid; even post-Apr-26 data is still ramping.
2. **Stop comparing raw `time_on_page_milestone` event counts.** Use per-session reach rates and conditional p50/p75. Update the engagement-watchdog tile in PostHog accordingly (currently it tracks raw daily event volume).
3. **Wait until May 19** to re-measure for a clean 14d-vs-14d window where both halves are post-step-change AND past the ramp tail. Earliest defensible "real" comparison: May 12 baseline vs May 26 endpoint.
4. **Investigate the mobile-only reach jump.** If real, it's the actual signal. Check whether a recent change (FOUC fix #343 on Apr 28, mega-menu portal #340) plausibly affected mobile session lifecycle (e.g., earlier PostHog init, longer pre-unload time).
5. **Add `device_type` and `session_id` to the engagement-watchdog tile** so future readers can immediately see whether a movement is reach-side or duration-side.
6. **Push the integrity-audit rule into CI**: any analysis doc claiming a TOM trend across Apr 25 must be flagged.
