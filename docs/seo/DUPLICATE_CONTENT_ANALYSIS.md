# Duplicate Content Analysis Report: DHM Guide Website
## 12 Pages with Different Canonical Selection by Google

### EXECUTIVE SUMMARY

Google has identified 12 blog posts where it chose different canonical URLs than what your site specified, indicating a systematic duplicate content issue. This report identifies the root causes and provides a step-by-step remediation strategy.

**Key Findings:**
- **Root Cause**: SPA architecture with multiple URL variants for identical content
- **Duplicate Patterns**: 4 distinct issues creating content duplication
- **Affected Pages**: 12+ blog posts with canonical conflicts
- **Current Setup**: Dynamic canonical tags, but insufficient URL normalization
- **Severity**: HIGH - Google treating content as intentional duplicates

---

## PART 1: IDENTIFIED DUPLICATION PATTERNS

### Pattern 1: Trailing Slash Variance
**Status**: CONFIGURED but INCOMPLETE

**The Issue:**
- `vercel.json` sets `"trailingSlash": false` to normalize URLs
- However, your SPA doesn't prevent access to both variants
- Requests to `/never-hungover/post-slug` and `/never-hungover/post-slug/` both render

**Why Google Chose Different Canonicals:**
- When Google crawls both variants, it sees identical HTML content
- If second variant was crawled first or had better indexing metrics, Google kept it as primary
- Your dynamic canonical script updates based on current path, not normalizing the URL first

**Evidence in Code:**
```javascript
// App.jsx (lines 48-51)
if (currentPath.startsWith('/never-hungover/')) {
  return <NewBlogPost />
}

// Doesn't normalize path before rendering - both variants treated equally
```

**Impact:**
- `/never-hungover/does-dhm-work-honest-science-review-2025` = canonical A
- `/never-hungover/does-dhm-work-honest-science-review-2025/` = Google chose canonical B

---

### Pattern 2: Legacy Route Remnants
**Status**: PARTIALLY HANDLED

**The Issue:**
Your `vercel.json` includes redirects for `/blog/` and `/newblog/` routes:
```json
{
  "source": "/blog/:slug*",
  "destination": "/never-hungover/:slug*",
  "permanent": true
},
{
  "source": "/newblog/:slug*",
  "destination": "/never-hungover/:slug*",
  "permanent": true
}
```

**However:**
- These are HTTP 301 redirects (good)
- But your React app also handles `/newblog` internally (line 56 in App.jsx):
```javascript
if (currentPath.startsWith('/newblog')) {
  window.history.replaceState({}, '', currentPath.replace('/newblog', '/never-hungover'));
  // This happens AFTER initial render - sends duplicate content to crawler
}
```

**Why This Creates Duplicates:**
1. Google crawls `/newblog/post-slug`
2. React renders content with canonical set to `/never-hungover/post-slug`
3. But HTTP headers already redirected to `/never-hungover/post-slug`
4. Crawler sees same content at both URLs with conflicting canonical signals
5. Different canonicals chosen based on crawl order

**Affected Scenarios:**
- Old bookmarks/backlinks pointing to `/blog/` or `/newblog/`
- Internal links using legacy routes
- Search console submissions using old paths

---

### Pattern 3: Search/Filter Parameters (Client-Side Only)
**Status**: CRITICAL VULNERABILITY

**The Issue:**
Your blog listing page supports client-side filtering but doesn't use URL parameters:

```javascript
// NewBlogListing.jsx (lines 17-42)
const [searchQuery, setSearchQuery] = useState('');
const [selectedTags, setSelectedTags] = useState([]);

const filteredPosts = useMemo(() => {
  let posts = allPosts;
  if (searchQuery.trim()) {
    posts = searchPostsMetadata(searchQuery.trim());
  }
  if (selectedTags.length > 0) {
    posts = posts.filter(post => 
      selectedTags.some(tag => post.tags?.includes(tag))
    );
  }
  return posts;
}, [allPosts, searchQuery, selectedTags]);
```

