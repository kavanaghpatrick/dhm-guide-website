# 04-recovery — Recovery URL deep-dive (PostHog, 14d window ending 2026-04-30)

**Agent 4 / 5.** Owner: recovery candidates + watchdog OG pillars. Stay-in-lane: top-line, channels, engagement, and integrity owned by other agents.

> **Frame.** The strategy that should grow these pages was just shipped on 2026-04-29. SEO impact lags weeks-to-months. The numbers below are the **BEFORE** baseline. A comparable AFTER measurement will not be meaningful until **late May 2026 at the earliest**, and a confident verdict on the strategy needs **60–90 days** (late June to late July). This document records the starting line, not a recovery report.

> **Today (2026-04-30) is partial.** Each daily count for 2026-04-30 includes only the hours up to query time. Treat it as a partial bar.

> **Volume reality check.** Across the **11 recovery URLs**, total pageviews in the last 14d = **34**. Median per-URL PV ≈ 0–2. **Statistical power is near zero for per-URL recovery deltas in this window.** Where PV ≤ 3 in either window, no delta is reported.

---

## 1. Recovery candidates baseline (the 11 URLs)

**Last 14d (2026-04-17 → 2026-04-30 partial): 34 PV total across all 11 URLs.**
**Prior 14d (2026-04-03 → 2026-04-16): 53 PV total.**

> **Read this as a baseline, not a regression.** A 34→53 swing on a base of 34 is well within day-to-day noise (one good day in the prior window — 2026-04-13 alone contributed 19 PV — accounts for almost the entire gap). The combined 11-URL set is too low-volume for week-over-week conclusions. Both numbers are simply "very small."

### Daily PV across the 11-URL set, last 28 days

```
day          pv
2026-04-30    2  (partial)
2026-04-29    2
2026-04-28    2
2026-04-27    1
2026-04-26    8
2026-04-25    1
2026-04-24    0   (no row returned)
2026-04-23    1
2026-04-22    1
2026-04-21    1
2026-04-20    6
2026-04-19    3
2026-04-18    5
2026-04-17    1
─── last 14d boundary ───
2026-04-16    1
2026-04-15    4
2026-04-14    1
2026-04-13   19   ← single-day burst
2026-04-12    2
2026-04-11   14   ← single-day burst
2026-04-10    1
2026-04-09    0   (no row returned)
2026-04-08    1
2026-04-07    2
2026-04-06    2
2026-04-05    1
2026-04-04    3
2026-04-03    2
```

The **prior 14d total is dominated by two burst days** (04-11 and 04-13 = 33 of 53 PV, 62%). Stripping those, the prior window's "background" rate is ~20 PV/14d, which is below the last 14d's 34. Either way: this is too noisy to call.

---

## 2. Per-URL counts (last 14d vs prior 14d)

| URL                                                                                                | last 14d | prior 14d | delta callable? |
| -------------------------------------------------------------------------------------------------- | -------: | --------: | :-------------- |
| `/dhm-dosage-calculator`                                                                           |       16 |        26 | yes (small)     |
| `/never-hungover/dhm-japanese-raisin-tree-complete-guide`                                          |        6 |         7 | borderline      |
| `/never-hungover/dhm-randomized-controlled-trials`                                                 |        6 |         0 | no — base too low |
| `/never-hungover/how-long-does-hangover-last`                                                      |        4 |        13 | borderline      |
| `/never-hungover/dhm-adults-over-50-age-related-safety-2025`                                       |        2 |         2 | no — base too low |
| `/never-hungover/complete-hangover-science-hub-2025`                                               |        0 |         1 | no — base too low |
| `/never-hungover/ultimate-dhm-safety-guide-hub-2025`                                               |        0 |         0 | no — base zero  |
| `/never-hungover/gen-z-mental-health-revolution-58-percent-drinking-less-2025`                     |        0 |         0 | no — base zero  |
| `/never-hungover/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age`    |        0 |         0 | no — base zero  |
| `/never-hungover/dhm-medication-interactions-safety-guide-2025`                                    |        0 |         3 | no — base too low |
| `/never-hungover/how-to-cure-a-hangover-complete-science-guide`                                    |        0 |         1 | no — base too low |
| **TOTAL (11 URLs)**                                                                                |   **34** |    **53** |                 |

