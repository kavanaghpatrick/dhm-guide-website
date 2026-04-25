# P0-C: Flyby Comparison Pages Rendering Fix

**Branch:** `fix/flyby-comparison-pages`
**Date:** 2026-04-25
**Status:** Fixed (not yet pushed/deployed)

## Symptom

Two top-traffic blog posts had **0% scroll-to-50% rate** in PostHog (impossible for a working page):
- `/never-hungover/flyby-vs-cheers-complete-comparison-2025` — 151 PV / 30 days
- `/never-hungover/flyby-vs-good-morning-pills-complete-comparison-2025` — 58 PV / 30 days

Both also had 0 element clicks and 0 affiliate clicks.

## Root cause

**JSON content schema mismatch with the renderer.** These two posts (and 2 sibling files
listed below) used an array-based content structure with section types like
`paragraph`, `heading`, `quickComparison`, `comparisonTable`, `list`, `productCard`,
`reviewSummary`, `verdict`, `faq`, `ctaSection`, `priceComparison`, and `alert`.

The renderer in `src/newblog/components/NewBlogPost.jsx` (`renderContent`, lines
182–212) only knows three array section types: `section`, `callout`, and `highlight`.
Every other type falls through to a default case that does:

```js
return section.content || '';
```

But `paragraph` stores text in `text` (not `content`), `heading` stores in `text`,
`comparisonTable` stores in `headers`/`rows`, `list` in `items`, etc. **All of those
sections rendered as empty strings** and were filtered out, leaving only `alert` and
`ctaSection` (which happened to use a `content` field) visible.

For `flyby-vs-cheers`: 4 of 44 sections rendered, ~92% of content silently dropped.
For `flyby-vs-good-morning-pills`: similar (4 of 48). The page is essentially empty
below the hero — there's nothing to scroll to, hence 0% scroll-50.

PostHog confirms: 151 pageviews, **0 `$exception` events** on these URLs in the last
30 days. The page doesn't crash; it just renders almost nothing.

## Fix

**Pure data fix.** Converted the array content into a single markdown string for both
files. The renderer's existing markdown pipeline (ReactMarkdown + remark-gfm + custom
components) already handles every element used: paragraphs, headings, tables, lists,
links, blockquotes (used for alerts via the existing `**Tag:**` recognizer), etc.

**No component code changed**, so no risk to the 180+ other posts.

## Files changed

- `src/newblog/data/posts/flyby-vs-cheers-complete-comparison-2025.json`
  - `content`: array of 44 sections → markdown string (8,993 chars)
- `src/newblog/data/posts/flyby-vs-good-morning-pills-complete-comparison-2025.json`
  - `content`: array of 48 sections → markdown string (10,767 chars)

Other top-level fields (title, slug, image, tags, relatedPosts, etc.) untouched.
Vestigial fields (`meta`, `schema`, `featured`, `rating`, `pros`, `cons`, `toc`)
left in place — they're unused by any code path, so deleting them is out of scope.

## Before / after

| Page | Before (rendered sections) | After (markdown chars) |
| --- | --- | --- |
| flyby-vs-cheers | 4 of 44 (1 quick paragraph + 3 alerts + 1 CTA, ~700 chars) | 8,993 chars markdown |
| flyby-vs-good-morning-pills | 4 of 48 (similar) | 10,767 chars markdown |

Build verified: `npm run build` succeeds, prerendered HTML for both pages now
includes visible paragraph content (was effectively empty before).

## Other posts with the same broken structure

The same `paragraph`/`heading`/`quickComparison`/etc. array schema is used in two more
files, NOT named in this task — flagged here for follow-up:

- `src/newblog/data/posts/flyby-vs-dhm1000-complete-comparison-2025.json` (56 sections, same broken types)
- `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json` (uses a
  different array schema — `section`/`toc`/`cta` — partially handled. Renderer
  emits `## undefined` because `section` uses `title` not `heading`. Less broken
  than the two named posts, but still has missing subsections/tables.)

The remaining flyby comparison files (`-double-wood-`, `-toniiq-ease-`, `-nusapure-`,
`-no-days-wasted-`, plus `flyby-recovery-review-2025`) all use string `content` and
are healthy.

## Verification (post-deploy)

Cannot verify in-session since this is client-side scroll tracking. Run 24h after
deploy:

```sql
SELECT properties.$pathname, count() AS scroll_50
FROM events
WHERE event = 'scroll_depth_milestone'
  AND properties.depth_percentage = 50
  AND properties.$pathname LIKE '%flyby-vs-cheers%' OR properties.$pathname LIKE '%flyby-vs-good-morning-pills%'
  AND timestamp > now() - INTERVAL 1 DAY
GROUP BY properties.$pathname
```

Expect non-zero scroll_50 events for both URLs once deployed.

## Conversion script

`/tmp/convert_flyby_content.py` (one-off, not committed). Maps each section type
to its markdown equivalent: paragraphs → text, headings → `##`/`###`, tables →
GFM pipe tables, alerts → `> **Tag:** ...` blockquotes (which the renderer
already recognizes), CTAs → markdown links. Re-runnable on the dhm1000 and
fuller-health files if/when those are scoped in.
