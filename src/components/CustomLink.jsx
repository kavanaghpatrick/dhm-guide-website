import React from 'react'
import { navigateWithScrollToTop } from '@/lib/mobileScrollUtils.js'

// Custom Link component that works with manual routing
export function Link({ to, children, className, ...props }) {
  const handleClick = (e) => {
    // Allow middle-click, Cmd+click, Ctrl+click, and Shift+click to work normally
    // This enables "Open in new tab" functionality
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
      return // Let browser handle it
    }

    e.preventDefault()
    navigateWithScrollToTop(to)
  }

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}

export default Link

