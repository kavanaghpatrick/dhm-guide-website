#!/usr/bin/env bash
# refresh-amazon-prices.sh
#
# Orchestrator for the Amazon price refresh pipeline.
# Autonomous by default — no stdin prompts, skip-and-continue on CAPTCHA.
#
# Pipeline stages:
#   1. Resolve amzn.to shortlinks -> ASIN map  (skipped with --skip-resolve)
#   2. Scrape Amazon prices via stealth Playwright
#   3. Apply scraped prices to src/data/topProducts.json (unless --no-apply)
#   4. Show diff
#
# Flags:
#   --skip-resolve   Skip step 1 (reuse existing data/amazon-asin-map.json)
#   --no-apply       Scrape only; don't write to topProducts.json
#   --headless       Run Chromium headless (default: headed)
#   --limit=N        Only scrape first N ASINs (testing)
#
# Usage:
#   ./scripts/refresh-amazon-prices.sh
#   ./scripts/refresh-amazon-prices.sh --skip-resolve --headless

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

SKIP_RESOLVE=0
APPLY=1
SCRAPE_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --skip-resolve) SKIP_RESOLVE=1 ;;
    --no-apply)     APPLY=0 ;;
    --headless)     SCRAPE_ARGS+=(--headless) ;;
    --limit=*)      SCRAPE_ARGS+=("$arg") ;;
    -h|--help)
      sed -n '2,24p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "See: $0 --help" >&2
      exit 2
      ;;
  esac
done

# ---- Step 1 ------------------------------------------------------------------
if [[ "$SKIP_RESOLVE" -eq 1 ]]; then
  echo "=== Step 1: Resolve amzn.to shortlinks (SKIPPED) ==="
  if [[ ! -f data/amazon-asin-map.json ]]; then
    echo "ERROR: data/amazon-asin-map.json missing — run without --skip-resolve once." >&2
    exit 1
  fi
else
  echo "=== Step 1: Resolve amzn.to shortlinks -> ASIN map ==="
  node scripts/resolve-amzn-shortlinks.mjs
fi

# ---- Step 2 ------------------------------------------------------------------
echo ""
echo "=== Step 2: Scrape Amazon (autonomous; stealth Playwright) ==="
echo "Will skip-and-continue on CAPTCHA, never block on stdin."
node scripts/scrape-amazon-prices.mjs "${SCRAPE_ARGS[@]}"

# ---- Step 3 ------------------------------------------------------------------
echo ""
if [[ "$APPLY" -eq 0 ]]; then
  echo "=== Step 3: Apply (SKIPPED via --no-apply) ==="
  echo "Scrape output is at data/amazon-prices.json. Review then run:"
  echo "  node scripts/apply-amazon-prices.mjs"
  exit 0
fi

echo "=== Step 3: Apply prices to topProducts.json ==="
node scripts/apply-amazon-prices.mjs

# ---- Step 4 ------------------------------------------------------------------
echo ""
echo "=== Step 4: Diff ==="
git diff --stat src/data/topProducts.json
echo ""
git diff src/data/topProducts.json | head -80

echo ""
echo "Done. Review the diff, run \`npm run build\` to verify, then commit when satisfied."
