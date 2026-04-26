# Research — Issue #292 Quick Answer

## Existing Pattern (dhm-dosage-guide-2025)
- **Not** a structured field. The dosage guide opens with `## Quick Answers to Your DHM Dosage Questions` followed by 4 Q/A pairs, all in markdown content.
- That style works as embedded content, but doesn't give us a separately-extractable schema field for AI engines or structured data downstream.
- For top-30 backfill, simpler approach: add a `quickAnswer` JSON field, render once at top of article body in a distinct callout.

## Component (NewBlogPost.jsx)
- Article body wrapper: `<div className="prose prose-lg prose-green max-w-none enhanced-typography">` at `src/newblog/components/NewBlogPost.jsx:938`.
- `KeyTakeaways` component renders just before the prose block at line 932. Right place for Quick Answer is **above KeyTakeaways**, immediately under article header — that's the AI-citation sweet spot (first ~100 words of body).
- Existing Alert callout style (`InlineReviewsCTA` line 54, `**Pro Tip**` Alert line 126): green-50 bg, border-l-4 border-green-600. We'll use `border-blue-600 / bg-blue-50` to differentiate from CTA/pro-tip and signal "this is the answer".
- Use `not-prose` class so the prose wrapper doesn't restyle it.

## JSON Post Structure
- Posts in `src/newblog/data/posts/*.json` have flat top-level fields: `title`, `slug`, `excerpt`, `metaDescription`, `date`, `author`, `tags`, `image`, `content`.
- New field `quickAnswer` (string, ~100-160 chars, plain text — no markdown) sits alongside `excerpt`. Optional; absent means no callout renders.

## Top 30 Posts (PostHog last 30d, ordered by pageviews)
| PV  | Slug |
|-----|------|
| 461 | dhm-dosage-guide-2025 |
| 350 | hangover-supplements-complete-guide-what-actually-works-2025 |
| 313 | dhm-randomized-controlled-trials-2024 |
| 151 | flyby-vs-cheers-complete-comparison-2025 |
| 115 | when-to-take-dhm-timing-guide-2025 |
| 86  | complete-guide-asian-flush-comprehensive |
| 74  | dhm-vs-zbiotics |
| 72  | nac-vs-dhm-which-antioxidant-better-liver-protection-2025 |
| 60  | dhm1000-review-2025 |
| 58  | flyby-vs-good-morning-pills-complete-comparison-2025 |
| 42  | flyby-recovery-review-2025 |
| 41  | dhm-depot-review-2025 |
| 39  | can-you-take-dhm-every-day-long-term-guide-2025 |
| 37  | dhm-vs-prickly-pear-hangovers |
| 36  | italian-drinking-culture-guide |
| 34  | peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025 |
| 34  | dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025 |
| 34  | double-wood-vs-toniiq-ease-dhm-comparison-2025 |
| 33  | fuller-health-after-party-review-2025 |
| 31  | double-wood-vs-no-days-wasted-dhm-comparison-2025 |
| 30  | good-morning-hangover-pills-review-2025 |
| 27  | double-wood-vs-cheers-restore-dhm-comparison-2025 |
| 26  | natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025 |
| 25  | flyby-vs-no-days-wasted-complete-comparison-2025 |
| 24  | toniiq-ease-dhm-review-analysis |
| 21  | no-days-wasted-vs-toniiq-ease-dhm-comparison-2025 |
| 21  | no-days-wasted-vs-dhm1000-comparison-2025 |
| 19  | no-days-wasted-vs-fuller-health-after-party-comparison-2025 |
| 19  | alcohol-protein-synthesis-muscle-recovery-impact-guide-2025 |
| 17  | how-long-does-hangover-last |

## Decisions
1. **Auto-extract** from `excerpt` field where present — most posts already have a 1-2 sentence summary that doubles perfectly as a Quick Answer. Falls back to first paragraph of content if excerpt is empty.
2. Trim to ~150 chars, ensure ends with `.` or `!`.
3. Render component above KeyTakeaways (first thing in prose container).
4. Skip dhm-dosage-guide-2025 — it has the markdown pattern and we don't want a duplicate.
5. Skip any post with existing `quickAnswer` field (idempotent).

## Constraints applied
- Match existing Alert/callout idiom (rounded, border-left, distinct color)
- 30 posts only — not all 189
- Component change is one block before KeyTakeaways — minimal diff
