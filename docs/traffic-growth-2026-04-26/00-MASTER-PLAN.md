# DHM Guide Traffic Growth — Master Plan

**Date:** 2026-04-26
**Synthesizer:** Agent S5 (master plan + measurement)
**Source:** Reports 01-10 in this directory + sibling syntheses S1-S4
**Filter:** Code-doable only. No outreach, podcasts, HARO, surveys, paid PR, or expert recruitment.

---

## TL;DR — Executive Summary

### If you do 3 things in the next 7 days

1. **Fix the prerender cloaking pattern** (S1). The off-screen `#prerender-content` div in `scripts/prerender-blog-posts-enhanced.js:319` ships a 100-word stub to Bingbot/AI crawlers while serving full content to Google. This is the single biggest unlock — it gates AI-search growth (T6) and Bing/Copilot indexing. Multi-day fix; nothing else compounds without it.
2. **Wire up newsletter capture** (S1). `DosageCalculatorEnhanced.jsx:747` collects emails into `// TODO`. ConvertKit/Buttondown integration is 4 lines of code. Every day of delay is a leaking bucket of leads.
3. **Add `dateModified` field + display "Updated April 2026" badge on top 5 posts** (S1 + S2). 94% of posts emit `dateModified == datePublished`. To Google, this site is frozen. ~3 hours for top 5 = +540-1,080 PV/mo per Agent 9.

### If you do 5 things in the next 30 days

Items 1-3 above, plus:
4. **Programmatic FAQ + dateModified backfill** (S2). Top 30 posts get FAQ schema, citations, bylines, slug renames (`-2024` → year-agnostic), explicit AI-bot Allow lines in robots.txt. Coverage 5.3% → 25% on FAQ schema.
5. **Internal linking pass** (S3). 122 orphan posts get 2-3 inbound links each from cluster pillars. Auto-populate `relatedPosts` by cluster. +12-18% blog traffic per Agent 4.

### Total expected PV uplift if all 5 phases ship

- **Current baseline:** ~3,600 PV/30d (1.93x prior 30d)
- **6-month target:** 8,000-10,000 PV/30d (2.2-2.8x current)
- **Channel mix at month 6:** <50% Google, 5% AI-search, 3% Reddit, 3% social, 5% referral, 2% newsletter, 25% direct, 7% other-search

The gain is **Google-organic from S2/S4 (~2,300 PV/mo)** + **AI-search from S1's cloaking fix unlock (~340 PV/mo)** + **referral from backlink compounds and content depth (~290 PV/mo)** + **smaller channels filling the rest**. A 60% execution rate still cuts Google share below 55%.

### Single highest-priority next action — Monday morning

**Open `scripts/prerender-blog-posts-enhanced.js` and start removing the `style="position: absolute; left: -9999px"` cloaking pattern at line 319.** Replace with a normally-positioned `<article>` element that contains the full markdown-rendered content. React hydrates over visible HTML. This is what gates everything else — Bingbot, GPTBot, PerplexityBot, ClaudeBot all see ~100 words today. Without this fix, T6 AI-search optimization (the highest-leverage tactic per Agent 10) cannot work.

---

## 5-Phase Execution Roadmap

| Phase | Window | Focus | Owner | Wall-clock | Dev hours | Expected PV uplift (mo 6) |
|---|---|---|---|---|---|---|
| **Phase 1** | Week 1 | P0 critical fires (cloaking, newsletter, dateModified, LCP) | S1 | 5-7 days | 25-35 hrs | Unblocks AI-search (+340 PV/mo) + newsletter floor (+170 PV/mo) |
| **Phase 2** | Week 2-3 | Programmatic SEO batch + internal linking | S2 + S3 | 8-10 days | 30-40 hrs | +800-1,200 PV/mo (FAQ schema, orphan rescue, citations) |
| **Phase 3** | Week 3-4 | Top-5 existing-page expansions/refreshes | S4 | 5 days | 8-12 hrs | +540-1,080 PV/mo (Agent 9 estimate) |
| **Phase 4** | Month 2 | New content (Hangxiety pillar + 5 new posts + 1 expansion) | S4 | 15-20 days | 35-50 hrs | +600-1,200 PV/mo (compounds at month 4-6) |
| **Phase 5** | Ongoing | Quarterly refresh cycle | All | 8-12 hrs/quarter | per quarter | +900-1,800 PV/mo cumulative by Q4 |

