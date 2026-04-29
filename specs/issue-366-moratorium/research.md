---
spec: issue-366-moratorium
phase: research
created: 2026-04-29
---

# Research: issue-366-moratorium

## Executive Summary

Build a CI guardrail (`scripts/check-mass-edit.mjs` + new job in `.github/workflows/lockfile-check.yml`) that fails any PR modifying >20 JSON files in `src/newblog/data/posts/` unless the PR description contains `[mass-edit-allowed]`. Mirrors the `verify-z-classes.mjs` precedent: simple Node script, no deps, binary pass/fail, structural prevention. Self-test: this PR touches ~5 files, zero post JSONs — passes.

## External Research

### Best Practices

| Source | Finding |
|--------|---------|
| GitHub Actions docs (`github.event.pull_request.body`) | PR description natively available in CI context — no API call needed |
| `git merge-base origin/main HEAD` + `git diff --name-only` | Canonical way to enumerate PR-changed files; counts files, not bytes |
| `actions/checkout@v4` with `fetch-depth: 0` | Required for merge-base to resolve in CI (default shallow clone breaks `git merge-base`) |
| Conventional opt-in tags (e.g. `[skip ci]`, `[skip-changelog]`) | Bracketed tag in PR description / commit message is the standard escape-hatch idiom |

### Prior Art (in this repo)

