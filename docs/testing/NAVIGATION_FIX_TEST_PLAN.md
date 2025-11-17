# Navigation Fix Test Plan - Comprehensive Edge Cases & Testing Scenarios

## Executive Summary
This test plan covers all edge cases and testing scenarios for the client-side navigation implementation in the DHM Guide website. The current implementation uses a custom routing system with `CustomLink.jsx` and `navigateWithScrollToTop()` utility.

## Current Architecture Analysis

### Navigation Implementation
- **Framework**: React SPA with custom routing (no react-router-dom in active use)
- **Navigation Handler**: `/src/lib/mobileScrollUtils.js` - `navigateWithScrollToTop()`
- **Custom Link Component**: `/src/components/CustomLink.jsx`
- **Manual Routing**: `/src/App.jsx` - Switch-based path matching with `useState` for `currentPath`
- **Navigation Method**: `window.history.pushState()` + manual `popstate` event dispatch

### Key Components
1. **CustomLink.jsx** - Intercepts clicks, prevents default, calls `navigateWithScrollToTop()`
2. **Layout.jsx** - Header/footer navigation using button elements with `onClick` handlers
3. **mobileScrollUtils.js** - Handles navigation + scroll-to-top with iOS Safari compatibility

---

## Test Scenarios & Edge Cases

### 1. JavaScript Disabled Scenarios

#### Test 1.1: JavaScript Completely Disabled
**Context**: Users with NoScript, corporate proxies, or accessibility tools may have JS disabled.

**Current Behavior**:
- CustomLink renders as `<a href="/path">` with `onClick` handler
- Without JS: Click triggers native browser navigation
- Result: **GRACEFUL DEGRADATION** ✅

**Expected Behavior**:
- Links should work as normal `<a>` tags
- Full page reload occurs
- User can still navigate entire site

**Test Steps**:
1. Open browser dev tools → Settings → Disable JavaScript
2. Navigate to `/` (homepage)
3. Click "Hangover Relief" link in header
4. Verify: Full page reload to `/guide`
5. Verify: All content renders (SSR/prerendered HTML)
6. Test all header navigation links
7. Test footer links
8. Test in-page CTA buttons

**Pass Criteria**:
- All links navigate correctly (full page reload)
- No broken navigation
- Content renders from prerendered HTML

**Risk Assessment**: ⚠️ **MEDIUM RISK**
- Layout.jsx uses `<button onClick>` for navigation - these will NOT work without JS
- Only CustomLink `<a href>` tags will work
- **Action Required**: Audit all navigation elements

#### Test 1.2: JavaScript Errors During Load
**Context**: Script load failures, CSP violations, bundle errors

**Current Behavior**:
- ErrorBoundary in main.jsx catches React errors
- Shows fallback UI with "Refresh Page" button

**Test Steps**:
1. Block main JS bundle in Network tab
2. Verify error boundary shows
3. Check if basic HTML renders
4. Test if prerendered content is visible

**Pass Criteria**:
- Error boundary displays
- Prerendered content remains visible
- User can refresh to retry

---

### 2. Middle-Click (Open in New Tab)

#### Test 2.1: Middle-Click on CustomLink
**Context**: Power users expect middle-click to open links in new tabs.

**Current Behavior**:
```javascript
const handleClick = (e) => {
  e.preventDefault()  // ⚠️ PREVENTS ALL CLICKS
  navigateWithScrollToTop(to)
}
```

**Problem**: Middle-click is blocked - new tab opens to blank page or current URL.

**Expected Behavior**:
- Middle-click should open link in new tab
- New tab should load the full page at target URL
- Original tab should remain unchanged

**Test Steps**:
1. Navigate to homepage
2. Middle-click "Hangover Relief" link
3. Expected: New tab opens to `/guide`
4. Actual: New tab opens to blank or current URL

**Pass Criteria**:
- Middle-click opens new tab with target URL
- Original tab unaffected
- Content loads in new tab

**Fix Required**: ✅ **YES - CRITICAL UX ISSUE**
```javascript
const handleClick = (e) => {
  // Allow default behavior for middle-click and modified clicks
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) {
    return  // Let browser handle it
  }

  e.preventDefault()
  navigateWithScrollToTop(to)
}
```

#### Test 2.2: Middle-Click on Layout Button Navigation
**Current Implementation**:
```javascript
<button onClick={() => handleNavigation(item.href)}>
```

**Problem**: Buttons don't support middle-click navigation at all.

**Expected Behavior**: N/A - buttons can't be middle-clicked by browser convention.