**Dependencies:**
- Phase 2 and 3 both depend on Phase 1's prerender fix landing first (otherwise FAQ schema and refreshes are invisible to AI crawlers).
- Phase 4 depends on Phase 2's internal-linking architecture so new content lands in cluster context immediately.
- Phase 5 (refresh) requires `dateModified` field from Phase 1 to function.
- Critical-path is the cloaking fix in Phase 1. **All other work is throttled until that lands.**

---

## Phase 1: P0 Critical Fires (Week 1)

**Owner:** S1 synthesis. See `docs/traffic-growth-2026-04-26/synthesis-S1-*.md` for full detail.

**Scope (4 items):**
1. **Prerender cloaking fix** — replace off-screen `#prerender-content` with full visible article HTML. Affects `scripts/prerender-blog-posts-enhanced.js:319-330`. Multi-day. Requires regen of all 189 prerendered HTMLs.
2. **Newsletter wire-up** — replace TODO at `DosageCalculatorEnhanced.jsx:747` with ConvertKit or Buttondown API call. ~4 lines + 5-email onboarding sequence. Existing exit-intent trigger at line 566 already works.
3. **`dateModified` field** — add to JSON schema; update `scripts/prerender-blog-posts-enhanced.js:138` from `"dateModified": post.date` → `"dateModified": post.dateModified || post.date`; refresh top 20 posts.
4. **LCP investigation** — desktop LCP averaging 22.4s in PostHog (`$web_vitals` last 30d). Filter for bot vs real user; if real, code-split comparison-table component out of `index.js` (currently 121 KB gzipped).

**Wall-clock:** 5-7 days. **Dev hours:** 25-35.
**Direct PV impact:** Modest in mo 1, but unblocks Phase 2/3/4. Newsletter signup floor of 50-200/mo by month 3.

---

## Phase 2: Programmatic SEO Batch (Week 2-3)

**Owner:** S2 (programmatic) + S3 (internal linking). See `synthesis-S2-*.md` and `synthesis-S3-*.md`.

**S2 scope (programmatic):**
- **FAQ schema backfill** — top 30 posts get `faq[]` arrays. Coverage 5.3% → 25%. Each comparison/review post already contains Q&A markdown; just populate the JSON field. ~4 hours scripted.
- **Author byline upgrade** — replace "DHM Guide Team" with "Michael Roberts, MSc Pharmacology" (or named authors) on top 10 traffic JSONs. E-E-A-T signal for YMYL.
- **Inline PubMed citations** — add `[Shen et al. 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3292407/)` to dosage guide + RCT page + science-explained. +30-40% AI citation rate per Princeton GEO data.
- **Slug renames** — `dhm-randomized-controlled-trials-2024` → `dhm-randomized-controlled-trials` (year-agnostic). 301 redirect in `vercel.json`. Update internal links via grep.
- **robots.txt explicit Allow lines** — `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`. Future-proofs against opt-in defaults.
- **Duplicate Article schema removal** — strip the static Article block from `index.html`; let prerender script be sole source.
- **BreadcrumbList JSON-LD** — add to prerender script: `Home > never-hungover > slug`.
- **Generic meta-description audit** — find/replace boilerplate "Expert guide to smart drinking..." text.
- **Sitemap `lastmod` refresh** — generator currently ships stale July 2025 dates. Use `dateModified` from Phase 1.

**S3 scope (internal linking):**
- **Orphan rescue** — 122 posts with ≤2 inbound links get 2-3 inbound from cluster pillars. Auto-populate `relatedPosts` by tag/topic.
- **Cluster formalization** — 6 clusters (Liver Health, Health Impact, DHM Science, Reviews, Hangover Prevention, Asian Flush). Establish pillar/spoke architecture per Agent 4 §4.
- **Hangover Prevention merge** — `functional-medicine-hangover-prevention-2025` (10 in) + `hangover-supplements-complete-guide` (1 in) currently compete. Pick one as master, redirect/cross-link the other.

