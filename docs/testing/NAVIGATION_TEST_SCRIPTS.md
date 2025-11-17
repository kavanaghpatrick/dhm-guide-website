# Navigation Testing Scripts

## Manual Test Scripts

### Script 1: Middle-Click Test (5 minutes)
**Purpose**: Verify middle-click opens links in new tabs.

**Steps**:
1. Open homepage in browser
2. Scroll to header navigation
3. Middle-click "Hangover Relief" link
   - **Expected**: New tab opens with `/guide` URL
   - **Actual (before fix)**: New tab opens with homepage or blank
4. Repeat for all header links:
   - Home, Best Supplements, Compare Solutions, The Science, Never Hungover, About
5. Test footer links with middle-click
6. Test CTA buttons with middle-click

**Pass Criteria**:
- ✅ All links open in new tabs
- ✅ New tab shows correct URL
- ✅ Original tab remains unchanged

**Bug Report Template** (if fails):
```
Title: Middle-click broken on [Component Name]
Steps: Middle-click [Link Name] in [Location]
Expected: Opens in new tab
Actual: [Describe behavior]
Browser: [Chrome/Safari/Firefox] [Version]
```

---

### Script 2: Right-Click Context Menu Test (5 minutes)
**Purpose**: Verify context menu works on all navigation elements.

**Steps**:
1. Right-click each header link
2. Verify menu shows:
   - ✅ "Open Link in New Tab"
   - ✅ "Open Link in New Window"
   - ✅ "Copy Link Address"
   - ✅ "Save Link As..."
3. Select "Open Link in New Tab"
   - **Expected**: Opens in new tab
4. Right-click and select "Copy Link Address"
   - Paste into address bar
   - **Expected**: Correct absolute URL
5. Test on:
   - Header navigation (desktop)
   - Mobile menu navigation
   - Footer links
   - In-page CTA buttons

**Pass Criteria**:
- ✅ Context menu appears
- ✅ All menu options functional
- ✅ Links open correctly
- ✅ URLs are absolute (not relative)

**Note**: If links are `<button>` elements, context menu will show generic options, not link-specific options. This indicates the bug.

---

### Script 3: Keyboard Navigation Test (10 minutes)
**Purpose**: Verify site is fully keyboard navigable.

