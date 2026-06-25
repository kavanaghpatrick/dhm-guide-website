import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock posthog-js so the flag hook + tracking are deterministic and offline.
// The app imports `posthog` as a default export and calls a small surface of it.
vi.mock('posthog-js', () => {
  const noop = () => {}
  const posthog = {
    init: noop,
    capture: noop,
    identify: noop,
    register: noop,
    get_distinct_id: () => 'test-distinct-id',
    getFeatureFlag: () => undefined,
    getFeatureFlagPayload: () => undefined,
    onFeatureFlags: () => () => {},
    isFeatureEnabled: () => false,
    featureFlags: { override: noop },
    people: { set: noop },
    opt_in_capturing: noop,
  }
  return { default: posthog, ...posthog }
})

// jsdom is missing a few browser APIs the app/framer-motion touch.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })
  }
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    }
  }
  if (!window.scrollTo) window.scrollTo = () => {}
}

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* noop */ }
})