**Wall-clock:** 8-10 days. **Dev hours:** 30-40.
**Direct PV impact:** +800-1,200 PV/mo by mo 6. FAQ schema unlocks featured snippets; orphan rescue lifts long-tail.

---

## Phase 3: Existing-Page Expansions (Week 3-4)

**Owner:** S4. See `synthesis-S4-*.md`.

**Scope (top-5 refreshes per Agent 9 + 2 striking-distance rewrites per Agent 1):**

1. `/never-hungover/dhm-dosage-guide-2025` (1,168 PV/90d) — add 2024-2026 research, FAQ on GLP-1 interaction, dateModified.
2. `/never-hungover/hangover-supplements-complete-guide-...` (577 PV/90d) — title rewrite to "Best Hangover Prevention Supplements" head term, comparison table top, Product schema, "verdict" first 100w.
3. `/never-hungover/dhm-randomized-controlled-trials-2024` (494 PV/90d) — slug rename + 2024-2026 RCT additions.
4. `/never-hungover/dhm-vs-zbiotics` (236 PV/90d) — 2026 ZBiotics SKU updates, freshness banner.
5. `/never-hungover/when-to-take-dhm-timing-guide-2025` (229 PV/90d) — extended-release section, night-shift segment.
6. **Striking-distance rewrite** `/never-hungover/dhm-science-explained` (12 PV/60d) — expand from ~47 words to 2,500+ words covering mechanism (ADH/ALDH, GABA, antioxidant), Hovenia history, GRAS status. Title rewrite to lead with "What Is DHM?". Internal links: every "dihydromyricetin" mention sitewide should link here.
7. **Striking-distance rewrite** `/never-hungover/flyby-vs-good-morning-pills-...` (79 PV/60d) — verbatim title, comparison table top, Product schema.

**Wall-clock:** 5 days. **Dev hours:** 8-12 (mostly content edits, minimal code).
**Direct PV impact:** +540-1,080 PV/mo per Agent 9 estimate. Compounds within 30-60 days of Google reindex.

---

## Phase 4: New Content (Month 2)

**Owner:** S4. See `synthesis-S4-*.md`.

**Scope:**
1. **Hangxiety pillar** — `hangxiety-complete-guide-2026-supplements-research`, ~6,000-8,000 words, FAQ schema, links to 15-20 existing posts. Cluster-A from Agent 3. Targets ~50K monthly searches with low competition. **Highest single-post traffic ceiling on the site.**
2. **`magnesium-hangover-hangxiety-glycinate-vs-citrate-2026`** — 3,500 words, supports hangxiety pillar.
3. **`what-to-eat-before-drinking-alcohol-evidence-based-guide`** — 4,000 words, direct Healthline competitor. Cluster-B from Agent 3.
4. **`ozempic-glp1-alcohol-hangover-2026-research-guide`** — 3,500 words, zero competition, Yale 2025 study available. Cluster-trend.
5. **Spirits series** — vodka/gin/whiskey/champagne/hard-seltzer (5 posts × 2,500 words). Pattern-replicates existing wine/tequila format. Cluster-C.
6. **Asian Flush hub `/asian-flush`** — top-level route consolidating 3 existing posts into Sunset competitor cluster. Per Agent 2 §3.4.

**Wall-clock:** 15-20 days (publish 1-2 posts/week). **Dev hours:** 35-50.
**Direct PV impact:** +600-1,200 PV/mo by mo 6 (compounds after Google indexes 30-60 days post-publish).

---

## Phase 5: Quarterly Refresh (Ongoing)

**Owner:** Recurring — encode in monthly checklist.

**Cadence (per Agent 9 §6):**
- **Weekly (Mon AM):** Update prices on top 5 review/comparison posts. ~15 min.
- **Monthly:** Top 5 posts get a 30-min refresh: bump `dateModified`, audit 1 paragraph, add 1 new internal link. ~2.5 hrs total.
- **Quarterly:** Top 30 posts: full content audit; price tables; new research citations. 8-12 hrs.
- **Annual (Q4):** Every health post: medical compliance + research review + year update. ~40 hrs.
- **Year transition (Dec 2026 → Jan 2027):** Strip "-2025" from 137 slugs OR rotate to "-2026". Add 301s. ~6 hrs.

