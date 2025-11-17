# Blog Post Infrastructure - Quick Reference

## File Structure
```
/src/newblog/
├── data/posts/
│   ├── index.js                    # Export all posts (add new posts here)
│   ├── post-slug-2025.json         # Your blog post JSON file
│   ├── dhm-science-explained.json  # Example: ~22KB file
│   └── ... (170+ more posts)
├── components/
│   ├── NewBlogPost.jsx             # Main rendering component
│   └── ...
├── pages/
│   └── NewBlogListing.jsx          # Blog listing page
└── utils/
    └── postLoader.js               # Dynamic post loading

/src/utils/
├── productSchemaGenerator.js       # FAQ schema registration
└── blogSchemaEnhancer.js           # Product database

/public/images/                     # Hero images (WebP format)

/blog-post-schema.json              # JSON validation schema
```

## Blog Post JSON - Required Fields

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `id` | string | lowercase-dashes, matches slug | `"dhm-science-explained"` |
| `slug` | string | URL-friendly, lowercase-dashes | `"dhm-science-explained"` |
| `title` | string | 10-200 chars, SEO keyword | `"DHM Science Explained: How..."` |
| `excerpt` | string | 50-300 chars, teaser | `"Scientists reveal: 85% sharper mind..."` |
| `metaDescription` | string | **120-160 chars EXACTLY** | `"How DHM works: Scientific breakdown..."` |
| `date` | string | ISO format YYYY-MM-DD | `"2025-06-26"` |
| `author` | string/object | "DHM Guide Team" or {name, avatar} | `"DHM Guide Team"` |
| `tags` | array | 3+ items, lowercase | `["dhm science", "research", "prevention"]` |
| `image` | object | {src, alt} with `/images/` path | `{"src": "/images/hero.webp", "alt": "..."}` |
| `readTime` | integer | 1-60 minutes | `8` |
| `content` | string | Markdown, 500+ chars minimum | `"## Section\nContent here..."` |

## Markdown Features Available

### Basic Formatting
- Headers: `## H2`, `### H3` (auto-TOC from H2s)
- Bold: `**text**`
- Italic: `*text*`
- Links: `[text](/path)` or `[text](https://url)`
- Lists: `- item` or `* item`
- Blockquotes: `> text`
- Code: `` `inline` `` or ` ```block``` `

### Tables (GitHub Flavored Markdown)
```markdown
| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
```

### Special Pattern Boxes (Auto-Rendered as Components)

| Pattern | Renders As | Color |
|---------|-----------|-------|
| `**Info Box:** text` | Alert with icon | Blue (info) |
| `**Warning:** text` | Alert with icon | Amber (warning) |
| `**Pro Tip:** text` | Alert with icon | Green (success) |
| `**Key Insight:** text` | Alert with icon | Purple (lightbulb) |

### Product Cards

```markdown
**Product Spotlight: Product Name** - Description with benefits
```
Renders as: Green card with "Featured" badge and "Learn More" button

### Key Takeaways (Auto-Extracted)

```markdown
## Key Takeaways
- Takeaway 1 (20-200 chars)
- Takeaway 2 (20-200 chars)
- Takeaway 3 (20-200 chars)
```
Auto-extracted into dedicated sidebar component

## Content Structure for SEO

### Recommended Outline:
1. **Hook** (1-2 paragraphs) - Address pain point, preview solution
2. **Overview** (1 section) - Key facts, statistics, or summary
3. **Problem/Why** (1-2 sections) - Context and background
4. **Science/How** (2-3 sections) - Mechanisms and evidence
5. **Solutions/Strategies** (2-4 sections) - Actionable approaches
6. **Real-World** (1-2 sections) - Examples and applications
7. **Key Takeaways** - 4-5 bullet points
8. **Conclusion** - Summary and next steps

### Length Guidelines:
- **Product Review**: 1000-2500 words
- **Comparison**: 1500-2500 words
- **How-To Guide**: 1000-1500 words
- **Topic Guide**: 1500-3000 words
- **Science Deep Dive**: 2000-3000+ words

## Product Database (10 Featured Products)

Located in `/src/utils/blogSchemaEnhancer.js`

1. **DHM Depot** - 300mg per capsule
2. **DHM1000** - Premium 1000mg
3. **Double Wood** - 300mg value option
4. **Flyby Recovery** - Multi-ingredient
5. **Cheers Restore** - DHM + L-cysteine
6. **No Days Wasted** - 1000mg blend
7. **Toniiq Ease** - Ultra-pure 98%+
8. **NusaPure** - 500mg value pack
9. **Fuller Health After Party** - DHM + ginger
10. **Good Morning Pills** - Multi-formula

## FAQ Schema (Optional but Recommended)

For high-traffic posts, register in `/src/utils/productSchemaGenerator.js`:

```javascript
const faqData = {
  'post-slug': [
    { question: 'Q1?', answer: 'A1...' },
    { question: 'Q2?', answer: 'A2...' },
    // 3-5 total Q&A pairs
  ]
};
```

Provides:
- Google "People Also Ask" features
- FAQ rich snippets in SERPs
- Improved CTR from featured snippets

## Creating a New Blog Post - Checklist

### 1. Create File
- [ ] Create `/src/newblog/data/posts/[slug].json`
- [ ] Validate against `/blog-post-schema.json`

