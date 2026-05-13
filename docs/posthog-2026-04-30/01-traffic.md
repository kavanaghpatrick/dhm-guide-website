# Top-line Traffic Analysis — Last 14 days vs Prior 14 days

**Generated:** 2026-04-30
**Agent:** 1 of 5 (traffic top-line)
**Data source:** PostHog `$pageview` events, project 275753 (www.dhmguide.com)

## Window definitions

- **Current window:** 2026-04-16 → 2026-04-29 inclusive (14 complete days)
- **Prior window:** 2026-04-02 → 2026-04-15 inclusive (14 complete days)
- **Today (2026-04-30):** PARTIAL (26 PV captured at query time) — **excluded from all aggregates**

Window starts on a Thursday in both cases, so day-of-week alignment is exact (no manual offsetting required).

---

## 1. Headline numbers

### Raw (no outliers removed)

| Metric                  | Prior 14d (Apr 2–15) | Current 14d (Apr 16–29) | Δ          | Δ %      |
| ----------------------- | -------------------: | ----------------------: | ---------: | -------: |
| Total pageviews         |                1,931 |                   1,616 |       −315 |   −16.3% |
| Mean daily PV           |                137.9 |                   115.4 |      −22.5 |   −16.3% |
| **Median daily PV**     |             **88.5** |                **98.0** |   **+9.5** | **+10.7%** |
| Min daily PV            |                   28 |                      42 |        +14 |          |
| Max daily PV            |                  485 |                     273 |       −212 |          |
| Q1 daily PV             |                   55 |                      69 |        +14 |          |
| Q3 daily PV             |                  135 |                     131 |         −4 |          |

**Note the divergence:** mean is DOWN 16% but median is UP 11%. Mean is being dragged by very large bot-suspect days in the prior window (485, 418); see §3.

### Excluding the 4 bot-suspect outlier days

| Metric             | Prior (excl Apr 11, Apr 13) | Current (excl Apr 17, Apr 20) | Δ        | Δ %      |
| ------------------ | --------------------------: | ----------------------------: | -------: | -------: |
| Days in window     |                          12 |                            12 |          |          |
| Total pageviews    |                       1,028 |                         1,093 |      +65 |    +6.3% |
| Mean daily PV      |                        85.7 |                          91.1 |     +5.4 |    +6.3% |
| Median daily PV    |                        80.5 |                          84.0 |     +3.5 |    +4.3% |

**Confidence: LOW.** ~100 PV/day median means a single outlier session shifts the daily figure by 5–10%. With only 12 non-outlier days per window, this is a very small sample for trend detection. The 6% raw delta is well within the noise floor of normal day-to-day variability.

---

## 2. Day-of-week matched comparison

Both windows are 14 consecutive days starting on Thursday, so each weekday appears twice in each window. Table is sorted by weekday.

| Day | Prior date | Prior PV | Current date | Current PV | Δ      | Δ %       | Notes              |
| --- | ---------- | -------: | ------------ | ---------: | -----: | --------: | ------------------ |
| Mon | 2026-04-06 |       76 | 2026-04-20   |        250 |   +174 |   +228.9% | **bot day**        |
| Mon | 2026-04-13 |      418 | 2026-04-27   |         42 |   −376 |    −90.0% | **bot day (prior)**|
| Tue | 2026-04-07 |      102 | 2026-04-21   |        102 |     +0 |     +0.0% |                    |
| Tue | 2026-04-14 |      130 | 2026-04-28   |         65 |    −65 |    −50.0% |                    |
| Wed | 2026-04-08 |       95 | 2026-04-22   |         94 |     −1 |     −1.1% |                    |
| Wed | 2026-04-15 |      135 | 2026-04-29   |        110 |    −25 |    −18.5% |                    |
| Thu | 2026-04-02 |       28 | 2026-04-16   |        131 |   +103 |   +367.9% | low prior base     |
| Thu | 2026-04-09 |       79 | 2026-04-23   |         69 |    −10 |    −12.7% |                    |
| Fri | 2026-04-03 |       55 | 2026-04-17   |        273 |   +218 |   +396.4% | **bot day (current)** |
| Fri | 2026-04-10 |       49 | 2026-04-24   |         74 |    +25 |    +51.0% |                    |
| Sat | 2026-04-04 |       82 | 2026-04-18   |        119 |    +37 |    +45.1% |                    |
| Sat | 2026-04-11 |      485 | 2026-04-25   |         72 |   −413 |    −85.2% | **bot day (prior)**|
| Sun | 2026-04-05 |       44 | 2026-04-19   |        147 |   +103 |   +234.1% | low prior base     |
| Sun | 2026-04-12 |      153 | 2026-04-26   |         68 |    −85 |    −55.6% |                    |

