/**
 * PostHog Analytics Initialization
 *
 * Proxied through /ingest to bypass ad blockers (~40% of tech-savvy users).
 * Privacy-safe configuration with masking + sampling.
 */
import posthog from 'posthog-js';

// Require explicit key from env (no fallback)
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = '/ingest'; // Proxied through Vercel

let initialized = false;

/**
 * Initialize PostHog analytics
 * Call this after window.load for best performance
 */
export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;

  // Require key
  if (!POSTHOG_KEY) {
    console.warn('[PostHog] Missing VITE_POSTHOG_KEY - skipping init');
    return;
  }

  // Don't initialize in development unless explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_DEV) {
    console.log('[PostHog] Skipping initialization in development');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: 'https://us.posthog.com',

      // ===== AUTO-CAPTURE (Masked) =====
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit', 'focus', 'blur'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea', 'label'],
        css_selector_allowlist: ['[data-track]', '[data-product]', '.cta', '.product-card'],
        maskTextSelector: 'input, textarea, select, [data-sensitive], [data-mask]'
      },
      capture_dead_clicks: true, // Detect clicks that don't do anything (broken UI)

      // ===== SESSION RECORDING (Sampled + Masked) =====
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: 'input, textarea, select, [data-sensitive], [data-mask]',
        recordCrossOriginIframes: false,
        sample_rate: 0.1 // Record 10% of sessions
      },

      // ===== PERSON PROFILES =====
      person_profiles: 'always',

      // ===== HEATMAPS =====
      enable_heatmaps: true,

      // ===== WEB VITALS =====
      capture_performance: true,

      // ===== EXCEPTION TRACKING =====
      capture_exceptions: true,

      // ===== PERSISTENCE =====
      persistence: 'localStorage+cookie',
      cross_subdomain_cookie: true,

      // ===== SCROLL DEPTH =====
      scroll_root_selector: ['body', 'main', 'article'],

      // ===== PROPERTY COLLECTION =====
      property_denylist: [],
      sanitize_properties: null,

      // Performance settings
      loaded: (posthog) => {
        console.log('[PostHog] Loaded with privacy-safe config');
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
    depth_percentage: depth,  // Primary property name (consistent with docs)
    depth,                     // Keep for backward compatibility
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

  // Track CTA clicks as funnel step
  if (elementType === 'cta') {
    trackFunnelStep('cta_click', {
      cta_destination: properties.cta_destination || ''
    });
  }
}

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
 * Track conversion funnel step
 * Used to build funnel visualizations in PostHog
 */
export function trackFunnelStep(step, properties = {}) {
  trackEvent('funnel_step', {
    step,
    page_path: window.location.pathname,
    page_type: getPageType(),
    device_type: getDeviceType(),
    traffic_source: getTrafficSource(),
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

// ===== FEATURE FLAGS & A/B TESTING =====

/**
 * Check if a feature flag is enabled
 * Use this for A/B tests and feature rollouts
 *
 * @param {string} flagKey - The feature flag key from PostHog
 * @returns {boolean} - Whether the flag is enabled for this user
 *
 * Example usage:
 *   if (isFeatureEnabled('new-cta-design')) {
 *     return <NewCTADesign />;
 *   }
 *   return <OldCTADesign />;
 */
export function isFeatureEnabled(flagKey) {
  if (!initialized) return false;
  try {
    return posthog.isFeatureEnabled(flagKey);
  } catch (error) {
    console.warn('[PostHog] Feature flag check failed:', error);
    return false;
  }
}

/**
 * Get feature flag value (for multivariate tests)
 * Returns the variant string for A/B/n tests
 *
 * @param {string} flagKey - The feature flag key
 * @returns {string|boolean|undefined} - The flag value/variant
 *
 * Example usage:
 *   const variant = getFeatureFlag('cta-experiment');
 *   if (variant === 'variant-a') return <CTAVariantA />;
 *   if (variant === 'variant-b') return <CTAVariantB />;
 *   return <CTAControl />;
 */
export function getFeatureFlag(flagKey) {
  if (!initialized) return undefined;
  try {
    return posthog.getFeatureFlag(flagKey);
  } catch (error) {
    console.warn('[PostHog] Feature flag retrieval failed:', error);
    return undefined;
  }
}

/**
 * Wait for feature flags to load (useful for SSR/initial render)
 * PostHog fetches flags async, so use this when flags are critical
 *
 * @param {function} callback - Called when flags are ready
 */
export function onFeatureFlagsLoaded(callback) {
  if (!initialized) return;
  try {
    posthog.onFeatureFlags(callback);
  } catch (error) {
    console.warn('[PostHog] Feature flags callback failed:', error);
  }
}

/**
 * Manually reload feature flags (after user identification changes)
 */
export function reloadFeatureFlags() {
  if (!initialized) return;
  try {
    posthog.reloadFeatureFlags();
  } catch (error) {
    console.warn('[PostHog] Feature flag reload failed:', error);
  }
}

export default posthog;
