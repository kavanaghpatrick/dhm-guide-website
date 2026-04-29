---
spec: issue-190-research-expansion
phase: tasks
created: 2026-04-28
mode: quick
granularity: fine
---

# Tasks: issue-190-research-expansion

Workflow: TDD (BUG-FIX-adjacent / refactor + extension). Quality checkpoint every 2-3 tasks.
Discovered commands (research.md "Quality Commands"): `npm run build`, `npm run lint`, `npm run verify:z-classes`. No test runner.
PR strategy: 6 commits across 6 logical units (per design.md PR Strategy + spec scaffold).

---

## Group 1: Helper modules (no UI yet, no schema yet)

- [x] 1.1 Create `src/utils/citationFormatter.js` with `formatAPA(study)`
  - **Do**:
    1. Create `src/utils/citationFormatter.js` per design.md "Component 1" code block exactly (formatAPA + formatAuthors).
    2. Export `formatAPA` (named export). Internal helper `formatAuthors` stays unexported.
    3. JSDoc per design.md: document pragmatic "first 3 + et al." truncation deviation from strict APA-7.
  - **Files**: `src/utils/citationFormatter.js` (new)
  - **Done when**: File exists; default Node ESM import works; `formatAPA` exported.
  - **Verify**: `node --input-type=module -e "import('./src/utils/citationFormatter.js').then(m => { if (typeof m.formatAPA !== 'function') process.exit(1); console.log('FORMATAPA_OK'); })"`
  - **Commit**: None yet (paired with 1.2 for first commit)
  - _Requirements: FR-9_
  - _Design: Component 1, Decision 2_

- [x] 1.2 Add `generateScholarlyArticleSchema(study)` export to `src/utils/structuredDataHelpers.js`
  - **Do**:
    1. Open `src/utils/structuredDataHelpers.js` (existing file with `generateProductSchema`/`generateArticleSchema`/etc.).
    2. Append new export `generateScholarlyArticleSchema` per design.md "Component 2" code block exactly.
    3. Match existing arrow-function style (`export const generate{X}Schema = (...) => ({...})`).
    4. Handle authors as string OR array (per the `Array.isArray` branch in design).
    5. Conditionally include `identifier` (PMID string OR DOI PropertyValue) and `isPartOf` (PublicationVolume) only when fields present.
  - **Files**: `src/utils/structuredDataHelpers.js`
  - **Done when**: New export present; existing exports untouched; file still imports cleanly.
  - **Verify**: `node --input-type=module -e "import('./src/utils/structuredDataHelpers.js').then(m => { if (typeof m.generateScholarlyArticleSchema !== 'function') process.exit(1); const out = m.generateScholarlyArticleSchema({title:'T',authors:'A, B',year:2024,journal:'J',pmid:'12345',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/12345/'}); if (out['@type'] !== 'ScholarlyArticle' || out.headline !== 'T') process.exit(2); console.log('SCHEMA_OK'); })"`
  - **Commit**: `feat(research): add APA citation formatter + ScholarlyArticle schema helper (#190)` — stage `src/utils/citationFormatter.js` and `src/utils/structuredDataHelpers.js` only.
  - _Requirements: FR-5, AC-1.3_
  - _Design: Component 2, Decision 4_