**Read this table carefully:** of the 14 matched-DoW pairs, 4 are dominated by bot-suspect days. After removing those 4 pairs, 10 normal pairs remain. Within those 10:
- 4 pairs net positive in current window: Thu Apr 16, Fri Apr 24, Sat Apr 18, Sun Apr 19
- 5 pairs net negative: Tue Apr 28, Wed Apr 22, Wed Apr 29, Thu Apr 23, Sun Apr 26
- 1 pair tied: Tue Apr 21 (102 vs 102)
- Aggregate over those 10 clean pairs: prior 897 PV → current 979 PV, **+82 PV (+9.1%)**

That +9.1% on the bot-cleaned matched-DoW subset is consistent with the +6.3% from §1's outlier-excluded comparison — both methods independently arrive at "essentially flat to slightly up." Neither figure is statistically significant at this volume, but they at least agree.

The single biggest "real" mover is Sun Apr 19 at +234% over Sun Apr 5 (147 vs 44), but Apr 5 itself was anomalously low (only 44 PV). That kind of base effect is very common at this volume.

---

## 3. Outlier days

The task brief flagged Apr 11, 13, 17, 20 as bot-suspect. I confirm these are statistical outliers using a robust threshold (2.5× the median of the other 24 days = 201 PV):

| Date          | Day  | PV   | Multiple of 24-day median (80.5) |
| ------------- | ---- | ---: | -------------------------------: |
| 2026-04-11    | Sat  |  485 |                            6.0× |
| 2026-04-13    | Mon  |  418 |                            5.2× |
| 2026-04-17    | Fri  |  273 |                            3.4× |
| 2026-04-20    | Mon  |  250 |                            3.1× |

No other days in the 28-day window exceed the 2.5× threshold. The next-highest non-flagged days are Apr 12 (153) and Apr 19 (147), both within 2× median and not anomalous.

The 4 outlier days collectively account for **1,426 PV** — that's 40% of the entire 28-day total of 3,547 PV. Concentrating 40% of all traffic into 4/28 days (14% of days) is a strong signal that these days are dominated by automated traffic; agent 5 (integrity/confounders) should investigate sources/UAs/sessions on these specific dates.

### Headline numbers, summarized two ways

| View                              | Prior total | Current total | Δ      | Δ %    |
| --------------------------------- | ----------: | ------------: | -----: | -----: |
| Raw, all 28 days                  |       1,931 |         1,616 |   −315 | −16.3% |
| Excluding 4 outlier days          |       1,028 |         1,093 |    +65 |  +6.3% |

**Both numbers are real and both belong in the same conversation.** Either we report a 16% drop and explain that 2 of those PVs came from prior-window bot days, or we report a 6% lift and explain we removed the 4 anomalous days. The honest answer is "essentially flat after removing bot days, with low statistical power."

---

## 4. Top page movers

Filter applied: drop pages with <5 PV in BOTH windows (noise floor). Results sorted by absolute PV change.

### Top 15 movers by |Δ PV|

