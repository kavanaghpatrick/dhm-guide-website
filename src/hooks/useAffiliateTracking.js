/**
 * Affiliate Link Tracking Hook
 *
 * Automatically tracks all Amazon affiliate link clicks with rich metadata
 * for conversion optimization analysis.
 */
import { useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import { trackAffiliateClick, trackFunnelStep } from '../lib/posthog';

// Stricter URL matching pattern for affiliate links
// Covers common Amazon TLDs, shortlinks, and Fuller Health (direct-to-consumer affiliate)
const AFFILIATE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(?:amazon\.[a-z.]{2,6}|amzn\.to|fullerhealth\.com)\/.*/i;

/**
 * Get current scroll depth as percentage
 */
const getScrollDepth = () => {
  if (typeof window === 'undefined') return 0;
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (height === 0) return 0;
  return Math.round((scrolled / height) * 100);
};

/**
 * Detect link placement based on DOM location
 */
const detectPlacement = (link) => {
  if (!link) return 'unknown';

  // Check semantic elements first
  if (link.closest('header')) return 'header';
  if (link.closest('nav')) return 'navigation';
  if (link.closest('footer')) return 'footer';
  if (link.closest('aside')) return 'sidebar';

  // Check common class patterns
  if (link.closest('.hero, .hero-section, [class*="hero"]')) return 'hero';
  if (link.closest('.comparison, .compare, [class*="comparison"]')) return 'comparison-table';
  if (link.closest('.product-card, .review-card, [class*="product"]')) return 'product-card';
  if (link.closest('.cta, [class*="cta"]')) return 'cta-section';

  // Check data attributes
  if (link.dataset.placement) return link.dataset.placement;

  // Default to unknown so untagged links are visible in analytics
  return 'unknown_placement';
};

/**
 * Extract product name from link or context
 */
const extractProductName = (link) => {
  // Check data attribute first
  if (link.dataset.productName) return link.dataset.productName;
  if (link.dataset.product) return link.dataset.product;

  // Check aria-label
  if (link.getAttribute('aria-label')) return link.getAttribute('aria-label');

  // Check title attribute
  if (link.title) return link.title;

  // Get text content, but clean it up
  const text = link.textContent?.trim();
  if (text && text.length < 100 && !text.toLowerCase().includes('check price')) {
    return text;
  }

  // Try to find product name in parent context
  const card = link.closest('[data-product-name], .product-card, .review-card');
  if (card) {
    const heading = card.querySelector('h2, h3, h4, [class*="title"]');
    if (heading) return heading.textContent?.trim();
  }

  return 'unknown';
};

/**
 * Check if URL is an affiliate link
 */
const isAffiliateLink = (href) => {
  if (!href) return false;
  return AFFILIATE_URL_PATTERN.test(href);
};

/**
 * Detect link position in content (for A/B testing CTA placement)
 */
const detectLinkPosition = (link) => {
  if (!link) return 'unknown';

  // Get vertical position as rough indicator
  const rect = link.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const absoluteTop = rect.top + scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  // Calculate position as percentage of page
  const positionPercent = Math.round((absoluteTop / pageHeight) * 100);

  // Categorize into sections
  if (positionPercent < 15) return 'top';
  if (positionPercent < 40) return 'upper_middle';
  if (positionPercent < 60) return 'middle';
  if (positionPercent < 85) return 'lower_middle';
  return 'bottom';
};

/**
 * Resolve a stable component_id from the link's data-component-id attr,
 * or generate a fallback so untagged components are still distinguishable
 * in PostHog. In dev, warn so we can fix missing attrs at the source.
 */
const resolveComponentId = (link, event) => {
  if (link.dataset.componentId) return link.dataset.componentId;
  const tag = (event.target?.tagName || link.tagName || 'a').toLowerCase();
  const fallback = `unknown_${tag}_${Math.random().toString(36).slice(2, 6)}`;
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    console.warn('[AffiliateTracking] Missing data-component-id on link:', link.href, '— using fallback:', fallback);
  }
  return fallback;
};

/**
 * Read position_index from data attribute (numeric). 0 when missing.
 */