- [x] 1.3 [VERIFY] Smoke test both helpers with 5 fixtures
  - **Do**:
    1. Run inline node script that imports both helpers and tests 5 fixture shapes (full / no-DOI / no-vol / array-authors / string-authors).
    2. Assert `formatAPA` returns string with no `, ,` and no trailing `()`; assert `generateScholarlyArticleSchema` returns valid object with required fields.
  - **Files**: none (inline node)
  - **Done when**: All 5 fixtures pass; no `, ,` patterns in any output.
  - **Verify**:
    ```bash
    node --input-type=module -e "
    Promise.all([
      import('./src/utils/citationFormatter.js'),
      import('./src/utils/structuredDataHelpers.js')
    ]).then(([cf, sd]) => {
      const fixtures = [
        {title:'Full',authors:'Chen, S., Zhao, X., Ran, L., Liu, M.',year:2024,journal:'Nutrients',volume:'16',issue:'3',pages:'123-145',doi:'10.1234/abc',pmid:'99999',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/99999/'},
        {title:'NoDOI',authors:'A, B, C',year:2023,journal:'Food Funct',volume:'14',issue:'2',pages:'10-20',pmid:'88888',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/88888/'},
        {title:'NoVol',authors:'X, Y',year:2022,journal:'Nature',pmid:'77777',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/77777/'},
        {title:'ArrayAuthors',authors:['Smith, A.','Jones, B.','Doe, C.','Roe, D.'],year:2021,journal:'JBC',pmid:'66666',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/66666/'},
        {title:'StringAuthors',authors:'Wang, Q., et al.',year:2020,journal:'Phytomed',pmid:'55555',pubmedUrl:'https://pubmed.ncbi.nlm.nih.gov/55555/'}
      ];
      let ok = true;
      for (const f of fixtures) {
        const apa = cf.formatAPA(f);
        const sch = sd.generateScholarlyArticleSchema(f);
        if (/, ,|\(\)|\s\.\s\./.test(apa)) { console.error('BAD APA:', apa); ok = false; }
        if (sch['@type'] !== 'ScholarlyArticle' || !sch.headline) { console.error('BAD SCHEMA:', sch); ok = false; }
        console.log(f.title, '|', apa);
      }
      process.exit(ok ? 0 : 1);
    });
    "
    ```
  - **Done when**: Exit 0; all 5 APA strings printed; no malformed output.
  - **Commit**: None
  - _Requirements: FR-9, NFR-3_

---

## Group 2: PMID verification gate (anti-fabrication)

- [x] 2.1 Create `scripts/verify-pmids.sh` per design.md PMID verification protocol
  - **Do**:
    1. Create `scripts/verify-pmids.sh` per design.md "PMID Verification Protocol" code block.
    2. Make executable: `chmod +x scripts/verify-pmids.sh`.
    3. Adapt to read PMIDs from a CLI arg file (default: `specs/issue-190-research-expansion/candidate-pmids.txt`) when `src/data/research-studies.js` doesn't yet exist (Group 3 hasn't run). When the studies file DOES exist, prefer it.
    4. Loop logic: `curl -sf -A 'Mozilla/5.0' -o /tmp/pubmed-$pmid.html -w "%{http_code}"` per PMID; check 200 status + DHM keyword match in title.
    5. Exit 0 if all pass; exit 1 if any fail.
  - **Files**: `scripts/verify-pmids.sh` (new)
  - **Done when**: Script exists, is executable, runs without syntax error on empty input.
  - **Verify**: `bash -n scripts/verify-pmids.sh && echo SYNTAX_OK && [ -x scripts/verify-pmids.sh ] && echo EXEC_OK`
  - **Commit**: `chore(scripts): add PMID verification helper for research database (#190)` — stage `scripts/verify-pmids.sh` only.
  - _Requirements: FR-3, AC-5.1, AC-5.2_
  - _Design: PMID Verification Protocol_

- [x] 2.2 Author candidate-pmids.txt with 14+ verified candidates from research.md
  - **Do**:
    1. Create `specs/issue-190-research-expansion/candidate-pmids.txt` with one PMID per line.
    2. Per design.md Implementation Steps #3, target 14 candidates: C1 21621575, C2 27590848, C3 28956968, C4 30639393, C5 32437218, C7 34960054, C9 35024384, C10 36018479, C11 36758631, C12 37119835, C13 37511110, C15 38338049, C17 38975418, C19 12404407.
    3. (Skip C6 — already on page as id 3.)
    4. One numeric PMID per line, no comments, no blank lines.
  - **Files**: `specs/issue-190-research-expansion/candidate-pmids.txt` (new)
  - **Done when**: File contains exactly 14 numeric lines.
  - **Verify**: `[ "$(wc -l < specs/issue-190-research-expansion/candidate-pmids.txt)" -ge 14 ] && echo COUNT_OK && grep -cE '^[0-9]+$' specs/issue-190-research-expansion/candidate-pmids.txt`
  - **Commit**: None (working file, never committed)
  - _Requirements: FR-3_
  - _Design: Implementation Steps #3_

