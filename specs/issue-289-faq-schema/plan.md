# [Phase 2] FAQ schema backfill — 64 commercial posts (5.3% to 39%)

Refs #283. Only 10/189 posts emit FAQPage schema. 74 posts already have parseable Q&A markdown structure but no schema field.

## Fix (~2-3 hrs)
Build scripts/posts-batch-update.mjs to:
- Iterate post JSON files
- Auto-extract Q+A pairs from markdown
- Populate post.faq array
- Verify prerender script emits FAQPage JSON-LD

Expected uplift: +200-400 PV/mo from rich-result CTR. Also feeds AI-search citations. Source: synthesis-S2, 06-ai-search.md, 08-technical-seo.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
