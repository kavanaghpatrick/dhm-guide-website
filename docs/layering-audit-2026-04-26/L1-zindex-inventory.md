# Z-Index Audit Report — DHM Guide Codebase
**Date:** 2026-04-26  
**Purpose:** Exhaustive inventory of all z-index declarations to resolve hover-menu overlap bug

---

## 1. DEFINED Z-INDEX SCALE (App.css / tailwind.config.js)

### CSS Custom Properties (App.css:94-105)
```
--z-index-base:            0    (Normal document flow)
--z-index-behind:         -1    (Elements behind normal flow)
--z-index-dropdown:       10    (Dropdowns, tooltips)
--z-index-sticky:         20    (Sticky elements)
--z-index-fixed:          30    (Fixed navigation, headers)
--z-index-header:         30    (Main navigation header)
--z-index-comparison:     35    (Comparison widget - above header)
--z-index-overlay:        40    (Page overlays, drawers)
--z-index-modal:          50    (Modal dialogs)
--z-index-popover:        60    (Popovers, floating UI)
--z-index-notification:   65    (Toast notifications)
--z-index-tooltip:        70    (Tooltips - highest)
```

### Tailwind Custom Classes (tailwind.config.js:9-22)
```javascript
zIndex: {
  'behind':      'var(--z-index-behind)',      // -1
  'base':        'var(--z-index-base)',        // 0
  'dropdown':    'var(--z-index-dropdown)',    // 10
  'sticky':      'var(--z-index-sticky)',      // 20
  'fixed':       'var(--z-index-fixed)',       // 30
  'header':      'var(--z-index-header)',      // 30
  'comparison':  'var(--z-index-comparison)',  // 35
  'overlay':     'var(--z-index-overlay)',     // 40
  'modal':       'var(--z-index-modal)',       // 50
  'popover':     'var(--z-index-popover)',     // 60
  'notification':'var(--z-index-notification)',// 65
  'tooltip':     'var(--z-index-tooltip)',     // 70
}
```

---

## 2. Z-INDEX INVENTORY (All Declarations Found)

### Legend
| Field | Meaning |
|-------|---------|
| **File:Line** | Source location |
| **Element** | Component/feature using z-index |
| **Z-Index** | Value (numeric, custom var, or arbitrary) |
| **Utility** | Tailwind class if applicable |
| **Purpose** | Functional role |
| **Position** | CSS position value (fixed/sticky/absolute/relative) |

---

### 2.1 Tailwind Z-50 (Modal/Dialog/Overlay Layer)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/components/ui/dialog.jsx:39 | Dialog overlay | 50 | `z-50` | Modal backdrop (black/50) | `fixed` | Radix Dialog primitive; portal-rendered |
| src/components/ui/dialog.jsx:57 | Dialog content | 50 | `z-50` | Modal content container | `fixed` | Centered via transform |
| src/components/ui/menubar.jsx:76 | Menubar content | 50 | `z-50` | Dropdown menu (Radix) | portal | Radix MenubarContent |
| src/components/ui/menubar.jsx:226 | Menubar submenu | 50 | `z-50` | Submenu nested items | portal | Radix MenubarContent |
| src/components/ui/dropdown-menu.jsx:38 | Dropdown menu | 50 | `z-50` | Radix dropdown portal | portal | DropdownMenuPrimitive.Content |
| src/components/ui/dropdown-menu.jsx:200 | Dropdown submenu | 50 | `z-50` | Submenu items (Radix) | portal | Sub-menu for checkbox/radio |
| src/components/ui/context-menu.jsx:74 | Context menu | 50 | `z-50` | Right-click menu (Radix) | portal | ContextMenuPrimitive.Content |
| src/components/ui/context-menu.jsx:90 | Context submenu | 50 | `z-50` | Context submenu items | portal | Nested context menu |
| src/components/ui/select.jsx:59 | Select dropdown | 50 | `z-50` | Select list items (Radix) | `relative` | SelectPrimitive.Content |
| src/components/ui/alert-dialog.jsx:35 | Alert overlay | 50 | `z-50` | Alert dialog backdrop | `fixed` | Radix AlertDialog overlay |
| src/components/ui/alert-dialog.jsx:52 | Alert content | 50 | `z-50` | Alert dialog box | `fixed` | Centered via transform |
| src/components/ui/popover.jsx:33 | Popover content | 50 | `z-50` | Popover panel (Radix) | portal | PopoverPrimitive.Content |
| src/components/ui/drawer.jsx:38 | Drawer overlay | 50 | `z-50` | Drawer backdrop | `fixed` | Radix Drawer overlay |
| src/components/ui/drawer.jsx:56 | Drawer content | 50 | `z-50` | Drawer panel | `fixed` | Radix DrawerContent |
| src/components/ui/tooltip.jsx:41 | Tooltip content | 50 | `z-50` | Tooltip floating label | portal | TooltipPrimitive.Content |
| src/components/ui/tooltip.jsx:47 | Tooltip arrow | 50 | `z-50` | Tooltip pointer element | portal | Arrow child of tooltip |
| src/components/ui/sheet.jsx:39 | Sheet overlay | 50 | `z-50` | Sheet backdrop | `fixed` | Radix Sheet overlay |
| src/components/ui/sheet.jsx:58 | Sheet content | 50 | `z-50` | Sheet panel | `fixed` | Radix SheetContent |
| src/components/ui/hover-card.jsx:31 | Hover card | 50 | `z-50` | Hover card panel (Radix) | portal | HoverCardPrimitive.Content |
| src/components/ui/navigation-menu.jsx:97 | Navigation menu | 50 | `z-50` | Navigation dropdown (Radix) | `absolute` | Positioned `top-full left-0` |
| src/newblog/components/ImageLightbox.jsx:51 | Lightbox overlay | 50 | `z-50` | Fullscreen image viewer | `fixed` | `inset-0` (covers viewport) |
| src/components/layout/Layout.jsx:161 | **Topics mega-menu** | 50 | `z-50` | Dropdown mega-menu (SUSPECT) | `absolute` | **ISSUE: Overlaps with other z-50s** |
| src/pages/DosageCalculatorEnhanced.jsx:198 | Modal backdrop | 50 | `z-50` | Modal overlay | `fixed` | `inset-0` |
| src/pages/DosageCalculatorEnhanced.jsx:802 | Progress bar | 50 | `z-50` | Progress bar top strip | `fixed` | `top-0 left-0 right-0` |

