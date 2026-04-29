#!/bin/bash
# Verify each PMID against PubMed: HTTP 200 status + DHM-related title keyword match.
# Hard gate before commits to src/data/research-studies.js — prevents fabricated citations.
#
# Source-of-truth precedence:
#   1. Optional first arg = path to a newline-separated PMID file
#   2. Else if src/data/research-studies.js exists → extract numeric PMIDs from it
#   3. Else error out (no input)
#
# Exit 0  = all PMIDs returned HTTP 200 with title matching DHM/ampelopsin/hovenia/flavonoid/etc.
# Exit 1  = at least one PMID failed (404 / wrong topic). Caller must replace and rerun.

set -u

INPUT_FILE="${1:-}"
STUDIES_FILE="src/data/research-studies.js"

PMIDS=""
if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
  PMIDS="$(grep -E '^[0-9]+$' "$INPUT_FILE" || true)"
elif [ -f "$STUDIES_FILE" ]; then
  PMIDS="$(node --input-type=module -e "
    import('./${STUDIES_FILE}').then(m => {
      m.researchStudies.forEach(s => {
        if (typeof s.pmid === 'string' && /^[0-9]+\$/.test(s.pmid)) console.log(s.pmid);
      });
    });
  " 2>/dev/null || true)"
else
  echo "ERROR: no input. Pass a PMID file or create $STUDIES_FILE first." >&2
  exit 1
fi

if [ -z "$PMIDS" ]; then
  echo "WARN no numeric PMIDs found — nothing to verify."
  exit 0
fi

verify_one() {
  local pmid="$1"
  local tmp="/tmp/pubmed-$pmid.html"
  local status
  local title
  status="$(curl -s -A 'Mozilla/5.0' -o "$tmp" -w "%{http_code}" "https://pubmed.ncbi.nlm.nih.gov/$pmid/" || echo 000)"
  if [ "$status" != "200" ]; then
    echo "FAIL pmid=$pmid status=$status"
    return 1
  fi
  title="$(grep -oE '<title>[^<]+</title>' "$tmp" | head -1)"
  if echo "$title" | grep -qiE "reCAPTCHA"; then
    echo "RETRY pmid=$pmid (reCAPTCHA)"
    return 2
  fi
  if echo "$title" | grep -qiE "dihydromyricetin|DHM|ampelopsin|hovenia|myricetin|flavonoid|alcohol|liver|hepat|ethanol|GABA|fatty"; then
    echo "OK   pmid=$pmid"
    return 0
  else
    echo "WARN pmid=$pmid title doesn't match DHM keywords: $title"
    return 1
  fi
}

FAILED=0
for pmid in $PMIDS; do
  verify_one "$pmid"
  rc=$?
  if [ "$rc" -eq 2 ]; then
    # reCAPTCHA backoff — wait + retry once
    sleep 5
    rm -f "/tmp/pubmed-$pmid.html"
    verify_one "$pmid"
    rc=$?
    [ "$rc" -ne 0 ] && FAILED=1
  elif [ "$rc" -ne 0 ]; then
    FAILED=1
  fi
done

exit $FAILED
