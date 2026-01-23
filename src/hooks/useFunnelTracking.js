/**
 * Conversion Funnel Tracking Hook
 *
 * Tracks user progression through the conversion funnel:
 * 1. Landing - Page view (already tracked via capture_pageview)
 * 2. Engagement - Scroll depth 50%+ OR time on page 30s+
 * 3. Product Interest - Product card view OR comparison table view
 * 4. CTA Click - CTA button click (tracked via useElementTracking)
 * 5. Affiliate Click - Amazon link click (tracked via useAffiliateTracking)
 *
 * Uses IntersectionObserver for visibility tracking of product elements.
 */
import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '../lib/posthog';

// Selectors for product interest elements
const PRODUCT_INTEREST_SELECTORS = [
  '.product-card',
  '[data-track="product"]',
  '[class*="product-card"]',
  '.comparison-table',
  '[data-track="comparison"]',
  '[class*="comparison"]',
  '.review-card',
  '[data-product-name]'
];

/**
 * Get device type from viewport width
 */
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Get page type from URL
 */
const getPageType = () => {
  if (typeof window === 'undefined') return 'unknown';
  const path = window.location.pathname;

  if (path === '/') return 'home';
  if (path.startsWith('/never-hungover/')) return 'blog';
  if (path === '/never-hungover') return 'blog_listing';
  if (path === '/reviews') return 'reviews';
  if (path === '/compare') return 'compare';
  if (path === '/guide') return 'guide';
  if (path === '/research') return 'research';
  if (path.includes('calculator')) return 'calculator';
  if (path === '/about') return 'about';
  return 'other';
};

/**
 * Get traffic source from referrer or UTM params
 */
const getTrafficSource = () => {
  if (typeof window === 'undefined') return 'unknown';

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;

  const referrer = document.referrer;
  if (!referrer) return 'direct';

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('google')) return 'google';
    if (hostname.includes('bing')) return 'bing';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('twitter') || hostname.includes('t.co')) return 'twitter';
    if (hostname.includes('reddit')) return 'reddit';
    if (hostname.includes('linkedin')) return 'linkedin';

    return hostname;
  } catch {
    return 'unknown';
  }
};

/**
 * Hook to track conversion funnel progression
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether tracking is enabled (default: true)
 */
export function useFunnelTracking(options = {}) {
  const { enabled = true } = options;

  // Track which funnel steps have been recorded (persists across renders)
  const funnelStepsReached = useRef(new Set());
  const pageLoadTime = useRef(Date.now());
  const lastScrollCheck = useRef(0);
  const observerRef = useRef(null);
  const productElementsObserved = useRef(new Set());

  /**
   * Track a funnel step event
   */
  const trackFunnelStep = useCallback((step, additionalProps = {}) => {
    if (!enabled || funnelStepsReached.current.has(step)) return;

    funnelStepsReached.current.add(step);

    trackEvent('funnel_step', {
      step,
      page_path: window.location.pathname,
      page_type: getPageType(),
      device_type: getDeviceType(),
      traffic_source: getTrafficSource(),
      time_since_landing: Math.round((Date.now() - pageLoadTime.current) / 1000),
      ...additionalProps
    });
  }, [enabled]);

  /**
   * Check scroll depth and track engagement if 50%+
   */
  const checkScrollEngagement = useCallback(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    // Throttle to max once per 200ms
    if (now - lastScrollCheck.current < 200) return;
    lastScrollCheck.current = now;

    const scrolled = window.scrollY;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height === 0) return;

    const depth = Math.round((scrolled / height) * 100);

    if (depth >= 50 && !funnelStepsReached.current.has('engagement')) {
      trackFunnelStep('engagement', {
        trigger: 'scroll_depth',
        scroll_depth: depth
      });
    }
  }, [trackFunnelStep]);

  /**
   * Check time on page and track engagement if 30s+
   */
  const checkTimeEngagement = useCallback(() => {
    if (funnelStepsReached.current.has('engagement')) return;

    const timeOnPage = (Date.now() - pageLoadTime.current) / 1000;

    if (timeOnPage >= 30) {
      trackFunnelStep('engagement', {
        trigger: 'time_on_page',
        time_on_page_seconds: Math.round(timeOnPage)
      });
    }
  }, [trackFunnelStep]);

  /**
   * Handle product element visibility (IntersectionObserver callback)
   */
  const handleProductVisibility = useCallback((entries) => {
    if (!enabled || funnelStepsReached.current.has('product_interest')) return;

    for (const entry of entries) {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Determine what type of product element was viewed
        let elementType = 'product_card';
        if (element.matches('.comparison-table, [data-track="comparison"], [class*="comparison"]')) {
          elementType = 'comparison_table';
        } else if (element.matches('.review-card')) {
          elementType = 'review_card';
        }

        // Extract product name if available
        const productName = element.dataset?.productName ||
          element.querySelector('h2, h3, h4, [class*="title"]')?.textContent?.trim() ||
          'unknown';

        trackFunnelStep('product_interest', {
          element_type: elementType,
          product_name: productName.substring(0, 100)
        });

        // Stop observing once we've tracked product interest
        break;
      }
    }
  }, [enabled, trackFunnelStep]);

  /**
   * Set up IntersectionObserver for product elements
   */
  const setupProductObserver = useCallback(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with 50% visibility threshold
    observerRef.current = new IntersectionObserver(handleProductVisibility, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    // Find and observe all product interest elements
    const combinedSelector = PRODUCT_INTEREST_SELECTORS.join(', ');
    const elements = document.querySelectorAll(combinedSelector);

    elements.forEach((element) => {
      const elementId = element.id || element.dataset?.productName || element.className;
      if (!productElementsObserved.current.has(elementId)) {
        productElementsObserved.current.add(elementId);
        observerRef.current.observe(element);
      }
    });
  }, [handleProductVisibility]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Reset state on mount (new page)
    funnelStepsReached.current = new Set();
    pageLoadTime.current = Date.now();
    productElementsObserved.current = new Set();

    // Track landing step (page view is automatic, but we track funnel entry)
    trackFunnelStep('landing');

    // Set up scroll tracking for engagement
    window.addEventListener('scroll', checkScrollEngagement, { passive: true });

    // Set up time-based engagement check every 5 seconds
    const timeInterval = setInterval(checkTimeEngagement, 5000);

    // Initial scroll check (user may have scrolled before JS loaded)
    checkScrollEngagement();

    // Set up product visibility observer after DOM is ready
    // Use a small delay to ensure dynamic content is loaded
    const observerTimeout = setTimeout(() => {
      setupProductObserver();
    }, 100);

    // Re-check for new product elements periodically (for dynamically loaded content)
    const observerInterval = setInterval(() => {
      if (!funnelStepsReached.current.has('product_interest')) {
        setupProductObserver();
      }
    }, 2000);

    return () => {
      window.removeEventListener('scroll', checkScrollEngagement);
      clearInterval(timeInterval);
      clearTimeout(observerTimeout);
      clearInterval(observerInterval);

      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, trackFunnelStep, checkScrollEngagement, checkTimeEngagement, setupProductObserver]);

  return {
    // Expose method to manually track funnel steps (for CTA and affiliate clicks)
    trackStep: trackFunnelStep,

    // Check if a step has been reached
    hasReachedStep: (step) => funnelStepsReached.current.has(step),

    // Reset funnel tracking (useful for SPA navigation)
    resetFunnel: () => {
      funnelStepsReached.current = new Set();
      pageLoadTime.current = Date.now();
      productElementsObserved.current = new Set();
    }
  };
}

export default useFunnelTracking;
