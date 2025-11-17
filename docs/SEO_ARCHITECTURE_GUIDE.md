# DHM Guide Website - SEO Metadata Architecture Analysis

## 1. TECH STACK CONFIRMATION

**Framework**: React 19 + Vite 6.3.5 (NOT Vue)
**Routing**: Custom client-side routing in `src/App.jsx` (no react-router-dom for main app)
**UI Library**: Radix UI components + Tailwind CSS
**Markdown**: react-markdown with remark-gfm plugin for blog posts
**Image Optimization**: vite-plugin-imagemin with WebP support
**Analytics**: Vercel Speed Insights

---

## 2. TITLE & META MANAGEMENT PATTERN

### Client-Side Hook (React)
**Location**: `/src/hooks/useSEO.js`

```javascript
// Pattern for all pages
export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;
    
    const { title, description, canonicalUrl, ogImage, structuredData, ... } = seoData;
    
    // Updates to client-side document head
    document.title = title;
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('link[rel="canonical"]', '', canonicalUrl);
    // Note: OG tags are NOT updated client-side (see Pattern #11)
  }, [seoData]);
};
```

**Critical Note**: Per comments in the code:
- OG tags are NOT updated client-side because social media crawlers don't execute JavaScript
- Only prerendered static HTML with baked-in OG tags are seen by crawlers

### How Pages Set Their Titles

**Main Pages** (e.g., Home, Guide, Reviews):
```javascript
// /src/pages/Home.jsx
export default function Home() {
  useSEO(generatePageSEO('home'));  // <-- Updates title here
  // ... page content
}
```

**Blog Posts**:
```javascript
// /src/newblog/components/NewBlogPost.jsx
useEffect(() => {
  const post = getPostBySlug(slug);  // Load from JSON
  const seoData = generatePageSEO('blog-post', post);  // Generate SEO
  useSEO(seoData);  // Apply to document head
}, [slug]);
```

---

## 3. SEO DATA GENERATION FUNCTION

**Location**: `/src/hooks/useSEO.js` - `generatePageSEO()` function (lines 120-407)

### For Main Pages
```javascript
case 'home':
  return {
    title: 'DHM Guide: Science-Backed Hangover Prevention That Actually Works',
    description: 'Discover the UCLA-proven supplement...',
    keywords: '...',
    canonicalUrl: 'https://www.dhmguide.com',
    ogImage: `https://www.dhmguide.com/og-image.webp`,
    structuredData: { /* WebSite schema */ }
  };
```

### For Blog Posts
```javascript
case 'blog-post':
  // Takes: title, slug, excerpt, author, date, image, tags, content from post JSON
  return {
    title: `${title} | DHM Guide`,
    description: excerpt,
    canonicalUrl: `https://www.dhmguide.com/never-hungover/${slug}`,
    ogImage: `https://www.dhmguide.com${image}` || extract from markdown,
    structuredData: generateEnhancedBlogSchema(post)  // Article + FAQ schemas
  };
```

---

## 4. PRERENDERING SYSTEM (Pattern #11 Dual Sources)

### Prerender Scripts (Post-Build)
**Build Command**: `npm run build` runs these in sequence:

```bash
npm run build
↓
1. node scripts/validate-posts.js
2. node scripts/generate-blog-canonicals.js  
3. node scripts/generate-sitemap.js
4. vite build (creates dist/index.html + assets)
5. node scripts/prerender-blog-posts-enhanced.js  ← Creates /dist/never-hungover/{slug}/index.html
6. node scripts/prerender-main-pages.js          ← Creates /dist/{guide|reviews|etc}/index.html
```

### Location 1: Prerendered HTML (What Crawlers See)

**File**: `/scripts/prerender-main-pages.js`
- **Prerendered pages**: 8 main routes
  - `/` → `/dist/index.html`
  - `/guide` → `/dist/guide/index.html`
  - `/reviews` → `/dist/reviews/index.html`
  - `/research` → `/dist/research/index.html`
  - `/about` → `/dist/about/index.html`
  - `/dhm-dosage-calculator` → `/dist/dhm-dosage-calculator/index.html`
  - `/compare` → `/dist/compare/index.html`

**File**: `/scripts/prerender-blog-posts-enhanced.js`
- **Prerendered pages**: 161 blog posts
- **Location**: `/dist/never-hungover/{slug}/index.html` for each post
- **Example**: `/dist/never-hungover/dhm-science-explained/index.html`

### How It Works (JSDOM)

```javascript
// Simplified flow from prerender-blog-posts-enhanced.js
const baseHtml = fs.readFileSync('./dist/index.html', 'utf-8');  // Read React SPA HTML
const dom = new JSDOM(baseHtml);  // Parse as DOM
const document = dom.window.document;

