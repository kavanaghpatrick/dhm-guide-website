# Product Requirements Document: Dynamic Header Height Solution

## 1. Problem Statement

### Current State
The application uses a fixed `pt-20` (80px) padding on the main content area to accommodate the fixed header. This approach has several issues:
- Assumes header height is always exactly 80px
- Breaks when header content wraps or font sizes change
- Doesn't account for dynamic header content
- Creates layout shift when header height changes
- No responsive adjustments for different screen sizes

### Impact
- **Content Obstruction**: When header grows, it covers page content
- **Layout Gaps**: When header shrinks, unnecessary white space appears
- **Responsive Issues**: Different header heights on various devices aren't accommodated
- **Accessibility**: Font size adjustments can break the layout
- **Maintenance**: Magic numbers make code harder to maintain

## 2. Objectives

- Dynamically calculate and apply correct content offset based on actual header height
- Eliminate hardcoded padding values
- Support variable header heights across devices and states
- Maintain smooth scrolling and animations
- Ensure zero layout shift during page load

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Dynamic Height Measurement
- The system MUST measure actual header height on mount
- The system MUST detect header height changes in real-time
- The system MUST account for all header states (expanded/collapsed)

#### FR2: Content Offset Application
- Main content MUST automatically adjust padding/margin based on header height
- The offset MUST update smoothly without layout jumps
- The system MUST work with both padding and margin approaches

#### FR3: Responsive Behavior
- Solution MUST work across all viewport sizes
- MUST handle orientation changes on mobile devices
- MUST account for browser chrome changes (URL bar hiding/showing)

#### FR4: Performance Optimization
- Height calculations MUST be debounced/throttled
- MUST use ResizeObserver API for efficiency
- MUST minimize reflows and repaints

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- Initial measurement MUST complete within 50ms
- Height updates MUST not cause jank (maintain 60fps)
- Solution MUST not increase Time to Interactive

#### NFR2: Browser Support
- MUST work in all modern browsers
- MUST have fallback for browsers without ResizeObserver
- MUST handle Safari's bouncy scrolling

#### NFR3: Developer Experience
- Solution MUST be reusable across different layouts
- MUST provide TypeScript types if applicable
- MUST include clear documentation

## 4. Technical Specification

### 4.1 Custom Hook Implementation

```jsx
// hooks/useHeaderHeight.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const updateHeaderHeight = useCallback(() => {
    if (headerRef.current) {
      const height = headerRef.current.getBoundingClientRect().height;
      setHeaderHeight(height);
    }
  }, []);

  useEffect(() => {
    // Initial measurement
    updateHeaderHeight();

    // Set up ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === headerRef.current) {
            updateHeaderHeight();
          }
        }
      });

      if (headerRef.current) {
        resizeObserverRef.current.observe(headerRef.current);
      }
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', updateHeaderHeight);
      window.addEventListener('orientationchange', updateHeaderHeight);
    }

    // Cleanup
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', updateHeaderHeight);
        window.removeEventListener('orientationchange', updateHeaderHeight);
      }
    };
  }, [updateHeaderHeight]);

  return { headerRef, headerHeight };
};
```

### 4.2 Layout Component Updates

```jsx
// components/layout/Layout.jsx
import { useHeaderHeight } from '@/hooks/useHeaderHeight';

function Layout({ children }) {
  const { headerRef, headerHeight } = useHeaderHeight();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-header bg-white/95 backdrop-blur-sm border-b border-gray-200"
      >
        {/* Header content */}
      </header>
      
      <main 
        className="flex-1 bg-gray-50"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        {children}
      </main>
      
      {/* Footer */}
    </div>
  );
}
```

### 4.3 CSS Variable Approach (Alternative)

```css
/* index.css */
:root {
  --header-height: 0px;
}

.main-content {
  padding-top: var(--header-height);
  transition: padding-top 0.3s ease;
}
```

```jsx
// In useHeaderHeight hook
useEffect(() => {
  if (headerHeight) {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }
}, [headerHeight]);
```

### 4.4 Server-Side Rendering Considerations

```jsx
// For SSR compatibility
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Use in hook
useIsomorphicLayoutEffect(() => {
  updateHeaderHeight();
}, []);
```

### 4.5 Smooth Scroll Offset

```jsx
// utils/smoothScroll.js
export const scrollToElement = (elementId, headerHeight) => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};
```

## 5. Testing Requirements

### 5.1 Unit Tests
- Test hook returns correct height values
- Test cleanup functions are called
- Test fallback for browsers without ResizeObserver

### 5.2 Integration Tests
- Header height updates when content changes
- Main content offset adjusts accordingly
- No layout shift on page load
- Responsive breakpoints work correctly

### 5.3 Performance Tests
- Measure FPS during header resize
- Check for layout thrashing
- Verify minimal repaints

### 5.4 Cross-Browser Tests
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Android)
- Test with/without ResizeObserver support

## 6. Migration Plan

### Phase 1: Hook Development
1. Create useHeaderHeight hook
2. Add comprehensive tests
3. Document usage patterns

### Phase 2: Layout Integration
1. Update Layout component
2. Remove hardcoded pt-20 classes
3. Test all pages for regressions

### Phase 3: Additional Components
1. Update any other fixed elements
2. Ensure smooth scroll functions account for dynamic height
3. Update navigation/anchor link behavior

## 7. Success Metrics

- Zero instances of content hidden behind header
- Header height changes handled within 16ms (60fps)
- No CLS (Cumulative Layout Shift) impact
- Works on 100% of supported browsers
- Reduces header-related bug reports by 90%

## 8. Alternative Approaches Considered

### 8.1 CSS-Only Solution
- Pros: No JavaScript, better performance
- Cons: Limited browser support, can't handle all edge cases
- Decision: Not viable for complex header scenarios

### 8.2 Fixed Height with Breakpoints
- Pros: Simple, predictable
- Cons: Still brittle, doesn't handle edge cases
- Decision: Doesn't solve core problem

### 8.3 Intersection Observer
- Pros: Good performance, native API
- Cons: Not designed for this use case
- Decision: ResizeObserver is more appropriate

## 9. Rollback Strategy

1. Keep CSS class backup (pt-20) commented in code
2. Feature flag to toggle between solutions
3. Monitor error rates for 24 hours post-deployment
4. Quick revert process documented

## 10. Future Enhancements

- Support for multiple fixed elements (header + announcement bar)
- Animated header height transitions
- Save height to sessionStorage for faster subsequent loads
- Predictive height calculation based on viewport
- Support for collapsible header sections

## 11. Documentation Requirements

- README section explaining the dynamic header system
- Code comments in the hook
- Storybook story demonstrating various header heights
- Migration guide for developers