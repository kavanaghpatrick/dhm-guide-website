# [Phase 2] scripts/orphan-post-link-injector.mjs — inject hub→orphan inbound links

Refs #283. 122 of 189 posts (65%) are orphans with 0-2 inbound internal links — they rank purely on backlinks.

## Dependencies

- **Blocked by #295** (`scripts/related-posts-backfill.mjs` produces `scripts/cluster-config.json` consumed by this script)


## Fix (~5 hrs)
Build scripts/orphan-post-link-injector.mjs:
- Read cluster-config.json + injection-plan.json (30-row hub→orphan mappings provided in synthesis-S3 doc)
- Sentinel-based safe surgical insertion of contextual markdown links
- Dry-run by default

Expected uplift: +5-8% blog traffic.

Source: synthesis-S3 Intervention 2.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
