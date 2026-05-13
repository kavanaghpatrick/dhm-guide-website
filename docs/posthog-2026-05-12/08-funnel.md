# 08 — Conversion Funnel

**Agent A8. Window: 2026-04-29 → 2026-05-12 (current 14d, May 12 partial). Prior: 2026-04-15 → 2026-04-28. Pulled 2026-05-12.**

Bot filter: UA-regex per `docs/posthog-2026-04-30/05-integrity.md` § 5.2 (matches `bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|prerender|headless|lighthouse`). Prior 14d also reported on **bot-clean** basis (excluding Apr 17/19/20 spike days — see § 2 of integrity doc). Current 14d has no flagged bot days (max pv/sess = 1.09).

---

## 1. TL;DR

**The bottleneck is the same in both windows: Step 3 → Step 4 (deep-scroll blog reader → /compare or /reviews pageview). It moved from "near-zero" to "literal-zero" — 0 of 26 deep-scroll sessions in current 14d navigated to the comparison hub vs. 3 of 37 in prior-clean (8.1%).**

But that's the wrong story to lead with. The **real story** is that the *prescribed funnel does not describe how conversions actually happen on this site*. Of the 22 affiliate-clicking sessions in current 14d, **16 hit a blog post and an affiliate click without ever firing a /compare or /reviews pageview** — affiliate clicks fire from `/reviews` per `properties.$pathname`, but those /reviews PVs are not captured as part of the session's pageview stream (likely a router/client-side-route capture quirk, or the CompareCTA / affiliate widgets are embedded inline on blog pages and the pathname property is overridden at click-time). Either way: **the comparison hub is not a step users walk through; it's a destination they teleport to (or a widget they click from inside another page).**

Confidence: **3/5** (volumes are tiny; tracking semantics for affiliate-click `$pathname` need verification; per integrity doc, prior window is contaminated with 3 bot-spike days even after clean exclusion).

**Volume bar trip**: Steps 3, 4, 5 all have <30 sessions in current window → underpowered. Step 4 has 0 in current. **Do not run statistical tests on the strict 5-step funnel** — use the alternative permissive funnel for any inference.

---

## 2. Funnel Table (5 steps × 2 windows)

| Step | Definition | Current 14d | Prior 14d (raw) | Prior 14d (clean*) |
|------|-----------|-------------|-----------------|---------------------|
| S1 | Session start (any path) | **710** | 1,710 | **996** |
| S2 | Blog PV (`/never-hungover/*` ∨ `/research` ∨ `/guide`) | **549** | 1,430 | 816 |
| S3 | Same session: scroll≥75% on blog | **26** | 44 | 37 |
| S4 | Same session: `/compare*` ∨ `/reviews*` PV | **0** | 3 | 3 |
| S5 | Same session: `affiliate_link_click` | **0** | 3 | 3 |

**\* clean = excludes Apr 17/19/20 bot days per integrity doc.**

### Step-to-step conversion rates

| Transition | Current | Prior clean | Δ |
|------------|---------|-------------|---|
| S1 → S2 (visit blog) | **77.3%** | 81.9% | −4.6 pp |
| S2 → S3 (read deeply) | **4.7%** | 4.5% | +0.2 pp |
| S3 → S4 (navigate to hub) | **0.0%** | 8.1% | **−8.1 pp (worst)** |
| S4 → S5 (click affiliate from hub) | n/a (S4=0) | 100% | — |
| S1 → S5 end-to-end | **0.000%** | 0.301% | −0.3 pp |

**The S3 → S4 transition is the bottleneck in both windows.** It moved from "rare" (8%) to "never observed" (0%) — but the absolute counts (3 sessions in prior, 0 in current) are within sampling noise. **Both windows say the same thing: scroll-deep readers do not visit the compare hub.**

---

## 3. Alternative Permissive Funnel (drop the scroll filter, drop S4 ordering)

