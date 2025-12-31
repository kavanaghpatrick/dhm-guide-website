/**
 * Affiliate Link Tracking Hook
 *
 * Automatically tracks all Amazon affiliate link clicks with rich metadata
 * for conversion optimization analysis.
 */
import { useEffect, useCallback } from 'react';
import { trackAffiliateClick } from '../lib/posthog';

// Stricter URL matching pattern for affiliate links
// Covers common Amazon TLDs and shortlinks
const AFFILIATE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(amazon\.[a-z.]{2,6}|amzn\.to)\/.*/i;

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

  // Default to content
  return 'content';
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
      timestamp: Date.now()
    };

    // Track to PostHog
    try {
      trackAffiliateClick(trackingData);
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
        page_path: trackingData.pagePath
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
