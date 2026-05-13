# PostHog Channel Mix — Last 14d vs Prior 14d

**Agent**: 2 of 5 (channel mix lane)
**Generated**: 2026-04-30
**Data source**: PostHog project 275753 via HogQL
**Windows**:
- **Last 14d**: 2026-04-16 → 2026-04-29 (inclusive, complete days)
- **Prior 14d**: 2026-04-02 → 2026-04-15 (inclusive, complete days)
- Today (2026-04-30) excluded — partial day

**Volume sanity**: Total PV reconciled across all queries.
- Prior 14d: 1,951 PV (channel-sum 1,951 ✓)
- Last 14d: 1,616 PV (channel-sum 1,616 ✓)

---

## 1. Channel mix comparison

### 1a. Raw (as bucketed by `posthog-query.sh` patterns)

| Channel     | Prior 14d PV | Last 14d PV | Δ abs | Δ % | Flag |
|-------------|-------------:|------------:|------:|------:|:----:|
| google      |        1,201 |         839 |  −362 | −30.1% | **>20** |
| direct      |          727 |         739 |   +12 |  +1.6% |  |
| bing        |            6 |          20 |   +14 | +233%  |  |
| other       |           10 |          10 |     0 |   0%   |  |
| duckduckgo  |            6 |           7 |    +1 | +16.7% |  |
| social      |            1 |           1 |     0 |   0%   |  |
| chatgpt     |            0 |           0 |     0 |    —   |  |
| perplexity  |            0 |           0 |     0 |    —   |  |
| claude      |            0 |           0 |     0 |    —   |  |
| gemini      |            0 |           0 |     0 |    —   |  |
| copilot     |            0 |           0 |     0 |    —   |  |
| **TOTAL**   |    **1,951** |   **1,616** | **−335** | **−17.2%** |  |

**Apparent headline**: google traffic dropped 30%. **This is misleading.** See section 2.

### 1b. Bot-stripped (excluding the SERP-preview bot identified in `posthog-query.sh:lcp-real`)

The cohort `Chrome/145.0.0.0 + screen 800×600 + viewport 1920` was previously
characterised as the Google SERP-preview bot (see CLAUDE.md and the `lcp-real`
query). Stripping that cohort isolates real-user traffic:

| Channel     | Prior 14d PV | Last 14d PV | Δ abs | Δ % | Flag |
|-------------|-------------:|------------:|------:|------:|:----:|
| direct      |          727 |         739 |   +12 |  +1.6% |  |
| google      |          249 |         319 |   +70 | +28.1% | **>20** |
| bing        |            6 |          20 |   +14 | +233%  |  |
| other       |           10 |          10 |     0 |   0%   |  |
| duckduckgo  |            6 |           7 |    +1 | +16.7% |  |
| social      |            1 |           1 |     0 |   0%   |  |
| **TOTAL**   |      **999** |   **1,096** | **+97** | **+9.7%** |  |

**Real-user totals are UP +9.7%, not down −17%.** The −17% raw total is an
artefact of fewer bot pageviews — the bot fired 952 PV in the prior window
versus only 520 in the last window. Bot volume is uncorrelated with site
quality and should not headline any narrative.

**Channels exceeding the 20-PV absolute movement threshold**:
- **google: +70 PV (real-user)** — *the* signal worth watching (see §2)
- google raw: −362 PV — driven entirely by bot variance, ignore
- bing: +14 PV — below threshold, mention but don't headline

---

## 2. Organic search detail (google.*)

### 2a. Daily PV trend, last 28 days (bot-stripped)

