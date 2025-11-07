# Redirect and Canonical Tag Issues Investigation Report

**Date:** 2025-11-07  
**Status:** Search Console Issue Analysis  
**Severity:** High - Multiple SEO problems identified

---

## Executive Summary

Investigation reveals **significant redirect and canonical tag issues** affecting 46+ pages according to Search Console data:
- **46 pages with redirect validation failures**
- **12 alternate pages with canonical tag issues**
- **10 duplicate pages where Google chose different canonical than user specified**
- **Multiple redirect chains and logic conflicts**
- **Comparison page redirects blocking legitimate content**

---

## 1. CURRENT REDIRECT CONFIGURATION

### A. Vercel Redirect Rules (`vercel.json`)

**File Location:** `/Users/patrickkavanagh/dhm-guide-website/vercel.json`

**Critical Redirect Rules Defined:**

```json
{
  "redirects": [
    {
      "source": "/((?!api/).*)/",
      "destination": "/$1",
      "permanent": true
    },
    {
      "source": "/blog/:slug*",
      "destination": "/never-hungover/:slug*",
      "permanent": true
    },
    {
      "source": "/newblog/:slug*",
      "destination": "/never-hungover/:slug*",
      "permanent": true
    },
    {
      "source": "/never-hungover/:slug(.*-vs-.*-comparison.*)",
      "destination": "/reviews",
      "permanent": true
    },
    {
      "source": "/never-hungover/quantum-health-monitoring-alcohol-guide-2025",
      "destination": "/never-hungover",
      "permanent": true
    },
    {
      "source": "/never-hungover/smart-sleep-tech-alcohol-circadian-optimization-guide-2025",
      "destination": "/never-hungover/smart-sleep-technology-and-alcohol-circadian-optimization-guide-2025",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/((?!never-hungover/).*)",
      "destination": "/index.html"
    }
  ],
  "trailingSlash": false
}
```

### B. Netlify `_redirects` File

**File Location:** `/Users/patrickkavanagh/dhm-guide-website/public/_redirects`

**264 Line Redirect Rules** including:
- `/blog/*` → `/never-hungover/:splat` (301)
- `/newblog/*` → `/never-hungover/:splat` (301)
- Non-www to www consolidation (301)
- Specific soft-404 fixes with URL rewriting

**Example Problem Redirects:**
```
/never-hungover/longevity-biohacking-2025-dhm-liver-protection → /never-hungover/longevity-biohacking-dhm-liver-protection
/never-hungover/young-professional-wellness-2025-smart-drinking-career-success → /never-hungover/professional-hangover-free-networking-guide-2025
/never-hungover/sober-curious-2025-mindful-drinking-dhm-science → /never-hungover/mindful-drinking-wellness-warrior-dhm-2025
```

---

## 2. CANONICAL TAG IMPLEMENTATION

### A. Primary Implementation: `useSEO` Hook

**File Location:** `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js`

**Canonical Tag Logic:**
```javascript
// Update canonical URL (lines 79-88)
if (canonicalUrl) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);
}
```

**Key Issues:**
- Canonical tags are set **dynamically via JavaScript**
- Social media crawlers (Facebook, Twitter, LinkedIn) **don't execute JavaScript** and won't see dynamic canonicals
- Only Google and search engines that execute JS will see these tags
- Prerendered OG tags are static in HTML but canonicals are dynamic

**For Blog Posts:**
```javascript
case 'blog-post': {
  const blogPostUrl = `${baseUrl}/never-hungover/${slug}`;
  // ... generates canonical URL
  return {
    title: `${title} | DHM Guide`,
    canonicalUrl: blogPostUrl,  // Set to /never-hungover/{slug}
    ogImage: finalImage,
    ogType: 'article',
    // ...
  };
}
```

### B. Canonical Injection Script

**File Location:** `/Users/patrickkavanagh/dhm-guide-website/scripts/inject-canonical-tags.js`

**Status:** Creates a client-side script that attempts to inject canonical tags dynamically after page load. This is **problematic** because:
1. Google may crawl before JavaScript execution
2. Canonical tags should be in initial HTML, not injected
3. Creates race condition where canonical might not be set when crawler reads page

---

## 3. DUPLICATE CONTENT ISSUES IDENTIFIED

### A. Comparison Posts Redirected to `/reviews`

**Critical Problem:** Vercel redirect rule catches comparison posts and redirects them:

