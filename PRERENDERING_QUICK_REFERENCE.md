# PRERENDERING QUICK REFERENCE

## Key Files

### 1. Main Prerendering Script
**File**: `scripts/prerender-blog-posts-enhanced.js`
**Purpose**: Generate static HTML for all blog posts
**Triggered**: During `npm run build` (post-Vite build)

**Key features**:
- Reads 173 blog post JSON files
- Generates 161 static HTML files with meta tags
- Uses parallel batch processing (10 posts/batch)
- Includes XSS protection and atomic file writes

### 2. Main Pages Prerendering
**File**: `scripts/prerender-main-pages.js`
**Prerendered pages**: 7 main routes with unique meta tags
- /
- /guide
- /reviews
- /research
- /about
- /dhm-dosage-calculator
- /compare

### 3. Routing Configuration
**File**: `vercel.json`

CRITICAL ISSUE:
```json
"rewrites": [
  {
    "source": "/((?!never-hungover/).*)",
    "destination": "/index.html"
  }
]
```

This may be rewriting blog posts to /index.html instead of serving prerendered files.

## Generated Files Location

```
/dist/never-hungover/
├── index.html (blog listing page)
├── activated-charcoal-hangover/
│   └── index.html (✅ 14.3 KB - includes meta tags & schema)
├── alcohol-aging-longevity-2025/
│   └── index.html (✅ 14.5 KB)
... (161 total blog post directories)
```

## Missing Posts (12 total)

These are in source but NOT prerendered:
1. festival-season-survival-dhm-guide-concert-music-festival-recovery
2. hangxiety-2025-dhm-prevents-post-drinking-anxiety
3. post-dry-january-smart-drinking-strategies-2025
4. smart-sleep-tech-alcohol-circadian-optimization-guide-2025
5. spring-break-2025-cancun-survival-guide-dhm
6. tequila-hangover-truth
7. traditional-mexican-hangover-remedies-vs-modern-supplements
8. ultimate-mexico-travel-hangover-prevention-guide-2025
9. viral-hangover-cures-tested-science-2025
10. whiskey-vs-vodka-hangover
11. wine-hangover-guide
12. zebra-striping-drinking-trend-2025

## What's Inside a Prerendered Blog Post HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Critical Meta Tags -->
  <title>Activated Charcoal for Hangovers: Myth or Magic?</title>
  <meta name="description" content="...specific post description...">
  <link rel="canonical" href="https://www.dhmguide.com/never-hungover/activated-charcoal-hangover">

  <!-- Open Graph -->
  <meta property="og:title" content="...post title...">
  <meta property="og:description" content="...post description...">
  <meta property="og:image" content="https://www.dhmguide.com/images/...">
  <meta property="og:url" content="https://www.dhmguide.com/never-hungover/...">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
    {
      "@type": "Article",
      "headline": "...",
      "description": "...",
      "author": {...},
      "datePublished": "2025-01-10",
      "mainEntityOfPage": {...}
    }
  </script>
</head>
<body>
  <!-- React root - will be hydrated client-side -->
  <div id="root"></div>

  <!-- Fallback for JS disabled (for crawlers) -->
  <noscript>
    <div style="padding: 2rem;">
      <h1>Article Title</h1>
      <p>Article excerpt visible to crawlers...</p>
    </div>
  </noscript>

  <!-- React/Vite scripts loaded here -->
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

## Build Pipeline

```
1. npm run build
   ↓
2. node scripts/validate-posts.js (check JSON validity)
   ↓
3. node scripts/generate-blog-canonicals.js
   ↓
4. node scripts/generate-sitemap.js (build sitemap.xml)
   ↓
5. vite build (create /dist with index.html and JS bundles)
   ↓
6. node scripts/prerender-blog-posts-enhanced.js
   Creates: /dist/never-hungover/{slug}/index.html for each post
   ↓
7. node scripts/prerender-main-pages.js
   Creates: /dist/{guide|reviews|research|about|etc}/index.html
   ↓
8. Vercel deploys /dist to CDN
```

## The Problem (Why 106 Pages Are "Crawled But Not Indexed")

**Most Likely Cause:**
Vercel's routing configuration is rewriting `/never-hungover/{slug}` requests to `/index.html` instead of serving the prerendered HTML files.

Result:
- Google crawler visits: `https://www.dhmguide.com/never-hungover/activated-charcoal-hangover`
- Vercel rewrites to: `/index.html` (generic home page)
- Google sees: Generic meta description, no post-specific content
- Google thinks: All blog posts are duplicates of the homepage
- Google doesn't index: "Crawled but not indexed" status

## Testing Commands

```bash
# Check if Vercel is serving the prerendered file or rewriting it
curl -I https://www.dhmguide.com/never-hungover/activated-charcoal-hangover

# Should show:
# - Content-Type: text/html
# - Custom og:title for that specific post
# - NOT generic homepage title

# View the actual HTML response
curl https://www.dhmguide.com/never-hungover/activated-charcoal-hangover | grep -A 2 "og:title"

# Should output the post title, NOT the homepage title
```

## Quick Fixes

### 1. Check Missing Posts
```bash
node scripts/validate-posts.js
# Shows which posts fail validation
```

### 2. Force Rebuild Prerendered Files
```bash
npm run build
# This will regenerate all 161 blog posts + 7 main pages
```

### 3. Fix vercel.json Rewrites
Change:
```json
"source": "/((?!never-hungover/).*)"
```

To:
```json
"source": "/((?!never-hungover|api).*)"
```

This prevents rewriting /never-hungover/* paths.

### 4. Request Google Reindexing
- Go to Google Search Console
- Use URL Inspection tool on: `/never-hungover/activated-charcoal-hangover`
- Click "Request Indexing"
- Repeat for 20-30 sample posts
- Google will recrawl and reindex with correct meta tags
