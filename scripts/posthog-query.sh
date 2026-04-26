#!/bin/bash
# PostHog Query Helper for DHM Guide
# Usage: ./scripts/posthog-query.sh [command]

API_KEY="${POSTHOG_PERSONAL_API_KEY:?Set POSTHOG_PERSONAL_API_KEY in your environment (~/.zshrc) — see docs/posthog-analysis-2026-04-25/r10-hygiene.md}"
BASE_URL="https://us.posthog.com/api/projects/@current"

# hogql_table SQL HEADERS_CSV
# Runs an arbitrary HogQL string and prints CSV (header + rows) to stdout.
# Used by the 10 traffic-growth dashboard subcommands below — single source of
# truth for the SQL that also powers scripts/posthog-dashboard-config.json.
hogql_table() {
  local sql="$1"
  local headers="$2"
  local payload
  payload=$(python3 -c 'import json,sys; print(json.dumps({"query":{"kind":"HogQLQuery","query":sys.argv[1]}}))' "$sql")
  curl -s -X POST "$BASE_URL/query" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | HEADERS="$headers" python3 -c "
import json, os, sys
d = json.load(sys.stdin)
hdr = os.environ.get('HEADERS','').split(',') if os.environ.get('HEADERS') else d.get('columns', [])
if hdr:
    print(','.join(hdr))
for r in d.get('results', []):
    print(','.join('' if c is None else str(c) for c in r))"
}

case "$1" in
  events)
    echo "=== Event Counts (Last 7 Days) ==="
    curl -s -X POST "$BASE_URL/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"query": {"kind": "EventsQuery", "select": ["event", "count()"], "after": "-7d", "limit": 20}}' \
      | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f'{r[0]}: {r[1]}') for r in d.get('results',[])]"
    ;;

  scroll)
    echo "=== Scroll Depth Events ==="
    curl -s "$BASE_URL/events?event=scroll_depth_milestone&limit=20" \
      -H "Authorization: Bearer $API_KEY" \
      | python3 -c "
import json,sys
d=json.load(sys.stdin)
for e in d.get('results',[]):
    p=e.get('properties',{})
    print(f\"{p.get('depth')}% on {p.get('page_path')} ({p.get('device_type')})\")"
    ;;

  affiliate)
    echo "=== Affiliate Link Clicks ==="
    curl -s "$BASE_URL/events?event=affiliate_link_click&limit=20" \
      -H "Authorization: Bearer $API_KEY" \
      | python3 -c "
