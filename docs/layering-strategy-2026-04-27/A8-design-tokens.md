# A8 — Design Tokens Strategy (2026-grade) for DHM Guide

**Date:** 2026-04-27
**Author:** Claude (research synthesis)
**Status:** Proposal
**Scope:** Comprehensive design-token strategy covering color, typography, spacing, animation, shadow, radius, border, and z-index — extending what shipped in PR #341 (z-index only).

---

## TL;DR

DHM Guide ships with `Tailwind v4 + @theme` infrastructure but uses only **~10% of its token capacity**: colors (mostly), z-index (just shipped), and radius. Typography, spacing, animation, and shadow are 100% stock-Tailwind utilities with no brand layer. The codebase has **~1,200+ hardcoded brand-color references** (455 text-, 353 bg/from/to-, 398 rounded-) that should be migrated to semantic tokens behind a 3-tier (reference → system → component) Material-3-style hierarchy.

This doc proposes a **3-phase migration**: Phase 1 (already done) z-index. Phase 2 (this month) semantic colors + animation + 80/20 typography. Phase 3 (next quarter) shadow elevation scale + full neutral scale + dark-mode parity.

---

## 1. Research Synthesis: 2025-2026 Design Token Landscape

### W3C Design Tokens Specification (DTCG 2025.10 — first stable, October 2025)

The W3C Design Tokens Community Group reached its first stable spec in October 2025. Key takeaways:

- **Eight primitive token types**: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `string`
- **Composite types** for shadows, gradients, borders, typography (combine multiple primitives)
- **Aliasing** via `{token.path}` references (curly-brace JSON-pointer syntax)
- **`$type`** property tags every token with its primitive type for cross-tool portability
- **Vendor-neutral JSON format** — designed to flow through Figma → Style Dictionary → Tailwind without translation

Implication for DHM Guide: even though we author tokens directly in CSS (`@theme`), our **naming and structure should mirror DTCG categories** so a future export to Figma/Style Dictionary is mechanical, not a rewrite.

### Material Design 3: Three-Tier Token Hierarchy

M3 popularized the **reference → system → component** pattern that everyone now copies:

| Tier | Example | Purpose |
|------|---------|---------|
| **Reference (`md.ref.*`)** | `md.ref.palette.green40` | Raw palette values. The actual oklch coordinates. |
| **System (`md.sys.*`)** | `md.sys.color.primary` | Semantic intent. "Primary brand color" — could be any green. |
| **Component (`md.comp.*`)** | `md.comp.fab.container.color` | Per-component bindings. FAB background = primary. |

**Why this matters**: components reference `md.sys.color.primary`, never `green40`. Swap the system token's pointer and the entire UI re-themes — that's how M3 supports light/dark/dynamic-color without component rewrites.

DHM Guide should adopt the same three-tier model with a Tailwind-v4 flavor:
- **Reference** = `--color-green-50` … `--color-green-950` (full ramp in `@theme`)
- **System** = `--color-brand`, `--color-accent`, `--color-success`, `--color-danger` (semantic, can be re-pointed)
- **Component** = `--color-cta-bg`, `--color-card-border`, `--color-link-text` (component-specific, point to system tokens)

### Tailwind v4 `@theme` Conventions

Per `tailwindcss.com/docs/theme` (fetched 2026-04-27):

**Default namespaces** (each generates utility classes):

