---
spec: issue-365-dcni-bucketing
phase: tasks
created: 2026-04-29
mode: quick
issue: 365
parent_issue: 362
---

# Tasks: issue-365-dcni-bucketing

Workflow: GREENFIELD POC-first (new tooling). Granularity: fine.
Total file impact: 1 script + 1 fixture + 3 sample outputs + 4 spec artifacts.
Hard constraint: NO modifications to existing post JSONs, sitemap.xml, or vercel.json.

---

## Phase 1: Make It Work (POC) — Core script

### Group 1: `scripts/dcni-bucket.mjs`

- [x] 1.1 Create script skeleton: ESM bootstrap + argv parsing
  - **Do**:
    1. Create `scripts/dcni-bucket.mjs` with shebang + ESM imports (`node:fs`, `node:path`, `node:child_process`, `node:url`)
    2. Set up `__filename` / `__dirname` / `ROOT` / `POSTS_DIR` / `CLUSTER_PATH` / `ORPHAN_PATH` per design.md module shape (lines 77-87)
    3. Add `URL_PREFIX`, `OFF_STRATEGY_PATTERNS`, `EXPLICIT_KEEPS`, `KNOWN_MERGE_GROUPS` constants (design.md lines 91-127)
    4. Implement `parseArgs(argv)` per design.md lines 131-144 (`--gsc-csv` required; `--dry-run`, `--output-dir`, `--threshold-impressions`, `--delete-threshold`, `--verbose` optional)
    5. Add empty `main()` that calls `parseArgs(process.argv.slice(2))` and logs args; invoke `main()`
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: File exists; runs `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run` without crashing (will fail later steps but not at parse stage)
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None (intermediate)
  - _Requirements: AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5_

- [x] 1.2 Implement CSV parsing (D1: stdlib quote-aware tokenizer)
  - **Do**:
    1. Add `parseCsv(filePath)` function per design.md lines 148-171 (BOM strip, line-split on `\r?\n`, header validation against `['URL', 'Impressions', 'Clicks', 'CTR', 'Position']` with `Top pages` alias)
    2. Add `tokenizeRow(line)` quote-aware splitter per design.md lines 173-184
    3. Throw clear error on header drift: `GSC CSV header drift: missing "X". Got: ...`
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: Function exported within module; ready to consume in main
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None
  - _Requirements: AC-2.4, AC-2.5, NFR-6, NFR-7_

- [x] 1.3 Implement post JSON loading
  - **Do**:
    1. Add `readJSON(p)` helper per design.md line 188
    2. Add `loadPosts()` per design.md lines 190-207: enumerate `POSTS_DIR`, parse each, build `Map<slug, {slug, title, content, wordCount, dateModified, tags}>`
    3. Word count via `content.split(/\s+/).filter(Boolean).length` (matches `analyze-internal-links.js` convention per research §10)
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: `loadPosts()` returns Map of all 202 posts when invoked from main
  - **Verify**: Add temporary `console.log(loadPosts().size)` in main, run, expect output ≥197 (202 currently in repo); revert log after
  - **Commit**: None
  - _Requirements: AC-2.1_

- [x] 1.4 Implement cluster membership computation
  - **Do**:
    1. Add `loadClusterMembers()` per design.md lines 209-219: read `CLUSTER_PATH`, iterate `cfg.clusters`, build `Map<slug, {cluster, role}>` where role is `'pillar'` or `'spoke'`
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: Function returns Map with 60 entries (8 clusters × avg 7.5 slugs)
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None
  - _Requirements: AC-2.2, AC-3.6_

- [x] 1.5 [VERIFY] Quality checkpoint after data loading: lint pass
  - **Do**: Run `npm run lint -- --no-fix scripts/dcni-bucket.mjs 2>&1 | head -20` (project uses eslint per package.json)
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Done when**: No syntax errors; script parseable
  - **Commit**: None

- [x] 1.6 Implement inbound link computation (D5: O(N) regex pass)
  - **Do**:
    1. Add `buildInboundIndex(posts)` per design.md lines 223-235: walk all post `content` fields, regex `/\(\/never-hungover\/([a-z0-9-]+)\)/g`, accumulate per-target counts
    2. Skip self-references (`if (target === post.slug) continue`)
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: Function returns `Map<slug, count>` with realistic counts
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None
  - _Requirements: AC-2.3_

- [x] 1.7 Implement git first-commit date lookup
  - **Do**:
    1. Add `loadFirstCommitDates(slugs)` per design.md lines 239-251: per-slug `execSync('git log --diff-filter=A --format=%ai --reverse -- "src/newblog/data/posts/${slug}.json" | head -1', { cwd: ROOT, encoding: 'utf8' })`, parse to Date
    2. Wrap in try/catch (untracked file → no entry; let `age` flow through as null)
    3. Add `ageInDays(date)` helper per design.md lines 253-256 (returns null when date is null)
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: Function returns `Map<slug, Date>` for tracked posts
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None