import json,sys
d=json.load(sys.stdin)
for e in d.get('results',[]):
    p=e.get('properties',{})
    print(f\"Product: {p.get('product_name','?')[:30]}\")
    print(f\"  Placement: {p.get('placement')} | Position: {p.get('link_position')} | Scroll: {p.get('scroll_depth')}%\")
    print()"
    ;;

  pageviews)
    echo "=== Pageviews by Path ==="
    curl -s -X POST "$BASE_URL/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"query": {"kind": "EventsQuery", "select": ["properties.$pathname", "count()"], "event": "$pageview", "after": "-7d", "limit": 20}}' \
      | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f'{r[0]}: {r[1]}') for r in d.get('results',[])]"
    ;;

  funnel)
    echo "=== Conversion Funnel (Pageview -> Scroll 50% -> Affiliate Click) ==="
    echo "Coming soon - requires funnel query setup in PostHog dashboard"
    ;;

  dead-clicks-raw)
    echo "=== Dead Clicks (Raw, Last 7 Days) ==="
    curl -s -X POST "$BASE_URL/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"query": {"kind": "HogQLQuery", "query": "SELECT count() AS c FROM events WHERE event = '"'"'$dead_click'"'"' AND timestamp > now() - INTERVAL 7 DAY"}}' \
      | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f'count: {r[0]}') for r in d.get('results',[])]"
    ;;

  dead-clicks-real)
    echo "=== Dead Clicks (Real / Filtered, Last 7 Days) ==="
    curl -s -X POST "$BASE_URL/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"query": {"kind": "HogQLQuery", "query": "SELECT count() AS c FROM events WHERE event = '"'"'$dead_click'"'"' AND coalesce(properties.$external_click_url, '"'"''"'"') NOT LIKE '"'"'%amzn%'"'"' AND coalesce(properties.$external_click_url, '"'"''"'"') NOT LIKE '"'"'%amazon%'"'"' AND coalesce(properties.$external_click_url, '"'"''"'"') NOT LIKE '"'"'%fullerhealth%'"'"' AND timestamp > now() - INTERVAL 7 DAY"}}' \
      | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f'count: {r[0]}') for r in d.get('results',[])]"
    ;;

  # Desktop LCP shows ~22s avg in raw data, but 81.5% of samples are a single
  # headless-Chrome bot (Chrome/145.0.0.0, screen 800x600, viewport 1920, all
  # entering via www.google.com referrer — almost certainly Google's SERP
  # preview crawler). This subcommand splits real users from that bot so the
  # real-user numbers aren't masked.
  # See specs/issue-287-lcp-investigation/research.md for full evidence.
  lcp-real)
    echo "=== Desktop LCP — real users vs suspect bot (last 7 days) ==="
    curl -s -X POST "$BASE_URL/query" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"query": {"kind": "HogQLQuery", "query": "SELECT CASE WHEN properties.$raw_user_agent LIKE '"'"'%Chrome/145.0.0.0%'"'"' AND properties.$screen_width = 800 AND properties.$screen_height = 600 AND properties.$viewport_width = 1920 THEN '"'"'bot_chrome145_800x600'"'"' ELSE '"'"'real_user'"'"' END AS cohort, count() AS samples, avg(properties.$web_vitals_LCP_value) AS avg_ms, quantile(0.5)(properties.$web_vitals_LCP_value) AS p50_ms, quantile(0.75)(properties.$web_vitals_LCP_value) AS p75_ms, quantile(0.95)(properties.$web_vitals_LCP_value) AS p95_ms FROM events WHERE event = '"'"'$web_vitals'"'"' AND timestamp > now() - INTERVAL 7 DAY AND properties.$device_type = '"'"'Desktop'"'"' AND properties.$web_vitals_LCP_value IS NOT NULL GROUP BY cohort ORDER BY cohort ASC"}}' \
      | python3 -c "
import json, sys
d = json.load(sys.stdin)
rows = d.get('results', [])
print(f'{\"cohort\":<28} {\"samples\":>8} {\"avg_s\":>8} {\"p50_s\":>8} {\"p75_s\":>8} {\"p95_s\":>8}')
for r in rows:
    cohort, n, avg, p50, p75, p95 = r
    print(f'{cohort:<28} {n:>8} {avg/1000:>8.2f} {p50/1000:>8.2f} {p75/1000:>8.2f} {p95/1000:>8.2f}')