**Observations (descriptive, not directional):**

- **The two recovery hubs each have 0 PV in the last 14d.** This is consistent with hubs being a brand-new structural play whose value depends on Google crawling/indexing them and search behavior catching up over weeks.
- **`/dhm-dosage-calculator` is the only URL doing meaningful traffic** in either window (16 / 26). This is a "bug-fix" candidate, not new content. Its 16 PV is enough to be a real measurement but a 16→26 swing on this base is not stable enough to call a regression in a 14d window.
- **5 of 11 URLs sat at 0 PV in the last 14d.** Two also had 0 in the prior 14d (the two genuinely-new strategy URLs: `gen-z-mental-health-revolution`, `social-medias-unseen-influence`). The two hubs both went 0→0 or 0→1.
- **`dhm-randomized-controlled-trials` went 0 → 6.** Interesting but too low-base to call.

---

## 3. Watchdog status — 8 OG pillars, last 14d vs prior 14d

> **The 8 pillars are the only set in the recovery scope with enough volume to detect movement.** Watchdog rule: flag a pillar only if (a) prior_14d ≥ 30 PV AND (b) it dropped > 25%.

**Pillar set (excludes the `dhm-safety` and `hangover-science` cluster pillars — those are themselves hubs in the recovery candidate list):**

| Pillar                                                                                | last 14d | prior 14d | delta | delta % | watchdog flag       |
| ------------------------------------------------------------------------------------- | -------: | --------: | ----: | ------: | :------------------ |
| `/never-hungover/dhm-dosage-guide-2025`                                               |  **223** |   **210** |   +13 |   +6.2% | none — stable       |
| `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025`        |  **176** |   **178** |    -2 |   -1.1% | none — stable       |
| `/never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025`                   |        8 |        18 |   -10 |  -55.6% | low-base — ignore   |
| `/never-hungover/functional-medicine-hangover-prevention-2025`                        |        4 |         2 |    +2 | +100.0% | low-base — ignore   |
| `/never-hungover/alcohol-pharmacokinetics-advanced-absorption-science-2025`           |        3 |         4 |    -1 |  -25.0% | low-base — ignore   |
| `/never-hungover/advanced-liver-detox-science-vs-marketing-myths-2025`                |        1 |         3 |    -2 |  -66.7% | low-base — ignore   |
| `/never-hungover/alcohol-aging-longevity-2025`                                        |        1 |         4 |    -3 |  -75.0% | low-base — ignore   |
| `/never-hungover/hangxiety-complete-guide-2026-supplements-research`                  |        0 |         0 |    +0 |     n/a | low-base — ignore   |
| **TOTAL (8 pillars)**                                                                 |  **416** |   **434** |   -18 |   -4.1% | none — within noise |

**Verdict: no regression detected.**

Only two pillars cleared the ≥30 PV bar: `dhm-dosage-guide-2025` (+6.2%) and `hangover-supplements-complete-guide-what-actually-works-2025` (-1.1%). Both are inside ±10%. The combined pillar total moved -4.1% (-18 PV) — well within the daily noise floor (a single elevated day in the prior window — 2026-04-11 had 137 pillar PV, of which 134 came from these top 2 pillars — accounts for the gap by itself).

The other six pillars are **chronically low-volume in PostHog data** (≤18 PV per 14d window). They are not deprecated; they're just out of PostHog scope on this timeframe. Track them via GSC (impressions/clicks) if you need a directional read.

> **Sanity-check note.** The Q3 daily-aggregate query and the Q4 per-URL query disagreed on totals by ~16 PV (Q3: 403 vs 432; Q4: 416 vs 434). This is because `now() - INTERVAL 14 DAY` resolves to a *timestamp* at query time, not a calendar boundary, so the two queries cross the boundary at slightly different microseconds. Difference is ≤30 PV out of ~835 — does not change any conclusion. Q4's per-URL totals are the canonical numbers in the table above.

---

## 4. Forward-looking — what to watch and when

**The strategy shipped on 2026-04-29.** Google's typical recrawl-and-reweight cycle is multi-week. Realistic checkpoints:

