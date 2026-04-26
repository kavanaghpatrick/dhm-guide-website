# Tasks: Newsletter Capture Wire-up (Issue #285)

10 fine-grained tasks. Each: file path, action, verify command.

## T1. Create serverless function file
- **File**: `api/newsletter-subscribe.js` (NEW; will trigger creation of `api/` dir)
- **Action**: Write Vercel default-export handler. POST-only. Validates email regex. Returns 503 if `BUTTONDOWN_API_KEY` missing. Proxies to `https://api.buttondown.email/v1/subscribers` with `Authorization: Token <key>`. Maps upstream 201/400(already-subscribed) → 200; other 4xx pass through; 5xx → 502.
- **Verify**: `node -e "require('./api/newsletter-subscribe.js')"` (basic require parse) — but ESM, so use `node --input-type=module -e "import('./api/newsletter-subscribe.js').then(m => console.log(typeof m.default))"`. Expect `function`.

## T2. Verify Toaster is mounted globally
- **File**: `src/main.jsx` (or `src/App.jsx`)
- **Action**: Search for `<Toaster` — if missing, import `{ Toaster }` from `sonner` and mount once near the root.
- **Verify**: `grep -rn "Toaster" src/main.jsx src/App.jsx`

## T3. Import toast in calculator page
- **File**: `src/pages/DosageCalculatorEnhanced.jsx`
- **Action**: Add `import { toast } from 'sonner'` to the existing imports block at the top.
- **Verify**: `grep -n "from 'sonner'" src/pages/DosageCalculatorEnhanced.jsx`

## T4. Replace handleEmailCapture body
- **File**: `src/pages/DosageCalculatorEnhanced.jsx` lines 730-750
- **Action**: Replace `alert()` with `fetch('/api/newsletter-subscribe', POST)`; wire toast success/error; only `setEmailCaptured(true)` on 2xx; fire `trackEvent('newsletter_subscribe_succeeded' | 'newsletter_subscribe_failed', { source, ... })`.
- **Verify**: `grep -n "newsletter-subscribe\|toast.success\|toast.error" src/pages/DosageCalculatorEnhanced.jsx`

## T5. Verify trackEvent is imported
- **File**: `src/pages/DosageCalculatorEnhanced.jsx`
- **Action**: Confirm `trackEvent` is imported (already used line 670). If not, add it.
- **Verify**: `grep -n "trackEvent" src/pages/DosageCalculatorEnhanced.jsx | head -3`

## T6. Create .env.example
- **File**: `.env.example` (NEW at project root)
- **Action**: Document `BUTTONDOWN_API_KEY=` with an inline comment about where to get it and which Vercel env to set.
- **Verify**: `cat .env.example`

## T7. Build passes
- **File**: n/a
- **Action**: Run `npm run build`.
- **Verify**: exit code 0; `dist/` exists; no errors about missing imports or `Toaster`.

## T8. Static check on serverless function
- **File**: `api/newsletter-subscribe.js`
- **Action**: Visually verify no `BUTTONDOWN_API_KEY` is hardcoded; no client-only imports (no React, no `import.meta.env`); only `process.env`.
- **Verify**: `grep -n "process.env.BUTTONDOWN_API_KEY" api/newsletter-subscribe.js`; `grep -n "import.meta\|react" api/newsletter-subscribe.js` — must return nothing.

## T9. Commit on branch
- **File**: git
- **Action**: `git add` only the spec files + new code + `.env.example`. Commit with reference to #285 / #283.
- **Verify**: `git log -1 --stat`

## T10. Open PR + admin-merge
- **File**: GitHub
- **Action**: `gh pr create` with title `fix: wire up newsletter capture to Buttondown serverless proxy`, body containing `Closes #285. Refs #283.` + USER ACTION block (Buttondown account + Vercel env). Then `gh pr merge --squash --delete-branch --admin`.
- **Verify**: `gh pr view --json state,mergedAt`; expect `MERGED`.
