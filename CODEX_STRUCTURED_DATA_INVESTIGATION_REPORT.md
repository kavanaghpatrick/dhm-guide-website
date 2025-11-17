# Codex Structured Data Duplication Investigation Report

**Investigation Date:** 2025-11-17
**Codex Claim:** HIGH priority - Multiple schemas conflict on homepage
**Investigator:** Claude Code Agent
**Verdict:** ✓✓ ACCURATE - Codex claim is 100% correct

---

## Executive Summary

Codex's claim about duplicate/conflicting structured data on the homepage is **completely accurate**. The investigation found:

1. **TWO WebSite schemas** (one static, one runtime-injected duplicate)
2. **TWO Product schemas** (one static, one runtime-injected duplicate)
3. **BOTH Product schemas missing required 'image' field** (validation errors)
4. Total schemas after page load: **5 schemas** (3 static + 2 dynamic duplicates)

---

## Detailed Findings

### 1. Static Schemas in index.html (Lines 108-213)

#### WebSite Schema (Lines 108-134)
**Location:** `/Users/patrickkavanagh/dhm-guide-website/index.html:108-134`

**Fields:**
- `@type`: "WebSite"
- `name`: "DHM Guide"
- `alternateName`: "Dihydromyricetin Guide"
- `description`: "Science-backed hangover prevention guide..."
- `url`: "https://www.dhmguide.com"
- `author`: Organization object
- `publisher`: Organization object with logo
- `potentialAction`: SearchAction

**Status:** ✓ Valid, complete WebSite schema

---

#### Article Schema (Lines 139-170)
**Location:** `/Users/patrickkavanagh/dhm-guide-website/index.html:139-170`

**Fields:**
- `@type`: "Article"
- `headline`: "The Complete Guide to DHM..."
- `description`: "Comprehensive guide covering..."
- `author`: Organization object
- `publisher`: Organization object with logo
- `datePublished`: "2025-01-01"
- `dateModified`: "2025-06-28"
- `mainEntityOfPage`: WebPage with @id
- `image`: ImageObject with url
- `articleSection`: "Health & Wellness"
- `keywords`: Array of keywords

**Status:** ✓ Valid, complete Article schema

---

#### Product Schema (Lines 172-213)
**Location:** `/Users/patrickkavanagh/dhm-guide-website/index.html:172-213`

**Fields:**
- `@type`: "Product"
- `name`: "DHM (Dihydromyricetin) Supplements"
- `description`: "Natural hangover prevention supplements..."
- `category`: "Health Supplements"
- `brand`: Brand object with name
- `offers`: AggregateOffer (priceCurrency, lowPrice, highPrice, offerCount)
- `aggregateRating`: AggregateRating (ratingValue: 4.8, reviewCount: 500)
- `review`: Array with 1 Review object
- **MISSING:** `image` field (REQUIRED by Google)

**Status:** ⚠️ INVALID - Missing required 'image' field

---

### 2. Runtime-Injected Schemas

#### Duplicate WebSite Schema (useSEO.js)
**Source:** `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js:132-143`
**Trigger:** `/Users/patrickkavanagh/dhm-guide-website/src/pages/Home.jsx:43` - `useSEO(generatePageSEO('home'))`

**Injection Mechanism:**
1. useSEO hook runs on component mount (line 30)
2. Creates script element with `data-seo-hook="true"` attribute (line 101)
3. Appends to document.head (line 104)

**Fields:**
- `@type`: "WebSite"
- `name`: "DHM Guide"
- `description`: "Comprehensive guide to DHM..."
- `url`: "https://www.dhmguide.com"
- `potentialAction`: SearchAction

**Status:** ⚠️ DUPLICATE - Less complete than static version (missing author, publisher, alternateName)

---

#### Duplicate Product Schema (UserTestimonials.jsx)
**Source:** `/Users/patrickkavanagh/dhm-guide-website/src/components/UserTestimonials.jsx:152-179`
**Trigger:** `/Users/patrickkavanagh/dhm-guide-website/src/pages/Home.jsx:841` - `<UserTestimonials />`

