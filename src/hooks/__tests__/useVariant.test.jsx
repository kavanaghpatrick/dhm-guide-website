import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useVariant } from '../useVariant'

function Probe({ flagKey }) {
  const variant = useVariant(flagKey)
  return <div data-testid="variant">{variant}</div>
}

describe('useVariant', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    localStorage.clear()
  })

  it('returns control by default (no override; PostHog mocked)', () => {
    render(<Probe flagKey="some-exp-v1" />)
    expect(screen.getByTestId('variant')).toHaveTextContent('control')
  })

  it('honors a localStorage override', () => {
    localStorage.setItem('exp_some-exp-v1', 'modern')
    render(<Probe flagKey="some-exp-v1" />)
    expect(screen.getByTestId('variant')).toHaveTextContent('modern')
  })

  it('honors a ?exp_<key>= URL override, which wins over localStorage', () => {
    localStorage.setItem('exp_some-exp-v1', 'control')
    window.history.replaceState({}, '', '/?exp_some-exp-v1=modern')
    render(<Probe flagKey="some-exp-v1" />)
    expect(screen.getByTestId('variant')).toHaveTextContent('modern')
  })
})