const resolvePositionIndex = (link) => {
  const raw = link.dataset.positionIndex;
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Get the previous-page pathname in this session. Falls back to parsing
 * document.referrer when sessionStorage is empty (first click in session).
 */
const resolveReferrerPathname = () => {
  try {
    const stored = sessionStorage.getItem('previous_pathname');
    if (stored) return stored;
  } catch {
    // sessionStorage may be unavailable
  }
  const ref = document.referrer;
  if (!ref) return '';
  try {
    return new URL(ref).pathname;
  } catch {
    return '';
  }
};

/**
 * Compute session age (seconds). Uses posthog session id timestamp if
 * available, else falls back to a sessionStorage timestamp set on first call.
 */
const resolveSessionAgeSeconds = () => {
  try {
    const info = posthog?.get_session_id_info?.();
    if (info && typeof info.sessionStartTimestamp === 'number') {
      return Math.max(0, Math.round((Date.now() - info.sessionStartTimestamp) / 1000));
    }
  } catch {
    // posthog may not be initialized yet
  }
  try {
    let startTs = sessionStorage.getItem('session_start_ts');
    if (!startTs) {
      startTs = String(Date.now());
      sessionStorage.setItem('session_start_ts', startTs);
    }
    return Math.max(0, Math.round((Date.now() - parseInt(startTs, 10)) / 1000));
  } catch {
    return 0;
  }
};

/**
 * Check returning-user flag (set in posthog.js init `loaded` callback).
 */
const resolveIsReturningUser = () => {
  try {
    return localStorage.getItem('phg_returning') === 'true';
  } catch {
    return false;
  }
};

/**
 * Hook to automatically track affiliate link clicks
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onTrack - Callback when a link is tracked
 * @param {boolean} options.enabled - Whether tracking is enabled (default: true)
 */
export function useAffiliateTracking(options = {}) {
  const { onTrack, enabled = true } = options;

  const handleClick = useCallback((event) => {
    if (!enabled) return;

    // Find the closest anchor element
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!isAffiliateLink(href)) return;

    // Collect tracking data
    const trackingData = {
      url: href,
      productName: extractProductName(link),
      placement: detectPlacement(link),
      pagePath: window.location.pathname,
      pageTitle: document.title,
      scrollDepth: getScrollDepth(),
      anchorText: link.textContent?.trim().substring(0, 100) || 'unknown',
      linkPosition: detectLinkPosition(link),
      ratingsVersion: link.dataset.ratingsVersion || null,
      timestamp: Date.now(),

      // NEW (P0.1) — passes through to PostHog payload
      componentId: resolveComponentId(link, event),
      positionIndex: resolvePositionIndex(link),
      referrerPathname: resolveReferrerPathname(),
      sessionAgeSeconds: resolveSessionAgeSeconds(),
      isReturningUser: resolveIsReturningUser(),
      experimentKey: link.dataset.experimentKey || null,
      variant: link.dataset.variant || null
    };

    // Track to PostHog
    try {
      trackAffiliateClick(trackingData);

      // Also track as funnel step (final conversion step)
      trackFunnelStep('affiliate_click', {
        product_name: trackingData.productName,
        placement: trackingData.placement
      });

      // Bulk-clicker detection: tag sessions that fire 5+ affiliate clicks in 60s.
      // The 5/12 anomaly was a single user firing 22 clicks in one session —
      // we don't drop the events, we just tag so dashboards can exclude them.
      // Skip if some other handler already cancelled the navigation.
      if (!event.defaultPrevented) {
        try {
          const recent = JSON.parse(sessionStorage.getItem('aff_clicks') || '[]');
          const now = Date.now();
          recent.push(now);
          const last60s = recent.filter(t => now - t < 60_000);
          sessionStorage.setItem('aff_clicks', JSON.stringify(last60s));
          if (last60s.length >= 5 && !sessionStorage.getItem('aff_bulk_flagged')) {
            sessionStorage.setItem('aff_bulk_flagged', '1');
            if (typeof posthog !== 'undefined' && posthog.register) {
              posthog.register({ bulk_clicker: true });
            }
          }
        } catch (_) {
          // sessionStorage may be unavailable (private mode, embedded view) — ignore
        }
      }
    } catch (error) {
      console.warn('[AffiliateTracking] Failed to track:', error);
    }

    // Also push to dataLayer for GTM/GA4 if available
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'affiliate_link_click',
        affiliate_url: trackingData.url,
        affiliate_product: trackingData.productName,
        affiliate_placement: trackingData.placement,
        page_path: trackingData.pagePath,
        ratings_version: trackingData.ratingsVersion
      });
    }

    // Call optional callback
    if (onTrack) {
      onTrack(trackingData);
    }

    console.log('[AffiliateTracking] Tracked:', trackingData.productName, trackingData.placement);
  }, [enabled, onTrack]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Use capture phase to ensure we catch the event before navigation
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [handleClick, enabled]);

  // Return manual tracking function for programmatic use
  return {
    trackClick: (linkData) => {
      try {
        trackAffiliateClick(linkData);
      } catch (error) {
        console.warn('[AffiliateTracking] Manual track failed:', error);
      }
    }
  };
}

export default useAffiliateTracking;