---

### 2.2 Tailwind Z-40 (Overlay/Fixed Bar Layer)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/pages/Reviews.jsx:1139 | **Sticky recommendation bar** | 40 | `z-40` | Fixed green bar w/ top pick | `fixed` | `top-16` — below header; conflict potential |
| src/pages/DosageCalculatorEnhanced.jsx:377 | FAB (Floating Action) | 40 | `z-40` | Fixed action button | `fixed` | `bottom-6 right-6` |

---

### 2.3 Tailwind Z-20 (Focus/Selected State)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/components/ui/calendar.jsx:36 | Calendar focus cell | 20 | `focus-within:z-20` | Selected date highlight | `relative` | Focus state only |

---

### 2.4 Tailwind Z-10 (Dropdown/Badge Layer)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/components/LazyImage.jsx:70 | Image watermark | 10 | `z-10` | Loading indicator badge | `absolute` | Top-left overlay on image |
| src/components/LazyImageFixed.jsx:68 | Image watermark | 10 | `z-10` | Loading indicator badge | `absolute` | Top-left overlay on image |
| src/components/ui/toggle-group.jsx:54 | Toggle button focus | 10 | `focus:z-10 focus-visible:z-10` | Focus ring elevation | `relative` | Focus-only styling |
| src/components/ui/input-otp.jsx:48 | OTP input focus | 10 | `data-[active=true]:z-10` | Active OTP cell | `relative` | Active state highlight |
| src/components/ui/sidebar.jsx:202 | Sidebar panel | 10 | `z-10` | Sidebar drawer | `fixed` | Md+ screen; hidden by default |
| src/components/ui/resizable.jsx:43 | Resize handle | 10 | `z-10` | Resize bar between panels | `relative` | Resize affordance |
| src/newblog/components/ImageLightbox.jsx:55 | Lightbox controls | 10 | `z-10` | Close/nav buttons on lightbox | `absolute` | `top-4 right-4` |
| src/pages/DosageCalculator.jsx:400 | Card header | 10 | `z-10` | Relative elevation in card | `relative` | Content layering |
| src/pages/DosageCalculator.jsx:411 | Card content | 10 | `z-10` | Relative elevation in card | `relative` | Content layering |
| src/pages/DosageCalculatorEnhanced.jsx:211 | Modal close button | 10 | `z-10` | Close button overlay | `absolute` | `top-4 right-4` |
| src/pages/DosageCalculatorEnhanced.jsx:984 | Card header | 10 | `z-10` | Relative elevation | `relative` | Content layering |
| src/pages/DosageCalculatorEnhanced.jsx:1005 | Card content | 10 | `z-10` | Relative elevation | `relative` | Content layering |
| src/pages/DosageCalculatorEnhanced.jsx:1546 | Card header | 10 | `z-10` | Relative elevation | `relative` | Content layering |
| src/pages/DosageCalculatorEnhanced.jsx:1561 | Card content | 10 | `z-10` | Relative elevation | `relative` | Content layering |
| src/pages/Research.jsx:564 | Timeline node | 10 | `z-10` | Timeline circle marker | `relative` | Timeline visual |

