# Design: HowTo Schema for `/guide` Route (Issue #154)

## Architecture decision

Add an optional `howToSchema` field to the `/guide` entry in the `pages`
array of `scripts/prerender-main-pages.js`, then emit it as a JSON-LD
script in the prerender loop. This mirrors the existing `faqSchema`
pattern used for `/research`.

Rationale:
- Single file change, ~30 lines added.
- No new abstraction — reuses the same helper (`generateHowToSchema`) that
  the blog-post prerenderer (#251) already uses, so HowTo emission logic
  is consistent across the two code paths.
- The `pages` array is the existing single source of truth for per-route
  metadata; adding `howToSchema` there keeps everything declarative.

## Implementation

### 1. Import the helper

At the top of `prerender-main-pages.js`, extend the existing import:

```js
import {
  generateBreadcrumbSchema,
  generateHowToSchema,
} from '../src/utils/structuredDataHelpers.js';
```

### 2. Author the HowTo content

Add a `howToSchema` field on the `/guide` page entry. The schema is
precomputed by calling `generateHowToSchema({...})` inline so the `pages`
array stays self-describing.

Step content (mirroring `Guide.jsx` lines 235-290):

| # | Section name (visible) | Step `name`             | Step `text` source                                          |
|---|------------------------|--------------------------|-------------------------------------------------------------|
| 1 | Before You Drink       | Take DHM before drinking | 300-600mg DHM, 30 min before first drink + benefit bullets  |
| 2 | While You Drink        | Stay hydrated and optionally re-dose | Water between drinks; +300mg DHM if heavy        |
| 3 | Before Bed             | Take DHM before bed      | 300-500mg DHM with a glass of water + benefit bullets       |

`totalTime` uses ISO 8601 duration. The protocol spans an evening, so
`PT8H` (8 hours from first dose to morning) is appropriate.

`description` is a one-sentence summary of the 3-step protocol.

`supply` lists the consumables: DHM supplement, water.

### 3. Emit the schema

In the loop, after the existing `faqSchema` block, add:

```js
if (page.howToSchema) {
  const howToScript = document.createElement('script');
  howToScript.setAttribute('type', 'application/ld+json');
  howToScript.textContent = JSON.stringify(page.howToSchema);
  document.head.appendChild(howToScript);
}
```

This is structurally identical to the FAQ block immediately above.

## Verification

Build and verify schema emission and that no regressions occurred:

```bash
npm run build
grep -oE '"@type":"HowTo"' dist/guide/index.html        # >= 1
grep -oE '"@type":"(BreadcrumbList|Article|HowTo)"' \
  dist/guide/index.html | sort -u                         # all 3
grep -l '"@type":"HowTo"' dist/never-hungover/*/index.html | wc -l
# >= 4 (the 4 Tier-1 posts from #251)
```

## Risk and rollback

- **Risk**: malformed `howToSchema` object would crash `JSON.stringify` or
  emit invalid JSON-LD. Mitigation: reuse `generateHowToSchema` (validated
  by #251 prod use) and keep step strings simple.
- **Rollback**: revert the single commit on `scripts/prerender-main-pages.js`.
  No schema/data file changes to roll back.