| Step | Current | Prior raw | Prior clean |
|------|---------|-----------|-------------|
| S1 sessions | 710 | 1,710 | 996 |
| S2 blog PV | 549 (77.3%) | 1,430 (83.6%) | 816 (81.9%) |
| S2→ blog ∧ aff_click | **16 (2.91%)** | 9 (0.63%) | 6 (0.74%) |
| Any aff click in session | **22 (3.10% of S1)** | 15 (0.88%) | 11 (1.10%) |

**Current-vs-prior-clean: blog→affiliate conversion is 2.91% vs 0.74% — a ~3.9× improvement.** This is the meaningful funnel result. Note the integrity caveat: PR #275 (Apr 26) tagged previously-untracked inline blog Amazon links, so part of this uplift is tagging-completeness, not behavior. Even discounting that, the direction is clear: **users convert from inside blog posts via embedded widgets, not by navigating to the comparison hub.**

---

## 4. Time-to-Convert (sessions with any affiliate click)

| Window | Converters (N) | Median | p75 | p90 | Min | Max |
|--------|---------------|--------|-----|-----|-----|-----|
| Current 14d | 22 | **76 s** | 142 s | 334 s | 16 s | 3,760 s |
| Prior 14d (raw) | 15 | 132 s | 329 s | 755 s | 13 s | 2,926 s |

Time-to-convert **roughly halved** in current vs prior (76 s vs 132 s median). Two readings: (a) users are deciding faster — possibly because affiliate widgets are now better-placed within blog posts post-PR-#275; (b) the prior period includes some long-tail bot-like sessions. Underpowered either way (N=22).

---

## 5. Per-Device Funnel (current 14d)

| Device | Sessions | Blog PV | Converters | Blog → aff CVR |
|--------|----------|---------|------------|----------------|
| Desktop | 434 | 319 | 3 | 0.94% |
| **Mobile** | 274 | 229 | **13** | **5.68%** |
| Tablet | 2 | 1 | 0 | n/a |

| Device | Median TTC | p75 | p90 |
|--------|-----------|-----|-----|
| Mobile (n=14) | 76 s | 128 s | 225 s |
| Desktop (n=8) | 86 s | 196 s | 474 s |

**Mobile is the conversion engine.** 47% of converters from 39% of sessions; **mobile blog-readers convert at 6× desktop's rate.** Prior-clean comparison: mobile blog→aff CVR was 0.54% (n=1), desktop was 0.64% (n=4) — i.e., in current window mobile jumped ~10×. Caveat: small-N, post-PR-#275 tagging.

---

## 6. Per-Entry-Path Funnel (top landing pages, current 14d)

| Landing path | Sess | Blog | Scroll≥75 | Converters | Landing→aff CVR |
|--------------|------|------|-----------|------------|------------------|
| `/never-hungover/dhm-dosage-guide-2025` | 192 | 156 | 9 | 2 | 1.04% |
| `/never-hungover/hangover-supplements-complete-guide-…-2025` | 71 | 68 | 3 | **9** | **12.7%** |
| `/never-hungover/dhm-randomized-controlled-trials` | 45 | 44 | 4 | 1 | 2.22% |
| `/` (homepage) | 43 | 2 | 0 | 1 | 2.33% |
| `/reviews` (direct landing) | 33 | 0 | 0 | 4 | 12.1% |
| `/never-hungover/when-to-take-dhm-timing-guide-2025` | 24 | 21 | 3 | 0 | 0% |
| `/guide` | 17 | 16 | 0 | 0 | 0% |
| `/never-hungover/dhm1000-review-2025` | 14 | 13 | 2 | 0 | 0% |
| `/never-hungover/dhm-vs-zbiotics` | 14 | 14 | 0 | 0 | 0% |
| `/research` | 12 | 12 | 0 | 0 | 0% |

**Two pages produce nearly all converters (13 of 22):** `hangover-supplements-complete-guide…` (9 converters, 12.7% landing CVR) and direct-landings on `/reviews` (4 converters, 12.1% CVR). The site's top-traffic page `dhm-dosage-guide-2025` (192 sessions = 27% of all sessions) produces only 2 converters at 1.04% CVR — **a ~12× CVR gap** vs the hangover-supplements page. Same author, same template, dramatically different conversion. Worth investigating: is the dosage-guide page low on embedded comparison widgets / affiliate CTAs?

