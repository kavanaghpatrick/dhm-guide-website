# Requirements — Issue #308 PostHog Dashboard

## Functional

1. **10 HogQL subcommands** added to `scripts/posthog-query.sh`:
   - `channel-mix` — last 30d, channel & pageview count, percentage
   - `daily-pv` — daily pageview count, last 90d
   - `affiliate-by-channel` — affiliate_link_click count grouped by synthesized channel
   - `ai-search` — pageview count grouped by AI-search referrer engine
   - `top-pv` — top 20 pages by pageview count, last 30d
   - `top-ctr` — top 20 pages by affiliate_link_click / pageview ratio (last 30d)
   - `engagement-watchdog` — time_on_page_milestone daily count, last 30d
   - `exception-watchdog` — $exception daily count, last 30d
   - `newsletter-signups` — newsletter_subscribe_succeeded count, last 30d
   - `device-cr` — mobile vs desktop conversion rate (affiliate clicks / pageviews) per page, last 30d, top 20

2. **Dashboard config JSON** at `scripts/posthog-dashboard-config.json`:
   - Dashboard name: "Traffic Growth — 10 Tile Master"
   - 10 insights, one per subcommand, using `DataTableNode` + identical HogQL strings.

3. **Dashboard creation script** at `scripts/posthog-create-dashboard.sh`:
   - Reads the config JSON.
   - POSTs dashboard, then POSTs each insight (attached to dashboard).
   - Prints final dashboard URL.

## Non-functional

- Auth via `POSTHOG_PERSONAL_API_KEY` (existing pattern, no new env vars).
- Project id `275753` (matches `posthog-baseline.sh`).
- Subcommand output: CSV-friendly text to stdout for diff vs baseline.
- Each subcommand's HogQL must match the corresponding dashboard insight's HogQL exactly (single source of truth — copy-paste safe).
- Help text (`./scripts/posthog-query.sh` no args) lists all new commands.

## Out of scope

- Modifying `posthog-baseline.sh` (existing scalars cover the watchdog tiles already).
- Live dashboard creation — script can be run by user; we attempt it but do not block on success.
- Adding tracking for new events (e.g., wiring newsletter signup itself — that's #285).
