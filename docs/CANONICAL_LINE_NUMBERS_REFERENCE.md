# Canonical Tags - Line Numbers Reference

## Quick Lookup: All Canonical Implementation Line Numbers

### 1. Base HTML - Where Google Sees Wrong Canonical Initially

File: `/index.html`
```
Line 78:  <link rel="canonical" href="https://www.dhmguide.com" />
Line 80:  <script src="/canonical-fix.js"></script>
```

**Issue**: This base canonical is what Google's crawler sees for ALL pages on initial fetch. It's only correct for the home page.

---

### 2. React SEO Hook - useSEO.js

File: `/src/hooks/useSEO.js`

#### Full Hook Function
```
Lines 29-114: export const useSEO = (seoData) => { ... }
```

#### Canonical Update Code (Lines 79-88)
```javascript
79:    // Update canonical URL
80:    if (canonicalUrl) {
81:      let canonical = document.querySelector('link[rel="canonical"]');
82:      if (!canonical) {
83:        canonical = document.createElement('link');
84:        canonical.setAttribute('rel', 'canonical');
85:        document.head.appendChild(canonical);
86:      }
87:      canonical.setAttribute('href', canonicalUrl);
88:    }
```

**This code**:
- Runs INSIDE a useEffect hook (line 30)
- Executes when React component mounts
- DOM manipulates the canonical tag
- Too late for Google crawler (JavaScript required)

#### Canonical URL Definitions (Lines 120-359)
```javascript
120: export const generatePageSEO = (pageType, pageData = {}) => {
121:   const baseUrl = 'https://www.dhmguide.com';
122:   
123:   switch (pageType) {
124:     case 'home':
129:       canonicalUrl: baseUrl,  // https://www.dhmguide.com
...
147:     case 'guide':
151:       canonicalUrl: `${baseUrl}/guide`,  // https://www.dhmguide.com/guide
...
173:     case 'reviews':
178:       canonicalUrl: `${baseUrl}/reviews`,
...
196:     case 'research':
201:       canonicalUrl: `${baseUrl}/research`,
...
216:     case 'compare':
221:       canonicalUrl: `${baseUrl}/compare`,
...
247:     case 'never-hungover':
252:       canonicalUrl: `${baseUrl}/never-hungover`,
...
281:     case 'blog-post': {
282:       const { title, excerpt, slug, author, date, image, tags, content } = pageData;
283:       const blogPostUrl = `${baseUrl}/never-hungover/${slug}`;
...
343:       canonicalUrl: blogPostUrl,  // https://www.dhmguide.com/never-hungover/{slug}
```

**All canonical URLs defined here** for dynamic React pages.

---

### 3. Early Client-Side Fix Script - canonical-fix.js

File: `/canonical-fix.js`

#### Main Function (Lines 6-18)
```javascript
6:  function updateCanonicalTag() {
7:    const currentPath = window.location.pathname;
8:    const canonicalLink = document.querySelector('link[rel="canonical"]');
9:    
10:   if (canonicalLink) {
11:     // Normalize path: remove trailing slash except for root
12:     const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
13:       ? currentPath.slice(0, -1)
14:       : currentPath;
15:     // Build the full canonical URL using current origin
16:     const canonicalUrl = `${window.location.origin}${normalizedPath}`;
17:     canonicalLink.setAttribute('href', canonicalUrl);
18:   }
19: }
```

#### Event Listeners (Lines 25-35)
```javascript
25:   let lastUrl = location.href;
26:   new MutationObserver(() => {
27:     const url = location.href;
28:     if (url !== lastUrl) {
29:       lastUrl = url;
30:       updateCanonicalTag();
31:     }
32:   }).observe(document, {subtree: true, childList: true});
33:   
34:   // Also listen for popstate events
35:   window.addEventListener('popstate', updateCanonicalTag);
```

**Timing**: Runs EARLY (before React), but still JavaScript-based.

---

### 4. Build-Time Prerendering: Main Pages

File: `/scripts/prerender-main-pages.js`

#### Pages Configuration (Lines 6-49)
```javascript
6:  const pages = [
7:    {
8:      route: '/',
9:      title: 'DHM Guide: Prevent 87% of Hangovers...',
10:     description: '...',
11:     ogImage: '/og-image.jpg'
12:   },
13:   {
14:     route: '/guide',
...
44:   {
45:     route: '/compare',
...
49: ];
```

#### Canonical Injection Code (Lines 122-126)
```javascript
122:     // Update canonical URL
123:     const canonical = document.querySelector('link[rel="canonical"]');
124:     if (canonical) {
125:       canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
126:     }
```

**What this does**:
- Reads base dist/index.html (line 79)
- Updates canonical for each main page route
- Creates static HTML files in /dist/{route}/index.html
- Google sees correct canonical in static files

**Output**:
```
dist/index.html                          (canonical: https://www.dhmguide.com)
dist/guide/index.html                    (canonical: https://www.dhmguide.com/guide)
dist/reviews/index.html                  (canonical: https://www.dhmguide.com/reviews)
dist/research/index.html                 (canonical: https://www.dhmguide.com/research)
dist/about/index.html                    (canonical: https://www.dhmguide.com/about)
dist/compare/index.html                  (canonical: https://www.dhmguide.com/compare)
dist/dhm-dosage-calculator/index.html    (canonical: https://www.dhmguide.com/dhm-dosage-calculator)
```

