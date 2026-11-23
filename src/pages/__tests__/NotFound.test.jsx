import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import NotFound from '../NotFound.jsx'

describe('NotFound', () => {
  it('marks unknown URLs noindex so soft-404s stay out of Google', () => {
    render(<NotFound />)
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, nofollow')
  })
})
