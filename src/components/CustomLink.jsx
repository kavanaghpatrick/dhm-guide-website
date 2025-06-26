import React from 'react'

// Custom Link component that works with manual routing
export function Link({ to, children, className, ...props }) {
  const handleClick = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}

export default Link

