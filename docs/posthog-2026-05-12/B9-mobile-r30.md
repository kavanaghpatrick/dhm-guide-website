# B9 — Mobile r30 Scroll-Reach Jump: Real Win or SDK Artifact?

**Date**: 2026-05-12. **Author**: Agent B9.
**Question (A2 #2/5 confidence)**: Mobile r30 went 29.9% → 68.4% (+38.5pp) while desktop barely moved (15.0% → 18.2%, +3.2pp). Real mobile UX win from #340/#341/#343, or mobile-SDK cache-lag where mobile users adopted the post-#269 unsampled emission later than desktop?

---

## 1. TL;DR

**Mixed, leaning artifact. Do NOT report this lift to stakeholders without heavy caveats.** Confidence **2/5** that it's a real UX win; the bulk of the lift is the post-#269 emission ramp continuing to bed in on mobile devices, plus page-mix differences in the aggregate.

Three lines of evidence point to artifact:
1. **The mobile-vs-desktop disparity shrinks dramatically when we control for page.** On `/never-hungover/dhm-dosage-guide-2025` alone (the dominant mobile page, 45% of mobile current-window sessions), desktop r30 went 24.0% → 42.9% (+18.9pp) — desktop "barely moved" only in aggregate because its page mix is much more diverse (homepage, /reviews, /guide — all lower-engagement). The true device-conditioned lift is mobile +40pp vs desktop +19pp, not +38pp vs +3pp.
2. **Conditional reach (among TOM-firing sessions) shows mobile getting SHALLOWER.** On the same page, mobile cond_r30 rises (+19pp) but cond_r120 falls (−8pp) and cond_r300 is flat (−0.8pp). That's the dilution-by-shorter-sessions signature of new emission infrastructure including more low-engagement sessions, not engagement getting better.
3. **New-mobile-cohort weekly r30 keeps ramping after PR #269**: 11.5% (wk Apr 12) → 10.0% (wk Apr 19) → 57.8% (wk Apr 26) → 73.6% (wk May 03) → 83.3% (wk May 10). Desktop new-cohort plateaus at 14-15% after PR #269. The continued mobile ramp post-#269 is the artifact-side ramp; if it were a UX win from #340/#341/#343 (all merged before Apr 28), we'd expect mobile cohorts to plateau at a higher level, not keep climbing.

The residual mobile-specific component (mobile lift ~2× desktop lift on same page) is real but small (≈20pp), plausibly attributable to mega-menu portal #340 (was failing mobile users worst) and FOUC fix #343 (PostHog init happening earlier on mobile because FOUC was longer on mobile).

---

## 2. New-Mobile-User Cohort vs Returning-Mobile-User Cohort

**Mobile users active in current window (Apr 29 - May 12), bucketed by first-ever-seen date:**

| Cohort | Users | Mob PVs | r30 reached | %r30 | %r60 |
|---|---|---|---|---|---|
| pre-Apr-15 (returning ≥3 weeks old) | 5 | 6 | 4 | 80.0% | 60.0% |
| Apr 25-28 (returning, early-post-step) | 3 | 9 | 3 | 100% | 100% |
| Apr 29 - May 5 (new in cur_h1) | 123 | 148 | 81 | 65.9% | 50.4% |
| May 6 - May 12 (new in cur_h2) | 81 | 102 | 66 | 81.5% | 69.1% |

96% of current-window mobile users are NEW. There is no meaningful "returning" cohort to test against. So a simple "cache lag" hypothesis (returning users carrying stale 10%-gate cached bundles) cannot explain the lift — the population is almost entirely fresh-cache users.

**Weekly new-mobile-cohort r30 (only users whose first event was that week)**:

| First-seen week | New mob users | Mob PVs | %r30 | %r60 |
|---|---|---|---|---|
| 2026-04-12 | 61 | 75 | 11.5% | 11.5% |
| 2026-04-19 | 110 | 159 | 10.0% | 9.1% |
| **2026-04-26 (step-change wk)** | 116 | 151 | **57.8%** | 49.1% |
| 2026-05-03 | 106 | 131 | **73.6%** | 58.5% |
| 2026-05-10 | 24 | 30 | **83.3%** | 66.7% |

**Mobile new-cohort r30 keeps climbing post-#269** (57.8 → 73.6 → 83.3). For comparison, desktop new-cohort weekly r30:

| First-seen week | New desk users | %r30 |
|---|---|---|
| 2026-04-12 | 566 | 0.4% |
| 2026-04-19 | 615 | 0.5% |
| 2026-04-26 | 254 | 14.2% |
| 2026-05-03 | 176 | 14.8% |
| 2026-05-10 | 33 | 6.1% |

Desktop plateaus at 14-15% post-step-change. **The post-#269 continued rise on mobile is the strongest single piece of artifact evidence** — it does not match a #343 / #340 / #341 release-date causal story (all merged ≤ Apr 28) where mobile would jump to its new level and plateau.

---

## 3. Per-Page Mobile r30 — Concentrated, Not Uniform

| Path | Mob sess (cur) | Mob r30 (cur) | %r30 |
|---|---|---|---|
| /never-hungover/dhm-dosage-guide-2025 | 96 | 212 events | dominant (45% of mob sess) |
| /never-hungover/hangover-supplements-complete-guide-... | 37 | 60 events | |
| /never-hungover/when-to-take-dhm-timing-guide-2025 | 17 | 38 events | |

Mobile traffic is concentrated on three `/never-hungover/` posts. The aggregate mobile r30 IS effectively the dosage-guide-2025 r30. This page received content/SEO work but no fixes specifically from #340 (mega-menu portal — affects header), #341 (z-index emit fix — affects header/page-image overlap), or #343 (FOUC fix — site-wide). The mega-menu portal IS mobile-relevant (closed nav drawer needed proper z-index) but the fix predates this window.

**Within-current-window halves (h1 Apr 29 - May 5, h2 May 6 - May 12), session-level reach, dosage-guide page**:

| Device | Half | Sessions | %r30 | %r60 |
|---|---|---|---|---|
| Mobile | h1 | 58 | 75.9% | 56.9% |
| Mobile | h2 | 71 | 64.8% | 49.3% |
| Desktop | h1 | 33 | 42.4% | — |
| Desktop | h2 | 30 | 43.3% | — |

Mobile per-page r30 is **DROPPING** within current window (75.9 → 64.8). The aggregate lift is rising because the user mix shifts (new high-emit users dominate) but per-page reach is mean-reverting. Not the signature of a real UX improvement that should persist.

---

## 4. SDK Version Split

Both devices show ONE SDK version only:

| Device | $lib_version | users_cur |
|---|---|---|
| Mobile | 1.311.0 | 212 |
| Desktop | 1.311.0 | 376 |

PostHog SDK is bundled with the site JS, so all users on the new bundle have the same SDK version. **SDK-version split is not a discriminator here** — but this also means a user with a stale cached bundle from BEFORE PR #269 would emit at 10% and not show up as "1.311.0" cached. We can't distinguish cached-bundle users via $lib_version. The 96%-new-user finding (§2) is what rules out the cache-lag-of-returning-users hypothesis.

---

## 5. Browser-Within-Mobile Breakdown

**Current-window mobile, per-session reach:**

| Browser | Sessions | %r30 | %r60 |
|---|---|---|---|
| Mobile Safari | 164 | 64.6% | 50.0% |
| Chrome (Android) | 70 | 72.9% | 64.3% |
| Chrome iOS | 32 | 53.1% | 40.6% |
| Samsung Internet | 3 | 100% | 100% |
| Firefox iOS | 3 | 33.3% | 0% |

**Mobile Safari and Chrome both show high r30** — this is NOT concentrated in one browser, so it's not a single-vendor SDK lag artifact. That's evidence against (b) at the browser level.

**Within-current-window halves (mobile, per browser):**

| Browser | h1 r30 | h2 r30 |
|---|---|---|
| Mobile Safari | 66.7% (n=84) | 61.7% (n=81) |
| Chrome | 63.4% (n=41) | 86.2% (n=29) |
| Chrome iOS | 42.1% (n=19) | 69.2% (n=13) |

Mobile Safari (the dominant browser, n=164) is FLAT-DOWN within current window. Chrome small-N is up. No clean signal.

---

## 6. Decisive Cross-Cut: New-Users-Only, Same-Page, Both Devices

This is the apples-to-apples test that isolates everything except the residual device-specific effect. **Only users whose first-ever event was ≥ Apr 25 (so guaranteed to be on the unsampled-emission bundle), only `/never-hungover/dhm-dosage-guide-2025`:**

| Device | Window | Sessions | %r30 | %r60 |
|---|---|---|---|---|
| Mobile | early_post_fix (Apr 25-28) | 29 | 34.5% | 31.0% |
| Mobile | current_window (Apr 29-May 12) | 124 | 69.4% | 52.4% |
| Desktop | early_post_fix (Apr 25-28) | 13 | 30.8% | — |
| Desktop | current_window (Apr 29-May 12) | 39 | 43.6% | — |

Lift on mobile = +34.9pp. Lift on desktop = +12.8pp. Mobile lift is ~2.7× desktop lift. This residual is the candidate "real signal" — but the sample size on Apr 25-28 (n=29 mobile, n=13 desktop) is small enough that ±15pp confidence intervals overlap.

**Conditional reach (among TOM-firing sessions only), dosage-guide page**:

| Device | Window | Firing sess | cond_r30 | cond_r60 | cond_r120 | cond_r300 |
|---|---|---|---|---|---|---|
| Mobile | early | 15 | 66.7% | 60.0% | 46.7% | 20.0% |
| Mobile | current | 104 | 85.6% | 64.4% | 38.5% | 19.2% |
| Desktop | early | 7 | 85.7% | 28.6% | 28.6% | 28.6% |
| Desktop | current | 33 | 81.8% | 54.5% | 36.4% | 27.3% |

Mobile cond_r30 rises (+19pp) BUT cond_r120 falls (−8pp) and cond_r300 is flat (−0.8pp). **The deeper milestones don't track the r30 lift on mobile** — the population of TOM-firing mobile sessions is getting LESS engaged on the deep end while gaining at the shallow end. That's not "users staying longer." That's "more shallow sessions are now firing TOM at all," i.e. the emission infrastructure pulling in users who previously didn't fire.

Desktop, by contrast, shows cond_r60 rising (+25.9pp) — modest but trending consistently across milestones. The desktop signal looks more like real engagement on the dosage-guide page.

---

## 7. Recommendation: Do Not Report — Sit On It

**Don't report a "mobile UX win" to stakeholders.** Three reasons:

1. The headline "+38pp mobile vs +3pp desktop" comparison is mostly an artifact of page-mix differences in the aggregate, not a real device effect. On the same page, the mobile/desktop gap shrinks from ~12× to ~2.7×.
2. The remaining mobile-specific lift looks more like emission-ramp dilution than engagement: more shallow mobile sessions are firing TOM but the deeper-milestone reach is not improving (and is degrading on cond_r120).
3. The signal is unstable within the current window. Mobile per-page r30 on the dominant page is going DOWN h1 → h2 (75.9 → 64.8). A "real" UX win should hold or grow, not decay.

**What I'd report internally**: "Mobile time-on-page emission has caught up with desktop and stabilized at a higher rate than desktop. We cannot attribute any of the lift to #340/#341/#343 with confidence — the timing and shape of the ramp matches continued post-#269 SDK adoption, not a release-date causal break. Re-evaluate after May 19 once the emission ramp tail is past."

**What to do operationally**:
- Add a "deep milestone reach (r120/r300)" tile to the PostHog dashboard. r30 is too cheap to distinguish real engagement from emission noise.
- When emission ramp is stable (post-May-19), compare mobile r120/r300 reach on dosage-guide-2025 to a clean post-ramp baseline. If r120 is durably higher than the May 6-12 levels (38.5%/19.2%), then we have a real signal. Right now we don't.
- Tag any future "mobile improved" claim with a per-page breakdown so page-mix artifacts can't confound aggregate reads.

---

## 8. Confidence

**Confidence the mobile r30 lift is mostly artifact: 4/5** (i.e. only ~1/5 chance the bulk of it is real). The +20pp residual after stripping aggregate page-mix could be real, but conditional reach (cond_r120 down on same page) argues against a real engagement story even there. **Confidence as a "good news to report" candidate: 1/5** — this isn't a clean story even if some component is real.

---

## 9. Method Notes

- Window: current = Apr 29 - May 12 (matches A2); early_post_fix = Apr 25-28.
- "New user" = first-ever event ≥ cohort start. Pulled from all-time `events` table.
- All reach percentages are session-level (one TOM event per session counts once per milestone), using `$session_id` from PostHog. Sessions with empty `$session_id` excluded.
- "Conditional reach" = among sessions that fire ANY `time_on_page_milestone`, what % reach milestone N. This strips the emission-rate effect and leaves only the deepness-of-engagement signal.
- Bot day audit deferred to A2's prior work — no bot-heavy day in current window, prior was confounded by Apr 17/19/20.
