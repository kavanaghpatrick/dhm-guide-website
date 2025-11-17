# Long-Form Content Resources Index

This directory contains comprehensive guides for creating long-form content on the DHM Guide website.

## Quick Start (5 Minutes)

1. **Read:** `/docs/CONTENT_CREATION_QUICK_REFERENCE.md` (this page has all the quick answers)
2. **Copy:** Pick a template from the list below
3. **Create:** Make a JSON file in `/src/newblog/data/posts/`
4. **Publish:** Commit and push (no other setup needed)

## Documents in This Directory

### 1. LONG_FORM_CONTENT_PATTERNS.md (Detailed Guide)
- **Length:** 2,760 words
- **Purpose:** Complete reference for all content patterns
- **Contains:**
  - 5 detailed pattern specifications with sections
  - CTA placement strategies
  - Table structure patterns
  - FAQ implementation guide
  - Complete JSON structure template
  - Real examples from existing posts
  - Time estimates for each pattern
  - Content checklist
  - SEO best practices
- **Use When:** You need detailed guidance or want to understand the full system

### 2. CONTENT_CREATION_QUICK_REFERENCE.md (Quick Card)
- **Length:** 1-page reference
- **Purpose:** Quick lookup for key information
- **Contains:**
  - Template file paths (copy-paste ready)
  - Time estimates
  - Section structure overviews
  - JSON structure snippet
  - Markdown element reference
  - SEO checklist
  - Common mistakes
- **Use When:** You need a quick answer or reminder while creating

### 3. CONTENT_RESOURCES_INDEX.md (This File)
- **Purpose:** Navigation guide for all resources
- **Contains:** Links and descriptions of all available guides

## 5 Content Patterns at a Glance

### Pattern 1: Comprehensive Guide (4,000-7,000 words)
- **Template:** `/src/newblog/data/posts/alcohol-and-heart-health-complete-cardiovascular-guide-2025.json`
- **Time:** 4-6 hours
- **Best For:** Health topics, detailed explanations, evidence-based content
- **Structure:** Intro → 3-5 core sections → strategies → special cases → FAQ → conclusion

### Pattern 2: Resource Hub (2,000-3,000 words)
- **Template:** `/src/newblog/data/posts/complete-hangover-science-hub-2025.json`
- **Time:** 2-3 hours
- **Best For:** Navigation pages, topic clusters, curation of existing posts
- **Structure:** Intro → 6-10 categories with links → quick reference → footer

### Pattern 3: Product Review (2,000-4,000 words)
- **Template:** `/src/newblog/data/posts/double-wood-dhm-review-analysis.json`
- **Time:** 2-4 hours
- **Best For:** Supplement reviews, product analysis, customer feedback synthesis
- **Structure:** Summary box → analysis → stories → authenticity → patterns → comparison → recommendations → FAQ

### Pattern 4: Comparison Article (1,500-3,000 words)
- **Template:** Any "vs" post in `/src/newblog/data/posts/`
- **Time:** 2-3 hours
- **Best For:** Direct product/ingredient comparisons
- **Structure:** Quick answer → table → 3-5 detailed sections → use cases → FAQ

### Pattern 5: How-To/FAQ Guide (1,500-2,500 words)
- **Template:** `/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json`
- **Time:** 3-4 hours
- **Best For:** Safety questions, usage guides, long-term strategies
- **Structure:** Quick answer → evidence → benefits → who should use → protocols → timeline → safety → case studies → FAQ

## Special Content Features You Can Use

### Alert Boxes (Auto-Rendering)
Use these markdown patterns - they auto-render with icons and colors:

```markdown
**Info Box:** [Content] - renders as blue alert
**Warning:** [Content] - renders as amber alert
**Pro Tip:** [Content] - renders as green alert
**Key Insight:** [Content] - renders as purple alert
```

### Product Spotlights
```markdown
**Product Spotlight: Product Name** - Description with benefits

Renders as: Green card + "Featured" badge + "Learn More" button
```

### Comparison Tables
```markdown
| Product | Price | Value |
|---------|-------|-------|
| Option A | $X | High |
```
Auto-formatted with zebra striping and responsive scrolling.

### Key Takeaways (Auto-Extract)
```markdown
## Key Takeaways

- Point 1
- Point 2
```
Automatically extracted and highlighted at top of post.

## SEO Checklist Before Publishing

