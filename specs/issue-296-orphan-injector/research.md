# Issue #296 — Orphan Post Link Injector — Research

## Goal
Build `scripts/orphan-post-link-injector.mjs`: read `scripts/orphan-injection-plan.json`,
inject sentinel-anchored markdown links from 7 hub posts into 28 high-PV orphan posts.

## Baseline (BEFORE)

Re-running an inline-link inbound counter (markdown `[]( /never-hungover/<slug> )` matches in `content`,
excluding the `relatedPosts` widget) on the 30 candidate orphans from synthesis-S3:

- **23 of 29** orphans (one slug renamed) have ZERO inline contextual inbound links
- Total inline inbound across the 29 = **15** (avg 0.52 per orphan)
- The 7 hub posts (per #295 cluster-config + S3 hub leaderboard) are well-linked at the sidebar level
  via `relatedPosts` but rarely link out contextually inside their own prose

## Plan structure

`scripts/orphan-injection-plan.json` — 30 rows, each row has either:
- **Active row**: `{source_hub, target_orphan, anchor_text, sentinel_phrase, rewrite}`
  - `sentinel_phrase` MUST appear exactly once in `<source_hub>.json` `.content`
  - `rewrite` = `sentinel_phrase` + injected markdown link (sentence-level surgical edit)
- **Skip row**: `{skip: true, source_hub, target_orphan, skip_reason}` for pairs where
  the hub has no natural insertion point (avoid forced/awkward links)

### Skipped pairs (2)
1. `alcohol-pharmacokinetics-advanced-absorption-science-2025` -> `altitude-alcohol-...`: hub has zero altitude/elevation/cabin content. Defer to cluster-formalize (#297) spoke->pillar reciprocity.
2. `dhm-science-explained` -> `dhm-availability-worldwide-guide-2025`: hub has zero buy/availability/global content. Defer to cluster-formalize (#297).

### Active pairs (28)
All 28 active sentinels verified unique (occurrence count = 1) in their respective hub posts.
See `scripts/orphan-injection-plan.json` for the full mapping.

## Hub posts used (10)
- `alcohol-aging-longevity-2025` — 4 outbound rows
- `alcohol-pharmacokinetics-advanced-absorption-science-2025` — 2 active (1 skipped)
- `advanced-liver-detox-science-vs-marketing-myths-2025` — 3 outbound rows
- `dhm-dosage-guide-2025` — 4 outbound rows
- `functional-medicine-hangover-prevention-2025` — 3 outbound rows
- `activated-charcoal-hangover` — 2 outbound rows
- `double-wood-vs-no-days-wasted-dhm-comparison-2025` — 2 outbound rows
- `is-dhm-safe-science-behind-side-effects-2025` — 2 outbound rows
- `dhm-science-explained` — 2 active (1 skipped)
- `at-home-alcohol-testing-monitoring-safety-guide-2025` — 2 outbound rows
- `alcohol-and-inflammation-complete-health-impact-guide-2025` — 2 outbound rows

## Script semantics

### CLI
- `--dry-run` (default true): preview each insertion, no writes
- `--apply`: actually mutate hub JSON files
- `--plan=<path>`: defaults to `scripts/orphan-injection-plan.json`

### Per-row flow
1. Skip if `row.skip === true` → log `SKIPPED_BY_PLAN`
2. Read hub JSON. If missing → `HUB_NOT_FOUND`
3. Verify orphan post file exists → `TARGET_NOT_FOUND` if missing
4. Idempotency: if hub.content already contains `/never-hungover/<orphan_slug>` → `ALREADY_LINKED`
5. Sentinel uniqueness: count occurrences in hub.content
   - 0 → `SENTINEL_NOT_FOUND`
   - >1 → `AMBIGUOUS_SENTINEL`
   - 1 → proceed
6. Apply: replace sentinel with rewrite (single string replace, first occurrence — guaranteed unique)
7. If `--apply`: write JSON. If dry-run: log preview

### Safety guarantees
- No regex on user-provided sentinel — plain `string.replace(sentinel, rewrite)` (no special chars expansion)
- Idempotent via slug-presence check
- Atomic per-file: read JSON, mutate `.content`, write back (preserves all other fields)
- Audit log printed to stdout in dry-run; concise summary table at end
- Optional: write audit JSON to `docs/traffic-growth-2026-04-26/orphan-injection-audit.json`

## Expected impact
- **+28 inline contextual inbound links** across 28 orphans (one each)
- **+0 broken sentences** (sentinel-based + uniqueness verified ahead of time)
- **+1.0 avg inbound** per targeted orphan (going from 0.52 → ~1.5)
- Hub posts gain 2-4 new outbound topical links each — strengthens topical authority signals
- Synthesis-S3 estimate: **+5-8% blog PVs** in 60-90 days

## Files
- `/Users/patrickkavanagh/dhm-guide-website/scripts/orphan-injection-plan.json` — the 30-row mapping (NEW)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/orphan-post-link-injector.mjs` — the executor (NEW)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/<hub>.json` — modified content fields
- `/Users/patrickkavanagh/dhm-guide-website/scripts/cluster-config.json` — read for context (no mutation)
