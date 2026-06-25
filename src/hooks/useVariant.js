import { getVariantOverride } from '../lib/experimentOverride'
import { useFeatureFlag } from './useFeatureFlag'

/**
 * Resolve the variant for an A/B experiment.
 *
 * Honors a deterministic override (URL `?exp_<key>=` or localStorage) so tests
 * and preview QA can force a variant; otherwise returns the PostHog flag value.
 * The override short-circuits the RETURNED value synchronously (no isLoading
 * flicker for QA), while the underlying flag hook is still called unconditionally
 * to satisfy the rules of hooks.
 *
 * @param {string} key - flag key, e.g. 'reviews-modern-v1'
 * @returns {string} variant string ('control' | 'modern' | ...)
 */
export function useVariant(key) {
  const override = getVariantOverride(key)
  const flagVariant = useFeatureFlag(key, 'control')
  return override ?? flagVariant
}

export default useVariant
