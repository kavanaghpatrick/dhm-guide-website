# Contributing Blog Posts to Never Hungover

This guide explains how to add new blog posts to the DHM Guide website's "Never Hungover" blog section.

## Quick Start (TL;DR)

1. Create a new JSON file in `/src/newblog/data/posts/` named `your-post-slug.json`
2. Copy the structure from an existing post
3. Add your post slug to the sitemap at `/public/sitemap.xml`
4. Commit and push your changes

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

### Step 4: Add to Sitemap

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

### Step 5: Best Practices

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

### Step 6: Testing Your Post

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
- Added to sitemap
- Targets [primary keyword]
```

### Quick Checklist

Before submitting:
- [ ] JSON file created in `/src/newblog/data/posts/`
- [ ] All required fields filled out
- [ ] Content is properly formatted markdown
- [ ] Added to sitemap.xml
- [ ] JSON validates without errors
- [ ] SEO fields optimized
- [ ] Read time is accurate (150-200 words per minute)
- [ ] Tags are relevant and lowercase

## Need Help?

- Check existing posts in `/src/newblog/data/posts/` for examples
- The most recent posts usually follow best practices
- Popular posts to model: `hangover-career-impact-dhm-solution-2025.json`