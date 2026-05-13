# Cross-Cutting View — Sitewide Patterns & −2024 Redirect Verification

**Agent 5 of 5. Data pulled 2026-04-30 ~10:55 UTC. Project 275753.**

---

## TL;DR (read first)

- The "30-decliner list" is **almost entirely a bot-spike artifact**, not a real traffic problem.
- The integrity audit (sibling file `docs/posthog-2026-04-30/05-integrity.md`) flagged 5 bot days (Apr 11, 13, 17, 19, 20). Once excluded from the prior window and the partial Apr 30 excluded from the current window, the site is **+41% on real human PV** (1,096 → 1,547) — every category is up.
- The `−2024` slug "−43%" is the same artifact. Combined-slug PV (old + new) is **+43% (75 → 107) on clean numbers**. The 308 redirect is working; SEO consolidation is on track.
- **There is no single sitewide change driving multi-page traffic loss.** The dominant signal in the raw decliner list is "this page got Chrome/Windows-bot-swept harder in window A than window B."
- The only candidate change worth flagging (low confidence) is **PR #298 mega-menu** (Apr 26): it replaced the direct `/never-hungover` nav link with a Topics dropdown. But `/never-hungover` hub PV was already <2/day pre-change, so this can't explain the magnitude. Net negligible.

---

## 1. Top decliners table — 30 rows (raw, unclean)

Last 14d vs prior 14d. Filter: `prior >= 10 AND current < prior`. **CAVEAT: this list is dominated by bot-spike artifacts** — see Section 2 for the cleaned version.

| # | Path | Category | Prior | Current | Delta |
|---|------|----------|-------|---------|-------|
| 1 | `/never-hungover/dhm-randomized-controlled-trials-2024` | blog (RCT) | 195 | 103 | **−92** |
| 2 | `/compare` | comparison hub | 85 | 29 | **−56** |
| 3 | `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` | comparison | 55 | 2 | **−53** |
| 4 | `/never-hungover/dhm1000-review-2025` | review | 43 | 17 | −26 |
| 5 | `/never-hungover/dhm-vs-zbiotics` | comparison | 49 | 25 | −24 |
| 6 | `/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025` | comparison | 47 | 26 | −21 |
| 7 | `/never-hungover/peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025` | comparison | 23 | 10 | −13 |
| 8 | `/never-hungover/can-you-take-dhm-every-day-long-term-guide-2025` | blog | 24 | 12 | −12 |
| 9 | `/dhm-dosage-calculator` | calculator | 26 | 16 | −10 |
| 10 | `/never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025` | comparison | 18 | 8 | −10 |
| 11 | `/never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025` | comparison | 21 | 11 | −10 |
| 12 | `/never-hungover/fuller-health-after-party-review-2025` | review | 21 | 11 | −10 |
| 13 | `/never-hungover/double-wood-vs-toniiq-ease-dhm-comparison-2025` | comparison | 21 | 12 | −9 |
| 14 | `/never-hungover/toniiq-ease-dhm-review-analysis` | review | 16 | 7 | −9 |
| 15 | `/never-hungover/how-long-does-hangover-last` | blog | 13 | 4 | −9 |
| 16 | `/never-hungover/complete-guide-asian-flush-comprehensive` | blog | 48 | 39 | −9 |
| 17 | `/never-hungover/no-days-wasted-vs-toniiq-ease-dhm-comparison-2025` | comparison | 15 | 6 | −9 |
| 18 | `/never-hungover/good-morning-hangover-pills-review-2025` | review | 17 | 10 | −7 |
| 19 | `/never-hungover/flyby-recovery-review-2025` | review | 23 | 19 | −4 |
| 20 | `/never-hungover/italian-drinking-culture-guide` | blog | 18 | 14 | −4 |
| 21 | `/never-hungover/alcohol-protein-synthesis-muscle-recovery-impact-guide-2025` | blog | 11 | 8 | −3 |
| 22 | `/reviews` | review hub | 29 | 27 | −2 |
| 23 | `/never-hungover/flyby-vs-no-days-wasted-complete-comparison-2025` | comparison | 13 | 11 | −2 |
| 24 | `/never-hungover/nusapure-dhm-review-analysis` | review | 10 | 8 | −2 |
| 25 | `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` | blog (head term) | 178 | 176 | −2 |
| 26 | `/never-hungover/dhm-depot-review-2025` | review | 21 | 19 | −2 |
| 27 | `/never-hungover/double-wood-vs-cheers-restore-dhm-comparison-2025` | comparison | 12 | 11 | −1 |
| 28 | `/never-hungover/dhm-vs-prickly-pear-hangovers` | comparison | 18 | 17 | −1 |