print()
print('Note: Google\\'s \"good\" LCP threshold is 2.5s. Real-user p50 is the headline number.')"
    ;;

  # ─── Traffic-growth dashboard tiles (issue #308) ─────────────────────────
  # Each subcommand below runs the canonical HogQL for one of the 10
  # dashboard tiles. The same SQL is mirrored into
  # scripts/posthog-dashboard-config.json — keep them in sync.

  channel-mix)
    echo "=== Channel Mix (last 30d) ==="
    hogql_table "SELECT CASE WHEN properties.\$referrer LIKE '%google.%' THEN 'google' WHEN properties.\$referrer LIKE '%bing.%' THEN 'bing' WHEN properties.\$referrer LIKE '%duckduckgo%' THEN 'duckduckgo' WHEN properties.\$referrer LIKE '%chatgpt%' OR properties.\$referrer LIKE '%openai%' THEN 'chatgpt' WHEN properties.\$referrer LIKE '%perplexity%' THEN 'perplexity' WHEN properties.\$referrer LIKE '%claude.ai%' THEN 'claude' WHEN properties.\$referrer LIKE '%gemini.google%' OR properties.\$referrer LIKE '%bard.google%' THEN 'gemini' WHEN properties.\$referrer LIKE '%copilot.microsoft%' THEN 'copilot' WHEN properties.\$referrer LIKE '%facebook%' OR properties.\$referrer LIKE '%instagram%' OR properties.\$referrer LIKE '%t.co%' OR properties.\$referrer LIKE '%reddit%' THEN 'social' WHEN properties.\$referrer = '\$direct' OR properties.\$referrer IS NULL OR properties.\$referrer = '' THEN 'direct' ELSE 'other' END AS channel, count() AS pageviews, round(100.0 * count() / sum(count()) OVER (), 2) AS pct FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 30 DAY GROUP BY channel ORDER BY pageviews DESC" "channel,pageviews,pct"
    ;;

  daily-pv)
    echo "=== Daily Pageviews (last 90d) ==="
    hogql_table "SELECT toDate(timestamp) AS day, count() AS pageviews FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 90 DAY GROUP BY day ORDER BY day DESC" "day,pageviews"
    ;;

  affiliate-by-channel)
    echo "=== Affiliate Clicks by Channel (last 30d) ==="
    hogql_table "SELECT CASE WHEN properties.\$referrer LIKE '%google.%' THEN 'google' WHEN properties.\$referrer LIKE '%bing.%' THEN 'bing' WHEN properties.\$referrer LIKE '%duckduckgo%' THEN 'duckduckgo' WHEN properties.\$referrer LIKE '%chatgpt%' OR properties.\$referrer LIKE '%openai%' THEN 'chatgpt' WHEN properties.\$referrer LIKE '%perplexity%' THEN 'perplexity' WHEN properties.\$referrer LIKE '%claude.ai%' THEN 'claude' WHEN properties.\$referrer LIKE '%gemini.google%' OR properties.\$referrer LIKE '%bard.google%' THEN 'gemini' WHEN properties.\$referrer LIKE '%copilot.microsoft%' THEN 'copilot' WHEN properties.\$referrer LIKE '%facebook%' OR properties.\$referrer LIKE '%instagram%' OR properties.\$referrer LIKE '%t.co%' OR properties.\$referrer LIKE '%reddit%' THEN 'social' WHEN properties.\$referrer = '\$direct' OR properties.\$referrer IS NULL OR properties.\$referrer = '' THEN 'direct' ELSE 'other' END AS channel, count() AS clicks FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY GROUP BY channel ORDER BY clicks DESC" "channel,clicks"
    ;;

  ai-search)
    echo "=== AI-Search Referrers (last 30d) ==="
    hogql_table "SELECT CASE WHEN properties.\$referrer LIKE '%chatgpt%' OR properties.\$referrer LIKE '%openai%' THEN 'chatgpt' WHEN properties.\$referrer LIKE '%perplexity%' THEN 'perplexity' WHEN properties.\$referrer LIKE '%claude.ai%' THEN 'claude' WHEN properties.\$referrer LIKE '%gemini.google%' OR properties.\$referrer LIKE '%bard.google%' THEN 'gemini' WHEN properties.\$referrer LIKE '%copilot.microsoft%' THEN 'copilot' END AS engine, count() AS pageviews FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 30 DAY AND (properties.\$referrer LIKE '%chatgpt%' OR properties.\$referrer LIKE '%openai%' OR properties.\$referrer LIKE '%perplexity%' OR properties.\$referrer LIKE '%claude.ai%' OR properties.\$referrer LIKE '%gemini.google%' OR properties.\$referrer LIKE '%bard.google%' OR properties.\$referrer LIKE '%copilot.microsoft%') GROUP BY engine ORDER BY pageviews DESC" "engine,pageviews"
    ;;

  top-pv)
    echo "=== Top 20 Pages by Pageviews (last 30d) ==="
    hogql_table "SELECT properties.\$pathname AS path, count() AS pageviews FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 30 DAY GROUP BY path ORDER BY pageviews DESC LIMIT 20" "path,pageviews"
    ;;

  top-ctr)
    echo "=== Top 20 Pages by Affiliate CTR (last 30d, min 50 PV) ==="
    hogql_table "SELECT pv.path AS path, pv.pageviews AS pageviews, coalesce(aff.clicks, 0) AS clicks, round(100.0 * coalesce(aff.clicks, 0) / pv.pageviews, 2) AS ctr_pct FROM (SELECT properties.\$pathname AS path, count() AS pageviews FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 30 DAY GROUP BY path) pv LEFT JOIN (SELECT properties.\$pathname AS path, count() AS clicks FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY GROUP BY path) aff ON aff.path = pv.path WHERE pv.pageviews >= 50 ORDER BY ctr_pct DESC LIMIT 20" "path,pageviews,clicks,ctr_pct"
    ;;

  engagement-watchdog)
    echo "=== time_on_page_milestone Daily Volume (last 30d) ==="
    hogql_table "SELECT toDate(timestamp) AS day, count() AS milestones FROM events WHERE event = 'time_on_page_milestone' AND timestamp > now() - INTERVAL 30 DAY GROUP BY day ORDER BY day DESC" "day,milestones"
    ;;

  exception-watchdog)
    echo "=== \$exception Daily Count (last 30d) ==="
    hogql_table "SELECT toDate(timestamp) AS day, count() AS exceptions FROM events WHERE event = '\$exception' AND timestamp > now() - INTERVAL 30 DAY GROUP BY day ORDER BY day DESC" "day,exceptions"
    ;;

  newsletter-signups)
    echo "=== newsletter_subscribe_succeeded (last 30d; expect 0 until #285 ships) ==="
    hogql_table "SELECT toDate(timestamp) AS day, count() AS signups FROM events WHERE event = 'newsletter_subscribe_succeeded' AND timestamp > now() - INTERVAL 30 DAY GROUP BY day ORDER BY day DESC" "day,signups"
    ;;

  device-cr)
    echo "=== Mobile vs Desktop CR per Page (last 30d, top 20 by PV) ==="
    hogql_table "SELECT pv.path AS path, pv.device AS device, pv.pageviews AS pageviews, coalesce(aff.clicks, 0) AS clicks, round(100.0 * coalesce(aff.clicks, 0) / pv.pageviews, 2) AS cr_pct FROM (SELECT properties.\$pathname AS path, properties.\$device_type AS device, count() AS pageviews FROM events WHERE event = '\$pageview' AND timestamp > now() - INTERVAL 30 DAY GROUP BY path, device) pv LEFT JOIN (SELECT properties.\$pathname AS path, properties.\$device_type AS device, count() AS clicks FROM events WHERE event = 'affiliate_link_click' AND timestamp > now() - INTERVAL 30 DAY GROUP BY path, device) aff ON aff.path = pv.path AND aff.device = pv.device WHERE pv.pageviews >= 50 ORDER BY pv.pageviews DESC LIMIT 20" "path,device,pageviews,clicks,cr_pct"
    ;;

  *)
    echo "PostHog Query Helper"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  events            - Show event counts by type"
    echo "  scroll            - Show scroll depth events"
    echo "  affiliate         - Show affiliate link clicks"
    echo "  pageviews         - Show pageviews by path"
    echo "  funnel            - Show conversion funnel (TBD)"
    echo "  dead-clicks-raw   - Total \$dead_click count (unfiltered, includes affiliate false-positives)"
    echo "  dead-clicks-real  - \$dead_click count filtered to exclude Amazon/Fuller affiliate false-positives"
    echo "  lcp-real          - Desktop LCP split between real users and the SERP-preview bot (filters Chrome/145 + 800x600 screen)"
    echo ""
    echo "Traffic-growth dashboard tiles (issue #308):"
    echo "  channel-mix          - Channel mix % over last 30d (google/bing/AI/social/direct)"
    echo "  daily-pv             - Daily pageview trend, last 90d"
    echo "  affiliate-by-channel - Affiliate clicks grouped by channel, last 30d"
    echo "  ai-search            - AI-search referrer pageviews by engine, last 30d"
    echo "  top-pv               - Top 20 pages by pageviews, last 30d"
    echo "  top-ctr              - Top 20 pages by affiliate CTR (min 50 PV), last 30d"
    echo "  engagement-watchdog  - time_on_page_milestone daily volume, last 30d"
    echo "  exception-watchdog   - \$exception daily count, last 30d"
    echo "  newsletter-signups   - Newsletter signup count, last 30d"
    echo "  device-cr            - Mobile vs desktop CR per page, last 30d"
    ;;
esac
