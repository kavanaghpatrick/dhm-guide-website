# [Phase 1] Wire up newsletter capture — emails being dropped into a TODO

Refs #283. Email-capture UX wired up but integration was never connected.

## Problem
`src/pages/DosageCalculatorEnhanced.jsx:566, 730` capture emails. Line 747:
```js
// TODO: Integrate with Formspree or ConvertKit (Issue #180)
```
Every signup since launch has been silently dropped.

## Fix (~2-4 hrs)
1. Pick ESP (Buttondown $9/mo, simple — recommend; or ConvertKit)
2. Add `api/newsletter-subscribe.js` Vercel serverless (~30 lines, proxies to Buttondown's `/v1/subscribers`, keeps API key server-side)
3. Wire `DosageCalculatorEnhanced.jsx:747` to POST to it
4. Set `BUTTONDOWN_API_KEY` in Vercel env

## Source
`docs/traffic-growth-2026-04-26/synthesis-S1-critical-fires.md` Fire #2.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
