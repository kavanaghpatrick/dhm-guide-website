// Engagement Tracking Utility for DHM Calculator

class EngagementTracker {
  constructor() {
    this.events = []
    this.sessionStartTime = Date.now()
    this.pageLoadTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.interactions = {
      calculatorStarts: 0,
      calculatorCompletions: 0,
      emailCaptures: 0,
      downloads: 0,
      shares: 0,
      quizCompletions: 0,
      scrollDepth: 0,
      timeOnPage: 0,
      bounceRisk: false
    }
    
    this.eventListeners = []
    this.bounceTimer = null
    this.scrollMilestones = {}
    this.exitIntentShown = false
    
    this.initializeTracking()
  }

  initializeTracking() {
    // Track page visibility
    const visibilityHandler = () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { timeOnPage: this.getTimeOnPage() })
      } else {
        this.trackEvent('page_visible', { timeOnPage: this.getTimeOnPage() })
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler)
    this.eventListeners.push({ element: document, event: 'visibilitychange', handler: visibilityHandler })

    // Track scroll depth
    let maxScrollDepth = 0
    const scrollHandler = () => {
      const scrollDepth = this.calculateScrollDepth()
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        this.interactions.scrollDepth = maxScrollDepth
        
        // Track milestone scroll depths
        if (maxScrollDepth >= 25 && !this.scrollMilestones?.['25']) {
          this.trackEvent('scroll_depth_25', { depth: 25 })
          this.scrollMilestones = { ...this.scrollMilestones, '25': true }
        }
        if (maxScrollDepth >= 50 && !this.scrollMilestones?.['50']) {
          this.trackEvent('scroll_depth_50', { depth: 50 })
          this.scrollMilestones = { ...this.scrollMilestones, '50': true }
        }
        if (maxScrollDepth >= 75 && !this.scrollMilestones?.['75']) {
          this.trackEvent('scroll_depth_75', { depth: 75 })
          this.scrollMilestones = { ...this.scrollMilestones, '75': true }
        }
        if (maxScrollDepth >= 90 && !this.scrollMilestones?.['90']) {
          this.trackEvent('scroll_depth_90', { depth: 90 })
          this.scrollMilestones = { ...this.scrollMilestones, '90': true }
        }
      }
    }
    window.addEventListener('scroll', scrollHandler)
    this.eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler })

    // Track bounce risk
    this.bounceTimer = setTimeout(() => {
      if (this.interactions.calculatorStarts === 0 && this.interactions.scrollDepth < 25) {
        this.interactions.bounceRisk = true
        this.trackEvent('bounce_risk_detected', { 
          timeOnPage: this.getTimeOnPage(),
          scrollDepth: this.interactions.scrollDepth 
        })
      }
    }, 10000) // 10 seconds
  }

  calculateScrollDepth() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    return Math.round((scrollTop / documentHeight) * 100)
  }

  getTimeOnPage() {
    return Math.round((Date.now() - this.sessionStartTime) / 1000) // in seconds
  }

  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      timeOnPage: this.getTimeOnPage(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer || 'direct',
        url: window.location.href
      }
    }

    this.events.push(event)

    // Send to PostHog (primary analytics)
    if (typeof window !== 'undefined' && window.posthog) {
      try {
        window.posthog.capture(`calculator_${eventName}`, {
          ...data,
          time_on_page_seconds: this.getTimeOnPage(),
          page_path: window.location.pathname,
          device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        })
      } catch (e) {
        // Silently fail
      }
    }

    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'DHM_Calculator_Engagement',
        event_label: JSON.stringify(data),
        value: data.value || 0,
        ...data
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Engagement Event:', event)
    }
  }

  // Calculator specific tracking
  trackCalculatorStart() {
    this.interactions.calculatorStarts++
    this.trackEvent('calculator_started', { 
      attempt: this.interactions.calculatorStarts 
    })
  }

  trackCalculatorProgress(progress) {
    this.trackEvent('calculator_progress', { 
      progress: Math.round(progress),
      fields_completed: Math.round(progress / 20) // Assuming 5 fields
    })
  }

  trackCalculatorCompletion(dosage) {
    this.interactions.calculatorCompletions++
    this.trackEvent('calculator_completed', { 
      dosage,
      completion_rate: (this.interactions.calculatorCompletions / this.interactions.calculatorStarts) * 100
    })
  }

  trackQuizCompletion(answers) {
    this.interactions.quizCompletions++
    this.trackEvent('quiz_completed', { 
      answers,
      quiz_completions: this.interactions.quizCompletions
    })
  }

  trackEmailCapture(source) {
    this.interactions.emailCaptures++
    this.trackEvent('email_captured', { 
      source, // 'exit_intent', 'results', 'inline'
      capture_rate: (this.interactions.emailCaptures / this.interactions.calculatorCompletions) * 100
    })
  }

  trackDownload(type) {
    this.interactions.downloads++
    this.trackEvent('protocol_downloaded', { 
      type, // 'pdf', 'txt'
      downloads: this.interactions.downloads
    })
  }

  trackShare(method) {
    this.interactions.shares++
    this.trackEvent('results_shared', { 
      method, // 'native', 'clipboard', 'whatsapp'
      shares: this.interactions.shares
    })
  }

  trackExitIntent() {
    this.trackEvent('exit_intent_triggered', { 
      timeOnPage: this.getTimeOnPage(),
      calculatorProgress: this.interactions.calculatorStarts > 0,
      scrollDepth: this.interactions.scrollDepth
    })
  }

  // Get engagement metrics
  getEngagementMetrics() {
    return {
      timeOnPage: this.getTimeOnPage(),
      scrollDepth: this.interactions.scrollDepth,
      calculatorEngagement: {
        starts: this.interactions.calculatorStarts,
        completions: this.interactions.calculatorCompletions,
        completionRate: this.interactions.calculatorStarts > 0 
          ? (this.interactions.calculatorCompletions / this.interactions.calculatorStarts) * 100 
          : 0
      },
      conversions: {
        emails: this.interactions.emailCaptures,
        downloads: this.interactions.downloads,
        shares: this.interactions.shares
      },
      bounceRisk: this.interactions.bounceRisk,
      totalEvents: this.events.length
    }
  }

  // Performance tracking
  trackPerformance() {
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      const domReady = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      const firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0
      
      this.trackEvent('page_performance', {
        loadTime,
        domReady,
        firstPaint,
        connectionType: navigator.connection?.effectiveType || 'unknown'
      })
    }
  }
  
  // Cleanup method to prevent memory leaks
  cleanup() {
    // Clear timers
    if (this.bounceTimer) {
      clearTimeout(this.bounceTimer)
      this.bounceTimer = null
    }
    
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    this.eventListeners = []
  }
}

// Create singleton instance with lazy initialization
let engagementTrackerInstance = null

const getEngagementTracker = () => {
  if (!engagementTrackerInstance && typeof window !== 'undefined') {
    engagementTrackerInstance = new EngagementTracker()
  }
  return engagementTrackerInstance || {
    // Stub methods for SSR/initial load
    trackEvent: () => {},
    trackScroll: () => {},
    trackTimeOnPage: () => {},
    getEngagementData: () => ({})
  }
}

export default getEngagementTracker()