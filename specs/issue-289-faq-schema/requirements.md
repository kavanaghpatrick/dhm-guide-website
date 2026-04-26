# Requirements — Issue #289: FAQ schema backfill

## Functional
1. Auto-extract Q&A pairs from `## Frequently Asked Questions` / `## FAQ` markdown sections in 65 candidate posts.
2. Write extracted pairs as `[{question, answer}]` to `post.faq` field.
3. Skip posts that already have a non-empty `faq` field.
4. Skip questions without a clear answer paragraph.

## Tolerance for FAQ formats
- `### question?` followed by answer paragraph
- `**Q: question?**` followed by `A: answer`
- Mixed/uncertain → skip the entry, keep going

## Non-functional
- Idempotent: re-running produces no diff
- Dry-run by default; `--apply` writes changes
- Each post writes back with same JSON formatting (`JSON.stringify(post, null, 2) + '\n'`)
- After backfill, `npm run build` must succeed and emit FAQPage JSON-LD on backfilled posts

## Coverage target
- Before: 10/189 (5.3%)
- After: ~70/189 (~37%)
