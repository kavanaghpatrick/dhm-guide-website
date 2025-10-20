# Contributing Blog Posts to Never Hungover

This guide explains how to add new blog posts to the DHM Guide website's "Never Hungover" blog section.

## Quick Start (TL;DR)

1. Create a new JSON file in `/src/newblog/data/posts/` named `your-post-slug.json`
2. Copy the structure from an existing post
3. **CRITICAL**: Register your post in `/src/newblog/data/postRegistry.js`
4. **CRITICAL**: Add post metadata to `/src/newblog/data/metadata/index.json`
5. Add your post slug to the sitemap at `/public/sitemap.xml`
6. Commit and push your changes

## Detailed Instructions

### Step 1: Create the Blog Post File

Create a new JSON file in the `/src/newblog/data/posts/` directory. The filename should be your post's URL slug with a `.json` extension.

**Naming Convention:**
- Use lowercase letters
- Separate words with hyphens
- Include the year if relevant
- Example: `hangover-prevention-tips-2025.json`

### Step 2: Blog Post JSON Structure

Copy this template and fill in your content:

```json
{
  "slug": "your-post-slug-here",
  "title": "Your Blog Post Title",
  "description": "A compelling meta description for SEO (150-160 characters)",
  "author": "Author Name",
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15",
  "readTime": 7,
  "featured": false,
  "tags": ["dhm", "hangover prevention", "wellness"],
  "meta": {
    "title": "SEO Title - Should include main keyword | DHM Guide",
    "description": "SEO meta description - compelling and includes keywords (150-160 chars)",
    "keywords": "dhm, dihydromyricetin, hangover prevention, keyword phrases"
  },
  "hero": {
    "heading": "Eye-catching Hero Heading",
    "description": "Compelling subtitle that expands on the heading"
  },
  "tableOfContents": [
    {
      "id": "introduction",
      "title": "Introduction"
    },
    {
      "id": "section-1",
      "title": "First Main Section"
    },
    {
      "id": "section-2",
      "title": "Second Main Section"
    },
    {
      "id": "conclusion",
      "title": "Conclusion"
    }
  ],
  "content": [
    {
      "id": "introduction",
      "type": "section",
      "heading": "Introduction",
      "content": "Your introduction paragraph in markdown format. You can use **bold**, *italic*, and [links](https://example.com)."
    },
    {
      "id": "section-1",
      "type": "section",
      "heading": "First Main Section",
      "content": "Content for your first section. Use markdown formatting:\n\n- Bullet points\n- More points\n\n1. Numbered lists\n2. Also work\n\n> Blockquotes for emphasis"
    },
    {
      "type": "callout",
      "variant": "success",
      "title": "Pro Tip",
      "content": "Callout boxes break up content and highlight important information."
    },
    {
      "id": "section-2",
      "type": "section",
      "heading": "Second Main Section",
      "content": "Continue with your content sections..."
    },
    {
      "type": "highlight",
      "variant": "primary",
      "stats": [
        { "label": "Effectiveness", "value": "70%" },
        { "label": "Time to Work", "value": "30 min" },
        { "label": "Duration", "value": "8+ hours" }
      ]
    },
    {
      "id": "conclusion",
      "type": "section",
      "heading": "Conclusion",
      "content": "Wrap up your post with key takeaways and a call to action."
    }
  ],
  "schema": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Your Blog Post Title",
    "description": "Your meta description",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "datePublished": "2025-01-15",
    "dateModified": "2025-01-15",
    "publisher": {
      "@type": "Organization",
      "name": "DHM Guide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dhmguide.com/images/logo.png"
      }
    }
  }
}
```

### Step 3: Content Types

The blog system supports various content types:

#### 1. **Section** (Main content blocks)
```json
{
  "id": "unique-id",
  "type": "section",
  "heading": "Section Title",
  "content": "Markdown formatted content..."
}
```

