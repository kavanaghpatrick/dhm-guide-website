---
spec: issue-246-hub-footer
phase: tasks
created: 2026-04-28
---

# Tasks: issue-246-hub-footer

Workflow: TRIVIAL/REFACTOR (script + bulk content edit, no greenfield POC). All tasks include explicit Verify commands. No VE startup/cleanup needed — `npm run build` is the propagation verification (Library/No-Tooling fallback: content-only change, no dev server).

## Phase 1: Script Implementation

- [x] 1.1 Create `scripts/add-hub-links.mjs` per design.md skeleton
  - **Do**:
    1. Create `/Users/patrickkavanagh/dhm-guide-website/scripts/add-hub-links.mjs` matching the Module Shape in `specs/issue-246-hub-footer/design.md` (~80 lines)
    2. ESM, `import { readdirSync, readFileSync, writeFileSync } from 'node:fs'` and `import { join } from 'node:path'` only (no new deps)
    3. Constants: `POSTS_DIR = 'src/newblog/data/posts'`, `SENTINEL = '<!-- hub-footer:auto -->'`, `HEADING = '## Continue Your Research'`, `FOOTER` template literal exactly per design.md "Footer Template (Verbatim)"
    4. Logic: read all `.json` from POSTS_DIR; for each: `JSON.parse` → if `content` empty → `skippedNoContent++`; else if `content.includes(SENTINEL) || content.includes(HEADING)` → `skippedHasFooter++`; else `post.content = content.trimEnd() + FOOTER` and (live mode) `writeFileSync(filePath, JSON.stringify(post, null, 2))` with NO trailing newline
    5. `--dry-run` flag (`process.argv.includes('--dry-run')`): when set, capture first 3 sample tails, never write
    6. Print summary: `${dryPrefix}Done: N updated, M skipped (had footer), K skipped (no content)`
  - **Files**: `scripts/add-hub-links.mjs` (create)
  - **Done when**: File exists; passes `node --check scripts/add-hub-links.mjs` (syntax OK); imports only Node built-ins
  - **Verify**: `node --check /Users/patrickkavanagh/dhm-guide-website/scripts/add-hub-links.mjs && grep -E "^import.*'node:" /Users/patrickkavanagh/dhm-guide-website/scripts/add-hub-links.mjs | wc -l | grep -qE "^[1-9]" && grep -L "from '[^n]" /Users/patrickkavanagh/dhm-guide-website/scripts/add-hub-links.mjs && echo PASS_1_1`
  - **Commit**: `feat(scripts): add idempotent hub-link footer script (#246)` — stage `scripts/add-hub-links.mjs` only via `git add scripts/add-hub-links.mjs`
  - _Requirements: AC-1, AC-2, NFR-1, NFR-2, NFR-3, NFR-4_
  - _Design: Module Shape, Idempotency Rules, Footer Template_

