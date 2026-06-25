import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NeverHungoverRoute from '../NeverHungoverRoute.jsx'

// Mock BOTH the control and modern page modules so the wrapper renders cheap
// stand-ins (the real pages are heavy and pull in the full post corpus + theme).
// The wrapper lazy-imports '../newblog/pages/NewBlogListing.modern.jsx' — vi.mock
// is hoisted and intercepts that dynamic import, so the test never executes the
// real modern page.
vi.mock('../../newblog/pages/NewBlogListing.jsx', () => ({
  default: () => <div data-testid="control-page">CONTROL never-hungover</div>,
}))

// The modern mock can be toggled to "suspend forever" (never resolves) so we can
// observe the Suspense fallback. By default it resolves immediately to the modern
// stand-in.
let suspendModernForever = false
vi.mock('../../newblog/pages/NewBlogListing.modern.jsx', () => {
  const ModernPage = () => {
    if (suspendModernForever) {
      // Throwing a never-settling promise keeps the nearest <Suspense> showing its
      // fallback — exactly the "chunk still loading" state we want to assert on.
      throw new Promise(() => {})
    }
    return <div data-testid="modern-page">MODERN never-hungover</div>
  }
  return { default: ModernPage }
})

const FLAG_KEY = 'never-hungover-modern-v1'

describe('NeverHungoverRoute', () => {
  beforeEach(() => {
    suspendModernForever = false
    window.history.replaceState({}, '', '/')
    localStorage.clear()
  })

  it('renders the CONTROL page by default (no override; PostHog mocked → control)', () => {
    render(<NeverHungoverRoute />)
    expect(screen.getByTestId('control-page')).toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
  })

  it('renders the MODERN page when forced via ?exp_<key>=modern', async () => {
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=modern`)
    render(<NeverHungoverRoute />)
    // Modern is lazy → resolves on a microtask; the control is the Suspense fallback.
    expect(await screen.findByTestId('modern-page')).toBeInTheDocument()
    expect(screen.queryByTestId('control-page')).not.toBeInTheDocument()
  })

  it('renders the MODERN page when forced via localStorage override', async () => {
    localStorage.setItem(`exp_${FLAG_KEY}`, 'modern')
    render(<NeverHungoverRoute />)
    expect(await screen.findByTestId('modern-page')).toBeInTheDocument()
  })

  it('shows a neutral placeholder (no control flash) while the modern chunk is loading', () => {
    // Force the modern page to stay suspended so React keeps the Suspense fallback
    // mounted. The fallback is a neutral full-height placeholder — NOT the control
    // hub — so a 'modern' visitor never sees a jarring control→modern swap (and we
    // avoid surfacing the control hub's pre-existing dev-only duplicate-key warnings).
    suspendModernForever = true
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=modern`)
    const { container } = render(<NeverHungoverRoute />)
    expect(screen.queryByTestId('control-page')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
    // The placeholder reserves layout height to avoid CLS during the chunk load.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders CONTROL for an unknown variant value (variantParity: only "modern" flips)', () => {
    window.history.replaceState({}, '', `/?exp_${FLAG_KEY}=something-else`)
    render(<NeverHungoverRoute />)
    expect(screen.getByTestId('control-page')).toBeInTheDocument()
    expect(screen.queryByTestId('modern-page')).not.toBeInTheDocument()
  })
})
