#!/usr/bin/env node
/**
 * resolve-amzn-shortlinks.mjs
 *
 * Resolves amzn.to short links in src/data/topProducts.json to full Amazon URLs
 * and extracts ASINs. Output feeds the Playwright price scraper.
 *
 * Usage:
 *   node scripts/resolve-amzn-shortlinks.mjs
 *   node scripts/resolve-amzn-shortlinks.mjs --products=src/data/topProducts.json --out=data/amazon-asin-map.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ASIN_RE = /\/(B[0-9A-Z]{9})(?:\/|\?|$)/;
const MAX_HOPS = 5;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

function getFlag(name, def) {
  const prefix = `--${name}=`;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith(prefix)) return a.slice(prefix.length);
  }
  return def;
}

async function followRedirects(startUrl) {
  let url = startUrl;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        headers: { 'User-Agent': UA },
      });
    } catch (e) {
      throw new Error(`fetch failed at hop ${hop} (${url}): ${e.message}`);
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) throw new Error(`redirect ${res.status} without Location at ${url}`);
      url = new URL(loc, url).toString();
      continue;
    }
    if (res.status >= 200 && res.status < 300) return url;
    throw new Error(`unexpected status ${res.status} at ${url}`);
  }
  throw new Error(`exceeded ${MAX_HOPS} redirect hops starting from ${startUrl}`);
}

function extractAsin(fullUrl) {
  const m = fullUrl.match(ASIN_RE);
  return m ? m[1] : null;
}

async function resolveProduct(product) {
  const base = { id: product.id, name: product.name };
  const link = product.affiliateLink;
  if (!link || typeof link !== 'string') {
    return { ...base, asin: null, fullUrl: null, error: 'no affiliateLink' };
  }
  if (!/^https?:\/\/amzn\.to\//i.test(link)) {
    return { ...base, asin: null, fullUrl: null, error: `not an amzn.to short link: ${link}` };
  }
  try {
    const fullUrl = await followRedirects(link);
    const asin = extractAsin(fullUrl);
    if (!asin) {
      return { ...base, asin: null, fullUrl, error: 'ASIN not found in resolved URL' };
    }
    return { ...base, asin, fullUrl, resolvedAt: new Date().toISOString() };
  } catch (e) {
    return { ...base, asin: null, fullUrl: null, error: e.message };
  }
}

async function main() {
  const productsPath = path.resolve(ROOT, getFlag('products', 'src/data/topProducts.json'));
  const outPath = path.resolve(ROOT, getFlag('out', 'data/amazon-asin-map.json'));

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  if (!Array.isArray(products)) {
    console.error(`ERROR: ${productsPath} is not a JSON array`);
    process.exit(1);
  }

  const results = [];
  for (const p of products) {
    const r = await resolveProduct(p);
    results.push(r);
    if (r.asin) {
      console.error(`[ok] ${r.id} ${r.name} -> ${r.asin}`);
    } else {
      console.error(`[fail] ${r.id} ${r.name}: ${r.error}`);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');

  const ok = results.filter((r) => r.asin).length;
  const failures = results.filter((r) => !r.asin);
  const failSummary = failures.length
    ? failures.map((r) => `${r.id}:${r.error}`).join('; ')
    : 'none';
  console.log(`Resolved ${ok}/${results.length} products. Failures: ${failSummary}`);
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(`FATAL: ${e.message}`);
  process.exit(2);
});