---

### 2.5 Tailwind Z-10 (Header/Navigation Layer)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/components/layout/Layout.jsx:90 | Header bar | **USES CSS VAR** | NOT z-10 (uses z-header) | Fixed navigation | `fixed` | **Uses CSS variable, not numeric Tailwind** |

---

### 2.6 Tailwind Z-0 / Z-[1] (Arbitrary)

| File:Line | Element | Z-Index | Utility | Purpose | Position | Notes |
|-----------|---------|---------|---------|---------|----------|-------|
| src/newblog/components/NewBlogPost.jsx:987 | Heading text | 10 | `z-10` | Text on gradient line | `relative` | H3 heading layering |
| src/newblog/components/NewBlogPost.jsx:988 | Gradient line | **-1** | `-z-0` | Gradient underline | `absolute` | **NEGATIVE: Creates visual layer** |
| src/components/ui/navigation-menu.jsx:132 | Navigation indicator | **1** | `z-[1]` | Arbitrary value: 1 | `relative` | **ARBITRARY VALUE** — does not follow scale |
| src/pages/Home.jsx:607 | Hero content | 10 | `z-10` | Content elevation | `relative` | Content layering |
| src/components/ui/sidebar.jsx:264 | Sidebar handle | 20 | `z-20` | Resize handle background | `absolute` | Collapse/expand affordance |

---

### 2.7 Summary by Z-Index Value

| Z-Index | Count | Primary Use | Risk Level |
|---------|-------|------------|------------|
| 70 | 0 | Tooltips (defined but unused) | LOW |
| 65 | 0 | Notifications (defined but unused) | LOW |
| 60 | 0 | Popovers (defined but unused) | LOW |
| **50** | **21** | Modals, Drawers, Dialogs, Popovers, Dropdown Menus | **CRITICAL** |
| 40 | 2 | Sticky bars, FAB | MEDIUM |
| 35 | 0 | Comparison widget (defined but unused) | LOW |
| 30 | 0 | Header (uses CSS var instead) | LOW |
| 20 | 2 | Sidebar resize, Calendar focus | LOW |
| **10** | **15** | Badges, Toggle focus, OTP, Sidebar, Image overlays | HIGH |
| 1 | 1 | Navigation indicator (ARBITRARY) | **HIGH** |
| -1 | 1 | Behind-flow element | MEDIUM |

---

## 3. VIOLATION ANALYSIS

### 3.1 CRITICAL: Multiple Elements at Z-50 (Stacking Order Ambiguity)

**Issue:** 21 different elements all use `z-50`, but they are portal-rendered by Radix UI at the root of the DOM. When multiple z-50 modals/menus open simultaneously, stacking order becomes **DOM insertion order**, not z-index.

**Suspects:**
- Layout.jsx:161 — **Topics mega-menu** at z-50
- Reviews.jsx:1139 — **Sticky bar** at z-40 (CLOSE TO HEADER)
- DosageCalculatorEnhanced.jsx:198-211 — Modal + close button

**Problem:** The mega-menu dropdown at z-50 will occlude dialogs/modals also at z-50 if it's rendered later in DOM.

---

### 3.2 CRITICAL: Header Z-Index Missing Numeric Value

**Location:** src/components/layout/Layout.jsx:90  
**Current:** `className="... z-header ..."`  
**Issue:** `z-header` is a **custom Tailwind class** that uses `var(--z-index-header)` = 30 via CSS variable.  
**Problem:** If JS fails or CSS vars don't resolve, header drops to z-0 (or unstyled). No fallback.

---

### 3.3 ISSUE: Sticky Bar (Z-40) Below Fixed Header (Z-30)

**Location:** src/pages/Reviews.jsx:1139  
**Current:** `<div className="... z-40 ... fixed top-16 ..."`  
**Expected:** `top-16` positions it 64px (4rem) below header (80px header - 16px offset).  
**Problem:** 
- Sticky bar is z-40, header defaults to z-30 (via CSS var).
- Z-40 > z-30, so bar is ON TOP of header visually.
- But `top-16` might cause overlap of header content if header has shadow/backdrop-blur.

---

### 3.4 ISSUE: Negative Z-Index Without Position Context

