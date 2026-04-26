# [Phase 1] Build PostHog dashboard — 10 tiles per master plan

Refs #283. **Promoted from Phase 5 → Phase 1** per consolidation audit: measurement infrastructure must exist BEFORE Phases 1-4 ship so we can capture pre-deploy baselines and track per-PR impact.

## Why this is Phase 1

Without this dashboard built first:
- Per-PR HogQL gates (per `00-MASTER-PLAN.md` §Measurement Infrastructure) are ad-hoc
- The Phase 1 cloaking fix (#284) lift cannot be measured against a documented baseline
- AI-search referrer growth (the keystone metric for the whole 6-month plan) has no monitoring tile

## 10 tiles (~3-4 hrs)

1. Channel mix (last 30d, % per channel) — flag if Google moves >5pp WoW
2. Daily PV trend (last 90d)
3. Affiliate clicks per channel
4. AI-search referrer count (chatgpt/perplexity/claude/gemini/copilot)
5. Top 20 pages by PV
6. Top 20 pages by affiliate CTR
7. `time_on_page_milestone` daily volume (regression watchdog)
8. `$exception` count (regression watchdog)
9. Newsletter signup count (zero today; >0 after #285 ships)
10. Mobile vs desktop CR per page

Full HogQL queries provided in master plan §Measurement Infrastructure.

## Suggested ship order

Build the dashboard FIRST (before #284 cloaking fix lands) so the cloaking-fix impact can be measured cleanly. Or ship in parallel: dashboard work is independent of code changes.

## Source
`docs/traffic-growth-2026-04-26/00-MASTER-PLAN.md`, `10-diversification.md`, `issue-consolidation-audit.md` Gap #7.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
