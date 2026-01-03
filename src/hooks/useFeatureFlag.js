import { useState, useEffect } from 'react';
import { isFeatureEnabled, getFeatureFlag, onFeatureFlagsLoaded } from '../lib/posthog';

/**
 * React hook for feature flags and A/B testing
 *
 * Usage:
 *   const showNewCTA = useFeatureFlag('new-cta-design');
 *   const variant = useFeatureFlag('cta-experiment', 'control');
 *
 * To set up an experiment in PostHog:
 * 1. Go to PostHog → Experiments → New Experiment
 * 2. Set the feature flag key (e.g., 'reviews-cta-v2')
 * 3. Define variants (control, test) with traffic split
 * 4. Set goal metric (e.g., 'affiliate_link_click')
 * 5. Use this hook in your component to render different variants
 *
 * @param {string} flagKey - The feature flag key from PostHog
 * @param {any} defaultValue - Value to use before flags load (default: false)
 * @returns {any} - The feature flag value (boolean for simple flags, string for multivariate)
 */
export function useFeatureFlag(flagKey, defaultValue = false) {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check immediately in case flags are already loaded
    const currentValue = getFeatureFlag(flagKey);
    if (currentValue !== undefined) {
      setValue(currentValue);
      setIsLoaded(true);
    }

    // Also listen for when flags finish loading
    onFeatureFlagsLoaded(() => {
      const loadedValue = getFeatureFlag(flagKey);
      if (loadedValue !== undefined) {
        setValue(loadedValue);
      }
      setIsLoaded(true);
    });
  }, [flagKey]);

  return value;
}

/**
 * Hook that returns both the flag value and loading state
 * Useful when you need to show a loading state while flags load
 *
 * @param {string} flagKey - The feature flag key
 * @param {any} defaultValue - Default value while loading
 * @returns {{ value: any, isLoaded: boolean }}
 */
export function useFeatureFlagWithLoading(flagKey, defaultValue = false) {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentValue = getFeatureFlag(flagKey);
    if (currentValue !== undefined) {
      setValue(currentValue);
      setIsLoaded(true);
    }

    onFeatureFlagsLoaded(() => {
      const loadedValue = getFeatureFlag(flagKey);
      if (loadedValue !== undefined) {
        setValue(loadedValue);
      }
      setIsLoaded(true);
    });
  }, [flagKey]);

  return { value, isLoaded };
}

export default useFeatureFlag;
