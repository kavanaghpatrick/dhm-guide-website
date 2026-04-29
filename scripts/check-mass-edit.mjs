#!/usr/bin/env node
/**
 * check-mass-edit.mjs
 *
 * CI guardrail for the mass-edit moratorium (issue #366, expires 2026-07-15).
 * Fails if a PR modifies > THRESHOLD post JSONs without [mass-edit-allowed]
 * in the PR description.
 *
 * Mirrors scripts/verify-z-classes.mjs precedent: Node stdlib only, zero deps,
 * binary exit code, multi-line failure message linking to root cause.
 *
 * Usage:
 *   node scripts/check-mass-edit.mjs                                  # default base=origin/main, threshold=20
 *   node scripts/check-mass-edit.mjs --base HEAD~5                    # local testing
 *   node scripts/check-mass-edit.mjs --pr-body "..." --threshold 10   # CLI override
 *
 * Refs: https://github.com/kavanaghpatrick/dhm-guide-website/issues/366
 *       CLAUDE.md "Mass-Edit Moratorium Policy" section
 */

import { execSync } from 'node:child_process';

// Argv parsing (stdlib only)
const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};

const BASE = getFlag('base', 'origin/main');
const THRESHOLD = parseInt(getFlag('threshold', '20'), 10);
const PR_BODY = getFlag('pr-body', process.env.PR_BODY || '');
const OVERRIDE_TAG = '[mass-edit-allowed]';
const POST_RE = /^src\/newblog\/data\/posts\/[^/]+\.json$/;

// Determine modified post JSONs
let changed;
try {
  changed = execSync(`git diff --name-only ${BASE}...HEAD`, { encoding: 'utf8' })
    .split('\n')
    .filter(f => POST_RE.test(f));
} catch (e) {
  console.error(`[check-mass-edit] Failed to compute diff against ${BASE}: ${e.message}`);
  console.error('In CI, ensure actions/checkout uses fetch-depth: 0');
  process.exit(2);
}

const count = changed.length;
const hasOverride = PR_BODY.includes(OVERRIDE_TAG);

if (count <= THRESHOLD) {
  console.log(`[check-mass-edit] OK: ${count} post JSON(s) modified (threshold ${THRESHOLD})`);
  process.exit(0);
}

if (hasOverride) {
  console.log(`[check-mass-edit] OK (override): ${count} files modified, PR body contains ${OVERRIDE_TAG}`);
  process.exit(0);
}

// Failure — clear, actionable error message
console.error(`\n[check-mass-edit] FAIL — mass-edit moratorium violation`);
console.error(`  Modified ${count} post JSONs in src/newblog/data/posts/ (threshold: ${THRESHOLD})`);
console.error(`  This may trigger a Google recrawl wave during DCNI recovery`);
console.error(`  (issue #366, expires 2026-07-15)`);
console.error(``);
console.error(`  Files (first 10):`);
changed.slice(0, 10).forEach(f => console.error(`    ${f}`));
if (count > 10) console.error(`    ... and ${count - 10} more`);
console.error(``);
console.error(`  To override (with rationale), add to PR description:`);
console.error(`    ${OVERRIDE_TAG}`);
console.error(``);
console.error(`  Background: https://github.com/kavanaghpatrick/dhm-guide-website/issues/366`);
console.error(`  Policy: CLAUDE.md "Mass-Edit Moratorium Policy" section\n`);
process.exit(1);