// Inject SEO metadata
document.title = `${post.title} | DHM Guide`;
document.querySelector('meta[name="description"]')
  .setAttribute('content', post.metaDescription);
  
// Inject OG tags
document.querySelector('meta[property="og:title"]')
  .setAttribute('content', post.title);
  
// Inject structured data
const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(articleSchema);
document.head.appendChild(script);

// Write prerendered HTML to disk
fs.writeFileSync(`/dist/never-hungover/${post.slug}/index.html`, dom.serialize());
```

### Location 2: Client-Side Updates (What Users See After JS Loads)

When user navigates in SPA:
```
1. Browser fetches prerendered /dist/never-hungover/dhm-science-explained/index.html
2. React hydrates and loads the blog post content
3. useSEO() hook updates title and meta tags for next navigation
4. User navigates to /another-post
5. Client-side routing happens (no page reload)
6. NewBlogPost component loads new post from JSON
7. useSEO() updates document.title and description
```

---

## 5. COMPLETE FILE STRUCTURE FOR SEO

### Prerender Scripts
```
/scripts/
├── prerender-main-pages.js          (8 routes: /guide, /reviews, /research, etc)
├── prerender-blog-posts-enhanced.js (161 blog posts)
├── prerender-meta-tags.js           (utility for meta tag updates)
├── generate-blog-canonicals.js      (generate canonical URLs)
├── generate-sitemap.js              (create sitemap.xml)
└── validate-posts.js                (validate blog post JSON)
```

### SEO Hooks
```
/src/hooks/
└── useSEO.js (lines 1-115: useSEO hook, lines 120-407: generatePageSEO function)
```

### Blog Post Data
```
/src/newblog/
├── data/
│   ├── posts/                       (161+ .json files)
│   │   ├── dhm-science-explained.json
│   │   ├── activated-charcoal-hangover.json
│   │   └── ... (150+ more)
│   └── postRegistry.js
└── components/
    └── NewBlogPost.jsx              (renders blog posts, calls useSEO)
```

### Main Pages
```
/src/pages/
├── Home.jsx                    (calls useSEO('home'))
├── Guide.jsx                   (calls useSEO('guide'))
├── Reviews.jsx                 (calls useSEO('reviews'))
├── Research.jsx                (calls useSEO('research'))
├── About.jsx                   (calls useSEO('about'))
├── Compare.jsx                 (calls useSEO('compare'))
└── DosageCalculatorEnhanced.jsx
```

### Generated Output
```
/dist/
├── index.html                  (prerendered homepage with /guide meta tags)
├── guide/index.html            (prerendered /guide route)
├── reviews/index.html
├── research/index.html
├── about/index.html
├── compare/index.html
├── dhm-dosage-calculator/index.html
└── never-hungover/             (161 blog posts)
    ├── index.html              (blog listing page)
    ├── dhm-science-explained/index.html
    ├── activated-charcoal-hangover/index.html
    └── ... (159 more)
```

---

## 6. EXAMPLE: How One Blog Post Gets Its SEO

### Step 1: Source Data
**File**: `/src/newblog/data/posts/dhm-science-explained.json`
```json
{
  "title": "DHM Science Explained: How Dihydromyricetin Prevents Hangovers at the Molecular Level",
  "slug": "dhm-science-explained",
  "excerpt": "Scientists reveal: 85% sharper mind after drinking with DHM...",
  "metaDescription": "How DHM works: Scientific breakdown of dihydromyricetin's...",
  "date": "2025-06-26",
  "author": "DHM Guide Team",
  "image": "/images/dhm-science-hero.webp",
  "content": "**New to DHM?** Start with our [comprehensive DHM guide]..."
}
```

### Step 2: Prerendering (Build Time)
**Script**: `/scripts/prerender-blog-posts-enhanced.js` (line 62-239)

```javascript
// Read the post JSON
const post = JSON.parse(fs.readFileSync(filePath));

// Create DOM from base HTML
const dom = new JSDOM(baseHtml);
const document = dom.window.document;

// Inject SEO metadata into HTML
document.title = `DHM Science Explained... | DHM Guide`;
document.querySelector('meta[name="description"]')
  .setAttribute('content', 'How DHM works: Scientific breakdown...');

// Inject OG tags
document.querySelector('meta[property="og:title"]')
  .setAttribute('content', 'DHM Science Explained...');
