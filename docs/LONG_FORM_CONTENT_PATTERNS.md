# DHM Guide Website - Long-Form Content Patterns & Reusable Templates

## Executive Summary

Your codebase contains **169+ blog posts** with proven long-form content patterns. This guide provides ready-to-use templates, content structures, and shortcuts to accelerate new content creation.

**Key Finding:** Most successful posts follow 5 core structure patterns that can be templated and adapted for new topics.

---

## Part 1: Content Structure Patterns

### Pattern 1: Comprehensive Guide (3,000-7,000 words)
**Examples:**
- `/src/newblog/data/posts/alcohol-and-heart-health-complete-cardiovascular-guide-2025.json` (6,887 words)
- `/src/newblog/data/posts/alcohol-hypertension-blood-pressure-management-2025.json` (6,887 words)
- `/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json` (full content)

**Structure:**
1. Introduction (200-400 words) - Problem statement + overview
2. Core Topic Deep Dives (3-5 sections, 600-1,200 words each)
   - Science/mechanisms explained
   - Evidence and research citations
   - Practical applications
3. Strategic Section (400-800 words)
   - **For health guides:** Protection strategies, protocols
   - **For reviews:** Product comparisons, ratings
4. Special Populations (300-600 words)
   - Age/gender/health considerations
5. FAQ Section (300-500 words)
   - 5-8 questions with detailed answers
6. Conclusion (200-300 words)

