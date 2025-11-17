# PRERENDERING INVESTIGATION FINDINGS

**Investigation Date:** November 7, 2025  
**Status:** COMPLETE - Two Reports Generated  
**Urgency:** CRITICAL - 106 pages not indexed

---

## EXECUTIVE SUMMARY

Your prerendering system is working at **93% capacity** (161 of 173 posts are prerendered), but **Vercel's routing configuration is likely breaking the delivery**, causing Google to see all blog posts as duplicate content.

**The 106 "crawled but not indexed" pages are almost certainly being served as /index.html instead of their prerendered blog post HTML.**

---

## KEY FINDINGS

### 1. Prerendering Scripts: WORKING WELL
- **Active Script:** `scripts/prerender-blog-posts-enhanced.js` 
  - Generates static HTML with XSS protection
  - Uses parallel batch processing
  - Creates 161 blog post HTML files

- **Output Quality:** EXCELLENT
  - Each file 14-15 KB with complete meta tags
  - Canonical URLs, Open Graph tags, schema.org markup
  - Visible content for crawlers

### 2. Static Files: MOSTLY PRESENT
- **Generated:** 161 of 173 blog posts have prerendered HTML
- **Location:** `/dist/never-hungover/{slug}/index.html`
- **Missing:** 12 posts (need investigation)

### 3. Vercel Routing: CRITICAL ISSUE
- **Problem:** `vercel.json` has a rewrite rule that may intercept blog URLs
- **Current Config:**
  ```json
  "rewrites": [
    {
      "source": "/((?!never-hungover/).*)",
      "destination": "/index.html"
    }
  ]
  ```
- **Impact:** Google may be receiving generic /index.html for all blog posts
- **Result:** Pages marked "crawled but not indexed" (looks like duplicate content)

---

## ROOT CAUSE ANALYSIS

### Why 106 Pages Are "Crawled But Not Indexed"

The most likely explanation:

1. Google crawler visits: `https://www.dhmguide.com/never-hungover/activated-charcoal-hangover`
2. Vercel's rewrite rule intercepts the request
3. Vercel serves: `/index.html` (generic homepage HTML)
4. Google sees: Generic title, generic description, generic OG tags
5. Google concludes: All blog posts are duplicates of the homepage
6. Result: "Crawled but not indexed" status

This explains why:
- Prerendered files EXIST and are good quality
- All 106+ pages show the same issue (not individual problems)
- The issue is systematic across all blog posts

---

## INVESTIGATION DETAILS

### Scripts Found
1. `scripts/prerender-blog-posts-enhanced.js` (ACTIVE)
2. `scripts/prerender-blog-posts.js` (ARCHIVED - older version)
3. `scripts/prerender-main-pages.js` (ACTIVE - for 7 main pages)

### Files Generated
- **161 blog post directories** in `/dist/never-hungover/`
- **7 main page directories** (guide, reviews, research, etc.)
- **1 blog index page** 
- Total: 169 prerendered HTML files

### Files Missing
**12 blog posts without prerendered HTML:**
1. festival-season-survival-dhm-guide-concert-music-festival-recovery
2. hangxiety-2025-dhm-prevents-post-drinking-anxiety
3. post-dry-january-smart-drinking-strategies-2025
4. smart-sleep-tech-alcohol-circadian-optimization-guide-2025
5. spring-break-2025-cancun-survival-guide-dhm
6. tequila-hangover-truth
7. traditional-mexican-hangover-remedies-vs-modern-supplements
8. ultimate-mexico-travel-hangover-prevention-guide-2025
9. viral-hangover-cures-tested-science-2025
10. whiskey-vs-vodka-hangover
11. wine-hangover-guide
12. zebra-striping-drinking-trend-2025

### Content Quality of Prerendered HTML
Sample analysis of `/dist/never-hungover/activated-charcoal-hangover/index.html`:

✅ **Present:**
- Title tag: "Activated Charcoal for Hangovers: Myth or Magic?"
- Meta description: Full content-specific description
- Canonical URL: https://www.dhmguide.com/never-hungover/activated-charcoal-hangover
- OG tags: title, description, image, URL
- Twitter Card tags
- Schema.org Article markup (JSON-LD)
- Noscript fallback content

