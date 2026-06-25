import { describe, it, expect } from 'vitest'
import { getVariantOverride } from '../experimentOverride'

const KEY = 'reviews-modern-v1'

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
}

describe('getVariantOverride', () => {
  it('returns null when neither query nor storage has the key', () => {
    expect(getVariantOverride(KEY, { search: '', storage: fakeStorage() })).toBeNull()
  })

  it('reads the variant from ?exp_<key>=modern', () => {
    expect(
      getVariantOverride(KEY, { search: '?exp_reviews-modern-v1=modern', storage: fakeStorage() })
    ).toBe('modern')
  })

  it('reads the variant from localStorage when the query is absent', () => {
    expect(
      getVariantOverride(KEY, { search: '', storage: fakeStorage({ 'exp_reviews-modern-v1': 'modern' }) })
    ).toBe('modern')
  })

  it('lets the query override localStorage', () => {
    expect(
      getVariantOverride(KEY, {
        search: '?exp_reviews-modern-v1=control',
        storage: fakeStorage({ 'exp_reviews-modern-v1': 'modern' }),
      })
    ).toBe('control')
  })

  it('ignores unrelated experiment keys', () => {
    expect(getVariantOverride(KEY, { search: '?exp_other-flag=modern', storage: fakeStorage() })).toBeNull()
  })

  it('is SSR-safe when search and storage are unavailable', () => {
    expect(getVariantOverride(KEY, { search: undefined, storage: undefined })).toBeNull()
  })
})
