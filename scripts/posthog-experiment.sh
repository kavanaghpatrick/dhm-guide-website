#!/bin/bash
# PostHog Experiments API - Full A/B Test Management
# Usage: ./scripts/posthog-experiment.sh [command] [args]

set -e

API_KEY="${POSTHOG_PERSONAL_API_KEY}"
BASE_URL="https://us.posthog.com"

if [ -z "$API_KEY" ]; then
  echo "Error: POSTHOG_PERSONAL_API_KEY not set"
  exit 1
fi

# Use @current for scoped API keys
PROJECT_ID="@current"

case "$1" in
  # List all experiments
  list)
    curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/$PROJECT_ID/experiments/" | \
      jq '.results[] | {id, name, feature_flag_key, start_date, end_date}'
    ;;

  # Create a new A/B test experiment
  # Usage: ./posthog-experiment.sh create "Experiment Name" "flag-key" "affiliate_link_click"
  create)
    
    NAME="${2:-CTA Experiment}"
    FLAG_KEY="${3:-cta-experiment-$(date +%s)}"
    GOAL_EVENT="${4:-affiliate_link_click}"

    echo "Creating experiment: $NAME"
    echo "Feature flag: $FLAG_KEY"
    echo "Goal metric: $GOAL_EVENT"

    RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects/$PROJECT_ID/experiments/" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$(cat <<EOF
{
  "name": "$NAME",
  "description": "Created via API",
  "feature_flag_key": "$FLAG_KEY",
  "parameters": {
    "feature_flag_variants": [
      {"key": "control", "rollout_percentage": 50},
      {"key": "test", "rollout_percentage": 50}
    ]
  },
  "metrics": [
    {
      "kind": "ExperimentTrendQuery",
      "event": "$GOAL_EVENT"
    }
  ]
}
EOF
)")

    EXPERIMENT_ID=$(echo "$RESPONSE" | jq -r '.id')
    echo ""
    echo "Created experiment ID: $EXPERIMENT_ID"
    echo "Feature flag key: $FLAG_KEY"
    echo ""
    echo "Use in React:"
    echo "  const variant = useFeatureFlag('$FLAG_KEY');"
    echo "  if (variant === 'test') return <TestVariant />;"
    ;;

  # Start an experiment (set start_date to now)
  start)
    
    EXPERIMENT_ID="$2"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh start <experiment_id>"
      exit 1
    fi

    curl -s -X PATCH "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"start_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" | jq '{id, name, start_date}'

    echo "Experiment $EXPERIMENT_ID started!"
    ;;

  # Stop an experiment (set end_date to now)
  stop)
    
    EXPERIMENT_ID="$2"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh stop <experiment_id>"
      exit 1
    fi

    curl -s -X PATCH "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"end_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" | jq '{id, name, end_date}'

    echo "Experiment $EXPERIMENT_ID stopped!"
    ;;

  # Get experiment results
  results)
    
    EXPERIMENT_ID="$2"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh results <experiment_id>"
      exit 1
    fi

    curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/results/" | jq '.'
    ;;

  # Get detailed experiment info
  get)
    
    EXPERIMENT_ID="$2"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh get <experiment_id>"
      exit 1
    fi

    curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/" | jq '.'
    ;;

  # Update traffic split
  # Usage: ./posthog-experiment.sh split <experiment_id> <control_pct> <test_pct>
  split)
    
    EXPERIMENT_ID="$2"
    CONTROL_PCT="${3:-50}"
    TEST_PCT="${4:-50}"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh split <experiment_id> <control_pct> <test_pct>"
      exit 1
    fi

    # Get the feature flag ID from the experiment
    FLAG_ID=$(curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/" | jq -r '.feature_flag.id')

    echo "Updating flag $FLAG_ID: control=$CONTROL_PCT%, test=$TEST_PCT%"

    curl -s -X PATCH "$BASE_URL/api/projects/$PROJECT_ID/feature_flags/$FLAG_ID/" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$(cat <<EOF
{
  "filters": {
    "groups": [{"properties": [], "rollout_percentage": 100}],
    "multivariate": {
      "variants": [
        {"key": "control", "rollout_percentage": $CONTROL_PCT},
        {"key": "test", "rollout_percentage": $TEST_PCT}
      ]
    }
  }
}
EOF
)" | jq '{id, key, filters}'
    ;;

  # List feature flags
  flags)
    
    curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/$PROJECT_ID/feature_flags/" | \
      jq '.results[] | {id, key, active, rollout_percentage: .filters.groups[0].rollout_percentage}'
    ;;

  # Delete an experiment
  delete)
    
    EXPERIMENT_ID="$2"

    if [ -z "$EXPERIMENT_ID" ]; then
      echo "Usage: ./posthog-experiment.sh delete <experiment_id>"
      exit 1
    fi

    curl -s -X DELETE "$BASE_URL/api/projects/$PROJECT_ID/experiments/$EXPERIMENT_ID/" \
      -H "Authorization: Bearer $API_KEY"

    echo "Experiment $EXPERIMENT_ID deleted"
    ;;

  # Show project info
  project)
    curl -s -H "Authorization: Bearer $API_KEY" \
      "$BASE_URL/api/projects/@current/" | jq '{id, name, timezone}'
    ;;

  # Query events (before/after analysis)
  # Usage: ./posthog-experiment.sh events <event_name> [days]
  events)
    EVENT_NAME="${2:-affiliate_link_click}"
    DAYS="${3:-7}"

    echo "Querying $EVENT_NAME events (last $DAYS days)..."

    python3 - "$EVENT_NAME" "$DAYS" << 'PYEOF'
