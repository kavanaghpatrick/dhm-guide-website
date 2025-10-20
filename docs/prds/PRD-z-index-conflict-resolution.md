# Product Requirements Document: Z-Index Conflict Resolution

## 1. Problem Statement

### Current State
Multiple components in the application use the same z-index value (50), causing stacking context conflicts:
- Main header in `Layout.jsx` uses `z-50` (z-index: 50)
- ComparisonWidget uses `z-50` (z-index: 50)
- This creates unpredictable layering where components may appear above or below each other inconsistently

### Impact
- **User Experience**: UI elements overlap incorrectly, blocking interaction
- **Visual Bugs**: Components appear in wrong order, creating professional appearance issues
- **Interaction Problems**: Users may be unable to click elements hidden behind others
- **Cross-browser Issues**: Different browsers may resolve z-index conflicts differently

## 2. Objectives

- Establish a clear z-index hierarchy system
- Eliminate all z-index conflicts
- Ensure predictable and consistent layering across all browsers
- Create a maintainable system for future z-index management
- Document the z-index scale for team reference

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Z-Index Scale Definition
- The system MUST define a standardized z-index scale with named levels
- Each level MUST have a specific purpose and value range
- The scale MUST accommodate current and future UI patterns

#### FR2: Component Layer Assignment
- Each component MUST be assigned to an appropriate layer
- Fixed/sticky elements MUST have higher z-index than scrollable content
- Modal/overlay elements MUST have highest z-index values
- The ComparisonWidget MUST appear above the header

#### FR3: CSS Variable System
- Z-index values MUST be defined as CSS custom properties
- Components MUST reference variables instead of hardcoded values
- The system MUST support theme-specific z-index if needed

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- Z-index changes MUST NOT trigger layout recalculation
- The solution MUST NOT increase CSS file size significantly (<1KB)

#### NFR2: Maintainability
- New developers MUST easily understand the z-index hierarchy
- The system MUST be documented in code comments
- Z-index values MUST be centrally managed

#### NFR3: Compatibility
- Solution MUST work in all modern browsers
- MUST handle stacking contexts created by transforms, opacity, etc.
- MUST account for Tailwind's z-index utility classes

## 4. Technical Specification

### 4.1 Proposed Z-Index Scale

```css
:root {
  /* Base layers */
  --z-index-base: 0;          /* Normal document flow */
  --z-index-behind: -1;       /* Elements behind normal flow */
  
  /* Interactive layers */
  --z-index-dropdown: 10;     /* Dropdowns, tooltips */
  --z-index-sticky: 20;       /* Sticky elements */
  --z-index-fixed: 30;        /* Fixed navigation, headers */
  
  /* Overlay layers */
  --z-index-overlay: 40;      /* Page overlays, drawers */
  --z-index-modal: 50;        /* Modal dialogs */
  --z-index-popover: 60;      /* Popovers, floating UI */
  --z-index-tooltip: 70;      /* Tooltips (highest) */
  
  /* Special components */
  --z-index-header: 30;       /* Main navigation header */
  --z-index-comparison: 35;   /* Comparison widget (above header) */
  --z-index-notification: 65; /* Toast notifications */
}
```

### 4.2 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      zIndex: {
        'behind': '-1',
        'base': '0',
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'header': '30',
        'comparison': '35',
        'overlay': '40',
        'modal': '50',
        'popover': '60',
        'notification': '65',
        'tooltip': '70',
      }
    }
  }
}
```

### 4.3 Component Updates

#### Layout.jsx
```jsx
// Change from:
<header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">

// To:
<header className="fixed top-0 left-0 right-0 z-header bg-white/95 backdrop-blur-sm border-b border-gray-200">
```

#### ComparisonWidget.jsx
```jsx
// Change from:
<div className="fixed bottom-8 right-8 z-50">

// To:
<div className="fixed bottom-8 right-8 z-comparison">
```

### 4.4 Documentation

Create a `z-index-guide.md` file documenting:
- The complete z-index scale
- Usage guidelines for each level
- Examples of components at each level
- How to add new z-index values

## 5. Migration Strategy

### 5.1 Phase 1: Audit (Day 1)
- Identify all z-index usage in the codebase
- Document current stacking contexts
- Create comprehensive list of components using z-index

### 5.2 Phase 2: Implementation (Day 2-3)
1. Add CSS variables to index.css
2. Update Tailwind configuration
3. Update all components to use new classes
4. Test each component for regressions

### 5.3 Phase 3: Validation (Day 4)
- Cross-browser testing
- Visual regression testing
- Performance verification

## 6. Testing Requirements

### 6.1 Unit Tests
- Verify CSS variables are defined
- Check Tailwind classes generate correct values

### 6.2 Integration Tests
- Header appears below ComparisonWidget
- Modals appear above all content
- Dropdowns appear above page content but below modals

### 6.3 Visual Tests
- Screenshot comparisons before/after
- Test all component combinations
- Verify no visual regressions

### 6.4 Manual Tests
- Click interactions work correctly
- Tab navigation respects visual order
- Mobile interactions function properly

## 7. Success Metrics

- Zero z-index conflicts reported
- 100% of components using variable-based z-index
- No increase in CSS bundle size > 1KB
- Documentation completed and reviewed
- All visual regression tests passing

## 8. Rollback Plan

1. Keep backup of all modified files
2. Use feature flag to toggle between old/new system
3. Monitor for user-reported issues for 48 hours
4. Have hotfix process ready for critical issues

## 9. Future Considerations

- Consider implementing a z-index linting rule
- Add z-index visualization tool for development
- Create automated tests for z-index conflicts
- Plan for dark mode z-index variations if needed

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|---------|------------|
| Third-party component conflicts | Medium | Audit all UI library components for z-index usage |
| Browser-specific issues | Low | Test in all major browsers before deployment |
| Performance regression | Low | Profile before/after implementation |
| Missing edge cases | Medium | Comprehensive component audit and testing |