#!/usr/bin/env node
/**
 * Issue #292 — Quick Answer backfill for top 30 traffic posts.
 *
 * Strategy: derive `quickAnswer` from each post's existing `excerpt`
 * (the human-written 1-2 sentence summary already on every post).
 * Trim to <=200 chars, ensure terminal punctuation. Skip posts that
 * already have `quickAnswer` set, and skip the dosage guide which uses
 * an in-markdown Quick Answer pattern.
 *
 * Usage:
 *   node scripts/posts-quick-answer-backfill.mjs            # dry run
 *   node scripts/posts-quick-answer-backfill.mjs --apply    # write changes
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'newblog', 'data', 'posts');

// Top 30 by PostHog pageviews (last 30d as of 2026-04-26).
const TOP_30_SLUGS = [
  'dhm-dosage-guide-2025',
  'hangover-supplements-complete-guide-what-actually-works-2025',
  'dhm-randomized-controlled-trials',
  'flyby-vs-cheers-complete-comparison-2025',
  'when-to-take-dhm-timing-guide-2025',
  'complete-guide-asian-flush-comprehensive',
  'dhm-vs-zbiotics',
  'nac-vs-dhm-which-antioxidant-better-liver-protection-2025',
  'dhm1000-review-2025',
  'flyby-vs-good-morning-pills-complete-comparison-2025',
  'flyby-recovery-review-2025',
  'dhm-depot-review-2025',
  'can-you-take-dhm-every-day-long-term-guide-2025',
  'dhm-vs-prickly-pear-hangovers',
  'italian-drinking-culture-guide',
  'peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025',
  'dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025',
  'double-wood-vs-toniiq-ease-dhm-comparison-2025',
  'fuller-health-after-party-review-2025',
  'double-wood-vs-no-days-wasted-dhm-comparison-2025',
  'good-morning-hangover-pills-review-2025',
  'double-wood-vs-cheers-restore-dhm-comparison-2025',
  'natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025',
  'flyby-vs-no-days-wasted-complete-comparison-2025',
  'toniiq-ease-dhm-review-analysis',
  'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025',
  'no-days-wasted-vs-dhm1000-comparison-2025',
  'no-days-wasted-vs-fuller-health-after-party-comparison-2025',
  'alcohol-protein-synthesis-muscle-recovery-impact-guide-2025',
  'how-long-does-hangover-last',
];

// Skip the dosage guide — it has an in-markdown Quick Answers section
// (## Quick Answers to Your DHM Dosage Questions) and rendering a second
// callout above it would be duplicative.
const SKIP_SLUGS = new Set(['dhm-dosage-guide-2025']);

const MAX_LEN = 200;

/** Strip markdown emphasis/links from a chunk so the callout renders as plain prose. */
function stripMarkdown(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\s+/g, ' ')
    .trim();
}

/** Return the first non-heading paragraph from the markdown content. */
function firstParagraph(content) {
  if (typeof content !== 'string') return '';
  const paragraphs = content.split(/\n\s*\n/);
  for (const p of paragraphs) {
    const cleaned = p.trim();
    if (!cleaned) continue;
    if (cleaned.startsWith('#')) continue; // skip H1/H2/H3 lines
    if (cleaned.startsWith('|')) continue; // skip tables
    if (cleaned.startsWith('-') || cleaned.startsWith('*')) continue; // skip lists
    return stripMarkdown(cleaned);
  }
  return '';
}

/** Trim to <= MAX_LEN at a sentence boundary if possible. */
function trimToLimit(text) {
  if (text.length <= MAX_LEN) return text;
  // Try to cut at last sentence ending within limit.
  const window = text.slice(0, MAX_LEN);
  const lastStop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (lastStop > MAX_LEN * 0.5) {
    return window.slice(0, lastStop + 1);
  }
  // Fallback: cut at last word boundary.
  const lastSpace = window.lastIndexOf(' ');
  return window.slice(0, lastSpace > 0 ? lastSpace : MAX_LEN).replace(/[,;:]$/, '') + '.';
}

function ensureTerminalPunct(text) {
  if (/[.!?]$/.test(text)) return text;
  return text + '.';
}

function deriveQuickAnswer(post) {
  const candidates = [post.excerpt, firstParagraph(typeof post.content === 'string' ? post.content : '')];
  for (const c of candidates) {
    if (typeof c !== 'string') continue;
    const stripped = stripMarkdown(c);
    if (stripped.length < 30) continue;
    return ensureTerminalPunct(trimToLimit(stripped));
  }
  return null;
}

function main() {
  const apply = process.argv.includes('--apply');
  const results = { updated: [], skippedExisting: [], skippedConfig: [], missing: [], failed: [] };

  for (const slug of TOP_30_SLUGS) {
    if (SKIP_SLUGS.has(slug)) {
      results.skippedConfig.push(slug);
      continue;
    }
    const file = path.join(POSTS_DIR, `${slug}.json`);
    if (!fs.existsSync(file)) {
      results.missing.push(slug);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    let post;
    try {
      post = JSON.parse(raw);
    } catch (e) {
      results.failed.push({ slug, error: e.message });
      continue;
    }
    if (typeof post.quickAnswer === 'string' && post.quickAnswer.trim().length > 0) {
      results.skippedExisting.push(slug);
      continue;
    }
    const qa = deriveQuickAnswer(post);
    if (!qa) {
      results.failed.push({ slug, error: 'no usable excerpt or first paragraph' });
      continue;
    }

    // Insert quickAnswer right after excerpt for readability in JSON.
    // Rebuild ordered object so the field has a predictable position.
    const ordered = {};
    let inserted = false;
    for (const [k, v] of Object.entries(post)) {
      ordered[k] = v;
      if (k === 'excerpt' && !inserted) {
        ordered.quickAnswer = qa;
        inserted = true;
      }
    }
    if (!inserted) {
      ordered.quickAnswer = qa;
    }

    if (apply) {
      // Preserve trailing newline if original had one.
      const trailing = raw.endsWith('\n') ? '\n' : '';
      fs.writeFileSync(file, JSON.stringify(ordered, null, 2) + trailing, 'utf8');
    }
    results.updated.push({ slug, quickAnswer: qa });
  }

  console.log(`\n=== Quick Answer Backfill — ${apply ? 'APPLY' : 'DRY RUN'} ===\n`);
  console.log(`Updated:           ${results.updated.length}`);
  console.log(`Skipped (existing): ${results.skippedExisting.length}`);
  console.log(`Skipped (config):   ${results.skippedConfig.length} -> ${results.skippedConfig.join(', ')}`);
  console.log(`Missing:            ${results.missing.length}${results.missing.length ? ' -> ' + results.missing.join(', ') : ''}`);
  console.log(`Failed:             ${results.failed.length}`);
  if (results.failed.length) {
    for (const f of results.failed) console.log(`  - ${f.slug}: ${f.error}`);
  }
  console.log('\n--- Sample previews ---');
  for (const u of results.updated.slice(0, 5)) {
    console.log(`\n[${u.slug}]`);
    console.log(`  ${u.quickAnswer}`);
  }
  if (!apply) {
    console.log('\n(dry run — pass --apply to write changes)');
  }
}

main();