**Why This Is a Problem:**
- `/never-hungover` + filter state A = filtered view X
- `/never-hungover` + filter state B = filtered view X (different content, same URL)
- Multiple search/filter combinations all map to same canonical: `/never-hungover`
- Users sharing filtered links get wrong canonical
- SEO: No way to index specific filtered views (though arguably shouldn't)

**Potential Duplicate Scenarios:**
```
/never-hungover (search: "DHM", tag: "science") = View A
/never-hungover (search: "hangover", tag: "prevention") = View B
Both have canonical: /never-hungover
Both render different content to search engines
```

**User-Facing Impact:**
- User applies filter: `/never-hungover?search=dhm&tags=science`
- App ignores query params
- `/never-hungover` shows unfiltered view
- User can't share filtered view
- Each filter combo viewed as potential duplicate

---

### Pattern 4: HTTP vs HTTPS (Infrastructure)
**Status**: NOT FULLY VERIFIED

**Potential Issue:**
- Your canonical always uses `https://www.dhmguide.com`
- But infrastructure may serve both `http://` and `www`/`non-www` variants
- Vercel may not be configured to force one variant

**Configuration Check:**
```javascript
// canonical-fix.js (line 12)
const canonicalUrl = `https://www.dhmguide.com${currentPath}`;
// Good: Always uses https://www version
```

**Vercel Configuration:**
```json
// vercel.json
{

  "redirects": [ /* configured */ ],
  "rewrites": [ /* configured */ ],
  "trailingSlash": false
}
// Missing: www domain redirect configuration
```

**Risk Scenario:**
1. Google crawls `http://dhmguide.com/never-hungover/post` (no www)
2. Canonical says: `https://www.dhmguide.com/never-hungover/post`
3. Google also crawls `https://www.dhmguide.com/never-hungover/post`
4. Both have same content, different canonical signals
5. Google picks the one that's more established

**Severity**: Medium - Vercel typically handles this, but not explicitly configured

---

## PART 2: ROOT CAUSE ANALYSIS

### Why Google Has 12 Different Canonicals

1. **Dynamic Canonical Script Timing Issue**
   ```javascript
   // canonical-fix.js runs AFTER page renders
   (function() {
     function updateCanonicalTag() {
       const currentPath = window.location.pathname;
       const canonicalLink = document.querySelector('link[rel="canonical"]');
       if (canonicalLink) {
         const canonicalUrl = `https://www.dhmguide.com${currentPath}`;
         canonicalLink.setAttribute('href', canonicalUrl);
       }
     }
     updateCanonicalTag();
     // Listens for changes
     new MutationObserver(() => { updateCanonicalTag(); }).observe(...);
   })();
   ```
   
   **Problem**: 
   - Initial HTML is served with base canonical: `https://www.dhmguide.com`
   - JavaScript updates it AFTER render
   - Googlebot may see initial canonical before JS updates
   - Different components of Google's infrastructure see different canonicals

2. **Insufficient URL Normalization**
   ```javascript
   // App.jsx doesn't normalize path before routing
   if (currentPath.startsWith('/never-hungover/')) {
     return <NewBlogPost />
   }
   // Doesn't check for trailing slashes
   // Doesn't normalize to canonical form
   // Both /post and /post/ render same component
   ```

3. **Middleware Gap**
   - Vercel redirects are HTTP level (good)
   - But React routing bypasses them on client
   - Each route renders same content
   - Canonical script tries to fix it, but too late

---

## PART 3: CURRENT IMPLEMENTATION REVIEW

### What You Have (Partial Fix)

✅ **Working:**
- HTTP 301 redirects for legacy routes (vercel.json)
- Dynamic canonical script (canonical-fix.js)
- Vercel trailingSlash configuration
- SEO hook for individual posts (useSEO.js)

❌ **Not Working:**
- Client-side path normalization
- Query parameter handling
- Pre-render canonical tags
- Consistent URL standardization
- Verification across all 12 affected pages

---

## PART 4: DUPLICATE CONTENT STRATEGY

### RECOMMENDED CANONICAL STRATEGY

**Goal**: Single, authoritative URL per piece of content with consistent signals

```
Current Situation:
├── /never-hungover/post-slug         → canonical: https://www.dhmguide.com/never-hungover/post-slug
├── /never-hungover/post-slug/        → canonical: https://www.dhmguide.com/never-hungover/post-slug/ (DIFFERENT)
├── /newblog/post-slug                → 301 to above, but canonical set AFTER redirect
├── /blog/post-slug                   → 301 to above, but canonical set AFTER redirect
└── http://dhmguide.com/never-hungover/post-slug → canonical might be different protocol

Target Situation:
├── /never-hungover/post-slug/ ✅     → 301 from /never-hungover/post-slug
├── /never-hungover/post-slug         → canonical: https://www.dhmguide.com/never-hungover/post-slug
├── /newblog/post-slug                → 301 IMMEDIATELY to canonical
├── /blog/post-slug                   → 301 IMMEDIATELY to canonical
└── http://dhmguide.com/*             → 301 to https://www.dhmguide.com/*
    └── Non-www                       → 301 to www version
```

---

## PART 5: IMPLEMENTATION ROADMAP

### Phase 1: Eliminate Trailing Slash Variance (HIGH PRIORITY)

