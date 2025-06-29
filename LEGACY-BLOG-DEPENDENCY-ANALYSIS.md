# Legacy Blog System - Complete Dependency Analysis Report

Generated: 2025-06-29

## Executive Summary

This report documents ALL references to the legacy blog system (`/src/blog/`) across the entire codebase, including imports, routes, hardcoded URLs, and potential breaking points.

## 1. Core Blog System Files

### Legacy Blog Structure
```
/src/blog/
├── components/
│   └── BlogPost.jsx (755 lines)
├── data/
│   ├── posts.js (contains hardcoded blog URLs)
│   └── posts.js.backup
├── posts/
│   ├── dhm-dosage-guide-2025.md
│   └── dhm-science-explained.md
└── utils/
    └── postLoader.js (54 lines)
```

## 2. Direct Import Dependencies

### 2.1 Component Imports

**App.jsx (Line 13)**
```javascript
const BlogPost = lazy(() => import('./blog/components/BlogPost.jsx'))
```

### 2.2 Utility Imports

**Multiple Blog Test Pages:**
- `/src/pages/Blog.jsx` (Line 3): `import { getAllPosts } from '../blog/utils/postLoader';`
- `/src/pages/BlogMinimal.jsx` (Line 2): `import { getAllPosts } from '../blog/utils/postLoader';`
- `/src/pages/BlogPostsOnly.jsx` (Line 2): `import { getAllPosts } from '../blog/utils/postLoader';`
- `/src/pages/BlogCombinedTest.jsx` (Line 2): `import { getAllPosts } from '../blog/utils/postLoader';`

**BlogPost Component:**
- `/src/blog/components/BlogPost.jsx` (Line 5): `import { getPostBySlug, getRelatedPosts } from '../utils/postLoader';`

**Scripts:**
- `/scripts/extract-blog-data.js` (Line 9): `import { posts } from '../src/blog/data/posts.js';`

## 3. Route Dependencies

### 3.1 App.jsx Routing (Lines 52-55)
```javascript
// Handle old blog post routes (e.g., /blog/post-slug) - legacy support
if (currentPath.startsWith('/blog/')) {
  return <BlogPost />
}
```

### 3.2 Static Route (Line 79-80)
```javascript
case '/blog':
  return <Blog />
```

### 3.3 Vercel.json Redirects (Lines 4-8)
```json
{
  "source": "/blog/:path*",
  "destination": "/never-hungover/:path*",
  "permanent": true
}
```

## 4. Hardcoded Blog URLs

### 4.1 In Blog Posts Data (posts.js)
Found 10+ hardcoded internal blog links:
- Line 6332: `/blog/dhm-dosage-guide-2025`
- Line 6612: `/blog/when-to-take-dhm-timing-guide-2025`
- Line 6891: `/blog/dhm-dosage-guide-2025`
- Line 7171: `/blog/when-to-take-dhm-timing-guide-2025`
- Line 7365: `/blog/dhm-dosage-guide-2025`
- Line 7404: `/blog/dhm-dosage-guide-2025`
- Line 7647: `/blog/dhm-dosage-guide-2025`
- Line 7899: `/blog/dhm-dosage-guide-2025`
- Line 7996: `/blog/emergency-hangover-protocol-2025`
- Line 8299: Multiple review links

### 4.2 In Navigation/UI Components
- BlogPost.jsx: Multiple references for breadcrumbs and navigation
- Blog.jsx: Navigation handlers for blog post links

## 5. SEO/Meta Dependencies

### 5.1 useSEO Hook (useSEO.js)
- Line 235-283: 'blog' case for blog listing page
- Line 284-322: 'blog-post' case for individual posts
- Canonical URL generation: `${baseUrl}/blog/${slug}`
- Default image paths: `/blog-featured.jpg`, `/blog-default.jpg`

## 6. Test Page Dependencies

