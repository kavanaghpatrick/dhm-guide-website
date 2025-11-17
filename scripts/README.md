# Scripts Directory

This directory contains automation scripts for the DHM Guide website.

## SEO & Analytics Scripts

### analyze-internal-links.js
**Purpose**: Analyze internal linking structure across all blog posts

**Usage**:
```bash
npm run analyze-links
# or
npm run seo-metrics
```

**Output**:
- `docs/seo/metrics/internal-links-YYYY-MM-DD.json` - JSON metrics
- `docs/seo/metrics/internal-links-report-YYYY-MM-DD.md` - Human-readable report
- `docs/seo/metrics/internal-links-latest.json` - Latest metrics (updated each run)
- `docs/seo/metrics/internal-links-latest.md` - Latest report (updated each run)

**Metrics Tracked**:
- Total blog posts
- Blog-to-blog internal links
- Links to main pages
- External links
- Average links per post
- Orphaned posts (no internal links)
- Bidirectional link pairs
- Link distribution (0, 1-2, 3-5, 6-10, 10+ links)
- Top 10 most linked posts
- Top 10 most isolated posts
- Topic clusters by category

**Schedule**: Run weekly (every Monday at 9am) - to be automated with GitHub Actions

**Related Documentation**:
- [Internal Linking Metrics & Monitoring](../docs/seo/INTERNAL-LINKING-METRICS-AND-MONITORING.md)
- [Internal Linking Plan](../docs/seo/internal-linking-plan.md)
- [Metrics Quick Reference](../docs/seo/METRICS-QUICK-REFERENCE.md)

---

## Build Scripts

### validate-posts.js
**Purpose**: Validate blog post JSON structure before build

**Usage**: Runs automatically during build (`npm run build`)

**Checks**:
- Valid JSON syntax
- Required fields present
- Content not empty
- Dates in correct format
- Slug format correct

---

### generate-blog-canonicals.js
**Purpose**: Generate canonical URLs for all blog posts

**Usage**: Runs automatically during build

**Output**: `public/blog-canonicals.json`

---

### generate-sitemap.js
**Purpose**: Generate XML sitemap for search engines

**Usage**: Runs automatically during build

**Output**: `public/sitemap.xml`

---

### prerender-blog-posts-enhanced.js
**Purpose**: Pre-render blog posts for better SEO and social sharing

**Usage**: Runs automatically during build

**Output**: Pre-rendered HTML files in `dist/prerendered/`

---

### prerender-main-pages.js
**Purpose**: Pre-render main pages with unique Open Graph tags

**Usage**: Runs automatically during build

**Output**: Pre-rendered HTML files for main pages

---

## Utility Scripts

### verify-registry.js (root)
**Purpose**: Verify post registry matches actual blog post files

**Usage**: Runs automatically before build (`npm run prebuild`)

---

### generate-registry.js (root)
**Purpose**: Generate post registry from blog post files

**Usage**:
```bash
npm run generate-registry
```

---

## Future Scripts (Planned)

### export-gsc-metrics.js
**Purpose**: Export Google Search Console metrics via API

**Status**: Not yet implemented

**Target Metrics**:
- Index coverage
- Crawl stats
- Performance data
- Top issues

---

### monitor-keyword-rankings.js
**Purpose**: Track keyword ranking changes

**Status**: Not yet implemented

**Data Source**: Google Search Console API

---

### check-broken-links.js
**Purpose**: Scan for broken internal and external links

**Status**: Not yet implemented

**Output**: List of broken links for fixing

---

## Running Scripts

### Individual Scripts
```bash
# SEO metrics analysis
npm run analyze-links

# Validate blog posts
npm run validate-posts

# Generate registry
npm run generate-registry
```

### Full Build Process
```bash
npm run build
```

This runs all build scripts in sequence:
1. validate-posts.js
2. generate-blog-canonicals.js
3. generate-sitemap.js
4. vite build
5. prerender-blog-posts-enhanced.js
6. prerender-main-pages.js

---

## Development

All scripts are ES modules (using `import/export` syntax).

**Requirements**:
- Node.js 18+
- npm or pnpm

**Adding New Scripts**:
1. Create script in `/scripts/` directory
2. Add to `package.json` scripts section
3. Document in this README
4. Add related documentation in `/docs/`

---

## Troubleshooting

### "Cannot find module" errors
Make sure script has proper file extensions and uses ES module syntax:
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### Permission errors
Make scripts executable:
```bash
chmod +x scripts/*.js
```

### Path issues
Always use absolute paths derived from `__dirname`:
```javascript
const postsDir = path.join(__dirname, '../src/newblog/data/posts');
```

---

**Last Updated**: October 21, 2025
