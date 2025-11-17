# Canonical Tags Implementation in DHM Guide Website

## Current Architecture Overview

The site uses a **hybrid approach** combining client-side and server-side rendering:

1. **Client-side (React SPA)**: Dynamic pages (/guide, /reviews, /research, /compare, /about, /blog listing)
2. **Server-side (Prerendered)**: Blog posts and main pages have static HTML generated at build time
3. **Canonical tags**: Multiple competing implementations exist

---

## 1. useSEO Hook (Client-Side Dynamic Updates)

**Location**: `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js`

**How it works**:
- React hook that runs when component mounts
- Uses `useEffect` to update canonical tags dynamically via DOM manipulation
- Runs client-side AFTER page load

**Key code section** (lines 79-88):
```javascript
// Update canonical URL
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

**Used by these pages**:
- `/src/pages/Home.jsx` - `useSEO(generatePageSEO('home'))`
- `/src/pages/Guide.jsx` - `useSEO(generatePageSEO('guide'))`
- `/src/pages/Reviews.jsx` - `useSEO(generatePageSEO('reviews'))`
- `/src/pages/Research.jsx` - `useSEO(generatePageSEO('research'))`
- `/src/pages/Compare.jsx` - `useSEO(generatePageSEO('compare'))`
- `/src/pages/About.jsx` - `useSEO(generatePageSEO('about'))`
- `/src/newblog/components/NewBlogPost.jsx` - For individual blog posts
- `/src/newblog/pages/NewBlogListing.jsx` - For blog listing page

**Problem**: Google crawlers don't wait for JavaScript to load, so this approach is unreliable for initial indexing.

---

## 2. Prerendering Scripts (Server-Side Static Generation)

### 2a. Prerender Main Pages
**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js`

**How it works**:
- Runs during build process
- Generates static HTML files for each main page
- Hardcodes canonical URLs into the HTML before deployment

**Pages handled** (lines 6-48):
- `/` (home)
- `/guide`
- `/reviews`
- `/research`
- `/about`
- `/dhm-dosage-calculator`
- `/compare`

**Canonical implementation** (lines 122-126):
```javascript
// Update canonical URL
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
}
```

**Result**: Each route gets its own directory with an `index.html` containing the correct canonical tag.

