#!/usr/bin/env node
/**
 * check-mass-edit.mjs — bulk-edit guard for existing posts.
 *
 * Fails a PR that MODIFIES (or renames) more than THRESHOLD existing post JSONs
 * in src/newblog/data/posts/. Bulk edits of old posts triggered the recrawl
 * waves behind the 2026 DCNI growth (PRs #243, #246). ADDED posts are exempt:
 * new content is uncapped. Deleted posts are exempt too (pruning ships in
 * reviewed batches logged in docs/seo/reads-ledger.jsonl).
 *
 * Replaces the time-boxed moratorium from #366, which expired 2026-07-15.
 *
 * Usage:
 *   node scripts/check-mass-edit.mjs                       # base=origin/main, threshold=20
 *   node scripts/check-mass-edit.mjs --base HEAD~5
 *   PR_BODY="... [mass-edit-allowed] ..." node scripts/check-mass-edit.mjs
 * Self-test: node --test scripts/check-mass-edit.test.mjs
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const POST_RE = /^src\/newblog\/data\/posts\/[^/]+\.json$/;
const THRESHOLD = 20;
const OVERRIDE_TAG = '[mass-edit-allowed]';

// `git diff --name-status` text -> paths of modified/renamed existing posts.
export function modifiedPosts(nameStatus) {
  return nameStatus
    .split('\n')
    .map((l) => l.split('\t'))
    .filter(([status, ...paths]) => /^[MR]/.test(status || '') && POST_RE.test(paths.at(-1)))
    .map(([, ...paths]) => paths.at(-1));
}

export function verdict(nameStatus, prBody = '', threshold = THRESHOLD) {
  const files = modifiedPosts(nameStatus);
  return { files, ok: files.length <= threshold || prBody.includes(OVERRIDE_TAG) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--base');
  const base = i === -1 ? 'origin/main' : args[i + 1];
  let diff;
  try {
    diff = execSync(`git diff --name-status ${base}...HEAD`, { encoding: 'utf8' });
  } catch (e) {
    console.error(`[check-mass-edit] git diff against ${base} failed (CI needs fetch-depth: 0): ${e.message}`);
    process.exit(2);
  }
  const { files, ok } = verdict(diff, process.env.PR_BODY || '');
  if (ok) {
    console.log(`[check-mass-edit] OK: ${files.length} existing post(s) modified (limit ${THRESHOLD}; added posts exempt)`);
    process.exit(0);
  }
  console.error(`[check-mass-edit] FAIL: ${files.length} existing posts modified (limit ${THRESHOLD}).`);
  console.error('Bulk edits of old posts trigger Google recrawl waves (see #362). Split into batches of 20 or fewer,');
  console.error(`or add ${OVERRIDE_TAG} to the PR description with a rationale.`);
  files.slice(0, 10).forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
