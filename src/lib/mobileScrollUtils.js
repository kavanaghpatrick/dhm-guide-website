/**
 * Mobile-safe scroll utilities for handling iOS Safari scroll behavior conflicts
 * and ensuring consistent scroll-to-top behavior across all mobile browsers
 */

/**
 * Scrolls to the top of the page with mobile-specific compatibility fixes
 * Handles iOS Safari CSS scroll-behavior conflicts and provides fallbacks
 */
export function scrollToTop() {
  // Detect iOS and mobile devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobile = window.innerWidth < 768
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  
  if (isIOS || (isMobile && isSafari)) {
    // iOS Safari and mobile Safari specific handling
    const html = document.documentElement
    const body = document.body
    const originalScrollBehavior = html.style.scrollBehavior
    
    // Temporarily disable CSS scroll-behavior to prevent conflicts
    html.style.scrollBehavior = 'auto'
    body.style.scrollBehavior = 'auto'
    html.classList.add('scroll-auto')
    
    // Force immediate scroll to top using multiple methods
    const forceScrollToTop = () => {
      // Method 1: Direct property assignment (most reliable for iOS)
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
      
      // Method 2: Set scroll position via properties
      if (window.pageYOffset !== 0) {
        window.pageYOffset = 0
      }
      
      // Method 3: Force layout recalculation
      html.scrollTop = 0
      body.scrollTop = 0
      
      // Method 4: Use scroll methods if available
      if (window.scroll) {
        window.scroll(0, 0)
      }
    }
    
    // Execute immediately
    forceScrollToTop()
    
    // Multiple attempts with increasing delays for iOS Safari
    setTimeout(forceScrollToTop, 16)  // Next frame
    setTimeout(forceScrollToTop, 32)  // Two frames
    setTimeout(forceScrollToTop, 100) // After potential animations
    
    // Restore original scroll behavior after scrolling completes
    setTimeout(() => {
      html.style.scrollBehavior = originalScrollBehavior
      body.style.scrollBehavior = ''
      html.classList.remove('scroll-auto')
    }, 250)
    
  } else if (isMobile) {
    // Other mobile browsers (Android Chrome, Firefox Mobile, etc.)
    try {
      // Try smooth scroll first
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    } catch (e) {
      // Fallback to instant scroll
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }
  } else {
    // Desktop: use standard smooth scroll
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * Enhanced navigation handler with mobile-safe scroll-to-top
 * @param {string} href - The URL to navigate to
 * @param {Function} onNavigate - Optional callback after navigation
 */
export function navigateWithScrollToTop(href, onNavigate) {
  // Update URL and trigger popstate event
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
  
  // Execute callback if provided (e.g., closing mobile menu)
  if (onNavigate) {
    onNavigate()
  }
  
  // Immediate scroll attempt
  scrollToTop()
  
  // Additional delayed attempts for stubborn mobile browsers
  setTimeout(scrollToTop, 50)
  setTimeout(scrollToTop, 150)
  setTimeout(scrollToTop, 300)
}

/**
 * Check if the current device is likely to have scroll issues
 * Useful for conditional logic or debugging
 */
export function hasPotentialScrollIssues() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const isMobile = window.innerWidth < 768
  
  return isIOS || (isMobile && isSafari)
}

/**
 * Debug function to test scroll behavior
 * Can be called from browser console for testing
 */
export function testScrollBehavior() {
  console.log('Testing scroll behavior...')
  console.log('Device info:', {
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isMobile: window.innerWidth < 768,
    userAgent: navigator.userAgent,
    hasPotentialIssues: hasPotentialScrollIssues()
  })
  
  console.log('Current scroll position:', {
    pageYOffset: window.pageYOffset,
    documentElementScrollTop: document.documentElement.scrollTop,
    bodyScrollTop: document.body.scrollTop
  })
  
  scrollToTop()
  
  setTimeout(() => {
    console.log('Scroll position after scrollToTop:', {
      pageYOffset: window.pageYOffset,
      documentElementScrollTop: document.documentElement.scrollTop,
      bodyScrollTop: document.body.scrollTop
    })
  }, 200)
}

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  window.testScrollBehavior = testScrollBehavior
}