| Namespace | Generates | Example |
|---|---|---|
| `--color-*` | bg-, text-, border-, ring-, fill-, stroke-, divide-, etc. | `--color-brand: oklch(...)` → `bg-brand` |
| `--font-*` | font-family | `--font-sans` → `font-sans` |
| `--text-*` | font-size + line-height | `--text-lead` → `text-lead` |
| `--font-weight-*` | font-weight | `--font-weight-bold` → `font-bold` |
| `--leading-*` | line-height | `--leading-tight` → `leading-tight` |
| `--tracking-*` | letter-spacing | `--tracking-wide` → `tracking-wide` |
| `--spacing-*` | p-, m-, gap-, w-, h-, etc. | `--spacing: 0.25rem` |
| `--radius-*` | rounded- | `--radius-md: 0.5rem` → `rounded-md` |
| `--shadow-*` | shadow- | `--shadow-md: ...` → `shadow-md` |
| `--ease-*` | transition-timing-function | `--ease-out` → `ease-out` |
| `--animate-*` | animation | `--animate-spin` → `animate-spin` |
| `--breakpoint-*` | sm: md: lg: variants | `--breakpoint-md: 48rem` |
| `--container-*` | max-w- | `--container-prose: 65ch` |
| `--blur-*` | blur- | `--blur-sm` |
| `--aspect-*` | aspect- | `--aspect-video: 16/9` |
| `--z-index-*` | z- (already used in PR #341) | `--z-index-header: 40` |

**`@theme` vs `@theme inline` vs `@theme static`**:

- **`@theme`** (default): both emits a CSS variable AND wires it to a utility. Utility resolves via `var()` at runtime → swappable per scope (light/dark, themed sections).
- **`@theme inline`**: inlines the literal value into utilities, no `var()`. Use only when the value references another non-theme variable that wouldn't resolve at the call site (current `App.css` uses `inline` for the shadcn alias block — **correct**, because those are aliases pointing to `:root` vars).
- **`@theme static`**: emits ALL declared CSS variables, even unused ones. Useful when a token must be available for runtime JS to read but no utility class consumes it. **Not needed for DHM Guide today.**

**Default behavior**: Tailwind v4 only emits CSS variables for tokens that produce a class actually used in the codebase. This keeps CSS small.

**Practical limits on `@theme` size**: there is no documented hard limit. The Tailwind compiler is Rust-based (Oxide) and parses thousands of token declarations without issue. Material's full reference palette is ~250 tokens; DHM Guide's full target is ~150. Performance is not a constraint.

### Apple HIG Token Approach

Apple does not publish a formal token taxonomy but the implicit pattern in SwiftUI/UIKit is:
- **Semantic colors** (label, secondaryLabel, systemBackground, separator) — never hardcoded
- **Dynamic Type ramps** (largeTitle, title1, title2, title3, headline, body, callout, subheadline, footnote, caption1, caption2)
- **System spacing** scaled to platform (compact vs regular size class)
- **Materials** (ultraThin, thin, regular, thick, chrome) — composite shadow + blur + alpha tokens

Takeaway: **semantic naming + adaptive resolution** is the through-line. Apple's `label` resolves to black on light, white on dark, automatically. DHM Guide's tokens should follow this — `--color-text-primary` not `--color-gray-900`.

---

## 2. Codebase Audit: Current State

### 2.1 Token Coverage Score Card

| Category | Coverage | Source | Notes |
|---|---|---|---|
| **Color (shadcn primitives)** | 80% | `App.css :root` + `@theme inline` aliases | All shadcn UI primitives tokenized. Brand greens are NOT. |
| **Color (brand)** | 0% | Hardcoded `green-600`, `orange-500`, etc. | 1,200+ direct stock-Tailwind references. No `--color-brand`. |
| **Z-index** | 100% | `@theme` (PR #341) | Just shipped. Single source of truth. |
| **Radius** | 50% | `@theme inline` aliases (sm/md/lg/xl) tied to one base (--radius: 0.625rem) | Used by shadcn but bypassed in 398 hand-coded `rounded-xl`/`rounded-2xl` calls. |
| **Typography** | 0% (custom) | Tailwind defaults | 817 `text-{size}` calls, 612 `font-{weight}` calls, 46 `leading-*` calls. No semantic ramp. |
| **Spacing** | 0% (custom) | Tailwind defaults | 59 arbitrary `[Npx]` values. 72 section-padding references with no `--space-section`. |
| **Animation** | 0% | Tailwind defaults | 50 `duration-*` calls (33×300, 10×200, 4×150) — clear "fast/normal/slow" distribution but no tokens. |
| **Shadow** | 0% (custom) | Tailwind stock | Heavy use of `shadow-lg/xl/2xl` with no DHM elevation scale. |
| **Border** | 0% (custom) | Tailwind stock | No `--border-subtle`, `--border-default`, `--border-focus`. |
| **Container/Max-width** | 10% | Hand-rolled (max-w-4xl appears 17 times, max-w-6xl 10x) | No `--container-prose` or `--container-page`. |

**Headline**: of ~10 token categories, only **3 are tokenized** (z-index, shadcn-primitive colors, base radius). **7 categories are stock Tailwind passing through unchanged.**

### 2.2 Hardcoded Hot Spots (Top Refactor Targets)

**Brand greens — 455+ `text-green-*` occurrences**:
```
src/components/StickyMobileCTA.jsx:86       bg-green-600 hover:bg-green-700
src/components/MobileComparisonWidget.jsx:166 bg-green-600 hover:bg-green-700
src/components/ReviewsCTA.jsx:44/94          bg-green-600 hover:bg-green-700
src/components/layout/Layout.jsx:125,129,215,358,478  from-green-{500,600,700,800}
src/newblog/pages/NewBlogListing.jsx:80,87,94 from-green-{500,600,700} (gradients)
```
**Risk**: brand color tweak = 50+ file edits, easy to miss occurrences.

**Section padding — no token, but pattern is clear**:
- `py-8`, `py-12`, `py-16`, `py-20` repeated 72 times
- Implied scale: `--space-section-sm: 2rem`, `--space-section-md: 3rem`, `--space-section-lg: 4rem`, `--space-section-xl: 5rem`

**Animation durations — distribution proves a 3-step ramp suffices**:
- `duration-150` (4×) — instant/fast
- `duration-200` (10×) — fast
- `duration-300` (33×) — normal (default)
- `duration-500` (2×) — slow
- `duration-1000` (1×) — outlier (likely should be 500)
- **Implied tokens**: `--duration-fast: 150ms`, `--duration-normal: 200ms`, `--duration-slow: 300ms`, `--duration-slower: 500ms`

**Font-weight — 612 occurrences, 5 distinct values**:
- `font-bold` 267× | `font-semibold` 192× | `font-medium` 146× | `font-normal` 6× | `font-light` 1×
- Already aligns with Tailwind defaults — **no change needed**, but should formalize as `--font-weight-*` if we ever add a non-system font with custom weights.

**Leading — 46 occurrences, 4 distinct values**:
- `leading-relaxed` 30× | `leading-tight` 11× | `leading-none` 4× | `leading-snug` 1×
- Suggests **2 semantic tokens**: `--leading-body: 1.625` (relaxed) and `--leading-heading: 1.25` (tight). 4× and 1× cases stay as Tailwind defaults.

**Arbitrary values — 59 occurrences of `[Npx]` / `[Nrem]`**:
- `min-h-[44px]` / `min-w-[44px]` — touch targets, repeated 12+ times. Clear token: `--spacing-touch: 2.75rem` (44px) or `--spacing-touch-lg: 3rem` (48px after PR #105 update).
- `h-[1.15rem]`, `text-[0.8rem]` — one-off shadcn internals, leave alone.

### 2.3 Dark Mode Status

`App.css` defines a `.dark` class block with 24 color overrides. **However**: the brand-greens in `Layout.jsx`, `ReviewsCTA.jsx`, etc. are stock Tailwind classes (`bg-green-600`) — these do NOT respect `.dark` because they're not aliases to `--color-primary`. Result: dark mode is partially functional for shadcn UI primitives but completely broken for any custom-themed brand surface.

**Required for dark-mode parity**: migrate brand-green hardcodes to `bg-brand` (which would alias `--color-brand`, defined per-mode).

---

## 3. Token Taxonomy: Recommended Categories for DHM Guide

Following the W3C + Material 3 + Tailwind v4 synthesis. Three tiers per category.

### 3.1 Color (highest priority)

**Reference layer** (full ramps, in `@theme`):
```
--color-green-50 ... --color-green-950   (11 steps, OKLCH)
--color-orange-50 ... --color-orange-950 (11 steps, OKLCH)
--color-neutral-50 ... --color-neutral-950 (11 steps, OKLCH)
--color-blue-50 ... --color-blue-950     (11 steps, used for FAQ accent + info states)
```

**System layer** (semantic, in `@theme`):
```
--color-brand:           var(--color-green-600)    /* primary CTA, brand surfaces */
--color-brand-hover:     var(--color-green-700)
--color-brand-subtle:    var(--color-green-50)     /* tint backgrounds */
--color-brand-border:    var(--color-green-200)

--color-accent:          var(--color-orange-500)   /* secondary CTA, "Check Price" */
--color-accent-hover:    var(--color-orange-600)

--color-success:         var(--color-green-600)
--color-warning:         var(--color-orange-500)
--color-danger:          var(--color-red-500)
--color-info:            var(--color-blue-500)

--color-text-primary:    var(--color-neutral-900)  /* dark: --color-neutral-50 */
--color-text-secondary:  var(--color-neutral-600)  /* dark: --color-neutral-400 */
--color-text-muted:      var(--color-neutral-500)
--color-text-on-brand:   var(--color-white)        /* always white on brand surface */

--color-surface:         var(--color-white)        /* dark: --color-neutral-950 */
--color-surface-elevated: var(--color-white)       /* dark: --color-neutral-900 */
--color-surface-subtle:  var(--color-neutral-50)   /* dark: --color-neutral-900 */

--color-border-subtle:   var(--color-neutral-200)  /* dark: --color-neutral-800 */
--color-border-default:  var(--color-neutral-300)  /* dark: --color-neutral-700 */
--color-border-focus:    var(--color-brand)
```

**Component layer** (in component files or `@theme` if widely used):
```
--color-cta-bg:          var(--color-brand)
--color-cta-bg-hover:    var(--color-brand-hover)
--color-cta-text:        var(--color-text-on-brand)
--color-card-bg:         var(--color-surface-elevated)
--color-card-border:     var(--color-border-subtle)
```

### 3.2 Typography

```
/* Font families (already present, but make explicit) */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-serif: ui-serif, Georgia, serif;
--font-mono: ui-monospace, 'SF Mono', Menlo, monospace;

/* Semantic type ramp (Apple HIG-style) */
--text-display:   { size: 3.75rem; line-height: 1.1; weight: 800; }  /* 60px hero h1 */
--text-h1:        { size: 3rem;    line-height: 1.15; weight: 700; }  /* 48px page h1 */
--text-h2:        { size: 2.25rem; line-height: 1.2;  weight: 700; }  /* 36px section h2 */
--text-h3:        { size: 1.875rem; line-height: 1.25; weight: 600; } /* 30px h3 */
--text-h4:        { size: 1.5rem;  line-height: 1.3;  weight: 600; }  /* 24px h4 */
--text-h5:        { size: 1.25rem; line-height: 1.35; weight: 600; }  /* 20px h5 */
--text-h6:        { size: 1.125rem; line-height: 1.4; weight: 600; }  /* 18px h6 */
--text-lead:      { size: 1.25rem; line-height: 1.6;  weight: 400; }  /* 20px lead paragraph */
--text-body:      { size: 1rem;    line-height: 1.625; weight: 400; } /* 16px default */
--text-small:     { size: 0.875rem; line-height: 1.5; weight: 400; }  /* 14px */
--text-caption:   { size: 0.75rem; line-height: 1.4;  weight: 500; }  /* 12px metadata */

/* Weights (already match Tailwind defaults — formalize for explicit control) */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line-heights (semantic, not numeric) */
--leading-heading: 1.25;   /* tight: for h1-h3 */
--leading-body: 1.625;     /* relaxed: for paragraphs */
--leading-ui: 1.5;         /* normal: for buttons/labels */
```

### 3.3 Spacing

```
/* Base unit (Tailwind v4 default — leave alone) */
--spacing: 0.25rem;

/* Semantic spacing (page-level) */
--spacing-page-x:        1rem;     /* mobile gutter */
--spacing-page-x-md:     1.5rem;   /* tablet gutter */
--spacing-page-x-lg:     2rem;     /* desktop gutter */

--spacing-section-sm:    2rem;     /* py-8: tight section */
--spacing-section-md:    3rem;     /* py-12: default */
--spacing-section-lg:    4rem;     /* py-16: prominent */
--spacing-section-xl:    5rem;     /* py-20: hero */

--spacing-touch:         2.75rem;  /* 44px: WCAG min */
--spacing-touch-lg:      3rem;     /* 48px: post-PR #105 standard */

/* Container widths */
--container-prose:       65ch;     /* article body */
--container-narrow:      48rem;    /* max-w-3xl */
--container-content:     56rem;    /* max-w-4xl — most common */
--container-wide:        72rem;    /* max-w-6xl */
--container-page:        80rem;    /* max-w-7xl */
```

### 3.4 Animation

```
/* Durations (3-step semantic ramp matches actual usage) */
--duration-instant:  100ms;
--duration-fast:     150ms;   /* hover, micro-interactions */
--duration-normal:   200ms;   /* state changes (most used) */
--duration-slow:     300ms;   /* page transitions, reveals */
--duration-slower:   500ms;   /* complex sequences */

/* Easings */
--ease-linear:   cubic-bezier(0, 0, 1, 1);
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);    /* Material standard */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);    /* "ease-out" — entrances */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);    /* "ease-in" — exits */
--ease-spring:   cubic-bezier(0.5, 1.5, 0.5, 1);  /* playful bounce */
```

### 3.5 Shadow (Elevation Scale)

```
/* 5-step elevation following Material 3 */
--shadow-xs:  0 1px 2px 0 oklch(0 0 0 / 0.05);
--shadow-sm:  0 1px 3px 0 oklch(0 0 0 / 0.08), 0 1px 2px 0 oklch(0 0 0 / 0.04);
--shadow-md:  0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -1px oklch(0 0 0 / 0.04);
--shadow-lg:  0 10px 15px -3px oklch(0 0 0 / 0.10), 0 4px 6px -2px oklch(0 0 0 / 0.04);
--shadow-xl:  0 20px 25px -5px oklch(0 0 0 / 0.10), 0 10px 10px -5px oklch(0 0 0 / 0.03);
--shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.20);

/* Brand-tinted shadows for branded surfaces (cards on green tints) */
--shadow-brand-md: 0 4px 12px -2px var(--color-green-700) / 0.15;
```

### 3.6 Radius

```
/* Already partially done — extend the ramp */
--radius-xs:   0.25rem;   /* 4px: badges, chips */
--radius-sm:   0.375rem;  /* 6px: small buttons */
--radius-md:   0.5rem;    /* 8px: inputs */
--radius-lg:   0.625rem;  /* 10px: current --radius default — cards */
--radius-xl:   0.75rem;   /* 12px: large cards */
--radius-2xl:  1rem;      /* 16px: feature panels */
--radius-3xl:  1.5rem;    /* 24px: hero panels */
--radius-full: 9999px;    /* pills, avatars */
```

### 3.7 Border

```
--border-width-thin: 1px;
--border-width-default: 1px;
--border-width-thick: 2px;
--border-width-focus: 3px;   /* focus ring */
```

### 3.8 Z-Index (DONE — PR #341)

Already shipped. No changes needed.

---

## 4. Phased Migration Plan

### Phase 1 — Done (PR #341)

- z-index scale in `@theme`
- 11 semantic z-levels (base, behind, dropdown, sticky, fixed, header, comparison, overlay, modal, popover, notification, tooltip)
- **Status: SHIPPED**

### Phase 2 — This Month (Effort: M, ~6-10 hours total)

**Goal**: kill brand-color hardcodes + tokenize animation/typography.

#### 2A — Brand Color System (S, ~2 hours)
- Add reference ramp for green (50-950) to `@theme`. Use existing oklch values from chart-1, chart-2 as starting points; sample real `green-{500,600,700}` from rendered DOM.
- Add semantic system tokens: `--color-brand`, `--color-brand-hover`, `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`.
- Migrate the **15 highest-traffic gradient surfaces** (Layout.jsx logo + nav buttons + footer, ReviewsCTA, MobileComparisonWidget, StickyMobileCTA) from `from-green-600` to `from-brand`. Leave the long tail (440+ refs) for Phase 3.
- **Quick win**: alias `--color-primary` (currently shadcn `oklch(0.205 0 0)` near-black) to `var(--color-brand)` so shadcn buttons inherit brand by default.

#### 2B — Animation Tokens (S, ~1 hour)
- Add `--duration-{fast,normal,slow,slower}` and `--ease-{standard,decelerate,accelerate,spring}` to `@theme`.
- Codemod 33 occurrences of `duration-300` → `duration-slow` (or just leave them; the win is the named tokens for new code).
- **Quick win**: `--ease-spring` enables one-line bounce animations on confirmations.

#### 2C — Typography Semantic Tokens (M, ~3-4 hours)
- Add `--text-{display,h1-h6,lead,body,small,caption}` with paired line-heights.
- Add `--leading-{heading,body,ui}`.
- Migrate **3 components** as proof of concept: `Layout.jsx` (h1/h2 in hero), `NewBlogListing.jsx` (article cards), `ReviewsCTA.jsx`. Don't touch the other 100+ components.
- **Don't** migrate font-weight tokens — current Tailwind `font-bold/semibold/medium` already aligns with our 5-value distribution.

#### 2D — Touch-Target + Container Tokens (S, ~30 min)
- Add `--spacing-touch: 2.75rem` (44px) and `--spacing-touch-lg: 3rem` (48px).
- Add `--container-{prose,content,wide,page}`.
- Codemod 12 occurrences of `min-h-[44px]` → `min-h-touch`. Quick win.

**Phase 2 estimated effort: M (Medium) — 6-10 hours.**

### Phase 3 — Next Quarter (Effort: L, ~15-20 hours)

**Goal**: full coverage + dark-mode parity + long-tail brand-color migration.

#### 3A — Shadow Elevation Scale (M, ~3 hours)
- Add `--shadow-{xs,sm,md,lg,xl,2xl}` with DHM-tuned alpha values (subtler than Tailwind stock).
- Add `--shadow-brand-md` for branded card hover states.
- Migrate hero/feature cards in CompetitorComparison, FAQSection, UserTestimonials.

#### 3B — Full Neutral Scale + Text Token Migration (L, ~6 hours)
- Add `--color-neutral-{50-950}` reference ramp.
- Add `--color-text-{primary,secondary,muted}` system tokens.
- Codemod 593 occurrences of `text-gray-{600,700,800,900}` → semantic tokens.

#### 3C — Long-tail Brand Color Migration (L, ~5 hours)
- Sweep remaining ~440 `bg-green-*` / `from-green-*` / `border-green-*` to system tokens.
- Validate dark mode renders all branded surfaces correctly.

#### 3D — Border + Radius Extension (S, ~1 hour)
- Add `--border-width-*` tokens.
- Extend radius ramp to xs/2xl/3xl.

#### 3E — Component Tokens (M, ~3 hours)
- Define component-tier tokens for the 5 most-instantiated components: CTAButton, ProductCard, ComparisonRow, ArticleCard, FAQItem.

**Phase 3 estimated effort: L (Large) — 15-20 hours.**

---

## 5. Sample `@theme` Block (Phase 2 target state)

```css
@theme {
  /* ============================================================
     Z-INDEX (Phase 1 — shipped in PR #341)
     ============================================================ */
  --z-index-base:         0;
  --z-index-behind:       -1;
  --z-index-dropdown:     10;
  --z-index-sticky:       20;
  --z-index-fixed:        30;
  --z-index-comparison:   35;
  --z-index-header:       40;
  --z-index-overlay:      45;
  --z-index-modal:        50;
  --z-index-popover:      60;
  --z-index-notification: 65;
  --z-index-tooltip:      70;

  /* ============================================================
     COLOR — REFERENCE LAYER (Phase 2A)
     ============================================================ */
  /* Brand green ramp, OKLCH, perceptually even steps */
  --color-green-50:  oklch(0.97 0.025 145);
  --color-green-100: oklch(0.94 0.05 145);
  --color-green-200: oklch(0.88 0.08 145);
  --color-green-300: oklch(0.78 0.13 145);
  --color-green-400: oklch(0.68 0.16 145);
  --color-green-500: oklch(0.58 0.18 145);
  --color-green-600: oklch(0.50 0.16 145);  /* primary CTA */
  --color-green-700: oklch(0.42 0.13 145);  /* hover */
  --color-green-800: oklch(0.35 0.10 145);
  --color-green-900: oklch(0.28 0.07 145);
  --color-green-950: oklch(0.18 0.04 145);

  /* Accent orange (post-PR #105) */
  --color-orange-50:  oklch(0.97 0.025 60);
  --color-orange-500: oklch(0.70 0.19 60);
  --color-orange-600: oklch(0.62 0.20 60);

  /* ============================================================
     COLOR — SYSTEM LAYER (semantic)
     ============================================================ */
  --color-brand:         var(--color-green-600);
  --color-brand-hover:   var(--color-green-700);
  --color-brand-subtle:  var(--color-green-50);
  --color-brand-border:  var(--color-green-200);

  --color-accent:        var(--color-orange-500);
  --color-accent-hover:  var(--color-orange-600);

  --color-success: var(--color-green-600);
  --color-danger:  oklch(0.577 0.245 27.325);  /* existing destructive */
  --color-info:    oklch(0.6 0.118 184.704);   /* existing chart-2 */

  /* ============================================================
     TYPOGRAPHY (Phase 2C)
     ============================================================ */
  --text-display:   3.75rem;
  --text-display--line-height: 1.1;
  --text-display--font-weight: 800;

  --text-h1:        3rem;
  --text-h1--line-height: 1.15;
  --text-h1--font-weight: 700;

  --text-h2:        2.25rem;
  --text-h2--line-height: 1.2;

  --text-h3:        1.875rem;
  --text-h3--line-height: 1.25;

  --text-lead:      1.25rem;
  --text-lead--line-height: 1.6;

  --leading-heading: 1.25;
  --leading-body:    1.625;
  --leading-ui:      1.5;

  /* ============================================================
     ANIMATION (Phase 2B)
     ============================================================ */
  --duration-instant: 100ms;
  --duration-fast:    150ms;
  --duration-normal:  200ms;
  --duration-slow:    300ms;
  --duration-slower:  500ms;

  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring:     cubic-bezier(0.5, 1.5, 0.5, 1);

  /* ============================================================
     SPACING + CONTAINERS (Phase 2D)
     ============================================================ */
  --spacing-touch:    2.75rem;   /* 44px */
  --spacing-touch-lg: 3rem;      /* 48px */

  --container-prose:   65ch;
  --container-content: 56rem;    /* max-w-4xl */
  --container-wide:    72rem;    /* max-w-6xl */
  --container-page:    80rem;    /* max-w-7xl */
}

/* shadcn aliases — keep in @theme inline (current pattern is correct) */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* ... existing color aliases ... */
}

/* Light mode (default) */
:root {
  --radius: 0.625rem;
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-surface: oklch(1 0 0);
  /* ... existing shadcn vars ... */
}

/* Dark mode override */
.dark {
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-400);
  --color-surface: oklch(0.145 0 0);
  --color-brand: var(--color-green-500);  /* lift one step for contrast on dark */
  /* ... existing dark vars ... */
}
```

---

## 6. Tailwind v4 Specifics & Gotchas

### 6.1 `@theme` vs `@theme inline` decision tree

```
Defining a new token from scratch with a literal value?  →  @theme
Aliasing one theme variable to another (like shadcn)?     →  @theme inline
Pointing to a non-theme :root variable?                   →  @theme inline
Token must be present in CSS even if no utility uses it?  →  @theme static
```

**Current `App.css` correctly uses `@theme inline`** for the shadcn alias block (`--color-background: var(--background)`) because `--background` lives in `:root`, not `@theme`. Don't change that.

### 6.2 Dark Mode Pattern in v4

Two valid approaches:
1. **Two-layer (current pattern)**: variables at `:root`, overrides at `.dark`. Simple. Used by shadcn. **Recommended for DHM.**
2. **`@variant dark`**: Tailwind v4's first-class custom-variant syntax. More powerful for component-level themes but overkill for site-wide light/dark.

For the brand layer, **redefine system tokens (not reference tokens) under `.dark`**:
```css
.dark {
  --color-brand: var(--color-green-500);  /* lighter for contrast */
  --color-text-primary: var(--color-neutral-50);
  /* DO NOT redefine --color-green-600 — that's a reference token */
}
```

### 6.3 Static vs Runtime Tokens

- **Static tokens** (compiled into utility CSS): default for all `@theme` declarations. Best for performance — only used variables emit CSS.
- **Runtime tokens** (live in `:root`, swappable via JS): use when a value must change without page reload (e.g., user-selectable theme). DHM Guide doesn't need this today.

### 6.4 Practical Limit on `@theme` Block Size

No documented hard limit. Tailwind's Oxide engine (Rust) parses the entire theme in <50ms for blocks 10× larger than what we'd write. Our target is ~150 tokens — trivially small.

---

## 7. Quick Wins (≤1 Hour Each)

These are the "ship today, no risk" additions:

| Win | Time | Impact |
|---|---|---|
| Add 4 animation duration tokens (`--duration-{fast,normal,slow,slower}`) | 15 min | Establishes motion vocabulary; future hover/transition code uses it. |
| Add 4 ease tokens (`--ease-{standard,decelerate,accelerate,spring}`) | 15 min | Same. Unlocks `--ease-spring` for confirmation toasts. |
| Add `--spacing-touch: 2.75rem` + `--spacing-touch-lg: 3rem` | 10 min | Codemod 12 `min-h-[44px]` callsites later. |
| Add `--container-{prose,content,wide,page}` | 15 min | Replaces 58 hand-rolled `max-w-{4xl,6xl,7xl}`. |
| Add `--color-brand` + `--color-brand-hover` aliasing existing greens | 30 min | Foundation for Phase 2 brand migration. |
| Extend radius ramp with `--radius-xs` (4px) and `--radius-3xl` (24px) | 10 min | Two missing steps observed in 398 `rounded-*` calls. |

**Total: ~95 minutes for 6 quick wins.** All of these are pure additions — no migration risk, no breaking changes.

---

## 8. Conclusion + Recommendations

**Top 3 categories to adopt next** (priority order):
1. **Brand colors** (Phase 2A — system layer aliases). Highest leverage: 1,200+ refs depend on this, dark-mode parity blocked without it.
2. **Animation tokens** (Phase 2B). Tiny code, big vocabulary win. 1 hour total.
3. **Typography semantic ramp** (Phase 2C). Brings DHM Guide in line with Apple HIG / Material 3 patterns; foundation for future design system.

**What NOT to do** (simplicity filter rejections):
- Don't tokenize all 593 `text-gray-*` occurrences in Phase 2 — defer to Phase 3.
- Don't introduce M3-style component tokens (`--color-cta-bg`) until system tokens are stable — premature abstraction.
- Don't migrate `font-weight` — current Tailwind defaults already match our distribution exactly.
- Don't add `static` keyword — we don't need runtime introspection of unused tokens.
- Don't try a Style Dictionary / Figma export pipeline yet — wait until tokens stabilize after Phase 3.

**Effort summary**:
- Phase 1: **Done** (PR #341, ~2 hours)
- Phase 2: **M, 6-10 hours** (recommended for next 4 weeks)
- Phase 3: **L, 15-20 hours** (recommended for Q3)
- Total: ~25-30 hours over 3-4 months for full token coverage

---

## Sources

- [Design Tokens specification reaches first stable version (W3C, 2025-10-28)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind v4 @theme vs @theme inline (GitHub Discussion #18560)](https://github.com/tailwindlabs/tailwindcss/discussions/18560)
- [Material Design 3 — Design Tokens](https://m3.material.io/foundations/design-tokens)
- [Design Tokens That Scale in 2026 (Tailwind v4 + CSS Variables)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026)
- [Tailwind CSS v4: The Complete Guide for 2026 (DevToolbox)](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide)
- [Theming best practices in v4 (GitHub Discussion #18471)](https://github.com/tailwindlabs/tailwindcss/discussions/18471)
