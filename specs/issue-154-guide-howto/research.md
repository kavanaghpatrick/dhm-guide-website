# Research: HowTo Schema for `/guide` Route (Issue #154)

## Context

Issue #154 from the SEO/schema backlog: emit HowTo structured data on the
`/guide` route. Discovered while triaging the broader HowTo work that landed
in PR #251 (which added HowTo to 4 Tier-1 blog post JSONs). Issue #154 is the
remaining target — the React `Guide.jsx` page itself.

## Current state

- `Guide.jsx` (`src/pages/Guide.jsx`) is a static React component prerendered
  by `scripts/prerender-main-pages.js` (NOT by the blog-post enhanced script).
- The `/guide` route currently emits in its prerendered HTML:
  - `<title>` + meta description + OG/Twitter tags
  - `BreadcrumbList` JSON-LD (added via `generateBreadcrumbSchema`)
  - Article JSON-LD (added globally for all SPA pages — confirmed in dist)
- No HowTo schema is emitted anywhere on `/guide`.
- `generateHowToSchema` already exists in `src/utils/structuredDataHelpers.js`
  (lines 114-140) and is consumed by `scripts/prerender-blog-posts-enhanced.js`
  (lines 257-271) for blog posts via the `howTo` field on each post JSON.

## Visible step content on `/guide`

The page renders an explicit "3-Step Hangover Prevention Protocol" section
(`Guide.jsx` lines 205-330) with three numbered chronological steps:

1. **Before You Drink** (lines 235-244)
   - "Take 300-600mg DHM"
   - "30 minutes before your first drink"
   - Bullets: Activates liver enzymes; Primes alcohol metabolism;
     Reduces next-day headache risk
2. **While You Drink** (lines 258-267)
   - "Stay Hydrated + Optional Boost"
   - "Extra 300mg DHM if drinking heavily"
   - Bullets: Water between drinks; Keeps protection active through the
     night; Support metabolism
3. **Before Bed** (lines 281-290)
   - "Take 300-500mg DHM"
   - "With a glass of water"
   - Bullets: Clear remaining toxins; Support overnight recovery;
     Wake up refreshed

These three sections map cleanly onto a three-step `HowTo`. Schema content
must mirror what the page actually displays — Google's HowTo guideline is
that schema steps must reflect on-page content. The 3-step section is
labelled visibly as "The 3-Step Hangover Prevention Protocol".

## 2026 reality note (carries over from #251)

Google removed HowTo rich results from SERPs in **September 2023**. Health/
medical-adjacent content (which `/guide` qualifies as) is additionally
filtered under YMYL safety policy. **No SERP CTR uplift will materialize.**

The schema is still worth shipping because:
1. **AI Overviews (SGE), Perplexity, ChatGPT, Claude, Gemini** all ingest
   HowTo for step-extraction when grounding answers about "how to take DHM".
2. It validates clean in Schema.org validator and Rich Results Test.
3. ~10 minutes of work, zero maintenance burden.

Framing:
- **Was**: "+25-35% CTR via Google featured snippets"
- **Now**: "Improves LLM/AI-Overview grounding; SERP CTR delta ≈ 0%"

## Constraints

- Conservative health language: no "cure", "guarantee", "fix" in step text.
  Use "reduce", "support", "help", "manage". Step `name`/`text` must be
  factual and avoid medical claims.
- Schema must mirror visible page content exactly — no inventing steps that
  aren't on the page (Google guideline; failing this risks manual action).
- Must not break existing schemas already on `/guide` (Breadcrumb, Article).
- Must use existing `generateHowToSchema` helper for consistency with the
  blog-post code path shipped in #251.

## Mechanism

Mirror the `faqSchema` field pattern already used for `/research` in
`prerender-main-pages.js`:
1. Add `howToSchema` field to the `/guide` page entry in the `pages` array.
2. In the prerender loop, after the existing `faqSchema` block, emit a
   conditional `<script type="application/ld+json">` if `howToSchema` is set.
3. Build the schema body via `generateHowToSchema({...})` so we get the
   `@context`, `@type`, and `position` indexing for free.
