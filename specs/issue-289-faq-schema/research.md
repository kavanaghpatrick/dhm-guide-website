# Research — Issue #289: FAQ schema backfill

## Current state
- Total posts: 189
- Posts with `faq` field (emit FAQPage today): 10
- Posts with `## Frequently Asked Questions` markdown: 73
- Posts with both: 8
- **Backfill candidates (markdown but no faq field): 65**

## Schema emission flow
File: `scripts/prerender-blog-posts-enhanced.js` lines 162-190.

Logic:
1. Priority 1: If `post.faq` is a non-empty array, emit FAQPage JSON-LD with `mainEntity` mapping `{question, answer}` pairs.
2. Priority 2: Fall back to hardcoded `generateFAQSchema(post.slug)` from `src/utils/productSchemaGenerator.js` (`faqData` map for ~10 commercial slugs).

So populating `post.faq` on the 65 candidates auto-enables FAQPage emission with no code changes.

## Field shape
`faq: [{question: string, answer: string}, ...]` — confirmed in `dhm-dosage-guide-2025.json`, `flyby-recovery-review-2025.json`, `dhm1000-review-2025.json` etc.

## Markdown formats observed
Two dominant patterns under `## Frequently Asked Questions`:

1. **H3 questions** (e.g. activated-charcoal-hangover):
   ```
   ### Does activated charcoal help hangovers at all?
   No, activated charcoal does not help...
   ### When should I take activated charcoal?
   You shouldn't take...
   ```

2. **Bold Q/A** (e.g. antioxidant-anti-aging, bachelor-bachelorette, british-pub-culture):
   ```
   **Q: Is DHM effective for anti-aging?**
   A: Yes, DHM provides...

   **Q: How does DHM compare to other supplements?**
   A: DHM offers unique advantages...
   ```

Section ends at the next `##` heading or end of content.

## Parser strategy
- Locate `## Frequently Asked Questions` or `## FAQ` heading (anchored at line start)
- Extract substring up to next `^##\s` heading
- Try pattern A: `### question?\n\n(answer paragraph)\n\n` — split on `### `
- Try pattern B: `**Q: question**\n\nA: answer` — split on `**Q:` blocks
- Trim, normalize whitespace, drop entries missing answer

## Constraints
- Idempotent: skip if `post.faq` already set
- Use git as backup (no `.backup` files)
- Preserve JSON formatting (2-space indent, match existing style)
