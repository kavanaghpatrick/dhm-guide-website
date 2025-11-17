# Canonical Tags - Quick Reference Guide

## Key File Locations

### Core Implementation Files

1. **useSEO Hook** (Client-side, runs after React loads)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js`
   - Lines: 29-114 (canonical implementation)
   - Used by: All React pages (Home, Guide, Reviews, Research, Compare, About, Blog)
   - Problem: Google crawlers don't wait for JavaScript

2. **Prerender Main Pages** (Build-time, static generation)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js`
   - Lines: 122-126 (canonical update)
   - Pages: 7 main pages (/, /guide, /reviews, /research, /about, /compare, /calculator)
   - Status: Works correctly - creates static HTML with baked-in canonicals

3. **Prerender Blog Posts** (Build-time, static generation)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts.js`
   - Lines: 102-109 (canonical implementation)
   - Pages: All blog posts at `/never-hungover/{slug}`
   - Status: Works correctly - blog posts fully prerendered with canonicals

4. **Canonical Fix Script** (Client-side, early fallback)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/canonical-fix.js`
   - Lines: 6-18 (canonical update logic)
   - Loads in: `/Users/patrickkavanagh/dhm-guide-website/index.html` line 80
   - Status: Generic fallback using current pathname

5. **Meta Tag Injection Script** (Build-time, generates large embedded script)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-meta-tags.js`
   - Lines: 52-92 (mapping structure), 95-147 (update function)
   - Scope: All routes (blog posts + main pages)
   - Status: Large embedded script with polling-based route detection

6. **Base HTML Template** (Root template for all pages)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/index.html`
   - Line 78: `<link rel="canonical" href="https://www.dhmguide.com" />`
   - Line 80: `<script src="/canonical-fix.js"></script>`

### Secondary/Unused Files

7. **Generate Blog Canonicals** (Creates JSON file)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/generate-blog-canonicals.js`
   - Output: `/public/blog-canonicals.json`
   - Status: Output not used anywhere

8. **Inject Canonical Tags** (Duplicate functionality)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/inject-canonical-tags.js`
   - Status: Overlaps with prerender-meta-tags.js

