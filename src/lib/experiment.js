import { getVariantOverride } from './experimentOverride'
import { useExperiment } from '../hooks/useFeatureFlag'

/**
 * The SINGLE site-wide modern-redesign experiment. One assignment gates ALL primary
 * pages, so a user is `modern` everywhere or `control` everywhere — there is no
 * cross-page switching (6 independent flags gave P(modern on all 6) ≈ 1.6%).
 */
export const MODERN_EXPERIMENT_KEY = 'site-modern-v1'

/**
 * Resolve the modern-redesign variant + loading state for the unified experiment.
 * Honors the `?exp_site-modern-v1=` / localStorage override (synchronous, no loading)
 * for deterministic tests + preview QA. Otherwise returns PostHog's value, seeded
 * synchronously from the localStorage cache for returning users (no flash).
 *
 * @returns {{ variant: string, isLoading: boolean }}
 */
export function useModernExperiment() {
  const override = getVariantOverride(MODERN_EXPERIMENT_KEY)
  const { variant, isLoading } = useExperiment(MODERN_EXPERIMENT_KEY, { fallback: 'control' })
  if (override) return { variant: override, isLoading: false }
  return { variant, isLoading }
}
