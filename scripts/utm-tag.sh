#!/bin/bash
# UTM Tagging Helper for DHM Guide
# Usage: ./scripts/utm-tag.sh <url> <channel> [campaign]
#
# See docs/posthog-analysis-2026-04-25/r10-utm-standard.md for full convention.

set -euo pipefail

URL="${1:-}"
CHANNEL="${2:-}"
CAMPAIGN="${3:-$(date +%Y-%m)}"

if [ -z "$URL" ] || [ -z "$CHANNEL" ]; then
  echo "Usage: $0 <url> <channel> [campaign]"
  echo ""
  echo "Channels: newsletter, x, linkedin, reddit, facebook, youtube, podcast"
  echo "Campaign defaults to YYYY-MM ($(date +%Y-%m))"
  echo ""
  echo "Example:"
  echo "  $0 https://www.dhmguide.com/reviews newsletter"
  echo "  -> https://www.dhmguide.com/reviews?utm_source=newsletter&utm_medium=email&utm_campaign=$(date +%Y-%m)"
  exit 1
fi

case "$CHANNEL" in
  newsletter) SOURCE=newsletter; MEDIUM=email ;;
  x|twitter)  SOURCE=x;          MEDIUM=social ;;
  linkedin)   SOURCE=linkedin;   MEDIUM=social ;;
  reddit)     SOURCE=reddit;     MEDIUM=social ;;
  facebook)   SOURCE=facebook;   MEDIUM=social ;;
  youtube)    SOURCE=youtube;    MEDIUM=video ;;
  podcast)    SOURCE=podcast;    MEDIUM=audio ;;
  *)
    echo "Error: unknown channel '$CHANNEL'." >&2
    echo "Supported: newsletter, x, linkedin, reddit, facebook, youtube, podcast" >&2
    exit 2
    ;;
esac

if [[ "$URL" == *\?* ]]; then
  SEP="&"
else
  SEP="?"
fi

echo "${URL}${SEP}utm_source=${SOURCE}&utm_medium=${MEDIUM}&utm_campaign=${CAMPAIGN}"
