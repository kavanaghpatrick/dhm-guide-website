# A7 — Static-Analysis & Lint Strategy for z-index / Stacking-Context Anti-Patterns

**Date:** 2026-04-27
**Author:** A7 (lint-strategy agent)
**Stack:** React 19 + Vite 6 + Tailwind v4.1.7 + ESLint flat config
**Goal:** Catch the four bugs we shipped in PR review — *before* they merge.

---

## TL;DR — Ranked by ROI

| # | Rule | Catches | Cost | Maintenance | Verdict |
|---|------|---------|------|-------------|---------|
| **1** | **CI build-time check: `verify-z-classes.mjs`** | Bug #1 (silent v3→v4 ignore) | 30 min | ~0 hrs/yr | **SHIP FIRST** |
| **2** | **`no-restricted-syntax` — ban `z-` literal numbers in JSX** | Bug #3 (z-50 instead of z-modal) | 15 min | ~0 hrs/yr | **SHIP** |
| **3** | **`no-restricted-syntax` — ban transform/opacity/filter on layout shells** | Bug #2 (trapped stacking context) | 30 min | ~1 hr/yr | **SHIP** |
| **4** | **`eslint-plugin-better-tailwindcss` `no-unregistered-classes`** | Bug #1 (subset, in-editor) | 60 min | ~2 hrs/yr | **SHIP (warn only)** |
| 5 | Stylelint `z-index-value-constraint` on raw CSS | Bug #4 (duplicate values in CSS files) | 45 min | ~1 hr/yr | **DEFER** — only 6 raw CSS files; low ROI |
| 6 | Custom ESLint rule: dedupe `z-` token usage across files | Bug #4 (duplicates in JSX) | 4-6 hrs | ~3 hrs/yr | **DEFER** — over-engineered for the bug |

**Total to ship rules 1-4: ~2.25 dev-hours.** All are pure additions/configs; zero code changes to runtime.

---

## 1. The Bug Inventory (what we're trying to catch)

| # | Bug we shipped | What lint should catch |
|---|----------------|------------------------|
| 1 | `<header className="z-header">` resolved to `z-auto` because `tailwind.config.js` was a no-op in v4 | Any `z-*` class in JSX/CSS that does **not** exist in compiled CSS |
| 2 | `style={{ opacity: headerOpacity }}` on `<header>` trapped its descendants' stacking contexts | `transform`, `opacity != 1`, `filter`, `will-change`, `backdrop-filter` applied to a known layout-shell element (`<header>`, `<main>`, `<App>`, `Layout`) |
| 3 | Raw `z-50` literals leaked into 21 sites, defeating semantic naming | Any `z-{number}` in JSX outside the allowlist (`z-0`, `z-auto`) |
| 4 | Multiple components reused `z-50`, `z-10` with different intent → collision risk | Duplicate numeric `z-index` values across components/files |

---

## 2. Ecosystem Survey — what already exists

### 2.1 `eslint-plugin-tailwindcss` (francoismassart) — **partial fit**

