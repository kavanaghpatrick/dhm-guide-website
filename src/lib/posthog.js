/**
 * PostHog Analytics Initialization
 *
 * Proxied through /ingest to bypass ad blockers (~40% of tech-savvy users).
 * MAXIMUM DATA COLLECTION configuration for conversion optimization.
 */
import posthog from 'posthog-js';

// PostHog configuration - use environment variable or fallback to direct key
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_BxeZzVX7gh2w23tsDyCAWViH5v3rRF9ipPNNQYNdkS4';
const POSTHOG_HOST = '/ingest'; // Proxied through Vercel

let initialized = false;

/**
 * Initialize PostHog analytics
 * Call this after window.load for best performance
 */
export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;

  // Don't initialize in development unless explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_DEV) {
    console.log('[PostHog] Skipping initialization in development');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: 'https://us.posthog.com',

      // ===== AUTO-CAPTURE (Maximum) =====
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit', 'focus', 'blur'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea', 'label'],
        css_selector_allowlist: ['[data-track]', '[data-product]', '.cta', '.product-card'],
      },
      capture_dead_clicks: true, // Detect clicks that don't do anything (broken UI)

      // ===== SESSION RECORDING (Full) =====
      disable_session_recording: false, // ENABLED - watch user sessions
      session_recording: {
        maskAllInputs: false, // Don't mask inputs (no sensitive data on this site)
        maskTextSelector: null, // Don't mask any text
        recordCrossOriginIframes: false,
        // Sample 100% of sessions for now (adjust if volume too high)
      },

      // ===== PERSON PROFILES (Track Everyone) =====
      person_profiles: 'always', // Create profiles for ALL users, even anonymous

      // ===== HEATMAPS =====
      enable_heatmaps: true, // Click heatmaps

      // ===== WEB VITALS (Performance) =====
      capture_performance: true, // Core Web Vitals (LCP, FID, CLS)

      // ===== EXCEPTION TRACKING =====
      capture_exceptions: true, // JavaScript errors

      // ===== PERSISTENCE =====
      persistence: 'localStorage+cookie',
      cross_subdomain_cookie: true,

      // ===== SCROLL DEPTH (Built-in) =====
      scroll_root_selector: ['body', 'main', 'article'],

      // ===== PROPERTY COLLECTION =====
      property_denylist: [], // Collect everything
      sanitize_properties: null, // No sanitization

      // Performance settings
      loaded: (posthog) => {
        console.log('[PostHog] Loaded with MAXIMUM data collection');
        initialized = true;

        // Set initial user properties
        posthog.register({
          initial_referrer: document.referrer || 'direct',
          initial_landing_page: window.location.pathname,
          initial_utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          initial_utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          initial_utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        });

        // Identify returning users by device
        const isReturning = localStorage.getItem('phg_returning') === 'true';
        posthog.register({ is_returning_user: isReturning });
        localStorage.setItem('phg_returning', 'true');
      },

      // Error handling
      on_xhr_error: (error) => {
        console.warn('[PostHog] XHR Error:', error);
      }
    });
  } catch (error) {
    console.error('[PostHog] Initialization failed:', error);
  }
}

/**
 * Track a custom event (safe wrapper)
 * Note: posthog-js has built-in queuing, so we trust the import rather than window.posthog
 */
export function trackEvent(eventName, properties = {}) {
  // Only skip on server-side or if explicitly not initialized
  if (typeof window === 'undefined' || !initialized) {
    return;
  }

  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Silently fail - don't break the app for analytics
  }
}

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
 * Track scroll depth milestone (25%, 50%, 75%, 90%)
 */
export function trackScrollDepth(depth, timeToReach = 0) {
  trackEvent('scroll_depth_milestone', {
    depth,
    page_path: window.location.pathname,
    page_type: getPageType(),
    time_to_reach_seconds: Math.round(timeToReach / 1000),
    device_type: getDeviceType()
  });
}

/**
 * Track element click (CTA, product card, comparison)
 */
export function trackElementClick(elementType, properties = {}) {
  trackEvent('element_clicked', {
    element_type: elementType,
    page_path: window.location.pathname,
    page_type: getPageType(),
    device_type: getDeviceType(),
    ...properties
  });
}

/**
 * Enrich pageview with content metadata
 */
export function enrichPageview(properties = {}) {
  if (typeof window === 'undefined' || !initialized) return;

  try {
    // Set as super properties so they attach to all future events
    posthog.register({
      page_type: getPageType(),
      device_type: getDeviceType(),
      ...properties
    });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Determine page type from URL
 */
function getPageType() {
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
}

/**
 * Track affiliate link click
 */
export function trackAffiliateClick(properties) {
  trackEvent('affiliate_link_click', {
    url: properties.url,
    product_name: properties.productName,
    placement: properties.placement,
    page_path: properties.pagePath,
    page_title: properties.pageTitle,
    scroll_depth: properties.scrollDepth,
    anchor_text: properties.anchorText,
    link_position: properties.linkPosition,
    referrer: document.referrer || 'direct',
    device_type: getDeviceType()
  });
}

/**
 * Identify a user (for logged-in users, if any)
 */
export function identifyUser(userId, properties = {}) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

/**
 * Reset user identity (on logout)
 */
export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

/**
 * Opt user out of tracking
 */
export function optOut() {
  if (!initialized) return;
  posthog.opt_out_capturing();
}

/**
 * Check if user has opted out
 */
export function hasOptedOut() {
  if (!initialized) return false;
  return posthog.has_opted_out_capturing();
}

export default posthog;
