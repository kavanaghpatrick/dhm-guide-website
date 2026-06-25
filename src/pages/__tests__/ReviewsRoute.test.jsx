import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReviewsRoute from '../ReviewsRoute.jsx'

// Mock BOTH the control and modern page modules so the wrapper renders cheap
// stand-ins (the real pages are heavy and pull in data/components). The wrapper
// lazy-imports './Reviews.modern.jsx' — vi.mock is hoisted and intercepts that
// dynamic import, so the test never executes the real modern page.
vi.mock('../Reviews.jsx', () => ({
  default: () => <div data-testid="control-page">CONTROL reviews</div>,
}))

// The modern mock can be toggled to "suspend forever" (never resolves) so we can
// observe the Suspense fallback. By default it resolves immediately to the modern
// stand-in.
let suspendModernForever = false
vi.mock('../Reviews.modern.jsx', () => {
  const ModernPage = () => {
    if (suspendModernForever) {
      // Throwing a never-settling promise keeps the nearest <Suspense> showing its
      // fallback — exactly the "chunk still loading" state we want to assert on.
      throw new Promise(() => {})
    }
    return <div data-testid="modern-page">MODERN reviews</div>
  }
  return { default: ModernPage }
})

const FLAG_KEY = 'reviews-modern-v1'

describe('ReviewsRoute', () => {
  beforeEach(() => {
    suspendModernForever = false
    window.history.replaceState({}, '', '/')
    localStorage.clear()
  })

  it('renders the CONTROL page by default (no override; PostHog mocked → control)', () => {
    render(<ReviewsRoute />)
    expect(screen.getByTestId('control-page')).toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
  })

  it('renders the MODERN page when forced via ?exp_<key>=modern', async () => {
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=modern`)
    render(<ReviewsRoute />)
    // Modern is lazy → resolves on a microtask; the control is the Suspense fallback.
    expect(await screen.findByTestId('modern-page')).toBeInTheDocument()
    expect(screen.queryByTestId('control-page')).not.toBeInTheDocument()
  })

  it('renders the MODERN page when forced via localStorage override', async () => {
    localStorage.setItem(`exp_${FLAG_KEY}`, 'modern')
    render(<ReviewsRoute />)
    expect(await screen.findByTestId('modern-page')).toBeInTheDocument()
  })

  it('shows the CONTROL page (never a blank spinner) while the modern chunk is loading', () => {
    // Force the modern page to stay suspended so React keeps the Suspense fallback
    // mounted. The fallback is <Reviews /> — so a 'modern'-bucketed visitor sees
    // real control content during load, never a blank screen.
    suspendModernForever = true
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=modern`)
    render(<ReviewsRoute />)
    expect(screen.getByTestId('control-page')).toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
  })

  it('renders CONTROL for an unknown variant value (variantParity: only "modern" flips)', () => {
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=something-else`)
    render(<ReviewsRoute />)
    expect(screen.getByTestId('control-page')).toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
  })
})
