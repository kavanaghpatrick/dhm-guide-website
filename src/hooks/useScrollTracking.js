/**
 * Scroll Depth Tracking Hook
 *
 * Tracks scroll depth milestones (25%, 50%, 75%, 90%) with throttling
 * to prevent performance issues. Each milestone fires only once per page.
 */
import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '../lib/posthog';

// Throttle scroll events to max once per 200ms
const THROTTLE_MS = 200;

// Milestones to track
const MILESTONES = [25, 50, 75, 90];

/**
 * Hook to track scroll depth milestones
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether tracking is enabled (default: true)
 */
export function useScrollTracking(options = {}) {
  const { enabled = true } = options;

  // Track which milestones have been reached (persists across renders)
  const reachedMilestones = useRef(new Set());
  const pageLoadTime = useRef(Date.now());
  const lastScrollTime = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Reset milestones on route change
    reachedMilestones.current = new Set();
    pageLoadTime.current = Date.now();

    const getScrollDepth = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height === 0) return 0;
      return Math.round((scrolled / height) * 100);
    };

    const handleScroll = () => {
      const now = Date.now();

      // Throttle: skip if called within THROTTLE_MS
      if (now - lastScrollTime.current < THROTTLE_MS) return;
      lastScrollTime.current = now;

      const depth = getScrollDepth();

      // Check each milestone
      for (const milestone of MILESTONES) {
        if (depth >= milestone && !reachedMilestones.current.has(milestone)) {
          reachedMilestones.current.add(milestone);
          const timeToReach = now - pageLoadTime.current;

          try {
            trackScrollDepth(milestone, timeToReach);
          } catch (error) {
            // Silently fail
          }
        }
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position (user may have scrolled before JS loaded)
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  return {
    // Expose method to manually reset milestones (useful for SPA navigation)
    resetMilestones: () => {
      reachedMilestones.current = new Set();
      pageLoadTime.current = Date.now();
    }
  };
}

export default useScrollTracking;