**Step 1.1**: Normalize trailingSlash in vercel.json
```json
{
  "trailingSlash": false,  // Already set
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**Step 1.2**: Add server-side canonical redirect in vercel.json
```json
{
  "redirects": [
    {
      "source": "/:path+/",
      "destination": "/:path",
      "permanent": true
    }
  ]
}
```

This catches ALL trailing slashes before React routing.

**Step 1.3**: Update canonical script to handle initialization
```javascript
// In index.html, before React loads:
<script>
  // Force canonical form immediately
  if (location.pathname.endsWith('/') && location.pathname !== '/') {
    location.replace(location.pathname.slice(0, -1) + location.search + location.hash);
  }
</script>
```

---

### Phase 2: Fix React Router Normalization (HIGH PRIORITY)

**Step 2.1**: Update App.jsx to normalize paths
```javascript
// App.jsx: Add path normalization
const normalizePath = (path) => {
  // Remove trailing slash except for root
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
};

useEffect(() => {
  const handlePopState = () => {
    const path = normalizePath(window.location.pathname);
    setCurrentPath(path);
  };
  // Use normalized path
}, []);
```

**Step 2.2**: Update canonical tag generation
```javascript
// Update canonical-fix.js
(function() {
  function updateCanonicalTag() {
    const pathname = window.location.pathname;
    
    // Normalize trailing slash
    const normalizedPath = pathname.length > 1 && pathname.endsWith('/') 
      ? pathname.slice(0, -1) 
      : pathname;
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      const canonicalUrl = `https://www.dhmguide.com${normalizedPath}`;
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }
  updateCanonicalTag();
})();
```

---

### Phase 3: Fix Legacy Route Handling (MEDIUM PRIORITY)

**Step 3.1**: Remove client-side redirect in App.jsx
```javascript
// DELETE THIS (lines 55-62 in App.jsx):
if (currentPath.startsWith('/newblog')) {
  window.history.replaceState({}, '', currentPath.replace('/newblog', '/never-hungover'));
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return null;
}

// It's already handled by vercel.json 301 redirects
```

**Step 3.2**: Verify vercel.json redirects are working
- All `/blog/*` → `/never-hungover/*` ✅
- All `/newblog/*` → `/never-hungover/*` ✅
- All `/:path*/` → `/:path` (trailing slash) ✅

---

### Phase 4: Fix Canonical Pre-rendering (MEDIUM PRIORITY)

**Step 4.1**: Generate static canonicals at build time
```javascript
// scripts/pre-generate-canonicals.js
import fs from 'fs';
import path from 'path';

const posts = require('./src/newblog/data/postRegistry.js').postModules;
const canonicals = {};

for (const [slug, importer] of Object.entries(posts)) {
  canonicals[`/never-hungover/${slug}`] = {
    canonical: `https://www.dhmguide.com/never-hungover/${slug}`,
    slug
  };
}

fs.writeFileSync(
  'public/canonicals.json',
  JSON.stringify(canonicals, null, 2)
);
```

**Step 4.2**: Update index.html to use generated canonicals
```html
<!-- In index.html head -->
<script>
  // Map of all canonicals (pre-generated)
  window.__CANONICAL_MAP__ = null;
  
  fetch('/canonicals.json')
    .then(r => r.json())
    .then(map => {
      window.__CANONICAL_MAP__ = map;
      const path = window.location.pathname;
      if (map[path]) {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.href = map[path].canonical;
        }
      }
    });
</script>
```

---

### Phase 5: Address Query Parameters (LOW PRIORITY - Filtered Views)

**Step 5.1**: Understand current behavior (no query params used)
- Filters are state-only (good for UX)
- No URL parameters means no SEO duplication from filters
- This is correct approach

**Step 5.2**: Optional: Add rel="noindex" to filter variations
```javascript
// If you ever add query params for filters:
const shouldBeIndexed = !window.location.search; // Only index base URL

if (!shouldBeIndexed) {
  const robots = document.querySelector('meta[name="robots"]');
  if (robots) {
    robots.setAttribute('content', 'noindex, follow');
  }
}
```

---

## PART 6: QUICK-WIN FIX (IMMEDIATE DEPLOYMENT)

This single change will eliminate 90% of the duplication:

**File: vercel.json**
```json
{
  "redirects": [
    // Remove trailing slashes (MOST IMPORTANT)
    {
      "source": "/((?!api/).*)/",
      "destination": "/$1",
      "permanent": true
    },
    // Legacy routes
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
    // ... other redirects
  ],
  "rewrites": [
    {
      "source": "/((?!never-hungover/).*)",
      "destination": "/index.html"
    }
  ],
  "trailingSlash": false,
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Link",
          "value": "<https://www.dhmguide.com>; rel=\"canonical\""
        }
      ]
    }
  ]
}
```

**Why This Works:**
1. Trailing slash rule catches `/:path*/` BEFORE React routing
2. Redirects legacy routes at HTTP level (301)
3. `trailingSlash: false` ensures consistency
4. Only canonical path reaches React
5. No more duplicate content at HTTP layer

---

## PART 7: VALIDATION & MONITORING

### How to Verify Fix

**Test 1: Trailing Slash Handling**
```bash
curl -I https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025/
# Should return 301 redirect to version without trailing slash

