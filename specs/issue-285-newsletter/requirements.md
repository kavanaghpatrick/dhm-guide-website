# Requirements: Newsletter Capture Wire-up (Issue #285)

## Problem statement
The DHM dosage calculator at `/dhm-dosage-calculator` collects emails via two UX surfaces (inline form + exit-intent popup) but the submit handler `handleEmailCapture` only logs to console and shows a placeholder `alert()`. Every newsletter signup since the calculator launched has been silently dropped. The TODO at `src/pages/DosageCalculatorEnhanced.jsx:747` traces back to Issue #180 (never closed).

This blocks downstream traffic-growth plans (referenced in `docs/traffic-growth-2026-04-26/synthesis-S1-critical-fires.md` Fire #2) that depend on a working email list.

## User stories

### US-1: Visitor receives confirmation that signup worked
**As a** visitor who entered my email,
**I want** clear feedback that I'm subscribed,
**So that** I trust the signup and don't try again.

**Acceptance criteria**
- AC1.1 On 2xx from `/api/newsletter-subscribe`, a success toast appears: "Subscribed — check your inbox for your DHM guide."
- AC1.2 The form/popup closes; `emailCaptured` flips to `true`; the value-prop card hides.
- AC1.3 No browser `alert()` anywhere in the flow.

### US-2: Visitor sees a real error if signup fails
**As a** visitor whose request failed,
**I want** an actionable error message,
**So that** I can retry or know to contact support.

**Acceptance criteria**
- AC2.1 On 4xx (validation), toast says: "That email looks invalid — please check and try again." Form stays open.
- AC2.2 On 5xx / network failure, toast says: "Couldn't reach our newsletter service — please try again in a minute." Form stays open.
- AC2.3 If email is already subscribed (Buttondown returns 400 with that signal), treat as success from user's POV.

### US-3: Newsletter owner has emails captured in Buttondown
**As the** site owner,
**I want** captured emails to land in Buttondown with a tag identifying the source,
**So that** I can broadcast to calculator subscribers.

**Acceptance criteria**
- AC3.1 Successful POST creates a Buttondown subscriber with `tags: ["dhm-calculator"]` and `metadata.source: "<inline|exit_intent>"`.
- AC3.2 Buttondown API key never appears in client bundle, git history, or browser network tab.
- AC3.3 Function works in production once `BUTTONDOWN_API_KEY` is set in Vercel env.

### US-4: Function fails gracefully when env var is missing (dev/preview)
**As a** developer running locally without `BUTTONDOWN_API_KEY` set,
**I want** the function to return a clear error instead of crashing,
**So that** I can debug other features without setting up an ESP account.

**Acceptance criteria**
- AC4.1 Missing env var: function returns 503 with `{ error: "Newsletter service not configured" }`.
- AC4.2 Client shows the same generic 5xx toast (US-2.2).

### US-5: Successful captures are visible in PostHog
**As an** analyst,
**I want** to differentiate "form submitted" from "ESP confirmed delivery",
**So that** I can detect ESP outages.

**Acceptance criteria**
- AC5.1 `engagementTracker.trackEmailCapture(source)` continues to fire on submit (already wired).
- AC5.2 New PostHog event `newsletter_subscribe_succeeded` fires on 2xx with `{ source, esp: "buttondown" }`.
- AC5.3 New PostHog event `newsletter_subscribe_failed` fires on 4xx/5xx with `{ source, status, esp }`.

## Quality requirements
- **Build**: `npm run build` must pass (validates posts, sitemap, prerender).
- **No secrets in code**: `BUTTONDOWN_API_KEY` only via `process.env` in serverless function.
- **No breakage**: existing tracking (`trackEmailCapture`, `setEmailCaptured`) still fires.
- **Bundle size**: client-side delta < 1 KB gzip (sonner already in deps).
- **Rollback**: single PR revert restores prior behavior.
- **Test plan**: manually POST to function with curl in preview; verify 503 path locally without env var.
