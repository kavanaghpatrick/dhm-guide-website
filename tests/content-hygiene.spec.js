// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * CONTENT HYGIENE — no authoring/markup residue that shows up as junk on the
 * page, in crawler HTML, or in FAQPage rich results.
 *
 * Every string in every post JSON and every metadata/index.json entry is walked
 * recursively. How each string is rendered decides which rules apply:
 *
 *  - `content` (top-level) is the ONLY field parsed as markdown
 *    (NewBlogPost.jsx react-markdown + remark-gfm, no rehype-raw; prerender uses
 *    micromark). Markdown is fine there, but raw HTML tags and HTML comments are
 *    escaped and printed as visible text, `{#id}` stays literal in headings, and
 *    literal "\n" escapes collapse the prerendered (crawler) HTML into one blob.
 *  - Every other string (title, excerpt, metaDescription, quickAnswer, faq Q/A,
 *    nested meta/schema/review...) is rendered as plain text (`{post.excerpt}`)
 *    or fed to JSON-LD, so markdown syntax there (`**bold**`, `[text](url)`,
 *    line-start `##`) shows literally.
 *
 * Allowed: well-formed `<!-- inline-comparison-table:VARIANT:PLACEMENT:IDS -->`
 * markers in content (consumed by NewBlogPost.jsx, replaced by a component).
 *
 * File-based (no browser):  npx playwright test tests/content-hygiene.spec.js
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS = join(ROOT, 'src/newblog/data/posts');
const INDEX = join(ROOT, 'src/newblog/data/metadata/index.json');

// Same regex as NewBlogPost.jsx INLINE_COMPARISON_TABLE_MARKER.
const INLINE_TABLE_MARKER = /<!--\s*inline-comparison-table:([\w-]+):([\w-]+):([\d,]+)\s*-->/g;

/** Rules for every string, wherever it lives. */
const RULES_ALL = [
  { name: 'kramdown {#anchor}', re: /\{#[^}]*\}/ },
  { name: 'HTML comment', re: /<!--|-->/, prep: (s) => s.replace(INLINE_TABLE_MARKER, '') },
  { name: 'template {{ }}', re: /\{\{[^}]*\}\}/ },
  { name: 'placeholder / TODO / FIXME', re: /\[PLACEHOLDER\]|\bTODO\b|\bFIXME\b/ },
  { name: 'double-encoded entity', re: /&amp;(?:amp|#039);/ },
];

/** Rules for the markdown `content` field only. */
const RULES_CONTENT = [
  {
    name: '"Table of Contents" heading in content',
    re: /^[ \t]{0,3}#{1,6}[ \t]+[^\n]*table of contents/im,
    prep: (s) => s.replace(/\\n/g, '\n'),
  },
  { name: 'literal "\\n" escape in content', re: /\\n/ },
  {
    name: 'raw HTML tag in content (renders as text)',
    re: /<\/?(?:a|div|span|br|p|strong|b|em|i|ul|ol|li|h[1-6]|table|tr|td|th|section|img)\b[^>]*>/i,
  },
];

/** Rules for every non-content string (rendered as plain text / JSON-LD). */
const RULES_PLAIN = [
  { name: 'line-start ## in plain-text field', re: /(?:^|\n)[ \t]*#{1,6}[ \t]+\S/ },
  { name: 'markdown link in plain-text field', re: /\[[^\]\n]+\]\((?:https?:\/\/|\/)[^)\s]*\)/ },
  { name: 'markdown **bold** in plain-text field', re: /\*\*[^*\n]+\*\*/ },
];

function snippet(s, re) {
  const m = s.match(re);
  if (!m || m.index === undefined) return '';
  const start = Math.max(0, m.index - 30);
  return JSON.stringify(s.slice(start, m.index + m[0].length + 30));
}

/** Walk any JSON value; return [{rule, path, snippet}] for every rule hit. */
function scan(value, path = '', isTopLevelContent = false) {
  const hits = [];
  if (typeof value === 'string') {
    const rules = [...RULES_ALL, ...(isTopLevelContent ? RULES_CONTENT : RULES_PLAIN)];
    for (const r of rules) {
      const s = r.prep ? r.prep(value) : value;
      if (r.re.test(s)) hits.push({ rule: r.name, path, snippet: snippet(s, r.re) });
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...scan(v, `${path}[${i}]`)));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      hits.push(...scan(v, path ? `${path}.${k}` : k, path === '' && k === 'content'));
    }
  }
  return hits;
}

const fmt = (label, hits) => hits.map((h) => `${label} ${h.path} — ${h.rule}: ${h.snippet}`);

const postFiles = readdirSync(POSTS).filter((f) => f.endsWith('.json')).sort();
const index = JSON.parse(readFileSync(INDEX, 'utf8'));

test.describe('content hygiene — post JSON', () => {
  for (const file of postFiles) {
    test(file, () => {
      const post = JSON.parse(readFileSync(join(POSTS, file), 'utf8'));
      expect(fmt(file, scan(post))).toEqual([]);
    });
  }
});

test.describe('content hygiene — metadata/index.json', () => {
  test('every index entry', () => {
    const problems = index.flatMap((entry, i) => fmt(`index[${i}] ${entry.slug}`, scan(entry)));
    expect(problems).toEqual([]);
  });
});
