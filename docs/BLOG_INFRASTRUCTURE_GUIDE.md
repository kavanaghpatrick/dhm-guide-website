# DHM Guide Blog Post Creation Infrastructure

## 1. Blog Post Storage Location
- **Primary Storage**: `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/`
- **Format**: JSON files with metadata + markdown content
- **Total Posts**: 170+ blog posts across various health/DHM topics
- **Index File**: `index.js` (exports all posts as static imports)

## 2. Blog Post JSON Schema

### Required Fields:
```json
{
  "id": "string (slug-format, matches filename)",
  "slug": "string (URL-friendly, lowercase-dashes)",
  "title": "string (10-200 chars)",
  "excerpt": "string (50-300 chars, for listings)",
  "metaDescription": "string (120-160 chars, for Google SERPs)",
  "date": "string (ISO format: YYYY-MM-DD)",
  "author": "string or object {name, avatar}",
  "tags": "array of strings (3+ tags)",
  "image": "object {src, alt}",
  "readTime": "integer (1-60 minutes)",
  "content": "string (Markdown format, 500+ chars)"
}
```

### Field Constraints:
- **metaDescription**: 120-160 characters (critical for Google search snippets)
- **title**: 10-200 characters (SEO friendly, descriptive)
- **excerpt**: 50-300 characters (teaser for blog listings)
- **readTime**: 1-60 minutes (estimate for reader engagement)
- **image.src**: Must match pattern `/images/.*\.(jpg|jpeg|png|webp)$`
- **tags**: Minimum 3 tags, lowercase recommended

## 3. Content Format (Markdown in JSON)

### Supported Markdown Features:
- **Headers**: `## Section Title` (H2-H6)
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Lists**: `- item` or `* item`
- **Tables**: GitHub Flavored Markdown (GFM) tables
- **Links**: `[text](/path)` or `[text](https://url)`
- **Blockquotes**: `> quote text`
- **Code**: ` `inline` ` or ` ```block``` `

### Special Patterns (Auto-Rendered as Components):

#### Info Box
```
**Info Box:** Your content here
```
Renders as: Blue info alert with icon

#### Warning Box
```
**Warning:** Your warning text here
```
Renders as: Amber warning alert

#### Pro Tip Box
```
**Pro Tip:** Your pro tip here
```
Renders as: Green success alert

#### Key Insight Box
```
**Key Insight:** Your insight here
```
Renders as: Purple lightbulb alert

#### Product Spotlight (for reviews)
```
**Product Spotlight: Product Name** - Brief description
```
Renders as: Green featured product card with "Learn More" button

### Table Formatting

Tables use GitHub Flavored Markdown (GFM):

```markdown
| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Data 1 | Data 2 | Data 3 |
| Data 4 | Data 5 | Data 6 |
```

Example from "Activated Charcoal Hangover" post:
```markdown
| Aspect | Activated Charcoal | DHM (Dihydromyricetin) |
| --- | --- | --- |
| **Mechanism** | Theoretically binds substances in gut | Enhances liver enzymes |
| **Effect on Alcohol** | Minimal to none | Accelerates metabolism |
| **Cost per Use** | $0.50-2.00 (wasted money) | $1.00-3.00 (proven) |
```

## 4. FAQ Schema Implementation

### Location: 
`/Users/patrickkavanagh/dhm-guide-website/src/utils/productSchemaGenerator.js`

### FAQ Data Structure:
```javascript
const faqData = {
  'post-slug': [
    {
      question: 'Question text?',
      answer: 'Answer text'
    },
    // ... more FAQ items
  ]
};
```

### High-Priority Posts with FAQ:
- Top 5 pages get FAQ schema automatically
- Week 3 SEO optimization initiative
- Generates JSON-LD structured data for Google rich snippets

### How to Add FAQ to New Posts:

1. **Register in faqData object** with post slug
2. **Add 3-5 relevant FAQs** (questions users actually search for)
3. **Structure as Q&A pairs** (question, answer format)
4. **Generate structured data** automatically during render

