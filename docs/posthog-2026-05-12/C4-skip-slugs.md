# C4 — Remove `dhm-dosage-guide-2025` from `REVIEWS_CTA_SKIP_SLUGS` + CTA fatigue audit

## TL;DR

Deleted the `REVIEWS_CTA_SKIP_SLUGS` Set entirely (pure deletion, Pattern #6) from `NewBlogPost.jsx`. The dosage guide will now receive the PR #277 auto-injected mid + end `/reviews` CTAs.

CTA fatigue audit identifies **2 manual emoji-headlined callouts that become redundant** once auto-injection is restored. Recommended for deletion in a follow-up JSON edit (out of scope for C4; deferred to C3 or C5).

## 1. Current state — 8 existing `/reviews` anchors in dosage guide

Positions are character offsets in `content` (19,799 chars total). Each anchor below is verbatim:

| % through body | Anchor text | Surrounding H2 |
|---|---|---|
| 5.7% | `[See our independently tested reviews](/reviews)` | `## DHM Dosage Calculator: Find Your Perfect Dose` |
| 18.2% | `[See Our Top-Rated DHM Supplements](/reviews)` | `## 🎯 Ready to Find Your DHM?` (manual emoji block) |
| 20.9% | `[See our independently tested reviews](/reviews)` | `## How to Calculate Your Personal DHM Dosage` |
| 36.5% | `[View All DHM Product Reviews](/reviews)` | `## 💊 Compare DHM Products by Format` (manual emoji block) |
| 89.0% | `[independent DHM product reviews](/reviews)` | `## 🛒 Not Sure Which Brand to Trust?` (manual emoji block) |
| 90.5% | `[Compare All DHM Supplements](/reviews)` | `## 🛒 Not Sure Which Brand to Trust?` (same block) |
| 92.2% | `[See Our Top-Rated DHM Supplements](/reviews)` | `## 🎯 Ready to Find Your Perfect DHM?` (manual emoji block) |
| 99.3% | `[Product Reviews →](/reviews)` | `## Continue Your Research` (hub footer) |

8 anchors → 4 manual emoji-headlined callout blocks (18.2%, 36.5%, 89-90.5%, 92.2%) + 3 inline body links (5.7%, 20.9%, 99.3%).

## 2. Auto-injected CTA logic (PR #277, unchanged)

`splitContentAtRatio(content, 0.3)` walks forward from char 5,939 (30%) until it hits a `\n\n` paragraph break — for this post, that lands at **char 5,943 (30.0%)**, immediately after the "Option 4: After Drinking" subsection inside `## Perfect DHM Timing: When to Take Your Dose`.

End-of-content CTA renders immediately after the rendered markdown body (~100%), before the template `CompareCTA` block and before the related-posts grid.

Both CTAs use the green-bordered `InlineReviewsCTA` component with anchor "See our top-rated picks →".

## 3. CTA fatigue audit

### `/reviews` CTA count

| State | Manual anchors | Auto-injected | CompareCTA template | Total `/reviews` exposures |
|---|---|---|---|---|
| BEFORE this PR | 8 | 0 (skipped) | 1 | 9 |
| AFTER C4 only (this change) | 8 | 2 (mid 30%, end 100%) | 1 | **11** |
| AFTER C4 + C3's planned top-of-post product table (~5 new) | 13 | 2 | 1 | **16** |

(C3's design doc `C3-*.md` has not landed yet; the +5 count is inferred from B8's proposed change.)

### Stacking concerns

**Concern A — mid-region clustering (30-36.5%):**
Auto-injected CTA at 30% (after Timing → Option 4) is followed only ~1,300 chars later by the manual emoji block `## 💊 Compare DHM Products by Format` at 36.5%. Reader sees two `/reviews` invitations within roughly half a screen of scrolling. Mild fatigue, but headings differ ("best supplement" vs "compare by format"), so I'd leave both.

**Concern B — bottom stack (89% → 100%, severe):**
Currently four `/reviews` exposures cluster in the final ~2,200 chars:
- 89.0% — emoji block `## 🛒 Not Sure Which Brand to Trust?` (contains 2 anchors at 89.0% + 90.5%)
- 92.2% — emoji block `## 🎯 Ready to Find Your Perfect DHM?`
- ~100% — NEW auto-injected end-of-content CTA
- ~100% — template `CompareCTA` block
- 99.3% — hub footer "Product Reviews →" link

That's **5 distinct `/reviews` touchpoints in the last 11% of body**, two of them visually heavy emoji blocks. This is the "verbose emoji headlines" anti-pattern B8 flagged as the original conversion problem.

### Recommendation — delete 2 manual emoji blocks (deferred)

To restore readability post-C4, recommend a follow-up JSON edit (separate PR, single file, not part of C4):

1. **DELETE** `## 🎯 Ready to Find Your Perfect DHM?` block at 92.2% — fully redundant with the auto-injected end-of-content CTA that now lands directly below it.
2. **DELETE** `## 🛒 Not Sure Which Brand to Trust?` block at 89-90.5% — the 4-bullet "purity / price / ratings / transparency" pitch is exactly what `/reviews` is for; deleting the inline preview reduces fatigue without losing the destination.

**Keep:**
- The 18.2% `## 🎯 Ready to Find Your DHM?` block (different position — mid-body, before auto-injection, still serves discovery)
- The 36.5% `## 💊 Compare DHM Products by Format` (format-specific, distinct value prop)
- All inline body anchors (5.7%, 20.9%, 99.3% hub footer)

Net after both deletions: 6 manual + 2 auto + 1 CompareCTA = **9 total `/reviews` exposures**, same as today's BEFORE count but with bottom stack reduced from 5 to 2.

**I did not perform these deletions.** C4 scope is the code change only; defer JSON edits to C3 (already editing this file) or C5.

## 4. Diff applied to `NewBlogPost.jsx`

```diff
-// Slugs whose markdown bodies already contain in-content /reviews CTAs.
-// Skip the auto-injected template CTA on these to avoid duplication.
-const REVIEWS_CTA_SKIP_SLUGS = new Set([
-  'dhm-dosage-guide-2025',
-]);
-
 // Posts shorter than this (rendered markdown chars) skip the mid-content CTA.
 const TEMPLATE_CTA_MIN_CONTENT_LENGTH = 500;
```

```diff
                   // Auto-inject template-level /reviews CTA at ~30% and end of body.
-                  // Skip if: post opts out (post.skipReviewsCta), slug is in skip list
-                  // (already has in-content /reviews CTAs), or body is too short.
+                  // Skip if: post opts out (post.skipReviewsCta) or body is too short.
                   const showTemplateCta =
                     !post.skipReviewsCta &&
-                    !REVIEWS_CTA_SKIP_SLUGS.has(post.slug) &&
                     typeof fullContent === 'string' &&
                     fullContent.length >= TEMPLATE_CTA_MIN_CONTENT_LENGTH;
```

Rationale for deletion vs. emptying the Set: per CLAUDE.md Pattern #6 ("Pure Deletion Is the Safest Change"), the Set's only purpose was this single slug exclusion. `grep -rn REVIEWS_CTA_SKIP_SLUGS src/` returns no other references. Leaving `new Set([])` would be dead infrastructure inviting re-adds without a documented reason. The `post.skipReviewsCta` opt-out remains as the per-post escape hatch if any future post needs it.

## 5. Build result

```
✅ Successfully prerendered 197 blog posts
✅ Generated 7 prerendered pages
```

`npm run build` — **PASS** (full output ends with prerender success; no warnings related to this change).

## 6. Confidence

**5 / 5**

- Code change is minimal, contained, and matches an exact pattern documented in CLAUDE.md (#6).
- Build passes including the prerender step that exercises this component on all 197 posts.
- B8's diagnostic established the original SKIP_SLUGS entry was a documented overestimate of the manual CTAs' efficacy; PostHog data (1.04% manual CVR vs 12.7% template format CVR) supports re-enabling.
- The fatigue audit is conservative — I'm flagging it but explicitly deferring the JSON deletions to keep this task atomic and avoid stepping on C3.

## Files referenced
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/components/NewBlogPost.jsx` — edited (declaration + skip check removed)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-dosage-guide-2025.json` — read only (anchor inventory)
- `/Users/patrickkavanagh/dhm-guide-website/docs/posthog-2026-05-12/B8-cvr-variance.md` — upstream diagnosis