#### 2. **Callout** (Highlighted information boxes)
```json
{
  "type": "callout",
  "variant": "success", // Options: success, warning, info, tip
  "title": "Callout Title",
  "content": "Important information to highlight"
}
```

#### 3. **Highlight** (Statistics/Key points)
```json
{
  "type": "highlight",
  "variant": "primary", // Options: primary, secondary
  "stats": [
    { "label": "Metric", "value": "Result" }
  ]
}
```

### Step 4: Register Your Post (CRITICAL)

**This step is essential - your post won't appear on the site without it!**

#### 4a. Add to Post Registry

Add your post to `/src/newblog/data/postRegistry.js`:

```javascript
const postModules = {
  // ... existing posts ...
  'your-post-slug-here': () => import('./posts/your-post-slug-here.json'),
};
```

#### 4b. Add to Metadata Index

Add your post metadata to `/src/newblog/data/metadata/index.json` at the **beginning** of the array:

```json
[
  {
    "id": "your-post-slug-here",
    "title": "Your Blog Post Title",
    "slug": "your-post-slug-here", 
    "excerpt": "Your meta description",
    "date": "2025-01-15",
    "author": "Author Name",
    "tags": ["dhm", "hangover prevention", "wellness"],
    "image": "/images/your-post-slug-here-hero.webp",
    "readTime": 7
  },
  // ... existing posts ...
]
```

