#!/usr/bin/env node
/**
 * posts-faq-backfill.mjs
 *
 * Backfills `faq` field on blog post JSON files by auto-extracting Q&A pairs
 * from `## Frequently Asked Questions` / `## FAQ` markdown sections.
 *
 * The prerender script (scripts/prerender-blog-posts-enhanced.js) emits
 * FAQPage JSON-LD when post.faq is present. Populating this field auto-enables
 * rich result eligibility — no code changes required.
 *
 * Usage:
 *   node scripts/posts-faq-backfill.mjs            # dry-run
 *   node scripts/posts-faq-backfill.mjs --apply    # write changes
 *
 * Idempotent: skips posts that already have a non-empty `faq` array.
 *
 * Refs: #289, #283
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPLY = process.argv.includes('--apply');
const POSTS_DIR = path.resolve(__dirname, '..', 'src', 'newblog', 'data', 'posts');

// Match `## Frequently Asked Questions...` or `## FAQ...` / `## FAQs...`
// allowing trailing text on the heading line (e.g. "## FAQs About Wine Hangovers").
const FAQ_HEADING_RE = /(^|\n)##\s+(Frequently Asked Questions|FAQs?)\b[^\n]*\n/i;
const NEXT_H2_RE = /\n##\s+\S/;

/**
 * Extract section between FAQ heading and the next H2.
 */