### Test Pages Using Blog System:
1. **BlogBasic.jsx** - No blog imports (control test)
2. **BlogSimple.jsx** - Uses hardcoded mock data, no blog imports
3. **BlogSEOTest.jsx** - Only tests SEO hook
4. **BlogPostsOnly.jsx** - Tests postLoader import
5. **BlogMinimal.jsx** - Tests both SEO and postLoader
6. **BlogCombinedTest.jsx** - Full integration test
7. **Blog.jsx** - Production blog listing page

## 7. Shared Code Analysis

### 7.1 No Direct Shared Utilities
- Old blog system: Uses synchronous `postLoader.js`
- New blog system: Uses async `newblog/utils/postLoader.js`
- Different data structures (old uses direct imports, new uses dynamic loading)

### 7.2 Potential Shared Dependencies
- Both use `useSEO` hook
- Both use similar markdown rendering (react-markdown)
- Both reference similar UI components (lucide-react icons)

## 8. External Dependencies

### 8.1 Scripts That Process Blog Data
1. **extract-blog-data.js** - Migrates old blog posts to new format
2. **generate-sitemap.js** - No longer includes /blog URLs (already updated)
3. **test-imports.js** - Tests new blog system only

## 9. Risk Assessment

### 9.1 High Risk Areas
1. **App.jsx routing** - Critical path for all blog routes
2. **Hardcoded URLs in posts.js** - Will cause 404s if not updated
3. **SEO hook** - May generate incorrect meta tags
4. **Vercel redirects** - Currently redirecting old URLs

### 9.2 Medium Risk Areas
1. **Test pages** - May break but not affect production
2. **Scripts** - extract-blog-data.js may fail if blog data removed

### 9.3 Low Risk Areas
1. **Markdown files** - Only 2 files, minimal impact
2. **Backup files** - Can be safely removed

## 10. Removal Checklist

### Phase 1: Update Internal Links
- [ ] Replace all `/blog/` URLs in posts.js with `/never-hungover/`
- [ ] Update SEO hook to remove blog cases or redirect to new blog

### Phase 2: Update Routing
- [ ] Remove BlogPost import from App.jsx
- [ ] Remove /blog/ route handling from App.jsx
- [ ] Remove /blog static route from App.jsx

### Phase 3: Remove Test Pages
- [ ] Delete all Blog*.jsx test pages from /src/pages/
- [ ] Keep only production-ready pages

### Phase 4: Remove Blog System
- [ ] Delete /src/blog/ directory entirely
- [ ] Update extract-blog-data.js or remove if no longer needed

### Phase 5: Cleanup
- [ ] Test all redirects working properly
- [ ] Verify no broken internal links
- [ ] Run build to ensure no import errors

## 11. Files Requiring Updates

### Must Update Before Removal:
1. `/src/App.jsx` - Remove blog imports and routes
2. `/src/blog/data/posts.js` - Update all hardcoded /blog/ URLs
3. `/src/hooks/useSEO.js` - Update or remove blog cases
4. `/scripts/extract-blog-data.js` - Remove or update import

### Can Delete Directly:
1. All `/src/pages/Blog*.jsx` files (7 files)
2. `/src/blog/posts/*.md` files (2 files)
3. `/src/blog/data/posts.js.backup`

### Already Updated:
1. `/scripts/generate-sitemap.js` - No longer includes /blog URLs
2. `/vercel.json` - Has redirects in place

## 12. Testing Requirements

### Pre-Removal Tests:
1. Verify all /blog/* URLs redirect to /never-hungover/*
2. Check all internal links work after URL updates
3. Test SEO meta tags generation
4. Ensure build passes without blog imports

### Post-Removal Tests:
1. Full site navigation test
2. Check all blog content accessible via new URLs
3. Verify no 404 errors
4. SEO/meta tag validation
5. Performance testing (should improve with less code)

## Conclusion

The legacy blog system has 17 files with direct dependencies and 10+ hardcoded URLs that need updating. The removal process should follow the phased approach outlined above to minimize risk of breaking the production site. The most critical updates are in App.jsx routing and the hardcoded URLs in posts.js.