**Tooling:** Build `scripts/refresh-post.js` helper (15-min build per Agent 9 §7) that:
- Sets `dateModified` to today
- Inserts/updates "Last reviewed: {Month YYYY}" line in body
- Reports any year mentions in body for manual review

**Cumulative PV impact:** +900-1,800 PV/mo by Q3 2026; +1,200-2,400 PV/mo by Q4. Refresh strategy alone could 1.8-2.6x site traffic in 9 months per Agent 9.

---

## Measurement Infrastructure

### PostHog Dashboard Spec — "Traffic Growth Watchdog"

Single dashboard with 10 tiles. Endpoint: `POST https://us.posthog.com/api/projects/275753/query` with header `Authorization: Bearer $POSTHOG_PERSONAL_API_KEY`. Each query payload format: `{"query": {"kind": "HogQLQuery", "query": "<SQL>"}}`.

#### Tile 1 — Channel mix (last 30d, % per channel)

```sql
SELECT
  multiIf(
    properties.$referring_domain ILIKE '%google.%', 'Google',
    properties.$referring_domain ILIKE '%bing.%' OR properties.$referring_domain ILIKE '%duckduckgo%' OR properties.$referring_domain ILIKE '%brave.com%' OR properties.$referring_domain ILIKE '%yahoo%' OR properties.$referring_domain ILIKE '%ecosia%', 'Other-search',
    properties.$referring_domain ILIKE '%chatgpt%' OR properties.$referring_domain ILIKE '%openai%' OR properties.$referring_domain ILIKE '%perplexity%' OR properties.$referring_domain ILIKE '%claude.ai%' OR properties.$referring_domain ILIKE '%anthropic%' OR properties.$referring_domain ILIKE '%gemini.google%' OR properties.$referring_domain ILIKE '%copilot.microsoft%' OR properties.$referring_domain ILIKE '%bing.com/chat%' OR properties.$referring_domain ILIKE '%you.com%' OR properties.$referring_domain ILIKE '%phind%' OR properties.$referring_domain ILIKE '%poe.com%' OR properties.$referring_domain ILIKE '%deepseek%', 'AI-search',
    properties.$referring_domain ILIKE '%reddit%', 'Reddit',
    properties.$referring_domain ILIKE '%facebook%' OR properties.$referring_domain ILIKE '%instagram%' OR properties.$referring_domain ILIKE '%twitter%' OR properties.$referring_domain ILIKE '%x.com%' OR properties.$referring_domain ILIKE '%linkedin%' OR properties.$referring_domain ILIKE '%tiktok%' OR properties.$referring_domain ILIKE '%youtube%', 'Social',
    properties.$referring_domain = '' OR properties.$referring_domain IS NULL OR properties.$referring_domain ILIKE '%dhmguide%', 'Direct',
    'Referral'
  ) AS channel,
  count() AS pv,
  round(count() * 100.0 / sum(count()) OVER (), 2) AS pct
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY channel
ORDER BY pv DESC
```

#### Tile 2 — Daily PV trend (last 90d)

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  count() AS pv
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 90 DAY
GROUP BY day
ORDER BY day
```

#### Tile 3 — Affiliate clicks per channel

```sql
SELECT
  multiIf(
    properties.$referring_domain ILIKE '%google.%', 'Google',
    properties.$referring_domain ILIKE '%chatgpt%' OR properties.$referring_domain ILIKE '%perplexity%' OR properties.$referring_domain ILIKE '%claude.ai%' OR properties.$referring_domain ILIKE '%gemini.google%' OR properties.$referring_domain ILIKE '%copilot%', 'AI-search',
    properties.$referring_domain ILIKE '%reddit%', 'Reddit',
    properties.$referring_domain = '' OR properties.$referring_domain IS NULL, 'Direct',
    'Other'
  ) AS channel,
  count() AS clicks
