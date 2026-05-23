/**
 * Bot Filtering — capture-time detection
 *
 * Three outcomes:
 *   - { isBot: true,  reason: '...', suspicious: false } → skip PostHog init
 *   - { isBot: false, suspicious: true } → init but tag every event suspicious_session:true
 *   - { isBot: false, suspicious: false } → normal user
 *
 * Filter rules (in order):
 *   1. UA string matches known bot patterns (Googlebot, headless, Lighthouse, etc.)
 *   2. SERP-preview bot: Chrome/145.0.0.0 + 800x600 screen — contaminated 81.5% of
 *      desktop LCP samples in May 2026 (see scripts/posthog-query.sh:99-104)
 *   3. navigator.webdriver === true (headless automation, e.g. Playwright/Puppeteer)
 *
 * Suspicious (don't drop, just tag):
 *   - No navigator.languages
 *   - No screen width
 *   - UA contains HeadlessChrome
 */

/**
 * @returns {{ isBot: boolean, reason: string | null, suspicious: boolean }}
 */
export function detectBot() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isBot: true, reason: 'no-window', suspicious: false };
  }
  const ua = navigator.userAgent || '';
  if (/bot|crawler|spider|googlebot|bingbot|spider|prerender|headless|lighthouse|phantomjs|playwright/i.test(ua)) {
    return { isBot: true, reason: 'ua-string', suspicious: false };
  }
  // The Chrome/145.0.0.0 + 800x600 SERP-preview bot — see scripts/posthog-query.sh:99-104.
  // Real Chrome shows e.g. Chrome/120.0.6099.130; dot-zeros are the giveaway.
  if (/Chrome\/145\.0\.0\.0/.test(ua) && window.screen?.width === 800 && window.screen?.height === 600) {
    return { isBot: true, reason: 'serp-preview-145', suspicious: false };
  }
  if (navigator.webdriver === true) {
    return { isBot: true, reason: 'webdriver', suspicious: false };
  }
  // Suspicious but don't drop — tag and exclude from default views
  const suspicious =
    (!navigator.languages || navigator.languages.length === 0) ||
    !window.screen?.width ||
    /HeadlessChrome/i.test(ua);
  return { isBot: false, reason: null, suspicious };
}
