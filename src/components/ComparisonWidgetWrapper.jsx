import React from 'react'
import ComparisonWidget from './ComparisonWidget'
import MobileComparisonWidget from './MobileComparisonWidget'
import { useMobileDevice } from '@/hooks/useMobileDevice'

/**
 * Wrapper component that renders the appropriate comparison widget
 * based on device type (mobile or desktop)
 */
export default function ComparisonWidgetWrapper(props) {
  const { isMobile } = useMobileDevice();

  // Use mobile widget for viewports < 768px
  if (isMobile) {
    return <MobileComparisonWidget {...props} />;
  }

  // Use desktop widget for larger viewports
  return <ComparisonWidget {...props} />;
}