#!/usr/bin/env node
/**
 * Issue #294 — Backfill inline PubMed citations on top 30 traffic posts.
 *
 * Reads a curated phrase->PMC map from scripts/pubmed-citation-map.json and
 * substitutes 5–8 generic study mentions per post with markdown links to PMC.
 *
 * Usage:
 *   node scripts/posts-pubmed-citation-backfill.mjs           # dry-run
 *   node scripts/posts-pubmed-citation-backfill.mjs --apply   # write changes
 *
 * Conservative rules:
 * - Skip phrases already inside a markdown link
 * - Skip code blocks (between ``` fences)
 * - Skip headings (lines starting with #)
 * - Skip reference-list lines (line is `N. [http...](http...)` or just `[http...](http...)`)
 * - Cap at 8 substitutions per post
 * - Honor `first_only` and `requires_context` guards from the map
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(REPO_ROOT, 'src/newblog/data/posts');
const MAP_PATH = path.join(REPO_ROOT, 'scripts/pubmed-citation-map.json');
const MAX_SUBS_PER_POST = 8;

const APPLY = process.argv.includes('--apply');

// Top 30 posts (file basenames without .json) — derived from PostHog top 30 URLs
// Note: dhm-randomized-controlled-trials-2024 URL maps to dhm-randomized-controlled-trials.json file
const TOP_30_FILES = [
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
  'double-wood-vs-toniiq-ease-dhm-comparison-2025',
  'dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025',
  'peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025',
  'fuller-health-after-party-review-2025',
  'double-wood-vs-no-days-wasted-dhm-comparison-2025',
  'good-morning-hangover-pills-review-2025',
  'double-wood-vs-cheers-restore-dhm-comparison-2025',
  'natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025',
  'flyby-vs-no-days-wasted-complete-comparison-2025',
  'toniiq-ease-dhm-review-analysis',
  'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025',
  'no-days-wasted-vs-dhm1000-comparison-2025',
  'alcohol-protein-synthesis-muscle-recovery-impact-guide-2025',
  'no-days-wasted-vs-fuller-health-after-party-comparison-2025',
  'how-long-does-hangover-last',
];

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a list of [start, end) ranges to SKIP within content:
 *  - inside ``` code fences (entire fenced region)
 *  - inside lines starting with # (headings)
 *  - inside lines that are pure reference-list entries:
 *      e.g. `1. [https://...](https://...)`
 *      or just `[https://...](https://...)`
 *      or `1. [http...]: ...`
 *  - inside an existing markdown link `[...](...)` (text part)
 */
