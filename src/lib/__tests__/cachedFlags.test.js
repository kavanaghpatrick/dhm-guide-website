import { describe, it, expect } from 'vitest'
import { readCachedFlag, POSTHOG_STORAGE_KEY } from '../cachedFlags'

const KEY = 'site-modern-v1'
const fakeStorage = (obj) => ({ getItem: (k) => (k in obj ? obj[k] : null) })
const blob = (flags) => ({ [POSTHOG_STORAGE_KEY]: JSON.stringify({ $enabled_feature_flags: flags }) })

describe('readCachedFlag', () => {
  it('returns the cached variant for a multivariate flag', () => {
    expect(readCachedFlag(KEY, fakeStorage(blob({ [KEY]: 'modern' })))).toBe('modern')
  })

  it('returns undefined when the flag is absent', () => {
    expect(readCachedFlag(KEY, fakeStorage(blob({ other: 'x' })))).toBeUndefined()
  })

  it('returns undefined when there is no posthog blob', () => {
    expect(readCachedFlag(KEY, fakeStorage({}))).toBeUndefined()
  })

  it('returns undefined on malformed JSON', () => {
    expect(readCachedFlag(KEY, fakeStorage({ [POSTHOG_STORAGE_KEY]: 'not json' }))).toBeUndefined()
  })

  it('ignores non-string (boolean) flag values', () => {
    expect(readCachedFlag(KEY, fakeStorage(blob({ [KEY]: true })))).toBeUndefined()
  })

  it('is SSR-safe when storage is unavailable', () => {
    expect(readCachedFlag(KEY, null)).toBeUndefined()
  })

  // Shape guard: if a posthog-js major changes the localStorage key format, this fails
  // loudly in CI rather than silently re-introducing the flash.
  it('uses the documented PostHog localStorage key format', () => {
    expect(POSTHOG_STORAGE_KEY).toMatch(/^ph_phc_[A-Za-z0-9]+_posthog$/)
  })
})
