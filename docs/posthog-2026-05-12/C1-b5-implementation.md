# C1 — B5 SPA `$pageview` fix implementation

## 1. Audit findings

**`capture_pageview` value:** `true` (`src/lib/posthog.js:43`).

**Double-fire risk:** REAL. PostHog with `capture_pageview: true` auto-fires a `$pageview` on initial full-page load (after `posthog.init()` resolves). If we unconditionally call `posthog.capture('$pageview')` inside `useEffect([currentPath])`, the first render of `App` would fire its own `$pageview` for the landing page — duplicating PostHog's auto-emitted one.

**Decision: option (a) — keep `capture_pageview: true`, gate the manual capture with a `useRef`** so it only fires on SPA-internal route changes (2nd render onward). Smaller, safer, leaves PostHog's well-tested initial-load path untouched. Also covers all SPA navigations (`<CustomLink>`, programmatic `navigate()`, browser back/forward) since they all update `currentPath` via the same router.

## 2. Diff applied

`src/App.jsx` (only file changed):

```diff
-import React, { lazy, Suspense, useEffect } from 'react'
+import React, { lazy, Suspense, useEffect, useRef } from 'react'
 import Layout from './components/layout/Layout.jsx'
 import { SpeedInsights } from '@vercel/speed-insights/react'
 import { Toaster } from 'sonner'
 import { useRouter } from './hooks/useRouter'
+import posthog from 'posthog-js'
 import { initPostHog } from './lib/posthog'
```

```diff
-  // Reset scroll milestones on route change
-  useEffect(() => {
-    resetMilestones();
-  }, [currentPath, resetMilestones]);
+  // Reset scroll milestones + force a $pageview on every SPA route change.
+  // PostHog's pushState interceptor misses navigations triggered by our
+  // useRouter (navigateWithScrollToTop dispatches a synthetic PopStateEvent
+  // that PostHog doesn't observe). See docs/posthog-2026-05-12/B5-affiliate-path.md.
+  // Skip the FIRST run because PostHog's capture_pageview:true already auto-fires
+  // a $pageview on initial load — firing again here would double-count.
+  const isInitialRouteRef = useRef(true);
+  useEffect(() => {
+    resetMilestones();
+    if (isInitialRouteRef.current) {
+      isInitialRouteRef.current = false;
+      return;
+    }
+    if (typeof window !== 'undefined' && posthog.__loaded) {
+      posthog.capture('$pageview');
+    }
+  }, [currentPath, resetMilestones]);
```

Net: +12 lines, -2 lines in `src/App.jsx`. No other source files modified.

## 3. Build result

**PASS.** `npm run build` completed cleanly:
- `validate-posts` OK, `generate-blog-canonicals` OK, `generate-sitemap` OK
- `vite build` OK
- `verify-z-classes` OK (3 z-* classes verified against compiled CSS)
- `prerender-blog-posts-enhanced` OK (197 posts across 20 batches)
- `prerender-main-pages` OK (7 main pages)

No new warnings or errors introduced.

## 4. Unexpected file changes

None from this task. `git status` shows `src/App.jsx` as the only file I touched. Pre-existing modifications (`public/sitemap.xml`, `src/newblog/components/NewBlogPost.jsx`, the untracked `docs/posthog-*` dirs and `scripts/screenshot-compare-cta.mjs` / `src/components/CompareCTA.jsx`) were already in the working tree at task start.

## 5. Manual verification after deploy

1. Open the live site in a fresh tab (production domain — `dhmguide.com`, not Vercel preview; PostHog skips init on `*.vercel.app` and `localhost`).
2. Open DevTools → Network, filter for `/ingest`.
3. Navigate to any blog post (`/never-hungover/<slug>`). Confirm ONE `$pageview` request fires (the auto-init one).
4. Scroll to the end of the post; click the **InlineReviewsCTA** ("Compare Top 8 DHM Supplements") which calls `navigateWithScrollToTop('/reviews')`.
5. Confirm a NEW `$pageview` request fires on arrival at `/reviews` — payload should include `$pathname: /reviews` and `$current_url` ending in `/reviews`.
6. Click any Amazon "Check Price" button (hero, comparison table, or product card). The `affiliate_link_click` event should fire with `pagePath: /reviews` AND a preceding `$pageview` for `/reviews` in the same session.
7. In PostHog UI: filter Events by `$pageview` + `$pathname = /reviews`, last 24h. Counts should rise meaningfully (B5 predicts ~15-20% bump, since ~15/22 prior affiliate sessions were missing this pageview).
8. Verify NO duplicate `$pageview` fires on initial page load — only on SPA route changes. (`isInitialRouteRef` gate.)

If pageview counts on `/reviews` more than double, PostHog's pushState patch IS firing reliably and we should dedupe via `posthog._lastPageviewPath` check — but B5's session-level evidence says this is unlikely.

---

**Task #21 (C1): COMPLETE.** Build passes. Diff is 12-line additive change to `src/App.jsx`. No commit, per instructions.
