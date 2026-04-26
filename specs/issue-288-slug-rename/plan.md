# [Phase 2] Slug rename: dhm-randomized-controlled-trials-2024 → year-agnostic + 301

Refs #283. **494 PV/90d page** with year-mismatched URL (slug says 2024, body says 2026). Top SEO bleeder.

## Fix (~2 hrs)
1. Rename JSON file (drop -2024 suffix)
2. Update internal references
3. Add 301 redirect in vercel.json
4. Verify with curl

Expected uplift: +99-198 PV/mo. Source: synthesis-S2 §1, 09-content-freshness.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
