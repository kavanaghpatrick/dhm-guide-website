# DHM Guide Stacking Context Audit
**Generated:** 2026-04-26  
**Scope:** Complete codebase inventory of CSS stacking context creators  
**Purpose:** Diagnose dropdown layering bug where page content renders above mega-menu

---

## TABLE 1: Complete Stacking Context Creator Inventory

### CSS-Based Creators (Inline Styles & Tailwind)

| File | Line | Property | Value | Scope/Component | Creates Context? | Risk Level |
|------|------|----------|-------|-----------------|------------------|-----------|
| src/components/layout/Layout.jsx | 90 | `position: fixed` | fixed | Header container | YES | CRITICAL |
| src/components/layout/Layout.jsx | 90 | `z-index` | z-header (30) | Header container | YES | CRITICAL |
| src/components/layout/Layout.jsx | 90 | `backdrop-filter` | blur-md | Header container | YES | HIGH |
| src/components/layout/Layout.jsx | 161 | `z-index` | z-50 (50) | Mega-menu dropdown | YES | HIGH |
| src/index.css | 91 | `transform: scale(0.97)` | active state | Button active state | YES | MEDIUM |
| src/index.css | 92 | `opacity: 0.9` | active state | Button active state | YES | MEDIUM |
| src/index.css | 82 | `transform: none` | touch device | Touch device override | NO | LOW |
| src/styles/calculator-enhancements.css | 19 | `transform: scale(1.05)` | focus state | Input focus | YES | MEDIUM |
| src/styles/calculator-enhancements.css | 60 | `transform: translateY(-4px)` | hover | Card hover | YES | MEDIUM |
| src/styles/calculator-enhancements.css | 81 | `backdrop-filter: blur(4px)` | backdrop | Exit intent | YES | HIGH |
| src/styles/calculator-enhancements.css | 113 | `transform: translateX(-50%)` | button | Mobile fixed button | YES | MEDIUM |
| src/styles/calculator-enhancements.css | 152-153 | `will-change: transform` | class | Performance hint | YES | MEDIUM |
| src/styles/calculator-enhancements.css | 156-157 | `will-change: opacity` | class | Performance hint | YES | MEDIUM |
| src/components/StickyMobileCTA.jsx | 72 | `position: fixed` | fixed | Sticky mobile CTA | YES | CRITICAL |
| src/components/StickyMobileCTA.jsx | 72 | `z-index` | z-50 (50) | Sticky mobile CTA | YES | CRITICAL |
| src/components/StickyMobileCTA.jsx | 73 | `transform: translateY()` | inline style | Mobile CTA | YES | MEDIUM |
| src/components/RelatedCalculators.jsx | 124 | `group-hover:scale-110` | Tailwind | Icon scale | YES | LOW |
| src/components/FAQSection.jsx | 329 | `group-hover:scale-110` | Tailwind | Category icon | YES | LOW |

### Framer-Motion Animated Transforms (Implicit Stacking Contexts)

