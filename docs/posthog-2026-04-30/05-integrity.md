# PostHog 14-Day Window — Data Integrity & Confounder Audit

**Agent 5 (methodology cop). Data pulled 2026-04-30 ~10:30 UTC.**

This document does NOT analyze traffic. It analyzes the *trustworthiness* of the data and characterizes the confounders that constrain what claims agents 1-4 (and the synthesizer) can legitimately make.

---

## 1. Confidence Gate (read this first)

**The strongest defensible claim from this 14-day window is: "human pageviews are roughly flat (±5%) week-over-week at ~85-100/day median, after excluding 5 bot-spike days and ignoring the partial Apr 30."** Anything stronger is over-claim. Three independent confounders make week-over-week comparison essentially uninterpretable on the *raw* numbers: (a) **5 bot/scraper spike days** (Apr 11, 13, 17, 19, 20) inflated raw totals by 50-450 PV each, and these days are unevenly distributed between the two halves; (b) **PR #269 (Apr 26)** removed a 10% sampling gate on engagement events, causing `time_on_page_milestone`/`rage_click_detected`/`text_copied`/`tab_hidden`/`tab_visible`/`form_field_focused`/`page_exit` to jump **18.1×** in volume — any week-over-week claim using these events is invalid; (c) **PR #346 (Apr 29)** added a bot+preview-deploy filter to PostHog init, meaning the last ~36h of data is on a structurally different capture pipeline than the prior 13 days. Today (Apr 30) is **partial** — only ~10.5 of 24 hours captured at query time. Any agent comparing Apr 30 to other days is comparing 44% of a day to 100% of a day.

---

## 2. Likely Bot Days

**Detection method**: a real human visiting from Google scrolls within seconds (auto-firing `scroll_depth_milestone`). Bot/scraper traffic shows three coincident signatures:
1. **pv ≈ sessions ≈ users** (each pageview is a fresh fingerprint — humans hit 1.05-1.30 pv/user)
2. **>95% Desktop + Chrome** (default UA fingerprint of headless requests)
3. **<6% scroll engagement rate** (scrolling sessions / total sessions)

| Day | DoW | PV | Sess | Users | pv/user | Scroll rate | Verdict |
|-----|-----|-----|------|-------|---------|-------------|---------|
| **2026-04-11** | Sat | **485** | 482 | 482 | 1.01 | **3.1%** | High-confidence bot |
| **2026-04-13** | Mon | **418** | 414 | 412 | 1.01 | **3.1%** | High-confidence bot |
| **2026-04-17** | Fri | **273** | 270 | 270 | 1.01 | **5.2%** | High-confidence bot |
| **2026-04-20** | Mon | **250** | 242 | 241 | 1.04 | **2.5%** | High-confidence bot |
| 2026-04-19 | Sun | 147 | 147 | 141 | 1.04 | 6.1% | Probable bot (smaller wave) |
| 2026-04-12 | Sun | 153 | 151 | 148 | 1.03 | 7.9% | Possible (less clear) |
| 2026-04-18 | Sat | 119 | 117 | 115 | 1.03 | 12.7% | Borderline normal |

**Geographic/path concentration**: 84 of 485 PV on Apr 11 hit a single article (`dhm-randomized-controlled-trials`), all from `www.google.com` referrer, all Chrome desktop. That single page got 84/36/36/58 PV across Apr 11-13/17 then dropped to 1-4/day from Apr 21 onward. This is consistent with an SEO-tool / SERP-scraper sweep, not a viral organic burst (which would show a tail of returning users and shares to other domains).

**Recommended exclusion**: drop **Apr 11, 13, 17, 19, 20** for any traffic-trend analysis. Optionally drop Apr 12 too (paired with the Apr 11 wave, looks suspicious). After these 5 exclusions:
- raw last-14d total: 1,616 PV → looks like **−16% WoW**
- after exclusion: last-14d daily avg = 86, prior-14d daily avg = 86 → **+0.4% (flat)**

**The headline "decline" is a bot artifact.** Anyone reporting a WoW change without exclusion is reporting noise.

