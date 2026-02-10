/**
 * Enhanced Engagement Tracking Hook
 *
 * Tracks deep user engagement signals:
 * - Time on page milestones
 * - Rage clicks (frustrated rapid clicking)
 * - Text selection/copy
 * - Tab visibility (active time vs idle)
 * - Form interactions
 */
import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '../lib/posthog';

/**
 * Hook for enhanced engagement tracking
 */
export function useEngagementTracking(options = {}) {
  const { enabled = true } = options;

  const pageLoadTime = useRef(Date.now());
  const activeTime = useRef(0);
  const lastActiveTimestamp = useRef(Date.now());
  const isVisible = useRef(true);
  const timeThresholdsFired = useRef(new Set());
  const clickHistory = useRef([]);

  // Time thresholds to track (in seconds)
  const TIME_THRESHOLDS = [10, 30, 60, 120, 300]; // 10s, 30s, 1m, 2m, 5m

  // Track time on page milestones
  const checkTimeThresholds = useCallback(() => {
    if (!enabled) return;

    const totalTime = Math.floor((Date.now() - pageLoadTime.current) / 1000);

    TIME_THRESHOLDS.forEach(threshold => {
      if (totalTime >= threshold && !timeThresholdsFired.current.has(threshold)) {
        timeThresholdsFired.current.add(threshold);
        trackEvent('time_on_page_milestone', {
          milestone_seconds: threshold,  // Primary property name (consistent with docs)
          seconds: threshold,            // Keep for backward compatibility
          active_seconds: Math.floor(activeTime.current / 1000),
          page_path: window.location.pathname,
          engagement_ratio: Math.round((activeTime.current / (Date.now() - pageLoadTime.current)) * 100)
        });
      }
    });
  }, [enabled]);

  // Track rage clicks (3+ clicks in 1 second on same area)
  const detectRageClick = useCallback((event) => {
    if (!enabled) return;

    const now = Date.now();
    const click = {
      x: event.clientX,
      y: event.clientY,
      time: now
    };

    // Keep only clicks from last 1 second
    clickHistory.current = clickHistory.current.filter(c => now - c.time < 1000);
    clickHistory.current.push(click);

    // Check for rage click (3+ clicks in same 50px area)
    if (clickHistory.current.length >= 3) {
      const recentClicks = clickHistory.current.slice(-3);
      const maxDistance = Math.max(
        ...recentClicks.map(c =>
          Math.sqrt(Math.pow(c.x - click.x, 2) + Math.pow(c.y - click.y, 2))
        )
      );

      if (maxDistance < 50) {
        trackEvent('rage_click_detected', {
          click_count: clickHistory.current.length,
          page_path: window.location.pathname,
          element_tag: event.target.tagName,
          element_class: event.target.className?.toString().substring(0, 100),
          x: click.x,
          y: click.y
        });
        clickHistory.current = []; // Reset after detecting
      }
    }
  }, [enabled]);

  // Track text selection/copy
  const handleCopy = useCallback(() => {
    if (!enabled) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      trackEvent('text_copied', {
        text_length: selectedText.length,
        text_preview: selectedText.substring(0, 100),
        page_path: window.location.pathname
      });
    }
  }, [enabled]);

  // Track tab visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;

    const wasVisible = isVisible.current;
    isVisible.current = document.visibilityState === 'visible';

    if (wasVisible && !isVisible.current) {
      // Tab became hidden - add active time
      activeTime.current += Date.now() - lastActiveTimestamp.current;
      trackEvent('tab_hidden', {
        active_seconds: Math.floor(activeTime.current / 1000),
        total_seconds: Math.floor((Date.now() - pageLoadTime.current) / 1000),
        page_path: window.location.pathname
      });
    } else if (!wasVisible && isVisible.current) {
      // Tab became visible again
      lastActiveTimestamp.current = Date.now();
      trackEvent('tab_visible', {
        hidden_duration_seconds: Math.floor((Date.now() - lastActiveTimestamp.current) / 1000),
        page_path: window.location.pathname
      });
    }
  }, [enabled]);

  // Track form field focus (for calculator, etc.)
  const handleFormFocus = useCallback((event) => {
    if (!enabled) return;
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

    trackEvent('form_field_focused', {
      field_type: event.target.type || event.target.tagName.toLowerCase(),
      field_name: event.target.name || event.target.id || 'unknown',
      page_path: window.location.pathname
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Reset on mount
    pageLoadTime.current = Date.now();
    activeTime.current = 0;
    lastActiveTimestamp.current = Date.now();
    timeThresholdsFired.current = new Set();
    clickHistory.current = [];

    // Time tracking interval
    const timeInterval = setInterval(checkTimeThresholds, 5000);

    // Event listeners
    document.addEventListener('click', detectRageClick);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('focusin', handleFormFocus);

    // Track page exit
    const handleBeforeUnload = () => {
      if (isVisible.current) {
        activeTime.current += Date.now() - lastActiveTimestamp.current;
      }
      trackEvent('page_exit', {
        total_seconds: Math.floor((Date.now() - pageLoadTime.current) / 1000),
        active_seconds: Math.floor(activeTime.current / 1000),
        page_path: window.location.pathname,
        exit_type: 'beforeunload'
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timeInterval);
      document.removeEventListener('click', detectRageClick);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('focusin', handleFormFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, checkTimeThresholds, detectRageClick, handleCopy, handleVisibilityChange, handleFormFocus]);

  return {
    getActiveTime: () => Math.floor(activeTime.current / 1000),
    getTotalTime: () => Math.floor((Date.now() - pageLoadTime.current) / 1000)
  };
}

export default useEngagementTracking;
