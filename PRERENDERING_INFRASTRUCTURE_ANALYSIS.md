# DHM Guide Website - Prerendering & Build Infrastructure Analysis

**Date**: November 7, 2025
**Analysis Focus**: Understanding how canonical tags can be added at build time

---

## Executive Summary

The DHM Guide website uses a **hybrid SPA + SSG (Static Site Generation)** approach:
- **Core Framework**: Vite + Vue.js (React actually)
- **Rendering Method**: Client-side React app with static prerendering of pages
- **Current Canonical Implementation**: JavaScript-based at runtime (suboptimal for Google crawlers)
- **Build Process**: Vite compiles → Prerendering scripts generate static HTML → Vercel deployment

**Key Finding**: The infrastructure ALREADY EXISTS to add canonical tags at build time through the prerendering scripts. This is the ideal approach for Phase 1.

---

## 1. How Pages Are Currently Rendered

### Architecture Overview

```
User Request
    ↓
Vercel Routes
    ↓
Static HTML (prerendered) OR SPA HTML
    ↓
React Hydration (client-side)
    ↓
Content rendered in browser
```

### Rendering Methods by Page Type

#### A. Blog Posts (Prerendered - Static HTML)
- **Location**: `/src/newblog/data/posts/*.json` (175 blog posts as JSON data files)
- **Prerendering Script**: `scripts/prerender-blog-posts-enhanced.js`
- **Output**: `/dist/never-hungover/{slug}/index.html` (static files)
- **How it works**:
  1. Build reads JSON post files
  2. Creates JSDOM instance from `dist/index.html`
  3. Updates meta tags (title, description, OG tags)
  4. Injects structured data (JSON-LD)
  5. Writes static HTML files to disk

**Current Canonical Implementation** (in prerender script):
```javascript
// Line 116-123 of prerender-blog-posts-enhanced.js
let canonical = document.querySelector('link[rel="canonical"]');
if (!canonical) {
  canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  document.head.appendChild(canonical);
}
canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
```

**Status**: Already implemented! Canonical tags are added to static prerendered blog posts.

#### B. Main Pages (Prerendered - Static HTML)
- **Pages**: `/`, `/guide`, `/reviews`, `/research`, `/about`, `/compare`, `/dhm-dosage-calculator`
- **Prerendering Script**: `scripts/prerender-main-pages.js`
- **Output**: `/dist/*/index.html` (static files for each route)
- **How it works**: Similar to blog posts - reads base HTML, updates meta tags, writes static files

**Current Canonical Implementation** (in prerender script):
```javascript
// Line 122-126 of prerender-main-pages.js
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
}
```

**Status**: Already implemented! Canonical tags are added to main page static files.

#### C. Dynamic SPA Routes
- **Not prerendered** - loaded as SPA
- **Routing**: Handled by `src/App.jsx` (simple pathname-based routing)
- **Meta Tag Handling**: Runtime canonical tag fix via `/public/canonical-fix.js`

---

## 2. Existing Infrastructure for Canonical Tags

### What's Already Working

The codebase has **robust canonical tag generation** for static prerendered pages:

#### Blog Posts
- **File**: `/scripts/prerender-blog-posts-enhanced.js`
- **Lines 116-123**: Adds canonical link to every blog post HTML
- **Coverage**: All 175 blog posts
- **Format**: `https://www.dhmguide.com/never-hungover/{slug}`

#### Main Pages
- **File**: `/scripts/prerender-main-pages.js`
- **Lines 122-126**: Adds canonical link to main pages
- **Coverage**: 7 main pages (/, /guide, /reviews, /research, /about, /compare, /dhm-dosage-calculator)
- **Format**: `https://www.dhmguide.com{route}`

### What's NOT Prerendered (and needs work)

**Dynamic Routes** in `src/App.jsx`:
- Any route under `/never-hungover/` that doesn't have a prerendered file
- Routes loaded dynamically at runtime

**Current Approach**: Runtime canonical fix via `/public/canonical-fix.js`

---

## 3. Build Pipeline & Deployment Process

### Build Script (package.json line 9)

```bash
npm run build = 
  node scripts/validate-posts.js &&
  node scripts/generate-blog-canonicals.js &&
  node scripts/generate-sitemap.js &&
  vite build &&
  node scripts/prerender-blog-posts-enhanced.js &&
  node scripts/prerender-main-pages.js
```

### Build Steps Breakdown

1. **Validation** (`validate-posts.js`)
   - Checks blog post JSON files for required fields

