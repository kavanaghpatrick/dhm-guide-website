# P0-E: Affiliate Button Component Audit

**Date:** 2026-04-25
**Branch:** `fix/affiliate-button-audit`
**Auditor:** Agent P0-E
**Goal:** Find every affiliate / "Check Price on Amazon" / "Buy on Amazon" callsite, categorize whether it conforms to the canonical `useAffiliateTracking` hook, and fix any bypassers.

---

## Architecture summary

The canonical hook is `src/hooks/useAffiliateTracking.js`. It is **registered exactly once** in `src/App.jsx:50` (`useAffiliateTracking({ enabled: true })`). Tracking is **global, document-level event delegation in the capture phase**, not per-component:

```js
document.addEventListener('click', handleClick, { capture: true });
```

The handler does:
1. `event.target.closest('a')` to find the anchor.
2. `AFFILIATE_URL_PATTERN.test(href)` (`amazon.<tld>` or `amzn.to`) — non-affiliate links are ignored.
3. Reads metadata: `data-placement`, `data-product-name`, `data-ratings-version`, plus DOM-derived signals (semantic parents, class patterns, scroll depth, link position).
4. Fires `trackAffiliateClick()` (PostHog `affiliate_link_click`) + `trackFunnelStep('affiliate_click', ...)` + `dataLayer.push()`.

**Implication for this audit:** any anchor whose `href` is `amazon.*` or `amzn.to` is automatically tracked **as long as no upstream `onClick` calls `event.preventDefault()` or `event.stopPropagation()`**. Components don't need to import the hook themselves; they just need to (a) render a real `<a>` tag with the affiliate href, (b) not block bubbling, and (c) provide good `data-placement` / `data-product-name` for analytics quality.

A "bypasser" therefore means:
- (B1) Calls `posthog.capture('affiliate_link_click', ...)` directly instead of letting the hook fire.
- (B2) Has an `onClick` that calls `e.preventDefault()` and then `window.open()` manually (would still need to fire the hook manually).
- (B3) Is a `<button>` with a JS-driven `window.location.href = amazonUrl` (no anchor → hook never fires).

I found **none of (B1), (B2), or (B3)** in the codebase. The only material issue is one (C)-class issue in inline blog markdown (compliance + analytics quality, not a tracking break).

---

## Full inventory

### Pages

| File:line | Element | Has `target="_blank"`? | Has `rel="nofollow sponsored noopener noreferrer"`? | `data-placement` | `data-product-name` | Category | Action |
|---|---|---|---|---|---|---|---|
| `src/pages/Reviews.jsx:514` | Hero quick-pick CTA `<a>` | ✅ | ✅ | `hero` | ✅ | A | none |
| `src/pages/Reviews.jsx:571` | Hero card variant CTA `<a>` | ✅ | ✅ | `hero` | ✅ | A | none |
| `src/pages/Reviews.jsx:673` | Comparison table — brand cell | ✅ | ✅ | `comparison_table` | ✅ | A | none |
| `src/pages/Reviews.jsx:687` | Comparison table — price cell | ✅ | ✅ | `comparison_table` | ✅ | A | none |
| `src/pages/Reviews.jsx:699` | Comparison table — per-serving cell | ✅ | ✅ | `comparison_table` | ✅ | A | none |
| `src/pages/Reviews.jsx:711` | Comparison table — rating cell | ✅ | ✅ | `comparison_table` | ✅ | A | none |
| `src/pages/Reviews.jsx:725` | Comparison table — score cell | ✅ | ✅ | `comparison_table` | ✅ | A | none |
| `src/pages/Reviews.jsx:737` | Comparison table — Action cell ("Check Price") | ✅ | ✅ | `comparison_table` | ✅ + `data-ratings-version` | A | none |
| `src/pages/Reviews.jsx:786` | Product card — badge (variant) | ✅ | ✅ | `product_card_badge` | ✅ | A | none |
| `src/pages/Reviews.jsx:810` | Product card — title | ✅ | ✅ | `product_card` | ✅ | A | none |
| `src/pages/Reviews.jsx:823` | Product card — rating row | ✅ | ✅ | `product_card` | ✅ | A | none |
| `src/pages/Reviews.jsx:842` | Product card — price | ✅ | ✅ | `product_card` | ✅ | A | none |
| `src/pages/Reviews.jsx:921` | Product card — "Best For" panel | ✅ | ✅ | `product_card` | ✅ | A | none |
| `src/pages/Reviews.jsx:941` | Product card — primary CTA "Check Price on Amazon" | ✅ | ✅ | `product_card` | ✅ + `data-ratings-version` | A | none |
| `src/pages/Reviews.jsx:975` | Product card — trust signals (variant) | ✅ | ✅ | `product_card_trust` | ✅ | A | none |
| `src/pages/Reviews.jsx:1149` | Sticky recommendation bar | ✅ | ✅ | `sticky_bar` | ✅ | A | none |
| `src/pages/Compare.jsx:800` | Desktop table — purchase row | ✅ | ✅ | `compare_table` | ✅ | A | none |
| `src/pages/Compare.jsx:1003` | Mobile card — purchase button | ✅ | ✅ | `compare_table` | ✅ | A | none |
| `src/pages/Compare.jsx:1052` | Winners — Best Overall | ✅ | ✅ | `compare_table` | ✅ | A | none |
| `src/pages/Compare.jsx:1071` | Winners — Best Value | ✅ | ✅ | `compare_table` | ✅ | A | none |
| `src/pages/Compare.jsx:1090` | Winners — Most Popular | ✅ | ✅ | `compare_table` | ✅ | A | none |
| `src/pages/Home.jsx:865` | Home product card — primary CTA | ✅ | ✅ | `home_product_card` | ✅ | A | none |

