# R1 — React Portal Solution for Topics Mega-Menu

**Date:** 2026-04-26
**File:** `src/components/layout/Layout.jsx`
**Bug:** Mega-menu dropdown renders BELOW page images, even after fix #339 changed `motion.header` → `header` and dropdown to `position: fixed`.

---

## TL;DR — Recommended approach

**Yes, portal it.** `createPortal(<dropdown/>, document.body)` is the canonical fix and the right answer here. Fix #339 was the correct *direction* but stopped one step short: `position: fixed` lifts an element out of normal flow but **does NOT escape ancestor stacking contexts** (W3C Painting Order, CSS 2.1 §E.2 / CSS Positioned Layout L3 §9). The dropdown is still a DOM descendant of `<header>`, which has TWO stacking-context creators stacked on it (`position: fixed` per CSS 2.1, and `backdrop-filter: blur-md` per CSS Filter Effects L1 §3). Inside that local context, `z-50` is clamped — page `<main>` content with `z: auto` paints later (because `<main>` comes after `<header>` in DOM order at the root context), so it wins.

The portal is the only fix that **moves the dropdown DOM out of the header's subtree** so its `z-50` is interpreted at the root stacking context, where it actually beats anything below it.

---

## 1. Why fix #339 didn't work (root-cause confirmation)

CSS Painting Order rule, summarised:
> An element's `z-index` only orders it relative to **siblings inside the same stacking context**. Once an ancestor creates a stacking context, all descendants are sealed inside that context's "z-budget", regardless of their own `position` value.

`position: fixed` removes the element from layout flow, but it is **still painted within its containing stacking context if an ancestor created one**. Both:

```
header { position: fixed; }            /* per spec, creates SC */
header { backdrop-filter: blur(8px); } /* per Filter Effects L1, creates SC */
```

…create stacking contexts. The dropdown lives inside the header DOM subtree. The dropdown's `z-50` is therefore evaluated **inside the header's SC**, not at the root. At the root level, `<header>` and `<main>` are siblings; both have `z: auto`; `<main>` comes later in DOM order; per painting order, later siblings paint on top. Dropdown loses.

**The portal severs that DOM relationship.** When the dropdown becomes a direct child of `<body>`, it is a sibling of `<header>` and `<main>`, and its `z: 50` is now compared at the root context — where 50 > auto, so it wins.

---

## 2. The exact diff to apply

Single file: `src/components/layout/Layout.jsx`. ~6 lines added, ~3 lines moved. JSX moves, no logic changes.

```diff
@@ -1,5 +1,6 @@
 import React, { useState, useCallback, useEffect, useRef } from 'react'
 import { motion } from 'framer-motion'
+import { createPortal } from 'react-dom'
 import { Button } from '@/components/ui/button.jsx'
 import { Menu, X, Leaf, ChevronDown } from 'lucide-react'
 import { useRouter } from '@/hooks/useRouter'
@@ -37,6 +38,7 @@ function Layout({ children }) {
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const [isTopicsOpen, setIsTopicsOpen] = useState(false)
   const [expandedClusterMobile, setExpandedClusterMobile] = useState(null)
   const topicsRef = useRef(null)
+  const dropdownRef = useRef(null)
   const { currentPath, navigate, isActive, getNavItems, getFooterItems } = useRouter()
   const { headerRef, headerHeight } = useHeaderHeight()

@@ -46,7 +48,11 @@
     if (!isTopicsOpen) return
     const onKey = (e) => { if (e.key === 'Escape') setIsTopicsOpen(false) }
     const onClick = (e) => {
-      if (topicsRef.current && !topicsRef.current.contains(e.target)) {
+      // Click is "outside" only if it lands in NEITHER the trigger
+      // (topicsRef) NOR the portaled dropdown (dropdownRef).
+      const inTrigger  = topicsRef.current?.contains(e.target)
+      const inDropdown = dropdownRef.current?.contains(e.target)
+      if (!inTrigger && !inDropdown) {
         setIsTopicsOpen(false)
       }
     }
@@ -154,8 +160,9 @@
                           />
                         )}
                       </button>
-                      {isTopicsOpen && (
-                        <div
+                      {isTopicsOpen && typeof document !== 'undefined' && createPortal(
+                        <div
+                          ref={dropdownRef}
                           id="topics-mega-menu"
                           role="region"
                           aria-label="Topics"
@@ -162,8 +169,11 @@
                           // (defense in depth — the header's stacking context was
                           // the original cause of the overlap bug; using fixed makes
                           // the dropdown immune to any future ancestor that creates
-                          // one — opacity, transform, filter, will-change, etc.)
+                          // one — opacity, transform, filter, will-change, etc.)
+                          // PORTAL: rendered to document.body so it is a sibling
+                          // of <header>/<main>, not a descendant. This guarantees
+                          // its z-50 is at the root stacking context.
                           style={{ top: headerHeight + 8 }}
                           className="fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
+                          onMouseEnter={() => setIsTopicsOpen(true)}
+                          onMouseLeave={() => setIsTopicsOpen(false)}
                         >
@@ -228,7 +238,8 @@
                             </a>
                           </div>
-                        </div>
-                      )}
+                        </div>,
+                        document.body
+                      )}
                     </div>
                   )
                 }
```

That's the entire change. The dropdown JSX content is byte-identical — only its DOM destination, ref, and the two new `onMouseEnter`/`onMouseLeave` handlers change.