function buildSkipRanges(content) {
  const ranges = [];

  // 1. Code fences (greedy, multi-line). Tolerate ``` and ~~~.
  const fenceRe = /(^|\n)(```|~~~)[\s\S]*?\n\2/g;
  let m;
  while ((m = fenceRe.exec(content)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // 2. Headings — full line including newline
  const headingRe = /(^|\n)#{1,6}[ \t][^\n]*/g;
  while ((m = headingRe.exec(content)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // 3. Reference list lines — line that is essentially just a markdown URL link,
  //    optionally numbered.
  const refLineRe = /(^|\n)[ \t]*(\d+\.?\s*)?\[https?:\/\/[^\]]+\]\(https?:\/\/[^\)]+\)[ \t]*(?=\n|$)/g;
  while ((m = refLineRe.exec(content)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // 4. Inside the link-text portion of any existing markdown link `[...](...)`.
  //    Only the [...] text is forbidden (we don't want to substitute inside an
  //    existing anchor's display text). The (...) URL portion is also forbidden.
  const mdLinkRe = /\[[^\]]*\]\([^)]*\)/g;
  while ((m = mdLinkRe.exec(content)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // Sort and merge
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    if (merged.length && r[0] <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
    } else {
      merged.push([...r]);
    }
  }
  return merged;
}

function inAnyRange(pos, ranges) {
  // Binary search would be faster, but ranges are small enough
  for (const [s, e] of ranges) {
    if (pos >= s && pos < e) return true;
    if (pos < s) return false;
  }
  return false;
}

/**
 * Process a single post's content. Returns {newContent, subs} where subs is
 * an array of {phrase, pmcid} actually applied.
 */
function processPost(content, mappings) {
  const subs = [];
  const usedPhrasesLower = new Set();

  // We'll repeatedly recompute skip ranges after each successful substitution
  // because the inserted markdown link adds to the "no-touch" zone.
  for (const mapping of mappings) {
    if (subs.length >= MAX_SUBS_PER_POST) break;

    const phraseLower = mapping.phrase.toLowerCase();

    // first_only honored at the per-post-phrase level (we already only
    // substitute the FIRST occurrence per mapping anyway).
    if (usedPhrasesLower.has(phraseLower)) continue;

    // Build word-boundary regex. Use \b but also allow leading/trailing
    // punctuation tolerantly.
    const re = new RegExp(`\\b${escRegex(mapping.phrase)}\\b`, 'gi');
    const skipRanges = buildSkipRanges(content);

    let firstMatch = null;
    let testM;
    re.lastIndex = 0;
    while ((testM = re.exec(content)) !== null) {
      const startIdx = testM.index;
      // Skip if any character of the match falls in a skip range
      let inSkip = false;
      for (let i = startIdx; i < startIdx + testM[0].length; i += 1) {
        if (inAnyRange(i, skipRanges)) {
          inSkip = true;
          break;
        }
      }
      if (inSkip) continue;

      // Context guard: if requires_context, check ±400 chars around match
      if (mapping.requires_context && mapping.requires_context.length > 0) {
        const ctxStart = Math.max(0, startIdx - 400);
        const ctxEnd = Math.min(content.length, startIdx + testM[0].length + 400);
        const ctx = content.slice(ctxStart, ctxEnd).toLowerCase();
        const ok = mapping.requires_context.some((kw) => ctx.includes(kw.toLowerCase()));
        if (!ok) continue;
      }

      firstMatch = testM;
      break;
    }

    if (!firstMatch) continue;

    const matchedText = firstMatch[0]; // preserve original case
    const url = `https://pmc.ncbi.nlm.nih.gov/articles/${mapping.pmcid}/`;
    const replacement = `[${matchedText}](${url})`;

    content = content.slice(0, firstMatch.index) + replacement + content.slice(firstMatch.index + matchedText.length);

    subs.push({ phrase: mapping.phrase, matched: matchedText, pmcid: mapping.pmcid });
    usedPhrasesLower.add(phraseLower);
  }

  return { newContent: content, subs };
}

function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error(`ERROR: map not found: ${MAP_PATH}`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const mappings = map.mappings;

  console.log(`Mode: ${APPLY ? 'APPLY (writing files)' : 'DRY-RUN (no writes)'}`);
  console.log(`Loaded ${mappings.length} phrase→PMC mappings`);
  console.log(`Processing ${TOP_30_FILES.length} top-traffic posts\n`);

  const summary = [];
  let totalSubs = 0;
  let postsWithSubs = 0;

  for (const slug of TOP_30_FILES) {
    const filePath = path.join(POSTS_DIR, `${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  SKIP (file missing): ${slug}`);
      summary.push({ slug, subs: 0, status: 'missing' });
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error(`  ERROR (parse): ${slug}: ${e.message}`);
      summary.push({ slug, subs: 0, status: 'parse-error' });
      continue;
    }
    const original = data.content || '';
    if (!original) {
      summary.push({ slug, subs: 0, status: 'no-content' });
      continue;
    }

    const { newContent, subs } = processPost(original, mappings);

    summary.push({ slug, subs: subs.length, status: 'ok', details: subs });
    totalSubs += subs.length;
    if (subs.length > 0) postsWithSubs += 1;

    if (subs.length === 0) {
      console.log(`  ${slug.padEnd(70)} 0 subs`);
      continue;
    }

    console.log(`  ${slug.padEnd(70)} ${subs.length} subs`);
    for (const s of subs) {
      console.log(`     - "${s.matched}" -> ${s.pmcid}`);
    }

    if (APPLY && newContent !== original) {
      data.content = newContent;
      // Preserve formatting: 2-space indent, no trailing newline added by JSON.stringify
      // Match repository convention from existing posts.
      const out = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(filePath, out, 'utf8');
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total substitutions: ${totalSubs}`);
  console.log(`Posts with substitutions: ${postsWithSubs}/${TOP_30_FILES.length}`);
  console.log(`Posts with 0 subs: ${TOP_30_FILES.length - postsWithSubs}`);
  if (postsWithSubs > 0) {
    console.log(`Avg subs per active post: ${(totalSubs / postsWithSubs).toFixed(2)}`);
  }
  if (!APPLY) {
    console.log('\n(dry-run only — re-run with --apply to write changes)');
  }
}

main();
