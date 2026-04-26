# 06 — AI Search Optimization (GEO / LLMo)

**Author:** Agent 6 of 10 (parallel traffic-growth analysis)
**Date:** 2026-04-26
**Focus:** Getting cited by ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot
**Baseline:** ~3 visits/30d from AI-search referrers (PostHog). Target: 100+ visits/30d in 90 days.

---

## 1. Current state — where are we cited?

I ran four Perplexity-style queries through web search to mirror what an AI engine would surface. The retrieval set is the same one each engine ranks against (Bing/Google + crawl).

| Query | dhmguide.com cited? | Top sources actually cited |
|---|---|---|
| `what is the best dhm supplement` | YES — `/reviews` and `/compare` rank in top 7 | betterresultsbook, jackedgorilla, nodayswasted.co, doublewoodsupplements, neuroganhealth, **dhmguide /reviews**, **dhmguide /compare**, zacalife |
| `how does dhm prevent hangovers mechanism` | NO | capsulyte, drinkhydrant, naturalfieldinc, stanfordchem, **PMC3292407 (PubMed)**, survivorlife, drinkwel, jellyiv, today.usc.edu, flyby.co |
| `dhm vs zbiotics 2026` | YES — `/never-hungover/dhm-vs-zbiotics` is #1 | **dhmguide /never-hungover/dhm-vs-zbiotics**, enjoyupside (×4), time.com, enjoyslo, borealdiary |
| `dhm dosage for hangover prevention` | YES — `/never-hungover/dhm-dosage-guide-2025` is #3 | drinkwel, **PMC3292407 (PubMed)**, **dhmguide /dhm-dosage-guide-2025**, capsulyte, survivorlife, enjoyupside, neuroganhealth, survivorlife, whyz.com, **NIH LiverTox** |

### Key takeaways from current state
1. **We rank where we have a directly-targeted page** (`/reviews`, `/compare`, `/dhm-vs-zbiotics`, `/dhm-dosage-guide-2025`). When the page exists, we get cited.
2. **We don't rank on mechanism queries** ("how does DHM work"). Perplexity prefers PMC primary sources, USC press releases, and competitors with deeper pharmacology content. Our `dhm-science-explained` page is not in the retrieval set.
3. **Authority sources dominating**: `pmc.ncbi.nlm.nih.gov` (PMC3292407 — Shen et al. 2012, the seminal DHM paper) and `today.usc.edu` (USC press release on Liang lab work). LLMs heavily up-weight these.
4. **Competitor blogs are stealing mid-funnel queries**: capsulyte, enjoyupside, drinkwel, jellyiv, flyby.co — they all out-cite us on "how does DHM work" because they front-load mechanistic answers.

---

## 2. How each AI engine sources content (ranked by referral potential for us)

| Engine | Index source | What it weights | Our priority |
|---|---|---|---|
| **Perplexity** | Bing + own crawler (PerplexityBot) | Citations explicit. Loves: PubMed, primary research, ranked listicles, comparison tables, recent dates | **#1** — highest fit; we already get cited |
| **ChatGPT search (web mode)** | Bing-powered + GPTBot crawl | Concise factual answers, schema, FAQ | **#2** — large and growing; same prefs as Perplexity |
| **Google AI Overviews / Gemini** | Google index | Featured-snippet style; explicit Q&A; visible "updated" dates; FAQ schema | **#3** — biggest potential volume but slower to win |
| **Microsoft Copilot** | Bing index | Same as ChatGPT search; even more weight on schema | **#4** — Bing alignment = free with #2 |
| **Claude (web search)** | Brave + own retrieval (ClaudeBot, Claude-SearchBot) | Authoritative editorial, recent dates, primary citations | **#5** — small share but rising |

**Practical implication:** optimizing for Bing + structured-data quality covers #1, #2, #4 simultaneously. Google AI Overviews comes for free if our regular Google SEO is strong (Agent 1's territory). Claude is a rounding bonus.

---

## 3. What GEO-optimized content looks like (with primary sources)

