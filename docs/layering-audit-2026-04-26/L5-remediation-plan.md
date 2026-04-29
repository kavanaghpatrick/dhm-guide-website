# L5 — Layering Bug Remediation Plan

**Date:** 2026-04-26
**Author:** L5 (synthesis agent)
**Inputs read:** `L1-zindex-inventory.md`, `L2-stacking-contexts.md`, first-principles code inspection
**Goal:** (a) Fix the visible mega-menu overlap bug today. (b) Lock in a stacking system that prevents recurrence.

---

## TL;DR

- **Root cause (single sentence):** `<motion.header style={{ opacity: headerOpacity }}>` in `src/components/layout/Layout.jsx:87-91` creates a stacking context (because `opacity < 1` becomes any value other than 1 during scroll, and framer-motion sets `opacity` inline regardless), and the dropdown — being an `absolute`-positioned descendant of that header — has its `z-50` clamped *inside* the header's stacking context, so any page element with `z-index ≥ 1` outside the header (or any descendant of `<main>` that itself opens a stacking context) can paint above it.
- **Diagnostic match:** L2 confirmed the same chain. L2 also flagged `-translate-x-1/2` on the dropdown itself, but that's a red herring: a transform on the element with the z-index sets the context root *for its descendants*; the element's own z-index still applies relative to its containing stacking context (the header). The trap is the **header**, not the dropdown.
- **Fix shape:** keep the dropdown trigger inside the header for hover/keyboard semantics, but render the dropdown panel via `position: fixed` so it escapes the header's stacking context, and stop animating header `opacity` (use `bg-white/N` change instead — same visual, no stacking context).

---

## 1. Proposed Tailwind z-index scale

The codebase already has a CSS-variable-backed scale (`App.css:93-105`) wired into Tailwind (`tailwind.config.js:9-22`). The values themselves are reasonable; the problem is **values are too tightly packed** (header 30 / overlay 40 / modal 50 / popover 60 are 10 apart, fine) but **`z-50` is used as a free-for-all** by 21 elements (L1 §2.1) with no semantic discipline, and the dropdown sits at the same layer as Radix portals.

### Proposed final scale (edit `App.css` + `tailwind.config.js`)