**Key Elements:**
- Markdown headings (##, ###, ####)
- Info boxes: `**Info Box:** content`
- Tables for comparisons
- Internal links to related posts
- FAQ schema markup for rich snippets

**Reuse Tip:** This structure works for ANY health topic. Swap in new research but keep section format identical.

---

### Pattern 2: Resource Hub/Navigation Page (2,000-3,000 words)
**Example:**
- `/src/newblog/data/posts/complete-hangover-science-hub-2025.json`

**Structure:**
1. Welcome Introduction (150-200 words)
2. Major Category Sections (6-10 categories)
   Each containing:
   - Subsection with 4-8 related links
   - Each link: [**Title**](/blog/slug) - Brief description
3. Quick Reference Tools (200-300 words)
4. Stay Updated (50-100 words)

**Shortcut:** This is essentially an internal sitemap with commentary. 
- Use existing posts you want to promote
- Add brief descriptions (1-2 sentences per link)
- Update quarterly as new posts are added

**Template Pattern:**
```
## [Category Name]

### [Subcategory]

- [**Topic Title**](/blog/slug) - One sentence description
- [**Topic Title**](/blog/slug) - One sentence description
```

**Data Structure:**
```json
{
  "title": "[Hub Name]",
  "content": "[Markdown with links to 50+ existing posts]",
  "slug": "[hub-slug]",
  "readTime": 8,
  "seo": {
    "metaTitle": "[Hub Title]: Ultimate Resource Guide",
    "metaDescription": "[Hub description]. Access 100+ articles on..."
  }
}
```

**Reuse Tip:** Create one hub per major topic cluster. Minimal original content—mostly curation of existing posts.

---

### Pattern 3: Product Review Analysis (2,000-4,000 words)
**Examples:**
- `/src/newblog/data/posts/double-wood-dhm-review-analysis.json` (2,000+ words)
- `/src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json` (8,000+ words with 20 products)

**Structure:**

#### Short Review (2,000 words - single product)
1. Title and Quick Summary Box
   ```
   **Info Box:** [Product] **[Rating]/5 stars** ([# reviews]). Price: $X ($Y/serving)
   - What customers love
   - Common complaints
   ```
2. Deep Dive: Customer Experience Analysis (500-800 words)
   - Effectiveness by drinking level
   - Common customer phrases (frequency analysis)
3. Real Customer Stories (300-400 words)
   - 2-3 success stories (quoted)
   - 1-2 critical reviews (quoted)
4. Review Authenticity Analysis (200 words)
   - Verification stats
   - Deleted review count
   - Authenticity score
5. Dosage Patterns from Reviews (300-400 words)
   - Most effective timing
   - Customer-reported side effects
6. Comparison with Competitors (200-300 words)
7. Who Should Choose This (300-400 words)
   - Ideal customers
   - Not ideal for
8. Frequently Asked Questions (200-300 words)
   - Q&A from customer reviews
9. Bottom Line Summary (100-200 words)

#### Long Review (8,000+ words - 20 products)
Same structure but multiply comparison sections:
- Each product gets 300-400 word mini-review
- Include: name, evidence rating, pros/cons, price, bottom line
- Create comparison tables (see next section)

**Key Element: Pricing Table**
```
| Product | Price | Servings | Cost/Serving | DHM per Serving | Value Rating |
|---------|-------|----------|--------------|-----------------|-------------|
| Brand A | $39.99 | 30 | $1.33 | 600mg | Excellent |
| Brand B | $24.99 | 30 | $0.83 | 300mg | Excellent |
```

**Data Structure:**
```json
{
  "title": "[Product] Review: What Customers Really Say",
  "excerpt": "552+ verified buyers reveal... at $0.66/serving.",
  "readTime": 5,
  "content": "[Markdown with sections above]",
  "tags": ["product reviews", "customer feedback", "dhm effectiveness"]
}
```

**Reuse Tip:** Template is identical for ANY supplement/product review. Just swap product data, pricing, customer testimonials.

---

### Pattern 4: Comparison/vs. Articles (1,500-3,000 words)
**Structure:**
1. Quick Answer (100-200 words)
2. Comparison Table (visual reference)
```
| Factor | Product A | Product B |
|--------|-----------|-----------|
| Price | $29.99 | $39.99 |
| Dosage | 300mg | 600mg |
| Best For | Budget users | Heavy drinkers |
```
3. Detailed Breakdown (3-5 sections)
   - Each section covers one comparison aspect
   - 300-400 words per section
4. Real-World Usage (200-300 words)
   - When to choose A
   - When to choose B
5. FAQ (150-250 words)

**Data Structure:**
```json
{
  "title": "[Product A] vs [Product B]: Complete Comparison 2025",
  "content": "[Markdown with comparison table + sections]",
  "tags": ["product comparison", "dhm comparison"]
}
```

**Reuse Tip:** Highly templatable. Change product names and data, keep section structure.

---

### Pattern 5: FAQ/How-To Guide (1,500-2,500 words)
**Examples:**
- `/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json`
- Implemented in: `/src/components/FAQSection.jsx`

**Structure:**
1. Quick Answer (100-150 words)
   - Direct answer to main question
2. Scientific Evidence (500-800 words)
   - 2-3 research studies cited
   - Evidence timeline
3. Benefits Section (300-400 words)
   - 3-4 benefit subsections
4. Who Should Consider This (300-400 words)
   - Ideal candidates
   - Not ideal for
5. Dosing Protocols (400-600 words)
   - Different protocols for different use cases
6. What to Expect Timeline (300-400 words)
   - Week 1-2
   - Month 1-3
   - Month 3-6
   - Month 6+
7. Safety Considerations (300-400 words)
   - What to monitor
   - Potential concerns
8. Real User Experiences (300-400 words)
   - 2-3 case studies
9. FAQ Section (300-500 words)
   - 5-8 Q&A pairs

**FAQ Schema Format (in component):**
```jsx
const faqData = {
  category: "Safety & Side Effects",
  questions: [
    {
      question: "Is DHM safe for daily use?",
      answer: "Yes, clinical evidence shows DHM is safe for daily use..."
    }
  ]
};
```

**Data Structure:**
```json
{
  "title": "Can You [Do Action]? Complete Guide to [Topic]",
  "readTime": 12,
  "content": "[Markdown sections with FAQ at end]"
}
```

**Reuse Tip:** Perfect template for ANY how-to/safety question. Keep structure, swap details.

---

## Part 2: CTA Patterns & Placement

### CTA Pattern 1: Product Spotlight (Within Content)
**Implementation in Content:**
```markdown
**Product Spotlight: [Product Name]** - [Product description with benefits]

For a detailed comparison with other options, see our comprehensive reviews: [DHM vs XYZ](/blog/slug)
```

**Component Rendering** (from NewBlogPost.jsx):
- Renders as green card with "Featured" badge
- Includes "Learn More" button
- Positioned naturally in content flow

### CTA Pattern 2: Related Links (End of Section)
**Implementation:**
```markdown
[Complete DHM Supplement Guide](/blog/hangover-supplements-complete-guide-what-actually-works-2025)

For dosage recommendations, see our [detailed DHM dosage guide](/blog/dhm-dosage-guide-2025).
```

**Key Pattern:** Always link to:
- Comparison articles
- Detailed guides
- Safety information
- Specific product reviews

### CTA Pattern 3: Info Boxes (Throughout Content)
**Special Rendering (from NewBlogPost.jsx):**

```markdown
**Info Box:** Double Wood DHM is Amazon's #1 Choice with 552+ verified reviews and 4.4-star rating. At just $0.66 per serving, it's the most affordable option.

**Warning:** Always consult healthcare providers before starting supplementation, especially with pre-existing conditions.

**Pro Tip:** Most successful users combine pre-drinking and before-bed dosing for maximum effectiveness.

**Key Insight:** The best hangover prevention is still moderation, hydration, and not drinking on an empty stomach.
```

**Visual Rendering:**
- Info Box → Blue alert with info icon
- Warning → Amber alert with exclamation icon
- Pro Tip → Green alert with checkmark icon
- Key Insight → Purple alert with lightbulb icon

---

## Part 3: Tables & Structured Data

### Table Pattern 1: Product Comparison Table

**Markdown Format:**
```markdown
| Product | Price | Servings | Cost/Serving | DHM per Serving | Value Rating |
|---------|-------|----------|--------------|-----------------|-------------|
| DHM Depot | $39.99 | 30 | $1.33 | 600mg | Excellent |
| Purple Tree | $24.99 | 30 | $0.83 | 300mg | Excellent |
| Flyby | $25.99 | 30 | $0.87 | 300mg | Very Good |
```

**Rendering:** Uses `remark-gfm` plugin for automatic table formatting

### Table Pattern 2: Benefits Timeline Table

```markdown
| Timeline | What Happens | Benefits |
|----------|-------------|----------|
| Week 1-2 | Initial Phase | Better morning recovery, reduced hangover severity |
| Month 1-3 | Adaptation Phase | Consistent liver improvements, better tolerance |
| Month 3-6 | Optimization Phase | Significant health improvements, sustained energy |
| Month 6+ | Maintenance Phase | Continued protection, stable liver function |
```

### Table Pattern 3: Comparison Chart

```markdown
| Factor | Option A | Option B | Option C |
|--------|----------|----------|----------|
| **Cost** | $0.83/serving | $1.33/serving | $2.30/serving |
| **Dosage** | 300mg DHM | 600mg DHM | 450mg DHM |
| **Best For** | Budget users | Maximum effect | Complete formula |
| **Convenience** | Single tablet | Single tablet | 3 capsules |
```

---

## Part 4: FAQ Schema Implementation

### Where FAQs Live

**Two Implementations:**

#### 1. FAQSection Component (Dedicated FAQ Page)
**File:** `/src/components/FAQSection.jsx`
**Features:**
- Accordion format (expand/collapse)
- Categories with color coding
- Schema markup for SEO
- Icons for each category

**Example Categories:**
- Dosage & Timing (Clock icon)
- Effectiveness & Results (Zap icon)
- Safety & Side Effects (Shield icon)
- Product Selection (Activity icon)

#### 2. Embedded FAQ in Blog Post Content
**File:** `/src/newblog/components/NewBlogPost.jsx`
**Implementation:** Last section of any guide
```markdown
## FAQs About [Topic]

### Q: [Question]?
**A:** [Answer based on content above]

### Q: [Question]?
**A:** [Answer]
```

**Schema Generation (automatic in NewBlogPost):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can you take DHM every day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DHM daily use is safe for most people..."
      }
    }
  ]
}
```

### Best Practices for FAQ Content
1. **Keep it scannable** - Short, direct answers
2. **Link to detailed sections** - "See our [dosage guide](/...) for more"
3. **Answer common questions** - Monitor customer reviews for most-asked
4. **Update regularly** - FAQ reflects current product/research updates

---

## Part 5: Key Takeaways & Extraction

### Key Takeaways Section (Special Component)
**File:** `/src/newblog/components/KeyTakeaways.jsx`
**Implementation in Content:**

```markdown
## Key Takeaways

