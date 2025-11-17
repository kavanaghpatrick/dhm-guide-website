# Canonical Tags Implementation: Complete Code Examples

## Example 1: Blog Post Prerendering (Current Implementation)

**File**: `/scripts/prerender-blog-posts-enhanced.js` (Lines 52-109)

```javascript
posts.forEach((post, index) => {
  // 1. Parse base HTML template with JSDOM
  const dom = new JSDOM(baseHtml);
  const document = dom.window.document;
  
  // 2. Update title
  document.title = `${post.title} | DHM Guide`;
  
  // 3. Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  // 4. Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', post.title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  }
  
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && post.image) {
    ogImage.setAttribute('content', `https://www.dhmguide.com${post.image}`);
  }
  
  // 5. Update Twitter tags
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', post.title);
  }
  
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  const twitterImage = document.querySelector('meta[property="twitter:image"]');
  if (twitterImage && post.image) {
    twitterImage.setAttribute('content', `https://www.dhmguide.com${post.image}`);
  }
  
  // 6. CRITICAL: Add canonical URL (THE PATTERN YOU'RE LOOKING FOR)
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  
  // 7. Add structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author || "DHM Guide Team"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.dhmguide.com/never-hungover/${post.slug}`
    },
    "image": post.image ? `https://www.dhmguide.com${post.image}` : "https://www.dhmguide.com/og-image.jpg"
  };
  
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/ld+json';
  scriptTag.textContent = JSON.stringify(structuredData);
  document.head.appendChild(scriptTag);
  
  // 8. Write the static HTML file
  const postDir = path.join(blogDistDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  
  const outputPath = path.join(postDir, 'index.html');
  fs.writeFileSync(outputPath, dom.serialize());
  
  if ((index + 1) % 10 === 0) {
    console.log(`Prerendered ${index + 1}/${posts.length} posts...`);
  }
});
```

**Result**: Static HTML file at `/dist/never-hungover/{slug}/index.html` containing:
```html
<head>
  <title>Activated Charcoal for Hangovers: Myth or Magic? | DHM Guide</title>
  <meta name="description" content="Activated charcoal hangover cure...">
  <link rel="canonical" href="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">
  <meta property="og:url" content="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">
  <meta property="og:title" content="Activated Charcoal for Hangovers: Myth or Magic?">
  <script type="application/ld+json">
    {"@type": "Article", "@id": "https://www.dhmguide.com/never-hungover/activated-charcoal-hangover"}
  </script>
</head>
```

---

## Example 2: Main Page Prerendering (Current Implementation)

**File**: `/scripts/prerender-main-pages.js` (Lines 85-142)

```javascript
const pages = [
  {
    route: '/',
    title: 'DHM Guide: Prevent 87% of Hangovers with Science-Backed Supplements',
    description: 'Clinically proven to prevent 87% of hangovers...',
    ogImage: '/og-image.jpg'
  },
  {
    route: '/guide',
    title: 'Complete DHM Guide 2025 | Science-Backed Hangover Prevention',
    description: 'Evidence-based guide to DHM (Dihydromyricetin) supplements...',
    ogImage: '/guide-og.jpg'
  },
  {
    route: '/reviews',
    title: 'DHM Supplement Reviews 2025 | Tested & Ranked',
    description: 'Comprehensive reviews of top DHM supplements...',
    ogImage: '/reviews-og.jpg'
  }
];

