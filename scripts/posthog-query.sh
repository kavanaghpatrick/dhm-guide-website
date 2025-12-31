#!/bin/bash
# PostHog Query Helper for DHM Guide
# Usage: ./scripts/posthog-query.sh [command]

API_KEY="${POSTHOG_PERSONAL_API_KEY:-phx_V9NkxY2istxJLQ0HZEin1qB57DwULWhUShGSHGMz8oFM92c}"
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
    echo "=== Conversion Funnel (Pageview → Scroll 50% → Affiliate Click) ==="
    echo "Coming soon - requires funnel query setup in PostHog dashboard"
    ;;

  *)
    echo "PostHog Query Helper"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  events     - Show event counts by type"
    echo "  scroll     - Show scroll depth events"
    echo "  affiliate  - Show affiliate link clicks"
    echo "  pageviews  - Show pageviews by path"
    echo "  funnel     - Show conversion funnel (TBD)"
    ;;
esac