9. **Prerender Blog Posts Enhanced** (Security-focused version)
   - Location: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js`
   - Status: Alternative version with XSS protection, not actively used

---

## Component Usage Examples

### Pages Using useSEO Hook

```javascript
// src/pages/Home.jsx
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
export default function Home() {
  useSEO(generatePageSEO('home'));
  // Component code...
}
```

### Blog Components Using useSEO Hook

```javascript
// src/newblog/components/NewBlogPost.jsx
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';
const post = getPostBySlug(slug);
useSEO(generatePageSEO('blog-post', {
  title: post.title,
  excerpt: post.excerpt,
  slug: post.slug,
  author: post.author,
  date: post.date,
  image: post.image,
  tags: post.tags,
  content: post.content
}));
```

---

## How Canonical URLs Are Generated

### For Main Pages (7 pages)

1. Build-time: `prerender-main-pages.js` reads page config
2. Creates static HTML: `/dist/{route}/index.html`
3. Canonical baked in: `<link rel="canonical" href="https://www.dhmguide.com{route}" />`
4. Example: `/dist/guide/index.html` has `href="https://www.dhmguide.com/guide"`

### For Blog Posts (100+ posts)

1. Build-time: `prerender-blog-posts.js` reads all posts from `/src/newblog/data/posts/*.json`
2. Creates static HTML: `/dist/never-hungover/{slug}/index.html`
3. Canonical baked in: `<link rel="canonical" href="https://www.dhmguide.com/never-hungover/{slug}" />`
4. All metadata (title, description, OG tags) also baked in

### For Dynamic Pages (via React SPA)

**Initial render** (no JavaScript):
- Shows base canonical: `https://www.dhmguide.com`
- Runs: `canonical-fix.js` (early script)
- Updates to: Current pathname URL

**After React loads**:
- Runs: `useSEO` hook
- Updates canonical to: Route-specific URL from `generatePageSEO()`
- Also updates: title, description, OG tags

---

## Current Issues & Risks

### Race Conditions
- Google crawler might see base canonical during initial crawl
- JavaScript-dependent canonicals might not be set before crawl completes

### Multiple Implementations
- 3+ different canonical update approaches (useSEO, canonical-fix.js, prerender-meta-tags.js)
- Maintenance burden - any change must be made in multiple places
- Potential for inconsistencies

### Unused/Redundant Code
- `generate-blog-canonicals.js` - output never used
- `inject-canonical-tags.js` - duplicates functionality
- `prerender-blog-posts-enhanced.js` - not actively used

### Performance Issues
- `prerender-meta-tags.js` generates 100KB+ embedded script with all posts
- Polling-based route detection (setInterval every 100ms)
- Large JSON mappings for all routes in HTML

---

## Canonical URL Pattern Reference

| Page Type | Pattern | Example |
|-----------|---------|---------|
| Home | `{baseUrl}` | https://www.dhmguide.com |
| Guide | `{baseUrl}/guide` | https://www.dhmguide.com/guide |
| Reviews | `{baseUrl}/reviews` | https://www.dhmguide.com/reviews |
| Research | `{baseUrl}/research` | https://www.dhmguide.com/research |
| Compare | `{baseUrl}/compare` | https://www.dhmguide.com/compare |
| About | `{baseUrl}/about` | https://www.dhmguide.com/about |
| Calculator | `{baseUrl}/dhm-dosage-calculator` | https://www.dhmguide.com/dhm-dosage-calculator |
| Blog Listing | `{baseUrl}/never-hungover` | https://www.dhmguide.com/never-hungover |
| Blog Post | `{baseUrl}/never-hungover/{slug}` | https://www.dhmguide.com/never-hungover/hangover-prevention-101 |

---

## Build Process & Canonical Tags

### NPM Scripts That Handle Canonicals

Check `package.json` for scripts that run prerendering:
```bash
npm run build      # Builds with Vite
# Then likely runs:
# - prerender-main-pages.js
# - prerender-blog-posts.js
# - prerender-meta-tags.js
```

### Deployment Flow

1. `vite build` - Creates `/dist` directory
2. `prerender-main-pages.js` - Generates `/dist/{route}/index.html` for main pages
3. `prerender-blog-posts.js` - Generates `/dist/never-hungover/{slug}/index.html` for posts
4. `prerender-meta-tags.js` - Injects large meta mapping script into index.html
5. Deploy `/dist` to Vercel

---

## Key Takeaways

### What Works
- Blog posts: Fully prerendered with correct canonicals
- Main pages: Static HTML generated at build time with correct canonicals

### What Doesn't Work Reliably
- Dynamic pages relying on JavaScript to set canonicals
- Initial Google crawl might see base canonical before JS updates it

### Why Blog Posts Are Successful
1. Static HTML files - no JavaScript needed
2. Canonical baked directly into the HTML
3. Google's crawler sees correct canonical on first fetch
4. No race conditions possible

### Why Dynamic Pages Are Problematic
1. Canonical only updated after JavaScript loads
2. Google might crawl before update completes
3. Multiple competing update mechanisms create confusion
4. Polling-based detection is inefficient

---

## File Manifest

```
/Users/patrickkavanagh/dhm-guide-website/
├── index.html (base template with canonical & script tag)
├── canonical-fix.js (client-side fallback script)
├── src/
│   ├── hooks/
│   │   └── useSEO.js (main React SEO hook)
│   ├── pages/
│   │   ├── Home.jsx (uses useSEO)
│   │   ├── Guide.jsx (uses useSEO)
│   │   ├── Reviews.jsx (uses useSEO)
│   │   ├── Research.jsx (uses useSEO)
│   │   ├── Compare.jsx (uses useSEO)
│   │   └── About.jsx (uses useSEO)
│   └── newblog/
│       ├── components/
│       │   └── NewBlogPost.jsx (uses useSEO)
│       ├── pages/
│       │   └── NewBlogListing.jsx (uses useSEO)
│       └── data/
│           └── posts/ (blog post JSON files)
└── scripts/
    ├── prerender-main-pages.js (static HTML generation for 7 main pages)
    ├── prerender-blog-posts.js (static HTML generation for blog posts)
    ├── prerender-blog-posts-enhanced.js (alternative with XSS protection)
    ├── prerender-meta-tags.js (generates large embedded script)
    ├── generate-blog-canonicals.js (generates JSON, output unused)
    └── inject-canonical-tags.js (duplicate of prerender-meta-tags.js)
```

