# [Phase 2] PubMed citation backfill — top 30 posts (hand-curated phrase mapping)

Refs #283. Only 14/189 posts cite PMC links. Princeton GEO study found inline PubMed citations lift AI citation rate by 30-40%.

## Approach (~3.5 hrs)
1. Build phrase→PMC URL map (~50 entries from existing post bibliographies)
2. Script scripts/pubmed-citation-backfill.mjs — scan top-30 posts, replace 5-8 generic study mentions per post with inline markdown links to PubMed
3. Dry-run with diff output for review; --apply flag to commit

Expected uplift: +150-250 PV/mo. Source: 06-ai-search.md, synthesis-S2 (item 4 hybrid scriptable).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
