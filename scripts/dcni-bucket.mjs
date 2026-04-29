#!/usr/bin/env node
/**
 * DCNI Bucketing — issue #365
 *
 * Reads GSC CSV + repo state, emits Save/Merge/Delete/Review decisions per slug.
 * NO MUTATIONS to post JSONs, sitemap, or vercel.json. Pure tooling.
 *
 * Usage:
 *   node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv
 *   node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run
 *   node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --output-dir docs/dcni-2026-04-29
 *
 * Inputs (read-only):
 *   --gsc-csv <path>                      GSC Performance > Pages CSV export (REQUIRED)
 *   --dry-run                             Print summary only; skip file writes
 *   --output-dir <path>                   Override default docs/dcni-2026-04-29/
 *   --threshold-impressions <N>           Override SAVE high-traffic threshold (default 160)
 *   --delete-threshold <N>                Override DELETE max-impression threshold (default 30)
 *   --verbose                             Print per-slug decision trace
 *
 * Outputs (new files only):
 *   <output-dir>/buckets.json             machine-readable
 *   <output-dir>/buckets.md               human-readable
 *   <output-dir>/README.md                deployment-gating warning
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/newblog/data/posts');
const CLUSTER_PATH = path.join(ROOT, 'scripts/cluster-config.json');
const ORPHAN_PATH = path.join(ROOT, 'scripts/orphan-injection-plan.json');

// --- Constants (decision policy) ---

const URL_PREFIX = 'https://www.dhmguide.com/never-hungover/';

const OFF_STRATEGY_PATTERNS = [
  /^alcohol-and-/,
  /^advanced-.*-2025$/,
  /^adaptogenic-/,
  /^quantum-/,
  /^bachelor-bachelorette/,
  /^business-dinner-networking/,
  /^executive-/,
  /^college-student/,
  /^greek-life/,
  /^music-festival/,
  /^social-media-influencer-party/,
  /^pre-game-party/,
  /^study-abroad/,
  /^spring-break/,
  /^(british|french|german|spanish)-(pub-culture|wine-culture|beer-culture|drinking-culture)-guide$/,
];

const EXPLICIT_KEEPS = new Set([
  'italian-drinking-culture-guide', // AC-3.7 allowlist
]);

const KNOWN_MERGE_GROUPS = [
  {
    pattern: /^(british|french|german|spanish)-(pub-culture|wine-culture|beer-culture|drinking-culture)-guide$/,
    mergeTarget: 'italian-drinking-culture-guide',
    reason: 'duplicate-template:cultural-drinking',
  },
];

// --- CLI ---

function parseArgs(argv) {
  const args = {
    gscCsv: null,
    dryRun: false,
    outputDir: null,
    threshold: 160,
    deleteThreshold: 30,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--gsc-csv') args.gscCsv = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--output-dir') args.outputDir = argv[++i];
    else if (a === '--threshold-impressions') args.threshold = parseInt(argv[++i], 10);
    else if (a === '--delete-threshold') args.deleteThreshold = parseInt(argv[++i], 10);
    else if (a === '--verbose') args.verbose = true;
  }
  if (!args.gscCsv) {
    console.error('ERROR: --gsc-csv <path> required');
    console.error('Example: node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run');
    process.exit(1);
  }
  return args;
}

// --- CSV parsing (D1: stdlib quote-aware tokenizer) ---

function tokenizeRow(line) {
  // Quote-aware splitter; tolerates quoted commas
  const out = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (c === ',' && !inQuote) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip BOM
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error(`GSC CSV empty: ${filePath}`);
  }
  const header = tokenizeRow(lines[0]).map((s) => s.trim());
  const expected = ['URL', 'Impressions', 'Clicks', 'CTR', 'Position'];
  for (const col of expected) {
    const alt = col === 'URL' ? 'Top pages' : col;
    if (!header.includes(col) && !header.includes(alt)) {
      throw new Error(`GSC CSV header drift: missing "${col}". Got: ${header.join(', ')}`);
    }
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const t = tokenizeRow(lines[i]);
    rows.push({
      url: (t[0] || '').trim(),
      impressions: parseInt(t[1], 10) || 0,
      clicks: parseInt(t[2], 10) || 0,
      ctr: t[3],
      position: parseFloat(t[4]) || null,
    });
  }
  return rows;
}

// --- Data loaders ---

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.json'));
  const posts = new Map();
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    let post;
    try {
      post = readJSON(path.join(POSTS_DIR, f));
    } catch {
      continue; // skip malformed; future spec covers
    }
    const content = typeof post.content === 'string' ? post.content : '';
    posts.set(slug, {
      slug,
      title: post.title || '',
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      dateModified: post.dateModified || post.date || null,
      tags: post.tags || [],
    });
  }
  return posts;
}

function loadClusterMembers() {
  const cfg = readJSON(CLUSTER_PATH);
  const members = new Map(); // slug -> { cluster, role }
  for (const cluster of cfg.clusters || []) {
    if (cluster.pillar) {
      members.set(cluster.pillar, { cluster: cluster.name, role: 'pillar' });
    }
    for (const spoke of cluster.spokes || []) {
      members.set(spoke, { cluster: cluster.name, role: 'spoke' });
    }
  }
  return members;
}

// --- Inbound link index (D5: O(N) regex pass) ---

function buildInboundIndex(posts) {
  const counts = new Map(); // target slug -> count
  const re = /\(\/never-hungover\/([a-z0-9-]+)\)/g;
  for (const post of posts.values()) {
    let m;
    while ((m = re.exec(post.content)) !== null) {
      const target = m[1];
      if (target === post.slug) continue; // exclude self-references
      counts.set(target, (counts.get(target) || 0) + 1);
    }
  }
  return counts;
}

// --- Git first-commit dates ---

function loadFirstCommitDates(slugs) {
  const dates = new Map();
  for (const slug of slugs) {
    try {
      const out = execSync(
        `git log --diff-filter=A --format=%ai --reverse -- "src/newblog/data/posts/${slug}.json" | head -1`,
        { cwd: ROOT, encoding: 'utf8' }
      ).trim();
      if (out) dates.set(slug, new Date(out));
    } catch {
      // file may be untracked; let age flow as null
    }
  }
  return dates;
}

function ageInDays(date) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

// --- Decision tree (9-step, strict order; first match wins) ---

function decide(ctx) {
  const { slug, gsc, cluster, inboundLinks, age, threshold, deleteThreshold } = ctx;

  // 1. Cluster member → SAVE
  if (cluster) {
    return { bucket: 'save', reason: `cluster-${cluster.role}:${cluster.cluster}` };
  }
  // 2. Italian allowlist → SAVE
  if (EXPLICIT_KEEPS.has(slug)) {
    return { bucket: 'save', reason: 'allowlist:cultural-drinking-canonical' };
  }
  // 3. Known MERGE group sibling → MERGE (excluding the merge target itself)
  for (const grp of KNOWN_MERGE_GROUPS) {
    if (grp.pattern.test(slug) && slug !== grp.mergeTarget) {
      return { bucket: 'merge', reason: grp.reason, mergeTarget: grp.mergeTarget };
    }
  }
  // 4. High traffic → SAVE
  if (gsc && gsc.impressions >= threshold) {
    return { bucket: 'save', reason: `high-traffic:${gsc.impressions}-impressions` };
  }
  // 5. Well-linked → SAVE
  if (inboundLinks >= 3) {
    return { bucket: 'save', reason: `well-linked:${inboundLinks}-inbound-body-links` };
  }
  // 6. Currently ranking → SAVE
  if (gsc && gsc.position !== null && gsc.position <= 50 && gsc.impressions > 0) {
    return { bucket: 'save', reason: `ranking-position:${gsc.position}` };
  }
  // 7. Off-strategy + dead + old → DELETE
  const impressions = gsc ? gsc.impressions : 0;
  const offStrategy = OFF_STRATEGY_PATTERNS.find((p) => p.test(slug));
  if (
    offStrategy &&
    impressions <= deleteThreshold &&
    inboundLinks === 0 &&
    age !== null &&
    age > 90
  ) {
    return {
      bucket: 'delete',
      reason: `off-strategy:${offStrategy.source}+no-traffic+no-links+age-${age}d`,
    };
  }
  // 8. Off-strategy but ambiguous → REVIEW
  if (offStrategy) {
    return {
      bucket: 'review',
      reason: `borderline-off-strategy:${offStrategy.source}`,
      flags: [
        `pattern:${offStrategy.source}`,
        `impressions:${impressions}`,
        `age:${age === null ? 'null' : age + 'd'}`,
      ],
    };
  }
  // 9. Catch-all → REVIEW
  return {
    bucket: 'review',
    reason: 'borderline:no-clear-signal',
    flags: [`impressions:${impressions}`, `inbound:${inboundLinks}`],
  };
}

// --- Output renderers ---

function renderMarkdown(output) {
  const { generatedAt, gscCsvPath, totalPostsScanned, totalGscRows, nonBlogUrlsIgnored, summary, buckets } = output;
  const lines = [];
  lines.push('# DCNI Bucketing — Decisions');
  lines.push('');
  lines.push('> **DECISIONS ONLY.** Do not deploy 410s/301s from this output until the Action 4 moratorium expires (mid-July 2026, per #366) and a manual review pass completes.');
  lines.push('');
  lines.push('## Run metadata');
  lines.push('');
  lines.push(`- **generatedAt**: ${generatedAt}`);
  lines.push(`- **gscCsvPath**: \`${gscCsvPath}\``);
  lines.push(`- **totalPostsScanned**: ${totalPostsScanned}`);
  lines.push(`- **totalGscRows**: ${totalGscRows}`);
  lines.push(`- **nonBlogUrlsIgnored**: ${nonBlogUrlsIgnored}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Bucket | Count |');
  lines.push('|---|---|');
  lines.push(`| save | ${summary.save} |`);
  lines.push(`| merge | ${summary.merge} |`);
  lines.push(`| delete | ${summary.delete} |`);
  lines.push(`| review | ${summary.review} |`);
  lines.push(`| missing | ${summary.missing} |`);
  lines.push(`| **totalBucketed** | **${summary.totalBucketed}** |`);
  lines.push('');

  const sections = [
    ['save', '## Save', ['slug', 'impressions', 'reason', 'wordCount']],
    ['merge', '## Merge', ['slug', 'mergeTarget', 'reason', 'impressions', 'wordCount']],
    ['delete', '## Delete', ['slug', 'impressions', 'reason', 'wordCount', 'ageInDays']],
    ['review', '## Review', ['slug', 'impressions', 'reason', 'wordCount']],
    ['missing', '## Missing (GSC URL has no post JSON)', ['slug', 'impressions', 'note']],
  ];

  for (const [key, heading, cols] of sections) {
    lines.push(heading);
    lines.push('');
    const rows = buckets[key] || [];
    if (rows.length === 0) {
      lines.push('_(none)_');
      lines.push('');
      continue;
    }
    lines.push('| ' + cols.join(' | ') + ' |');
    lines.push('|' + cols.map(() => '---').join('|') + '|');
    // Sort deterministically by slug for stable output
    const sorted = [...rows].sort((a, b) => a.slug.localeCompare(b.slug));
    for (const row of sorted) {
      const cells = cols.map((c) => {
        const v = row[c];
        if (v === null || v === undefined) return '';
        return String(v).replace(/\|/g, '\\|');
      });
      lines.push('| ' + cells.join(' | ') + ' |');
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

function renderReadme() {
  return `# DCNI Bucketing Output — ${path.basename(__dirname)}

**DECISIONS ONLY — DO NOT DEPLOY** until the Action 4 moratorium expires (mid-July 2026 per #366) AND a manual review of the REVIEW bucket completes.

This directory contains the decision table emitted by \`scripts/dcni-bucket.mjs\` for the GSC CSV input listed in \`buckets.json#gscCsvPath\`. Re-running the script with a fresh GSC export overwrites these files.

## Files

- \`buckets.json\` — machine-readable decision table (consumed by future deletion PR tooling)
- \`buckets.md\` — human-readable preview; review this BEFORE any deletion ships
- \`README.md\` — this file

## Deployment gate

The actual 410s / 301 redirects are gated on three conditions, none of which this script enforces:

1. **Moratorium expiry**: mid-July 2026 (per #366). Shipping deletions earlier risks another DCNI wave.
2. **Manual REVIEW bucket sign-off**: every entry in the \`review\` bucket needs human eyes.
3. **Pilot before scale**: ship 410s for the 10 lowest-impression DELETE candidates first; measure 4-6 weeks; only then scale.

## Decision tree (summary)

The script applies the following predicates per slug, in strict order. The FIRST match wins.

1. Cluster member (pillar or spoke) → **SAVE**
2. \`italian-drinking-culture-guide\` allowlist → **SAVE**
3. Known MERGE group sibling (cultural-drinking template) → **MERGE** into \`italian-drinking-culture-guide\`
4. ≥160 16-month impressions → **SAVE** (high traffic)
5. ≥3 inbound markdown body links → **SAVE** (well-linked)
6. Position ≤50 (any query) AND impressions > 0 → **SAVE** (currently ranking)
7. Off-strategy pattern + ≤30 impressions + 0 inbound + age >90d → **DELETE**
8. Off-strategy but ambiguous → **REVIEW**
9. Otherwise → **REVIEW** (catch-all; CNI URLs without a cluster default here)

## Re-running with real GSC data

\`\`\`bash
# Export from Google Search Console: Performance → Pages tab → 16-month range → Export → CSV
# Save to data/gsc-pages-<YYYY-MM-DD>.csv (gitignored or staged manually)
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-2026-07-15.csv --output-dir docs/dcni-2026-07-15
\`\`\`

## Hard constraints (verified in CI)

This script does NOT modify:

- \`src/newblog/data/posts/*.json\` (post content, dateModified, tags)
- \`public/sitemap.xml\`
- \`vercel.json\`
- \`scripts/cluster-config.json\`
- \`scripts/orphan-injection-plan.json\`

Any future PR that consumes this \`buckets.json\` and ships actual deletions is a SEPARATE, manually-reviewed change.
`;
}

// --- Main ---

function main() {
  const args = parseArgs(process.argv.slice(2));
  const posts = loadPosts();
  const clusterMembers = loadClusterMembers();
  const inbound = buildInboundIndex(posts);
  const firstCommits = loadFirstCommitDates([...posts.keys()]);
  const gscRows = parseCsv(args.gscCsv);

  // Build slug -> gsc lookup; classify non-blog URLs
  const gscBySlug = new Map();
  let nonBlogIgnored = 0;
  for (const row of gscRows) {
    if (!row.url || !row.url.startsWith(URL_PREFIX)) {
      nonBlogIgnored++;
      continue;
    }
    const slug = row.url.slice(URL_PREFIX.length).replace(/\/$/, '');
    gscBySlug.set(slug, row);
  }

  // Decide for each post
  const buckets = { save: [], merge: [], delete: [], review: [], missing: [] };
  for (const [slug, post] of posts.entries()) {
    const gsc = gscBySlug.get(slug) || null;
    const cluster = clusterMembers.get(slug) || null;
    const inboundLinks = inbound.get(slug) || 0;
    const age = ageInDays(firstCommits.get(slug));
    const decision = decide({
      slug,
      gsc,
      cluster,
      inboundLinks,
      age,
      threshold: args.threshold,
      deleteThreshold: args.deleteThreshold,
    });
    if (args.verbose) {
      console.error(`[${decision.bucket}] ${slug} :: ${decision.reason}`);
    }
    const entry = {
      slug,
      reason: decision.reason,
      impressions: gsc ? gsc.impressions : 0,
      position: gsc ? gsc.position : null,
      wordCount: post.wordCount,
      inboundBodyLinks: inboundLinks,
      cluster: cluster ? cluster.cluster : null,
      clusterRole: cluster ? cluster.role : null,
      ageInDays: age,
    };
    if (decision.mergeTarget) entry.mergeTarget = decision.mergeTarget;
    if (decision.flags) entry.flags = decision.flags;
    buckets[decision.bucket].push(entry);
  }

  // GSC slugs with no post JSON → MISSING
  for (const [slug, row] of gscBySlug.entries()) {
    if (!posts.has(slug)) {
      buckets.missing.push({
        slug,
        impressions: row.impressions,
        note: 'GSC has URL but post JSON not found',
      });
    }
  }

  // Sort each bucket by slug for determinism
  for (const key of Object.keys(buckets)) {
    buckets[key].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  const summary = {
    save: buckets.save.length,
    merge: buckets.merge.length,
    delete: buckets.delete.length,
    review: buckets.review.length,
    missing: buckets.missing.length,
    totalBucketed:
      buckets.save.length +
      buckets.merge.length +
      buckets.delete.length +
      buckets.review.length,
  };

  const output = {
    generatedAt: new Date().toISOString(),
    gscCsvPath: args.gscCsv,
    totalPostsScanned: posts.size,
    totalGscRows: gscRows.length,
    nonBlogUrlsIgnored: nonBlogIgnored,
    buckets,
    summary,
  };

  if (args.dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const outDir = args.outputDir
    ? path.resolve(args.outputDir)
    : path.join(ROOT, 'docs/dcni-2026-04-29');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'buckets.json'), JSON.stringify(output, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'buckets.md'), renderMarkdown(output));
  fs.writeFileSync(path.join(outDir, 'README.md'), renderReadme());
  console.log(`Wrote ${outDir}/buckets.{json,md} + README.md`);
  console.log(JSON.stringify(summary, null, 2));
}

main();
