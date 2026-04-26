#!/bin/bash
# PostHog Query Helper for DHM Guide
# Usage: ./scripts/posthog-query.sh [command]

API_KEY="${POSTHOG_PERSONAL_API_KEY:?Set POSTHOG_PERSONAL_API_KEY in your environment (~/.zshrc) — see docs/posthog-analysis-2026-04-25/r10-hygiene.md}"
BASE_URL="https://us.posthog.com/api/projects/@current"

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
    ;;
esac
