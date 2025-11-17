# Canonical Tags: Server-Side Implementation Quick Start

## One-Minute Summary

Blog posts and main pages get canonical tags via **static HTML prerendering**, not JavaScript.

**Pattern**:
1. Vite builds base template → `/dist/index.html`
2. Prerendering script reads base template
3. Script updates `<link rel="canonical">` tag with page-specific URL
4. Script writes static HTML → `/dist/{route}/index.html`
5. Vercel serves the static file (not the base template)
6. Google sees canonical tag in initial HTML response

---

## The Two Prerendering Scripts

### 1. Blog Posts: `scripts/prerender-blog-posts-enhanced.js`

```javascript
// Line 102-109: Add canonical URL
let canonical = document.querySelector('link[rel="canonical"]');
if (!canonical) {
  canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  document.head.appendChild(canonical);
}
canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);

// Line 195-202: Write static file
const postDir = path.join(blogDistDir, post.slug);
fs.mkdirSync(postDir, { recursive: true });
const outputPath = path.join(postDir, 'index.html');
fs.writeFileSync(outputPath, dom.serialize());
```

**Result**: `/dist/never-hungover/activated-charcoal-hangover/index.html` with canonical hardcoded.

### 2. Main Pages: `scripts/prerender-main-pages.js`

```javascript
// Line 122-126: Update canonical URL
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
}

// Line 137-142: Write static file
const outputPath = page.route === '/' ? 
  '/dist/index.html' : 
  path.join('/dist', page.route, 'index.html');
fs.writeFileSync(outputPath, dom.serialize());
```

**Result**: `/dist/guide/index.html`, `/dist/reviews/index.html`, etc. with unique canonicals.

---

## File Structure Created

```
/dist/
├── index.html                          ← Homepage (canonical: https://www.dhmguide.com/)
├── guide/index.html                    ← /guide (canonical: https://www.dhmguide.com/guide)
├── reviews/index.html                  ← /reviews (canonical: https://www.dhmguide.com/reviews)
├── about/index.html                    ← /about (canonical: https://www.dhmguide.com/about)
├── research/index.html                 ← /research (canonical: https://www.dhmguide.com/research)
├── compare/index.html                  ← /compare (canonical: https://www.dhmguide.com/compare)
├── dhm-dosage-calculator/index.html    ← /dhm-dosage-calculator
└── never-hungover/
    ├── index.html                      ← /never-hungover listing
    ├── activated-charcoal-hangover/index.html  ← Post 1
    ├── alcohol-aging-longevity-2025/index.html ← Post 2
    └── ... (161 more posts)
```

**Each file contains its own canonical tag in the `<head>`**.

---

## What Gets Hardcoded in Static HTML

Every prerendered HTML file contains:

```html
<head>
  <title>Page-Specific Title</title>
  <meta name="description" content="Page-specific description">
  
  <!-- CRITICAL: Canonical tag - hardcoded, not dynamic -->
  <link rel="canonical" href="https://www.dhmguide.com/route">
  
  <!-- Open Graph - hardcoded, not dynamic -->
  <meta property="og:url" content="https://www.dhmguide.com/route">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page Description">
  <meta property="og:image" content="https://www.dhmguide.com/image.jpg">
  
  <!-- Twitter - hardcoded, not dynamic -->
  <meta property="twitter:title" content="Page Title">
  <meta property="twitter:description" content="Page Description">
  <meta property="twitter:image" content="https://www.dhmguide.com/image.jpg">
  
  <!-- Structured Data - hardcoded, not dynamic -->
  <script type="application/ld+json">
    {
      "@type": "Article",
      "mainEntityOfPage": {
        "@id": "https://www.dhmguide.com/route"
      }
    }
  </script>
</head>
<body>
  <div id="root"></div>  <!-- React loads here -->
  <script type="module" src="/assets/main.js"></script>
</body>
```

**Before React loads, crawlers see**: Title, meta, canonical, OG tags, Twitter cards, structured data.

---

## Why This Works for SEO

### For Google
1. Google visits `/never-hungover/activated-charcoal-hangover`
2. Vercel serves `/dist/never-hungover/activated-charcoal-hangover/index.html`
3. Google reads HTTP response (before JavaScript)
4. Google sees: `<link rel="canonical" href="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">`
5. Google indexes this URL immediately

### For Social Media
1. Twitter bot visits `/never-hungover/activated-charcoal-hangover`
2. Vercel serves `/dist/never-hungover/activated-charcoal-hangover/index.html`
3. Twitter reads response (NO JavaScript execution)
4. Twitter extracts: `<meta property="og:title">`, `<meta property="og:image">`, etc.
5. Twitter card displays correct preview

---

## useSEO Hook: What It Does (and Doesn't Do)

**File**: `/src/hooks/useSEO.js`

```javascript
// DOES: Update <title> for browser tab
document.title = title;

// DOES: Update <meta name="description"> for users navigating SPA
updateMetaTag('meta[name="description"]', 'name', description);

// DOES: Update canonical for consistency (already in static HTML)
if (canonicalUrl) {
  let canonical = document.querySelector('link[rel="canonical"]');
  canonical.setAttribute('href', canonicalUrl);
}

// DOES NOT: Inject OG tags (line 69-70 comment says:)
// "Note: OG tags are NOT updated here because social media crawlers 
//  don't execute JavaScript. They only see the prerendered static HTML 
//  with baked-in OG tags"

// DOES NOT: Inject structured data for crawlers
```

