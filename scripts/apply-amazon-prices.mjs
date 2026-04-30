#!/usr/bin/env node
/**
 * apply-amazon-prices.mjs
 *
 * Applies scraped Amazon prices (data/amazon-prices.json) to the canonical
 * product file (src/data/topProducts.json), keyed by asin via the resolver
 * map (data/amazon-asin-map.json).
 *
 * Idempotent: re-running with the same scrape data is a no-op.
 *
 * Usage:
 *   node scripts/apply-amazon-prices.mjs
 *   node scripts/apply-amazon-prices.mjs --dry-run
 *   node scripts/apply-amazon-prices.mjs --allow-large-changes
 *   node scripts/apply-amazon-prices.mjs --prices=data/amazon-prices.json \
 *                                        --products=src/data/topProducts.json \
 *                                        --asin-map=data/amazon-asin-map.json
 *
 * Refs: see scripts/check-mass-edit.mjs and scripts/dcni-bucket.mjs for style.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const LARGE_CHANGE_THRESHOLD = 0.5; // 50%

// --- CLI ---

function parseArgs(argv) {
  const args = {
    prices: 'data/amazon-prices.json',
    products: 'src/data/topProducts.json',
    asinMap: 'data/amazon-asin-map.json',
    dryRun: false,
    allowLargeChanges: false,
  };
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--allow-large-changes') args.allowLargeChanges = true;
    else if (a.startsWith('--prices=')) args.prices = a.slice('--prices='.length);
    else if (a.startsWith('--products=')) args.products = a.slice('--products='.length);
    else if (a.startsWith('--asin-map=')) args.asinMap = a.slice('--asin-map='.length);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/apply-amazon-prices.mjs [--prices=PATH] [--products=PATH] [--asin-map=PATH] [--dry-run] [--allow-large-changes]');
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

// --- Helpers ---

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function parsePrice(s) {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function pctDelta(oldVal, newVal) {
  if (oldVal == null || newVal == null || oldVal === 0) return null;
  return Math.abs(newVal - oldVal) / oldVal;
}

function fmtDelta(oldStr, newStr) {
  const o = parsePrice(oldStr);
  const n = parsePrice(newStr);
  if (o == null || n == null) return '-';
  const diff = n - o;
  const sign = diff >= 0 ? '+' : '-';
  const pct = o === 0 ? 0 : (diff / o) * 100;
  return `${sign}$${Math.abs(diff).toFixed(2)} (${diff >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

// --- Main ---

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pricesPath = path.resolve(ROOT, args.prices);
  const productsPath = path.resolve(ROOT, args.products);
  const asinMapPath = path.resolve(ROOT, args.asinMap);

  for (const [label, p] of [['prices', pricesPath], ['products', productsPath], ['asin-map', asinMapPath]]) {
    if (!fs.existsSync(p)) {
      console.error(`ERROR: ${label} file not found: ${p}`);
      process.exit(2);
    }
  }

  const prices = readJSON(pricesPath);
  const products = readJSON(productsPath);
  const asinMap = readJSON(asinMapPath);

  if (!Array.isArray(products)) {
    console.error(`ERROR: ${productsPath} must be a JSON array`);
    process.exit(2);
  }
  if (!Array.isArray(asinMap)) {
    console.error(`ERROR: ${asinMapPath} must be a JSON array`);
    process.exit(2);
  }

  const asinByProductId = new Map();
  for (const row of asinMap) {
    if (row && row.id != null && row.asin) asinByProductId.set(row.id, row.asin);
  }

  const rows = [];
  const warnings = [];
  const errors = [];
  let changedCount = 0;

  for (const product of products) {
    const asin = asinByProductId.get(product.id);
    const oldPrice = product.price;
    const oldPps = product.pricePerServing;

    if (!asin) {
      warnings.push(`product id=${product.id} (${product.name}): no asin in asin-map; left unchanged`);
      rows.push({ name: product.name, oldPrice, newPrice: oldPrice, status: 'no-asin' });
      continue;
    }

    const scrape = prices[asin];
    if (!scrape || !scrape.price) {
      warnings.push(`product id=${product.id} (${product.name}, asin=${asin}): no price in scrape data; left unchanged`);
      rows.push({ name: product.name, oldPrice, newPrice: oldPrice, status: 'no-price' });
      continue;
    }

    const newPrice = scrape.price;
    const oldNum = parsePrice(oldPrice);
    const newNum = parsePrice(newPrice);
    // pricePerServing is computed from price ÷ servings, not scraped.
    // Amazon's "$X.XX/count" text often refers to per-capsule, while our
    // `servings` field is per-serving (multi-capsule). Computing locally is
    // correct by construction.
    const newPps = (newNum != null && product.servings)
      ? '$' + (newNum / product.servings).toFixed(2)
      : null;

    if (newNum == null) {
      warnings.push(`product id=${product.id} (${product.name}, asin=${asin}): unparseable scrape price "${newPrice}"; left unchanged`);
      rows.push({ name: product.name, oldPrice, newPrice: oldPrice, status: 'unparseable' });
      continue;
    }

    const delta = pctDelta(oldNum, newNum);
    if (delta != null && delta > LARGE_CHANGE_THRESHOLD && !args.allowLargeChanges) {
      errors.push(
        `product id=${product.id} (${product.name}, asin=${asin}): price change ${oldPrice} -> ${newPrice} ` +
        `is ${(delta * 100).toFixed(1)}% (>${LARGE_CHANGE_THRESHOLD * 100}%). ` +
        `Pass --allow-large-changes to override.`
      );
      continue;
    }

    const priceChanged = newPrice !== oldPrice;
    const ppsChanged = newPps != null && newPps !== oldPps;

    if (priceChanged) product.price = newPrice;
    if (ppsChanged) product.pricePerServing = newPps;

    if (priceChanged || ppsChanged) changedCount++;

    rows.push({
      name: product.name,
      oldPrice,
      newPrice: product.price,
      status: priceChanged || ppsChanged ? 'updated' : 'no-change',
    });
  }

  // Render summary table
  const nameWidth = Math.max(8, ...rows.map(r => r.name.length));
  const oldWidth = Math.max(9, ...rows.map(r => String(r.oldPrice).length));
  const newWidth = Math.max(9, ...rows.map(r => String(r.newPrice).length));
  const sep = '-'.repeat(nameWidth + oldWidth + newWidth + 24 + 11);
  console.log(sep);
  console.log(`${pad('Product', nameWidth)}  ${pad('Old', oldWidth)}  ${pad('New', newWidth)}  ${pad('Delta', 24)}  Status`);
  console.log(sep);
  for (const r of rows) {
    const delta = r.status === 'updated' ? fmtDelta(r.oldPrice, r.newPrice) : '-';
    console.log(`${pad(r.name, nameWidth)}  ${pad(r.oldPrice, oldWidth)}  ${pad(r.newPrice, newWidth)}  ${pad(delta, 24)}  ${r.status}`);
  }
  console.log(sep);
  console.log(`Updated: ${changedCount}/${products.length} products`);

  if (warnings.length) {
    console.warn('\nWarnings:');
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  if (errors.length) {
    console.error('\nERRORS (aborting, no file written):');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('\n[dry-run] No file written.');
    return;
  }

  if (changedCount === 0) {
    console.log('\nNo changes — file not rewritten.');
    return;
  }

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2) + '\n');
  console.log(`\nWrote ${productsPath}`);
}

main();
