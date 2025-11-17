# Canonical Tags Implementation - Quick Reference & Roadmap

## The Good News: It's Already Built

```
┌─────────────────────────────────────────────────────┐
│  CURRENT STATE: Canonical Tags Already Implemented │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Blog Posts (175 total)                             │
│  ✓ Lines 116-123: prerender-blog-posts-enhanced.js │
│  ✓ Canonical: https://www.dhmguide.com/.../{slug}  │
│                                                     │
│  Main Pages (7 total)                               │
│  ✓ Lines 122-126: prerender-main-pages.js          │
│  ✓ Canonical: https://www.dhmguide.com/{route}     │
│                                                     │
│  Dynamic Routes (SPA)                               │
│  ~ Fallback: /public/canonical-fix.js              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## How It Works (Simple)

### Blog Posts
```
POST DATA           PRERENDER SCRIPT         OUTPUT
.json file    →    Extract slug      →    Static HTML
              →    Build URL              /never-hungover/{slug}/index.html
              →    Inject canonical      <link rel="canonical" href="...">
              →    Write file            dist/
```

### Main Pages
```
CONFIG ARRAY        PRERENDER SCRIPT         OUTPUT
pages.js array  →   Iterate routes    →    Static HTML
                →   Build URL              /guide/index.html
                →   Inject canonical      <link rel="canonical" href="...">
                →   Write file            dist/
```

---

## Build Pipeline (Correct Order)

```
1. npm run build
   ↓
2. Validate posts (validate-posts.js)
   ↓
3. Generate canonical reference (generate-blog-canonicals.js)
   ↓
4. Generate sitemap (generate-sitemap.js)
   ↓
5. Vite compile (vite build)
   ├─ Creates: dist/index.html (template)
   ├─ Creates: JS/CSS bundles
   └─ Generates: Vite manifest
   ↓
6. Prerender blog posts (prerender-blog-posts-enhanced.js)
   ├─ Reads: dist/index.html
   ├─ Reads: All 175 .json files
   ├─ Injects: Canonical tags ← THIS IS KEY
   └─ Writes: dist/never-hungover/{slug}/index.html
   ↓
7. Prerender main pages (prerender-main-pages.js)
   ├─ Reads: dist/index.html
   ├─ Injects: Canonical tags ← THIS IS KEY
   └─ Writes: dist/{route}/index.html
   ↓
8. Vercel deploys dist/ folder
   ├─ Serves: /never-hungover/{slug}/index.html directly
   ├─ Serves: /guide/index.html directly
   └─ Serves: other routes via SPA /index.html
