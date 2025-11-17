# Content Creation Quick Reference Card

## Copy-Paste Template Files

### Pattern 1: Comprehensive Guide (4,000-7,000 words)
**Template File:** `/src/newblog/data/posts/alcohol-and-heart-health-complete-cardiovascular-guide-2025.json`
**Time to Complete:** 4-6 hours
**Section Structure:**
- Introduction (200-400 words)
- Core Topic (600-1,200 words × 3-5 sections)
- Strategic Strategies (400-800 words)
- Special Populations (300-600 words)
- FAQ (300-500 words)
- Conclusion (200-300 words)

### Pattern 2: Resource Hub (2,000-3,000 words)
**Template File:** `/src/newblog/data/posts/complete-hangover-science-hub-2025.json`
**Time to Complete:** 2-3 hours
**Content:** Links to 50+ existing posts organized by category

### Pattern 3: Product Review (2,000-4,000 words)
**Template File:** `/src/newblog/data/posts/double-wood-dhm-review-analysis.json`
**Time to Complete:** 2-4 hours
**Sections:**
- Quick summary box
- Customer analysis (500-800 words)
- Real stories (300-400 words)
- Authenticity analysis (200 words)
- Dosage patterns (300-400 words)
- Comparison (200-300 words)
- Who should use (300-400 words)
- FAQ (200-300 words)
- Bottom line (100-200 words)

### Pattern 4: Comparison Article (1,500-3,000 words)
**Template File:** Any "vs" post
**Time to Complete:** 2-3 hours
**Sections:**
- Quick answer (100-200 words)
- Comparison table
- 3-5 detailed sections (300-400 words each)
- Real-world usage (200-300 words)
- FAQ (150-250 words)

### Pattern 5: How-To/FAQ Guide (1,500-2,500 words)
**Template File:** `/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json`
**Time to Complete:** 3-4 hours
**Sections:**
- Quick answer (100-150 words)
- Scientific evidence (500-800 words)
- Benefits (300-400 words)
- Who should consider (300-400 words)
- Protocols (400-600 words)
- Timeline (300-400 words)
- Safety (300-400 words)
- User experiences (300-400 words)
- FAQ (300-500 words)

---

## Post JSON Structure (Minimal)

```json
{
  "id": "unique-slug",
  "title": "Topic: Benefit 2025",
  "slug": "topic-benefit-2025",
  "excerpt": "160-character summary...",
  "content": "[Markdown content]"
}
```

---

## Special Markdown Elements

### Alert Boxes (Auto-Render)
```markdown
**Info Box:** Blue box with info icon
**Warning:** Amber box with warning icon
**Pro Tip:** Green box with checkmark
**Key Insight:** Purple box with lightbulb
```

### Product Card (Auto-Render)
```markdown
**Product Spotlight: Product Name** - Description and benefits
```

### Tables (Markdown Format)
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

### Key Takeaways (Auto-Extract)
```markdown
## Key Takeaways

- Point 1
- Point 2
- Point 3
```

### Internal Links
```markdown
[Post Title](/blog/post-slug)
```

---

## SEO Checklist

- [ ] Title: "[Topic]: [Benefit] 2025"
- [ ] Meta Description: 160 chars, includes primary keyword
- [ ] Excerpt: 160 chars max
- [ ] Tags: 5-8 relevant tags
- [ ] Image: Saved to `/images/[slug]-hero.webp`
- [ ] Schema: Article schema in seo.schema
- [ ] Internal Links: 5-10 links to related posts
- [ ] Tables: At least one comparison table
- [ ] FAQ: 5-8 questions with answers
- [ ] Read Time: Calculated correctly (count words ÷ 200)

---

## Content Checklist

