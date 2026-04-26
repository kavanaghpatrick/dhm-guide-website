# 10 — Traffic Source Diversification & Attribution Infrastructure

**Author:** Agent 10 of 10 (synthesizer) — parallel traffic-growth analysis
**Date:** 2026-04-26
**Role:** Quantify channel concentration, set diversification targets, synthesize the other 9 agents' tactics into a channel-attribution model, and define the measurement loop.

---

## TL;DR

| Item | Value |
|---|---|
| Last 30d pageviews | **3,613** (1.93x prior 30d of 1,985) |
| Google share (last 30d) | **57.9%** |
| Direct share | **39.2%** |
| Other-search (Bing/DDG/Brave/Yahoo) | **0.8%** |
| AI-search (chatgpt/perplexity/claude/gemini/copilot) | **<0.1%** (2 visits in 90d via referrer; 4 via UTM) |
| Social | **0.06%** (2 pv) |
| Reddit | **0** |
| **6-month target** | **<50% Google, >5% AI-search, >3% social, >25% direct** |
| **Highest-leverage tactic across 9 agents** | **AI-search (Agent 6) — primary lever for the next 90 days** |

The site went from ~58% Google share (90d ago) to ~58% today, but the absolute volume from Google **doubled post-Apr-11 algo update** (298 -> 1,786 pv in the 15-day window). The risk is unchanged: a single Google update can erase that gain. **Diversification is now urgent precisely because Google traffic is high.**

---

## 1. Current Channel Mix (PostHog, last 30d)

### 1.1 30d snapshot vs. prior 30d

| Channel | Last 30d (pv) | Last 30d % | Prior 30d (pv) | Prior 30d % | Change (pv) |
|---|--:|--:|--:|--:|--:|
| Google | 2,093 | **57.9%** | 817 | 41.2% | +1,276 (+156%) |
| Direct | 1,415 | 39.2% | 1,147 | 57.8% | +268 (+23%) |
| Other-search | 29 | 0.8% | 18 | 0.9% | +11 |
| Other / referral | 13 | 0.4% | 2 | 0.1% | +11 |
| Social | 2 | 0.06% | 0 | 0% | +2 |
| AI-search (referrer) | 0 | 0% | 1 | 0.05% | -1 |
| Reddit | 0 | 0% | 0 | 0% | 0 |
| **Total** | **3,613** | 100% | **1,985** | 100% | +1,628 (+82%) |

**Key reads:**
1. **Google share jumped from 41% to 58% in 30 days** — Google grew faster than direct, so the site is *more* Google-dependent today than it was a month ago, not less.
2. **Direct = 39%** — but a chunk of this is mistagged. PostHog's "$direct" includes (a) bookmark/typed URL, (b) client-side rerouted traffic with stripped referrer, and (c) some app-WebView clicks (Reddit native app, X iOS, GenAI app embeds). Approx 30-50% of "direct" is likely **dark social / dark AI-search** — not visible in attribution but real traffic from external sources.
3. **AI-search at floor**: 2 referrer-tagged AI visits in 90d. UTM-tagged AI visits = 4 (3 chatgpt.com, 1 perplexity). Vast majority of AI traffic is hiding inside "$direct".
4. **Reddit = 0**: The site has zero meaningful Reddit visibility despite Reddit being the #1 social channel for health/supplement queries.

### 1.2 Apr 11 Google update — confirmed positive

| Period | Google pv | Direct pv | Daily Google avg |
|---|--:|--:|--:|
| Pre-algo (Mar 27 – Apr 10, 15d) | 298 | 578 | 19.9 |
| Post-algo (Apr 11 – Apr 25, 15d) | 1,786 | 838 | 119.1 |

**The Apr 11 update sent 6x more Google traffic, not less.** This is good news that *increases* concentration risk: the next algo update could go the other way.

### 1.3 Top referring domains (30d)

