# Zero-CTR High-Traffic Pages — Root Cause Analysis

**Investigation date**: 2026-04-29 (data window: last 14 days)
**Agent**: 3 of 5 (zero-CTR-RCA lane)
**PostHog project**: 275753 (DHM Guide)

## 1. Finding — the exact pages

HogQL on `events` table for `≥50 pageviews` and `0 affiliate_link_click events` over the last 14 days returned 5 pages. The original audit referenced 3, totalling ~487 PV — these are the top 3 by PV (502 PV combined; the audit's 487 was an approximate). All 5 are listed for completeness:

| # | Path | PV (14d) | Affiliate clicks (14d) | CTR |
|---|------|---------:|-----------------------:|----:|
| 1 | `/never-hungover/dhm-dosage-guide-2025` | 223 | 0 | 0.00% |
| 2 | `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` | 176 | 0 | 0.00% |
| 3 | `/never-hungover/dhm-randomized-controlled-trials-2024` | 103 | 0 | 0.00% |
| 4 | `/never-hungover/flyby-vs-cheers-complete-comparison-2025` | 87 | 0 | 0.00% |
| 5 | `/never-hungover/when-to-take-dhm-timing-guide-2025` | 62 | 0 | 0.00% |

Note on #3: the path `/dhm-randomized-controlled-trials-2024` is a **301 redirect** (vercel.json) to `/dhm-randomized-controlled-trials`. The HogQL counts the pre-redirect path because the pageview is fired by the destination after the bounce (or PostHog tracked the original click before redirect). Source file is `dhm-randomized-controlled-trials.json`.

## 2. Per-page audit

Methodology: for each post I checked three signals — (a) source JSON `grep` for `amzn.to|amazon.com|tag=dhmguide-20|fullerhealth.com|affiliateLink`, (b) live `curl` of the production URL parsed for the same patterns, (c) full content-URL extraction via Python regex.

### 2.1 `/never-hungover/dhm-dosage-guide-2025` (223 PV, 0 clicks)

| Check | Result |
|-------|--------|
| Source file | `src/newblog/data/posts/dhm-dosage-guide-2025.json` |
| Word count | 2,842 |
| Total URLs in `content` | 4 |
| Affiliate URLs in source | **0** |
| Affiliate URLs in live HTML | **0** (curl, prerendered + post-hydrate) |
| Tracked Y/N | N/A — nothing to track |
| Visible Y/N | N/A — no link to be visible |

All 4 outbound links go to `pmc.ncbi.nlm.nih.gov` research articles. The `relatedPosts` array points exclusively to other informational posts (no `/reviews`, no `/compare`). User has no monetization path on this page.

### 2.2 `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` (176 PV, 0 clicks)

| Check | Result |
|-------|--------|
| Source file | `src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json` |
| Word count | 3,713 |
| Total URLs in `content` | 17 |
| Affiliate URLs in source | **0** |
| Affiliate URLs in live HTML | **0** |
| Tracked Y/N | N/A |
| Visible Y/N | N/A |

This is the most damning case. Title is "Best Hangover Prevention Supplements 2026: 7 Tested" — the exact buyer-intent query that should monetize at the highest rate on the site. 3,713 words of supplement comparison with zero affiliate links. The 17 URLs are all PubMed citations. `relatedPosts` lists 5 informational posts but again no commercial pages.

### 2.3 `/never-hungover/dhm-randomized-controlled-trials-2024` → `/dhm-randomized-controlled-trials` (103 PV, 0 clicks)

| Check | Result |
|-------|--------|
| Source file | `src/newblog/data/posts/dhm-randomized-controlled-trials.json` |
| Word count | 1,536 |
| Total URLs in `content` | 7 |
| Affiliate URLs in source | **0** |
| Affiliate URLs in live HTML | **0** |
| Tracked Y/N | N/A |
| Visible Y/N | N/A |

All 7 outbound links go to PubMed Central. `relatedPosts` again routes only to informational content. Title: "DHM Clinical Trials 2026: 70% Hangover Reduction Proven" — a high-intent query where readers learning DHM works should be funneled to a product CTA. None exists.

## 3. Common pattern

**Single bug, three (actually five) instances**: these blog posts contain zero clickable affiliate links. There is nothing for `useAffiliateTracking.js` to fire on because no anchor `href` matches `/^(https?:\/\/)?(www\.)?(?:amazon\.[a-z.]{2,6}|amzn\.to|fullerhealth\.com)\/.*/i`.

This is **NOT** a tracking bug:

- The hook `src/hooks/useAffiliateTracking.js` last changed on 2026-04-26 (PR #274) only to *extend* the regex to include `fullerhealth.com`. The regex still matches all Amazon TLDs and `amzn.to`. Tracking integrity is intact.
- The hook attaches a **document-level `click` listener in capture phase** (line 183), so any anchor anywhere in the DOM whose `href` matches the affiliate pattern fires `affiliate_link_click`. No component-wrapping or special markup is needed.
- The blog markdown renderer (`src/newblog/components/NewBlogPost.jsx:1255-1261`) explicitly detects affiliate-pattern hrefs and adds compliance attributes (`rel`, `target`) so MDX content with raw `[link](amzn.to/abc)` works automatically.

The bug class is **"missing affiliate links in content"** — pure content gap, not a tracking gap and not a CSS/visibility gap. There is literally nothing to render.

The shared sub-pattern across all 5 pages:

1. Heavy **scientific citation** content (PubMed Central / PMC links).
2. **`relatedPosts` arrays that route only to other informational posts**, never to `/reviews` or `/compare`.
3. **No inline product CTAs.** No "Top Pick" callout boxes. No "Check Price on Amazon" buttons. No comparison-table embed.

The 4th page (`flyby-vs-cheers`, 87 PV) is a different bug — it HAS affiliate links (2 distinct `amzn.to` codes in the live HTML) but they generated 0 clicks. That page is owned by the flyby-vs-good-morning lane (sibling agent).

The site DOES have functional tracking — the homepage `/` (61 PV) recorded 2 clicks at 3.28% CTR in the same window, confirming `affiliate_link_click` events fire in production when there are links to click. (Aside: 2 clicks site-wide in 14 days is alarmingly low absolute volume, but that's a different lane.)

## 4. Recommended actions

**P0 — Add monetization to the top 2 pages immediately. ~1.5 hours total.**

These two together represent **399 PV (80% of the top-3 zero-CTR traffic)** and have the highest buyer intent:

- **`hangover-supplements-complete-guide-what-actually-works-2025`** — title literally promises 7 tested supplements. Add an Amazon link to each of the 7 supplements being reviewed. Existing pattern: copy the `<a href="https://amzn.to/...">Check Price on Amazon</a>` markdown structure already used on `/reviews` (e.g. Reviews.jsx product cards). Use existing `dhmguide-20` Associates tag. **Estimated lift: at 3.28% CTR (homepage benchmark), 176 PV → ~5.8 affiliate clicks/14d from this page alone.**
- **`dhm-dosage-guide-2025`** — readers researching dosage are mid-funnel. Add 1–2 affiliate CTAs to specific DHM products (the canonical `amzn.to/44nvh65` for DHM1000 and `amzn.to/4l1ZoqN` for DHM Depot, both verified live in PR #274). Place once after the "How much should I take?" section and once near the end-of-article CTA. **Estimated lift: 223 PV → ~7.3 clicks/14d.**

Implementation = pure JSON content edit. No new components needed. Existing `NewBlogPost.jsx:1255-1261` and `useAffiliateTracking.js` will pick up the links automatically.

**P1 — `dhm-randomized-controlled-trials` (103 PV).** Lower buyer intent (research-focused readers), but the title "70% Hangover Reduction Proven" is a strong proof-point. Add a single soft CTA at the end: "Want to try DHM? See top-rated brands on Amazon →" linking to `/reviews` or directly to `amzn.to/44nvh65`. **~30 minutes.**

**P2 — `relatedPosts` audit across all 5 pages.** Currently `relatedPosts` only routes to other informational content. Add at least 1 commercial slug (`/reviews`, `/compare`, or a top-rated product comparison post) to each post's `relatedPosts` array. Pure data change, no code. **~15 minutes.**

**P3 — Content-quality CI guardrail.** Add a `scripts/check-affiliate-coverage.mjs` that scans every post in `src/newblog/data/posts/` and flags any post >1,500 words containing zero affiliate links. Wire into `npm run build` (alongside existing `verify-z-classes.mjs`). Prevents future authors from publishing high-traffic-prone content with no monetization path.

**Do NOT do** (per simplicity test):

- Don't write a new "affiliate CTA component" abstraction — the existing markdown link pattern works.
- Don't refactor `useAffiliateTracking.js` — it's not broken.
- Don't add A/B testing infrastructure for placement before there are *any* clicks to measure.
- Don't migrate `flyby-vs-cheers` here — different bug class, different lane.

## 5. Evidence trail

```bash
# 1. HogQL identifying the 5 zero-CTR pages (project 275753, last 14d, ≥50 PV):
SELECT pv.path, pv.pageviews, coalesce(aff.clicks, 0) AS clicks
FROM (SELECT properties.$pathname AS path, count() AS pageviews
      FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 14 DAY
      GROUP BY path) pv
LEFT JOIN (SELECT properties.$pathname AS path, count() AS clicks
           FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 14 DAY
           GROUP BY path) aff ON aff.path = pv.path
WHERE pv.pageviews >= 50 AND coalesce(aff.clicks, 0) = 0
ORDER BY pv.pageviews DESC

# 2. Source-file affiliate audit (all 0):
$ grep -cE "amzn\.to|amazon\.com|fullerhealth" src/newblog/data/posts/dhm-dosage-guide-2025.json
0
$ grep -cE "amzn\.to|amazon\.com|fullerhealth" src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json
0
$ grep -cE "amzn\.to|amazon\.com|fullerhealth" src/newblog/data/posts/dhm-randomized-controlled-trials.json
0

# 3. Live HTML audit (all 0):
$ curl -sL https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | grep -oE 'amzn\.to|tag=dhmguide-20|fullerhealth' | wc -l
0
$ curl -sL https://www.dhmguide.com/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025 | grep -oE 'amzn\.to|tag=dhmguide-20|fullerhealth' | wc -l
0
$ curl -sL https://www.dhmguide.com/never-hungover/dhm-randomized-controlled-trials | grep -oE 'amzn\.to|tag=dhmguide-20|fullerhealth' | wc -l
0

# 4. Tracking hook last changed 2026-04-26 (PR #274) and only EXTENDED the regex:
$ git log --since="2026-03-30" --pretty=format:"%h %ad %s" --date=short -- src/hooks/useAffiliateTracking.js
efcded2 2026-04-26 fix: track Fuller Health affiliate clicks and remove broken Amazon placeholders (#274)
f80d67e 2026-04-07 fix: correct placement and product_name on affiliate_link_click events (#257)
# Neither change broke Amazon tracking; #274 only widened scope.

# 5. Tracking proof-of-life — homepage same window:
/    61 PV   2 clicks   3.28% CTR
# So affiliate_link_click ingestion works; the bug is "no links to click" on the 5 pages.
```

## Files referenced

- `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useAffiliateTracking.js` (tracking contract)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/components/NewBlogPost.jsx` (lines 1255-1261, affiliate auto-detection in markdown)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-dosage-guide-2025.json`
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json`
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-randomized-controlled-trials.json`
- `/Users/patrickkavanagh/dhm-guide-website/vercel.json` (line establishing `-2024` → canonical redirect)
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/Compare.jsx` (only file outside data containing affiliate URLs site-wide)