- [x] 1.2 [VERIFY] Dry-run produces expected output and writes nothing
  - **Do**:
    1. From repo root, run `node scripts/add-hub-links.mjs --dry-run`
    2. Check stdout contains `[dry-run] Done: 197 updated, 0 skipped (had footer), 0 skipped (no content)`
    3. Confirm working tree clean for `src/newblog/data/posts/`: `git status --porcelain src/newblog/data/posts/` returns empty
    4. Confirm script exits 0
  - **Files**: none (read-only verification)
  - **Done when**: Dry-run reports 197/0/0; no JSON files mutated
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && OUT=$(node scripts/add-hub-links.mjs --dry-run 2>&1) && echo "$OUT" | grep -q "\[dry-run\] Done: 197 updated, 0 skipped (had footer), 0 skipped (no content)" && [ -z "$(git status --porcelain src/newblog/data/posts/)" ] && echo PASS_1_2`
  - **Commit**: none (verification only)
  - _Requirements: AC-2_
  - _Design: Test Strategy → AC-2 dry-run_

## Phase 2: Live Run + Idempotency Proof

- [x] 2.1 Live run: append footer to all 197 post JSONs
  - **Do**:
    1. From repo root, run `node scripts/add-hub-links.mjs` (no flag = live mode per design.md)
    2. Verify stdout exact match: `Done: 197 updated, 0 skipped (had footer), 0 skipped (no content)`
    3. Confirm `git status --porcelain src/newblog/data/posts/ | wc -l` reports `197` (197 modified files)
  - **Files**: `src/newblog/data/posts/*.json` (197 files modified)
  - **Done when**: Script exit 0; 197 posts modified; output matches expected counts
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && OUT=$(node scripts/add-hub-links.mjs 2>&1) && echo "$OUT" | grep -qE "^Done: 197 updated, 0 skipped \(had footer\), 0 skipped \(no content\)$" && [ "$(git status --porcelain src/newblog/data/posts/ | wc -l | tr -d ' ')" = "197" ] && echo PASS_2_1`
  - **Commit**: `feat(content): add Continue Your Research footer to 197 blog posts (#246)` — stage all 197 modified posts via `git add src/newblog/data/posts/`
  - _Requirements: AC-1, AC-4, AC-9, AC-10_
  - _Design: Test Strategy → AC-4 live run_

- [x] 2.2 [VERIFY] Idempotency proof: re-run reports 0 updated, 197 skipped
  - **Do**:
    1. From repo root, re-run `node scripts/add-hub-links.mjs` immediately (live mode again)
    2. Confirm output exact match: `Done: 0 updated, 197 skipped (had footer), 0 skipped (no content)`
    3. Confirm working tree shows ZERO new diffs since 2.1's commit: `git status --porcelain src/newblog/data/posts/` returns empty (no further modifications beyond what was committed)
  - **Files**: none (verification only — should not mutate anything)
  - **Done when**: Re-run reports 0/197/0; no additional diffs introduced
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && OUT=$(node scripts/add-hub-links.mjs 2>&1) && echo "$OUT" | grep -qE "^Done: 0 updated, 197 skipped \(had footer\), 0 skipped \(no content\)$" && [ -z "$(git status --porcelain src/newblog/data/posts/)" ] && echo PASS_2_2`
  - **Commit**: none (verification only)
  - _Requirements: AC-3 (idempotency)_
  - _Design: Test Strategy → AC-3 idempotency proof_

- [x] 2.3 [VERIFY] Corpus contains footer in all 197 posts
  - **Do**:
    1. Count post JSONs containing the heading: `grep -l "Continue Your Research" src/newblog/data/posts/*.json | wc -l`
    2. Count post JSONs containing the sentinel: `grep -l "<!-- hub-footer:auto -->" src/newblog/data/posts/*.json | wc -l`
    3. Both counts must be 197
  - **Files**: none (read-only verification)
  - **Done when**: Both counts equal 197
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && H=$(grep -l "Continue Your Research" src/newblog/data/posts/*.json | wc -l | tr -d ' ') && S=$(grep -l "<!-- hub-footer:auto -->" src/newblog/data/posts/*.json | wc -l | tr -d ' ') && [ "$H" = "197" ] && [ "$S" = "197" ] && echo PASS_2_3`
  - **Commit**: none (verification only)
  - _Requirements: AC-4_
  - _Design: Test Strategy → AC-4 corpus update_

## Phase 3: Build + Prerender Propagation

- [x] 3.1 [VERIFY] `npm run build` exits 0 with all 197 modified JSONs
  - **Do**:
    1. From repo root, run `npm run build`
    2. Confirm exit code 0
    3. `validate-posts.js` (prebuild + build-start) must pass for all 197 posts (no JSON parse errors)
    4. Vite build completes; `prerender-blog-posts-enhanced.js` runs; `dist/never-hungover/` populated
  - **Files**: none (build artifacts in `dist/`, gitignored)
  - **Done when**: Build exits 0; no JSON validation errors; `dist/never-hungover/` contains slug subdirectories
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && npm run build > /tmp/issue-246-build.log 2>&1 && [ -d dist/never-hungover ] && [ "$(ls dist/never-hungover/ | wc -l | tr -d ' ')" -ge 197 ] && echo PASS_3_1 || (echo FAIL_3_1; tail -50 /tmp/issue-246-build.log; exit 1)`
  - **Commit**: none (verification only)
  - _Requirements: AC-8, NFR-5, NFR-6_
  - _Design: Test Strategy → AC-8 build green_

- [x] 3.2 [VERIFY] Prerendered HTML for 5 sample slugs contains heading + 4 hub anchors
  - **Do**:
    1. For each sample slug `dhm-dosage-guide-2025`, `hangxiety-complete-guide-2026-supplements-research`, `dhm-vs-zbiotics`, `flyby-recovery-review-2025`, `hangover-supplements-complete-guide-what-actually-works-2025`:
       a. `grep -c "Continue Your Research" dist/never-hungover/<slug>/index.html` must return >= 1
       b. `grep -oE 'href="/(guide|compare|reviews|research)"' dist/never-hungover/<slug>/index.html | sort -u | wc -l` must return 4 (all four unique hub hrefs present)
    2. All 5 samples must pass both checks
  - **Files**: none (read-only of build artifacts)
  - **Done when**: Each of 5 sample HTMLs contains the heading at least once AND has all 4 hub hrefs
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && PASS=1; for slug in dhm-dosage-guide-2025 hangxiety-complete-guide-2026-supplements-research dhm-vs-zbiotics flyby-recovery-review-2025 hangover-supplements-complete-guide-what-actually-works-2025; do F="dist/never-hungover/$slug/index.html"; H=$(grep -c "Continue Your Research" "$F" 2>/dev/null || echo 0); L=$(grep -oE 'href="/(guide|compare|reviews|research)"' "$F" 2>/dev/null | sort -u | wc -l | tr -d ' '); if [ "$H" -lt 1 ] || [ "$L" != "4" ]; then echo "FAIL slug=$slug heading=$H links=$L"; PASS=0; fi; done; [ "$PASS" = "1" ] && echo PASS_3_2`
  - **Commit**: none (verification only)
  - _Requirements: AC-5, AC-6, AC-7_
  - _Design: Test Strategy → AC-5 prerender propagation, AC-6 hub link presence_

## Phase 4: Final Integration Verify + Spec Commit

- [x] 4.1 [VERIFY] Final integration: idempotency + corpus + dist + diff cleanliness + 2nd build
  - **Do**:
    1. Re-run idempotency: `node scripts/add-hub-links.mjs` → must report `Done: 0 updated, 197 skipped (had footer), 0 skipped (no content)` and no further diffs
    2. Re-confirm corpus count: `grep -l "Continue Your Research" src/newblog/data/posts/*.json | wc -l` → 197
    3. Re-confirm 5 sample dist HTMLs each have heading + 4 hub hrefs (same logic as 3.2)
    4. Spot-check diff cleanliness for a single post by comparing it to the committed version on the branch:
       - Pick `src/newblog/data/posts/activated-charcoal-hangover.json`
       - Diff vs the branch's pre-2.1 state: `git show HEAD~1:src/newblog/data/posts/activated-charcoal-hangover.json > /tmp/issue-246-orig.json` (where HEAD~1 is the commit BEFORE 2.1's content commit on this branch)
       - Confirm the diff between the original and current contains exactly the appended footer markers and nothing else: pre/post content matches except `content` field gains `Continue Your Research` heading; no other field names appear in diff. Use Node script: `node -e "const a=JSON.parse(require('fs').readFileSync('/tmp/issue-246-orig.json','utf8'));const b=JSON.parse(require('fs').readFileSync('src/newblog/data/posts/activated-charcoal-hangover.json','utf8'));const ka=Object.keys(a).sort();const kb=Object.keys(b).sort();if(JSON.stringify(ka)!==JSON.stringify(kb))process.exit(11);for(const k of ka){if(k==='content')continue;if(JSON.stringify(a[k])!==JSON.stringify(b[k]))process.exit(12);}if(!b.content.endsWith(a.content.trimEnd().slice(-50)+b.content.slice(a.content.trimEnd().length))){/*sanity*/}if(!b.content.includes('## Continue Your Research'))process.exit(13);if(!b.content.includes('<!-- hub-footer:auto -->'))process.exit(14);if(b.content.indexOf(a.content.trimEnd())!==0)process.exit(15);console.log('DIFF_CLEAN_OK');"`
    5. Run `npm run build` a second time to confirm post-rerun idempotency does not break the build
  - **Files**: none (verification only; tmp file at `/tmp/issue-246-orig.json` cleaned up incidentally)
  - **Done when**: All 5 sub-checks pass: idempotent re-run; 197 corpus count; 5 dist samples valid; single-file diff is content-tail-only; second build exits 0
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && \
    OUT=$(node scripts/add-hub-links.mjs 2>&1) && echo "$OUT" | grep -qE "^Done: 0 updated, 197 skipped \(had footer\), 0 skipped \(no content\)$" && \
    [ -z "$(git status --porcelain src/newblog/data/posts/)" ] && \
    [ "$(grep -l 'Continue Your Research' src/newblog/data/posts/*.json | wc -l | tr -d ' ')" = "197" ] && \
    PASS=1; for slug in dhm-dosage-guide-2025 hangxiety-complete-guide-2026-supplements-research dhm-vs-zbiotics flyby-recovery-review-2025 hangover-supplements-complete-guide-what-actually-works-2025; do F="dist/never-hungover/$slug/index.html"; H=$(grep -c "Continue Your Research" "$F" 2>/dev/null || echo 0); L=$(grep -oE 'href="/(guide|compare|reviews|research)"' "$F" 2>/dev/null | sort -u | wc -l | tr -d ' '); [ "$H" -ge 1 ] && [ "$L" = "4" ] || PASS=0; done; [ "$PASS" = "1" ] && \
    git show HEAD~1:src/newblog/data/posts/activated-charcoal-hangover.json > /tmp/issue-246-orig.json 2>/dev/null && \
    node -e "const a=JSON.parse(require('fs').readFileSync('/tmp/issue-246-orig.json','utf8'));const b=JSON.parse(require('fs').readFileSync('src/newblog/data/posts/activated-charcoal-hangover.json','utf8'));const ka=Object.keys(a).sort();const kb=Object.keys(b).sort();if(JSON.stringify(ka)!==JSON.stringify(kb))process.exit(11);for(const k of ka){if(k==='content')continue;if(JSON.stringify(a[k])!==JSON.stringify(b[k]))process.exit(12);}if(!b.content.includes('## Continue Your Research'))process.exit(13);if(!b.content.includes('<!-- hub-footer:auto -->'))process.exit(14);if(b.content.indexOf(a.content.trimEnd())!==0)process.exit(15);console.log('DIFF_CLEAN_OK');" && \
    npm run build > /tmp/issue-246-build2.log 2>&1 && \
    echo PASS_4_1`
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #246` — stage `specs/issue-246-hub-footer/tasks.md` only via `git add specs/issue-246-hub-footer/tasks.md` (`.ralph-state.json` and `.progress.md` are gitignored per project convention)
  - _Requirements: AC-3, AC-4, AC-5, AC-6, AC-8, AC-9_
  - _Design: Test Strategy (full sweep), PR Strategy commit #3_

