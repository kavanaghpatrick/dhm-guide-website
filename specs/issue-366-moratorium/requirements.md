---
spec: issue-366-moratorium
phase: requirements
created: 2026-04-29
---

# Requirements: issue-366-moratorium

## Feature Description

Build a CI guardrail that fails any PR modifying >20 post JSONs in `src/newblog/data/posts/`. Includes escape hatch via `[mass-edit-allowed]` PR description tag. Includes CLAUDE.md policy doc + workflow integration via extension of existing `.github/workflows/lockfile-check.yml`. Active until 2026-07-15 (expiry date embedded in CI job name as forcing function for manual cleanup).

## Goal

Prevent accidental mass-edit PRs from triggering further Google recrawl waves during DCNI recovery (per #366, child of #362). Structural prevention via CI > policy memory.

## User Stories

### US-1: Block accidental mass-edits
**As a** future contributor (or future me)
**I want** CI to block accidental mass-edits during the moratorium
**So that** I don't trigger another DCNI wave like PR #243 (147 files) or #246 (197 files).

**Acceptance Criteria:**
- [ ] AC-1.1, AC-1.5–AC-1.9 (see Functional ACs below)
- [ ] AC-2.1, AC-2.2, AC-2.4

### US-2: Legitimate mass-edit escape hatch
**As a** maintainer with a legitimate mass-edit need (corpus restore, post-moratorium realignment, FTC compliance fix)
**I want** an explicit escape hatch via PR description tag
**So that** I can opt-in deliberately without removing the guardrail.

**Acceptance Criteria:**
- [ ] AC-1.7: `[mass-edit-allowed]` in PR body bypasses threshold
- [ ] AC-4.3: Override branch logic verified

### US-3: Visible expiry date
**As a** future contributor
**I want** the moratorium expiry date visible in every PR's CI status
**So that** I know when the moratorium lifts without hunting for it.

**Acceptance Criteria:**
- [ ] AC-2.1: Job name embeds `expires 2026-07-15`
- [ ] AC-3.3: CLAUDE.md section documents expiry

### US-4: Self-passing PR
**As a** spec author
**I want** this PR (which adds the guardrail) to pass its own check
**So that** I don't have to invoke the escape hatch on the PR that ships the escape hatch.

**Acceptance Criteria:**
- [ ] AC-4.1, AC-4.2

## Functional Requirements

### FR-1: CI guardrail script (`scripts/check-mass-edit.mjs`)

| ID | Requirement | Priority |
|----|-------------|----------|
| AC-1.1 | New file `scripts/check-mass-edit.mjs` exists; ESM (`.mjs`); no new npm deps | High |
| AC-1.2 | Supports `--pr-body <string>` flag for local testing without GitHub Actions context | High |
| AC-1.3 | Supports `--threshold <N>` flag; default = 20 | High |
| AC-1.4 | Supports `--base <ref>` flag; default = `origin/main` | High |
| AC-1.5 | Reads modified-file list via `git diff --name-only <base>...HEAD` | High |
| AC-1.6 | Counts files matching `src/newblog/data/posts/*.json` (precise regex `^src/newblog/data/posts/[^/]+\.json$`) | High |
| AC-1.7 | Exits 0 if count ≤ threshold OR PR body contains `[mass-edit-allowed]` | High |
| AC-1.8 | Exits 1 with clear stderr error message if count > threshold AND no override | High |
| AC-1.9 | Error message includes: count, threshold, link to issue #366, escape-hatch syntax `[mass-edit-allowed]`, file list (truncated to first 10) | High |

### FR-2: Workflow integration (`.github/workflows/lockfile-check.yml`)

| ID | Requirement | Priority |
|----|-------------|----------|
| AC-2.1 | Existing workflow extended (NOT forked) with new job named `Mass-edit moratorium check (#366, expires 2026-07-15)` | High |
| AC-2.2 | New job runs on `pull_request: branches: [main]` (not pushes) | High |
| AC-2.3 | Job uses `actions/checkout@v4` with `fetch-depth: 0` (required for `git merge-base`) | High |
| AC-2.4 | Job runs `node scripts/check-mass-edit.mjs --pr-body "${{ github.event.pull_request.body }}"` | High |
| AC-2.5 | Job is required for merge (manual GitHub branch-protection setting; document in PR description) | Medium |

### FR-3: CLAUDE.md policy doc

| ID | Requirement | Priority |
|----|-------------|----------|
| AC-3.1 | New `## Mass-Edit Moratorium Policy` section added to CLAUDE.md | High |
| AC-3.2 | Section placed adjacent to existing `## Spec Artifact Commit Policy` (post-#345 precedent), before `Red Flags` section | High |
| AC-3.3 | Section includes: expiry date 2026-07-15, threshold 20, escape-hatch syntax `[mass-edit-allowed]`, link to #366 | High |

### FR-4: Self-test + build

| ID | Requirement | Priority |
|----|-------------|----------|
| AC-4.1 | `npm run build` exits 0 | High |
| AC-4.2 | `node scripts/check-mass-edit.mjs --pr-body "" --base origin/main` on this PR's branch exits 0 (zero post JSONs modified) | High |
| AC-4.3 | Override path verified: with `--pr-body "[mass-edit-allowed]"` the script exits 0 even when count > threshold (test via shell harness or faked diff) | High |

**Total: 18 ACs across 4 FRs.**

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Module format | ESM (`.mjs`) | Required by repo conventions |
| NFR-2 | Dependencies | New npm packages | 0 (Node stdlib + git only) |
| NFR-3 | Execution speed | Wall time | <2s |
| NFR-4 | Error message clarity | Includes WHY, not just FAIL | Mandatory: count, threshold, #366 link, escape-hatch syntax, file list |
| NFR-5 | Code style | Mirror precedent | Match `scripts/verify-z-classes.mjs` (per Pattern #15) |
| NFR-6 | CI runtime | Job timeout | 2 minutes |

## Glossary

- **DCNI**: Discovered – Currently Not Indexed (Google Search Console status). Indicator of templated-batch-content penalty.
- **Mass-edit PR**: Any PR modifying >20 post JSON files in `src/newblog/data/posts/`. Empirically correlates with sitemap recrawl waves.
- **Moratorium**: Active prohibition window (2026-04-29 → 2026-07-15) during which mass-edits are blocked.
- **Escape hatch**: `[mass-edit-allowed]` literal string in PR description that bypasses the check.
- **Threshold**: 20 files. Conservative ceiling above largest non-triggering known PR (~13 files in #84) and well below smallest known wave-triggering PR (147 in #243).

## Edge Cases

| Case | Behavior | Rationale |
|------|----------|-----------|
| `origin/main` not fetched locally | Script fails with clear error if base ref doesn't resolve | Local-dev mitigation |
| PR body is null/empty (e.g., GitHub Actions on PR with no description) | Treat as no override; check threshold normally | Conservative default |
| 0 modified post JSONs (most PRs) | Pass quickly with `OK: 0 post JSONs modified.` | Fast happy path |
| Renamed files in `src/newblog/data/posts/` | `git diff --name-only` shows old + new path; both counted | Acceptable false-positive risk; renames don't trigger DCNI waves the same way as content edits — documented |
| Deleted post JSON files | Count toward threshold | Deletion is also a sitemap signal change |
| Branch behind main | `git merge-base` resolves correctly; only divergent files counted | Standard `git diff` behavior |

## Out of Scope

- Automated GSC monitoring (requires API credentials; manual weekly check per #366 ACs)
- Auto-disable at moratorium-end 2026-07-15 (manual cleanup; expiry date embedded in CI job name as forcing function)
- "Warn" mode (binary pass/fail only; per Pattern #1)
- Counting LOC changes inside files (file count alone is sufficient signal)
- Tests for the script itself (Pattern #1: simple shell-out; PR self-test is the verification)
- Branch-protection setting in GitHub UI (manual; documented in PR description)

## Dependencies

- Node 22 (already in CI via `actions/setup-node@v4`)
- `git` binary (CI runner has it)
- GitHub Actions context var `${{ github.event.pull_request.body }}` (native; no API call)
- `actions/checkout@v4` with `fetch-depth: 0` (required for `git merge-base` resolution)

## Constraints

- Don't add npm dependencies
- Don't fork a new workflow file (extend existing `.github/workflows/lockfile-check.yml`)
- Don't auto-disable at expiry (manual cleanup at 2026-07-15)
- Don't add warn mode (binary pass/fail)

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Future contributor doesn't understand the failure → frustration | Medium | AC-1.9 — error message includes count, threshold, #366 link, CLAUDE.md anchor, escape-hatch syntax, file list (truncated to 10) |
| **Forgotten cleanup at 2026-07-15 → moratorium becomes permanent annoyance** | **Medium (biggest risk)** | Expiry date embedded in CI job name `Mass-edit moratorium check (#366, expires 2026-07-15)` — visible on every PR as forcing function |
| Renames flagged as mass-edit | Low | Documented edge case; acceptable false-positive risk — counts old + new path |
| GSC monitoring NOT automated | Low | Out-of-scope per #366; manual weekly check |
| Bypass abuse (someone tags every PR with override) | Low | Override is opt-in; rationale lives in PR body adjacent to tag, reviewable in PR diff |
| Shallow clone breaks `git merge-base` | Low | `fetch-depth: 0` in `actions/checkout@v4` step (AC-2.3) |

## Success Criteria

1. CI fails on a PR with >20 post JSONs modified and no `[mass-edit-allowed]` tag
2. CI passes on the same PR after `[mass-edit-allowed]` is added to PR description
3. CI passes on this PR (which ships the guardrail) without override (zero post JSONs modified)
4. Future contributor reading the CI failure message understands: what was blocked, why, how to override
5. Expiry date 2026-07-15 visible on every PR's CI status

## Unresolved Questions

None blocking. All design choices defensible from existing precedent (`verify-z-classes.mjs`, `lockfile-check.yml`, CLAUDE.md spec-artifact section).

## Next Steps

1. Generate `design.md` (technical design — script structure, workflow YAML, CLAUDE.md insertion point)
2. Generate `tasks.md` (concrete implementation steps)
3. Implement: `scripts/check-mass-edit.mjs` + workflow extension + CLAUDE.md section
4. Verify self-test on this PR (CI job runs against itself, passes)
5. Manual: enable branch protection on the new required check after merge
