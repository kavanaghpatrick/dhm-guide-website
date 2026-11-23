// Self-test for scripts/check-mass-edit.mjs. Run: node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modifiedPosts, verdict } from './check-mass-edit.mjs';

// Fixtures in `git diff --name-status` format.
const lines = (status, n, dir = 'src/newblog/data/posts') =>
  Array.from({ length: n }, (_, i) => `${status}\t${dir}/post-${status}-${i}.json`).join('\n');

test('21 modified existing posts fails', () => {
  assert.equal(modifiedPosts(lines('M', 21)).length, 21);
  assert.equal(verdict(lines('M', 21), '').ok, false);
});

test('20 modified posts passes (threshold is exclusive)', () => {
  assert.equal(verdict(lines('M', 20), '').ok, true);
});

test('added posts are exempt, however many', () => {
  assert.equal(modifiedPosts(lines('A', 50)).length, 0);
  assert.equal(verdict(lines('A', 50), '').ok, true);
});

test('mixed diff counts only modified posts', () => {
  const diff = [lines('A', 30), lines('M', 5), lines('D', 30), lines('M', 40, 'src/components')].join('\n');
  assert.deepEqual(modifiedPosts(diff).length, 5);
  assert.equal(verdict(diff, '').ok, true);
});

test('nested files and non-json in posts/ are ignored', () => {
  const diff = 'M\tsrc/newblog/data/posts/archived/x.json\nM\tsrc/newblog/data/posts/index.js';
  assert.equal(modifiedPosts(diff).length, 0);
});

test('[mass-edit-allowed] in the PR body overrides', () => {
  assert.equal(verdict(lines('M', 25), 'restore [mass-edit-allowed]').ok, true);
});