| File | Line | Component | Animation Props | Creates Context? | Risk Level |
|------|------|-----------|-----------------|------------------|-----------|
| src/components/layout/Layout.jsx | 87 | `<motion.header>` | style={{ opacity: headerOpacity }} | YES | CRITICAL |
| src/components/layout/Layout.jsx | 106-108 | `<motion.div>` | whileHover={{ rotate: 360 }} | YES | MEDIUM |
| src/components/layout/Layout.jsx | 148-153 | `<motion.div>` | layoutId + transition | YES | MEDIUM |
| src/components/layout/Layout.jsx | 247-252 | `<motion.div>` | layoutId + transition | YES | MEDIUM |
| src/components/layout/Layout.jsx | 296-300 | `<motion.nav>` | initial/animate/exit + transforms | YES | MEDIUM |
| src/components/RelatedCalculators.jsx | 114-157 | `<motion.div>` + `<motion.button>` | initial/whileInView/transition | YES | LOW |
| src/components/UserTestimonials.jsx | 154-180 | `<motion.div>` | initial/whileInView + scale/opacity | YES | LOW |
| src/components/FAQSection.jsx | 299-301 | `<motion.div>` | initial/whileInView/transition | YES | LOW |
| src/components/CompetitorComparison.jsx | 182-184 | `<motion.div>` | initial/whileInView | YES | LOW |
| src/components/ComparisonWidget.jsx | 55-60 | `<motion.div>` | initial/animate/exit + y-offset | YES | MEDIUM |
| src/components/MobileComparisonWidget.jsx | 47-61 | `<motion.div>` | initial/animate/exit + position | YES | HIGH |
| src/components/MobileComparisonWidget.jsx | 88 | `<motion>` | rotate-180 dynamic | YES | LOW |
| src/newblog/components/ImageLightbox.jsx | 47-100 | `<motion.div>` | initial/animate/exit + backdrop | YES | MEDIUM |
| src/pages/DosageCalculatorEnhanced.jsx | 1638,1703,1778,1810,2022,2034 | `<motion.div>` | whileHover={{ scale: 1.05/1.02 }} | YES | MEDIUM |
| src/pages/Home.jsx | 263,317,339,420+ | `<motion.div>` | useScroll/useTransform + initial/whileInView | YES | MEDIUM |
| src/pages/Guide.jsx | 135,208,225+ | `<motion.div>` | initial/whileInView/transition | YES | LOW |
| src/pages/Reviews.jsx | 455,539,640+ | `<motion.div>` | initial/whileInView/transition | YES | LOW |
| src/pages/Compare.jsx | 441,536,1034+ | `<motion.div>` | initial/whileInView/transition | YES | LOW |
| src/pages/About.jsx | 118,171,184+ | `<motion.div>` | initial/whileInView/transition | YES | LOW |

### UI Component Library (Radix-based, z-index implicit)

| File | Property | Value | Component Type | Creates Context? | Risk Level |
|------|----------|-------|-----------------|------------------|-----------|
| src/components/ui/dropdown-menu.jsx | `z-index` | z-50 | Radix DropdownMenu | YES | MEDIUM |
| src/components/ui/dialog.jsx | `z-index` | z-50 | Radix Dialog | YES | MEDIUM |
| src/components/ui/menubar.jsx | `z-index` | z-50 | Radix Menubar | YES | MEDIUM |
| src/components/ui/select.jsx | `z-index` | z-50 | Radix Select | YES | MEDIUM |
| src/components/ui/popover.jsx | `z-index` | z-50 | Radix Popover | YES | MEDIUM |
| src/components/ui/tooltip.jsx | `z-index` | z-50 | Radix Tooltip | YES | MEDIUM |
| src/components/ui/context-menu.jsx | `z-index` | z-50 | Radix ContextMenu | YES | MEDIUM |
| src/components/ui/navigation-menu.jsx | `z-index` | z-50 + `isolate` | Radix NavigationMenu | YES | MEDIUM |
| src/components/ui/drawer.jsx | `z-index` | z-50 | Radix Drawer | YES | MEDIUM |
| src/components/ui/alert-dialog.jsx | `z-index` | z-50 | Radix AlertDialog | YES | MEDIUM |
| src/components/ui/sidebar.jsx | `z-index` | z-10, z-20 | Radix Sidebar | YES | MEDIUM |

### Picture Component (Adopted in #293)
| File | Line | Element | Style | Creates Context? |
|------|------|---------|-------|------------------|
| src/components/Picture.jsx | 38-77 | `<picture>` | No stacking context styles | NO | N/A |

---

## TABLE 2: Mega-Menu Parent Chain Analysis

**Mega-menu location:** `/never-hungover` dropdown in `src/components/layout/Layout.jsx` line 156-224

### DOM Parent Hierarchy (Top-Down)

