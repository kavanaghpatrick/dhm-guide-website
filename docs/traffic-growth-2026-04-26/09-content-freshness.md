# Content Freshness, Refresh Strategy & Historical Optimization

**Agent 9 of 10** | Date: 2026-04-26 | Source: 186 posts in `src/newblog/data/posts/*.json`, PostHog 90d pageviews, slug + date analysis

---

## TL;DR

- **186 posts, 100% dated 2025**, no `dateModified` on 96% of posts. To Google, this site is frozen in time.
- **137 posts have `-2025` in slug** — a ticking time-bomb of staleness. None reflect 2026.
- **Top 5 posts = 47.7% of traffic.** Top 30 = 81.7%. Refresh effort is wildly concentrated.
- **53 posts have <5 PV / 90 days** — site-wide quality drag from ~28% of inventory.
- **Critical schema gap**: `Article.dateModified` falls back to `datePublished`. Crawlers see no recent updates anywhere.

**Estimated 60-day uplift from refreshing top 5 posts**: +540 to +1,080 PV/month (industry refresh patterns: 20-40%). Effort: ~4 hours total.

---

## 1. Site-Wide Freshness Audit

### 1.1 Age distribution (by post `date` field, today=2026-04-26)

| Bucket | Count | % of inventory |
|---|---|---|
| <6 months old | 1 | 0.5% |
| 6-12 months old | 160 | 86% |
| 1-2 years old | 25 | 13.4% |
| 2+ years old | 0 | 0% |
| Total dated | 186 | |
| **Posts with NO `date` field** | **3** | bug — see §1.5 |

### 1.2 By calendar year of `date`

| Year | Count |
|---|---|
| 2025 | 186 (100%) |
| 2024 | 0 |
| 2026 | 0 |

Every post is dated 2025. There is no signal of recency anywhere on the site.

### 1.3 `dateModified` coverage

| State | Count | % |
|---|---|---|
| Has `dateModified` field | 7 | 3.8% |
| Has `lastModified` / `modifiedDate` | 4 | 2.2% |
| **No modification date at all** | **175** | **94%** |

The schema generator (`src/utils/blogSchemaEnhancer.js:174`) does:
```js
dateModified: metadata.lastModified || metadata.date
```
So 94% of posts emit `dateModified == datePublished` in JSON-LD. Google sees these as never having been updated.

### 1.4 Slug-dated post inventory (the biggest staleness liability)

| Slug pattern | Count | Problem |
|---|---|---|
| `*-2024` | 1 | already stale URL (one of top-3 traffic posts!) |
| `*-2025` | 137 | will become stale by Q3 2026 |
| `*-2026` | 0 | nothing on the site is "current year" |

A search for "best DHM 2026" or "DHM dosage 2026" today returns content stamped 2025. Competitors who rotate yearly will outrank.

### 1.5 Bugs found during audit

Three posts are missing the `date` field entirely (will use unreliable fallbacks):
- `double-wood-vs-good-morning-hangover-pills-comparison-2025.json`
- `pilots-and-alcohol-safety-aviation-health-monitoring-guide-2025.json`
- `precision-nutrition-alcohol-metabolism-genetic-diet-guide-2025.json`

File these as a separate fix-up issue (5-min fix, JSON edit).

---

## 2. Top Traffic Posts: The Power Law

### 2.1 Cumulative traffic concentration (90-day PostHog data)

| Top N posts | Cumulative PV | % of total |
|---|---|---|
| 1 | 1,168 | 20.6% |
| 5 | 2,704 | **47.7%** |
| 10 | 3,510 | 61.9% |
| 30 | 4,628 | 81.7% |
| 100 | 5,375 | 94.8% |
| 186 (all) | 5,668 | 100% |

**Refresh ROI is extreme**: 5 posts deliver half of all traffic. The "long tail" 100+ posts contribute ~5%.

### 2.2 Top 15 by Refresh ROI = Pageviews × Staleness Score

Staleness score = months_old + slug_year_penalty + title_year_penalty + no_modified_penalty.

