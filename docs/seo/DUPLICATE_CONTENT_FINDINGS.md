# Duplicate Content Issues: Detailed Findings

## Site Overview
- **Total Blog Posts**: 202
- **Affected by Canonical Conflicts**: 12
- **Architecture**: React SPA (Single Page Application)
- **Deployment**: Vercel

---

## Issue #1: Trailing Slash Variance (CRITICAL)

### Affected Pattern
```
/never-hungover/post-slug           ← NO trailing slash
/never-hungover/post-slug/          ← WITH trailing slash (DUPLICATE)
```

### Why It's a Problem
1. Both URLs serve identical HTML content
2. Vercel's `trailingSlash: false` doesn't prevent access to trailing slash version
3. React routing doesn't normalize the path before rendering
4. Google crawls both, sees same content, picks which one to make canonical

### Code Evidence

**File: App.jsx (lines 48-52)**
```javascript
const renderPage = () => {
  // Handle Never Hungover blog post routes (e.g., /never-hungover/post-slug)
  if (currentPath.startsWith('/never-hungover/')) {
    return <NewBlogPost />
  }
  // ... rest of routes
}
```
**Problem**: Doesn't check for or normalize trailing slash. Both `/post` and `/post/` match this condition.

**File: vercel.json**
```json
{
  "trailingSlash": false  // <- Configuration says no trailing slashes
  // BUT: No explicit redirect to enforce this
}
```
**Problem**: Setting exists but no HTTP redirect to enforce it.

### Impact on 12 Pages
- Example: `does-dhm-work-honest-science-review-2025`
  - Your canonical: `https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025`
  - Google's canonical: `https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025/`
  - **Result**: Different canonical selected by Google

---

## Issue #2: Legacy Route Handling (HIGH)

### Affected Patterns
```
/blog/post-slug                     ← OLD path
/newblog/post-slug                  ← OLD path
/never-hungover/post-slug           ← CURRENT path
```

### Why It's a Problem
1. HTTP redirects exist (good): `/blog/*` → `/never-hungover/*`
2. But React also handles these internally (bad): Client-side redirect happens AFTER content renders
3. Google sees conflicting signals about which is canonical
4. Different crawl order = different canonical selection

### Code Evidence

**File: vercel.json (lines 2-11)**
```json
"redirects": [
  {
    "source": "/blog/:slug*",
    "destination": "/never-hungover/:slug*",
    "permanent": true    // <- Good: 301 redirect
  },
  {
    "source": "/newblog/:slug*",
    "destination": "/never-hungover/:slug*",
    "permanent": true
  }
]
```
✓ HTTP-level redirects are correct

**BUT - File: App.jsx (lines 55-62)**
```javascript
// Handle legacy /newblog routes - redirect to new path
if (currentPath.startsWith('/newblog')) {
  window.history.replaceState({}, '', currentPath.replace('/newblog', '/never-hungover'));
  window.dispatchEvent(new PopStateEvent('popstate'));
  // This happens AFTER initial render - sends duplicate content to crawler
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return null;
}
```
✗ Client-side redirect happens AFTER content renders, creating duplicate signal

### The Dual-Redirect Problem

Scenario: Google crawls `/newblog/post-slug`

1. **HTTP Layer** (Vercel):
   - Request hits Vercel
   - vercel.json checks: matches `/newblog/:slug*`
   - Returns: 301 redirect to `/never-hungover/:slug*`
   - Status code: 301 (permanent redirect)

2. **Browser/SPA Layer** (React):
   - If somehow content served (pre-redirect cache?), React also runs:
   - Checks: `currentPath.startsWith('/newblog')`
   - Replaces state and re-renders with `/never-hungover/...`
   - This is redundant and confusing to crawlers

3. **Canonical Script** (canonical-fix.js):
   - Sees final URL: `/never-hungover/post-slug`
   - Sets canonical to: `https://www.dhmguide.com/never-hungover/post-slug`
   - But crawler may have seen multiple canonical signals during redirect chain

### Impact
- Old backlinks to `/blog/post` get redirected to `/never-hungover/post`
- But both URLs briefly respond with content before redirect finalizes
- Different crawl instances see different canonical values
- Google picks whichever was most recently/heavily crawled

---

## Issue #3: Client-Side Filtering Without URL Parameters (MEDIUM)

### Affected Pattern
```
/never-hungover?search=dhm&tags=science   ← Parameters IGNORED
/never-hungover?sort=date&tags=prevention ← Parameters IGNORED
```

### Current Implementation

**File: NewBlogListing.jsx (lines 17-42)**
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [selectedTags, setSelectedTags] = useState([]);

const filteredPosts = useMemo(() => {
  let posts = allPosts;

  // Apply search filter
  if (searchQuery.trim()) {
    posts = searchPostsMetadata(searchQuery.trim());  // <- Searches in memory
  }

  // Apply tag filters
  if (selectedTags.length > 0) {
    posts = posts.filter(post => 
      selectedTags.some(tag => post.tags?.includes(tag))
    );
  }

  return posts;
}, [allPosts, searchQuery, selectedTags]);
```

**Problem**: 
- Filters stored in React state, not URL
- URL always `/never-hungover`
- No query parameters like `?q=dhm&tags=science`
- Multiple filter combinations = same URL with different content

### Potential Duplicate Scenarios

While unlikely to cause Google duplication (because filtering happens client-side), it creates potential issues:

1. User filters: "Search: DHM, Tags: Science"
   - URL: `/never-hungover`
   - Canonical: `https://www.dhmguide.com/never-hungover`

