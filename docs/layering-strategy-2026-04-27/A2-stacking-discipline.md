# A2 — Stacking-Context Discipline for the Layout Shell

**Date:** 2026-04-27
**Author:** A2 (defensive-architecture agent)
**Inputs read:**
- `docs/layering-audit-2026-04-26/L2-stacking-contexts.md` (60+ stacking-context creators across the codebase)
- `docs/layering-audit-2026-04-26/L5-remediation-plan.md` (P0 fix shipped in #161)
- `docs/layering-audit-2026-04-26/R4-main-wrapper.md` (deep audit of `<main>` wrapper)
- PR #341 — `fix: define z-index tokens in @theme so Tailwind v4 emits the classes`
- `src/components/layout/Layout.jsx` (current shell, 581 lines)
- Source guides: Josh Comeau, Ahmad Shadeed, MDN, web.dev, CSS-Tricks (see Sources)

**Goal:** Define a defensive stacking-context discipline so future devs cannot re-introduce the trap fixed in #161. Strategy must outlive memory of the bug.

---

## TL;DR

- **The trap, in one sentence:** Any `transform`, `opacity ≠ 1`, `filter`, `backdrop-filter`, `will-change`, `isolation`, `mix-blend-mode`, `contain: layout|paint|strict|content`, or `position: fixed/sticky + z-index` on an *ancestor* of an absolutely-positioned descendant clamps that descendant's `z-index` inside the ancestor's local stacking order — and any sibling outside the ancestor at `z-index ≥ 1` will paint over it.
- **The discipline, in one sentence:** Reserve the layout shell (`outer-div → header → main → footer`) for **flow only**. Push every effect (animation, blur, parallax, sticky transform) **down into contained sections** that can never become an ancestor of layered chrome (header, dropdown, modal, drawer, toast). Portal anything that doesn't follow that rule.
- **What changes for devs:** A 7-rule shortlist below, paste-ready JSX templates for the shell, a CLAUDE.md-ready append block, and 2 lint guards.

---

## 1. Background research (2025-2026 source distillation)

### 1.1 Josh Comeau — "What the heck, z-index??"
- **Mental model:** Stacking contexts behave like Photoshop layer groups. A z-index value only competes with siblings inside the same group. A child element inside a low-z group can never paint above a high-z element in a different group, no matter how high its local z-index.
- **The 9 things that create a stacking context** (canonical list):
  1. `position: relative | absolute | fixed | sticky` *with* a numeric `z-index`
  2. `position: fixed | sticky` (sticky always; fixed only in some engines but treat as always)
  3. `opacity < 1`
  4. `transform: ≠ none` (any value, including `translate*`, `scale`, `rotate`, `none ≠ value`)
  5. `filter: ≠ none`
  6. `backdrop-filter: ≠ none`
  7. `mix-blend-mode: ≠ normal`
  8. `isolation: isolate`
  9. `will-change` listing any of the above properties (`transform`, `opacity`, `filter`)
  10. `contain: layout | paint | strict | content` (added in Containment L2)
  11. `clip-path` (in some engines)
- **Defensive pattern:** Wrap every component that uses `z-index` in a deliberately-isolated container (`isolation: isolate`) so the component's z-index is scoped to the container and can't escape into the global page.
- **Anti-pattern:** Adding `transform: translateY(0)` "for hardware acceleration" — this silently creates a stacking context. Use `will-change: auto` (default) and let the browser decide.

### 1.2 Ahmad Shadeed — "Understanding Z-Index in CSS"
- **Visual mental model:** Duck-in-water analogy. The duck (child) floats inside the bowl (parent stacking context). You can't make the duck higher than the bowl by raising its z-index — you have to take it out of the bowl.
- **Diagnostic process:** When z-index "doesn't work," walk the parent chain in DevTools. Find the first ancestor with a stacking-context-creating property; that's the bowl.
- **Practical rule:** *Don't add z-index to anything that isn't already positioned.* z-index on `position: static` is silently ignored — devs add it, see no effect, and move on without realizing they didn't actually create the layer they wanted.

### 1.3 MDN / web.dev — `isolation: isolate`
- The *only* CSS property whose sole purpose is to create a stacking context. No side-effects on layout, paint, or animation.
- **Use cases:**
  1. **Wrap reusable components** so their internal z-index doesn't leak into consumers.
  2. **Defensive root for dynamic content** — set on the outer wrapper of a section that holds modals/drawers, so its descendants can't escape upward into chrome.
  3. **Block global blend modes / filters** from compositing into a region.
- **Anti-use case:** Do **NOT** put `isolation: isolate` on `<main>` if `<main>` has descendants that need to escape upward (sticky CTAs, drawers, modals portaled inside `<main>`). Isolation traps as effectively as `transform`.

### 1.4 CSS Cascade Layers (`@layer`) interaction
- `@layer` controls **specificity** ordering, not stacking order. `@layer base { .x { z-index: 1 } }` and `@layer overlay { .x { z-index: 100 } }` resolve via cascade priority, but the resulting z-index value still resolves at runtime against the stacking-context tree.
- **No interaction with stacking contexts.** A property in a higher cascade layer doesn't escape stacking contexts created by ancestors. Mentioning this rules it out as a fix.
- Useful for: organizing utility/component/override CSS, *not* solving stacking traps.

### 1.5 `contain` property (CSS Containment L1/L2)
- `contain: layout` → creates a stacking context ✓ (also: containing block for absolute/fixed descendants)
- `contain: paint` → creates a stacking context ✓ (also: clips overflow, isolates paint)
- `contain: strict` = `size layout paint style` → creates a stacking context ✓
- `contain: content` = `layout paint` → creates a stacking context ✓
- `contain: size` alone → does NOT create a stacking context
- `contain: style` alone → does NOT create a stacking context
- **Trap:** `content-visibility: auto` (used for offscreen optimization) implies `contain: layout style paint` → creates stacking context. If a dev adds `content-visibility: auto` to `<main>` for performance, every absolute descendant gets trapped.
- **Discipline:** treat `contain` as equivalent to `isolation: isolate` for stacking purposes. Allowed in **leaf components**, banned on **layout-shell ancestors**.

### 1.6 `position: fixed` vs `position: sticky` — stacking implications
- **`fixed`:** Creates a stacking context only when paired with a numeric `z-index`. Crucially, **a fixed element's positioning is *escape-by-default* from the document flow**, but **NOT from the stacking context chain** if any ancestor has `transform`, `filter`, or `perspective` (these turn the fixed-positioned element into a "containing block fixed" relative to that ancestor — a separate bug from the stacking trap, but related). Modern Chrome/Safari treat `transform` ancestors as fixed-positioning containing blocks, breaking the visual escape.
- **`sticky`:** **Always** creates a stacking context, even without z-index. It also stays in flow (unlike fixed), so it shares parents' stacking trap risk *and* gets its own context. The riskiest of the four positioning values for layering.
- **Practical rules:**
  - For full-viewport-relative chrome (header, modals, drawers, sticky CTAs that follow scroll): use `position: fixed` *and* portal the element to `document.body` if any ancestor has `transform`/`filter`/`backdrop-filter`/`will-change`. The portal is the only bulletproof escape.
  - For "sticks until scrolled past" UX (table-of-contents, in-content sticky CTA tied to a section): use `position: sticky` and accept that it creates a stacking context. Keep its parent free of stacking-context-creating properties so the sticky element's z-index resolves against the section, not the page chrome.

---

## 2. Audit of current `Layout.jsx` shell

### 2.1 DOM tree (current, post-#161, post-PR #341)

```
<div className="min-h-screen bg-gradient-to-br ...">              [Layout root — NO context]
  ├─ <header ref={headerRef} className="fixed ... z-header        [HEADER — creates context: position:fixed + z-40 + backdrop-filter]
  │           bg-white/80 backdrop-blur-md ...">
  │   └─ <div container>
  │       └─ <div flex>
  │           ├─ <a logo>
  │           │   └─ <motion.div whileHover={{rotate:360}}>        [creates context during hover: transform]
  │           ├─ <nav desktop>
  │           │   ├─ <div ref={topicsRef} className="relative">    [NO context — relative without z-index]
  │           │   │   └─ <button> + (portal target — no DOM child)
  │           │   └─ <a> + <motion.div layoutId="activeTab">       [creates context: layoutId animation]
  │           ├─ <Button cta>
  │           └─ <button mobile-menu>
  │       └─ <motion.nav mobile-menu>                              [creates context when open: opacity/y animation]
  │
  ├─ {portal target} → document.body                               [Topics dropdown lives here, escapes header context]
  │   └─ <div fixed left-1/2 -translate-x-1/2 z-50>                [CONTEXT (transform), but at root level — safe]
  │
  ├─ <main paddingTop={headerHeight} transition-[padding]>          [MAIN — NO context (transition on padding only)]
  │   └─ {children}                                                [page subtrees, varies; some create local contexts]
  │
  ├─ <StickyMobileCTA />                                           [renders <div fixed bottom-0 z-50 transform>; CONTEXT]
  │
  └─ <footer className="bg-gray-900 ...">                          [NO context]
```

### 2.2 Stacking-context creators on the shell

| Element | Position | Properties | Creates context? | Blast radius |
|---|---|---|---|---|
| `<div>` (Layout root) | static | gradient bg only | NO | — |
| `<header>` | fixed | `z-header` (40) + `backdrop-filter: blur` | **YES** (3 reasons) | Everything in `<header>` subtree (logo, nav, dropdown trigger, mobile menu). **Topics dropdown was here pre-portal.** |
| `<main>` | static | `transition-[padding]` (animates `padding`, not transform) | NO | — |
| `<StickyMobileCTA>` `<div>` | fixed | `z-50` + inline `transform: translateY(...)` | **YES** (3 reasons) | Its children only. No descendants need to escape it (button + dismiss X are leaf). Risk = mobile only. |
| `<footer>` | static | bg-color only | NO | — |
| Portal target on `document.body` | fixed | `z-50` + `-translate-x-1/2` (transform) | **YES** but at body level | Mega-menu content. Lives at root, sibling to React app — no parents create context above. **Safe.** |

### 2.3 Latent traps (the 3 from PR #341 review)

1. **Header stays a stacking context.** Even after removing the `opacity` animation in #161, `backdrop-filter: blur-md` keeps the header as a context root. *Today* this is fine because the dropdown is portaled out. *Tomorrow* if a dev re-adds an in-header dropdown (e.g., user-account menu, search dropdown) without portaling, the trap returns silently. **Mitigation:** documented rule #2 + lint guard.
2. **`StickyMobileCTA` shares `z-50` with the dropdown portal.** Both render at root via `fixed` + `z-50`. DOM order resolves them today (CTA renders later, paints on top), but if someone adds a third `z-50` element (e.g., a chat widget) the order becomes implementation-dependent. **Mitigation:** rule #5 + use semantic `z-*` tokens (`z-dropdown` = 50, `z-sticky-cta` = 50 with explicit DOM-order docs, OR bump CTA to `z-modal` if it should always win).
3. **Tailwind `transform` utility on layout-shell siblings is unprotected.** Running `grep -r "className=.*transform" src/components/layout/` finds nothing today, but adding `<header className="fixed ... transform">` (e.g., for a slide-in animation) would silently re-trap the dropdown trigger inside the header before the portal effect runs (mount lifecycle). **Mitigation:** rule #1 + lint guard #1.

---

## 3. Layout-shell template (the discipline, codified)

### 3.1 Pattern: "Inert shell, contained effects"

```jsx
// src/components/layout/Layout.jsx — REFERENCE TEMPLATE

function Layout({ children }) {
  // ... hooks ...

  return (
    // SHELL ROOT — never receives transform/opacity/filter/will-change/contain.
    // Bg gradients are fine (paint-only, no stacking context).
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">

      {/* HEADER — fixed + backdrop-filter is allowed, BUT:
          - any descendant that needs z-index above page content must be portaled to <body>.
          - never animate opacity/transform/filter on <header> itself.
          - if you need a scroll-driven header effect, animate background-color or
            border-color (these don't create stacking contexts). */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md border-b border-green-100"
      >
        {/* nav, logo, dropdown TRIGGERS only — dropdown PANELS portal out */}
      </header>

      {/* PORTALED OVERLAYS — render here via createPortal(..., document.body).
          Each lives at body level, sibling to #root. None can be trapped by header/main/etc. */}

      {/* MAIN — no transform, no opacity, no filter, no will-change, no isolation,
          no contain: layout|paint|strict|content. Just padding + children.
          If a page section needs a stacking context, it goes ON THE SECTION,
          not on <main>. */}
      <main style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300">
        {children}
      </main>

      {/* SHELL-LEVEL FIXED CHROME — sticky CTA, comparison widget, cookie banner.
          Each must use position:fixed + a semantic z-* token, AND must not have
          parent ancestors with stacking-context properties. Render as siblings
          of <main>, NOT as descendants. */}
      <StickyMobileCTA />

      {/* FOOTER — flow only. No stacking context. */}
      <footer className="bg-gray-900 text-white py-12">
        {/* ... */}
      </footer>
    </div>
  )
}
```

### 3.2 Should `<main>` create its own stacking context?

**NO.** Tempting because it scopes page-level z-index, but it breaks two things:
1. Modals/drawers portaled into `<main>` (or any descendant) get trapped at `<main>`'s context layer (`z-modal` = 50). They can no longer paint over the header (`z-header` = 40) **at the root level** — they'll paint at `<main>`'s root, which is *below* header chrome.
2. `position: sticky` table-of-contents / sticky CTA inside `<main>` would resolve against `<main>`'s context, not the viewport. Good for some UX, bad for "sticky to top of viewport" effects.

**The right move:** keep `<main>` inert, isolate **leaf components** (`isolation: isolate` on a card, hero, image gallery) so their internal z-index doesn't leak.

### 3.3 Should `<header>` be a sibling of `<main>` or a child of a wrapper?

**Sibling.** Current structure is correct:

```
<div Layout-root>          ← inert wrapper
  <header />               ← sibling 1
  {portals}                ← portaled to body, NOT a sibling of these
  <main />                 ← sibling 2
  <StickyMobileCTA />      ← sibling 3
  <footer />               ← sibling 4
</div>
```

**Why siblings:**
- Each can independently create a stacking context without trapping the others.
- `<header>` z-40 and `<main>` z-auto (0) resolve at the layout-root level, not nested.
- Adding a sibling later (banner, devtools) doesn't require restructuring.

**Don't do this:**
```
<div Layout-root>
  <div className="header-and-content-wrapper">    ← BAD — wrapper can become context
    <header />
    <main />
  </div>
  <footer />
</div>
```
Why bad: any future styling on `.header-and-content-wrapper` (transform, will-change, contain) would trap header *and* main descendants together.

### 3.4 Where do animation/filter effects belong?

**Inside contained sections, never on layout-shell ancestors.**

```jsx
// ✅ GOOD — animation lives in the section
<main>
  <section className="hero">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Picture src="..." />
    </motion.div>
  </section>
</main>

// ❌ BAD — animation lives on the shell
<motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  <section className="hero">
    <Picture src="..." />
  </section>
</motion.main>
```

The bad version makes `<main>` a stacking context for the duration of the animation (and forever after, since `opacity: 1` doesn't *remove* the context once framer-motion sets it inline — the inline style stays). Anything portaled into `<main>` is now trapped.

### 3.5 `position: fixed` vs `position: sticky` — when to use which

| UX goal | Use | Stacking notes |
|---|---|---|
| Site header that follows scroll, always at top of viewport | `fixed` + portal anything overlaid | Allowed to create context; descendants must portal out |
| Mobile sticky CTA bar at bottom | `fixed` + sibling-of-main | Don't put inside `<main>` if `<main>` ever becomes a context |
| Modal / drawer overlay | `fixed` + portal to body | Always portal — never assume ancestor chain is clean |
| Table-of-contents pinned in the article | `sticky` inside the article column | Article column is the context root; section content is below ToC. Don't add stacking-context properties to the article column. |
| In-section "buy now" pinned to viewport edge | `sticky` inside the section | Same as ToC; risky if section parent ever gets `transform` (motion.section, etc.) |

**Rule of thumb:** if the element should escape *any* possible parent context, use `fixed` + `createPortal(..., document.body)`. If the element is naturally scoped to a region, use `sticky` and protect that region's parent from acquiring a stacking-context property.

---

## 4. The 7 Stacking-Discipline Rules (1-page CLAUDE.md insert)

```markdown
### Pattern #14: Stacking-Context Discipline (the 7 Rules)

The DHM Guide layout shell (`src/components/layout/Layout.jsx`) and any wrapper
between `#root` and the rendered page MUST follow these rules. Violating any
one of them re-introduces the mega-menu trap fixed in #161.

**Rule 1 — The shell is inert.**
Never apply `transform`, `opacity ≠ 1`, `filter`, `backdrop-filter` (except on
`<header>`, intentional), `will-change`, `isolation`, `mix-blend-mode`, or
`contain: layout|paint|strict|content` to any of: outer Layout `<div>`,
`<main>`, `<footer>`, or any ancestor between `<App>` and these.

**Rule 2 — Fixed chrome with stacking-context properties must portal its overlays.**
`<header>` is allowed `position: fixed`, `backdrop-filter: blur`, and
`z-header`. ANY descendant of `<header>` (or any other shell-level fixed-positioned
element) that needs `z-index` above page content MUST render via
`createPortal(panel, document.body)`. The trigger stays in DOM for hover/keyboard;
the panel lives at body level.

**Rule 3 — Animations belong on sections and below, never on shell ancestors.**
`motion.div`/`motion.section` inside a section is fine. `motion.main`,
`motion.header` with style props (`opacity`, `y`, etc.), or `<motion.div>`
wrapping `{children}` in Layout — banned. (Static `motion.*` without inline
`style={{ opacity }}` is also banned on the shell — even one render with
`opacity: 0.999` from a transition creates a context that persists.)

**Rule 4 — Use semantic `z-*` tokens, never raw numbers.**
Tokens live in `src/App.css` `@theme inline` block (Tailwind v4 — config.js is
ignored, see PR #341). Use `z-header`, `z-dropdown`, `z-modal`, `z-sticky`,
`z-comparison`, `z-popover`, `z-notification`, `z-tooltip`. Raw `z-50` is allowed
ONLY in shadcn primitives (regenerate on upgrade).

**Rule 5 — Portaled overlays declare their layer.**
A portal to `document.body` doesn't free you from token discipline.
`createPortal(<div className="z-modal" />, document.body)` is correct;
`createPortal(<div className="z-50" />, ...)` is not.

**Rule 6 — `position: sticky` requires parent vetting.**
Any sticky element's *direct parent* must NOT create a stacking context (no
`transform`, `motion.*`, `contain: layout|paint`, etc.). Sticky always creates
its own context, which is fine — but its parent's context will trap it.
Add `// SECTION CONTEXT ROOT — DO NOT ADD transform/opacity/filter` comment
above any container that holds a sticky child.

**Rule 7 — Never add `z-index` to a `position: static` element.**
It's silently ignored. If you reach for z-index, you must also set
`position: relative | absolute | fixed | sticky`. Either the element needs
positioning (then add it) or it doesn't (then drop the z-index).

**When in doubt:** open Chrome DevTools → Layers panel. If your component creates
a layer, you've created a stacking context. Ask whether you meant to.
```

### 4.1 Specifically addressing the 3 latent issues from PR #341

| Latent issue | Discipline rule that prevents it | How |
|---|---|---|
| Header `backdrop-filter` traps in-header dropdowns added without portaling | Rule 2 | Future devs forced to portal any header overlay; lint guard #2 detects this |
| `StickyMobileCTA` shares `z-50` with dropdown portal — implicit DOM-order ordering | Rule 4 + Rule 5 | Tokens force semantic ordering: dropdown = `z-dropdown` (50), CTA = `z-sticky-cta` (52, new token). DOM order no longer load-bearing. |
| Future `transform` utility on header silently re-traps trigger before portal mounts | Rule 1 + Rule 3 + lint guard #1 | Lint flags `<header className=".*transform.*">` and `<motion.header>`; rule 1 documents the ban |

---

## 5. JSX patterns — good and bad

### 5.1 Header dropdowns

**❌ BAD — in-header dropdown without portal**
```jsx
<header className="fixed z-header backdrop-blur-md">
  <nav>
    <div className="relative">
      <button>Topics</button>
      {open && (
        <div className="absolute z-50 ...">    {/* TRAPPED */}
          <DropdownPanel />
        </div>
      )}
    </div>
  </nav>
</header>
```
Why bad: `backdrop-blur-md` is a stacking context creator; `z-50` is local to the header, page content can paint over it.

**✅ GOOD — portaled dropdown**
```jsx
<header className="fixed z-header backdrop-blur-md">
  <nav>
    <div ref={triggerRef} className="relative">
      <button onMouseEnter={() => setOpen(true)}>Topics</button>
      {/* trigger only — panel lives at body */}
    </div>
  </nav>
</header>

{mounted && open && createPortal(
  <div
    ref={panelRef}
    style={{ top: headerHeight + 8 }}
    className="fixed left-1/2 -translate-x-1/2 z-dropdown ..."
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
  >
    <DropdownPanel />
  </div>,
  document.body
)}
```

### 5.2 Animated `<main>` — banned pattern

**❌ BAD**
```jsx
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  style={{ paddingTop: headerHeight }}
>
  {children}
</motion.main>
```
Why bad: `opacity: 0 → 1` makes `<main>` a stacking context. Any modal/drawer portaled into a child gets trapped at `<main>`'s root level.

**✅ GOOD — animate inside, not on, main**
```jsx
<main style={{ paddingTop: headerHeight }}>
  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {sectionContent}
  </motion.section>
</main>
```

### 5.3 Sticky table-of-contents

**❌ BAD — sticky inside a `motion.section`**
```jsx
<motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
  <aside className="sticky top-24 z-sticky">      {/* TRAPPED inside motion */}
    <TableOfContents />
  </aside>
  <article>{children}</article>
</motion.section>
```

**✅ GOOD — separate the motion'd content from the sticky parent**
```jsx
<section>
  {/* SECTION CONTEXT ROOT — DO NOT ADD transform/opacity/filter */}
  <aside className="sticky top-24 z-sticky">
    <TableOfContents />
  </aside>
  <motion.article initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
    {children}
  </motion.article>
</section>
```

### 5.4 Hero with parallax — keep transform off ancestors

**❌ BAD**
```jsx
<motion.div style={{ y: scrollY }}>      {/* whole hero gets transform — context */}
  <Picture src="hero.webp" />
  <CallToAction />
</motion.div>
```

**✅ GOOD — transform on the moving element only**
```jsx
<div className="relative">
  <motion.img style={{ y: scrollY }} src="hero.webp" />     {/* only image moves */}
  <CallToAction />                                           {/* stays inert */}
</div>
```

### 5.5 Reusable component with internal z-index — defensive isolation

```jsx
// ✅ GOOD — component opts in to isolation so its z-index can't leak
function ImageLightbox({ children }) {
  return (
    <div className="isolate">     {/* isolation: isolate — Tailwind class */}
      <button className="z-10">Close</button>
      <div className="z-0">{children}</div>
    </div>
  )
}
```
The `isolate` class scopes the internal `z-10`/`z-0` to the component. Consumers can't accidentally clash with the lightbox's internal layering.

---

## 6. Lint and runtime guards

### 6.1 ESLint rule #1 — ban transform-style props on layout shell

**File to add:** `eslint-rules/no-shell-stacking-context.js` (custom rule, registered in `.eslintrc`).

```js
// eslint-rules/no-shell-stacking-context.js
const FORBIDDEN_CLASS_PATTERNS = [
  /\btransform\b/,                       // bare transform utility
  /\b(translate|scale|rotate|skew)-/,    // transform shorthand utilities (Tailwind)
  /\bopacity-(?!100\b)\d+/,              // opacity-* with non-100 value
  /\bfilter\b/,                          // filter utility
  /\bbackdrop-(?!blur-md\b)/,            // backdrop-* (allow backdrop-blur-md ONLY on header)
  /\bwill-change-/,                      // will-change-*
  /\bisolate\b/,                         // isolation: isolate
  /\bmix-blend-/,                        // mix-blend-mode utilities
  /\bcontain-(layout|paint|strict|content)\b/,  // CSS containment
];

const SHELL_ELEMENTS = new Set(['header', 'main', 'footer']);
const SHELL_COMPONENT_NAMES = new Set(['Layout', 'App']);

module.exports = {
  meta: { type: 'problem', docs: { description: 'Disallow stacking-context-creating utilities on layout shell elements' } },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name.name;
        const isShell = SHELL_ELEMENTS.has(name) || SHELL_COMPONENT_NAMES.has(name);
        const isMotionShell =
          node.name.type === 'JSXMemberExpression' &&
          node.name.object?.name === 'motion' &&
          SHELL_ELEMENTS.has(node.name.property?.name);

        if (!isShell && !isMotionShell) return;

        // motion.header/main/footer are themselves banned
        if (isMotionShell) {
          context.report({ node, message: `Use plain <${node.name.property.name}> on the layout shell. Move animations to inner sections (Pattern #14, Rule 3).` });
          return;
        }

        // Inspect className/style attrs
        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue;
          if (attr.name.name === 'className' && attr.value?.type === 'Literal') {
            for (const re of FORBIDDEN_CLASS_PATTERNS) {
              if (re.test(attr.value.value)) {
                context.report({
                  node: attr,
                  message: `Class matches stacking-context creator (${re}). Layout shell must stay inert (Pattern #14, Rule 1). Move this effect into a contained section.`,
                });
              }
            }
          }
          if (attr.name.name === 'style' && attr.value?.expression?.type === 'ObjectExpression') {
            for (const prop of attr.value.expression.properties) {
              const key = prop.key?.name;
              if (['transform', 'opacity', 'filter', 'backdropFilter', 'willChange', 'isolation', 'mixBlendMode', 'contain'].includes(key)) {
                context.report({
                  node: prop,
                  message: `Inline style "${key}" creates a stacking context on layout shell (Pattern #14, Rule 1).`,
                });
              }
            }
          }
        }
      },
    };
  },
};
```

**What it catches:**
- `<header className="... transform ...">` ✓
- `<main style={{ opacity: 0.5 }}>` ✓
- `<motion.main>` and `<motion.header>` ✓
- `<main className="will-change-transform">` ✓
- `<footer className="contain-layout">` ✓

**What it allows:**
- `<header className="... backdrop-blur-md ...">` (specific exception — header is the documented exception)
- `<main className="bg-gradient-to-br">` (paint only)
- `<motion.div>` inside `<main>` (not the shell)

### 6.2 ESLint rule #2 — flag in-header `position: absolute` + `z-*`

Detects "dropdown trying to live in DOM tree of header" — i.e., the pre-#161 anti-pattern. Implementation: walk JSX tree; if `<header>` has a descendant with `className` matching both `/\babsolute\b/` and `/\bz-(\d+|dropdown|modal|popover|tooltip)\b/`, flag it with: *"Use `createPortal(panel, document.body)` instead — see Pattern #14, Rule 2."*

### 6.3 Runtime dev-mode warning

Add to `src/main.jsx` (or a new `src/lib/stackingDevWarning.js` mounted only in dev):

```js
// src/lib/stackingDevWarning.js
import { CONTEXT_PROPERTIES } from './stackingConstants';

