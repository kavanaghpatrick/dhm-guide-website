# Canonical Tags - Code Snippets Reference

## 1. useSEO Hook Implementation

**File**: `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js` (lines 29-114)

### Full useSEO Hook Code
```javascript
export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    const {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      ogType = 'website',
      twitterImage,
      structuredData,
      noIndex = false,
      author = 'DHM Guide Team'
    } = seoData;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
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

    // Update basic meta tags (for SPA navigation)
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
    updateMetaTag('meta[name="author"]', 'name', author);
    updateMetaTag('meta[name="robots"]', 'name', noIndex ? 'noindex, nofollow' : 'index, follow');

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

    // Update structured data (handle both single objects and arrays)
    if (structuredData) {
      const existingScripts = document.querySelectorAll('script[data-seo-hook="true"]');
      existingScripts.forEach(script => script.remove());

      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-hook', 'true');
        script.setAttribute('data-schema-index', index.toString());
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[data-seo-hook="true"]');
      scripts.forEach(script => script.remove());
    };
  }, [seoData]);
};
```

### Example Usage - Blog Post
```javascript
// From src/newblog/components/NewBlogPost.jsx
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';

// In component:
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

### Example Usage - Main Page
```javascript
// From src/pages/Guide.jsx
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'

export default function Guide() {
  useSEO(generatePageSEO('guide'));
  // ... component code
}
```

---

## 2. generatePageSEO Function

**File**: `/Users/patrickkavanagh/dhm-guide-website/src/hooks/useSEO.js` (lines 120-359)

### Key Cases for Canonical URLs

```javascript
export const generatePageSEO = (pageType, pageData = {}) => {
  const baseUrl = 'https://www.dhmguide.com';
  
  switch (pageType) {
    case 'home':
      return {
        title: 'DHM Guide: Science-Backed Hangover Prevention That Actually Works',
        description: '...',
        keywords: '...',
        canonicalUrl: baseUrl,  // https://www.dhmguide.com
        ogImage: `${baseUrl}/og-image.webp`,
        // ...
      };

    case 'guide':
      return {
        title: 'The Complete DHM Guide: Never Wake Up Hungover Again',
        description: '...',
        canonicalUrl: `${baseUrl}/guide`,  // https://www.dhmguide.com/guide
        // ...
      };

    case 'blog-post': {
      const { title, excerpt, slug, author, date, image, tags, content } = pageData;
      const blogPostUrl = `${baseUrl}/never-hungover/${slug}`;
      
      return {
        title: `${title} | DHM Guide`,
        description: excerpt,
        keywords: tags ? tags.join(', ') : 'DHM, dihydromyricetin, hangover prevention',
        canonicalUrl: blogPostUrl,  // https://www.dhmguide.com/never-hungover/{slug}
        ogImage: extractedImage || `${baseUrl}/blog-default.webp`,
        ogType: 'article',
        author,
        structuredData: structuredDataArray
      };
    }

    case 'never-hungover':
      return {
        title: 'Never Hungover: Master Science-Backed Hangover Prevention',
        description: '...',
        canonicalUrl: `${baseUrl}/never-hungover`,  // https://www.dhmguide.com/never-hungover
        // ...
      };

    // Other pages: /reviews, /research, /compare, /about, etc.
  }
};
```

---

## 3. Prerender Main Pages Script

**File**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js`

### Pages Configuration
```javascript
const pages = [
  {
    route: '/',
    title: 'DHM Guide: Prevent 87% of Hangovers with Science-Backed Supplements | 11 Clinical Studies',
    description: '✅ Clinically proven to prevent 87% of hangovers...',
    ogImage: '/og-image.jpg'
  },
  {
    route: '/guide',
    title: 'Complete DHM Guide 2025 | Science-Backed Hangover Prevention',
    description: '...',
    ogImage: '/guide-og.jpg'
  },
  {
    route: '/reviews',
    title: 'DHM Supplement Reviews 2025 | Tested & Ranked',
    description: '...',
    ogImage: '/reviews-og.jpg'
  },
  {
    route: '/research',
    title: 'DHM Clinical Research | 11+ Scientific Studies on Hangover Prevention',
    description: '...',
    ogImage: '/research-og.jpg'
  },
  {
    route: '/about',
    title: 'About DHM Guide | Evidence-Based Hangover Prevention Resource',
    description: '...',
    ogImage: '/about-og.jpg'
  },
  {
    route: '/dhm-dosage-calculator',
    title: 'DHM Dosage Calculator | Personalized Hangover Prevention Guide',
    description: '...',
    ogImage: '/calculator-og.jpg'
  },
  {
    route: '/compare',
    title: 'Compare DHM Supplements | Side-by-Side Product Analysis',
    description: '...',
    ogImage: '/compare-og.jpg'
  }
];
```

### Canonical Update Code
```javascript
// Update canonical URL
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
}

// Output: Creates /dist/{route}/index.html with correct canonical
// Example: /dist/guide/index.html has <link rel="canonical" href="https://www.dhmguide.com/guide" />
```

---

## 4. Prerender Blog Posts Script