| Checkpoint   | Approx. date     | What to expect                                                                                                       | What constitutes evidence                                                                                                                                              |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **+ 30 d**  | ~2026-05-29      | Google has recrawled most affected pages. Indexed status of new spokes/hubs should be verifiable.                    | **GSC**: hubs and 6 new spokes show non-zero impressions. **PostHog**: any of the 11 recovery URLs cross 5 PV/14d. (Anything less is statistical noise.)               |
| **+ 60 d**  | ~2026-06-28      | Early ranking signals stabilize. Cluster topical-authority effect (if real) starts showing in spoke positions.       | **PostHog**: combined 11-URL PV ≥ **75 / 14d** (≈ 2.2× the 34 baseline). **GSC**: average position improvement of 5+ on tracked queries for hubs/spokes.                |
| **+ 90 d**  | ~2026-07-28      | Stable verdict territory. If the strategy is going to work, it should be visible.                                    | **PostHog**: combined 11-URL PV ≥ **120 / 14d** (≈ 3.5× baseline) AND combined 8-pillar PV holds within ±15% of today's 416. **GSC**: clicks on new spokes ≥ 50/month. |

**Magnitude needed to call success at +60d:** because the baseline is so low (34 PV / 14d), a real "the strategy is working" signal needs to be **≥ 2× the baseline**, sustained across two consecutive 14d windows. A 50→60 PV move would not be evidence; a 34→80 move that holds at 70+ next window would be.

**Watchdog (the *don't lose ground* test):** the 8 OG pillars currently produce **416 PV / 14d**, with 96% (399) concentrated in the two heavyweights (`dhm-dosage-guide-2025`, `hangover-supplements-complete-guide`). The recovery strategy must **not erode this**. Trigger an investigation if either heavyweight drops > 25% across two consecutive 14d windows AND prior_14d ≥ 30. Anything else is noise.

---

## 5. What we can say vs what we can't say

### What we can say

- The 11 recovery URLs collectively produce **34 PV / 14d** as of today. This is the BEFORE baseline.
- 5 of 11 sit at 0 PV in the last 14d. Both hubs are at 0 PV in the last 14d.
- The only meaningful-volume recovery URL is `/dhm-dosage-calculator` (16 PV / 14d).
- Watchdog: **no pillar regression detected.** The two high-volume pillars are stable (+6.2% and -1.1%).
- Combined 8-pillar volume is essentially flat (-4.1%, -18 PV), explained by a single high-traffic day in the prior window (2026-04-11) that did not repeat.

### What we cannot say

- **We cannot say "recovery is working" or "not working" yet.** The strategy shipped *yesterday*. SEO lag is weeks-to-months.
- **We cannot compute meaningful per-URL deltas** for any URL with PV ≤ 3 in either window. That is 9 of 11 recovery URLs.
- **We cannot read the 34 → 53 swing as a regression.** It is within day-to-day noise; the prior window's 53 is dominated by two burst days that don't repeat in the current window.
- **We cannot conclude that the 6 low-volume pillars are dying.** Their PostHog signal is too small to interpret. GSC impressions/clicks would be the right tool for those.
- **We cannot conclude anything about the two strategy URLs at 0/0** (`gen-z-mental-health-revolution`, `social-medias-unseen-influence`). They were 0 before the change and 0 after; whether they break that floor is a +30d / +60d question, not an "is it working today" question.

---

## Method notes (for replicability)

- **PostHog project**: 275753. Endpoint: `https://us.posthog.com/api/projects/275753/query`. HogQL.
- **Recovery dashboard reference**: https://us.posthog.com/project/275753/dashboard/1525845
- **Window boundaries**: `now() - INTERVAL 14 DAY` (timestamp, not calendar). Queries run 2026-04-30 ~12:00 UTC. Last 14d = approximately 2026-04-17 → 2026-04-30. Prior 14d = approximately 2026-04-03 → 2026-04-16.
- **URL sets**: read from `scripts/cluster-config.json`. Recovery URLs as enumerated by the user prompt; pillar set = the 8 cluster pillars excluding `dhm-safety` (whose pillar = `ultimate-dhm-safety-guide-hub-2025`) and `hangover-science` (whose pillar = `complete-hangover-science-hub-2025`) because those two pillars are themselves recovery candidates (hubs).
- **Query script**: `/tmp/recovery_queries.py` (not committed). Raw output: `/tmp/recovery_results.json`.
- **All paths use the `/never-hungover/` prefix** as live in production routing, except `/dhm-dosage-calculator` which is at site root.
