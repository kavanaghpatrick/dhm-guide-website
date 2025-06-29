/**
 * Test file for mobile scroll behavior
 * This file can be imported and used to test the mobile scroll fixes
 * 
 * To test:
 * 1. Open developer tools on mobile device or mobile simulator
 * 2. Run: import('./test-mobile-scroll.js').then(m => m.runScrollTests())
 * 3. Or add to browser console: window.testMobileScroll()
 */

import { scrollToTop, hasPotentialScrollIssues, testScrollBehavior } from './lib/mobileScrollUtils.js'

/**
 * Comprehensive test suite for mobile scroll behavior
 */
export function runScrollTests() {
  console.log('🧪 Starting Mobile Scroll Test Suite')
  console.log('=====================================')
  
  // Test 1: Device Detection
  console.log('\n📱 Test 1: Device Detection')
  console.log('Has potential scroll issues:', hasPotentialScrollIssues())
  console.log('User Agent:', navigator.userAgent)
  console.log('Screen width:', window.innerWidth)
  console.log('Is iOS:', /iPad|iPhone|iPod/.test(navigator.userAgent))
  console.log('Is Safari:', /^((?!chrome|android).)*safari/i.test(navigator.userAgent))
  
  // Test 2: Current Scroll Position
  console.log('\n📍 Test 2: Current Scroll Position')
  console.log('window.pageYOffset:', window.pageYOffset)
  console.log('document.documentElement.scrollTop:', document.documentElement.scrollTop)
  console.log('document.body.scrollTop:', document.body.scrollTop)
  console.log('Current CSS scroll-behavior:', getComputedStyle(document.documentElement).scrollBehavior)
  
  // Test 3: Scroll to Middle (to test scroll-to-top from a scrolled position)
  console.log('\n⬇️ Test 3: Scrolling to middle of page for testing')
  const middlePosition = Math.max(document.body.scrollHeight, window.innerHeight) / 2
  window.scrollTo(0, middlePosition)
  
  setTimeout(() => {
    console.log('Scrolled to position:', window.pageYOffset)
    
    // Test 4: Test Scroll to Top
    console.log('\n⬆️ Test 4: Testing scroll to top')
    const startTime = Date.now()
    
    scrollToTop()
    
    // Check results after scroll completes
    setTimeout(() => {
      const endTime = Date.now()
      const finalPosition = window.pageYOffset
      
      console.log('Scroll completed in:', endTime - startTime, 'ms')
      console.log('Final scroll position:', finalPosition)
      console.log('Scroll successful:', finalPosition === 0 ? '✅' : '❌')
      
      if (finalPosition !== 0) {
        console.warn('⚠️ Scroll to top failed. Trying fallback methods...')
        
        // Try fallback methods
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
        
        setTimeout(() => {
          console.log('After fallback - Final position:', window.pageYOffset)
        }, 100)
      } else {
        console.log('✅ Mobile scroll to top working correctly!')
      }
    }, 300)
  }, 500)
  
  // Test 5: CSS Behavior Test
  console.log('\n🎨 Test 5: CSS Behavior Tests')
  const html = document.documentElement
  const originalBehavior = html.style.scrollBehavior
  
  console.log('Original scroll-behavior:', originalBehavior || 'default')
  
  // Test CSS override
  html.style.scrollBehavior = 'auto'
  console.log('After setting to auto:', getComputedStyle(html).scrollBehavior)
  
  html.classList.add('scroll-auto')
  console.log('After adding scroll-auto class:', getComputedStyle(html).scrollBehavior)
  
  // Restore
  html.style.scrollBehavior = originalBehavior
  html.classList.remove('scroll-auto')
  
  console.log('\n🏁 Test Suite Complete')
}

/**
 * Simple scroll test for quick debugging
 */
export function quickScrollTest() {
  console.log('Quick scroll test - scrolling to middle then back to top')
  
  // Scroll to middle
  window.scrollTo(0, 500)
  
  setTimeout(() => {
    console.log('Current position:', window.pageYOffset)
    scrollToTop()
    
    setTimeout(() => {
      console.log('Final position:', window.pageYOffset)
      console.log(window.pageYOffset === 0 ? '✅ Success' : '❌ Failed')
    }, 200)
  }, 500)
}

/**
 * Test footer navigation specifically
 */
export function testFooterNavigation() {
  console.log('Testing footer navigation scroll behavior')
  
  // Find footer buttons
  const footerButtons = document.querySelectorAll('footer button')
  console.log('Found', footerButtons.length, 'footer buttons')
  
  if (footerButtons.length > 0) {
    console.log('Footer button touch-action styles:')
    footerButtons.forEach((button, index) => {
      const styles = getComputedStyle(button)
      console.log(`Button ${index + 1}:`, {
        touchAction: styles.touchAction,
        tapHighlightColor: styles.webkitTapHighlightColor,
        cursor: styles.cursor
      })
    })
  }
}

// Make functions available globally for easy testing
if (typeof window !== 'undefined') {
  window.runScrollTests = runScrollTests
  window.quickScrollTest = quickScrollTest
  window.testFooterNavigation = testFooterNavigation
  window.testScrollBehavior = testScrollBehavior
  window.testMobileScroll = runScrollTests // alias for convenience
  
  console.log('📱 Mobile scroll test functions loaded!')
  console.log('Available test functions:')
  console.log('  - window.runScrollTests() - Full test suite')
  console.log('  - window.quickScrollTest() - Quick test')
  console.log('  - window.testFooterNavigation() - Footer specific test')
  console.log('  - window.testScrollBehavior() - Utility test function')
  console.log('  - window.testMobileScroll() - Alias for runScrollTests')
}