- [x] 2.3 [VERIFY] HARD GATE — every candidate PMID returns HTTP 200 + DHM keyword match
  - **Do**:
    1. Run `bash scripts/verify-pmids.sh specs/issue-190-research-expansion/candidate-pmids.txt`.
    2. Capture output; every line must read `OK   pmid=XXXXX`.
    3. Any `FAIL` or `WARN` line means that PMID is not usable — proceed to 2.4.
  - **Files**: none
  - **Done when**: Script exits 0; ALL 14 PMIDs verified.
  - **Verify**: `bash scripts/verify-pmids.sh specs/issue-190-research-expansion/candidate-pmids.txt && echo ALL_PMIDS_VERIFIED`
  - **Commit**: None (gate)
  - _Requirements: FR-3, AC-5.1, AC-5.2_

- [x] 2.4 Replace any failed PMID with backup from research.md C-list
  - **Do**:
    1. If 2.3 reported any failures, edit `candidate-pmids.txt`: remove failed PMID(s), append from research.md backup pool: C8 34879801, C14 38096431, C16 38744388, C18 39298344, C20 16630710.
    2. Re-run 2.3 verification until exit 0.
    3. If still failing after backup pool exhausted, document in `.progress.md` and STOP — execution cannot proceed without 14 verified PMIDs.
  - **Files**: `specs/issue-190-research-expansion/candidate-pmids.txt` (modify)
  - **Done when**: All entries verified OR documented blocker.
  - **Verify**: `bash scripts/verify-pmids.sh specs/issue-190-research-expansion/candidate-pmids.txt && echo POST_REPLACE_VERIFIED`
  - **Commit**: None
  - _Requirements: FR-3_

- [x] 2.5 [VERIFY] Quality checkpoint: lint + z-class check
  - **Do**: Run quality commands from research.md.
  - **Verify**: `npm run lint && echo LINT_OK`
  - **Done when**: Lint exits 0 (helpers and verify script clean).
  - **Commit**: `chore(scripts): pass lint checkpoint` (only if lint surfaced fixes)

---

## Group 3: Studies data expansion (depends on Group 2 hard gate)

- [x] 3.1 Extract existing 11 studies from `Research.jsx` to `src/data/research-studies.js`
  - **Do**:
    1. Read `src/pages/Research.jsx` lines 80-345 (existing `studies` array).
    2. Create `src/data/research-studies.js` with `export const researchStudies = [...]` containing all 11 entries.
    3. Normalize each entry to canonical shape from design.md "Studies Array Shape" — keep all existing fields; add optional `volume`, `issue`, `pages`, `doi` fields ONLY where data is already known from existing `pubmedUrl` or `journal` references (do NOT fabricate).
    4. Where optional fields unknown, leave undefined (omit, do not assign empty string).
    5. Preserve original `id` numbers 1-11.
  - **Files**: `src/data/research-studies.js` (new)
  - **Done when**: File exports `researchStudies` array of length 11; canonical shape; no fabricated data.
  - **Verify**:
    ```bash
    node --input-type=module -e "
    import('./src/data/research-studies.js').then(m => {
      const arr = m.researchStudies;
      if (!Array.isArray(arr) || arr.length !== 11) { console.error('expected 11 got', arr.length); process.exit(1); }
      const required = ['id','title','authors','journal','year','category','findings','methodology','pubmedUrl'];
      for (const s of arr) {
        for (const k of required) if (s[k] === undefined) { console.error('missing',k,'on id',s.id); process.exit(2); }
      }
      console.log('STUDIES_11_OK');
    });
    "
    ```
  - **Commit**: None yet (paired with 3.2)
  - _Requirements: FR-1, FR-2_
  - _Design: Component 4, Studies Array Shape_

