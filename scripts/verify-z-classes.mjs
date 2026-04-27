#!/usr/bin/env node
/**
 * Verifies every z-* Tailwind class used in source actually exists in compiled CSS.
 * Catches the v3→v4 silent-ignore class of bug (e.g. `z-header` → `z-auto`)
 * that we shipped for ~6 months because tailwind.config.js theme.extend.zIndex
 * is silently ignored by Tailwind v4.
 *
 * Runs in `npm run build` between `vite build` and prerender, so:
 *   - dist/ exists and the compiled CSS is fresh
 *   - the build fails fast if the scale is broken
 *   - Vercel naturally enforces the gate (build runs in CI)
 *
 * Allowlist: stock Tailwind defaults that always exist (z-0, z-10, ..., z-50, z-auto).
 * Custom names (z-header, z-modal, etc.) MUST come from src/App.css @theme block.
 *
 * Refs: docs/layering-strategy-2026-04-27/A7-lint-static.md (rule #1)
 *       PR #341 (the silent-ignore incident this prevents)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST_CSS_DIR = join(ROOT, 'dist', 'assets');
const SRC_DIR = join(ROOT, 'src');

const BUILTIN = new Set([
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto',
]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(jsx?|tsx?|html|mdx?)$/.test(name)) out.push(p);
  }
  return out;
}

// To avoid false positives from "z-index" (CSS prop name) or slugs like
// "gen-z-mental-health-...", we ONLY scan inside className-like contexts:
//   className="..." | className={'...'} | className={`...`} | class="..."
// Then within each match, we extract z-* tokens.
const CLASS_CTX = /(?:className|class)\s*=\s*(?:["'`]([^"'`]+)["'`]|\{[^}]*?["'`]([^"'`]+)["'`][^}]*?\})/g;
// Within a className string, match z-NAME (excluding "z-index" which is a CSS
// prop name that sometimes leaks into class strings) or z-[ARBITRARY].
const Z_TOKEN = /\bz-(?!index\b)([a-z][a-z0-9-]*|\[[^\]]+\])\b/g;

function extractZTokens(content, dest) {
  for (const m of content.matchAll(CLASS_CTX)) {
    const cls = m[1] || m[2] || '';
    for (const z of cls.matchAll(Z_TOKEN)) dest.add(z[0]);
  }
}

const used = new Set();
let filesScanned = 0;
for (const file of walk(SRC_DIR)) {
  filesScanned++;
  extractZTokens(readFileSync(file, 'utf8'), used);
}
try {
  extractZTokens(readFileSync(join(ROOT, 'index.html'), 'utf8'), used);
} catch {
  /* optional */
}

let cssFiles = [];
try {
  cssFiles = readdirSync(DIST_CSS_DIR).filter((f) => f.endsWith('.css'));
} catch (e) {
  console.error('[verify-z-classes] dist/assets/ not found - run `vite build` first');
  process.exit(1);
}
const compiledCss = cssFiles
  .map((f) => readFileSync(join(DIST_CSS_DIR, f), 'utf8'))
  .join('\n');

const missing = [];
for (const cls of used) {
  if (BUILTIN.has(cls)) continue;
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ruleRe = new RegExp('\\.' + escaped + '\\s*\\{');
  if (!ruleRe.test(compiledCss)) missing.push(cls);
}

if (missing.length) {
  console.error(
    '\n[verify-z-classes] FAIL - these z-* classes are used in source but absent from dist/ CSS:',
  );
  for (const m of missing.sort()) console.error('  ' + m);
  console.error(
    '\nLikely cause: missing token in `src/App.css` `@theme inline { --z-index-* }` block.',
  );
  console.error('Tailwind v4 generates `.z-NAME` utilities only from `@theme`, not from');
  console.error('`tailwind.config.js theme.extend.zIndex` (silently ignored in v4).');
  console.error('\nFiles scanned: ' + filesScanned + '. CSS bundles: ' + cssFiles.length + '.\n');
  process.exit(1);
}

console.log(
  '[verify-z-classes] OK - ' + used.size + ' z-* classes verified against compiled CSS (' + filesScanned + ' files, ' + cssFiles.length + ' CSS bundles).',
);