FAQ schema helps with:
- Google SERP "People Also Ask" features
- FAQ rich snippets in search results
- Improved CTR from featured snippets

## 5. Product Recommendations/CTAs

### Product Database
Location: `/Users/patrickkavanagh/dhm-guide-website/src/utils/blogSchemaEnhancer.js`

**10 Featured Products:**
1. DHM Depot (Double Wood) - 300mg
2. DHM1000 - Premium
3. Double Wood Supplements - 300mg value
4. Flyby Recovery - Multi-ingredient
5. Cheers Restore - DHM + L-cysteine
6. No Days Wasted - 1000mg blend
7. Toniiq Ease - Ultra-pure 98%+
8. NusaPure - 500mg value pack
9. Fuller Health After Party - DHM + ginger
10. Good Morning Hangover Pills - Multi-formula

### Product Spotlight Cards

Use this markdown pattern to create featured product cards:
```
**Product Spotlight: [Product Name]** - [Brief description with key benefits]
```

This renders as:
- Green-bordered card
- Product name as title
- "Featured" badge
- "Learn More →" button
- Hover effect with shadow

### Link Patterns for CTAs

Internal Links:
```
[Complete DHM Guide](/guide)
[Product Reviews](/reviews)
[DHM Science Explained](/never-hungover/dhm-science-explained)
[Hangover Prevention](/never-hungover/emergency-hangover-protocol-2025)
```

Affiliate/Recommendation Links:
```
[Check on Amazon](https://amzn.to/...)
[Visit Brand Website](https://brandsite.com)
```

## 6. Special Content Patterns

### Table of Contents (TOC)
Automatically generated from `##` headers:
```markdown
## Table of Contents

1. [First Section](#first-section)
2. [Second Section](#second-section)
3. [Third Section](#third-section)
```

### Key Takeaways Section
Automatically extracted if post contains:
```markdown
## Key Takeaways

- Point 1 with 20-200 characters
- Point 2 with good length
- Point 3 for reader value
- Point 4 summarizing insights
```

Pattern Detection:
- Looks for `## Key Takeaways` heading
- Extracts bullet points (- or * format)
- Filters out complex markdown
- Displays in dedicated sidebar component

### Visual Separators
Rendered automatically between major sections:
```markdown
---
```

Creates: Gradient line with leaf icon (🍃)

### Blockquotes for Emphasis
```markdown
> **Key Point:** Important statement that users should remember
> Additional details or supporting information
```

## 7. Blog Post Component (NewBlogPost.jsx)

### Features:
- Dynamic slug extraction from URL
- Auto-load post via `getPostBySlug()`
- Markdown rendering with `react-markdown` + `remark-gfm`
- Table of contents generation from headers
- Reading progress indicator
- Related posts sidebar
- Key takeaways extraction
- Image lightbox support
- Share functionality
- SEO metadata injection

### Content Rendering:
```javascript
// Supports both:
// 1. Simple string content (legacy)
// 2. Array-based sections (new structure)

// Legacy: "content": "Full markdown string..."
// New: "content": [
//   { type: "section", heading: "...", content: "..." },
//   { type: "callout", title: "...", content: "..." }
// ]
```

### Auto-Components:
- Alert boxes (Info, Warning, Pro Tip, Key Insight)
- Product cards (spotlight format)
- Tables (GitHub Flavored Markdown)
- Code blocks with syntax highlighting
- Links with CustomLink wrapper

## 8. Creating a New Blog Post

### Step-by-Step:

1. **Create JSON file** in `/src/newblog/data/posts/[slug].json`

2. **Add to index.js**:
   ```javascript
   export { default as postN } from './[slug].json';
   ```

3. **Fill metadata**:
   - `slug`: lowercase-with-dashes
   - `title`: 10-200 chars, SEO keyword focused
   - `metaDescription`: 120-160 chars, EXACT format for Google
   - `excerpt`: 50-300 chars teaser
   - `date`: ISO format
   - `author`: "DHM Guide Team" or custom
   - `tags`: 3+ relevant tags
   - `image`: Hero image path
   - `readTime`: Estimate in minutes

