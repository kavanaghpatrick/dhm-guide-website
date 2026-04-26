# Issue #295 — Research

## Existing Script
`scripts/generate-related-posts.mjs` — 65 lines. Uses tag overlap, top-3, skips posts with no tag intersection.

## Audit Result
- Total posts: **189**
- Missing `relatedPosts` field entirely: **38**
- Empty array: 0

## Cluster Config (6 clusters, 51 posts)
Per `synthesis-S3-internal-linking.md` Intervention 3, validated against actual files:

| Cluster | Pillar | Spoke count |
|---|---|---|
| dhm-master | dhm-dosage-guide-2025 | 7 |
| liver-health | advanced-liver-detox-science-vs-marketing-myths-2025 | 7 |
| health-impact | alcohol-aging-longevity-2025 | 10 |
| alcohol-science | alcohol-pharmacokinetics-advanced-absorption-science-2025 | 7 |
| hangover-prevention | functional-medicine-hangover-prevention-2025 | 8 (corrected) |
| product-reviews | double-wood-vs-no-days-wasted-dhm-comparison-2025 | 8 (corrected) |

### Slug corrections from spec
1. `best-hangover-pills-2024-2025-complete-reviews-comparison` does not exist → replaced with `good-morning-hangover-pills-review-2025`
2. `never-hungover-viral-hangover-cures-tested-science-2025` does not exist → corrected to `viral-hangover-cures-tested-science-2025`
3. `double-wood-dhm-review-2025` does not exist → dropped (we already have `double-wood-dhm-review-analysis`)

## Algorithm (3-tier fallback)
- Tier 1 (cluster, score 80-100): pillar + sibling spokes
- Tier 2 (tag overlap, 30-50+): existing logic
- Tier 3 (title Jaccard, sim*50): when overlap < threshold
- Reciprocity: bidirectional pass at end (cap 5, drop weakest)

## Backward compatibility
- Skip posts that already have `relatedPosts.length >= 3` (existing well-curated entries are preserved)
- Idempotent: rerunning produces same output

## Files
- `scripts/generate-related-posts.mjs` (extend)
- `scripts/cluster-config.json` (NEW — consumed by #296, #297, #298)
- 38 post JSONs to update
