---
spec: issue-363-dcni-bugs
phase: tasks
created: 2026-04-29
---

# Tasks: issue-363-dcni-bugs

Workflow: Bug-fix sequence (4 mechanical bugs, atomic PR, 5 commits). No POC needed; no TDD triplets needed (HTTP-status-level changes verified by curl + build).

Granularity: fine. Each task is a single concrete unit. Quick mode — no user-stop checkpoints.

## Phase 0: Reproduce (BEFORE state)

- [x] 0.1 [VERIFY] Reproduce all 4 bugs live
  - **Do**:
    1. Bug 1: `curl -sI 'https://www.dhmguide.com/never-hungover/gen-z-mental-health-revolution-why-58%25-are-drinking-less-for-wellness-in-2025' | head -1` (expect `HTTP/2 200`)
    2. Bug 2: `curl -sI "https://www.dhmguide.com/never-hungover/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age" | head -1` (expect `HTTP/2 200`)
    3. Bug 3: `curl -sI 'https://dhmguide.com/research' | head -1` (expect `HTTP/2 307`)
    4. Bug 4: `curl -sI 'https://www.dhmguide.com/dhm-dosage-calculator-new' | head -1` (expect `HTTP/2 200`)
  - **Files**: none (live verification)
  - **Done when**: All 4 reproductions output the expected pre-fix status
  - **Verify**: `curl -sI 'https://dhmguide.com/research' | head -1 | grep -q '307' && echo BEFORE_PASS`
  - **Commit**: None

## Phase 1: Bug 1 — `%` slug rename

- [x] 1.1 Rename gen-z `%` JSON file + edit slug+id fields
  - **Do**:
    1. `mv "src/newblog/data/posts/gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025.json" "src/newblog/data/posts/gen-z-mental-health-revolution-58-percent-drinking-less-2025.json"`
    2. Edit JSON's `slug` field: `gen-z-mental-health-revolution-58-percent-drinking-less-2025`
    3. Edit JSON's `id` field: same value
  - **Files**: `src/newblog/data/posts/gen-z-mental-health-revolution-58-percent-drinking-less-2025.json`
  - **Done when**: New filename exists; old does not; both `slug` and `id` updated; 2-space indent preserved
  - **Verify**: `test -f src/newblog/data/posts/gen-z-mental-health-revolution-58-percent-drinking-less-2025.json && ! test -f "src/newblog/data/posts/gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025.json" && grep -c '"slug": "gen-z-mental-health-revolution-58-percent-drinking-less-2025"' src/newblog/data/posts/gen-z-mental-health-revolution-58-percent-drinking-less-2025.json`
  - **Commit**: None (combine with 1.2 + 1.3)
  - _Requirements: AC-1.1, AC-1.2_

- [x] 1.2 Update gen-z slug references across 6 files
  - **Do**:
    1. `src/newblog/data/postRegistry.js:117` — replace old slug with new (key + path)
    2. `src/newblog/data/metadata/index.json:252` — replace old slug
    3. `src/newblog/data/metadata/index.backup.json:252` — replace old slug
    4. `scripts/cluster-config.json:170` — replace old slug
    5. `src/newblog/data/posts/smart-sleep-technology-and-alcohol-circadian-optimization-guide-2025.json:23` — replace in `relatedPosts`
    6. `src/newblog/data/posts/hangxiety-complete-guide-2026-supplements-research.json` — replace in `relatedPosts`
  - **Files**: postRegistry.js, metadata/index.json, metadata/index.backup.json, scripts/cluster-config.json, smart-sleep-technology...json, hangxiety-complete-guide-2026...json
  - **Done when**: All 6 files updated; no stale `gen-z-mental-health-revolution-why-58` substring anywhere in src/scripts/public
  - **Verify**: `! grep -rn "gen-z-mental-health-revolution-why-58" src/ scripts/ public/ 2>/dev/null && echo PASS`
  - **Commit**: None (combine with 1.1 + 1.3)
  - _Requirements: AC-1.3_

