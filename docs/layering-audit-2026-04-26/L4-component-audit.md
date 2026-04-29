# Component Stacking Audit Report
**Date:** 2026-04-26  
**Objective:** Document positioning, stacking contexts, and z-index decisions for all major layout components to identify stacking conflicts where page assets appear above the navigation menu.

---

## Z-Index Scale (App.css / tailwind.config.js)

Defined in `/src/App.css` (lines 93–106) using CSS variables:

| Layer | Value | Purpose |
|-------|-------|---------|
| `--z-index-behind` | -1 | Elements behind normal flow |
| `--z-index-base` | 0 | Normal document flow |
| `--z-index-dropdown` | 10 | Dropdowns, tooltips |
| `--z-index-sticky` | 20 | Sticky elements |
| `--z-index-fixed` | 30 | Fixed navigation, headers |
| `--z-index-header` | 30 | **Main navigation header** |
| `--z-index-comparison` | 35 | **Comparison widget (ABOVE header!)** |
| `--z-index-overlay` | 40 | Page overlays, drawers |
| `--z-index-modal` | 50 | Modal dialogs |
| `--z-index-popover` | 60 | Popovers, floating UI |
| `--z-index-notification` | 65 | Toast notifications (Sonner) |
| `--z-index-tooltip` | 70 | Tooltips (highest) |

**🚨 CRITICAL:** Comparison widget is intentionally set to z-35, **above** the header (z-30). This is a designed decision but may conflict with page content.

---

## src/components/layout/Layout.jsx

**File Lines:** 1–545  
**Component Purpose:** Main page shell with header, navigation (mega-menu), footer, and sticky mobile CTA.

### Header Element
- **Line 87:** `<motion.header>`
  - **Position:** `fixed top-0 left-0 right-0`
  - **Z-Index:** `z-header` (evaluates to 30)
  - **Background:** `bg-white/80 backdrop-blur-md`
  - **Opacity Transforms:** Uses framer-motion `useScroll()` + `useTransform()` to fade opacity on scroll
    - Lines 43–44: `const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])`
    - This **creates a stacking context** (opacity animation applies transform)

### Mega-Menu Dropdown
- **Lines 156–223:** Topics dropdown (desktop)
  - **Container:** `<div ref={topicsRef}` with `relative` positioning (implied parent)
  - **Dropdown Content:** `absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl`
  - **Z-Index:** `z-50` (hard-coded, **not** using CSS variable!)
  - **Visual Effects:** `shadow-2xl border border-gray-100`
  - **Parent Transform:** Sibling of header, no additional transforms on this dropdown
  - **Stacking Context:** YES — the `absolute` positioning + explicit z-50 creates a child context within header's motion wrapper

