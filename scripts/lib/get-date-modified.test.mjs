// Self-test for scripts/lib/get-date-modified.js. Run: node --test scripts/lib/
//
// Covers the shallow-clone guard: Vercel clones ~10 commits deep, so for any
// file untouched inside that window `git log -1 -- file` returns the shallow
// boundary commit's date (the clone cutoff), not the real modification date.
// The helper must detect that case and fall back to the post's own date.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getDateModified } from './get-date-modified.js';

const run = (cmd, cwd, env = {}) =>
  execSync(cmd, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });

// Build an origin repo where post.json's last commit (2024-02-01) is followed
// by a later commit touching another file (2024-08-01). A depth-1 clone then
// contains only the 2024-08-01 commit as its shallow boundary.
function makeOrigin(root) {
  const origin = path.join(root, 'origin');
  fs.mkdirSync(origin);
  run('git init -q -b main', origin);
  run('git config user.email t@t.t && git config user.name t', origin);
  const dates = (d) => ({ GIT_AUTHOR_DATE: d, GIT_COMMITTER_DATE: d });
  fs.writeFileSync(path.join(origin, 'post.json'), '{"slug":"x"}\n');
  run('git add post.json && git commit -qm one', origin, dates('2024-02-01T10:00:00+00:00'));
  fs.writeFileSync(path.join(origin, 'other.txt'), 'later\n');
  run('git add other.txt && git commit -qm two', origin, dates('2024-08-01T10:00:00+00:00'));
  return origin;
}

function inDir(dir, fn) {
  const prev = process.cwd();
  process.chdir(dir);
  try { return fn(); } finally { process.chdir(prev); }
}

const post = { date: '2023-05-05' };

test('full clone: returns the file\'s real git commit date', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gdm-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const origin = makeOrigin(root);
  const clone = path.join(root, 'full');
  run(`git clone -q "file://${origin}" "${clone}"`, root);
  const result = inDir(clone, () => getDateModified(post, path.join(clone, 'post.json')));
  assert.match(result, /^2024-02-01/);
});

test('shallow clone: boundary-commit date is NOT trusted, falls back to post.date', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gdm-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const origin = makeOrigin(root);
  const clone = path.join(root, 'shallow');
  run(`git clone -q --depth 1 "file://${origin}" "${clone}"`, root);
  // Sanity: the clone really is shallow and git really does misreport the date.
  assert.ok(fs.existsSync(path.join(clone, '.git', 'shallow')), 'test setup: clone must be shallow');
  const misreported = run('git log -1 --format=%cI -- post.json', clone).trim();
  assert.match(misreported, /^2024-08-01/, 'test setup: shallow git must misreport the date');
  const result = inDir(clone, () => getDateModified(post, path.join(clone, 'post.json')));
  assert.equal(result, '2023-05-05');
});

test('explicit dateModified override still wins everywhere', () => {
  assert.equal(getDateModified({ dateModified: '2026-01-02' }, null), '2026-01-02');
});
