---
spec: issue-345-residual
phase: tasks
created: 2026-04-28
mode: quick
---

# Tasks: issue-345-residual

## Phase 1: Make It Work

Focus: Two single-field JSON edits, one CLAUDE.md insertion, one spec-redirect note. Data + docs only — no code logic changes.

### Group 1: Meta description rewrites

- [x] 1.1 Edit `dhm-randomized-controlled-trials.json` metaDescription field
  - **Do**:
    1. Open `src/newblog/data/posts/dhm-randomized-controlled-trials.json`
    2. Replace ONLY the `metaDescription` field value with verbatim text from design.md D2: `"Breakthrough 2024 study proves DHM cuts hangover severity by 70%. See the peer-reviewed results from Foods journal that explain exactly how it works."`
    3. Confirm `title`, `excerpt`, `quickAnswer`, and all other fields are untouched
    4. Confirm JSON is still valid: `node -e "JSON.parse(require('fs').readFileSync('src/newblog/data/posts/dhm-randomized-controlled-trials.json','utf8'))"`
  - **Files**: `src/newblog/data/posts/dhm-randomized-controlled-trials.json`
  - **Done when**: `metaDescription` matches verbatim text (149 chars); JSON valid; no other fields changed
  - **Verify**: `node -e "const p=JSON.parse(require('fs').readFileSync('src/newblog/data/posts/dhm-randomized-controlled-trials.json','utf8')); if(p.metaDescription.length===149 && p.metaDescription.startsWith('Breakthrough 2024')) console.log('1.1_PASS'); else process.exit(1)"`
  - **Commit**: `fix(seo): rewrite #143 meta description per issue acceptance criteria`
  - **Stage**: `src/newblog/data/posts/dhm-randomized-controlled-trials.json` only
  - _Requirements: AC-1_

- [x] 1.2 Edit `nac-vs-dhm-...2025.json` metaDescription field
  - **Do**:
    1. Open `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`
    2. Replace ONLY the `metaDescription` field value with verbatim text from design.md D2: `"NAC vs DHM: Which protects your liver better? Complete comparison reveals when to use each (and why combining them may be the smartest choice)."`
    3. Confirm `title`, `excerpt`, `quickAnswer`, and all other fields are untouched
    4. Confirm JSON is still valid: `node -e "JSON.parse(require('fs').readFileSync('src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json','utf8'))"`
  - **Files**: `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`
  - **Done when**: `metaDescription` matches verbatim text (143 chars); JSON valid; no other fields changed
  - **Verify**: `node -e "const p=JSON.parse(require('fs').readFileSync('src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json','utf8')); if(p.metaDescription.length===143 && p.metaDescription.startsWith('NAC vs DHM')) console.log('1.2_PASS'); else process.exit(1)"`
  - **Commit**: `fix(seo): rewrite #151 meta description per issue acceptance criteria`
  - **Stage**: `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` only
  - _Requirements: AC-3_

- [x] 1.3 [VERIFY] Verify both meta descriptions and confirm titles untouched
  - **Do**:
    1. Print length and value for both metaDescriptions
    2. Diff against main to confirm `title` is NOT in either changeset
    3. Run JSON validity check on both files
  - **Verify**:
    ```bash
    set -e
    for slug in dhm-randomized-controlled-trials nac-vs-dhm-which-antioxidant-better-liver-protection-2025; do
      node -e "const p=JSON.parse(require('fs').readFileSync('src/newblog/data/posts/$slug.json','utf8')); console.log('$slug:', p.metaDescription.length, 'chars'); console.log('  text:', p.metaDescription);"
    done
    git diff main..HEAD -- src/newblog/data/posts/dhm-randomized-controlled-trials.json | grep '"title":' && { echo "FAIL: title was changed in dhm-randomized-controlled-trials.json"; exit 1; } || echo "title untouched in dhm-randomized-controlled-trials.json"
    git diff main..HEAD -- src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json | grep '"title":' && { echo "FAIL: title was changed in nac-vs-dhm-...json"; exit 1; } || echo "title untouched in nac-vs-dhm-...json"
    echo "1.3_PASS"
    ```
  - **Done when**: Both metas print at 149/143 chars with correct text; both `title` greps return non-zero (no title diff); script ends in `1.3_PASS`
  - **Commit**: None (verification only)
  - _Requirements: AC-2, AC-4, AC-5_