**useSEO is purely for client-side SPA navigation, NOT for SEO crawlers**.

---

## Implementation Checklist for New Pages

To add canonical tags to a new page:

### Step 1: Identify the Route
```javascript
const pages = [
  {
    route: '/your-new-page',
    title: 'Your Page Title',
    description: 'Your page description',
    ogImage: '/og-image.jpg'
  }
];
```

### Step 2: Create or Update Prerendering Script
```javascript
// Create scripts/prerender-your-pages.js
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const baseHtml = fs.readFileSync('./dist/index.html', 'utf-8');

pages.forEach(page => {
  const dom = new JSDOM(baseHtml);
  const document = dom.window.document;
  
  // Update title
  document.title = page.title;
  
  // Update meta description
  document.querySelector('meta[name="description"]').setAttribute('content', page.description);
  
  // Update canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
  
  // Update OG tags
  document.querySelector('meta[property="og:url"]').setAttribute('content', `https://www.dhmguide.com${page.route}`);
  document.querySelector('meta[property="og:title"]').setAttribute('content', page.title);
  document.querySelector('meta[property="og:image"]').setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);
  
  // Create directory and write file
  const outputDir = page.route === '/' ? 
    './dist' : 
    path.join('./dist', page.route);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputPath = path.join(
    page.route === '/' ? './dist' : outputDir,
    'index.html'
  );
  fs.writeFileSync(outputPath, dom.serialize());
  
  console.log(`  ✓ ${page.route}`);
});
```

### Step 3: Add to Build Pipeline
**File**: `package.json`

```json
"build": "... && node scripts/prerender-your-pages.js"
```

Make sure it runs AFTER `vite build`.

### Step 4: Verify
```bash
# Check that file exists
ls -la dist/your-new-page/index.html

# Check that canonical is in the file
grep "canonical" dist/your-new-page/index.html
# Should output: <link rel="canonical" href="https://www.dhmguide.com/your-new-page">

# Check that OG tags are in the file
grep "og:title" dist/your-new-page/index.html
# Should output: <meta property="og:title" content="Your Page Title">
```

---

## Testing in Production

### Test 1: Verify File Exists
```bash
curl -I https://www.dhmguide.com/your-page
# Should return: 200 OK
# Content-Type: text/html
```

### Test 2: Verify Canonical in Initial Response
```bash
curl https://www.dhmguide.com/your-page | grep canonical
# Should output the canonical tag with the correct URL
```

### Test 3: Verify Google Sees It
1. Go to Google Search Console
2. Search for your URL
3. Click "Inspect any URL"
4. Check "Lighthouse" report
5. Look for "Crawled as:" with your page-specific title
6. NOT the homepage title (which would indicate a rewrite issue)

---

## Common Mistakes

### Mistake 1: Using useSEO for Crawlers
```javascript
// WRONG: Relying on useSEO to inject canonical for crawlers
useSEO({
  canonicalUrl: '/your-page'
});
// Crawlers never see this because they don't run JavaScript
```

**Fix**: Add canonical to prerendered static HTML.

### Mistake 2: Not Creating Directory Structure
```javascript
// WRONG: Writing to wrong path
fs.writeFileSync('/dist/your-page.html', html);

// CORRECT: Create directory
fs.mkdirSync('/dist/your-page', { recursive: true });
fs.writeFileSync('/dist/your-page/index.html', html);
```

### Mistake 3: Forgetting to Update OG Tags
```javascript
// WRONG: Only updating canonical
canonical.setAttribute('href', url);

// CORRECT: Also update OG tags
const ogUrl = document.querySelector('meta[property="og:url"]');
ogUrl.setAttribute('content', url);
const ogTitle = document.querySelector('meta[property="og:title"]');
ogTitle.setAttribute('content', title);
```

### Mistake 4: Running Script Before Vite Build
```json
// WRONG: Script runs before vite creates base template
"build": "node prerender-pages.js && vite build"

// CORRECT: Script runs after vite creates base template
"build": "vite build && node prerender-pages.js"
```

---

## Key Files Reference

| File | Purpose | Key Lines |
|------|---------|-----------|
| `/scripts/prerender-blog-posts-enhanced.js` | Generate blog post HTML | 102-109 (canonical), 195-202 (write file) |
| `/scripts/prerender-main-pages.js` | Generate main page HTML | 122-126 (canonical), 137-142 (write file) |
| `/src/hooks/useSEO.js` | Client-side updates | 79-88 (canonical), 69-70 (OG tag comment) |
| `/src/newblog/components/NewBlogPost.jsx` | Blog post component | 302-311 (calls useSEO) |
| `package.json` | Build pipeline | build script |
| `/dist/*/index.html` | Generated files | Contains hardcoded canonical |

---

## Performance Impact

- **Build time**: +500ms to prerender 168 files
- **File size**: +14KB per page (static HTML with meta tags)
- **Runtime**: Zero impact (files are static, no JavaScript needed)
- **Vercel**: Serves pre-rendered files (no computation)

---

## Summary

1. **Build time**: Prerendering scripts create static HTML with canonicals
2. **Deployment**: Vercel serves `/dist/{route}/index.html` 
3. **Crawlers**: See canonical in initial HTML response
4. **JavaScript**: Not required for SEO (but updates title/meta for SPA nav)
5. **Testing**: Use Google Search Console to verify crawl behavior

This pattern ensures Google and social crawlers see correct canonicals WITHOUT JavaScript dependency.