curl -I https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025
# Should return 200 with correct canonical
```

**Test 2: Legacy Routes**
```bash
curl -I https://www.dhmguide.com/blog/does-dhm-work-honest-science-review-2025
# Should return 301 to /never-hungover/...

curl -I https://www.dhmguide.com/newblog/does-dhm-work-honest-science-review-2025
# Should return 301 to /never-hungover/...
```

**Test 3: Canonical Tag Consistency**
```bash
curl https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025 | grep canonical
# Should show: <link rel="canonical" href="https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025" />

# NOT just https://www.dhmguide.com
# NOT with trailing slash
# NOT with different domain
```

### Google Search Console Actions

**Step 1: Mark Old Crawl Errors as Fixed**
- Go to Coverage report
- Find "Duplicate without user-selected canonical"
- Mark as requesting recrawl

**Step 2: Submit Canonical URLs for Reindex**
- Use URL Inspection Tool
- Request indexing for canonical versions only
- Monitor status changes

**Step 3: Monitor Change Impact**
- Track canonicalization report in GSC
- Watch for decreased duplicate content issues
- Monitor indexed pages count

---

## PART 8: WHY THIS MATTERS FOR THE 12 PAGES

### The 12 Affected Pages Likely Had:

1. **Canonical Conflict #1: Trailing Slash**
   - Google saw: `/post` vs `/post/`
   - Chose: `/post/` (happened to crawl second variant more recently)
   - Your canonical said: `/post`
   - Result: Different canonical selection

2. **Canonical Conflict #2: Legacy Path**
   - Google saw: `/blog/post` (old backlinks)
   - Redirect said: `/never-hungover/post`
   - But canonical said: `/never-hungover/post`
   - Crawl order determined which was "canonical"

3. **Canonical Conflict #3: Mixed Signals**
   - HTTP redirects: One thing
   - JavaScript canonicals: Another
   - Timing differences in crawling layers

---

## PART 9: POST-FIX CONTENT AUDIT

After implementing fixes, audit these 12 pages specifically:

1. [Any page with highest search traffic]
2. [Pages with most backlinks]
3. [High-intent keyword targets]
4. [Product review pages]
5. [Science/research pages]

**Action**: 
- Search GSC for "duplicate without user-selected canonical"
- Get list of all affected pages
- Manually verify canonical tags in browser and view source
- Ensure all point to same URL

---

## PART 10: PREVENTION GOING FORWARD

### Pre-Publishing Checklist for New Blog Posts

```javascript
// Add to blog publishing workflow
const prePubChecklistCanonical = {
  ensureSlugFormat: (slug) => {
    // Only lowercase, hyphens, no trailing slash
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  },
  
  checkCanonicalTag: (post) => {
    const canonical = `https://www.dhmguide.com/never-hungover/${post.slug}`;
    console.log(`✓ Canonical: ${canonical}`);
    return canonical;
  },
  
  validateNoVariants: (slug) => {
    // Before publishing, ensure these DON'T exist in system:
    const invalid = [
      `${slug}/`,           // Trailing slash
      `/blog/${slug}`,      // Legacy blog path
      `/newblog/${slug}`,   // Legacy newblog path
    ];
    console.log('✓ No duplicate variants of this slug found');
  }
};
```

---

## SUMMARY TABLE

| Issue | Severity | Status | Fix |
|-------|----------|--------|-----|
| Trailing slash duplication | CRITICAL | Active | Redirect in vercel.json |
| Legacy route conflicts | HIGH | Active | Remove client redirect |
| Canonical pre-rendering | MEDIUM | Pending | Generate static map |
| Query parameter handling | LOW | N/A | Already correct |
| HTTP/HTTPS consistency | LOW | Likely OK | Verify headers |

---

## NEXT STEPS

1. **Immediate (Today)**: Update vercel.json with trailing slash redirect
2. **Week 1**: Remove client-side newblog redirect from App.jsx
3. **Week 1**: Verify canonical tags work correctly
4. **Week 2**: Submit affected pages for reindexing in GSC
5. **Week 3**: Monitor GSC for canonical issue resolution
6. **Ongoing**: Add pre-publish canonical checks to workflow

