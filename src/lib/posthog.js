/**
 * PostHog Analytics Initialization
 *
 * Proxied through /ingest to bypass ad blockers (~40% of tech-savvy users).
 * Privacy-first configuration with session replay disabled by default.
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

      // Auto-capture settings
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,

      // Privacy-first settings
      person_profiles: 'identified_only', // Don't auto-create person profiles
      disable_session_recording: true, // Enable manually after testing
      persistence: 'localStorage+cookie',

      // Performance settings
      loaded: (posthog) => {
        console.log('[PostHog] Loaded successfully');
        initialized = true;
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
 * Track a custom event
 */
export function trackEvent(eventName, properties = {}) {
  if (!initialized) {
    console.warn('[PostHog] Not initialized, skipping event:', eventName);
    return;
  }

  posthog.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString()
  });
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
    referrer: document.referrer || 'direct'
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
