# Requirements — Issue #287: Filter Bot Traffic from LCP Measurement

## Problem
PostHog reports desktop LCP averaging 22.4s, looking like a critical performance regression. Investigation (see `research.md`) shows 81.5% of desktop `$web_vitals` samples come from a single headless-Chrome bot (Chrome 145, screen 800x600, viewport 1920, `www.google.com` referrer). Real-user desktop p50 LCP is **1.99s** — well within Google's "good" threshold.

## Goal
Stop the bot from poisoning our LCP reporting so future audits return real-user numbers without manual filtering.

## Functional Requirements

### FR-1: New `posthog-query.sh lcp-real` subcommand
- Reports real-user desktop LCP (samples, avg, p50, p75, p95) over the last 7 days.
- Excludes events matching the bot fingerprint:
  - `$device_type = 'Desktop'`
  - `$raw_user_agent LIKE '%Chrome/145.0.0.0%'`
  - `$screen_width = 800` AND `$screen_height = 600` AND `$viewport_width = 1920`
- Reports the bot cohort separately (samples + avg LCP) for transparency.
- Help text in the script's `*)` case lists the new command.

### FR-2: Document the bot signature
- Research findings written to `specs/issue-287-lcp-investigation/research.md` (done).
- A short comment in `scripts/posthog-query.sh` next to the new subcommand explains what's being filtered and why.

## Non-Goals (explicitly OUT of scope)
- No code-performance changes (hero images, render-blocking JS, font-loading) — real users are fine.
- No PostHog dashboard config changes (saved insights/filters live in PostHog UI; out of repo scope).
- No SDK-level bot-blocking via `before_send` — too risky to ship without testing, and a single CLI helper meets the immediate need.
- No backfill / event deletion — historical bot data stays in PostHog; we just filter at query time.

## Acceptance Criteria
- `./scripts/posthog-query.sh lcp-real` runs and prints a table showing real-user vs bot cohorts.
- Real-user cohort p50 displays under 2.5s (Google "good" threshold) given current data.
- `./scripts/posthog-query.sh` (no args) help output includes `lcp-real` in the command list.
- `research.md` clearly documents the bot fingerprint so this isn't re-investigated in 3 months.
