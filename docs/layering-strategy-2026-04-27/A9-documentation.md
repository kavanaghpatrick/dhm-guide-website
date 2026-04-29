# Layering, Z-Index, and Stacking Contexts in DHM Guide

**Status:** Canonical reference. Source of truth post-#341.
**Last updated:** 2026-04-27
**Audience:** Future devs (and future Claude sessions) touching layering, navigation, modals, or anything `position: fixed`.
**TL;DR:** If a layered element doesn't paint where you expect, it's almost always a stacking-context trap on an ancestor — **not** a z-index value problem.

---

## 0. Prime directive (one rule to memorize)

> **`z-index` only orders elements within the same stacking context.** A `z-index: 9999` descendant of a stacking-context-creating ancestor is still trapped inside that ancestor's z-budget at the document root. Stop reaching for bigger numbers. Look up the parent chain instead.

If you internalize one thing: when layering looks broken, **walk the parent chain hunting for stacking-context creators**, don't try to win with a bigger z-index. The four PRs we shipped on April 26-27 (#339, #340, #341) all came back to that one rule.

---

## 1. The primer (read this once, then move on)

### 1.1 What a stacking context is
A **stacking context** is a sub-tree of the DOM that paints as an atomic z-index unit. Children of a stacking context are ordered relative to each other, but the whole context is then ordered as a single atom against its sibling contexts in the parent context.

Spec: [W3C CSS 2.1 Appendix E — Painting order](https://www.w3.org/TR/CSS21/zindex.html). Quick reference: [MDN — Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context).

The key sentence from the spec, paraphrased: *child z-index is meaningless across stacking-context boundaries.* If the header has `opacity: 0.95`, a `z-index: 99999` descendant inside the header still paints exactly where the header paints — no higher, no lower.

### 1.2 How z-index actually works
When the browser paints, it walks the stacking-context tree (not the DOM tree, not z-index numerically). At each context, it uses CSS painting order (CSS 2.1 §E.2 / CSS Positioned Layout L3 §9):

1. Background and borders of the context root
2. Negative-z descendants
3. Block-level non-positioned descendants
4. Floats
5. Inline-level non-positioned descendants
6. **`z-index: auto` and `z-index: 0` positioned descendants, plus stacking contexts created by `opacity`/`transform`/etc. with no explicit z-index** (these all live at the same paint level)
7. Positioned descendants with `z-index > 0`, in tree order

Step 6 is where most of the gotchas live: `motion.div` with `opacity: 1 → 0` animations, `backdrop-filter`, `transform`, etc. are all **z-index: auto stacking contexts** that paint *before* anything with `z-index ≥ 1` in the same parent — but they still wrap their descendants atomically.

### 1.3 The 12 properties that create a new stacking context
Any of these on an element makes it a stacking context root for its descendants:

1. `position: fixed` (always)
2. `position: sticky` (always)
3. `position: relative` or `absolute` **with `z-index ≠ auto`**
4. `opacity` < 1 (this includes inline-style `opacity: 0.99` set by Framer Motion)
5. `transform` ≠ `none` (any non-identity transform — including `translateX(-50%)` from `-translate-x-1/2`)
6. `filter` ≠ `none`
7. `backdrop-filter` ≠ `none` (e.g., `backdrop-blur-md`)
8. `mix-blend-mode` ≠ `normal`
9. `clip-path`
10. `mask` / `mask-image` / `mask-border`
11. `will-change` naming any property that creates a stacking context above (e.g., `will-change: transform`, `will-change: opacity`)
12. `isolation: isolate`
13. `contain: layout`, `contain: paint`, or `contain: strict` (modern containment also creates a context)
14. CSS `@container` queries with size containment

(That's 14, not 12. The full list grows as CSS evolves. Treat the answer to "does this create a stacking context?" as: assume yes if you don't know.)

### 1.4 Why fixed-positioned descendants don't automatically escape ancestor stacking contexts (THE common confusion)
Two common myths:

> "`position: fixed` is positioned against the viewport, so it escapes ancestors."

False on two counts:
- A `transform`/`filter`/`backdrop-filter`/`will-change: transform` ancestor changes the **containing block** of `position: fixed` descendants — they're now positioned against the ancestor, not the viewport.
- Even when positioning works fine, **stacking is still resolved within the ancestor's stacking context**. `position: fixed; z-index: 50` inside `<header style="opacity: 0.95">` paints at the header's level, not above page content.

> "If both elements are `position: fixed`, z-index works globally."

False. `position: fixed` doesn't grant root-level stacking. The element is still painted within whichever stacking context contains its DOM ancestor. The only way to render at the root context is to be a DOM descendant of `<body>` (or any ancestor that doesn't itself create a context).

