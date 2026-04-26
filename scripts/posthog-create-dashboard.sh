#!/usr/bin/env bash
# Creates the "Traffic Growth — 10 Tile Master" dashboard in PostHog from
# scripts/posthog-dashboard-config.json. Idempotent in the sense that re-running
# it will create a NEW dashboard each time — there's no "find or create" because
# PostHog allows duplicate names; check the URL it prints.
#
# Usage:
#   ./scripts/posthog-create-dashboard.sh                   # uses default config
#   ./scripts/posthog-create-dashboard.sh path/to/cfg.json  # custom config
#
# Refs issue #308.

set -euo pipefail

API_KEY="${POSTHOG_PERSONAL_API_KEY:?Set POSTHOG_PERSONAL_API_KEY in your environment (~/.zshrc)}"
PROJECT_ID="${POSTHOG_PROJECT_ID:-275753}"
BASE="https://us.posthog.com/api/projects/${PROJECT_ID}"
CONFIG="${1:-$(dirname "$0")/posthog-dashboard-config.json}"

if [[ ! -f "$CONFIG" ]]; then
  echo "Config file not found: $CONFIG" >&2
  exit 1
fi

# Hand off to python — much cleaner than bash + jq for this nested API dance.
API_KEY="$API_KEY" BASE="$BASE" CONFIG="$CONFIG" PROJECT_ID="$PROJECT_ID" python3 - <<'PYEOF'
import json, os, sys, urllib.request, urllib.error

api_key = os.environ["API_KEY"]
base = os.environ["BASE"]
project_id = os.environ["PROJECT_ID"]
cfg_path = os.environ["CONFIG"]

with open(cfg_path) as f:
    cfg = json.load(f)

def post(url, body):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"HTTP {e.code} on POST {url}\n{body}", file=sys.stderr)
        raise

# 1. Create dashboard
dash = post(f"{base}/dashboards/", {
    "name": cfg["name"],
    "description": cfg.get("description", ""),
})
dash_id = dash["id"]
print(f"Created dashboard id={dash_id}")

# 2. Create insights, attaching each to the dashboard
for i, tile in enumerate(cfg["tiles"], 1):
    insight = post(f"{base}/insights/", {
        "name": tile["name"],
        "query": tile["query"],
        "dashboards": [dash_id],
        "saved": True,
    })
    print(f"  [{i:>2}/{len(cfg['tiles'])}] insight id={insight['id']} — {tile['name']}")

print()
print(f"Dashboard URL: https://us.posthog.com/project/{project_id}/dashboard/{dash_id}")
PYEOF