| ROI | 90d PV | Stale | Slug | Refresh status |
|---|---|---|---|---|
| 18,844 | 1,168 | 16.1 | `dhm-dosage-guide-2025` | top priority |
| 10,213 | 577 | 17.7 | `hangover-supplements-complete-guide-what-actually-works-2025` | priority |
| 8,925 | 494 | 18.1 | `dhm-randomized-controlled-trials-2024` | URL says 2024! |
| 4,649 | 236 | 19.7 | `dhm-vs-zbiotics` | priority |
| 4,137 | 229 | 18.1 | `when-to-take-dhm-timing-guide-2025` | priority |
| 3,522 | 196 | 18.0 | `flyby-vs-cheers-complete-comparison-2025` | yearly cycle |
| 3,168 | 179 | 17.7 | `nac-vs-dhm-which-antioxidant-better-liver-protection-2025` | yearly cycle |
| 2,474 | 178 | 13.9 | `complete-guide-asian-flush-comprehensive` | non-year, easier |
| 2,474 | 114 | 21.7 | `can-you-take-dhm-every-day-long-term-guide-2025` | yearly cycle |
| 2,331 | 129 | 18.1 | `dhm1000-review-2025` | yearly cycle |
| 1,992 | 124 | 16.1 | `flyby-recovery-review-2025` | yearly cycle |
| 1,897 | 105 | 18.1 | `good-morning-hangover-pills-review-2025` | yearly cycle |
| 1,419 | 79 | 18.0 | `flyby-vs-good-morning-pills-complete-comparison-2025` | yearly cycle |
| 1,363 | 77 | 17.7 | `dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025` | yearly cycle |
| 1,200 | 52 | 23.1 | `peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025` | low-priority |

---

## 3. Top 5 Refresh Templates (specific tasks)

Per-post: 30-60 min. Expected uplift: 20-40% within 60-90 days (Google E-E-A-T refresh signal for YMYL health content).

### #1 `dhm-dosage-guide-2025` (1,168 PV/90d)

**Why now:** #1 traffic post. 0 mentions of 2024 or 2026 in body. Reads as 2025-locked.

**Tasks (45 min):**
- Add `"dateModified": "2026-04-26"` to JSON
- Top of body, add: `**Last reviewed: April 2026** | Updated for current research | ~10 min read`
- Insert paragraph after intro: "As of April 2026, ongoing research from [add 1-2 papers from PubMed 2024-2026 search 'dihydromyricetin'] continues to validate dosage guidance below..."
- Update FAQ section: add 1-2 newer questions (e.g., "Is DHM safe with GLP-1 weight loss drugs?" — high search interest 2026)
- Bump dose recommendations to reflect any new third-party tested products from 2026
- Keep slug. Don't rename to `-2026` (zero-cost stability beats year rotation for evergreen URLs — see §6)

**Expected uplift**: +234 PV/month (20%) to +467 PV/month (40%).

### #2 `hangover-supplements-complete-guide-what-actually-works-2025` (577 PV/90d)

**Why now:** Round-up post. Currently labeled "**Last Updated:** January 2025" in the body — visible to users AND Google. Critical to refresh.

**Tasks (60 min):**
- Add `"dateModified": "2026-04-26"` to JSON
- Replace "**Last Updated:** January 2025" → "**Last Updated:** April 2026"
- Update the "$2.8 billion industry" stat with newer market figure (search 2026 hangover-supplement market reports)
- Audit each of the 20 supplements: have any been discontinued? Re-formulated? New entrants in 2025-2026?
- Add 2-3 newer brands released in 2025-2026 (Cheers Restore variants, ZBiotics line extensions, etc.)
- Update Amazon prices in any tables (use `scripts/posthog-query.sh` workflow to identify which products have affiliate clicks → highest priority to refresh)
- Update title H1 from "[2025]" → "[2026]"
- Title meta: optionally swap year if mobile SERPs show "2025" in title — but consider a year-agnostic title for permanence

**Expected uplift**: +115 PV/month (20%) to +231 PV/month (40%).

### #3 `dhm-randomized-controlled-trials-2024` (494 PV/90d) — HIGHEST URGENCY

**Why now:** **Slug literally says `-2024`**. Title already says "2026" but URL says 2024. URL/Title mismatch is bizarre to Google. Body has 13 mentions of "2024" and 0 mentions of "2026".

**Tasks (60 min) — most complex of the 5:**
- Decision: **rename slug** `dhm-randomized-controlled-trials-2024` → `dhm-randomized-controlled-trials` (no year, evergreen) OR `-2026`. Recommendation: **drop the year**.
- Add 301 redirect in `vercel.json`: `/never-hungover/dhm-randomized-controlled-trials-2024` → `/never-hungover/dhm-randomized-controlled-trials`
- Update internal links pointing to old slug (search `grep -rn "dhm-randomized-controlled-trials-2024" src/`)
- Add `"dateModified": "2026-04-26"`
- Body: search PubMed for DHM/dihydromyricetin RCTs published 2024-2026. Add 1-2 newest studies. Currently the 2024 Foods journal study is the "newest" — verify if any 2025-2026 RCTs exist.
- Insert a "Most Recent Research" section with 2025-2026 citations
- Update intro: "A groundbreaking 2024 clinical trial..." → "Recent 2024-2026 clinical trials..."