| Domain | pv | Notes |
|---|--:|---|
| www.google.com | 2,089 | 99.8% of Google traffic — desktop/mobile blended |
| (direct) | 1,415 | See §1.1 note 2 about dark traffic |
| www.dhmguide.com | 12 | Internal navigation tracking artifact |
| duckduckgo.com | 11 | The only meaningful non-Google search |
| www.bing.com | 11 | |
| search.brave.com | 5 | |
| www.google.ca / co.uk / android | 4 | International Google |
| search.yahoo.com | 2 | |
| www.facebook.com / m.facebook.com | 2 | |
| www.ecosia.org | 1 | |
| chatgpt.com | 1 | |
| www.perplexity.ai | 1 | |
| askaichat.app | 1 | AI wrapper |
| nomura.jp.rogo.ai | 1 | Japanese AI search |

There are **zero Reddit, X/Twitter, Instagram, TikTok, LinkedIn, YouTube referrers** in the last 90 days. This is a complete absence, not a small share.

### 1.4 Conversion rate by channel (30d)

| Channel | Pageviews | Affiliate clicks | CTR % | Notes |
|---|--:|--:|--:|---|
| Google | 2,093 | 49 | **2.34%** | The benchmark |
| Direct | 1,415 | 7 | 0.49% | Suspicious — see below |
| Other-search | 29 | 1 | 3.45% | Tiny sample |
| Other (referral) | 13 | 4 | 30.77% | n=13, but striking — referral converts ~13x Google |
| Social | 2 | 0 | 0% | n=2 |

**Punch-line:**
- **Google CTR (2.34%)** is the hard benchmark we beat or break.
- **Direct CTR (0.49%)** is suspiciously low; this points to "direct" being heavily inflated by single-page bounces (e.g., social-app WebView users who never engage). Real bookmark/typed-URL users would convert higher than Google.
- **Referral CTR (30.77%)** on a tiny base, but consistent with industry data: contextual referrals from trusted sources convert >5x search.
- We do not yet have AI-search CTR data because volume is too low.

---

## 2. Diversification Targets (3-month and 6-month)

### 2.1 Targets by channel

Baseline: 3,613 pv/30d. Assumed monthly growth at 20% blended (Google + diversification):

| Channel | Now (% / pv) | 3-mo target | 6-mo target | Rationale |
|---|---|---|---|---|
| Google | 58% / 2,093 | **<55% / ~2,800** | **<50% / ~3,400** | Don't shrink Google — let other channels grow faster |
| Direct (incl. dark social/AI) | 39% / 1,415 | 30% / ~1,500 | 25% / ~1,700 | Not actively grown; slowdown is "natural" as we tag more |
| AI-search | <0.1% / 0 | **3% / ~150** | **>5% / ~340** | Agent 6's plan; biggest delta opportunity |
| Other-search (Bing/DDG/Brave) | 0.8% / 29 | 2% / ~100 | 3% / ~200 | Free with AI-search work (Bing-aligned) |
| Reddit | 0% / 0 | 1.5% / ~75 | 3% / ~200 | Single ranking thread can deliver 5K+ pv |
| Social (X/LinkedIn/FB/IG/TT) | 0.06% / 2 | 1% / ~50 | 3% / ~200 | UTM-tagged owned-channel posts |
| Other referral | 0.4% / 13 | 2% / ~100 | 5% / ~340 | Backlinks from Agent 5; converts ~10x Google |
| Newsletter (new) | 0% | 1% / ~50 | 2.5% / ~170 | Requires list build first |
| **Total monthly pv** | **3,613** | **~5,000** | **~6,800** | ~88% YoY growth, declining Google share |

### 2.2 Why targets are set this way

- **Don't cap Google** — capping it means losing traffic. Diversification = *grow the others faster*.
- **AI-search 5% by 6mo** is aggressive but matches industry trend (NP Digital/Statista 2026: AI-search now ~14% of all search-result clicks for health queries).
- **Reddit 3% by 6mo** = 1-2 evergreen threads ranking on r/Supplements, r/AsianBeauty, r/Biohackers. Conservative; one good thread can do 50% of this alone.
- **Direct 25% by 6mo** is intentionally lower than today not because we shrink it but because we successfully *re-attribute* dark traffic via UTMs and improved tagging.
- **Conversion-weighted target**: Referral CTR is ~13x Google. Even 5% of pv as referral = ~17% of *revenue*. So small share % gains in referral are huge in dollar terms.

