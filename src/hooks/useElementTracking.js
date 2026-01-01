/**
 * Element Click Tracking Hook
 *
 * Tracks clicks on CTAs, product cards, comparison widgets, and other
 * interactive elements. Uses event delegation for performance.
 */
import { useEffect, useCallback } from 'react';
import { trackElementClick } from '../lib/posthog';

// Selectors for trackable elements
const ELEMENT_SELECTORS = {
  cta: '[data-track="cta"], .cta-button, button[class*="cta"]',
  product_card: '[data-track="product"], .product-card, [class*="product-card"]',
  comparison: '[data-track="comparison"], .comparison-toggle, [class*="compare"]',
  calculator: '[data-track="calculator"], .calculator-input, .calculator-button',
  nav: '[data-track="nav"], nav a, .nav-link',
  faq: '[data-track="faq"]',
  share: '[data-track="share"]',
  mobile_menu: '[data-track="mobile-menu"]'
};

/**
 * Get scroll depth as percentage
 */
const getScrollDepth = () => {
  if (typeof window === 'undefined') return 0;
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (height === 0) return 0;
  return Math.round((scrolled / height) * 100);
};

/**
 * Check if URL is an internal link
 */
const isInternalLink = (href) => {
  if (!href) return false;
  // Internal if starts with / (but not //) or matches our domain
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  if (href.startsWith('#')) return false; // Anchor links
  try {
    const url = new URL(href, window.location.origin);
    return url.hostname === window.location.hostname;
  } catch {
    return false;
  }
};

/**
 * Categorize internal link by destination
 */
const categorizeInternalLink = (href) => {
  if (!href) return 'unknown';
  const path = href.startsWith('/') ? href : new URL(href).pathname;

  if (path === '/') return 'home';
  if (path.startsWith('/never-hungover/')) return 'blog_post';
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
 * Detect element type from DOM
 */
const detectElementType = (element) => {
  // Safety check: ensure element exists and is an Element (nodeType 1), not TextNode
  if (!element || element.nodeType !== 1) return null;

  // Check data-track attribute first (explicit)
  if (element.dataset?.track) return element.dataset.track;

  // Check against selectors
  for (const [type, selector] of Object.entries(ELEMENT_SELECTORS)) {
    if (element.matches?.(selector) || element.closest?.(selector)) {
      return type;
    }
  }

  // Check if it's an internal link (catch-all for links not matched above)
  const anchor = element.tagName === 'A' ? element : element.closest('a');
  if (anchor && isInternalLink(anchor.href)) {
    return 'internal_link';
  }

  return null;
};

/**
 * Extract element metadata
 */
const getElementMetadata = (element, elementType) => {
  const metadata = {
    element_text: element.textContent?.trim().substring(0, 50) || '',
    scroll_depth_at_click: getScrollDepth()
  };

  // Add type-specific metadata
  switch (elementType) {
    case 'product_card':
      const card = element.closest('[data-product-name], .product-card');
      if (card) {
        metadata.product_name = card.dataset?.productName ||
          card.querySelector('h2, h3, h4, [class*="title"]')?.textContent?.trim();
      }
      break;

    case 'cta':
      metadata.cta_destination = element.href || element.closest('a')?.href || '';
      break;

    case 'comparison':
      metadata.action = element.dataset?.action || 'toggle';
      break;

    case 'calculator':
      metadata.field_name = element.name || element.id || '';
      break;

    case 'faq':
      // Get data attributes first (most reliable)
      metadata.faq_question = element.dataset?.faqQuestion ||
        element.closest('[data-faq-question]')?.dataset?.faqQuestion ||
        element.textContent?.trim().substring(0, 150) || '';
      metadata.faq_category = element.dataset?.faqCategory ||
        element.closest('[data-faq-category]')?.dataset?.faqCategory || '';
      // Get accordion state if available
      const trigger = element.closest('[data-state]') || element;
      metadata.faq_state = trigger.getAttribute('data-state') || 'unknown';
      // Fallback category from parent card
      if (!metadata.faq_category) {
        const faqCard = element.closest('[id^="faq-"]');
        if (faqCard) {
          metadata.faq_category = faqCard.querySelector('h2, [class*="CardTitle"]')?.textContent?.trim() || '';
        }
      }
      break;

    case 'share':
      metadata.share_url = window.location.href;
      metadata.share_title = document.title;
      break;

    case 'mobile_menu':
      metadata.menu_action = element.getAttribute('aria-expanded') === 'true' ? 'close' : 'open';
      break;

    case 'internal_link':
      const anchor = element.tagName === 'A' ? element : element.closest('a');
      if (anchor) {
        metadata.link_url = anchor.href;
        metadata.link_destination = categorizeInternalLink(anchor.href);
        metadata.link_text = anchor.textContent?.trim().substring(0, 100) || '';
        // Detect link context
        if (anchor.closest('.related-posts, [class*="related"]')) {
          metadata.link_context = 'related_posts';
        } else if (anchor.closest('footer')) {
          metadata.link_context = 'footer';
        } else if (anchor.closest('article, .prose, .content, .blog-content')) {
          metadata.link_context = 'article_content';
        } else if (anchor.closest('.toc, [class*="table-of-contents"]')) {
          metadata.link_context = 'toc';
        } else {
          metadata.link_context = 'other';
        }
      }
      break;
  }

  return metadata;
};

/**
 * Hook to track element clicks via event delegation
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether tracking is enabled (default: true)
 */
export function useElementTracking(options = {}) {
  const { enabled = true } = options;

  const handleClick = useCallback((event) => {
    if (!enabled) return;

    // Find trackable element
    const target = event.target;
    const elementType = detectElementType(target);

    if (!elementType) return;

    // Get metadata
    const metadata = getElementMetadata(target, elementType);

    try {
      trackElementClick(elementType, metadata);
    } catch (error) {
      // Silently fail
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Use capture phase for reliability
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [handleClick, enabled]);

  // Expose manual tracking for programmatic use
  return {
    trackClick: (elementType, properties = {}) => {
      try {
        trackElementClick(elementType, {
          ...properties,
          scroll_depth_at_click: getScrollDepth()
        });
      } catch (error) {
        // Silently fail
      }
    }
  };
}

export default useElementTracking;
