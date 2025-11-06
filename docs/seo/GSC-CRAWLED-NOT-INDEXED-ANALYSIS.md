# Google Search Console: "Crawled - Currently Not Indexed" Analysis
**Date**: October 20, 2025  
**Affected Pages**: 103 URLs  
**Status**: CRITICAL - 74.6% of site not indexed

---

## Executive Summary

Analysis of the actual 103 "Crawled - currently not indexed" URLs from Google Search Console reveals **three distinct, fixable problems**:

1. **6 Empty Blog Posts** (CRITICAL) - Posts with 0 content still being served
2. **11 Legacy /blog/ URLs** (HIGH) - Old URLs not properly redirected  
3. **1 Search Template URL** (MEDIUM) - Dynamic search URL being indexed
4. **85 Valid Content Pages** (INVESTIGATE) - Quality/authority issues

---

## Problem #1: Empty Blog Posts (6 URLs - CRITICAL)

### Confirmed Empty Posts in GSC
| Post Slug | Content | Size | Last Crawled |
|-----------|---------|------|--------------|
| complete-guide-hangover-types-2025 | 0 chars | 3,190 bytes | 2025-06-29 |
| fraternity-formal-hangover-prevention-complete-dhm-guide-2025 | 0 chars | 3,306 bytes | 2025-06-30 |
| greek-week-champion-recovery-guide-dhm-competition-success-2025 | 0 chars | 3,289 bytes | 2025-06-30 |
| professional-hangover-free-networking-guide-2025 | 0 chars | 3,489 bytes | 2025-06-29 |
| quantum-health-monitoring-alcohol-guide-2025 | 111 chars | 660 bytes | 2025-07-30 |
| rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025 | 0 chars | 3,181 bytes | 2025-06-30 |

### Why This Happens
- Posts have complete metadata, titles, structured data
- Posts have table of contents structure
- Posts have ZERO actual content
- Google sees "thin content" and rejects for indexing

### Fix (HIGH PRIORITY - 2 hours)
**Option A: Remove from serving** (RECOMMENDED)
```javascript
// In src/newblog/postLoader.js - add filter
const posts = allPosts.filter(post => {
  // Skip archived posts with no content
  if (post.id.includes('/archived/') && (!post.content || post.content.length < 100)) {
    console.warn(`Skipping empty archived post: ${post.slug}`);
    return false;
  }
  return true;
});
```

**Option B: Return 410 Gone**
```javascript
// In NewBlogPost.jsx component
if (!post.content || post.content.trim().length < 100) {
  return <GoneErrorPage message="This content has been removed" />;
}
```

**Expected Recovery**: 6 pages fixed immediately + ~20-30 indirectly affected pages recover

---

## Problem #2: Legacy /blog/ URLs (11 URLs - HIGH PRIORITY)

### Affected URLs
```
/blog/work-life-balance-dhm-2025
/blog/business-travel-dhm-survival-kit-2025
/blog/executive-travel-wellness-2025
/blog/good-morning-hangover-pills-review-2025
/blog/salary-negotiation-performance-dhm-2025
/blog/conference-networking-dhm-guide-2025
/blog/consultant-client-site-success-2025
/blog/international-business-success-2025
/blog/business-dinner-networking-dhm-guide-2025
/blog/emergency-hangover-protocol-2025
/blog/sleep-optimization-social-drinkers-circadian-rhythm
```

### Current Status
- ✅ Redirect rule exists: `/blog/* /never-hungover/:splat 301` (line 2 of _redirects)
- ❌ Google still sees these as separate URLs
- Last crawled: June 27-28, 2025

### Why This Happens
Two possibilities:
1. **Redirect rule added after Google crawled** - Google hasn't re-crawled to discover redirect
2. **Vercel deployment issue** - Rule may not be properly deployed

### Fix (1 hour)
```bash
# Step 1: Verify redirect is working in production
curl -I https://www.dhmguide.com/blog/work-life-balance-dhm-2025
# Expected: 301 redirect to /never-hungover/work-life-balance-dhm-2025

# Step 2: If redirect works, request re-indexing in GSC
# Google Search Console → URL Inspection → Request Indexing (for each URL)

# Step 3: If redirect doesn't work, check Vercel deployment
# Ensure _redirects file is in public/ folder and deployed
```

**Expected Recovery**: 11 pages consolidate canonical authority

---

## Problem #3: Search Template URL (1 URL - MEDIUM)

### Affected URL
```
https://www.dhmguide.com/search?q=%7Bsearch_term_string%7D
```

### Why This Happens
- Template variable `{search_term_string}` rendered as `%7Bsearch_term_string%7D` (URL encoded)
- Appears in sitemap or internal links with un-replaced template
- Google crawls and finds empty search results

### Fix (30 minutes)
```javascript
// Find where {search_term_string} is used in code
grep -r "search_term_string" src/

// Option A: Add to robots.txt
Disallow: /search?q=%7B*

// Option B: Remove from sitemap
// In sitemap generation, exclude search URLs

// Option C: Return noindex for empty searches
if (searchQuery.includes('{') || !searchQuery.trim()) {
  return <meta name="robots" content="noindex, nofollow" />;
}
```

