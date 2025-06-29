import React from 'react'
import { navigateWithScrollToTop } from '@/lib/mobileScrollUtils.js'

// Custom Link component that works with manual routing
export function Link({ to, children, className, ...props }) {
  const handleClick = (e) => {
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