- [x] 3.2 Append 14 verified-PMID NEW studies to the array
  - **Do**:
    1. For each PMID in verified `candidate-pmids.txt`, fetch the cached HTML from `/tmp/pubmed-$pmid.html` (already populated by 2.3) and extract: title, authors (first 3 + et al. style), journal, year, abstract methodology + findings.
    2. Assign `id` 12 through 25 (sequential).
    3. Map category by topical match to existing taxonomy: metabolism / liver / neuroprotection (use research.md Candidate table column).
    4. Set `type` (most preclinical: `Preclinical Study`).
    5. Set `pubmedUrl: \`https://pubmed.ncbi.nlm.nih.gov/${pmid}/\``.
    6. Cross-reference site corpus (`src/newblog/data/posts/*.json`) for any author/journal details already used in posts.
    7. Maintain canonical shape from design.md.
  - **Files**: `src/data/research-studies.js` (modify)
  - **Done when**: Array length is exactly 25; no fabricated PMIDs (every PMID matches `candidate-pmids.txt`).
  - **Verify**:
    ```bash
    node --input-type=module -e "
    import('./src/data/research-studies.js').then(m => {
      const arr = m.researchStudies;
      if (arr.length !== 25) { console.error('expected 25 got', arr.length); process.exit(1); }
      const ids = new Set(arr.map(s => s.id));
      if (ids.size !== 25) { console.error('duplicate ids'); process.exit(2); }
      const cats = new Set(arr.map(s => s.category));
      console.log('cats:', [...cats].join(','));
      console.log('STUDIES_25_OK');
    });
    "
    ```
    Plus PMID cross-check:
    ```bash
    grep -oE "pubmed\.ncbi\.nlm\.nih\.gov/[0-9]+" src/data/research-studies.js | grep -oE "[0-9]+$" | sort -u > /tmp/in-data.txt
    sort -u specs/issue-190-research-expansion/candidate-pmids.txt > /tmp/in-cand.txt
    # every candidate PMID must appear in data
    comm -23 /tmp/in-cand.txt /tmp/in-data.txt | head -5
    [ ! -s <(comm -23 /tmp/in-cand.txt /tmp/in-data.txt) ] && echo CANDIDATES_ALL_PRESENT
    ```
  - **Commit**: `feat(research): expand DHM clinical studies database 11→25 with verified PMIDs (#190)` — stage `src/data/research-studies.js` only.
  - _Requirements: FR-1, FR-2, AC-2.1_
  - _Design: Component 4, Implementation Steps #3_

- [x] 3.3 [VERIFY] Studies array sanity gate
  - **Do**:
    1. Final length check (25).
    2. Confirm category balance: ≥1 neuroprotection (per design risk register).
    3. Confirm all required fields present.
    4. Re-run PMID verification on the live data file (script auto-detects studies file precedence).
  - **Verify**:
    ```bash
    bash scripts/verify-pmids.sh && \
    node --input-type=module -e "
    import('./src/data/research-studies.js').then(m => {
      const arr = m.researchStudies;
      const neuro = arr.filter(s => s.category === 'neuroprotection').length;
      if (neuro < 1) { console.error('no neuroprotection paper'); process.exit(1); }
      console.log('GATE_OK count=' + arr.length + ' neuro=' + neuro);
    });
    "
    ```
  - **Done when**: All checks pass; ≥25 studies; ≥1 neuroprotection paper.
  - **Commit**: None
  - _Requirements: FR-1, FR-3_

---

## Group 4: Research.jsx integration