### Group 2: Document spec artifact commit policy

- [x] 2.1 Insert "Spec Artifact Commit Policy" section into CLAUDE.md
  - **Do**:
    1. Open `CLAUDE.md`
    2. Locate the `---` divider that follows the `## 🔄 Continuous Improvement` section (immediately before `## ⚠️ Red Flags (STOP and Simplify)`)
    3. Insert a new `## Spec Artifact Commit Policy` section between that `---` and the `## ⚠️ Red Flags` heading, using the exact 14-line content block from design.md File 3:
       ```markdown
       ## Spec Artifact Commit Policy

       For each `specs/issue-*/` directory, commit:
       - `research.md`
       - `requirements.md`
       - `design.md`
       - `tasks.md`

       Do NOT commit:
       - `.progress.md` (gitignored — working notes that change frequently)
       - `.ralph-state.json` (gitignored — runtime state)

       This ensures spec history is reviewable in PR while runtime artifacts stay out of the diff.

       ---
       ```
    4. Confirm the `## ⚠️ Red Flags (STOP and Simplify)` heading still appears immediately after the new section's `---` divider
  - **Files**: `CLAUDE.md`
  - **Done when**: New section is present at correct location; existing sections (Continuous Improvement, Red Flags) untouched in content
  - **Verify**: `grep -A 12 "^## Spec Artifact Commit Policy" CLAUDE.md | grep -q "tasks.md" && grep -A 14 "^## Spec Artifact Commit Policy" CLAUDE.md | grep -q "ralph-state.json" && echo 2.1_PASS`
  - **Commit**: `docs(claude): document spec artifact commit policy (#345 B1)`
  - **Stage**: `CLAUDE.md` only
  - _Requirements: AC-7, AC-8_

- [x] 2.2 [VERIFY] Confirm CLAUDE.md policy section is canonical
  - **Do**:
    1. Print the full new section from CLAUDE.md
    2. Confirm all 4 artifact filenames and both gitignored filenames appear
  - **Verify**:
    ```bash
    set -e
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q "research.md" || { echo "FAIL: research.md missing"; exit 1; }
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q "requirements.md" || { echo "FAIL: requirements.md missing"; exit 1; }
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q "design.md" || { echo "FAIL: design.md missing"; exit 1; }
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q "tasks.md" || { echo "FAIL: tasks.md missing"; exit 1; }
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q ".progress.md" || { echo "FAIL: .progress.md missing"; exit 1; }
    grep -A 15 "## Spec Artifact Commit Policy" CLAUDE.md | grep -q ".ralph-state.json" || { echo "FAIL: .ralph-state.json missing"; exit 1; }
    echo "2.2_PASS"
    ```
  - **Done when**: All 6 filenames present in section; ends in `2.2_PASS`
  - **Commit**: None (verification only)
  - _Requirements: AC-7, AC-8_

### Group 3: Build verification

- [x] 3.1 [VERIFY] Run `npm run build` and confirm prerendered meta tags
  - **Do**:
    1. Run `npm run build`; expect exit code 0
    2. Grep both prerendered HTML files for the new meta description text
  - **Verify**:
    ```bash
    set -e
    npm run build
    DHM_META=$(grep -oE 'name="description" content="[^"]*"' dist/never-hungover/dhm-randomized-controlled-trials/index.html | head -1)
    NAC_META=$(grep -oE 'name="description" content="[^"]*"' dist/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025/index.html | head -1)
    echo "DHM: $DHM_META"
    echo "NAC: $NAC_META"
    echo "$DHM_META" | grep -q "Breakthrough 2024" || { echo "FAIL: DHM prerendered meta wrong"; exit 1; }
    echo "$NAC_META" | grep -q "Which protects your liver better" || { echo "FAIL: NAC prerendered meta wrong"; exit 1; }
    echo "3.1_PASS"
    ```
  - **Done when**: Build exits 0; both prerendered HTML files contain new meta text
  - **Commit**: None (verification only)
  - _Requirements: AC-5, AC-6_

