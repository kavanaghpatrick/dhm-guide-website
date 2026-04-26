# [Phase 3] Refresh top-5 traffic posts — set dateModified, fix stale references

Refs #283. Quarterly refresh ROI is wildly concentrated: top 5 posts = 47.7% of traffic.

## Dependencies

- **Blocked by #286** (`dateModified` mechanism: this refresh task sets dateModified on top-5 posts, which requires the schema-emission fix to actually surface to crawlers)


## Targets (~3.5 hrs total)
1. dhm-dosage-guide-2025 (1,168 PV) — 45 min refresh, +234-467 PV/mo
2. hangover-supplements-complete-guide (577 PV) — covered by sibling striking-distance issue
3. dhm-randomized-controlled-trials-2024 (494 PV) — covered by sibling slug-rename issue
4. dhm-vs-zbiotics (236 PV) — 30 min, year-agnostic slug already
5. when-to-take-dhm-timing-guide-2025 (229 PV) — 30 min evergreen content

## Per-post tasks
- Set explicit dateModified=2026-04-26 (file-level, not just schema)
- Add 'Updated April 2026' badge in body
- Add 1-2 new study citations from 2024-2026 PubMed papers
- Update product comparison sections (prices, brand status)
- Verify Quick Answer box is set (Phase 2 batch)

Expected uplift: +540-1,080 PV/mo combined. Source: 09-content-freshness.md Top 5.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