- [x] 4.1 Wire studies module into `Research.jsx`; refactor 5+4 hardcoded counters
  - **Do**:
    1. Add import at top of `src/pages/Research.jsx`: `import { researchStudies as studies } from '../data/research-studies.js';`
    2. DELETE inline `studies` array (lines ~80-345 in current file).
    3. Apply Counter Refactor Map from design.md exactly:
       - Line 35 `count: 11` → `count: studies.length`
       - Lines 36-38 category counts → `studies.filter(s => s.category === '<cat>').length`
       - Line 417 `>11<` (Key Studies Reviewed) → `>{studies.length}<`
       - Line 421 `>7<` (Human Clinical Trials) → `>{studies.filter(s => s.type === 'Human Clinical Trial').length}<`
       - Line 425 `>600+<` (Trial Participants) — KEEP as `600+` literal per design.md note (mixed-type participants; aggregate marketing claim).
       - Line 429 `>11<` (Years of Research) → `>{Math.max(...studies.map(s => s.year)) - Math.min(...studies.map(s => s.year))}<`
       - Line 470 `<strong>7 human clinical trials</strong>` → `<strong>{studies.filter(s => s.type === 'Human Clinical Trial').length} human clinical trials</strong>`
       - Line 471 `<strong>600+ participants</strong>` — KEEP literal per same reasoning.
    4. Use `useMemo` if any computed value is referenced more than twice (per React convention; minimize re-renders).
  - **Files**: `src/pages/Research.jsx`
  - **Done when**: Inline studies array gone; 8 counter sites refactored; Research.jsx still parses.
  - **Verify**:
    ```bash
    # Inline studies array removed (ID 1-11 inline literals gone)
    ! grep -nE 'id:\s*1,$' src/pages/Research.jsx
    # Import added
    grep -q "from '../data/research-studies" src/pages/Research.jsx && echo IMPORT_OK
    # No remaining hardcoded study-counter "11" patterns from Counter Refactor Map
    ! grep -nE 'count:\s*11\b|>11</div|>"11 ' src/pages/Research.jsx && echo NO_HARDCODE_11
    ```
  - **Commit**: None yet (paired with 4.2)
  - _Requirements: FR-4, AC-3.1, AC-3.2, AC-3.3, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Component 4, Counter Refactor Map_

- [x] 4.2 Add `<CopyAPAButton>` component + render per study card
  - **Do**:
    1. Inside `src/pages/Research.jsx`, add inline `CopyAPAButton({ citation })` component per design.md "Component 5" code block exactly.
    2. Import `Copy, Check` from `lucide-react`; import `formatAPA` from `../utils/citationFormatter.js`.
    3. Render `<CopyAPAButton citation={formatAPA(study)} />` next to existing "View Full PubMed Study" button (around line 798-815 in original, will shift after extraction).
    4. Use `data-copy-apa="true"` attribute for verification grep.
    5. try/catch the clipboard call; log warning on failure (no throw).
  - **Files**: `src/pages/Research.jsx`
  - **Done when**: CopyAPAButton component defined; rendered inside each study card map; data-attribute present.
  - **Verify**:
    ```bash
    grep -c 'data-copy-apa="true"' src/pages/Research.jsx
    grep -c 'function CopyAPAButton\|const CopyAPAButton' src/pages/Research.jsx
    grep -q 'navigator.clipboard.writeText' src/pages/Research.jsx && echo CLIPBOARD_OK
    grep -q 'formatAPA' src/pages/Research.jsx && echo FORMATAPA_IMPORTED
    ```
  - **Commit**: `feat(research): wire studies module into page + add Copy-APA button + drive counters from data (#190)` — stage `src/pages/Research.jsx` only.
  - _Requirements: FR-4, FR-8, FR-9, AC-2.2, AC-2.3_
  - _Design: Component 5, Decision 3_

- [x] 4.3 [VERIFY] Build + lint + filter regression smoke
  - **Do**:
    1. `npm run lint`
    2. `npm run build`
    3. Confirm year/category filter logic preserved by grepping for filter handler functions still referencing `studies`/filtered arrays.
  - **Verify**:
    ```bash
    npm run lint && \
    npm run build && \
    grep -q 'filteredStudies' src/pages/Research.jsx && \
    echo VERIFY_4_3_PASS
    ```
  - **Done when**: Lint clean, build green, filter logic still in place.
  - **Commit**: `chore(research): pass quality checkpoint` (only if fixes were needed)

---

