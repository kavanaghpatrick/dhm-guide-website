# Research — Issue #251 (HowTo schema backfill, Tier-1)

## Problem (from issue body)

PRD #251 ("SEO 10x: Add HowTo Schema to 15 Guide Posts") was simplified to
Tier 1 only — 4 high-impression hangover guide posts. Currently only 2 posts
in the corpus have a `howTo` JSON field; the rest of the guide-shaped
content is missing the schema entirely.

## Where the emission code lives

The `howTo` data on a post JSON is consumed by the prerender pipeline at
**`scripts/prerender-blog-posts-enhanced.js:258-272`**:

```js
if (post.howTo) {
  const howToSchema = generateHowToSchema({
    name: post.howTo.name,
    description: post.howTo.description,
    image: post.image ? `https://www.dhmguide.com${escapeHtml(post.image)}` : undefined,
    totalTime: post.howTo.totalTime,
    steps: post.howTo.steps,
    supply: post.howTo.supply || []
  });
  // ...inject as <script type="application/ld+json"> in <head>
}
```

The helper `generateHowToSchema` lives at
**`src/utils/structuredDataHelpers.js:114-140`** and emits a valid
`@type: "HowTo"` JSON-LD block with `step` (positioned), `supply`,
`totalTime`, `name`, `description`, optional `image`.

So the wiring is already in place — we just need to add `howTo` data to
post JSONs. **Zero code changes required.**

## Existing pattern (the shape)

Two posts already ship with `howTo`. Both use this exact key set:

```
{ name, description, totalTime, supply, steps }
```

Where `steps` is `[{ name, text }, ...]` — the prerender script reads
`post.howTo.steps` and the helper renames it to `step` (positioned) for
schema.org compliance.

The 4 new posts MUST match this shape exactly. Note the PRD template in the
issue body uses `"steps"` (plural) — that's correct; do NOT use `"step"`.

## Files that already have howTo (DO NOT MODIFY)

- `src/newblog/data/posts/dhm-dosage-guide-2025.json`
- `src/newblog/data/posts/when-to-take-dhm-timing-guide-2025.json`

## Files that need howTo added (THIS ISSUE)

1. `src/newblog/data/posts/how-to-cure-a-hangover-complete-science-guide.json`
2. `src/newblog/data/posts/how-to-get-rid-of-hangover-fast.json`
3. `src/newblog/data/posts/hangover-headache-fast-relief-methods-2025.json`
4. `src/newblog/data/posts/hangover-nausea-complete-guide-fast-stomach-relief-2025.json`

## Source for step content (no inventing)

For each post, the `step[]` array is **extracted from the post's existing
`content` field** — each post already lays out a numbered protocol that
maps cleanly onto 5–7 steps:

- **how-to-cure-a-hangover-complete-science-guide**: "Tier 1 DHM-Based
  Prevention Protocol" (Pre / During / Post sections) and "Tier 2 Enhanced
  Recovery Methods" together provide the natural step list. Steps are
  rephrased to remove "cure" language per medical-claims caution.
- **how-to-get-rid-of-hangover-fast**: "15-Minute Emergency Protocol" already
  has explicit Step 1 / Step 2 / Step 3 sections.
- **hangover-headache-fast-relief-methods-2025**: "15-Minute Emergency
  Hangover Headache Relief Protocol" already has 4 named steps; add 1–2
  more from the supplementation tier for a 5–6 step total.
- **hangover-nausea-complete-guide-fast-stomach-relief-2025**: "5-Minute
  Nausea Relief Technique" + Tier 1 "Most Effective" remedies provide steps.

## CRITICAL 2026 CONTEXT — Reset the PRD's CTR claim

**Google removed HowTo from rich-result eligibility in September 2023** as
part of their structured-data simplification. Specifically:
- HowTo rich results (the carousel-style step expansion in SERPs) are no
  longer shown for any queries.
- Health/medical-adjacent content (which all 4 of these posts qualify as)
  is additionally filtered out of remaining rich-result surfaces under
  YMYL safety policies.

Implication: The PRD's projected **+20–35% CTR uplift will not materialize**
from this work alone. **Reset expectation to 0–5%** organic CTR change.

The schema is still worth shipping because:
1. It is valid `application/ld+json` and validates clean in Schema.org
   validator + Google Rich Results Test (which still accepts it).
2. **AI Overviews (SGE) and LLM-driven discovery surfaces** (Perplexity,
   ChatGPT browsing, Claude.ai citation, Gemini grounding) DO ingest
   HowTo and use it for step-extraction. This is the actual value prop now.
3. It costs ~5 minutes per post to add and zero ongoing maintenance.

So the framing for this issue is:
- **Was**: "+20-35% CTR via Google rich snippets"
- **Now**: "Improves LLM/AI-Overview step-extraction; SERP CTR delta ≈ 0%"

PR description and the post-merge tracking issue (if any) should reflect this.

## Risk

- **Malformed JSON breaks the prerender** — every change must pass
  `JSON.parse` validation. The only safe author tool is `node -e` round-trip.
- **Medical-claim language** — avoid "cure", "treat", "fix" in step text.
  Use "manage", "support", "help relieve", "reduce". The guide posts'
  existing content already uses softer phrasing in most places; keep that
  voice.
- **Build-blocking risk: zero** — `howTo` is read with a truthy guard
  (`if (post.howTo)`). Posts without it skip the block. Adding a valid
  `howTo` only adds new HTML; it cannot regress existing prerender output.

## Verification path

```bash
npm run build
# then for each of the 4 slugs:
grep -oE '"@type":"HowTo"' "dist/never-hungover/<slug>/index.html" | head -1
```

All 4 must emit `"@type":"HowTo"`.