FROM events
WHERE event = 'affiliate_link_click'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY channel
ORDER BY clicks DESC
```

#### Tile 4 — AI-search referrer count (weekly)

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  multiIf(
    properties.$referring_domain ILIKE '%chatgpt%' OR properties.$referring_domain ILIKE '%openai%', 'ChatGPT',
    properties.$referring_domain ILIKE '%perplexity%', 'Perplexity',
    properties.$referring_domain ILIKE '%claude.ai%' OR properties.$referring_domain ILIKE '%anthropic%', 'Claude',
    properties.$referring_domain ILIKE '%gemini.google%', 'Gemini',
    properties.$referring_domain ILIKE '%copilot%' OR properties.$referring_domain ILIKE '%bing.com/chat%', 'Copilot',
    'Other-AI'
  ) AS engine,
  count() AS visits
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 90 DAY
  AND (
    properties.$referring_domain ILIKE '%chatgpt%' OR properties.$referring_domain ILIKE '%openai%'
    OR properties.$referring_domain ILIKE '%perplexity%'
    OR properties.$referring_domain ILIKE '%claude.ai%' OR properties.$referring_domain ILIKE '%anthropic%'
    OR properties.$referring_domain ILIKE '%gemini.google%'
    OR properties.$referring_domain ILIKE '%copilot%' OR properties.$referring_domain ILIKE '%bing.com/chat%'
    OR properties.$referring_domain ILIKE '%you.com%' OR properties.$referring_domain ILIKE '%phind%' OR properties.$referring_domain ILIKE '%poe.com%' OR properties.$referring_domain ILIKE '%deepseek%'
  )
GROUP BY week, engine
ORDER BY week
```

#### Tile 5 — Top 20 pages by PV (last 30d)

```sql
SELECT
  properties.$pathname AS path,
  count() AS pv
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY path
ORDER BY pv DESC
LIMIT 20
```

#### Tile 6 — Top 20 pages by affiliate CTR (last 30d)

```sql
SELECT
  pv.path AS path,
  pv.pageviews AS pageviews,
  coalesce(ac.clicks, 0) AS affiliate_clicks,
  round(coalesce(ac.clicks, 0) * 100.0 / pv.pageviews, 2) AS ctr_pct
FROM
  (SELECT properties.$pathname AS path, count() AS pageviews
   FROM events
   WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
   GROUP BY path
   HAVING pageviews >= 20) AS pv
LEFT JOIN
  (SELECT properties.$pathname AS path, count() AS clicks
   FROM events
   WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY
   GROUP BY path) AS ac
ON pv.path = ac.path
ORDER BY ctr_pct DESC
LIMIT 20
```

#### Tile 7 — `time_on_page_milestone` daily volume (regression watchdog)

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  count() AS milestones
FROM events
WHERE event = 'time_on_page_milestone'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day
```

A sudden drop here means tracking broke. Watch for spikes in the wrong direction.

#### Tile 8 — `$exception` count (regression watchdog)

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  count() AS exceptions,
  count(DISTINCT properties.$exception_type) AS unique_types
FROM events
WHERE event = '$exception'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day
```

#### Tile 9 — Newsletter signup count (after Phase 1 wire-up)

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  count() AS signups,
  count(DISTINCT properties.source) AS unique_sources
FROM events
WHERE event = 'email_capture'
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day
```

Note: event name `email_capture` per `src/utils/engagement-tracker.js:169` `trackEmailCapture(source)`. Currently always returns 0 — Phase 1 wire-up flips this on.

#### Tile 10 — Mobile vs Desktop CR per page (last 30d)

```sql
SELECT
  pv.path AS path,
  pv.device AS device,
  pv.pageviews AS pageviews,
  coalesce(ac.clicks, 0) AS affiliate_clicks,
  round(coalesce(ac.clicks, 0) * 100.0 / pv.pageviews, 2) AS ctr_pct
FROM
  (SELECT
     properties.$pathname AS path,
     properties.$device_type AS device,
     count() AS pageviews
   FROM events
   WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
   GROUP BY path, device
   HAVING pageviews >= 20) AS pv