- Has `no-custom-classname` rule that flags any class not in Tailwind's catalog.
- **Tailwind v4 support is "beta / partial"** — it can't read `@theme` blocks reliably, so our custom `--z-index-*` tokens would all fire as false positives.
- ([npm](https://www.npmjs.com/package/eslint-plugin-tailwindcss), [v4 issue #325](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325))
- **Verdict:** Skip. Wrong tool for v4.

### 2.2 `eslint-plugin-better-tailwindcss` (schoero) — **best fit for Bug #1**

- Has `no-unregistered-classes` rule (a.k.a. `no-unknown-classes`) that **does** support v4 via the `entryPoint` setting — it actually parses your CSS file.
- Reads `@theme inline { --z-* }` and surfaces `z-header` etc. as registered. So `z-header` typo'd as `z-haedr` → ESLint error.
- Performance caveat: ~1.2s extra lint time on big repos; acceptable. ([no-unknown-classes docs](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unknown-classes.md))
- **Verdict:** Ship as **warn**, not error (high false-positive risk on dynamic classnames from `cva` / template strings).

### 2.3 `@tailwindcss/lint` — **does not exist**

- Tailwind Labs has not shipped an official linter package. Tailwind IntelliSense (VS Code) does inline checking but is editor-only, not CI-enforceable. ([blog post](https://tailwindcss.com/blog/introducing-linting-for-tailwindcss-intellisense))
- **Verdict:** N/A.

### 2.4 `stylelint-z-index-value-constraint` — **wrong scope**

- Enforces a *numeric range* on raw CSS `z-index` values (e.g., 1–10).
- Doesn't help with named-token enforcement (we want `z-modal`, not `z-index: 50;`).
- Only relevant for the 6 raw CSS files in `src/`. JSX/Tailwind covers the other ~95% of z-index usage. ([npm](https://www.npmjs.com/package/stylelint-z-index-value-constraint))
- **Verdict:** Defer. Low ROI; bug class is in JSX, not raw CSS.

### 2.5 `eslint-plugin-react-perf` / `eslint-plugin-jsx-a11y` — **no relevant rules**

- Neither plugin has rules about CSS stacking, transform, or z-index. Confirmed via rule lists. ([eslint-plugin-react rules](https://www.npmjs.com/package/eslint-plugin-react))
- **Verdict:** N/A.

### 2.6 Custom `no-restricted-syntax` ESLint rules — **the right hammer for Bugs #2, #3**

- ESLint's built-in `no-restricted-syntax` accepts ESQuery selectors. It can match attribute *values* via regex.
- Cheap, zero plugin install, fully maintained by us.
- The catch: it operates on AST, so it can't follow `cva` calls or `clsx(...)` composition. Works for raw JSX `className="..."` — which is where these bugs surfaced.
- ([no-restricted-syntax docs](https://eslint.org/docs/latest/rules/no-restricted-syntax))
- **Verdict:** Ship.

---

## 3. The Four Rules to Ship (concrete configs)

### Rule 1 — CI build-time check: `scripts/verify-z-classes.mjs` (PRIMARY)

**Why this is rule #1:** This is the rule that *would have caught the actual bug*. It runs against the compiled `dist/` CSS, so it's immune to v4/v3 config drift — if `z-header` doesn't exist in the bundle, no other check matters.

**Catches:** Bug #1 (silent v3→v4 ignore), and any future regression where someone deletes a `--z-*` token but leaves a class reference.

**Approach:**
1. After `vite build`, scan source for every `className` containing `z-{word}` (or `z-{num}`).
2. Open `dist/assets/*.css` and check that every class in the source set has a corresponding `.z-{word}{z-index:...}` rule in the compiled CSS.
3. Exit non-zero if any miss → CI fails.

**Script (drop into `scripts/verify-z-classes.mjs`):**

```js
#!/usr/bin/env node
// Verifies every z-* Tailwind class used in source actually exists in compiled CSS.
// Catches the v3→v4 silent-ignore class of bug (e.g., `z-header` → `z-auto`).
import { readFileSync, readdirSync } from 'node:fs'
import { globSync } from 'node:fs'    // Node >=22; otherwise use 'glob' npm
import { join } from 'node:path'

const ROOT = process.cwd()
const DIST_CSS_DIR = join(ROOT, 'dist', 'assets')
const SRC_GLOBS = ['src/**/*.{js,jsx,ts,tsx,html}']

// Allowlist: built-in Tailwind values that always exist
const BUILTIN = new Set(['z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto'])

// 1. Collect every z-* class referenced in source (best-effort regex; matches className strings)
const Z_CLASS_RE = /\bz-[a-z][a-z0-9-]*\b/g  // names like z-header, z-modal, z-index-x (NOT z-50 numbers)
const Z_NUMERIC_RE = /\bz-(\d+|\[[^\]]+\])\b/g
const usedClasses = new Set()

for (const file of globSync(SRC_GLOBS)) {
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(Z_CLASS_RE)) usedClasses.add(m[0])
  for (const m of src.matchAll(Z_NUMERIC_RE)) usedClasses.add(m[0])
}

// 2. Read compiled CSS bundle(s)
const cssFiles = readdirSync(DIST_CSS_DIR).filter(f => f.endsWith('.css'))
const compiledCss = cssFiles.map(f => readFileSync(join(DIST_CSS_DIR, f), 'utf8')).join('\n')

// 3. For each used class, confirm a `.z-NAME{` rule exists in compiled CSS
const missing = []
for (const cls of usedClasses) {
  if (BUILTIN.has(cls)) continue
  // Escape brackets for arbitrary values: z-[100] → \.z-\[100\]\{
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleRe = new RegExp(`\\.${escaped}\\s*\\{`)
  if (!ruleRe.test(compiledCss)) missing.push(cls)
}

if (missing.length) {
  console.error('\n[verify-z-classes] FAIL — these z-* classes are used in source but absent from dist/ CSS:')
  for (const m of missing.sort()) console.error(`  ${m}`)
  console.error('\nLikely cause: missing token in src/App.css `@theme inline { --z-* }`.\n')
  process.exit(1)
}
console.log(`[verify-z-classes] OK — ${usedClasses.size} classes verified against compiled CSS.`)
```

**Wire-up:**

```jsonc
// package.json — append to "build"
{
  "scripts": {
    "build": "node scripts/validate-posts.js && node scripts/generate-blog-canonicals.js && node scripts/generate-sitemap.js && vite build && node scripts/verify-z-classes.mjs && node scripts/prerender-blog-posts-enhanced.js && node scripts/prerender-main-pages.js"
  }
}
```

This runs after `vite build` so `dist/` exists, and **before** prerender scripts (so we fail fast if the scale is broken). Vercel runs `npm run build` → CI naturally enforces.

**Pass example (after fix):**
- Source has `<header className="z-header">`
- `dist/assets/index-abc.css` contains `.z-header{z-index:var(--z-index-header)}`
- Script exits 0.

**Fail example (the bug we shipped):**
- Source has `<header className="z-header">`
- `tailwind.config.js` had v3 `theme.extend.zIndex` which v4 ignored
- `dist/assets/index-abc.css` has **no** `.z-header{` rule
- Script exits 1: ``[verify-z-classes] FAIL — these z-* classes are used in source but absent from dist/ CSS: z-header``
- Vercel deploy blocked.

**Cost:** ~30 min (script + wire-up + smoke test). **Maintenance:** ~0 hrs/yr — the script is platform-agnostic, no deps to update.

---

### Rule 2 — Ban literal `z-{number}` in JSX (use named tokens)

**Catches:** Bug #3 (Radix-style `z-50` literals leaking into application code).

**Where:** `eslint.config.js` `no-restricted-syntax` rule, scoped to non-`ui/` files (Radix primitives in `src/components/ui/` get a deliberate exception — they're vendored shadcn code).

**Config (add to `eslint.config.js`):**

```js
// eslint.config.js — extend the existing rules block
{
  files: ['**/*.{js,jsx}'],
  ignores: ['src/components/ui/**'],   // shadcn primitives use raw z-50 by design
  rules: {
    // ...existing rules...
    'no-restricted-syntax': ['error',
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/\\bz-\\d+\\b/]",
        message: "Use a named z-index token (e.g. `z-header`, `z-modal`) defined in src/App.css @theme. Raw z-{number} literals defeat the semantic scale. Allowed in src/components/ui/ only.",
      },
      {
        selector: "JSXAttribute[name.name='className'] TemplateElement[value.raw=/\\bz-\\d+\\b/]",
        message: "Use a named z-index token (see above).",
      },
    ],
  },
}
```

**Pass example:**
```jsx
<header className="fixed top-0 z-header">          // OK — named token
<div className="absolute z-tooltip">                // OK
```

**Fail example (would have caught Bug #3):**
```jsx
<header className="fixed top-0 z-50">              // ERROR
<div className={`absolute ${open ? 'z-50' : ''}`}> // ERROR (template literal)
```

**False-positive risk:** Low. The selector targets only `className` attributes; arbitrary strings elsewhere (`docs`, comments, `aria-label`) are not matched. If shadcn copies new primitives in, they live in `src/components/ui/` and are pre-allowlisted.

**Cost:** ~15 min. **Maintenance:** ~0 hrs/yr — ESLint built-in rule, no plugin to update.

---

### Rule 3 — Ban `transform` / `opacity` / `filter` / `will-change` / `backdrop-filter` on layout shells

**Catches:** Bug #2 (the exact `style={{ opacity: headerOpacity }}` on `<header>` that trapped the dropdown's stacking context).

**Strategy:** AST-match JSX where:
- `<header>`, `<main>`, `<Layout>`, `<App>` is the element name **OR** the file path is `src/components/layout/**`.
- The element has a `style` prop containing `transform`, `opacity`, `filter`, `willChange`, or `backdropFilter`.
- The element has a `className` prop containing `transform-`, `opacity-`, `filter-`, `will-change-`, `backdrop-`.

**Config:**

```js
// eslint.config.js — append to rules
'no-restricted-syntax': ['error',
  // ...rules from Rule 2...

  // 3a. style={{ opacity / transform / filter / willChange / backdropFilter }} on layout shell
  {
    selector: "JSXOpeningElement[name.name=/^(header|main)$/] JSXAttribute[name.name='style'] Property[key.name=/^(opacity|transform|filter|willChange|backdropFilter)$/]",
    message: "Do NOT set transform/opacity/filter/will-change/backdrop-filter on <header> or <main>. These create a stacking context that traps `position:fixed` descendants (see docs/layering-audit-2026-04-26/L2-stacking-contexts.md). Animate a child element instead, or change bg-white/N for the visual effect.",
  },
  {
    selector: "JSXOpeningElement[name.name=/^(Layout|App)$/] JSXAttribute[name.name='style'] Property[key.name=/^(opacity|transform|filter|willChange|backdropFilter)$/]",
    message: "Do NOT set transform/opacity/filter/will-change/backdrop-filter on <Layout> or <App>. (Same reason as above.)",
  },

  // 3b. className with transform-/opacity-/filter-/will-change-/backdrop- utilities on layout shell
  {
    selector: "JSXOpeningElement[name.name=/^(header|main|Layout|App)$/] JSXAttribute[name.name='className'] Literal[value=/\\b(transform|opacity-(?!100)|filter|will-change|backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia))\\b/]",
    message: "Tailwind transform/opacity/filter/backdrop-* utility on <header>/<main>/<Layout>/<App> creates a stacking context — descendants with position:fixed will be clipped by ancestor scroll. See L2-stacking-contexts.md.",
  },
],
```

**Pass example:**
```jsx
<header className="fixed top-0 bg-white/95 z-header">     // OK — bg-opacity does NOT create context
<motion.div className="opacity-50">                       // OK — not a layout shell
```

**Fail example (the actual bug):**
```jsx
<motion.header style={{ opacity: headerOpacity }}>        // ERROR
<header className="transform translate-y-0">              // ERROR
<header className="backdrop-blur-md">                     // ERROR (yes, backdrop-blur traps)
<main className="filter brightness-95">                   // ERROR
```

**False-positive risk:** Medium. We deliberately exempt `opacity-100` (no-op) but `opacity-95` will fire — that's intentional, since *any* opacity ≠1 makes the context. If a designer genuinely wants a translucent header, they must consciously override with an `eslint-disable-next-line` comment, which is exactly the friction we want.

**Note on `motion.header`:** The selector `JSXOpeningElement[name.name=/^(header)$/]` matches plain `<header>` but **not** `<motion.header>` (which has `name.type === 'JSXMemberExpression'`). For framer-motion coverage, add a second selector:

```js
{
  selector: "JSXOpeningElement[name.type='JSXMemberExpression'][name.property.name=/^(header|main)$/] JSXAttribute[name.name='style']",
  message: "framer-motion <motion.header> with inline style is suspect — verify no transform/opacity/filter. See L2-stacking-contexts.md.",
},
```

This is a coarser warn (matches *any* style prop on `motion.header`), but it's the bug pattern that bit us.

**Cost:** ~30 min (write selectors, test against `Layout.jsx` to confirm fail-then-pass). **Maintenance:** ~1 hr/yr — refactor selectors if we add new layout shell components.

---

### Rule 4 — `eslint-plugin-better-tailwindcss` `no-unregistered-classes` (warn)

**Catches:** Bug #1 in-editor (before CI). Complement to Rule 1.

**Why warn (not error):** This plugin parses our CSS and JSX statically. It will false-positive on:
- `cva()` / `clsx()` composition where class strings live in non-`className` props.
- Template literals built from variables.
- `tailwind-merge` runtime classes.

**Install:**
```bash
npm i -D eslint-plugin-better-tailwindcss
```

**Config (extend `eslint.config.js`):**

```js
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default [
  // ...existing config...
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/App.css',   // <-- v4: parse @theme tokens from here
      },
    },
    rules: {
      'better-tailwindcss/no-unregistered-classes': ['warn', {
        // Allow our cva/cn helpers and tailwind-merge runtime classes
        ignore: ['^cn-', '^cva-'],
      }],
    },
  },
]
```

**Pass example:**
```jsx
<header className="z-header">              // OK — z-header registered via @theme
```

**Fail example (typo):**
```jsx
<header className="z-haedr">                // WARN — class not in registry
<header className="z-fooobar">              // WARN
```

**Cost:** ~60 min (install + config + tune false positives). **Maintenance:** ~2 hrs/yr (occasional plugin updates, may need to add ignores when shadcn adds new primitives).

---

## 4. Build-time check vs lint — division of labor

| Check | Runs when | Catches | Speed |
|-------|-----------|---------|-------|
| **Rule 1 (verify-z-classes.mjs)** | `npm run build` (CI/Vercel) | Real ground truth — class actually missing in dist CSS | ~50 ms |
| **Rule 4 (better-tailwindcss)** | `npm run lint` + IDE | Same bug, but in editor before commit | ~1.2 s |
| **Rules 2, 3 (no-restricted-syntax)** | `npm run lint` + IDE | JSX patterns (literals, layout-shell traps) | <100 ms |

**Rule 1 is authoritative**; the others are early-warning. If Rule 4 false-positives we can disable it; Rule 1 cannot lie because it tests the actual build output.

**Add a npm script for local dev:**
```jsonc
{
  "scripts": {
    "lint": "eslint .",
    "verify-z": "node scripts/verify-z-classes.mjs",
    "check": "npm run lint && npm run build"
  }
}
```

---

## 5. What we explicitly chose NOT to ship (and why)

| Idea | Reason rejected |
|------|----------------|
| Stylelint with `z-index-value-constraint` | Only 6 raw CSS files in repo. The bug class is in JSX/Tailwind, not authored CSS. Setting up Stylelint = +1 lint pipeline for marginal coverage. Apply the [Pattern #11 lesson](../../CLAUDE.md): one source of truth. |
| Custom ESLint rule for "duplicate z-index across files" (Bug #4) | This is a 4-6 hr build for a bug that named tokens (Rule 2) eliminates structurally. If we have `z-modal=60` and `z-popover=70` and one component uses each, the duplicate problem doesn't exist. Solving Bug #3 dissolves Bug #4. |
| `eslint-plugin-tailwindcss` (francoismassart) | v4 support is partial; `@theme` tokens not understood; will false-positive `z-header`. `better-tailwindcss` is the v4-aware fork. |
| Pre-commit hook running `verify-z-classes.mjs` | Build is already on CI. Adding a Husky hook = forcing a 30-second build before every commit. Friction > value. |
| Custom rule to enforce `--z-*` tokens are sequential / non-overlapping | The existing scale in `src/App.css` is hand-tuned (header=40, dropdown=50, modal=60). Auto-enforcement would lock us out of legitimate edits. Code review covers this. |

---

## 6. Final eslint.config.js (drop-in)

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default [
  { ignores: ['dist'] },

  // Base config (existing)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': { entryPoint: 'src/App.css' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // === Layering rules (A7) ===
      'better-tailwindcss/no-unregistered-classes': ['warn', { ignore: ['^cn-', '^cva-'] }],

      'no-restricted-syntax': ['error',
        // Rule 2: ban z-{number} literals
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bz-\\d+\\b/]",
          message: "Use a named z-index token (z-header, z-modal, etc.) defined in src/App.css @theme. See docs/layering-strategy-2026-04-27/A7-lint-static.md.",
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateElement[value.raw=/\\bz-\\d+\\b/]",
          message: "Use a named z-index token (z-header, z-modal, etc.) — no raw z-{number} in template strings.",
        },

        // Rule 3a: style={{ opacity / transform / filter / willChange / backdropFilter }} on layout shells
        {
          selector: "JSXOpeningElement[name.name=/^(header|main|Layout|App)$/] JSXAttribute[name.name='style'] Property[key.name=/^(opacity|transform|filter|willChange|backdropFilter)$/]",
          message: "Do NOT set transform/opacity/filter/will-change/backdrop-filter on layout shells — creates a stacking context that traps fixed descendants. See docs/layering-audit-2026-04-26/L2-stacking-contexts.md.",
        },

        // Rule 3a-bis: framer-motion variant
        {
          selector: "JSXOpeningElement[name.type='JSXMemberExpression'][name.property.name=/^(header|main)$/] JSXAttribute[name.name='style']",
          message: "<motion.header>/<motion.main> with inline style is high-risk for stacking-context trap. Verify no transform/opacity/filter, and prefer animating a non-shell child.",
        },

        // Rule 3b: Tailwind utility class form
        {
          selector: "JSXOpeningElement[name.name=/^(header|main|Layout|App)$/] JSXAttribute[name.name='className'] Literal[value=/\\b(transform|opacity-(?!100\\b)\\d+|filter|will-change|backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia))\\b/]",
          message: "Tailwind transform/opacity/filter/backdrop utility on layout shell creates a stacking context. Move animation to a non-shell child.",
        },
      ],
    },
  },

  // shadcn primitives are vendored — they use raw z-50 literals by design
  {
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'no-restricted-syntax': 'off',
      'better-tailwindcss/no-unregistered-classes': 'off',
    },
  },
]
```

---

## 7. Estimated Total Effort

| Phase | Hours |
|-------|-------|
| Write `verify-z-classes.mjs` + wire into build | 0.5 |
| Add no-restricted-syntax rules + smoke-test against existing repo | 0.75 |
| Install + configure `better-tailwindcss` | 1.0 |
| Tune false positives, document escape hatches in CLAUDE.md | 0.5 |
| **Total to ship** | **~2.75 hrs** |
| **Annual maintenance** | **~3 hrs/yr** |

---

## 8. Specific Catch on the v3→v4 Silent-Ignore Bug

**The bug:** `tailwind.config.js` v3 syntax (`theme.extend.zIndex`) was silently ignored by Tailwind v4, so `z-header` resolved to `z-auto`. The bug shipped because:
- The class name *looked* defined (it was, in v3-style config).
- The compiled CSS had **no** `.z-header { ... }` rule, but nothing checked.
- The header still rendered (just at `z-auto`), so visual QA missed it until comparison-page images scrolled over the header.

**What Rule 1 catches:**
```
[verify-z-classes] FAIL — these z-* classes are used in source but absent from dist/ CSS:
  z-header
  z-modal

Likely cause: missing token in src/App.css `@theme inline { --z-* }`.
```
Vercel build fails. Bug never reaches preview, let alone production.

**What Rule 4 catches (in editor, before commit):**
- VS Code shows a yellow squiggly under `z-header` in `Layout.jsx` line 87 within seconds of saving.
- Developer fixes the `@theme` block before opening the PR.

**Together: defense in depth.** Rule 1 is the safety net (cannot be fooled — tests actual build output). Rule 4 is the smoke detector (warns at dev time, before CI even runs).

---

## 9. Rollout Order

1. **Day 1, hour 1:** Land `verify-z-classes.mjs` + wire into `npm run build`. Single PR, ~30 min. **This is the ratchet** — once it's in, the v3→v4 bug class is structurally impossible to ship.
2. **Day 1, hour 2:** Add the three `no-restricted-syntax` selectors to `eslint.config.js`. Run `npm run lint` — fix any pre-existing violations (likely 0–3, since L5 already cleaned the codebase).
3. **Day 2:** Add `eslint-plugin-better-tailwindcss` as warn. Triage false positives over a week, tune `ignore` patterns. Promote to error only if false-positive rate < 5%.
4. **Day 3:** Add a section to `CLAUDE.md` documenting the lint contract:
   - "Never use raw `z-{number}` in JSX outside `src/components/ui/`."
   - "Never apply transform/opacity/filter/backdrop-* to layout shells."
   - "If a class is in `@theme`, it's a registered token."

That's the strategy.

---

**Sources:**
- [eslint-plugin-better-tailwindcss — no-unknown-classes](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unknown-classes.md)
- [ESLint no-restricted-syntax docs](https://eslint.org/docs/latest/rules/no-restricted-syntax)
- [Tailwind v4 @theme directive](https://tailwindcss.com/docs/theme)
- [eslint-plugin-tailwindcss v4 issue #325](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325)
- [stylelint-z-index-value-constraint](https://www.npmjs.com/package/stylelint-z-index-value-constraint)
