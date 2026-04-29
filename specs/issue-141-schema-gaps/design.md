# Design: Issue #141 Schema Gaps

## Architecture

The prerender script (`scripts/prerender-main-pages.js`) already supports adding optional schema fields per page entry. Each page object can carry a `faqSchema` field; the loop checks for its presence and injects a `<script type="application/ld+json">` tag into the prerendered HTML.

This design extends that pattern with one new field type (`itemListSchema`) and adds two new `faqSchema` instances.

## Changes

### 1. Shared product data file
`src/data/topProducts.json` (new) — extracted from `Reviews.jsx` `topProducts` array. The Reviews page imports it; the prerender script imports it. Single source of truth.

Each product entry retains the full shape used by Reviews.jsx (name, brand, rating, reviews, price, etc.) so no behavior changes.

### 2. Reviews.jsx
Replace inline `const topProducts = [ ... ]` with `import topProducts from '@/data/topProducts.json'`. Zero behavioral change; same data.

### 3. structuredDataHelpers.js
Add `generateItemListSchema({ name, description, products, baseUrl })`:
- Returns `{ "@context", "@type": "ItemList", name, description, numberOfItems, itemListElement: [...] }`
- Each `itemListElement` is a `ListItem` containing a nested `Product` with name, url, image, aggregateRating, offers.
- `image` is derived from a deterministic mapping (since `topProducts` doesn't have an image field, use a placeholder of the OG image OR an Amazon image proxy URL — whichever is consistent with what the visible page shows).

Decision: Inspect Reviews.jsx more carefully for what product image (if any) is rendered. If no image, omit image OR fall back to the page's OG image.

### 4. prerender-main-pages.js
- Add `faqSchema` field to `/guide` page entry — 6 Q&As verbatim from Guide.jsx:541-571.
- Add `faqSchema` field to `/dhm-dosage-calculator` page entry — 6 Q&As verbatim from DosageCalculatorEnhanced.jsx:1877-1901.
- Add `itemListSchema` field to `/reviews` page entry — built inline from imported `topProducts.json`.
- Add a new conditional block in the loop that mirrors the existing `faqSchema` injection pattern, keyed on `itemListSchema`.

## Schema content (verbatim extracts)

### /guide FAQ (6 items)
```
1. Q: How fast does DHM work?
   A: DHM starts working within 30 minutes. Peak effects occur 1-2 hours after taking it.
2. Q: Can I take too much DHM?
   A: DHM is very safe. Studies show no serious side effects at doses up to 1,200mg daily.
3. Q: Does it work with all alcohol?
   A: Yes - beer, wine, liquor, cocktails. DHM works by helping your liver process alcohol faster.
4. Q: What if I forget to take it before?
   A: Take it as soon as you remember, even while drinking. Late is better than never. For emergency situations, see our emergency hangover protocol.
5. Q: Is DHM expensive?
   A: Quality DHM costs $20-35/month. Compare that to weekend hangover recovery costs.
6. Q: Where do I buy good DHM?
   A: We've tested 10+ brands. See our top picks → or read specific reviews like our Flyby Recovery analysis.
```
Emoji prefixes (❓💊🍺🤔💰📦) are decorative UI only; they're not part of the question text and are stripped from schema.

For inline Link components, the schema uses the rendered plain text without the linked-out destination markup. Per Google guidance, schema text need not include surrounding HTML; the question/answer text reproduced is what the user sees.

### /dhm-dosage-calculator FAQ (6 items)
Already in plain question/answer object form in DosageCalculatorEnhanced.jsx:1877-1901 — copy verbatim.

### /reviews ItemList (10 items)
Position 1-10 in the same order as `topProducts` array. Each item exposes:
- name (from `topProducts[i].name`)
- url (`https://www.dhmguide.com/reviews#product-${i+1}` OR the affiliate URL — Google prefers a same-site URL for the "url" of the product within an ItemList; affiliate URL goes inside Offer if used)
- aggregateRating { ratingValue, reviewCount }
- offers { price, priceCurrency: 'USD', availability, url: affiliateLink }

Image: omitted if not present in topProducts (Google ItemList carousel allows omission; ratings + name + url are minimum).
