# Blog Post Creation Infrastructure Documentation

Complete reference for understanding and creating blog posts on the DHM Guide website.

## Quick Navigation

### For First-Time Content Creators
1. Start with **[BLOG_STRUCTURE_QUICK_REFERENCE.md](./BLOG_STRUCTURE_QUICK_REFERENCE.md)** - 5-minute overview
2. Use **[BLOG_POST_TEMPLATE.md](./BLOG_POST_TEMPLATE.md)** - Copy-paste template for new posts
3. Reference **[BLOG_INFRASTRUCTURE_GUIDE.md](./BLOG_INFRASTRUCTURE_GUIDE.md)** - Deep-dive technical details

### For Ongoing Content Work
- **[BLOG_STRUCTURE_QUICK_REFERENCE.md](./BLOG_STRUCTURE_QUICK_REFERENCE.md)** - Daily reference guide
- **[BLOG_POST_TEMPLATE.md](./BLOG_POST_TEMPLATE.md)** - Template for each new post
- **[BLOG_INFRASTRUCTURE_GUIDE.md](./BLOG_INFRASTRUCTURE_GUIDE.md)** - Technical troubleshooting

### For SEO Optimization
- Section 10 in **[BLOG_INFRASTRUCTURE_GUIDE.md](./BLOG_INFRASTRUCTURE_GUIDE.md)** - SEO best practices
- Meta description guidelines - Must be 120-160 characters EXACTLY
- Schema markup section - Product, Article, and FAQ schemas

## What's in Each Document

### BLOG_INFRASTRUCTURE_GUIDE.md (11 KB, 386 lines)
**Comprehensive technical reference**
- Complete blog post JSON schema with all field constraints
- Markdown feature support and special patterns
- FAQ schema implementation details
- Product database and recommendation system
- Blog post component architecture
- Step-by-step guide to creating new posts
- Image handling and prerendering requirements
- SEO best practices for health content
- All file paths and system architecture

**Best for**: Understanding how everything works, troubleshooting technical issues, implementing new features

### BLOG_POST_TEMPLATE.md (9.1 KB, 345 lines)
**Ready-to-use template and patterns**
- JSON structure template you can copy-paste
- Markdown content structure template with recommended flow
- Special markdown patterns (alerts, products, tables)
- Metadata guidelines for title/description/excerpt
- Pre-publishing checklist (19 items)
- FAQ registration template
- Common post types (Topic Guide, Review, Comparison, How-To, Deep Dive)
- Content length guidelines by post type

**Best for**: Creating new posts, ensuring consistency, quick reference while writing

### BLOG_STRUCTURE_QUICK_REFERENCE.md (9.3 KB, 284 lines)
**One-page cheat sheet**
- File structure diagram
- Required JSON fields as table
- Markdown features supported
- Content structure for SEO
- Product database list
- New post creation checklist
- Important gotchas and common mistakes
- File paths quick lookup
- SEO priorities summary

**Best for**: Daily work, checking requirements, quick answers without reading full guides

## Blog Post Infrastructure at a Glance

### Storage
- **Location**: `/src/newblog/data/posts/`
- **Format**: JSON with embedded Markdown content
- **Total Posts**: 170+ across health, supplements, products, and alcohol topics
- **Validation**: Validates against `/blog-post-schema.json`

### Key Requirements
- **Metadata**: 10 required fields (id, slug, title, excerpt, metaDescription, date, author, tags, image, readTime)
- **Meta Description**: MUST be 120-160 characters EXACTLY (critical for Google SERPs)
- **Content**: Markdown format, 1000+ words recommended
- **Structure**: H2+ headers, special pattern boxes, internal links
- **Images**: WebP format, stored in `/public/images/`

### Special Features
- **Auto-Rendering Components**: Info Box, Warning, Pro Tip, Key Insight, Product Cards
- **Auto-Extraction**: Key Takeaways section extracted into sidebar
- **Auto-Generation**: Table of Contents from H2 headers
- **Schema Markup**: Article, Product, and FAQ structured data
- **Related Posts**: Auto-loaded and cached after first view

### Markdown Support
```
Headers (H2-H6)        | ## Title
Bold/Italic            | **bold** *italic*
Links                  | [text](/path)
Lists                  | - item or * item
Tables (GFM)           | | Header | Header |
Code                   | `inline` or ```block```
Blockquotes            | > quote
Special Patterns       | **Info Box:** text
```

### Special Pattern Boxes (Auto-Rendered)
- `**Info Box:**` - Blue info alert
- `**Warning:**` - Amber warning alert  
- `**Pro Tip:**` - Green success alert
- `**Key Insight:**` - Purple lightbulb alert
- `**Product Spotlight: Name** -` - Green featured card

## Creating a Blog Post - 6 Steps

1. **Create JSON file** in `/src/newblog/data/posts/[slug].json`
   - Use the template from BLOG_POST_TEMPLATE.md
   - Validate against schema

2. **Fill Metadata** (10 required fields)
   - Meta description: 120-160 chars EXACTLY
   - Title: 10-200 chars with primary keyword
   - Image: Valid WebP path with alt text

3. **Write Content in Markdown**
   - 1000+ words recommended
   - H2+ headers (auto-generates TOC)
   - Include special pattern boxes
   - 5+ internal links minimum

4. **Add to System**
   - Export in `/src/newblog/data/posts/index.js`
   - Register FAQ if needed in `productSchemaGenerator.js`
   - Verify markdown renders correctly

5. **Optimize for SEO**
   - Primary keyword in title and first 100 words
   - Natural keyword density (1-2%)
   - Unique angle vs. top 3 Google results
   - External authority links

6. **Publish**
   - Git commit with message
   - Push to main branch
   - Verify prerender in build output