Princeton's GEO study (Aggarwal et al. 2024) and the 2025 follow-up research from independent firms (Ekamoira, Rankio, Kopp Online) converge on the same factors. **The two strongest signals are LLM readability and chunk relevance** — i.e., can a 200-500 word block stand alone as a citable unit?

### Concrete page-level patterns that boost citation rate (with measured uplifts)

| Pattern | Reported uplift | Source |
|---|---|---|
| Inline statistics + numerical data | **+22% AI visibility** | Princeton GEO study via gen-optima.com |
| Direct quotations from authorities | **+37% AI visibility** | Princeton GEO study |
| Citations to primary research (with links) | **+30-40% combined** | Princeton GEO study |
| Self-contained 200-500 word answer chunks | "Most influential factor" | Kopp Online Marketing 2025 |
| Brand-name search volume (off-page) | **0.334 correlation** (single biggest predictor) | Rankio LLM ranking factors 2026 |
| Content updated every 7-14 days | Citation decay starts at ~14 days | Averi.ai GEO Playbook 2026 |
| FAQPage / HowTo schema | High — directly extractable Q&A | All sources agree |
| Author bio with credentials (E-E-A-T) | High for health content | Heavily weighted in YMYL (Your Money Your Life) topics |

### The "ideal AI-citable section" template

```
## H2: [Question phrased exactly as a user would ask]

[Direct one-sentence answer, <30 words, opens with a noun phrase
that includes the keyword. Numerical answer if applicable.]

[2nd sentence: cite source. e.g., "per Shen et al. 2012 (PMC3292407)"]

[Optional 3rd sentence: nuance/caveat]

[Followed by a small table or 3-5 bullet list with numerical data]
```

Every H2 in a high-traffic post should follow this skeleton. The reason: each H2 becomes a "chunk" in the retrieval index, and self-contained chunks get cited more often than narrative-heavy ones.

---

## 4. DHM Guide AI-readiness audit

### What's already strong
- **189 blog posts** — large surface area for retrieval
- **`/reviews` and `/compare` already get cited** by Perplexity (proven retrieval signal)
- **Article schema, FAQPage schema, HowTo schema, Review schema** all auto-injected via `scripts/prerender-blog-posts-enhanced.js` (lines 128-257)
- **`/dhm-vs-zbiotics`** has author byline "Michael Roberts, MSc Pharmacology" — proper E-E-A-T signal
- **WebSite Organization schema** in `index.html` lines 105-231
- **`robots.txt` allows all crawlers** including PerplexityBot, GPTBot, ClaudeBot (no Disallow rules for AI bots) — confirmed at `/Users/patrickkavanagh/dhm-guide-website/public/robots.txt`

### Gaps (in priority order)

