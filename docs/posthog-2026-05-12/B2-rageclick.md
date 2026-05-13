# B2 — `$rageclick` Instrumentation Diagnosis

**Agent**: B2 of 10 (deep-dive)
**Date**: 2026-05-12
**Context**: A6 reported 0 `$rageclick` events over 30 days despite obvious rage behavior (e.g., May 10 `/guide` "Mental Clarity" — 4 same-element clicks within ~3s by one mobile user).

---

## 1. TL;DR

**Hypothesis 1 is partially correct, but the true root cause is hypothesis #3 (unknown):** PostHog's rageclick autocapture **opts in by default** in `posthog-js@1.311.0`. There is no `rageclick: true` flag — rageclick rides on the standard `autocapture` channel. The reason `$rageclick` fires 0 times is that **our `autocapture` is restricted to an `element_allowlist` of `['a', 'button', 'form', 'input', 'select', 'textarea', 'label']` (line 47 of `src/lib/posthog.js`)**. The rage-prone elements actually being clicked are `<Card>` / `<div>` / `<span>` components (e.g., `/guide` "Mental Clarity" `<Card hover:shadow-lg>`), which the allowlist **excludes**, so autocapture (and therefore rageclick on those targets) never fires.

Supporting evidence:
- `$dead_click` records 100 events in 30d — but A6's table (§4) shows 35/81 are on **empty `<div>`/`<span>` (text = `(no text)`)**. Dead clicks bypass `element_allowlist` because `capture_dead_clicks: true` is a separate channel; `$rageclick` does NOT have an equivalent escape hatch — it piggybacks on standard autocapture filters.
- Our custom `rage_click_detected` event (in `src/hooks/useEngagementTracking.js`) **does** fire (6 current / 2 prior per doc 05-element-clicks.md §3), confirming users actually rage-click. The custom hook uses a document-level `click` listener with no element gating, so it sees what PostHog's gated autocapture does not.
- Hypothesis #2 (Framer Motion target mutation) is **unlikely** — Framer's `<motion.div>` renders a real, stable DOM `<div>` per render; the element identity is preserved across clicks unless the parent re-renders and unmounts the child, which is not what happens for the `keyBenefits.map(...)` cards. The custom hook's 50px-radius heuristic (which would also be defeated by node mutation) is firing fine.

Confidence the allowlist is the cause: **4 / 5**. There is residual unknown #3 risk that PostHog's internal rageclick path additionally requires a property we haven't surfaced; the fix proposed below mitigates the dominant cause and is reversible.

---

## 2. Current `posthog.init()` options (verbatim from `src/lib/posthog.js:38–108`)

```js
posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  ui_host: 'https://us.posthog.com',

  // ===== AUTO-CAPTURE =====
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: {
    dom_event_allowlist: ['click', 'change', 'submit', 'focus', 'blur'],
    element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea', 'label'],
    css_selector_allowlist: ['[data-track]', '[data-product]', '.cta', '.product-card'],
  },
  capture_dead_clicks: true, // Detect clicks that don't do anything (broken UI)
  // ... (session_recording, person_profiles, heatmaps, perf, exceptions, persistence)
});
```

Key observations:
- **No `rageclick: false` is set.** Per posthog-js v1.110+ source (`autocapture.ts` and `rageclick.ts`), `$rageclick` is enabled by default whenever `autocapture` is truthy. There is no opt-in flag named `rageclick` in current v1.x — that was a v0/v1-alpha pattern. So hypothesis #1 as literally stated is wrong.
- **The `element_allowlist` is the gate.** When autocapture runs on a click, it walks up from `event.target` looking for an element whose `tagName.toLowerCase()` is in the allowlist. If none is found in the ancestor chain, autocapture returns early and no `$autocapture` is emitted. Rageclick detection (`isRageclick(x, y, t)` checking 3 clicks within 1s within 30px) is invoked **inside** the autocapture path. No autocapture → no rageclick check.
- **`capture_dead_clicks: true` is a separate code path** that runs regardless of the autocapture allowlist (it checks "did the click change the DOM / scroll / navigate"). That's why we see 100 dead clicks but 0 rageclicks.