- **Takeaway 1:** [Important point from article]
- **Takeaway 2:** [Important point from article]
- **Takeaway 3:** [Important point from article]
```

**Automatic Extraction (from NewBlogPost.jsx):**
The component automatically detects "Key Takeaways" sections and extracts them for prominent display:
- Filtered for bullet point format
- Strips complex markdown
- Displays in dedicated box
- Links back to full article

**Pattern:** Appears at top of article for quick scanning

---

## Part 6: Data Structure Template

### Complete Post JSON Structure

```json
{
  "id": "post-slug-unique-id",
  "title": "Full Title: Descriptive Subtitle (Year)",
  "slug": "post-slug-unique",
  "excerpt": "160-character summary for search results",
  "metaDescription": "160-char version of excerpt",
  "date": "2025-01-15",
  "author": "DHM Guide Team",
  "readTime": 8,
  "image": "/images/post-slug-hero.webp",
  "tags": [
    "primary topic",
    "secondary topic",
    "product type",
    "health condition"
  ],
  "categories": [
    "Health Science",
    "Product Reviews",
    "How-To Guides"
  ],
  "content": "[Markdown content - see patterns above]",
  "seo": {
    "metaTitle": "Full Title (2025) | Brand Name",
    "metaDescription": "160 character description",
    "keywords": "keyword1, keyword2, keyword3",
    "schema": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Full Title",
      "author": {
        "@type": "Person",
        "name": "DHM Guide Team"
      },
      "datePublished": "2025-01-15",
      "description": "Excerpt text"
    }
  }
}
```

**Minimal Required Fields:**
- id, title, slug, excerpt, content

**Recommended for SEO:**
- metaDescription, image, tags, seo.schema

---

## Part 7: Content Creation Shortcuts

### Shortcut 1: Comparison Article Template
**Time:** 2-3 hours
**Steps:**
1. Choose two products/topics (5 min)
2. Create comparison table (20 min)
3. Fill in 3 detailed sections (1 hr 30 min)
4. Add FAQ (20 min)
5. Format and review (20 min)

### Shortcut 2: Product Review (Single Product)
**Time:** 2-4 hours
**Steps:**
1. Gather 50+ customer reviews (30 min)
2. Extract patterns and themes (30 min)
3. Write customer stories (30 min)
4. Create comparison section (30 min)
5. Add FAQ (30 min)
6. Format and optimize (30 min)

### Shortcut 3: Resource Hub
**Time:** 2-3 hours
**Steps:**
1. List 50+ existing posts by category (1 hr)
2. Write category descriptions (30 min)
3. Format with links (30 min)
4. Add intro/outro (20 min)
5. Review and update (20 min)

### Shortcut 4: FAQ Guide
**Time:** 3-4 hours
**Steps:**
1. Identify 5-8 core questions (30 min)
2. Research answers (1 hr)
3. Write 6 content sections (1.5 hrs)
4. Add case studies (30 min)
5. Format FAQ section (30 min)

---

## Part 8: Component Features for Long-Form Content

### Available Special Components

#### 1. Alert Boxes (Automatic Detection)
```markdown
**Info Box:** Content renders as blue info alert
**Warning:** Content renders as amber warning alert  
**Pro Tip:** Content renders as green tip alert
**Key Insight:** Content renders as purple insight alert
```

#### 2. Product Cards (Automatic Detection)
```markdown
**Product Spotlight: Product Name** - Description of product and benefits
```
Renders as:
- Green bordered card
- "Featured" badge
- "Learn More" button
- Hover shadow effect

#### 3. Key Takeaways (Automatic Extraction)
```markdown
## Key Takeaways

