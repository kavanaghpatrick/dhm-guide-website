import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Star } from 'lucide-react';
import topProductsData from '../data/topProducts.json';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { trackElementClick } from '../lib/posthog';
import { buildAffiliateUrl } from '../lib/utm-builder';

/**
 * StickyMobileCTA - Persistent floating CTA bar for mobile devices
 *
 * Ships 100% to mobile (no feature flag). Surfaces topProductsData[0]
 * directly with Amazon affiliate link. Scroll-up shows / scroll-down hides
 * (UX standard). Dismiss persists per-session via sessionStorage.
 *
 * Pattern #12: orange-500/600 gradient (high-contrast CTA).
 * Pattern #16: z-40 sits above main content, below modals (z-50+).
 */
export default function StickyMobileCTA() {
  const product = topProductsData[0];
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { hapticFeedback } = useMobileOptimization();

  const updateVisibility = useCallback(() => {
    const currentY = window.scrollY;
    const distanceFromBottom = document.documentElement.scrollHeight - (currentY + window.innerHeight);
    const scrollingUp = currentY < lastScrollY.current;
    // Show: past 200px AND scrolling up AND not near footer. Else hide.
    setVisible(currentY > 200 && scrollingUp && distanceFromBottom > 600);
    lastScrollY.current = currentY;
    ticking.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(updateVisibility);
      ticking.current = true;
    }
  }, [updateVisibility]);

  useEffect(() => {
    if (sessionStorage.getItem('sticky-cta-dismissed')) {
      setDismissed(true);
      return;
    }
    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (dismissed || !visible) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('sticky-cta-dismissed', '1');
    trackElementClick('mobile_sticky_cta_dismiss', { product_name: product.name });
  };

  const handleClick = () => {
    hapticFeedback('light');
    trackElementClick('mobile_sticky_cta_click', {
      product_name: product.name,
      price: product.price,
      placement: 'sticky_bottom',
    });
  };

  const href = buildAffiliateUrl(product.affiliateLink, {
    componentId: 'mobile-sticky-cta-primary',
  });

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-lg pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-300"
      role="complementary"
      aria-label="Top DHM product quick access"
    >
      <div className="flex items-center gap-2 px-3 py-2 min-h-[56px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex-shrink-0">
              1
            </span>
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
            <span className="font-semibold text-gray-900">{product.price}</span>
            <span className="inline-flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {product.rating}
            </span>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          data-placement="mobile_sticky_cta"
          data-product-name={product.name}
          data-component-id="mobile-sticky-cta-primary"
          onClick={handleClick}
          className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap min-h-[44px] flex items-center transition-all"
        >
          Check Price
        </a>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:opacity-90 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