const CONTEXT_PROPERTIES = [
  'transform', 'opacity', 'filter', 'backdropFilter',
  'willChange', 'isolation', 'mixBlendMode', 'contain', 'clipPath'
];

export function warnIfTrapped(portaledEl, label = 'portaled element') {
  if (!import.meta.env.DEV) return;
  if (!portaledEl) return;

  let parent = portaledEl.parentElement;
  const offenders = [];
  while (parent && parent !== document.body) {
    const cs = getComputedStyle(parent);
    for (const prop of CONTEXT_PROPERTIES) {
      const val = cs[prop];
      if (val && val !== 'none' && val !== 'normal' && val !== 'auto' &&
          !(prop === 'opacity' && parseFloat(val) === 1) &&
          !(prop === 'mixBlendMode' && val === 'normal')) {
        offenders.push({ el: parent, prop, val });
      }
    }
    parent = parent.parentElement;
  }
  if (offenders.length > 0) {
    console.warn(
      `[stacking] ${label} has ancestor stacking contexts that may trap it:`,
      offenders
    );
  }
}
```

Call from `Layout.jsx` after the portal mounts:
```jsx
useEffect(() => {
  if (mounted && isTopicsOpen && dropdownRef.current) {
    warnIfTrapped(dropdownRef.current, 'topics-dropdown');
  }
}, [mounted, isTopicsOpen]);
```

In dev, devs see a console warning the moment they introduce a trap. Zero production cost (`import.meta.env.DEV` tree-shakes).

### 6.4 Pre-commit hook (alternative / complement)

Add to `.husky/pre-commit` (or `lint-staged`):
```bash
# Block commits that add transform/opacity/filter to layout shell files
if git diff --cached --name-only | grep -E 'src/components/layout/|src/App.jsx$'; then
  if git diff --cached -U0 src/components/layout/ src/App.jsx | grep -E '^\+.*\b(transform|opacity-[0-9]|filter|will-change|isolate|backdrop-(?!blur-md))\b'; then
    echo "ERROR: Stacking-context-creating utility added to layout shell. See CLAUDE.md Pattern #14."
    exit 1
  fi
