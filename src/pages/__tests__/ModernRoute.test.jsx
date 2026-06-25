import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { makeModernRoute } from '../ModernRoute.jsx'
import { POSTHOG_STORAGE_KEY } from '../../lib/cachedFlags.js'
import { MODERN_EXPERIMENT_KEY } from '../../lib/experiment.js'

const Control = () => <div data-testid="control">control</div>
// Modern is lazy-loaded by the factory; resolve the dynamic import immediately.
const importModern = () => Promise.resolve({ default: () => <div data-testid="modern">modern</div> })

function seedCache(variant) {
  localStorage.setItem(
    POSTHOG_STORAGE_KEY,
    JSON.stringify({ $enabled_feature_flags: { [MODERN_EXPERIMENT_KEY]: variant } })
  )
}

describe('makeModernRoute (unified site-modern-v1)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    localStorage.clear()
  })

  it('shows a neutral hold (no control, no modern) for a first-time visitor', () => {
    const Route = makeModernRoute(Control, importModern)
    const { container } = render(<Route />)
    expect(screen.queryByTestId('control')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modern')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders MODERN immediately from a seeded cache — control never appears (zero flash)', async () => {
    seedCache('modern')
    const Route = makeModernRoute(Control, importModern)
    render(<Route />)
    expect(await screen.findByTestId('modern')).toBeInTheDocument()
    expect(screen.queryByTestId('control')).not.toBeInTheDocument()
  })

  it('renders CONTROL immediately from a seeded control cache', () => {
    seedCache('control')
    const Route = makeModernRoute(Control, importModern)
    render(<Route />)
    expect(screen.getByTestId('control')).toBeInTheDocument()
    expect(screen.queryByTestId('modern')).not.toBeInTheDocument()
  })

  it('forces MODERN via the ?exp_site-modern-v1=modern override', async () => {
    window.history.replaceState({}, '', `/?exp_${MODERN_EXPERIMENT_KEY}=modern`)
    const Route = makeModernRoute(Control, importModern)
    render(<Route />)
    expect(await screen.findByTestId('modern')).toBeInTheDocument()
    expect(screen.queryByTestId('control')).not.toBeInTheDocument()
  })

  it('forces CONTROL via the override (override beats everything, incl. a modern cache)', () => {
    seedCache('modern')
    window.history.replaceState({}, '', `/?exp_${MODERN_EXPERIMENT_KEY}=control`)
    const Route = makeModernRoute(Control, importModern)
    render(<Route />)
    expect(screen.getByTestId('control')).toBeInTheDocument()
    expect(screen.queryByTestId('modern')).not.toBeInTheDocument()
  })
})