## Group 5: Schema injection (Path B — extend prerender script)

- [x] 5.1 Extend `scripts/prerender-main-pages.js` with `scholarlyArticles` field
  - **Do**:
    1. Open `scripts/prerender-main-pages.js`.
    2. Add imports at top: `import { researchStudies } from '../src/data/research-studies.js';` and append `generateScholarlyArticleSchema` to the existing `from '../src/utils/structuredDataHelpers.js'` import line.
    3. On the `/research` page entry in the `pages` array, add field: `scholarlyArticles: researchStudies.map(generateScholarlyArticleSchema)`.
    4. Inside the `prerenderMainPages()` loop where `faqSchema` is currently emitted, add a sibling block per design.md Component 3 diff sketch — `if (page.scholarlyArticles && page.scholarlyArticles.length > 0) { ... forEach createElement('script') ... }`.
    5. Use `document.createElement('script')` + `textContent = JSON.stringify(schema)` (same DOM API as existing FAQ block; NOT `dangerouslySetInnerHTML`).
    6. Place new block at same emission location as `faqSchema` block — appendChild to head.
  - **Files**: `scripts/prerender-main-pages.js`
  - **Done when**: Imports added; field added; emission loop added; prerender script still runs without error.
  - **Verify**:
    ```bash
    grep -q "from '../src/data/research-studies.js'" scripts/prerender-main-pages.js && echo IMPORT_STUDIES_OK
    grep -q 'generateScholarlyArticleSchema' scripts/prerender-main-pages.js && echo IMPORT_SCHEMA_OK
    grep -q 'scholarlyArticles' scripts/prerender-main-pages.js && echo FIELD_OK
    grep -q 'application/ld+json' scripts/prerender-main-pages.js && echo EMIT_OK
    ```
  - **Commit**: `feat(seo): emit ScholarlyArticle schema per DHM study on /research route (#190)` — stage `scripts/prerender-main-pages.js` only.
  - _Requirements: FR-5, FR-6, FR-12, AC-1.1_
  - _Design: Component 3, Decision 1, Architecture diagram_

- [x] 5.2 [VERIFY] Build + dist asserts ≥25 ScholarlyArticle blocks + FAQ regression
  - **Do**:
    1. `npm run build` — exit 0.
    2. Count ScholarlyArticle blocks in prerendered `/research` HTML.
    3. Confirm existing FAQ schema block still present (regression check).
    4. Confirm z-class verifier still passes.
  - **Verify**:
    ```bash
    npm run build && \
    [ "$(grep -c '"@type":"ScholarlyArticle"' dist/research/index.html)" -ge 25 ] && \
    [ "$(grep -c '"@type":"FAQPage"' dist/research/index.html)" -ge 1 ] && \
    echo SCHEMA_INTEGRATION_PASS
    ```
  - **Done when**: All three asserts pass.
  - **Commit**: None
  - _Requirements: FR-6, FR-11, AC-1.1_

---

## Group 6: Final integration verify + spec scaffold commit

