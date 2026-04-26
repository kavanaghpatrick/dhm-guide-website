# Design — Issue #308 PostHog Dashboard

## File layout

```
scripts/
  posthog-query.sh                 (MODIFIED — add 10 subcommands)
  posthog-dashboard-config.json    (NEW — 10-insight dashboard spec)
  posthog-create-dashboard.sh      (NEW — apply config via API)
```

## Channel-classification SQL (shared)

Reused inline in 3 of the 10 queries (channel-mix, affiliate-by-channel, ai-search). Kept inline rather than as a UDF — HogQL doesn't support persistent UDFs and inlining keeps each query copy-paste-runnable in PostHog UI.

## The 10 HogQL queries

### 1. channel-mix
```sql
SELECT
  CASE
    WHEN properties.$referrer LIKE '%google.%' THEN 'google'
    WHEN properties.$referrer LIKE '%bing.%' THEN 'bing'
    WHEN properties.$referrer LIKE '%duckduckgo%' THEN 'duckduckgo'
    WHEN properties.$referrer LIKE '%chatgpt%' OR properties.$referrer LIKE '%openai%' THEN 'chatgpt'
    WHEN properties.$referrer LIKE '%perplexity%' THEN 'perplexity'
    WHEN properties.$referrer LIKE '%claude.ai%' THEN 'claude'
    WHEN properties.$referrer LIKE '%gemini.google%' OR properties.$referrer LIKE '%bard.google%' THEN 'gemini'
    WHEN properties.$referrer LIKE '%copilot.microsoft%' THEN 'copilot'
    WHEN properties.$referrer LIKE '%facebook%' OR properties.$referrer LIKE '%instagram%' OR properties.$referrer LIKE '%t.co%' OR properties.$referrer LIKE '%reddit%' THEN 'social'
    WHEN properties.$referrer = '$direct' OR properties.$referrer IS NULL OR properties.$referrer = '' THEN 'direct'
    ELSE 'other'
  END AS channel,
  count() AS pageviews,
  round(100.0 * count() / sum(count()) OVER (), 2) AS pct
FROM events
WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY channel
ORDER BY pageviews DESC
```

### 2. daily-pv
```sql
SELECT toDate(timestamp) AS day, count() AS pageviews
FROM events
WHERE event = '$pageview' AND timestamp > now() - INTERVAL 90 DAY
GROUP BY day ORDER BY day DESC
```

### 3. affiliate-by-channel
Same channel CASE applied to `affiliate_link_click` events.

### 4. ai-search
```sql
SELECT
  CASE
    WHEN properties.$referrer LIKE '%chatgpt%' OR properties.$referrer LIKE '%openai%' THEN 'chatgpt'
    WHEN properties.$referrer LIKE '%perplexity%' THEN 'perplexity'
    WHEN properties.$referrer LIKE '%claude.ai%' THEN 'claude'
    WHEN properties.$referrer LIKE '%gemini.google%' OR properties.$referrer LIKE '%bard.google%' THEN 'gemini'
    WHEN properties.$referrer LIKE '%copilot.microsoft%' THEN 'copilot'
  END AS engine,
  count() AS pageviews
FROM events
WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 DAY
  AND (properties.$referrer LIKE '%chatgpt%'
    OR properties.$referrer LIKE '%openai%'
    OR properties.$referrer LIKE '%perplexity%'
    OR properties.$referrer LIKE '%claude.ai%'
    OR properties.$referrer LIKE '%gemini.google%'
    OR properties.$referrer LIKE '%bard.google%'
    OR properties.$referrer LIKE '%copilot.microsoft%')
GROUP BY engine ORDER BY pageviews DESC
```

### 5. top-pv
```sql
SELECT properties.$pathname AS path, count() AS pageviews
FROM events
WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY path ORDER BY pageviews DESC LIMIT 20
```

### 6. top-ctr
```sql
SELECT
  pv.path AS path,
  pv.pageviews,
  coalesce(aff.clicks, 0) AS clicks,
  round(100.0 * coalesce(aff.clicks, 0) / pv.pageviews, 2) AS ctr_pct
FROM (
  SELECT properties.$pathname AS path, count() AS pageviews
  FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
  GROUP BY path
) pv
LEFT JOIN (
  SELECT properties.$pathname AS path, count() AS clicks
  FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY
  GROUP BY path
) aff ON aff.path = pv.path
WHERE pv.pageviews >= 50
ORDER BY ctr_pct DESC LIMIT 20
```

### 7. engagement-watchdog
```sql
SELECT toDate(timestamp) AS day, count() AS milestones
FROM events
WHERE event = 'time_on_page_milestone' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day ORDER BY day DESC
```

### 8. exception-watchdog
```sql
SELECT toDate(timestamp) AS day, count() AS exceptions
FROM events
WHERE event = '$exception' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day ORDER BY day DESC
```

### 9. newsletter-signups
```sql
SELECT toDate(timestamp) AS day, count() AS signups
FROM events
WHERE event = 'newsletter_subscribe_succeeded' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day ORDER BY day DESC
```

### 10. device-cr
```sql
SELECT
  pv.path AS path,
  pv.device AS device,
  pv.pageviews,
  coalesce(aff.clicks, 0) AS clicks,
  round(100.0 * coalesce(aff.clicks, 0) / pv.pageviews, 2) AS cr_pct
FROM (
  SELECT properties.$pathname AS path, properties.$device_type AS device, count() AS pageviews
  FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
  GROUP BY path, device
) pv
LEFT JOIN (
  SELECT properties.$pathname AS path, properties.$device_type AS device, count() AS clicks
  FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY
  GROUP BY path, device
) aff ON aff.path = pv.path AND aff.device = pv.device
WHERE pv.pageviews >= 50
ORDER BY pv.pageviews DESC LIMIT 20
```

## Subcommand implementation pattern

Inside `posthog-query.sh`, write a helper that takes a HogQL string and pipes JSON results to a python printer. Each subcommand:

```bash
hogql_table() {
  local sql="$1"; shift
  local headers="$*"
  local payload
  payload=$(python3 -c 'import json,sys; print(json.dumps({"query":{"kind":"HogQLQuery","query":sys.argv[1]}}))' "$sql")
  curl -s -X POST "$BASE_URL/query" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
hdr='$headers'.split(',') if '$headers' else d.get('columns',[])
print(','.join(hdr))
for r in d.get('results',[]):
    print(','.join(str(c) for c in r))"
}
```

Each subcommand calls `hogql_table "<SQL>" "col1,col2,..."`. Avoids the `'"'"'` escaping mess by passing the SQL through python's json encoder.

## Dashboard JSON shape

```json
{
  "name": "Traffic Growth — 10 Tile Master",
  "description": "...",
  "tiles": [
    {
      "name": "Channel mix (30d)",
      "query": { "kind": "DataTableNode", "source": { "kind": "HogQLQuery", "query": "..." } }
    },
    ...
  ]
}
```

## Dashboard create script

Pseudocode:
```
1. POST /dashboards/ {name, description} → dashboard_id
2. For each tile in config:
   POST /insights/ {name, query, dashboards: [dashboard_id], saved: true}
3. Print https://us.posthog.com/project/275753/dashboard/<id>
```

Implementation in bash + python3 inline (consistent with existing scripts).