- [x] 1.3 Add Bug 1 308 redirect to vercel.json
  - **Do**:
    1. Append redirect to `vercel.json` `redirects` array:
       - `source`: `/never-hungover/gen-z-mental-health-revolution-why-58%25-are-drinking-less-for-wellness-in-2025`
       - `destination`: `/never-hungover/gen-z-mental-health-revolution-58-percent-drinking-less-2025`
       - `permanent`: `true`
    2. Place BEFORE the catch-all (Bug 3 will be added later)
    3. Match existing 2-space indent + key order
  - **Files**: `vercel.json`
  - **Done when**: vercel.json parses; new rule present with `%25` encoding
  - **Verify**: `node -e "const j=JSON.parse(require('fs').readFileSync('vercel.json','utf8'));const ok=j.redirects.some(r=>r.source.includes('58%25'));console.log(ok?'PASS':'FAIL')"`
  - **Commit**: `fix(seo): rename gen-z slug to drop literal % character (#363 bug 1)` — stages JSON rename + 6 reference updates + vercel.json
  - _Requirements: AC-1.5_

- [x] 1.4 [VERIFY] Bug 1 grep clean across project
  - **Do**:
    1. `grep -rn "gen-z-mental-health-revolution-why-58" src/ scripts/ public/ 2>/dev/null`
    2. Expect zero matches
  - **Files**: none
  - **Done when**: No stale references anywhere
  - **Verify**: `! grep -rn "gen-z-mental-health-revolution-why-58" src/ scripts/ public/ 2>/dev/null && echo CLEAN`
  - **Commit**: None
  - _Requirements: AC-1.3, AC-1.6_

## Phase 2: Bug 2 — apostrophe slug rename

- [x] 2.1 Rename social-media apostrophe JSON + edit slug+id fields
  - **Do**:
    1. `mv "src/newblog/data/posts/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json" "src/newblog/data/posts/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json"`
    2. Edit JSON's `slug` field: `social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age`
    3. Edit JSON's `id` field: same value
  - **Files**: `src/newblog/data/posts/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json`
  - **Done when**: New filename exists; old does not; slug+id match new value
  - **Verify**: `test -f "src/newblog/data/posts/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json" && ! test -f "src/newblog/data/posts/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json" && grep -c '"slug": "social-medias-unseen-influence' "src/newblog/data/posts/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json"`
  - **Commit**: None (combine with 2.2 + 2.3)
  - _Requirements: AC-2.1, AC-2.2_

- [x] 2.2 Update social-media slug references across 4 files
  - **Do**:
    1. `src/newblog/data/postRegistry.js:180` — replace old slug
    2. `src/newblog/data/metadata/index.json:4` — replace old slug
    3. `src/newblog/data/metadata/index.backup.json:4` — replace old slug
    4. `src/newblog/data/posts/alcohol-and-anxiety-breaking-the-cycle-naturally-2025.json:20` — replace in `relatedPosts`
  - **Files**: postRegistry.js, metadata/index.json, metadata/index.backup.json, alcohol-and-anxiety-breaking-the-cycle-naturally-2025.json
  - **Done when**: All 4 files updated; no stale `social-media's-unseen-influence` anywhere
  - **Verify**: `! grep -rn "social-media's-unseen-influence" src/ scripts/ public/ 2>/dev/null && echo PASS`
  - **Commit**: None (combine with 2.1 + 2.3)
  - _Requirements: AC-2.3_

- [x] 2.3 Add Bug 2 308 redirect to vercel.json
  - **Do**:
    1. Append redirect to `vercel.json` `redirects` array:
       - `source`: `/never-hungover/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age` (raw apostrophe; sub-delim per RFC 3986)
       - `destination`: `/never-hungover/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age`
       - `permanent`: `true`
    2. Place after Bug 1 rule, before catch-all
  - **Files**: `vercel.json`
  - **Done when**: vercel.json parses; new rule present
  - **Verify**: `node -e "const j=JSON.parse(require('fs').readFileSync('vercel.json','utf8'));const ok=j.redirects.some(r=>r.source.includes(\"social-media's-unseen-influence\"));console.log(ok?'PASS':'FAIL')"`
  - **Commit**: `fix(seo): rename social-media slug to drop literal apostrophe (#363 bug 2)` — stages JSON rename + 4 reference updates + vercel.json
  - _Requirements: AC-2.5_

- [x] 2.4 [VERIFY] Bug 2 grep clean across project
  - **Do**:
    1. `grep -rn "social-media's-unseen-influence" src/ scripts/ public/ 2>/dev/null`
    2. Expect zero matches
  - **Files**: none
  - **Done when**: No stale references
  - **Verify**: `! grep -rn "social-media's-unseen-influence" src/ scripts/ public/ 2>/dev/null && echo CLEAN`
  - **Commit**: None
  - _Requirements: AC-2.3, AC-2.6_

## Phase 3: Bug 3 — non-www → www 308

