# Mobile Scroll Testing Guide

## Issue Description
Footer navigation links (particularly "see research data" which maps to "/research") were not scrolling to top on mobile devices, even though the desktop version worked fine.

## Root Cause
The issue was caused by **iOS Safari's CSS `scroll-behavior: smooth` conflict** with JavaScript `window.scrollTo()`. This is a known Safari bug where CSS smooth scroll can disable programmatic scrolling operations.

## Solution Implemented

### 1. Mobile-Safe Scroll Utility (`/src/lib/mobileScrollUtils.js`)
- Detects iOS Safari and mobile browsers
- Temporarily disables CSS `scroll-behavior` during programmatic scrolling  
- Provides multiple fallback methods for maximum compatibility
- Restores original scroll behavior after scrolling completes

### 2. Updated Navigation Components
- **Layout.jsx**: Updated footer navigation to use new mobile-safe scroll utility
- **CustomLink.jsx**: Updated custom link component with same mobile-safe behavior

### 3. CSS Fixes (`/src/index.css`)
- Added mobile-specific CSS rules for scroll behavior
- iOS Safari specific fixes for viewport and touch handling
- Enhanced touch action for footer navigation elements

## Testing Instructions

### Quick Test (Recommended)
1. Open the website on a mobile device (iOS Safari, Android Chrome)
2. Scroll down to the footer
3. Tap any footer navigation link (e.g., "Scientific Studies")
4. Verify the page scrolls to the top smoothly

### Comprehensive Testing
1. Open browser developer tools on mobile device
2. Run in console: `window.testMobileScroll()`
3. This will run a full test suite checking:
   - Device detection
   - Current scroll position
   - Scroll to top functionality
   - CSS behavior overrides
   - Fallback methods

### Manual Testing Checklist
- [ ] iOS Safari (iPhone/iPad)
- [ ] Android Chrome
- [ ] Android Firefox
- [ ] Desktop Safari (for comparison)
- [ ] Desktop Chrome (for comparison)

**Test each:**
- [ ] Header navigation links
- [ ] Footer navigation links
- [ ] Custom Link components
- [ ] Both portrait and landscape orientations

## Technical Details

### Browsers Affected
- **iOS Safari**: All versions (primary issue)
- **Mobile Safari**: WebKit-based browsers on iOS
- **Some Android browsers**: Webkit-based browsers may have similar issues

### Fix Strategy
1. **Device Detection**: Identify problematic browsers
2. **CSS Override**: Temporarily set `scroll-behavior: auto`
3. **Multiple Methods**: Try different scroll approaches
4. **Fallback Chain**: Use document.body and documentElement if needed
5. **Restoration**: Restore original CSS behavior

### Code Example
```javascript
// Before (problematic)
window.scrollTo({ top: 0, behavior: 'smooth' })

// After (mobile-safe)
import { scrollToTop } from '@/lib/mobileScrollUtils.js'
scrollToTop() // Handles all mobile compatibility issues
```

## Debugging Commands

Available in browser console:
- `window.testMobileScroll()` - Full test suite
- `window.quickScrollTest()` - Quick functionality test  
- `window.testFooterNavigation()` - Test footer-specific behavior
- `window.testScrollBehavior()` - Test scroll behavior detection

## Files Modified
- `/src/components/layout/Layout.jsx` - Updated footer navigation
- `/src/components/CustomLink.jsx` - Updated custom links
- `/src/index.css` - Added mobile-specific CSS fixes
- `/src/lib/mobileScrollUtils.js` - New mobile scroll utility (created)
- `/src/test-mobile-scroll.js` - Testing utilities (created)

## Performance Impact
- Minimal performance impact
- Only affects mobile devices
- Uses feature detection to minimize overhead
- Fallback methods only trigger on problematic browsers

## Browser Compatibility
- **iOS Safari**: All versions (with fallbacks for older versions)
- **Android Chrome**: Full support
- **Android Firefox**: Full support  
- **Desktop**: No changes to existing behavior
- **Other mobile browsers**: Graceful degradation with fallbacks

## Monitoring
After deployment, monitor for:
- Mobile bounce rate on navigation
- User feedback about scroll behavior
- Console errors related to scrolling
- Performance metrics on mobile devices