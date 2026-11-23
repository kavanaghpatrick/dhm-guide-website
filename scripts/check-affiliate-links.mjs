#!/usr/bin/env node
/**
 * check-affiliate-links.mjs — affiliate link gate (Node stdlib only).
 *
 * Static mode (default, runs in `npm test` / CI, no network):
 *   (a) fails on amzn.to short links — they rot invisibly (52 were found
 *       302-ing to the Amazon homepage untagged). Policy: full amazon.com URLs
 *       with the tag. LEGACY_SHORT_LINKS are grandfathered: verified to resolve
 *       to a live, tagged listing, but they live in 20+ posts and migrating them
 *       at once would trip the mass-edit cap. Migrate a post when you touch it.
 *   (b) fails on amazon.com links missing tag=dhmguide-20
 *   (c) fails on duplicate ASINs in src/data/topProducts.json
 *
 * --resolve (weekly, live): also HEAD-checks every link; fails on a 404 or an
 * amzn.to that does not land on a tagged product page.
 *
 * Usage: node scripts/check-affiliate-links.mjs [--resolve]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const POSTS_DIR = path.join(ROOT, 'src/newblog/data/posts');
const PRODUCTS = path.join(ROOT, 'src/data/topProducts.json');
const TAG = 'tag=dhmguide-20';
const LEGACY_SHORT_LINKS = new Set([
  '4kjCRVw', '44sczuq', '3HSHjgu', '3T8cO8H', '44nvh65',
  '44znXFU', '4ejE4uq', '4l1ZoqN', '4eBbyEP', '44E95Gi',
]);
const LINK_RE = /https?:\/\/(?:www\.)?(?:amzn\.to|amazon\.com)\/[^\s"'()<>\]\\]*/g;
const ASIN_RE = /\/dp\/(B[0-9A-Z]{9})/;

const SCHEMA_GEN = path.join(ROOT, 'src/utils/productSchemaGenerator.js');
const files = [PRODUCTS, SCHEMA_GEN, ...fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).map(f => path.join(POSTS_DIR, f))];
const errors = [];
const links = new Set();

for (const file of files) {
  const rel = path.relative(ROOT, file);
  for (const url of fs.readFileSync(file, 'utf8').match(LINK_RE) || []) {
    links.add(url);
    if (url.includes('amzn.to/')) {
      if (!LEGACY_SHORT_LINKS.has(url.split('amzn.to/')[1])) errors.push(`${rel}: amzn.to short link not allowed: ${url}`);
    } else if (!url.includes(TAG)) {
      errors.push(`${rel}: amazon.com link missing ${TAG}: ${url}`);
    }
  }
}

const seen = new Map();
for (const p of JSON.parse(fs.readFileSync(PRODUCTS, 'utf8'))) {
  const asin = (p.affiliateLink || '').match(ASIN_RE)?.[1];
  if (!asin) errors.push(`topProducts.json id ${p.id}: affiliateLink must be a full amazon.com/dp/ASIN URL`);
  else if (seen.has(asin)) errors.push(`topProducts.json: duplicate ASIN ${asin} (ids ${seen.get(asin)} and ${p.id})`);
  else seen.set(asin, p.id);
}

if (process.argv.includes('--resolve')) {
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
  for (const url of links) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: url.includes('amzn.to/') ? 'manual' : 'follow', headers: { 'User-Agent': UA } });
      const loc = res.headers.get('location') || '';
      if (url.includes('amzn.to/') && !(ASIN_RE.test(loc) && loc.includes(TAG))) errors.push(`dead short link: ${url} -> ${loc || res.status}`);
      else if (res.status === 404) errors.push(`404: ${url}`);
    } catch (e) {
      errors.push(`fetch failed: ${url} (${e.message})`);
    }
  }
}

if (errors.length) {
  console.error(`[check-affiliate-links] FAIL: ${errors.length} problem(s)\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`[check-affiliate-links] OK: ${links.size} unique Amazon links in ${files.length} files`);