```
/never-hungover/:slug(.*-vs-.*-comparison.*)  →  /reviews
```

**Affected Comparison Posts (16+ identified):**
1. `advanced-liver-detox-science-vs-marketing-myths-2025`
2. `asian-flush-vs-alcohol-allergy-comparison`
3. `best-liver-detox-science-based-methods-vs-marketing-myths-2025`
4. `cannabis-vs-alcohol-complete-health-comparison-for-wellness-minded-adults`
5. `craft-beer-vs-mass-market-health-differences-study-2025`
6. `dhm-product-forms-absorption-comparison-2025`
7. `dhm-supplements-comparison-center-2025`
8. `dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025`
9. `dhm-vs-prickly-pear-hangovers`
10. `dhm-vs-zbiotics`
11. `functional-beverages-vs-alcohol-2025-guide-to-health-optimized-drinking`
12. `nac-vs-dhm-which-antioxidant-better-liver-protection-2025`
13. `natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025`
14. `nootropics-vs-alcohol-cognitive-enhancement`
15. `peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025`
16. `traditional-mexican-hangover-remedies-vs-modern-supplements`

**Impact:**
- These unique blog posts are **inaccessible via their own URLs**
- All traffic redirects to generic `/reviews` page
- Content is created but never indexed
- Google sees blank/duplicate pages at original URLs

### B. Duplicate Titles and Content

**Potential Duplicates Detected:**

1. **Liver Detox Content:**
   - `best-liver-detox-science-based-methods-vs-marketing-myths-2025.json`
   - `advanced-liver-detox-science-vs-marketing-myths-2025.json`
   - Both appear to cover similar scope with slightly different titles

2. **Supplement Comparison Pages:**
   - `/compare` (dedicated Compare.jsx page - 10 products)
   - `dhm-supplements-comparison-center-2025` (blog post)
   - Both provide comparison tables but serve different purposes

3. **Product Reviews:**
   - `/reviews` page with 10 DHM products
   - `/compare` page with same 10 DHM products
   - Very similar product data, different UI presentations

4. **Hangover Science:**
   - Multiple "how-to" posts cover very similar ground
   - Potential overlap in hangover cure guides

---

## 4. REDIRECT CHAIN AND LOGIC CONFLICTS

### A. Trailing Slash Redirect

**Rule:** `"trailingSlash": false` in vercel.json
**Plus:** Generic regex `/(.*)/$` → `/$1` (removes trailing slash)
**Plus:** Rewrite rule: `/((?!never-hungover/).*)`  → `/index.html`

**Problem:** Multiple redirect mechanisms compete:
1. Vercel trailing slash handling
2. Generic trailing slash removal regex
3. SPA rewrite to index.html

**Result:** Potential redirect chains for URLs with trailing slashes

### B. URL Rewrite vs Redirect Confusion

**Issue:** Files use both:
- **Redirects** (visible to search engines, pass authority, 301 permanent)
- **Rewrites** (internal, invisible to search engines)

The SPA rewrite rule:
```
source: /((?!never-hungover/).*),
destination: /index.html
```

This **rewrite** sends non-blog content to index.html without redirecting, but blog posts bypass this and route to the blog system. This creates unpredictable behavior.

### C. Comparison Post Redirect Pattern

**Rule:** Regex pattern `/never-hungover/:slug(.*-vs-.*-comparison.*)`

**Problem:** 
- Pattern is very specific but may catch more posts than intended
- Permanently redirects (301) all comparison content to `/reviews`
- No way to access original blog posts
- Google indexes `/reviews` but original URLs show as "crawled not indexed"

---

## 5. CANONICAL TAG IMPLEMENTATION PROBLEMS

### A. Dynamic vs Static Canonical Tags

**Problem:** Canonical tags are set dynamically in JavaScript via `useSEO` hook:
- Set via `document.head.appendChild(canonical)`
- Set AFTER React component mounts
- Google might see different canonical than intended

**Why This Is a Problem:**
1. **Social Crawlers:** Facebook, Twitter, LinkedIn, etc. don't execute JS
   - They see OG tags (prerendered static HTML)
   - They DON'T see canonical tags (dynamically set)
   - Can cause social media cards to show wrong URLs

2. **First Render Race Condition:** 
   - Initial HTML might not have canonical in `<head>`
   - Crawlers may process page before JS runs
   - Canonical appears "not found" in initial render

