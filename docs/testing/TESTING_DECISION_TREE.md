# Navigation Testing Decision Tree

## Quick Start: Which Tests Should I Run?

```
START HERE
│
├─ Just fixed middle-click?
│  └─ Run: Script 1 (Middle-Click Test) - 5 min
│     ✓ Pass → Good to merge
│     ✗ Fail → Check modified click detection code
│
├─ Just converted buttons to links?
│  └─ Run: Script 2 (Context Menu) + Script 3 (Keyboard Nav) - 15 min
│     ✓ Pass → Run Script 4 (Screen Reader) - 15 min
│     ✗ Fail → Check <a> tag implementation
│
├─ Added accessibility fixes?
│  └─ Run: Scripts 4, 5, 10 (Screen Reader + Mobile + Reduced Motion) - 30 min
│     ✓ Pass → Good for production
│     ✗ Fail → Check CSS and aria attributes
│
├─ Added anchor link support?
│  └─ Run: Script 6 (Anchor Links) - 10 min
│     ✓ Pass → Test cross-page anchors too
│     ✗ Fail → Check hash detection logic
│
├─ Ready for production?
│  └─ Run: Full Regression Checklist - 1 hour
│     ✓ Pass → Deploy to preview
│     ✗ Fail → Fix issues, run targeted tests
│
└─ PR Review / QA?
   └─ Run: Automated Playwright Suite - 5 min
      ✓ Pass → Approve PR
      ✗ Fail → Review failed tests, fix, rerun
```

---

## Test Selection Matrix

### By Time Available

#### 5 Minutes (Smoke Test)
- **Priority**: P0 Critical only
- **Run**:
  - Script 1: Middle-click
  - Script 2: Context menu (partial)
- **Coverage**: ~30% of critical issues
- **Good for**: Quick verification after small fix

#### 15 Minutes (Quick Validation)
- **Priority**: P0 + Basic keyboard
- **Run**:
  - Script 1: Middle-click
  - Script 2: Context menu
  - Script 3: Keyboard nav
- **Coverage**: ~60% of critical issues
- **Good for**: Pre-commit check

#### 30 Minutes (Standard Testing)
- **Priority**: P0 + P1 High
- **Run**:
  - Scripts 1-5: All desktop + mobile
  - Script 10: Reduced motion
- **Coverage**: ~80% of all issues
- **Good for**: Before PR / merge to main

#### 1 Hour (Full Testing)
- **Priority**: All priorities
- **Run**:
  - Scripts 1-12: Complete suite
  - Regression checklist
- **Coverage**: 100%
- **Good for**: Release candidate testing

#### 2+ Hours (Comprehensive + Automation)
- **Priority**: Everything + automation setup
- **Run**:
  - All manual scripts
  - Set up Playwright
  - Run automated suite
  - Cross-browser testing
- **Coverage**: 100% + regression prevention
- **Good for**: Major releases, new feature branches

---

### By Change Type

#### Changed: CustomLink.jsx
**Tests to Run**:
1. ✅ Script 1: Middle-click (5 min)
2. ✅ Script 2: Context menu (5 min)
3. ✅ Script 6: Anchor links (10 min) - if added anchor support
4. ✅ Script 8: Back/forward (5 min)

**Total**: 15-25 minutes
**Skip**: Mobile (unless changing scroll logic), Screen reader (unless changing attributes)

---

#### Changed: Layout.jsx (Button → Link)
**Tests to Run**:
1. ✅ Script 2: Context menu (5 min)
2. ✅ Script 3: Keyboard nav (10 min)
3. ✅ Script 4: Screen reader (15 min)
4. ✅ Script 7: JS disabled (10 min)

**Total**: 40 minutes
**Skip**: Anchor links, External links (unchanged)

---

#### Changed: mobileScrollUtils.js
**Tests to Run**:
1. ✅ Script 5: Mobile touch (10 min)
2. ✅ Script 8: Back/forward (5 min)
3. ✅ Script 10: Reduced motion (5 min)

**Total**: 20 minutes
**Skip**: Desktop-only tests (middle-click works regardless)

---

#### Changed: index.css (Accessibility)
**Tests to Run**:
1. ✅ Script 3: Keyboard nav - focus visible (10 min)
2. ✅ Script 10: Reduced motion (5 min)

