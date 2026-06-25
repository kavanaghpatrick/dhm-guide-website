/**
 * Reads a forced experiment-variant override from the URL query or localStorage.
 *
 * This exists so Playwright tests and manual preview QA can deterministically
 * render a given variant WITHOUT depending on PostHog's (non-deterministic) flag
 * assignment. In production, real users have no override and get their PostHog
 * assignment as normal.
 *
 * Precedence:  ?exp_<key>=<variant>  >  localStorage['exp_<key>']  >  null
 *
 * Pure + SSR-safe. Inject `{ search, storage }` in tests; in the browser it
 * defaults to `window.location.search` and `window.localStorage`.
 *
 * @param {string} key - flag key, e.g. 'reviews-modern-v1'
 * @param {{ search?: string, storage?: (Storage|null) }} [opts]
 * @returns {string|null} the forced variant string, or null if none is set
 */
export function getVariantOverride(key, opts = {}) {
  if (!key) return null

  const hasWindow = typeof window !== 'undefined'
  const search = opts.search !== undefined ? opts.search : (hasWindow ? window.location.search : '')
  const storage = opts.storage !== undefined ? opts.storage : (hasWindow ? safeLocalStorage() : null)

  const param = `exp_${key}`

  // 1) URL query wins (shareable, overrides a sticky localStorage value).
  if (search) {
    try {
      const value = new URLSearchParams(search).get(param)
      if (value) return value
    } catch { /* malformed query string — ignore */ }
  }

  // 2) localStorage fallback (sticky across navigations during QA).
  if (storage) {
    try {
      const value = storage.getItem(param)
      if (value) return value
    } catch { /* storage blocked/unavailable — ignore */ }
  }

  return null
}

function safeLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
