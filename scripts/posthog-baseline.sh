#!/usr/bin/env bash
# Captures pre-merge baseline metrics for issue #268 verification gates.
# Output: specs/issue-268-implementation/baseline-pre-merge.csv

set -euo pipefail

API_KEY="${POSTHOG_PERSONAL_API_KEY:?Set POSTHOG_PERSONAL_API_KEY in your environment (~/.zshrc) — see docs/posthog-analysis-2026-04-25/r10-hygiene.md}"
BASE="https://us.posthog.com/api/projects/275753/query"
OUT="specs/issue-268-implementation/baseline-pre-merge.csv"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

hog() {
  curl -s -X POST "$BASE" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$1" | python3 -c 'import json,sys
try:
  d=json.load(sys.stdin)
  r=d.get("results")
  print(r[0][0] if r and r[0] else 0)
except Exception:
  print(0)'
}

mkdir -p "$(dirname "$OUT")"
echo "metric,value,window,captured_at" > "$OUT"

PV24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event = '"'"'$pageview'"'"' AND timestamp > now() - INTERVAL 24 HOUR"}}')
AFF24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event = '"'"'affiliate_link_click'"'"' AND timestamp > now() - INTERVAL 24 HOUR"}}')
TOP24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event = '"'"'time_on_page_milestone'"'"' AND timestamp > now() - INTERVAL 24 HOUR"}}')
EXC24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event = '"'"'$exception'"'"' AND timestamp > now() - INTERVAL 24 HOUR"}}')

echo "pageview_24h,$PV24,24h,$TS" >> "$OUT"
echo "affiliate_link_click_24h,$AFF24,24h,$TS" >> "$OUT"
echo "time_on_page_milestone_24h,$TOP24,24h,$TS" >> "$OUT"
echo "exception_24h,$EXC24,24h,$TS" >> "$OUT"

# Per-post scroll-50 baselines for the 5 fixed comparison posts (last 7 days)
for slug in flyby-vs-cheers-complete-comparison-2025 flyby-vs-good-morning-pills-complete-comparison-2025 double-wood-vs-toniiq-ease-dhm-comparison-2025 flyby-vs-dhm1000-complete-comparison-2025 flyby-vs-fuller-health-complete-comparison; do
  Q="{\"query\":{\"kind\":\"HogQLQuery\",\"query\":\"SELECT count() FROM events WHERE event = 'scroll_depth_milestone' AND properties.\$pathname = '/never-hungover/${slug}' AND (toFloat(properties.depth_percentage) >= 50 OR toFloat(properties.depth) >= 50) AND timestamp > now() - INTERVAL 7 DAY\"}}"
  V=$(hog "$Q")
  echo "scroll50_${slug},$V,7d,$TS" >> "$OUT"
done

echo "Baseline captured to $OUT:"
cat "$OUT"