**Total**: 15 minutes
**Skip**: Navigation mechanics (CSS doesn't affect JS)

---

#### Changed: main.jsx (Removed user-scalable=no)
**Tests to Run**:
1. ✅ Script 5: Mobile touch - pinch zoom test (10 min)

**Total**: 10 minutes
**Test on**: iOS Safari, Android Chrome

---

#### Changed: App.jsx (Added 404 route)
**Tests to Run**:
1. ✅ Navigate to `/invalid-url` → verify 404 page
2. ✅ Verify 404 page has navigation back to home
3. ✅ Check server returns 404 status (in production)

**Total**: 5 minutes

---

### By User Type / Scenario

#### Desktop Power User
**Behaviors**:
- Middle-click to open tabs
- Right-click for context menu
- Keyboard shortcuts (Cmd/Ctrl+click)
- Multiple windows/tabs

**Critical Tests**:
- ✅ Script 1: Middle-click
- ✅ Script 2: Context menu
- ✅ Script 8: Back/forward

**Time**: 15 minutes

---

#### Mobile User
**Behaviors**:
- Tap navigation
- Long-press for options
- Pinch-zoom to read
- Landscape/portrait switching

**Critical Tests**:
- ✅ Script 5: Mobile touch
- ✅ Test on iOS Safari (most important)
- ✅ Test on Android Chrome

**Time**: 20 minutes

---

#### Accessibility User
**Behaviors**:
- Screen reader navigation
- Keyboard-only navigation
- Reduced motion preference
- Zoom for readability

**Critical Tests**:
- ✅ Script 3: Keyboard nav
- ✅ Script 4: Screen reader
- ✅ Script 10: Reduced motion
- ✅ Script 5: Pinch-zoom (mobile)

**Time**: 40 minutes

---

#### Corporate/Restricted User
**Behaviors**:
- JavaScript might be disabled
- Strict security policies
- Limited browser updates

**Critical Tests**:
- ✅ Script 7: JS disabled
- ✅ Script 9: External link security

**Time**: 15 minutes

---

### By Platform

#### Testing on macOS
**Available Tools**:
- Chrome, Firefox, Safari, Edge (all latest)
- iOS Simulator (Xcode)
- VoiceOver (built-in)

**Recommended Tests**:
1. Desktop browsers (Chrome, Safari, Firefox)
2. Keyboard nav + VoiceOver
3. iOS Simulator for mobile testing

**Time**: 45 minutes (comprehensive)

---

#### Testing on Windows
**Available Tools**:
- Chrome, Firefox, Edge (all latest)
- NVDA screen reader (free)
- Android Emulator (Android Studio)

**Recommended Tests**:
1. Desktop browsers (Chrome, Edge, Firefox)
2. Keyboard nav + NVDA
3. Android Emulator for mobile

**Time**: 45 minutes (comprehensive)

---

#### Testing on Linux
**Available Tools**:
- Chrome, Firefox (all latest)
- Orca screen reader
- Android Emulator

**Recommended Tests**:
1. Desktop browsers (Chrome, Firefox)
2. Keyboard nav + Orca
3. Android Emulator

**Time**: 30 minutes (limited mobile testing)

---

## Issue Diagnosis Flowchart

```
Middle-click not working?
│
├─ Does left-click work?
│  │
│  ├─ YES → Check handleClick for modified click detection
│  │        Look for: e.button !== 0 || e.metaKey || e.ctrlKey
│  │
│  └─ NO → Navigation completely broken
│           Check: navigateWithScrollToTop implementation
│
├─ Does right-click show link options?
│  │
│  ├─ YES → Context menu works, check middle-click event handler
│  │
│  └─ NO → Element is <button>, not <a>
│           Fix: Convert to <a href onClick>
│
└─ Does Cmd+click work?
   │
   ├─ YES → Middle-click handler issue (check e.button === 1)
   │
   └─ NO → Modified click detection missing
           Add: if (e.metaKey || e.ctrlKey) return
```

---

```
Keyboard navigation not working?
│
├─ Can you Tab to links?
│  │
│  ├─ YES → Tab works, check Enter key activation
│  │        Issue: onClick without href
│  │        Fix: Add href attribute
│  │
│  └─ NO → Elements not focusable
│           Issue: <button> or <div> used for links
│           Fix: Use <a> tags
│
├─ Is focus visible?
│  │
│  ├─ YES → Good, check contrast/visibility
│  │
│  └─ NO → CSS removes outline
│           Issue: outline: none without alternative
│           Fix: Add visible focus indicator
│
└─ Does Enter activate?
   │
   ├─ YES → Working correctly
   │
   └─ NO → Event handler missing
           Check: onClick implementation
```

---

```
Screen reader not announcing correctly?
│
├─ Is element announced as "link"?
│  │
│  ├─ YES → Good, check link text clarity
│  │
│  └─ NO → Element is <button>
│           Fix: Convert to <a href>
│
├─ Is destination announced?
│  │
│  ├─ YES → Href present, good
│  │
│  └─ NO → Missing href attribute
│           Fix: Add href even with onClick
│
└─ Is activation working?
   │
   ├─ YES → Page navigates correctly
   │
   └─ NO → onClick blocks activation
           Check: Event handler logic
```

---

```
Mobile tap not working?
│
├─ Is there a tap delay?
│  │
│  ├─ YES → Check touch-action CSS
│  │        Issue: 300ms delay not removed
│  │        Fix: touch-action: manipulation
│  │
│  └─ NO → Check if tap registers
│
├─ Does long-press show menu?
│  │
│  ├─ YES → Element is <a>, check onClick
│  │
│  └─ NO → Element might be <button>
│           Fix: Convert to <a href>
│
└─ Can you pinch-zoom?
   │
   ├─ YES → Zoom works correctly
   │
   └─ NO → user-scalable=no set
           Fix: Remove from viewport meta tag
```

---

```
Anchor links not scrolling?
│
├─ Does URL update with hash?
│  │
│  ├─ YES → History works, check scroll
│  │        Issue: Element not found or scroll blocked
│  │        Fix: Check querySelector and scrollIntoView
│  │
│  └─ NO → Hash not detected
│           Issue: to.startsWith('#') check missing
│           Fix: Add hash detection logic
│
├─ Is target element in DOM?
│  │
│  ├─ YES → Element exists, check scroll behavior
│  │
│  └─ NO → ID doesn't match
│           Fix: Verify id attribute on target
│
└─ Does manual scrollIntoView work?
   │
   ├─ YES → Click handler issue
   │        Check: preventDefault called too early
   │
   └─ NO → CSS or layout preventing scroll
           Check: position: fixed, overflow: hidden
```

---

## Pre-Deployment Checklist

### Before Pushing to Preview
```
[ ] All P0 critical fixes implemented
[ ] Ran Scripts 1-3 (middle-click, context menu, keyboard)
[ ] No console errors
[ ] Build succeeds (npm run build)
[ ] Lighthouse score >90
```

**Time**: 20 minutes
**Can Skip**: Full accessibility, mobile (test on preview)

---

### Before Merging to Main
```
[ ] All P0 + P1 fixes implemented
[ ] Ran Scripts 1-5, 10 (desktop + mobile + reduced motion)
[ ] Tested on Chrome, Safari, Firefox
[ ] Tested on mobile (iOS + Android)
[ ] Screen reader basic test (VoiceOver or NVDA)
[ ] No accessibility violations (axe DevTools)
[ ] Preview deployment tested
[ ] Code reviewed
```

**Time**: 1 hour
**Can Skip**: Automated tests (nice to have)

---

### Before Production Release
```
[ ] All fixes implemented (P0, P1, P2)
[ ] Full regression checklist completed
[ ] Tested on all target browsers
[ ] Tested on real mobile devices
[ ] Screen reader comprehensive test
[ ] Lighthouse audit passed (all categories >90)
[ ] Load tested (no performance regression)
[ ] 404 page implemented
[ ] Error tracking configured
[ ] Rollback plan documented
```

**Time**: 2+ hours
**Required**: All items must pass

---

## Red Flags (Stop and Fix)

### 🛑 Critical - Block Release
- Middle-click doesn't open new tab
- Keyboard navigation completely broken
- Screen reader can't navigate
- Site crashes on mobile
- JavaScript errors in console
- Lighthouse accessibility score <80

### ⚠️ High Priority - Fix Before Merge
- Right-click context menu missing link options
- Can't zoom on mobile (user-scalable=no)
- Reduced motion not respected
- Links don't work if JS disabled
- Back button broken
- Focus indicators invisible

### ℹ️ Medium Priority - Fix Soon
- Anchor links don't scroll
- No 404 page (shows homepage)
- Performance degradation (Lighthouse <90)
- Memory leaks on navigation
- Rapid click causes duplicate navigation

---

## When in Doubt

**Quick Check** (5 minutes):
1. Middle-click a link → should open new tab
2. Right-click a link → should see "Open in New Tab"
3. Tab to a link, press Enter → should navigate
4. Test on iPhone or iOS Simulator → should work

**If any fail**: Don't merge. Fix the failing test first.

**If all pass**: Likely good for basic users. Run full suite before major release.

---

## Common Testing Mistakes

### ❌ Don't Do This
- Testing only on your primary browser (test 3+ browsers)
- Skipping mobile testing (40% of traffic)
- Ignoring accessibility (legal requirement)
- Testing only happy path (test edge cases)
- Not testing on real devices (emulators miss issues)
- Skipping keyboard testing (power users depend on it)

### ✅ Do This Instead
- Test on Chrome, Firefox, Safari at minimum
- Test on real iPhone or iPad (iOS Safari is unique)
- Use VoiceOver or NVDA for every navigation change
- Test middle-click, right-click, keyboard, touch
- Use both simulator AND real device
- Tab through entire page without mouse

---

## Testing Efficiency Tips

### Parallel Testing
- **Automated Suite**: Run on CI/CD (no time cost)
- **Multiple Browsers**: Open 3+ browsers, test in parallel
- **Device Farm**: Use BrowserStack/Sauce Labs for simultaneous tests

### Caching Results
- **If nothing changed**: Skip unaffected tests
- **If only CSS changed**: Skip navigation mechanics tests
- **If only JS changed**: Focus on functionality, skip visual tests

### Smart Regression
- **First run**: Full suite (1 hour)
- **Subsequent runs**: Only changed components (15 min)
- **Before release**: Full suite again (1 hour)

---

## Tools Quick Reference

### Browser DevTools
- **Console**: Check for errors (F12 → Console)
- **Network**: Monitor requests (F12 → Network)
- **Lighthouse**: Audit performance/accessibility (F12 → Lighthouse)
- **Device Mode**: Mobile emulation (F12 → Device toolbar)

### Accessibility Tools
- **VoiceOver**: Mac/iOS screen reader (Cmd+F5)
- **NVDA**: Windows screen reader (free download)
- **axe DevTools**: Browser extension for accessibility audit
- **WAVE**: Browser extension for visual accessibility check

### Testing Services
- **BrowserStack**: Real device cloud testing (paid)
- **Sauce Labs**: Cross-browser testing (paid)
- **LambdaTest**: Browser compatibility (paid/free tier)
- **Playwright**: Automated testing (free, self-hosted)

---

## Getting Unstuck

### "I don't know which test to run"
→ Start with **Script 1-3** (middle-click, context menu, keyboard) - 20 minutes

### "Tests are taking too long"
→ Run **5-minute smoke test** only, full testing on CI/CD

### "I don't have an iPhone"
→ Use **Xcode iOS Simulator** (Mac) or **BrowserStack** (any OS)

### "Screen reader is confusing"
→ Just check: Links announced as "Link" not "Button"? Good enough for basic test.

### "Test failed but I don't know why"
→ Check **Issue Diagnosis Flowchart** above for specific problem

### "Do I really need all these tests?"
→ **Minimum**: Scripts 1-3. **Recommended**: Scripts 1-5 + 10. **Ideal**: Full suite.

---

## Summary Recommendations

### For Every Commit
- Quick validation (Scripts 1-3): **15 minutes**
- Worth it? **Yes** - catches 60% of issues immediately

### For Every PR
- Standard testing (Scripts 1-5, 10): **30 minutes**
- Worth it? **Yes** - catches 80% of issues before review

### For Every Release
- Full testing (all scripts + checklist): **1-2 hours**
- Worth it? **Absolutely** - prevents production bugs, legal issues, user complaints

---

**Next Step**: Read `/docs/testing/NAVIGATION_QUICK_FIXES.md` for implementation code.
