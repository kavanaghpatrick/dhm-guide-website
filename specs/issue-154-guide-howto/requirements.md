# Requirements: HowTo Schema for `/guide` Route (Issue #154)

## Goal

Emit a valid `HowTo` JSON-LD block in the prerendered HTML for `/guide`
that mirrors the visible "3-Step Hangover Prevention Protocol" section on
the page.

## Functional requirements

- **R1**: Prerendered `dist/guide/index.html` MUST contain at least one
  `<script type="application/ld+json">` block with `"@type":"HowTo"`.
- **R2**: The HowTo schema MUST contain exactly 3 steps, mirroring the
  visible "Before You Drink" / "While You Drink" / "Before Bed" sections
  on the page.
- **R3**: Each step MUST have a `name` and `text` field. Step text MUST
  use conservative health language (no "cure", "guarantee", "fix").
- **R4**: The HowTo schema MUST include `name`, `description`, and
  `totalTime` top-level fields.
- **R5**: Existing schemas on `/guide` (BreadcrumbList, Article) MUST
  continue to be emitted — this change is additive only.
- **R6**: HowTo schema for the 4 blog posts shipped in PR #251 MUST
  continue to emit — this change must not regress the blog-post code path.

## Non-functional requirements

- **N1**: Implementation MUST reuse `generateHowToSchema` from
  `src/utils/structuredDataHelpers.js` (same helper used by the blog-post
  prerenderer). No inline schema construction.
- **N2**: The change MUST be limited to `scripts/prerender-main-pages.js`.
  No edits to React components, JSON files, or unrelated scripts.
- **N3**: The data shape for the new `howToSchema` field on the page entry
  SHOULD mirror the existing `faqSchema` field pattern — i.e. the schema
  object is precomputed in the `pages` array, and the prerender loop just
  conditionally appends the `<script>` tag.

## Acceptance criteria

- `npm run build` succeeds with no new errors.
- `grep -oE '"@type":"HowTo"' dist/guide/index.html` returns at least one
  match.
- `grep -oE '"@type":"(BreadcrumbList|Article|HowTo)"' dist/guide/index.html
  | sort -u` returns all three types.
- Tier-1 blog posts that ship HowTo (issue #251 work, e.g.
  `dhm-dosage-guide-2025`) still emit `"@type":"HowTo"` after the rebuild.
- Schema validates clean in Google Rich Results Test (manual check).

## Out of scope

- Adding HowTo to other main pages (e.g. `/dhm-dosage-calculator`,
  `/reviews`). Only `/guide` per issue scope.
- Updating client-side `useSEO` hook to inject HowTo for SPA navigation.
  Crawlers and LLM grounders read prerendered HTML; client-side injection
  is unnecessary.
- Adding HowTo to additional blog posts (covered separately in #251 / future
  issues).