```
<html>
  └─ <body>
      └─ #root (React root)
          └─ <App>
              └─ <Layout>
                  └─ <div> (min-h-screen bg-gradient-to-br)
                      └─ <motion.header> [LINE 87]
                          │ STACKING CONTEXT: position:fixed + z-header(30) + backdrop-filter
                          │ ⚠ CRITICAL: This creates a stacking context boundary!
                          │
                          └─ <div> (container mx-auto px-4 py-4)
                              └─ <div> (flex items-center justify-between)
                                  └─ <nav> (hidden lg:flex)
                                      └─ <div> (relative) [LINE 124-225]
                                          │ ref=topicsRef
                                          │ onMouseEnter/onMouseLeave
                                          │ NO STACKING CONTEXT YET
                                          │
                                          ├─ <button> (Topics trigger)
                                          │   └─ <motion.div> [LINE 148]
                                          │       STACKING CONTEXT: layoutId motion animation
                                          │
                                          └─ <div> (mega-menu dropdown) [LINE 157-224]
                                              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
                                              │ position: absolute (not fixed)
                                              │ z-index: z-50 (50)
                                              │ -translate-x-1/2: CREATES TRANSFORM CONTEXT!
                                              │ ⚠️ CRITICAL ISSUE: transform on mega-menu itself
                                              │
                                              ├─ <div> (grid grid-cols-3)
                                              └─ <div> (border-t mt-5)
```

### Stacking Context Parent Chain Analysis

| Parent | Line | CSS Property | Value | Creates Context? | Traps Dropdown? | Severity |
|--------|------|--------------|-------|------------------|-----------------|----------|
| `<html>` | - | (root) | (root) | NO | - | N/A |
| `<body>` | - | (default) | (default) | NO | - | N/A |
| `#root` | - | (default) | (default) | NO | - | N/A |
| `<App>` | - | (default) | (default) | NO | - | N/A |
| `<Layout>` | - | (default) | (default) | NO | - | N/A |
| Outer `<div>` | 85 | background-gradient | (gradient) | NO | - | N/A |
| `<motion.header>` | 87 | `position: fixed` | fixed | **YES** | **NO** (fixed escapes) | CRITICAL |
| `<motion.header>` | 87 | `z-index` | z-header (30) | YES (via position) | NO (fixed escapes) | CRITICAL |
| `<motion.header>` | 87 | `backdrop-filter` | blur-md | **YES** | **NO** (fixed escapes) | HIGH |
| `<motion.header>` | 87 | `opacity` via `useTransform` | headerOpacity animation | **YES** | **NO** (opacity on parent container, not dropdown) | MEDIUM |
| Header div.container | - | (flow) | (flow) | NO | - | N/A |
| Header div.flex | - | (flow) | (flow) | NO | - | N/A |
| `<nav>` (desktop) | 119 | (flow + flex) | (flex) | NO | - | N/A |
| Topics `<div>` | 124 | `position: relative` | relative | NO (no z-index) | NO | N/A |
| Mega-menu `<div>` | 157 | `position: absolute` | absolute | NO (no z-index on ancestor) | **POSSIBLY** | **HIGH** |
| Mega-menu `<div>` | 161 | `-translate-x-1/2` | transform | **YES** | **YES** | **CRITICAL** |
| Mega-menu `<div>` | 161 | `z-index` | z-50 (50) | YES (via transform) | YES | **CRITICAL** |

---

## TABLE 3: THE SMOKING GUN - Root Cause Analysis

### Issue: Dropdown Content Rendering Below Page Assets

**Symptoms:**
- Hovering nav menu pops dropdown open ✓
- Dropdown has `z-50` (50) ✓
- Page content (main, calculated data, etc.) renders ABOVE dropdown

**Root Cause Chain:**

1. **Mega-menu div at line 161 has `-translate-x-1/2`:**
   ```jsx
   className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
   ```
   - `-translate-x-1/2` = `transform: translateX(-50%)`
   - **This creates a new stacking context on the dropdown itself**
   - The dropdown is now the root of its own stacking context
   - All children of this div are trapped within z-index values 0-50

2. **Header at line 87 has `backdrop-filter: blur-md`:**
   ```jsx
   className="fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md border-b border-green-100"
   ```
   - `backdrop-filter: blur-md` creates a stacking context
   - `position: fixed` + z-index hierarchy
   - Header is stacking context but it's positioned `fixed`, so dropdown can escape it

