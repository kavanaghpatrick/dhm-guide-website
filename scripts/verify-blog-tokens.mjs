#!/usr/bin/env node
/**
 * Verifies the blog's editorial design tokens actually EMIT in the built CSS.
 *
 * Modeled on scripts/verify-z-classes.mjs (Pattern #15: silent build regressions
 * are caught by testing the OUTPUT, not the source). Run after `vite build`:
 *
 *   node scripts/verify-blog-tokens.mjs            # reads dist/assets/*.css
 *   DIST_DIR=/some/out node scripts/verify-blog-tokens.mjs
 *
 * CONTRACT (from the blog design brief, sections 2.2 to 2.5). Every token below
 * must be declared on `.theme-modern` in src/styles/theme-modern.css with exactly
 * this value. Changing the scale means editing this file on purpose.
 *
 *   Type scale     --text-display .. --text-label  (section 2.2)
 *   Measure        --measure-prose 36em, --measure-lead 30em, --measure-wide 46rem (2.5)
 *   Palette        one ink, one accent, one conversion colour (2.3)
 *   Rhythm         --l (one 30px body line) and --s0..--s4 multiples of it (2.4)
 *   Classes        type-scale utilities .t-display .. .t-label, plus the post
 *                  template hooks .article-body .post-title .post-lead .post-meta
 *
 * Values are compared after normalising both sides the way the minifier does:
 * lower-case, whitespace removed, leading "0." shortened to ".".
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST_CSS_DIR = join(process.env.DIST_DIR || join(ROOT, 'dist'), 'assets');

export const TOKENS = {
  // 2.2 type scale
  '--text-display':    'clamp(2.5rem, 1.75rem + 3vw, 4.25rem)',
  '--text-title':      'clamp(2.125rem, 1.6rem + 2.1vw, 3.25rem)',
  '--text-heading':    'clamp(1.625rem, 1.35rem + 1.1vw, 2.125rem)',
  '--text-subheading': 'clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)',
  '--text-lead':       'clamp(1.25rem, 1.17rem + 0.35vw, 1.4375rem)',
  '--text-body':       'clamp(1.125rem, 1.09rem + 0.15vw, 1.1875rem)',
  '--text-small':      '1rem',
  '--text-label':      '0.8125rem',
  // 2.5 measure
  '--measure-prose':   '36em',
  '--measure-lead':    '30em',
  '--measure-wide':    '46rem',
  // 2.3 palette
  '--color-paper':       '#FAF8F4',
  '--color-ink':         '#1A1D1A',
  '--color-ink-soft':    '#4A4E48',
  '--color-rule':        '#E7E3DB',
  '--color-accent':      '#166534',
  '--color-accent-soft': '#ECF3EE',
  '--color-star':        '#E8A317',
  // 2.4 rhythm
  '--l':   '1.875rem',
  '--s0':  'calc(var(--l) * 0.5)',
  '--s1':  'var(--l)',
  '--s1h': 'calc(var(--l) * 1.5)',
  '--s2':  'calc(var(--l) * 2)',
  '--s3':  'calc(var(--l) * 3)',
  '--s4':  'calc(var(--l) * 4)',
  // Fonts: the blog uses the same native system stack as the rest of the site.
  '--font-display': '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  '--font-sans':    '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

// Present with any value (the CTA colour is the owner's call, brief 2.3).
export const TOKENS_ANY_VALUE = ['--color-cta', '--color-on-cta'];

export const CLASSES = [
  't-display', 't-title', 't-heading', 't-subheading',
  't-lead', 't-body', 't-small', 't-label',
  'article-body', 'post-title', 'post-lead', 'post-meta',
];

const norm = (v) =>
  v.toLowerCase().replace(/\s+/g, '').replace(/(^|[^0-9.])0\.(\d)/g, '$1.$2');

let cssFiles;
try {
  cssFiles = readdirSync(DIST_CSS_DIR).filter((f) => f.endsWith('.css'));
} catch {
  console.error('[verify-blog-tokens] ' + DIST_CSS_DIR + ' not found - run `vite build` first');
  process.exit(1);
}
const css = cssFiles.map((f) => readFileSync(join(DIST_CSS_DIR, f), 'utf8')).join('\n');

// Every declared value of each custom property, normalised.
function declared(name) {
  const esc = name.replace(/[-]/g, '\\-');
  const re = new RegExp('(?:^|[;{\\s])' + esc + '\\s*:\\s*([^;}]+)', 'g');
  return [...css.matchAll(re)].map((m) => norm(m[1]));
}

const failures = [];
for (const [name, want] of Object.entries(TOKENS)) {
  const got = declared(name);
  if (!got.length) failures.push(`${name}: missing (want ${want})`);
  else if (!got.includes(norm(want))) failures.push(`${name}: got ${[...new Set(got)].join(' | ')}, want ${want}`);
}
for (const name of TOKENS_ANY_VALUE) {
  if (!declared(name).length) failures.push(`${name}: missing`);
}
for (const cls of CLASSES) {
  if (!new RegExp('\\.' + cls + '(?![\\w-])').test(css)) failures.push(`.${cls}: class absent from built CSS`);
}
// No self-hosted web fonts: the Fraunces/Inter faces were removed on purpose.
if (/@font-face[^}]*(fraunces|inter variable)/i.test(css)) failures.push('@font-face for Fraunces/Inter found in built CSS');
if (failures.length) {
  console.error('\n[verify-blog-tokens] FAIL - ' + failures.length + ' editorial token problems in built CSS:');
  for (const f of failures) console.error('  ' + f);
  console.error('\nTokens live on .theme-modern in src/styles/theme-modern.css (see the contract above).');
  console.error('CSS bundles checked: ' + cssFiles.length + ' in ' + DIST_CSS_DIR + '\n');
  process.exit(1);
}
console.log(
  '[verify-blog-tokens] OK - ' + Object.keys(TOKENS).length + ' tokens and ' + CLASSES.length +
    ' classes verified against ' + cssFiles.length + ' CSS bundles.',
);