### 1.5 The role of `isolation: isolate` and `contain`
- **`isolation: isolate`** is the modern, intent-revealing way to **create** a stacking context. Use it on a sibling to force everything inside it into one atomic z-block, so siblings can never paint between two of its descendants. Costs nothing performance-wise. It does NOT escape an ancestor stacking context — it creates a new one.
- **`contain: paint`** also creates a stacking context (and a containing block). Use for performance isolation; the stacking-context side-effect is a bonus, not the goal.

These are tools to *deliberately* create stacking contexts. They don't help when the problem is an *accidentally* created stacking context above you.

---

## 2. Our z-index scale (the reference)

Defined in `src/App.css` inside `@theme inline { ... }` (NOT `tailwind.config.js` — see §2.3 for why).

### 2.1 Tokens
```css
/* src/App.css — @theme inline block */
--z-index-base:           0;   /* document flow */
--z-index-behind:        -1;   /* under-flow gradients */
--z-index-dropdown:      10;   /* in-page elevated content (badges, focus rings) */
--z-index-sticky:        20;   /* sticky in-page UI (TOC, reading progress) */
--z-index-fixed:         30;   /* fixed in-page elements (legacy bucket, prefer header/comparison) */
--z-index-comparison:    35;   /* comparison widget — above page chrome, below header */
--z-index-header:        40;   /* fixed site header (post-#341 — was 30) */
--z-index-overlay:       45;   /* page overlays, drawers */
--z-index-modal:         50;   /* modal dialogs, mega-menu dropdown (matches Radix shadcn primitives) */
--z-index-popover:       60;   /* Radix popovers, hover cards */
--z-index-notification:  65;   /* toasts (Sonner uses 9999 internally; this is unused) */
--z-index-tooltip:       70;   /* tooltips on top of everything we control */
```

Tailwind v4 auto-generates utility classes from `--z-*` keys in `@theme`. Available classes: `z-base`, `z-behind`, `z-dropdown`, `z-sticky`, `z-fixed`, `z-comparison`, `z-header`, `z-overlay`, `z-modal`, `z-popover`, `z-notification`, `z-tooltip`. Plus the stock numeric ones (`z-0`, `z-10`, ..., `z-50`).

### 2.2 When to use each
| Need | Class | Numeric | Notes |
|---|---|---|---|
| Hide behind flow (gradients, etc.) | `z-behind` | -1 | Sparingly; usually `position: relative` with `z-base` on the layered-on element is cleaner |
| In-page focus ring, badge, image overlay | `z-dropdown` | 10 | Despite the name, this is "elevated in-page content" |
| Sticky TOC, reading progress | `z-sticky` | 20 | Below the header |
| Comparison widget | `z-comparison` | 35 | Intentional: above page chrome, below header & modals |
| **Fixed site header** | **`z-header`** | **40** | **Single source of truth for the top bar.** |
| Sheet/drawer backdrop | `z-overlay` | 45 | Below modal content |
| Modal dialogs, mega-menu dropdown | `z-modal` | 50 | Matches Radix shadcn primitives' literal `z-50` |
| Hover cards, popovers | `z-popover` | 60 | |
| Toast (theoretical) | `z-notification` | 65 | Sonner ignores this and uses 9999 |
| Tooltip | `z-tooltip` | 70 | Highest layer we control |

### 2.3 Why they're in `@theme`, not `tailwind.config.js` (the v3→v4 lesson)
**This is the bug fixed in PR #341.** Tailwind v4 reads theme tokens from `@theme` blocks in CSS. The `theme.extend` syntax used in v3 is **silently ignored**. For ~6 months, our 12 custom tokens (`z-header`, `z-modal`, etc.) lived in `tailwind.config.js` and produced **no CSS classes at all**. Live `<header class="z-header">` resolved to `z-index: auto`.

