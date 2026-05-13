# B6 — Sitewide Google Referrer "Collapse" Diagnosis

**Agent**: B6 of 10 deep-dive | **Date**: 2026-05-12 | **Task #16**
**Reported by A7**: Google referrer PV 882 → 282 (−68%); total PV 1641 → 671 (−59%) across 14d windows.
**Confidence**: **4/5** (high — bot variance fully accounts for the headline; the residual real-user dip is genuine but smaller).

---

## 1. TL;DR

**The −68% headline is ~93% bot variance and ~7% real signal. A7's framing is misleading.**

After stripping the known SERP-preview bot (`Chrome/145.0.0.0` + `800×600` screen + `1920` viewport — documented in `CLAUDE.md` and `posthog-query.sh:lcp-real`):

| Metric | Prior 14d (Apr 14–27) | Last 14d (Apr 28–May 11) | Δ | Δ % |
|---|---:|---:|---:|---:|
| Google referrer **raw** (A7's number) | 924 | 304 | −620 | **−67.1%** |
| Google referrer **bot** | 611 | 42 | −569 | −93.1% |
| Google referrer **real users** | **313** | **262** | **−51** | **−16.3%** |
| Total PV raw | 1706 | 736 | −970 | −56.9% |
| Total PV **real users** | 1095 | 694 | −401 | **−36.6%** |

**Two facts coexist**:
1. The bot stopped hammering us. That's not a problem — it inflates `google.com` referrer counts and is unrelated to actual indexing or rankings.
2. There IS a real-user drop: total real-user PV down 37%, Google-referrer real-user PV down 16%. The real-user dip aligns with **April 27** (single low day, 41 PV) and **April 29–May 11** sustained low ~45 PV/day (vs ~78/day prior).

**Most likely cause of the real dip**: PR #246/#359 mass-edit deploy on **2026-04-29** triggered Google recrawl wave per CLAUDE.md Pattern: "mass-edits across many post JSONs trigger Google recrawl waves which re-evaluate posts against the current quality bar." This is exactly the pattern the moratorium (PR #370, #366) was created to prevent. **The moratorium was put in place AFTER the deploy that caused this dip.**

---

## 2. Daily Google-referrer PV (bot-stripped) — last 60 days

```
day         google_real  google_bot  total_google
2026-03-13       20           10         30
2026-03-14       25            9         34
2026-03-15       21           14         35
2026-03-22       14            2         16
2026-03-23       24            0         24    ← bot quiet
2026-03-28       24           23         47
2026-04-02       18            1         19
2026-04-07       21            1         22
2026-04-10       24            6         30
2026-04-11       20          419        439    ← BOT SPIKE START
2026-04-12       19           95        114
2026-04-13       23          330        353
2026-04-14       10           54         64
2026-04-15       21           38         59
2026-04-16       25           43         68
2026-04-17       22          212        234
2026-04-18       24           61         85
2026-04-19       30           33         63
2026-04-20       21          137        158
2026-04-21       16           19         35
2026-04-22       20            2         22    ← BOT GONE
2026-04-23       24            5         29
2026-04-24       28            1         29
2026-04-25       32            2         34
2026-04-26       24            3         27
2026-04-27       16            1         17
2026-04-28       21            1         22
2026-04-29       16            0         16    ← post mass-edit deploy
2026-04-30       19            2         21
2026-05-01       26            3         29
2026-05-02       21            9         30
2026-05-03       15            3         18
2026-05-04       17            1         18
2026-05-05       20            4         24
```

Real-user Google-referrer PV is **flat-to-mildly-down** across the full 60d (mean ~20 PV/day prior, ~21 PV/day last). The dramatic curve is the bot leaving on Apr 21.

---

## 3. Real-user PV by cluster (14d windows)

| Cluster | Prior 14d real | Last 14d real | Δ | Δ % | Notes |
|---|---:|---:|---:|---:|---|
| never-hungover-blog | 954 | 571 | −383 | **−40.1%** | Bulk of the loss; PR #246/#359 deploy day |
| compare | 21 | 6 | −15 | −71.4% | Already-known issue (see prior A1 #301) |
| home `/` | 48 | 34 | −14 | −29.2% | |
| calculator | 11 | 8 | −3 | −27.3% | Noise |
| other | 31 | 14 | −17 | −54.8% | |
| reviews | 20 | 27 | +7 | +35.0% | PR #209 button row + #117 mobile cols **working** |
| research | 7 | 17 | +10 | +142.9% | PR #190/#360 expansion 11→25 trials **working** |
| guide | 3 | 17 | +14 | +466.7% | PR #154/#357 HowTo schema **working** |
| **TOTAL** | **1095** | **694** | **−401** | **−36.6%** | |

The good news is concentrated on routes touched by structured-data PRs that shipped Apr 29. The bad news is concentrated on `/never-hungover/*` posts — exactly where the mass-edit happened.

---

## 4. Top individual paths (real-user) — losers and steady

| Path | Prior | Last | Δ | Likely cause |
|---|---:|---:|---:|---|
| `dhm-dosage-guide-2025` | 192 | 174 | −18 | Money page steady (good) |
| `hangover-supplements-complete-guide-…-2025` | 128 | 74 | −54 | Touched by PR #300/#330 rewrite Apr 26 |
| `dhm-randomized-controlled-trials-2024` | 36 | 0 | −36 | **PR #316 slug rename** — traffic moved to new slug (44 PV last 14d via raw query) |
| `nac-vs-dhm-…-2025` | 22 | 6 | −16 | Touched by PR #151/#348 title trim Apr 29 |
| `/compare` | 21 | 6 | −15 | Pre-existing (B1) |
| `gaba-…` | 7 | 0 | −7 | A9's −95% observation (B1 verified no redirect bug) |
| `french-wine-culture-guide` | 6 | 0 | −6 | Off-strategy (dcni-bucket MERGE candidate) |
| `study-abroad-international-student-dhm-2025` | 6 | 0 | −6 | Off-strategy (dcni DELETE candidate) |
| `alcohol-and-anxiety-breaking-the-cycle-…` | 6 | 0 | −6 | Off-strategy pattern |
| `wine-hangover-guide` | 6 | 0 | −6 | |

Off-strategy posts losing 6→0 PV is the exact DCNI recrawl re-evaluation pattern: Google now sees fresh `dateModified` and re-asks "is this worth indexing?", answers "no," and stops sending search traffic. The dcni-bucket.mjs `OFF_STRATEGY_PATTERNS` list predicted these exact slugs would be problematic.

---

## 5. Candidate-PR shortlist — timing alignment

| PR | Merged | Risk | Confidence | Notes |
|---|---|---|---|---|
| **#246/#359** — Continue-Your-Research footer on **197 posts** | 2026-04-29 14:50Z | **CRITICAL** | **High** | Largest mass-edit in repo history. Moratorium (#366/#370) shipped 4 hours later **explicitly because of this PR's pattern**. dateModified changed on 197 files. |
| **#368** — promote 2 hub pages + **112** `/blog/`→`/never-hungover/` link rewrites | 2026-04-29 18:32Z | High | Medium | Touches 112+ post bodies. Sub-clusters re-evaluated. |
| **#367** — slug renames (gen-z, social-media) + non-www→www catch-all | 2026-04-29 18:09Z | Medium | Low | Only 2 slug renames; non-www catch-all is correct SEO hygiene. Affects renamed slugs only. |
| **#325** — 6-cluster formalization + pillar/spoke link injection | 2026-04-26 | High | Medium | Massive internal-link restructure. Effects spread across all spoke posts. |
| **#324** — 28 hub→orphan inbound link injections | 2026-04-26 | Medium | Medium | Smaller scope (28 posts) but same recrawl-trigger family. |
| **#316** — RCT slug rename + 301 | 2026-04-26 | Low | High | 301 in `vercel.json:42-44` verified working. Traffic moved cleanly (36→44 PV under new slug). NOT the cause. |
| **#338** — 109MB image deletion | 2026-04-26 | Low | High | Public assets. No external embeds because we don't allow hotlinking. Not the cause. |
| **#343** — FOUC prerender div fix | 2026-04-28 | Low | High | Layout fix, no SEO surface. Not the cause. |
| **#341/#342** — z-index Tailwind v4 fix | 2026-04-27 | None | High | Repaired broken stacking context. Net positive for UX. |

**Top hypothesis** (single most-likely proximate cause):
**PR #246/#359 mass-edit of 197 posts on Apr 29 → Google recrawl wave → re-evaluation against current quality bar → DCNI growth → 16% real-user Google-referrer dip + 40% real-user PV dip in `/never-hungover/*`.**

This is the exact pattern documented in `CLAUDE.md` ("Mass-Edit Moratorium Policy") and in the previous DCNI investigation (`docs/posthog-2026-04-30/`). The moratorium guardrail (PR #370, `scripts/check-mass-edit.mjs`) was merged 4 hours AFTER #359 — closing the barn door after the horse left.

---

## 6. GSC queries to run manually

We have no GSC token in `~/.zshrc` or any GSC CLI script in `scripts/`. The DCNI tooling (`scripts/dcni-bucket.mjs`) consumes a CSV export, not a live API. To complete the diagnosis, manually export from Google Search Console:

1. **Performance > Pages** for last 28 days vs prior 28 days (May 1 → today vs Apr 1 → Apr 30):
   - Export both windows as CSV
   - Compare `/never-hungover/*` URL impressions row-by-row
   - Flag URLs with >50% impressions drop AND `dateModified` change within Apr 26–29

2. **Index > Pages > Excluded by reason** — current count of "Discovered – currently not indexed":
   - If DCNI count is up vs the docs/dcni-2026-04-29 baseline by >20, that confirms the recrawl theory
   - The provisioner script `scripts/posthog-create-recovery-dashboard.mjs` documents the watchlist URLs

3. **URL Inspection** on these specific slugs:
   - `/never-hungover/french-wine-culture-guide` (6 → 0 PV)
   - `/never-hungover/study-abroad-international-student-dhm-2025` (6 → 0 PV)
   - `/never-hungover/wine-hangover-guide` (6 → 0 PV)
   - `/never-hungover/alcohol-and-anxiety-breaking-the-cycle-naturally-2025` (6 → 0 PV)
   - Expected: "Discovered – currently not indexed" or "Crawled – currently not indexed"

4. **Coverage > Last crawled date** on 5 random posts from the 197 in PR #246/#359:
   - If last crawled is Apr 30 or later AND impressions dropped, that's the recrawl-wave smoking gun

5. **Search Appearance** for sitewide click-through-rate trend — confirm CTR didn't crater on individual queries (which would point to title/description PRs #347, #348, #350 rather than mass-edit).

CSV → feed into `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-2026-05-12.csv --output-dir docs/dcni-2026-05-12` to get the current SAVE/MERGE/DELETE/REVIEW bucket counts vs the Apr 29 baseline.

---

## 7. Recovery action plan

### P0 (this week, no code shipping required)
1. **Hold the line — moratorium is active.** PR #370/`check-mass-edit.mjs` enforces ≤20 files/PR in `src/newblog/data/posts/` until 2026-07-15. **Do not lift early.** Every additional mass-edit re-triggers the recrawl wave.
2. **Export GSC CSV (last 28d)** and run `scripts/dcni-bucket.mjs` to get the current DCNI bucket counts. Compare to the Apr 29 baseline. Target: ≤ Apr 29 baseline + 10 review-bucket entries.
3. **Stop modifying post `dateModified`** for any reason. If a content edit is unavoidable in a single post during the moratorium, do not bump `dateModified` unless the edit materially changes meaning (e.g., medical guidance correction).

### P1 (next 2 weeks)
4. **Wait. Do nothing further on `/never-hungover/*` indexing.** Google's recrawl + re-evaluation cycle is 2–8 weeks. The next genuine signal will arrive ~mid-May to mid-June.
5. **Pilot DELETE bucket** — pick the 5 lowest-impression off-strategy slugs from `docs/dcni-2026-04-29/buckets.md` (e.g., `study-abroad-international-student-dhm-2025`, `french-wine-culture-guide`, `wine-hangover-guide`). Ship 410s for those 5 ONLY (not 80, not 30). Measure 4 weeks. **This is a single PR, deletion-only, well under the 20-file cap.** It does not constitute a mass-edit.
6. **Track DCNI weekly** — per `CLAUDE.md` moratorium policy. The recovery dashboard (`scripts/posthog-create-recovery-dashboard.mjs`) is provisioned for this.

### P2 (post-moratorium, after 2026-07-15)
7. **Re-export GSC**, re-run bucketing. If DCNI is recovering, proceed with full SAVE/MERGE/DELETE pass per `dcni-bucket.mjs` decision tree.
8. **If DCNI is NOT recovering by mid-July**, consider that the cause is not the mass-edit and look at: spam-update algorithm changes, link-graph degradation from PR #324/#325, or off-strategy content saturation (intrinsic to the cluster pattern). Re-investigate at that point.
9. **Lock the policy in CLAUDE.md.** Even after the moratorium expires, never mass-edit `dateModified` across >20 post JSONs in a single PR. The CI gate should become permanent, not removed in July.

---

## 8. What we CAN'T conclude

- **We can't say PR #246/#359 caused this with certainty.** Real-user PV dropped both in `/never-hungover/*` AND in `/compare`, `/home` — but those clusters were NOT mass-edited. This argues for a partial site-wide algorithm signal (e.g., May 2026 spam update, if one shipped). Confirming requires GSC query-level data.
- **We can't rule out seasonal effect.** Hangover supplement searches dip after spring break (Mar 14–22) into summer; tracking 2025 base data would help.
- **We can't size the bot's "true" baseline** — the bot's behaviour (start Apr 11, peak Apr 11/13/17/20, stop Apr 21) looks like a single Google SERP-preview crawl campaign, not steady-state. We may see another wave in 4–8 weeks.

---

## 9. Confidence: 4 / 5

**High confidence** that the headline −68% is bot variance, not real damage.
**Medium-high confidence** that the residual −16% real-user Google-referrer dip is PR #246/#359 mass-edit triggering recrawl re-evaluation, per the documented CLAUDE.md pattern.
**Cannot reach 5/5** without GSC URL-level recrawl-date data, which is not available from inside the repo.
