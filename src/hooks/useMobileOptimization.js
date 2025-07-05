import { useState, useEffect, useCallback } from 'react'

export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [orientation, setOrientation] = useState('portrait')
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    // Check if device supports touch
    const checkTouch = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTouch(touch)
    }

    // Update viewport size
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Check orientation
    const checkOrientation = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    // Detect virtual keyboard
    const detectKeyboard = () => {
      const threshold = 150 // Minimum height difference to consider keyboard visible
      const currentHeight = window.innerHeight
      const initialHeight = viewportSize.height || currentHeight

      if (isMobile && currentHeight < initialHeight - threshold) {
        setKeyboardVisible(true)
      } else {
        setKeyboardVisible(false)
      }
    }

    // Initial checks
    checkMobile()
    checkTouch()
    updateViewportSize()
    checkOrientation()

    // Event listeners
    window.addEventListener('resize', updateViewportSize)
    window.addEventListener('resize', detectKeyboard)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', updateViewportSize)
      window.removeEventListener('resize', detectKeyboard)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [viewportSize.height, isMobile])

  // Utility functions
  const preventZoom = useCallback(() => {
    // Prevent zoom on double tap
    let lastTouchEnd = 0
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)

    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea')
    inputs.forEach(input => {
      input.style.fontSize = '16px' // Prevents zoom on iOS
    })
  }, [])

  const scrollToElement = useCallback((element, options = {}) => {
    if (!element) return

    const defaultOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    }

    // Account for fixed headers on mobile
    if (isMobile) {
      const yOffset = -80 // Adjust based on your header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: defaultOptions.behavior
      })
    } else {
      element.scrollIntoView(defaultOptions)
    }
  }, [isMobile])

  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator && isMobile) {
      switch (type) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate(30)
          break
        case 'success':
          navigator.vibrate([10, 10, 10])
          break
        case 'error':
          navigator.vibrate([50, 20, 50])
          break
        default:
          navigator.vibrate(10)
      }
    }
  }, [isMobile])

  const optimizeInput = useCallback((inputRef) => {
    if (!inputRef?.current || !isMobile) return

    const input = inputRef.current

    // Set appropriate input mode for better keyboards
    if (input.type === 'number') {
      input.inputMode = 'numeric'
      input.pattern = '[0-9]*'
    }

    // Prevent zoom on focus
    input.style.fontSize = '16px'

    // Auto-scroll to input on focus
    input.addEventListener('focus', () => {
      setTimeout(() => {
        scrollToElement(input, { block: 'center' })
      }, 300)
    })
  }, [isMobile, scrollToElement])

  return {
    isMobile,
    isTouch,
    viewportSize,
    orientation,
    keyboardVisible,
    preventZoom,
    scrollToElement,
    hapticFeedback,
    optimizeInput,
    // Utility classes
    mobileClasses: isMobile ? 'mobile-device' : 'desktop-device',
    touchClasses: isTouch ? 'touch-enabled' : 'touch-disabled',
    orientationClasses: `orientation-${orientation}`,
    // Responsive utilities
    isSmallScreen: viewportSize.width < 640,
    isMediumScreen: viewportSize.width >= 640 && viewportSize.width < 1024,
    isLargeScreen: viewportSize.width >= 1024
  }
}