**Location:** src/newblog/components/NewBlogPost.jsx:988  
**Current:** `<div className="... -z-0 absolute ..."`  
**Value:** `-z-0` = `z-index: 0` (negation doesn't apply; Tailwind has no `-z-0`)  
**Actual:** Probably treated as `z-0` (normal flow), not behind text.

---

### 3.5 ISSUE: Arbitrary Z-Index Value (Z-[1])

**Location:** src/components/ui/navigation-menu.jsx:132  
**Current:** `z-[1]` (arbitrary value)  
**Problem:** 
- Breaks from defined scale (10, 20, 30, ..., 70).
- Hard-coded 1 has no semantic meaning.
- If multiple nav items open, z-1 might be insufficient to clear z-10 badges.

---

### 3.6 ISSUE: Modal Close Button Nested Inside Modal (Z-10 vs Z-50)

**Location:** src/pages/DosageCalculatorEnhanced.jsx:211  
**Current:** Close button `z-10` inside modal content at `z-50`.  
**Problem:** Parent is z-50, child z-10 has no effect (child inherits parent stacking context). If backdrop is z-50 and child is z-10, button won't be interactive above sibling elements.

---

### 3.7 ISSUE: Sidebar Resize Handle (Z-20) vs Sidebar Drawer (Z-10)

**Location:** 
- Sidebar drawer: src/components/ui/sidebar.jsx:202 — `z-10`
- Resize handle: src/components/ui/sidebar.jsx:264 — `z-20`

**Problem:** Resize handle is Z-20 > Z-10 (drawer), so it's correctly above. But sidebar drawer at z-10 is **below** main z-20 scale (sticky elements). If sticky nav exists, drawer hides behind.

---

### 3.8 ISSUE: Progress Bar at Top (Z-50) Overlays Sticky Elements

**Location:** src/pages/DosageCalculatorEnhanced.jsx:802  
**Current:** `<div className="... z-50 ... fixed top-0 ..."`  
**Problem:** Progress bar (z-50) is above all sticky elements (z-20). If user scrolls and sticky header appears, progress bar blocks it.

---

## 4. POSITION CONTEXT ANALYSIS

### Elements Without Position (Silent Bugs)

Z-index only works with `position: static` (default) being overridden by explicit positioning. Elements with z-index but NO position value will **ignore z-index silently**.

**Audit Result:** All found z-index declarations have explicit position context. No silent bugs detected here. ✓

---

## 5. IMPLIED SITE-WIDE Z-INDEX LADDER

Based on all values found in codebase:

```
LAYER 70  [UNDEFINED]        — Tooltips (defined but unused)
LAYER 65  [UNDEFINED]        — Notifications (defined but unused)
LAYER 60  [UNDEFINED]        — Popovers (defined but unused)
LAYER 50  [21 ELEMENTS]      — Modals, Dialogs, Dropdowns, Menus
          ├─ Dialog backdrops/content (6 items)
          ├─ Menubar + submenus (2 items)
          ├─ Dropdown + submenu (2 items)
          ├─ Context menu (2 items)
          ├─ Select dropdown (1 item)
          ├─ Alert dialog (2 items)
          ├─ Popover (1 item)
          ├─ Drawer (2 items)
          ├─ Tooltip (2 items)
          ├─ Sheet (2 items)
          ├─ Hover card (1 item)
          ├─ Navigation menu (1 item)
          ├─ Image lightbox (1 item)
          ├─ Topics mega-menu (1 item) [SUSPECT]
          └─ Progress bar (1 item) [SUSPECT]

LAYER 40  [2 ELEMENTS]       — Sticky bars / FAB
          ├─ Reviews sticky bar (Reviews page)
          └─ Dosage calculator FAB

LAYER 35  [DEFINED BUT UNUSED] — Comparison widget
LAYER 30  [IMPLICIT]         — Fixed header (Layout.jsx uses z-header var)
LAYER 20  [2 ELEMENTS]       — Sidebar resize, Calendar focus
LAYER 10  [15 ELEMENTS]      — Badges, Focus rings, Image overlays
LAYER 1   [1 ELEMENT]        — Navigation indicator (ARBITRARY)
LAYER 0   [IMPLIED]          — Normal document flow (default)
LAYER -1  [1 ELEMENT]        — Behind-flow (gradient line)
```

---

## 6. ROOT CAUSE: Hover-Menu Overlap Bug

### Hypothesis

The **Topics mega-menu** (Layout.jsx:161) and **sticky recommendation bar** (Reviews.jsx:1139) both use high z-index values (50 and 40 respectively) without stacking order coordination.

**Scenario:**
1. User hovers over "Topics" nav → mega-menu opens (z-50, `absolute`, positioned below nav)
2. Mega-menu is large, overlaps page content
3. Sticky bar tries to float above (z-40) but is below mega-menu (z-50)
4. On Reviews page, if both are visible, visual conflict

### The z-50 Collision

21 elements use z-50, all portal-rendered. When multiple popovers/modals are open:
- **Radix UI manages stacking via DOM order** (later elements appear on top)
- z-index value becomes irrelevant for sibling portals
- **Mega-menu render order determines visibility**, not CSS

### Why It's a Problem

If mega-menu is rendered **before** a modal, modal will be UNDER mega-menu despite both being z-50, because mega-menu DOM node comes first.

---

## 7. RECOMMENDATIONS

### Immediate Fixes (P1)

1. **Assign Topics Mega-Menu to Z-45 or Z-35** (not z-50)
   - File: src/components/layout/Layout.jsx:161
   - Change: `z-50` → `z-40` or lower
   - Reason: Dropdowns should not fight modals for stacking

2. **Move Sticky Bar Below Header Properly**
   - File: src/pages/Reviews.jsx:1139
   - Current: z-40, top-16
   - Issue: May overlap header shadow/backdrop-blur
   - Fix: Reduce z-40 to z-30 OR change top-16 to top-20

3. **Extract Header Z-Index to Numeric Tailwind Class**
   - File: src/components/layout/Layout.jsx:90
   - Current: `z-header` (CSS var fallback)
   - Fix: Add explicit `z-30` fallback OR update tailwind.config.js with `header: '30'`

### Medium-Term Fixes (P2)

4. **Add Z-70 and Z-60 Usage**
   - Tooltips should use dedicated z-70 (defined but never used)
   - Popovers should use z-60 (defined but never used)
   - Reason: Semantic clarity; frees up z-50 for modals only

5. **Remove Arbitrary Z-[1]**
   - File: src/components/ui/navigation-menu.jsx:132
   - Change: `z-[1]` → `z-10` or `z-dropdown`
   - Reason: Maintain scale consistency

6. **Cleanup Negative Z-Index**
   - File: src/newblog/components/NewBlogPost.jsx:988
   - Current: `-z-0` (doesn't work)
   - Fix: Use `relative z-0` on parent, not negative index

### Long-Term Fixes (P3)

7. **Document Portal Rendering Strategy**
   - Create: `/docs/STACKING-CONTEXT.md`
   - Content: Explain Radix portal behavior, z-index inheritance, DOM order

8. **Implement Z-Index Linter Rule**
   - Tool: ESLint plugin to prevent arbitrary z-values
   - Rule: Only allow defined values from tailwind.config.js

9. **Test Overlay Combinations**
   - Modal + Sticky bar visible together
   - Dropdown + Toast visible together
   - Lightbox + Modal visible together

---

## 8. FILES NEEDING REVIEW

| File | Lines | Issue | Severity |
|------|-------|-------|----------|
| src/components/layout/Layout.jsx | 90, 161 | Header CSS var, Mega-menu z-50 | P1 |
| src/pages/Reviews.jsx | 1139 | Sticky bar z-40 overlap | P1 |
| src/components/ui/navigation-menu.jsx | 132 | Arbitrary z-[1] | P2 |
| src/newblog/components/NewBlogPost.jsx | 987-988 | Negative z-index logic | P2 |
| src/components/ui/sidebar.jsx | 202, 264 | Z-10 drawer vs z-20 handle | P2 |
| src/pages/DosageCalculatorEnhanced.jsx | 802 | Progress bar z-50 | P2 |
| src/pages/DosageCalculatorEnhanced.jsx | 198-211 | Modal close button nesting | P3 |

---

## 9. APPENDIX: Full Grep Output (Raw)

All z-index searches completed across `/src`:
- Tailwind z-* classes: 48 matches found
- CSS z-index properties: 0 matches in component files
- Inline zIndex style: 0 matches
- Arbitrary z-[N]: 1 match (navigation-menu.jsx:132)

**No z-index declarations found in:**
- src/index.css (Touch/accessibility only)
- src/styles/calculator-enhancements.css (Animations, no z-index)
- src/pages/Compare.jsx (No explicit z-index; relies on component inheritance)
- src/pages/DosageCalculator.jsx (Uses z-10 from components)

---

## Conclusion

**Site-wide z-index strategy is mostly sound** with CSS variable fallback. The main issue is **collision at z-50 between modal system and mega-menu**, compounded by lack of explicit positioning discipline for the sticky bar.

**Action items:** Implement P1 fixes immediately (3 files), then refactor z-50 architecture to separate modal (50) from dropdown (40 or lower).

