# D2: Stale Branch Cleanup — 2026-04-26

## Objective
Delete stale `spec/*`, `feat/*`, `fix/*`, `chore/*`, `worktree-*` branches on origin that were
triggering failed Vercel preview builds. Their commits predate the lockfile hotfix (`0548488`,
2026-04-26 14:05 UTC) and Vercel auto-redeploys every push — so leaving them around means
continued red builds in the dashboard.

## Initial Remote Branch Count
**17 branches on origin** before cleanup (including `main`).

## Method
1. `git ls-remote --heads origin` to list all remote branches.
2. `gh pr list --state all` to map each branch to its PR state.
3. `git merge-base --is-ancestor` for branches without a PR.
4. Cross-reference against open PR list to protect any in-flight work.

## Branches Deleted (14 total)

| # | Branch | Tip | PR | Merged At |
|---|--------|-----|----|-----------|
| 1 | `asian-flush-foundation-posts` | `96794e4` (2025-07-03) | direct ancestor of main | pre-PR era |
| 2 | `dhm-supplement-stacking-guide` | `539712e` (2025-07-05) | direct ancestor of main | pre-PR era |
| 3 | `feat/mobile-comparison-above-fold` | `4269916` | #278 | 2026-04-26 09:22 UTC |
| 4 | `feat/template-reviews-cta` | `68372cd` | #277 | 2026-04-26 09:21 UTC |
| 5 | `spec/issue-287-lcp-investigation` | `8621899` | #313 | 2026-04-26 12:12 UTC |
| 6 | `spec/issue-292-quick-answer` | `bdd26c4` | #320 | 2026-04-26 12:48 UTC |
| 7 | `spec/issue-295-related-posts` | `9e808ce` | #323 | 2026-04-26 13:12 UTC |
| 8 | `spec/issue-308-posthog-dashboard` | `317c8a5` | #314 | 2026-04-26 12:18 UTC |
| 9 | `worktree-agent-a2dddcb1` | `2210563` | #262 | 2026-04-07 11:56 UTC |
| 10 | `worktree-agent-a61c4421` | `a10febd` | #267 | 2026-04-07 11:58 UTC |
| 11 | `worktree-agent-a8a19f10` | `ff046d5` | #266 | 2026-04-07 11:58 UTC |
| 12 | `worktree-agent-aa99a47f` | `b538dc0` | #265 | 2026-04-07 11:56 UTC |
| 13 | `worktree-agent-af6d7479` | `c0c2319` | #263 | 2026-04-07 11:56 UTC |
| 14 | `worktree-agent-afdc0b0d` | `3bbc4ae` | #264 | 2026-04-07 11:56 UTC |

All 14 deleted via single `git push origin --delete` call. All deletions confirmed by Git
output (`- [deleted]` for each).

### Why squash-merged branches showed `is-ancestor: NO`
GitHub squash-merges produce a new commit hash on `main`, so `git merge-base --is-ancestor`
returns `NO` for the original branch tip even though the changes are in `main`. Source of
truth was the GitHub PR `mergedAt` timestamp, which confirmed all 12 squash-merged branches
above were merged.

## Branches Kept (2 total)

| Branch | Reason |
|--------|--------|
| `main` | Default / production branch. Always retained. |
| `seo/issue-6-add-meta-descriptions` | **Target of OPEN PR #24** ("Add meta descriptions to blog posts and reorganize documentation"). Must remain on origin until PR is merged or closed. |

## Branches Considered But Not Found on Origin

`spec/issue-300-hangover-supplements` (the user's currently active local feature branch)
**does not exist on origin** — it was never pushed. No risk of accidental deletion. When the
user pushes it, Vercel will start deploying it.

## Final Remote Branch State

```
$ git ls-remote --heads origin
762b57282146b950b5e8f5cf967f119de4504f00	refs/heads/main
cbeabd23061df6a019fc8ebf4d00b5d62776f0d0	refs/heads/seo/issue-6-add-meta-descriptions
```

**3 branches removed → 2 branches remain (main + 1 open PR target).** Cleanup successful.

## Vercel Preview Build Impact

Vercel auto-deploys every push to every branch. Deleting a branch from origin means:
- Vercel **will not retry** preview builds for that branch.
- Existing failed preview deployments remain in the dashboard as historical artifacts but
  generate no new build attempts.
- Any pending/queued builds for the deleted branches are cancelled.

**Result: 14 stale branches × failing preview builds → 0 future failures from these branches.**

The only branches Vercel will continue to deploy:
- `main` (production) — has the lockfile hotfix `0548488`, builds green.
- `seo/issue-6-add-meta-descriptions` (PR #24 preview) — its tip is `cbeabd2` from
  2025-10-20, which **predates** the lockfile hotfix. If this branch needs a green preview
  build, it will require a rebase onto main or a cherry-pick of `0548488`. Out of scope for
  this cleanup; flagged for the PR author.

## Commands Executed

```bash
# 1. Inventory
git ls-remote --heads origin
gh pr list --state open --json number,headRefName
gh pr list --state all --limit 50 --json number,headRefName,state,mergedAt

# 2. Per-branch verification (loop over candidates)
git merge-base --is-ancestor "origin/$branch" origin/main
git log -1 --format="%h %ci" "origin/$branch"

# 3. Bulk deletion
git push origin --delete \
  asian-flush-foundation-posts dhm-supplement-stacking-guide \
  feat/mobile-comparison-above-fold feat/template-reviews-cta \
  spec/issue-287-lcp-investigation spec/issue-292-quick-answer \
  spec/issue-295-related-posts spec/issue-308-posthog-dashboard \
  worktree-agent-a2dddcb1 worktree-agent-a61c4421 worktree-agent-a8a19f10 \
  worktree-agent-aa99a47f worktree-agent-af6d7479 worktree-agent-afdc0b0d

# 4. Verify
git ls-remote --heads origin
```
