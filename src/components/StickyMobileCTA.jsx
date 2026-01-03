import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Link } from './CustomLink.jsx';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { trackElementClick } from '../lib/posthog';

/**
 * StickyMobileCTA - Persistent floating CTA bar for mobile devices
 *
 * A/B Test: mobile-sticky-cta-v1
 * Hypothesis: +30-50% mobile CTR by keeping CTA visible during scroll
 *
 * Appears after 25% scroll, dismissible, mobile-only
 */
export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const variant = useFeatureFlag('mobile-sticky-cta-v1', 'control');

  // Don't render if control variant or already dismissed
  const shouldRender = variant === 'sticky-bar' && !dismissed;

  const handleScroll = useCallback(() => {
    if (dismissed) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / scrollHeight) * 100;

    // Show after 25% scroll, hide near bottom (footer area)
    setVisible(scrollPercent > 25 && scrollPercent < 90);
  }, [dismissed]);

  useEffect(() => {
    // Check if previously dismissed this session
    const wasDismissed = sessionStorage.getItem('sticky-cta-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('sticky-cta-dismissed', 'true');
    trackElementClick('sticky-mobile-cta', {
      action: 'dismissed',
      scroll_depth: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
    });
  };

  const handleClick = () => {
    trackElementClick('sticky-mobile-cta', {
      action: 'clicked',
      destination: '/reviews',
      scroll_depth: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
    });
  };

  // Don't render on server, control variant, or if dismissed
  if (typeof window === 'undefined' || !shouldRender || !visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50 md:hidden transform transition-transform duration-300"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      role="complementary"
      aria-label="Quick access to product reviews"
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">Ready to try DHM?</p>
          <p className="text-xs text-gray-500">10+ products independently tested</p>
        </div>

        <Link
          to="/reviews"
          onClick={handleClick}
          className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] flex items-center transition-colors"
        >
          See Top Picks
        </Link>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-2 -mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