3. **Header opacity animation via framer-motion:**
   ```jsx
   style={{ opacity: headerOpacity }}
   ```
   - `opacity !== 1` creates a stacking context
   - `<motion.header>` with `headerOpacity` animation
   - Header becomes stacking context parent

4. **Page content (main + below) render with natural z-order:**
   - `<main>` at line 428 has no stacking context creator
   - Page background (`<div className="min-h-screen...">` at line 85) has no z-index
   - Content renders in natural document order → appears above dropdown if dropdown is trapped

**The True Culprit:**
The mega-menu div itself (line 161) has:
- `position: absolute` (positioned)
- `transform: translateX(-50%)` (via `-translate-x-1/2`)
- `z-index: z-50` (50)

This creates a **stacking context**, and since the dropdown is absolutely positioned within a relatively positioned parent (the topics `<div>` at line 124), it's rendered as a **new stacking context group**. The z-50 only applies within that context, not globally on the page.

Meanwhile, page content below the header has no stacking context but is rendered in the same global stacking context as the dropdown's parent `<nav>`. If the `<main>` or page sections acquire a stacking context (or even just render naturally), they'll appear above the dropdown.

---

## TABLE 4: Secondary Stacking Context Sources (Contributing Factors)

### StickyMobileCTA Component (Line 72)
```jsx
className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 md:hidden transform transition-transform duration-300"
style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
```
- `position: fixed` ✓ STACKING CONTEXT
- `z-index: z-50` ✓ STACKING CONTEXT
- `transform: translateY()` ✓ STACKING CONTEXT
- **Risk:** Conflicts with dropdown on mobile

### ComparisonWidget (Line 60)
```jsx
className="fixed bottom-4 right-4 z-comparison max-w-sm"
```
- `position: fixed` ✓ STACKING CONTEXT
- `z-index: z-comparison (35)` ✓ STACKING CONTEXT
- **Risk:** Can overlap dropdown on desktop

### MobileComparisonWidget (Line 61)
```jsx
className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-comparison pointer-events-auto"
```
- `position: fixed` ✓ STACKING CONTEXT
- `z-index: z-comparison (35)` ✓ STACKING CONTEXT
- **Risk:** Mobile-only but creates context

### Navigation Menu Underlines (Lines 148-153, 247-252)
```jsx
<motion.div
  layoutId="activeTab"
  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
  initial={false}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```
- `<motion.div>` with `layoutId` ✓ STACKING CONTEXT (framer-motion animation)
- Multiple instances (one per nav item)
- **Risk:** Low, but accumulates

### Mobile Navigation Animation (Lines 296-300)
```jsx
<motion.nav
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  className="lg:hidden mt-4 pb-4 border-t border-green-100 pt-4"
>
```
- `<motion.nav>` with initial/animate/exit ✓ STACKING CONTEXT
- Applies transforms
- **Risk:** Mobile menu only

---

## TABLE 5: Z-Index Hierarchy

**Defined in App.css CSS Variables (App.css lines 93-105):**

```
--z-index-tooltip: 70
--z-index-notification: 65
--z-index-popover: 60
--z-index-modal: 50
--z-index-overlay: 40
--z-index-comparison: 35
--z-index-header: 30
--z-index-fixed: 30
--z-index-sticky: 20
--z-index-dropdown: 10
--z-index-base: 0
--z-index-behind: -1
```

**Actual Usage in Code:**
- `z-header` (30) → Header (Layout.jsx:90)
- `z-50` (raw) → Mega-menu dropdown (Layout.jsx:161) ← **BYPASSES HIERARCHY!**
- `z-50` (raw) → StickyMobileCTA (StickyMobileCTA.jsx:72)
- `z-comparison` (35) → ComparisonWidget (ComparisonWidget.jsx:60)
- `z-50` (raw) → Dialog/Menubar/Select/Popover/Tooltip (UI library)

**Problem:** Mega-menu uses raw `z-50` instead of `z-modal` (50) or `z-overlay` (40), inconsistent with design system.