---

### 5. Build-Time Prerendering: Blog Posts

File: `/scripts/prerender-blog-posts.js`

#### Blog Post Processing Loop (Lines 52-42)
```javascript
52:   posts.forEach((post, index) => {
53:     const dom = new JSDOM(baseHtml);
54:     const document = dom.window.document;
```

#### Canonical Injection Code (Lines 102-109)
```javascript
102:   // Add canonical URL
103:   let canonical = document.querySelector('link[rel="canonical"]');
104:   if (!canonical) {
105:     canonical = document.createElement('link');
106:     canonical.setAttribute('rel', 'canonical');
107:     document.head.appendChild(canonical);
108:   }
109:   canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
```

**What this does**:
- Iterates through all blog posts (line 52)
- Creates JSDOM instance of base HTML
- Updates canonical to include the blog slug
- Writes static HTML file (lines 283-289)

**Output**:
```
dist/never-hungover/post-slug-1/index.html
  → <link rel="canonical" href="https://www.dhmguide.com/never-hungover/post-slug-1" />

dist/never-hungover/post-slug-2/index.html
  → <link rel="canonical" href="https://www.dhmguide.com/never-hungover/post-slug-2" />

... (all blog posts)
```

---

### 6. Embedded Meta Tag Script (REDUNDANT)

File: `/scripts/prerender-meta-tags.js`

#### Metadata Generation (Lines 20-33)
```javascript
20:   function generateBlogPostMetaTags(post, baseUrl) {
21:     const url = `${baseUrl}/never-hungover/${post.slug}`;
22:     const title = `${post.title} | DHM Guide`;
23:     
24:     return {
25:       canonical: url,
26:       title: title,
27:       description: post.excerpt,
...
32:     };
33:   }
```

#### Script Generation (Lines 38-93)
```javascript
38:   function createMetaTagMiddleware(metadata, baseUrl) {
39:     const blogMetaData = {};
...
43:     metadata.forEach(post => {
44:       blogMetaData[`/never-hungover/${post.slug}`] = generateBlogPostMetaTags(post, baseUrl);
45:     });
```

#### Inline Script Output (Lines 47-53)
```javascript
47:     return `
48:       <!-- SEO Meta Tag Management for SPA -->
49:       <script id="seo-meta-manager">
50:         (function() {
51:           'use strict';
52:           
53:           // Blog post meta data
54:           const blogMeta = ${JSON.stringify(blogMetaData, null, 2)};
```

**Problem**: Generates 100KB+ of JavaScript embedded in HTML

---

### 7. Competing Canonical Script (DUPLICATE)

File: `/scripts/inject-canonical-tags.js`

#### Script Generation (Lines 18-81)
```javascript
18:   const canonicalScript = `
19:     <!-- Dynamic Canonical Tag Injection for SEO -->
20:     <script>
21:       (function() {
22:         // Get the current path
23:         const path = window.location.pathname;
24:         
25:         // Map of blog post paths to their canonical URLs
26:         const blogCanonicals = {
27: ${metadata.map(post => `          '/never-hungover/${post.slug}': '${BASE_URL}/never-hungover/${post.slug}'`).join(',\n')}
28:         };
```

**Issue**: Duplicates functionality of prerender-meta-tags.js

---

### 8. Unused Blog Canonicals Generator

File: `/scripts/generate-blog-canonicals.js`

#### Main Code (Lines 1-105)
```javascript
// Generates JSON file - output not used
// Path: /public/blog-canonicals.json
// Status: Unused, should delete
```

---

## Summary: Key Line Numbers to Remember

| What | File | Lines | Status |
|------|------|-------|--------|
| Base canonical (wrong) | index.html | 78 | Active ❌ |
| useSEO hook | useSEO.js | 29-114 | Active |
| Canonical update logic | useSEO.js | 79-88 | Active |
| Canonical definitions | useSEO.js | 120-359 | Active |
| Early JS fix | canonical-fix.js | 6-18 | Active |
| Main page prerender | prerender-main-pages.js | 122-126 | Active ✅ |
| Blog prerender | prerender-blog-posts.js | 102-109 | Active ✅ |
| Embedded script (redundant) | prerender-meta-tags.js | 38-93 | Redundant ⚠️ |
| Duplicate script | inject-canonical-tags.js | 18-81 | Duplicate ❌ |
| Unused generator | generate-blog-canonicals.js | 1-105 | Unused ❌ |

---

## Critical Issue Timeline

```
T=0ms:    Browser receives HTML with canonical from line 78 (WRONG)
T=50ms:   canonical-fix.js (line 6) runs and updates it (CORRECT)
T=200ms:  React starts loading
T=500ms:  useSEO hook (line 79) runs and updates it (REDUNDANT)

⚠️ Google's crawler captures at T=0ms with WRONG canonical
```

---

## The Two That Work

1. **Main Pages** (lines 122-126 in prerender-main-pages.js)
   - Canonical in static HTML file
   - Google sees correct canonical immediately
   
2. **Blog Posts** (lines 102-109 in prerender-blog-posts.js)
   - Canonical in static HTML file
   - Google sees correct canonical immediately

Both work because the canonical is in the **initial HTML**, not requiring JavaScript.

