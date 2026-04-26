# [Phase 1] Investigate desktop LCP regression — 22.4s avg

Refs #283. Desktop LCP averages 22.4s for ~70% of measured sessions; mobile is fine (1.2s).

## Investigate first (~2 hrs)
T8 hints 70% may be bot traffic. Run HogQL on `$web_vitals` segmented by user-agent + per-page. Determine real-user vs bot share before bundle work.

## Fix only if real users (~2-4 hrs)
Hero image weight, render-blocking JS, font-loading. Note: Phase 1 cloaking fix likely halves LCP on its own — re-measure after that lands.

## Source
`docs/traffic-growth-2026-04-26/synthesis-S1-critical-fires.md` Fire #4.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