- Point 1
- Point 2
- Point 3
```
Automatically extracted and displayed prominently

#### 4. Tables (Markdown/GFM Format)
Automatic rendering with zebra striping and responsive scrolling on mobile

#### 5. Internal Links (Custom Component)
```markdown
[Post Title](/blog/post-slug)
```
Automatic internal linking with prefetch on hover

---

## Part 9: SEO Elements in Practice

### Title Pattern
**Format:** `[Main Topic]: [Benefit/Angle] 2025`
**Examples:**
- "Alcohol and Heart Health: Complete Cardiovascular Guide (2025)"
- "Double Wood DHM Review: What 552+ Amazon Customers Really Say"
- "Can You Take DHM Every Day? A Guide to Long-Term Use"

### Meta Description Pattern
**Format:** 160 characters, includes primary keyword + benefit
**Example:** "Discover alcohol hypertension blood pressure management 2025 with our comprehensive guide. Expert insights, research-backed recommendations, and practical strategies."

### Schema Markup (Automatic)
- Article schema for all posts
- FAQ schema for FAQ sections
- Breadcrumb schema for navigation

---

## Part 10: Real Examples to Copy

### Example 1: Complete Guide Template
**File to Copy:** `/src/newblog/data/posts/alcohol-and-heart-health-complete-cardiovascular-guide-2025.json`
**Steps:**
1. Copy this file
2. Replace title, slug, date
3. Keep structure, replace section content
4. Update seo.schema with new details
5. Update tags/categories
6. Done!

### Example 2: Product Review Template
**File to Copy:** `/src/newblog/data/posts/double-wood-dhm-review-analysis.json`
**Steps:**
1. Copy this file
2. Research product (reviews, testimonials)
3. Replace product name, pricing, ratings
4. Update customer stories section
5. Update comparison section
6. Keep all section headers and structure
7. Done!

### Example 3: Resource Hub Template
**File to Copy:** `/src/newblog/data/posts/complete-hangover-science-hub-2025.json`
**Steps:**
1. Copy file
2. Update title and slug
3. Identify 50+ related posts
4. Update section categories and links
5. Keep intro/outro format
6. Done!

### Example 4: How-To/FAQ Template
**File to Copy:** `/src/newblog/data/posts/can-you-take-dhm-every-day-long-term-guide-2025.json`
**Steps:**
1. Copy file
2. Replace topic and question
3. Update science/evidence section with new research
4. Update benefits/use cases
5. Update FAQ pairs (keep 5-8 questions)
6. Done!

---

## Part 11: Where Posts Live & How to Add New Ones

### File Location
All blog posts: `/src/newblog/data/posts/`
**Format:** JSON files named `[slug].json`

### How Posts Get Published
1. **JSON file created** in `/src/newblog/data/posts/`
2. **Auto-registered** in `postRegistry.js`
3. **Auto-indexed** in metadata
4. **Auto-routed** at `/blog/[slug]`

### Required Fields for Publication
```json
{
  "id": "unique-id",
  "title": "Title",
  "slug": "url-slug",
  "content": "Markdown content",
  "excerpt": "Short description"
}
```

### Optional but Recommended
- date, author, readTime
- image, tags, categories
- metaDescription, seo.schema

---

## Part 12: Word Count Reference

### Typical Post Lengths

| Type | Word Count | Read Time | Examples |
|------|-----------|-----------|----------|
| Quick Guide | 1,000-2,000 | 3-5 min | Single product reviews |
| Standard Guide | 2,000-4,000 | 5-8 min | How-to guides, FAQs |
| Comprehensive | 4,000-7,000 | 8-12 min | Health topics, large comparisons |
| Resource Hub | 2,000-3,000 | 8 min | Navigation/index pages |

### Your Top Performers
- Complete Hangover Science Hub: ~2,000 words (hub format)
- Alcohol & Heart Health Guide: ~6,887 words
- Hangover Supplements Guide: ~8,000+ words (20 products reviewed)

---

## Summary: 5-Step Content Creation Process

### For Any New Content:

1. **Choose Pattern** (5 min)
   - Comprehensive Guide → 4,000-7,000 words
   - Resource Hub → 2,000-3,000 words
   - Product Review → 2,000-4,000 words
   - Comparison → 1,500-3,000 words
   - How-To/FAQ → 1,500-2,500 words

2. **Copy Template** (5 min)
   - Find example from Part 10
   - Copy the file structure

3. **Fill Content** (2-4 hours)
   - Replace topic-specific content
   - Keep all structure/headings

4. **Add Special Elements** (30 min)
   - Info boxes, tables, internal links
   - Product spotlights, case studies

5. **Format & SEO** (30 min)
   - Update title, slug, excerpt
   - Add seo.schema
   - Set date, author, readTime

**Total Time:** 3-5 hours per article vs. 6-8 hours from scratch = 40-60% faster