```
Apr 02  ████████████████████ 18
Apr 03  ███████████████      14
Apr 04  █████████████████████ 19
Apr 05  ██████████████       13
Apr 06  ██████████████       13
Apr 07  ███████████████████████ 21
Apr 08  ███████████████████  17
Apr 09  ███████████████████  17
Apr 10  ██████████████████████████ 24
Apr 11  ██████████████████████ 20
Apr 12  █████████████████████ 19
Apr 13  █████████████████████████ 23
Apr 14  ███████████          10
Apr 15  ███████████████████████ 21
        ─── window break ───
Apr 16  ███████████████████████████ 25
Apr 17  ████████████████████████ 22
Apr 18  ██████████████████████████ 24
Apr 19  ████████████████████████████████ 30
Apr 20  ███████████████████████ 21
Apr 21  ██████████████████   16
Apr 22  ██████████████████████ 20
Apr 23  ██████████████████████████ 24
Apr 24  ██████████████████████████████ 28
Apr 25  █████████████████████████████████ 32
Apr 26  ██████████████████████████ 24
Apr 27  ██████████████████   16
Apr 28  ███████████████████████ 21
Apr 29  ██████████████████   16
```

Stats over 28 days, bot-stripped: mean = 20.3 PV/day, median = 20.5,
σ = 5.2, linear-regression slope = **+0.26 PV/day** (positive).

### 2b. Window comparison (bot-stripped)

| Metric | Prior 14d | Last 14d | Δ |
|---|---:|---:|---:|
| Sum google PV | 249 | 319 | +70 (+28.1%) |
| Mean PV/day | 17.8 | 22.8 | +5.0/day |
| Daily floor | 10 | 16 | +6 |
| Daily ceiling | 24 | 32 | +8 |

### 2c. Trend assessment

**Direction: up. Confidence: low.**

Justification: real google PV moved from a 28-day mean of ~18/day in the prior
window to ~23/day in the last window with a consistent positive slope and a
rising floor (no day below 16 in the last 14d vs four days below 16 in the
prior 14d). However, n=319 over 14 days at <30 PV/day puts every individual
day inside one σ of the mean, the absolute magnitude is small (+70 PV total),
and the time horizon is 14 days — too short for SEO work shipped in
issues #339-#343 and the post-DCNI moratorium to physically affect indexed
content. **This is consistent with — but does not prove — a recovery
trajectory.** A second consecutive 14d window with mean ≥20 PV/day would
upgrade to medium confidence.

### Hard rule check

google PV ≥ 20 in both windows (249 and 319), so the trend is above the noise
floor and a delta CAN be reported. Bing (6 → 20) sits at the noise floor in
the prior window — change reported but no conclusion drawn.

---

## 3. AI-search engines

| Engine | Prior 14d PV | Last 14d PV |
|---|---:|---:|
| chatgpt    | 0 | 0 |
| perplexity | 0 | 0 |
| claude     | 0 | 0 |
| gemini     | 0 | 0 |
| copilot    | 0 | 0 |

**Zero AI-search referrers across both windows.** Verified across the wider
30-day window (Mar 31 → Apr 29): also zero. This either means we are
genuinely invisible to AI search engines, or PostHog's `$referrer` capture
is missing them (some AI surfaces strip `Referer` headers — possible
collection gap).

No interpretation possible. Don't read anything into the zeros.

---

## 4. Direct + unexpected referrers

### Top referring domains, last 14d (Apr 16-29, raw — includes bot)

| Host | PV |
|---|---:|
| www.google.com   | 838 |
| $direct          | 739 |
| bing.com         |  16 |
| www.dhmguide.com |   7 |
| duckduckgo.com   |   7 |
| www.bing.com     |   4 |
| search.brave.com |   2 |
| search.yahoo.com |   1 |
| m.facebook.com   |   1 |
| www.google.ca    |   1 |

### Top referring domains, prior 14d (Apr 2-15, raw — includes bot)

| Host | PV |
|---|---:|
| www.google.com   | 1,200 |
| $direct          | 727 |
| www.bing.com     |   6 |
| www.dhmguide.com |   6 |
| duckduckgo.com   |   6 |
| search.brave.com |   2 |
| www.facebook.com |   1 |
| www.ecosia.org   |   1 |
| search.yahoo.com |   1 |
| www.google.co.uk |   1 |

### Observations

- **Direct is huge (~46% of bot-stripped total).** Either organic-search
  recovery hasn't shown up yet, brand search is funnelling users via direct
  navigation, or there's significant attribution loss (privacy headers
  stripping referrers — Safari/iOS especially). Without a UTM strategy or
  identifiable AI-traffic channel, direct will continue to dominate.
