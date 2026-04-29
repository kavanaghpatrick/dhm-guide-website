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

FAILED=0
for pmid in $PMIDS; do
  TMP="/tmp/pubmed-$pmid.html"
  STATUS="$(curl -s -A 'Mozilla/5.0' -o "$TMP" -w "%{http_code}" "https://pubmed.ncbi.nlm.nih.gov/$pmid/" || echo 000)"
  if [ "$STATUS" != "200" ]; then
    echo "FAIL pmid=$pmid status=$STATUS"
    FAILED=1
    continue
  fi
  TITLE="$(grep -oE '<title>[^<]+</title>' "$TMP" | head -1)"
  if echo "$TITLE" | grep -qiE "dihydromyricetin|DHM|ampelopsin|hovenia|myricetin|flavonoid|alcohol|liver|hepat|ethanol|GABA|fatty"; then
    echo "OK   pmid=$pmid"
  else
    echo "WARN pmid=$pmid title doesn't match DHM keywords: $TITLE"
    FAILED=1
  fi
done

exit $FAILED