---

## SMOKING GUN: The Layering Bug Diagnosis

### Summary of Findings

**Primary Issue:** The mega-menu dropdown has a **transform property** (`-translate-x-1/2`) that creates a stacking context. Within that context, `z-index: z-50` only compares with sibling elements, not with the global page z-order.

**Contributing Factors:**
1. Header has multiple stacking context creators:
   - `position: fixed` + `z-index: z-header (30)`
   - `backdrop-filter: blur-md`
   - `opacity` animation via framer-motion

2. Mega-menu dropdown has:
   - `position: absolute` (inside relative parent)
   - **`transform: translateX(-50%)`** ← **THE CULPRIT**
   - `z-index: z-50 (50)`

3. Page content below has:
   - No z-index management
   - Can naturally render above the dropdown if page sections acquire stacking contexts

### Why Content Appears Above the Dropdown

When you have:
```
<header> [stacking context via transform + backdrop-filter + opacity]
  ├─ <nav>
  │   └─ <div> [topics - position relative, NO z-index]
  │       └─ <div class="z-50"> [transform: translateX(-50%)] ← NEW STACKING CONTEXT
  │           └─ dropdown content
  │
<main> [global stacking context, natural z-order]
    └─ page content (renders in document order)
```

The `<main>` content renders at the same global stacking level as the `<nav>`. Since the dropdown's stacking context is created by the `transform` property on the dropdown itself, not on an ancestor, the page content is outside that context and renders at the global level, appearing above the dropdown.

---

## RECOMMENDATION: Fix Strategy

### Option 1: Remove Transform from Mega-Menu (SIMPLEST)
**File:** `src/components/layout/Layout.jsx` line 161  
**Change:**
```jsx
// BEFORE:
className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"

// AFTER (use inset-x-1/2 with margin):
className="absolute left-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
style={{ marginLeft: '-50vw', left: '50vw' }}
```
**Why:** Eliminates the transform-created stacking context on the dropdown itself.

### Option 2: Change Dropdown to Fixed (RECOMMENDED)
**File:** `src/components/layout/Layout.jsx` line 161  
**Change:**
```jsx
// BEFORE:
className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"

// AFTER:
className="fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
style={{ top: `${headerHeight + 8}px` }}
```
**Why:** `position: fixed` escapes parent stacking contexts; paired with `z-50`, it guarantees rendering above page content.

### Option 3: Isolate the Topics Container (ALTERNATIVE)
**File:** `src/components/layout/Layout.jsx` line 124  
**Change:**
```jsx
// BEFORE:
<div
  key="topics-dropdown"
  ref={topicsRef}
  className="relative"
  onMouseEnter={() => setIsTopicsOpen(true)}
  onMouseLeave={() => setIsTopicsOpen(false)}
>

// AFTER:
<div
  key="topics-dropdown"
  ref={topicsRef}
  className="relative isolate"
  onMouseEnter={() => setIsTopicsOpen(true)}
  onMouseLeave={() => setIsTopicsOpen(false)}
>
```
**Why:** `isolation: isolate` creates a new stacking context on the topics container, containing the dropdown within a higher-order stacking context.

### Option 4: Add Will-Change to Dropdown (MINIMAL)
**File:** `src/components/layout/Layout.jsx` line 161  
**Change:**
```jsx
// BEFORE:
className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"

// AFTER:
className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
style={{ willChange: 'auto' }}
```
**Why:** Explicitly declares no performance optimization, may help browser rendering.

---

## Conclusion

**The bug is caused by the mega-menu dropdown's `transform: translateX(-50%)` CSS property, which creates an unexpected stacking context that limits the dropdown's z-index rendering scope.**

**Recommended fix:** Change the mega-menu dropdown from `position: absolute` to `position: fixed` and calculate the top position dynamically based on header height. This escapes the parent stacking context and ensures the dropdown always renders above page content.

**Secondary fix:** Add `isolation: isolate` to the topics container (line 124) to explicitly manage the stacking context hierarchy.

Both fixes are low-risk and don't require DOM structure changes.
