# Blog Post Creation Template

Use this template to create new blog posts efficiently.

## JSON Structure Template

```json
{
  "id": "post-slug-2025",
  "slug": "post-slug-2025",
  "title": "Main Topic: Specific Focus Area for 2025",
  "excerpt": "Brief teaser (50-300 chars). Lead with value proposition. Example: Discover science-backed strategies to improve [outcome]. Learn from [authority source].",
  "metaDescription": "Primary keyword + benefit. Secondary keyword mentioned. Call to action or value prop. Keep 120-160 chars EXACTLY.",
  "date": "2025-11-09",
  "author": "DHM Guide Team",
  "tags": [
    "primary-keyword",
    "secondary-keyword", 
    "related-topic",
    "health-category"
  ],
  "image": {
    "src": "/images/post-slug-hero.webp",
    "alt": "Descriptive alt text that includes main topic and key concept"
  },
  "readTime": 8,
  "content": "# Full markdown content here (see structure below)"
}
```

## Content Structure Template

### Recommended Flow:

```markdown
[OPENING HOOK - 1-2 paragraphs]
- Address pain point or question
- Preview solution/answer
- State value to reader

## Overview/Quick Facts
[Key statistics or summary box]

## The Problem (What/Why)
### Subheading 1
Content explaining the issue...

### Subheading 2  
More context...

## The Science/Mechanism
### How [Topic] Works
Detailed explanation...

### Research Evidence
- Cite studies
- Share statistics
- Reference experts

## Solutions/Strategies
### Strategy 1: [Specific Approach]
Detailed steps...

### Strategy 2: [Alternative Approach]
When to use this...

### Strategy 3: [Third Option]
Best for which audience...

## Real-World Application
### Scenario 1
Practical example...

### Scenario 2
Another use case...

## Special Considerations
**Info Box:** Additional context or interesting fact

**Warning:** Important caution or disclaimer

**Pro Tip:** Actionable advice

**Key Insight:** Surprising finding or main takeaway

## Product Recommendations (if applicable)
**Product Spotlight: Product Name** - Key benefit and why it's recommended

## Common Questions

### Question 1?
Brief, direct answer...

### Question 2?
Another answer...

## Comparison Table (if applicable)
| Aspect | Option A | Option B | Option C |
| --- | --- | --- | --- |
| Feature 1 | Value | Value | Value |
| Feature 2 | Value | Value | Value |
| Cost | $X | $Y | $Z |

## Key Takeaways
- Takeaway 1 about main benefit
- Takeaway 2 about practical application
- Takeaway 3 about next steps
- Takeaway 4 about expected outcome

## Conclusion/Next Steps
[Summary paragraph]

[Internal links to related posts]

---

*Disclaimer statement if needed*

**Sources**: List 2-3 key references or studies cited
```

## Special Markdown Patterns

### Alert Boxes (Auto-Rendered)

```markdown
**Info Box:** Interesting fact or additional context that enhances understanding
```

```markdown
**Warning:** Important caution, safety concern, or something to avoid
```

```markdown
**Pro Tip:** Actionable advice that provides immediate value to reader
```

```markdown
**Key Insight:** Surprising discovery or main takeaway from research
```

### Product Cards

```markdown
**Product Spotlight: DHM Depot** - High-potency DHM with 300mg per capsule, trusted by 1000+ users
```

### Tables

```markdown
| Feature | Product A | Product B | Product C |
| --- | --- | --- | --- |
| DHM Content | 300mg | 500mg | 1000mg |
| Price | $19.95 | $29.95 | $47.00 |
| Best For | Value | Mid-Range | Premium |
| Rating | 4.4★ | 4.3★ | 4.2★ |
```

### Internal Links

```markdown
For detailed dosing guidance, see our [DHM dosage guide](/never-hungover/dhm-dosage-guide-2025)

For more on this topic: [complete DHM science explained](/never-hungover/dhm-science-explained)
```

## Metadata Guidelines

### Title Rules:
- Include primary keyword (naturally)
- 50-60 characters ideal for desktop
- Make it compelling (high CTR)
- Include benefit/outcome if possible
- Example: "DHM Science Explained: How Prevention Works at the Molecular Level"

### Meta Description Rules:
- EXACTLY 120-160 characters
- Include primary + secondary keywords
- Begin with most important info
- Make user want to click
- Example: "How DHM prevents hangovers: GABA receptor protection, liver enzyme enhancement, acetaldehyde reduction. Scientific evidence explained."

### Excerpt Rules:
- 50-300 characters
- Lead with value proposition
- Include searchable keyword
- Make readers want full article
- Example: "Learn the science behind DHM's effectiveness. Understand how dihydromyricetin prevents hangovers through dual pathways. Research-backed insights."

