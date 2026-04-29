# Tailwind v3 → v4 Migration Audit

**Date:** 2026-04-26
**Trigger:** PR #341 fixed silent `theme.extend.zIndex` failure (12 z-tokens generated zero CSS for ~6 months). Audit looked for similar silent failures elsewhere.

**Verdict:** **CLEAN** — no remaining silent v3-isms. One harmless cleanup recommended (`tailwind.config.js` is dead code post-#341).

---

## Per-config-file audit

### `package.json`
- `tailwindcss@^4.1.7` (resolved 4.1.11)
- `@tailwindcss/vite@^4.1.7` (resolved 4.1.11)
- `tw-animate-css@^1.2.9` (resolved 1.3.4) — package.json description: *"TailwindCSS v4.0 compatible replacement for tailwindcss-animate"*. v4-compatible.
- **No legacy plugins installed:** zero matches for `@tailwindcss/typography`, `@tailwindcss/forms`, `@tailwindcss/aspect-ratio`, `@tailwindcss/container-queries`, `@tailwindcss/postcss`, `tailwindcss-animate`, `autoprefixer`. Clean.

### `vite.config.js`
- Uses `@tailwindcss/vite` plugin (line 12) — v4-canonical. No PostCSS chain. Clean.

### `postcss.config.{js,cjs,mjs}`
- **Does not exist.** Correct for v4 + `@tailwindcss/vite`. Clean.

### `tailwind.config.js` (post-#341)
- Stub file. Only contains `content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']`.
- **v4 ignores `content:`** — uses automatic source detection on the project root. The current paths happen to match v4's defaults, so behavior is identical, but the array does nothing.
- Header comment correctly documents `theme.extend` is silently ignored.
- **Severity:** cosmetic only. The file isn't loaded by `@tailwindcss/vite` at all (verified: no warnings on build). Recommend deleting in a future cleanup, but no urgency.

### `src/App.css` (the canonical Tailwind entry point)
- Line 1 `@import "tailwindcss"` — v4-canonical
- Line 2 `@import "tw-animate-css"` — v4-compat package
- Line 18 `@custom-variant dark (&:is(.dark *))` — v4-native
- Line 20 `@theme inline { ... }` — v4-native; contains 12 z-tokens (`--z-index-*`) and 30+ color tokens (`--color-*`). Build verified all 12 z-utilities and all color utilities generate.
- Lines 149-156 `@layer base { ... @apply ... }` — v4 still supports this; compiles to `*{border-color:var(--border);outline-color:var(--ring)}` correctly (verified in `dist/assets/index-Q8thjIxy.css`).

### `src/index.css`
- 580+ lines of plain CSS (touch optimization, enhanced typography, gradient fallback). Uses zero `@apply` / `@theme` / `@layer`. No Tailwind directives. Plain authored CSS — v3/v4 agnostic.

### `src/styles/calculator-enhancements.css`
- Plain CSS only. No Tailwind directives.

### `index.html`
- No inline Tailwind directives. Static `<style>` block contains hand-written critical CSS. Clean.

---

## v3-isms found

| # | Item | File:line | Severity | Status |
|---|------|-----------|----------|--------|
| 1 | `content:` array in `tailwind.config.js` is ignored by v4 | `tailwind.config.js:15` | Cosmetic — no functional impact | Document or delete the file |
| 2 | `theme.extend.zIndex` silent failure | (history) | High — caused stacking bug | **Fixed in PR #341** |

No v3-style `@tailwind base/components/utilities` directives found anywhere.
No `theme.extend` references found outside the stub file's own comments.

---

## Build verification

`npm run build` completed with zero Tailwind warnings or errors. Output CSS (178KB) confirms:
- All 12 z-utilities generated (`.z-base`, `.z-behind`, `.z-comparison`, `.z-dropdown`, `.z-fixed`, `.z-header`, `.z-modal`, `.z-notification`, `.z-overlay`, `.z-popover`, `.z-sticky`, `.z-tooltip`)
- `border-border` → `border-color:var(--border)` — works
- `outline-ring/50` → color-mix wrapper — works
- `bg-background`, `text-foreground`, `bg-primary` etc. all resolve via the `@theme inline` shim
- shadcn v4-native utilities (`shadow-xs`, `outline-hidden`, `rounded-xs`, `@container/card-header`) generate correctly
- No raw `@theme {`, `@apply`, or `@layer` directives leaked into compiled output

---

## v4-clean certification checklist (for future verification)

```
[x] CSS uses @import "tailwindcss" (NOT @tailwind base/components/utilities)
[x] Vite uses @tailwindcss/vite plugin (NOT postcss + tailwindcss + autoprefixer)
[x] No postcss.config.* file (or if present, uses @tailwindcss/postcss)
[x] All design tokens defined in @theme block in CSS (NOT in tailwind.config.js theme.extend)
[x] All Tailwind plugins are v4-compatible (typography ≥0.5.16, forms ≥0.5.10, etc.)
[x] tw-animate-css used instead of tailwindcss-animate (deprecated in v4)
[x] Build produces no warnings about deprecated/unknown config keys
[x] Custom z/color/font/radius utility classes appear in dist CSS
[ ] tailwind.config.js stub deleted (optional cleanup; harmless to keep)
```

When adding new design tokens going forward:
1. Add to `@theme inline { }` in `src/App.css` — never to `tailwind.config.js`
2. Use the v4 token namespace: `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--spacing-*`, `--z-*`/`--z-index-*`, `--breakpoint-*`, `--container-*`, `--animate-*`
3. Run `npm run build` and `grep` the generated CSS for the new utility class to confirm it exists
4. If a token is silently ignored (no class generated), it's almost certainly in `tailwind.config.js` instead of `@theme`

---

## Recommended follow-up (optional, low priority)

- Delete `tailwind.config.js` entirely. v4 + `@tailwindcss/vite` doesn't need it. Keeping it risks future contributors adding `theme.extend` thinking it works. The header comment helps but deletion is stronger.