**Note: the Apr 29 bot filter (PR #346) does NOT explain the spikes ending.** The DHM RCT article spike died organically by Apr 21, eight days *before* the filter shipped. The filter prevents future contamination but didn't retroactively clean the analyzed window.

---

## 3. Change Calendar (Apr 16-30, 2026)

This window is anomalously active — a major triage push in PRs #344-372 plus an SEO/content overhaul in #314-329. Many of these affect tracking, indexing, or who arrives at the site.

| Date | PR/Commit | Category | Possible impact on PostHog data | Severity |
|------|-----------|----------|---------------------------------|----------|
| **Apr 26** | **#269 `1cb8f6b`** | **(a) Tracking** | **Removes 10% sampling gate on engagement events. `time_on_page_milestone` jumps from ~10/day to ~70-110/day overnight (18.1× ratio jump). Same applies to `rage_click_detected`, `text_copied`, `tab_*`, `form_field_focused`, `page_exit`.** | **HIGH — invalidates any WoW comparison on these events** |
| **Apr 29** | **#346 `ca68532`** | **(a) Tracking** | **Adds bot/preview filter to PostHog init: `/bot\|crawler\|spider\|googlebot\|bingbot\|...\|prerender\|headless\|lighthouse/i` UA regex; also blocks vercel.app preview hosts and localhost. Last ~36h of data is on a structurally different capture pipeline than prior 13d.** | **HIGH — last 1-2 days not directly comparable to prior days** |
| Apr 26 | #313 `ebcdd7c` | (a) Tracking | Filter bots from LCP measurement (Web Vitals only). | LOW (Web Vitals only) |
| Apr 26 | #314 `3c36d9d` | (a) Tracking | Adds 10 new dashboard tiles. Doesn't change capture, but means new event-shape consumers exist. | LOW |
| Apr 26 | #311 `c13525a` | (a) Tracking | Wires newsletter capture. Adds new event flow but doesn't disturb existing. | LOW |
| Apr 26 | #310 `faf58a7` | (a) Tracking | Renders full article HTML in prerender (removes cloaking). Could change what bots see vs. humans, may shift bot crawl patterns. | MEDIUM |
| Apr 26 | #279 `2432106` | (a) Tracking | Affiliate click via `window.dataLayer` + Playwright regression suite. Slight code path change for affiliate clicks. | LOW |
| Apr 26 | #274 `efcded2` | (a) Tracking | Track Fuller Health affiliate clicks (new event source, was missing before). | LOW (additive) |
| Apr 26 | #275 `007397c` | (a) Tracking | Tag inline blog Amazon links + audit. New affiliate clicks attributed where they weren't before. | MEDIUM (could appear as affiliate-CTR uplift even if user behavior unchanged) |
| Apr 26 | #273 `2f17473` | (a) Tracking | Unify product-name attribution + mobile-menu event name. | MEDIUM (event-name consolidation can break/repair dashboard rollups) |
| Apr 26 | #280 `83772c5` | (a) Tracking | UTM standard + dead-click filter, env-var-only API key. | MEDIUM (UTM normalization may shift channel attribution) |
| Apr 29 | #367 `2937fba` | (b) URL | Slug rename: `gen-z-mental-health` (drop `%`), `social-media-...` (drop apostrophe); explicit non-www → www 308; deletes `/dhm-dosage-calculator-new`. | MEDIUM (3-7 day Google reindex; old URLs may return 308s tracked) |
| Apr 26 | #316 `fc0db90` | (b) URL | Renames `dhm-randomized-controlled-trials-2024` to year-agnostic slug + 301. **Important: this is the same article spiking on Apr 11/13/17.** | HIGH (the bot-spike article was renamed mid-window) |
| Apr 26 | #319 `453fae9` | (c) SEO | Explicit Allow rules for AI crawlers in robots.txt. Could attract new crawler traffic. | MEDIUM (may *cause* new bot-shaped traffic) |
| Apr 26 | #318 `d71c9c9` | (c) SEO | Emit BreadcrumbList JSON-LD + remove duplicate Article schema. | LOW |
| Apr 26 | #317 `f970bc4` | (c) SEO | Backfill FAQ schema across 62 posts. | LOW (rich snippet eligibility — long-tail effect) |
| Apr 26 | #322 `fc5ef1d` | (c) SEO | Backfill PubMed citations on top 30 traffic posts. | LOW (content quality) |
| Apr 26 | #320 `0e56cdf` | (c) SEO | Quick Answer boxes on top 30 posts. | LOW (content; possible CTR effect long-tail) |
| Apr 26 | #321 `b7700b3` | (a/c) UI | Hero image CLS fix + Picture component. May affect Web Vitals scores. | LOW |
| Apr 26 | #324 `e69769b` | (c) SEO | Inject hub→orphan inbound links across 28 orphans. | MEDIUM (changes internal pagerank flow; could shift which pages Google crawls) |
| Apr 26 | #326 `980d02b` | (a) UI | Mega-menu nav surfaces 6 cluster pillars. Changes top-of-page nav; could shift click patterns. | MEDIUM (any element_clicked nav-related metric is on a new UI) |
| Apr 26 | #312 `e9badb5` | (c) SEO | Distinct dateModified in JSON-LD/sitemap. | LOW |
| Apr 26 | #325 `8a94370` | (c) SEO | Formalize 6 topic clusters with pillar/spoke architecture. | MEDIUM (structural; affects long-tail traffic distribution over weeks, not days) |
| Apr 26 | #327 `c9b7243` | (c) SEO | Expand `dhm-science-explained` to 2,000+ words. | LOW (single article) |
| Apr 26 | #330 `f873fd9` | (c) SEO | Rewrite `hangover-supplements-complete-guide` for head-term ranking. **Note: this article is also in the Apr 11 spike pages.** | MEDIUM (ranking shift mid-window for a high-traffic page) |
| Apr 26 | #331 `57e1449` | (c) SEO | Refresh top-5 traffic posts + remove broken citations. | MEDIUM (content shift on the highest-traffic pages) |
| Apr 26 | #332-336 | (c) SEO | 4 spirit-specific hangover guides + Ozempic + What-to-Eat + Hangxiety pillar + Magnesium spoke. | LOW (new pages; won't show traffic for weeks) |
| Apr 26 | #338 `8491095` | (d) Infra | Remove ~109MB unused PNG/WebP from /public. | LOW (can affect Web Vitals positively but no event impact) |
| Apr 27 | #341 `20354ed` | (d) Infra | Define z-index tokens in @theme so Tailwind v4 emits classes (fixed broken header z-index). | MEDIUM (changes layered UI; could affect engagement on pages where header was overlapping content for ~6 months) |
| Apr 27 | #342 `e8cf13d` | (d) Infra | Layering safety net + ESLint rule. No runtime change. | LOW |
| Apr 28 | #343 `d9e36ae` | (d) Infra | Fix prerender FOUC (off-screen positioning). | MEDIUM (fixes a visible-flicker UX bug; may affect bounce/scroll metrics positively) |
| Apr 26 | #339-340 | (d) Infra | Mega-menu portal + stacking-context fix. | LOW |
| Apr 26 | #270, #272, #281, #282 | (e) Content/data | Markdown conversions, image cleanup. | LOW |
| Apr 29 | #350-358, #361, #367, #368 | (c) SEO | Trim review titles to <60 chars; HowTo schema; 4 hard indexing bug fixes; promote 2 hub pages to pillars. | MEDIUM (CTR effects long-tail, days+) |
| Apr 29 | **#359 `ffb4678`** | (e) Content | **Adds "Continue Your Research" footer to 197 posts (mass-edit).** | MEDIUM (mass-edit triggered subsequent #366 moratorium; may have triggered Google recrawl wave) |
| Apr 29 | #370 `a8f3a8a` | (d) Infra | Mass-edit moratorium CI guardrail. | LOW (process) |
| Apr 30 | #371-372 | (d) Infra | Recovery dashboard provisioner; Amazon price refresh pipeline (price-only change to topProducts.json). | LOW |

**Bottom line on the change calendar**: this is *the most active 14-day window of the year*. **Two changes (PR #269 and PR #346)** by themselves invalidate naïve WoW comparison on engagement events and on the last 1-2 days respectively.

---

## 4. Day-of-Week Pattern

Computed over last 28 days, Apr 30 excluded as partial.

| DoW | n=4 raw mean | raw median | n (clean, bots excluded) | clean mean | clean median |
|-----|-------------|-----------|----------------|-----------|--------|
| Mon | 196 | 250 | 2 | **59** | 76 |
| Tue | 100 | 102 | 4 | 100 | 102 |
| Wed | 108 | 110 | 4 | 108 | 110 |
| Thu | 77 | 79 | 4 | 77 | 79 |
| Fri | 113 | 74 | 3 | 59 | 55 |
| Sat | 190 | 119 | 3 | 91 | 82 |
| Sun | 103 | 147 | 3 | 88 | 68 |

**Interpretation**: weekly seasonality is hard to read because every weekday-end has at least one bot day. *Clean* (bot-excluded) numbers suggest **Wed/Tue are highest**, **Mon/Fri lowest**, with weekends moderate (~80-90 PV). Sample size is too small (n=2-4 per DoW) for any claim with statistical confidence — treat as a rough sketch only.

**Critical for synthesis**: the last-14d (Apr 16-29) and prior-14d (Apr 2-15) windows are **DoW-balanced** — 2 of each weekday in each window. Window-vs-window comparison is not biased by DoW skew. **It IS biased by bot-day distribution** (3 in last-14d, 2 in prior-14d, with prior-14d's bot days being larger in magnitude — this is what creates the spurious -16% raw decline).

---

## 5. Tracking Integrity

### 5.1 Engagement-event volume jumped 18.1× on Apr 26 (PR #269)

| Period | mean time_on_page_milestone / pageview |
|--------|----------------------------------------|
| Apr 11-25 (sampling gate active, 10% Math.random()) | **0.06** |
| Apr 26-29 (sampling gate removed) | **1.13** |
| **Ratio** | **18.1×** |

Affected events (per the PR description):
- `time_on_page_milestone`
- `rage_click_detected`
- `text_copied`
- `tab_hidden`, `tab_visible`
- `form_field_focused`
- `page_exit`

Unaffected events (different hook):
- `$pageview`, `scroll_depth_milestone`, `affiliate_link_click`, `element_clicked`

**Implication**: any agent comparing rage-click rate, time-on-page, or tab-switch behavior week-over-week is comparing a 10% sample to a 100% sample. The "increase" is the gate being removed, not user behavior. **Synthesis MUST flag this** — Grok/Gemini/anyone reading the report may otherwise conclude the site got more engaging in the last week, when it merely became more measured.

### 5.2 PostHog bot/preview filter shipped Apr 29 (PR #346)

```js
// src/lib/posthog.js (line 28-35)
const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|prerender|headless|lighthouse/i.test(ua);
const host = window.location.hostname;
const isPreview = host.includes('vercel.app') || host === 'localhost' || host.startsWith('127.');
if (isBot || isPreview) {
  console.log('[PostHog] Skipping init: bot or preview environment');
  return;
}
```

**What it catches**: any UA string containing the listed bot tokens. Vercel preview deploys (`*.vercel.app`). Localhost.

**What it misses**: scrapers using a stock Chrome UA (no `bot`/`crawler`/etc. in the string). The Apr 11 SERP-scraper-style traffic (Chrome desktop, Google referrer, no scroll) would NOT be caught by this regex — those scripts deliberately spoof real browser UAs. Heuristic engagement-based detection (no scroll → bot) would be more effective but isn't implemented.

**Implication**: WoW comparisons that span Apr 29 are comparing a slightly-different capture pipeline. The first ~36h of data after the filter likely shows a small artifactual drop (bots that *did* have detectable UAs are now silenced), separate from any actual user behavior change.

### 5.3 Today (Apr 30) is partial

Current time: 2026-04-30 ~10:30 UTC. Apr 30 has 24 hourly buckets but only 9 are populated (00, 01, 03, 04, 05, 06, 07, 09, 10). **~10.5 hours of 24 captured = ~44% of a day.** Pageviews-so-far: 27. Linear extrapolation = ~62 PV for the day. Comparing Apr 30 to other days *as if* it were complete will make today look anomalously low.

### 5.4 Other tracking-relevant changes in window

- **PR #275** (Apr 26): newly tagged inline blog Amazon links → affiliate-click *rate* will look elevated post-Apr 26 even if user behavior unchanged
- **PR #273** (Apr 26): unified product-name attribution + mobile-menu event renamed → dashboards aggregating by event name may double-count or miss
- **PR #280** (Apr 26): UTM standardization → channel attribution may shift category labels
- **PR #313** (Apr 26): bot filter in LCP measurement → Web Vitals scores not comparable across Apr 26

---

## 6. Recommended Caveats (the deliverable)

Every claim from agents 1-4 and the synthesizer **MUST** be qualified with one or more of these:

1. **"Excluding 5 bot-suspect days"** — any traffic-trend or WoW comparison must explicitly exclude **Apr 11, 13, 17, 19, 20**. Raw totals on these days are 50-450 PV inflated by what looks like an SEO-tool / SERP-scraper sweep on a small set of articles. Without exclusion, the WoW change reads as -16%. With exclusion, it reads as +0.4% (flat).

2. **"WoW on engagement events is invalid through Apr 26"** — `time_on_page_milestone`, `rage_click_detected`, `text_copied`, `tab_hidden`, `tab_visible`, `form_field_focused`, and `page_exit` jumped **18.1×** on Apr 26 due to PR #269 removing a 10% sampling gate. Do not interpret post-Apr-26 rates as a behavior change. Use *trend* on these events only from Apr 26 onward.

3. **"Apr 30 is partial (~44% of day)"** — only ~10.5 of 24 hours captured at query time. Any "Apr 30 vs other days" comparison must either exclude Apr 30 or normalize by hours-elapsed.

4. **"Last ~36h on a different capture pipeline"** — PR #346 (Apr 29 ~15:00 BST) added bot+preview filtering. Apr 29 evening + Apr 30 are on a marginally cleaner pipeline than the prior 13d. Effect is small (the new filter only catches UAs with bot tokens — most of our spike traffic uses real-Chrome UAs and was *not* affected). Still, do not over-interpret a same-day-of-week drop on Apr 29.

5. **"Affiliate-CTR-rate increases post-Apr-26 may be a tagging artifact"** — PR #275 tagged inline blog Amazon links that were previously untracked. Any rise in affiliate-click rate after Apr 26 needs to be checked against new-vs-old click-source attribution before being claimed as a behavior shift.

6. **"Sample sizes are tiny — 14 days × ~85 human PV/day = ~1,200 PV per window."** No reasonable statistical test will produce significance on subgroup analyses (channel splits, page-level WoW, conversion rate by device, etc.) at this volume. Treat all subgroup numbers as directional, never significant.

7. **"DoW windows are balanced but bot distribution isn't"** — last-14d and prior-14d both have 2 of each weekday. But last-14d has 3 bot days (Apr 17/19/20, totaling ~670 inflated PV), prior-14d has 2 (Apr 11/13, totaling ~903 inflated PV). The DoW match doesn't fix the bot imbalance.

8. **"Major content/SEO push happened Apr 26"** — 30+ PRs landed in one day (#268-338). Any traffic *change* attribution to a specific PR is impossible at this volume; effects will only become legible over 4-6 weeks of post-push data.

9. **"Article slug renames active"** — `dhm-randomized-controlled-trials-2024` (the article most-spiked by bots) was renamed Apr 26 (PR #316). Two more renames Apr 29 (PR #367). 301/308 redirects are in place but Google reindexing may produce transient bot-shaped traffic to the new URLs.

10. **"Bot filter is partial"** — PR #346 only catches UA strings containing bot tokens. Scrapers using stock Chrome UAs (which is what we appear to be seeing on Apr 11/13/17) are NOT caught. Future spike days remain possible.

---

## 7. The single most important sentence for the synthesizer

> The raw 14-day pageview total of 1,616 (vs. prior 1,931, naïvely "−16%") is a bot-day artifact — after excluding 5 high-confidence bot-spike days, daily-average human traffic is essentially flat at ~86 PV/day across both windows.

If agents 1-4 deliver any other top-line number for traffic, it is wrong. Apply the bot exclusion before stating any trend.

---

## Appendix: Raw daily totals (last 28 days, no exclusions)

```
day        pv    sess  users  pv/sess  pv/user  DoW  bot?
2026-04-30   27    24    24    1.12     1.12   Thu  PARTIAL
2026-04-29  110   107   105    1.03     1.05   Wed
2026-04-28   65    63    61    1.03     1.07   Tue
2026-04-27   42    38    35    1.11     1.20   Mon
2026-04-26   68    59    54    1.15     1.26   Sun
2026-04-25   72    61    55    1.18     1.31   Sat
2026-04-24   74    72    68    1.03     1.09   Fri
2026-04-23   69    64    60    1.08     1.15   Thu
2026-04-22   94    90    89    1.04     1.06   Wed
2026-04-21  102   100    99    1.02     1.03   Tue
2026-04-20  250   242   241    1.03     1.04   Mon  *BOT*
2026-04-19  147   147   141    1.00     1.04   Sun  *BOT*
2026-04-18  119   117   115    1.02     1.03   Sat
2026-04-17  273   270   270    1.01     1.01   Fri  *BOT*
2026-04-16  131   123   123    1.07     1.07   Thu
2026-04-15  135   128   128    1.05     1.05   Wed
2026-04-14  130   127   126    1.02     1.03   Tue
2026-04-13  418   414   412    1.01     1.01   Mon  *BOT*
2026-04-12  153   151   148    1.01     1.03   Sun
2026-04-11  485   482   482    1.01     1.01   Sat  *BOT*
2026-04-10   49    46    43    1.07     1.14   Fri
2026-04-09   79    75    74    1.05     1.07   Thu
2026-04-08   95    92    90    1.03     1.06   Wed
2026-04-07  102    98    95    1.04     1.07   Tue
2026-04-06   76    73    72    1.04     1.06   Mon
2026-04-05   44    44    43    1.00     1.02   Sun
2026-04-04   82    78    75    1.05     1.09   Sat
2026-04-03   55    55    54    1.00     1.02   Fri
2026-04-02   28    28    28    1.00     1.00   Thu
```

Bot-day fingerprint: `pv ≈ sessions ≈ users` AND scroll engagement <6%.