## Notes

- **Branch**: All work on `cleanup/issue-246-hub-footer` (off main). Branch is set at startup; do NOT push or open a PR — user handles that step.
- **Staging discipline**: NEVER use `git add -A` or `git add .` — working tree contains unrelated WIP under `docs/`, `scripts/r3-*`, `tests/*` (visible in git status). Stage only the explicit paths called out per task: `scripts/add-hub-links.mjs` (1.1), `src/newblog/data/posts/` (2.1), `specs/issue-246-hub-footer/tasks.md` (4.1).
- **Three commits total** (chronological): (1) script in 1.1, (2) 197 post JSONs in 2.1, (3) tasks.md in 4.1. All [VERIFY] tasks (1.2, 2.2, 2.3, 3.1, 3.2) are read-only and create no commits.
- **Verification rationale**: Script behavior is verified by [VERIFY] commands and `validate-posts.js` (prebuild safety net). No unit tests added — mirrors precedent (`cluster-formalize.mjs`, `orphan-post-link-injector.mjs` have none). Pattern #11 verified at 3.2: footer in `content` field reaches prerendered HTML through `scripts/prerender-blog-posts-enhanced.js:311` micromark pipeline.
- **No VE startup/cleanup tasks**: Library/no-tooling fallback applies — content-only change, no dev server required. `npm run build` IS the propagation verification (tasks 3.1 and 3.2 cover the build artifact end-to-end check).
- **Rollback** (if any verify fails post-2.1): `git restore src/newblog/data/posts/` reverts in seconds; no DB/cache state to clean up.