- **`www.dhmguide.com` self-referrer (13 PV total)**: internal navigation
  not normalised to `$direct`. Minor; keep in mind when reading totals.
- **`bing.com` vs `www.bing.com` are split in the raw view** (Apr 16-29:
  16+4=20). The bucketed `bing` channel correctly groups them via the
  `%bing.%` LIKE pattern.
- **No unexpected/spammy referrers** in top 10 of either window — no
  link-spam farms, no SEO-tool referrers (Ahrefs, SEMrush bots aren't
  showing up here), no Pinterest/LinkedIn/anywhere else surprising.
- Bot pattern (`Chrome/145.0.0.0` + `800×600` viewport) accounts for **~76%
  of `www.google.com`** referrers prior 14d and **~62%** last 14d. Other
  agents looking at top hostnames in raw data should know this.

---

## 5. What we can say vs what we can't

### ✅ What we CAN say

- **Real-user (bot-stripped) traffic was up +9.7% last 14d vs prior 14d**
  (1,096 vs 999 PV). The headline raw −17% is bot variance, not user
  drop-off.
- **Real google-referrer PV grew from 249 → 319 (+28%, +70 PV absolute)**
  with a positive day-over-day slope of +0.26 PV/day across 28 days. The
  daily floor rose (10 → 16) and ceiling rose (24 → 32). **Direction is
  up; confidence is low** because volume is small and the window is short.
- **Direct traffic is essentially flat** (727 → 739) — the dominant
  channel at ~46% of real-user PV.
- **Zero AI-search referrer pageviews** in either 14d window or the
  30-day view. We are not detectably reaching AI surfaces (or referrers
  are being stripped — collection gap).
- **No unexpected hostnames or new traffic sources** — the top 10 list is
  unsurprising in both windows.
- **The Google SERP-preview bot is a major confounder of `google.*`
  channel reporting**: 952 PV prior 14d, 520 PV last 14d. Anyone reading
  the raw `channel-mix` query without the bot filter will see noise, not
  signal.

### ❌ What we CAN'T say

- **We can't say "the recovery is working."** SEO impact of the work
  shipped this past week (issues #339-#343, mass-edit moratorium, DCNI
  fixes) cannot physically show up in the *last 14d* — Google's recrawl
  and re-evaluation cycle is weeks-to-months. Any uplift visible in
  Apr 16-29 reflects work shipped 4-8+ weeks earlier.
- **We can't characterise the +70 PV move as statistically significant.**
  At σ ≈ 5 PV/day across 14 days, a 5 PV/day shift is roughly within one
  standard error of the mean. Direction is real; magnitude is uncertain.
- **We can't trust the raw channel-mix numbers in `posthog-query.sh`
  output without the bot-filter applied.** The default `channel-mix`
  query reports raw totals, which conflates bot and user traffic in a way
  that inverts the actual user-traffic signal here.
- **We can't compare bing/duckduckgo/social channel deltas** — they are
  all below the 20-PV absolute movement threshold and well within noise.
- **We can't conclude on AI-search engine reach** — `$referrer` is empty
  for many AI surfaces by design; absence of evidence ≠ evidence of
  absence.
- **We can't extrapolate the +0.26 PV/day slope**. 28 days is too few
  data points, especially against a backdrop of bot-day outliers
  contaminating the prior window's user-cohort signal residually.

---

## Methodology notes

- All HogQL queries used the exact regex/`LIKE` patterns from
  `scripts/posthog-query.sh::channel-mix` and `::ai-search` for
  comparability with other internal reports.
- "Bot-stripped" filter matches the `lcp-real` heuristic exactly:
  `properties.$raw_user_agent LIKE '%Chrome/145.0.0.0%' AND
  properties.$screen_width = 800 AND properties.$screen_height = 600
  AND properties.$viewport_width = 1920`.
- Window boundaries are `>= toDateTime('YYYY-MM-DD 00:00:00') AND <
  toDateTime('YYYY-MM-DD 00:00:00')` — half-open, no double-counting.
- Today (2026-04-30) explicitly excluded from all windows.
- Bot-stripped totals reconcile: 999 + 952 = 1,951 (prior); 1,096 + 520 =
  1,616 (last). ✓