**Fix Required**: ⚠️ **ARCHITECTURAL DECISION NEEDED**
- Option A: Keep buttons (faster for primary clicks, no middle-click support)
- Option B: Convert to `<a>` tags with `onClick` (full browser features)

**Recommendation**: Convert to `<a>` tags for consistent browser behavior.

---

### 3. Right-Click Context Menu

#### Test 3.1: Right-Click → "Open in New Tab"
**Context**: Users expect context menu to work on all links.

**Current Behavior**:
- CustomLink renders `<a href="/path">` - context menu works ✅
- Layout buttons - context menu shows generic options (can't open in new tab) ❌

**Test Steps**:
1. Right-click "Hangover Relief" in header
2. Select "Open in New Tab"
3. Expected: New tab opens to `/guide`
4. Verify content loads

**Pass Criteria**:
- Context menu shows "Open in New Tab", "Copy Link", etc.
- All context menu options work correctly
- New tab loads target URL

**Fix Required**:
- CustomLink: ✅ Works already
- Layout buttons: ❌ Need conversion to `<a>` tags

#### Test 3.2: Right-Click → "Copy Link Address"
**Test Steps**:
1. Right-click any navigation link
2. Select "Copy Link Address"
3. Paste into new tab
4. Verify correct URL

**Pass Criteria**:
- Copied URL is absolute and correct
- Pasting URL navigates to correct page

---

### 4. Mobile vs Desktop Behavior Differences

#### Test 4.1: Mobile Touch Interactions
**Context**: Mobile browsers have different touch handling.

**Current Implementation**:
- Touch optimizations in main.jsx: `touchAction: 'manipulation'`
- Removes 300ms tap delay
- Sets `user-scalable=no` (accessibility concern)

**Test Scenarios**:
- **Tap**: Should navigate instantly (no 300ms delay)
- **Long press**: Should show context menu
- **Swipe while pressing**: Should cancel navigation
- **Double tap**: Should NOT zoom (prevented by user-scalable=no)

**Devices to Test**:
- iOS Safari (iPhone 12+, iOS 15+)
- iOS Chrome
- Android Chrome (Pixel, Samsung)
- Android Firefox

**Test Steps**:
1. Open site on mobile device
2. Tap navigation link - measure delay (should be <100ms)
3. Long-press link - verify context menu appears
4. Start tap, then swipe - verify navigation cancels
5. Test all gestures on:
   - Header nav buttons
   - Footer links
   - In-page CTA buttons
   - Blog post links

**Pass Criteria**:
- No tap delay (feels instant)
- Long-press works
- Swipe cancels navigation appropriately
- No accidental zooming

**Accessibility Concern**: ⚠️
- `user-scalable=no` prevents pinch-zoom
- Violates WCAG 2.1 AA (1.4.4 Resize text)
- **Fix**: Remove `user-scalable=no`, use `touch-action: manipulation` only

#### Test 4.2: iOS Safari Scroll Behavior
**Context**: iOS Safari has unique scroll behavior with CSS conflicts.

**Current Implementation**:
- Detects iOS: `/iPad|iPhone|iPod/.test(navigator.userAgent)`
- Temporarily disables `scroll-behavior: smooth`
- Multiple scroll attempts with delays (16ms, 32ms, 100ms, 250ms)

**Test Scenarios**:
1. Navigate between pages - verify scrolls to top
2. Use browser back button - verify scroll position
3. Scroll down, navigate, verify top scroll
4. Test in landscape/portrait

**iOS Versions to Test**:
- iOS 15, 16, 17, 18
- Safari, Chrome, Firefox on iOS

**Pass Criteria**:
- Always scrolls to top on navigation
- No stuck scroll positions
- Smooth experience (no visible scroll jumps)

---

### 5. External Links vs Internal Links

#### Test 5.1: External Links (Affiliate/Research)
**Current Implementation**:
```javascript
<a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
```

**Locations**:
- Home.jsx: Amazon affiliate links (3 products)
- Compare.jsx: 10+ product affiliate links
- Research.jsx: PubMed/PMC external study links

**Test Steps**:
1. Identify all external links:
   - Affiliate links (Amazon, etc.)
   - Research links (PubMed, PMC)
   - Social media links
2. Verify all use `target="_blank"`
3. Verify all use `rel="noopener noreferrer"`
4. Click each - verify opens in new tab
5. Middle-click - verify opens in new tab
6. Right-click → "Open in New Tab" - verify works

**Pass Criteria**:
- External links open in new tab
- Security attributes present (`noopener noreferrer`)
- No navigation interception
- Original tab remains on site

**Security Check**:
- ✅ All external links found use `rel="noopener noreferrer"`
- Prevents reverse tabnabbing attacks

#### Test 5.2: Mixed Content (Internal + External)
**Scenario**: Page has both internal nav and external links.

**Test Steps**:
1. On homepage, test internal link ("Hangover Relief")
2. Verify: SPA navigation, no page reload
3. Test external link (affiliate product)
4. Verify: Opens in new tab
5. Return to original tab
6. Verify: Still on homepage, no navigation

**Pass Criteria**:
- Internal links use SPA navigation
- External links open new tabs
- No interference between link types

---

### 6. Anchor Links (#sections)

#### Test 6.1: Same-Page Anchor Links
**Context**: Links like `<a href="#faq">` for in-page navigation.

**Current Implementation**:
- No special handling for hash links in CustomLink
- `navigateWithScrollToTop()` pushes full path to history

**Test Scenarios**:

**A. Anchor Link on Same Page**
```javascript
<Link to="#benefits">Jump to Benefits</Link>
```

**Expected Behavior**:
- Smooth scroll to section
- URL updates to `/#benefits`
- No page reload

**Actual Behavior** (if using CustomLink):
- `e.preventDefault()` blocks scroll
- History pushed, but no scroll to section
- Result: ❌ BROKEN

**Test Steps**:
1. Add anchor link to homepage: `<Link to="#benefits">`
2. Click link
3. Expected: Scrolls to benefits section
4. Actual: Nothing happens (scroll to top instead)

**B. Anchor Link to Different Page**
```javascript
<Link to="/guide#dosage">Guide - Dosage Section</Link>
```

**Expected Behavior**:
- Navigate to `/guide`
- Scroll to `#dosage` section

**Actual Behavior**:
- Navigate to `/guide`
- Scrolls to top (anchor ignored)

**Fix Required**: ✅ **YES - MODERATE PRIORITY**
```javascript
const handleClick = (e) => {
  // Handle modified clicks
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) {
    return
  }

  // Handle anchor links
  if (to.startsWith('#')) {
    e.preventDefault()
    const element = document.querySelector(to)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState({}, '', to)
    }
    return
  }

  // Handle cross-page anchors
  if (to.includes('#')) {
    const [path, hash] = to.split('#')
    if (path === window.location.pathname) {
      // Same page, just scroll
      e.preventDefault()
      const element = document.querySelector(`#${hash}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState({}, '', to)
      }
      return
    }
    // Different page - let SPA navigate, then scroll after
    // (needs callback mechanism)
  }

  // Normal navigation
  e.preventDefault()
  navigateWithScrollToTop(to)
}
```

#### Test 6.2: Browser Back/Forward with Anchors
**Scenario**: User navigates using anchors, then uses browser back.

**Test Steps**:
1. Navigate to `/#benefits`
2. Click link to `/#faq`
3. Click browser back button
4. Expected: Returns to `/#benefits` and scrolls to section
5. Actual: ???

