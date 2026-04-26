# P0-B: time_on_page_milestone Regression Fix

**Date:** 2026-04-25
**Branch:** `fix/time-on-page-milestone`
**Status:** Fixed locally, build verified, not pushed

## Symptom

`time_on_page_milestone` event volume crashed from ~70/day to ~10/day on **2026-04-07**, despite scroll events firing normally and traffic actually increasing.

PostHog HogQL daily counts (confirmed 2026-04-25):

| Date | Count |
|------|-------|
| 2026-04-04 | 99 |
| 2026-04-05 | 39 |
| 2026-04-06 | 44 |
| **2026-04-07** | **9 ← cliff** |
| 2026-04-08 | 13 |
| 2026-04-09 | 12 |
| 2026-04-10 | 12 |

7-day average before cliff: ~64/day. 7-day average after: ~10/day. **~85% volume loss**, perfectly consistent with a 10% sampling gate (1/0.1 ≈ 10x reduction).

## Breaking Commit

```
413b8f9  fix: resolve Feb 8 deploy break and re-ship safety improvements (#261)
Author:  Patrick Kavanagh
Date:    Tue Apr 7 12:56:34 2026 +0100
```

Commit message explicitly states:

> useEngagementTracking.js: Re-ship 10% engagement tracking sampling

The diff added a `shouldTrack = useRef(Math.random() < 0.1)` gate and inserted `|| !shouldTrack.current` into every callback's early-return guard plus the `useEffect` mount guard. Net effect: 90% of sessions never registered the time interval, the click listener, the copy listener, the visibilitychange listener, the focus listener, OR the beforeunload handler. Every event from this hook (`time_on_page_milestone`, `rage_click_detected`, `text_copied`, `tab_hidden`, `tab_visible`, `form_field_focused`, `page_exit`) was capped at 10% of true volume.

## Root Cause (One-liner)

A 10% session sampling gate was added to `useEngagementTracking` "to reduce overhead", with no corresponding update to dashboards or alerting — silently dropping 90% of all engagement events including the high-priority `time_on_page_milestone`.

## Fix

Pure deletion. Removed the `shouldTrack` ref and all `|| !shouldTrack.current` guards. Reverts the hook to its pre-Apr-7 behavior. Scroll tracking has no sampling and works fine — engagement should match.

### Diff

```diff
--- a/src/hooks/useEngagementTracking.js
+++ b/src/hooks/useEngagementTracking.js
@@ -17,9 +17,6 @@ import { trackEvent } from '../lib/posthog';
 export function useEngagementTracking(options = {}) {
   const { enabled = true } = options;

-  // Sample heavy engagement tracking to reduce overhead (10% of sessions)
-  const shouldTrack = useRef(Math.random() < 0.1);
-
   const pageLoadTime = useRef(Date.now());
@@ -32,7 +29,7 @@
   const checkTimeThresholds = useCallback(() => {
-    if (!enabled || !shouldTrack.current) return;
+    if (!enabled) return;
   ...

   const detectRageClick = useCallback((event) => {
-    if (!enabled || !shouldTrack.current) return;
+    if (!enabled) return;
   ...

   const handleCopy = useCallback(() => {
-    if (!enabled || !shouldTrack.current) return;
+    if (!enabled) return;
   ...

   const handleVisibilityChange = useCallback(() => {
-    if (!enabled || !shouldTrack.current) return;
+    if (!enabled) return;
   ...

   const handleFormFocus = useCallback((event) => {
-    if (!enabled || !shouldTrack.current) return;
+    if (!enabled) return;
   ...

   useEffect(() => {
-    if (!enabled || !shouldTrack.current || typeof window === 'undefined') return;
+    if (!enabled || typeof window === 'undefined') return;
```

Lines deleted: 8. Lines added: 0 (net `-8`). No new code.

## Local Verification

1. `npm run build` — succeeded, 189 posts prerendered, 0 errors.
2. `npm run dev` — server up on `:5173`, homepage 200.
3. `curl http://localhost:5173/src/hooks/useEngagementTracking.js` — Vite-served source contains:
   - 0 occurrences of `shouldTrack`
   - 0 occurrences of `Math.random`
   - Intact `trackEvent('time_on_page_milestone', { milestone_seconds, seconds, ... })` call
4. App.jsx still mounts the hook with `useEngagementTracking({ enabled: true })`.
5. Logic check: with sampling removed, every session passes the gate → 10x recovery factor, matching the regression magnitude.

Manual browser verification of the 30s tick was not run end-to-end (would require a 30s wait + opening PostHog dev tools), but the code path is mechanically simple — `setInterval(checkTimeThresholds, 5000)` is now scheduled unconditionally, and `checkTimeThresholds` adds each threshold to a `Set` and fires the event when `totalTime >= threshold`. Pre-Apr-7 this code worked at ~70/day baseline; we are restoring it byte-for-byte minus the sampling gate.

## Out of Scope (Other Agents)

- `useAffiliateTracking.js` — owned by sibling P0-A
- Blog post files — owned by sibling P0-C
- Playwright tests — owned by sibling P0-D

## Follow-ups (NOT in this fix)

- If overhead from engagement tracking ever becomes a real performance issue (no evidence today), consider PostHog server-side sampling rather than client-side gating, so dashboards remain consistent and the loss is documented in a single place.
- Pattern lesson: "re-ship privacy improvements" PRs should require an analytics smoke test before merging.