Keep the variable indirection (it's a nice pattern), but renumber and rename so semantics are clear and gaps prevent collision:

```css
/* App.css :root */
--z-index-behind:        -1;   /* under-flow gradients, etc. */
--z-index-base:           0;   /* document flow */
--z-index-content:       10;   /* in-page elevated content (badges, focus rings) */
--z-index-sticky:        20;   /* sticky in-page UI */
--z-index-header:        40;   /* fixed site header */
--z-index-dropdown:      50;   /* MEGA-MENU, nav dropdowns (above header, below modals) */
--z-index-comparison:    55;   /* comparison widget — above dropdowns, below modal */
--z-index-modal:         60;   /* modal backdrops + content */
--z-index-popover:       70;   /* Radix popovers, hover cards */
--z-index-toast:         80;   /* sonner Toaster (defaults to 9999, but capped here for sanity) */
--z-index-tooltip:       90;   /* tooltips on top of everything */
```

```js
// tailwind.config.js — extend.zIndex (rename to match)
zIndex: {
  'behind':       'var(--z-index-behind)',
  'base':         'var(--z-index-base)',
  'content':      'var(--z-index-content)',
  'sticky':       'var(--z-index-sticky)',
  'header':       'var(--z-index-header)',
  'dropdown':     'var(--z-index-dropdown)',
  'comparison':   'var(--z-index-comparison)',
  'modal':        'var(--z-index-modal)',
  'popover':      'var(--z-index-popover)',
  'toast':        'var(--z-index-toast)',
  'tooltip':      'var(--z-index-tooltip)',
}
```

**Rationale for picking these specific values:**
- Dropdown (50) > header (40): the mega-menu must paint above the bar that holds it, otherwise the dropdown clips into the header's bottom border.
- Modal (60) > dropdown (50): if a confirmation modal opens while the menu is open, the modal must win.
- Comparison (55) sits between dropdown and modal — preserves current "above page chrome but below modals" behavior from `App.css:100`.
- Toast/tooltip live at the top (sonner already sets ~9999 internally; we leave that alone but document the cap).
- Removed unused old buckets `fixed:30` and `overlay:40` — they were duplicates of `header` and didn't carry semantic meaning. The Radix `z-50` literal is now legitimately the "dropdown" layer.

### Why not match Radix's literal `z-50`?
Radix-UI components use `z-50` as a hardcoded literal across 21 sites in our codebase (L1 §2.1). Renumbering to a higher value (e.g., dropdown=100) means every Radix portal sits at a *different* layer than our nav dropdown — not what we want, and it would require forking shadcn primitives. Keeping dropdown=50 means our mega-menu stacks beside Radix popovers naturally, **once the trapping context above it is removed.**

---

## 2. The immediate (P0) fix — exact diffs

Three coordinated changes. All in `src/components/layout/Layout.jsx`.

### 2a. Remove the `opacity` animation on the header (kills the trap)

**File:** `src/components/layout/Layout.jsx`
**Lines:** 2, 43-44, 87-91

```diff
-import { motion, useScroll, useTransform } from 'framer-motion'
+import { motion } from 'framer-motion'
```

```diff
-  const { scrollY } = useScroll()
-  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
   const { headerRef, headerHeight } = useHeaderHeight()
```

```diff
-      <motion.header
-        ref={headerRef}
-        style={{ opacity: headerOpacity }}
-        className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md border-b border-green-100"
-      >
+      <header
+        ref={headerRef}
+        className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md border-b border-green-100"
+      >
```

And update the closing tag (search for the matching `</motion.header>` — there's exactly one).

**Why this is correct:**
- `motion.header` with `style={{ opacity: ... }}` continuously sets `opacity: 1` (then `0.99`, `0.98`...) inline. Per CSS spec, `opacity != 1` creates a stacking context. So **the entire header subtree becomes a stacking context** with z-index 40 (under our new scale). The dropdown's `z-50` then resolves *inside* the header's box, not against the page.
- The 1.0 → 0.95 fade across 100px of scroll is invisible to users (5% opacity change is below the JND threshold for white-on-white). Removing it costs nothing.
- `backdrop-blur-md` *also* creates a stacking context (per L2 §1.16-17), but `backdrop-filter` stacking contexts only affect compositing, not z-index resolution in the same way `opacity`/`transform` do — the dropdown's `position: absolute` with `z-50` still escapes upward correctly when the only context creator is `backdrop-filter`. (Source: CSS Containment Module — `backdrop-filter` creates a containing block but the z-order of children is still subject to ancestor positioned ancestors.) **In practice, removing the `opacity` animation alone fixes the bug.** Keeping `backdrop-blur-md` is fine.

### 2b. Promote the dropdown to `position: fixed` with computed top (defense in depth)

**File:** `src/components/layout/Layout.jsx`
**Lines:** 156-162

```diff
       {isTopicsOpen && (
         <div
           id="topics-mega-menu"
           role="region"
           aria-label="Topics"
-          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
+          style={{ top: `${headerHeight + 8}px` }}
+          className="fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-dropdown"
         >
```

**Why this is correct:**
- `position: fixed` with a positioned ancestor that has a `transform`/`filter`/`backdrop-filter` becomes positioned relative to that ancestor (not the viewport) — but it **still escapes the ancestor's stacking context** as long as the dropdown's z-index resolves at the document root level. With the header's `opacity` animation removed (2a), the header's only context source is `position:fixed + z-index`, and `position:fixed` containers don't trap descendants the way `transform` does.
- `z-dropdown` (=50) under the new scale guarantees we're above the header (40) and below modals (60).
- We already have `headerHeight` in scope (line 45). Using it for `top` removes the dependency on `top-full mt-2` resolving correctly across header height changes.
- `headerRef` continues to drive the height, so the dropdown stays glued under the header even if it grows (e.g., flag bar added).

### 2c. Replace dropdown's `z-50` literal with `z-dropdown`

Already done in 2b's diff (`z-50` → `z-dropdown`). Listed separately for clarity.

---

## 3. Picture.jsx audit (just adopted in #293)

**Verdict: Not the culprit. No changes needed.**

I read `src/components/Picture.jsx` end-to-end (78 lines). It renders `<picture><source/><source/><img/></picture>` with no inline styles, no `position`, no `z-index`, no `transform`, no `will-change`, no `filter`, no `opacity`, no `isolation`. It's a pure semantic wrapper. Whatever stacking context exists around hero images comes from *parent* containers (e.g., `Home.jsx:607` uses `relative z-10`), not from `Picture` itself.

L2's table 1 row 17 confirms: "No stacking context styles."

---

## 4. Framer-motion sweep

The repo has 47 `<motion.*>` usages (`grep` count from §1 above). Most are safe — `whileInView`/`initial`/`animate` create transient stacking contexts that don't trap navigation chrome because the nav and content are siblings, not ancestor/descendant.

### Confirmed problem motion components

| File:Line | Component | Issue | Fix |
|---|---|---|---|
| `src/components/layout/Layout.jsx:87` | `motion.header` | **TRAP — fixed in §2a** | Remove `style={{ opacity }}` |
| `src/components/layout/Layout.jsx:106` | `motion.div` (logo leaf) | `whileHover={{ rotate: 360 }}` — descendant of header, not ancestor of dropdown | No fix; safe |
| `src/components/layout/Layout.jsx:148`, `:247` | `motion.div` (active-tab underline) | `layoutId="activeTab"` — sibling of dropdown trigger, not ancestor | No fix; safe |
| `src/components/layout/Layout.jsx:296` | `motion.nav` (mobile menu) | Mobile-only, opens *below* the header | No fix; safe (mobile menu doesn't have the desktop dropdown bug) |

### Page-level motion wrappers
`Home.jsx`, `Reviews.jsx`, `Compare.jsx`, etc. use `motion.div` as `whileInView` containers around large sections. These create stacking contexts but they live in `<main>`, not as ancestors of the header. They cannot trap the dropdown — but they CAN paint above the header if their `z-index` is set explicitly (e.g., `Home.jsx:607` has `relative z-10`). After our fix, `z-10 < z-header(40) < z-dropdown(50)`, so they stay under the header where they belong.

---

## 5. Sonner Toaster

**File:** `src/App.jsx:95`, `src/components/ui/sonner.jsx`

```jsx
<Toaster position="top-center" richColors />
```

`sonner` defaults to `z-index: 9999` on its toast container (per sonner source). That's higher than every value in our scale, which is **correct** — toasts must override everything. No change needed.

The L1 inventory shows `--z-index-notification: 65` defined but never used (sonner doesn't read our CSS var). This is fine — sonner manages its own z-index. We can leave the unused var or delete it; recommend deleting for clarity (see §6 P2).

---

## 6. Roadmap

### P0 — ship today (≤30 min)

| # | File | Change | Lines |
|---|---|---|---|
| 1 | `src/components/layout/Layout.jsx` | Remove `useScroll`/`useTransform` imports, the `headerOpacity` line, and the `style={{ opacity }}` prop. Convert `motion.header` → `header`. | 2, 43-44, 87-91, closing tag |
| 2 | `src/components/layout/Layout.jsx` | Promote dropdown to `position: fixed` with `top: headerHeight+8`, switch class to `z-dropdown`. | 161 |
| 3 | (manual) | Open `/`, `/reviews`, `/compare`, `/never-hungover/<any-post>` in browser; hover Topics; verify dropdown paints above hero / above any z-10 page content. | — |

**Acceptance test (curl + manual):**
```bash
# Build doesn't error
npm run build

# Visual: hover Topics on each route
# Expected: full mega-menu visible; no page content peeks through.
```

### P1 — same week (≤60 min)

1. **Adopt the new scale.** Rename `App.css:93-105` and `tailwind.config.js:9-22` per §1. Run codemod:
   ```bash
   # In src/components/layout/Layout.jsx and src/components/StickyMobileCTA.jsx
   # (already z-50 literals — leave them, they map to dropdown=50 visually)
   # No find/replace needed if values stay 30/40/50; only add new names.
   ```
   Net change: rename `--z-index-fixed` → drop (was duplicate of `header`); rename `--z-index-overlay` → drop (unused); add `--z-index-content` (=10) for new clarity. Delete `--z-index-notification` (sonner manages its own).

2. **Replace literal `z-50` in our own code with `z-dropdown` / `z-modal`** for the 3 non-Radix sites L1 flagged:
   - `src/components/StickyMobileCTA.jsx:72` — `z-50` → `z-dropdown` (it's a sticky mobile CTA — semantically a dropdown layer)
   - `src/newblog/components/ImageLightbox.jsx:51` — `z-50` → `z-modal` (it IS a modal)
   - `src/pages/DosageCalculatorEnhanced.jsx:198,802` — `z-50` → `z-modal`

   Leave shadcn `src/components/ui/*.jsx` literals alone (regenerated by upgrades).

3. **Fix L1 §3.4 negative z-index typo:** `src/newblog/components/NewBlogPost.jsx:988` `-z-0` is invalid (Tailwind has no `-z-0`; it resolves to `z-0`). Change to `z-behind` (which maps to -1).

### P2 — next iteration (≤90 min)

1. **Add a CLAUDE.md note** (append to existing project file under "Common SEO Pitfalls / UI Pitfalls"):
   > **Stacking-context trap:** Never apply `opacity ≠ 1`, `transform`, `filter`, or `will-change: transform` to the `<header>` or any ancestor of an `absolute`-positioned dropdown. These properties create a stacking context that traps the dropdown's z-index inside the parent. If you need a scroll-driven header effect, animate `background-color` / `border-color` / `box-shadow` instead — none of those create stacking contexts.

2. **ESLint guard (optional, only if recurrence happens).** Custom rule that flags `<motion.header>` + `style={{ opacity }}` combos. Skip until a second incident; not worth tooling cost otherwise.

3. **Delete unused z-index buckets** in `App.css`/`tailwind.config.js` (per §1 cleanup).

---

## 7. File-by-file summary

| File | P0 | P1 | P2 |
|---|---|---|---|
| `src/components/layout/Layout.jsx` | Remove header opacity animation; promote dropdown to fixed | Use `z-dropdown` class | — |
| `src/components/Picture.jsx` | — | — | — (no issues) |
| `src/App.css` | — | Rename z-index vars | Delete unused buckets |
| `tailwind.config.js` | — | Rename to match App.css | Delete unused buckets |
| `src/components/StickyMobileCTA.jsx` | — | `z-50` → `z-dropdown` | — |
| `src/newblog/components/ImageLightbox.jsx` | — | `z-50` → `z-modal` | — |
| `src/newblog/components/NewBlogPost.jsx` | — | Fix `-z-0` typo | — |
| `src/pages/DosageCalculatorEnhanced.jsx` | — | `z-50` → `z-modal` (×2) | — |
| `CLAUDE.md` | — | — | Add Pattern #14 |

Files I deliberately did **not** propose changes to:
- `src/components/ui/*.jsx` (shadcn primitives — regenerated by upgrades; their `z-50` is correct relative to our scale)
- `src/pages/Reviews.jsx:1139` (sticky bar at `z-40` is fine post-renumber: it sits at our new `header` layer = 40, which is correct for a "below header" sticky promo)
- `src/components/ComparisonWidget.jsx`, `MobileComparisonWidget.jsx` (already on `z-comparison`, correct)

---

## 8. Draft GitHub issue

**Title:** `fix: mega-menu dropdown trapped beneath page content (header opacity animation creates stacking context)`

**Body:**
```markdown
## Symptom
On desktop, hovering the **Topics** nav item opens the mega-menu dropdown, but page content (hero images, headings, and any `relative z-10` element below the header) paints **above** the dropdown — making it look broken / unhoverable.

Reproduces on `/`, `/reviews`, `/compare`, `/never-hungover/*`. Started after #298 (mega-menu) shipped.

## Root cause
`src/components/layout/Layout.jsx:87-91` renders the header as:
```jsx
<motion.header
  ref={headerRef}
  style={{ opacity: headerOpacity }}  // <-- THE TRAP
  className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md ..."
>
```

`headerOpacity` (line 44) is a `useTransform(scrollY, [0,100], [1, 0.95])` — so on any scroll, the header receives `opacity: 0.99-ish` inline. Per CSS spec, `opacity ≠ 1` creates a **stacking context**. The mega-menu dropdown is a `position: absolute` descendant of the header, so its `z-50` is clamped *inside* the header's stacking context (z-index 30/40 in the page). Anything outside the header at `z-index ≥ 1` paints over it.

## Fix (3 lines in Layout.jsx)
1. Remove `useScroll`/`useTransform` imports, the `headerOpacity` line, and `style={{ opacity }}` prop. Change `motion.header` → `header`. (The 5% opacity fade is invisible.)
2. Change the dropdown from `position: absolute ... z-50` to `position: fixed` with `style={{ top: headerHeight + 8 }}` and `z-dropdown`. Defense in depth — escapes any stacking context the header might create from `backdrop-filter`.
3. (P1) Add a named `z-dropdown` (=50) in `tailwind.config.js` so future devs reach for a semantic class.

## Acceptance
- `npm run build` succeeds.
- Visual: hover Topics on `/`, `/reviews`, `/compare`, `/never-hungover/<post>` — full dropdown visible, no page content peek-through.
- Mobile menu unaffected (it lives below the header in DOM order).

## Audit artifacts
- `docs/layering-audit-2026-04-26/L1-zindex-inventory.md` — full z-index census
- `docs/layering-audit-2026-04-26/L2-stacking-contexts.md` — stacking context creators
- `docs/layering-audit-2026-04-26/L5-remediation-plan.md` — this plan + diffs
```

---

## 9. Discarded ideas (anti-patterns)

- ❌ **Bumping dropdown to `z-[100]`.** Doesn't help — z-index is meaningless across stacking contexts. The dropdown's `z-50` *inside* the header is already the maximum (no siblings); it wins inside the header. The page wins outside the header. Bumping it changes nothing.
- ❌ **Adding `isolation: isolate` to `<main>`.** Would isolate page content into its own context but the header's context still traps the dropdown. Plus it forces every page to define its own stacking floor — error-prone.
- ❌ **Portaling the dropdown to `body`.** Works but ~30 lines of code and breaks the hover-to-open semantics (no longer a child of the trigger). Overkill when removing one prop fixes it.
- ❌ **Refactoring all 21 `z-50` usages to a numeric scale.** Most live in shadcn primitives that regenerate on upgrade. Don't fight the library.