// Process each page
for (const page of pages) {
  try {
    // 1. Parse base HTML
    const dom = new JSDOM(baseHtml);
    const { document } = dom.window;

    // 2. Update title
    document.title = page.title;

    // 3. Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', page.description);
    }

    // 4. Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', page.title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', page.description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://www.dhmguide.com${page.route}`);

    // 5. Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', page.title);

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', page.description);

    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);

    // 6. CRITICAL: Update canonical URL (THE PATTERN YOU'RE LOOKING FOR)
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
    }

    // 7. Create output path (important: handle root route differently)
    const outputDir = page.route === '/' ? distDir : path.join(distDir, page.route);

    // Create directory if needed
    if (page.route !== '/') {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 8. Write the static HTML file
    const outputPath = path.join(
      page.route === '/' ? distDir : outputDir,
      'index.html'
    );

    fs.writeFileSync(outputPath, dom.serialize());
    console.log(`  ✓ ${page.route}`);

  } catch (error) {
    console.error(`  ✗ ${page.route} - Error: ${error.message}`);
  }
}
```

**Result**: For `/guide` route:
- Static file at: `/dist/guide/index.html`
- Contains: `<link rel="canonical" href="https://www.dhmguide.com/guide">`
- Contains: `<meta property="og:title" content="Complete DHM Guide 2025...">`

---

## Example 3: SEO Hook (Client-Side Only)

**File**: `/src/hooks/useSEO.js` (Lines 29-115)

```javascript
export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    const {
      title,
      description,
      canonicalUrl,
      ogImage,
      structuredData,
      noIndex = false
    } = seoData;

    // UPDATE: Document title (client-side only, for browser tab)
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tags
    const updateMetaTag = (selector, attribute, value) => {
      if (!value) return;
      
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (attribute === 'property') {
          meta.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
        } else {
          meta.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    // UPDATE: Basic meta tags (for SPA navigation, NOT for crawlers)
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
    updateMetaTag('meta[name="author"]', 'name', author);
    updateMetaTag('meta[name="robots"]', 'name', noIndex ? 'noindex, nofollow' : 'index, follow');

    // IMPORTANT: OG tags are NOT updated here
    // Comment on lines 69-70:
    // "Note: OG tags are NOT updated here because social media crawlers 
    //  don't execute JavaScript. They only see the prerendered static 
    //  HTML with baked-in OG tags"

    // UPDATE: Canonical URL (for consistency within SPA)
    // NOTE: The canonical is ALREADY in the static HTML from prerendering
    // This just updates it for browser navigation within the SPA
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // UPDATE: Structured data (for client-side updates)
    if (structuredData) {
      // Remove old structured data scripts added by this hook
      const existingScripts = document.querySelectorAll('script[data-seo-hook="true"]');
      existingScripts.forEach(script => script.remove());

      // Add new structured data
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-hook', 'true');
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    // Cleanup when component unmounts
    return () => {
      const scripts = document.querySelectorAll('script[data-seo-hook="true"]');
      scripts.forEach(script => script.remove());
    };
  }, [seoData]);
};
```

**Key insight**: This hook does NOT inject canonical, OG tags, or structured data for crawlers. Those are in the prerendered static HTML.

---

## Example 4: Blog Post Component

**File**: `/src/newblog/components/NewBlogPost.jsx` (Lines 302-311)

```javascript
// Call useSEO hook to update browser tab and SPA navigation
useSEO(post ? generatePageSEO('blog-post', {
  title: post.title,
  excerpt: post.excerpt,
  slug: post.slug,
  author: post.author,
  date: post.date,
  image: post.image,
  tags: post.tags,
  content: post.content
}) : null);
```

This calls `generatePageSEO('blog-post', {...})` which returns:

```javascript
return {
  title: `${title} | DHM Guide`,
  description: excerpt,
  keywords: tags ? tags.join(', ') : 'DHM, dihydromyricetin, hangover prevention',
  canonicalUrl: blogPostUrl,  // /never-hungover/{slug}
  ogImage: finalImage,        // From post.image
  ogType: 'article',
  author,
  structuredData: structuredDataArray
};
```

**Important**: The component calls useSEO for client-side updates, but the canonical is ALREADY in the static HTML from prerendering.

---

## Example 5: How to Replicate for New Pages

```javascript
// File: scripts/prerender-custom-pages.js
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Define your pages with metadata
const pages = [
  {
    route: '/your-new-page',
    title: 'Your Page Title | DHM Guide',
    description: 'Your page description',
    ogImage: '/your-og-image.jpg',
    keywords: 'keyword1, keyword2'
  }
];

// Read base template (created by vite build)
const baseHtml = fs.readFileSync('./dist/index.html', 'utf-8');