---

## 3. Gotchas — addressed in the diff

### 3a. SSR / prerender safety
`scripts/prerender-main-pages.js` uses jsdom server-side. **No special guard needed beyond `typeof document !== 'undefined'`** because:
- `isTopicsOpen` defaults to `false`, so the conditional renders nothing during prerender
- jsdom *does* provide `document.body`, so even if it ran, it wouldn't crash
- The `typeof document !== 'undefined'` check is belt-and-braces

A `useEffect`-based mount flag is **not necessary** here — the existing `isTopicsOpen` state already gates the portal to client-only timing (it can only become `true` from a user gesture, which by definition is post-hydration).

### 3b. Hover bridge (the real subtlety)
**This is the only behavioural risk and is fixed in the diff.** Currently the trigger and dropdown share `onMouseEnter`/`onMouseLeave` on the wrapper `<div className="relative">`. Once the dropdown leaves the DOM subtree, the wrapper no longer contains it — so moving the cursor from trigger → dropdown crosses out of the wrapper, fires `onMouseLeave`, and the menu closes mid-traversal.

**Fix:** add `onMouseEnter={() => setIsTopicsOpen(true)}` and `onMouseLeave={() => setIsTopicsOpen(false)}` directly on the portaled dropdown `<div>`. React's synthetic event system bubbles through portals back to the React parent tree, but native CSS `:hover` and the wrapper's `mouseleave` do NOT — so we must register handlers on the portal element itself. With both wrappers live, hover state is preserved while the cursor is over either trigger or dropdown.

Because the dropdown is `top: headerHeight + 8` (8px gap below header bottom), there is an 8px no-mans-land. If users find this twitchy, eliminate the gap (`top: headerHeight`) or add an invisible bridge with `pointer-events: auto`. Acceptable as-is for v1.

### 3c. Outside-click handler
Currently `topicsRef.current.contains(e.target)` would return `false` for clicks inside the portaled dropdown (because the dropdown is no longer a descendant of `topicsRef`), causing the dropdown to close on its own internal clicks **before** navigation could complete. **Fix:** track both refs and treat a click as "outside" only if it lands in neither. Diff above.

### 3d. Tab order & focus
Tab order follows DOM order, not visual position. Portaled content is at end of `<body>`, so after Tab from "Topics" trigger the next stop will be the next nav item (CTA button), then footer, then the portaled dropdown links. **This is bad** — but in practice users don't tab into a closed dropdown. The dropdown only opens on click/focus on the trigger; once open, focusing the first link inside is the conventional behaviour. The current code does NOT do that today (no auto-focus on open) — so portaling does NOT make accessibility worse, but does NOT make it better either.

**Recommendation (separate, optional):** when `isTopicsOpen` flips true via click/keypress, focus the first `<a>` inside the dropdown. Out of scope for this fix; fold into a follow-up if a11y review flags it.

### 3e. Animation libraries
The dropdown uses no `motion.*` wrappers — only the `<motion.div layoutId="activeTab">` underline on the trigger button (which stays in the header). No animation cleanup needed. If `AnimatePresence` is added later for entrance/exit animation, place it INSIDE the portal content, not around `createPortal()` itself.

---

## 4. Risks & how to mitigate

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hover bridge fails (cursor leaves wrapper before reaching dropdown) | **High if not addressed** | Diff adds `onMouseEnter`/`onMouseLeave` on portal element |
| Outside-click closes dropdown on internal clicks | **High if not addressed** | Diff adds `dropdownRef` to outside-click test |
| Prerender crash on `document.body` | Low | `typeof document !== 'undefined'` guard + state-gated rendering |
| Tab order surprise (focus lands at end of body) | Low (no current focus management anyway) | Optional follow-up: auto-focus first link on open |
| Portal "leaks" between route changes | Low | `isTopicsOpen` resets when navigation handlers call `setIsTopicsOpen(false)` (already in code) |
| Two portals if Layout remounts | Negligible | React handles portal cleanup on unmount |

---

## 5. Reasons NOT to portal

There is **one** legitimate alternative: just delete `backdrop-filter: blur-md` and stop using `position: fixed` on the header (use `sticky` instead — `sticky` does NOT create a stacking context unless other props do). That kills the trap at the source. Tradeoffs:

- **Pro:** simpler diff (one Tailwind class change), no portal complexity, no hover-bridge concern
- **Con:** loses the frosted-glass aesthetic that `backdrop-blur-md` provides; loses the "sticks at top of viewport always" guarantee that `fixed` provides over `sticky` (sticky needs an ancestor with non-`overflow: visible` to scroll within — works on most layouts but is fragile)

**Recommendation: portal it.** The portal is more robust against future changes — any developer can add `transform`, `filter`, `will-change`, `opacity`, etc. to the header without re-breaking the dropdown. It's a one-time cost for permanent immunity. The CLAUDE.md "delete don't add" prime directive does favour the no-portal alternative, but in this specific case the portal IS the deletion: it deletes the *coupling* between header styling and dropdown layering. That's a bigger win than deleting one Tailwind class.

**One last consideration:** if the team plans to introduce more flyout menus or popovers, standardise on portal-rendered floating UI now (or migrate to `@floating-ui/react` / Radix `Popover`, both of which portal by default). One-off custom portal is fine; three of them suggests adopting a primitive.
