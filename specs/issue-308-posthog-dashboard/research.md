# Research — Issue #308 PostHog Dashboard (10 tiles)

## Existing patterns

### `scripts/posthog-query.sh`
- Bash CLI dispatched via `case "$1"`.
- Auth: `POSTHOG_PERSONAL_API_KEY` env var (required, fail if missing).
- BASE_URL: `https://us.posthog.com/api/projects/@current` (resolves project from key).
- Two query styles in use:
  - `EventsQuery` (high-level)
  - `HogQLQuery` (raw SQL — preferred for this work since master plan provides HogQL)
- Output: piped to `python3 -c` for compact CSV/table formatting.
- Embedded SQL uses awkward `'"'"'` escaping. Cleaner option for new subcommands: read query from a heredoc into a variable, jq-encode into JSON.

### `scripts/posthog-baseline.sh`
- Same auth pattern. Different base: `/api/projects/275753/query` (hardcoded project id).
- Wraps `curl + python3` into a `hog()` shell function returning the first cell as a scalar.
- Writes CSV to `specs/issue-268-implementation/baseline-pre-merge.csv`.
- This is the per-PR baseline harness referenced in issue #308's promotion rationale.

### Event taxonomy (from `src/lib/posthog.js`)
- `$pageview` — every page (with `$pathname`, `$current_url`, `$referrer`).
- `affiliate_link_click` — Amazon clicks (props: `product_name`, `placement`, `link_position`).
- `scroll_depth_milestone` — props: `depth_percentage`, `page_path`, `device_type`.
- `time_on_page_milestone` — engagement watchdog.
- `$exception` — auto from PostHog SDK.
- `newsletter_subscribe_succeeded` — wired in `DosageCalculatorEnhanced.jsx:747` (zero events today; will fire after #285 ships).
- Person props include `initial_referrer`, `initial_utm_source/medium/campaign`.

## PostHog dashboard API

PostHog supports programmatic dashboard creation:
- `POST /api/projects/<project_id>/dashboards/` — create dashboard (returns dashboard id).
- `POST /api/projects/<project_id>/insights/` — create insight; pass `dashboards: [<id>]` to attach.
- Insight payload uses `query` field (same shape as `/query` endpoint). Query kinds: `HogQLQuery`, `TrendsQuery`, `EventsQuery`.

For HogQL-based tiles, `DataTableNode` wraps a `HogQLQuery` so PostHog renders the table view. `InsightVizNode` wraps `TrendsQuery` for line charts. We can stick with `DataTableNode` + HogQL for all 10 tiles — keeps source-of-truth identical to the CLI.

Project id `275753` already used in `posthog-baseline.sh` — reuse.

## Channel definition (HogQL)

PostHog doesn't auto-derive a "channel" from `$referrer` like GA4. We synthesize:
```sql
CASE
  WHEN properties.$referrer LIKE '%google%' THEN 'google'
  WHEN properties.$referrer LIKE '%bing%' THEN 'bing'
  WHEN properties.$referrer LIKE '%duckduckgo%' THEN 'duckduckgo'
  WHEN properties.$referrer LIKE '%chatgpt%' OR properties.$referrer LIKE '%openai%' THEN 'chatgpt'
  WHEN properties.$referrer LIKE '%perplexity%' THEN 'perplexity'
  WHEN properties.$referrer LIKE '%claude.ai%' OR properties.$referrer LIKE '%anthropic%' THEN 'claude'
  WHEN properties.$referrer LIKE '%gemini.google%' OR properties.$referrer LIKE '%bard.google%' THEN 'gemini'
  WHEN properties.$referrer LIKE '%copilot.microsoft%' THEN 'copilot'
  WHEN properties.$referrer LIKE '%facebook%' OR properties.$referrer LIKE '%instagram%' OR properties.$referrer LIKE '%t.co%' OR properties.$referrer LIKE '%reddit%' THEN 'social'
  WHEN properties.$referrer = '$direct' OR properties.$referrer IS NULL OR properties.$referrer = '' THEN 'direct'
  ELSE 'other'
END AS channel
```

AI engines isolated as their own buckets (per issue #308 tile 4).

## Decisions

1. **HYBRID approach** as suggested:
   - 10 new HogQL subcommands in `posthog-query.sh` (CLI surface, exact same SQL as dashboard).
   - `scripts/posthog-dashboard-config.json` with 10 insight definitions ready to POST.
   - `scripts/posthog-create-dashboard.sh` to build the dashboard via API.
2. **Project id**: hardcode `275753` (matches `posthog-baseline.sh`).
3. **Auth**: same `POSTHOG_PERSONAL_API_KEY` pattern (no new envs).
4. **Output format**: compact CSV-ish printed to stdout for diffing.
5. **No backward-compatibility risk**: subcommands are additive; existing commands (`events`, `scroll`, `affiliate`, …) untouched.
6. **`posthog-baseline.sh` integration**: leave as-is. It already captures pageview/affiliate/exception/engagement scalars. Adding the new dashboard doesn't require rewriting it. (Future enhancement — out of scope for #308.)
