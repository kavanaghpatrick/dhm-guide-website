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
  nav: '[data-track="nav"], nav a, .nav-link'
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
