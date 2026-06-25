import { POSTHOG_KEY } from './posthog'

/**
 * PostHog persists feature flags in localStorage (persistence: 'localStorage+cookie')
 * under this key. We read it DIRECTLY so a returning user's assigned variant is
 * available SYNCHRONOUSLY on the first React render — before posthog.init() even
 * runs — which is what eliminates the control→modern flash. `onFeatureFlags`
 * remains the source of truth and reconciles in the effect.
 *
 * NOTE: this couples to PostHog's private localStorage shape. The format is asserted
 * in cachedFlags.test.js so a posthog-js major that changes it fails CI loudly
 * (same "test the output" lesson as the Tailwind v4 token regression).
 */
export const POSTHOG_STORAGE_KEY = `ph_${POSTHOG_KEY}_posthog`

/**
 * Synchronously read a multivariate flag's variant from PostHog's localStorage cache.
 * Pure + SSR-safe. Pass `storage` in tests; defaults to window.localStorage.
 *
 * @param {string} flagKey
 * @param {(Storage|null)} [storage]
 * @returns {string|undefined} the cached variant ('modern' | 'control' | ...), or undefined
 */
export function readCachedFlag(flagKey, storage) {
  const store = storage !== undefined ? storage : (typeof window !== 'undefined' ? window.localStorage : null)
  if (!store) return undefined
  try {
    const blob = JSON.parse(store.getItem(POSTHOG_STORAGE_KEY) || '{}')
    const value = blob && blob.$enabled_feature_flags ? blob.$enabled_feature_flags[flagKey] : undefined
    // Only multivariate variants (strings) are meaningful here; ignore boolean flags.
    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}