**Steps**:
1. Open homepage
2. Close mouse/trackpad (don't use it)
3. Press Tab repeatedly
4. Verify you can reach:
   - Logo (home link)
   - Each header nav link
   - CTA buttons
   - Footer links
5. When focused on a link, press Enter
   - **Expected**: Navigate to page
6. After navigation, press Tab
   - **Expected**: Focus moves to content
7. Press Shift+Tab to go backwards
   - **Expected**: Focus moves in reverse

**Pass Criteria**:
- ✅ All interactive elements reachable by Tab
- ✅ Focus indicator clearly visible
- ✅ Enter activates links
- ✅ No focus traps
- ✅ Logical tab order

**Focus Visibility Check**:
- Look for outline/ring around focused element
- Should be visible on all backgrounds
- Should contrast with link color

---

### Script 4: Screen Reader Test (15 minutes)
**Purpose**: Verify navigation works for visually impaired users.

**Setup**:
- **Mac**: Enable VoiceOver (Cmd+F5)
- **Windows**: Enable NVDA (free) or JAWS
- **iOS**: Enable VoiceOver (Settings → Accessibility)
- **Android**: Enable TalkBack (Settings → Accessibility)

**Steps**:
1. Start screen reader
2. Navigate to homepage
3. Use screen reader controls to move through page:
   - **Mac VoiceOver**: VO+→ (Control+Option+Right Arrow)
   - **NVDA**: Down Arrow
4. Listen for announcements:
   - Link should be announced as "Link, [Link Text]"
   - Purpose should be clear
5. Activate a link:
   - **VoiceOver**: VO+Space
   - **NVDA**: Enter
6. Verify page content changes
7. Verify screen reader announces new page

**Pass Criteria**:
- ✅ All links announced as links (not buttons)
- ✅ Link text is descriptive
- ✅ Activation causes navigation
- ✅ New page content is announced
- ✅ No duplicate announcements

**Common Issues**:
- Button navigation: Announced as "Button, [Text]" not "Link"
- Missing href: Screen reader can't determine destination
- Generic text: "Click here" not descriptive enough

---

### Script 5: Mobile Touch Test (10 minutes)
**Purpose**: Verify mobile interactions work correctly.

**Setup**: Use real device or emulator (iOS Safari, Android Chrome).

**Steps**:
1. **Tap Test**:
   - Tap header link
   - Time the delay (should be <100ms)
   - Page should navigate instantly
2. **Long Press Test**:
   - Long press link
   - **Expected**: Context menu appears
   - iOS: Shows "Open", "Open in New Tab", "Copy"
   - Android: Similar options
3. **Swipe Cancel Test**:
   - Touch link
   - Swipe finger away before release
   - **Expected**: Navigation cancels
4. **Pinch Zoom Test**:
   - Try to pinch-zoom on content
   - **Expected**: Should work (not blocked)
   - **Bug if**: Can't zoom (user-scalable=no)
5. **Landscape/Portrait Test**:
   - Rotate device
   - Test navigation in both orientations

**Pass Criteria**:
- ✅ No tap delay (feels instant)
- ✅ Long press shows menu
- ✅ Swipe cancels tap
- ✅ Can zoom (accessibility)
- ✅ Works in both orientations

**Devices to Test**:
- iPhone (iOS 15+)
- iPad (iOS 15+)
- Android phone (Chrome)
- Android tablet (Chrome)

---

### Script 6: Anchor Link Test (10 minutes)
**Purpose**: Verify in-page anchor links work.

**Setup**: May need to add test anchor links temporarily.

**Test Cases**:

**A. Same-Page Anchor**:
```javascript
// Add to page temporarily:
<Link to="#benefits">Jump to Benefits</Link>
// Add id to target: <section id="benefits">
```

**Steps**:
1. Scroll to top of page
2. Click anchor link
3. **Expected**: Smooth scroll to section
4. **Expected**: URL updates to `/#benefits`
5. **Expected**: Browser back returns to top

**B. Cross-Page Anchor**:
```javascript
<Link to="/guide#dosage">Guide - Dosage Section</Link>
```

**Steps**:
1. Click cross-page anchor link
2. **Expected**: Navigate to `/guide`
3. **Expected**: Scroll to `#dosage` section
4. **Expected**: Browser back returns to previous page

**C. External Page Anchor**:
```javascript
<a href="https://example.com/page#section">External Link</a>
```

**Steps**:
1. Click external anchor link
2. **Expected**: Opens external site
3. **Expected**: Scrolls to section on external site

**Pass Criteria**:
- ✅ Same-page anchors scroll smoothly
- ✅ Cross-page anchors navigate + scroll
- ✅ URL updates correctly
- ✅ Browser history works
- ✅ External anchors not intercepted

---

### Script 7: JavaScript Disabled Test (10 minutes)
**Purpose**: Verify progressive enhancement (site works without JS).

**Setup**:
1. Chrome: DevTools → Settings → Debugger → Disable JavaScript
2. Firefox: about:config → javascript.enabled = false
3. Safari: Develop → Disable JavaScript

**Steps**:
1. Load homepage with JS disabled
2. Click header navigation link
3. **Expected**: Full page reload to target page
4. **Expected**: Content renders from HTML
5. Test all navigation:
   - Header links
   - Footer links
   - CTA buttons

**Pass Criteria**:
- ✅ Links cause full page reload
- ✅ Content renders (prerendered HTML)
- ✅ No broken navigation
- ✅ Forms still work (if any)

**Expected Failures** (acceptable):
- Animations don't work
- Lazy loading images may not load
- Interactive features broken
- **Not acceptable**: Navigation completely broken

**Note**: `<button onClick>` navigation will fail without JS. Must be `<a href>` for this to pass.

---

### Script 8: Browser Back/Forward Test (5 minutes)
**Purpose**: Verify browser history works correctly.

**Steps**:
1. Start on homepage
2. Click "Hangover Relief" → now on `/guide`
3. Click browser back button
   - **Expected**: Return to `/`
   - **Expected**: Scroll position at top
4. Click browser forward button
   - **Expected**: Return to `/guide`
5. Navigate through multiple pages:
   - Home → Guide → Reviews → Research
6. Click back 3 times
   - **Expected**: Reviews → Guide → Home
7. Click forward 2 times
   - **Expected**: Guide → Reviews

**Pass Criteria**:
- ✅ Back button works
- ✅ Forward button works
- ✅ History state correct
- ✅ Scroll positions appropriate
- ✅ No stuck states

---

### Script 9: External Link Security Test (5 minutes)
**Purpose**: Verify external links have security attributes.

**Steps**:
1. Open DevTools → Elements/Inspector
2. Find external links (Amazon affiliate, PubMed, etc.)
3. Check attributes:
   ```html
   <a href="https://amazon.com/..."
      target="_blank"           <!-- ✅ Opens new tab -->
      rel="noopener noreferrer" <!-- ✅ Security attributes -->
   >
   ```
4. Verify all external links have:
   - `target="_blank"`
   - `rel="noopener noreferrer"`

**Why This Matters**:
- **noopener**: Prevents reverse tabnabbing attack
- **noreferrer**: Prevents referrer leaking (privacy)

**Pass Criteria**:
- ✅ All external links have security attributes
- ✅ Opens in new tab
- ✅ Original tab can't be controlled by opened page

**Test Sites**:
- Homepage: Affiliate product links
- Compare page: All product links
- Research page: PubMed/PMC study links

---

### Script 10: Reduced Motion Test (5 minutes)
**Purpose**: Verify animations respect user preferences.

**Setup**:
1. **Mac**: System Preferences → Accessibility → Display → Reduce Motion (ON)
2. **Windows**: Settings → Ease of Access → Display → Show animations (OFF)
3. **iOS**: Settings → Accessibility → Motion → Reduce Motion (ON)
4. **Android**: Settings → Accessibility → Remove animations (ON)

**Steps**:
1. Enable reduced motion in OS
2. Reload website
3. Navigate between pages
4. Verify:
   - No smooth scrolling (instant)
   - No fade-in animations
   - No parallax effects
   - No sliding transitions

**Pass Criteria**:
- ✅ Animations disabled or minimal
- ✅ Instant scrolling (not smooth)
- ✅ Content still readable
- ✅ All functionality preserved

**CSS to Check**:
```css
@media (prefers-reduced-motion: reduce) {
  /* Should exist in styles */
}
```

---

### Script 11: Offline Navigation Test (5 minutes)
**Purpose**: Verify SPA navigation works offline.

**Steps**:
1. Load homepage (online)
2. Navigate to 2-3 pages (loads them into memory)
3. Open DevTools → Network → Set to "Offline"
4. Try navigating between already-loaded pages
   - **Expected**: SPA navigation works
5. Try navigating to unloaded page
   - **Expected**: Error message or cached version

**Pass Criteria**:
- ✅ Previously loaded pages accessible offline
- ✅ SPA navigation doesn't require network
- ✅ Graceful error for unloaded pages

---

### Script 12: Performance Test (10 minutes)
**Purpose**: Compare SPA vs full page reload performance.

**Setup**: Chrome DevTools → Network tab.

**Test A: Full Page Reload** (baseline):
1. Clear cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Load homepage
3. Click link → full reload
4. Note metrics in Network tab:
   - Total requests
   - Total bytes
   - Load time
   - Time to Interactive (TTI)

**Test B: SPA Navigation**:
1. Load homepage
2. Click link → SPA navigation
3. Note metrics:
   - Requests (should be ~0)
   - Bytes (should be ~0)
   - Navigation time

**Expected Results**:
- Full reload: 800-2000ms, ~500KB, 20-30 requests
- SPA navigation: 100-300ms, ~0KB, 0 requests

**Pass Criteria**:
- ✅ SPA is 3-10x faster
- ✅ SPA feels instant (<300ms)
- ✅ No layout shifts

**Lighthouse Test**:
```bash
npx lighthouse http://localhost:4173 --view
```

Check:
- Performance score (>90)
- Time to Interactive (<3s)
- Largest Contentful Paint (<2.5s)

---

## Automated Test Examples

### Playwright Test Suite

Create `/tests/e2e/navigation.spec.js`:

```javascript
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('middle-click opens new tab', async ({ page, context }) => {
    await page.goto('/')

    const linkPromise = context.waitForEvent('page')
    await page.locator('a[href="/guide"]').click({ button: 'middle' })

    const newPage = await linkPromise
    await expect(newPage).toHaveURL(/.*\/guide/)
    await expect(page).toHaveURL(/.*\/$/)  // Original unchanged
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')

    // Tab to navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')  // Reach first nav link

    // Press Enter
    await page.keyboard.press('Enter')

    // Should navigate
    await expect(page).toHaveURL(/.*\/guide/)
  })

  test('back button works', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/guide"]')
    await expect(page).toHaveURL(/.*\/guide/)

    await page.goBack()
    await expect(page).toHaveURL(/.*\/$/)
  })

  test('works without JavaScript', async ({ page, context }) => {
    await context.setJavaScriptEnabled(false)
    await page.goto('/')

    await page.click('a[href="/guide"]')
    await expect(page).toHaveURL(/.*\/guide/)
  })

  test('external links open in new tab', async ({ page, context }) => {
    await page.goto('/')

    const linkPromise = context.waitForEvent('page')
    await page.locator('a[target="_blank"]').first().click()

    const newPage = await linkPromise
    expect(newPage.url()).toContain('http')  // External domain
  })

  test('anchor links scroll to section', async ({ page }) => {
    await page.goto('/')

    // Add test anchor temporarily
    await page.evaluate(() => {
      const section = document.querySelector('.benefits-section')
      if (section) section.id = 'benefits'

      const link = document.createElement('a')
      link.href = '#benefits'
      link.textContent = 'Jump to Benefits'
      link.id = 'test-anchor'
      document.body.insertBefore(link, document.body.firstChild)
    })

    await page.click('#test-anchor')

    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })
})

test.describe('Accessibility', () => {
  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/')

    // Inject axe-core
    await page.evaluate(() => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
      document.head.appendChild(script)
    })

    // Run axe scan
    const results = await page.evaluate(() => {
      return axe.run()
    })

    expect(results.violations.length).toBe(0)
  })

  test('keyboard focus visible', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => {
      const el = document.activeElement
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth
      }
    })

    expect(focused.outlineWidth).not.toBe('0px')
  })
})

test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })  // iPhone SE

  test('mobile menu works', async ({ page }) => {
    await page.goto('/')

    // Open mobile menu
    await page.click('[aria-label="Open menu"]')
    await expect(page.locator('nav.mobile')).toBeVisible()

    // Click link in mobile menu
    await page.click('nav.mobile a[href="/guide"]')

    // Should navigate and close menu
    await expect(page).toHaveURL(/.*\/guide/)
    await expect(page.locator('nav.mobile')).not.toBeVisible()
  })

  test('no tap delay', async ({ page }) => {
    await page.goto('/')

    const start = Date.now()
    await page.tap('a[href="/guide"]')
    const tapTime = Date.now() - start

    expect(tapTime).toBeLessThan(100)  // Should be instant
  })
})
```

### Running Playwright Tests

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test

# Run specific test
npx playwright test navigation.spec.js

# Run with UI
npx playwright test --ui

# Run in specific browser
npx playwright test --project=webkit  # Safari
npx playwright test --project=firefox
npx playwright test --project=chromium
```

---

## Regression Test Checklist

After implementing fixes, verify:

### Critical Functionality
- [ ] Left-click navigates (SPA)
- [ ] Middle-click opens new tab
- [ ] Right-click shows context menu
- [ ] Cmd/Ctrl+click opens new tab
- [ ] Browser back/forward works
- [ ] External links open new tabs
- [ ] Keyboard navigation works
- [ ] Screen reader navigation works
- [ ] Mobile tap works (no delay)
- [ ] Anchor links scroll to sections

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari (15+)
- [ ] Android Chrome (latest)

### Accessibility
- [ ] All links focusable by keyboard
- [ ] Focus indicators visible
- [ ] Screen reader announces correctly
- [ ] Reduced motion respected
- [ ] Can zoom/pinch-zoom
- [ ] Color contrast sufficient

### Edge Cases
- [ ] JavaScript disabled (links work)
- [ ] Offline (loaded pages accessible)
- [ ] Slow network (loading states)
- [ ] Rapid clicks (no duplication)
- [ ] Invalid URLs (404 page)

---

## Bug Tracking Template

```markdown
## Navigation Bug Report

**Title**: [Brief description]

**Priority**: P0 Critical / P1 High / P2 Medium / P3 Low

**Environment**:
- Browser: [Chrome 120 / Safari 17 / Firefox 119 / Edge 120]
- OS: [macOS 14 / Windows 11 / iOS 17 / Android 14]
- Device: [Desktop / iPhone 12 / Pixel 5]

**Steps to Reproduce**:
1. Navigate to [URL]
2. Perform [action]
3. Observe [result]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Video**:
[Attach evidence]

**Console Errors**:
```
[Paste any errors from DevTools console]
```

**Additional Context**:
[Any other relevant information]

**Related Files**:
- `/src/components/CustomLink.jsx`
- `/src/components/layout/Layout.jsx`
```

---

## Performance Benchmarks

### Target Metrics
- **SPA Navigation**: <300ms
- **Full Page Reload**: <2000ms
- **Time to Interactive**: <3000ms
- **Largest Contentful Paint**: <2500ms
- **First Input Delay**: <100ms
- **Cumulative Layout Shift**: <0.1

### How to Measure
```bash
# Lighthouse performance audit
npx lighthouse http://localhost:4173 --only-categories=performance

# WebPageTest
https://www.webpagetest.org/

# Chrome DevTools
# Performance tab → Record → Perform navigation → Stop → Analyze
```

---

## Next Steps

1. **Implement Critical Fixes** (25 minutes)
   - Fix middle-click in CustomLink.jsx
   - Convert buttons to links in Layout.jsx

2. **Run Test Scripts** (1 hour)
   - Execute Scripts 1-5 manually
   - Document any failures

3. **Fix Accessibility** (1 hour)
   - Remove user-scalable=no
   - Add reduced motion CSS
   - Test with VoiceOver

4. **Automated Tests** (2 hours)
   - Set up Playwright
   - Implement test suite
   - Run on CI/CD

5. **Regression Testing** (1 hour)
   - Run full checklist
   - Test on all target browsers
   - Verify no new issues introduced

**Total Estimated Time**: 5-6 hours from start to production-ready.
