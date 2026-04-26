# R1 - Affiliate Regex + Broken URL Fix

**Date:** 2026-04-26
**Branch:** `fix/affiliate-regex-and-urls`
**Files changed:** 2 source files (`src/hooks/useAffiliateTracking.js`, `src/pages/Compare.jsx`) + this doc

## Bug 1: Untracked Fuller Health affiliate clicks

### Root cause
The global tracking regex in `src/hooks/useAffiliateTracking.js:12` only matched Amazon TLDs and `amzn.to`, so the Fuller Health affiliate link in `src/pages/Compare.jsx:305` (`https://fullerhealth.com/products/after-party`) was silently dropped: clicks fired no `affiliate_link_click` event in PostHog, no GTM dataLayer push, and no funnel-step record. Pure revenue-attribution leak.

### Fix
Minimal regex extension — added `fullerhealth.com` as a third alternative inside a non-capturing group. No other code touched.

```diff
-const AFFILIATE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(amazon\.[a-z.]{2,6}|amzn\.to)\/.*/i;
+const AFFILIATE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(?:amazon\.[a-z.]{2,6}|amzn\.to|fullerhealth\.com)\/.*/i;
```

The capturing group around the alternation became non-capturing (`?:`); nothing reads that group, so this is identical match behavior with cleaner intent. Verified positive (`fullerhealth.com`, `www.fullerhealth.com`, all Amazon variants) and negative (`evilfullerhealth.com.attacker.com`, `attacker.com/fullerhealth.com`) — anchored at `^` so no domain-suffix attack works.

### Sibling widgets
`MobileComparisonWidget.jsx` and `ComparisonWidget.jsx` contain **no** Fuller Health references (verified by grep), so no link-rendering changes needed. The hook is global (document-level click listener), so any future `fullerhealth.com` `<a>` tag anywhere on the site is now tracked automatically.

## Bug 2: Placeholder Amazon URLs (4xx/5xx targets)

### Root cause
Two `affiliateLink` values in `src/pages/Compare.jsx` were placeholder slugs that don't correspond to real Amazon product pages:

| Line | Bad URL | curl HEAD result |
|---|---|---|
| 274 | `https://amazon.com/dhm1000-dihydromyricetin` | HTTP 405 (no product, dead URL) |
| 336 | `https://amazon.com/dhm-depot-dihydromyricetin` | HTTP 503 (no `/dp/<ASIN>` — not a product page) |

Real product URLs do exist — both products are live in `src/pages/Reviews.jsx` with proper tracked `amzn.to` short links carrying the `dhmguide-20` Amazon Associates tag.

### Fix
Replaced both placeholders with the canonical short links from `Reviews.jsx`:

| Product | Old URL | New URL | Resolves to |
|---|---|---|---|
| DHM1000 (line 274) | `amazon.com/dhm1000-dihydromyricetin` | `https://amzn.to/44nvh65` | `amazon.com/Dycetin-Dihydromyricetin-DHM-Tablets-Electrolytes/dp/B074N712FM?...&tag=dhmguide-20` |
| DHM Depot (line 336) | `amazon.com/dhm-depot-dihydromyricetin` | `https://amzn.to/4l1ZoqN` | `amazon.com/Dihydromyricetin-Capsules-Double-Wood-Supplements/dp/B0767N448Q?...&tag=dhmguide-20` |

Verified both `amzn.to` short links resolve to live Amazon product pages with the affiliate tag. Clicks now reach a real product, earn commission, and are tracked by PostHog (already matched by the existing Amazon regex).

### Note on related JSON content (out of scope)
The placeholder URLs also exist in `src/newblog/data/posts/flyby-vs-dhm1000-complete-comparison-2025.json`, `dhm-depot-review-2025.json`, and `dhm1000-review-2025.json`. Per task constraints, sibling agents own blog post JSON; not touched here.

### Note on brand inconsistency (out of scope)
`Compare.jsx` lists DHM1000 brand as "Double Wood Supplements" but `Reviews.jsx` lists it as "Dycetin" (matching the actual Amazon product page). Flagged for a future content cleanup ticket.

## Verification

- `npm run build` — passes (189 blog posts prerendered, 7 main pages prerendered, no errors)
- `grep` shows only the regex itself + the now-tracked Fuller Health link remain matching the search terms; both placeholder Amazon URLs are gone
- Regex tested with 8 positive/negative cases — all expected results

## Expected impact

- Recovers 100% of Fuller Health click attribution in PostHog (was 0)
- Recovers 100% of DHM1000 + DHM Depot clicks from `/compare` — they now land on real products and pay commission
- Restores tracking for any future `fullerhealth.com` link added anywhere on the site