- [ ] Intro hooks reader (first 100 words critical)
- [ ] Clear headings (##, ###, ####)
- [ ] Info boxes for key points
- [ ] Comparison tables where applicable
- [ ] Real examples or case studies
- [ ] FAQ section at end
- [ ] Internal links to related posts
- [ ] Conclusion summarizes key takeaways
- [ ] No walls of text (break at 300 words)
- [ ] No more than 5-7 consecutive paragraphs

---

## File Paths (Copy-Paste Ready)

### Template Files to Copy
```
/src/newblog/data/posts/alcohol-and-heart-health-complete-cardiovascular-guide-2025.json
/src/newblog/data/posts/complete-hangover-science-hub-2025.json
/src/newblog/data/posts/double-wood-dhm-review-analysis.json
/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json
```

### Where to Save New Posts
```
/src/newblog/data/posts/[your-slug].json
```

### Documentation
```
/docs/LONG_FORM_CONTENT_PATTERNS.md (detailed guide)
/docs/CONTENT_CREATION_QUICK_REFERENCE.md (this file)
```

---

## Time Estimates

| Type | Words | Hours | Per Hour Rate |
|------|-------|-------|---|
| Comprehensive Guide | 4,000-7,000 | 4-6 | Copy template + research + fill sections |
| Resource Hub | 2,000-3,000 | 2-3 | Curate existing posts + brief descriptions |
| Product Review | 2,000-4,000 | 2-4 | Gather reviews + analyze + write |
| Comparison | 1,500-3,000 | 2-3 | Create table + fill sections |
| How-To/FAQ | 1,500-2,500 | 3-4 | Research + write + organize |

---

## Critical Success Factors

1. **Use templates** - Don't start from scratch
2. **Keep structure** - Familiar format = better UX
3. **Add value** - Unique research/insights, not just rewrites
4. **Link internally** - Every post links to 5-10 others
5. **Include tables** - At least one comparison/data table
6. **Real examples** - Case studies or customer quotes
7. **FAQ section** - Always ends with 5-8 Q&A
8. **Metadata** - Complete SEO fields for every post

---

## Publishing Workflow

1. Create JSON file in `/src/newblog/data/posts/`
2. Auto-registers in `postRegistry.js`
3. Auto-indexes in metadata
4. Automatically available at `/blog/[slug]`
5. Commit and push to main
6. Deploys automatically via Vercel

**No manual setup required - just create the file!**

---

## Common Mistakes to Avoid

- ❌ Starting with blank page (copy template first)
- ❌ Making unique design per post (keep consistent)
- ❌ No internal links (link to 5-10 related posts)
- ❌ Missing tables (add at least one data table)
- ❌ No FAQ (always include 5-8 questions)
- ❌ Skipping SEO metadata (required for search)
- ❌ Info boxes not marked (use **Info Box:** prefix)
- ❌ No product spotlights (feature relevant products)
- ❌ Text walls (break at 300 words max)

---

## Copy-Ready Examples

### Title Formats
- "Alcohol and Heart Health: Complete Cardiovascular Guide (2025)"
- "Double Wood DHM Review: What 552+ Amazon Customers Really Say"
- "Can You Take DHM Every Day? A Guide to Long-Term Use"
- "[Product] vs [Product]: Complete Comparison 2025"
- "[Topic]: Complete Guide to [Benefit] (2025)"

### Meta Description Format (160 chars max)
"Discover [topic] with our comprehensive 2025 guide. Expert insights, research-backed recommendations, and practical strategies for [benefit]."

### Tag Templates
- primary topic (e.g., "DHM safety")
- product/ingredient type (e.g., "hangover supplements")
- health condition (e.g., "blood pressure management")
- content format (e.g., "product review", "how-to guide")
- year (e.g., "2025 guide")

---

## Quick Wins to Add More Content

### 30-Minute Content Refresh
1. Update one meta description
2. Add one internal link
3. Update one FAQ answer
4. Fix one typo/formatting

### 2-Hour Product Review
1. Copy template (5 min)
2. Gather 20+ reviews (20 min)
3. Extract patterns (20 min)
4. Write customer stories (40 min)
5. Format and optimize (35 min)

### 1-Hour Comparison Post
1. Copy template (5 min)
2. Create comparison table (20 min)
3. Write quick answer (15 min)
4. Add FAQ (15 min)
5. Format and review (5 min)

---

## Feature Reference

### Available Components
- Alert boxes (Info/Warning/Pro Tip/Key Insight)
- Product cards (auto-rendered from **Product Spotlight:** markup)
- Tables (auto-formatted with remark-gfm)
- Key takeaways (auto-extracted and highlighted)
- Internal links (with hover prefetch)
- Schema markup (automatic FAQ and Article schema)

### Automatic Features
- Read time calculation
- Table of contents generation
- Schema markup injection
- Mobile responsiveness
- Image lightbox on hover
- Meta tag generation

---

## Support & Resources

**Full Guide:** `/docs/LONG_FORM_CONTENT_PATTERNS.md`
**Template Examples:** Copy any file from `/src/newblog/data/posts/`
**Component Code:** `/src/newblog/components/NewBlogPost.jsx`
**SEO Hooks:** `/src/hooks/useSEO.js`