**Pass Criteria**:
- Back button restores anchor scroll position
- Forward button works correctly
- History navigation smooth

---

### 7. Performance Implications

#### Test 7.1: Navigation Speed (SPA vs Full Reload)
**Hypothesis**: SPA navigation is faster than full page reload.

**Test Steps**:
1. **Full Page Reload** (baseline):
   - Open DevTools → Network
   - Disable cache
   - Navigate from `/` to `/guide`
   - Measure: Time to Interactive (TTI)

2. **SPA Navigation** (current):
   - Same test with SPA
   - Measure: Time from click to content visible

**Metrics to Compare**:
- Time to Interactive
- Total bytes transferred
- Number of requests
- First Contentful Paint
- Largest Contentful Paint

**Expected Results**:
- SPA: ~100-300ms (no network requests)
- Full reload: ~800-2000ms (depends on network)
- SPA should be 3-10x faster

**Pass Criteria**:
- SPA navigation feels instant (<300ms)
- No visible loading delays
- Smooth transitions

#### Test 7.2: Memory Leaks During Navigation
**Context**: SPA navigation can cause memory leaks if listeners aren't cleaned up.

**Test Steps**:
1. Open Chrome DevTools → Memory
2. Take heap snapshot (baseline)
3. Navigate through 20+ pages
4. Return to homepage
5. Force garbage collection
6. Take second heap snapshot
7. Compare memory usage

