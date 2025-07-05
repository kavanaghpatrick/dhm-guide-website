import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile devices and touch capabilities
 * Returns both mobile viewport status and touch support
 */
export const useMobileDevice = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check viewport width for mobile
      setIsMobile(window.innerWidth < 768);
      
      // Check for touch support
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    // Initial check
    checkDevice();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isTouch };
};