function extractFaqSection(content) {
  const match = FAQ_HEADING_RE.exec(content);
  if (!match) return null;
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = NEXT_H2_RE.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/**
 * Strip surrounding markdown emphasis from a string.
 */
function stripMd(s) {
  return s
    .replace(/^\s*\*\*\s*/, '')
    .replace(/\s*\*\*\s*$/, '')
    .replace(/^\s*\*\s*/, '')
    .replace(/\s*\*\s*$/, '')
    .trim();
}

/**
 * Collapse whitespace and trim.
 */
function clean(s) {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Strip leading "Q:" / "Question:" prefix from a question.
 */
function stripQuestionPrefix(s) {
  return s.replace(/^\s*(Q\s*[:.]|Question\s*[:.])\s*/i, '').trim();
}

/**
 * Strip leading "A:" / "**A:**" / "Answer:" prefix from an answer.
 */
function stripAnswerPrefix(s) {
  return s
    .replace(/^\s*(\*\*A\s*[:.]\*\*|A\s*[:.]|Answer\s*[:.])\s*/i, '')
    .trim();
}

/**
 * Pattern A: H3-style questions
 *   ### question?
 *   answer paragraph(s)
 */
function extractH3QA(section) {
  const blocks = section.split(/\n###\s+/);
  // first chunk is preamble before first ### — discard
  if (blocks.length < 2) return [];
  const pairs = [];
  for (let i = 1; i < blocks.length; i++) {
    const chunk = blocks[i];
    const nlIdx = chunk.indexOf('\n');
    if (nlIdx === -1) continue;
    const question = clean(stripQuestionPrefix(stripMd(chunk.slice(0, nlIdx))));
    const answerRaw = chunk.slice(nlIdx + 1).trim();
    if (!question) continue;
    if (!answerRaw) continue;
    const answer = clean(stripAnswerPrefix(answerRaw));
    if (!answer) continue;
    pairs.push({ question, answer });
  }
  return pairs;
}

/**
 * Pattern B: Bold Q/A
 *   **Q: question?**
 *   A: answer
 */
function extractBoldQA(section) {
  // Split on the bold-Q markers; keep content between consecutive markers.
  const re = /\*\*Q:\s*([\s\S]+?)\*\*\s*\n+A:\s*([\s\S]+?)(?=\n\s*\n\*\*Q:|\s*$)/g;
  const pairs = [];
  let m;
  while ((m = re.exec(section)) !== null) {
    const question = clean(m[1]);
    const answer = clean(m[2]);
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs;
}

/**
 * Pattern C: Bold-question (no Q: prefix), answer below.
 *   **How long does a hangover last?**
 *   answer paragraph...
 *
 *   **Next question?**
 *   answer paragraph...
 */
function extractBoldQuestionQA(section) {
  // Match **question?** newline then answer up to next **question or section end.
  // Question must end with `?` to avoid false positives on ordinary bold spans.
  const re = /\*\*([^*\n][^*\n]*\?)\*\*\s*\n+([\s\S]+?)(?=\n\s*\n\*\*[^*\n]+\?\*\*|\s*$)/g;
  const pairs = [];
  let m;
  while ((m = re.exec(section)) !== null) {
    const question = clean(m[1]);
    const answer = clean(m[2]);
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs;
}

/**
 * Try each parser in order; return first non-trivial result.
 */
function parseFaqSection(section) {
  const h3 = extractH3QA(section);
  if (h3.length >= 2) return { pairs: h3, format: 'h3' };
  const bq = extractBoldQA(section);
  if (bq.length >= 2) return { pairs: bq, format: 'bold-q' };
  const bqq = extractBoldQuestionQA(section);
  if (bqq.length >= 2) return { pairs: bqq, format: 'bold-question' };
  // Fallback: take whichever has more
  const candidates = [
    { pairs: h3, format: 'h3-weak' },
    { pairs: bq, format: 'bold-q-weak' },
    { pairs: bqq, format: 'bold-question-weak' },
  ].filter(c => c.pairs.length >= 1).sort((a, b) => b.pairs.length - a.pairs.length);
  if (candidates.length) return candidates[0];
  return { pairs: [], format: null };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Posts dir not found: ${POSTS_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));

  let scanned = 0;
  let alreadyHasFaq = 0;
  let totalWithFaqMd = 0;
  let candidates = 0;
  let backfilled = 0;
  let skippedNoParse = 0;
  const skippedDetails = [];
  const backfilledDetails = [];

  for (const f of files) {
    scanned++;
    const filePath = path.join(POSTS_DIR, f);
    const raw = fs.readFileSync(filePath, 'utf8');
    let post;
    try {
      post = JSON.parse(raw);
    } catch (e) {
      console.warn(`SKIP (parse error): ${f} — ${e.message}`);
      continue;
    }

    const content = post.content || '';
    const hasMd = !!extractFaqSection(content);
    if (hasMd) totalWithFaqMd++;

    if (Array.isArray(post.faq) && post.faq.length > 0) {
      alreadyHasFaq++;
      continue;
    }

    const section = extractFaqSection(content);
    if (!section) continue;
    candidates++;

    const { pairs, format } = parseFaqSection(section);
    if (!pairs || pairs.length < 2) {
      skippedNoParse++;
      skippedDetails.push({ file: f, reason: 'no-parseable-pairs', count: pairs?.length || 0 });
      continue;
    }

    // Cap absurdly long answers (defensive — schema validators dislike very long answers)
    const trimmed = pairs.map(p => ({
      question: p.question.length > 300 ? p.question.slice(0, 297) + '…' : p.question,
      answer: p.answer.length > 1500 ? p.answer.slice(0, 1497) + '…' : p.answer,
    }));

    backfilled++;
    backfilledDetails.push({ file: f, format, count: trimmed.length });

    if (APPLY) {
      // Insert faq field. Place it after content/image to match convention seen
      // in dhm-dosage-guide-2025 etc., but stable JSON.stringify won't reorder
      // existing keys — we just set it on the object.
      post.faq = trimmed;
      const out = JSON.stringify(post, null, 2) + '\n';
      fs.writeFileSync(filePath, out, 'utf8');
    }
  }

  console.log('—'.repeat(60));
  console.log(`Mode:                       ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Posts scanned:              ${scanned}`);
  console.log(`Posts already has faq:      ${alreadyHasFaq}`);
  console.log(`Posts with FAQ markdown:    ${totalWithFaqMd}`);
  console.log(`Backfill candidates:        ${candidates}`);
  console.log(`Posts backfilled:           ${backfilled}`);
  console.log(`Posts skipped (no parse):   ${skippedNoParse}`);
  console.log('—'.repeat(60));
  if (backfilledDetails.length) {
    console.log('\nBackfilled (sample):');
    for (const b of backfilledDetails.slice(0, 10)) {
      console.log(`  ${b.file.padEnd(60)}  ${b.format.padEnd(10)} ${b.count} pairs`);
    }
    if (backfilledDetails.length > 10) {
      console.log(`  ... +${backfilledDetails.length - 10} more`);
    }
  }
  if (skippedDetails.length) {
    console.log('\nSkipped:');
    for (const s of skippedDetails) {
      console.log(`  ${s.file}  (${s.reason}, ${s.count} pairs found)`);
    }
  }
  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write changes.');
  }
}

main();