### Components

| File:line | Element | Category | Action |
|---|---|---|---|
| `src/components/MobileComparisonWidget.jsx:179` | "Buy Now" `<a>` (single-product variant) | A | none — has `target=_blank`, `rel="nofollow sponsored noopener noreferrer"`, `data-placement="comparison_widget"`, `data-product-name` (uses `brand` — minor data-quality issue, see Notes #2) |
| `src/components/ComparisonWidget.jsx:176` | "Buy Now" `<a>` (single-product variant) | A | none — same shape as above |

### Blog content (markdown rendering)

| File:line | Element | Category | Action |
|---|---|---|---|
| `src/newblog/components/NewBlogPost.jsx:1189-1241` | ReactMarkdown `a` renderer (catch-all for inline links inside post body markdown, including affiliate URLs in `dhm-dosage-guide-2025`, `hangover-supplements-complete-guide`, all `*-vs-*-comparison-*.json` posts, `dhm-depot-review-2025`, etc.) | **C → fixed** | Added affiliate detection; added `rel="nofollow sponsored noopener noreferrer"` and `data-placement="blog_content_inline"` when href matches Amazon. Non-affiliate external links keep their existing `rel="noopener noreferrer"`. |

### Schema-only (NOT user-clickable, no fix needed)

| File:line | Reason for inclusion | Action |
|---|---|---|
| `src/utils/productSchemaGenerator.js:19,47,61,103,117,131` | JSON-LD `offers.url` strings — used in structured data for Google. Never rendered as a clickable anchor. | none |
| `src/pages/About.jsx:34` | Disclosure copy ("We earn affiliate commissions on purchases…") — text only, no link. | none |

### Internal navigation (NOT affiliate; cataloged for completeness)

These all use React Router `<Link to="/reviews">` etc., or anchor `href="/reviews"`. They are conversion-funnel links into the affiliate funnel, not affiliate links themselves, so they should NOT be matched by `useAffiliateTracking`:

`src/components/StickyMobileCTA.jsx:84`, `src/components/UserTestimonials.jsx:411`, `src/components/FAQSection.jsx:71,95`, `src/components/CompetitorComparison.jsx:587`, `src/components/ReviewsCTA.jsx:41,91`, `src/components/layout/Layout.jsx:112,172,261`, `src/pages/About.jsx:161`, `src/pages/NotFound.jsx:36,48,76`, `src/pages/Reviews.jsx:1049,1067`, `src/pages/Compare.jsx:1114,1172,1190`, `src/pages/DosageCalculator.jsx:1492`, `src/pages/Guide.jsx:155,156,196,310,347,408,477,501,559,569,589,642,651,661,683,710,717,718`, `src/pages/DosageCalculatorEnhanced.jsx:1986,1998`, `src/pages/Home.jsx:219,248,889,932`, `src/pages/Research.jsx:852`, `src/pages/DosageCalculatorRewrite/index.jsx:165`. All Category A (correct as-is).

---

## Categorization summary

| Category | Definition | Count |
|---|---|---|
| **A** — uses canonical hook properly (real `<a>` + matching href + proper attrs, hook auto-fires via document listener) | Anchors with `href` matching `amazon.*\|amzn.to`, `target="_blank"`, `rel="nofollow sponsored noopener noreferrer"`, `data-placement` and `data-product-name` set, no `preventDefault` upstream | **23** |
| **B** — bypasses the hook (direct `posthog.capture`, custom `window.open`, JS-driven nav) | — | **0** |
| **C** — anchor missing `target="_blank"` or proper `rel` (compliance + analytics-quality issue) | Inline ReactMarkdown `<a>` renderer in blog content was missing `nofollow sponsored` and `data-placement` for affiliate URLs | **1 → fixed** |

**Total affiliate callsites audited:** 24.

---

## Fixes applied

### Fix #1 — `src/newblog/components/NewBlogPost.jsx:1189-1241`

**Before:** ReactMarkdown's `a` component renderer set `rel="noopener noreferrer"` for all external links and provided no `data-placement` / no affiliate detection. This means every inline Amazon link in blog content (`dhm-dosage-guide-2025`, `hangover-supplements-complete-guide-what-actually-works-2025`, every `*-vs-*-comparison-*.json`, `dhm-depot-review-2025`, etc.) was missing:
- `rel="nofollow sponsored"` — Google compliance for paid links
- `data-placement` — so the hook's `detectPlacement()` falls through to `'unknown_placement'` for inline content links, polluting analytics

The global hook still tracked them (URL pattern matches; no `preventDefault` blocks bubbling), so this was a **(C) compliance + data-quality fix**, not a tracking-restoration fix. No clicks were being lost from this — just mis-attributed in PostHog and non-compliant for AdSense/Amazon ToS.

**After:** Detects affiliate URLs via the same regex shape as the hook (`amazon.<tld>` or `amzn.to`) and emits:
```jsx
rel={isAffiliate ? 'nofollow sponsored noopener noreferrer' : (isExternal ? 'noopener noreferrer' : undefined)}
data-placement={isAffiliate ? 'blog_content_inline' : undefined}
```

Smallest possible change (~5 lines added inside an existing renderer). No new imports, no new components, no refactoring. Build verified passing (189 blog posts prerendered cleanly, 7 main pages prerendered).

---

## Notes for Agent A (do NOT modify by P0-E)

### NOTE 1 — Hook URL regex is anchored to start-of-string

`src/hooks/useAffiliateTracking.js:12`:
```js
const AFFILIATE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(amazon\.[a-z.]{2,6}|amzn\.to)\/.*/i;
```

This is correct for `href` values, since browsers normalize `href` to either an absolute URL with scheme (most common in this codebase) or a path-relative URL. **However**, `extractProductName` and the placement detection are unforgiving about hrefs that route through a redirect (e.g., `/go/dhm-depot` → 302 → Amazon). I didn't find any such redirector in the codebase — every affiliate href is a direct `amzn.to/...` or `amazon.com/...` — so this is fine for now. Flagging in case A is considering a redirector.

### NOTE 2 — `data-product-name` is `brand` not `name` in the comparison widgets

`src/components/MobileComparisonWidget.jsx:184` and `src/components/ComparisonWidget.jsx:181` set `data-product-name={selectedProducts[0].brand}` rather than `selectedProducts[0].name`. This is consistent within those two components but differs from `Reviews.jsx` / `Compare.jsx` / `Home.jsx` which all use `.name`. Result: PostHog `affiliate_link_click` events from comparison widgets carry the brand string ("Double Wood Supplements") in the `product_name` property while everything else carries the product line ("DHM Depot"). This causes split product attribution in dashboards. Not a tracking break — a data-cleanliness inconsistency. Left untouched per scope (P0-E should not refactor); flagging for consideration.

### NOTE 3 — Non-Amazon affiliate URLs in `Compare.jsx`

`src/pages/Compare.jsx:274`, `336`: `https://amazon.com/dhm1000-dihydromyricetin` and `https://amazon.com/dhm-depot-dihydromyricetin` look like placeholder paths that don't resolve to real Amazon listings — they will 404. Not in scope (data, not tracking) but worth flagging.

`src/pages/Compare.jsx:305`: `https://fullerhealth.com/products/after-party` — this is a non-Amazon merchant link. The hook's `AFFILIATE_URL_PATTERN` regex does **not** match `fullerhealth.com`, so this click will **not** fire `affiliate_link_click`. If Fuller Health is an affiliate partner, the regex needs widening (Agent A's call) — or the data shape needs an `affiliateNetwork` field and a broader detection rule. **This is a real tracking gap if Fuller Health revenue exists.** Definitely Agent A's call.

