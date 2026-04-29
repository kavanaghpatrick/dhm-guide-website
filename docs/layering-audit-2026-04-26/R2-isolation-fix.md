# R2 — Isolation / Stacking-Context Sibling Fix

**Date:** 2026-04-26
**Scope:** Investigate `isolation: isolate` (and friends) on the page-main wrapper as an alternative to portal-rendering the mega-menu (R1).
**File:** `src/components/layout/Layout.jsx`

---

## 1. Actual DOM hierarchy (verified from Layout.jsx)

```
<body>
  <div id="root">
    <App>                                 <!-- src/App.jsx -->
      <Layout>                            <!-- src/components/layout/Layout.jsx -->
        <div class="min-h-screen ...">    <!-- Line 83: outer wrapper, no z-index -->
          <header                         <!-- Line 90: STACKING CONTEXT
                  class="fixed top-0 ...      (position:fixed + z-header(30)
                         z-header                + backdrop-filter:blur(12px)) -->
                         backdrop-blur-md">
            ... nav ...
              <div class="relative">      <!-- Line 129: trigger wrapper -->
                <button>Topics</button>
                <div id="topics-mega-menu"<!-- Line 159: dropdown
                     class="fixed z-50">      position:fixed + z-50,
                                              currently nested inside header -->
              </div>
          </header>
          <main>...page content...</main> <!-- Line 436: SIBLING of <header>,
                                              no z-index, no stacking context -->
        </div>
      </Layout>
    </App>
  </div>
</body>
```

**Key fact:** `<header>` and `<main>` are **siblings** inside the outer `<div class="min-h-screen">` (Layout.jsx:83). Neither the outer div, `<Layout>`, `<App>`, `#root`, nor `<body>` create a stacking context. They all sit in the **root stacking context**.

---

## 2. Why the bug happens (current state, post-#161 fix)

The header is a stacking context (`position:fixed + z:30` and `backdrop-filter`). The dropdown lives **inside** the header DOM subtree. Even with `position:fixed; z-50` on the dropdown, the dropdown's z-index is **clamped relative to the header's stacking context**, not the root.

In the root context, paint order between siblings `<header>` (z=30) and `<main>` (z=auto) is determined by:
1. Both are in root context
2. Header has `z-index:30` → painted in step 7 of CSS painting
3. `<main>` is non-positioned → painted earlier (step 4)
4. Header's whole subtree (including the z-50 dropdown) wins → dropdown should appear above main

**So why does main content sometimes paint above the dropdown?** It's not `<main>` itself — it's a **descendant** of `<main>` that creates its own stacking context with a numeric z-index, OR a `position:fixed` element elsewhere. Examples in this codebase:
- `transform`/`scale` on `<motion.div>` cards (Home.jsx, Reviews.jsx)
- `backdrop-filter` on calculator modal
- `StickyMobileCTA` at `position:fixed; z-50` (sibling, same z as dropdown — paint order ties broken by DOM order, and StickyMobileCTA comes **after** header in source → wins)

---

## 3. Does `isolation: isolate` on `<main>` fix it?

**Short answer: partially, in a way that's actually clean.**

Setting `<main style={{isolation:'isolate'}}>` (or `position:relative; z-index:0`) makes `<main>` create its own stacking context at z=0 in the root.

After this change, the root stacking context contains exactly two atomic siblings:
- `<header>` at z=30 (its dropdown is contained, but the whole header subtree paints as a unit)
- `<main>` at z=0 (every `transform`, `motion.div`, hero image inside main is now **trapped** inside this context — they can paint at most as the isolated `<main>` itself paints)

Since 30 > 0, the **entire `<header>` subtree (including the dropdown)** paints above the **entire `<main>` subtree**. The dropdown wins, regardless of what stacking-context-creating descendants live inside main.

**`isolation:isolate` vs `position:relative; z-index:0`:** Both create a stacking context. `isolation:isolate` is the modern, intent-revealing one-liner; it does **not** affect layout. `z-index:0` works too but couples a paint hint to a layout property. Prefer `isolation:isolate`.

**This does NOT fix:** root-level siblings that aren't inside `<main>` — specifically `<StickyMobileCTA>` (Layout.jsx:441) and the `<footer>` (line 444). StickyMobileCTA is `fixed; z-50` and comes after the header in DOM, so by tie-breaking rules it can still paint above a `z:30` header. But the dropdown is `z-50` itself, so it ties StickyMobileCTA — and DOM order makes StickyMobileCTA win on the parts of the screen where they overlap (bottom strip on mobile).

---

## 4. Recommendation

Apply `isolation:isolate` to `<main>`. It is a 1-line CSS change with zero JS, no DOM restructure, and no portal infrastructure.

**Pros vs portal (R1):**
- 1 line vs ~20 lines of portal plumbing
- No `createPortal`, no `document.body` ref, no SSR/hydration concerns
- No focus-trap or click-outside re-wiring (dropdown stays in header subtree → keyboard/aria stays correct)
- Defends against **any** future descendant of `<main>` that creates a stacking context (transforms, filters, opacity animations, will-change)

**Cons vs portal:**
- Does not protect against root-level fixed siblings (`StickyMobileCTA`, future modals) — those still need a coherent z-index scale
- If you later promote a root-level wrapper to a stacking context, you'd need to re-evaluate

**Already proven in codebase:** `src/components/ui/navigation-menu.jsx:97` uses exactly this pattern (`isolate z-50`).

---

## 5. Minimum diff

```diff
--- a/src/components/layout/Layout.jsx
+++ b/src/components/layout/Layout.jsx
@@ -433,7 +433,7 @@ function Layout({ children }) {
       </header>

       {/* Main Content */}
-      <main style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300">
+      <main style={{ paddingTop: `${headerHeight}px` }} className="isolate transition-[padding] duration-300">
         {children}
       </main>
```

That's it. One word: `isolate`.