- [x] 1.8 Implement decision tree (9 strict-ordered steps per AC-3.6)
  - **Do**:
    1. Add `decide(ctx)` per design.md lines 260-301 implementing the 9-step decision tree exactly:
       - Step 1: cluster member → SAVE
       - Step 2: Italian allowlist → SAVE
       - Step 3: KNOWN_MERGE_GROUPS sibling (excluding mergeTarget) → MERGE
       - Step 4: impressions ≥ threshold → SAVE
       - Step 5: inboundLinks ≥ 3 → SAVE
       - Step 6: position ≤ 50 AND impressions > 0 → SAVE
       - Step 7: off-strategy + ≤ deleteThreshold + 0 inbound + age > 90d → DELETE
       - Step 8: off-strategy but ambiguous → REVIEW
       - Step 9: catch-all → REVIEW
    2. Each return: `{bucket, reason, ...optionalFields}`
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: Function compiles and matches design.md decision-tree section exactly
  - **Verify**: `grep -c "return { bucket" scripts/dcni-bucket.mjs` returns ≥9
  - **Commit**: None
  - _Requirements: AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, AC-3.6, AC-3.7_

- [x] 1.9 Implement output writers + main() wire-up
  - **Do**:
    1. Implement `main()` per design.md lines 305-384: call all loaders, build `gscBySlug` Map, classify non-blog URLs, iterate posts calling `decide()`, populate `buckets` object
    2. Detect `MISSING` bucket: GSC slugs without post JSON
    3. Build `summary` + `output` object per AC-4.1 shape
    4. If `--dry-run`: `console.log(JSON.stringify(summary, null, 2))` and return
    5. Else: `mkdirSync` outDir; write `buckets.json` (2-space indent + `\n`), `buckets.md`, `README.md`
    6. Add `renderMarkdown(output)` helper: emit sections per bucket with markdown table `| slug | impressions | reason | wordCount |` per AC-4.2
    7. Add `renderReadme()` helper: emit deployment-gating warning, moratorium reference (#366), decision-tree summary, instructions for re-running with real GSC data
  - **Files**: `scripts/dcni-bucket.mjs`
  - **Done when**: `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run` exits 0 (after fixture exists)
  - **Verify**: `node -c scripts/dcni-bucket.mjs && echo SYNTAX_OK`
  - **Commit**: None
  - _Requirements: AC-4.1, AC-4.2, AC-4.3, AC-4.4_

### Group 2: Fixture CSV

- [x] 2.1 Create `data/gsc-pages-fixture.csv`
  - **Do**:
    1. Verify `data/` directory exists; create if missing (`mkdir -p data`)
    2. Write `data/gsc-pages-fixture.csv` with exact 18 rows from design.md lines 426-446 (header `URL,Impressions,Clicks,CTR,Position` + 17 data rows + 1 non-blog `/guide` URL)
    3. Include all category coverage: cluster pillar (dhm-dosage), cluster spoke (activated-charcoal), cluster spoke high-traffic (alcohol-eye-health), MERGE group (4 cultural-drinking siblings), Italian allowlist, off-strategy DELETE candidates (business-dinner, bachelor, executive, quantum, adaptogenic), cluster-overrides-off-strategy (advanced-liver-detox), missing post (`nonexistent-slug-foo`), non-blog (`/guide`)
  - **Files**: `data/gsc-pages-fixture.csv`
  - **Done when**: File exists with exactly 19 lines (header + 18 data rows)
  - **Verify**: `wc -l data/gsc-pages-fixture.csv | awk '{print ($1 >= 18) ? "PASS" : "FAIL: " $1 " lines"}'`
  - **Commit**: None
  - _Requirements: AC-5.1, AC-5.2_

- [x] 2.2 [VERIFY] Run script against fixture; confirm deterministic counts
  - **Do**:
    1. Run dry-run: `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run`
    2. Pipe summary to JSON parser; assert `save >= 2`, `delete >= 1`, `review >= 0`, `merge` exists
    3. Run twice and diff to confirm determinism (excluding `generatedAt`)
  - **Files**: (none)
  - **Done when**: Dry-run exits 0 AND summary counts meet AC-5.2 thresholds
  - **Verify**:
    ```bash
    node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run | python3 -c "import json,sys; s=json.load(sys.stdin); assert s['save']>=2, s; assert s['delete']>=1, s; assert s['review']>=0, s; print('PASS counts:', s)"
    ```
  - **Commit**: None
  - _Requirements: AC-5.2, AC-5.3, AC-5.4, NFR-3, NFR-4_

### Group 3: Sample output files

- [x] 3.1 Generate sample buckets.json + buckets.md
  - **Do**:
    1. Run full output: `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --output-dir docs/dcni-2026-04-29`
    2. Confirm `docs/dcni-2026-04-29/buckets.json` and `docs/dcni-2026-04-29/buckets.md` exist
  - **Files**: `docs/dcni-2026-04-29/buckets.json`, `docs/dcni-2026-04-29/buckets.md`
  - **Done when**: Both files exist; JSON is parseable; MD has bucket sections
  - **Verify**:
    ```bash
    test -f docs/dcni-2026-04-29/buckets.json && test -f docs/dcni-2026-04-29/buckets.md && python3 -c "import json; json.load(open('docs/dcni-2026-04-29/buckets.json'))" && echo PASS
    ```
  - **Commit**: None
  - _Requirements: AC-4.1, AC-4.2_

- [x] 3.2 Verify README.md content (deployment-gating warning)
  - **Do**:
    1. Verify `docs/dcni-2026-04-29/README.md` was emitted by step 1.9 `renderReadme()`
    2. Confirm it contains: (a) "DECISIONS ONLY" or equivalent, (b) reference to #366 moratorium, (c) instructions for re-running with real GSC data, (d) reminder that mid-July 2026 is the deployment gate
    3. If renderReadme content is insufficient, edit `scripts/dcni-bucket.mjs` `renderReadme()` to include all 4 elements; re-run step 3.1
  - **Files**: `docs/dcni-2026-04-29/README.md` (regenerated by script if needed)
  - **Done when**: README.md exists and contains all 4 required elements
  - **Verify**:
    ```bash
    grep -qi "decisions only\|do not deploy" docs/dcni-2026-04-29/README.md && grep -q "#366\|moratorium" docs/dcni-2026-04-29/README.md && grep -qi "re-run\|gsc" docs/dcni-2026-04-29/README.md && echo PASS
    ```
  - **Commit**: None

- [x] 3.3 [VERIFY] All 3 output files committed; buckets.md has correct sections
  - **Do**:
    1. Verify all 3 files exist in `docs/dcni-2026-04-29/`
    2. Verify `buckets.md` contains markdown sections for all 4 buckets (Save, Merge, Delete, Review)
  - **Files**: (none — verification only)
  - **Done when**: All 3 files exist; buckets.md contains all 4 bucket section headers
  - **Verify**:
    ```bash
    test -f docs/dcni-2026-04-29/buckets.json && test -f docs/dcni-2026-04-29/buckets.md && test -f docs/dcni-2026-04-29/README.md && grep -qi "## save\|^# save\|### save" docs/dcni-2026-04-29/buckets.md && grep -qi "merge" docs/dcni-2026-04-29/buckets.md && grep -qi "delete" docs/dcni-2026-04-29/buckets.md && grep -qi "review" docs/dcni-2026-04-29/buckets.md && echo PASS
    ```
  - **Commit**: None
  - _Requirements: AC-4.1, AC-4.2_

---

## Phase 2: Build + integration verify

### Group 4: Side-effect & build checks

- [x] 4.1 [VERIFY] `npm run build` exits 0
  - **Do**: Run `npm run build` and capture exit code
  - **Verify**:
    ```bash
    npm run build > /tmp/build-output-365.log 2>&1 && echo PASS_BUILD || (tail -50 /tmp/build-output-365.log && echo FAIL_BUILD && exit 1)
    ```
  - **Done when**: Build exits 0 (script is not in build chain; just confirm nothing else broke)
  - **Commit**: None
  - _Requirements: AC-6.1_

- [x] 4.2 [VERIFY] Zero side effects: only new files staged; no modifications to tracked code
  - **Do**:
    1. Run `git status --porcelain` and inspect output
    2. Confirm no `M ` (modified) entries for any tracked file
    3. Confirm no entries for `src/newblog/data/posts/`, `public/sitemap.xml`, `vercel.json`
  - **Verify**:
    ```bash
    git status --porcelain | grep -E "^( M|MM|M |AM)" | grep -E "(src/newblog/data/posts|public/sitemap\.xml|vercel\.json)" && echo "FAIL: forbidden modifications" && exit 1 || echo PASS_NO_MUTATIONS
    ```
  - **Done when**: No modifications to tracked code outside the new spec/script/fixture/output files
  - **Commit**: None
  - _Requirements: AC-6.2, AC-6.3, FR-7_

- [x] 4.3 Commit 1: feature script + fixture + sample outputs
  - **Do**:
    1. Stage explicit paths only:
       ```bash
       git add scripts/dcni-bucket.mjs data/gsc-pages-fixture.csv docs/dcni-2026-04-29/buckets.json docs/dcni-2026-04-29/buckets.md docs/dcni-2026-04-29/README.md
       ```
    2. Verify staged paths with `git diff --cached --name-only`
    3. Confirm exactly 5 files staged; no other modifications included
    4. Commit with HEREDOC body:
       ```bash
       git commit -m "$(cat <<'EOF'
       feat(scripts): add DCNI Save/Merge/Delete bucketing script + fixture (#365)

       Adds scripts/dcni-bucket.mjs (ESM, stdlib only) that joins a GSC CSV
       export against post JSONs, cluster-config.json, orphan-injection-plan.json,
       computed inbound body links, and git first-commit dates to emit a
       deterministic Save/Merge/Delete/Review decision per slug.

       Outputs: docs/dcni-2026-04-29/{buckets.json, buckets.md, README.md}.
       Includes data/gsc-pages-fixture.csv (18 rows) for offline testing.

       Decisions only - no deletions ship from this PR. Deployment is gated on
       (a) real GSC export and (b) Action 4 moratorium expiry mid-July 2026
       per #366. README in docs/ states this gate explicitly.

       Closes part of #362 recovery plan (DCNI Action 3 tooling).

       Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
       EOF
       )"
       ```
  - **Files**: (commit only)
  - **Verify**:
    ```bash
    git log -1 --format='%s' | grep -q "^feat(scripts): add DCNI" && git log -1 --format='%(trailers:key=Co-Authored-By)' | grep -q "Claude Opus" && echo PASS_COMMIT_1
    ```
  - **Done when**: Commit 1 lands with correct subject + Co-Authored-By trailer; only the 5 specified files staged
  - **Commit**: `feat(scripts): add DCNI Save/Merge/Delete bucketing script + fixture (#365)`

---

## Phase 3: Spec scaffold

### Group 5: Stage spec artifacts

- [ ] 5.1 Commit 2: stage spec markdown files
  - **Do**:
    1. Stage explicit paths only:
       ```bash
       git add specs/issue-365-dcni-bucketing/research.md specs/issue-365-dcni-bucketing/requirements.md specs/issue-365-dcni-bucketing/design.md specs/issue-365-dcni-bucketing/tasks.md
       ```
    2. Verify exactly 4 spec files staged: `git diff --cached --name-only`
    3. Confirm `.progress.md` and `.ralph-state.json` are NOT staged
    4. Commit with HEREDOC body:
       ```bash
       git commit -m "$(cat <<'EOF'
       chore(spec): scaffold ralph spec artifacts for issue #365

       Captures the spec workflow trail (research, requirements, design, tasks)
       for the DCNI bucketing tooling that ships as feat(scripts) in the prior
       commit. No code changes; documentation only.

       Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
       EOF
       )"
       ```
  - **Files**: (commit only)
  - **Verify**:
    ```bash
    git log -1 --format='%s' | grep -q "^chore(spec): scaffold ralph" && git log -1 --format='%(trailers:key=Co-Authored-By)' | grep -q "Claude Opus" && git log -1 --name-only --format='' | grep -E "^specs/issue-365-dcni-bucketing/(research|requirements|design|tasks)\.md$" | wc -l | awk '{print ($1 == 4) ? "PASS" : "FAIL: " $1}'
    ```
  - **Done when**: Commit 2 lands with correct subject + Co-Authored-By trailer; exactly 4 spec markdown files staged
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #365`

---

## Notes

- **POC shortcuts taken**:
  - No unit-test framework added (project has none); verification = fixture run + assertion script
  - `renderMarkdown` and `renderReadme` are deterministic string emitters, not templating system
  - `loadFirstCommitDates` invokes `git log` per-file (~200 invocations); acceptable per NFR-3 (<5s wall-clock)
- **Production TODOs**:
  - None — script is shipping-ready as designed
  - Future PR will consume `buckets.json` to ship 410s/301s after moratorium expiry mid-July 2026 (per #366)
- **Hard constraints enforced**:
  - Zero modifications to `src/newblog/data/posts/*.json`
  - Zero modifications to `public/sitemap.xml`
  - Zero modifications to `vercel.json`
  - Verified by 4.2 [VERIFY] step
- **Determinism (NFR-4)**:
  - Sole non-deterministic field is `generatedAt` ISO timestamp; design.md verification commands exclude it from byte-diff
  - Fixture-driven decisions are deterministic given fixed inputs
- **Commit count**: 2 (matches design.md PR strategy)
  1. `feat(scripts): add DCNI Save/Merge/Delete bucketing script + fixture (#365)` — script + fixture + sample outputs
  2. `chore(spec): scaffold ralph spec artifacts for issue #365` — spec markdown files