### 2. Fill Metadata
- [ ] `id`: lowercase-dashes format
- [ ] `slug`: URL-friendly, lowercase-dashes
- [ ] `title`: 10-200 chars, SEO keyword included
- [ ] `metaDescription`: EXACTLY 120-160 chars
- [ ] `excerpt`: 50-300 chars, compelling teaser
- [ ] `date`: ISO format YYYY-MM-DD
- [ ] `author`: "DHM Guide Team" (or custom)
- [ ] `tags`: 3+ items, lowercase
- [ ] `image`: Valid path `/images/filename.webp`
- [ ] `readTime`: Realistic estimate 1-60 min
- [ ] `content`: 1000+ words markdown

### 3. Structure Content
- [ ] Opening hook (1-2 paragraphs)
- [ ] 3+ H2 headers (auto-generates TOC)
- [ ] Special boxes (Info/Warning/Pro Tip/Key Insight)
- [ ] Internal links (5+ related posts)
- [ ] Key Takeaways section
- [ ] Closing/conclusion

### 4. Optimize for SEO
- [ ] Primary keyword in title and first 100 words
- [ ] Meta description compelling for CTR
- [ ] 5+ internal links to related posts
- [ ] 3+ external authority links
- [ ] Natural keyword density (1-2%)
- [ ] Unique angle/perspective vs. top 3 results

### 5. Add to System
- [ ] Add export to `/src/newblog/data/posts/index.js`
- [ ] Register FAQ if applicable (productSchemaGenerator.js)
- [ ] Verify all markdown renders correctly
- [ ] Test links (internal and external)
- [ ] Check mobile responsiveness

### 6. Publish
- [ ] Git commit: "Content: Add [topic] blog post"
- [ ] Push to main branch
- [ ] Verify prerender in build output
- [ ] Monitor Google Search Console

## Important Gotchas

### 1. Meta Description Length
- **MUST be 120-160 characters EXACTLY**
- Longer = truncated in desktop SERPs
- Shorter = looks incomplete
- Check character count carefully

### 2. Markdown Rendering
- `react-markdown` with GFM plugin
- Tables must use `|` syntax (not HTML)
- Headers must be H2+ (not H1)
- Links use markdown syntax, not HTML

### 3. Image Paths
- Must start with `/images/` (not relative)
- Filename in JSON must match actual file
- Prefer WebP format for size/quality
- Include descriptive alt text (10+ chars)

### 4. Prerendering
- Posts prerendered at build time
- **Both JS AND prerender must be updated for SEO changes**
- Pattern #11: Dual-source requirement for SPAs
- Use curl to verify what crawlers see

### 5. Post Loading
- Dynamic loading via `getPostBySlug()`
- All posts cached after first load
- Must appear in `index.js` for proper preload
- Related posts auto-loaded in background

## Internal Link Examples

```markdown
[Complete DHM Guide](/guide)
[Hangover Prevention](/never-hungover/emergency-hangover-protocol-2025)
[DHM Science Explained](/never-hungover/dhm-science-explained)
[Product Reviews](/reviews)
[DHM Dosage Guide](/never-hungover/dhm-dosage-guide-2025)
```

## Common Post Types & Templates

### Topic Guide
Overview → Problem/Why → Science/How → Solutions → Real-World → Key Takeaways

### Product Review
Intro → Product Spotlight Card → Features → Comparison Table → User Feedback → Where to Buy → FAQ

### Comparison Post
Intro → Quick Comparison Table → Option 1 Analysis → Option 2 Analysis → Which is Best → Key Takeaways

### How-To Guide
Problem → Step-by-Step → Tips → Common Mistakes → Results → Pro Tips → FAQ

### Scientific Deep Dive
Research Overview → Mechanism → Evidence → Applications → Limitations → Key Takeaways → FAQ

## File Paths (Quick Lookup)

| File | Location |
|------|----------|
| New posts | `/src/newblog/data/posts/[slug].json` |
| Post index | `/src/newblog/data/posts/index.js` |
| Rendering | `/src/newblog/components/NewBlogPost.jsx` |
| FAQ schema | `/src/utils/productSchemaGenerator.js` |
| Products DB | `/src/utils/blogSchemaEnhancer.js` |
| Hero images | `/public/images/` |
| JSON schema | `/blog-post-schema.json` |

## SEO Priorities

1. **Title** - Include primary keyword, 50-60 chars
2. **Meta Description** - 120-160 chars EXACTLY, compelling
3. **Content** - 1000+ words, better than top 3 results
4. **Structure** - H2+ headers, bullet points, tables
5. **Links** - 5+ internal, 3+ external authority
6. **Keywords** - Natural density 1-2%, not stuffed
7. **Schema** - Product/Article/FAQ markup
8. **Images** - Optimized, descriptive alt text

## Contact/Support

For questions about:
- **Blog infrastructure**: Check this guide or `BLOG_INFRASTRUCTURE_GUIDE.md`
- **Post templates**: See `BLOG_POST_TEMPLATE.md`
- **SEO best practices**: Review SEO section in `BLOG_INFRASTRUCTURE_GUIDE.md`
- **Schema markup**: Check `productSchemaGenerator.js` comments

---

**Last Updated**: 2025-11-09
**Total Posts**: 170+
**File Format**: JSON + Markdown
**Rendering Engine**: React + react-markdown + GFM