How we found it: pulled live HTML, ran `curl https://www.dhmguide.com | head -30 | grep z-header`, then `curl <site> | grep -oE "\.z-header\b"` against the dist CSS. The class string was on the element but the rule was missing from CSS. Tailwind had silently skipped it.

**Rule for the future:** new design tokens go in `src/App.css` `@theme inline { ... }`. The `tailwind.config.js` file is now a stub with a pointer comment. Don't add `theme.extend` there — it'll appear to work locally (your IDE may auto-complete the class names) but emit zero CSS at build time.

---

## 3. The mega-menu portal pattern (case study)

### 3.1 The problem
The Topics mega-menu in `src/components/layout/Layout.jsx` was a `position: fixed; z-50` panel that lived as a DOM descendant of `<header>`. The header has THREE stacking-context creators stacked on it:

1. `position: fixed` with `z-index: 40` — creates a stacking context (always, when z is non-auto and element is positioned)
2. `backdrop-filter: blur(12px)` (`backdrop-blur-md`) — creates a stacking context (CSS Filter Effects L1)
3. *Until #339:* `<motion.header style={{ opacity: headerOpacity }}>` — opacity ≠ 1 creates a stacking context

Any one of those is sufficient to trap descendants. Because the dropdown was a DOM descendant of `<header>`, its `z-50` was clamped *inside* the header's local context. Any page content with `z-index ≥ 1` (or any of the 14 stacking-context creators above) outside the header — hero images, motion cards, the comparison widget — could paint above the dropdown.

### 3.2 The fix: `createPortal(<dropdown />, document.body)`
The portal **breaks the DOM relationship**. The dropdown is no longer a descendant of `<header>` — it's a direct child of `<body>`, sibling to `#root`. Its `z-50` now resolves at the document root context, where it's the highest z-index that exists, so it paints above everything we control.

### 3.3 When to portal vs stay-in-tree

**Portal when:**
- The element must paint above arbitrary page content regardless of ancestor styling.
- The element overlays the entire viewport (modals, dropdowns from a fixed header, full-screen lightboxes).
- The element's z-index is being trapped by any ancestor that has `position: fixed` + `z-index`, `transform`, `opacity`, `filter`, `backdrop-filter`, or `will-change`.
- You have to ship today and don't have time to audit every motion.div in the parent chain.

**Stay in tree when:**
- The element is a popover anchored to a sibling element with no troublesome ancestors (e.g., a dropdown inside a card with no transforms above it).
- Tab order needs to follow visual order without manual focus management.
- The element is short-lived and small (an inline tooltip on a button).

### 3.4 The portal implementation in `src/components/layout/Layout.jsx`

```jsx
// Imports
import { createPortal } from 'react-dom'

// State for hover/click semantics
const [isTopicsOpen, setIsTopicsOpen] = useState(false)
const [mounted, setMounted] = useState(false)
const topicsRef = useRef(null)
const dropdownRef = useRef(null)

// Gate the portal until after mount — document.body doesn't exist
// during SSR / prerender (we use jsdom for prerendering).
useEffect(() => { setMounted(true) }, [])

// Outside-click MUST check both refs. The portaled dropdown is no longer
// a descendant of the trigger, so topicsRef.contains(e.target) returns
// false for clicks inside the dropdown — without dropdownRef, internal
// clicks would close the menu before navigating.
useEffect(() => {
  if (!isTopicsOpen) return
  const onKey = (e) => { if (e.key === 'Escape') setIsTopicsOpen(false) }
  const onClick = (e) => {
    const inTrigger  = topicsRef.current?.contains(e.target)
    const inDropdown = dropdownRef.current?.contains(e.target)
    if (!inTrigger && !inDropdown) setIsTopicsOpen(false)
  }
  document.addEventListener('keydown', onKey)
  document.addEventListener('mousedown', onClick)
  return () => {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('mousedown', onClick)
  }
}, [isTopicsOpen])

// In render — trigger stays in the header
<div
  ref={topicsRef}
  className="relative"
  onMouseEnter={() => setIsTopicsOpen(true)}
  onMouseLeave={() => setIsTopicsOpen(false)}
>
  <button>Topics</button>
</div>

// Dropdown is portaled to document.body, OUTSIDE the header DOM subtree
{mounted && isTopicsOpen && createPortal(
  <div
    ref={dropdownRef}
    onMouseEnter={() => setIsTopicsOpen(true)}      // hover bridge!
    onMouseLeave={() => setIsTopicsOpen(false)}
    style={{ top: headerHeight + 8 }}
    className="fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
  >
    {/* ...content... */}
  </div>,
  document.body
)}
```