**Expected uplift**: +99 PV/month (20%) to +198 PV/month (40%) + redirect captures any inbound links.

### #4 `dhm-vs-zbiotics` (236 PV/90d)

**Why now:** Title says "DHM vs ZBiotics 2025" but slug is year-agnostic (good). Body has 0 mentions of 2024 or 2026.

**Tasks (30 min):**
- Add `"dateModified": "2026-04-26"`
- Update title: "DHM vs ZBiotics 2026" (or remove year for evergreen)
- Add 2026 ZBiotics product line update (have they released new SKUs? Pre-Alcohol Probiotic v2?)
- Update price comparison table — both products' Amazon prices have moved
- Add freshness banner at top: "Updated April 2026 with current pricing and 2025-2026 research"
- Add "What's new in 2026" callout in intro

**Expected uplift**: +47 PV/month (20%) to +94 PV/month (40%).

### #5 `when-to-take-dhm-timing-guide-2025` (229 PV/90d)

**Why now:** Title and slug both year-stamped. Pure-evergreen content (timing protocols don't change), so refresh = pure schema/wording win.

**Tasks (30 min):**
- Add `"dateModified": "2026-04-26"`
- Title: "When to Take DHM: Before vs After Drinking [2026 Updated Guide]" — or strip year
- Add "Last reviewed April 2026" badge in body
- Add 1 new section: "Timing with extended-release DHM formulations (2025-2026 trend)"
- Add a personalized timing callout for night-shift workers / international travelers (newer audience segment)

**Expected uplift**: +46 PV/month (20%) to +92 PV/month (40%).

### Aggregate top-5 refresh

| Post | Min uplift (PV/mo) | Max uplift (PV/mo) |
|---|---|---|
| dhm-dosage-guide-2025 | +234 | +467 |
| hangover-supplements-complete-guide | +115 | +231 |
| dhm-randomized-controlled-trials-2024 | +99 | +198 |
| dhm-vs-zbiotics | +47 | +94 |
| when-to-take-dhm-timing-guide-2025 | +46 | +92 |
| **Total** | **+541** | **+1,082** |

**~3.5 hours of work for +540 to +1,080 PV/month.**

---

## 4. Consolidation Opportunity (1 high-confidence merge)

### Liver detox cluster — merge 3 posts → 1

| Post | 90d PV | Status |
|---|---|---|
| `nac-vs-dhm-which-antioxidant-better-liver-protection-2025` | 179 | KEEP — primary |
| `longevity-biohacking-dhm-liver-protection` | 9 | merge in |
| `best-liver-detox-science-based-methods-vs-marketing-myths-2025` | 8 | merge in |
| `advanced-liver-detox-science-vs-marketing-myths-2025` | 4 | merge in or delete (near-duplicate of "best-") |

**Action:** Combine the 3 low-traffic posts' unique sections into the NAC vs DHM post (now the canonical "Liver Health & DHM" pillar). 301 redirect 3 posts → primary. Currently only 4-9 PV/post — Google likely sees these as low-quality cannibalization. Combined post becomes a stronger 2,500-word pillar with clear pillar/spoke architecture.

**Expected uplift**: 21 PV/mo → 50-80 PV/mo on consolidated URL (cluster authority effect).

### Other clusters worth lighter consolidation
- **Asian flush** (3 posts, 178 + 17 + 8 PV): primary already wins; redirect the 2 low-traffic posts to primary
- **Wearable alcohol monitoring** (2 posts, 29 + 1 PV): redirect the 1 PV post → 29 PV post
- **Hub pages** (`complete-hangover-science-hub-2025`: 1 PV, `ultimate-dhm-safety-guide-hub-2025`: 0 PV): zero traffic, delete or rebuild as actual pillar pages

---

## 5. Pruning Candidates (5 to redirect/delete)

53 posts have <5 PV/90d. Here are the 5 cleanest "redirect to pillar" candidates:

| Slug | 90d PV | Strategy |
|---|---|---|
| `gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025` | 0 | 301 → home or `/about-dhm`. Slug literally has `%` in URL — broken. |
| `pregnant-women-and-alcohol-complete-fetal-impact-guide-2025` | 0 | 301 → unrelated to DHM brand; redirect to home or delete |
| `shift-workers-alcohol-circadian-disruption-guide-2025` | 0 | 301 → `dhm-dosage-guide` (timing context) |
| `biohacking-alcohol-tolerance-science-based-strategies-2025` | 0 | 301 → `dhm-dosage-guide` |
| `ultimate-dhm-safety-guide-hub-2025` | 0 | 301 → `can-you-take-dhm-every-day-long-term-guide-2025` (existing safety hub by traffic) |

Plus 6 zero-PV posts and 18 with 1 PV — full pruning audit list of 53 posts is in `/tmp/posts_data.json`. Recommend a phase-2 batch redirect of 30+ low-traffic, off-topic posts (medical condition x alcohol pages with zero search demand) → to free up crawl budget and lift site-wide quality score.

**Caution:** Before mass deletion, check Google Search Console — some 0-PV posts may have impressions but no clicks (recoverable with refresh) vs zero impressions (truly dead). Cross-reference with Agent 1/2 output if available.

---

## 6. Cyclical Refresh Strategy (going forward)

### Quarterly cadence (proposed)

| Cadence | Scope | Time investment | Expected lift |
|---|---|---|---|
| **Weekly** (Mon AM) | Update prices on top 5 review/comparison posts via affiliate ping | 15 min | conversion stability |
| **Monthly** | Top 5 posts get a 30-min refresh: bump `dateModified`, audit 1 paragraph, add 1 new internal link | 2.5 hrs | +5-10% PV/quarter |
| **Quarterly** | Top 30 posts: full content audit; price tables; add new research citations | 8-12 hrs | +15-25% on refreshed posts |
| **Annual** (Q4) | Every health post: medical compliance + research review + year update | 40 hrs | maintain rankings |
| **Year transition** (Dec/Jan) | Strip "-2025" or convert to "-2026" + add 301s | 6 hrs | avoid Q1 ranking dip |

### Year-transition playbook (December 2026)

For all 137 `-2025` posts, decide **per-post**:
- **Evergreen content (dosage, timing, safety):** strip year from slug + title. Add 301. Result: stable URL forever.
- **Recurring annual content (best 2025 supplements, year-in-review):** rotate to `-2026` with 301 from old.
- **Locked-to-year content (clinical trials 2024, etc.):** leave alone, but add 2025-2026 supplement section.

**Recommendation: default to year-agnostic slugs for new posts.** "DHM dosage guide" beats "DHM dosage guide 2025" long-term. Yearly slug rotation creates redirect chains and dilutes link equity.

---

## 7. Schema Update Strategy (signal freshness to Google)

### Required changes

1. **Every refreshed post**: update JSON `dateModified` field to ISO date (YYYY-MM-DD)
2. **Visible "Updated" line** in body: `**Last reviewed: April 2026**` near top of post (Google parses this in addition to schema)
3. **JSON-LD `Article.dateModified`**: already wired in `src/utils/blogSchemaEnhancer.js:174` — fixes itself once `lastModified` field is populated
4. **Sitemap `lastmod`**: verify `public/sitemap.xml` (or generation script) uses `dateModified` not `date` so freshness propagates to crawlers

### Quick-win script idea (15-min build)

A `scripts/refresh-post.js` helper:
```js
node scripts/refresh-post.js <slug>
# - Sets dateModified = today
# - Inserts/updates "Last reviewed: {Month YYYY}" line in body
# - Reports any year mentions in body for manual review
```

Reduces refresh time from 30-60 min to ~20-30 min per post.

---

## 8. Summary: Quarterly Traffic Uplift Estimate

Conservative estimate from sustained refresh cadence:

| Quarter | Action | Cumulative PV uplift / mo |
|---|---|---|
| Q2 2026 | Top 5 refresh + 3 redirects | +540 to +1,080 PV/mo |
| Q3 2026 | Top 30 refresh + liver-detox merge | +900 to +1,800 PV/mo |
| Q4 2026 | Year-transition prep + 50-post pruning | +1,200 to +2,400 PV/mo |
| Q1 2027 | Continued cadence + new content compounding | +1,500 to +3,000 PV/mo |

Current total: ~5,668 PV/90d ≈ 1,889 PV/mo. **Refresh strategy alone could 1.8x to 2.6x site traffic in 9 months** with no new content created.

This is the cheapest leverage available. Refreshing 5 posts beats writing 50 new ones.