**Injection Mechanism:**
1. Component renders (line 182)
2. generateReviewSchema() function creates schema (line 152)
3. Rendered via dangerouslySetInnerHTML (lines 462-466)

**Fields:**
- `@type`: "Product"
- `name`: "DHM (Dihydromyricetin) Supplement"
- `aggregateRating`: AggregateRating (ratingValue: 4.8, reviewCount: 50000)
- `review`: Array of Review objects (all testimonials)
- **MISSING:** `image` field (REQUIRED by Google)
- **MISSING:** `brand` field (recommended)
- **MISSING:** `offers` field (recommended)

**Status:** ⚠️ DUPLICATE + INVALID - Missing required 'image' field, less complete than static version

---

## Schema Count Summary

### Prerendered HTML (dist/index.html)
```
1. WebSite schema (static)
2. Article schema (static)
3. Product schema (static, INCOMPLETE - no image)

Total: 3 schemas
```

### After JavaScript Execution (Runtime)
```
1. WebSite schema (static) - ORIGINAL
2. WebSite schema (useSEO) - DUPLICATE ⚠️
3. Article schema (static) - ORIGINAL
4. Product schema (static, INCOMPLETE) - ORIGINAL
5. Product schema (UserTestimonials, INCOMPLETE) - DUPLICATE ⚠️

Total: 5 schemas (2 duplicates)
```

---

## Codex Claim Verification

### Claim 1: "index.html:108-178 has WebSite + Article + Product"
**Status:** ✓ ACCURATE
**Evidence:** Lines 108-134 (WebSite), 139-170 (Article), 172-213 (Product)
**Note:** Actual range is 108-213, but claim is directionally correct

### Claim 2: "useSEO.js:125-144 adds another WebSite schema"
**Status:** ✓ ACCURATE
**Evidence:** generatePageSEO('home') at lines 132-143 returns structuredData with WebSite schema
**Note:** Actual lines are 132-143, not 125-144, but claim is correct

### Claim 3: "UserTestimonials.jsx:151-179 adds Product schema without required fields"
**Status:** ✓ ACCURATE
**Evidence:** Lines 152-179 define generateReviewSchema() creating Product schema missing 'image' field
**Note:** Actual lines are 152-179, Codex range was close

### Overall Verdict
**✓✓ ACCURATE - Codex is 100% correct about duplicate/conflicting schemas**

---

## Impact Assessment

### SEO Impact
1. **Google Search Console Errors:** "Missing required field: image" warnings expected
2. **Duplicate Schemas:** Search engines must choose which WebSite/Product schema to trust
3. **Wasted Crawl Budget:** Duplicate data forces crawlers to parse redundant markup
4. **Rich Snippet Failures:** Invalid Product schemas may prevent rich results in SERPs
5. **Confusion for Bots:** Multiple conflicting schemas create ambiguity

### Validation Errors
```
ERROR: Product schema (index.html:172-213) - Missing required field: image
ERROR: Product schema (UserTestimonials.jsx:152-179) - Missing required field: image
WARNING: Duplicate WebSite schema detected (static + runtime injection)
WARNING: Duplicate Product schema detected (static + runtime injection)
```

### User-Facing Impact
- **Current:** Minimal (schemas are invisible to users)
- **Long-term:** May reduce click-through rates if rich snippets fail to appear

---

## Recommended Fixes

### Priority 1: Remove Duplicate WebSite Schema (HIGH)
**Problem:** useSEO adds redundant WebSite schema on homepage
**Solution:** Remove `structuredData` from generatePageSEO('home') return value

**File:** `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js`
**Lines:** 132-143

**Change:**
```javascript
case 'home':
  return {
    title: 'DHM Guide: Science-Backed Hangover Prevention That Actually Works',
    description: '...',
    keywords: '...',
    canonicalUrl: baseUrl,
    ogImage: `${baseUrl}/og-image.webp`,
    twitterImage: `${baseUrl}/twitter-image.webp`,
    // REMOVE the structuredData field - already in index.html
  };
```

**Impact:** Removes 1 duplicate WebSite schema

---

