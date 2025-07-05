# Product Requirements Document: Table of Contents Race Condition Fix

## 1. Problem Statement

### Current State
The Table of Contents (TOC) generation in blog posts relies on a fixed setTimeout delay to wait for markdown content to render into DOM elements. This approach:
- Uses a hardcoded 100ms delay to wait for markdown-to-HTML rendering
- Fails when rendering takes longer than expected (slow devices, long content)
- Results in empty or incomplete TOC for affected users
- Provides no feedback when TOC generation fails

### Impact
- **User Experience**: Users on slower devices or viewing long posts see broken/empty TOC
- **Accessibility**: Users relying on TOC for navigation cannot access content sections
- **Reliability**: Feature works inconsistently across different devices and network conditions

## 2. Objectives

- Eliminate race condition in TOC generation
- Ensure TOC generates reliably regardless of rendering time
- Maintain performance for fast-rendering scenarios
- Provide graceful degradation if generation fails

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Deterministic TOC Generation
- The system MUST detect when markdown content has finished rendering
- The system MUST NOT rely on fixed time delays
- The system MUST generate TOC only after all headings are in the DOM

#### FR2: Robust Detection Mechanism
- The system MUST use MutationObserver or similar API to detect DOM changes
- The system MUST identify when all expected headings are rendered
- The system MUST have a maximum wait timeout as a safety mechanism

#### FR3: Error Handling
- The system MUST gracefully handle cases where no headings are found
- The system MUST provide user feedback if TOC generation fails
- The system MUST not block page rendering if TOC fails

#### FR4: Performance Optimization
- The system MUST stop observing once TOC is generated
- The system MUST clean up observers on component unmount
- The system MUST not impact initial page render time

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- TOC generation MUST complete within 2 seconds of content render
- Observer setup MUST take less than 10ms
- No memory leaks from observer references

#### NFR2: Browser Compatibility
- Solution MUST work in all modern browsers (Chrome, Firefox, Safari, Edge)
- Solution MUST work on mobile browsers
- Solution MUST gracefully degrade in older browsers

#### NFR3: Reliability
- TOC MUST generate successfully 99.9% of the time
- Solution MUST handle edge cases (no headings, malformed content)
- Solution MUST work with dynamic content updates

## 4. Technical Specification

### 4.1 Implementation Location
- Primary changes in: `src/newblog/components/NewBlogPost.jsx`
- Potential utility extraction to: `src/newblog/utils/tocGenerator.js`

### 4.2 Proposed Solution

```javascript
// In NewBlogPost.jsx or new utility file
function useTOCGeneration(contentRef, markdownContent) {
  const [toc, setToc] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (!contentRef.current || !markdownContent) return;

    let observer;
    let timeoutId;
    const maxWaitTime = 2000; // 2 second maximum wait

    const generateTOC = () => {
      const headings = contentRef.current.querySelectorAll('h2, h3, h4');
      
      if (headings.length > 0) {
        const tocItems = Array.from(headings).map((heading) => ({
          id: heading.id || generateHeadingId(heading.textContent),
          text: heading.textContent,
          level: parseInt(heading.tagName[1])
        }));
        
        setToc(tocItems);
        setIsGenerating(false);
        
        // Clean up observer
        if (observer) {
          observer.disconnect();
        }
        clearTimeout(timeoutId);
      }
    };

    // Set up MutationObserver
    observer = new MutationObserver((mutations) => {
      // Check if any mutations added heading elements
      const hasNewHeadings = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeName && /^H[234]$/.test(node.nodeName)
        )
      );

      if (hasNewHeadings) {
        generateTOC();
      }
    });

    // Start observing
    observer.observe(contentRef.current, {
      childList: true,
      subtree: true
    });

    // Initial check (in case content is already rendered)
    generateTOC();

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (isGenerating) {
        console.warn('TOC generation timed out');
        setIsGenerating(false);
        observer.disconnect();
      }
    }, maxWaitTime);

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(timeoutId);
    };
  }, [contentRef, markdownContent]);

  return { toc, isGenerating };
}
```

### 4.3 Alternative Approaches Considered

1. **Polling Approach**: Check for headings every 50ms
   - Pros: Simple implementation
   - Cons: Inefficient, wastes CPU cycles

2. **Markdown Parser Integration**: Generate TOC during markdown parsing
   - Pros: No DOM dependency, deterministic
   - Cons: Requires markdown parser changes, doesn't account for dynamic content

3. **React Ref Callbacks**: Use ref callbacks on each heading
   - Pros: React-idiomatic
   - Cons: Requires markdown renderer customization

## 5. Testing Requirements

### 5.1 Unit Tests
- Test TOC generation with immediate content
- Test TOC generation with delayed content
- Test timeout behavior
- Test cleanup on unmount
- Test with no headings
- Test with malformed heading structure

### 5.2 Integration Tests
- Test with various markdown content sizes
- Test on simulated slow devices
- Test with dynamic content updates
- Test navigation via TOC links

### 5.3 Performance Tests
- Measure generation time across device types
- Verify no memory leaks
- Test with extremely long content (1000+ headings)

### 5.4 Browser Tests
- Test on Chrome, Firefox, Safari, Edge
- Test on iOS Safari, Chrome Android
- Test on older browser versions

## 6. Success Metrics

- TOC generation success rate > 99.9%
- Zero race condition failures in production
- TOC generation time < 500ms for 95th percentile
- No increase in memory usage
- User complaints about TOC reduced to zero

## 7. Rollout Plan

1. Implement MutationObserver solution
2. Add feature flag for gradual rollout
3. Test with subset of blog posts
4. Monitor generation success rates
5. A/B test with 10% of users
6. Analyze metrics and user feedback
7. Roll out to 100% if metrics are positive
8. Remove old setTimeout code after 1 week

## 8. Monitoring & Alerts

- Track TOC generation success/failure rates
- Monitor generation time percentiles
- Alert if failure rate exceeds 0.1%
- Track timeout occurrences
- Monitor browser-specific failure patterns

## 9. Future Enhancements

- Implement virtual scrolling for very long TOCs
- Add TOC position persistence across page reloads
- Add search functionality within TOC
- Consider server-side TOC generation for SEO
- Add expand/collapse for nested heading levels