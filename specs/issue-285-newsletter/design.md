# Design: Newsletter Capture Wire-up (Issue #285)

## Architecture

```
[browser]
  DosageCalculatorEnhanced.jsx
    └─ handleEmailCapture(email)
         └─ fetch('/api/newsletter-subscribe', { method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, source }) })
                                |
                                v
[vercel serverless]
  api/newsletter-subscribe.js
    1. Validate method is POST
    2. Parse + validate email regex
    3. Read BUTTONDOWN_API_KEY (return 503 if missing)
    4. POST to https://api.buttondown.email/v1/subscribers
         Authorization: Token <key>
         body: { email_address, tags: ["dhm-calculator"], metadata: { source } }
    5. Map upstream response → client-friendly status
                                |
                                v
[client]
  - 2xx → sonner toast success, setEmailCaptured(true), trackEvent('newsletter_subscribe_succeeded')
  - 4xx/5xx → sonner toast error, leave form open, trackEvent('newsletter_subscribe_failed')
```

## File-by-file plan

### NEW: `api/newsletter-subscribe.js` (~50 lines)
Vercel serverless function (Node runtime, default). Exports default handler `(req, res) => {}`.

Logic:
1. Reject non-POST with 405.
2. Parse `req.body` (Vercel auto-parses JSON when Content-Type is application/json).
3. Validate `email` against simple regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Return 400 if invalid.
4. Validate `source` is in `['inline','exit_intent','unknown']`; default `'unknown'`.
5. If `process.env.BUTTONDOWN_API_KEY` is missing → 503 `{ error: "Newsletter service not configured" }`.
6. `fetch('https://api.buttondown.email/v1/subscribers', { method: 'POST', headers: { 'Authorization': \`Token ${key}\`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email_address: email, tags: ['dhm-calculator'], metadata: { source } }) })`
7. If upstream `res.status === 201` → 200 `{ ok: true, status: 'subscribed' }`.
8. If upstream `res.status === 400` AND body contains "already" → 200 `{ ok: true, status: 'already_subscribed' }`.
9. Other 4xx → return upstream status with `{ ok: false, error: "Invalid request" }`.
10. 5xx or thrown → 502 `{ ok: false, error: "Newsletter service unavailable" }`. Log to Vercel via `console.error`.

### MODIFY: `src/pages/DosageCalculatorEnhanced.jsx`
Replace `handleEmailCapture` body (lines 730-750):
- Add `try/catch` around fetch to `/api/newsletter-subscribe`.
- Use sonner `toast.success` / `toast.error` from `import { toast } from 'sonner'`.
- Track new PostHog events. Reuse existing `trackEvent` import (already imported per `trackEvent('calculator_form_submitted', ...)` at line 670).
- Only setEmailCaptured(true) on success (so user can retry on failure).

Add toast import at top: `import { toast } from 'sonner'`.

### MODIFY: `src/main.jsx` (only if Toaster not mounted)
Verify `<Toaster />` is mounted globally. If not, add it.

### NEW: `.env.example`
Document `BUTTONDOWN_API_KEY=` placeholder. Tracked by git so contributors know which envs to set.

## Error-handling matrix

| Failure | HTTP from function | Client behavior |
|---|---|---|
| Non-POST | 405 | Won't happen via UI; defensive only |
| Invalid email | 400 | Toast: "That email looks invalid" |
| Missing env var | 503 | Toast: "Couldn't reach our newsletter service" |
| Buttondown 5xx | 502 | Toast: "Couldn't reach our newsletter service" |
| Buttondown auth fail (401) | 502 | Same as above (admin sees `console.error` in Vercel logs) |
| Already subscribed | 200 (mapped) | Toast success — same UX as new subscribe |
| Network error (offline) | n/a (fetch throws) | Caught by client `try/catch`, toast error |

## Security
- **API key**: only in `process.env.BUTTONDOWN_API_KEY` on Vercel. Never imported in client code. `.env.example` contains only the var name with empty value.
- **CORS**: not needed — function is same-origin (`https://www.dhmguide.com/api/*`).
- **CSP impact**: zero — no new third-party domains exposed to the client. All Buttondown traffic is server-to-server.
- **Rate limiting**: rely on Buttondown's upstream rate limit. If abuse appears, add a per-IP throttle later (not in scope).
- **Input validation**: simple regex client-side AND server-side (defense in depth). No HTML rendering of user input anywhere.
- **PII**: email is sent to Buttondown only. No logging of emails on our side.

## Rollback
Single PR revert. Reverts:
- Removes `api/newsletter-subscribe.js`.
- Restores `handleEmailCapture` to console.log + alert().
- Removes sonner toast import (if not used elsewhere — verify).
- Removes `.env.example`.

No DB, no migrations, no deploy-time side effects. Worst case: emails go back to being dropped (status quo).

## Out of scope (deferred)
- Double opt-in confirmation emails (Buttondown handles this in their dashboard).
- Subscriber tagging beyond `dhm-calculator` (single tag is enough for v1).
- Migrations of historical signups (none exist — emails were never persisted).
- A/B testing copy variants of the toast.
- Per-IP rate limiting (Buttondown handles enough for v1).