- **Lines 306–380:** Topics collapsible (mobile)
  - **No fixed/absolute positioning** — rendered inline after menu button in mobile nav
  - **Z-Index:** None (inherits parent's stacking context)
  - **Conditional Render:** Only visible when `isMenuOpen === true`

### Mobile Navigation Menu
- **Lines 295–423:** `<motion.nav>`
  - **Position:** Relative (default block layout, expands below header)
  - **Visual Effects:** Motion animation with `initial={{ opacity: 0, y: -20 }}` → `animate={{ opacity: 1, y: 0 }}`
  - **Stacking Context:** YES — motion.nav with opacity/transform creates a new context
  - **Z-Index:** Inherits from layout (no explicit z-index)

### Main Content
- **Line 428:** `<main style={{ paddingTop: \`${headerHeight}px\` }}`
  - **Position:** Static (normal flow)
  - **Padding-top:** Dynamically calculated to account for fixed header height
  - **Z-Index:** `0` (base/normal flow)
  - **Stacking Context:** No

### Sticky Mobile CTA
- **Line 433:** `<StickyMobileCTA />` (imported)
  - Rendered at layout level, see separate section below

### Footer
- **Line 436:** `<footer>`
  - **Position:** Static (normal flow)
  - **Z-Index:** 0
  - **Stacking Context:** No

---

## src/App.jsx

**File Lines:** 1–105  
**Component Purpose:** App root, route rendering, analytics, provider setup.

### Toaster Mount
- **Line 95:** `<Toaster position="top-center" richColors />`
  - **Source:** `sonner` library
  - **Position:** Fixed (default for toast libraries)
  - **Z-Index:** Typically `9999` or library-defined (NOT using app's scale)
  - **Stacking Context:** YES — Sonner creates its own stacking context
  - **Placement:** Mounted at App root, renders after all page content
  - **Risk:** Peer of header, positioned top-center; may overlap with mega-menu or page content

### Layout Wrapper
- **Line 90:** `<Layout>` wraps page content
- **Suspense Fallback:** Page loader div (centered, no special stacking)
- **SpeedInsights:** `<SpeedInsights />` (Vercel analytics, minimal DOM impact)

---

## src/main.jsx

**File Lines:** 1–182  
**Component Purpose:** React app initialization, error boundary, touch optimizations.

### Root Container
- **Line 128:** `const container = document.getElementById('root')`
- **Position:** Static in DOM (body > div#root)
- **Z-Index:** 0
- **Stacking Context:** No (vanilla container)

### Error Boundary
- **Lines 7–96:** `<ErrorBoundary>` wrapper
  - **Fallback UI:** Inline `<div>` with `display: flex; flex-direction: column; justify-content: center; align-items: center;`
  - **Position:** Static when no error
  - **Stacking Context:** No

### Touch Setup
- **Lines 99–123:** `setupTouchOptimizations()`
  - Modifies `document.body.style.touchAction = 'manipulation'`
  - Does NOT affect z-index or stacking

---

## index.html

**File Lines:** 1–265  
**Purpose:** HTML entry point, meta tags, preload directives, initial DOM structure.

### Body Wrapper
- **Line 236:** `<div id="root">`
  - **Position:** Static (block element)
  - **Z-Index:** 0
  - **Children:** React renders here

### Critical CSS (Inline)
- **Lines 49–68:** Inline `<style>` for LCP image optimization
  ```css
  img[src*="before-after-dhm"] {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1536 / 1024;
    background-color: #f3f4f6;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  ```
  - **Transform:** None
  - **Position:** Block display (static)
  - **Z-Index:** None (inherits from parent, typically 0)

---

## src/components/Picture.jsx

**File Lines:** 1–80  
**Purpose:** Responsive `<picture>` component for hero/feature images with WebP support.

### Structure
- **Line 37–52 (WebP):** Single `<picture>` with native WebP source
- **Line 56–77 (PNG/JPG):** `<picture>` with WebP + original format fallback
- **Image Element:** `<img>` with attributes:
  - `loading={loadingStrategy}` (eager if priority, else lazy)
  - `decoding={priority ? "sync" : "async"}`
  - `width` / `height` (explicit to prevent CLS)
  - **Position:** Static (inline with picture)
  - **Transform:** None (no motion, no transforms)
  - **Z-Index:** Inherits (typically 0)

### Stacking Context
- **NO** — Picture is a simple semantic container; no position, transform, or opacity applied
- **High Fetchpriority:** Does NOT create stacking context (fetchpriority is a resource hint, not CSS)

---

## src/newblog/components/NewBlogPost.jsx

**File Lines:** 1–1505  
**Purpose:** Blog post template with hero image, reading progress, TOC, and content rendering.

### Reading Progress Bar
- **Lines 717–727:** Fixed progress bar below header
  ```jsx
  <div className="fixed left-0 w-full h-1 bg-gray-200 z-sticky"
       style={{ top: 'var(--header-height, 80px)' }}>
  ```
  - **Position:** `fixed left-0`
  - **Z-Index:** `z-sticky` (= 20, **below header at z-30**)
  - **Stacking Context:** YES — fixed position creates a new context
  - **Transform:** None
  - **Opacity:** None (solid colors)

### Page Header Section
- **Lines 729–826:** Blog post header (title, meta, tags)
  - **Position:** Static (block layout)
  - **Z-Index:** 0
  - **Stacking Context:** No

### Main Content Layout
- **Line 828:** `<div className="max-w-6xl mx-auto px-4 py-12 flex gap-8">`
  - **Position:** Static (flex container)
  - **Z-Index:** 0
  - **Stacking Context:** NO — flex doesn't create context unless z-index or transform present

### Desktop Table of Contents (Sidebar)
- **Lines 830–856:** TOC container with sticky positioning
  ```jsx
  <div className="sticky" style={{ top: 'calc(var(--header-height, 80px) + 16px)' }}>
  ```
  - **Position:** `sticky` (relative until scroll boundary)
  - **Z-Index:** None (inherits, typically 0)
  - **Stacking Context:** YES — sticky creates a new context
  - **Parent Container:** flex child (no special z-index)

### Hero Image
- **Lines 919–932:** Picture component usage in blog post
  ```jsx
  {post.image && (
    <div className="w-full">
      <Picture
        src={post.image}
        alt={`${post.title} - DHM Guide`}
        className="w-full aspect-video object-cover"
        width={1600}
        height={900}
        priority
        fetchpriority="high"
      />
    </div>
  )}
  ```
  - **Container:** `<div className="w-full">` — static
  - **Picture:** See Picture.jsx (no transforms)
  - **Z-Index:** 0 (inherited)
  - **Stacking Context:** NO
  - **Issue:** `priority` + `fetchpriority="high"` are resource hints; they do NOT affect stacking

### Quick Answer Callout
- **Lines 935–941:**
  ```jsx
  {post.quickAnswer && (
    <div className="max-w-3xl mx-auto mb-8 p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
  ```
  - **Position:** Static (block)
  - **Z-Index:** 0
  - **Stacking Context:** No
  - **Background:** `bg-blue-50` (color, not transform)

### Main Article Container
- **Lines 913–918:** Motion-wrapped article
  ```jsx
  <motion.article 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden">
  ```
  - **Position:** Static (block)
  - **Z-Index:** 0
  - **Stacking Context:** YES — `motion.article` with opacity + y-transform (always creates context)
  - **Transform:** `y: 20` (initial), animated to `y: 0`
  - **Overflow:** `hidden` (clips overflow, may affect descendant stacking)

### Content Area
- **Line 949:** Main markdown render area
  ```jsx
  <div ref={contentRef} className="prose prose-lg prose-green max-w-none enhanced-typography">
  ```
  - **Position:** Static
  - **Z-Index:** 0
  - **Stacking Context:** No

---

## src/components/ComparisonWidget.jsx

**File Lines:** 1–215  
**Purpose:** Desktop comparison widget (bottom-right floating card).

### Container
- **Lines 55–211:** Motion-wrapped widget
  ```jsx
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed bottom-4 right-4 z-comparison max-w-sm"
  >
  ```
  - **Position:** `fixed bottom-4 right-4`
  - **Z-Index:** `z-comparison` (= 35, **ABOVE header at z-30**)
  - **Stacking Context:** YES — fixed position + motion transform
  - **Transform:** `y: 100` (initial), animated to `y: 0`
  - **Opacity:** Animated 0 → 1
  - **Visual:** `shadow-2xl`

### Child Elements
- **Lines 64–89:** Header div (gradient background)
  - `bg-gradient-to-r from-green-600 to-green-700`
  - **Stacking Context:** No (child of fixed motion parent)
- **Lines 93–209:** Content (AnimatePresence wraps expandable content)
  - **Stacking Context:** YES — inner motion.div with height + opacity transforms

---

## src/components/MobileComparisonWidget.jsx

**File Lines:** 1–200  
**Purpose:** Mobile comparison widget (draggable bottom sheet).

### Constraints Container
- **Lines 47–49:**
  ```jsx
  <motion.div
    ref={constraintsRef}
    className="fixed inset-0 pointer-events-none"
  >
  ```
  - **Position:** `fixed inset-0` (covers viewport)
  - **Z-Index:** None (inherits, typically 0)
  - **Pointer Events:** `pointer-events-none` (child overrides)
  - **Stacking Context:** YES — fixed position creates context

### Draggable Widget
- **Lines 51–196:**
  ```jsx
  <motion.div
    drag="y"
    dragControls={dragControls}
    dragListener={false}
    dragConstraints={constraintsRef}
    dragElastic={0.2}
    initial={{ y: '100%' }}
    animate={{ y: isMinimized ? 'calc(100% - 60px)' : 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-comparison pointer-events-auto"
    style={{ maxHeight: '70vh' }}
  >
  ```
  - **Position:** `fixed bottom-0 left-0 right-0`
  - **Z-Index:** `z-comparison` (= 35, **ABOVE header**)
  - **Stacking Context:** YES — fixed + drag controls + motion transforms
  - **Transform:** `y` animated (draggable)
  - **Pointer Events:** `pointer-events-auto` (overrides constraint's pointer-events-none)

### Drag Handle
- **Lines 64–70:**
  ```jsx
  <div 
    className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center cursor-grab active:cursor-grabbing touch-manipulation"
    onPointerDown={(e) => dragControls.start(e)}
  >
  ```
  - **Position:** `absolute` (relative to parent fixed)
  - **Stacking Context:** No (child of fixed parent)

---

## src/components/StickyMobileCTA.jsx

**File Lines:** 1–102  
**Purpose:** A/B-tested sticky CTA bar appearing after 25% scroll on mobile.

### Container
- **Lines 71–99:**
  ```jsx
  <div
    className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 md:hidden transform transition-transform duration-300"
    style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
    role="complementary"
    aria-label="Quick access to product reviews"
  >
  ```
  - **Position:** `fixed bottom-0 left-0 right-0`
  - **Z-Index:** `z-50` (hard-coded, **NOT using CSS variable**)
  - **Stacking Context:** YES — fixed + transform + inline style transform
  - **Transform:** Inline `style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}`
  - **Mobile-Only:** `md:hidden` (display: none on desktop)
  - **Visibility Control:** Via inline transform, not display property

### Child Elements
- CTA link + dismiss button inside flex container
- No additional stacking concerns

---

## src/index.css

**File Lines:** 1–586  
**Purpose:** Global styles, typography, touch optimizations.

### Z-Index Related
- **No explicit z-index definitions** (all deferred to App.css / tailwind.config.js)

### Transform Usage
- **Line 82:** `button:active` applies `transform: scale(0.97)` — creates stacking context on active state
- **Line 91:** `a:active` applies `transform: scale(0.97)` — creates stacking context on active state
- **Line 162:** `.filter-tag:active` applies `transform: scale(0.97)`

### Backdrop-blur / Filter
- **No `backdrop-blur` or `backdrop-filter` in global styles**

---

## src/App.css

**File Lines:** 1–57  
**Purpose:** Tailwind imports, custom theme variables, z-index scale.

### Z-Index Scale Definition
- **Lines 93–106:** CSS variables for z-index scale (see table above)

### Theme Variables
- Uses OKLch color space (oklch()) for CSS variables
- No stacking-related transforms

---

## tailwind.config.js

**File Lines:** 1–26  
**Purpose:** Tailwind configuration with custom z-index scale.

### Custom Z-Index Scale
- **Lines 9–22:**
  ```javascript
  zIndex: {
    'behind': 'var(--z-index-behind)',
    'base': 'var(--z-index-base)',
    'dropdown': 'var(--z-index-dropdown)',
    'sticky': 'var(--z-index-sticky)',
    'fixed': 'var(--z-index-fixed)',
    'header': 'var(--z-index-header)',
    'comparison': 'var(--z-index-comparison)',
    'overlay': 'var(--z-index-overlay)',
    'modal': 'var(--z-index-modal)',
    'popover': 'var(--z-index-popover)',
    'notification': 'var(--z-index-notification)',
    'tooltip': 'var(--z-index-tooltip)',
  }
  ```
  - All values are CSS variable references
  - Actual values defined in App.css `:root`

---

## Stacking Context Summary

A **stacking context** is created by:
1. **position:** `fixed` or `absolute` (with z-index ≠ auto)
2. **position:** `relative/sticky` (with z-index ≠ auto)
3. **opacity** < 1
4. **transform** (any non-identity transform)
5. **filter** (any filter effect)
6. **backdrop-filter**
7. **mix-blend-mode** ≠ normal
8. **clip-path**
9. **mask** / `mask-image` / `mask-border`
10. **motion.*** (Framer Motion always applies transform)

### All Stacking Contexts in Codebase

| Component | File | Lines | Context Creator | Z-Index | Issue Risk |
|-----------|------|-------|-----------------|---------|------------|
| Header | Layout.jsx | 87 | `fixed` + framer-motion opacity/transform | 30 | **Parent of mega-menu** |
| Mega-Menu Dropdown | Layout.jsx | 156–223 | `absolute` inside header | 50 (hard-coded) | **Above header** |
| Mobile Nav | Layout.jsx | 295 | `motion.nav` (opacity/transform) | 0 | Child of header |
| Reading Progress | NewBlogPost.jsx | 719 | `fixed` | 20 | Below header ✓ |
| Blog TOC (Sticky) | NewBlogPost.jsx | 832 | `sticky` | 0 | Sidebar, no z-conflict |
| Article Motion Wrapper | NewBlogPost.jsx | 913 | `motion.article` (opacity/y-transform + overflow:hidden) | 0 | **Clips content, may affect hero image** |
| ComparisonWidget (Desktop) | ComparisonWidget.jsx | 55 | `fixed` + motion (y-transform + opacity) | **35** | **ABOVE header (z-30)** |
| MobileComparisonWidget Constraints | MobileComparisonWidget.jsx | 47 | `fixed inset-0` | 0 | Container for draggable |
| MobileComparisonWidget Draggable | MobileComparisonWidget.jsx | 51 | `fixed` + drag + motion transforms | **35** | **ABOVE header (z-30)** |
| StickyMobileCTA | StickyMobileCTA.jsx | 71 | `fixed` + inline transform | **50** | **ABOVE header, above mega-menu?** |
| Sonner Toaster | App.jsx | 95 | (Sonner library default) | ~9999 | **Highest, intentional** |

---

## Smoking Gun Candidates (Ranked by Likelihood)

### 🚨 **RANK 1: BlogPost ArticleContainer Motion Wrapper + Overflow Hidden**
**File:** `src/newblog/components/NewBlogPost.jsx:913–918`

```jsx
<motion.article 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="bg-white rounded-xl shadow-lg overflow-hidden">
```

**Stacking Context:** YES (motion.article + opacity + transform + overflow:hidden)

**The Problem:**
- `overflow: hidden` on a stacking context clips ALL descendant content
- The hero image (Picture) is a child of article → subject to clip
- The article has z-index: 0, which is **above the header's positioned children in certain viewport states**
- When article animates in with `y: 20 → 0`, the overflow-hidden clip persists
- **Result:** Hero image may be clipped or rendered behind other layers depending on paint order

**How to Verify:**
1. Navigate to `/never-hungover/[any-post]`
2. Check DevTools > Layers panel → see if article's stacking context clips Picture
3. Hero image should be visible **below the header**, not above it

**Potential Fix:** Remove `overflow: hidden` from article wrapper, or ensure Picture is rendered outside article's stacking context.

---

### 🟡 **RANK 2: ComparisonWidget (Desktop) + MobileComparisonWidget both z-comparison (z-35)**
**Files:** 
- `src/components/ComparisonWidget.jsx:55–211` 
- `src/components/MobileComparisonWidget.jsx:51–196`

```jsx
className="fixed bottom-4 right-4 z-comparison max-w-sm"  // Desktop
className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-comparison pointer-events-auto"  // Mobile
```

**Stacking Context:** YES (fixed + motion transforms + opacity)

**The Problem:**
- Both widgets use `z-comparison` = 35, which is **above header z-30**
- Intentional design (see App.css line 100 comment: "Comparison widget (above header)")
- BUT: This is unusual UX — fixed floating widget should typically be below nav
- **If mega-menu is rendered, z-50 mega-menu dropdown sits above z-35 comparison widget** ✓ (correct)
- **Risk:** If comparison widget dynamically appears while page is loading, it may briefly render above header

**When User Sees Issue:**
- Comparison widget shows "10+ products independently tested" bar at bottom
- On mobile, it's a draggable bottom sheet taking up 70% viewport
- On desktop, it's fixed bottom-right
- Both are intentionally above header per design

**Verdict:** Likely **NOT the cause** — z-comparison (35) is properly below mega-menu (50) and other popover layers (60+). BUT if user reports "page assets above menu", they may mean the comparison widget itself.

---

### 🟡 **RANK 3: StickyMobileCTA uses hard-coded z-50 (not CSS variable)**
**File:** `src/components/StickyMobileCTA.jsx:71–99`

```jsx
className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 md:hidden transform transition-transform duration-300"
```

**Stacking Context:** YES (fixed + inline transform)

**The Problem:**
- Uses hard-coded `z-50` instead of `z-notification` (which is 65 in scale)
- Inconsistent with the z-index scale
- BUT: `z-50` is still **above header (z-30)** and **above mega-menu (z-50, tied!)**
- Inline transform creates stacking context even on hidden state (may prevent CSS optimization)

**Risk:**
- If mega-menu also uses `z-50`, they may stack unpredictably
- `md:hidden` prevents display on desktop, so desktop comparison widget takes precedence

**Verdict:** Low priority — only visible on mobile, and only when feature flag variant = 'sticky-bar'. Minor inconsistency.

---

### 🟢 **RANK 4: Picture.jsx Priority + Fetchpriority (Resource Hints, Not CSS)**
**File:** `src/components/Picture.jsx:1–80` + usage in `NewBlogPost.jsx:919–932`

```jsx
<Picture
  src={post.image}
  alt={`${post.title} - DHM Guide`}
  className="w-full aspect-video object-cover"
  width={1600}
  height={900}
  priority
  fetchpriority="high"
/>
```

**Stacking Context:** NO — Picture is a semantic `<picture>` element with no transforms

**The Problem:**
- `priority` and `fetchpriority="high"` are **resource hints for preloading**, not CSS
- They do NOT create stacking contexts
- They do NOT apply transforms or z-index
- Image is rendered in normal document flow inside article

**Verdict:** Red herring — NOT the cause. Resource hints don't affect stacking.

---

### 🟢 **RANK 5: Mega-Menu Dropdown Position:absolute + z-50**
**File:** `src/components/layout/Layout.jsx:156–223`

```jsx
<div
  key="topics-dropdown"
  ref={topicsRef}
  className="relative"
  onMouseEnter={() => setIsTopicsOpen(true)}
  onMouseLeave={() => setIsTopicsOpen(false)}
>
  {/* button + dropdown */}
  {isTopicsOpen && (
    <div
      id="topics-mega-menu"
      role="region"
      aria-label="Topics"
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-screen max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-50"
    >
```

**Stacking Context:** YES (absolute + z-50 + transform -translate-x-1/2)

**The Problem:**
- Uses hard-coded `z-50` instead of CSS variable
- BUT: It's correctly **above header (z-30)** — this is intentional
- Parent `.relative` establishes stacking context for the dropdown

**Verdict:** By design — mega-menu should appear above header. NOT the cause.

---

### 🟢 **RANK 6: Sonner Toaster (Analytics Toast)**
**File:** `src/App.jsx:95`

```jsx
<Toaster position="top-center" richColors />
```

**Stacking Context:** YES (Sonner's internal positioning + z-index ~9999)

**The Problem:**
- Sonner renders toasts at the highest z-index
- Intentional — notifications should always be visible
- Toast only appears on user actions (error tracking, PostHog)

**Verdict:** By design — not related to hero image issue.

---

## Detailed Findings: What's Happening

### The Real Culprit: Article Motion Wrapper's overflow-hidden + Stacking Context

**NewBlogPost.jsx lines 913–948:**
```jsx
<motion.article 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="bg-white rounded-xl shadow-lg overflow-hidden">  // <-- overflow-hidden
  
  {/* Hero Image Container */}
  {post.image && (
    <div className="w-full">
      <Picture
        src={post.image}
        alt={`${post.title} - DHM Guide`}
        className="w-full aspect-video object-cover"
        width={1600}
        height={900}
        priority
        fetchpriority="high"
      />
    </div>
  )}
  
  {/* Quick Answer */}
  {post.quickAnswer && (
    <div className="max-w-3xl mx-auto mb-8 p-5 bg-blue-50 ...">
```

**Why This Is a Problem:**
1. `motion.article` with `opacity` + `y: 20` transform creates a **new stacking context**
2. `overflow: hidden` on this context clips all descendants
3. The article is positioned statically (z-index: 0) but sits between the header (z-index: 30) and the main content
4. **Browser's paint order:** Because article has a stacking context with transforms, it may be painted at a different layer than expected
5. **Result:** Hero image inside article appears behind header or mega-menu dropdown instead of below it

**Specific Scenario:**
- User navigates to blog post
- Article animates in with `y: 20 → 0`
- During animation, the overflow-hidden clip may inadvertently hide the hero image or push it behind the header visually
- Comparison widget (z-35) or mega-menu (z-50) may overlap without proper stacking order

---

## Comparison Widget Design Intent (Intentional, But Unusual)

**App.css line 100:**
```css
--z-index-comparison: 35;   /* Comparison widget (above header) */
```

This design decision means:
- Comparison widget (z-35) is **intentionally above header (z-30)**
- This is unusual for sticky navigation patterns
- Likely intent: Keep comparison widget always visible during product review flow
- **Risk:** Covers content, especially on mobile where widget is full-width draggable sheet

---

## Recommendations

1. **CRITICAL:** Remove or conditionally apply `overflow: hidden` from `motion.article` in NewBlogPost.jsx
   - Replace with `overflow-y: auto overflow-x: hidden` on inner content div instead
   - Or move overflow clipping to a child container, not the motion wrapper

2. **HIGH:** Unify z-index hard-codes to CSS variables
   - Replace `z-50` in mega-menu dropdown with Tailwind class (no CSS variable exists for 50, add one)
   - Replace `z-50` in StickyMobileCTA with `z-notification` (65) or create `z-sticky-bar` (40)

3. **MEDIUM:** Review comparison widget z-index intent
   - If it's meant to always show above header, document this
   - If it should sit below header, change z-comparison from 35 to 25

4. **LOW:** Test Sonner toast z-index compatibility
   - Ensure toasts can render above all page elements (currently works due to ~9999)

---

## File Summary Table

| File | Lines | Component | Position | Z-Index | Transform | Stacking Context | Issue |
|------|-------|-----------|----------|---------|-----------|------------------|-------|
| Layout.jsx | 87 | header | fixed | 30 | motion opacity | YES | Parent of nav |
| Layout.jsx | 156 | mega-menu | absolute | 50 (hard-coded) | translate-x | YES | Above header ✓ |
| Layout.jsx | 295 | mobile nav | relative | 0 | motion opacity | YES | Child of header |
| NewBlogPost.jsx | 719 | progress bar | fixed | 20 | none | YES | Below header ✓ |
| NewBlogPost.jsx | 832 | TOC sticky | sticky | 0 | none | YES | Sidebar only |
| NewBlogPost.jsx | 913 | **article** | static | 0 | **motion y-transform** | **YES** | **overflow:hidden clips hero** |
| NewBlogPost.jsx | 919 | **hero image** | static | 0 | none | NO | **Inside article's context** |
| ComparisonWidget.jsx | 55 | widget | fixed | 35 | motion y-transform | YES | Above header (intended) |
| MobileComparisonWidget.jsx | 51 | widget | fixed | 35 | motion drag + y-transform | YES | Above header (intended) |
| StickyMobileCTA.jsx | 71 | CTA bar | fixed | **50 (hard-coded)** | inline transform | YES | Mobile-only |
| App.jsx | 95 | Toaster | (Sonner) | ~9999 | (Sonner) | YES | Highest, intended |

---

## Conclusion

**Most Likely Cause of "Page Assets Above Menu" Bug:**
1. **Primary:** `motion.article` with `overflow: hidden` creating an unexpected stacking context that clips or mispositions the hero image
2. **Secondary:** Comparison widget's intentional z-35 position (above header) covering content unexpectedly
3. **Tertiary:** Hard-coded z-50 values not aligned with CSS variable scale

**Next Steps:**
1. Remove `overflow: hidden` from motion.article wrapper
2. Test hero image visibility across viewport sizes and devices
3. Verify comparison widget doesn't overlay hero on mobile/tablet
4. Harmonize all hard-coded z-index values with CSS scale