| # | Gap | Evidence | Fix difficulty |
|---|---|---|---|
| 1 | **Top traffic page (`/dhm-dosage-guide-2025`) has weak author signal** — byline is "DHM Guide Team", no credentials, no bio | `dhm-dosage-guide-2025.json` line 7 | LOW — JSON edit |
| 2 | **No PubMed inline citations on dosage guide** — references "Korean study, 2012", "UCLA research, 2014", "Chinese trials, 2018" but NO links to PMC | dosage guide content | LOW — markdown edit, ~30 mins |
| 3 | **Only 10/189 posts have FAQ data** in JSON (`grep -l '"faq"'` returns 10) | Codebase grep | MEDIUM — content backfill |
| 4 | **Only 14/189 posts mention PubMed/ncbi.nlm** at all | Codebase grep | MEDIUM — content backfill |
| 5 | **No `dateModified` field in JSON files** (`grep "lastModified\|dateModified"` returns 0 in dosage guide JSON; prerender uses `post.date` for both `datePublished` and `dateModified` — they're identical, line 138 of prerender script) | `prerender-blog-posts-enhanced.js:138` | LOW — add field |
| 6 | **No `/llms.txt` file** | `find ... llms.txt` returns 0 | TRIVIAL — but symbolic only (no major engine reads it as of April 2026 per ppc.land/aeoengine.ai audits) |
| 7 | **No "Quick Answer" box at top of `/dhm-vs-zbiotics`** (the dosage guide has one — good template) | WebFetch test | LOW |
| 8 | **Mechanism content (`/dhm-science-explained`) doesn't surface in Perplexity tests** | Query test #2 above | MEDIUM — content rewrite + structured data |
| 9 | **No author entity page** (no `/about/authors/michael-roberts` with `Person` schema linked sameAs to a real LinkedIn) | Site audit | MEDIUM |
| 10 | **`Organization.sameAs` array is empty** in `index.html` line 224 — no external entity links | `index.html:224` | TRIVIAL |

---

## 5. Specific actions — ranked by ROI

### Tier A: 30-day quick wins (likely to lift AI citation within a month)

| Action | File / Place | Time | Expected impact |
|---|---|---|---|
| **A1.** Replace "DHM Guide Team" with credentialed author on top 10 traffic pages (use existing "Michael Roberts, MSc Pharmacology" pattern from `dhm-vs-zbiotics`) | 10 JSON files in `src/newblog/data/posts/` | 30 min | +E-E-A-T signal that LLMs heavily weight for YMYL health content |
| **A2.** Add inline PubMed links to existing study references on `dhm-dosage-guide-2025` (Shen et al. 2012 → PMC3292407, plus 5-10 more) | `src/newblog/data/posts/dhm-dosage-guide-2025.json` content body | 1 hour | +30-40% citation rate per Princeton GEO data |
| **A3.** Add `dateModified` field separate from `date` to JSON schema, refresh top 20 posts to current month, update `prerender-blog-posts-enhanced.js:138` to use it | Schema + script + 20 JSON files | 1 hour | Recency signal — citation decay starts at ~14 days unrefreshed |
| **A4.** Add "Quick Answer" TL;DR box (like the one on `dhm-dosage-guide-2025`) to top 10 traffic pages | 10 JSON content fields | 1.5 hours | Front-loaded definitive answers = chunk-extractable |
| **A5.** Populate `Organization.sameAs` in `index.html:224` with LinkedIn, X, GitHub, Crunchbase, Wikipedia (if any) | `index.html` | 15 min | Cross-platform presence is the 2nd strongest LLM citation predictor (Rankio) |
| **A6.** Backfill `faq` array in JSON for top 30 traffic posts (only 10/189 have it today) | 20 JSON files | 4 hours | Each FAQ becomes a directly-cited Q&A chunk |
| **A7.** Add an author entity page `/about/authors/michael-roberts` with `Person` schema, credentials, link to all his posts | New route + 1 page | 2 hours | Consolidates author authority across entire site |

**Tier A total: ~10 hours, likely 5-10x AI referral within 60 days.**

### Tier B: 60-90 day plays

- **B1. Rewrite `/dhm-science-explained` to be the canonical mechanism-of-action page** that beats capsulyte/drinkhydrant on the "how does DHM work" query. Front-load: ADH/ALDH enzyme upregulation, GABA-A receptor modulation, lipid peroxidation reduction. Cite Shen 2012, Liang 2014 (UCLA), Zhang 2003 inline. Target 2,500-3,500 words structured as one Q&A chunk per H2.
- **B2. Add `MedicalEntity` schema** (Schema.org subtype) to mechanism / dosage / safety pages — health-content-specific signal that AI engines weight heavily for medical YMYL queries.
- **B3. Add an internal "research hub" page** (e.g., `/research`) that lists every DHM study with PMC links and 2-sentence summaries. This is exactly the kind of "data source" page LLMs cite.
- **B4. Submit sitemap to Bing Webmaster Tools** + Brave Search (https://search.brave.com/help/webmaster-tools). Yandex is a tiny bonus. Bing IndexNow is free; submit URLs as you publish.
- **B5. Publish original data** — e.g., "We surveyed 1,000 DHM users about their dosage and effectiveness. Here are the results." Original data is biased to be cited by LLMs because it's not in their training set (Averi.ai 2026 GEO playbook).

### Tier C: low priority / skip

- **`/llms.txt` file** — symbolic only as of April 2026 (per aeoengine.ai 2026 audit, ppc.land "adoption stalls"). No major engine reads it. Add it for completeness if 5 minutes; do not budget time for it.
- **Block AI training crawlers** (GPTBot, ClaudeBot for training) — DON'T do this. We WANT them in the corpus. Our `robots.txt` is correct already.

---

## 6. Submission / pinging tactics

| Tactic | Engine fed | Effort | Worth doing? |
|---|---|---|---|
| Bing Webmaster Tools — submit sitemap + URL submission (`https://www.bing.com/webmasters`) | ChatGPT search, Copilot, partly Perplexity (Bing-fed) | 30 min one-time | YES |
| IndexNow protocol (Bing) — auto-ping on publish | Bing index → ChatGPT/Copilot | 1 hour to integrate | YES if publishing weekly |
| Brave Search Webmaster Tools | Claude (Brave-fed) | 30 min | YES |
| Yandex Webmaster | Minor | 30 min | OPTIONAL |
| Google Search Console (already done) | Gemini / AI Overviews | n/a | Already done |
| Confirm robots.txt allows: `PerplexityBot`, `GPTBot`, `ClaudeBot`, `Claude-SearchBot`, `OAI-SearchBot`, `Google-Extended` | All | already done | Verified at `/public/robots.txt` — `User-agent: *` + `Allow: /` covers all |

---

## 7. Measurement — track AI referrers in PostHog

### HogQL query (drop into PostHog → SQL Insights)

```sql
SELECT
  CASE
    WHEN properties.$referring_domain ILIKE '%chatgpt.com%' THEN 'ChatGPT'
    WHEN properties.$referring_domain ILIKE '%openai.com%' THEN 'ChatGPT'
    WHEN properties.$referring_domain ILIKE '%perplexity.ai%' THEN 'Perplexity'
    WHEN properties.$referring_domain ILIKE '%claude.ai%' THEN 'Claude'
    WHEN properties.$referring_domain ILIKE '%anthropic.com%' THEN 'Claude'
    WHEN properties.$referring_domain ILIKE '%gemini.google.com%' THEN 'Gemini'
    WHEN properties.$referring_domain ILIKE '%bard.google.com%' THEN 'Gemini'
    WHEN properties.$referring_domain ILIKE '%copilot.microsoft.com%' THEN 'Copilot'
    WHEN properties.$referring_domain ILIKE '%bing.com/chat%' THEN 'Copilot'
    WHEN properties.$referring_domain ILIKE '%duckduckgo.com%' AND properties.$referrer ILIKE '%/aichat%' THEN 'DuckDuckGo AI'
    WHEN properties.$referring_domain ILIKE '%you.com%' THEN 'You.com'
    WHEN properties.$referring_domain ILIKE '%phind.com%' THEN 'Phind'
    WHEN properties.$referring_domain ILIKE '%kagi.com%' THEN 'Kagi'
    WHEN properties.$referring_domain ILIKE '%poe.com%' THEN 'Poe'
    WHEN properties.$referring_domain ILIKE '%deepseek.com%' THEN 'DeepSeek'
    WHEN properties.$referring_domain ILIKE '%grok.x.ai%' THEN 'Grok'
    WHEN properties.$referring_domain ILIKE '%x.com%' AND properties.$referrer ILIKE '%/i/grok%' THEN 'Grok'
    ELSE 'Other'
  END AS ai_engine,
  count() AS visits,
  count(DISTINCT person_id) AS users,
  count(DISTINCT properties.$pathname) AS unique_landing_pages
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 DAY
  AND (
    properties.$referring_domain ILIKE '%chatgpt.com%'
    OR properties.$referring_domain ILIKE '%perplexity.ai%'
    OR properties.$referring_domain ILIKE '%claude.ai%'
    OR properties.$referring_domain ILIKE '%anthropic.com%'
    OR properties.$referring_domain ILIKE '%gemini.google.com%'
    OR properties.$referring_domain ILIKE '%copilot.microsoft.com%'
    OR properties.$referring_domain ILIKE '%bing.com/chat%'
    OR properties.$referring_domain ILIKE '%you.com%'
    OR properties.$referring_domain ILIKE '%phind.com%'
    OR properties.$referring_domain ILIKE '%poe.com%'
    OR properties.$referring_domain ILIKE '%deepseek.com%'
  )
GROUP BY ai_engine
ORDER BY visits DESC
```

### Companion query — top landing pages from AI engines (find what's already working)

```sql
SELECT
  properties.$pathname AS path,
  properties.$referring_domain AS engine,
  count() AS visits
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 DAY
  AND (
    properties.$referring_domain ILIKE '%perplexity.ai%'
    OR properties.$referring_domain ILIKE '%chatgpt.com%'
    OR properties.$referring_domain ILIKE '%claude.ai%'
    OR properties.$referring_domain ILIKE '%gemini.google.com%'
    OR properties.$referring_domain ILIKE '%copilot.microsoft.com%'
  )
GROUP BY path, engine
ORDER BY visits DESC
LIMIT 50
```

### Targets

- **Baseline (today):** ~3 visits / 30d
- **30-day target (post-Tier A):** 25 visits / 30d (8x lift; expect early signal from author + PubMed + Quick Answer)
- **60-day target:** 60 visits / 30d (20x)
- **90-day target:** 100+ visits / 30d (33x — matches "AI search is fastest-growing diversification channel")

Add a PostHog **dashboard tile** with the first query above, segmented by week, to watch trajectory.

---

## 8. The single quick-win recommendation

**Page: `/never-hungover/dhm-dosage-guide-2025`** (top traffic page; already cited by Perplexity #3 on dosage queries; already has Quick Answer + FAQ schema + HowTo schema in place).

### Why this page
1. Already getting some AI citation — has retrieval-signal already.
2. Sits on "how much DHM should I take" — query that LLMs serve heavily because it's a literal numerical question.
3. JSON edit only. No code changes. No deploy risk beyond content.

### Three changes, ~90 minutes total

| # | Change | What it unlocks |
|---|---|---|
| 1 | Replace `"author": "DHM Guide Team"` → `"author": "Michael Roberts, MSc Pharmacology"` in `dhm-dosage-guide-2025.json:7`. Add author bio paragraph at the top of body content. | E-E-A-T signal for YMYL health content. Matches what `/dhm-vs-zbiotics` already does. |
| 2 | Replace generic "Korean study, 2012", "UCLA research, 2014", "Chinese trials, 2018" with **inline PubMed links** (e.g., `[Shen et al. 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3292407/)`) in the dosage guide content body. Add 5-8 inline citations. | Citations are the strongest GEO uplift (+30-40% per Princeton). Aligns us with how PMC pages already get cited by Perplexity. |
| 3 | Add `"dateModified": "2026-04-26"` to the JSON, and update `scripts/prerender-blog-posts-enhanced.js:138` from `"dateModified": post.date` → `"dateModified": post.dateModified \|\| post.date`. Visibly display "Last updated April 2026" in the post header. | Recency signal — engines decay citations after ~14 days unupdated. |

**Expected result:** within 30 days, this page should appear in 2-3 more Perplexity queries (currently appears in 1) and start showing in ChatGPT search and Copilot for dosage queries. Should drive measurable lift in PostHog AI-referrer dashboard.

---

## 9. Sources

- Princeton GEO study (Aggarwal et al. 2024): citation/quote/stats uplift data — referenced via gen-optima.com/blog/generative-engine-optimization-best-practices/
- Rankio "12 LLM Ranking Factors" 2026 — brand search volume 0.334 correlation: rankio.studio/learn/llm-ranking-factors/
- Averi.ai GEO Playbook 2026 — citation decay timing: averi.ai/blog/the-geo-playbook-2026
- Kopp Online Marketing 2025 — chunk relevance / LLM readability research
- Ekamoira 2026 — LLM citation pipeline mechanics: ekamoira.com/blog/ai-citations-llm-sources
- AEO Engine 2026 audit — llms.txt non-adoption: aeoengine.ai/blog/llms-txt-zero-usage-ai-bots-ignore
- ppc.land — llms.txt adoption stalls
- Anthropic ClaudeBot framework — almcorp.com/blog/anthropic-claude-bots-robots-txt-strategy
- Shen et al. 2012 (foundational DHM paper): PMC3292407 — already cited by Perplexity in our test queries
- USC press release on Liang DHM/liver work: today.usc.edu/hangover-remedy-dhm-liver-protection-usc-study