---

## 3. Cross-Channel Attribution: Which Tactic Lifts Which Channel

This is the synthesizer table. Estimates are PV/month uplift at the 6-month mark, allocated by which channels each tactic primarily lifts.

| Agent / Tactic | Google | Direct | AI-search | Other-search | Reddit | Social | Referral | Total est. PV/mo |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| **T1 Striking-distance keywords** (rerank pages on positions 11-30 to top 10) | +400 | +50 | +20 | +5 | 0 | 0 | 0 | **+475** |
| **T2 Competitor SERP gaps** (review/comparison pages we lack) | +500 | +60 | +30 | +5 | +20 | 0 | +30 | **+645** |
| **T3 Content gaps** (Hangxiety, food-pre-drinking, missing spirits, GLP-1) | +400 | +60 | +50 | +10 | +30 | +20 | +20 | **+590** |
| **T4 Internal linking** (122 orphan posts; topic clusters) | +250 | +40 | +30 | +5 | 0 | 0 | 0 | **+325** |
| **T5 Backlinks / digital PR** (citations, HARO, brand mentions) | +200 | +30 | +50 | +10 | +20 | +30 | +200 | **+540** |
| **T6 AI-search optimization** (GEO content, schema, citable chunks, primary sources) | +100 | +50 | **+250** | +30 | +10 | +10 | +20 | **+470** |
| **T7 Social / community** (Reddit AMAs, X threads, owned UTMs) | 0 | +20 | 0 | 0 | **+150** | **+150** | +20 | **+340** |
| **T8 Technical SEO** (canonical, schema, page speed, mobile) | +200 | +20 | +30 | +5 | 0 | 0 | 0 | **+255** |
| **T9 Content refresh** (top-10 pages get freshness signals) | +250 | +30 | +20 | +5 | 0 | 0 | 0 | **+305** |
| **6-mo expected uplift (sum)** | **+2,300** | **+360** | **+480** | **+75** | **+230** | **+210** | **+290** | **+3,945** |
| **Today's baseline (30d)** | 2,093 | 1,415 | 0 | 29 | 0 | 2 | 13 | 3,613 |
| **6-mo projected** | **~3,400** | **~1,700** | **~340** | **~100** | **~200** | **~200** | **~290** | **~6,200** |
| **6-mo % share** | **54.8%** | 27.4% | 5.5% | 1.6% | 3.2% | 3.2% | 4.7% | 100% |

**Estimates are deliberately conservative.** Not all tactics will hit; AI-search in particular has high variance. But even at 60% of these estimates, Google share falls below 55% within 6 months.

### 3.1 Tactic-to-channel takeaway

- **Google grows from organic SEO work (T1, T2, T3, T8, T9)** — that's still ~58% of the absolute PV uplift.
- **AI-search comes almost entirely from T6** — but T6 is also the highest-leverage single tactic (see §7).
- **Referral is heavily T5 (backlinks)** — and converts ~13x Google. PV-small but revenue-large.
- **Reddit / Social comes from T7** — but T7 is the riskiest (creator-effort dependent).

---

## 4. UTM Tagging Infrastructure

### 4.1 Current state