- [x] 6.1 [VERIFY] AC checklist — sample headlines, copy buttons, counter cleanup, final build
  - **Do**:
    1. Sample 5 study titles from `src/data/research-studies.js` and grep dist for each (AC-7 / FR-7).
    2. Grep `src/pages/Research.jsx` for `data-copy-apa="true"` — must appear (AC-8 / FR-8).
    3. Confirm Counter Refactor Map values absent: zero `count: 11` and zero `>11<` study-related occurrences.
    4. Final clean build.
    5. Z-class verifier still green.
  - **Verify**:
    ```bash
    set -e
    # Sample 5 titles
    node --input-type=module -e "
    import('./src/data/research-studies.js').then(m => {
      const sample = m.researchStudies.slice(0, 5).map(s => s.title);
      console.log(sample.join('\n'));
    });
    " > /tmp/sample-titles.txt
    miss=0
    while IFS= read -r t; do
      grep -F "$t" dist/research/index.html >/dev/null && echo "OK   $t" || { echo "MISS $t"; miss=$((miss+1)); }
    done < /tmp/sample-titles.txt
    [ "$miss" -eq 0 ] && echo HEADLINES_OK

    # Copy APA button presence (component definition + per-study data attr)
    [ "$(grep -c 'data-copy-apa="true"' src/pages/Research.jsx)" -ge 1 ] && echo COPY_BUTTON_OK

    # No leftover hardcoded "11" study counters (per Counter Refactor Map)
    ! grep -nE 'count:\s*11\b' src/pages/Research.jsx && echo NO_COUNT_11
    ! grep -nE '>11</div>|"11 Key Studies"|"11 Years of"' src/pages/Research.jsx && echo NO_LITERAL_11

    # Final build green
    npm run build && echo FINAL_BUILD_OK

    # Schema count holds at ≥25
    [ "$(grep -c '"@type":"ScholarlyArticle"' dist/research/index.html)" -ge 25 ] && echo FINAL_SCHEMA_COUNT_OK
    ```
  - **Done when**: All asserts pass.
  - **Commit**: None
  - _Requirements: FR-1, FR-4, FR-6, FR-7, FR-8, FR-11, AC-1.1, AC-2.2, AC-4.1_

- [x] 6.2 Commit spec scaffold for issue #190
  - **Do**:
    1. Stage `specs/issue-190-research-expansion/tasks.md` (and any of research/requirements/design/.progress that haven't been committed yet — do NOT stage `candidate-pmids.txt` or `.ralph-state.json`).
    2. Commit with the message below.
  - **Files**: `specs/issue-190-research-expansion/*.md`
  - **Done when**: Spec artifact committed.
  - **Verify**: `git log -1 --format=%s | grep -q 'scaffold ralph spec' && echo SPEC_COMMIT_OK`
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #190` — stage explicit paths under `specs/issue-190-research-expansion/`. Use HEREDOC commit message ending with `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

---

## Notes

- **Hard gate**: Group 3 cannot start until Group 2 passes. Cited PMID fabrication is unrecoverable E-E-A-T damage.
- **Quality checkpoints**: 1.3, 2.5, 3.3, 4.3, 5.2, 6.1 (every 2-3 substantive tasks).
- **Computed-counter exception**: line 425 (`600+ Trial Participants`) and line 471 (`600+ participants`) retained as literals per design.md note — aggregate marketing claim, not a per-study counter, mixed-type `participants` field makes clean computation lossy.
- **No new dependencies**: all helpers pure JS; CopyAPAButton uses existing `lucide-react` icons (Copy, Check) already in codebase.
- **`dangerouslySetInnerHTML` NOT used**: prerender path uses `document.createElement('script')` + `.textContent` per design.md Security Considerations.
- **Patterns honored**: #11 (verify in dist not dev runtime), #15 (drive all counters from single source), #16 (data and helpers in separate files = additive change, no decay).

## PR Strategy

Single PR titled `feat: expand DHM clinical studies database 11→25 with ScholarlyArticle schema (#190)`. 6 commits land in order:

1. (after 1.2) `feat(research): add APA citation formatter + ScholarlyArticle schema helper (#190)` — stages: `src/utils/citationFormatter.js`, `src/utils/structuredDataHelpers.js`
2. (after 2.1) `chore(scripts): add PMID verification helper for research database (#190)` — stages: `scripts/verify-pmids.sh`
3. (after 3.2) `feat(research): expand DHM clinical studies database 11→25 with verified PMIDs (#190)` — stages: `src/data/research-studies.js`
4. (after 4.2) `feat(research): wire studies module into page + add Copy-APA button + drive counters from data (#190)` — stages: `src/pages/Research.jsx`
5. (after 5.1) `feat(seo): emit ScholarlyArticle schema per DHM study on /research route (#190)` — stages: `scripts/prerender-main-pages.js`
6. (after 6.1) `chore(spec): scaffold ralph spec artifacts for issue #190` — stages: `specs/issue-190-research-expansion/*.md`

User handles `git push` + `gh pr create` after the loop completes.
