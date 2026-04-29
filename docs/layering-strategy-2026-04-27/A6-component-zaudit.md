# A6 — Component Library Z-Index Audit

> Note: A6 was dispatched as Explore (read-only) so it couldn't write directly. Coordinator persisted output verbatim from agent return.

## Radix UI + shadcn-ui Components

### Dialog (`dialog.jsx`)
- Z-Index: `z-50` (lines 39, 57)
- Portal: `document.body` (Radix default)
- Stacking Context: YES — `data-[state=open]:animate-in` applies CSS transforms
- Conflicts: shares `z-50` with 19 other portaled components

### Alert Dialog (`alert-dialog.jsx`)
- Z-Index: `z-50` (lines 35, 52)
- Portal: `document.body`
- Stacking Context: YES — animation transforms via data attributes
- Conflicts: z-50 collision zone

### Drawer (`drawer.jsx`, Vaul library)
- Z-Index: `z-50` (lines 38, 56)
- Portal: `document.body` (Vaul.Portal)
- Stacking Context: YES — framer-motion internal, opacity transforms
- Conflicts: z-50 collision zone

### Sheet (`sheet.jsx`)
- Z-Index: `z-50` (lines 39, 58)
- Portal: `document.body`
- Stacking Context: YES — slide-in/slide-out animations
- Conflicts: z-50 collision zone

### Dropdown Menu (`dropdown-menu.jsx`)
- Z-Index: `z-50` (lines 38, 200)
- Portal: `document.body` (Radix)
- Stacking Context: YES — zoom-in-95/fade-in-0 animations
- Conflicts: z-50 collision zone; SubContent also z-50

### Popover (`popover.jsx`)
- Z-Index: `z-50` (line 33)
- Portal: `document.body`
- Stacking Context: YES — zoom-in-95 animation

### Tooltip (`tooltip.jsx`)
- Z-Index: `z-50` (lines 41, 47)
- Portal: `document.body` (Content + Arrow)
- Note: Arrow at z-50 is redundant (child element)

### Select (`select.jsx`)
- Z-Index: `z-50` (line 59)
- Portal: `document.body`
- Stacking Context: YES — zoom-in-95 animation

### Menubar (`menubar.jsx`)
- Z-Index: `z-50` (lines 76, 226)
- Portal: `document.body`
- Stacking Context: YES — fade-in-0, zoom-in-95 animations
- SubContent also z-50

### Context Menu (`context-menu.jsx`)
- Z-Index: `z-50` (lines 90, 74)
- Portal: `document.body`
- SubContent also z-50

### Hover Card (`hover-card.jsx`)
- Z-Index: `z-50` (line 31)
- Portal: `document.body`

### Sidebar (`sidebar.jsx`)
- Z-Index: `z-10` (line 202, desktop) / Sheet-based mobile (z-50 via SheetContent)
- Portal: N/A on desktop; `document.body` mobile via Sheet
- Stacking Context: NO desktop; YES mobile
- Rail handle at z-20 (line 264) — higher than drawer z-10; intentional

## Custom Components

### ComparisonWidget (`ComparisonWidget.jsx`)
- Z-Index: `z-comparison` (line 60) = 35
- Portal: NONE — fixed positioning at document level
- Stacking Context: YES — framer-motion AnimatePresence + motion.div with opacity, transform animations (lines 55-59, 75-76, 95-99, 129-133, 194-197)
- Animation: `initial={{ y: 100, opacity: 0 }}` — opacity creates stacking context
- Conflicts: none direct; sits below z-50

### Picture (`Picture.jsx`)
- Z-Index: none. Portal: none. Stacking Context: no.

### Navigation Menu (`navigation-menu.jsx`)
- Z-Index: `z-50` (line 97) + `z-[1]` (line 132)
- Conflict: `z-[1]` is ARBITRARY, breaks scale consistency

## External Libraries

### Sonner Toaster (`sonner.jsx` wrapper)
- Z-Index: controlled by Sonner library (not our scale) — typically 9999+
- Portal: own portal to `document.body`
- Stacking Context: YES — Sonner manages internal animations
- Wrapper (`sonner.jsx:12-20`) only passes theme; no integration with our scale
- **Issue**: Sonner z-index is NOT part of our scale; will overlay z-50 modals

### Radix UI primitives
- Default z-index: none (relies on wrapper via shadcn-ui's z-50)
- Portal target: `document.body` (consistent)
- Stacking context: animation classes inherited from shadcn-ui Tailwind

### framer-motion (in ComparisonWidget)
- Stacking context: YES — opacity/transform properties
- Z-index: relies on z-comparison(35) on parent

## Conflict Analysis Summary

### Critical: 21 elements at z-50

| Component | File | Lines |
|---|---|---|
| Dialog | dialog.jsx | 39, 57 |
| Alert Dialog | alert-dialog.jsx | 35, 52 |
| Drawer | drawer.jsx | 38, 56 |
| Sheet | sheet.jsx | 39, 58 |
| Dropdown Menu | dropdown-menu.jsx | 38, 200 |
| Popover | popover.jsx | 33 |
| Tooltip | tooltip.jsx | 41, 47 |
| Select | select.jsx | 59 |
| Menubar | menubar.jsx | 76, 226 |
| Context Menu | context-menu.jsx | 90, 74 |
| Hover Card | hover-card.jsx | 31 |

**When multiple z-50 portals are open simultaneously, stacking order depends on DOM insertion order, NOT z-index value.**

### Medium: z-10
- Sidebar drawer (z-10) sits BELOW sticky elements (z-20) — potential overlap

### Low
- Sonner at z-9999 (external) may overlay everything including z-50 modals
- ComparisonWidget at z-35 correctly below z-50 modals

## Recommendations

### Option A — Refactor to Named Z-Levels (RECOMMENDED)
Update 20 shadcn-ui component files. Replace hardcoded `z-50` with semantic classes:
- `z-dialog` (50)
- `z-dropdown` (10 — but use 50 for actual dropdown floats; rename existing token)
- `z-tooltip` (70)
- `z-popover` (60)
- `z-toast` (notification, 65)

Effort: ~21 file edits (sed-friendly, mechanical).
Benefit: semantic clarity, future rebalancing, documents intent.

### Option B — Design Around Current Limit (zero change)
Accept z-50 collision as DOM-order-resolved. Never open multiple z-50 modals simultaneously (document as constraint).
Risk: technical debt compounds; harder to debug z-order later.

### Recommendation: Option A
Low-risk refactor (class renames, no logic), enables future flexibility, improves maintainability. Sonner z-9999 needs separate fix regardless.

## Action Items

1. **P1**: add semantic z-level Tailwind classes to scale (already done in @theme block via #341 — just need to USE them)
2. **P1**: refactor 20 ui/* components to use semantic classes
3. **P2**: move Sonner z-index into our scale (custom Sonner config)
4. **P2**: fix arbitrary `z-[1]` in `navigation-menu.jsx` → `z-dropdown` (10)
5. **P3**: document portal rendering strategy and stacking-context rules

## Conclusion

Component library is architecturally sound but monolithic at z-50. Refactoring to semantic names aligns with the existing scale and enables maintainability. No functional bugs detected; stacking order is deterministic (DOM order resolves ties).