**Important Notes:**
- Add new posts at the **beginning** of the array (they'll appear first)
- Use `date` field (not `datePublished`) in metadata
- Image path should be `/images/filename.webp` for optimized images
- The `id` and `slug` should match your JSON filename

### Step 5: Add to Sitemap

Add your new post to `/public/sitemap.xml`:

```xml
<url>
  <loc>https://www.dhmguide.com/never-hungover/your-post-slug-here</loc>
  <lastmod>2025-01-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

**Placement:** Add it before the closing `</urlset>` tag, grouped with similar content.

### Step 6: Hero Images (Optional but Recommended)

If you have a hero image for your post:

1. **Optimize the image**: Use WebP format, 1200x630px, 85% quality
2. **Upload to**: `/public/images/your-post-slug-here-hero.webp`
3. **Update metadata**: Set `"image": "/images/your-post-slug-here-hero.webp"`

#### Image Optimization Commands:
```bash
# Convert to WebP (if you have ImageMagick/WebP tools installed)
cwebp -q 85 -resize 1200 630 your-image.jpg -o your-post-slug-here-hero.webp
```

### Step 7: Best Practices

#### Content Guidelines:
- **Length**: Aim for 1,500-2,500 words for comprehensive coverage
- **Tone**: Professional but approachable, science-backed but accessible
- **Keywords**: Include target keywords naturally (don't keyword stuff)
- **Structure**: Use clear headings and break up long sections
- **Evidence**: Link to scientific studies when making claims

#### SEO Optimization:
- **Title**: Include primary keyword, keep under 60 characters
- **Meta Description**: Compelling, includes keywords, 150-160 characters
- **URL Slug**: Short, descriptive, includes main keyword
- **Headings**: Use keywords in H2/H3 tags naturally

#### Technical Requirements:
- **Images**: Reference existing images in `/public/images/` or request new ones
- **Links**: Use full URLs for external links
- **Markdown**: Test your markdown formatting
- **JSON**: Validate your JSON (use jsonlint.com)

### Step 8: Testing Your Post

1. **Validate JSON**: Ensure your JSON is valid
2. **Check Links**: Verify all links work
3. **Preview Locally**: 
   ```bash
   npm run dev
   # Navigate to http://localhost:5173/never-hungover/your-post-slug
   ```

### Common Topics That Perform Well

- **Professional/Career**: Business dinners, networking, work-life balance
- **Student Life**: College parties, Greek life, study-party balance  
- **Product Reviews**: DHM supplement comparisons and analyses
- **Science/Research**: New studies, DHM mechanisms, liver health
- **Practical Guides**: Dosing, timing, specific scenarios
- **Cultural**: Drinking customs in different countries
- **Wellness**: Fitness, biohacking, holistic health approaches

### Example Post Slugs

Good examples from existing posts:
- `business-dinner-networking-dhm-guide-2025`
- `college-student-dhm-guide-2025`
- `dhm-dosage-guide-2025`
- `italian-drinking-culture-guide`

### Commit Message Format

When committing your new post:
```
Add new blog post: [Post Title]

- Created new post about [topic]
- Registered in postRegistry.js
- Added metadata to index.json
- Added to sitemap
- Targets [primary keyword]
```

### Troubleshooting Common Issues

#### "Post not appearing in blog listing"
- ✅ Check if added to `/src/newblog/data/metadata/index.json`
- ✅ Verify metadata uses `date` field (not `datePublished`)
- ✅ Ensure image path starts with `/images/`
- ✅ Confirm `id` field matches the slug exactly

#### "Individual post page crashes"
- ✅ Check if added to `/src/newblog/data/postRegistry.js`
- ✅ Verify post slug matches filename exactly
- ✅ **CRITICAL**: Ensure all required fields are present (see Field Requirements below)
- ✅ Validate JSON syntax using jsonlint.com or `python3 -m json.tool filename.json`
- ✅ Check content structure compatibility (array vs string format)

#### "Images not displaying"
- ✅ Check image path in metadata: `/images/filename.webp`
- ✅ Verify image exists in `/public/images/`
- ✅ Use WebP format for optimization

#### "Content rendering issues with array-based posts"
- ✅ Ensure all content sections have valid `type` field (`section`, `callout`, `highlight`)
- ✅ Verify section headings are properly defined
- ✅ Check for special characters that might break JSON parsing
- ✅ Ensure content sections have both `heading` and `content` fields

### Critical Field Requirements (NEW)

**All posts MUST include these exact field names to prevent crashes:**

```json
{
  "id": "your-post-slug-here",           // REQUIRED: Must match filename
  "slug": "your-post-slug-here",         // REQUIRED: Must match filename  
  "title": "Your Post Title",            // REQUIRED
  "excerpt": "Post description...",      // REQUIRED: For blog listing
  "date": "2025-01-15",                 // REQUIRED: For sorting/display
  "author": "Author Name",               // REQUIRED
  "image": "/images/post-hero.webp",     // REQUIRED: Hero image path
  "tags": ["tag1", "tag2"],             // REQUIRED: Array of strings
  "readTime": 7,                        // REQUIRED: Number in minutes
  "content": "..." or [...],            // REQUIRED: String or array format
}
```

**Optional but recommended fields:**
- `description`: For SEO (can duplicate `excerpt`)
- `datePublished`: For schema markup
- `dateModified`: For schema markup  
- `featured`: Boolean for featured posts
- `meta`: Object with SEO metadata
- `schema`: Object with structured data

### Quick Checklist

Before submitting:
- [ ] JSON file created in `/src/newblog/data/posts/`
- [ ] **CRITICAL**: All required fields present (id, slug, title, excerpt, date, author, image, tags, readTime, content)
- [ ] Field names match exactly (not `datePublished` instead of `date`, etc.)
- [ ] `id` and `slug` fields match filename exactly
- [ ] Content is properly formatted (markdown string OR array with valid sections)
- [ ] **CRITICAL**: Added to `/src/newblog/data/postRegistry.js`
- [ ] **CRITICAL**: Added metadata to `/src/newblog/data/metadata/index.json`
- [ ] Added to sitemap.xml
- [ ] Hero image optimized and uploaded (if applicable)
- [ ] JSON validates without errors (`python3 -m json.tool filename.json`)
- [ ] SEO fields optimized
- [ ] Read time is accurate (150-200 words per minute)
- [ ] Tags are relevant and lowercase
- [ ] **CRITICAL**: Tested locally - post appears in listing AND individual page loads without errors

## Complete Deployment Workflow

### Step-by-Step Clean Deployment Process

Follow this exact workflow for error-free blog post deployment:

#### 1. Pre-Development Setup
```bash
# Ensure you're on the latest main branch
git checkout main
git pull origin main

# Start development server for testing
npm run dev
```

#### 2. Create and Validate Post File
```bash
# Create your post file
touch src/newblog/data/posts/your-post-slug-2025.json

# Validate JSON syntax before proceeding
python3 -m json.tool src/newblog/data/posts/your-post-slug-2025.json
```

#### 3. Register the Post (CRITICAL)
```javascript
// Add to src/newblog/data/postRegistry.js
'your-post-slug-2025': () => import('./posts/your-post-slug-2025.json'),
```

#### 4. Add Metadata Entry (CRITICAL)
```json
// Add to BEGINNING of src/newblog/data/metadata/index.json array
{
  "id": "your-post-slug-2025",
  "title": "Your Post Title",
  "slug": "your-post-slug-2025", 
  "excerpt": "Your post description",
  "date": "2025-01-15",
  "author": "Author Name",
  "tags": ["tag1", "tag2"],
  "image": "/images/your-post-slug-2025-hero.webp",
  "readTime": 7
}
```

#### 5. Local Testing Protocol
```bash
# Test blog listing page
# Navigate to: http://localhost:5173/never-hungover
# ✅ Verify your post appears in the listing

# Test individual post page  
# Navigate to: http://localhost:5173/never-hungover/your-post-slug-2025
# ✅ Verify post loads without crashes
# ✅ Verify all content renders properly
# ✅ Check browser console for any errors
```

#### 6. Image Optimization (If Applicable)
```bash
# Optimize hero image
cwebp -q 85 -resize 1200 630 original-image.jpg -o public/images/your-post-slug-2025-hero.webp

# Verify image was created
ls -la public/images/your-post-slug-2025-hero.webp
```

#### 7. Final Validation
```bash
# Run final JSON validation
python3 -m json.tool src/newblog/data/posts/your-post-slug-2025.json > /dev/null && echo "✅ JSON Valid" || echo "❌ JSON Invalid"

# Check all required fields are present
grep -q '"id":\|"slug":\|"title":\|"excerpt":\|"date":\|"author":\|"image":\|"tags":\|"readTime":\|"content":' src/newblog/data/posts/your-post-slug-2025.json && echo "✅ Required fields present" || echo "❌ Missing required fields"
```

#### 8. Git Workflow
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add new blog post: Your Post Title

- Created comprehensive post about [topic]
- Registered in postRegistry.js 
- Added metadata to index.json
- Optimized hero image
- Tested locally - post loads successfully

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

#### 9. Production Verification
```bash
# Wait 2-3 minutes for Vercel deployment, then verify:
# ✅ https://www.dhmguide.com/never-hungover (post appears in listing)
# ✅ https://www.dhmguide.com/never-hungover/your-post-slug-2025 (post loads)
```

### Emergency Troubleshooting Commands

If your post isn't working after deployment:

```bash
# Quick diagnostic checks
echo "Checking post registration..."
grep -n "your-post-slug-2025" src/newblog/data/postRegistry.js

echo "Checking metadata entry..."
grep -n "your-post-slug-2025" src/newblog/data/metadata/index.json

echo "Validating JSON..."
python3 -m json.tool src/newblog/data/posts/your-post-slug-2025.json

echo "Checking required fields..."
jq 'keys' src/newblog/data/posts/your-post-slug-2025.json 2>/dev/null || echo "JSON invalid or jq not installed"
```

## Need Help?

- Check existing posts in `/src/newblog/data/posts/` for examples
- The most recent posts usually follow best practices
- **Simple content posts**: Model after `hangover-career-impact-dhm-solution-2025.json`
- **Array-based content posts**: Model after `complete-guide-hangover-types-2025.json`
- Always test locally before pushing to production
- When in doubt, validate JSON syntax first