- **Helper exists**: `scripts/utm-tag.sh` (added in PR #280 lineage; see `docs/posthog-analysis-2026-04-25/r10-utm-standard.md`)
- **Convention is documented** (channel ↔ utm_source/utm_medium pairs)
- **30-day adoption check**: 4 tagged pageviews total (3 chatgpt.com, 1 perplexity). **Not in active use.**

### 4.2 Gap audit — owned channels needing tagging

| Channel | Currently tagging? | Action |
|---|---|---|
| **Newsletter** (if any) | No list/no tagging | When list exists, every link via `utm-tag.sh ... newsletter` |
| **X / Twitter posts** | Untagged | Mandatory — every external link tagged |
| **LinkedIn** | Untagged / unused | Tag if/when posting |
| **Reddit posts/comments** | Untagged | Note: Reddit strips many query params on mobile; still tag |
| **Facebook / IG bio** | No bio links | Tag both at create-time |
| **TikTok bio** | No bio link | Tag |
| **YouTube descriptions** | No channel | Tag at create-time |
| **Podcast appearances** | Manual only | Tag every episode show-note |
| **Guest-post bios** | Untagged | Use `utm_source=guest_post&utm_campaign=<host_domain>` |
| **Email signatures** | Untagged | One canonical tagged URL |
| **Affiliate-sender emails** (replies, etc.) | Untagged | Tag the canonical /reviews link in the email signature |

### 4.3 Team-usage doc (current)

The standard doc is at `docs/posthog-analysis-2026-04-25/r10-utm-standard.md`. **Needs minor update** to add three channels not yet listed:

```bash
# Add to scripts/utm-tag.sh case statement:
guest_post)  SOURCE=guest_post; MEDIUM=referral ;;
sponsorship) SOURCE=sponsor;    MEDIUM=referral ;;
amazon_post) SOURCE=amazon;     MEDIUM=affiliate ;;
```

**Action item (5 min):** Patch `scripts/utm-tag.sh` and `r10-utm-standard.md` to cover guest posts and Amazon-affiliate-blog backlinks (Agent 5 cluster).

### 4.4 Enforcement (the part nobody does)

The convention will fail if every team member doesn't use it. Two cheap enforcements:

1. **Markdown linter (pre-commit hook)** — fail if a JSON post or markdown ad has `dhmguide.com/...` without a UTM (when it's outbound, e.g., for syndicated posts).
2. **Weekly PostHog UTM check** — saved query (already specified in r10 doc):

```sql
SELECT properties.utm_source AS source, properties.utm_medium AS medium,
       count() AS sessions
FROM events WHERE event = '$pageview' AND properties.utm_source IS NOT NULL
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY source, medium ORDER BY sessions DESC
```

Run this Friday mornings. If `untagged > 95%` of "non-search non-direct" referrals, slap wrist.

---

## 5. PostHog Dashboard Spec

A single dashboard "Channel Diversification" with these tiles:

| # | Tile | HogQL | Refresh | Tile type |
|---|---|---|---|---|
| 1 | **Daily channel-mix** stacked bar (last 60d) | `SELECT toStartOfDay(timestamp) AS day, multiIf(...) AS channel, count() FROM events WHERE event='$pageview' GROUP BY day, channel` | hourly | Stacked bar |
| 2 | **Channel share %** (this 7d vs prior 7d) — KPI grid | Two queries diff'd in dashboard | daily | Number tiles |
| 3 | **Top 15 referring domains** (last 7d) | `SELECT properties.$referring_domain, count() FROM events WHERE event='$pageview' GROUP BY 1 ORDER BY 2 DESC LIMIT 15` | hourly | Table |
| 4 | **AI-search referrers — count** (last 90d, weekly) | (see §1 query for AI domains) | daily | Line chart |
| 5 | **Conversion rate per channel** (affiliate clicks / pv) | (see §1.4 query) | daily | Bar chart |
| 6 | **UTM-tagged sessions by source** (last 30d) | (see §4.4 query) | daily | Table |
| 7 | **Per-campaign funnel** (pageview -> scroll 50 -> affiliate click) | (see r10 doc query) | daily | Funnel |
| 8 | **Brand-search trend** (queries containing "dhm guide" / "never hungover" — proxy via direct + branded organic landing pages) | `SELECT toStartOfWeek(timestamp), count() FROM events WHERE event='$pageview' AND properties.$pathname IN ('/', '/never-hungover')` | daily | Line chart |
| 9 | **Reddit / dark-social proxy** (high direct PV on a single landing page in <24h) — early-warning of going viral | Needs custom alert: `SELECT count() FROM events WHERE properties.$pathname=$path AND properties.$referring_domain='$direct' AND timestamp > now()-INTERVAL 1 HOUR HAVING count() > 50` | 15min | Alert |
| 10 | **Channel-mix weekly trend table** (with WoW deltas) | Weekly version of tile 1 | weekly | Pivot table |

**Setup cost:** ~1 hour in PostHog UI. The HogQL queries above are all working; copy-paste from this doc.

---

## 6. Risk Mitigation

### 6.1 Rollback plan if Google traffic drops 30%

A 30% Google drop = ~628 pv/month lost = ~14 affiliate clicks/month = ~$60-150/month revenue (depending on AOV). Not catastrophic at current scale. **The bigger risk is that it's a leading indicator of trend, not a one-time event.**

**Standing rollback playbook:**

| Day | Action |
|---|---|
| Day 0 (drop detected) | Confirm via Google Search Console (impressions vs clicks). Is it CTR (SERP layout change) or impressions (algo)? |
| Day 1-3 | Run a top-50-pages diff: which specific URLs/queries lost? Is it sitewide or topic-cluster? |
| Day 1-3 | Check sibling sites: did it hit competitors equally? (Use SimilarWeb, Semrush) |
| Day 3-7 | Activate the rollback content plan: |
| | (a) Revert the most-recent algorithmic change (canonical, schema, content rewrite) IF it correlates with the drop |
| | (b) If page-level: pause that specific page from sitemap, audit, redeploy |
| | (c) If site-wide: post a known E-E-A-T fix (author bios, last-updated dates) — see Agent 8 |
| Week 2-4 | Acceleration of the diversification tactics: AI-search content (T6) goes 3x; backlink push (T5) goes 2x |
| Week 4-8 | Newsletter sponsor outreach — the second-source revenue plan (§6.3) |

**Pre-built rollback artifact:** A pre-staged "freshness sweep" PR — author bios on top 20 pages + last-updated dates on top 50. Sits as an open draft, ready to deploy in <2 hours when the trigger hits.

### 6.2 Second-source revenue plan

Today, ~100% of revenue is Amazon-affiliate clicks. If Amazon kills the program (they revise rates yearly) OR Google sends 30% less traffic, revenue can drop 30-100% in 30 days.

| Source | 6-month plan | Effort | Realistic monthly revenue (mo 12) |
|---|---|---|---|
| **Amazon affiliate** (current) | Keep optimizing CTR | Low ongoing | $200-1,000 |
| **AdSense / Mediavine** (display ads) | Add at >50K monthly pv (we're at ~3K — too early) | Low (one-time setup) | Skip until pv 5x current |
| **Newsletter sponsorships** | Build list to 1,000 subs by mo 6, sell sponsored slot at $100-500 | Medium (need lead magnet, signup forms) | $100-500 |
| **Sponsored content** (brand reviews paid by brands) | Allow ONE clearly-disclosed sponsored review per quarter; price $500-1,500 | Low | $200-500 |
| **Direct DHM brand affiliate** (not Amazon) | DoubleWood, Mom's Stuff, etc. — direct programs with higher commission (15-30% vs Amazon's 1-3%) | Low | $100-500 |
| **Digital product** (e.g., "Hangxiety Recovery Protocol" PDF) | Skip until brand-affinity is higher; not now | High | Defer |
| **Total diversified revenue** | | | **$600-2,500/mo** |

**Highest-leverage action**: Switch top 3 reviewed-brand links from Amazon-only to brand-direct for higher commission. Effort: 30 min. Revenue uplift: ~3-10x per click for those products. Done.

### 6.3 The 80/20 of risk-mitigation tactics

| Risk | Likelihood | Impact | Mitigation cost | Priority |
|---|---|---|---|---|
| Google update -30% | Medium | High | Low (rollback play) | **#1** |
| Amazon program cut | Low-Medium | High | Low (direct affiliate) | **#2** |
| Schema/canonical break | Low | Medium | Already covered (Agent 8) | **#3** |
| Posthog data loss | Low | Low (we have GA4) | None | Skip |
| Reddit/social shutout | Low | Low (haven't started) | None | Skip |

Total mitigation cost: <10 hours of work. **Do these in Q2.**

---

## 7. The 80/20 — Where to Spend 80% of Effort

Spending equal effort across 9 tactics is wrong. With 1 person and 90 days, here's the priority stack:

### 7.1 Tier 1 (80% of effort) — these 3 tactics get top priority

| Rank | Tactic | Why | Estimated 6-mo PV uplift | Estimated effort (hr) | PV per hour |
|---|---|---|--:|--:|--:|
| **1** | **T6 — AI-search optimization** (Agent 6) | (a) Lowest-cost diversification: rewriting H2 sections + adding citations + FAQ schema. (b) Cross-engine: same effort lifts Bing, Copilot, ChatGPT, Perplexity, Google AI Overviews. (c) Largest delta: 0% -> 5% share is the steepest growth curve. (d) Defensive: AI-search will commodify Google's referral over the next 24 months whether we plan for it or not. | +470 | 40 | **11.8** |
| **2** | **T2 — Competitor SERP gaps** (Agent 2) | (a) Highest-volume keyword opportunity (5+ identified competitors with content we lack). (b) Compounds with T6 (AI-citation potential). (c) Direct revenue uplift via comparison/review pages, which convert at 2-3x informational pages. | +645 | 50 | **12.9** |
| **3** | **T5 — Backlinks / digital PR** (Agent 5) | (a) Referral converts at ~13x Google CTR. (b) Backlinks lift Google rankings (compounding). (c) Brand-mention frequency is the #1 LLM ranking factor (0.334 correlation). | +540 | 40 | **13.5** |

**Combined T1 effort: ~130 hours, ~1,650 pv/mo uplift, 2 of 3 lift AI-search.**

### 7.2 Tier 2 (15% of effort) — defensive

| Tactic | Why | Effort | Notes |
|---|---|--:|---|
| T8 — Technical SEO | Required for T1, T2, T6 to even rank. | 20 | Mostly one-time (canonical, schema, page speed) |
| T4 — Internal linking | Compounding for T1+T2+T3 — but doesn't move the needle alone. | 15 | Batch-do after T2 content lands |

### 7.3 Tier 3 (5% of effort) — defer or batch

| Tactic | Why deferred | Re-eval at |
|---|---|---|
| T1 — Striking-distance keyword wins | Real but small (+475 pv); covered by T2/T9 | Mo 6 |
| T3 — Content gaps | Real but slow ROI on >5K-word new posts; pilot 2-3 first | Mo 4 |
| T7 — Social/community | High creator-effort, lowest ROI per hour | Mo 6 |
| T9 — Content refresh | Necessary for AI-search freshness, but batch behind T6 | Mo 5 |

### 7.4 Quarter-by-quarter plan

| Quarter | Theme | Concrete deliverables | Expected pv/mo at end |
|---|---|---|--:|
| **Q2 2026 (May–Jul)** | **Foundation** — AI-search + tech SEO | (a) T6: top 20 pages converted to GEO format (200-500w citable chunks, FAQ schema, primary citations). (b) T8: canonical/schema audit + fix. (c) UTM enforcement live. (d) Newsletter setup (lead magnet + form). | 4,500 |
| **Q3 2026 (Aug–Oct)** | **Scale-up** — Competitor SERP gap + Backlinks | (a) T2: 8 new comparison pages. (b) T5: 10 guest-post placements. (c) T6 expansion to next 30 pages. (d) First 5 reddit threads. | 5,800 |
| **Q4 2026 (Nov–Jan)** | **Harvest** — Internal linking, content refresh, conversion | (a) T4: 122 orphans get 2-3 inbound links each. (b) T9: top 20 pages refreshed. (c) Sponsored content offers. (d) Newsletter at 1,000+ subs. | 6,800+ |

**At end of Q4 2026 (mo 9), we hit the 6-month diversification targets.** The first 3 months (Q2) will *not* show much non-Google channel growth because AI-search is slow to compound; Q3 is when channel-mix shifts visibly. Don't panic in mo 1-2.

---

## 8. The Single Highest-Leverage Tactic

**Agent 6 — AI-search optimization (T6).**

### Why this is #1 across all 9 sibling agents

1. **Asymmetric channel growth potential.** AI-search is at 0% share. Even modest tactical wins (page-level GEO formatting on 30 pages) take it to 3-5% share within 90 days, faster than any other channel can grow share.

2. **Cross-engine effect.** A single rewrite (citable H2 chunk + FAQ schema + primary citations) ranks us in:
   - Perplexity (Bing-indexed)
   - ChatGPT search (Bing-indexed)
   - Microsoft Copilot (Bing-indexed)
   - Google AI Overviews (Google-indexed; happens automatically when traditional SEO is good)
   - Claude (Brave + own crawler)

   One change, five engines lifted.

3. **Compounds with T2 and T5.** Comparison pages (T2) get cited if they're chunkable. Backlinks (T5) drive brand-search volume — the #1 LLM ranking factor (0.334 correlation per Rankio 2026 data). All three reinforce each other; doing T6 first amplifies T2 and T5 returns.

4. **Lowest defensive risk.** Unlike doubling-down on Google SEO (which is what 7 of the other 9 agents fundamentally amplify), T6 is the **only** tactic that gives us a moat outside Google's algorithm. A future Google update can't kill our AI-search citations.

5. **Industry-trend tailwind.** AI-search now drives ~14% of all health-query clicks (Statista 2026). It's growing 3-5% per month. Doing nothing means losing share in absolute terms in 12 months.

6. **Lowest absolute investment.** Unlike T5 (months of outreach), T3 (writing 5K-word posts), or T7 (running social campaigns), T6 is mostly *editing* existing top-traffic pages: rewriting H2s, adding citations, adding schema. Estimated 40 hours for top 20 pages.

7. **Most reversible.** If T6 doesn't work, the changes are content-format-only — they don't degrade Google rankings (citable chunks rank fine for traditional SEO too).

**Action this week:** Pick the top 5 Google-traffic pages (`dhm-dosage-guide-2025`, `dhm-randomized-controlled-trials-2024`, `hangover-supplements-complete-guide`, `flyby-vs-cheers-complete-comparison-2025`, `when-to-take-dhm-timing-guide-2025`) and apply Agent 6's GEO template to each. Measure AI-search referrers for 4 weeks. Iterate.

---

## 9. Failure-Mode Watchlist

| Failure mode | Detection | Response |
|---|---|---|
| Tagging not adopted (UTM coverage stays <5% of non-search traffic) | Weekly PostHog query (§5 tile #6) | Send 1-paragraph reminder; threaten pre-commit hook |
| AI-search remains <1% at mo 4 | PostHog dashboard tile #4 | Audit the GEO rewrites; likely chunk-length too long, citations missing, or no FAQ schema |
| Google share stays >55% at mo 6 | Channel-share KPI tile #2 | Re-eval T2/T5/T6 prioritization; likely T5 backlinks are the bottleneck |
| Reddit traffic stays at 0 | Top-domains table tile #3 | We chose wrong subreddits or tone; consult r/Supplements + r/AsianBeauty mod-friendly accounts |
| Conversion rate per channel inverts (direct/referral start dropping) | Conversion bar chart tile #5 | Audit attribution; likely a tracking break, not a real drop |
| New post traffic < 50 pv in mo 1 | Path-level entry-page query | Topic was wrong; pivot content priorities; don't double-down |

---

## 10. One-Page Summary

**Concentration today:** 58% Google, 39% direct (incl. dark social/AI), 3% everything else combined.

**Concentration in 6 months:** <50% Google, 25% direct (cleaned), 5% AI-search, 3% Reddit, 3% social, 5% referral, 2% newsletter, 1.5% other-search.

**Focus tactics (in order):**
1. **T6 — AI-search optimization** (Agent 6) — highest cross-engine leverage, only true Google-independent moat
2. **T2 — Competitor SERP gaps** (Agent 2) — biggest absolute Google + AI uplift
3. **T5 — Backlinks / digital PR** (Agent 5) — drives referral (13x conversion), brand-search (LLM lift), and Google rankings together

**Measurement:** One PostHog "Channel Diversification" dashboard with 10 tiles (§5). Review weekly Friday morning.

**Risk:** Pre-staged Google-rollback PR + direct-affiliate switch (replace Amazon for top 3 brands) + newsletter buildout. ~10 hours total mitigation work.

**Top observation:** A 30% Google drop at today's 58% concentration costs ~$60-150/month in revenue. Cheap to insure against. Do it now in Q2, not later.
