# Research — issue-297 cluster-formalize

## Inputs verified
- `scripts/cluster-config.json` exists (from #295), 6 clusters defined
- All 6 pillars + 47 spokes (51 posts total) JSON files exist on disk
- `scripts/orphan-post-link-injector.mjs` (from #296) provides reusable patterns: sentinel-based replace, idempotency by `/never-hungover/<slug>` substring, dry-run/--apply pattern, JSON with 2-space + trailing newline write convention.

## Current cluster link state (per cluster)

| Cluster | Pillar | Spokes | Spoke→Pillar inline (have / missing) | Pillar→Spoke inline (have / missing) | Pillar in spoke `relatedPosts` (have / missing) | Sibling entries in spoke `relatedPosts` (have / missing) |
|---|---|---|---|---|---|---|
| dhm-master | dhm-dosage-guide-2025 | 7 | 4 / 3 | 4 / 3 | 4 / 3 | 10 / 32 |
| liver-health | advanced-liver-detox-... | 7 | 0 / 7 | 3 / 4 | 7 / 0 | 12 / 30 |
| health-impact | alcohol-aging-longevity-2025 | 10 | 0 / 10 | 3 / 7 | 6 / 4 | 13 / 77 |
| alcohol-science | alcohol-pharmacokinetics-... | 7 | 0 / 7 | 2 / 5 | 4 / 3 | 11 / 31 |
| hangover-prevention | functional-medicine-... | 8 | 0 / 8 | 3 / 5 | 3 / 5 | 9 / 47 |
| product-reviews | double-wood-vs-no-days-... | 8 | 0 / 8 | 2 / 6 | 2 / 6 | 9 / 47 |
| **Total** | — | 47 | **4 / 43 missing** | **17 / 30 missing** | **26 / 21 missing** | **64 / 264 missing** |

(Synthesis-S3 forecast was +35 spoke→pillar inline links and +144 sibling relatedPosts entries. Real numbers are higher because more were missing — script will cap reasonably.)

## Post JSON shape
- Fields used: `slug`, `title`, `content` (markdown blob), `relatedPosts` (string[] of slugs).
- Existing posts already use `[anchor](/never-hungover/<slug>)` markdown link convention.
- `relatedPosts` is sometimes 5 entries (top), sometimes 3, sometimes missing entirely.

## Idempotency strategy
- **Spoke→Pillar inline**: skip if `content.includes('/never-hungover/<pillar-slug>')`. Inject a single block-quote callout near top of content (after first H1 or first 2 paragraphs).
- **Pillar→Spoke inline**: collect all spokes lacking inbound links from pillar, append a single auto-managed "Related Topics in This Series" section guarded by `<!-- cluster-index:auto -->` sentinel. Re-running regenerates only if any spoke link still missing.
- **Sibling relatedPosts**: union of existing `relatedPosts` + cluster pillar + sibling spokes, **cap at 5** (preserves existing curated entries first). Re-running with full coverage produces no diff.

## Anchor strategy
Use cluster.anchor_phrases (rotated per spoke for diversity). Block format:
```
> **Related pillar guide:** [<anchor>](/never-hungover/<pillar>) — <pillar title>
```
Placement: insert after the first paragraph of content (idiomatic for the existing posts which open with H1 + lead paragraph).

## Script CLI
- `node scripts/cluster-formalize.mjs` (default = dry-run)
- `--apply` to write
- `--audit-out=<path>` optional JSON audit
- Idempotent — running twice yields zero changes.

## Risks / mitigations
- Don't double-link if spoke already has pillar URL anywhere → idempotency guard above covers it.
- Don't break well-curated `relatedPosts` → preserve existing order, append missing pillar/siblings up to cap=5.
- Don't pollute cluster-index section if spokes already linked → only render the section if there are spokes to add; sentinel makes the section uniquely identifiable for re-runs.
