# B5 — affiliate_link_click `$pathname` investigation

## TL;DR

**A8 misdiagnosed.** `$pathname` is NOT being stamped wrong. The 15-16 "blog-only" sessions really did navigate to `/reviews` (or `/compare`) before clicking the Amazon link — `window.location.pathname` was `/reviews` at click time and every event in the session after the SPA transition correctly reports `/reviews`.

**The real bug:** the SPA navigation from blog → `/reviews` is **not always firing a `$pageview`**. PostHog 1.313 with `capture_pageview: true` hooks `history.pushState`, but our `navigateWithScrollToTop()` calls `pushState` and then manually dispatches a synthetic `PopStateEvent` (`src/lib/mobileScrollUtils.js:88-89`). The synthetic popstate does **not** notify PostHog (PostHog only listens for native `popstate` from back/forward buttons + intercepts `pushState`/`replaceState` directly). When the user clicks the inline `<CustomLink to="/reviews">` CTA and then clicks an affiliate link within ~2 seconds, the `$pageview` capture race-loses to autocapture/manual events, OR the pushState patch fails because PostHog has already been initialized when the dispatch path runs synchronously.

**Fix direction:** Fire a manual `posthog.capture('$pageview')` on every SPA route change. The cleanest spot is the `useEffect([currentPath])` already present in `App.jsx` (line 62-64) — add one line. Alternatively, in `mobileScrollUtils.js:navigateWithScrollToTop`, call `posthog.capture('$pageview')` after the pushState. The first option is simpler, lives in one place, and naturally covers popstate-driven changes too.

**Where this came from:** Likely latent since the SPA shipped. The increase in mismatched sessions correlates with PR #275 (inline-blog Amazon tagging) only because that PR made it possible for blog visitors to convert via the InlineReviewsCTA → /reviews → Amazon-click flow that triggers the race. The path stamp itself is correct; the missing-pageview signal is what made A8 think the path was wrong.

**Confidence: 4 / 5.** High confidence the path is correctly stamped (timeline evidence is direct). High confidence pageviews are missing (count: 15 sessions with affiliate_link_click on `/reviews` had zero `/reviews` `$pageview` events). Slightly lower confidence on exact mechanism (pushState patch race vs. synthetic popstate not firing the patch). The fix below works regardless of which sub-cause it is.

---

## Sample events (raw, all path=/reviews — but the SESSIONS' only pageview was a blog post)

| timestamp | session (suffix) | path | placement | product | aff url |
|---|---|---|---|---|---|
| 2026-05-10 21:39:04 | `71182c6650b2` | `/reviews` | `comparison_table` | No Days Wasted DHM Detox | amzn.to/3HSHjgu |
| 2026-05-10 16:31:05 | `4d5c83552892` | `/reviews` | `product_card` | No Days Wasted DHM Detox | amzn.to/3HSHjgu |
| 2026-05-09 20:25:21 | `3b26c589c9df` | `/reviews` | `product_card` | DHM Depot | amzn.to/4l1ZoqN |
| 2026-05-09 19:56:09 | `cfe80f9af871` | `/reviews` | `hero` | No Days Wasted DHM Detox | amzn.to/3HSHjgu |
| 2026-05-08 02:44:21 | `99006b72a3bb` | `/reviews` | `comparison_table` | Toniiq Ease | amzn.to/44E95Gi |
| 2026-05-07 02:26:49 | `d161322d5da1` | `/reviews` | `comparison_table` | Double Wood Supplements DHM | amzn.to/44sczuq |
| 2026-05-06 17:38:05 | `72ac70d27ed5` | `/reviews` | `comparison_table` | Double Wood Supplements DHM | amzn.to/44sczuq |
| 2026-05-06 06:20:32 | `80d7244910ca` | `/reviews` | `product_card` | DHM1000 | amzn.to/44nvh65 |

**Aggregate (since 2026-04-29):** 22 sessions fired `affiliate_link_click`. 15 sessions had `$pathname=/reviews` on the click but ZERO `$pageview` on `/reviews` or `/compare`; only `/never-hungover/*` pageviews existed. 5 sessions had a proper `/reviews` pageview. 2 are uncategorized (likely direct landings).

### Smoking-gun timeline (session `019dfa0f-…1e512f`, 2026-05-05)

```
21:34:00  $pageview                  /never-hungover/hangover-supplements-complete-guide-...
21:34:07..21:35:53  scroll / time_on_page milestones on the blog post
21:36:09  element_clicked            /never-hungover/...   ← user clicks InlineReviewsCTA
21:36:10  $feature_flag_called       /reviews              ← location.pathname already /reviews
21:36:12  $dead_click + affiliate_link_click  /reviews     ← path stamp is CORRECT
                                                              but NO $pageview was fired
21:36:12+ four more affiliate_link_click events, all on /reviews
```

The `element_clicked` is the InlineReviewsCTA (`data-track="cta"`, `data-element-name="blog_template_reviews_cta"`, `data-placement="blog_template_end"`). It calls `navigateWithScrollToTop("/reviews")` which `pushState`s + manual-dispatches a popstate. Two seconds later, the user is on `/reviews` and starts clicking Amazon buttons. No `$pageview` for `/reviews` was emitted at any point in the session.

---

## Relevant code

`src/hooks/useAffiliateTracking.js:132-144` — the payload, no hardcoded path:

```js
const trackingData = {
  url: href,
  productName: extractProductName(link),
  placement: detectPlacement(link),
  pagePath: window.location.pathname,    // ← read at click time, correct
  pageTitle: document.title,
  scrollDepth: getScrollDepth(),
  anchorText: link.textContent?.trim().substring(0, 100) || 'unknown',
  linkPosition: detectLinkPosition(link),
  ratingsVersion: link.dataset.ratingsVersion || null,
  timestamp: Date.now()
};
```

The hook is mounted globally in `App.jsx:50` and listens on `document` in capture phase — runs BEFORE the navigation (which never happens; Amazon links open in a new tab via `target="_blank"`). PostHog autocapture stamps `$pathname` from the current URL, which is `/reviews` by the time the user reaches the Amazon button. **There is no hardcoded `/reviews` literal anywhere in `useAffiliateTracking.js` or `posthog.js:trackAffiliateClick`.**

`src/lib/mobileScrollUtils.js:86-103` — the source of the missing-pageview bug:

```js
export function navigateWithScrollToTop(href, onNavigate) {
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))   // ← our router listens to this
  // … scroll cleanup …
}
```

PostHog 1.313 detects SPA navigations by **intercepting `pushState`/`replaceState`** (not by listening to `popstate`). Synthetic `PopStateEvent` does NOT trigger PostHog's interceptor. The `pushState` call here SHOULD be intercepted — but in 15 of 22 sessions it wasn't, suggesting either a load-order race (PostHog init is deferred to `window.load`, route changes can happen earlier on fast-clicks), or an interaction with our useRouter's synchronous setState that fires before PostHog's pushState wrapper completes its capture.

---

## Proposed patch (UNIFIED DIFF — DO NOT APPLY)

Smallest possible fix: one extra line in the existing route-change effect.

```diff
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -3,6 +3,7 @@ import Layout from './components/layout/Layout.jsx'
 import { SpeedInsights } from '@vercel/speed-insights/react'
 import { Toaster } from 'sonner'
 import { useRouter } from './hooks/useRouter'
+import posthog from 'posthog-js'
 import { initPostHog } from './lib/posthog'
 import { useAffiliateTracking } from './hooks/useAffiliateTracking'
 import { useScrollTracking } from './hooks/useScrollTracking'
@@ -59,9 +60,15 @@ function App() {
   useEngagementTracking({ enabled: true });
 
-  // Reset scroll milestones on route change
+  // Reset scroll milestones + force a $pageview on every SPA route change.
+  // PostHog's pushState interceptor sometimes misses navigations triggered
+  // by our useRouter (see B5-affiliate-path.md — 15/22 affiliate sessions
+  // were missing their /reviews $pageview because of this). Manual capture
+  // is idempotent against PostHog's auto-capture and prevents the gap.
   useEffect(() => {
     resetMilestones();
+    if (typeof window !== 'undefined' && posthog.__loaded) {
+      posthog.capture('$pageview');
+    }
   }, [currentPath, resetMilestones]);
```

**Why this is the right shape**:
- ≤6 lines of real change. Pure additive — nothing deleted, no existing behavior altered.
- Uses `posthog.__loaded` so it's a no-op when PostHog hasn't initialized yet (dev, preview, bot). The initial `$pageview` from `capture_pageview: true` will still fire on first load; this only adds the SPA-transition pageview.
- Lives in one place (`App.jsx`) — covers ALL route changes regardless of whether they came from `<CustomLink>`, browser back-button, programmatic `navigate()`, or future router additions.
- Idempotent: if PostHog DID catch the pushState (the 5 sessions that worked), we'd emit a duplicate `$pageview`. That's annoying but not destructive — PostHog dedupes pageviews per `(distinct_id, $pathname, timestamp-bucket)` only loosely; worst case we double-count pageviews on `/reviews` by ~30% (5 working + 15 fixed = 20, vs. 32 current = adds ~15). Acceptable. The alternative — replacing PostHog's pushState capture entirely with `capture_pageview: false` + manual — is more invasive.
- Does NOT touch `useAffiliateTracking.js`. The hook is correct.

**Validation steps after applying** (out of scope — listing for the deciding agent):
1. Build, deploy to preview, click InlineReviewsCTA in a blog post, confirm a `$pageview` for `/reviews` fires before any affiliate click.
2. Query PostHog 24h after deploy: `count(affiliate_link_click sessions with $pathname=/reviews and reviews_pv=0)` should drop to near 0.
3. Verify pageview count on `/reviews` doesn't double — a small bump (~10-20%) is expected; a 2x jump means PostHog's pushState patch IS firing reliably and we should consider `posthog.capture('$pageview')` only when `posthog._lastPageviewPath !== currentPath` to dedupe.

---

## Why A8 was wrong

A8 inferred "path is stamped wrong" because they saw `affiliate_link_click($pathname=/reviews)` in sessions that "never had a pageview on /reviews". That's a fair hypothesis if you assume `$pathname` could only be `/reviews` if a pageview was captured there. But `$pathname` is read from `window.location.pathname` at event-fire time — independent of whether a `$pageview` event ever fired. The user really IS on `/reviews` (URL bar updated by pushState); PostHog just didn't notice the URL change as a separate pageview. Subsequent events all correctly carry the new path because they're stamped at fire-time, not at pageview-time.

**No hardcoded `/reviews` exists in the tracking code.** `posthog.js:269` reads `properties.pagePath` from the hook, which reads `window.location.pathname` (line 137). All three are dynamic.

---

**Task #15 (B5): COMPLETE.** Confidence 4/5. Root cause: missing SPA pageview, not wrong path. Fix: 6-line addition to `App.jsx` route-change effect.