### 2b. Prerender Blog Posts
**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts.js`

**How it works**:
- Reads all blog posts from `/src/newblog/data/posts/*.json`
- Generates individual HTML files for each post
- Injects canonical URL, title, meta description, OG tags, and structured data

**Canonical implementation** (lines 102-109):
```javascript
// Add canonical URL
let canonical = document.querySelector('link[rel="canonical"]');
if (!canonical) {
  canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  document.head.appendChild(canonical);
}
canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
```

**Result**: Blog posts work correctly because they're fully prerendered with proper canonical URLs baked in.

### 2c. Prerender Blog Posts Enhanced
**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js`

**Purpose**: Security-focused version that escapes HTML to prevent XSS attacks.

---

## 3. Client-Side Canonical Fix Script

**Location**: `/Users/patrickkavanagh/dhm-guide-website/canonical-fix.js`

**How it works**:
- Runs immediately on page load (before React)
- Uses a generic approach: normalizes the current pathname and sets canonical to match
- Works for any route by extracting path from `window.location.pathname`

**Key code** (lines 6-18):
```javascript
function updateCanonicalTag() {
  const currentPath = window.location.pathname;
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  
  if (canonicalLink) {
    // Normalize path: remove trailing slash except for root
    const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;
    // Build the full canonical URL using current origin
    const canonicalUrl = `${window.location.origin}${normalizedPath}`;
    canonicalLink.setAttribute('href', canonicalUrl);
  }
}
```

**Loaded in index.html** (line 80):
```html
<script src="/canonical-fix.js"></script>
```

**Problem**: Still runs client-side, but at least it runs early before React loads.

---

## 4. Meta Tag Injection Script

**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-meta-tags.js`

**How it works**:
- Generates a large inline script that maps all routes to their meta data
- Embeds this mapping directly in `index.html` (not external file)
- Runs immediately on page load to update canonical, title, description, OG tags

**Key mapping structure** (lines 52-92):
```javascript
const blogMeta = {
  '/never-hungover/slug1': {
    canonical: '...',
    title: '...',
    description: '...',
    ogUrl: '...',
    // etc
  },
  // ... hundreds of posts
};

const staticMeta = {
  '/': { canonical: '...', title: '...', ... },
  '/guide': { canonical: '...', title: '...', ... },
  // ... all main pages
};
```

**Update function** (lines 95-147):
- Checks current path against the mappings
- Updates canonical, title, description, OG tags
- Listens for route changes via `setInterval` polling (100ms) and `popstate` events

**Problem**: Large embedded script (can be 100KB+ with all blog posts), polling-based detection, still client-side.

---

## 5. Generate Blog Canonicals Script

**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/generate-blog-canonicals.js`

**How it works**:
- Generates a JSON file mapping blog post slugs to their canonical URLs
- Outputs to `/public/blog-canonicals.json`

**Output structure**:
```javascript
{
  "/never-hungover/slug1": {
    "canonical": "https://www.dhmguide.com/never-hungover/slug1",
    "title": "Post Title",
    "description": "Post excerpt..."
  },
  // ... more posts
}
```

**Status**: Creates a file but doesn't appear to be actively used by the application.

---

## 6. Inject Canonical Tags Script

**Location**: `/Users/patrickkavanagh/dhm-guide-website/scripts/inject-canonical-tags.js`

**How it works**:
- Similar to prerender-meta-tags.js but simpler
- Generates an inline script with blog canonical mappings
- Injects it after the base canonical link tag in index.html

**Status**: Another competing implementation, appears to duplicate functionality.

---

## Current Implementation Summary

| Component | Location | Timing | Scope | Status |
|-----------|----------|--------|-------|--------|
| **useSEO Hook** | `src/hooks/useSEO.js` | Client-side (after JS) | Dynamic pages | Active - used by all pages |
| **Prerender Main Pages** | `scripts/prerender-main-pages.js` | Build-time | 7 main pages | Active - creates static HTML |
| **Prerender Blog Posts** | `scripts/prerender-blog-posts.js` | Build-time | All blog posts | Active - works correctly |
| **Prerender Enhanced** | `scripts/prerender-blog-posts-enhanced.js` | Build-time | Blog posts | Backup version (security) |
| **Canonical Fix** | `canonical-fix.js` | Client-side (early) | All routes | Active - generic fallback |
| **Meta Tag Injection** | `scripts/prerender-meta-tags.js` | Build-time (injected) | All routes | Active - large inline script |
| **Generate Canonicals** | `scripts/generate-blog-canonicals.js` | Build-time | Blog posts only | Inactive - output not used |
| **Inject Canonicals** | `scripts/inject-canonical-tags.js` | Build-time (injected) | Blog posts | Duplicate - overlaps with meta-tags |

---

## Why Blog Posts Work Correctly

Blog posts are **fully prerendered at build time**, so:
1. The canonical URL is **baked directly into the HTML file**
2. Google's crawler sees the correct canonical immediately (no JavaScript needed)
3. The static HTML is served from `/dist/never-hungover/{slug}/index.html`

## Why Dynamic Pages Have Issues

Dynamic pages use React routing, so:
1. The canonical tag is only **updated client-side after JavaScript loads**
2. Google's initial crawl sees the **base canonical URL** (https://www.dhmguide.com)
3. Even with `canonical-fix.js` and `prerender-meta-tags.js`, there's a race condition

---

## Base HTML Template

**Location**: `/Users/patrickkavanagh/dhm-guide-website/index.html`

**Canonical tag** (line 78):
```html
<link rel="canonical" href="https://www.dhmguide.com" />
```

This is the base that:
- `useSEO` hook updates via DOM manipulation
- `prerender-main-pages.js` replaces during build
- `prerender-blog-posts.js` replaces for each blog post
- `canonical-fix.js` and `prerender-meta-tags.js` update client-side as fallback

---

## Competing/Redundant Implementations

The codebase has multiple overlapping canonical tag solutions:

1. **prerender-meta-tags.js** vs **inject-canonical-tags.js** - Both embed large inline scripts
2. **prerender-blog-posts.js** vs **prerender-blog-posts-enhanced.js** - Enhanced version unused?
3. **canonical-fix.js** vs **useSEO hook** vs **prerender-meta-tags.js** - Three different client-side approaches
4. **generate-blog-canonicals.js** - Creates output that's not used anywhere

---

## Key Findings

✅ **Working**:
- Blog posts: Fully prerendered, canonical tags in static HTML
- Main pages: Static HTML generated at build time with correct canonicals

⚠️ **Problematic**:
- Client-side approaches (useSEO, canonical-fix.js) run after JavaScript loads
- Multiple competing implementations cause confusion
- Large embedded scripts (prerender-meta-tags.js) create build artifacts
- Polling-based route detection (setInterval) is inefficient
- Some scripts are unused (generate-blog-canonicals.js)

❌ **Risks**:
- Google's crawler might index pages with wrong canonical tags during initial crawl
- Redirect loops possible if prerendered canonicals don't match client-side updates
- Maintenance burden with multiple implementations of the same feature