```

---

## Files You Need to Know About

### Critical Files (Already Working)

| File | Lines | What It Does |
|------|-------|--------------|
| `scripts/prerender-blog-posts-enhanced.js` | 116-123 | Injects canonical into 175 blog post HTMLs |
| `scripts/prerender-main-pages.js` | 122-126 | Injects canonical into 7 main page HTMLs |
| `vercel.json` | (all) | Routes requests to correct static files |
| `index.html` | 78 | Template with base canonical tag |

### Supporting Files (Reference)

| File | Purpose |
|------|---------|
| `scripts/generate-blog-canonicals.js` | Creates JSON mapping (not used in HTML yet) |
| `public/canonical-fix.js` | Fallback for SPA routes (keep as backup) |
| `vite.config.js` | Build config (no changes needed) |

---

## What's Already Correct (DON'T CHANGE)

1. ✓ Canonical tags are added at build time (not runtime)
2. ✓ Tags are in static files (not JavaScript)
3. ✓ HTTPS protocol is used
4. ✓ Vercel serves static files directly (not via SPA rewrite)
5. ✓ No trailing slashes (unless needed)
6. ✓ Domain is correct (www.dhmguide.com)

---

## Phase 1 Action Items (30-60 minutes)

### Verification Only - No Code Changes Yet

- [ ] Run `npm run build` locally
- [ ] Verify build completes successfully
- [ ] Check if canonical tags are in static files:
  ```bash
  grep -l "canonical" dist/never-hungover/*/index.html | wc -l
  # Should show 175
  ```
- [ ] Sample a few files to verify format:
  ```bash
  head -100 dist/never-hungover/activated-charcoal-hangover/index.html | grep canonical
  ```
- [ ] Deploy preview to Vercel
- [ ] Curl a blog post to verify canonical is in HTTP response:
  ```bash
  curl -I https://[preview-url]/never-hungover/activated-charcoal-hangover | grep canonical
  ```

### Testing in Google Search Console

- [ ] Go to GSC property settings
- [ ] Check "Preferred domain" is set to www.dhmguide.com
- [ ] Submit blog sitemap for re-indexing
- [ ] Wait 2-3 days for Google to crawl
- [ ] In GSC Coverage report, look for canonical recognition
- [ ] Monitor "Excluded" section for duplicate content warnings

---

## Infrastructure Strengths (Why This Works)

1. **Static Files (Not SPA)**
   - Canonical tags are embedded before deployment
   - No JavaScript execution needed
   - Google crawlers see tags immediately
   - Fastest possible indexing

2. **Dual Prerendering Scripts**
   - Blog posts: Handles 175 posts with consistent format
   - Main pages: Handles core pages with unique metadata
   - Both inject canonical tags correctly

3. **Correct Vercel Configuration**
   - Prerendered files bypass SPA rewrite
   - Each route has its own index.html
   - Canonical tags are preserved in response

4. **Build Order**
   - Vite generates template first
   - Then prerender scripts enhance it
   - Then Vercel deploys final output

---

## Potential Issues & Fixes

### Issue 1: Missing Canonical Tags
**Symptom**: `grep canonical` returns 0 results
**Cause**: Prerender script might not be running
**Fix**: Check build log, verify script runs after Vite build

### Issue 2: Wrong URL Format
**Symptom**: Canonical shows incorrect URL
**Cause**: Hardcoded domain or slug format issue
**Fix**: Check lines 123 and 125 in prerender scripts

### Issue 3: Google Doesn't Recognize Canonical
**Symptom**: GSC shows duplicate content warnings
**Cause**: Google might be seeing SPA version instead of static
**Fix**: Verify Vercel is serving static files (not SPA rewrite)

### Issue 4: Trailing Slashes
**Symptom**: Some URLs have trailing slash, some don't
**Cause**: Inconsistent generation in scripts
**Fix**: Verify vercel.json has `"trailingSlash": false`

---

## Quick Checklist for Phase 1 Completion

```
VERIFICATION PHASE
☐ npm run build completes without errors
☐ 175 blog posts have canonical tags
☐ 7 main pages have canonical tags
☐ Tags point to correct URLs
☐ Tags use HTTPS protocol
☐ No trailing slashes (unless needed)

DEPLOYMENT PHASE
☐ Deploy to Vercel preview branch
☐ Curl a blog post URL
☐ Verify canonical in HTTP response headers
☐ Verify canonical is in HTML <head>
☐ Test on mobile (should still see canonical)

GOOGLE VERIFICATION
☐ Submit sitemap to Google Search Console
☐ Check preferred domain setting
☐ Monitor Coverage report daily for 3 days
☐ No "duplicate without user-selected canonical" errors
☐ Indexing rate improves (week 2-3)

LAUNCH
☐ Merge to main branch
☐ Production build completes
☐ Production HTML verified with canonical
☐ GSC shows improved crawl efficiency
☐ Ready for Phase 2
```

---

## Next Steps (Phase 2+)

Once Phase 1 is complete and verified:

**Phase 2: Internal Linking Strategy**
- Add strategic internal links between related posts
- Create hub pages that link to clusters
- Update breadcrumbs

**Phase 3: Dynamic Content Handling**
- Identify SPA-only routes that need prerendering
- Add prerender script for dynamic pages
- Expand canonical tag coverage to 100%

**Phase 4: Structured Data**
- JSON-LD is already added for blog posts
- Add schema for main pages
- Improve rich snippet eligibility

---

## One-Page Summary

| Question | Answer |
|----------|--------|
| **Are canonical tags already there?** | Yes (in build scripts) |
| **Are they injected at build time?** | Yes (correct approach) |
| **Are they in static files?** | Yes (prerendered HTML) |
| **Will Google see them?** | Yes (no JS needed) |
| **Do we need to change code?** | No (just verify) |
| **What's Phase 1 timeline?** | 30-60 minutes verification |
| **What's Phase 1 risk level?** | Very low (read-only test) |
| **When can we go live?** | After Phase 1 verification |

---

## Contact & Support

For questions about:
- **Build process**: See `package.json` line 9
- **Blog prerendering**: See `scripts/prerender-blog-posts-enhanced.js`
- **Main page prerendering**: See `scripts/prerender-main-pages.js`
- **Vercel routing**: See `vercel.json`
- **SEO verification**: Google Search Console

---

**Last Updated**: November 7, 2025
**Status**: Infrastructure Review Complete - Ready for Phase 1 Verification
