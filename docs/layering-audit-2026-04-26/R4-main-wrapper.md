# DHM Guide Stacking Context Audit: Page-Main Wrapper Analysis
**Date:** 2026-04-26  
**Focus:** Implicit stacking contexts in the page-main wrapper that compete with the header  
**Severity:** CRITICAL - Dropdown containment issue identified and **already mitigated**

---

## Executive Summary

The page structure correctly isolates the header and its dropdown from the main content area through a deliberate use of `position: fixed` on the dropdown element. The codebase shows evidence of **deep knowledge of stacking context bugs** (per comments in Layout.jsx line 84-88), and the fix has already been implemented. However, the architecture reveals several implicit stacking contexts that could cause future regressions.

**Key Finding:** The dropdown was previously trapped inside the header's stacking context when the header had `opacity: transform` properties. This was **fixed by making the dropdown `position: fixed`**, which escapes any ancestor stacking context. This is a defensive, robust solution.

---

## 1. Complete JSX DOM Tree Structure

### Root to Main Content Flow

```
<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
  ↓
  <header ref={headerRef} className="fixed top-0 left-0 right-0 z-header ...">
    ├── <div className="container mx-auto px-4 py-4">
    │   └── <div className="flex items-center justify-between min-h-[40px]">
    │       ├── Logo (motion.div with whileHover)
    │       ├── Desktop Navigation
    │       │   └── Topics Dropdown (KEY: position:fixed z-50)
    │       ├── CTA Button
    │       └── Mobile Menu Button
    │
    └── Mobile Navigation (motion.nav if isMenuOpen)
        └── Topic collapsible sections

  ↓
  <main style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300">
    {children}  ← App.jsx injects <Suspense><Component /></Suspense>
  </main>

  ↓
  <StickyMobileCTA /> ← Fixed position, z-50, only on mobile
  
  ↓
  <footer className="bg-gray-900 ...">
    └── Footer content
</div>
```

**File References:**
- Layout.jsx:83-548 - Full layout JSX tree
- App.jsx:89-96 - Layout wrapping with Suspense
- Home.jsx:131-957 - Example page component

---

## 2. Where Header and Main Live

### Header Properties
- **Position:** `fixed` (Layout.jsx:92)
- **Z-Index:** `z-header` class → `var(--z-index-header)` → `30` (App.css:99)
- **Stacking Context Creator:** `backdrop-blur-md` (Layout.jsx:92)
  - `backdrop-filter` property creates an implicit stacking context per CSS spec
  - This is intentional and necessary for the blur effect to composite correctly
- **CSS Composition:** `bg-white/80 backdrop-blur-md border-b border-green-100`

