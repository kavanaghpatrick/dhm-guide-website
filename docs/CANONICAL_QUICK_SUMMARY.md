# Canonical Tags - Quick Summary

## Where Canonicals Are Currently Injected

### 1. Base HTML (Wrong for Dynamic Pages)
- **File**: `/index.html:78`
- **Value**: `https://www.dhmguide.com` (hardcoded base)
- **Problem**: This is what Google sees initially for ALL pages

### 2. Build-Time Prerendering (Works Perfectly)
- **Main pages**: `/scripts/prerender-main-pages.js:122-126`
  - 7 pages (home, guide, reviews, research, about, calculator, compare)
  - Output: `/dist/{route}/index.html` with correct canonical baked in
  - Reliability: HIGH

- **Blog posts**: `/scripts/prerender-blog-posts.js:102-109`
  - ALL blog posts (48+)
  - Output: `/dist/never-hungover/{slug}/index.html` with correct canonical baked in
  - Reliability: HIGH

### 3. Client-Side React Hook (Race Condition)
- **File**: `/src/hooks/useSEO.js:79-88` (useSEO hook)
- **Timing**: Runs AFTER React component mounts (too late for Google crawler)
- **Scope**: All React components that call `useSEO(generatePageSEO('pageType'))`
- **Problem**: Google already indexed with wrong canonical before this runs

### 4. Early Client-Side Script (Still Not Early Enough)
- **File**: `/canonical-fix.js:6-18`
- **Timing**: Runs before React, but still requires JavaScript
- **Scope**: All routes (generic approach using pathname)
- **Problem**: Google crawler may not execute JavaScript

### 5. Embedded Inline Scripts (Large & Duplicate)
- **Files**: 
  - `/scripts/prerender-meta-tags.js` - 100KB+ embedded script
  - `/scripts/inject-canonical-tags.js` - Duplicate of above
- **Problem**: Redundant, creates large HTML payload, still JavaScript-based
- **Status**: Overlapping implementations (should consolidate)

---

## Canonical URLs Defined In

### Main Pages & Blog Posts
- **Hardcoded in prerender scripts** based on route/slug
- Pattern: `https://www.dhmguide.com{route}`

### Dynamic React Pages
- **Defined in**: `/src/hooks/useSEO.js:120-359` (generatePageSEO function)
- **Examples**:
  - `'home'` → `https://www.dhmguide.com`
  - `'guide'` → `https://www.dhmguide.com/guide`
  - `'blog-post'` → `https://www.dhmguide.com/never-hungover/{slug}`

---

## Critical SEO Problem

**Google sees wrong canonical for ALL React-rendered pages:**

1. User requests `/guide`
2. Server returns HTML with: `<link rel="canonical" href="https://www.dhmguide.com" />`
3. Google crawls and records this canonical (home page)
4. JavaScript runs and changes canonical to `/guide`
5. Too late - Google already indexed with wrong canonical

**Result**: Dynamic pages treated as duplicates of home page. Pages don't rank properly.

---

## What Works vs What Doesn't

| Page Type | Canonical Injection | In Initial HTML? | Reliability |
|-----------|---|---|---|
| Blog posts | Build-time prerender | YES | ✅ HIGH |
| Main pages (7) | Build-time prerender | YES | ✅ HIGH |
| Dynamic pages | React hook + JS | NO | ❌ LOW |

---

## Redundant Code to Consolidate

1. **Delete**: `prerender-meta-tags.js` (100KB+ embedded script)
2. **Delete**: `inject-canonical-tags.js` (duplicate of meta-tags)
3. **Delete**: `generate-blog-canonicals.js` (output not used)
4. **Keep**: Build-time prerender scripts (they work!)
5. **Keep**: canonical-fix.js (fallback for SPA navigation)
6. **Keep**: useSEO hook (for client-side updates)

---

## Files to Know About

| File | What it Does | Status |
|------|---|---|
| `/src/hooks/useSEO.js` | React hook for SEO meta tags | Active - used by all React pages |
| `/canonical-fix.js` | Early script to fix canonical for SPAs | Active - fallback mechanism |
| `/index.html:78` | Base canonical tag | Active - starting point |
| `/scripts/prerender-main-pages.js` | Generate static HTML for 7 main pages | Active - works perfectly |
| `/scripts/prerender-blog-posts.js` | Generate static HTML for all blog posts | Active - works perfectly |
| `/scripts/prerender-meta-tags.js` | Embedded inline script (large, redundant) | Active but should consolidate |
| `/scripts/inject-canonical-tags.js` | Embedded inline script (duplicate) | Active but should delete |
| `/scripts/generate-blog-canonicals.js` | Generate JSON file (unused) | Inactive - should delete |

---

## Quick Fix (Immediate)

If you need to immediately ensure correct canonicals for dynamic pages:

1. Either convert them to static HTML at build time (like blog posts)
2. Or implement server-side canonical injection for initial HTML
3. Or use Vercel prerendering for dynamic routes

Current approach (JavaScript-based) cannot guarantee Google sees correct canonical on first crawl.