import json
import subprocess
import os
import sys
from datetime import datetime, timedelta

event_name = sys.argv[1]
days = int(sys.argv[2])

end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

query = {
    "query": {
        "kind": "HogQLQuery",
        "query": f"""
            SELECT
                toDate(timestamp) as date,
                count() as events
            FROM events
            WHERE event = '{event_name}'
            AND toDate(timestamp) >= toDate('{start_date}')
            AND toDate(timestamp) <= toDate('{end_date}')
            GROUP BY date
            ORDER BY date DESC
        """
    }
}

result = subprocess.run([
    "curl", "-s", "-X", "POST",
    "https://us.posthog.com/api/projects/@current/query/",
    "-H", f"Authorization: Bearer {os.environ.get('POSTHOG_PERSONAL_API_KEY')}",
    "-H", "Content-Type: application/json",
    "-d", json.dumps(query)
], capture_output=True, text=True)

data = json.loads(result.stdout)
if 'results' in data:
    print("Date         | Events")
    print("-------------|-------")
    total = 0
    for row in data['results']:
        print(f"{row[0]}  | {row[1]}")
        total += row[1]
    print("-------------|-------")
    print(f"Total        | {total}")
else:
    print(json.dumps(data, indent=2))
PYEOF
    ;;

  # Query pageviews by path
  pageviews)
    PATH_FILTER="${2:-/reviews}"
    DAYS="${3:-7}"

    echo "Querying pageviews for $PATH_FILTER (last $DAYS days)..."

    python3 - "$PATH_FILTER" "$DAYS" << 'PYEOF'
import json
import subprocess
import os
import sys
from datetime import datetime, timedelta

path_filter = sys.argv[1]
days = int(sys.argv[2])

end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

query = {
    "query": {
        "kind": "HogQLQuery",
        "query": f"""
            SELECT
                toDate(timestamp) as date,
                count() as pageviews
            FROM events
            WHERE event = '$pageview'
            AND properties.$pathname LIKE '%{path_filter}%'
            AND toDate(timestamp) >= toDate('{start_date}')
            AND toDate(timestamp) <= toDate('{end_date}')
            GROUP BY date
            ORDER BY date DESC
        """
    }
}

result = subprocess.run([
    "curl", "-s", "-X", "POST",
    "https://us.posthog.com/api/projects/@current/query/",
    "-H", f"Authorization: Bearer {os.environ.get('POSTHOG_PERSONAL_API_KEY')}",
    "-H", "Content-Type: application/json",
    "-d", json.dumps(query)
], capture_output=True, text=True)

data = json.loads(result.stdout)
if 'results' in data:
    print("Date         | Pageviews")
    print("-------------|----------")
    for row in data['results']:
        print(f"{row[0]}  | {row[1]}")
else:
    print(json.dumps(data, indent=2))
PYEOF
    ;;

  *)
    echo "PostHog Experiments API"
    echo ""
    echo "READ Commands (work now):"
    echo "  list                              List all experiments"
    echo "  results <id>                      Get experiment results"
    echo "  get <id>                          Get experiment details"
    echo "  flags                             List all feature flags"
    echo "  project                           Show project info"
    echo "  events <event> [days]             Query events by name"
    echo "  pageviews <path> [days]           Query pageviews by path"
    echo ""
    echo "WRITE Commands (need API key with write scopes):"
    echo "  create <name> <flag> <goal>       Create new A/B test"
    echo "  start <id>                        Start experiment"
    echo "  stop <id>                         Stop experiment"
    echo "  split <id> <ctrl%> <test%>        Update traffic split"
    echo "  delete <id>                       Delete experiment"
    echo ""
    echo "Examples:"
    echo "  ./posthog-experiment.sh pageviews /reviews 7"
    echo "  ./posthog-experiment.sh events affiliate_link_click 7"
    echo "  ./posthog-experiment.sh create 'CTA Test' 'cta-v2' 'affiliate_link_click'"
    echo ""
    echo "To enable write commands, create new API key at:"
    echo "  PostHog → Avatar → Account Settings → Personal API Keys"
    echo "  Add scopes: experiment:write, feature_flag:write"
    ;;
esac
