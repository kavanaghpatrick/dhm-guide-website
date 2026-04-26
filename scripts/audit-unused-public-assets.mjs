#!/usr/bin/env node
/**
 * audit-unused-public-assets.mjs
 *
 * Walks public/ for files larger than a size threshold and greps the entire
 * repo for the filename (and the basename without extension) to determine if
 * the file is referenced anywhere. Outputs:
 *   - audit-public-assets.csv  (all candidates with status)
 *   - unused-public-assets.txt (just the unreferenced paths, one per line)
 *
 * Idempotent: running the script multiple times produces consistent output.
 *
 * Usage:
 *   node scripts/audit-unused-public-assets.mjs [--min-kb=100] [--out-dir=./audit]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');

// CLI args
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : def;
};
const MIN_KB = Number(getArg('min-kb', '100'));
const OUT_DIR = path.resolve(getArg('out-dir', path.join(REPO_ROOT, 'audit')));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Search roots — the repo paths we'll grep through. Excluding public/ itself
// (we don't care if a public file references another public file via filename
// in some HTML — that's still a usage signal but for simplicity we look outside).
const SEARCH_ROOTS = ['src', 'scripts', 'docs', 'index.html', 'vite.config.js', 'vercel.json', 'package.json'];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

// Paths whose hits we treat as STALE (not real references).
// These are doc archives, backup metadata files, and audit outputs from prior runs.
const STALE_PATH_PATTERNS = [
  /^docs\/archive\//,
  /^docs\/traffic-growth-2026-04-26\//, // Source of T8 audit naming the unused files
  /\.backup\.json$/,
  /\.backup2$/,
  /\.bak$/,
  /\.tmp$/,
  /^src\/newblog\/data\/image_fix_report\.md$/,
  /^src\/newblog\/data\/missing_images_report\.md$/,
  /^audit\//,
  /^scripts\/audit-unused-public-assets\.mjs$/, // The script itself
];

function isStalePath(p) {
  return STALE_PATH_PATTERNS.some((re) => re.test(p));
}

function grepRepoFor(needle) {
  // Use git grep -F (fixed string) across tracked + untracked files in repo.
  try {
    const args = ['grep', '-l', '-F', '--untracked', '--exclude-standard', '--', needle, ...SEARCH_ROOTS];
    const result = execFileSync('git', args, {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    const matches = result.split('\n').filter(Boolean);
    // Filter out stale paths
    return matches.filter((m) => !isStalePath(m));
  } catch (err) {
    // git grep returns exit code 1 when no matches found — that's normal.
    if (err.status === 1) return [];
    // Some other error — re-throw
    throw err;
  }
}

function bytesToKb(bytes) {
  return Math.round(bytes / 1024);
}

console.log(`Walking ${PUBLIC_DIR}...`);
const allFiles = walk(PUBLIC_DIR);
const candidates = allFiles
  .map((p) => ({ path: p, size: fs.statSync(p).size }))
  .filter((f) => f.size >= MIN_KB * 1024);

console.log(`Found ${candidates.length} files >= ${MIN_KB} KB`);

const rows = [];
const unreferenced = [];

let i = 0;
for (const { path: full, size } of candidates) {
  i += 1;
  if (i % 25 === 0) console.log(`  [${i}/${candidates.length}] auditing...`);

  const rel = path.relative(REPO_ROOT, full);
  const filename = path.basename(full);
  const stem = filename.replace(/\.[^.]+$/, '');

  // Search for: full filename, AND stem (catches dynamic extensions like .png/.webp pairs)
  const filenameMatches = grepRepoFor(filename);
  const stemMatches = grepRepoFor(stem);

  // Combine and dedupe
  const allMatches = Array.from(new Set([...filenameMatches, ...stemMatches]));

  const referenced = allMatches.length > 0;
  const firstMatch = allMatches[0] || '';

  rows.push({
    path: rel,
    size_kb: bytesToKb(size),
    referenced: referenced ? 'yes' : 'no',
    first_match_path: firstMatch,
  });

  if (!referenced) unreferenced.push(rel);
}

// Write CSV
const csvPath = path.join(OUT_DIR, 'audit-public-assets.csv');
const header = 'path,size_kb,referenced,first_match_path\n';
const csvBody = rows
  .sort((a, b) => b.size_kb - a.size_kb)
  .map((r) => {
    // Escape any commas in paths
    const esc = (s) => (s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s);
    return `${esc(r.path)},${r.size_kb},${r.referenced},${esc(r.first_match_path)}`;
  })
  .join('\n');
fs.writeFileSync(csvPath, header + csvBody + '\n');

// Write unused list
const unusedPath = path.join(OUT_DIR, 'unused-public-assets.txt');
fs.writeFileSync(unusedPath, unreferenced.sort().join('\n') + (unreferenced.length ? '\n' : ''));

// Summary
const totalUnusedBytes = rows
  .filter((r) => r.referenced === 'no')
  .reduce((sum, r) => sum + r.size_kb * 1024, 0);
const totalReferencedBytes = rows
  .filter((r) => r.referenced === 'yes')
  .reduce((sum, r) => sum + r.size_kb * 1024, 0);

console.log('');
console.log('=== AUDIT SUMMARY ===');
console.log(`Total candidates (>= ${MIN_KB} KB): ${rows.length}`);
console.log(`  Referenced:    ${rows.filter((r) => r.referenced === 'yes').length} (${(totalReferencedBytes / 1024 / 1024).toFixed(1)} MB)`);
console.log(`  Unreferenced:  ${rows.filter((r) => r.referenced === 'no').length} (${(totalUnusedBytes / 1024 / 1024).toFixed(1)} MB)`);
console.log('');
console.log(`CSV written:  ${path.relative(REPO_ROOT, csvPath)}`);
console.log(`Unused list:  ${path.relative(REPO_ROOT, unusedPath)}`);
