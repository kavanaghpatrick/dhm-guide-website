# Design — Issue #289: FAQ schema backfill

## Script: `scripts/posts-faq-backfill.mjs`

```
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const POSTS_DIR = 'src/newblog/data/posts';

// 1. List *.json
// 2. For each: read, parse
// 3. Skip if Array.isArray(post.faq) && post.faq.length > 0
// 4. Locate FAQ section (regex: /(^|\n)##\s+(Frequently Asked Questions|FAQ)\s*\n/i)
// 5. Slice to next ##
// 6. Try parsers in order:
//    a) extractH3QA(section) — split on /(?:^|\n)###\s+/
//    b) extractBoldQA(section) — split on /(?:^|\n)\*\*Q:\s+/
// 7. Filter pairs missing question or answer
// 8. If pairs.length >= 2, set post.faq = pairs
// 9. If APPLY: write file with stringify(post, null, 2) + '\n'; else log diff
// 10. Tally totals
```

## Parser details

### H3 parser
- Split section on `\n### `
- Each chunk: first line up to `\n` is question; rest is answer
- Drop if question doesn't end with `?` (lenient: also accept any non-empty)
- Strip markdown bold/italic markers from answer; trim trailing whitespace before next H3

### Bold-Q parser
- Match repeating blocks: `\*\*Q:\s+(.+?)\*\*\s*\n+A:\s+(.+?)(?=\n\n\*\*Q:|$)`
- DOTALL flag, non-greedy, anchored to next `**Q:` or section end

## Output format
```
Posts scanned: 189
Posts already has faq: 10
Posts with FAQ md: 73
Posts backfilled: N
Posts skipped (no parseable Q&A): M
```

## Validation
After `--apply`:
1. Spot-check 3 backfilled posts via `node -e` jq-equivalent
2. Run `npm run build`
3. `grep -c FAQPage dist/never-hungover/<slug>/index.html` for one backfilled slug