### 3.5 Three subtle gotchas (we hit all three)

1. **SSR / prerender safety.** `document.body` doesn't exist during prerender. Gate with `mounted` state set in `useEffect`. The `isTopicsOpen` flag also needs a user gesture to flip true, so it's effectively client-only anyway, but the explicit gate is belt-and-braces.

2. **Hover bridge.** Once the dropdown is no longer a DOM child of the trigger wrapper, moving the cursor from trigger → dropdown crosses out of the wrapper, fires `mouseleave`, and the menu closes mid-traversal. Fix: register `onMouseEnter`/`onMouseLeave` on the portaled element too, so either trigger OR dropdown keeps it open. (React's synthetic events bubble through portals back to the React parent tree, but native CSS `:hover` and `mouseleave` don't — so explicit handlers are required on the portal element.)

3. **Outside-click must check both refs.** `topicsRef.current.contains(e.target)` returns `false` for clicks inside the portaled dropdown (it's no longer a descendant), so internal clicks would close the menu before navigation completes. Track `dropdownRef` separately and treat a click as "outside" only if it lands in neither.

---

## 4. Anti-patterns (what NOT to do)

### 4.1 Don't add `transform`/`opacity`/`filter`/`will-change`/`backdrop-filter` to `<header>`, `<main>`, or any layout-shell ancestor
This is the trap. Any of these on an ancestor of an absolute-positioned dropdown clamps the dropdown's z-index inside the ancestor's stacking context. It worked yesterday, it broke today because someone added `style={{ opacity: 0.99 }}`, and you'll spend 4 hours hunting through the right file for the reason.

**Concrete examples that break things:**
- `<motion.header style={{ opacity: headerOpacity }}>` — even an opacity that's *visually identical to 1.0* creates the trap (#339 root cause).
- `className="... transform ..."` on `<main>` — even an empty `transform: none` set via a CSS reset can trigger this in some browsers (always test).
- `style={{ willChange: 'transform' }}` on a wrapper "for performance" — creates the context whether or not transforms are actually used.

### 4.2 Don't use literal `z-50` when you mean `z-modal`
We have semantic tokens for a reason. `z-50` and `z-modal` happen to evaluate to the same number today, but if the scale gets renumbered, you want your modal to track "modal", not "50". (Past tense reality: pre-#341 the `z-header` token didn't generate any CSS at all because it was in the wrong file. Semantic tokens that don't emit are worse than the numeric value, but the fix is to make them emit, not to fall back to literals.)

**Exception:** Radix shadcn primitives (`src/components/ui/*`) use literal `z-50` because they're regenerated by upgrades. Don't fight the library — leave their literals alone.

### 4.3 Don't rely on document order for layering
Two siblings with `z-index: auto` paint in DOM order: later wins. This is a tie-breaker, not a strategy. If you find yourself thinking "the comparison widget is below the dropdown because it comes earlier in DOM," you've coupled paint order to JSX structure — the next refactor will silently break it. **Always set explicit z-index** on anything that needs to layer.

### 4.4 Don't put new tokens in `tailwind.config.js`
Tailwind v4 silently ignores `theme.extend.zIndex` in the config file. Tokens go in `src/App.css` inside `@theme inline { ... }`. The config file is a stub; treat it as a documentation-only file. (Our `tailwind.config.js` has a comment explaining this — leave the stub there as a signpost.)

### 4.5 Don't bump z-index numbers when layering looks wrong
If `z-50` doesn't paint above `z-10`, the answer is **never** "let me try `z-[100]`." It's that there's a stacking-context boundary between them. Walk the parent chain. Find the ancestor with `transform`, `opacity`, `filter`, `backdrop-filter`, or `will-change`. That's the actual bug.

### 4.6 Don't style `<main>` with anything that could create a stacking context
The current `<main>` has `style={{ paddingTop: ... }} className="transition-[padding] duration-300"`. The padding transition is safe (transitions on non-transform/opacity properties don't create stacking contexts). But adding `motion.main` with opacity, or `style={{ transform: ... }}`, or `className="... isolate"` would change this — all page-level layered elements (modals, dropdowns) would suddenly be siblings of a stacking context root with z-index 0, and the header at z-40 would paint above them but their `z-50` modals wouldn't escape.

If `<main>` ever needs effects, scope them to a child wrapper, not the `<main>` itself.

---

## 5. Debugging checklist (when things look layered wrong)

Run these in order. Stop when you find the cause.

### Step 1: Confirm the symptom precisely
Open DevTools → Elements → highlight the layered element. Read the **Computed** tab. Two questions:
- What is the **computed `z-index`**? (Not the class — the actual computed value.)
- What is the **computed `position`**? (z-index has no effect on `position: static` elements.)

If `z-index` is `auto` when you expected `40`: your class isn't applying. **This is the #341 bug.** Either:
- The token isn't defined in `@theme inline`.
- The class name is misspelled.
- A more specific selector is overriding it.

```bash
# Quick verification: does the class actually exist in dist CSS?
curl https://www.dhmguide.com | grep -oE "\.z-header\b" | head -3
# If empty: token not generated. Move it to @theme inline.
```

### Step 2: Walk the parent chain looking for stacking-context creators
For each ancestor, check the **Computed** tab for any of these properties (sorted by likelihood):

1. `opacity` — if it's anything other than `1`, you've found a context. Common culprits: `<motion.*>` components, `aria-hidden` CSS rules, hover/active states.
2. `transform` — if it's anything other than `none`, context. Common culprits: `-translate-x-1/2`, `whileHover={{ scale: 1.05 }}`, `motion.*` with any transform prop.
3. `backdrop-filter` — if non-`none`, context. Common: `backdrop-blur-*` Tailwind classes.
4. `filter` — if non-`none`, context.
5. `will-change` — if it lists `transform` or `opacity`, context.
6. `isolation` — if `isolate`, intentional context.
7. `contain` — if `paint`/`layout`/`strict`, context.
8. `mix-blend-mode`, `clip-path`, `mask` — rare but possible.
9. `position: fixed` or `sticky` (always a context).
10. `position: relative` or `absolute` *with z-index ≠ auto* (context).

The first ancestor where any of these is non-default is your culprit. Either remove that property (best, if it's accidental) or portal the descendant out (defensive).

### Step 3: Verify the class actually exists in CSS
```bash
# Live CSS audit
curl https://www.dhmguide.com/assets/index-*.css 2>/dev/null | grep -oE "\.z-[a-z-]+\b" | sort -u
```
If the class is in your JSX but not in the CSS, the token isn't being emitted. Check `src/App.css` `@theme inline { ... }`.

### Step 4: Use Playwright `page.evaluate` for ground truth
DevTools' "highlight" can be misleading when stacking contexts compose oddly. The definitive answer is `document.elementsFromPoint(x, y)`:

```js
// In a Playwright test:
const stack = await page.evaluate(({x, y}) => {
  return document.elementsFromPoint(x, y).map(el => ({
    tag: el.tagName,
    id: el.id,
    classes: el.className,
    zIndex: getComputedStyle(el).zIndex,
    position: getComputedStyle(el).position,
  }))
}, { x: 400, y: 300 })
console.log(stack) // index 0 is the topmost element under that pixel
```

R3 in `docs/layering-audit-2026-04-26/` used this exact pattern to prove the dropdown was below the hero image after #339 — and to verify #340's portal fix.

### Step 5: Verify your assumption with an empirical fix
Sometimes you suspect a specific cause but want to prove it before refactoring. Open DevTools console and try the fix manually:

```js
// Try removing the suspect ancestor's stacking-context creator
document.querySelector('header').style.opacity = '1'

// Or try escalating the trapped element to body
document.body.appendChild(document.querySelector('#topics-mega-menu'))

// Re-check elementsFromPoint to see if the layering is now correct
```

If the manual fix works, you've confirmed the cause. Now do the proper fix in code.

---

## 6. Recent incidents (April 26-27, 2026)

These are the four PRs that produced this document. Read these, internalize the failure modes, don't repeat them.

### 6.1 PR #339 — Mega-menu trapped beneath page content (round 1)
**Symptom:** Hovering the Topics nav opened a dropdown panel, but page content (hero images, motion cards) painted on top of it. The dropdown was visible but unhoverable on its lower half.

**Root cause:** `<motion.header style={{ opacity: headerOpacity }}>` in Layout.jsx, where `headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])`. Any scroll set the inline `opacity` to `0.99`-ish, which **creates a stacking context** (CSS spec: `opacity ≠ 1`). The dropdown's `z-50` was trapped inside the header's local context.

**Fix:** Removed the imperceptible 5% opacity fade and the `useScroll`/`useTransform` imports. Changed `<motion.header>` to `<header>`. As defense in depth, also promoted the dropdown from `position: absolute` to `position: fixed` with computed top.

**Lesson learned:** "Imperceptible" visual effects can have load-bearing CSS side effects. A 5% opacity change you can't see still creates a stacking context.

### 6.2 PR #340 — Mega-menu still trapped (round 2)
**Symptom:** Same as #339, after #339 deployed.

**Root cause:** #339 removed the `opacity` trap, but the header had two **other** stacking-context creators we didn't initially address:
- `position: fixed` + `z-index: 40` (always a context)
- `backdrop-filter: blur(12px)` (`backdrop-blur-md` — a context per CSS Filter Effects L1)

Either one was sufficient. R3's Playwright trace confirmed the dropdown was still below the hero image. Empirical fix matrix tested 7 approaches; only two worked:
- D: `document.body.appendChild(dropdown)` (portal)
- E: `header.style.zIndex = '50'` (raise the header to outrank stock z-50 page content)

**Fix:** Portal the dropdown to `document.body` via `createPortal`. The dropdown is no longer a DOM descendant of the header, so its z-50 is now resolved at the document root context.

**Lesson learned:** Removing one stacking-context creator from an ancestor doesn't help if there are others. The portal is the universal escape — it severs the DOM relationship rather than playing whack-a-mole on ancestor styles.

### 6.3 PR #341 — `z-header` was `z-auto` for ~6 months
**Symptom:** Page images scrolled OVER the fixed header during scroll. Hero images, comparison widgets, anything with the slightest z-index appeared on top of the header logo.

**Root cause:** Tailwind v4 reads theme tokens from `@theme` blocks in CSS. The `theme.extend.zIndex` syntax in `tailwind.config.js` is **silently ignored** in v4. All 12 of our custom tokens (`z-header`, `z-modal`, `z-popover`, etc.) generated NO CSS classes. Live `<header class="z-header bg-white/80 ...">` resolved to `z-index: auto`.

How we caught it: pulled live CSS, grepped for `\.z-header\b`. Empty. Then grepped the codebase for `theme.extend` — there it was, in v3-style config, dead. Tailwind v4 had been quietly dropping it on every build since the v4 upgrade.

**Fix:** Moved the scale to `@theme inline { ... }` in `src/App.css`. Verified post-build that all 11 custom classes now exist in dist CSS. Also bumped `--z-index-header` from 30 → 40 (above stock z-30 used elsewhere). Replaced `tailwind.config.js` with a stub + pointer comment.

**Lesson learned:** When you upgrade a major version of a build tool, **verify your tokens still emit**. Don't trust the IDE auto-complete — it sees the JS object, not the CSS output. A `curl + grep` smoke test on the built CSS catches this in 30 seconds.

### 6.4 The 3 latent issues from #341
Bumping `--z-index-header` from 30 → 40 fixed the visible bug but inverted three pieces of design intent that had assumed `header = 30`:

1. **`--z-index-comparison: 35`** was originally "above the header (30)". Post-#341, comparison (35) is now **below** the header (40). On routes where the comparison widget appears, the header now visually overlaps it. (Triage: probably intended — comparison widget shouldn't cover the nav. But document the inversion.)
2. **`--z-index-overlay: 40`** was historically "page overlays / drawers." Now it's tied with the header. Move overlay to 45 (between header and modal) so drawer backdrops paint above the header.
3. **Modal (50) and dropdown panel (50)** are tied. With Radix's `z-50` literal in 21 components, this matches Sonner / shadcn primitives — intentional. But our own mega-menu dropdown is also `z-50`, so a modal opening while the dropdown is hovered relies on DOM order tie-breaking. (Acceptable for now; if it bites someone, promote modal to 55.)

**Lesson learned:** When you renumber a z-index scale, every consumer assumed the old numbers. Audit the scale top-to-bottom after any renumber, even if the token names are stable. Numerical relationships matter, not just names.

---

## 7. Lessons codified as `CLAUDE.md` Pattern entries

These three are formatted to paste directly into the project's `CLAUDE.md` file under "Proven Patterns from Real Work."

---

### Pattern #14: Stacking-Context Trap — Walk the Parent Chain, Don't Bump Z-Index (PRs #339, #340)
**What we learned:** Two PRs over 30 minutes both tried to fix the same mega-menu overlap by changing the dropdown. Neither worked because the bug was in an *ancestor*, not the dropdown. PR #339 removed an `opacity: 0.95` animation (one stacking-context trap) from the header. PR #340 was needed because the header still had two other traps (`position: fixed; z-40` and `backdrop-filter: blur-md`), so the dropdown was still trapped — only this time we portaled it to `document.body` to sever the DOM relationship.

**Application:**
- When a layered element doesn't paint where you expect, **walk the parent chain in DevTools** looking for any of these on ancestors: `transform`, `opacity ≠ 1`, `filter`, `backdrop-filter`, `will-change` (transform/opacity), `isolation: isolate`, `contain: paint`, `mix-blend-mode`, `clip-path`. The first one you find is your culprit.
- **Never** answer "z-index doesn't work" with "let me try `z-[9999]`." Z-index is meaningless across stacking contexts.
- For elements that must paint above arbitrary page content (modals, dropdowns from a fixed header, full-screen lightboxes), **portal to `document.body`** with `createPortal`. It's defensive against any future ancestor that adds a stacking-context creator.
- Verify with `document.elementsFromPoint(x, y)` (in DevTools console or Playwright) — that's the ground truth for stacking, not z-index reasoning.

**Key insight:** Stacking is a tree problem (the stacking-context tree), not a number problem. The fix is almost never to make the number bigger. The fix is to find the wrong ancestor or escape the DOM subtree.

**Files affected:** `src/components/layout/Layout.jsx` (mega-menu trigger + portaled dropdown), `docs/layering-strategy-2026-04-27/A9-documentation.md` (canonical reference).

---

### Pattern #15: Tailwind v4 Theme Tokens Live in `@theme`, Not `tailwind.config.js` (PR #341)
**What we learned:** For ~6 months after the Tailwind v3→v4 upgrade, all 12 custom z-index tokens (`z-header`, `z-modal`, `z-popover`, etc.) were defined in `tailwind.config.js` `theme.extend.zIndex` — and Tailwind v4 silently ignored them. NO classes were generated. Live `<header class="z-header">` resolved to `z-index: auto`. Page images scrolled over the fixed header. We discovered the bug only when looking at it head-on with `curl <site> | grep -oE "\.z-header\b"` and finding nothing.

**Application:**
- After ANY major build-tool upgrade (Tailwind, PostCSS, Vite), run a smoke test against the built CSS to verify tokens emit:
  ```bash
  npm run build
  grep -oE "\.z-[a-z-]+" dist/assets/index-*.css | sort -u
  # Expected output: all your custom z-* classes
  ```
- For Tailwind v4, all design tokens go in `src/App.css` `@theme inline { ... }`. The config file is a stub; don't add `theme.extend` there.
- IDE auto-complete is misleading — it sees the JS object, not the CSS output. Trust `curl + grep` on the built CSS, not your editor.
- Document the v4 vs v3 distinction in a comment at the top of any related file (we did this in `tailwind.config.js` and `src/App.css`).

**Key insight:** Silent failures in the build pipeline are the worst kind. The dev server compiled, the production build compiled, the IDE was happy. Only the live HTML revealed the bug. Always reach for `curl` to see what crawlers and browsers actually receive — not what you think you shipped.

**How to prevent:** Add a CI step that asserts custom z-index classes are present in dist CSS. Greppable token list, fail the build if any are missing. Cheap insurance.

---

### Pattern #16: Renumbering a Z-Index Scale Inverts Every Implicit Relationship (PR #341 latent issues)
**What we learned:** PR #341 fixed the broken `z-header` token by emitting it correctly, AND simultaneously bumped its value from 30 → 40 to outrank stock z-30 page content. That bump silently inverted three design relationships: `comparison: 35` (originally "above header") is now below header (40); `overlay: 40` (originally "above header") is now tied with header; modal (50) is now only 10 above header instead of 20. Each was an intentional design decision encoded as a numeric gap, not a token name.

**Application:**
- Treat **the gaps between z-index tokens as intentional design**. Names tell you "this is the modal layer"; numbers tell you "the modal is 10 above the dropdown, 20 above the header." Both carry information.
- When renumbering, audit EVERY consumer of the scale (`grep -rn "z-[a-z]\+\|z-index" src/`) and verify each pair's numeric relationship still holds.
- After a renumber, write a follow-up issue listing intended-vs-actual relationships. We had 3 latent issues from one bump; documenting them prevented surprise breakage downstream.
- Prefer additive changes (insert a new token between existing ones) over renumbers (changing an existing token's value).

**Key insight:** Numbers in a token scale are never just labels. The math (header < comparison < modal, with specific gaps) encodes the design. Changing one number changes every relationship that touched it. Audit the whole scale after any change, not just the touched token.

---

## 8. File reference (where things live)

| Concern | File | Lines |
|---|---|---|
| **Z-index scale (canonical)** | `src/App.css` | `@theme inline` block, ~line 26-42 |
| **Tailwind config (stub)** | `tailwind.config.js` | Whole file is a pointer comment to App.css |
| **Header (z-context creator)** | `src/components/layout/Layout.jsx` | 96-377 |
| **Mega-menu trigger** | `src/components/layout/Layout.jsx` | 138-179 |
| **Mega-menu portal (dropdown panel)** | `src/components/layout/Layout.jsx` | 379-462 |
| **Header z-40 token** | `--z-index-header: 40` in `App.css` `@theme inline` | |
| **Headers' DON'T-ADD comment** | `src/components/layout/Layout.jsx` | 98-103 |
| **Sticky mobile CTA (z-50)** | `src/components/StickyMobileCTA.jsx` | 72 |
| **Image lightbox (z-50)** | `src/newblog/components/ImageLightbox.jsx` | 51 |
| **Comparison widget (z-comparison=35)** | `src/components/ComparisonWidget.jsx` | 60 |
| **Sonner toaster (z-9999, library default)** | `src/App.jsx` | 95 |
| **Audit artifacts (root cause traces)** | `docs/layering-audit-2026-04-26/` | L1-L5, R1-R4 |

---

## 9. Quick-reference card (laminate this)

**Symptom: an element doesn't paint where I expect.**
1. Computed z-index in DevTools — is it the value you set?
   - If `auto` → token not emitting → check `src/App.css` `@theme inline` (Pattern #15)
2. Walk parent chain — any ancestor with `transform`, `opacity ≠ 1`, `filter`, `backdrop-filter`, `will-change`, `isolation`, `contain`?
   - Yes → that's the trap. Either remove the property (if accidental) or portal the descendant out (Pattern #14)
3. `document.elementsFromPoint(x, y)` in console — what's actually on top?
4. Bigger z-index never works across stacking contexts. Stop trying.

**Symptom: I added a new layered component and it doesn't work.**
1. Use a semantic token: `z-modal`, `z-popover`, `z-tooltip` — not `z-50`.
2. If the component must paint above arbitrary page content, portal to `document.body`. Don't fight the parent chain.
3. Verify the class emits: `npm run build && grep "\.z-yourtoken\b" dist/assets/*.css`.

**Symptom: I'm changing layout-shell components (`Layout.jsx`, `App.jsx`, `<main>`).**
1. Don't add `transform`, `opacity ≠ 1`, `filter`, `backdrop-filter`, `will-change`, `isolation`, or `contain` to ancestors of layered elements (modals, dropdowns) without verifying nothing depends on the missing stacking-context boundary.
2. The header has `backdrop-blur-md` and `position: fixed` — it's already two stacking-context creators. The mega-menu is portaled because of this. Don't undo the portal without removing those.
3. If you must add an effect to `<main>`, scope it to a child wrapper, not `<main>` itself.

---

**End of document.** If you make changes that contradict anything above, update this file in the same PR.