LEFT JOIN
  (SELECT
     properties.$pathname AS path,
     properties.$device_type AS device,
     count() AS clicks
   FROM events
   WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY
   GROUP BY path, device) AS ac
ON pv.path = ac.path AND pv.device = ac.device
ORDER BY pageviews DESC
LIMIT 40
```

### Setup script

Save the dashboard JSON via PostHog UI. Or, for headless setup, encode each query as a stored Insight via:

```bash
curl -s -X POST "https://us.posthog.com/api/projects/275753/query" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": {"kind": "HogQLQuery", "query": "<SQL>"}}'
```

Use the existing pattern from `scripts/posthog-query.sh`.

### UTM Enforcement

**State:** PR #280 shipped `scripts/utm-tag.sh`. 30-day adoption: 4 tagged pageviews. Convention exists, nobody uses it.

**Recommendation:** Skip enforcement code. The links are shared off-platform (X, LinkedIn, podcast show notes, guest-post bios). No git/code-side hook can catch them.

**What to do instead — three lightweight items:**

1. **Add a README block in the repo** (suggest patching `scripts/utm-tag.sh` header comment to be a one-screen checklist):
   ```
   USE utm-tag.sh ANY TIME you share a dhmguide.com link OUTSIDE of the website itself.
   - Tweeting it? Tag it.
   - Pasting it in a Reddit comment? Tag it.
   - Showing in a YouTube description? Tag it.
   - Pasting in an email reply, podcast show notes, guest-post bio? Tag it.
   - Adding to social bio? Tag it.
   ```

2. **Pre-commit hook idea (light-touch reminder)** — when commit message contains "share", "post", "newsletter", "tweet", or any newly-shared URL pattern (`https://www\.dhmguide\.com/[^?]+$` without `utm_source`), print a one-line reminder. Don't block. The friction-to-value ratio of blocking is bad.

3. **Weekly UTM check (Friday morning)** — saved PostHog query that flags untagged non-search non-direct referrers. The query (already specified in `docs/posthog-analysis-2026-04-25/r10-utm-standard.md`):
   ```sql
   SELECT
     properties.utm_source AS source,
     properties.utm_medium AS medium,
     count() AS sessions
   FROM events
   WHERE event = '$pageview'
     AND properties.utm_source IS NOT NULL
     AND timestamp > now() - INTERVAL 30 DAY
   GROUP BY source, medium
   ORDER BY sessions DESC
   ```

   If `untagged > 95%` of "non-search non-direct" referrals, send a reminder.

**Skip:** No enforcement code possible. Document the workflow + watch the metric. That's it.

### KPIs and Targets — 6-Month

| KPI | Today | Mo 3 target | Mo 6 target | Tracking |
|---|---|---|---|---|
| Total PV / month | 3,613 | 5,000 | **8,000-10,000** | Tile 2 |
| Google share | 58% | <55% | **<50%** | Tile 1 |
| AI-search share | <0.1% | 3% | **5%** | Tiles 1, 4 |
| Reddit share | 0% | 1.5% | **3%** | Tile 1 |
| Social share | 0.06% | 1% | **3%** | Tile 1 |
| Referral share | 0.4% | 2% | **5%** | Tile 1 |
| Newsletter share | 0% | 1% | **2%** | Tiles 1, 9 |
| Affiliate clicks / month | 56 | 120 | **200+** | Tile 3 |
| Newsletter list size | 0 | 500 | **2,000** | Tile 9 |
| FAQ schema coverage | 5.3% (10/189) | 25% (47/189) | **50% (95/189)** | Manual audit |
| `dateModified` coverage | 3.8% | 50% | **95%+** | Manual audit |
| Orphan posts (≤2 inbound) | 122 (65%) | 80 (42%) | **<40 (21%)** | Manual audit |

**Track weekly (Friday morning):**
1. **Channel mix delta** (Tile 1) — flag if Google moves >5pp WoW
2. **AI-search visits/week** (Tile 4) — should grow monotonically post-Phase 1
3. **Newsletter signups/day** (Tile 9) — should be >0 after Phase 1; track 7-day rolling