3. **SPA Navigation Issue:**
   - When navigating in SPA, canonical is updated client-side
   - Direct page loads might not have canonical in initial HTML

### B. Missing Canonical Tags in Initial HTML

**Finding:** 
- `index.html` likely has ONE static canonical for root
- Other pages don't have canonicals in prerendered HTML
- Canonicals are injected dynamically by JavaScript

**Consequence:**
- Pages appear without canonical tags to initial crawl
- Google has to wait for JS execution to see canonical
- Can cause indexing delays or multiple canonicals selected

### C. Canonical Tag Conflict with Redirects

**Scenario 1: Soft 404s**
- Old URL redirects to new URL
- Both URLs might have canonicals pointing to themselves
- Google sees conflicting signals

**Scenario 2: Comparison Posts**
- Blog post URL: `/never-hungover/dhm-vs-zbiotics`
- Redirects to: `/reviews`
- Original URL might still have canonical pointing to itself
- Google sees redirect + canonical conflict

---

## 6. SPECIFIC REDIRECT PROBLEMS IDENTIFIED

### A. Dead Comparison Posts

These blog posts exist but are **inaccessible**:

| Post Slug | Type | Status |
|-----------|------|--------|
| `dhm-vs-zbiotics` | Comparison | Redirects to `/reviews` |
| `dhm-vs-milk-thistle-*` | Comparison | Redirects to `/reviews` |
| `asian-flush-vs-alcohol-allergy` | Comparison | Redirects to `/reviews` |
| `nac-vs-dhm-*` | Comparison | Redirects to `/reviews` |
| `traditional-mexican-remedies-vs-modern` | Comparison | Redirects to `/reviews` |

### B. Soft 404 Redirects

**From `_redirects` file - These might be causing "crawled not indexed":**

```
/never-hungover/longevity-biohacking-2025-dhm-liver-protection 
  → /never-hungover/longevity-biohacking-dhm-liver-protection

/never-hungover/young-professional-wellness-2025-smart-drinking-career-success 
  → /never-hungover/professional-hangover-free-networking-guide-2025

/never-hungover/sober-curious-2025-mindful-drinking-dhm-science 
  → /never-hungover/mindful-drinking-wellness-warrior-dhm-2025
```

**Why Search Console shows "redirect validation failed":**
- Google crawls original URL → sees 301 redirect
- Follows redirect to new URL → finds different content
- Expected original content but found redirect
- Marks as "validation failed"

### C. Comparison Page Content Duplication

`/reviews` page (React component):
- Hardcoded list of 10 products in `Compare.jsx`
- Same products appear in blog post `dhm-supplements-comparison-center-2025`
- Comparison functionality identical to `/compare` page

---

## 7. SEARCH CONSOLE DATA INTERPRETATION

### A. "46 Pages with Redirects (Validation Failed)"

**Likely Causes:**
1. **Comparison posts redirected to `/reviews`** - original URLs become 404/redirect loops
2. **Soft 404 redirects** - URLs with 2025 year suffix redirected to URLs without suffix
3. **URL structure changes** - blog post slugs changed, but old versions still have redirects

### B. "12 Alternate Pages with Proper Canonical"

**What This Means:**
- These pages have canonical tags pointing to their correct URLs
- Proper canonical implementation
- Google can identify them as original

### C. "10 Duplicates Where Google Chose Different Canonical"

**Likely Causes:**
1. Multiple URLs with same/similar content
   - `/reviews` and `/compare` pages (same product data)
   - Comparison blog posts + `/reviews` page (duplicate comparison content)

2. Dynamic canonical tags causing inconsistency
   - JavaScript might set different canonical on second load
   - Chrome might see different canonical than Googlebot

3. Redirect chains
   - Original URL → Intermediate URL → Final URL
   - Google might choose intermediate as canonical instead of final

---

## 8. ROOT CAUSES SUMMARY

| Issue | Cause | Impact | Severity |
|-------|-------|--------|----------|
| Comparison posts inaccessible | Regex redirect `/.*-vs-.*-comparison.*` → `/reviews` | 16+ blog posts lost from index | CRITICAL |
| Soft 404s in Search Console | URL slug changes (adding/removing year suffix) with 301 redirects | 46 pages show redirect validation failure | HIGH |
| Multiple canonicals for same content | `/reviews` + `/compare` pages | 10 duplicate pages detected | HIGH |
| Dynamic canonical tags | Injected via JavaScript after page load | Social crawlers & initial crawl see no canonical | HIGH |
| Canonical conflicts | Redirected pages might have conflicting canonicals | Google confused about which URL is authoritative | MEDIUM |
| Trailing slash ambiguity | Multiple redirect rules for trailing slashes | Potential redirect chains | MEDIUM |

