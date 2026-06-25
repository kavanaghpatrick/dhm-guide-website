import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { trackEvent } from '../lib/posthog';
import { readCachedFlag } from '../lib/cachedFlags';

/**
 * Experiment hook for PostHog A/B tests with reliable exposure tracking + payload support.
 *
 * Returns `{ variant, payload, isLoading }`:
 * - `variant`: the flag value as a string (boolean flags translated: true → 'test', false → 'control')
 * - `payload`: the JSON payload attached to the variant in PostHog (or undefined)
 * - `isLoading`: true until PostHog has loaded flags for this user; false thereafter
 *
 * Why this hook exists (and what was broken before):
 *  1. The previous hook polled getFeatureFlag in a useEffect which made PostHog's
 *     auto `$feature_flag_called` event unreliable. We now fire an explicit
 *     `experiment_exposure` event exactly once per (distinct_id, flag) pair.
 *  2. The previous hook didn't expose payloads, so variant copy/config had to be
 *     hardcoded in components. Now consumers can read `payload` to drive copy from
 *     the PostHog UI without code changes.
 *  3. The previous hook tracked `isLoaded` internally but didn't return it, causing
 *     above-fold flicker as control rendered first, then swapped to variant.
 *
 * @param {string} key - The feature flag key from PostHog
 * @param {{ fallback?: string }} [options] - Options bag
 * @param {string} [options.fallback='control'] - Variant to return while loading / on error
 * @returns {{ variant: string, payload: any, isLoading: boolean }}
 */
export function useExperiment(key, options = {}) {
  const fallback = options.fallback ?? 'control';

  // SSR-safe initial state. On server, isLoading stays true and consumers should
  // gate above-fold experiments behind isLoading to avoid SSR/CSR mismatch.
  const isBrowser = typeof window !== 'undefined';

  const [state, setState] = useState(() => {
    // Seed SYNCHRONOUSLY from PostHog's localStorage cache so a returning user's
    // assigned variant is correct on the FIRST render — this is what eliminates the
    // control→modern flash (and the SPA-nav flip, since every mount re-seeds from
    // the same cache). The effect below still reconciles via onFeatureFlags (the
    // source of truth) and fires exposure; we deliberately do NOT fire exposure
    // from this seed (PostHog may not be initialized yet; resolve() handles it).
    const cached = isBrowser ? readCachedFlag(key) : undefined;
    if (typeof cached === 'string') {
      return { variant: cached, payload: undefined, isLoading: false };
    }
    return { variant: fallback, payload: undefined, isLoading: true };
  });

  useEffect(() => {
    if (!isBrowser) return undefined;

    let cancelled = false;

    const resolve = () => {
      if (cancelled) return;

      let rawVariant;
      let payload;
      try {
        rawVariant = posthog.getFeatureFlag?.(key);
        payload = posthog.getFeatureFlagPayload?.(key);
      } catch {
        rawVariant = undefined;
        payload = undefined;
      }

      // Translate booleans to string variants for consistent consumer ergonomics.
      let variant;
      if (rawVariant === true) variant = 'test';
      else if (rawVariant === false) variant = 'control';
      else if (typeof rawVariant === 'string') variant = rawVariant;
      else variant = fallback;

      setState({ variant, payload, isLoading: false });

      // Fire exposure exactly once per (distinct_id, key) for this session.
      // We use a module-level Set so this survives React 18 Strict Mode
      // double-effects and component remounts on the same page.
      fireExposureOnce(key, variant, payload);
    };

    // PostHog may already have flags loaded when this effect runs; check first.
    let alreadyResolved = false;
    try {
      const current = posthog.getFeatureFlag?.(key);
      if (current !== undefined) {
        resolve();
        alreadyResolved = true;
      }
    } catch {
      // PostHog not initialized yet — fall through to onFeatureFlags
    }

    // Subscribe to flag-load completion. PostHog's onFeatureFlags fires once
    // when flags arrive (and again if they reload).
    let unsubscribe;
    try {
      unsubscribe = posthog.onFeatureFlags?.(() => resolve());
    } catch {
      // Not initialized — leave isLoading true; consumers will see fallback
    }

    // Safety: if PostHog never loads (blocked, opted out, init disabled),
    // flip isLoading=false after a short grace period so consumers stop spinning.
    // We keep variant=fallback in that case.
    const timeout = setTimeout(() => {
      if (cancelled || alreadyResolved) return;
      setState((s) => (s.isLoading ? { ...s, isLoading: false } : s));
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch { /* noop */ }
      }
    };
  }, [key, fallback, isBrowser]);

  return state;
}

// ---- Exposure tracking ----------------------------------------------------

/**
 * Module-level guard: per (distinct_id, flag_key), we fire `experiment_exposure`
 * at most once. Survives Strict Mode double-invocations and component remounts.
 * NB: this resets on full page reload, which matches our session semantics.
 */
const _exposureFired = new Set();

function fireExposureOnce(key, variant, payload) {
  let distinctId = 'anon';
  try {
    distinctId = posthog.get_distinct_id?.() || 'anon';
  } catch {
    // ignore
  }

  const dedupeKey = `${distinctId}::${key}`;
  if (_exposureFired.has(dedupeKey)) return;
  _exposureFired.add(dedupeKey);

  trackEvent('experiment_exposure', {
    experiment_key: key,
    variant,
    payload_present: payload !== undefined && payload !== null,
    assigned_at: new Date().toISOString(),
  });
}

// ---- Backward-compatible shim --------------------------------------------

/**
 * Backward-compatible wrapper around useExperiment.
 *
 * Existing consumers call this as `useFeatureFlag(key, 'control')` and expect
 * a string variant. A small number may pass a boolean default for boolean flags
 * — in that case we return the boolean while loading, then the resolved variant
 * once PostHog has answered.
 *
 * @param {string} key - The feature flag key from PostHog
 * @param {string|boolean} [defaultValue=false] - Fallback while flags load
 * @returns {string|boolean} - Variant string, or boolean for legacy boolean flags
 */
export function useFeatureFlag(key, defaultValue = false) {
  const fallback = typeof defaultValue === 'string' ? defaultValue : 'control';
  const { variant, isLoading } = useExperiment(key, { fallback });
  if (isLoading && typeof defaultValue === 'boolean') return defaultValue;
  return variant;
}

/**
 * Legacy hook preserved for any consumers that want explicit loading state.
 * New code should prefer useExperiment which also returns payload.
 *
 * @param {string} key
 * @param {any} defaultValue
 * @returns {{ value: string, isLoaded: boolean }}
 */
export function useFeatureFlagWithLoading(key, defaultValue = false) {
  const fallback = typeof defaultValue === 'string' ? defaultValue : 'control';
  const { variant, isLoading } = useExperiment(key, { fallback });
  return { value: variant, isLoaded: !isLoading };
}

export default useFeatureFlag;
