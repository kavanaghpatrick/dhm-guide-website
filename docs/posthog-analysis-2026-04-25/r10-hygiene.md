# R10 - Hygiene + UTM Status

**Date:** 2026-04-26
**Branch:** `chore/hygiene-and-utm` (items 1-3) + amend on `fix/affiliate-button-audit` (item 4)
**Commit:** `d698343` (chore branch) / `cdb436c` (amended affiliate-button-audit)

## Summary

| # | Task | Status | Proof |
|---|------|--------|-------|
| 1 | Rotate dead PostHog API key | DONE | `./scripts/posthog-query.sh events` returns real counts (780 pageviews, 482 web_vitals, ...) |
| 2 | Dead-click filter queries | DONE | raw=46, real=35 -> filter removes 11 affiliate false-positives |
| 3 | UTM tagging recommendation | DONE | `scripts/utm-tag.sh` + `docs/posthog-analysis-2026-04-25/r10-utm-standard.md` |
| 4 | Recommit `fix/affiliate-button-audit` | DONE | tree unchanged (`d40e0b8...`), new hash `cdb436c`, correct message |

## Item 1: API key handling — env-var only

**File:** `scripts/posthog-query.sh:5`

Removed the hardcoded fallback (originally a revoked key, briefly rotated to a live key — both are inappropriate to commit). The script now requires `POSTHOG_PERSONAL_API_KEY` from the environment and fails fast with a clear error if unset:

```bash
API_KEY="${POSTHOG_PERSONAL_API_KEY:?Set POSTHOG_PERSONAL_API_KEY in your environment (~/.zshrc) — see docs/posthog-analysis-2026-04-25/r10-hygiene.md}"
```

This eliminates the secret-scanning push-blocker and matches the project's stated convention (CLAUDE.md says the key lives in `~/.zshrc`).

**Verified:** with `POSTHOG_PERSONAL_API_KEY` exported, `./scripts/posthog-query.sh events` returns:

```
$pageview: 780
$web_vitals: 482
$feature_flag_called: 393
scroll_depth_milestone: 230
$pageleave: 153
time_on_page_milestone: 82
element_clicked: 73
funnel_step: 51
$dead_click: 46
...
```

**Required ~/.zshrc addition** (user-side action, NOT applied — secret intentionally redacted from this doc):

```bash
# Add to ~/.zshrc — get the key value from PostHog dashboard:
# https://us.posthog.com/settings/user-api-keys
export POSTHOG_PERSONAL_API_KEY="phx_..."
```

After adding, `source ~/.zshrc`. The script fails fast with a helpful error if this isn't set. Per project CLAUDE.md the key is supposed to live in zshrc.

## Item 2: Dead-click filter (don't merge fix/affiliate-dead-clicks)

**Recommendation: do NOT merge `fix/affiliate-dead-clicks` (commit `bd2461f`).**

That branch globally disables `capture_dead_clicks`, killing real UX signal across the entire site (e.g. on `/nac-vs-dhm` and other content pages where dead clicks ARE actionable). The PostHog auto-heuristic only false-fires on `target="_blank"` external links because the source tab does not change.

The right fix is filter-at-query-time, baked into the helper script as two new subcommands:

```bash
./scripts/posthog-query.sh dead-clicks-raw   # 46 events (incl. affiliate noise)
./scripts/posthog-query.sh dead-clicks-real  # 35 events (actionable signal)
```

Difference: 11 dead-click events were Amazon/Fuller affiliate false-positives — confirms the X2 forensics finding.

**Canonical filter (in `scripts/posthog-query.sh:dead-clicks-real`):**

```sql
SELECT count() AS c
FROM events
WHERE event = '$dead_click'
  AND coalesce(properties.$external_click_url, '') NOT LIKE '%amzn%'
  AND coalesce(properties.$external_click_url, '') NOT LIKE '%amazon%'
  AND coalesce(properties.$external_click_url, '') NOT LIKE '%fullerhealth%'
  AND timestamp > now() - INTERVAL 7 DAY
```

Use this filter as a saved insight in PostHog and as the "real dead clicks" tile on any UX-health dashboard.

## Item 3: UTM standard

Convention + helper + HogQL queries shipped:

- `scripts/utm-tag.sh` — outputs tagged URL given URL + channel + optional campaign
- `docs/posthog-analysis-2026-04-25/r10-utm-standard.md` — full convention, examples, and HogQL queries to save in PostHog

**Verified examples (live output):**

```
$ ./scripts/utm-tag.sh https://www.dhmguide.com/reviews newsletter
https://www.dhmguide.com/reviews?utm_source=newsletter&utm_medium=email&utm_campaign=2026-04

$ ./scripts/utm-tag.sh https://www.dhmguide.com/never-hungover x launch-2026-q2
https://www.dhmguide.com/never-hungover?utm_source=x&utm_medium=social&utm_campaign=launch-2026-q2

$ ./scripts/utm-tag.sh "https://www.dhmguide.com/page?ref=foo" reddit
https://www.dhmguide.com/page?ref=foo&utm_source=reddit&utm_medium=social&utm_campaign=2026-04
```

Scope: forward-only. We are NOT retro-tagging existing links — see `r10-utm-standard.md` for rationale.

## Item 4: Amended commit on `fix/affiliate-button-audit`

**Before:** `585e2f1df47d1c8e911116b61d52fdcc21f46273`
- Subject: `test: add P0 affiliate-click regression suite` (P0-D's message — wrong)

**After:** `cdb436c56862c79c5d6835bffb5fd48dfb5534c4`
- Subject: `fix: tag inline blog Amazon links and audit affiliate buttons site-wide`

**Tree hash unchanged** (`d40e0b8df49a89114d1e6d23552d66ed93d88312` before and after) — content is identical, only the commit message changed. Diff stat verified identical:

```
docs/posthog-analysis-2026-04-25/p0e-button-audit.md  | 162 +++++++++++++++++
src/newblog/components/NewBlogPost.jsx                |  16 +-
2 files changed, 172 insertions(+), 6 deletions(-)
```

Branch `fix/affiliate-button-audit` was unmerged and unpushed when amended; per task brief this is appropriate scope for `--amend`. **A `git push --force-with-lease origin fix/affiliate-button-audit` will be needed when the user is ready to push** (not done — awaiting approval).

## Verification log

```
$ npm run build           -> PASS (prerender of /, /guide, /reviews, /research, /about, /dhm-dosage-calculator, /compare)
$ ./scripts/posthog-query.sh events            -> 780 pageviews, 16 affiliate clicks, 46 dead-clicks, etc.
$ ./scripts/posthog-query.sh dead-clicks-raw   -> count: 46
$ ./scripts/posthog-query.sh dead-clicks-real  -> count: 35
$ git log -1 fix/affiliate-button-audit        -> cdb436c "fix: tag inline blog Amazon links..."
```

## Files touched on this branch

```
scripts/posthog-query.sh                              | modified (+34, -7)
scripts/utm-tag.sh                                    | new (executable)
docs/posthog-analysis-2026-04-25/r10-utm-standard.md  | new
docs/posthog-analysis-2026-04-25/r10-hygiene.md       | this file
```

No production code (hooks, components, blog posts, tests) touched per scope. Build passes.
