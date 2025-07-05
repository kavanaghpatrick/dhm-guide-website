import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to dynamically track and provide header height
 * Handles resize events and provides smooth updates
 */
export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const updateHeaderHeight = useCallback(() => {
    if (headerRef.current) {
      const height = headerRef.current.getBoundingClientRect().height;
      setHeaderHeight(height);
      // Also update CSS variable for use in CSS
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, []);

  useEffect(() => {
    // Initial measurement
    updateHeaderHeight();

    // Set up ResizeObserver for modern browsers
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === headerRef.current) {
            updateHeaderHeight();
          }
        }
      });

      if (headerRef.current) {
        resizeObserverRef.current.observe(headerRef.current);
      }
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', updateHeaderHeight);
      window.addEventListener('orientationchange', updateHeaderHeight);
    }

    // Cleanup
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', updateHeaderHeight);
        window.removeEventListener('orientationchange', updateHeaderHeight);
      }
    };
  }, [updateHeaderHeight]);

  return { headerRef, headerHeight };
};