**File**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts.js`

### Blog Post Prerendering with Canonical
```javascript
posts.forEach((post, index) => {
  const dom = new JSDOM(baseHtml);
  const document = dom.window.document;
  
  // Update meta tags
  document.title = `${post.title} | DHM Guide`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  // Update Open Graph tags
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  }
  
  // ADD CANONICAL URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  
  // Write the HTML file
  const postDir = path.join(blogDistDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  
  const outputPath = path.join(postDir, 'index.html');
  fs.writeFileSync(outputPath, dom.serialize());
});
```

**Output**: Creates `/dist/never-hungover/{slug}/index.html` with baked-in canonical URL

---

## 5. Canonical Fix Script (Client-Side Fallback)

**File**: `/Users/patrickkavanagh/dhm-guide-website/canonical-fix.js`

```javascript
// Script to update canonical tag dynamically
// This should be added to the head of index.html

(function() {
  // Function to update canonical tag based on current URL
  function updateCanonicalTag() {
    const currentPath = window.location.pathname;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      // Normalize path: remove trailing slash except for root
      const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
        ? currentPath.slice(0, -1)
        : currentPath;
      // Build the full canonical URL using current origin (works in dev/staging/prod)
      const canonicalUrl = `${window.location.origin}${normalizedPath}`;
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }
  
  // Update on initial load
  updateCanonicalTag();
  
  // Listen for route changes (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      updateCanonicalTag();
    }
  }).observe(document, {subtree: true, childList: true});
  
  // Also listen for popstate events
  window.addEventListener('popstate', updateCanonicalTag);
})();
```

**Loaded in**: `/Users/patrickkavanagh/dhm-guide-website/index.html` (line 80)
```html
<script src="/canonical-fix.js"></script>
```

---

## 6. Meta Tag Injection Script (Large Embedded Script)

**File**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-meta-tags.js`

### Generated Mapping Structure
```javascript
// Generated at build time and embedded in index.html
const blogMeta = {
  '/never-hungover/post-slug-1': {
    canonical: 'https://www.dhmguide.com/never-hungover/post-slug-1',
    title: 'Post Title | DHM Guide',
    description: 'Post excerpt...',
    ogUrl: 'https://www.dhmguide.com/never-hungover/post-slug-1',
    ogTitle: 'Post Title | DHM Guide',
    ogDescription: 'Post excerpt...',
    ogImage: 'https://www.dhmguide.com/image.jpg'
  },
  // ... hundreds of blog posts
};

const staticMeta = {
  '/': {
    canonical: 'https://www.dhmguide.com',
    title: 'DHM Guide: Prevent 87% of Hangovers...',
    description: '...'
  },
  '/guide': {
    canonical: 'https://www.dhmguide.com/guide',
    title: 'The Complete DHM Guide...',
    description: '...'
  },
  // ... all main pages
};
```

### Route Matching and Tag Update
```javascript
function updateMetaTags() {
  const path = window.location.pathname;
  const metaData = blogMeta[path] || staticMeta[path];
  
  if (!metaData) return;
  
  // Update canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', metaData.canonical);
  
  // Update title
  document.title = metaData.title;
  
  // Update meta tags...
  updateMeta('meta[name="description"]', metaData.description);
  updateMeta('meta[property="og:url"]', metaData.ogUrl);
  updateMeta('meta[property="og:title"]', metaData.ogTitle);
  // ... etc
}

// Update on initial load
updateMetaTags();

// Listen for navigation changes
let lastPath = window.location.pathname;
const checkForRouteChange = () => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    updateMetaTags();
  }
};

// Check periodically for route changes (100ms polling)
setInterval(checkForRouteChange, 100);

// Also listen to popstate
window.addEventListener('popstate', updateMetaTags);
```

---

## 7. Base HTML Template

**File**: `/Users/patrickkavanagh/dhm-guide-website/index.html` (lines 77-80)

```html
<!-- Base canonical tag - dynamically updated by application for specific pages -->
<link rel="canonical" href="https://www.dhmguide.com" />

<script src="/canonical-fix.js"></script>
```

This base canonical is updated by:
1. **useSEO hook** - Client-side after React loads
2. **prerender-main-pages.js** - Server-side during build for main pages
3. **prerender-blog-posts.js** - Server-side during build for blog posts
4. **canonical-fix.js** - Client-side early, generic fallback
5. **prerender-meta-tags.js** - Client-side, embedded script with full mappings

---

## Summary Table

| Implementation | Timing | Scope | Reliability |
|---|---|---|---|
| **useSEO hook** | After React loads | All React pages | Low - relies on JS |
| **Prerender main pages** | Build-time | 7 main pages | High - static HTML |
| **Prerender blog posts** | Build-time | All blog posts | High - static HTML |
| **canonical-fix.js** | Early, before React | All routes | Medium - early but still JS |
| **prerender-meta-tags.js** | Inline script, early | All routes | Medium - large script, polling |
| **generate-blog-canonicals.js** | Build-time | Unused | N/A |
| **inject-canonical-tags.js** | Inline script | Blog posts | Duplicate of meta-tags |

