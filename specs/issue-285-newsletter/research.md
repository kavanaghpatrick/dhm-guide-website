# Research: Newsletter Capture Wire-up (Issue #285)

## Current State

### Email capture flow
`src/pages/DosageCalculatorEnhanced.jsx` collects emails in two places:

1. **Inline post-results form** (~line 1495-1565): renders only when `!emailCaptured`. Form submit calls `handleEmailCapture(email)` (line 1544).
2. **Exit-intent popup** (`ExitIntentPopup`, line 176-277): shown when mouse leaves viewport AND user has interacted >10s. Submit calls `onSubmit(email)`, wired to `handleEmailCapture` at line 777.

Both flows funnel through one handler at line 730:

```jsx
const handleEmailCapture = async (capturedEmail) => {
  setEmail(capturedEmail)
  setEmailCaptured(true)
  setShowExitIntent(false)
  const source = showExitIntent ? 'exit_intent' : 'inline'
  engagementTracker.trackEmailCapture(source)
  console.log('Email capture attempt:', capturedEmail, 'source:', source)
  if (isMobile) hapticFeedback('success')
  // TODO: Integrate with Formspree or ConvertKit (Issue #180)
  alert('Thanks for your interest! Our email system is being set up...')
}
```

The `alert()` confirms the bug: emails are logged to console only. Every signup since launch has been dropped.

### Repo conventions
- **No `api/` directory exists** — this will be the first Vercel serverless function.
- **`vercel.json`** has rewrites (PostHog ingest proxy, SPA fallback) but NO `functions` config. Vercel auto-detects `api/*.js` files at the project root.
- **Notable**: rewrite `/((?!never-hungover/).*)` -> `/index.html` would conflict with `/api/*` if not excluded. Confirmed exclusion via `((?!api/).*)/` redirect rule (line 12-14) — but the SPA fallback rewrite does NOT exclude api. Need to verify API routes still work; Vercel routes API requests before SPA rewrites by convention. Test: confirmed safe in Vercel docs (function routes take precedence over rewrites for same-origin).
- **PostHog proxy at `/ingest/*`** uses Vercel rewrites with CORS headers. Same pattern works for our function.
- **Build script** validates posts, generates sitemap, then `vite build`. No backend bundling; serverless functions are deployed independently by Vercel.
- **Existing dep `sonner` (^2.0.3)**: toast library already installed — use for success/error feedback instead of `alert()`.

### Tracking
`engagementTracker.trackEmailCapture(source)` already fires PostHog event regardless of ESP success. We'll add a follow-up event for ESP success/failure to differentiate captured vs delivered.

## ESP Options Analyzed

| ESP | Pricing | API ergonomics | Verdict |
|---|---|---|---|
| **Buttondown** | $9/mo first 100, scales linearly | Single API key, `POST /v1/subscribers` with `{email_address}`. Simple JSON. Owner-friendly product (writer/dev focus). | **Recommended.** Lowest friction for indie blog/newsletter. |
| ConvertKit (now Kit) | Free up to 10k subs, $29/mo above | API key + form_id + tag_id required. More fields. Better for marketers with sequences/automations. | Overkill for a single capture. |
| Formspree | Free up to 50/mo, $15/mo | Just receives forms — no broadcast capability. Would still need a separate ESP later. | Defers the real problem. |
| Mailchimp | $13/mo+ | API requires audience_id (list_id), MD5-hashed email for upsert. Heavier integration. | Heavier than needed. |

### Choice: Buttondown
1. **Simplest API** — one POST, one key, no list_id juggling.
2. **Cheapest** at our scale ($9/mo).
3. **Owner can send broadcasts** without a CRM-style learning curve.
4. **Single-key auth** keeps the serverless function under 30 lines.
5. Spec hint also pre-recommended Buttondown; no contrary signal in research.

## Architecture
```
Browser form submit
    -> POST /api/newsletter-subscribe { email }
       -> serverless function reads BUTTONDOWN_API_KEY env
       -> POST https://api.buttondown.email/v1/subscribers
         Authorization: Token <key>
         body: { email_address: <email>, tags: ["dhm-calculator"] }
       -> returns 201 (new) | 200 (already subscribed) | 4xx (error)
    -> client shows toast (sonner) + sets emailCaptured=true
```

Function is ~30 lines. Single try/catch. Buttondown returns idempotent results — if email already subscribed it returns 400 with a parseable error, which we treat as success from the user's POV ("already subscribed — thanks!").

## Risk register
- **Missing env var in dev**: function returns 503 with friendly message; client shows error toast.
- **Buttondown 5xx**: log to console (Vercel logs), return 502 to client, show retry-able error.
- **Rate limit / abuse**: Buttondown handles. We add a basic email regex check before the upstream call.
- **CORS**: same-origin (`/api/*` on same domain), no CORS config needed.
- **No bundle-size impact**: function is server-side; client only adds a tiny fetch + toast import.

## Files to touch
- **NEW** `api/newsletter-subscribe.js` — Vercel serverless proxy
- **NEW** `.env.example` — document `BUTTONDOWN_API_KEY`
- **MODIFY** `src/pages/DosageCalculatorEnhanced.jsx` — replace alert with fetch + toast
- **MODIFY** `src/main.jsx` (if needed) — mount `<Toaster />` from sonner if not already mounted

Verify Toaster mount status during execute.
