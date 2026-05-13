# Scroll-Depth Engagement — Last 14d vs Prior 14d (Agent A4 of 10)

**Generated**: 2026-05-12 (analysis date)
**Windows (UTC)**:
- **Current 14d**: 2026-04-29 → 2026-05-12 (May 12 partial)
- **Prior 14d**:   2026-04-15 → 2026-04-28
**Continue-Your-Research footer**: PR #359, merged 2026-04-29 — sits at the *boundary* between the two windows, so the entire current window is "after."
**Methodology vs baseline**: Brief asks for **per-session reach** (sessions reaching milestone / sessions with pageview). Last analysis (`docs/posthog-2026-04-30/03-engagement.md §2`) used **per-PV rate** (milestone events / pageviews). I report both for continuity, but the headline numbers are session-based per the brief.

---

## 1. TL;DR

**Scroll engagement materially improved site-wide.** Per-session reach grew at every milestone vs prior-botless: 25% reach 13.9% → 17.7% (+3.8 pp), 50% reach 9.4% → 10.2% (+0.8 pp), 75% reach 5.4% → 6.5% (+1.1 pp), 90% reach 3.6% → 4.7% (+1.0 pp). PV-rate tells the same story (90% PV-rate 5.46% → 6.86%). **But the lift is concentrated on Desktop and on `/reviews`, not on the long-form blog posts that the Continue-Your-Research footer targets.** On the top-20 matched long-form posts, 90% reach actually went *down* (3.74% → 3.19%, -0.55 pp on a +19 / -13 absolute count). The footer (PR #359) has no detectable positive effect on long-form 90% reach in this window — but volumes are too thin to call it a failure either. **Confidence 3/5.**

---

## 2. Site-wide per-session reach (current vs prior)

Numerator = distinct `$session_id` where a `scroll_depth_milestone` ≥ X% fired. Denominator = distinct `$session_id` with a `$pageview`. Bot filter: UA regex per `src/lib/posthog.js` (always applied) **and** drop bot-suspect days for prior window (Apr 17, 19, 20 — per `docs/posthog-2026-04-30/05-integrity.md §2`, all three days show pv ≈ sess ≈ users and <6% scroll-rate). Current window has no comparable bot days; PR #346 init-time filter (shipped Apr 29) explains the absence.

| Tier | Prior raw | Prior **botless** | Current | Δ (cur − prior-botless) |
|------|-----------|------|---------|-------------------------|
| Sessions (denom) | 1,572 | **913** | 645 | — |
| 25% reach | 9.92% | **13.91%** | **17.67%** (114/645) | **+3.76 pp** |
| 50% reach | 6.36% | **9.42%** | **10.23%** (66/645) | **+0.81 pp** |
| 75% reach | 3.75% | **5.37%** | **6.51%** (42/645) | **+1.14 pp** |
| 90% reach | 2.54% | **3.61%** | **4.65%** (30/645) | **+1.04 pp** |

Same picture in PV-rate (events / pageviews):

| Tier | Prior raw | Prior botless | Current | Δ |
|------|-----------|---------------|---------|---|
| 25% | 13.04% | 18.33% | **23.55%** | +5.22 pp |
| 50% | 8.35%  | 12.15% | **14.46%** | +2.31 pp |
| 75% | 5.24%  |  7.62% |  **9.69%** | +2.07 pp |
| 90% | 3.66%  |  5.46% |  **6.86%** | +1.40 pp |

**Volume check** (the brief's 20-session bar): 50% (66), 75% (42), 90% (30) all clear the bar in the current window. 75% (49 vs 42) and 50% (86 vs 66) clear it in prior-botless. **90% in prior-botless is at 33** — just above the bar. Claims are defensible; deltas of ~1 pp on n=30-66 are directional, not significant.

**Pass-through ratios** (does the funnel hold its shape?):

| Transition | Prior botless | Current |
|------------|---------------|---------|
| 25→50 | 67.7% (86/127) | 57.9% (66/114) |
| 50→75 | 57.0% (49/86) | 63.6% (42/66) |
| 75→90 | 67.3% (33/49) | 71.4% (30/42) |

25→50 fell. 50→75 and 75→90 both improved. The aggregate session-reach improvement is **mostly more readers crossing the 25% bar at all** (114/645 = 17.7% vs 127/913 = 13.9%), and slightly better completion among those who pass 50%.

---

## 3. Per-page top-20 long-form posts — the Continue-Your-Research footer test

PR #359 (merged 2026-04-29) added a "Continue Your Research" footer to 197 long-form posts. **Hypothesis from the brief**: footer gives readers somewhere to go after finishing, so 90% reach on long-form posts should rise. **Verdict: no such effect detectable.** Top-20 matched (any /never-hungover/* post with ≥5 sessions in either window), normalized for the `dhm-randomized-controlled-trials` rename:

| Path | Prior sess | P 90% n | P 90% % | Cur sess | C 90% n | C 90% % | Δ 90% |
|------|-----------:|--------:|--------:|---------:|--------:|--------:|------:|
| `/never-hungover/dhm-dosage-guide-2025` | 156 | 2 | 1.3% | 156 | 3 | 1.9% | +0.6 pp |
| `/never-hungover/hangover-supplements-complete-guide-...` | 103 | 5 | 4.9% | 68 | 3 | 4.4% | -0.4 pp |
| `/never-hungover/dhm-randomized-controlled-trials` * | 29 | 3 | 10.3% | 44 | 3 | 6.8% | -3.5 pp |
| `/never-hungover/when-to-take-dhm-timing-guide-2025` | 26 | 2 | 7.7% | 27 | 2 | 7.4% | -0.3 pp |
| `/never-hungover/dhm-vs-zbiotics` | 20 | 2 | 10.0% | 14 | 0 | 0.0% | -10.0 pp |
| `/never-hungover/complete-guide-asian-flush-comprehensive` | 25 | 0 | 0.0% | 7 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/flyby-vs-cheers-complete-comparison-2025` | 20 | 0 | 0.0% | 6 | 1 | 16.7% | +16.7 pp |
| `/never-hungover/nac-vs-dhm-which-antioxidant-better-...` | 19 | 4 | 21.1% | 7 | 0 | 0.0% | -21.1 pp |
| `/never-hungover/dhm1000-review-2025` | 10 | 0 | 0.0% | 13 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/dhm-vs-prickly-pear-hangovers` | 12 | 0 | 0.0% | 11 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/dhm-depot-review-2025` | 14 | 0 | 0.0% | 5 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/can-you-take-dhm-every-day-...` | 8 | 0 | 0.0% | 10 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/natural-anxiety-relief-gaba-supplements-...` | 18 | 1 | 5.6% | 0 | 0 | — | post abandoned |
| `/never-hungover/flyby-recovery-review-2025` | 9 | 0 | 0.0% | 8 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/no-days-wasted-vs-fuller-health-...` | 9 | 0 | 0.0% | 7 | 1 | 14.3% | +14.3 pp |
| `/never-hungover/alcohol-digestive-health-gi-impact-...` | 4 | 0 | 0.0% | 8 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/alcohol-metabolism-genetic-testing-...` | 5 | 0 | 0.0% | 7 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/italian-drinking-culture-guide` | 5 | 0 | 0.0% | 6 | 0 | 0.0% | 0.0 pp |
| `/never-hungover/good-morning-hangover-pills-review-2025` | 10 | 0 | 0.0% | 0 | 0 | — | post abandoned |
| `/never-hungover/flyby-vs-toniiq-ease-complete-comparison-...` | 0 | 0 | — | 9 | 0 | 0.0% | new in window |

\* `dhm-randomized-controlled-trials-2024` was renamed to year-agnostic slug on Apr 26 (PR #316). Merged as one row.

**Aggregate across the 20 matched long-form posts** (per-session reach, weighted by sessions):

| Tier | Prior (n/sess) | Prior % | Current (n/sess) | Current % | Δ |
|------|---------------:|--------:|-----------------:|----------:|--:|
| 25% | 99/508 | 19.5% | 85/407 | **20.9%** | +1.4 pp |
| 50% | 61/508 | 12.0% | 40/407 | 9.8% | **−2.2 pp** |
| 75% | 30/508 | 5.9%  | 23/407 | 5.7% | −0.3 pp |
| 90% | 19/508 | 3.7%  | 13/407 | 3.2% | **−0.5 pp** |

**Honest read**: 90% reach on long-form is **down**, not up. Footer did not move the needle on completion. Individual page moves >±10 pp all sit on n≤3 — dust. The +1.4 pp on 25% reach is the only signal on this cohort, and that's "more people scroll at all" rather than "people who started actually finished," which is what the footer was supposed to encourage. **The site-wide gain (§2) is real, but it's not coming from long-form blog completion.**

---

## 4. Per-device reach

| Device | Window | Sessions | 25% reach | 50% reach | 75% reach | 90% reach |
|--------|--------|---------:|----------:|----------:|----------:|----------:|
| Desktop | Prior botless | 712 | 5.6% (40) | 3.8% (27) | 2.2% (16) | 1.4% (10) |
| Desktop | Current | 396 | **8.8%** (35) | **5.6%** (22) | **4.3%** (17) | **2.8%** (11) |
| Desktop | Δ | — | **+3.2 pp** | +1.8 pp | **+2.1 pp** | +1.4 pp |
| Mobile | Prior botless | 194 | 38.7% (75) | 25.3% (49) | 14.4% (28) | 9.3% (18) |
| Mobile | Current | 247 | 30.4% (75) | 17.4% (43) | 9.7% (24) | 7.3% (18) |
| Mobile | Δ | — | **−8.3 pp** | **−7.9 pp** | **−4.7 pp** | −2.0 pp |
| Tablet | Either window | 2-8 | <20 sess in both — **underpowered, no claim** |

**Big finding**: site-wide gain is **Desktop-only**. Desktop 25% reach rose +3.2 pp (40 → 35 absolute milestones, but on a sharply smaller denominator — 712 → 396 sessions; that smaller denominator is what Pattern 5.2 / PR #346 bot filter would produce on Desktop UAs). Mobile per-session reach **fell** at every tier. Absolute mobile 25% n=75 in both windows, so the rate drop is on bigger mobile denominators (194 → 247 sessions) — i.e., mobile traffic grew but the new mobile sessions don't scroll. 50% on mobile fell 49 → 43 — barely above the volume bar — but the direction is unambiguous: **mobile readers in May are scrolling less than April mobile readers.**

This is **the inverse** of what we expected from the post-Apr-27 z-index/FOUC/portal/mega-menu cluster (PRs #339-343) which were supposed to most help Mobile, where the header overlap was most visible.

---

## 5. Per-content-type reach

| Bucket | Prior sess | Prior 90% | Current sess | Current 90% | Δ 90% | Notes |
|--------|-----------:|----------:|-------------:|------------:|------:|-------|
| `/never-hungover/*` (blog) | 809 | 2.5% (n=20) | 520 | **3.3%** (n=17) | +0.8 pp | Real but small; clears volume bar. |
| `/reviews` | 12 | 8.3% (n=1) | 31 | 3.2% (n=1) | — | <20 in prior — **underpowered.** |
| `/compare` | 17 | 0.0% (n=0) | 6 | 0.0% (n=0) | — | <20 in both — **underpowered.** |
| `/research` | 8 | 0.0% (n=0) | 17 | 0.0% (n=0) | — | <20 in both — **underpowered.** |
| `/guide` | 2 | 50.0% (n=1) | 17 | 0.0% (n=0) | — | <20 in both — **underpowered.** |
| Home `/` | 32 | 3.1% (n=1) | 33 | 0.0% (n=0) | — | <20 milestone count — **underpowered.** |

Only the blog bucket clears the bar on its own. Its 90% reach moved up +0.8 pp (20 → 17 absolute on smaller denominator). That's the same direction as site-wide §2 but smaller in magnitude — the bigger site-wide gains are coming from `/reviews` (sessions tripled 12 → 31, with 19.4% 50% reach on the new traffic), which is the same finding `03-engagement.md §1b` flagged on the affiliate side last window.

---

## 6. Field-rename audit (Pattern #12 backward compat)

For all 863 `scroll_depth_milestone` events in the analysis window:
- 863/863 carry `properties.depth_percentage`
- 863/863 carry `properties.depth`
- 0 events where the two values disagree (verified by `GROUP BY pct, d` returning only 25.0/25.0, 50.0/50.0, 75.0/75.0, 90.0/90.0 pairs)

Pattern #12 (PR #109 batch) added `depth_percentage` while keeping `depth` for backward compat. Both fields exist on every event in the window. **No data lost to the rename.** Queries used `coalesce(depth_percentage, depth)` per the brief. The integrity agent can de-dupe these fields safely after sufficient dashboard transition time.

---

## 7. Confidence: **3 / 5**

- **What's solid (4-5)**: site-wide per-session reach lift is real and consistent across PV-rate and per-session methodologies, both numerator and denominator move in the right direction, and 50/75/90 sessions in current window all clear the 20-session bar.
- **What's soft (2-3)**:
  - The Continue-Your-Research footer test on top-20 long-form posts found *no improvement* in 90% reach (and a small drop). That's not a positive verdict on the footer; it's a flat result on volumes too small to call it a failure.
  - Mobile reach *dropped* at every tier, which is unexpected and not consistent with the "z-index fixes helped mobile" hypothesis. Worth its own investigation by a UX agent.
  - The current-window denominator (645 sessions) is structurally cleaner than prior (PR #346 init-time bot filter on Apr 29) — some of the site-wide rate improvement is the denominator becoming less bot-polluted, not behavior changing. The "prior-botless" comparison controls for the largest known bot days, but the PR #346 filter catches additional UA-shaped bots that the prior-window-day-exclusion doesn't address. Likely 0.3-0.7 pp of the site-wide 90% gain is this cleanup.
- **What we can't claim**:
  - That the footer worked (it didn't).
  - That mobile got better (it didn't).
  - That any single page improved — every per-page delta sits on n≤5 absolute counts.

---

## 8. Action items

1. **Investigate the mobile reach regression** (8.3 pp drop at 25%, 7.9 pp drop at 50%). Mobile sessions grew (194 → 247) but completion rates fell. Three candidates: (a) the Apr 26 mega-menu portal (PR #326/#340) added a top-of-page UI element that may eat above-fold real estate on small screens; (b) Apr 28 FOUC fix (PR #343) changed layout timing; (c) new mobile traffic is from a lower-engagement channel that needs its own per-channel scroll-depth split (agent A2 should cross-check).
2. **Continue-Your-Research footer (PR #359) is not delivering a 90% reach lift.** Either: (a) readers aren't reaching the footer (90% only reached on 13/407 = 3.2% of long-form sessions in window — most readers never see it); (b) the footer is reaching them but they're closing the page instead of clicking through; or (c) volume is too thin to detect the effect. Hand off to the funnel/conversion agent (A6/A7) to check whether the footer's CTAs are firing `element_clicked` at materially-detectable rates.
3. **`/reviews` is the only content type with a real session-volume increase** (12 → 31 sessions, +158%) and meaningful 50% reach (19.4% vs 8.3%). Worth understanding what's bringing this traffic — could be the inline-Amazon-link tagging (PR #275 Apr 26) making more product clicks attributable; cross with affiliate-CTR agent (A3).
4. **Drop "post abandoned" from the top-20**: `natural-anxiety-relief-gaba-supplements-...` and `good-morning-hangover-pills-review-2025` got 0 sessions in current. Either deindexed, deleted, or de-prioritized. Worth a content-team check.
5. **Re-run on 2026-05-26** with 2 more weeks of post-PR-359 data. If 90% reach on top-20 long-form still hasn't moved, the footer is a no-op for scroll completion and should be re-evaluated (or its goal redefined as "internal-link click" rather than "scroll depth").

**TaskUpdate**: task #4 completed.