### Tags Rules:
- Minimum 3 tags
- Include primary keyword as first tag
- Add secondary topics
- Use lowercase, hyphenated format
- Example: ["dhm-science", "hangover-prevention", "alcohol-research", "supplement-guide"]

## Checklist Before Publishing

- [ ] JSON validates against schema
- [ ] Slug is lowercase with hyphens only
- [ ] Title is 10-200 characters
- [ ] Meta description is 120-160 characters exactly
- [ ] Excerpt is 50-300 characters
- [ ] Date is in ISO format (YYYY-MM-DD)
- [ ] Hero image path is correct (/images/filename.webp)
- [ ] Image alt text is descriptive (10+ chars)
- [ ] Tags: 3+ items, no spaces, lowercase
- [ ] ReadTime is realistic (1-60 minutes)
- [ ] Content is 1000+ words
- [ ] At least 3 H2 headers
- [ ] Key Takeaways section included
- [ ] Internal links to 5+ related posts
- [ ] All markdown renders correctly
- [ ] No broken links
- [ ] Product recommendations are relevant
- [ ] Added to index.js (if new post)
- [ ] FAQ registered in productSchemaGenerator.js (optional)
- [ ] Spell check complete
- [ ] Fact check sources

## FAQ Registration (Optional but Recommended)

If your post answers common questions, register in `/src/utils/productSchemaGenerator.js`:

```javascript
const faqData = {
  'your-post-slug': [
    {
      question: 'What is [main topic]?',
      answer: 'Direct, helpful answer (2-3 sentences)'
    },
    {
      question: 'How does [mechanism] work?',
      answer: 'Clear explanation with key details'
    },
    {
      question: 'Is [product/topic] safe?',
      answer: 'Safety information with nuance'
    },
    {
      question: 'When should I use [solution]?',
      answer: 'Best use cases and timing guidance'
    },
    {
      question: 'How much [product/amount] do I need?',
      answer: 'Dosing or quantity recommendation'
    }
  ]
};
```

## Common Post Types

### Topic Guide (1500-2500 words)
- Overview section
- 4-6 deep-dive sections
- How-to or best practices
- Common questions
- Key takeaways

### Product Review (1200-2000 words)  
- Product spotlight card
- Features/benefits breakdown
- Comparison table with alternatives
- User feedback highlights
- Where to buy section
- FAQ registration recommended

### Comparison Post (1500-2500 words)
- Quick comparison table
- Option 1 detailed analysis
- Option 2 detailed analysis  
- Option 3+ if applicable
- Which is best for different scenarios
- Side-by-side pros/cons

### How-To Guide (1000-1500 words)
- Problem statement
- Step-by-step instructions
- Tips for each step
- Common mistakes to avoid
- Expected results/timeline
- Pro tips section

### Scientific Deep Dive (2000-3000 words)
- Research overview
- Mechanism explanation
- Clinical evidence
- How it works in practice
- Limitations/caveats
- FAQ section
- FAQ registration highly recommended

## Content Length Guidelines

| Type | Minimum | Target | Maximum |
| --- | --- | --- | --- |
| Product Review | 1000 | 1500 | 2500 |
| Comparison | 1500 | 2000 | 2500 |
| How-To | 1000 | 1200 | 1500 |
| Topic Guide | 1500 | 2000 | 3000 |
| Science Deep Dive | 2000 | 2500 | 3000+ |

## SEO Optimization Checklist

- [ ] Primary keyword in title
- [ ] Primary keyword in first 100 words
- [ ] Secondary keywords distributed naturally
- [ ] 1-2% keyword density (not 0%, not 5%)
- [ ] Related post links (5+ internal)
- [ ] External authority links (3+)
- [ ] Unique angle or perspective
- [ ] Better than top 3 results for main keyword
- [ ] Meta description compelling for CTR
- [ ] Headers properly structured (H2-H4)
- [ ] Featured image optimized
- [ ] Read time estimation accurate
- [ ] Mobile-friendly formatting
- [ ] No duplicate content
- [ ] Schema markup included

## Publishing Process

1. **Create file** in `/src/newblog/data/posts/[slug].json`
2. **Add to index.js** with next export number
3. **Verify schema** validates against `/blog-post-schema.json`
4. **Test locally** with `npm run dev`
5. **Verify rendering** of all markdown patterns
6. **Check links** (internal and external)
7. **Register FAQ** if applicable in productSchemaGenerator.js
8. **Commit** with message: "Content: Add [topic] blog post"
9. **Push** to main branch
10. **Verify** prerender in build output
11. **Monitor** Google Search Console for crawling

## Quick Reference: File Paths

```
/src/newblog/data/posts/[slug].json          # Your post file
/src/newblog/data/posts/index.js             # Add export here
/blog-post-schema.json                       # Validates your JSON
/src/utils/productSchemaGenerator.js         # FAQ registration here
/public/images/                              # Store hero images
/src/newblog/components/NewBlogPost.jsx      # Rendering component
```