| # | Path                                                                                | Prior PV | Current PV | Δ    | Δ %      | Notes |
| -:| ----------------------------------------------------------------------------------- | -------: | ---------: | ---: | -------: | ----- |
|  1 | /never-hungover/dhm-randomized-controlled-trials-2024                              |      190 |        109 |  −81 |   −42.6% | top-2 page |
|  2 | /compare                                                                            |       85 |         32 |  −53 |   −62.4% | hub page |
|  3 | /never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025                |       55 |          2 |  −53 |   −96.4% | likely deindexed/redirected |
|  4 | /never-hungover/dhm1000-review-2025                                                 |       42 |         16 |  −26 |   −61.9% |  |
|  5 | /never-hungover/flyby-vs-cheers-complete-comparison-2025                            |       62 |         87 |  +25 |   +40.3% |  |
|  6 | /never-hungover/dhm-dosage-guide-2025                                               |      206 |        229 |  +23 |   +11.2% | #1 page, growing |
|  7 | /                                                                                   |       40 |         62 |  +22 |   +55.0% | homepage up |
|  8 | /never-hungover/dhm-vs-zbiotics                                                     |       46 |         28 |  −18 |   −39.1% |  |
|  9 | /never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2              |       45 |         28 |  −17 |   −37.8% |  |
| 10 | /never-hungover/hangover-supplements-complete-guide-what-actually-work              |      169 |        184 |  +15 |    +8.9% | #2 page, growing |
| 11 | /never-hungover/peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-…         |       22 |         11 |  −11 |   −50.0% | low base, noisy |
| 12 | /never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-…         |       21 |         10 |  −11 |   −52.4% | low base |
| 13 | /never-hungover/can-you-take-dhm-every-day-long-term-guide-2025                     |       23 |         13 |  −10 |   −43.5% | low base |
| 14 | /never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-…             |        8 |         18 |  +10 |  +125.0% | low base, noisy |
| 15 | /never-hungover/double-wood-vs-toniiq-ease-dhm-comparison-2025                      |       21 |         12 |   −9 |   −42.9% | low base |

### Notable observations on movers