**Pass Criteria**:
- Memory usage returns to baseline (+/- 10%)
- No detached DOM nodes accumulating
- Event listeners properly cleaned up

**Risk Areas**:
- `useEffect` cleanup in components
- Event listeners in mobileScrollUtils.js
- Framer Motion animations
- Image lazy loading observers

#### Test 7.3: Bundle Size Impact
**Current Setup**:
- Custom routing (~150 lines total)
- No react-router-dom dependency

**If Switching to React Router**:
- react-router-dom: ~23KB gzipped
- Would add to bundle size

**Test Steps**:
1. Build current version: `npm run build`
2. Check bundle size in `dist/`
3. Install react-router-dom
4. Build again, compare sizes

**Decision Criteria**:
- If custom routing works reliably: Keep it (smaller bundle)
- If too many edge cases: Switch to React Router (proven solution)

---

### 8. Browser Compatibility Matrix

#### Test 8.1: Desktop Browsers

| Browser | Version | Expected Issues | Test Priority |
|---------|---------|----------------|---------------|
| Chrome | Latest (120+) | None | High |
| Firefox | Latest (120+) | None | High |
| Safari | Latest (17+) | Scroll behavior | High |
| Edge | Latest (120+) | None | Medium |
| Chrome | 100-119 | Possible history API issues | Low |
| Firefox | 100-119 | Possible history API issues | Low |
| Safari | 15-16 | Scroll behavior issues | Medium |
| Internet Explorer 11 | N/A | Not supported (React 19) | Skip |

#### Test 8.2: Mobile Browsers

| Browser | OS | Version | Expected Issues | Test Priority |
|---------|-----|---------|----------------|---------------|
| Safari | iOS | 17-18 | Scroll behavior | Critical |
| Safari | iOS | 15-16 | Scroll + touch delay | High |
| Chrome | iOS | Latest | Same as Safari (WebKit) | High |
| Chrome | Android | Latest | Touch delays | High |
| Firefox | Android | Latest | None expected | Medium |
| Samsung Internet | Android | Latest | Touch behavior | Medium |

**Key Differences**:
- iOS browsers all use WebKit (same engine as Safari)
- Android browsers use Blink/Gecko (different engines)
- iOS Safari has unique scroll/viewport behavior

---

### 9. Accessibility & Assistive Technology

#### Test 9.1: Screen Readers
**Context**: Visually impaired users rely on screen readers.

**Test with**:
- VoiceOver (Mac/iOS)
- NVDA (Windows)
- JAWS (Windows)
- TalkBack (Android)

**Test Steps**:
1. Enable screen reader
2. Navigate to homepage
3. Tab through navigation links
4. Verify each link is announced correctly
5. Activate link (press Enter)
6. Verify page content updates
7. Verify screen reader announces new page

**Pass Criteria**:
- All links are focusable and announced
- Link purpose is clear ("Navigate to Hangover Relief")
- Page transitions are announced
- Focus moves appropriately after navigation
- ARIA live regions announce content changes

**Current Issues**:
- Layout.jsx uses `<button>` - these don't have href for screen readers
- May need `aria-label` or conversion to `<a>` tags

#### Test 9.2: Keyboard Navigation
**Context**: Power users and accessibility users navigate by keyboard.

**Test Steps**:
1. Tab through entire page
2. Verify focus visible on all interactive elements
3. Navigate to header link
4. Press Enter - verify navigation
5. Press Tab - verify focus moves to new page content
6. Test Shift+Tab (reverse navigation)
7. Test arrow keys (should scroll, not navigate)

**Pass Criteria**:
- All links focusable
- Focus indicator visible (outline or custom style)
- Enter key activates links
- Focus moves logically after navigation
- No focus traps