---

## Risk Mitigation

### "What if Google drops 30% next month?" — Rollback Playbook

Save as `scripts/google-decline-rollback.md` (1-page checklist, no code):

```
# Google Decline Rollback Playbook

## Trigger condition
Tile 1 (channel mix) shows Google share drop >25% WoW for 3 consecutive days,
OR Tile 2 (daily PV) drops >30% from prior 14d baseline.

## Day 0 — confirm
- [ ] Check Google Search Console: impressions vs clicks. Is it CTR (SERP layout
      change) or impressions (algo)?
- [ ] Check `$exception` events in PostHog (Tile 8) — did a deploy break
      something tracked-side?
- [ ] Run `curl -I https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025`
      and confirm 200 + correct title/canonical/meta-description in the
      prerendered HTML.
- [ ] Run `curl https://www.dhmguide.com/sitemap.xml` and verify 197 URLs,
      correct lastmod dates.
- [ ] Run `curl https://www.dhmguide.com/robots.txt` and verify Allow rules
      for AI bots.

## Day 1-3 — diagnose
- [ ] Run Tile 5 (top 20 pages) and compare to last 30d snapshot. Is it
      sitewide or topic-cluster?
- [ ] Check if the recent Phase 1/2/3 deploys correlate. If yes, identify
      the change and prepare a revert.
- [ ] Check sibling sites (cheers, flyby, zbiotics) via SimilarWeb / manual
      SERP — did it hit competitors equally? If yes, it's an algo update
      affecting the whole niche.

## Day 3-7 — react
- [ ] If page-level: pause that specific URL from sitemap, audit, redeploy.
- [ ] If site-wide algo update with E-E-A-T signal: deploy the pre-staged
      "freshness sweep" PR (author bios on top 20 + last-updated dates on
      top 50). Should sit as draft in repo permanently.
- [ ] If most-recent change correlates: revert that change.

## Week 2-4 — accelerate diversification
- [ ] T6 AI-search content goes 3x: rewrite next 30 pages to GEO format.
- [ ] T5 backlink push goes 2x: prioritize backlink work and brand mentions.
- [ ] Newsletter outreach push to grow list (highest-converting algo-proof
      channel).

## Pre-staged rollback artifacts (build these in advance)
1. Open draft PR: "Freshness sweep — author bios + last-updated dates"
2. Open draft PR: "GEO format for next 30 pages"
3. Saved HogQL query at `scripts/posthog-rollback-check.sh`
```

### Direct-Affiliate Switch (Second Revenue Source)

**SKIP for code.** This is a business decision (researching brand affiliate programs, contacting partners, comparing terms). Not code-doable.

**Note for record:** Per Agent 10 §6.2, switching top 3 reviewed-brand links from Amazon-only to brand-direct gives 3-10x commission per click for those products. ~30 min of work per partner negotiated, but the negotiation itself is human/business work.

---

## Appendix — Source Reports

| # | Report | Synthesizer takeaway |
|---|---|---|
| 01 | Striking-distance keywords | 7 priority pages identified; top 5 = 540-1,080 PV/mo if rewritten |
| 02 | Competitor SERP | Healthline + Cleveland Clinic E-E-A-T; ZBiotics mechanism-explainer cluster |
| 03 | Content gaps | Hangxiety pillar = #1 gap (340% growth, no authoritative competitor) |
| 04 | Internal linking | 122 orphans, 7 hubs; cluster formalization = +12-18% blog traffic |
| 05 | Backlinks | Out of code-doable scope (outreach/HARO/podcasts) |
| 06 | AI search | T6 highest-leverage tactic; cloaking fix unblocks Bing/Copilot/Claude |
| 07 | Social/community | Mostly out of scope (Reddit, YT need humans); newsletter wire-up critical |
| 08 | Technical SEO | Cloaking pattern is P0; LCP 22s desktop needs investigation |
| 09 | Content freshness | 94% of posts have no `dateModified`; top-5 refresh = 540-1,080 PV/mo |
| 10 | Diversification | T6 + T2 + T5 = 80% of effort; channel mix targets above |

---

**End of Master Plan.**