// Process each page
pages.forEach(page => {
  // Parse base HTML with JSDOM
  const dom = new JSDOM(baseHtml);
  const document = dom.window.document;
  
  // Update all metadata
  document.title = page.title;
  
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
  document.querySelector('meta[name="keywords"]')?.setAttribute('content', page.keywords);
  
  // Update canonical (THE KEY PATTERN)
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
  }
  
  // Update Open Graph tags
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://www.dhmguide.com${page.route}`);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);
  
  // Create output directory and write file
  if (page.route !== '/') {
    const outputDir = path.join('./dist', page.route);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), dom.serialize());
  } else {
    fs.writeFileSync('./dist/index.html', dom.serialize());
  }
  
  console.log(`Prerendered: ${page.route}`);
});
```

Then add to `package.json`:
```json
"build": "... && vite build && node scripts/prerender-blog-posts-enhanced.js && node scripts/prerender-main-pages.js && node scripts/prerender-custom-pages.js"
```

---

## Example 6: What Gets Generated

### Input: Base HTML Template
```html
<!DOCTYPE html>
<html>
<head>
  <title>DHM Guide - Default Title</title>
  <meta name="description" content="Default description">
  <link rel="canonical" href="https://www.dhmguide.com/">
  <meta property="og:title" content="Default OG Title">
  <meta property="og:url" content="https://www.dhmguide.com/">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

### Output: Prerendered Blog Post
```html
<!DOCTYPE html>
<html>
<head>
  <title>Activated Charcoal for Hangovers: Myth or Magic? | DHM Guide</title>
  <meta name="description" content="Activated charcoal hangover cure: Scientific analysis...">
  <!-- CRITICAL: Canonical is now POST-SPECIFIC -->
  <link rel="canonical" href="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">
  <!-- OG tags are now POST-SPECIFIC -->
  <meta property="og:title" content="Activated Charcoal for Hangovers: Myth or Magic?">
  <meta property="og:url" content="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">
  <meta property="og:description" content="Activated charcoal hangover cure...">
  <meta property="og:image" content="https://www.dhmguide.com/images/activated-charcoal-hangover-hero.webp">
  <!-- Structured data is now POST-SPECIFIC -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Activated Charcoal for Hangovers: Myth or Magic?",
      "mainEntityOfPage": {
        "@id": "https://www.dhmguide.com/never-hungover/activated-charcoal-hangover"
      },
      "description": "Activated charcoal hangover cure...",
      "image": "https://www.dhmguide.com/images/activated-charcoal-hangover-hero.webp"
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

---

## Example 7: Testing the Output

```bash
# 1. Verify the file was created
ls -la dist/never-hungover/activated-charcoal-hangover/index.html

# 2. Check the canonical tag is in the file
grep 'rel="canonical"' dist/never-hungover/activated-charcoal-hangover/index.html
# Output: <link rel="canonical" href="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">

# 3. Check the OG tags are in the file
grep 'property="og:title"' dist/never-hungover/activated-charcoal-hangover/index.html
# Output: <meta property="og:title" content="Activated Charcoal for Hangovers: Myth or Magic?">

# 4. Verify title is specific to the post
grep '<title>' dist/never-hungover/activated-charcoal-hangover/index.html
# Output: <title>Activated Charcoal for Hangovers: Myth or Magic? | DHM Guide</title>

# 5. Verify in production
curl https://www.dhmguide.com/never-hungover/activated-charcoal-hangover | grep 'rel="canonical"'
# Should output the correct canonical URL
```

---

## Summary: The Pattern

1. **Build time**: Prerendering scripts transform base template
2. **JSDOM parsing**: Load HTML as DOM object
3. **DOM manipulation**: Update tags using `querySelector` and `setAttribute`
4. **File writing**: Save modified HTML to `/dist/{route}/index.html`
5. **Vercel serving**: Serves static file (not base template)
6. **Google crawl**: Sees canonical in initial response
7. **Social crawlers**: See OG tags without JavaScript

This ensures 100% correct canonical tags for ALL crawlers.
