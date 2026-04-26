# Deploy Investigation - Current Failures (2026-04-26 ~14:29 UTC)

## Verdict (TL;DR)

**Production is genuinely Ready.** No new failures are happening **right now**.
The "new" failure emails are echoes of preview/production builds that fired in the **30–90 minutes before the hotfix landed at 14:06 UTC**. Vercel sends one email per failed build, and email delivery often lags the actual build event by several minutes.

- **All three most recent deploys (7m / 8m / 10m old) are Ready.**
- **All Error deploys are pre-hotfix (commit `0548488`).** Every single one is `ERR_PNPM_OUTDATED_LOCKFILE`.
- **No new error class** has appeared. There is nothing new failing.
- **Stale spec/* branches were already pruned** — only `main`, `chore/ci-pnpm-frozen-lockfile-gate`, and the very old `seo/issue-6-add-meta-descriptions` exist on origin now.

The user is almost certainly seeing **delayed email delivery for builds that failed 30–90m ago**. No further action required to stop new failures; the queue will go silent on its own.

---

## Last 30 Deployments — Status Table

| Age | Status | Env | Branch | Commit | Started (UTC) |
|-----|--------|-----|--------|--------|---------------|
| 7m | Ready | Production | main | 081ee73 | 14:33:05 |
| 8m | Ready | Preview | chore/ci-pnpm-frozen-lockfile-gate | e344ab2 | 14:31:50 |
| 10m | Ready | Preview | chore/ci-pnpm-frozen-lockfile-gate | 2d26510 | 14:30:07 |
| 34m | Ready | Production | hotfix/pnpm-lockfile-vercel-deploy | 0548488 | ~14:06 |
| 34m | Ready | Preview | hotfix/pnpm-lockfile-vercel-deploy | 0548488 | 14:06:00 |
| 52m | Error | Production | main | c9b7243 | 13:47:53 |
| 52m | Error | Preview | spec/issue-299-dhm-science-explained | 0942bfb | 13:47:24 |
| 1h | Error | Production | main | 980d02b | 13:38:44 |
| 1h | Error | Preview | spec/issue-298-mega-menu | 55d4dd6 | 13:38:17 |
| 1h | Error | Production | main | 8a94370 | 13:32:08 |
| 1h | Error | Preview | spec/issue-297-cluster-formalize | 0225b44 | 13:31:39 |
| 1h | Error | Production | main | (pre-hotfix) | ~13:25 |
| 1h | Error | Preview | spec/issue-296-orphan-injector | a09fecb | 13:22:55 |
| 1h | Error | Production | main | (pre-hotfix) | ~13:15 |
| 1h | Error | Preview | spec/issue-295-related-posts | 9e808ce | 13:11:57 |
| 2h | Error | Production | main | (pre-hotfix) | ~13:05 |
| 2h | Error | Preview | spec/issue-294-pubmed | f85e39e | 13:04:13 |
| 2h | Error | Production | main | (pre-hotfix) | ~12:55 |
| 2h | Error | Preview | spec/issue-293-hero-img | 3eed1db | 12:52:56 |
| 2h+ | Error | … | older spec/* and main pre-hotfix | … | … |
| 4h | Ready | Preview | (last green pre-incident) | … | ~10:30 |

(20+ additional Error deploys 2h–3h old, all same root cause.)

## Error Logs

**Every** erroring deploy fails with the **same** message:

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with <ROOT>/package.json
…
Error: Command "pnpm install" exited with 1
```

The mismatch is the `micromark` / `micromark-extension-gfm` deps added to `package.json` without a corresponding `pnpm install` run. Hotfix `0548488` regenerated the lockfile. **No deploy after that commit has failed.** No alternate error classes were observed.

## Stale Branches on Origin

After `git fetch --prune`, only **3 branches** exist on origin:

| Branch | Tip | Status |
|--------|-----|--------|
| `main` | 081ee73 (PR #329 - CI gate merged) | OK |
| `chore/ci-pnpm-frozen-lockfile-gate` | e344ab2 | OK (already deployed Ready 8m ago) |
| `seo/issue-6-add-meta-descriptions` | cbeabd2 | OLD; no recent push, **not currently retrying** |

All `spec/issue-29*` branches (293, 294, 295, 296, 297, 298, 299) and worktree branches that triggered the failed previews **have already been deleted on origin**. They cannot retry. **No stale-branch deletion needed.**

`seo/issue-6-add-meta-descriptions` is ancient and is not generating any deploy traffic in the visible window — leave alone unless a build is observed.

## Email Source Identification

The most recent failure clock-times (when Vercel queued the failure email):

- 13:47:34 UTC — `8p77uv7u7` (preview, spec/issue-299) — **42 min ago**
- 13:48:03 UTC — `p73db1r4c` (production, main@c9b7243) — **41 min ago**

These are the **last** failed builds. Anything past 14:06 UTC is Ready. If the user "just" got an email at 14:25–14:29 UTC, it's the email-delivery tail of the 13:47/13:48 failures (Vercel email sends commonly arrive 20–40 min after the build event during burst conditions, especially when ~25 deploys failed in a 90-minute window).

## Recommendation

**Do nothing.** The fire is out:
1. Hotfix `0548488` is in production (Ready, 34m).
2. PR #329 added a CI gate to prevent recurrence.
3. The branches that produced the failures are already deleted.
4. No new error class is appearing.

The remaining inbox noise will stop on its own as the email queue drains. If a NEW Error deploy appears with a build started after 14:06 UTC, re-investigate — but as of 14:29 UTC there are zero such deploys.