fi
```

This is belt-and-suspenders to the ESLint rule.

---

## 7. Acceptance + maintenance

### 7.1 Verifying the discipline holds

- **Visual smoke test:** open `/`, `/reviews`, `/compare`, `/never-hungover/<post>`, `/dhm-dosage-calculator`. Hover Topics on each. Mega-menu paints over hero, comparison widget, and any in-page `relative z-10`.
- **DevTools Layers panel:** select `<main>`, confirm "creates new stacking context" is **NOT** checked. Select `<header>`, confirm it **IS** checked (intentional). Select `body > div[fixed][z-50]` (portaled dropdown), confirm context-root is `<body>`.
- **Lint:** `npx eslint src/components/layout/` returns 0 violations.
- **Curl test:** `curl -s https://www.dhm-guide.com/ | grep -E 'class=.*transform|opacity-(?!100)' | grep -E 'header|main|footer'` returns nothing.

### 7.2 Update triggers

Update Pattern #14 / this doc when:
- A new shell-level fixed element is added (cookie banner, devtools panel, A/B variant chrome) → add to §2.2 audit table + §5 patterns.
- Tailwind ships a v5 with new context-creating utilities → update §6.1 lint patterns.
- A new portaled overlay is added → add `warnIfTrapped` call in dev mode.
- A regression is found that this discipline didn't catch → root-cause it, add a new rule (Rules 8+).

---

## 8. Sources

- [Josh W. Comeau — What The Heck, z-index??](https://www.joshwcomeau.com/css/stacking-contexts/)
- [Ahmad Shadeed — Understanding Z-Index in CSS](https://ishadeed.com/article/understanding-z-index/)
- [MDN — isolation CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/isolation)
- [MDN — Stacking context guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context)
- [MDN — contain CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
- [MDN — Using CSS containment](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Using)
- [web.dev — Z-index and stacking contexts](https://web.dev/learn/css/z-index)
- [CSS-Tricks — It's always the stacking context](https://css-tricks.com/its-always-the-stacking-context/)
- [CSS-Tricks — Cascade Layers Guide](https://css-tricks.com/css-cascade-layers/)
- [Smashing Magazine — Integrating CSS Cascade Layers (2025)](https://www.smashingmagazine.com/2025/09/integrating-css-cascade-layers-existing-project/)
- [Tailwind CSS — isolation utility](https://tailwindcss.com/docs/isolation)
- [Frontend Masters — The CSS contain property](https://frontendmasters.com/blog/the-css-contain-property/)
- Internal: `docs/layering-audit-2026-04-26/{L2,L5,R4}.md`, PR #341