**Expected Recovery**: 1 page removed from index (correctly)

---

## Problem #4: Valid Content Pages (85 URLs - INVESTIGATE)

### Characteristics
- 85 pages with actual content
- Most crawled June-July 2025
- Mix of product reviews, guides, health content

### Potential Causes
1. **Content Quality** - Below Google's YMYL threshold
2. **E-E-A-T Signals** - Missing author expertise, citations
3. **Internal Linking** - Orphaned or poorly connected
4. **Freshness** - Content not updated since June/July
5. **Competition** - Outranked by established competitors

### Sample URLs (Need Deep Analysis)
```
/never-hungover/dhm1000-review-2025 (crawled 2025-10-18)
/never-hungover/double-wood-dhm-review-analysis (crawled 2025-10-16)
/never-hungover/first-responders-alcohol-safety-emergency-personnel-health-guide-2025 (crawled 2025-08-16)
/never-hungover/alcohol-diabetes-blood-sugar-management-guide-2025 (crawled 2025-08-08)
...
```

### Recommended Analysis (8-12 hours)
1. Content quality audit vs. indexed posts
2. E-E-A-T signal comparison
3. Internal link analysis
4. YMYL compliance check
5. Competitive analysis for key terms

---

## Crawl Timeline Analysis

### Crawl Date Distribution
| Month | Pages | Significance |
|-------|-------|--------------|
| June 2025 | 40 pages | Just before Aug 13 drop |
| July 2025 | 49 pages | Peak affected period |
| August 2025 | 12 pages | Post-drop continued issues |
| October 2025 | 2 pages | Recent reviews not indexing |

**Key Insight**: 89 of 103 pages (86%) were crawled in June-July 2025, right before the August 13 indexing drop. This suggests:
- Google was evaluating quality during June-July
- Failed quality check → marked as "crawled not indexed"
- August 13: Mass de-indexing event based on that evaluation

---

## Priority Action Plan

### Phase 1: Quick Wins (4 hours - THIS WEEK)
1. **Remove 6 empty posts from serving** (2 hours)
   - Add content filter to postLoader.js
   - Return 410 Gone for empty posts
   - Deploy and verify

2. **Fix /blog/ redirect issue** (1 hour)
   - Verify redirects work in production
   - Request re-indexing in GSC for 11 URLs

3. **Fix search template URL** (30 minutes)
   - Add to robots.txt or return noindex
   - Remove from sitemap if present

4. **Deploy and verify** (30 minutes)
   - Test all fixes in production
   - Document changes

**Expected Impact**: 18 pages fixed (6 empty + 11 legacy + 1 search)

### Phase 2: Content Quality Investigation (12 hours - NEXT WEEK)
1. **Audit 20 sample posts** (4 hours)
   - 10 indexed posts (success cases)
   - 10 not-indexed posts (failure cases)
   - Compare: word count, E-E-A-T signals, internal links, freshness

2. **Identify patterns** (2 hours)
   - What do indexed posts have that others don't?
   - Common characteristics of not-indexed posts

3. **Create improvement template** (2 hours)
   - Minimum word count
   - Required E-E-A-T elements
   - Internal linking requirements
   - Citation standards

4. **Apply to 10 high-priority posts** (4 hours)
   - Enhance content quality
   - Add expertise signals
   - Update citations
   - Improve internal linking

**Expected Impact**: 10-15 pages recover within 2-4 weeks

### Phase 3: Systematic Recovery (40+ hours - ONGOING)
1. **Content enhancement pipeline**
   - Apply improvements to remaining 75 posts
   - Batch updates (10 posts per week)
   - Monitor recovery rate

2. **Prevention system**
   - Build-time validation
   - Quality checklist
   - Pre-publish review process

**Expected Impact**: 70-85% of remaining posts recover over 2-3 months

---

## Success Metrics

### Week 1 (After Phase 1)
- ✅ 6 empty posts no longer served (or return 410)
- ✅ 11 legacy URLs properly redirecting
- ✅ Search template URL excluded
- 📊 GSC "Crawled not indexed" count: 103 → ~85

### Week 2-4 (After Phase 2)
- ✅ 10 enhanced posts submitted for re-indexing
- ✅ Quality template documented
- 📊 GSC "Crawled not indexed" count: ~85 → ~70

### Month 2-3 (During Phase 3)
- ✅ 75 posts systematically enhanced
- ✅ Prevention system in place
- 📊 GSC "Crawled not indexed" count: ~70 → <20

### Final Target (3 months)
- 🎯 "Crawled not indexed" count: <10 (5% of site)
- 🎯 Total indexed pages: 150+ (85%+)
- 🎯 Zero empty or broken content

---

## Files to Reference
- **GSC Export**: `/Users/patrickkavanagh/Downloads/dhmguide.com-Coverage-Drilldown-2025-10-20/Table.csv`
- **Agent Reports**: `/Users/patrickkavanagh/dhm-guide-website/docs/seo/`
- **Empty Posts**: `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/archived/`
- **Redirects**: `/Users/patrickkavanagh/dhm-guide-website/public/_redirects`

---

**Created**: October 20, 2025  
**Next Review**: October 27, 2025 (after Phase 1 implementation)