- `scripts/verify-z-classes.mjs` — Node, zero deps, scans source vs build artifact, binary exit code, clear failure message linking to root-cause section in CLAUDE.md (Pattern #15). **Mirror this pattern.**
- `.github/workflows/lockfile-check.yml` — two-job workflow (`pnpm-frozen-lockfile`, `build`), runs on `pull_request: branches: [main]`, uses `actions/checkout@v4` + `pnpm/action-setup@v4` + `actions/setup-node@v4`. **Add a third job here, don't fork a new workflow file.**

### Pitfalls to Avoid

- Shallow clone breaks `git merge-base` → must set `fetch-depth: 0` in checkout step.
- `git diff --name-only HEAD~1` is wrong (only catches last commit; PR may have many). Must use `git merge-base origin/main HEAD` then diff against that.
- Globs need precise filter: `^src/newblog/data/posts/[^/]+\.json$` to avoid catching nested fixtures or non-JSON files.
- "Warn" mode looks friendly but creates ambiguity (was the warning seen?). Binary pass/fail is simpler — Pattern #1.

## Codebase Analysis

### Existing Patterns

- **Build-time guard scripts**: `scripts/verify-z-classes.mjs` is the model. Plain `.mjs`, `process.cwd()` for paths, `process.exit(1)` on fail with multi-line `console.error` explaining cause + remedy.
- **CI workflow shape**: `.github/workflows/lockfile-check.yml` runs on `pull_request: branches: [main]`, uses `actions/checkout@v4` + node 22. Add a peer job alongside `pnpm-frozen-lockfile` and `build`.
- **Spec-artifact policy precedent**: CLAUDE.md line 575 has a "Spec Artifact Commit Policy" section. Add the new "Mass-Edit Moratorium Policy" section adjacent, before the "Red Flags" section at line 591.

### Dependencies

- Node 22 (already in CI). No npm packages needed — script uses only `node:child_process` (`execSync('git diff --name-only ...')`) and stdlib.
- `git` (CI runner has it).
- GitHub Actions context vars: `${{ github.event.pull_request.body }}` (PR description, available natively).

### Constraints

- 202 post JSON files in `src/newblog/data/posts/` (verified). Threshold of 20 = ~10% of corpus.
- Workflow only needs to run on `pull_request` events to `main` (matches existing pattern). No need on push to main (post-merge is too late).
- Script must work both in CI (read PR body from env) AND locally (read from `--pr-body` flag).

## The 20-File Threshold Rationale

| PR | Files modified | Triggered recrawl wave? |
|----|---------------|-------------------------|
| #243 (Feb 1, 2026) | 147 (relatedPosts regen) | YES — drove DCNI 0→120 over Jan 29–Apr 16 |
| #246 (Apr 29, 2026) | 197 (hub-footer auto-injection) | EXPECTED YES — wave projected May 5 onward |
| #84 (metadata cleanup) | ~13 | NO |
| #86 (broken-link fix) | ~8 | NO |

**Choice of 20**: conservative ceiling above the largest non-triggering known PR (~13 files in #84) and well below the smallest known wave-triggering PR (147 in #243). 20 files = ~10% of the 202-post corpus, safely below the threshold where Google starts treating sitemap timestamp churn as a templated batch-content signal. Round number, easy to remember, easy to defend.

## CI Guardrail Design

**Script**: `scripts/check-mass-edit.mjs`

```
1. Parse args: --pr-body=<string> (default: process.env.PR_BODY || '')
2. Compute merge base: execSync('git merge-base origin/main HEAD').trim()
3. Diff: execSync(`git diff --name-only ${base}..HEAD`).split('\n')
4. Filter: lines matching /^src\/newblog\/data\/posts\/[^/]+\.json$/
5. Count = filtered.length
6. If count > 20 AND NOT prBody.includes('[mass-edit-allowed]'):
     console.error with link to #366 + CLAUDE.md section + escape-hatch syntax
     process.exit(1)
   Else:
     console.log(`OK: ${count} post JSONs modified (<= 20 OR override present).`)
     process.exit(0)
```

**Edge cases**:
- New post additions (not modifications): still counted by `git diff --name-only` — intentional. Adding 30 new posts is also a sitemap timestamp event.
- Renames: `git diff --name-only` shows both old + new paths. Acceptable — counts as 2.
- Branch behind main: merge-base resolves correctly; we count only files diverged on this branch.

## GitHub Actions Integration

**Recommendation**: Add a new job `mass-edit-moratorium` to existing `.github/workflows/lockfile-check.yml`. Same trigger (`pull_request: branches: [main]`), same `actions/checkout@v4` + `actions/setup-node@v4` pattern.

```yaml
mass-edit-moratorium:
  name: Mass-edit moratorium check (#366, expires 2026-07-15)
  runs-on: ubuntu-latest
  timeout-minutes: 2
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0  # required for git merge-base
    - uses: actions/setup-node@v4
      with:
        node-version: 22
    - name: Check mass-edit threshold
      env:
        PR_BODY: ${{ github.event.pull_request.body }}
      run: node scripts/check-mass-edit.mjs
```

No `pnpm install` needed — script uses only Node stdlib + git.

## Escape-Hatch Design

**Trigger**: PR description contains literal `[mass-edit-allowed]`.

**Why bracketed**: matches `[skip ci]` convention. Easy to grep, hard to type accidentally.

**Why intentional friction**: the bypass requires a deliberate edit to the PR body, signaling "I considered the moratorium and have a reason." The reason should be in the PR body adjacent to the tag.

**Legitimate uses**:
- Restoring corpus from backup (e.g., post-incident recovery)
- Cluster realignment after the moratorium expires (post-2026-07-15)
- Emergency content compliance fix (FTC, FDA, broken affiliate disclosures)
- Discovery of widespread broken JSON-LD or canonical regression

## CLAUDE.md Addition

Add immediately before line 589 (the `---` separator preceding "Red Flags"):

```markdown
## Mass-Edit Moratorium Policy

**Active until 2026-07-15** (per #366, child of #362 DCNI investigation).

PRs modifying >20 files in `src/newblog/data/posts/` will FAIL CI. This prevents Google recrawl waves during DCNI recovery.

**Override**: Add `[mass-edit-allowed]` to PR description with rationale.

**Tracking**: weekly DCNI count via GSC. Lift moratorium when DCNI stabilizes below 102 (pre-wave baseline).

**Why 20**: PR #243 (147 files) and #246 (197 files) triggered measurable recrawl waves; #84 (~13 files) and #86 (~8 files) did not. 20 = conservative ceiling.
```

## Self-Test

This PR ships:
1. `scripts/check-mass-edit.mjs` (new file, ~50 LOC)
2. `.github/workflows/lockfile-check.yml` (edit, +20 LOC for new job)
3. `CLAUDE.md` (edit, +10 LOC for new section)
4. `specs/issue-366-moratorium/research.md` (this file)
5. `specs/issue-366-moratorium/requirements.md` + `design.md` + `tasks.md` (forthcoming)

= ~5 files, **zero** post JSONs. The check runs against itself and passes.

## Risk Register

| Risk | Mitigation |
|------|------------|
| False positive — legitimate small PR flagged | Precise regex filter `^src/newblog/data/posts/[^/]+\.json$` only counts changed files (not size); diff via `git diff --name-only` |
| Contributor confused by failure | Failure message includes: link to #366, link to CLAUDE.md section, exact escape-hatch syntax `[mass-edit-allowed]`, list of offending file paths |
| PR description not in CI context | GitHub Actions provides `${{ github.event.pull_request.body }}` natively as env var |
| Local testing without CI | Script reads `--pr-body=<string>` flag for offline testing |
| Shallow clone breaks merge-base | `fetch-depth: 0` in `actions/checkout@v4` step |
| Forgotten removal at 2026-07-15 | Workflow job name embeds expiry date: `Mass-edit moratorium check (#366, expires 2026-07-15)` — visible on every PR |
| Bypass abuse | Tag is opt-in; rationale lives in PR body adjacent to tag, reviewable in PR diff |

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Lint | Not found (no lint script) | package.json scripts |
| TypeCheck | Not found | package.json scripts |
| Test | Not found | package.json scripts |
| Build | `pnpm run build` | package.json (existing CI uses this) |

**Local CI for this spec**: `node scripts/check-mass-edit.mjs --pr-body=""` from repo root with `origin/main` fetched.

## Verification Tooling

Not applicable — this spec ships build-time guards, no runtime/E2E.

| Aspect | Detail |
|--------|--------|
| Project type | Static site (Vite + React, prerendered) |
| Verification strategy | Run script locally with empty PR body → expect exit 0 (PR has 0 post JSONs); manually craft a fake diff list → expect exit 1; in CI, the `lockfile-check` workflow run on this PR is the live verification |

## Verification Approach (per AC)

| AC | Test |
|----|------|
| Script exists and runs | `node scripts/check-mass-edit.mjs --pr-body="" && echo OK` |
| Workflow has new job | `grep -q "mass-edit-moratorium" .github/workflows/lockfile-check.yml` |
| CLAUDE.md has new section | `grep -q "Mass-Edit Moratorium Policy" CLAUDE.md` |
| Self-test passes on this PR | CI run on the PR for this spec → green check on `mass-edit-moratorium` job |
| Override works | Manually test: `node scripts/check-mass-edit.mjs --pr-body="[mass-edit-allowed]"` against a faked 30-file diff → exit 0 |
| Failure mode is clear | Run against faked 30-file diff with empty PR body → stderr contains #366 link, CLAUDE.md anchor, escape-hatch syntax |

## Out of Scope

- Automated GSC monitoring (requires API credentials; manual weekly check per #366 ACs)
- Auto-disable at 2026-07-15 (manual; user removes guardrail when window closes — see Risk Register: job name embeds expiry date as forcing function)
- "Warn" mode (binary pass/fail is simpler; Pattern #1)
- Counting LOC changes inside files (file count alone is sufficient signal — sitemap `lastmod` bumps regardless of edit size)

## Related Specs

Scanned `specs/` for related work. No directly conflicting specs found. Adjacent specs reference #362 lineage:
- This spec (#366) is sibling to: #363 (Action 1 technical bugs), #364 (Action 2 hub promotion), #365 (Action 3 Save/Merge/Delete — DEFERRED until post-moratorium per #366).
- The script intentionally does NOT block #363 or #364 since those touch ≤4 files each.

## Recommendations for Requirements

1. Single script `scripts/check-mass-edit.mjs`, ~50 LOC, Node stdlib only, zero deps.
2. Single job add to `.github/workflows/lockfile-check.yml` — extend, don't fork.
3. Job name MUST include "expires 2026-07-15" so the deletion date is visible on every PR.
4. Failure message MUST include: file count, file list (truncated to first 5), link to #366, link to CLAUDE.md anchor, escape-hatch syntax.
5. CLAUDE.md addition placed immediately before "Red Flags" section, mirroring "Spec Artifact Commit Policy" format.
6. No tests for the script (Pattern #1: simple shell-out, manual verification on the PR itself is the test).

## Open Questions

None blocking. All design choices are defensible from existing precedent (verify-z-classes.mjs, lockfile-check.yml, CLAUDE.md spec-artifact section).

## Sources

- GitHub issue #366: `gh issue view 366` (full text reviewed)
- `.github/workflows/lockfile-check.yml` (existing CI workflow pattern)
- `scripts/verify-z-classes.mjs` (build-time guard precedent)
- `CLAUDE.md` lines 575–588 (Spec Artifact Commit Policy precedent)
- `src/newblog/data/posts/` (verified 202 JSON files exist)
- `.progress.md` for issue-366-moratorium (Original Goal + scope confirmation)
