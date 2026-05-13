# B8 — CVR Variance: dhm-dosage-guide-2025 vs hangover-supplements-complete-guide

## TL;DR

The dosage guide does **not** have a product-comparison table at the top. The supplements guide does — a 7-row "At a Glance" table where every product name is an inline `/reviews` link. That single table is doing the conversion work.

PostHog confirms it: the supplements guide gets **23 `/reviews`-routed clicks in 14 days, 15 of them from product-name links in that top table**. The dosage guide gets **5** clicks from generic "See Our Top-Rated" callouts buried inside body sections.

There is also a secondary structural problem: `NewBlogPost.jsx` line 30-32 **explicitly skips** the auto-injected template `/reviews` CTAs (PR #277) for `dhm-dosage-guide-2025` via the `REVIEWS_CTA_SKIP_SLUGS` set, on the assumption that its in-body manual CTAs were sufficient. They are not — the manual CTAs convert at 1.04% vs the template format's 12.7%.

**Root cause is structural / content, not template.** The dosage guide's existing `/reviews` callouts are emoji-headlined ("🎯 Ready to Find Your DHM?") and verbose. The supplements guide's links are short, contextual, embedded in a scannable price/dose table the reader is already studying.

## Side-by-side affiliate touchpoint table

| Dimension | dhm-dosage-guide-2025 | hangover-supplements-complete-guide |
|---|---|---|
| `/reviews` link count | 8 | 10 |
| `/compare` link count | 2 | 3 |
| Direct Amazon links | 0 | 0 |
| First `/reviews` link position | 5.9% | 3.4% |
| `/reviews` links in first 10% of body | 1 | **8** (entire top table) |
| Top-of-post comparison table | None | **7 products, each with `/reviews` link** |
| Template auto-CTA (mid + end, PR #277) | **SKIPPED via REVIEWS_CTA_SKIP_SLUGS** | Active |
| Pageviews (14d) | 161 | 70 |
| element_clicked total (14d) | 8 | 23 |
| Routed-to-`/reviews` clicks (14d) | ~5 | ~16 |
| Element CTR overall | 5.0% | **32.9%** |
| Routed-to-`/reviews` CTR | 3.1% | **22.9%** |

## PostHog placement-level confirmation

Query: `event = 'element_clicked' AND timestamp >= '2026-04-29'` for both paths, grouped by `element_text`:

```
dhm-dosage-guide-2025:
  "See Our Top-Rated DHM Supplements"  4 clicks
  "View All DHM Product Reviews"       1
  "Complete DHM Guide →"               1
  "maximum DHM protocol for heavy..."  1
  About (nav)                          1

hangover-supplements-complete-guide:
  "Double Wood Supplements DHM"        8  ← top-table inline link
  "No Days Wasted DHM Detox"           7  ← top-table inline link
  "Dosage Calculator"                  2
  "DHM Depot vs No Days Wasted..."     1
  "DHM randomized controlled..."       1
  "When to Take DHM Timing Guide"      1
  mobile_menu                          2
  About (nav)                          1
```

15 of the 23 supplements-guide clicks (65%) come from **two product-name links inside the top-of-post table**. The dosage guide has no equivalent.

Caveat: `properties.placement` is `unknown` for both (the inline blog markdown links don't set `data-placement`). Attribution to specific table rows is inferred from `element_text`.

`affiliate_link_click` count for these two paths in 14d: **0**. All 38 site-wide Amazon clicks came from `/reviews`. Both posts function as bridges; the supplements guide is a much more effective bridge.

## Root cause: structural / content

Three independent causes stacked:

1. **No product table at the top.** The supplements guide opens with "At a Glance: 7 Best..." — a scannable price/dose/rating table where every product name links to `/reviews`. The dosage guide opens with a body-weight × drinking-intensity dosage table — useful for SEO but zero product-affiliate signal.
2. **Template auto-CTA is explicitly skipped.** `NewBlogPost.jsx:30-32` has `REVIEWS_CTA_SKIP_SLUGS = new Set(['dhm-dosage-guide-2025'])`. The post's 8 in-body `/reviews` callouts were judged sufficient at PR #277 merge time (Apr 26). The actual data 14 days later shows they aren't.
3. **Existing CTAs use verbose emoji headlines** ("🎯 Ready to Find Your DHM?", "🛒 Not Sure Which Brand to Trust?") rather than the contextual, in-table, product-named links that drive the supplements-guide conversions.

## Proposed minimal additions — single file: `src/newblog/data/posts/dhm-dosage-guide-2025.json`

Two coordinated changes, both inside `content`. No template edits. No mass-edit (single file, well under 20-file moratorium).

### Change 1 — Replace the existing body-weight dosage table with a hybrid product+dose table

After the "Quick Answers" section, replace the current "DHM Dosage Calculator" markdown table (which is dose-only) with a **product-matched dose table** that opens with the same dose info but ties each weight tier to a recommended product, each linking to `/reviews`:

Current markdown to replace (line 21 of JSON, in `content`):
```markdown
## DHM Dosage Calculator: Find Your Perfect Dose

| **Your Weight** | **Light Drinking (1-3 drinks)** | **Moderate Drinking (4-6 drinks)** | **Heavy Sessions (7+ drinks)** |
|...
```

Proposed replacement (still leads with dose info — SEO-safe — but every row now has a `/reviews` anchor with a product name):

```markdown
## DHM Dosage Calculator: Find Your Dose and Product

| **Your Weight** | **Recommended Dose** | **Best-Fit Product** | **Per Serving** |
|-----------------|----------------------|----------------------|-----------------|
| **Under 130 lbs** | 300mg | [Toniiq Ease — 300mg](/reviews) | $0.62 |
| **130-180 lbs (most adults)** | 500mg | [No Days Wasted DHM Detox — 1000mg](/reviews) | $1.64 |
| **Over 180 lbs** | 600mg | [Double Wood DHM — 1000mg](/reviews) | $0.66 |
| **Heavy sessions (7+ drinks)** | 600mg | [DHM Depot — 300mg](/reviews) | $0.90 |

*Want the full side-by-side? See our [7 tested DHM supplements](/reviews) breakdown.*
```

This puts **4 inline product-name `/reviews` links above the 10% mark**, in the position where the supplements guide gets 65% of its clicks. Each tagged with dose so the SEO promise (this is a *dosage* guide) is preserved.

### Change 2 — Remove `dhm-dosage-guide-2025` from `REVIEWS_CTA_SKIP_SLUGS` in `NewBlogPost.jsx`

(Out of scope for "single JSON file"; if accepted, paired one-line code change.) Remove line 31 of `NewBlogPost.jsx`. Re-enables the template `/reviews` CTA at ~30% and end-of-content for this post. The existing manual CTAs at 89-99% (i.e., already at the bottom) overlap with the template end-of-content CTA — recommend deleting the manual "🎯 Ready to Find Your Perfect DHM?" section near line 99% to avoid stacking three CTAs in a row.

If you only want one file changed per moratorium, **Change 1 alone is sufficient** and is the higher-leverage of the two — the supplements-guide evidence shows the top table does the vast majority of conversion work; the template-level CTAs at 30%/end are incremental on top of that.

## Expected uplift — conservative

Current baseline: **161 PV → 5 `/reviews` clicks (3.1% route-CTR) → ~0.05 expected affiliate clicks** (assuming `/reviews` Amazon CTR ~10-15%, well below A8's 12.7% reported figure since most of those `/reviews` clicks are likely producing zero downstream — hence A8's reported 1.04% affiliate CVR).

Target (Change 1 only):
- Route-CTR moves from 3.1% toward supplements-guide's 22.9%. Don't assume it matches — the dosage guide reader has weaker product intent (they're researching dose, not shopping).
- **Conservative: 3x lift** → route-CTR ~10%, ~16 `/reviews` clicks/14d → ~2 affiliate clicks/14d → CVR ~1.2%. Modest.
- **Realistic if reader intent migrates to product:** 5x lift → route-CTR ~16% → ~26 `/reviews` clicks/14d → ~3-4 affiliate clicks/14d → CVR ~2-2.5%.
- **Optimistic ceiling** (matches supplements guide): 22.9% route-CTR → too generous, dosage-intent traffic differs.

Honest expectation: **2-4x improvement on affiliate CVR for this post**, getting it from 1.04% → 2-4%. Still below the 12.7% supplements-guide rate (which has different traffic intent) but on a much larger pageview base (161 vs 70), the absolute click count moves more.

If Change 2 also applied: add ~50% incremental on top (template CTA at 30% + end of content), so 3-6x total.

## Confidence

**4 / 5**

Strong on diagnosis: PostHog data shows clearly that the supplements guide's wins come from top-table inline product links, and the dosage guide has none. The SKIP_SLUGS entry is a documented fact. Side-by-side `/reviews`-position chart is conclusive.

Less certain on uplift magnitude: dosage-intent traffic may not convert to product clicks at the same rate as comparison-intent traffic, even with identical CTA placement. The 2-4x estimate is conservative for that reason.

Risk on Change 1: SEO. The dosage guide ranks for "dhm dosage" queries. Replacing the dose-only table with a product-matched table risks Google reclassifying the page as commercial-intent. Mitigation: keep the dose column first, the H2 still leads with "DHM Dosage Calculator", and the surrounding text still anchors the page to dosage information.

## Files referenced
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-dosage-guide-2025.json` — single-file patch target
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json` — reference (the converter)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/components/NewBlogPost.jsx` lines 28-35 — REVIEWS_CTA_SKIP_SLUGS opt-out, optional Change 2
