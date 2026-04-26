# [Phase 2] scripts/cluster-formalize.mjs — formalize 6 topic clusters (51 posts)

Refs #283. **Largest single internal-linking win.** Site has 6 implicit clusters; only 2 have healthy pillar/spoke architecture.

## Dependencies

- **Blocked by #295** (consumes `scripts/cluster-config.json` produced by related-posts-backfill)


## Fix (~4 hrs)
Build scripts/cluster-formalize.mjs:
- Read cluster-config.json (6 clusters: DHM Master, Liver Health, Health Impact, Alcohol Science, Hangover Prevention, Product Reviews — full config in synthesis-S3 doc)
- Spokes link UP to pillar with descriptive anchor
- Pillar links DOWN to all spokes
- Sibling cross-links within cluster

Net: +35 spoke→pillar links + 144 sibling relatedPosts entries.

Audit correction: dhm-dosage-guide-2025 has 34 inbound links — THE master DHM pillar.

Expected uplift: +8-12% blog traffic.

Source: synthesis-S3 Intervention 3.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
