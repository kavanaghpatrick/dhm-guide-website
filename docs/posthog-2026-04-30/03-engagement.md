# Engagement Analysis — Last 14d vs Prior 14d (Agent 3 of 5)

**Generated**: 2026-04-30 (analysis date)
**Windows**:
- **Last 14d**: 2026-04-17 00:00 → 2026-04-30 23:59 (Apr 30 partial; ~10h elapsed at run-time)
- **Prior 14d**: 2026-04-03 00:00 → 2026-04-16 23:59
**Apr 28 UI fixes**: shipped Apr 28 — only **~2.5 days of post-fix data** sit inside the last-14d window. Any "post-fix" claim from this comparison is structurally weak; framed accordingly throughout.

> **TL;DR (read this first):** Volume is too low and several confounders are too large to attribute anything to the Apr 28 fixes. CTR rose 1.4% → 2.1% but the absolute delta is +4 clicks, and the composition completely flipped between windows (`/compare` collapsed, `/reviews` carried more clicks). Scroll depth ratios held; exceptions dropped 39 → 9 — that one is real but pre-dates Apr 28. Two integrity issues found that the integrity-agent should follow up on: (1) a structural ~20× step-change in `time_on_page_milestone` emission rate starting Apr 25 (almost certainly a deployment/tracking change, not user behavior), and (2) Apr 11/13/17/20 PV inflation from a desktop-Chrome bot is large enough that "raw 14d totals" understate the engagement story.

---

## 1. Affiliate CTR

### 1a. Overall

| Window     | Pageviews | Affiliate clicks | CTR (raw) |
|------------|-----------|------------------|-----------|
| Prior 14d  | 2,034     | 28               | 1.376%    |
| Last 14d   | 1,512     | 32               | 2.116%    |
| **Δ (last − prior)** | **−522 PV** | **+4 clicks** | **+0.74 pp** |