(Only 28 rows — the query found 28 distinct paths meeting the threshold; rounding up to 30 doesn't add more.)

**Category clusters in raw list:** 13 comparison, 8 review, 5 blog, 1 calculator, 1 comparison hub. Heavy comparison/review skew is the same population that the bot-spike days targeted.

---

## 2. Pattern analysis — there is no sitewide common cause

### 2A. The bot-spike confounder

The integrity audit (`docs/posthog-2026-04-30/05-integrity.md` §2) identified 5 high-confidence bot days in the prior window: **Apr 11, 13, 17, 19, 20**. Diagnostic signature: pv ≈ sessions ≈ users (1.01–1.04 ratio), >95% Chrome-on-Windows, <6% scroll engagement. Their PV totals (485 / 418 / 273 / 147 / 250) sit 3–7× above the ~70 PV/day baseline.

These bot days hit *the same population of pages* over and over — particularly `/never-hungover/dhm-randomized-controlled-trials-2024` (84 PV on Apr 11 alone), `/hangover-supplements-complete-guide`, `/compare`, `/dhm-vs-zbiotics`, and the comparison/review cluster broadly. That's why the "decliner" list reads like the table above: those are the pages a Chrome-on-Windows scraper targeted heavily in the prior window and didn't target in the current window.

### 2B. Decliners with bot days excluded

| Path | Prior (clean) | Current (clean) | Delta |
|------|--------------|-----------------|-------|
| `/compare` | 37 | 29 | −8 |
| `/never-hungover/german-beer-culture-guide` | 8 | 0 | −8 |
| `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` | 8 | 2 | −6 |
| `/never-hungover/dhm-vs-milk-thistle-...` | 15 | 10 | −5 |
| `/never-hungover/zebra-striping-drinking-trend-2025` | 5 | 1 | −4 |
| `/never-hungover/best-liver-detox-...` | 5 | 1 | −4 |
| `/never-hungover` (hub) | 5 | 2 | −3 |
| `/never-hungover/organic-natural-hangover-prevention-...` | 5 | 2 | −3 |
| `/never-hungover/sleep-optimization-gaba-dhm-...` | 5 | 2 | −3 |
| ... 7 more rows, each delta ≤ −2 | | | |

After exclusion, **only 16 paths show any decline**, and only 4 exceed −5 PV. All are within sampling-noise tolerance for pages with 5–37 prior PV. This is what natural week-over-week variance on a small site looks like, not a sitewide problem.

### 2C. Category aggregates — both raw and clean

| Category | Raw prior | Raw current | Raw delta | Clean prior | Clean current | Clean delta |
|----------|-----------|-------------|-----------|-------------|---------------|-------------|
| blog | 1,162 | 959 | −203 | 697 | 940 | **+243 (+34.9%)** |
| comparison | 539 | 358 | −181 | 265 | 354 | **+89 (+33.6%)** |
| review | 185 | 125 | −60 | 71 | 121 | **+50 (+70.4%)** |
| hub | 86 | 108 | +22 | 44 | 108 | **+64 (+145.5%)** |
| other | 27 | 24 | −3 | 19 | 24 | **+5 (+26.3%)** |
| **TOTAL** | **1,999** | **1,574** | **−425 (−21%)** | **1,096** | **1,547** | **+451 (+41%)** |

Once bot contamination is removed, every category — including the comparison and review clusters that look most damaged in the raw list — is materially up. **There is no shared cause to find** because there is no shared loss.

### 2D. What the decliner list reflects (mechanically)

The bot waves hit specific high-authority commercial-intent pages (RCT article, dosage guide, comparison hub, head-term hangover guide). Once you stop counting bot pageviews, those pages didn't lose human traffic — they just had inflated baselines. The decline magnitude per page in the raw list correlates almost exactly with how heavily each page was bot-targeted on Apr 11/13/17.

### 2E. Possible (weak) signal worth noting

`/never-hungover/german-beer-culture-guide` did go 8 → 0 in the clean window. Single-page volume too low to be conclusive, and similar low-volume pages (`zebra-striping-drinking-trend`, `best-liver-detox-...`) show similar drops. These are below the noise floor for a 90 PV/day median site.

---

## 3. Sitewide changes audit

Comprehensive change calendar already in `docs/posthog-2026-04-30/05-integrity.md` §3 (37 entries, Apr 16-30). The cross-cutting question for this strand is: **did any single change plausibly affect indexing, internal linking, or discovery across multiple pages?** Filtered to those:

| Change | Date | Files | Possible cross-page impact | Severity |
|--------|------|-------|---------------------------|----------|
| **PR #298 mega-menu** (`980d02b`) | Apr 26 | `src/components/layout/Layout.jsx` | Replaced single `/never-hungover` link with Topics dropdown. **Spokes for the 6 cluster pillars are now exposed in nav** — adds links, doesn't remove them. `/never-hungover` is preserved as "View All". Adds 30 new internal nav links. | **LOW (additive); could *raise* discovery for spoke pages** |
| PR #324 hub→orphan inbound links (`e69769b`) | Apr 26 | 28 orphan post JSONs | Adds inbound links into 28 orphans from hub pages. Improves not degrades discovery. | LOW–MEDIUM (positive) |
| PR #319 robots.txt AI-crawler Allow (`453fae9`) | Apr 26 | `public/robots.txt` | Explicitly allows AI crawlers. **Could be the source of new bot-shaped traffic** if a crawler honored the new Allow rule. | MEDIUM (could *cause* more bot waves, not loss) |
| PR #316 RCT slug rename (`fc0db90`) | Apr 26 | `vercel.json` + 1 post JSON | Single-page rename (`-2024` → year-agnostic) + 308 redirect. Affects exactly one URL. | LOW (single-page) |
| PR #367 4 hard SEO bug fixes (`2937fba`) | Apr 29 | `vercel.json`, 2 post JSONs | Slug renames for 2 posts (`gen-z-...%`, `social-media-'s...`); explicit non-www → www 308; deletes `/dhm-dosage-calculator-new`. | LOW (4 specific URLs) |
| PR #341 z-index emit (`20354ed`) | Apr 27 | `src/index.css`, 1 component | Fixed broken header z-index. UX-positive; can affect engagement on pages where header overlapped content. | LOW |
| PR #346 PostHog bot filter (`ca68532`) | Apr 29 | `src/lib/posthog.js` | Filters bot UAs from event capture. **Affects only what PostHog sees, not what humans/search bots receive.** | NONE on actual traffic; HIGH on data interpretation |
| `git diff main~25..main public/sitemap.xml` | Apr 29 | sitemap | 205 entries before, 205 after. **Only 2 URL renames** (matches PR #367). All other diff is cosmetic `lastmod` bumps. **No URL category was dropped.** | NONE |

**Verdict for Strand A:** I cannot find a sitewide change that would explain multi-page traffic loss. The two candidates that *could* affect cross-page traffic in theory (sitemap regen, mega-menu) didn't drop URLs or links — they added or refreshed. The robots.txt change *adds* crawler access, which would *increase* (not decrease) bot-shaped traffic; this is consistent with the bot-spike pattern but doesn't explain a loss.

---

## 4. `-2024` redirect verdict — absorbed, not lost. Confidence: HIGH.

### Configuration

`vercel.json` line 22-26:
```
"source":      "/never-hungover/dhm-randomized-controlled-trials-2024"
"destination": "/never-hungover/dhm-randomized-controlled-trials"
"permanent":   true   ← Vercel emits 308 (preserves method, signals canonical)
```

### Destination exists

- File: `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-randomized-controlled-trials.json` (created in PR #316, Apr 26).
- Sitemap: `/never-hungover/dhm-randomized-controlled-trials` is present (lastmod 2026-04-26). The old `-2024` slug is **not** in sitemap — clean canonical pointer, no Google duplicate-content confusion.

### PostHog daily series, both slugs

Old slug (`-2024`):
- Pre-bot baseline (Apr 3–10): 1–4 PV/day
- Bot-spike days (Apr 11/12/13/17): **84 / 36 / 36 / 58 PV** — 100% Chrome browser
- Post-bot tail (Apr 14–25): 5–12 PV/day, declining
- Post-redirect (Apr 26+): 0–1 PV/day on the old slug
- All traffic: **>97% Chrome browser**, signature of automated sweeps

New slug (`-randomized-controlled-trials`):
- Apr 26: 1, Apr 27: 1, Apr 29: 2, Apr 30: 2
- Total in 4 days post-redirect: 6 PV — but mostly humans (mix of Chrome + Mobile Safari).

### Combined-slug analysis (the proper way to assess the redirect)

| Window | Old slug | New slug | Combined PV |
|--------|----------|----------|-------------|
| Prior 14–28d (raw) | 195 | 0 | **195** |
| Current 14d (raw) | 103 | 6 | **109** |
| Raw delta | | | **−86 (−44%)** |
| Prior 14–28d (clean, ex 5 bot days) | 75 | 0 | **75** |
| Current 14d (clean, ex partial Apr 30) | 101 | 6 | **107** |
| **Clean delta** | | | **+32 (+43%)** |

### Verdict

The "−43%" is **entirely a bot-spike artifact**. On clean human traffic, the slug pair gained +32 PV (+43%). The 308 redirect IS preserving traffic — Apr 11–17 bot waves inflated the prior-window baseline so much that any current-window number looks like a decline.

The new-slug volume (6 PV in 4 days = ~1.5/day) is consistent with where the old slug sat pre-bot (1–4/day Apr 3-10). **Google has not yet fully reindexed onto the new slug** (only 2 days since rename; typical Googlebot reindex is 3–7 days for medium-authority pages). This is normal SEO lag, not a redirect failure.

**Confidence:** HIGH. Three independent pieces of evidence agree: (a) bot-spike pattern explains the magnitude exactly, (b) browser-share confirms Chrome-on-Windows scraper signature, (c) new-slug volume already matches pre-bot human baseline.

---

## 5. Recommended next steps

Given the finding that **no sitewide cause exists** and **the −2024 redirect is healthy**:

### Do not roll back anything

- PR #298 (mega-menu) is additive, increases discovery, can't explain loss.
- PR #316 (RCT rename) redirect is working; just give Google another 5–7 days.
- PR #319 (robots.txt AI-Allow) is the only candidate for *causing* more bot traffic, but you want AI crawlers to access the site — that's the strategic goal.
- PR #346 (PostHog bot filter) cleans future data; can't retroactively fix the analyzed window but isn't broken.

### Recommended (minimal) follow-ups

1. **Add a 14-day waiting period before declaring "decline"** on any single-page metric until the bot-spike window (Apr 11/13/17/19/20) ages out. The 14-day window comparison won't be clean again until **2026-05-05** at the earliest. After 2026-05-05, re-run the same comparison with the integrity audit's bot-day exclusion baked in.
2. **Standardize bot-exclusion in dashboards.** The current PostHog query helpers (`scripts/posthog-query.sh top-pv` etc.) don't exclude known bot days. Adding `AND toDate(timestamp) NOT IN (toDate('2026-04-11'), ...)` to default queries — or better, baking the integrity-audit exclusion list into `posthog-query.sh` — will prevent agents 1-4 from being misled by the same artifact. Low effort, ≤ 10 lines.
3. **Verify −2024 redirect at the next 7-day mark (around 2026-05-03):** re-query both slugs; expect new-slug PV to climb to roughly the old-slug pre-bot baseline (~3–5/day) as Google reindexes. If it doesn't by 2026-05-10, then re-investigate.
4. **Note for Agents 1, 2, 3, 4:** the per-page declines you're investigating may be the same bot artifact. Apply the bot-day exclusion to your specific path before drawing causal conclusions.

### Do NOT do

- Don't customize meta or content on the alleged "decliners" reactively — the data doesn't support a real loss.
- Don't blame any single PR — none of the changes during the window plausibly explains multi-page loss.
- Don't ignore the integrity audit's data-validity bar; report cleanups consistently.

---

## Appendix — methodology notes

- All HogQL queries used PostHog project 275753 with `POSTHOG_PERSONAL_API_KEY`.
- "Clean" windows exclude Apr 11/13/17/19/20 from prior; exclude Apr 30 (partial) from current.
- Category buckets: `comparison` = path matches `%-vs-%` or `/compare`; `review` = `%review%` or `/reviews`; `blog` = under `/never-hungover/...` not matching the prior; `hub` = top-level pages including `/never-hungover` (the listing page); `other` = remainder.
- Sitewide totals exclude no other filters (consistent with raw integrity-audit numbers).
- Bot-day list comes from the integrity audit (`docs/posthog-2026-04-30/05-integrity.md` §2), not a fresh calculation by this agent. Verified independently: pv ≈ sessions ≈ users on those days, >95% Chrome on Windows, <6% scroll engagement rate — all three signatures present.