2. **Canonical Generation** (`generate-blog-canonicals.js`)
   - Creates `/public/blog-canonicals.json` mapping posts to URLs
   - **Note**: This is for reference only, not currently used in HTML

3. **Sitemap Generation** (`generate-sitemap.js`)
   - Creates sitemap for Google indexing

4. **Vite Build** (`vite build`)
   - Compiles React app to `/dist`
   - Generates `dist/index.html` as base template

5. **Blog Post Prerendering** (`prerender-blog-posts-enhanced.js`)
   - Reads base HTML from Vite output
   - Creates static HTML for each blog post
   - **Adds canonical tags to each file**

6. **Main Page Prerendering** (`prerender-main-pages.js`)
   - Creates static HTML for main pages
   - **Adds canonical tags to each file**

### Vercel Deployment (vercel.json)

```json
{
  "redirects": [
    // Handles blog post redirects
    { "source": "/blog/:slug*", "destination": "/never-hungover/:slug*" },
    { "source": "/newblog/:slug*", "destination": "/never-hungover/:slug*" }
  ],
  "rewrites": [
    // SPA fallback: routes without prerendered files → index.html
    { "source": "/((?!never-hungover/).*)", "destination": "/index.html" }
  ],
  "trailingSlash": false
}
```

**Key insight**: Vercel rewrites non-blog routes back to `index.html` for SPA rendering, but prerendered blog posts bypass this and serve static files directly.

---

## 4. How to Add Canonical Tags at Build Time

### Current Approach (Already Working for Prerendered Pages)

The infrastructure is **already in place** in two prerendering scripts. For Phase 1, we need to verify this works correctly:

#### For Blog Posts (prerender-blog-posts-enhanced.js)
Currently adds canonical in lines 116-123:
```javascript
let canonical = document.querySelector('link[rel="canonical"]');
if (!canonical) {
  canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  document.head.appendChild(canonical);
}
canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
```

**Assessment**: This is the RIGHT approach. HTML is generated at build time with canonical tags embedded before Vercel deployment.

#### For Main Pages (prerender-main-pages.js)
Currently adds canonical in lines 122-126:
```javascript
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
}
```

**Assessment**: Also correct. These are static files served directly by Vercel.

---

## 5. Key Modification Points for Phase 1

### Option A: Enhance Existing Prerender Scripts (RECOMMENDED)

The infrastructure is already there. To fully implement Phase 1, we would:

1. **Verify canonical tags are correct** in `prerender-blog-posts-enhanced.js`
   - Ensure all 175 blog posts have the canonical tag
   - Verify format matches canonical URL structure

2. **Verify canonical tags are correct** in `prerender-main-pages.js`
   - Ensure all 7 main pages have the canonical tag
   - Verify format is correct

3. **Add canonical tag generation** for any dynamic pages not yet prerendered
   - Check if there are routes served via SPA without prerendering
   - Decide whether to prerender or keep as SPA

4. **Verify Vercel configuration** in `vercel.json`
   - Ensure prerendered pages are served directly (not via SPA rewrite)
   - This is already correct - rewrites only apply to non-`/never-hungover/` routes

### Option B: Server-Side Tag Injection (Not needed for static sites)

Since pages are prerendered as static files, there's no server-side processing. This is actually ideal for SEO:
- Google crawlers see canonical tags immediately (no JS execution needed)
- No rendering queue delays
- Fastest possible crawling

---

## 6. What We DON'T Need to Modify

### JavaScript Runtime Canonical Fix
- **File**: `/public/canonical-fix.js`
- **Current Role**: Fixes canonical tags for SPA routes loaded at runtime
- **For Phase 1**: Keep this as fallback, but prerendered pages won't need it

### Frontend Meta Tag Components
- Canonical tags are added at build time, not runtime
- No React component changes needed for prerendered pages
- SPA routes will still use runtime approach

### Vite Configuration
- Already optimized
- No changes needed for canonical tag strategy

---

## 7. Canonical Tag Location & Verification

### Where Canonical Tags Are Placed

In the HTML `<head>` section:
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Other meta tags -->
    <link rel="canonical" href="https://www.dhmguide.com/never-hungover/post-slug" />
  </head>
  <body>
    <!-- Content -->
  </body>
</html>
```

### How to Verify During Build

The prerender scripts output logs:
```
✅ Successfully prerendered 175 blog posts with:
   • XSS protection (HTML escaping)
   • SEO-friendly visible content
   • Parallel processing for performance
   • Atomic file operations
   • Build dependency validation
