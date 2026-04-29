---
spec: issue-366-moratorium
phase: tasks
created: 2026-04-29
---

# Tasks: issue-366-moratorium

## Phase 1: CI Guardrail Script

- [x] 1.1 Create `scripts/check-mass-edit.mjs`
  - **Do**:
    1. Create new file `scripts/check-mass-edit.mjs` per design.md §2 skeleton
    2. Header docblock matching design (refs #366, expiry 2026-07-15, mirrors `verify-z-classes.mjs`)
    3. ESM import `execSync` from `node:child_process`
    4. Argv parsing (`--base`, `--threshold`, `--pr-body`); defaults: `origin/main`, 20, `process.env.PR_BODY || ''`
    5. Compute changed files via `git diff --name-only ${BASE}...HEAD`; filter via `/^src\/newblog\/data\/posts\/[^/]+\.json$/`
    6. Decision logic: count ≤ threshold → exit 0; override tag present → exit 0; else exit 1 with multi-line stderr (count, files first 10, override syntax, #366 link, CLAUDE.md ref)
    7. `try/catch` around `execSync` → exit 2 with `fetch-depth: 0` hint
  - **Files**: `scripts/check-mass-edit.mjs`
  - **Done when**: File exists, ESM, no npm deps, exit 0 with `--pr-body "" --base origin/main` on this branch
  - **Verify**: `test -f scripts/check-mass-edit.mjs && node scripts/check-mass-edit.mjs --pr-body "" --base origin/main && echo PASS`
  - **Commit**: None (batched in 1.4)
  - _Requirements: AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.7, AC-1.8, AC-1.9_
  - _Design: §2_

- [x] 1.2 [VERIFY] Self-test: zero post JSONs in this branch passes
  - **Do**:
    1. Ensure `origin/main` is fetched: `git fetch origin main`
    2. Run script with empty PR body against this branch
  - **Files**: none
  - **Done when**: Script exits 0 with `OK: 0 post JSON(s) modified`
  - **Verify**: `node scripts/check-mass-edit.mjs --pr-body "" --base origin/main && echo VE_SELFTEST_PASS`
  - **Commit**: None
  - _Requirements: AC-4.2_

- [x] 1.3 [VERIFY] Override path: tag bypasses threshold even when count exceeds
  - **Do**:
    1. Pick a base ref that includes >0 post JSON modifications (use `HEAD~50` or any historical ref where post JSONs were edited)
    2. Run script with `--threshold 0 --pr-body "[mass-edit-allowed]"` against that base — must exit 0
    3. Run same with `--threshold 0 --pr-body ""` — must exit 1 (proves the threshold check actually fires when override absent)
  - **Files**: none
  - **Done when**: Override exits 0, no-override exits 1
  - **Verify**: `node scripts/check-mass-edit.mjs --threshold 0 --pr-body "[mass-edit-allowed]" --base HEAD~50 && echo VE_OVERRIDE_PASS && (node scripts/check-mass-edit.mjs --threshold 0 --pr-body "" --base HEAD~50 ; test $? -eq 1 && echo VE_NO_OVERRIDE_PASS)`
  - **Commit**: None
  - _Requirements: AC-4.3, AC-1.7, AC-1.8_

- [x] 1.4 [COMMIT] Stage and commit script
  - **Do**:
    1. `git add scripts/check-mass-edit.mjs`
    2. `git status --short` — verify ONLY `scripts/check-mass-edit.mjs` staged
    3. Commit with HEREDOC message per design §7 commit #1
  - **Files**: staged: `scripts/check-mass-edit.mjs`
  - **Done when**: Commit exists; `git log -1 --name-only` shows only the script
  - **Verify**: `git log -1 --pretty=format:%s | grep -q "feat(scripts): add mass-edit moratorium CI guardrail script (#366)" && git log -1 --name-only --pretty=format: | tr -d '\n ' | grep -qx "scripts/check-mass-edit.mjs" && echo COMMIT1_PASS`
  - **Commit**: `feat(scripts): add mass-edit moratorium CI guardrail script (#366)` (with `Co-Authored-By` trailer)

## Phase 2: Workflow Extension

- [x] 2.1 Add `mass-edit-check` job to `.github/workflows/lockfile-check.yml`
  - **Do**:
    1. Open `.github/workflows/lockfile-check.yml`
    2. Append new job `mass-edit-check` after existing `build` job per design §3
    3. Job name: `Mass-edit moratorium check (#366, expires 2026-07-15)`
    4. `runs-on: ubuntu-latest`, `timeout-minutes: 2`, `if: github.event_name == 'pull_request'`
    5. Steps: `actions/checkout@v4` with `fetch-depth: 0`, `actions/setup-node@v4` with `node-version: 22`, run step with `PR_BODY` env from `${{ github.event.pull_request.body }}` and command `node scripts/check-mass-edit.mjs --base origin/${{ github.base_ref }}`
  - **Files**: `.github/workflows/lockfile-check.yml`
  - **Done when**: New job exists; YAML well-formed
  - **Verify**: `grep -q "Mass-edit moratorium check (#366, expires 2026-07-15)" .github/workflows/lockfile-check.yml && grep -q "mass-edit-check:" .github/workflows/lockfile-check.yml && grep -q "fetch-depth: 0" .github/workflows/lockfile-check.yml && echo PASS`
  - **Commit**: None (batched in 2.3)
  - _Requirements: AC-2.1, AC-2.2, AC-2.3, AC-2.4_
  - _Design: §3_

- [x] 2.2 [VERIFY] YAML structural sanity
  - **Do**:
    1. Confirm new job name string present (job-name AC)
    2. Confirm `fetch-depth: 0` present (CI checkout AC)
    3. Confirm `PR_BODY: ${{ github.event.pull_request.body }}` env line present
    4. Confirm `--base origin/${{ github.base_ref }}` argument present
  - **Files**: none
  - **Done when**: All 4 grep assertions pass
  - **Verify**: `grep -q "Mass-edit moratorium check (#366, expires 2026-07-15)" .github/workflows/lockfile-check.yml && grep -q "fetch-depth: 0" .github/workflows/lockfile-check.yml && grep -q "PR_BODY:" .github/workflows/lockfile-check.yml && grep -q -- "--base origin/" .github/workflows/lockfile-check.yml && echo YAML_PASS`
  - **Commit**: None

- [x] 2.3 [COMMIT] Stage and commit workflow change
  - **Do**:
    1. `git add .github/workflows/lockfile-check.yml`
    2. `git status --short` — verify ONLY workflow file staged
    3. Commit with HEREDOC message per design §7 commit #2
  - **Files**: staged: `.github/workflows/lockfile-check.yml`
  - **Done when**: Commit exists; `git log -1 --name-only` shows only the workflow
  - **Verify**: `git log -1 --pretty=format:%s | grep -q "ci: add mass-edit moratorium check job to lockfile workflow (#366)" && git log -1 --name-only --pretty=format: | tr -d '\n ' | grep -qx ".github/workflows/lockfile-check.yml" && echo COMMIT2_PASS`
  - **Commit**: `ci: add mass-edit moratorium check job to lockfile workflow (#366)` (with `Co-Authored-By` trailer)

## Phase 3: CLAUDE.md Policy Section

- [x] 3.1 Insert "Mass-Edit Moratorium Policy" section
  - **Do**:
    1. Open `CLAUDE.md`
    2. Insert new `## Mass-Edit Moratorium Policy` section AFTER the existing `## Spec Artifact Commit Policy` section (added by #345) and BEFORE `## ⚠️ Red Flags (STOP and Simplify)`
    3. Section content per design §4: 4 required parts — (a) the rule (>20 files in `src/newblog/data/posts/` fails CI), (b) escape hatch syntax `[mass-edit-allowed]`, (c) expiry date 2026-07-15, (d) GSC tracking note
  - **Files**: `CLAUDE.md`
  - **Done when**: Section exists in correct position with all 4 parts
  - **Verify**: `grep -q "## Mass-Edit Moratorium Policy" CLAUDE.md && echo PASS`
  - **Commit**: None (batched in 3.3)
  - _Requirements: AC-3.1, AC-3.2, AC-3.3_
  - _Design: §4_

- [x] 3.2 [VERIFY] All 4 required content elements present in section
  - **Do**:
    1. Section heading present
    2. Expiry date `2026-07-15` mentioned
    3. Threshold `20` and path `src/newblog/data/posts` mentioned
    4. Escape hatch `[mass-edit-allowed]` mentioned
    5. GSC tracking / DCNI tracking note present
  - **Files**: none
  - **Done when**: All 5 grep assertions pass
  - **Verify**: `grep -q "## Mass-Edit Moratorium Policy" CLAUDE.md && grep -q "2026-07-15" CLAUDE.md && grep -q "src/newblog/data/posts" CLAUDE.md && grep -q "\[mass-edit-allowed\]" CLAUDE.md && (grep -q "GSC" CLAUDE.md || grep -q "DCNI" CLAUDE.md) && echo CLAUDE_MD_PASS`
  - **Commit**: None

- [x] 3.3 [COMMIT] Stage and commit CLAUDE.md
  - **Do**:
    1. `git add CLAUDE.md`
    2. `git status --short` — verify ONLY `CLAUDE.md` staged
    3. Commit with HEREDOC message per design §7 commit #3
  - **Files**: staged: `CLAUDE.md`
  - **Done when**: Commit exists; `git log -1 --name-only` shows only `CLAUDE.md`
  - **Verify**: `git log -1 --pretty=format:%s | grep -q "docs(claude): document mass-edit moratorium policy (#366)" && git log -1 --name-only --pretty=format: | tr -d '\n ' | grep -qx "CLAUDE.md" && echo COMMIT3_PASS`
  - **Commit**: `docs(claude): document mass-edit moratorium policy (#366)` (with `Co-Authored-By` trailer)

## Phase 4: Integration Verification

- [x] 4.1 [VERIFY] Build green
  - **Do**: Run full project build to confirm no regression
  - **Files**: none
  - **Done when**: `npm run build` exits 0
  - **Verify**: `npm run build && echo BUILD_PASS`
  - **Commit**: None
  - _Requirements: AC-4.1_

- [x] 4.2 [VERIFY] Final self-test against current branch
  - **Do**: Re-run script one more time against the now-committed state to confirm zero post JSONs and exit 0 (proves PR self-passes)
  - **Files**: none
  - **Done when**: Exit 0 with count = 0
  - **Verify**: `node scripts/check-mass-edit.mjs --pr-body "" --base origin/main 2>&1 | grep -q "OK: 0" && echo FINAL_SELFTEST_PASS`
  - **Commit**: None
  - _Requirements: AC-4.2_

## Phase 5: Spec Scaffold Commit

- [x] 5.1 [COMMIT] Stage and commit spec artifacts
  - **Do**:
    1. Stage all 4 spec markdown files explicitly: `git add specs/issue-366-moratorium/research.md specs/issue-366-moratorium/requirements.md specs/issue-366-moratorium/design.md specs/issue-366-moratorium/tasks.md`
    2. `git status --short` — verify ONLY the 4 spec files staged (no .progress.md, no .ralph-state.json — those are gitignored or not tracked)
    3. Commit with HEREDOC message per design §7 commit #4
  - **Files**: staged: `specs/issue-366-moratorium/{research,requirements,design,tasks}.md`
  - **Done when**: Commit exists with exactly 4 files
  - **Verify**: `git log -1 --pretty=format:%s | grep -q "chore(spec): scaffold ralph spec artifacts for issue #366" && [ "$(git log -1 --name-only --pretty=format: | grep -c "^specs/issue-366-moratorium/.*\.md$")" -eq 4 ] && echo COMMIT4_PASS`
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #366` (with `Co-Authored-By` trailer)

## Notes

- **No `git add -A`** — every commit stages explicit paths.
- **No PR creation / push tasks** — out of scope per quick-mode prompt.
- **Self-passes own check** — this PR has zero post JSON modifications across all 4 commits combined; phase 4.2 proves it.
- **Commit independence** — design §7 ordering (script → workflow → docs → spec) keeps each commit individually revertible.
- **Forcing function** — workflow job name embeds `expires 2026-07-15` so the manual-cleanup deadline is visible on every PR run.
- All commits include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.

## Commit Plan (Summary)

| # | Phase | Subject | Staged Files |
|---|-------|---------|--------------|
| 1 | 1.4 | `feat(scripts): add mass-edit moratorium CI guardrail script (#366)` | `scripts/check-mass-edit.mjs` |
| 2 | 2.3 | `ci: add mass-edit moratorium check job to lockfile workflow (#366)` | `.github/workflows/lockfile-check.yml` |
| 3 | 3.3 | `docs(claude): document mass-edit moratorium policy (#366)` | `CLAUDE.md` |
| 4 | 5.1 | `chore(spec): scaffold ralph spec artifacts for issue #366` | 4 spec markdown files |