## Important Technical Notes

### Meta Description GOTCHA
- **MUST be exactly 120-160 characters**
- Longer = truncated in Google desktop SERPs
- Shorter = looks incomplete
- This is critical for click-through rates

### Dual Update Requirement (Pattern #11)
- Posts are prerendered at build time
- For SEO changes, must update BOTH:
  1. JavaScript state (JSON file)
  2. Prerendered HTML (via prerender script)
- Use `curl` to verify what crawlers see

### Image Requirements
- **Format**: WebP preferred (PNG/JPG fallback)
- **Path**: Must start with `/images/`
- **Storage**: `/public/images/`
- **Alt Text**: Descriptive, 10+ characters

### Post Loading
- Dynamic loading via `getPostBySlug()`
- All posts cached after first load
- Must appear in `index.js` for proper preload
- Related posts auto-loaded in background

## FAQ Schema for Better SERPs

Register high-traffic posts with 3-5 FAQ items in `/src/utils/productSchemaGenerator.js` to get:
- Google "People Also Ask" features
- FAQ rich snippets in search results
- Improved click-through rates

## Product Database (10 Featured Products)

1. DHM Depot (300mg)
2. DHM1000 (1000mg Premium)
3. Double Wood (300mg Value)
4. Flyby Recovery (Multi-ingredient)
5. Cheers Restore (DHM + L-cysteine)
6. No Days Wasted (1000mg Blend)
7. Toniiq Ease (98%+ Pure)
8. NusaPure (500mg Value)
9. Fuller Health After Party (DHM + Ginger)
10. Good Morning Pills (Multi-formula)

Use `**Product Spotlight: Product Name** -` pattern to create featured cards.

## Common Post Types

| Type | Length | Structure | Best For |
|------|--------|-----------|----------|
| Topic Guide | 1500-3000 | Intro → Why → Science → Solutions → Examples → Takeaways | Deep authority content |
| Product Review | 1000-2500 | Intro → Features → Comparison → Feedback → Where to Buy → FAQ | Product recommendations |
| Comparison | 1500-2500 | Intro → Quick Table → Analysis A → Analysis B → Winner → Takeaways | Vs. pages |
| How-To | 1000-1500 | Problem → Steps → Tips → Mistakes → Results → Takeaways | Actionable guides |
| Science Deep Dive | 2000-3000 | Overview → Mechanism → Evidence → Applications → Limits → Takeaways → FAQ | Research-backed content |

## File Paths - Quick Reference

| Component | Path |
|-----------|------|
| Blog posts | `/src/newblog/data/posts/*.json` |
| Post index | `/src/newblog/data/posts/index.js` |
| Renderer | `/src/newblog/components/NewBlogPost.jsx` |
| FAQ schema | `/src/utils/productSchemaGenerator.js` |
| Product DB | `/src/utils/blogSchemaEnhancer.js` |
| JSON schema | `/blog-post-schema.json` |
| Hero images | `/public/images/` |

## SEO Priorities

1. **Title** - Primary keyword, 50-60 chars, compelling
2. **Meta Description** - 120-160 chars EXACTLY, compelling
3. **Content** - 1000+ words, better than top 3 results
4. **Structure** - H2+ headers, bullet points, tables
5. **Links** - 5+ internal, 3+ external authority
6. **Keywords** - Natural density 1-2%
7. **Schema** - Product/Article/FAQ markup
8. **Images** - Optimized, descriptive alt text

## Getting Help

### Questions About:
- **Overall structure** - See BLOG_INFRASTRUCTURE_GUIDE.md Section 1-2
- **JSON schema** - See BLOG_INFRASTRUCTURE_GUIDE.md Section 2
- **Markdown** - See BLOG_STRUCTURE_QUICK_REFERENCE.md Markdown Features
- **Creating posts** - See BLOG_POST_TEMPLATE.md or BLOG_INFRASTRUCTURE_GUIDE.md Section 8
- **FAQ schema** - See BLOG_INFRASTRUCTURE_GUIDE.md Section 4
- **Products** - See BLOG_INFRASTRUCTURE_GUIDE.md Section 5
- **SEO** - See BLOG_INFRASTRUCTURE_GUIDE.md Section 10
- **Quick lookup** - See BLOG_STRUCTURE_QUICK_REFERENCE.md

## Statistics

- **Total Posts**: 170+ live blog posts
- **Topics**: Health, supplements, products, alcohol research, business impact
- **Audiences**: Health-conscious drinkers, business professionals, students, athletes
- **Average Length**: 1500-2500 words
- **Update Frequency**: Regular additions and improvements
- **SEO Focus**: Medical accuracy + keyword strategy + technical SEO

## Key Takeaways for Content Creators

1. **Meta description is critical** - Exactly 120-160 characters, this drives CTR
2. **Use templates** - Copy BLOG_POST_TEMPLATE.md to maintain consistency
3. **Structure matters** - H2 headers auto-generate TOC, special boxes auto-render
4. **Internal links essential** - 5+ links to related posts for SEO
5. **Dual updates required** - Both JSON and prerendered HTML for SEO changes
6. **FAQ helps ranking** - High-traffic posts should include FAQ schema
7. **Tables and boxes** - Use special patterns for readability and engagement
8. **Product focus** - Featured products drive revenue but must be relevant

---

**Created**: 2025-11-09  
**Blog Posts**: 170+ live  
**Documentation**: 3 comprehensive guides  
**Quick Links**: [Quick Reference](./BLOG_STRUCTURE_QUICK_REFERENCE.md) | [Template](./BLOG_POST_TEMPLATE.md) | [Full Guide](./BLOG_INFRASTRUCTURE_GUIDE.md)