Essential Elements:
- Title: `[Topic]: [Benefit] 2025`
- Meta description: 160 chars, includes primary keyword
- Image: Saved to `/images/[slug]-hero.webp`
- Tags: 5-8 relevant tags
- Internal links: 5-10 links to related posts
- Schema: Article schema in seo.schema field
- FAQ: 5-8 questions with answers (if applicable)

Content Quality:
- Intro hooks reader (first 100 words critical)
- Clear headings (##, ###, ####)
- At least 1 comparison/data table
- Real examples or case studies
- No text walls (break at 300 words)
- FAQ section included
- Conclusion summarizes takeaways

## Publishing Process (Fully Automated)

1. Create JSON file: `/src/newblog/data/posts/[your-slug].json`
2. File auto-registers in `postRegistry.js`
3. Auto-indexes in metadata
4. Automatically available at `/blog/[your-slug]`
5. Commit and push to main
6. Deploys automatically via Vercel

**No manual configuration needed - just create the file!**

## Quick Wins You Can Do Today

### 30-Minute Content Refresh
1. Update 1 meta description
2. Add 1 internal link to related post
3. Update 1 FAQ answer with new research
4. Fix 1 formatting issue

### 1-Hour Wins
- Create 1 comparison table + outline (1 hour)
- Write 1 comparison article (1 hour)
- Refresh 1 existing article with new info (1 hour)

### 2-Hour Wins
- Write 1 product review (2 hours)
- Create 1 comprehensive how-to guide (2 hours)
- Refresh 3-4 existing articles (2 hours total)

## Template Files (Copy These)

All in `/src/newblog/data/posts/`:

1. **alcohol-and-heart-health-complete-cardiovascular-guide-2025.json**
   - Comprehensive guide template
   - Good for: Health topics, scientific content

2. **complete-hangover-science-hub-2025.json**
   - Resource hub template
   - Good for: Navigation, topic clusters

3. **double-wood-dhm-review-analysis.json**
   - Product review template
   - Good for: Supplement/product reviews

4. **can-you-take-dhm-every-day-long-term-guide-2025.json**
   - How-to/FAQ template
   - Good for: Safety, usage, long-term guides

## Common Questions

**Q: How long does it take to write a blog post?**
A: Using templates: 3-5 hours. From scratch: 6-8 hours. Templates save 40-60% of time.

**Q: Do I need to register my post anywhere?**
A: No! Just create the JSON file and it auto-registers. No manual setup needed.

**Q: Can I update existing posts?**
A: Yes! Just edit the JSON file and commit. Changes deploy automatically.

**Q: What if I'm not sure about the structure?**
A: Copy an existing template and follow its pattern. All templates are proven to work.

**Q: How do I link to other posts?**
A: Use markdown: `[Post Title](/blog/post-slug)`

**Q: Do I need to write schema markup?**
A: Schema is generated automatically! Just include the data in the JSON fields.

**Q: Can I use my own images?**
A: Yes! Save hero images to `/images/[slug]-hero.webp` and reference in JSON.

## Related Documentation

- Component code: `/src/newblog/components/NewBlogPost.jsx`
- Post loader: `/src/newblog/utils/postLoader.js`
- SEO hooks: `/src/hooks/useSEO.js`
- FAQ component: `/src/components/FAQSection.jsx`
- All 169+ existing posts: `/src/newblog/data/posts/`

## Need Help?

1. **Question about structure?** → See LONG_FORM_CONTENT_PATTERNS.md
2. **Quick reference needed?** → See CONTENT_CREATION_QUICK_REFERENCE.md
3. **Looking for a template?** → Browse `/src/newblog/data/posts/` and copy one
4. **Want to see how something works?** → Check the component code at `/src/newblog/components/NewBlogPost.jsx`

## Statistics from Existing Content

- **Total posts:** 169+
- **Average post length:** 2,500-4,000 words
- **Most common pattern:** Comprehensive guide (40% of posts)
- **Second most common:** Product review (30% of posts)
- **Resource hubs:** 5-8% of posts
- **Comparison articles:** 10-15% of posts
- **How-to guides:** 10-15% of posts

## Key Takeaways

1. **Use templates** - Don't start from blank page
2. **Keep structure** - Familiar format = better UX
3. **Link internally** - Every post links to 5-10 others
4. **Add tables** - At least one comparison/data table
5. **Include FAQ** - Always ends with 5-8 Q&A
6. **Complete SEO** - All metadata fields matter
7. **Time estimates** - Using templates saves 40-60% of time
8. **Publishing is instant** - No manual setup required

---

**Start here:** Pick a pattern above, copy its template file, follow the structure, and publish!