### NOTE 4 — Blog post JSON content is the largest surface area I did NOT touch

40+ blog post JSONs (`src/newblog/data/posts/*.json`) contain inline markdown that includes `amzn.to/...` links. Per scope, I did not modify these. With Fix #1, they will now render with `rel="nofollow sponsored noopener noreferrer"` + `data-placement="blog_content_inline"` automatically. **This means the previous PostHog data for these clicks was being mis-attributed to `unknown_placement`** — Agent A should expect a placement-distribution shift after this deploys, not a volume change.

If the 38.5% drop in tracked clicks correlates with the share of clicks coming from blog inline links, that drop may be partly an attribution artifact (events were firing but landing in `unknown_placement` and being filtered out of dashboards). Worth checking on the dashboard side before assuming events are being lost.

### NOTE 5 — `useEngagementTracking.js` is owned by you (P0-A) but I noticed it's already in `M` git status

The git working tree shows `M src/hooks/useEngagementTracking.js` — pre-existing modification before P0-E started. Did not touch. FYI.

---

## Verification

- `npm run build` — clean, 189 blog posts + 7 main pages prerendered, no errors.
- One file modified: `src/newblog/components/NewBlogPost.jsx`.
- No changes to `src/hooks/useAffiliateTracking.js`, no changes to `src/hooks/useEngagementTracking.js`, no changes to any blog post JSON.
- Branch `fix/affiliate-button-audit` ready; not pushed per instructions.