2. Same user clears filters, then applies: "Tags: Prevention"
   - URL: `/never-hungover`
   - Canonical: `https://www.dhmguide.com/never-hungover`

3. User shares first filtered view to colleague
   - Colleague sees: `/never-hungover` (unfiltered, different content)
   - Colleague thinks your post quality is poor

### Why This Usually Isn't an SEO Issue
- Google indexes main URL, not filtered variations
- Filtering is JS-only, so crawler sees base content
- Base URL correctly has canonical
- This is acceptable behavior

### Could Become Issue If...
- Query parameters added: `/never-hungover?q=dhm&tags=science`
- Canonical not set for filtered views
- Different content served for each filter combo

### Current Status: ACCEPTABLE
✓ Correct: Client-side only, base URL indexed, no query strings
✓ UX: Better performance, no page reloads

---

## Issue #4: HTTPS/WWW Configuration (LOW-MEDIUM)

### Current Configuration

**File: index.html (line 78)**
```html
<link rel="canonical" href="https://www.dhmguide.com" />
```

**File: canonical-fix.js (line 12)**
```javascript
const canonicalUrl = `https://www.dhmguide.com${currentPath}`;
```

✓ Always uses `https://www.dhmguide.com`

**File: vercel.json - Missing Configuration**
```json
{
  // No explicit domain redirect configuration
  // Vercel typically handles this, but not configured here
}
```

### Potential Issue
If infrastructure serves both:
- `http://dhmguide.com/post` (HTTP, no www)
- `https://dhmguide.com/post` (HTTPS, no www)
- `https://www.dhmguide.com/post` (HTTPS, with www) ← CANONICAL

Google could see 3 URL variants with content duplication.

### Likelihood: Medium
- Vercel generally enforces HTTPS by default
- But www vs non-www might not be explicitly redirected
- Missing explicit configuration is a risk

### Recommendation
Add to vercel.json:
```json
{
  "redirects": [
    {
      "source": "^https?://(?:www\\.)?dhmguide\\.com/(.*)",
      "destination": "https://www.dhmguide.com/$1",
      "permanent": true
    }
  ]
}
```

---

## Issue #5: Canonical Script Timing (MEDIUM)

### The Problem

**File: canonical-fix.js**
```javascript
(function() {
  function updateCanonicalTag() {
    const currentPath = window.location.pathname;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      const canonicalUrl = `https://www.dhmguide.com${currentPath}`;
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }
  
  // Runs immediately
  updateCanonicalTag();
  
  // Listens for DOM changes
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      updateCanonicalTag();
    }
  }).observe(document, {subtree: true, childList: true});
})();
```

### Timing Issue

1. **Initial HTML Served:**
   - Canonical: `https://www.dhmguide.com` (base)
   - Googlebot starts reading this

2. **JavaScript Executes:**
   - Script runs
   - Canonical updated to: `https://www.dhmguide.com/never-hungover/post-slug`
   - But Googlebot may have already captured the base canonical

3. **Different Crawl Instances:**
   - Some Googlebot instances see: Old canonical (base URL)
   - Some see: Updated canonical (specific post URL)
   - Result: Google thinks different canonicals for same content

### Why It Matters
Google's crawler infrastructure has multiple layers:
- Initial fetch: Sees base canonical
- Rendering pass: Sees updated canonical (after JS)
- Different passes might reconcile differently

### Solution: Static Canonical in HTML

Instead of updating dynamically, set it correctly in initial HTML using server-side logic or pre-generated meta tags.

---

## Summary: The 12-Page Issue

### Why These 12 Pages Were Affected

Likely scenario for one of the 12 affected pages:

**Timeline:**
1. Page published at: `/never-hungover/post-slug`
2. Old backlinks pointed to: `/blog/post-slug`
3. Both versions crawled by Google
4. Google sees identical content at 3 URLs:
   - `/blog/post-slug` → redirects to `/never-hungover/post-slug`
   - `/never-hungover/post-slug`
   - `/never-hungover/post-slug/` (trailing slash variant)
5. Canonical tags conflict:
   - Initial HTML: `https://www.dhmguide.com`
   - JavaScript: `https://www.dhmguide.com/never-hungover/post-slug`
   - Different requests see different canonicals
6. Google picks one based on crawl order and signals
7. Result: Different canonical than site specified

### What Google Shows in GSC
"Duplicate without user-selected canonical"
- Google chose: `https://www.dhmguide.com/never-hungover/post-slug/` (with slash)
- Your site said: `https://www.dhmguide.com/never-hungover/post-slug` (no slash)
- GSC warning: These don't match

---

## Files to Review/Modify

| File | Issue | Priority |
|------|-------|----------|
| `vercel.json` | Missing trailing slash redirect | CRITICAL |
| `App.jsx` | Client-side redirect for `/newblog` | HIGH |
| `canonical-fix.js` | Needs to normalize path | HIGH |
| `index.html` | Consider static canonicals | MEDIUM |
| `vercel.json` | Add domain redirect config | MEDIUM |

---

## Prevention Checklist for New Blog Posts

Before publishing:

```javascript
✓ Slug format: lowercase, hyphens only, no trailing slash
✓ URL will be: /never-hungover/{slug}
✓ No legacy paths: /blog/{slug}, /newblog/{slug}
✓ No trailing slash: {slug} not {slug}/
✓ Canonical will be: https://www.dhmguide.com/never-hungover/{slug}
✓ No query parameters in canonical URLs
✓ Meta tags all use canonical URL
✓ Internal links use canonical URL form
```