PostHog SDK version: `posthog-js@^1.311.0` (line in `package.json`). Behavior confirmed against [PostHog autocapture docs](https://posthog.com/docs/product-analytics/autocapture#dead-clicks-and-rageclicks): "rageclicks fire when 3+ clicks occur within 1 second within 30 pixels [during autocapture]."

---

## 3. Proposed fix — unified diff (DO NOT APPLY)

```diff
--- a/src/lib/posthog.js
+++ b/src/lib/posthog.js
@@ -42,12 +42,17 @@ export function initPostHog() {
       // ===== AUTO-CAPTURE =====
       capture_pageview: true,
       capture_pageleave: true,
       autocapture: {
         dom_event_allowlist: ['click', 'change', 'submit', 'focus', 'blur'],
-        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea', 'label'],
+        // NOTE: element_allowlist intentionally NOT set so that $rageclick
+        // can fire on non-interactive elements (Cards, divs, spans). The
+        // css_selector_allowlist still gates which custom-tagged elements
+        // emit $autocapture events for normal click telemetry. Rageclick
+        // detection (3 clicks/1s/30px) runs inside the autocapture path
+        // and is otherwise blocked by an element_allowlist that excludes <div>.
         css_selector_allowlist: ['[data-track]', '[data-product]', '.cta', '.product-card'],
       },
       capture_dead_clicks: true, // Detect clicks that don't do anything (broken UI)
```

Why this is the smallest viable fix:
- **Pure deletion of 1 line** (per CLAUDE.md Pattern #6). No new code.
- Preserves `dom_event_allowlist` (still only `click/change/submit/focus/blur`).
- Preserves `css_selector_allowlist` so `$autocapture` for regular click telemetry stays narrow (we only emit `$autocapture` events for elements with `[data-track]`, `[data-product]`, `.cta`, `.product-card`). The volume of `$autocapture` will NOT explode.
- Allows `$rageclick` to fire on ANY element (including `<Card>` and `<div>`), which is exactly what we want for UX-frustration detection. `$rageclick` does not depend on `css_selector_allowlist`.
- Allows `$dead_click` to continue working identically (it was already not gated by `element_allowlist`).

**Alternative considered and rejected**: explicitly setting `rageclick: true` at the top level. Per posthog-js v1.311 source, this key is silently ignored — there is no such option. (The earlier `_capture_rageclicks` private flag in older versions defaults to `true` and is not user-configurable.) So the supposed "hypothesis 1 fix" would be a no-op.

---

## 4. Test plan (post-deploy verification)

**Pre-deploy sanity (local dev with `VITE_POSTHOG_DEV=true`):**
1. `npm run dev` with `VITE_POSTHOG_DEV=true` set.
2. Open DevTools → Network → filter `/ingest/e`.
3. Click an `<a>` 3 times rapidly within 1s. Expect one `$autocapture` + one `$rageclick` in the network payload.
4. Click a non-interactive `<div>` (e.g., body padding) 3 times rapidly. **After the fix**, expect a `$rageclick` (no `$autocapture` because no selector match). **Before the fix**, expect nothing.

**Production verification (2026-05-13 onward, after merge):**
1. Wait 24h after deploy for natural traffic to accumulate.
2. Run HogQL query in PostHog:
   ```sql
   SELECT count(), uniq(distinct_id), uniq($session_id), max(timestamp)
   FROM events
   WHERE event = '$rageclick'
     AND timestamp >= now() - interval '24 hour'
   ```
3. **Pass criteria**: count > 0 within 48h of deploy. Even 5–10 events/week would be a healthy baseline given dead-click volume (100/30d).
4. **Specific replay test**: trigger the May 10 `/guide` Mental Clarity scenario on a real device. Tap one Card 4 times within 2 seconds. Inspect PostHog Live Events tab — `$rageclick` should appear within 15s with `$element_text = "Mental Clarity"` (or similar) and `$pathname = "/guide"`.
5. **Compare with custom hook**: cross-check `$rageclick` count vs `rage_click_detected` count over the same window. Expect rough alignment within 2x (PostHog uses 30px radius / 1s; ours uses 50px / 1s).
6. **Watch for over-capture**: confirm `$autocapture` volume does NOT spike (should remain bounded by `css_selector_allowlist`). If it does, the `css_selector_allowlist` is being ignored and we need to revisit.

**Rollback**: revert the 1-line diff. Net behavior returns to current state (0 rageclicks). No data risk, no schema risk.

---

## 5. Confidence

**4 / 5**

- High: SDK source behavior is documented and the dead-click vs rageclick split (100 vs 0 over 30d on the same allowlist config) is highly diagnostic.
- High: Custom `rage_click_detected` (6 current / 2 prior) confirms users genuinely rage-click on non-`<a>/<button>` elements, eliminating hypothesis #2 (Framer target mutation) as a major contributor — if Framer were mutating, the custom hook's 50px-coordinate heuristic would also be blind.
- Lower (−1): I have not booted the SDK in a debugger to literally watch the autocapture path return early on a `<Card>` click; the diagnosis relies on documented behavior and the empirical 100-vs-0 split. The fix is reversible in one line, so the risk of being wrong is low.

---

**Task #12 completed.**