### Group 4: Spec scaffold + redirect note

- [x] 4.1 Confirm A3+A4 redirect note already present in this tasks.md (this file)
  - **Do**:
    1. Confirm the `## Notes — A3 + A4 Redirect` section at the end of this file (`specs/issue-345-residual/tasks.md`) is present and accurate
    2. Stage all four spec artifacts together (research.md, requirements.md, design.md, tasks.md) per the new policy in CLAUDE.md
  - **Files**: `specs/issue-345-residual/research.md`, `specs/issue-345-residual/requirements.md`, `specs/issue-345-residual/design.md`, `specs/issue-345-residual/tasks.md`
  - **Done when**: All 4 spec artifacts staged; redirect note prominent at end of tasks.md
  - **Verify**: `grep -q "A3 + A4 Redirect" specs/issue-345-residual/tasks.md && echo 4.1_PASS`
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #345`
  - **Stage**: `specs/issue-345-residual/research.md`, `specs/issue-345-residual/requirements.md`, `specs/issue-345-residual/design.md`, `specs/issue-345-residual/tasks.md` (explicit paths only — practicing the new policy)
  - _Requirements: AC-9_

- [x] 4.2 [VERIFY] Confirm A3+A4 redirect note is present and complete
  - **Do**: Grep tasks.md for the redirect note heading and key body content
  - **Verify**:
    ```bash
    set -e
    grep -A1 "A3 + A4 Redirect" specs/issue-345-residual/tasks.md
    grep -q "A3 + A4 Redirect" specs/issue-345-residual/tasks.md || { echo "FAIL: redirect heading missing"; exit 1; }
    grep -q "cleanup/issue-209-best-for-buttons" specs/issue-345-residual/tasks.md || { echo "FAIL: redirect target branch not named"; exit 1; }
    grep -q "bestForFilters" specs/issue-345-residual/tasks.md || { echo "FAIL: redirect rationale missing"; exit 1; }
    echo "4.2_PASS"
    ```
  - **Done when**: All 3 grep checks pass; ends in `4.2_PASS`
  - **Commit**: None (verification only)
  - _Requirements: AC-9_

## Notes — A3 + A4 Redirect

Per research.md finding: `bestForFilters` array (target of A3 match-count badges + A4 regex expansion) was added on `cleanup/issue-209-best-for-buttons` and does NOT exist on main. This branch off main cannot edit code that doesn't exist here.

**Action**: amend the #209 branch with two follow-up commits (one for A3, one for A4) BEFORE merging it. OR ship #209 as-is and file a focused #345-followup issue for A3 + A4 specifically.

Decision deferred to user at merge time.

## Commit Order Summary

| # | After task | Commit message | Stages |
|---|---|---|---|
| 1 | 1.1 | `fix(seo): rewrite #143 meta description per issue acceptance criteria` | `src/newblog/data/posts/dhm-randomized-controlled-trials.json` |
| 2 | 1.2 | `fix(seo): rewrite #151 meta description per issue acceptance criteria` | `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` |
| 3 | 2.1 | `docs(claude): document spec artifact commit policy (#345 B1)` | `CLAUDE.md` |
| 4 | 4.1 | `chore(spec): scaffold ralph spec artifacts for issue #345` | `specs/issue-345-residual/{research,requirements,design,tasks}.md` (4 files explicit) |

Total expected commits: **4**.

User handles `git push` and PR creation; PR body must explicitly call out A3+A4 redirect to `cleanup/issue-209-best-for-buttons`.
