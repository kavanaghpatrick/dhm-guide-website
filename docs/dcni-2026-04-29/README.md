# DCNI Bucketing Output — scripts

**DECISIONS ONLY — DO NOT DEPLOY** until the Action 4 moratorium expires (mid-July 2026 per #366) AND a manual review of the REVIEW bucket completes.

This directory contains the decision table emitted by `scripts/dcni-bucket.mjs` for the GSC CSV input listed in `buckets.json#gscCsvPath`. Re-running the script with a fresh GSC export overwrites these files.

## Files

- `buckets.json` — machine-readable decision table (consumed by future deletion PR tooling)
- `buckets.md` — human-readable preview; review this BEFORE any deletion ships
- `README.md` — this file

## Deployment gate

The actual 410s / 301 redirects are gated on three conditions, none of which this script enforces:

1. **Moratorium expiry**: mid-July 2026 (per #366). Shipping deletions earlier risks another DCNI wave.
2. **Manual REVIEW bucket sign-off**: every entry in the `review` bucket needs human eyes.
3. **Pilot before scale**: ship 410s for the 10 lowest-impression DELETE candidates first; measure 4-6 weeks; only then scale.

## Decision tree (summary)

The script applies the following predicates per slug, in strict order. The FIRST match wins.

1. Cluster member (pillar or spoke) → **SAVE**
2. `italian-drinking-culture-guide` allowlist → **SAVE**
3. Known MERGE group sibling (cultural-drinking template) → **MERGE** into `italian-drinking-culture-guide`
4. ≥160 16-month impressions → **SAVE** (high traffic)
5. ≥3 inbound markdown body links → **SAVE** (well-linked)
6. Position ≤50 (any query) AND impressions > 0 → **SAVE** (currently ranking)
7. Off-strategy pattern + ≤30 impressions + 0 inbound + age >90d → **DELETE**
8. Off-strategy but ambiguous → **REVIEW**
9. Otherwise → **REVIEW** (catch-all; CNI URLs without a cluster default here)

## Re-running with real GSC data

```bash
# Export from Google Search Console: Performance → Pages tab → 16-month range → Export → CSV
# Save to data/gsc-pages-<YYYY-MM-DD>.csv (gitignored or staged manually)
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-2026-07-15.csv --output-dir docs/dcni-2026-07-15
```

## Hard constraints (verified in CI)

This script does NOT modify:

- `src/newblog/data/posts/*.json` (post content, dateModified, tags)
- `public/sitemap.xml`
- `vercel.json`
- `scripts/cluster-config.json`
- `scripts/orphan-injection-plan.json`

Any future PR that consumes this `buckets.json` and ships actual deletions is a SEPARATE, manually-reviewed change.