**Botless** (excluding suspected-bot days Apr 11, Apr 13, Apr 17, Apr 20 — see §2 of agent 1's brief; high-Chrome-Desktop, near-zero engagement):

| Window           | PV    | Clicks | CTR    |
|------------------|-------|--------|--------|
| Prior 14d (botless: drop Apr 11, 13) | 1,131 | 24     | 2.122% |
| Last 14d (botless: drop Apr 17, 20)  |   989 | 28     | 2.831% |
| **Δ**            | **−142** | **+4** | **+0.71 pp** |

**Verdict**: The +4 absolute click delta does **NOT clear the >5-clicks bar** the brief specified. The CTR rise is real arithmetic but driven by a smaller denominator (less bot pollution + a slow traffic decline) more than a larger numerator. **Do not call this an improvement.**

### 1b. Composition — where the clicks came from (this is the big finding)

| Path                                                                              | Prior 14d clicks | Last 14d clicks | Δ |
|-----------------------------------------------------------------------------------|------------------|-----------------|---|
| `/reviews`                                                                        | 18               | 28              | **+10** |
| `/compare`                                                                        | 10               | 0               | **−10** |
| `/never-hungover/no-days-wasted-vs-dhm1000-comparison-2025`                       | 0                | 2               | +2 |
| `/` (homepage)                                                                    | 0                | 2               | +2 |
| **Total**                                                                         | **28**           | **32**          | **+4** |

`/compare` traffic crashed from 87 PV → 26 PV (−70%) and clicks went 10 → 0. `/reviews` traffic was flat (28 → 27 PV) but clicks rose 18 → 28 (+56%). **The +10 absolute delta on `/reviews` IS above the 5-click threshold** in isolation, but two caveats:
- `/reviews` is a comparison-table page; both windows show >1 click per pageview because the page lists multiple Amazon products and each product CTA fires a separate `affiliate_link_click`. CTR % is meaningless on this page; raw click counts are the right metric.
- The `/reviews` rise is offset penny-for-penny by the `/compare` collapse, so the SITE-wide picture is null.

The honest read: traffic mix shifted, top-line conversion is statistically flat.

### 1c. Per-page table (≥30 PV in either window)

| Path                                                                            | Prior PV | Prior clicks | Prior CTR | Last PV | Last clicks | Last CTR |
|---------------------------------------------------------------------------------|----------|--------------|-----------|---------|-------------|----------|
| /never-hungover/dhm-dosage-guide-2025                                           | 209      | 0            | 0.0%      | 217     | 0           | 0.0%     |
| /never-hungover/dhm-randomized-controlled-trials-2024                           | 197      | 0            | 0.0%      | 101     | 0           | 0.0%     |
| /never-hungover/hangover-supplements-complete-guide-what-actually-works-2025    | 182      | 0            | 0.0%      | 169     | 0           | 0.0%     |
| /compare                                                                        | 87       | 10           | 11.49%    | 26      | 0           | 0.00%    |
| /never-hungover/flyby-vs-cheers-complete-comparison-2025                        | 64       | 0            | 0.0%      | 85      | 0           | 0.0%     |
| /never-hungover/when-to-take-dhm-timing-guide-2025                              | 56       | 0            | 0.0%      | 61      | 0           | 0.0%     |
| /never-hungover/complete-guide-asian-flush-comprehensive                        | 53       | 0            | 0.0%      | 34      | 0           | 0.0%     |
| /                                                                               | 42       | 0            | 0.0%      | 60      | 2           | 3.33%    |
| /reviews                                                                        | 28       | 18           | 64%*      | 27      | 28          | 104%*    |

\* >100% CTR is multi-product table tracking, not a metric error. Use raw counts for `/reviews`, not %.

The flat-zero CTR on the high-traffic content posts (dosage guide, RCT post, supplements guide) is the more notable finding for the conversion-funnel agent: ~700+ PV in last-14d on those three pages produced **zero affiliate clicks** in either window. That's not a 14d-vs-14d story; it's a chronic monetization gap.

---

## 2. Scroll Depth Milestones

| Depth | Prior 14d count | Last 14d count | Prior PV-rate | Last PV-rate | Δ pp |
|-------|-----------------|----------------|---------------|--------------|------|
| 25%   | 171             | 215            | 8.41%         | 14.22%       | +5.81 pp |
| 50%   | 110             | 142            | 5.41%         | 9.39%        | +3.98 pp |
| 75%   |  60             |  97            | 2.95%         | 6.42%        | +3.47 pp |
| 90%   |  39             |  71            | 1.92%         | 4.70%        | +2.78 pp |

PV-rate = milestones ÷ pageviews, where the denominator is window-wide pageviews. (Same caveat as TOM — denominator includes likely-bot days that don't fire scroll events.)

**Pass-through ratios** (does the funnel hold its shape?):

| Tier transition | Prior pass-through | Last pass-through |
|-----------------|---------------------|--------------------|
| 25% → 50%       | 64.3%               | 66.0%              |
| 50% → 75%       | 54.5%               | 68.3%              |
| 75% → 90%       | 65.0%               | 73.2%              |

The shape is preserved (slight improvement at 50→75 and 75→90, which is consistent with "fewer bots in the denominator" rather than "real users scrolled deeper").

**% of pageviews reaching 50%** (the brief's headline metric):
- Prior: **5.41%** (110 / 2,034)
- Last:  **9.39%** (142 / 1,512)
- Botless prior: 110 / 1,131 = **9.73%**
- Botless last:  142 / 989  = **14.36%**

**Verdict**: The botless rate gain (9.7% → 14.4%) is the kind of move that *could* indicate real engagement improvement, but the absolute milestone delta is just +32 events (110 → 142). On these volumes the change doesn't separate from ordinary daily variance, and there's no Apr-28 inflection in the daily series — Apr 26 and Apr 27 (PRE-fix) account for 95 + 35 = 130 of the last 14d's 525 milestones. **Do NOT attribute to the Apr 28 fix.**

---

## 3. Time on Page Milestones — DATA INTEGRITY ISSUE, do not use as engagement signal

| Window     | Pageviews | TOM events | Milestones / PV |
|------------|-----------|------------|-----------------|
| Prior 14d  | 2,034     | 337        | 0.166           |
| Last 14d   | 1,512     | 454        | 0.300           |

That `0.166 → 0.300` would normally be a 1.8× engagement gain. **It is not real.** Daily series shows a hard step-change starting Apr 25:

| Day      | PV  | TOM | TOM/PV | Sessions emitting TOM |
|----------|-----|-----|--------|------------------------|
| Apr 22   |  94 |  11 | 0.117  |  4 |
| Apr 23   |  69 |   7 | 0.101  |  3 |
| Apr 24   |  74 |   5 | 0.068  |  3 |
| **Apr 25** | 72 | 25 | **0.347** | 8 |
| **Apr 26** | 68 | 76 | **1.118** | 21 |
| **Apr 27** | 42 | 60 | **1.429** | 17 |
| **Apr 28** | 65 | 74 | **1.138** | 23 |
| **Apr 29** | 110 | 111 | **1.009** | 40 |

Sessions emitting TOM jumped from 3-4/day pre-Apr-25 to 21-40/day after. The milestone-seconds **distribution shape is unchanged** (10s:30s:60s:120s:300s decay is the same pre/post in proportion). What changed is **how many sessions emit TOM at all**. That's a deployment/tracking signature, not user behavior.

**Working hypothesis** (for integrity agent #5 to confirm): something shipped around Apr 24-25 that either (a) lowered the bar for TOM emission (e.g., a `pagehide` handler started flushing milestones that previously got dropped), (b) added TOM emission to a page that previously didn't have it, or (c) Apr 28's portal/FOUC/z-index PR cluster started loading PostHog earlier in lifecycle. Worth a 15-minute look at the PR diffs touching `useEngagementTracking` / `usePageVisibility` / `posthog.js` between Apr 22-28.

**Verdict**: TOM is **unusable** as a window-vs-window engagement metric until the integrity issue is resolved. The naive +85% read is almost entirely a measurement artefact.

---

## 4. Dead Clicks (Real / Filtered) and Exceptions

### 4a. Dead clicks — daily series, Apr 3–30

| Day      | PV  | DC raw | DC real | DC real / PV |
|----------|-----|--------|---------|---------------|
| Apr 03   |  55 |   2 |  2 | 3.6% |
| Apr 04   |  82 |   2 |  2 | 2.4% |
| Apr 05   |  44 |   3 |  1 | 2.3% |
| Apr 06   |  76 |   4 |  1 | 1.3% |
| Apr 07   | 102 |   3 |  1 | 1.0% |
| Apr 08   |  95 |   3 |  1 | 1.1% |
| Apr 09   |  79 |   4 |  4 | 5.1% |
| Apr 10   |  49 |  20 | 18 | 36.7% |
| **Apr 11** | **485** | 72 | 72 | 14.8% (bot day) |
| Apr 12   | 153 |  17 | 14 | 9.2% |
| **Apr 13** | **418** |   3 |  3 | 0.7% (bot day) |
| Apr 14   | 130 |   1 |  1 | 0.8% |
| Apr 15   | 135 |   1 |  1 | 0.7% |
| Apr 16   | 131 |  18 | 17 | 13.0% |
| **Apr 17** | **273** |   4 |  3 | 1.1% (bot day) |
| Apr 18   | 119 |   3 |  2 | 1.7% |
| Apr 19   | 147 |   8 |  6 | 4.1% |
| **Apr 20** | **250** |   4 |  1 | 0.4% (bot day) |
| Apr 21   | 102 |   4 |  3 | 2.9% |
| Apr 22   |  94 |   6 |  3 | 3.2% |
| Apr 23   |  69 |   1 |  1 | 1.4% |
| Apr 24   |  74 |   3 |  3 | 4.1% |
| Apr 25   |  72 |   8 |  7 | 9.7% |
| Apr 26   |  68 |  18 | 17 | 25.0% |
| Apr 27   |  42 |  15 | 14 | 33.3% |
| **Apr 28 (fixes shipped)** |  65 |   6 |  6 | 9.2% |
| Apr 29   | 110 |  44 | 44 | 40.0% |
| Apr 30   |  27 |   1 |  0 | 0.0% (partial) |

**Aggregates**:

| Window     | DC events (real) | Sessions w/ DC | Events / session |
|------------|------------------|-----------------|-------------------|
| Prior 14d  | 138              | 29              | 4.76              |
| Last 14d   | 110              | 33              | 3.33              |

**Per-session rage-clicking went DOWN** (4.76 → 3.33 events per affected session). The absolute event drop (138 → 110) is the right direction. But the **count of distinct sessions with at least one dead click rose** (29 → 33), so user-side reach is up.

**Apr 29's "spike" of 44 dead clicks**: ALL from **5 sessions / 4 persons**, concentrated on `/` (22 events), `/research` (14), and the supplements guide (8). Element-text inspection shows users clicking on **non-clickable text** that visually looks like a link: study titles in /research ("Efficacy of Hovenia dulcis...", "Filter Studies", "UCLA 2012", "2026 RCT Results"), supplement names on `/` ("NAC (N-Acetylcysteine)", "Quality Score:"), and product names in the supplements guide ("DHM Depot", "6. More Labs Morning Recovery", "3. Morning Recovery"). **This is a UX issue specific to those text-heavy pages, not a regression from the Apr 28 fixes.**

**Did Apr 28 fixes drop dead clicks?** Apr 28 itself: 6 events (low). Apr 29: 44 (high but 5-session). With only 2 post-fix days available, **the data does not support a yes/no answer.** Look again on May 5.

### 4b. Exceptions — daily

| Day | Exceptions |
|-----|------------|
| Apr 03 | 3 |
| Apr 06 | 36 |
| Apr 23 | 9 |
| (all other days) | 0 |

Aggregates:

| Window     | Exceptions |
|------------|-------------|
| Prior 14d  | 39          |
| Last 14d   | 9           |

The drop is real (−30 events), but it's almost entirely the **single Apr 6 spike of 36** (which sits in the prior-14d window). Without Apr 6, prior would be 3 and last would be 9, **opposite** direction. The Apr 6 incident is a single-day issue from earlier in the period; Apr 23 (9 events) is the only above-zero day in last-14d and pre-dates the Apr 28 fixes by 5 days. **No Apr-28 effect detectable.**

---

## 5. What we can say vs. what we can't say

### Things we can say with confidence

1. **Site-wide affiliate CTR is essentially flat** (28 → 32 clicks, +4 absolute, below the 5-click significance bar). The 1.38% → 2.12% rate change is arithmetically real but is dominated by a smaller denominator, not more clicks.
2. **Click composition shifted**: `/compare` collapsed (−10 clicks, −70% PV), `/reviews` rose (+10 clicks on flat PV). The site-level net is null. `/compare`'s collapse is the bigger story — agent 2 (channels/recovery URLs) should investigate.
3. **High-traffic content posts continue to monetize at 0.0% CTR** in BOTH windows: the dosage guide (217 last-14d PV), supplements guide (169), and RCT post (101) produced zero affiliate clicks. That's a chronic gap; not a 14-day story.
4. **Per-session rage-clicking dropped** (4.76 → 3.33 events per affected session), even though session count with dead-clicks ticked up (29 → 33).
5. **Exceptions are dominated by a single Apr 6 incident** (36 of the 39 prior-window events). Removing that one day, the count went UP (3 → 9), all on Apr 23.

### Things we cannot say

1. **Whether the Apr 28 portal/FOUC/z-index fixes improved engagement.** Only ~2.5 days of post-fix data exist. The user already correctly framed this as a trap; results bear that out.
2. **Whether scroll depth genuinely improved.** Botless rate (9.7% → 14.4% reaching 50%) looks promising but absolute milestone delta is +32 events, well within day-to-day noise on a ~70-PV/day base. No Apr-28 inflection in the daily series.
3. **Whether time-on-page improved.** TOM shows a fake +85% gain that is almost certainly a tracking change shipped around Apr 24-25 (sessions-emitting jumped 3-4/day → 21-40/day; the underlying milestone-seconds distribution shape is unchanged). **Flag for integrity agent (#5) to confirm and root-cause.**
4. **Whether dead-clicks dropped after fixes.** Last 14d total is lower (138 → 110), but Apr 29 alone fired 44 events from 5 sessions, demonstrating the metric is dominated by a small number of high-rage-click sessions on text-heavy pages (`/`, `/research`, supplements guide) where headings/study-titles look clickable. The Apr 28 fixes do not target these pages.

### Recommendations for the team

- **Re-run this analysis after May 5** to get ≥7 days of post-fix data, then re-evaluate dead-clicks and scroll depth.
- **Investigate the TOM step-change**: search PR diffs Apr 22-28 for changes to `useEngagementTracking`, `usePageVisibility`, `posthog.js`, or visibility-change/pagehide handling. This is the highest-priority integrity finding here.
- **Investigate `/compare` traffic loss**: 87 → 26 PV (−70%) and the only page that converted at >5% CTR in prior-14d went to zero. This is more urgent than any of the engagement micro-moves.
- **Investigate dead clicks on `/research` and `/`**: text-shaped-like-links (study titles, headings, product names) are causing rage clicks. Either underline/CTA them or remove the visual affordance. Low-effort fix, repeatable signal across days.
- **The chronic 0% CTR on three top content posts** (dosage / supplements / RCT) deserves its own investigation. Any percent of clicks from those would dwarf Apr-28-fix-attributable changes.