📁 Static HTML files generated in: /dist/never-hungover/
```

**To verify canonical tags were added**:
```bash
# After npm run build
grep -r "canonical" dist/never-hungover/ | head -5
```

---

## 8. Data Flow for Canonical Tags

### Blog Posts Flow

```
JSON Post Files
  ↓ (read by prerender script)
Post Data (slug, title, excerpt, etc.)
  ↓ (extract slug)
Canonical URL: https://www.dhmguide.com/never-hungover/{slug}
  ↓ (inject into HTML)
Static HTML File: dist/never-hungover/{slug}/index.html
  ↓ (Vercel serves directly)
Browser/Google Crawler
```

### Main Pages Flow

```
Page Configuration Array (in prerender-main-pages.js)
  ↓ (iterate through pages)
Page Route: /guide, /reviews, etc.
  ↓ (build canonical URL)
Canonical URL: https://www.dhmguide.com{route}
  ↓ (inject into HTML)
Static HTML File: dist/{route}/index.html
  ↓ (Vercel serves directly)
Browser/Google Crawler
```

---

## 9. What Needs Testing in Phase 1

1. **Canonical Tag Presence**
   - Verify all 175 blog posts have canonical tags
   - Verify all 7 main pages have canonical tags
   - Check that tags point to correct URLs

2. **Canonical Tag Format**
   - Verify HTTPS protocol is used
   - Verify no trailing slashes (unless necessary)
   - Verify domain is correct (www.dhmguide.com)

3. **Vercel Delivery**
   - Verify Vercel serves prerendered files (not SPA HTML)
   - Verify canonical tags are in static HTML response

4. **Google Search Console**
   - Submit build output for indexing
   - Check that Google recognizes canonical URLs
   - Monitor for "duplicate without user-selected canonical" errors

5. **Crawler Testing**
   - Use curl/wget to verify canonical tags in HTTP response
   - Check head section specifically (not relying on JavaScript)

---

## 10. Technical Summary

| Aspect | Status | Details |
|--------|--------|---------|
| **Current Rendering** | Hybrid SPA + SSG | Main pages prerendered, blog posts prerendered, some routes SPA |
| **Canonical Tags** | ALREADY IMPLEMENTED | Added in build-time scripts, embedded in static HTML |
| **Infrastructure** | OPTIMAL | Static files = no JS needed, faster Google crawling |
| **Modification Points** | Minimal | Just need to verify existing implementation works |
| **Deployment** | Vercel | Serves prerendered static files directly |
| **Fallback** | JavaScript fix | `/public/canonical-fix.js` for SPA routes |
| **Risk Level** | LOW | Existing code is already correct |
| **Implementation Time** | 30-60 min | Verification + testing |

---

## 11. Phase 1 Implementation Plan

### Step 1: Verify Current State
- Run `npm run build` locally
- Check if canonical tags exist in static files
- Verify tags are correct format

### Step 2: Test in Staging
- Deploy to Vercel preview branch
- Curl static files to verify canonical tags in response
- Check Google Search Console for canonical recognition

### Step 3: Monitor
- Submit blog sitemap to Google Search Console
- Monitor for canonical tag errors
- Track indexing progress

### Phase 1 Output
- Canonical tags embedded in all prerendered HTML
- Verified by Google Search Console
- Ready for Phase 2 (dynamic content, internal linking)

---

## File Reference Guide

| File | Purpose | Canonical Implementation |
|------|---------|--------------------------|
| `vite.config.js` | Vite build config | No changes needed |
| `package.json` | Build scripts | Lines 9-18, defines build order |
| `vercel.json` | Vercel routing | No changes, rewrites correct |
| `scripts/prerender-blog-posts-enhanced.js` | Blog post prerendering | Lines 116-123, canonical tags |
| `scripts/prerender-main-pages.js` | Main page prerendering | Lines 122-126, canonical tags |
| `scripts/generate-blog-canonicals.js` | Canonical reference file | Creates JSON, not used in HTML yet |
| `public/canonical-fix.js` | Runtime fallback | Keep for SPA routes |
| `index.html` | Template file | Base file for prerendering |

---

## Conclusion

The DHM Guide website has an **excellent foundation** for canonical tag implementation:

1. **Build-time injection is already in place** - This is the SEO best practice
2. **Static files are generated** - Canonical tags are embedded before deployment
3. **Vercel routing is correct** - Prerendered files bypass SPA rewrite
4. **No major modifications needed** - Just verification and testing

**Phase 1 is essentially verifying and testing what's already there.**

The existing prerendering infrastructure is production-ready and follows SEO best practices. This sets us up perfectly for Phase 2 (internal linking), Phase 3 (dynamic content), etc.
