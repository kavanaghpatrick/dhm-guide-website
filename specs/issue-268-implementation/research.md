# Research: issue-268-implementation

## Executive Summary

Issue #268 tracks 10 unmerged branches (all locally committed, none on origin) plus 7 small follow-ups. Most branches are independently shippable; only `src/newblog/components/NewBlogPost.jsx` (touched by E, R6) and `src/pages/Compare.jsx` (touched by R1, R7) require sequential merging. Vercel auto-deploys from `main` and **cancels queued production builds when a newer commit lands**, which forces sequential merges with verification gates if we want per-PR attribution. Recommended pattern: open all 10 PRs in parallel (Vercel builds previews in parallel), then squash-merge sequentially with a 5–7 min HogQL event-count check between each. Total wall time ≈ 60–80 min.

## External Research (PR strategy, Vercel, force-push)

See `.research-pr-strategy.md` for citations and full doc text.

### Merge method
- **Squash-and-merge** for all 10. Each branch is 1–4 commits with a single concern; squash produces clean one-commit-per-PR attribution on `main` and makes `git revert <sha>` trivial. Matches the project's existing commit-log style (`feat:`, `fix:`).

### Cadence
- Vercel cancels in-flight production builds when a newer commit lands on `main`. Merging 10 PRs rapidly = 1 cumulative deploy, losing per-PR attribution.
- Open ALL 10 PRs at once (Vercel builds previews in parallel). Merge **sequentially** with a verification gate between each (~5–7 min). Total ≈ 50–70 min for the merge phase.

### Force-push for amended branch (`fix/affiliate-button-audit`)
Use explicit-SHA form of `--force-with-lease` to defeat the documented background-fetch race:

```bash
git fetch origin fix/affiliate-button-audit
REMOTE_SHA=$(git rev-parse origin/fix/affiliate-button-audit 2>/dev/null || echo NEW)
if [ "$REMOTE_SHA" = "NEW" ]; then
  git push origin fix/affiliate-button-audit
else
  git push --force-with-lease=fix/affiliate-button-audit:$REMOTE_SHA origin fix/affiliate-button-audit
fi
```

Since the branch has never been pushed, the first push has no force-with-lease requirement. `gh pr create` works fine on amended commits.

### Preview vs production differences
- Same CDN/edge/runtime, but: different env vars per environment (`VERCEL_ENV=preview|production`), preview gets `x-robots-tag: noindex` (SEO behaviors only verifiable in prod), promotion-from-preview triggers **full rebuild** with prod env vars (preview bits ≠ promoted bits).
- Implication: do not rely on preview-build → promote shortcut. Treat each merge as a fresh production deploy.

## Codebase Analysis

### Branch state (canonical)

See `.research-branches.md` for full audit.

| Issue label | Branch | Head | Ahead | Notes |
|---|---|---|---|---|
| B (pushed) | `fix/time-on-page-milestone` | `369dd0b` | 1 (origin) | needs PR |
| C (pushed) | `fix/flyby-comparison-pages` | `d2b6b09` | 1 (origin) | needs PR |
| R3 | `fix/canonical-script-404` | `29cb210` | 1 | pure deletion |
| R5 | `fix/comparison-posts-schema-audit` | `d43c5af` | 1 | 3 JSON fixes |
| R2 | `fix/widget-attribution-and-mobile-menu` | `b06e18b` | 1 | 4 file tweaks |
| R1 | `fix/affiliate-regex-and-urls` | `f36e8dc` | 4 (cherry-pick recovery) | regex + URLs |
| E | `fix/affiliate-button-audit` | `cdb436c` | 1 (amended; needs `--force-with-lease`) | inline link tagging |
| R9 | `fix/nac-vs-dhm-dead-clicks` | `3bfa474` | 1 | post JSON |
| R6 | `feat/template-reviews-cta` | `68372cd` | 1 (worktree `/private/tmp/r6-template-cta`) | NewBlogPost.jsx — high leverage |
| R7 | `feat/mobile-comparison-above-fold` | `4269916` | 1 (worktree `/private/tmp/r7-mobile-comparison`) | Reviews/Compare layout |
| R4 | `test/affiliate-regression` | `a1f036c` | 4 (atop E) | Playwright regression |
| R10 | `chore/hygiene-and-utm` | `3abd076` | 2 | scripts + docs |
| **DON'T MERGE** | `fix/affiliate-dead-clicks` | `bd2461f` | 1 | overbroad; delete |

### Conflict matrix

Most-contended files:
- `src/newblog/components/NewBlogPost.jsx` — E + R6 + follow-up #5
- `src/pages/Compare.jsx` — R1 + R7

Genuinely independent (parallel-merge safe):
- `chore/hygiene-and-utm` (scripts + docs)
- `fix/comparison-posts-schema-audit` (JSON-only)
- `fix/nac-vs-dhm-dead-clicks` (single JSON)
- `fix/canonical-script-404` (pure deletion of dead file + `index.html` line)
- `fix/widget-attribution-and-mobile-menu` (small distinct components)

### Recommended merge order

| Phase | Branches | Reason |
|---|---|---|
| 1 | B, C (already on origin) | open PRs, merge first |
| 2 (parallel-safe) | R10, R3, R5, R2, R9 | no shared files among them |
| 3 (NewBlogPost.jsx + Compare.jsx contention) | E → R1 → R6 → R7 | sequential; E first because amended; R1 second to settle Compare.jsx URLs; R6 third to add template CTA; R7 last for layout reorder |
| 4 (test infra) | R4 | tests reflect final code state |
| Skip | `fix/affiliate-dead-clicks` | use R10 query-time filter instead |