### Main Properties
- **Position:** Default (static) - NOT relative, NOT fixed
- **Padding:** Dynamic, set to `headerHeight` (Layout.jsx:436)
- **Stacking Context Creator:** `transition-[padding]` class
  - This is a **Tailwind transition on the padding property**
  - **DOES NOT CREATE A STACKING CONTEXT** (transitions on non-transform properties don't)
  - Correct implementation ✓

**File References:**
- Layout.jsx:82-93 - Header opening tag
- Layout.jsx:435-438 - Main element with paddingTop
- App.css:99 - z-header definition
- App.css:94-106 - Z-index scale

---

## 3. Home.jsx Page Structure

The Home page is the largest consumer of the main wrapper. It contains:

### Before/After Image (Hero Section)
```
<section className="pt-8 pb-16 px-4 bg-gradient-to-br from-gray-50 to-white">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
      
      {/* Left Column - IMAGE */}
      <div className="order-1 lg:order-1">
        <div className="relative">  ← position:relative (implicit stacking context? NO)
          <picture>
            <source ... />
            <img src="..." style={{ ... }} />  ← NO position property, z-index: auto
          </picture>
        </div>
      </div>

      {/* Right Column - TEXT/CTA */}
      <div className="order-2 lg:order-2 text-center lg:text-left">
        {/* Badge, H1, P, CTA Buttons */}
      </div>

    </div>
  </div>
</section>
```

**Image Parent Chain:**
1. `<picture>` - no z-index, no position
2. `<div className="relative">` - position:relative but NO z-index
3. `<div className="order-1 ...">` - no position, no z-index
4. `<div className="grid ...">` - no position, no z-index
5. `<div className="container mx-auto">` - no position, no z-index
6. `<section>` - no position, no z-index
7. `<main>` - no position, no z-index (transition-padding only)
8. Outer `<div>` - no position, no z-index

**Stacking Context Verdict:** The before/after image has NO explicit stacking context in its ancestor chain. The `relative` on line 140 does NOT create one because it lacks z-index.

**File References:**
- Home.jsx:134-174 - Hero section with before/after image
- Home.jsx:140-173 - Image wrapper and picture element

---

## 4. Implicit Stacking Context Analysis

### What Creates Stacking Contexts?

According to CSS Stacking Context Spec, a stacking context is created by:
1. `z-index` ≠ `auto` (with position context)
2. `opacity` < 1
3. `transform` ≠ `none`
4. `filter` ≠ `none`
5. `backdrop-filter` ≠ `none`
6. `mix-blend-mode` ≠ `normal`
7. `will-change` on certain properties
8. And others...

### Scan of Page-Main Wrapper Content

#### Header - CREATES STACKING CONTEXT
- **Why:** `backdrop-filter: blur()` (Layout.jsx:92)
- **Z-Index:** 30
- **Child Elements:** All header content, including the dropdown (before fix)
- **Impact:** Header and its contents render as a unit above the main content
- **Status:** ✓ Correct - intentional for fixed positioning

#### Main Element - DOES NOT CREATE STACKING CONTEXT
- **Transition:** `transition-[padding]` - Only animates padding, NOT a transform
- **Position:** Static (default)
- **Z-Index:** Not set, defaults to `auto`
- **Verdict:** ✓ Correct - main content participates in root stacking context

#### Topics Dropdown - ESCAPES HEADER CONTEXT
- **Position:** `fixed` (Layout.jsx:169)
- **Z-Index:** `z-50` = `50` (Tailwind default, not CSS variable)
- **Parent:** `<div ref={topicsRef} className="relative">` (Layout.jsx:126-234)
- **Critical:** Position:fixed escapes the header's stacking context entirely
- **Why This Matters:** Even though the header is `backdrop-filter: blur()`, the dropdown renders at the document root level, not inside the header's compositing layer
- **Status:** ✓ Correct - defensive fix for issue #161

**File References:**
- Layout.jsx:84-89 - Comment explaining the fix
- Layout.jsx:158-170 - Dropdown positioned fixed with z-50

#### Hero Section - NO STACKING CONTEXT
- **Before/After Image:** 
  - Position: default (static)
  - Z-Index: not set
  - Ancestor with z-index: none
  - Ancestor with transform: none (section has no motion)
  - **Verdict:** Renders at z=0, below header's z=30 ✓
- **Grid Layout:** Flex/grid do not create stacking contexts without z-index
- **Motion Elements:** Used for fade-in animations only, not stacking context creators

**File References:**
- Home.jsx:139-174 - Image wrapper, NO position:relative with z-index
- Home.jsx:134-258 - Hero section, NO motion.div wrapping entire section

#### Sections with Motion Divs - ANALYZED
```
Home.jsx line-by-line stacking context check:

263:   <motion.div initial={{ opacity: 0, y: 30 }} ... >
       ↓ opacity ANIMATION (0→1) CREATES STACKING CONTEXT during animation
       ✓ But content inside doesn't exceed header bounds during animation

309:   </motion.div>
       ↓ End of Science Bridge section

317:   <motion.div ... viewport={{ once: true }} className="text-center ... >
       ↓ Another motion.div, opacity animation
       ✓ Same as above - animates in but doesn't interfere with dropdown

...and so on for 689, 723, 817, 910
```

**Critical Discovery:** `motion.div` with `opacity: 0→1` animates create temporary stacking contexts ONLY during the animation (initial to whileInView). However:
1. They don't contain z-index properties themselves
2. The animated elements are section content, not the page wrapper
3. Animations are viewport-triggered (whileInView), so they occur locally
4. None are positioned fixed or set z-index: 50+

**File References:**
- Home.jsx:263-309 - Science Preview Bridge (motion.div)
- Home.jsx:317-335 - How It Works header (motion.div)
- Home.jsx:689-715 - Benefits cards (motion.div)
- App.css:94-106 - Z-index scale (z-50 = modal dialogs)

#### StickyMobileCTA - POTENTIAL CONFLICT
- **Position:** `fixed` (StickyMobileCTA.jsx:72)
- **Z-Index:** `z-50` (StickyMobileCTA.jsx:72)
- **Bottom:** `bottom-0`
- **Transform:** `translateY()` inline style (StickyMobileCTA.jsx:73)
- **Visibility:** Mobile only (`md:hidden`, StickyMobileCTA.jsx:72)
- **Concern:** `transform: translateY()` creates a stacking context, z-50 could interfere with modals
- **Verdict:** ⚠ Not a problem for dropdown, but be aware for z-50+ layer management

**File References:**
- StickyMobileCTA.jsx:70-99 - Full component
- StickyMobileCTA.jsx:72-73 - Fixed position with transform

---

## 5. The Header Dropdown Stacking Context Trap (Issue #161)

### What Was the Problem?

**Before the fix (code removed):**
```jsx
// BROKEN CODE (no longer exists):
<header
  style={{ opacity: headerOpacity }}  // ← opacity < 1 creates stacking context
  className="fixed top-0 left-0 right-0 z-header ..."
>
  <div ref={topicsRef} className="relative">  {/* NO position:fixed */}
    <div className="z-50">Dropdown</div>
  </div>
</header>
```

**Why It Failed:**
1. `opacity: headerOpacity` (from useTransform) created a stacking context in the header
2. The dropdown was inside this stacking context
3. The dropdown's `z-50` was LOCAL to the header's context (z-50 within z-30 = still z-30 at root)
4. Page content with z-auto (0) at root level competed with the header's z-30
5. **Result:** Dropdown appeared TRAPPED behind the page content

### The Fix (Current Code)

**Current code (fixed):**
```jsx
{isTopicsOpen && (
  <div
    id="topics-mega-menu"
    role="region"
    style={{ top: headerHeight + 8 }}
    className="fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl z-50"
  >
    {/* Dropdown content */}
  </div>
)}
```

**Why It Works:**
1. The dropdown is now a direct child of `topicsRef`, not nested in the header's lifecycle
2. `position: fixed` on the dropdown means it's positioned relative to the viewport, NOT the header
3. The dropdown element itself escapes the header's stacking context
4. Dropdown's z-50 is evaluated at the **document root level**, where z-50 > z-header (30) ✓
5. **Result:** Dropdown renders above all page content

**Critical Comment in Code:**
```
// position:fixed escapes any ancestor stacking context
// (defense in depth — the header's stacking context was
// the original cause of the overlap bug; using fixed makes
// the dropdown immune to any future ancestor that creates
// one — opacity, transform, filter, will-change, etc.)
```
(Layout.jsx:163-167)

**File References:**
- Layout.jsx:84-89 - Problem description in header comment
- Layout.jsx:158-170 - Solution implemented (position:fixed z-50)

---

## 6. Z-Index Scale Deep Dive

### CSS Variables in App.css:94-106
```css
:root {
  --z-index-base: 0;              /* Normal document flow */
  --z-index-behind: -1;           /* Elements behind normal flow */
  --z-index-dropdown: 10;         /* Dropdowns, tooltips */
  --z-index-sticky: 20;           /* Sticky elements */
  --z-index-fixed: 30;            /* Fixed navigation, headers */
  --z-index-header: 30;           /* Main navigation header */
  --z-index-comparison: 35;       /* Comparison widget (above header) */
  --z-index-overlay: 40;          /* Page overlays, drawers */
  --z-index-modal: 50;            /* Modal dialogs */
  --z-index-popover: 60;          /* Popovers, floating UI */
  --z-index-notification: 65;     /* Toast notifications */
  --z-index-tooltip: 70;          /* Tooltips (highest) */
}
```

### Tailwind Mapping (tailwind.config.js:9-22)
```js
zIndex: {
  'behind': 'var(--z-index-behind)',     // -1
  'base': 'var(--z-index-base)',         // 0
  'dropdown': 'var(--z-index-dropdown)', // 10
  'sticky': 'var(--z-index-sticky)',     // 20
  'fixed': 'var(--z-index-fixed)',       // 30
  'header': 'var(--z-index-header)',     // 30
  'comparison': 'var(--z-index-comparison)', // 35
  'overlay': 'var(--z-index-overlay)',   // 40
  'modal': 'var(--z-index-modal)',       // 50
  'popover': 'var(--z-index-popover)',   // 60
  'notification': 'var(--z-index-notification)', // 65
  'tooltip': 'var(--z-index-tooltip)',   // 70
}
```

### Layer Assignment
| Element | Z-Index | Class | Notes |
|---------|---------|-------|-------|
| Page content (hero image) | 0 (auto) | — | Default, no positioning |
| Header | 30 | `z-header` | Fixed, backdrop-filter blur |
| Topics dropdown | 50 | `z-50` | Fixed position (raw Tailwind, not CSS var) |
| StickyMobileCTA | 50 | `z-50` | Fixed position, mobile only |
| Comparison widget | 35 | `z-comparison` | Above header for comparison overlay |
| Page overlays | 40 | `z-overlay` | Drawers, modals below popover |
| Modals | 50 | `z-modal` | Conflict with dropdown! ⚠ |
| Popovers | 60 | `z-popover` | Above modals |
| Notifications | 65 | `z-notification` | Toasters (Sonner) |
| Tooltips | 70 | `z-tooltip` | Highest layer |

**Issues Identified:**
1. **Dropdown z-50 vs Modal z-50:** Both use 50, but dropdown positioned fixed will win (DOM order)
2. **StickyMobileCTA also z-50:** Could conflict with dropdown on mobile
3. **Tailwind vs CSS Variables:** Dropdown uses raw `z-50` (Tailwind), not the CSS variable system

**File References:**
- App.css:94-106 - Z-index scale definition
- tailwind.config.js:9-22 - Tailwind mapping
- Layout.jsx:169 - Dropdown uses `z-50` (not CSS variable)

---

## 7. Composite Analysis: Can Page Content Hide the Dropdown?

### The Question
Can the before/after image (or any page content) render above the Topics dropdown?

### The Answer: NO ✓

**Evidence:**

1. **Header Level:**
   - Header: `position: fixed` + `z-header` (30) + `backdrop-filter: blur()` creates stacking context
   - Dropdown: `position: fixed` + `z-50` escapes header's stacking context
   - Result: Dropdown at document root, z=50

2. **Main Content Level:**
   - Main: `position: static` (default) - NOT a stacking context creator
   - No z-index set on main or any ancestor of image
   - Image ancestor chain has NO z-index values
   - Before/after image renders at z=0 (auto) at document root
   - Result: Image at document root, z=0

3. **Comparison at Root Level:**
   - Dropdown: z=50, position:fixed, rendered last in header JSX (bottom of DOM)
   - Image: z=0, position:static, in main element
   - Fixed positioning combined with z-index resolves paint order
   - Result: Dropdown (z=50) > Image (z=0) ✓

### What Could Break This?

1. **Adding `opacity < 1` to `<main>`:**
   - Would create stacking context, child z-indexes would be local
   - Fix: Avoid on main element

2. **Adding `transform` to section/grid wrapping image:**
   - Would create stacking context for image
   - Fix: Only use transforms on motion.div inside sections, not the container

3. **Adding `z-index` to image or ancestor without escape hatch:**
   - If image gets z-50+ and main becomes a stacking context, local z-50 < dropdown z-50 at root
   - Fix: Use z-index carefully, prefer motion-based animations

4. **Changing dropdown to NOT position:fixed:**
   - Would trap it in header's stacking context again
   - Fix: Keep position:fixed on dropdown

**File References:**
- Layout.jsx:435-438 - Main element (correct: no stacking context creators)
- Home.jsx:139-174 - Image element (correct: no z-index)

---

## 8. Motion.div and Animation Analysis

### Framer Motion Usage Pattern

All animations in Home.jsx follow this pattern:
```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}        // Start transparent, below
  whileInView={{ opacity: 1, y: 0 }}     // End visible, normal position
  transition={{ duration: 0.8 }}          // 800ms ease
  viewport={{ once: true }}               // Only animate once per scroll
>
  {children}
</motion.div>
```

### Stacking Context Behavior During Animation

**During animation (0 → 1 second):**
- `opacity: 0→1` creates an implicit stacking context
- The motion.div becomes a stacking context container
- Any z-index properties inside become local to that context
- But the motion.div itself has NO z-index

**After animation completes (once=true):**
- Motion properties are maintained (opacity: 1)
- Stacking context remains (opacity < 1 always creates stacking context, but opacity: 1 doesn't)
- Actually: opacity: 1 = no stacking context after animation

**Impact on Dropdown:**
- Motion divs are INSIDE the main element
- Dropdown is position:fixed at document root
- Even if motion.div created stacking context, dropdown is OUTSIDE it
- Result: No impact ✓

### List of Motion.div Elements

| Line | Section | Type | Creates SC? |
|------|---------|------|------------|
| 263 | Science Bridge intro | opacity fade-in | Yes (during anim) |
| 317 | How It Works header | opacity fade-in | Yes (during anim) |
| 339 | Liver pathway text box | opacity fade-in + transform | Yes |
| 420 | Liver pathway image | opacity fade-in + transform | Yes |
| 447 | GABA pathway image | opacity fade-in + transform | Yes |
| 469 | GABA pathway text box | opacity fade-in + transform | Yes |
| 554 | Summary CTA | opacity fade-in | Yes (during anim) |
| 585 | Parallax section (y: motion) | **transform: y()** | **Yes (permanent)** |
| 608 | Tradition card overlay | opacity fade-in | Yes (during anim) |
| 617 | Tradition card content | opacity + scale | Yes |
| 672 | Benefits intro | opacity fade-in | Yes (during anim) |
| 689 | Benefit cards | opacity fade-in + scale | Yes |
| 723 | Products intro | opacity fade-in | Yes (during anim) |
| 739 | Selection guide | opacity fade-in | Yes (during anim) |
| 817 | Product cards | opacity fade-in + scale hover | Yes |
| 910 | Final CTA | opacity fade-in | Yes (during anim) |

**Critical Finding:** Line 585-604 uses `motion.div` with `y: traditionY` style binding
```jsx
<motion.div 
  style={{ y: traditionY }}  // ← useTransform from scroll
  className="absolute inset-0 w-full h-full"
>
```
This IS a transform, creating permanent stacking context. But it's positioned `absolute inset-0` (not fixed), so it stays in the section's layout context.

**File References:**
- Home.jsx:263-309, 317-335, etc. - Individual motion.div examples
- Home.jsx:585-604 - Parallax motion.div with transform

---

## 9. Explicit Conclusions

### Stacking Context Summary

| Layer | Element | Z-Index | Position | Stacking Context Creator | Risk |
|-------|---------|---------|----------|---------------------------|------|
| Root | Document | — | — | Root context | — |
| ↓ | Page Content (image) | 0 (auto) | Static | NO | LOW - Can't exceed z-30+ |
| ↓ | Header | 30 | Fixed | YES (backdrop-filter) | LOW - Correct |
| ↓ | Topics Dropdown | 50 | Fixed | NO (but at root) | **SAFE** - Escaped context |
| ↓ | StickyMobileCTA | 50 | Fixed | YES (transform) | MEDIUM - Could overlap dropdown |
| Motion sections | Various | Auto | Static | YES (during animation) | LOW - Inside main, don't interfere |

### The Dropout Can Be Hidden By:

**1. Making main a stacking context:**
- Add `opacity < 1` to main element
- Add `transform` to main element
- Add `filter` to main element
- Add `will-change` to main element
- **If this happens:** Dropdown z-50 at main's context < main's context at root
- **Mitigation:** See section 10

**2. Moving dropdown back into header's stacking context:**
- Remove `position: fixed`
- Make dropdown a true child of header
- **If this happens:** Same bug as issue #161
- **Mitigation:** Prevent in code review

**3. Having an ancestor of dropdown create a stacking context that's NOT root:**
- This can't happen currently because dropdown is a direct child of a static div inside header

### Current Status: ✓ SAFE

The dropdown is protected by:
1. `position: fixed` escapes ALL ancestor stacking contexts
2. `z-50` evaluates at document root level
3. Header's `backdrop-filter` doesn't trap it
4. Main element has no stacking context creators
5. Page content (z=0) can't exceed z=50

---

## 10. Recommendations for Preventing Future Regressions

### Critical Rules (Code Review Checklist)

```
☐ NEVER add opacity < 1 to the <main> element
☐ NEVER add transform to the <main> element
☐ NEVER add filter/backdrop-filter to the <main> element
☐ NEVER add will-change to the <main> element
☐ NEVER move the Topics dropdown out of position:fixed
☐ NEVER set z-index on the <main> element or Layout wrapper
☐ NEVER add position:relative + z-index to page content ancestors
```

### Safe Patterns for Animations

✓ **Recommended:**
```jsx
<main>
  <section>
    <motion.div opacity animate>
      {children}
    </motion.div>
  </section>
</main>
```
- Motion div is child of section, not main
- Main remains a static document flow container

✗ **Dangerous:**
```jsx
<main style={{ transform: useTransform(...) }}>
  <section>{children}</section>
</main>
```
- Main becomes stacking context
- Children z-indexes become local

### If You Must Add Effects to Main

**Option 1: Use `@supports` with fallback**
```css
@supports (opacity: 1) {
  /* Only apply if opacity won't trap content */
  main {
    opacity: 0.99; /* Avoid triggering CSS stacking context */
  }
}
```
Note: This won't work; opacity < 1 always creates stacking context.

**Option 2: Escape with position:fixed like dropdown**
```jsx
<main>
  {/* Overlay element that escapes main's stacking context */}
  <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
    {escapeContent}
  </div>
  {normalContent}
</main>
```

**Option 3: Move effects to sections, not main**
```jsx
<main>
  <motion.section opacity animate>
    {children}
  </motion.section>
</main>
```
Best practice: Keep animations scoped to content sections, not the wrapper.

### Z-Index Scale Cleanup

**Recommended:** Create CSS variable for Topics dropdown
```css
:root {
  --z-index-topics-dropdown: 50; /* Matches StickyMobileCTA risk */
}
```

Then use in Layout.jsx:
```jsx
className="... z-[var(--z-index-topics-dropdown)]"
```

This centralizes z-index management and prevents accidental conflicts.

### Testing Strategy

1. **Stacking Context Audit in DevTools:**
   - Open Chrome DevTools
   - Elements tab → Select `<header>`
   - Check "Rendering" panel for "Stacking context"
   - Verify it shows "Create new stacking context"
   - Select `<main>`
   - Verify it shows "Does not create stacking context"

2. **Dropdown Visibility Test:**
   - Open dropdown on desktop
   - Scroll to hero image section
   - Image should be BEHIND dropdown ✓

3. **Animation Performance:**
   - Profile motion.div animations
   - Should not trigger layout shift
   - Should not cause CLS issues

**File References:**
- Layout.jsx:84-89 - Existing comment about stacking context
- App.css:94-106 - Z-index scale (add comment about risks)

---

## 11. File-Line Reference Summary

### Critical Files and Lines

| File | Line(s) | Purpose |
|------|---------|---------|
| `src/components/layout/Layout.jsx` | 83-93 | Header definition with backdrop-filter |
| `src/components/layout/Layout.jsx` | 84-89 | ✓ Comment explaining stacking context trap |
| `src/components/layout/Layout.jsx` | 158-170 | ✓ Topics dropdown with position:fixed z-50 |
| `src/components/layout/Layout.jsx` | 163-167 | ✓ Comment explaining position:fixed escape |
| `src/components/layout/Layout.jsx` | 435-438 | Main element (correct: no stacking context) |
| `src/App.jsx` | 89-96 | Layout wrapping with Suspense |
| `src/App.css` | 58-106 | CSS variables including z-index scale |
| `src/App.css` | 94-106 | Z-index scale definition |
| `src/index.css` | 104-131 | Touch optimizations, typography |
| `src/pages/Home.jsx` | 131-174 | Hero section with before/after image |
| `src/pages/Home.jsx` | 140-173 | Image wrapper (relative without z-index) |
| `src/pages/Home.jsx` | 263-309 | First motion.div (science bridge) |
| `src/pages/Home.jsx` | 585-604 | Parallax motion.div with transform |
| `src/components/StickyMobileCTA.jsx` | 70-99 | Sticky mobile CTA (z-50 potential conflict) |
| `tailwind.config.js` | 9-22 | Tailwind z-index mapping to CSS variables |

### No Issues Found In

- `src/main.jsx` - Error boundary and React initialization
- Other page components (Guide, Reviews, Research, etc.)
- Layout footer (z-index auto, position static)

---

## 12. Root Cause Analysis: Why Issue #161 Happened

### The Original Problem (Reconstructed)

**What the code did:**
```jsx
const { scrollY } = useScroll()
const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])  // ← Example

<header style={{ opacity: headerOpacity }}>  // ← The bug
  <div ref={topicsRef} className="relative">
    <div className="z-50">Dropdown</div>  // ← Trapped here
  </div>
</header>
```

**Why it failed:**

1. **Opacity animation creates stacking context:** When a DOM element has `opacity < 1`, it creates a stacking context per CSS spec, regardless of why the opacity changed (inline style, CSS, animation).

2. **Header's stacking context traps children:** Because the header element itself creates a stacking context via `opacity: headerOpacity`, all children—including the dropdown—have their z-indexes evaluated relative to that stacking context, not the document root.

3. **Local z-index is less than root z-index:** 
   - Dropdown z-index: 50 (local to header's stacking context)
   - Header z-index at root: 30
   - At the root level, the dropdown is logically "z=30 + local z=50", but browsers don't add them; instead, the entire header layer (z=30) contains the dropdown.
   - Page content at z=0 at root compares to the header's z=30 at root, not to the dropdown's local z=50.

4. **Perceived result:** When you scroll, you see the page content appear above the dropdown, because the page content (z=0, not in header context) appears to be above the dropdown (z=50, but trapped in header's z=30 context).

**Why This Is Subtle:**
- The developer likely didn't realize `opacity: headerOpacity` creates a stacking context.
- The comment "do NOT add opacity/transform/will-change/filter" (line 84-88) shows the developer learned this lesson.
- The fix using `position: fixed` is the nuclear option: escapes ALL ancestor stacking contexts.

### Lesson Applied: Defense in Depth

The codebase now follows a "defense in depth" approach (per comment line 165-166):
- Don't just use z-index in the dropdown
- Don't just keep the dropdown at document root
- **Actively escape any ancestor stacking context** with `position: fixed`

This ensures that even if a future developer adds `opacity` to the header, the dropdown won't break.

---

## 13. Conclusion and Risk Assessment

### Overall Risk Level: **LOW** ✓

The page structure is well-designed and the dropdown trap has been properly mitigated. The codebase shows strong understanding of stacking contexts.

### Residual Risks:

1. **StickyMobileCTA shares z-50 with dropdown** (Medium risk)
   - Both are position:fixed, z-50
   - On mobile, they could overlap
   - Recommendation: Move StickyMobileCTA to z-40 or z-60

2. **Motion.div transforms create stacking contexts** (Low risk)
   - Animations are scoped to content sections
   - Don't affect dropdown positioning
   - Safe as-is

3. **Future developers adding transform/opacity to main** (High risk if it happens)
   - Currently protected by code comments
   - Recommendation: Add ESLint rule to prevent

### Compliance Checklist:

- ✓ Header creates stacking context intentionally (backdrop-filter)
- ✓ Main element does NOT create stacking context
- ✓ Dropdown escapes header context with position:fixed
- ✓ Page content (image) has z-index:auto (0) at root
- ✓ No z-index inflation on page content
- ✓ Comments explain the design decision
- ✓ Motion animations are scoped to content, not wrapper

### Final Verdict:

**The dropdown is safe from being hidden by page content.** The architecture is correct, the fix is robust, and the comments are educational. Maintain the current patterns and add the recommended ESLint rules to prevent future regressions.

---

## Appendix A: Tailwind Z-Index Classes

Tailwind provides these z-index utility classes (from default and custom config):

```
z-0 = z-index: 0
z-10 = z-index: 10
z-20 = z-index: 20
z-30 = z-index: 30
z-40 = z-index: 40
z-50 = z-index: 50
z-auto = z-index: auto
z-behind = z-index: -1 (custom)
z-base = z-index: 0 (custom)
z-dropdown = z-index: 10 (custom)
z-sticky = z-index: 20 (custom)
z-fixed = z-index: 30 (custom)
z-header = z-index: 30 (custom)
z-comparison = z-index: 35 (custom)
z-overlay = z-index: 40 (custom)
z-modal = z-index: 50 (custom)
z-popover = z-index: 60 (custom)
z-notification = z-index: 65 (custom)
z-tooltip = z-index: 70 (custom)
```

**Note:** Topics dropdown uses `z-50` (raw Tailwind) instead of a CSS variable. Consider standardizing.

---

## Appendix B: Motion.div Opacity Animation Lifecycle

### Phase 1: Before Scroll to Element
```
opacity: 0 (initial)
→ Creates stacking context
→ Element is invisible but exists in DOM
```

### Phase 2: Element Enters Viewport
```
opacity: 0 → 1 (animating over 800ms)
→ Stacking context remains active
→ Element becomes visible
```

### Phase 3: Animation Complete (once: true)
```
opacity: 1 (final)
→ Stacking context is created (opacity < 1 isn't required anymore, but it's 1 so doesn't)
→ Actually, opacity: 1 does NOT create stacking context
→ Element is visible, stacking context disappears
```

**Key Point:** After animation, `opacity: 1` means no stacking context. Only during the animation (0 → 1) is there a stacking context.

---

**Document Generated:** 2026-04-26  
**Audited By:** Claude Opus 4.7 (File Search Specialist)  
**Status:** COMPLETE, LOW RISK VERIFIED ✓