**Keyboard Shortcuts to Test**:
- Tab / Shift+Tab - navigate focusable elements
- Enter - activate links/buttons
- Space - activate buttons (not links)
- Arrow keys - scroll page (shouldn't navigate)

#### Test 9.3: Reduced Motion Preference
**Context**: Users with vestibular disorders request reduced motion.

**Current Implementation**:
- Framer Motion animations throughout
- Smooth scroll in mobileScrollUtils.js

**Test Steps**:
1. Enable reduced motion:
   - Mac: System Preferences → Accessibility → Display → Reduce Motion
   - Windows: Settings → Ease of Access → Display → Show animations
2. Navigate site
3. Verify animations are removed or reduced
4. Test scroll-to-top behavior

**Pass Criteria**:
- Animations respect `prefers-reduced-motion` media query
- Scroll behavior is instant (not smooth)
- No jarring motion
- Full functionality preserved

**Fix Required**: ⚠️ **ACCESSIBILITY ISSUE**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 10. Error Scenarios & Edge Cases

#### Test 10.1: Network Offline During Navigation
**Scenario**: User goes offline mid-session.

**Test Steps**:
1. Load homepage (online)
2. Open DevTools → Network → Set to "Offline"
3. Click navigation link
4. Expected: SPA navigation works (no network needed)
5. Verify content renders from memory/cache

**Pass Criteria**:
- SPA navigation works offline
- Previously loaded pages accessible
- Error message for unloaded pages

#### Test 10.2: Invalid Route
**Scenario**: User navigates to non-existent page.

**Current Implementation**:
```javascript
switch (currentPath) {
  case '/guide': return <Guide />
  // ...
  default: return <Home />
}
```

**Test Steps**:
1. Navigate to `/invalid-page`
2. Current: Shows homepage (default case)
3. Expected: Should show 404 page

**Pass Criteria**:
- 404 page for invalid routes
- User can navigate back to valid pages
- SEO: Server returns 404 status (prerendering)

**Fix Required**: ✅ **YES - SEO ISSUE**
- Add 404 component
- Detect invalid routes
- Return 404 status from prerender script

#### Test 10.3: Rapid Navigation (Double-Click Prevention)
**Scenario**: User rapidly clicks navigation links.

**Test Steps**:
1. Click navigation link
2. Immediately click again
3. Click different link before first loads
4. Verify no duplicate navigation
5. Verify no stuck loading states

**Pass Criteria**:
- Rapid clicks handled gracefully
- Only final destination loads
- No race conditions
- No stuck loading spinners

**Fix Required**: ⚠️ **POTENTIAL RACE CONDITION**
```javascript
let isNavigating = false

const handleClick = (e) => {
  if (isNavigating) return
  isNavigating = true

  e.preventDefault()
  navigateWithScrollToTop(to)

  setTimeout(() => {
    isNavigating = false
  }, 300)
}
```

#### Test 10.4: Browser Back/Forward During Load
**Scenario**: User clicks back while page is loading.

**Test Steps**:
1. Navigate to page with heavy content
2. Immediately click browser back button
3. Verify navigation cancels
4. Verify returns to previous page

**Pass Criteria**:
- Back button always works
- No stuck states
- Proper cleanup of in-flight loads

---

## Testing Tools & Automation

### Manual Testing Checklist
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browsers (iOS Safari, Chrome, Android Chrome)
- [ ] Screen readers (VoiceOver, NVDA)
- [ ] Keyboard navigation
- [ ] Network throttling (Slow 3G, Offline)
- [ ] JavaScript disabled

### Automated Testing Options

#### 1. Playwright/Cypress E2E Tests
```javascript
// Example Playwright test
test('navigation works with middle-click', async ({ page }) => {
  await page.goto('/')

  // Middle-click link
  const link = page.locator('a[href="/guide"]')
  await link.click({ button: 'middle' })

  // Wait for new tab
  const newPage = await page.waitForEvent('popup')
  await expect(newPage).toHaveURL(/.*\/guide/)
})

test('navigation works without JavaScript', async ({ page, context }) => {
  await context.setJavaScriptEnabled(false)
  await page.goto('/')

  await page.click('a[href="/guide"]')
  await expect(page).toHaveURL(/.*\/guide/)
})
```

#### 2. Lighthouse CI
- Test performance on every PR
- Measure TTI, LCP, CLS
- Compare SPA vs full reload

#### 3. Accessibility Testing
- axe-core automated tests
- pa11y continuous monitoring
- WAVE browser extension

---

## Priority Matrix

| Issue | Impact | Frequency | Priority | Fix Effort |
|-------|--------|-----------|----------|------------|
| Middle-click broken | High | Medium | **P0 Critical** | Low (1 hour) |
| Right-click context menu (buttons) | High | Medium | **P0 Critical** | Medium (3 hours) |
| Anchor links broken | Medium | Low | **P1 High** | Medium (4 hours) |
| JS disabled (buttons) | Medium | Very Low | **P2 Medium** | Medium (3 hours) |
| Keyboard nav (buttons) | High | Low | **P1 High** | Medium (3 hours) |
| Screen reader (buttons) | High | Low | **P1 High** | Medium (3 hours) |
| Reduced motion | Low | Low | **P3 Low** | Low (1 hour) |
| 404 page | Low | Low | **P3 Low** | Low (2 hours) |
| Double-click race condition | Low | Very Low | **P4 Nice-to-have** | Low (1 hour) |

---

## Recommended Implementation Plan

### Phase 1: Critical Fixes (Day 1)
1. **Fix middle-click in CustomLink.jsx**
   - Check for modified clicks before `preventDefault()`
   - Test: Middle-click opens new tab

2. **Convert Layout.jsx navigation buttons to links**
   - Replace `<button onClick>` with `<a href onClick>`
   - Maintains SPA navigation but enables browser features
   - Test: Right-click context menu, middle-click, keyboard

### Phase 2: High Priority (Day 2-3)
3. **Implement anchor link support**
   - Detect hash links in CustomLink
   - Handle same-page and cross-page anchors
   - Test: All anchor scenarios

4. **Add 404 page**
   - Create NotFound component
   - Update routing logic
   - Configure prerender script

### Phase 3: Accessibility (Day 4-5)
5. **Fix keyboard navigation**
   - Ensure all interactive elements focusable
   - Add visible focus indicators
   - Test with keyboard only

6. **Screen reader optimization**
   - Add ARIA labels where needed
   - Test with VoiceOver/NVDA
   - Verify announcements

7. **Reduced motion support**
   - Add CSS media query
   - Update Framer Motion animations
   - Test with preference enabled

### Phase 4: Polish (Day 6)
8. **Add double-click prevention**
9. **Test offline behavior**
10. **Performance audit**

---

## Success Criteria

### Must Have (Block Release)
- ✅ Middle-click works on all links
- ✅ Right-click context menu works
- ✅ Keyboard navigation works
- ✅ Screen readers can navigate
- ✅ Works on iOS Safari
- ✅ Works on Android Chrome

### Should Have (High Priority)
- ✅ Anchor links work
- ✅ 404 page exists
- ✅ Reduced motion respected
- ✅ No memory leaks

### Nice to Have (Future Iteration)
- ⭐ Smooth transitions between pages
- ⭐ Prefetch on hover
- ⭐ Progressive enhancement for JS disabled
- ⭐ Offline support with service worker

---

## Appendix: Current File Locations

### Files to Modify
1. `/src/components/CustomLink.jsx` - Fix middle-click, anchor links
2. `/src/components/layout/Layout.jsx` - Convert buttons to links
3. `/src/lib/mobileScrollUtils.js` - Add anchor support, reduced motion
4. `/src/App.jsx` - Add 404 route
5. `/src/index.css` - Add reduced motion CSS

### Files to Create
1. `/src/pages/NotFound.jsx` - 404 page component
2. `/tests/e2e/navigation.spec.js` - Playwright tests

### Files to Review
1. `/src/pages/Home.jsx` - External links (already correct)
2. `/src/pages/Compare.jsx` - Affiliate links (already correct)
3. `/src/pages/Research.jsx` - External study links (already correct)

---

## Notes & Observations

### Current Strengths
- ✅ External links properly secured (`noopener noreferrer`)
- ✅ iOS Safari scroll issues addressed
- ✅ Mobile touch optimizations
- ✅ Error boundary for JS failures

### Current Weaknesses
- ❌ Layout navigation uses buttons (blocks browser features)
- ❌ Middle-click broken in CustomLink
- ❌ No anchor link support
- ❌ No 404 page
- ❌ Reduced motion not respected

### Architectural Question
**Should we switch to React Router?**

**Pros**:
- Industry-standard solution
- Handles all edge cases
- Better TypeScript support
- Extensive documentation

**Cons**:
- +23KB bundle size
- Migration effort (~1 day)
- May not fix iOS scroll issues (still need custom logic)

**Recommendation**: **Keep custom routing** but fix edge cases.
- Current implementation is 90% there
- Fixes are straightforward
- Bundle stays smaller
- Custom scroll logic works well
- Can always migrate later if needed

---

## Final Recommendations

1. **Fix critical issues first**: Middle-click, keyboard nav, screen readers
2. **Convert buttons to links**: Enables all browser features with minimal code change
3. **Add anchor support**: Common use case, moderate effort
4. **Keep custom routing**: Don't switch to React Router unless issues persist
5. **Automate testing**: Add Playwright tests for regression prevention
6. **Monitor analytics**: Track navigation errors, bounce rates, back button usage

**Estimated Total Effort**: 4-6 days for all phases
**Minimum Viable Fix**: Phase 1-2 (2-3 days) solves 80% of issues