document.querySelector('meta[property="og:url"]')
  .setAttribute('content', 'https://www.dhmguide.com/never-hungover/dhm-science-explained');
document.querySelector('meta[property="og:image"]')
  .setAttribute('content', 'https://www.dhmguide.com/images/dhm-science-hero.webp');

// Inject structured data (Article schema)
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "DHM Science Explained...",
  "description": "How DHM works: Scientific breakdown...",
  "author": { "@type": "Person", "name": "DHM Guide Team" },
  "datePublished": "2025-06-26",
  "image": "https://www.dhmguide.com/images/dhm-science-hero.webp"
};
const scriptTag = document.createElement('script');
scriptTag.type = 'application/ld+json';
scriptTag.textContent = JSON.stringify(articleSchema);
document.head.appendChild(scriptTag);

// Write to disk
fs.writeFileSync('./dist/never-hungover/dhm-science-explained/index.html', dom.serialize());
```

### Step 3: Result (What Google Crawls)
**File**: `/dist/never-hungover/dhm-science-explained/index.html`
```html
<!DOCTYPE html>
<html>
<head>
  <title>DHM Science Explained: How Dihydromyricetin Prevents Hangovers at the Molecular Level | DHM Guide</title>
  <meta name="description" content="How DHM works: Scientific breakdown of dihydromyricetin's GABA receptor action, liver enzyme boost, and 85% hangover reduction mechanism.">
  <link rel="canonical" href="https://www.dhmguide.com/never-hungover/dhm-science-explained">
  
  <meta property="og:title" content="DHM Science Explained: How Dihydromyricetin Prevents Hangovers...">
  <meta property="og:description" content="How DHM works: Scientific breakdown...">
  <meta property="og:image" content="https://www.dhmguide.com/images/dhm-science-hero.webp">
  <meta property="og:url" content="https://www.dhmguide.com/never-hungover/dhm-science-explained">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "DHM Science Explained...",
    "description": "How DHM works...",
    "author": {"@type": "Person", "name": "DHM Guide Team"},
    "datePublished": "2025-06-26",
    "image": "https://www.dhmguide.com/images/dhm-science-hero.webp"
  }
  </script>
</head>
<body>
  <div id="root"></div>  <!-- React SPA loads here -->
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

### Step 4: Client-Side Navigation
When user clicks link to this post in browser:

```javascript
// NewBlogPost.jsx component loads
const post = getPostBySlug('dhm-science-explained');  // Load from JSON

// Generate SEO for this post
const seoData = generatePageSEO('blog-post', {
  title: post.title,
  excerpt: post.excerpt,
  slug: post.slug,
  author: post.author,
  date: post.date,
  image: post.image,
  content: post.content
});

// Apply SEO update (in-browser)
useSEO(seoData);  // Updates document.title and meta[name="description"]
```

---

## 7. PATTERN #11: DUAL SEO SOURCES (CRITICAL)

### Problem This Pattern Solves
Prerendered SPAs have TWO sources of SEO metadata:
1. **Prerendered HTML** (static, what crawlers see)
2. **Client-side JS** (dynamic, what users see after navigation)

If you only update one, the other becomes stale!

### How DHM Guide Handles It

**Prerendered (Crawlers see this)**:
- Every route has its own `/dist/{route}/index.html` file with correct meta tags
- Blog posts: `/dist/never-hungover/{slug}/index.html` for each of 161 posts
- Main pages: `/dist/guide/index.html`, `/dist/reviews/index.html`, etc.

