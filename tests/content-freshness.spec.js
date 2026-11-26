// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * CONTENT FRESHNESS — no stale date stamps in anything a searcher sees in a
 * SERP or a shared link (title, meta description, excerpt, H1).
 *
 * Rules:
 *  - Parenthesised year stamps are banned for any year: "(2025)", "(June 2026)".
 *  - Month-year stamps are banned for any year ("June 2026", "Updated May 2025")
 *    because they go stale every month.
 *  - Titles and H1s may not contain a bare stale year (2010-2025) at all.
 *  - Meta descriptions / excerpts may not use a year as a freshness stamp
 *    ("in 2025", "for 2025", "2025 guide", "2025 research"...). Factual
 *    citation years ("a 2012 study") are allowed there.
 *  - Bare "2026" is allowed everywhere.
 *
 * File-based (no browser):  npx playwright test tests/content-freshness.spec.js
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS = join(ROOT, 'src/newblog/data/posts');
const INDEX = join(ROOT, 'src/newblog/data/metadata/index.json');

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const STALE_YEAR = '20(?:1\\d|2[0-5])';

const RULES_ALL_FIELDS = [
  { name: 'parenthesised stale year / month-year', re: new RegExp(`\\((?:(?:${MONTHS})\\s*)?${STALE_YEAR}\\)`, 'i') },
  { name: 'parenthesised year (any)', re: /\(\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+)?20\d\d\s*\)/i },
  { name: 'month-year stamp', re: new RegExp(`\\b(?:${MONTHS})\\s+20\\d\\d\\b`, 'i') },
];
const RULE_BARE_STALE_YEAR = { name: 'bare stale year in headline', re: new RegExp(`\\b${STALE_YEAR}\\b`) };
const RULE_STALE_YEAR_STAMP = {
  name: 'stale year used as freshness stamp',
  re: new RegExp(
    `\\b(?:in|for|of|by|through|into|during|as of|updated|update)\\s+${STALE_YEAR}\\b(?!\\s*(?:study|trial|paper|review|meta-analysis|survey|report|data))` +
      `|\\b${STALE_YEAR}\\s+(?:guide|update|edition|research|reviews?|rankings?|buyer'?s|comparison|analysis|edition|picks|list|evidence|science)\\b` +
      `|\\b(?:best|top)\\b[^.]{0,40}\\b${STALE_YEAR}\\b`,
    'i',
  ),
};

function violations(text, rules) {
  if (typeof text !== 'string' || !text) return [];
  return rules.filter((r) => r.re.test(text)).map((r) => `${r.name}: "${text}"`);
}

function extractH1(content) {
  if (typeof content !== 'string') return null;
  const c = content.replace(/\\n/g, '\n');
  const md = c.match(/^\s*#\s+(.+?)\s*#*\s*$/m);
  if (md) return md[1];
  const html = c.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return html ? html[1].replace(/<[^>]+>/g, '').trim() : null;
}

function check(label, fields) {
  const out = [];
  const head = [...RULES_ALL_FIELDS, RULE_BARE_STALE_YEAR];
  const body = [...RULES_ALL_FIELDS, RULE_STALE_YEAR_STAMP];
  for (const [k, v] of Object.entries(fields)) {
    const rules = k === 'title' || k === 'H1' ? head : body;
    for (const msg of violations(v, rules)) out.push(`${label} ${k} — ${msg}`);
  }
  return out;
}

const postFiles = readdirSync(POSTS).filter((f) => f.endsWith('.json')).sort();
const index = JSON.parse(readFileSync(INDEX, 'utf8'));

test.describe('content freshness — post JSON', () => {
  for (const file of postFiles) {
    test(file, () => {
      const post = JSON.parse(readFileSync(join(POSTS, file), 'utf8'));
      const problems = check(file, {
        title: post.title,
        metaDescription: post.metaDescription,
        excerpt: post.excerpt,
        H1: extractH1(post.content),
      });
      expect(problems, problems.join('\n')).toEqual([]);
    });
  }
});

test.describe('content freshness — metadata/index.json', () => {
  for (const entry of index) {
    test(`index: ${entry.slug}`, () => {
      const problems = check(`index:${entry.slug}`, {
        title: entry.title,
        metaDescription: entry.metaDescription,
        excerpt: entry.excerpt,
      });
      expect(problems, problems.join('\n')).toEqual([]);
    });
  }
});