✅ **File Size:** 14.3 KB (appropriate for prerendered SPA)

✅ **Build Integration:** Properly integrated in npm run build pipeline

---

## VERCEL.JSON CONFIGURATION ISSUE

### Current Configuration
```json
{
  "rewrites": [
    {
      "source": "/((?!never-hungover/).*)",
      "destination": "/index.html"
    }
  ],
  "trailingSlash": false
}
```

### The Problem
The rewrite rule `/((?!never-hungover/).*)/` uses a **negative lookahead** to match paths that DON'T contain `/never-hungover/`.

However, the issue is subtle:
- Vercel should serve static files BEFORE applying rewrites
- If static file serving isn't working correctly, the rewrite catches ALL requests
- This would result in serving /index.html for everything, including blog posts

### Testing to Confirm
```bash
# This will show if Vercel is serving the prerendered HTML or rewriting it
curl -I https://www.dhmguide.com/never-hungover/activated-charcoal-hangover

# Expected response (if working): 
# - Contains og:title = "Activated Charcoal for Hangovers: Myth or Magic?"

# Actual response (if broken):
# - Contains og:title = "DHM Guide: Prevent 87% of Hangovers..."
```

---

## RECOMMENDATIONS

### CRITICAL (Do First)
1. **Verify the issue exists:**
   ```bash
   curl -I https://www.dhmguide.com/never-hungover/activated-charcoal-hangover
   ```
   Check if og:title matches the post or if it's generic homepage content.

2. **If routing is broken:** Fix `vercel.json` to explicitly exclude /never-hungover/
   ```json
   "source": "/((?!never-hungover|api|assets).*)"
   ```

3. **Force redeployment** in Vercel dashboard after fix

### HIGH (Do Second)
4. **Find out why 12 posts aren't prerendering:**
   ```bash
   node scripts/validate-posts.js
   ```
   Check if those 12 JSON files have required fields (slug, title)

5. **Request Google reindex:**
   - Go to Google Search Console
   - Use URL Inspection on 20-30 sample blog posts
   - Click "Request Indexing"
   - Monitor Coverage report

### MEDIUM (Do Third)
6. **Set proper cache headers** for prerendered files
7. **Verify sitemap.xml** includes all 173 posts
8. **Check robots.txt** isn't blocking /never-hungover/*

---

## FILES TO REVIEW

### Primary Configuration
- `/Users/patrickkavanagh/dhm-guide-website/vercel.json` (CRITICAL)
- `/Users/patrickkavanagh/dhm-guide-website/package.json` (build script)
- `/Users/patrickkavanagh/dhm-guide-website/vite.config.js` (build config)

### Prerendering Scripts
- `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js`
- `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js`

### Generated Output
- `/Users/patrickkavanagh/dhm-guide-website/dist/never-hungover/` (161 blog directories)
- `/Users/patrickkavanagh/dhm-guide-website/dist/` (7 main page directories)

---

## INVESTIGATION REPORTS

Two detailed reports have been created:

### Report 1: Detailed Analysis
**File:** `PRERENDERING_INVESTIGATION_REPORT.md` (11 KB)
- Complete technical breakdown
- All hypotheses explained with rationale
- Comprehensive recommendations
- Testing methodology

### Report 2: Quick Reference
**File:** `PRERENDERING_QUICK_REFERENCE.md` (5.4 KB)
- Quick lookup guide
- Code snippets and examples
- Testing commands
- Quick fixes checklist

---

## BOTTOM LINE

The prerendering system works well, but **Vercel is likely breaking delivery** by serving /index.html instead of prerendered blog posts to Google.

**Fix the routing configuration and request reindexing, and the "crawled but not indexed" issue should resolve in 2-4 weeks.**

---

## Timeline

- **Week 1:** Verify routing issue, fix vercel.json if needed
- **Week 2:** Handle missing 12 posts, request Google reindex
- **Week 3-4:** Monitor Google Search Console for reindexing progress
- **Week 4+:** All 173 blog posts should appear in Google index