4. **Write content** in Markdown:
   - Use H2 headers for main sections
   - Include 3+ sections minimum
   - Add special pattern boxes (Info, Warning, Pro Tip)
   - Include internal links to related posts
   - Add product spotlights if relevant
   - Include Key Takeaways section

5. **Add FAQ** (optional but recommended for SEO):
   - Register in `productSchemaGenerator.js`
   - Add 3-5 Q&A items
   - Match user search intent

6. **Verify schema**:
   - Product schema (if product review)
   - Article schema (auto-generated)
   - FAQ schema (if registered)

### Naming Convention:
- Use descriptive slugs: `[topic]-[subtopic]-[year].json`
- Examples:
  - `alcohol-headache-why-it-happens-how-to-prevent-2025.json`
  - `dhm-science-explained.json`
  - `double-wood-vs-dhm-depot-comparison-2025.json`

## 9. Important Technical Details

### Image Handling:
- **Required format**: WebP (`.webp`) preferred, PNG/JPG fallback
- **Storage**: `/public/images/`
- **Path format**: `/images/filename.webp`
- **Alt text**: Descriptive, 10+ characters
- **Hero image**: Recommended 1200x630px

### Markdown Processing:
- Uses `react-markdown` with GFM plugin
- Tables render with full styling
- Code blocks support syntax highlighting
- Links open in custom Link component
- Escapes XSS risks automatically

### Prerendering:
- Posts prerendered at build time via `prerender-blog-posts.js`
- Static HTML generated for Googlebot
- Must update both JS state AND prerender for SEO changes
- Pattern #11: Dual update requirement for prerendered SPAs

### Redirects:
- Handled via `/vercel.json` (active)
- Old posts redirected to new URLs
- Prevents 404s for migrated content

### Content Organization:
- By topic: health, supplements, products, alcohol impacts
- By audience: business professionals, students, fitness
- By format: guides, reviews, comparisons, FAQs

## 10. SEO Best Practices for Blog Posts

### Title (Critical):
- Include primary keyword
- 50-60 characters for desktop, 30-40 for mobile
- Make compelling for CTR
- Example: "DHM Science Explained: How It Prevents Hangovers at the Molecular Level"

### Meta Description:
- EXACTLY 120-160 characters
- Include primary + secondary keywords
- Make user want to click
- Must match actual content
- Example: "How DHM works: Scientific breakdown of dihydromyricetin's GABA receptor action, liver enzyme boost, and 85% hangover reduction mechanism."

### Content Structure:
- H2 for main sections (auto-TOC generation)
- 1,000+ words for authority
- Internal links to 5+ related posts
- External links to credible sources
- Keyword density: 1-2%

### Link Strategy:
- Internal: 5+ links to related posts
- Affiliate: Relevant product links with disclosures
- External: Citation links to research/studies
- Anchor text: Descriptive, keyword-rich when appropriate

### Schema Markup:
- Article schema (auto)
- Product schema (if review)
- FAQ schema (for featured posts)
- AggregateRating schema (for products)

## File Paths Summary

| Component | Path |
|-----------|------|
| Blog Posts | `/src/newblog/data/posts/*.json` |
| Blog Component | `/src/newblog/components/NewBlogPost.jsx` |
| Blog Listing | `/src/newblog/pages/NewBlogListing.jsx` |
| Schema Generator | `/src/utils/productSchemaGenerator.js` |
| Blog Enhancer | `/src/utils/blogSchemaEnhancer.js` |
| Post Loader | `/src/newblog/utils/postLoader.js` |
| Prerender Script | `/scripts/prerender-blog-posts.js` |
| JSON Schema | `/blog-post-schema.json` |
| Index File | `/src/newblog/data/posts/index.js` |
| Hero Images | `/public/images/` |