---

## 7. Did the bottleneck move?

**No.** Both windows: S3 → S4 (deep-scroll → comparison hub) is the dominant drop. The strict 5-step funnel essentially does not execute in either window. What changed is the **alternative path** (blog → embedded affiliate widget without hub visit) which moved from 0.74% to 2.91% — partly real, partly PR #275 tagging completeness.

---

## 8. Confidence: 3 / 5

**Why not higher:**
- N=22 converters in current window, N=11 in prior-clean. Subgroup splits (device, landing) are directional, not significant.
- Per-pathname affiliate click semantics are weird: 36 affiliate clicks report `$pathname = /reviews` but only ~6 sessions show a /reviews pageview. This is a meaningful tracking mystery — could be inline widgets stamping `$current_url` at click-time, or React-Router PVs being missed.
- PR #275 (Apr 26) changed affiliate tagging completeness mid-window. The 3.9× blog→aff lift is part-real, part-instrumentation.
- PR #346 (Apr 29) shipped a UA-bot filter that overlaps the current-window start. The bot-spike days (Apr 11/13/17/19/20) all used Chrome-UA spoofing and were NOT caught by the new filter, so the imbalance is mostly in prior window.

**Why not lower:** the structural finding (conversions don't route through the comparison hub) is consistent across both windows and across landing-path breakdowns. That direction is robust even if the magnitudes aren't.

---

## 9. Action Items (next-quarter UX focus)

1. **Investigate the affiliate-click `$pathname` mystery.** Is the comparison content embedded inside blog posts, with affiliate clicks reporting `$current_url=/reviews` even though the user is on a `/never-hungover/*` URL? If yes, the strict 5-step funnel is measuring a non-existent user journey. If no, the comparison hub PVs are being lost — fix capture. **Action: trace one affiliate_link_click in DevTools and verify what `$current_url` reports vs `window.location.pathname`.**
2. **Audit `dhm-dosage-guide-2025` for missing affiliate placements.** 27% of all sessions, 1.04% CVR. The `hangover-supplements-complete-guide…` page at 12.7% CVR has the same template — diff the rendered markup, identify what's missing on dosage-guide, replicate.
3. **Stop optimizing the `/compare` and `/reviews` hub pages.** 0 of 26 deep-scrollers visited them in current 14d. Either users don't see them as the next step, or the in-page comparison widgets make hub-pages redundant. **Do not invest in hub-page UX improvements until step 1 above is resolved.**
4. **Double down on mobile-blog affiliate widgets.** Mobile blog→aff CVR is 5.68% (10× desktop). 39% of sessions; placement, visibility, and touch-targets on mobile are the highest-ROI optimization surface.
5. **Redefine the funnel for next quarter.** The 5-step funnel as specified isn't the user journey. Propose: S1 session → S2 blog PV → S3 scroll≥50 (lower threshold — only 4.7% reach 75%, that's a measurement issue) → S4 in-page affiliate widget impression event (need to instrument) → S5 affiliate click. **Add an `affiliate_widget_visible` event** so we can measure scroll-into-view of CTAs, then optimize on that.
6. **Long-tail content has zero conversion power right now.** Pages like `dhm-vs-zbiotics` (14 sess, 0 conv), `when-to-take-dhm-timing-guide` (24 sess, 0 conv) — all blog landings without affiliate paths. If they're not adding affiliate widgets they're not adding revenue. Audit which posts have CompareCTA components and which don't.

---

## Notes for synthesis

- **Underpowered**: every cell in the strict 5-step funnel except S1/S2 has <30 sessions in current 14d. Treat S3-S5 numbers as anecdotes, not metrics.
- **Apply integrity doc caveats**: PR #275 affiliate-link tagging started Apr 26 (so current 14d benefits from tagging completeness that prior 14d didn't have). Discount the blog→aff uplift accordingly.
- **The strict funnel and the alternative funnel disagree by 100×** (0 sessions vs. 22 sessions converting). This is the single most important finding and is a tracking-architecture question, not a UX question.
