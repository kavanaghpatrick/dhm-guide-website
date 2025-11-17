# PRD: Fix Duplicate/Invalid Structured Data (Issue #3)

## Problem Statement
Homepage has 5 total schemas with 2 duplicates (WebSite, Product) and 2 invalid Product schemas missing required 'image' field, blocking rich results in Google search.

**CRITICAL SPA Issue**: Product schema in index.html appears on ALL routes (/, /guide, /research, etc.) because Vite/Vercel serves index.html for all SPA navigation. This causes schema mislabeling on non-product pages.

## Current State (Evidence)
**Schema inventory:**
1. `index.html:108-134` - WebSite schema (valid)
2. `index.html:139-170` - Article schema (valid)
3. `index.html:172-213` - Product schema (**INVALID** - missing 'image')
4. `useSEO.js:132-143` - WebSite schema (duplicate)
5. `UserTestimonials.jsx:152-179` - Product schema (**INVALID** - missing 'image', 'brand', 'offers')

**Problems:**
- 2 WebSite schemas (duplicate)
- 2 Product schemas (both invalid)
- Rich results blocked by validation errors

## Proposed Solution (Two Actions)
1. **DELETE duplicate schemas** (useSEO.js WebSite, UserTestimonials Product)
2. **FIX invalid Product schema** (add 'image' field to index.html Product)

## Expected Outcome
- ✅ 3 total schemas (WebSite, Article, Product) - all valid
- ✅ Rich results eligibility for product pages
- ✅ No duplicate schema warnings in Search Console
- ✅ Improved CTR from product snippets

## Implementation Details

### Change 1: Delete Duplicate WebSite Schema (5 min)

**File**: `src/hooks/useSEO.js`
**Action**: Remove structuredData from homepage case

```js
// BEFORE (lines 125-144)
case 'home':
  return {
    title: 'DHM Guide: Prevent 87% of Hangovers...',
    description: '...',
    structuredData: {  // DELETE THIS ENTIRE OBJECT
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DHM Guide",
      // ... rest of duplicate WebSite schema
    }
  };

// AFTER
case 'home':
  return {
    title: 'DHM Guide: Prevent 87% of Hangovers...',
    description: '...'
    // No structuredData - homepage uses index.html schemas
  };
```

### Change 2: Delete Duplicate Product Schema (5 min)

**File**: `src/components/UserTestimonials.jsx`
**Action**: Delete schema injection code

```jsx
// BEFORE (lines 461-467)
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateReviewSchema())
  }}
/>

// AFTER
// DELETE the entire script tag
// UserTestimonials is NOT a product, doesn't need Product schema
```

### Change 3: Fix Invalid Product Schema (10 min)

**File**: `index.html`
**Action**: Add missing 'image' field + validate required Product fields

```json
// BEFORE (lines 172-213)
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DHM (Dihydromyricetin) Supplements",
  "description": "Natural hangover prevention supplements...",
  "category": "Health Supplements",
  // MISSING: "image" field (required)
  "brand": {
    "@type": "Brand",
    "name": "Various DHM Brands"
  },
  "offers": { /* ... */ },  // VERIFY: has price, priceCurrency, availability
  "aggregateRating": { /* ... */ }
}

// AFTER
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DHM (Dihydromyricetin) Supplements",
  "description": "Natural hangover prevention supplements...",
  "category": "Health Supplements",
  "image": "https://www.dhmguide.com/dhm-product-featured.jpg",  // ADD THIS
  "brand": {
    "@type": "Brand",
    "name": "Various DHM Brands"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "18.99",
    "highPrice": "47.00",
    "offerCount": 10
    // VERIFY: Should add "availability": "InStock"
  },
  "aggregateRating": { /* ... */ }
}
```

**Note**: Product schema will still appear on all SPA routes (see "SPA Schema Strategy" below). Consider moving Product schema to a dedicated /products page or removing from homepage entirely.

## Time Estimate
- **Change 1** (delete useSEO WebSite): 5 minutes
- **Change 2** (delete UserTestimonials Product): 5 minutes
- **Change 3** (add image + validate Product schema): 10 minutes
- **Testing**: 20 minutes (validate schemas on multiple routes, rebuild)
- **Total**: 40 minutes

## Testing Checklist
- [ ] Run `npm run build` successfully
- [ ] Check `dist/index.html` - count schemas (should be 3: WebSite, Article, Product)
- [ ] Validate homepage with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] **Test Product schema on multiple routes** - verify it appears on /guide, /research (SPA issue)
- [ ] Confirm Product schema shows "Valid" with all required fields (image, offers, price)
- [ ] Verify no duplicate WebSite schemas
- [ ] Check browser console - no schema errors
- [ ] Verify UserTestimonials component no longer injects Product schema

## Simplicity Check
- ✅ "What can I DELETE?" YES - 2 entire schemas deleted
- ✅ "Can I explain this in one sentence?" YES - Delete duplicates, fix invalid
- ✅ "Does this solve a problem we actually have?" YES - Blocked rich results
- ✅ "Is there a 10x simpler solution?" NO - This IS deletion (simplest)
- ✅ "Does this add more than 20 lines of code?" NO - Net NEGATIVE lines (deletions)

## Risks
- ❌ **None** - Pure deletion + one field addition
- ✅ Schemas in index.html remain as single source of truth
- ✅ No new schema complexity added

## Success Metrics
- Google Rich Results Test shows "Valid" for all schemas
- Product snippets eligible in search results
- Search Console shows no duplicate schema warnings
- Potential CTR increase from rich results (measure 2-4 weeks post-fix)

## Schema Strategy Going Forward
**Single Source of Truth Pattern:**
- Static pages (home): Schemas in `index.html` only
- Dynamic pages (blog): Schemas in prerender scripts only
- Components: NO schema injection (avoid runtime duplicates)

This fix reinforces the "Pattern #11: Prerendered SPAs Have Dual SEO Sources" - keep ONE source per page.

## SPA Schema Strategy (Future Improvement)
**Known Issue**: index.html serves for ALL SPA routes, so Product schema appears on non-product pages.

**Options to fix:**
1. **Remove Product schema from index.html** - Only keep WebSite + Article
2. **Client-side schema injection** - Add Product schema only on specific routes (violates Pattern #11)
3. **Create dedicated /products page** - Move Product schema to a static product listing page
4. **Use Review schema for testimonials** - Replace UserTestimonials Product with proper Review/AggregateRating schema

**Recommendation for this PR**: Fix the immediate issues (duplicates + invalid fields). Address SPA schema routing in a separate issue.