**Client-side (Users see this after JS loads)**:
- `useSEO()` hook updates titles and descriptions for SPA navigation
- OG tags are NOT updated (correctly noted in comments, since crawlers don't run JS)

### Critical Pattern Files
1. `/scripts/prerender-main-pages.js` - Generates initial prerendered HTML with correct SEO
2. `/scripts/prerender-blog-posts-enhanced.js` - Generates blog post prerendered HTML  
3. `/src/hooks/useSEO.js` - Updates client-side SEO during navigation
4. `/src/newblog/components/NewBlogPost.jsx` - Calls useSEO for blog posts

---

## 8. STRUCTURED DATA PATTERN

### Location
**File**: `/src/utils/productSchemaGenerator.js` 

**Called from**:
- `/scripts/prerender-blog-posts-enhanced.js` (line 159)
- `/src/hooks/useSEO.js` (line 348)

### Schema Types Used
1. **Article** (blog posts and guide pages)
2. **FAQPage** (research and guide pages)
3. **WebSite** (homepage)
4. **Blog** (blog listing)

### Example (from useSEO.js lines 196-262)
```javascript
case 'research':
  return {
    title: 'DHM Clinical Studies & Research: 15+ Peer-Reviewed Trials (2025)',
    description: 'Complete analysis of 15+ clinical studies...',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "Dihydromyricetin RCT Database 2024",
        "description": "Comprehensive collection of DHM RCTs..."
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How many clinical studies...",
            "acceptedAnswer": { "@type": "Answer", "text": "..." }
          },
          // ... 4 more FAQ entries
        ]
      }
    ]
  };
```

---

## 9. BUILD PIPELINE SUMMARY

```
1. npm run build triggered
   ↓
2. Pre-build scripts:
   - validate-posts.js (check JSON syntax)
   - generate-blog-canonicals.js (create canonical URLs)
   - generate-sitemap.js (build sitemap.xml)
   ↓
3. vite build
   - Compiles React + Tailwind
   - Optimizes images with WebP
   - Creates /dist/index.html (SPA entry point)
   - Creates /dist/assets/*.js (React bundles)
   ↓
4. POST-BUILD PRERENDERING (Critical!)
   - prerender-blog-posts-enhanced.js
     * Reads base /dist/index.html
     * For each of 161 blog posts:
       - Load post JSON
       - Inject post-specific meta tags into HTML
       - Write to /dist/never-hungover/{slug}/index.html
   ↓
   - prerender-main-pages.js
     * For each of 8 main routes:
       - Load route config
       - Inject route-specific meta tags into HTML
       - Write to /dist/{route}/index.html
   ↓
5. Vercel deploy
   - Uploads entire /dist directory
   - Serves prerendered HTML files to crawlers
   - Serves SPA to browsers (React hydrates)
```

---

## 10. EXAMPLE CURRENT ARCHITECTURE

### Homepage (/)

**Prerendered HTML** (`/dist/index.html`):
```html
<head>
  <title>DHM Guide: Prevent 87% of Hangovers...</title>
  <meta name="description" content="Clinically proven to prevent 87%...">
  <meta property="og:title" content="DHM Guide: Prevent 87%...">
  <meta property="og:image" content="https://www.dhmguide.com/og-image.jpg">
  <script type="application/ld+json">{"@type": "WebSite", ...}</script>
</head>
```

**Client-side Runtime** (After React loads):
```javascript
// Home.jsx component
useSEO(generatePageSEO('home'));

// Updates:
document.title = 'DHM Guide: Science-Backed Hangover Prevention That Actually Works';
meta[name="description"] = 'Discover the UCLA-proven supplement...';
// (OG tags NOT updated since crawlers don't see this)
```

### Blog Post (e.g., /never-hungover/dhm-science-explained)

**Prerendered HTML** (`/dist/never-hungover/dhm-science-explained/index.html`):
```html
<head>
  <title>DHM Science Explained: How Dihydromyricetin... | DHM Guide</title>
  <meta name="description" content="How DHM works: Scientific breakdown...">
  <meta property="og:title" content="DHM Science Explained...">
  <meta property="og:image" content="https://www.dhmguide.com/images/dhm-science-hero.webp">
  <script type="application/ld+json">{"@type": "Article", ...}</script>
</head>
```

**Client-side Runtime** (After React loads):
```javascript
// NewBlogPost.jsx component
const post = getPostBySlug('dhm-science-explained');
useSEO(generatePageSEO('blog-post', post));

// Updates:
document.title = 'DHM Science Explained: How Dihydromyricetin... | DHM Guide';
meta[name="description"] = 'How DHM works: Scientific breakdown...';
// (OG tags NOT updated)
```

---

## 11. KEY TAKEAWAYS

1. **Tech Stack**: React 19 + Vite, NOT Vue or Next.js
2. **Title Management**: 
   - **Prerendered**: Injected during build via JSDOM in Node.js
   - **Client-side**: Updated via `useSEO()` hook during SPA navigation
3. **SEO Metadata**: Centralized in `useSEO.js` `generatePageSEO()` function
4. **Prerender Scripts**: Two main files handle 169 total pages (8 main + 161 blog)
5. **Pattern #11 Dual Sources**:
   - Prerendered HTML (what crawlers see)
   - Client-side JS updates (what users see after navigation)
   - OG tags handled correctly (NOT updated client-side since crawlers don't run JS)
6. **Blog Post Data**: JSON-based at `/src/newblog/data/posts/`
7. **Build Pipeline**: Vite → Prerender → Deploy to Vercel
8. **Output**: 169 total static HTML files under `/dist/`

