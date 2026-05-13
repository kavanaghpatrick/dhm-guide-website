# RCA: `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` PV collapse

**Agent:** 2 of 5
**Date:** 2026-04-30
**Status:** Diagnosed; recommended action below

---

## Finding

PostHog reports `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` collapsed from **55 PV (prior 14d)** to **2 PV (last 14d)**, a **−96%** drop. Comparison pages are normally one of the better-performing content patterns on this site. The question: did the page break, get redirected, get deindexed, or did the underlying URL just normalize from a degraded state?

**Honest framing up front:** absolute volume is small (N=55 → 2). The post's been functionally broken for ~9 months and never had healthy organic traffic to begin with. The 55 PV "prior" baseline is itself a degraded state.

---

## Hypotheses

| # | Hypothesis | Status |
|---|---|---|
| H1 | Post was deleted | **REJECTED** — file present at `src/newblog/data/posts/flyby-vs-good-morning-pills-complete-comparison-2025.json` |
| H2 | Post was redirected (catch-all `*-vs-*-comparison`) | **REJECTED** — redirect existed Oct 20–Nov 7 2025 but was deleted in `b2f9cbf`; live URL returns **HTTP 200**, no redirect |
| H3 | Post was renamed / slug changed | **REJECTED** — slug is unchanged in metadata, sitemap, and `blog-canonicals.json`; only one canonical entry |
| H4 | Cluster orphan — removed from internal link graph | **PARTIAL** — not in `scripts/cluster-config.json` `product-reviews` cluster spokes (only `flyby-vs-double-wood-complete-comparison-2025` is). But it IS linked from the science-hub pillar and from 2 sibling posts (`flyby-vs-fuller-health`, `good-morning-hangover-pills-review-2025`) |
| H5 | **Page rendered as broken/empty for ~9 months; "prior 14d" baseline was already degraded; "last 14d" reflects continued or worsened degradation overlapping the Apr 26 fix that hadn't propagated yet** | **CONFIRMED — primary cause** |
| H6 | Apr 29 mass-edit (PR #246/#359 — orphan footer to 197 posts) triggered Google quality re-evaluation | **CONTRIBUTING** — last 14d window includes Apr 29; CLAUDE.md flags PR #246 as a known DCNI driver |
| H7 | Sibling pages (other flyby comparisons) lost similar traffic — site-wide phenomenon | **MIXED** — `flyby-vs-cheers` had identical broken-renderer bug per PR #270; `flyby-vs-dhm1000` and `flyby-vs-fuller-health` still have it (per `0701b68` commit body). This is a *cluster of 4 broken pages*, not just this one |

---

## Evidence

### 1. File status

```
src/newblog/data/posts/flyby-vs-good-morning-pills-complete-comparison-2025.json
14030 bytes, present
```

Listed in `postRegistry.js:108`, sitemap, `blog-canonicals.json`, and metadata `index.json:1211`.

### 2. Live URL check

```bash
$ curl -sI https://www.dhmguide.com/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025
HTTP/2 200
content-type: text/html; charset=utf-8
```

Returns 200 to both Googlebot and browser UA. No redirect, no 404.

### 3. Git timeline — the smoking gun

| Date | Hash | Event |
|---|---|---|
| 2025-07-01 | `1ecc30e` | Post created as 8 Flyby comparisons. Schema: array of 48 typed sections (`paragraph`, `heading`, `comparisonTable`, `productCard`, …) |
| 2025-07-30 | `b60f696` | "Fix critical blog post content format issue — converted 16 posts from array to markdown." **The script DID touch this file (456-line diff) but only converted 4 inner `content` sub-fields, leaving the outer 48-section array intact.** Confirmed via `git show b60f696:.../flyby-vs-good-morning-pills-complete-comparison-2025.json` → content type is `list`, length 48. |
| 2025-10-20 | `8bc0f52` | Phase 3: Simplify comparison pages — **DELETED 23 comparison posts**, including this one. Added catch-all redirect `*-vs-*-comparison.*` → `/reviews`. |
| 2025-11-07 | `b2f9cbf` | Issue #29: Removed the catch-all redirect (it was blocking 16 indexed comparison posts). But this post was still **deleted** at this point. URL returned 200 (SPA shell) with no content. |
| 2025-11-27 | `8e460a2` | Issue #83: Restored 23 comparison posts from backup. **Restored the same broken 48-section array schema.** Renderer in `src/newblog/components/NewBlogPost.jsx:182–212` only knows section types `section`, `callout`, `highlight` — every other type falls through to `section.content \|\| ''`, but `paragraph`/`heading`/`comparisonTable`/etc. store text in `text`/`headers`/`rows`/`items`. **44 of 48 sections rendered as empty strings.** Visible content: ~700 chars (3 alerts + 1 CTA below the hero). Nothing scrollable. |
| 2026-04-26 | `0701b68` | **PR #270: Convert array content to markdown string (10,767 chars).** Page finally renders properly. |
| 2026-04-29 | `ffb4678` | PR #246/#359 mass-edit: "Continue Your Research" footer added to 197 posts including this one. (Per CLAUDE.md, this PR is a known DCNI growth trigger.) |

### 4. PostHog evidence cited in `docs/posthog-analysis-2026-04-25/p0c-flyby-fix.md`

> Two top-traffic blog posts had **0% scroll-to-50% rate** in PostHog (impossible for a working page):
> - `/never-hungover/flyby-vs-cheers-complete-comparison-2025` — 151 PV / 30 days
> - `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` — 58 PV / 30 days
> Both also had 0 element clicks and 0 affiliate clicks.

**0% scroll-to-50% over 58 PV / 30 days** is the definitive signature: there was nothing below the fold to scroll to. Users land, see ~700 chars of intro fragment + an Amazon CTA, bounce. Google tracks this as zero engagement → ranks the page lower → fewer impressions → fewer clicks → the −96% PV drop we're investigating.

### 5. Sibling comparison

The post is part of a cluster of **4 Flyby comparison pages** with the same broken array schema:

| Page | Status as of 2026-04-30 |
|---|---|
| `flyby-vs-cheers-complete-comparison-2025` | **Fixed** in PR #270 (2026-04-26) |
| `flyby-vs-good-morning-pills-complete-comparison-2025` | **Fixed** in PR #270 (2026-04-26) ← THIS POST |
| `flyby-vs-dhm1000-complete-comparison-2025` | **STILL BROKEN** (56 sections, same broken types per `0701b68` commit body) |
| `flyby-vs-fuller-health-complete-comparison` | **STILL BROKEN** (uses different array schema with `## undefined` rendering) |

Other flyby pages (`-double-wood-`, `-toniiq-ease-`, `-nusapure-`, `-no-days-wasted-`, plus `flyby-recovery-review-2025`) use string `content` and are healthy. Agent 5 (cross-cutting) should expect to see similar PV collapses on `flyby-vs-dhm1000` and `flyby-vs-fuller-health` if they're investigating top droppers.

### 6. Why the prior-14d baseline of 55 PV was already a degraded floor

The page has been rendering ~700 chars of content since at least Nov 27 2025 (and arguably since Jul 30 2025 when the convert script silently no-op'd it). Google sees a sub-1000-char comparison page with a clear keyword ("flyby vs good morning pills"), some impressions trickle in, but engagement signals are dead-zero (0% scroll-to-50%, 0 clicks). The 55 PV prior baseline reflects a slowly bleeding-out long tail, not real comparative interest. The 2 PV last-14d reflects that bleed-out continuing past whatever residual indexing was left.

### 7. Why the Apr 26 fix didn't immediately rescue traffic

PR #270 deployed Apr 26–27. The "last 14d" window per the finding is approximately Apr 16–29, so the fix only had ~3 days to propagate before the measurement window closed. Google needs to recrawl, re-evaluate engagement, re-rank — typically 1–4 weeks for a previously-poor page. PR #246 (Apr 29 mass-edit footer rollout) likely also triggered a recrawl wave that flagged this page's engagement history as poor before the new content had time to accumulate good engagement signals.

---

## Root cause

**Primary: Renderer/JSON schema mismatch caused 92% of post content to silently render as empty strings for ~9 months (Jul 2025 → Apr 2026).**

The post was effectively a 700-character thin-content stub from a search-quality perspective. Google likely deranked it gradually over that period. The −96% PV drop is the tail end of that derank curve, not a sudden cliff. The sequence Delete (Oct 20) → Redirect-removal-without-restore (Nov 7) → Restore-with-still-broken-schema (Nov 27) → Mass-edit-recrawl-trigger (Apr 29) compounded the damage. The Apr 26 fix is the right fix but hasn't had time to recover ranking.

**Secondary contributors:**
- Not a member of the `product-reviews` cluster spokes in `scripts/cluster-config.json` (only `flyby-vs-double-wood-` is). Agent ranking the cluster authority would not link this post.
- No internal links in `src/utils/productSchemaGenerator.js` cluster (the file references this slug, but only for schema generation, not internal linking).
- The "schema.mainEntityOfPage.@id" still says `https://yoursite.com/...` (placeholder, line 59 of the JSON) — minor SEO defect, not load-bearing for the PV drop but worth fixing.

---

## Recommended action

**Treat this as a wait-and-monitor case, NOT a high-priority fix.** The structural fix (PR #270) is already live as of Apr 26. Do nothing destructive in the next 4 weeks and watch.

### Do now (low-cost, < 30 min total):
1. **Add to `product-reviews` cluster spokes** in `scripts/cluster-config.json` — single-line edit, gets the page into the cluster authority graph alongside its `flyby-vs-double-wood` sibling. Same fix would apply to other restored Flyby comparisons.
2. **Fix the `@id` placeholder** in the JSON schema (line 59: `https://yoursite.com/...` → `https://www.dhmguide.com/...`). One-character category fix; affects rich-result eligibility.
3. **Wait 4 weeks**, then re-pull PostHog `$pageview` + GSC impressions for this URL. If recovery toward the historical 55 PV/14d baseline is visible, no further action. If still flat, escalate.

### Do NOT do:
- Do not delete or redirect this post again. The Oct 20 → Nov 27 thrash already cost it index trust.
- Do not mass-edit it as part of a corpus pass (mass-edit moratorium per CLAUDE.md is active until 2026-07-15).
- Do not "expand the content" — it's already 10,767 characters of legitimately-converted markdown. Adding more text without engagement data is the trap from Pattern #9.

### Companion fix (separate scope, but flag for parent agent):
**`flyby-vs-dhm1000-complete-comparison-2025` and `flyby-vs-fuller-health-complete-comparison` still have the same broken array schema** per the PR #270 commit body. Agent 5 (cross-cutting) should see those as droppers too. The same conversion script applies.

### Honest cost-benefit framing
A 96% drop on N=55 is a small absolute number. The page was never a real traffic driver. The fixes above are 30 minutes of work and have systemic value (the cluster-config edit fixes a class of orphans, the schema `@id` fix fixes a class of rich-result eligibility issues). But there is no scenario where this single post justifies multi-hour effort. **The 80/20 win is fixing the still-broken `dhm1000` and `fuller-health` siblings while we have the conversion script and the conviction**, not nursing this one back to 55 PV.

---

## Files cited (absolute paths)

- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/flyby-vs-good-morning-pills-complete-comparison-2025.json` — the post itself
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/components/NewBlogPost.jsx` — renderer with the schema mismatch (lines 182–212 per PR #270 doc)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/cluster-config.json` — cluster definition; this post is missing from `product-reviews` spokes
- `/Users/patrickkavanagh/dhm-guide-website/public/sitemap.xml` line 677 — sitemap entry, lastmod 2026-04-29
- `/Users/patrickkavanagh/dhm-guide-website/public/blog-canonicals.json` line 517 — canonical entry, correct
- `/Users/patrickkavanagh/dhm-guide-website/vercel.json` — current state has NO redirect for this slug (correct)
- `/Users/patrickkavanagh/dhm-guide-website/docs/posthog-analysis-2026-04-25/p0c-flyby-fix.md` — the prior investigation that diagnosed and fixed this

## Commits cited

- `1ecc30e` 2025-07-01 — Post created with broken array schema
- `b60f696` 2025-07-30 — Convert script ran but missed this file's outer schema
- `8bc0f52` 2025-10-20 — Phase 3: Deleted post + added catch-all redirect
- `b2f9cbf` 2025-11-07 — Issue #29: Removed catch-all redirect
- `8e460a2` 2025-11-27 — Issue #83: Restored 23 comparison posts (still broken schema)
- `0701b68` 2026-04-26 — **PR #270: Fixed the renderer schema mismatch (10,767 chars markdown)**
- `ffb4678` 2026-04-29 — PR #246/#359: Mass-edit footer (DCNI growth trigger per CLAUDE.md)
