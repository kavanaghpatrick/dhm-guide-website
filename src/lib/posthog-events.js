/**
 * PostHog Event Schema Contract (P0.1)
 *
 * Single source of truth for event names + property shapes.
 * Pure types (via JSDoc) + a const for version. No runtime side effects.
 * Importing this file MUST NOT cause anything to execute beyond const init.
 *
 * Type contracts are declared via JSDoc @typedef so they work in both
 * Vite (browser) and Node ESM (prerender) without needing tsconfig.
 *
 * When you bump EVENT_SCHEMA_VERSION, also update any dashboards that
 * filter by `event_schema_version` (currently: DCNI recovery, affiliate
 * funnel).
 */

/**
 * Bump on any breaking shape change. Format: YYYY.MM.DD.vN
 * @type {string}
 */
export const EVENT_SCHEMA_VERSION = '2026.05.23.v1';

/**
 * Canonical event-name list. Any tracked event MUST be in this tuple.
 * @type {readonly [
 *   'affiliate_link_click',
 *   '$pageview',
 *   'scroll_depth_milestone',
 *   'element_clicked',
 *   'experiment_exposure',
 *   'funnel_step',
 *   'time_on_page_milestone',
 *   'rage_click_detected',
 *   'page_exit',
 *   '$dead_click',
 *   '$exception',
 *   'compare_toggle',
 *   'filter_clicked'
 * ]}
 */
export const EVENT_NAMES = /** @type {const} */ ([
  'affiliate_link_click',
  '$pageview',
  'scroll_depth_milestone',
  'element_clicked',
  'experiment_exposure',
  'funnel_step',
  'time_on_page_milestone',
  'rage_click_detected',
  'page_exit',
  '$dead_click',
  '$exception',
  'compare_toggle',
  'filter_clicked',
]);

/**
 * @typedef {typeof EVENT_NAMES[number]} EventName
 */

/**
 * Common properties auto-attached by PostHog + our enrichment layer.
 *
 * @typedef {Object} CommonEventProps
 * @property {string} event_schema_version - Schema version of this payload
 * @property {string} [page_path]
 * @property {string} [page_type]
 * @property {'mobile'|'tablet'|'desktop'|'unknown'} [device_type]
 */

/**
 * Affiliate click — the KEYSTONE event for attribution & revenue.
 *
 * NEW properties (P0.1) — caller must pass:
 *  - experiment_key / variant: active A/B test for this click (null if none)
 *  - component_id: which UI component issued the click (stable ID, e.g.
 *    "blog-footer-cta-v2", "comparison-table-row-3"). Required for per-
 *    component CVR analysis.
 *  - position_index: numeric position within a list/grid (0-indexed)
 *  - referrer_pathname: prior page in same session (for in-funnel attribution)
 *  - session_age_seconds: seconds since session start (engagement signal)
 *  - is_returning_user: device returning per localStorage `phg_returning`
 *  - event_schema_version: see EVENT_SCHEMA_VERSION above
 *
 * @typedef {Object} AffiliateClickProps
 * @property {string} url
 * @property {string} product_name
 * @property {string} placement
 * @property {string} page_path
 * @property {string} page_title
 * @property {number} scroll_depth
 * @property {string} anchor_text
 * @property {string} link_position
 * @property {string} referrer
 * @property {'mobile'|'tablet'|'desktop'|'unknown'} device_type
 * @property {string|null} experiment_key  -- NEW (P0.1)
 * @property {string|null} variant         -- NEW (P0.1)
 * @property {string} component_id         -- NEW (P0.1)
 * @property {number} position_index       -- NEW (P0.1)
 * @property {string} referrer_pathname    -- NEW (P0.1)
 * @property {number} session_age_seconds  -- NEW (P0.1)
 * @property {boolean} is_returning_user   -- NEW (P0.1)
 * @property {string} event_schema_version -- NEW (P0.1)
 */

/**
 * @typedef {Object} ScrollDepthMilestoneProps
 * @property {number} depth_percentage
 * @property {number} depth  - Backward-compat alias
 * @property {string} page_path
 * @property {string} page_type
 * @property {number} time_to_reach_seconds
 * @property {'mobile'|'tablet'|'desktop'|'unknown'} device_type
 * @property {string} [event_schema_version]
 */

/**
 * @typedef {Object} ElementClickedProps
 * @property {string} element_type
 * @property {string} page_path
 * @property {string} page_type
 * @property {'mobile'|'tablet'|'desktop'|'unknown'} device_type
 * @property {string} [cta_destination]
 * @property {string} [component_id]
 * @property {string|null} [experiment_key]
 * @property {string|null} [variant]
 */

/**
 * @typedef {Object} ExperimentExposureProps
 * @property {string} experiment_key
 * @property {string} variant
 * @property {string} component_id
 * @property {string} page_path
 */

/**
 * @typedef {Object} FunnelStepProps
 * @property {string} step
 * @property {string} page_path
 * @property {string} page_type
 * @property {'mobile'|'tablet'|'desktop'|'unknown'} device_type
 * @property {string} traffic_source
 * @property {string} [cta_destination]
 * @property {string} [product_name]
 * @property {string} [placement]
 */

/**
 * @typedef {Object} TimeOnPageMilestoneProps
 * @property {number} milestone_seconds
 * @property {number} [milestone]  - Backward-compat alias
 * @property {string} page_path
 */

/**
 * @typedef {Object} RageClickDetectedProps
 * @property {string} page_path
 * @property {number} click_count
 * @property {string} [target_selector]
 */

/**
 * @typedef {Object} PageExitProps
 * @property {string} page_path
 * @property {number} time_on_page_seconds
 * @property {number} max_scroll_depth
 */

/**
 * PostHog autocapture events ($pageview, $dead_click, $exception) carry
 * their own PostHog-defined props; we don't redefine them here.
 *
 * @typedef {Object} PageviewProps
 * @property {string} [$current_url]
 * @property {string} [referrer_pathname]
 */