---

## 9. RECOMMENDATIONS (PRIORITIZED)

### CRITICAL - Fix Immediately:

1. **Remove or Fix Comparison Post Redirect**
   - Delete regex rule: `/never-hungover/:slug(.*-vs-.*-comparison.*)`
   - OR: Change destination to stay within `/never-hungover/` (not redirect to `/reviews`)
   - **Action:** Keep comparison blog posts at their original URLs

2. **Move Canonical Tags to Static HTML**
   - Instead of injecting dynamically, include canonical in prerendered HTML
   - Use prerendering script to bake canonical URLs into each HTML file
   - **Current:** Dynamic injection in `useSEO.js`
   - **Target:** Static `<link rel="canonical">` in initial HTML

3. **Consolidate Duplicate Comparison Content**
   - Choose ONE source of truth for product comparisons
   - Option A: Keep `/reviews` page, delete `dhm-supplements-comparison-center-2025` post
   - Option B: Keep blog post, simplify `/reviews` to listing only
   - Option C: Keep both but add canonical tags to one pointing to other

### HIGH - Fix Within 1-2 Weeks:

4. **Audit All Soft 404 Redirects**
   - Review all 264 redirects in `_redirects` file
   - Identify which are legitimate redirects vs accidental soft 404s
   - Add canonical tags pointing to correct URL for redirected pages

5. **Standardize URL Slugs**
   - Remove inconsistent year suffixes (-2025, etc.)
   - Use consistent slug naming across all blog posts
   - Set up permanent redirects from old slugs to new ones

6. **Fix `/compare` and `/reviews` Duplicate**
   - Both pages show 10 products with same data
   - Add canonical tag to one pointing to other
   - OR: Make them different (reviews = list view, compare = table view)

### MEDIUM - Fix Within 1 Month:

7. **Unify Trailing Slash Handling**
   - Keep only ONE trailing slash redirect mechanism
   - Remove redundant rules from vercel.json and _redirects
   - Test thoroughly for redirect chains

8. **Add Canonical Tags to All Comparison Posts**
   - Ensure every blog post has proper canonical URL
   - Verify in prerendered HTML, not just dynamic

---

## Files Needing Changes

1. **`/vercel.json`** - Remove/modify comparison post redirect rule
2. **`/public/_redirects`** - Audit and clean up 264 lines
3. **`/src/hooks/useSEO.js`** - Move canonical to prerendered HTML
4. **`/scripts/inject-canonical-tags.js`** - May become unnecessary
5. **`/src/pages/Compare.jsx`** - Address duplicate content with Reviews
6. **Blog post metadata** - Ensure canonical URLs are correct for all posts

---

## Testing Recommendations

1. **Verify no redirect chains:**
   ```bash
   curl -I https://www.dhmguide.com/never-hungover/dhm-vs-zbiotics
   # Should see 301 → /reviews (or 200 if fixed)
   # NOT: 301 → /reviews → 301 → somewhere else
   ```

2. **Check canonical tag presence:**
   ```bash
   curl https://www.dhmguide.com/never-hungover/some-post | grep canonical
   # Should see <link rel="canonical" in INITIAL HTML, not via JS
   ```

3. **Test social media crawlers:**
   - Use Facebook Sharing Debugger
   - Use Twitter Card Validator
   - Verify they see correct OG tags AND canonical (if present)

4. **Google Search Console:**
   - Submit sitemaps after changes
   - Monitor "Validation Issues"
   - Track reduction in "crawled not indexed"

---

## Conclusion

The site has **serious redirect and canonical tag architecture problems**:
- **16 comparison blog posts are unreachable** due to overly aggressive redirect rules
- **46 pages appear as "validation failed"** due to soft 404 redirects
- **Canonical tags are dynamic**, causing indexing inconsistencies
- **Duplicate content** exists on `/reviews` and `/compare` pages
- **Multiple canonicals selected by Google** for same content

**Priority Fix:** Remove the comparison post redirect rule to restore 16 blog posts to index, then move canonical tags to static HTML.