### Priority 2: Add Image to Static Product Schema (HIGH)
**Problem:** Product schema in index.html missing required 'image' field
**Solution:** Add image field to static Product schema

**File:** `/Users/patrickkavanagh/dhm-guide-website/index.html`
**Lines:** 172-213

**Change:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DHM (Dihydromyricetin) Supplements",
  "description": "Natural hangover prevention supplements containing Dihydromyricetin extracted from Japanese raisin tree",
  "image": "https://www.dhmguide.com/dhm-product-featured.jpg",  // ADD THIS
  "category": "Health Supplements",
  "brand": {
    "@type": "Brand",
    "name": "Various DHM Brands"
  },
  // ... rest of schema
}
```

**Impact:** Makes static Product schema valid per Google requirements

---

### Priority 3: Remove Duplicate Product Schema (MEDIUM)
**Problem:** UserTestimonials adds incomplete duplicate Product schema
**Solution:** Remove Product wrapper, inject reviews into static schema instead

**Option A (Quick Fix):** Remove the entire schema from UserTestimonials.jsx
**File:** `/Users/patrickkavanagh/dhm-guide-website/src/components/UserTestimonials.jsx`
**Lines:** Delete lines 461-467 (schema script tag)

**Option B (Better):** Consolidate reviews into static Product schema in index.html
**Approach:**
1. Move UserTestimonials review data to index.html Product schema
2. Remove dynamic schema injection from UserTestimonials.jsx
3. Keep testimonials as visual UI elements only

**Impact:** Removes 1 duplicate Product schema, eliminates validation errors

---

### Priority 4: Verify with Google Tools (LOW)
**After fixes, validate:**
1. Google Rich Results Test: https://search.google.com/test/rich-results
2. Google Search Console: Check "Enhancements" > "Products"
3. Schema.org Validator: https://validator.schema.org/

---

## Files Involved

### Read-Only (Evidence)
1. `/Users/patrickkavanagh/dhm-guide-website/index.html` (lines 108-213)
2. `/Users/patrickkavanagh/dhm-guide-website/dist/index.html` (prerendered output)
3. `/Users/patrickkavanagh/dhm-guide-website/src/pages/Home.jsx` (lines 43, 841)

### Requires Modification
1. `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js` (lines 132-143)
2. `/Users/patrickkavanagh/dhm-guide-website/index.html` (lines 172-213)
3. `/Users/patrickkavanagh/dhm-guide-website/src/components/UserTestimonials.jsx` (lines 461-467)

---

## Testing Evidence

### Live Site Verification
```bash
curl -s https://www.dhmguide.com/ | grep -c '<script type="application/ld+json">'
# Output: 3 (prerendered HTML only - runtime injection not captured by curl)
```

### Local Build Verification
```bash
grep -c '<script type="application/ld+json">' /Users/patrickkavanagh/dhm-guide-website/dist/index.html
# Output: 3 (WebSite, Article, Product)
```

### Schema Type Extraction
```bash
grep -A 3 '<script type="application/ld+json">' /Users/patrickkavanagh/dhm-guide-website/dist/index.html | grep '"@type"'
# Output:
# "@type": "WebSite",
# "@type": "Article",
# "@type": "Product",
```

---

## Conclusion

**Codex's claim is 100% accurate.** The homepage has:
- 2 duplicate schemas (WebSite, Product)
- 2 invalid schemas (both Product schemas missing required 'image' field)
- Total of 5 schemas after page load (3 static + 2 dynamic)

**Priority:** HIGH - Affects SEO, rich snippets, and Google Search Console validation

**Effort to Fix:** LOW - 3 simple code changes (remove 2 duplicates, add 1 image field)

**Expected ROI:** HIGH - Clean schemas, valid rich results, better crawl efficiency

---

## Next Steps

1. Create GitHub issue for structured data cleanup
2. Implement Priority 1 fix (remove duplicate WebSite schema)
3. Implement Priority 2 fix (add image to static Product schema)
4. Implement Priority 3 fix (remove duplicate Product schema)
5. Deploy to preview environment
6. Validate with Google Rich Results Test
7. Deploy to production
8. Monitor Google Search Console for validation status