### Project quality commands

See `.research-quality.md` for full inventory.

| Command | Use |
|---|---|
| `npm run build` | per-branch sanity (validate-posts + vite build + prerender) |
| `npm run lint` | code style (eslint flat config) |
| `npx playwright test` | core smoke tests (auto-starts dev server) |
| `npx playwright test --config=playwright.affiliate.config.js` | R4's affiliate regression suite (against prod or PLAYWRIGHT_BASE_URL preview) |
| `./scripts/posthog-query.sh events` | event volume sanity |
| `./scripts/posthog-query.sh dead-clicks-real` | non-amzn-false-positive dead-click rate (R10) |

### Validate-posts thresholds (build blockers)
- `content` < 500 chars OR < 100 words → ERROR
- `metaDescription`, `date`, `alt_text` missing → WARNING (non-blocking)

## Follow-Up Item Scope

See `.research-followups.md`.

| # | Item | Effort | Risk | Ordering |
|---|---|---|---|---|
| 1 | flyby-vs-fuller-health image dict→string | S | low | after R5 merges (same file) |
| 2 | DHM1000 brand mismatch (Compare.jsx:262) | S | low | after R1 merges (same file) |
| 3 | Placeholder Amazon URLs in 3 blog JSONs | S | low | independent |
| 4 | Methodology caveat in `02-top-pages.md` | S | none | docs only — independent |
| 5 | Drop redundant `<ReviewsCTA />` (NewBlogPost.jsx:1390-1402) | S | low | **after R6 merges** |
| 6 | Close PR #259 unmerged | S | none | independent |
| 7 | Add `POSTHOG_PERSONAL_API_KEY` to `~/.zshrc` | S | none | user action — flag only |

All 7 are S-effort. Total ≈ 60–90 min after the 10 branches land.

## Verification Metrics

See `.research-metrics.md` (24KB) for the 8 metric queries + 3 sanity queries + baseline snapshot script.

Coordinator-level summary of the verification matrix:

| Branch | Watch metric | Window | Pre-baseline | Post-target |
|---|---|---|---|---|
| B (`fix/time-on-page-milestone`) | `time_on_page_milestone` daily count | 24h | ~10/day | ~70/day |
| C + R3 + R5 | scroll-50 events on the 5 fixed posts | 24h | 0 | non-zero |
| R9 (`fix/nac-vs-dhm-dead-clicks`) | dead-clicks-real on nac-vs-dhm | 7d | 78/30d | drop |
| R6 (`feat/template-reviews-cta`) | `/reviews` PV; affiliate clicks | 4–6w | 60/mo, 56/30d | 2–5×, +60–120% |
| R7 (`feat/mobile-comparison-above-fold`) | mobile CR; mobile PV share | 4–6w | 3.57%; 15% | trending up; 25%+ |
| R1 (`fix/affiliate-regex-and-urls`) | Fuller Health click count | 7d | 0 | ≥1 |

Sanity (run after every merge): total `$pageview`, total `affiliate_link_click`, total `$exception` for last 7 days.

## Feasibility Assessment

| Aspect | Assessment | Notes |
|---|---|---|
| Code feasibility | High | All work already implemented; this spec is push + PR + 7 small follow-ups |
| Risk | Medium | 10 sequential prod deploys; per-PR rollback is `git revert <sha>` |
| Effort | M | Merge phase ≈ 60–80 min; follow-ups ≈ 60–90 min; total ≈ 2–3 hours |
| Reversibility | High | Squash-merge enables 1-commit revert per PR; Vercel instant rollback for production |
| Concurrency risk | Low | Sequential merge protocol prevents Vercel build cancellation losing attribution |

## Recommendations for Requirements

1. Treat the 12 branches and 7 follow-ups as **separate atomic tasks** so they can be tracked, reverted, and verified independently.
2. **Open all PRs first** (parallel preview deploys), **merge sequentially** with a 5-minute HogQL gate between each.
3. **Squash-merge** every PR.
4. For `fix/affiliate-button-audit` (amended commit), push with `--force-with-lease` using explicit-SHA form (or plain `git push` since branch has never been pushed).
5. Fetch `feat/template-reviews-cta` and `feat/mobile-comparison-above-fold` from their `/private/tmp/*` worktrees before pushing.
6. **Capture pre-deploy baseline** via `scripts/posthog-baseline.sh` (per .research-metrics.md) before merging anything.
7. Sequence follow-ups #1, #2, #5 AFTER their dependent branches merge (same-file contention).
8. Recommend (not implement) follow-up #7 since it's a user-side `~/.zshrc` change.
9. Delete `fix/affiliate-dead-clicks` branch after PR review window, do NOT merge it.

## Open Questions

None blocking. The plan is well-defined; remaining ambiguity is non-functional (e.g., PR description tone, label conventions). Defaults will be applied: PR titles match commit subjects; descriptions reference issue #268 and the relevant `.specs/issue-268-implementation/` doc.

## Sources

- `specs/issue-268-implementation/plan.md` (mirror of GH issue #268 body)
- `specs/issue-268-implementation/.research-branches.md`
- `specs/issue-268-implementation/.research-followups.md`
- `specs/issue-268-implementation/.research-quality.md`
- `specs/issue-268-implementation/.research-pr-strategy.md`
- `specs/issue-268-implementation/.research-metrics.md`
- `docs/posthog-analysis-2026-04-25/00-FINAL-SYNTHESIS.md`
- Vercel docs: https://vercel.com/docs/git/vercel-for-github (build cancellation behavior)
- GitHub docs: PR merge methods, force-with-lease semantics
- PostHog docs: HogQL query API
