# Per-Page Winners & Losers — Agent A9

**Window**: current 14d = 2026-04-29 → 2026-05-12 (partial, ~13.5d), prior 14d = 2026-04-15 → 2026-04-28.
**Bot filter**: excluded Apr 17, 19, 20 from prior-window counts (high-confidence scraper days per `docs/posthog-2026-04-30/05-integrity.md`). Apr 11 and 13 are pre-window.
**Volume bar**: PV ≥30 in EITHER window. Only **6 pages** cleared the bar. Below it I retain pages with PV ≥10 as an extended table for context; deltas on those are directional only.

---

## 1. TL;DR

- **Only 6 pages clear PV≥30 in either window.** Sample sizes are tiny everywhere else — call all sub-30 deltas directional.
- **Three winners** with real volume: `/reviews` (+167% PV, 36 affiliate clicks vs 17), `/never-hungover/dhm-randomized-controlled-trials` (+2100% PV — the renamed slug from PR #316 absorbing traffic from its dead predecessor), and `/never-hungover/dhm-dosage-guide-2025` (flat PV, scroll-75 rate edged up).
- **Three losers**: `/never-hungover/hangover-supplements-complete-guide-...` (−39% PV, scroll-75 rate collapsed 11% → 4%), `/` homepage (−15% PV but scroll-75 rate rose), and `/never-hungover/dhm-randomized-controlled-trials-2024` (−100% — old slug now 308-redirected, expected).
- **The 4 Tier-1 HowTo guides (#251/#355): zero meaningful traffic in either window.** Not yet ranked, expected (Google removed HowTo eligibility for health content Sept 2023 — PR description acknowledges).
- **The 2 promoted pillar hubs (#368): zero traffic in either window.** Manual GSC indexing request was the documented next step; no organic discovery yet at 13 days post-deploy.
- `/reviews` is the **only page with statistically meaningful affiliate signal**: clicks 17 → 36 (+112%). Plausibly attributable to PRs #117/#352/#358 (table action column + Best-For row + mobile column hide), or to traffic doubling, or both. Cannot disentangle from volume confound.

---

## 2. Top-30 Per-Page Table (sorted by PV current desc)

Only 22 paths cleared PV≥10 in either window. **Bold** = clears PV≥30 bar.

| Path | Cat | PV cur | PV pri | Δ | Δ% | s75 rate cur | s75 rate pri | Aff cur | Aff pri | Med time cur (s) | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **/never-hungover/dhm-dosage-guide-2025** | NH | **161** | **163** | -2 | -1% | 0.06 | 0.04 | 0 | 0 | 60 | flat; scroll improved |
| **/never-hungover/hangover-supplements-complete-guide-...** | NH | **70** | **115** | -45 | -39% | 0.04 | 0.11 | 0 | 0 | 60 | rewritten #330; scroll-75 collapsed |
| **/never-hungover/dhm-randomized-controlled-trials** | NH | **44** | 2 | +42 | n/a | 0.07 | 0.00 | 0 | 0 | 120 | new slug after #316 rename |
| **/** | HP | **33** | **39** | -6 | -15% | 0.09 | 0.06 | 1 | 0 | 30 | homepage — scroll up, PV down |
| **/reviews** | RV | **32** | 12 | +20 | +167% | 0.48 | 1.00 | **36** | 17 | 120 | affiliate +112%, PV doubled |
| /never-hungover/when-to-take-dhm-timing-guide-2025 | NH | 29 | 26 | +3 | +12% | 0.15 | 0.08 | 0 | 0 | 90 | scroll up |
| /guide | GD | 17 | 2 | +15 | +750% | 0.24 | 4.00 | 0 | 0 | 30 | tiny prior n, signal noisy |
| /never-hungover/dhm-vs-zbiotics | NH | 14 | 20 | -6 | -30% | 0.00 | 0.10 | 0 | 0 | 90 | scroll down |
| /never-hungover/dhm1000-review-2025 | NH | 13 | 10 | +3 | +30% | 0.08 | 0.00 | 0 | 0 | 30 | small gain |
| /research | RS | 13 | 8 | +5 | +62% | 0.15 | 0.12 | 0 | 0 | 30 | slight lift |
| /dhm-dosage-calculator | OT | 11 | 13 | -2 | -15% | 0.10 | 0.00 | 0 | 0 | 60 | flat |
| /never-hungover/dhm-vs-prickly-pear-hangovers | NH | 11 | 12 | -1 | -8% | 0.00 | 0.00 | 0 | 0 | – | flat |
| /never-hungover/can-you-take-dhm-every-day-...-2025 | NH | 11 | 9 | +2 | +22% | 0.10 | 0.00 | 0 | 0 | 120 | slight gain |
| /never-hungover/complete-guide-asian-flush-comprehensive | NH | 7 | **25** | -18 | -72% | 0.00 | 0.00 | 0 | 0 | – | dropped |
| /never-hungover/nac-vs-dhm-...-2025 | NH | 7 | 21 | -14 | -67% | 0.00 | 0.37 | 0 | 0 | 210 | major drop |
| /never-hungover/no-days-wasted-vs-fuller-health-... | NH | 7 | 10 | -3 | -30% | 0.29 | 0.11 | 0 | 0 | 120 | scroll up |
| /never-hungover/flyby-vs-cheers-complete-comparison-2025 | NH | 6 | 25 | -19 | -76% | 0.17 | 0.00 | 0 | 0 | 60 | major drop |
| /compare | CP | 6 | 17 | -11 | -65% | 0.00 | 0.00 | 0 | 0 | – | dropped |
| /never-hungover/dhm-depot-review-2025 | NH | 5 | 15 | -10 | -67% | 0.00 | 0.07 | 0 | 0 | – | dropped |
| /never-hungover/good-morning-hangover-pills-review-2025 | NH | 2 | 11 | -9 | -82% | 0.00 | 0.00 | 0 | 0 | – | dropped |
| /never-hungover/natural-anxiety-relief-gaba-...-2025 | NH | 1 | 19 | -18 | -95% | 0.00 | 0.06 | 0 | 0 | – | collapsed |
| **/never-hungover/dhm-randomized-controlled-trials-2024** | NH | 0 | **32** | -32 | -100% | 0.00 | 0.10 | 0 | 0 | – | renamed → expected |

**Caveats**:
- `s75 rate` = unique sessions hitting scroll-75 / unique pageview sessions on that page. Values >1.0 (`/guide`, `/reviews` prior) mean scroll sessions don't perfectly match PV sessions in the same window — a small-n artifact at PV ≤12.
- `Med time cur` is the median of per-session max `time_on_page_milestone` seconds. **Prior-window median time is NOT comparable** — the 10% sampling gate was active 11 of 14 prior days (PR #269 removed it Apr 26). Where current/prior medians appear, current is 100%-sampled, prior is mixed-sampled.

---

## 3. Top-5 Winners (engagement composite rank-sum, requiring PV≥10 in current OR prior)

| Rank | Path | PV move | s75 rate move | Affiliate move | Attribution hypothesis |
|---|---|---|---|---|---|
| 1 | `/never-hungover/dhm-randomized-controlled-trials` | 2 → 44 (+42) | 0.00 → 0.07 | 0 → 0 | **PR #316** renamed `…-rcts-2024` to year-agnostic slug; redirect funnels prior traffic. Daily distribution (Apr 29 – May 11) is human-shaped — 2-12 PV/day across 12 days with scroll engagement on 5 of them. Not a bot artifact. |
| 2 | `/` (homepage) | 39 → 33 (-6) | 0.06 → 0.09 | 0 → 1 | Slight PV slip but scroll-75 rate rose ~50% and one affiliate click landed. Plausibly mega-menu PR #326 surfacing pillar nav better — but n is too small to claim. |
| 3 | `/never-hungover/dhm-dosage-guide-2025` | 163 → 161 (-2) | 0.04 → 0.06 | 0 → 0 | Flat PV (the only page with truly meaningful volume) and scroll-75 rate edged up. PR #359 footer (Continue Your Research) may be lifting late-page engagement, but absolute deltas are tiny. |
| 4 | `/never-hungover/dhm1000-review-2025` | 10 → 13 (+3) | 0.00 → 0.08 | 0 → 0 | Sub-30 PV but scroll-75 went 0% → 8% which is the kind of needle-move the #246 footer is designed to create. Directional only. |
| 5 | `/research` | 8 → 13 (+5) | 0.12 → 0.15 | 0 → 0 | Hub page gaining PV and scroll. Likely mega-menu nav (PR #326) surfacing it; cannot prove without click-source split. |

**Honourable mention — `/reviews` is the loudest signal but ambiguous**: PV 12 → 32 (+167%), affiliate clicks 17 → 36 (+112%). Scroll-75 rate **fell** 1.00 → 0.48, but the prior 1.00 is a 12-session artifact (every prior session scrolled-75 in the matched window). The honest reading: PV doubled, affiliate clicks doubled, **affiliate-per-session rate moved 1.42 → 1.13** — i.e. the per-visit conversion *fell* but total volume rose. Plausibly attribution-tagging artifact (PR #275 tagged previously-untracked Amazon links Apr 26) plus genuine #117/#352/#358 UI improvements. Cannot disentangle. Reviews is a **traffic** win, not a clear *engagement* win.

---

## 4. Top-5 Losers

| Rank | Path | PV move | s75 rate move | Diagnosis |
|---|---|---|---|---|
| 1 | `/never-hungover/dhm-randomized-controlled-trials-2024` | 32 → 0 | 0.10 → 0.00 | **Expected**: renamed by PR #316; traffic moved to the new slug (the #1 winner). Net of pair: 32+2=34 → 0+44=44, **net +29% PV combined**. |
| 2 | `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` | 115 → 70 (-39%) | 0.11 → 0.04 | **Real concern.** This is one of the rewritten posts (PR #330, head-term ranking play). Both PV AND scroll-75 rate fell. Either: (a) ranking lost during rewrite, (b) rewrite changed page enough to break our scroll trigger position, (c) lost the Apr 11 bot tail (this page was in the bot-spike list). Likely (a)+(c). Worth a Search Console check. |
| 3 | `/never-hungover/complete-guide-asian-flush-comprehensive` | 25 → 7 (-72%) | 0.00 → 0.00 | Both windows had effectively zero scroll-75 — long page that no one scrolls. PV drop reads as ranking volatility on a niche query. Sub-30 in both windows: directional only. |
| 4 | `/never-hungover/flyby-vs-cheers-complete-comparison-2025` | 25 → 6 (-76%) | 0.00 → 0.17 | Sharp PV drop. Listed in the `docs/posthog-investigation-2026-04-30/02-flyby-vs-good-morning-rca.md` priors — these review pages were already flagged as zero-CTR despite traffic. PV decline continues. Scroll-75 *rate* improved on the remaining 6 sessions, but n is far too small. |
| 5 | `/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025` | 19 → 1 (-95%) | 0.06 → 0.00 | Near-total collapse. Slug rename (PR #367 changed similar slugs) is the leading suspect — check 301 chains for this URL. Could be ranking loss; could be a redirect bug. **Action: verify the redirect.** |

---

## 5. Per-Category Summary

| Category | n pages (≥10 PV either window) | PV prior | PV cur | Δ% | s75 rate prior | s75 rate cur | Affiliate prior | Affiliate cur |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| never-hungover (blog) | 16 | 515 | 388 | -25% | 0.07 | 0.07 | 0 | 0 |
| homepage `/` | 1 | 39 | 33 | -15% | 0.06 | 0.09 | 0 | 1 |
| reviews `/reviews` | 1 | 12 | 32 | +167% | 1.00¹ | 0.48 | 17 | 36 |
| compare `/compare` | 1 | 17 | 6 | -65% | 0.00 | 0.00 | 0 | 1 |
| research `/research` | 1 | 8 | 13 | +62% | 0.12 | 0.15 | 0 | 0 |
| guide `/guide` | 1 | 2 | 17 | +750% | 4.00¹ | 0.24 | 0 | 0 |
| other (`/dhm-dosage-calculator`) | 1 | 13 | 11 | -15% | 0.00 | 0.10 | 0 | 0 |

¹ s75 rate >1.0 indicates more scroll-75 sessions than pageview sessions in the same window at low n — a small-sample artifact. Don't read prior `/reviews` and `/guide` rates as literal.

**Reading**: never-hungover blog corpus shows aggregate −25% PV, flat scroll-rate. The drop is concentrated in 6-8 specific posts (see losers); the dosage guide (161 PV) is flat. Hub/category pages (`/reviews`, `/research`, `/guide`) all rose in PV. `/compare` lost two-thirds of its traffic — this is the same finding as the Apr 30 RCA `01-compare-rca.md`, continuing.

---

## 6. Targeted Attribution

### The 4 Tier-1 HowTo guides (PRs #251/#355)

| Path | PV prior | PV cur | s75 prior | s75 cur |
|---|---:|---:|---:|---:|
| `/never-hungover/how-to-cure-a-hangover-complete-science-guide` | 0 | 0 | 0 | 0 |
| `/never-hungover/how-to-get-rid-of-hangover-fast` | 1 | 0 | 0 | 0 |
| `/never-hungover/hangover-headache-fast-relief-methods-2025` | 2 | 0 | 0 | 0 |
| `/never-hungover/hangover-nausea-complete-guide-fast-stomach-relief-2025` | 2 | 0 | 0 | 0 |

**Verdict: no effect detectable.** Zero or near-zero PV in both windows. PR #355 description already calibrated expectations ("Google removed HowTo rich-result eligibility for medical/health content in Sept 2023") — real ROI was framed as AI Overviews / LLM grounding, not direct PV. Cannot evaluate that vector from PostHog. Re-check at 60-90 days post-deploy with Search Console impression data, not PostHog PV.

### The 2 newly-promoted pillar pages (PR #368)

| Path | PV prior | PV cur |
|---|---:|---:|
| `/never-hungover/ultimate-dhm-safety-guide-hub-2025` | 0 | 0 |
| `/never-hungover/complete-hangover-science-hub-2025` | 0 | 0 |

**Verdict: no organic discovery yet.** PR description noted manual GSC URL Inspection → Request Indexing as the post-deploy step. Until indexing completes and ranks, traffic will stay at zero. Re-check at 30-60 days.

### Continue-Your-Research footer (PR #246/#359, 197 posts mass-edit)

Hypothesis: scroll-90 reach should lift on never-hungover/* paths since the footer extends reading. Aggregate scroll-90 sessions across all never-hungover paths: **24 prior → 17 current** (-29%). PV on those same paths: -25%. **Scroll-90 rate is flat to slightly down**, not up. Hypothesis is not confirmed at this volume; effect (if any) is below noise. Sample is also distorted by the renamed RCT slug. Re-check after 30+ days with stable URLs.

---

## 7. Confidence: **2/5**

- Only **6 pages clear the PV≥30 bar**. Half the "wins" and "losses" are sub-30 in at least one window.
- **Prior window has 3 bot days removed** (Apr 17/19/20). Several of the "loser" pages (`hangover-supplements-complete-guide`, `flyby-vs-cheers`) were on the bot-spike target list — some of their "prior" volume was real human + real bot tail in remaining Apr 18 and earlier; can't fully disentangle.
- **Time-on-page deltas are not interpretable** — prior window has 10% sampling gate active for 11 of 14 days (PR #269).
- **Affiliate-click rate post-Apr-26 carries tagging-artifact risk** (PR #275 retroactively tagged inline blog Amazon links).
- The single strong signal — `/reviews` PV doubling + affiliate clicks doubling — has 4 simultaneous candidate causes (organic traffic, #117 table action column, #275 tagging, #352 mobile, #358 Best-For row). Can't attribute.
- The strongest defensible claim: **`/never-hungover/dhm-dosage-guide-2025` (n=161) is flat PV with a small scroll-75 rate improvement (0.04→0.06).** Everything else is directional.

---

## 8. Action Items

1. **Verify the redirect** for `/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025` — 19 → 1 PV is collapse-shaped. Curl the URL; check 301 chain. If redirect-bug, fix; if real, investigate ranking loss (PR #367 was nearby).
2. **GSC check on `hangover-supplements-complete-guide-what-actually-works-2025`** (−39% PV, −64% scroll-75 rate). This is PR #330 (head-term rewrite). Did position drop? Was page structurally restructured enough that the prior scroll trigger no longer fires at the same content depth?
3. **Resubmit the 2 pillar hubs to GSC URL Inspection** (PR #368 documented this; PostHog confirms zero traffic still — confirm indexing actually happened).
4. **Defer HowTo guide evaluation** to GSC impressions at 60-90d. PostHog can't see this signal.
5. **Don't claim `/reviews` UI changes (#117/#352/#358) caused the affiliate lift** in the synthesis — disentangle from PR #275 attribution artifact and from doubled traffic first. Need click-source-split data to attribute properly.
6. **Track `/compare` decline as a continuing concern** (see `docs/posthog-investigation-2026-04-30/01-compare-rca.md`). 17 → 6 PV after that RCA suggests recommendations didn't ship or didn't take.
7. **Do not run another per-page WoW analysis until at least 30 days have passed** post-Apr-26 corpus-wide changes. Current window is too noise-dominated.