**Top-page changes (high base, signal real-ish):**
- `/dhm-dosage-guide-2025` (#1) +11% to 229 — slight growth on the dominant page
- `/hangover-supplements-complete-guide` (#2) +9% to 184 — slight growth
- `/dhm-randomized-controlled-trials-2024` (#3) **−43% (190→109)** — biggest absolute loss; was previously a top-3 page. Worth deeper investigation by agent 4 (recovery URLs).
- `/` (homepage) +55% (40→62) — meaningful but small base
- `/compare` hub **−62% (85→32)** — large drop on a hub page

**Page that effectively disappeared:**
- `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` dropped 55→2, a 96% drop. No corresponding new path appeared in the top 200 with similar PV magnitude. This page may have been deindexed, soft-404'd, or had a slug change. **No corresponding redirect target absorbed the traffic.** Worth cross-checking GSC.

**Recently-changed paths (#363, #364) — observed in the data:**
- `/dhm-dosage-calculator` (#363 deleted `-new` variant): 25→17, modest decline
- gen-z slug rename (#363): not visible in top 200 PV — slug rename effect is invisible at this volume
- social-media-influencer-party-dhm-2025: 4→5 (no signal at this base)
- `/never-hungover/dhm-safety-complete-guide-2025` (#364 hub pillar): 1→1 — promotion not yet reflected in PV; this is expected since #364 shipped Apr 29.
- `/never-hungover/complete-hangover-science-hub-2025` (#364 hub pillar): 1→0 — same, expected.

**Hub pages summary:**
| Hub                      | Prior | Current | Δ    | Δ %    |
| ------------------------ | ----: | ------: | ---: | -----: |
| `/`                      |    40 |      62 |  +22 |  +55%  |
| `/compare`               |    85 |      32 |  −53 |  −62%  |
| `/reviews`               |    28 |      28 |    0 |   0%   |
| `/research`              |    12 |      18 |   +6 |  +50%  |
| `/guide`                 |     5 |      14 |   +9 | +180%  |
| `/dhm-dosage-calculator` |    25 |      17 |   −8 |  −32%  |
| `/never-hungover` (root) |     7 |       3 |   −4 |  −57%  |

---

## 5. What we can say

- We can confidently say **total raw pageviews dropped 16% (1,931 → 1,616)** between the two windows, but we can also confidently say **40% of the prior-window total came from 2 single-day spikes consistent with bot traffic**, so this raw number understates real-user trend.
- We can confidently say that **after removing the 4 bot-suspect days, current-window pageviews are essentially flat (+6.3%) vs prior**, well within day-to-day noise.
- We can confidently say the **top 2 pages are stable or slightly growing**: dhm-dosage-guide-2025 (+11%) and hangover-supplements-complete-guide (+9%).
- We can confidently say one of the top-3 pages, **dhm-randomized-controlled-trials-2024, dropped 43% (190→109)** — this is the largest real-base mover and warrants follow-up.
- We can confidently say `/compare` lost 62% of pageviews (85→32) and `/never-hungover/flyby-vs-good-morning-pills-…` lost 96% (55→2), with no obvious redirect target absorbing them.
- We **cannot** conclude any of the recent April 28–29 changes (PRs #340–#343, #363, #364) caused or prevented these movements. Window timing means the changes overlap with at most 1–2 days of the current window.
- We **cannot** conclude any single page's % change is statistically significant — minimum-base pages (n<25) are dominated by Poisson-style variation at this volume.

---

## 6. What we can't say (limits)

The data does not support causal claims and barely supports trend claims. With ~100 PV/day median, a single user spending 30 minutes on the site reading 5 pages is 5% of a day's data. The 4 outlier days collectively contribute 40% of the 28-day total, making any aggregate including them dominated by 4 unverified-as-human sessions; conversely, removing those 4 days throws away 14% of the calendar window. Page-level deltas at base <25 PV are noise-floor and should not be interpreted as movements. Most of the recent code changes (PRs #340–343 on Apr 28; #363–366 on Apr 29) are either inside or right at the edge of the current 14-day window, so attribution to those changes is impossible from this data alone — at most 1–2 days of post-change traffic exists. A second pass after Apr 30 + 14 days (i.e., 2026-05-13) will give a cleaner view of the recent merges.

---

## Appendix: raw daily series (28 days)

| Date       | DoW | PV  | Window  | Outlier? |
| ---------- | :-: | --: | ------- | :------: |
| 2026-04-02 | Thu |  28 | Prior   |          |
| 2026-04-03 | Fri |  55 | Prior   |          |
| 2026-04-04 | Sat |  82 | Prior   |          |
| 2026-04-05 | Sun |  44 | Prior   |          |
| 2026-04-06 | Mon |  76 | Prior   |          |
| 2026-04-07 | Tue | 102 | Prior   |          |
| 2026-04-08 | Wed |  95 | Prior   |          |
| 2026-04-09 | Thu |  79 | Prior   |          |
| 2026-04-10 | Fri |  49 | Prior   |          |
| 2026-04-11 | Sat | 485 | Prior   | **YES**  |
| 2026-04-12 | Sun | 153 | Prior   |          |
| 2026-04-13 | Mon | 418 | Prior   | **YES**  |
| 2026-04-14 | Tue | 130 | Prior   |          |
| 2026-04-15 | Wed | 135 | Prior   |          |
| 2026-04-16 | Thu | 131 | Current |          |
| 2026-04-17 | Fri | 273 | Current | **YES**  |
| 2026-04-18 | Sat | 119 | Current |          |
| 2026-04-19 | Sun | 147 | Current |          |
| 2026-04-20 | Mon | 250 | Current | **YES**  |
| 2026-04-21 | Tue | 102 | Current |          |
| 2026-04-22 | Wed |  94 | Current |          |
| 2026-04-23 | Thu |  69 | Current |          |
| 2026-04-24 | Fri |  74 | Current |          |
| 2026-04-25 | Sat |  72 | Current |          |
| 2026-04-26 | Sun |  68 | Current |          |
| 2026-04-27 | Mon |  42 | Current |          |
| 2026-04-28 | Tue |  65 | Current |          |
| 2026-04-29 | Wed | 110 | Current |          |
| 2026-04-30 | Thu |  26 | (today) | partial  |

## Appendix: top 30 pages, full deltas (≥5 PV in either window)

| Path                                                                                | Prior | Current | Δ    | Δ %      |
| ----------------------------------------------------------------------------------- | ----: | ------: | ---: | -------: |
| /never-hungover/dhm-dosage-guide-2025                                               |   206 |     229 |  +23 |   +11.2% |
| /never-hungover/dhm-randomized-controlled-trials-2024                              |   190 |     109 |  −81 |   −42.6% |
| /never-hungover/hangover-supplements-complete-guide-what-actually-work              |   169 |     184 |  +15 |    +8.9% |
| /compare                                                                            |    85 |      32 |  −53 |   −62.4% |
| /never-hungover/flyby-vs-cheers-complete-comparison-2025                            |    62 |      87 |  +25 |   +40.3% |
| /never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025                |    55 |       2 |  −53 |   −96.4% |
| /never-hungover/when-to-take-dhm-timing-guide-2025                                  |    55 |      61 |   +6 |   +10.9% |
| /never-hungover/complete-guide-asian-flush-comprehensive                            |    47 |      41 |   −6 |   −12.8% |
| /never-hungover/dhm-vs-zbiotics                                                     |    46 |      28 |  −18 |   −39.1% |
| /never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2              |    45 |      28 |  −17 |   −37.8% |
| /never-hungover/dhm1000-review-2025                                                 |    42 |      16 |  −26 |   −61.9% |
| /                                                                                   |    40 |      62 |  +22 |   +55.0% |
| /reviews                                                                            |    28 |      28 |    0 |    +0.0% |
| /dhm-dosage-calculator                                                              |    25 |      17 |   −8 |   −32.0% |
| /never-hungover/can-you-take-dhm-every-day-long-term-guide-2025                     |    23 |      13 |  −10 |   −43.5% |
| /never-hungover/flyby-recovery-review-2025                                          |    23 |      19 |   −4 |   −17.4% |
| /never-hungover/peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-…         |    22 |      11 |  −11 |   −50.0% |
| /never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-…         |    21 |      10 |  −11 |   −52.4% |
| /never-hungover/double-wood-vs-toniiq-ease-dhm-comparison-2025                      |    21 |      12 |   −9 |   −42.9% |
| /never-hungover/dhm-depot-review-2025                                               |    20 |      20 |    0 |    +0.0% |
| /never-hungover/fuller-health-after-party-review-2025                               |    20 |      12 |   −8 |   −40.0% |
| /never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025                   |    17 |       9 |   −8 |   −47.1% |
| /never-hungover/good-morning-hangover-pills-review-2025                             |    17 |      10 |   −7 |   −41.2% |
| /never-hungover/dhm-vs-prickly-pear-hangovers                                       |    17 |      17 |    0 |    +0.0% |
| /never-hungover/toniiq-ease-dhm-review-analysis                                     |    16 |       7 |   −9 |   −56.2% |
| /never-hungover/no-days-wasted-vs-toniiq-ease-dhm-comparison-2025                   |    15 |       6 |   −9 |   −60.0% |
| /never-hungover/italian-drinking-culture-guide                                      |    18 |      14 |   −4 |   −22.2% |
| /never-hungover/how-long-does-hangover-last                                         |    13 |       4 |   −9 |   −69.2% |
| /research                                                                           |    12 |      18 |   +6 |   +50.0% |
| /never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-…             |     8 |      18 |  +10 |  +125.0% |

---

## Methodology notes

- All queries: `event = '$pageview'`, `properties.$pathname` for path, single host `www.dhmguide.com`.
- HogQL `toDayOfWeek()` returns 1=Mon..7=Sun (ISO).
- "Outlier" defined as PV exceeding 2.5× median of the other 24 (non-flagged-non-partial) days. The task-brief-supplied flags (Apr 11/13/17/20) all pass this threshold; no other days do.
- Top-page table covers 99.8% of total PV in each window (200 paths captured 1,946 of 1,951 prior PV; 1,614 of 1,616 current PV).
- Median is reported as the primary central-tendency estimate because the volume of bot-suspect days makes the mean unreliable.
- No statistical significance testing performed. With ~100 PV/day and 14 day windows, the sample is too small for reliable proportion tests on individual page deltas.