- [x] 3.1 Append host-predicate catch-all 308 redirect to vercel.json
  - **Do**:
    1. Append redirect rule LAST in `vercel.json` `redirects` array:
       ```json
       {
         "source": "/(.*)",
         "has": [{ "type": "host", "value": "dhmguide.com" }],
         "destination": "https://www.dhmguide.com/$1",
         "permanent": true
       }
       ```
    2. Match existing 2-space indent + key order (`source`, `has`, `destination`, `permanent`)
    3. Verify destination uses ABSOLUTE URL (cross-host requirement)
  - **Files**: `vercel.json`
  - **Done when**: catch-all rule appended last; `has` field shape correct
  - **Verify**: `node -e "const j=JSON.parse(require('fs').readFileSync('vercel.json','utf8'));const ok=j.redirects.some(r=>r.has?.[0]?.value==='dhmguide.com'&&r.destination.startsWith('https://www.'));console.log(ok?'PASS':'FAIL')"`
  - **Commit**: `fix(seo): explicit non-www → www 308 redirect (#363 bug 3)` — vercel.json only
  - _Requirements: AC-3.1_

- [x] 3.2 [VERIFY] vercel.json parses and Bug 3 rule shape correct
  - **Do**:
    1. Parse vercel.json with node
    2. Confirm catch-all rule with `has` predicate exists
    3. Confirm `permanent: true` (yields 308)
  - **Files**: none
  - **Done when**: vercel.json valid JSON; rule has correct shape
  - **Verify**: `node -e "const j=JSON.parse(require('fs').readFileSync('vercel.json','utf8'));const r=j.redirects.find(r=>r.has?.[0]?.value==='dhmguide.com');if(!r||r.permanent!==true||r.destination!=='https://www.dhmguide.com/\$1'){console.log('FAIL');process.exit(1)}console.log('PASS')"`
  - **Commit**: None
  - _Requirements: AC-3.1_

## Phase 4: Bug 4 — delete /dhm-dosage-calculator-new

- [x] 4.1 Delete DosageCalculatorRewrite directory
  - **Do**:
    1. `rm -rf src/pages/DosageCalculatorRewrite/`
    2. Verify directory absent
  - **Files**: `src/pages/DosageCalculatorRewrite/` (whole dir, 5 files)
  - **Done when**: directory gone
  - **Verify**: `! test -d src/pages/DosageCalculatorRewrite && echo PASS`
  - **Commit**: None (combine with 4.2 + 4.3 + 4.4)
  - _Requirements: AC-4.3_

- [x] 4.2 Remove route registration from src/App.jsx
  - **Do**:
    1. Remove the line at `src/App.jsx:22` that maps `/dhm-dosage-calculator-new` to a lazy import of `./pages/DosageCalculatorRewrite/index.jsx`
    2. Confirm no other reference to `dhm-dosage-calculator-new` in App.jsx
  - **Files**: `src/App.jsx`
  - **Done when**: line gone; `grep` returns zero matches in App.jsx
  - **Verify**: `! grep -n "dhm-dosage-calculator-new" src/App.jsx && echo PASS`
  - **Commit**: None (combine with 4.1 + 4.3 + 4.4)
  - _Requirements: AC-4.1_

- [x] 4.3 Remove route entry from src/hooks/useRouter.js
  - **Do**:
    1. Remove the entry at `src/hooks/useRouter.js:27` for `/dhm-dosage-calculator-new` (path + name + inNav)
    2. Confirm no other reference in useRouter.js
  - **Files**: `src/hooks/useRouter.js`
  - **Done when**: entry gone; `grep` returns zero matches in useRouter.js
  - **Verify**: `! grep -n "dhm-dosage-calculator-new" src/hooks/useRouter.js && echo PASS`
  - **Commit**: None (combine with 4.1 + 4.2 + 4.4)
  - _Requirements: AC-4.2_

- [x] 4.4 Add Bug 4 308 redirect to vercel.json
  - **Do**:
    1. Append (BEFORE the catch-all from 3.1):
       - `source`: `/dhm-dosage-calculator-new`
       - `destination`: `/dhm-dosage-calculator`
       - `permanent`: `true`
    2. Match existing style (2-space, no comments, key order)
  - **Files**: `vercel.json`
  - **Done when**: rule present; placed before host-predicate catch-all
  - **Verify**: `node -e "const j=JSON.parse(require('fs').readFileSync('vercel.json','utf8'));const ok=j.redirects.some(r=>r.source==='/dhm-dosage-calculator-new'&&r.destination==='/dhm-dosage-calculator'&&r.permanent===true);console.log(ok?'PASS':'FAIL')"`
  - **Commit**: `chore(seo): delete unused /dhm-dosage-calculator-new route + rewrite (#363 bug 4)` — stages dir delete + 2 src edits + vercel.json
  - _Requirements: AC-4.4_

