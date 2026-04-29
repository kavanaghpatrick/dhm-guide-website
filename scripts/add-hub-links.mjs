#!/usr/bin/env node
/**
 * add-hub-links.mjs
 * Appends "Continue Your Research" footer to every blog post's content field.
 * Idempotent: skips on sentinel comment OR heading substring match.
 *
 * Usage:
 *   node scripts/add-hub-links.mjs              # live run (default)
 *   node scripts/add-hub-links.mjs --dry-run    # print diff for first 3 + counts; write nothing
 *
 * Spec: specs/issue-246-hub-footer/
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = 'src/newblog/data/posts';
const SENTINEL = '<!-- hub-footer:auto -->';
const HEADING = '## Continue Your Research';

const FOOTER = `

---

${SENTINEL}
${HEADING}

- **[Complete DHM Guide →](/guide)** - Dosage, timing, and how DHM works
- **[Compare Supplements →](/compare)** - Side-by-side product comparison
- **[Product Reviews →](/reviews)** - In-depth reviews of 7 tested supplements
- **[Clinical Research →](/research)** - 11 peer-reviewed DHM studies
`;

const isDryRun = process.argv.includes('--dry-run');

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
const counts = { updated: 0, skippedHasFooter: 0, skippedNoContent: 0, samples: [] };

for (const file of files) {
  const filePath = join(POSTS_DIR, file);
  const raw = readFileSync(filePath, 'utf8');
  const post = JSON.parse(raw);

  if (typeof post.content !== 'string' || post.content.length === 0) {
    counts.skippedNoContent++;
    continue;
  }

  if (post.content.includes(SENTINEL) || post.content.includes(HEADING)) {
    counts.skippedHasFooter++;
    continue;
  }

  post.content = post.content.trimEnd() + FOOTER;

  if (isDryRun) {
    if (counts.samples.length < 3) {
      counts.samples.push({ file, beforeTail: raw.slice(-150) });
    }
  } else {
    // No trailing newline (matches existing 197 files; minimizes diff churn)
    writeFileSync(filePath, JSON.stringify(post, null, 2));
  }
  counts.updated++;
}

console.log(`${isDryRun ? '[dry-run] ' : ''}Done: ${counts.updated} updated, ${counts.skippedHasFooter} skipped (had footer), ${counts.skippedNoContent} skipped (no content)`);

if (isDryRun && counts.samples.length) {
  console.log('\nFirst 3 sample diffs (tail of original content):');
  for (const s of counts.samples) {
    console.log(`\n  ${s.file}:`);
    console.log(`    before tail: ...${s.beforeTail.slice(-80).replace(/\n/g, '\\n')}`);
    console.log(`    after: ...trimEnd() + FOOTER block (${FOOTER.length} chars)`);
  }
}

process.exit(0);