- [x] 4.5 [VERIFY] Bug 4 no remaining references in src
  - **Do**:
    1. Cross-codebase grep for any remaining reference
    2. Expect zero in src/ (docs/* references are historical, OK)
  - **Files**: none
  - **Done when**: zero src references
  - **Verify**: `! grep -rn "dhm-dosage-calculator-new" src/ 2>/dev/null && ! grep -rn "DosageCalculatorRewrite" src/ 2>/dev/null && echo PASS`
  - **Commit**: None
  - _Requirements: AC-4.1, AC-4.2, AC-4.3_

## Phase 5: Final integration

- [x] 5.1 [VERIFY] Full local build + sitemap audit
  - **Do**:
    1. `npm run lint`
    2. `npm run validate-posts`
    3. `node verify-registry.js`
    4. `npm run build` (regenerates `public/sitemap.xml` + `public/blog-canonicals.json`)
    5. Inspect built dist + sitemap
  - **Files**: none (verifies built artifacts)
  - **Done when**: all 5 commands exit 0; sitemap clean of `%` and `'`; new slugs present in dist
  - **Verify**: `npm run lint && npm run validate-posts && node verify-registry.js && npm run build && test -d "dist/never-hungover/gen-z-mental-health-revolution-58-percent-drinking-less-2025" && test -d "dist/never-hungover/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age" && ! test -d "dist/never-hungover/gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025" && ! test -d "dist/never-hungover/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age" && [ "$(grep -c '%' public/sitemap.xml)" = "0" ] && [ -z "$(grep \"'\" public/sitemap.xml)" ] && [ "$(grep -c 'gen-z-mental-health-revolution-58-percent-drinking-less-2025' public/sitemap.xml)" = "1" ] && [ "$(grep -c 'social-medias-unseen-influence' public/sitemap.xml)" = "1" ] && echo BUILD_PASS`
  - **Commit**: None (build artifacts auto-staged in next task if changed)
  - _Requirements: AC-1.4, AC-1.6, AC-2.4, AC-2.6, NFR-1, FR-5_

- [x] 5.2 Stage spec artifacts (research/requirements/design/tasks)
  - **Do**:
    1. Stage explicitly: `git add specs/issue-363-dcni-bugs/research.md specs/issue-363-dcni-bugs/requirements.md specs/issue-363-dcni-bugs/design.md specs/issue-363-dcni-bugs/tasks.md specs/issue-363-dcni-bugs/.progress.md`
    2. Also stage regenerated `public/sitemap.xml` and `public/blog-canonicals.json` (build outputs reflect renames):
       `git add public/sitemap.xml public/blog-canonicals.json`
    3. Do NOT use `git add -A` (working tree may have unrelated WIP)
  - **Files**: spec markdown files + regenerated public/* artifacts
  - **Done when**: only spec files + sitemap/canonicals are staged
  - **Verify**: `git diff --cached --name-only | sort | grep -E '^specs/issue-363-dcni-bugs/(research|requirements|design|tasks)\.md$|^public/(sitemap\.xml|blog-canonicals\.json)$' | wc -l | grep -E '^\s*[4-6]\s*$'`
  - **Commit**: `chore(spec): scaffold ralph spec artifacts for issue #363` — stages spec markdowns + auto-regen public artifacts
  - _Requirements: per design.md PR Strategy commit 5_

## Notes

- **5 commits total**: 1.3 (Bug 1), 2.3 (Bug 2), 3.1 (Bug 3), 4.4 (Bug 4), 5.2 (spec artifacts).
- **No PR/branch tasks**: user handles. Spec-executor stages and commits only.
- **No `git add -A`**: every commit stages explicit paths.
- **Manual post-deploy step (out of code, documented in PR description)**: log into Vercel dashboard → disable "Redirect to Preferred Domain" for `dhmguide.com` to avoid 307→308 chain race per AC-3.4.
- **Live curl smoke tests (post-deploy, not in this loop)**: AC-1.5, AC-2.5, AC-3.2, AC-3.3, AC-4.6 verified manually after merge + production deploy.
- **File-impact**: 17 files (≤20 per NFR-7).
- **Atomicity (NFR-5/FR-5)**: all 4 bugs ship in one PR.
- **Each commit independently revertible** per design.md Rollback table.
