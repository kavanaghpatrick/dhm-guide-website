---
spec: issue-364-hub-promotion
phase: tasks
created: 2026-04-29
mode: quick
issue: 364
parent_issue: 362
---

# Tasks: issue-364-hub-promotion

## Phase 1: cluster-config additions

- [x] 1.1 Add `dhm-safety` cluster entry to cluster-config
  - **Do**: Open `scripts/cluster-config.json`. Insert new cluster object AFTER the `hangxiety-mental-health` cluster (the current final entry), preserving 2-space indent and the exact key order/style of existing entries. The new entry has `name: "dhm-safety"`, `pillar: "ultimate-dhm-safety-guide-hub-2025"`, `spokes: ["can-you-take-dhm-every-day-long-term-guide-2025", "dhm-dosage-guide-2025", "is-dhm-safe-science-behind-side-effects-2025", "dhm-medication-interactions-safety-guide-2025", "dhm-women-hormonal-considerations-safety-2025", "dhm-adults-over-50-age-related-safety-2025"]`, plus the `keywords` and `anchor_phrases` arrays per design.md §File-by-File Plan §1. Add a trailing comma so the next cluster (1.2) appends cleanly.
  - **Files**: `scripts/cluster-config.json`
  - **Done when**: New `dhm-safety` cluster object exists immediately after `hangxiety-mental-health`; JSON parses; total `clusters[].length` increased by 1.
  - **Verify**: `node -e "const c=require('./scripts/cluster-config.json').clusters; const x=c.find(k=>k.name==='dhm-safety'); console.log(x && x.pillar==='ultimate-dhm-safety-guide-hub-2025' && x.spokes.length===6 ? 'PASS' : 'FAIL')"`
  - **Commit**: None (batch with 1.2, 1.3 into commit #1)
  - _Requirements: FR-1, FR-3, FR-4, AC-1.2_
  - _Design: D2 (dhm-safety spokes), File-by-File Plan §1_

- [x] 1.2 Add `hangover-science` cluster entry to cluster-config
  - **Do**: Open `scripts/cluster-config.json`. Insert new cluster object AFTER the just-added `dhm-safety` cluster, before the closing `]` of the `clusters` array. Use `name: "hangover-science"`, `pillar: "complete-hangover-science-hub-2025"`, `spokes: ["dhm-randomized-controlled-trials", "dhm-japanese-raisin-tree-complete-guide", "how-to-cure-a-hangover-complete-science-guide", "how-long-does-hangover-last", "dhm-science-explained"]`, plus `keywords` and `anchor_phrases` arrays per design.md §File-by-File Plan §1. No trailing comma (last entry).
  - **Files**: `scripts/cluster-config.json`
  - **Done when**: New `hangover-science` cluster appended; JSON parses; `clusters.length === 10`.
  - **Verify**: `node -e "const c=require('./scripts/cluster-config.json').clusters; const x=c.find(k=>k.name==='hangover-science'); console.log(x && x.pillar==='complete-hangover-science-hub-2025' && x.spokes.length===5 && c.length===10 ? 'PASS' : 'FAIL')"`
  - **Commit**: None (batch with 1.1, 1.3 into commit #1)
  - _Requirements: FR-2, FR-3, FR-4, AC-1.2_
  - _Design: D2 (hangover-science spokes), File-by-File Plan §1_

- [x] 1.3 [VERIFY] cluster integrity: count, pillars exist, no spoke conflict
  - **Do**: Run integrity checks: (a) confirm `clusters.length === 10`, (b) both new pillar slugs exist in `src/newblog/data/postRegistry.js`, (c) all 11 new spoke slugs exist in postRegistry.js, (d) no spoke from the 2 new clusters appears as a spoke in any OTHER cluster (cross-cluster spokes other than the documented `dhm-women-hormonal-considerations-safety-2025` are flagged).
  - **Files**: (read-only verify) `scripts/cluster-config.json`, `src/newblog/data/postRegistry.js`
  - **Done when**: All 4 checks pass; only known cross-cluster spoke is `dhm-women-hormonal-considerations-safety-2025` (intentional per D2).
  - **Verify**:
    ```
    node -e "
    const fs=require('fs');
    const cfg=require('./scripts/cluster-config.json');
    const reg=fs.readFileSync('src/newblog/data/postRegistry.js','utf8');
    const newClusters=cfg.clusters.filter(c=>['dhm-safety','hangover-science'].includes(c.name));
    if(cfg.clusters.length!==10){console.log('FAIL: cluster count='+cfg.clusters.length);process.exit(1)}
    for(const c of newClusters){
      if(!reg.includes('\"'+c.pillar+'\"')){console.log('FAIL: pillar missing in registry: '+c.pillar);process.exit(1)}
      for(const s of c.spokes){
        if(!reg.includes('\"'+s+'\"')){console.log('FAIL: spoke missing in registry: '+s);process.exit(1)}
      }
    }
    const newSpokes=new Set(newClusters.flatMap(c=>c.spokes));
    const otherClusters=cfg.clusters.filter(c=>!['dhm-safety','hangover-science'].includes(c.name));
    const conflicts=[];
    for(const c of otherClusters){
      for(const s of c.spokes){
        if(newSpokes.has(s) && s!=='dhm-women-hormonal-considerations-safety-2025'){
          conflicts.push(c.name+':'+s);
        }
      }
    }
    if(conflicts.length>0){console.log('FAIL: unexpected cross-cluster spokes: '+conflicts.join(','));process.exit(1)}
    console.log('PASS: 10 clusters, both pillars in registry, all 11 spokes in registry, only known cross-cluster spoke is dhm-women-hormonal-considerations-safety-2025');
    "
    ```
  - **Done when**: Output starts with `PASS:`.
  - **Commit**: After 1.1 + 1.2 + 1.3 all pass, run:
    ```
    git add scripts/cluster-config.json
    git commit -m "$(cat <<'EOF'
feat(cluster-config): add dhm-safety and hangover-science clusters (#364)

Promote 2 hub posts to actual cluster pillars by adding 2 cluster
entries. Layout.jsx data-driven mega-menu auto-renders 10 clusters
(was 8). Both hubs now appear in desktop and mobile nav across all
prerendered pages, providing sitewide structural prominence to exit
DCNI.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
    ```

## Phase 2: science hub link rewrite (substitutions then deletions then bulk regex)

- [x] 2.1 Apply 4 specific REPLACE substitutions in science hub content
  - **Do**: Open `src/newblog/data/posts/complete-hangover-science-hub-2025.json`. In the `content` field, perform 4 exact string replacements (each occurs exactly once):
    1. `(/blog/hangxiety-2025-dhm-prevents-post-drinking-anxiety)` → `(/never-hungover/hangxiety-complete-guide-2026-supplements-research)`
    2. `(/blog/flyby-vs-fuller-health-complete-comparison-2025)` → `(/never-hungover/flyby-vs-fuller-health-complete-comparison)`
    3. `(/blog/professional-hangover-free-networking-guide-2025)` → `(/never-hungover/business-dinner-networking-dhm-guide-2025)`
    4. `(/blog/rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025)` → `(/never-hungover/greek-life-success-dhm-2025)`
  - **Files**: `src/newblog/data/posts/complete-hangover-science-hub-2025.json`
  - **Done when**: All 4 old strings absent from file; all 4 new strings present exactly once each; JSON still parses.
  - **Verify**:
    ```
    node -e "
    const fs=require('fs');
    const f='src/newblog/data/posts/complete-hangover-science-hub-2025.json';
    const j=JSON.parse(fs.readFileSync(f,'utf8'));
    const dead=['(/blog/hangxiety-2025-dhm-prevents-post-drinking-anxiety)','(/blog/flyby-vs-fuller-health-complete-comparison-2025)','(/blog/professional-hangover-free-networking-guide-2025)','(/blog/rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025)'];
    const live=['(/never-hungover/hangxiety-complete-guide-2026-supplements-research)','(/never-hungover/flyby-vs-fuller-health-complete-comparison)','(/never-hungover/business-dinner-networking-dhm-guide-2025)','(/never-hungover/greek-life-success-dhm-2025)'];
    for(const d of dead){if(j.content.includes(d)){console.log('FAIL dead present: '+d);process.exit(1)}}
    for(const l of live){if((j.content.split(l).length-1)!==1){console.log('FAIL live not exactly once: '+l);process.exit(1)}}
    console.log('PASS: 4 substitutions applied');
    "
    ```
  - **Commit**: None (batch with 2.2, 2.3, 2.4 into commit #2)
  - _Requirements: FR-6, AC-2.3, EC-1_
  - _Design: D1 (4 REPLACE rows), File-by-File Plan §2 Step B_

- [x] 2.2 Apply 3 DELETE removals in science hub content
  - **Do**: In the `content` field of `src/newblog/data/posts/complete-hangover-science-hub-2025.json`, delete the 3 specific bullet lines listed below. Each line begins with `- [` and ends at the next newline. Remove the entire line including its trailing `\n` so surrounding bullets remain contiguous (no blank line left behind).
    1. Line containing `(/blog/complete-guide-hangover-types-2025)` (full line: `- [**Complete Guide to Hangover Types**](/blog/complete-guide-hangover-types-2025) - Different types of hangovers and their unique characteristics`)
    2. Line containing `(/blog/whiskey-vs-vodka-hangover)` (full line: `- [**Whiskey vs Vodka Hangover**](/blog/whiskey-vs-vodka-hangover) - Comparing congener content and hangover severity`)
    3. Line containing `(/blog/post-dry-january-smart-drinking-strategies-2025)` (full line: `- [**Post Dry January Smart Drinking Strategies**](/blog/post-dry-january-smart-drinking-strategies-2025) - Transitioning back to social drinking`)
  - **Files**: `src/newblog/data/posts/complete-hangover-science-hub-2025.json`
  - **Done when**: 3 dead-target slugs no longer appear anywhere in the file; section headers and adjacent bullets unchanged; JSON parses.
  - **Verify**:
    ```
    node -e "
    const fs=require('fs');
    const f='src/newblog/data/posts/complete-hangover-science-hub-2025.json';
    const j=JSON.parse(fs.readFileSync(f,'utf8'));
    const slugs=['complete-guide-hangover-types-2025','whiskey-vs-vodka-hangover','post-dry-january-smart-drinking-strategies-2025'];
    for(const s of slugs){if(j.content.includes(s)){console.log('FAIL still present: '+s);process.exit(1)}}
    console.log('PASS: 3 deletions applied');
    "
    ```
  - **Commit**: None (batch with 2.1, 2.3, 2.4 into commit #2)
  - _Requirements: FR-6, AC-2.3, EC-1_
  - _Design: D1 (3 DELETE rows), File-by-File Plan §2 Step C_

- [x] 2.3 Apply bulk regex rewrite `(/blog/` → `(/never-hungover/` to remaining links
  - **Do**: In the `content` field of `src/newblog/data/posts/complete-hangover-science-hub-2025.json`, replace all remaining occurrences of the literal string `(/blog/` with `(/never-hungover/`. Anchored to the `(` prefix this matches only markdown link openings; the schema `mainEntityOfPage @id` URL (which has no `(` prefix) is unaffected. After 2.1 and 2.2, exactly 105 links remain to rewrite (112 original − 4 already substituted in 2.1 − 3 deleted in 2.2 = 105).
  - **Files**: `src/newblog/data/posts/complete-hangover-science-hub-2025.json`
  - **Done when**: Zero `(/blog/` substrings remain in the file; JSON parses; the 113th `/blog/` substring (schema `@id` URL with no `(` prefix) is preserved untouched.
  - **Verify**:
    ```
    node -e "
    const fs=require('fs');
    const f='src/newblog/data/posts/complete-hangover-science-hub-2025.json';
    const txt=fs.readFileSync(f,'utf8');
    JSON.parse(txt);
    const blogLinks=(txt.match(/\(\/blog\//g)||[]).length;
    console.log(blogLinks===0 ? 'PASS: 0 (/blog/ links remain' : 'FAIL: '+blogLinks+' (/blog/ links still present');
    "
    ```
  - **Commit**: None (batch with 2.1, 2.2, 2.4 into commit #2)
  - _Requirements: FR-5, AC-2.1, AC-2.2_
  - _Design: File-by-File Plan §2 Step A (executes LAST per design.md ordering)_

- [x] 2.4 [VERIFY] science hub link integrity: 0 dead, 0 broken, expected count
  - **Do**: Run 3 checks: (a) `grep -oE '\(/blog/'` on the hub JSON returns 0 matches, (b) total `/never-hungover/` markdown link count is ≥105, (c) every `/never-hungover/<slug>` markdown link target in the hub content has a matching slug in `src/newblog/data/postRegistry.js` (zero broken refs).
  - **Files**: (read-only verify) `src/newblog/data/posts/complete-hangover-science-hub-2025.json`, `src/newblog/data/postRegistry.js`
  - **Done when**: 0 `/blog/` markdown links; ≥105 `/never-hungover/` links; 0 missing slugs.
  - **Verify**:
    ```
    bash -c "
    set -e
    F='src/newblog/data/posts/complete-hangover-science-hub-2025.json'
    BLOG=\$(grep -oE '\\(/blog/' \"\$F\" | wc -l | tr -d ' ')
    NH=\$(grep -oE '\\(/never-hungover/[a-z0-9-]+\\)' \"\$F\" | wc -l | tr -d ' ')
    echo \"blog_count=\$BLOG never_hungover_count=\$NH\"
    if [ \"\$BLOG\" != \"0\" ]; then echo 'FAIL: /blog/ links still present'; exit 1; fi
    if [ \"\$NH\" -lt 105 ]; then echo 'FAIL: too few /never-hungover/ links'; exit 1; fi
    node -e \"const fs=require('fs');const reg=fs.readFileSync('src/newblog/data/postRegistry.js','utf8');const j=JSON.parse(fs.readFileSync('\$F','utf8'));const links=[...j.content.matchAll(/\\\\(\\\\/never-hungover\\\\/([a-z0-9-]+)\\\\)/g)].map(m=>m[1]);const missing=links.filter(s=>!reg.includes('\\\"'+s+'\\\"'));if(missing.length>0){console.log('FAIL missing:'+missing.join(','));process.exit(1)}console.log('PASS broken=0 unique_targets='+new Set(links).size)\"
    "
    ```
  - **Commit**: After 2.1 + 2.2 + 2.3 + 2.4 all pass, run:
    ```
    git add src/newblog/data/posts/complete-hangover-science-hub-2025.json
    git commit -m "$(cat <<'EOF'
fix(content): rewrite 112 /blog/ links to /never-hungover/ in science hub (#364)

Eliminate 308-redirect-chain crawl-budget tax inside the hangover
science hub content. 105 bulk rewrites + 4 dead-target replacements
(slug typos and topic-adjacent siblings) + 3 line deletions where no
nearest-match exists. Net: 0 /blog/ markdown links remain; all
/never-hungover/ targets exist in postRegistry; broken-internal-link
audit is clean.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
    ```
  - _Requirements: FR-5, FR-6, AC-2.1, AC-2.2, AC-2.3, AC-3.1, NFR-3_
  - _Design: D1, File-by-File Plan §2_

## Phase 3: build + integration verify

- [x] 3.1 [VERIFY] build green; sitemap regenerates; both hub slugs in mega-menu HTML
  - **Do**: Run `npm run build` — must exit 0 (this includes `validate-posts.js`, `vite build`, `verify-z-classes.mjs`, and the prerender step). Then verify the prerendered `dist/index.html` contains BOTH new pillar hub slugs (mega-menu auto-rendered from cluster-config). Check `dist/never-hungover/<both-hub-slugs>/index.html` exist and still emit `Article` schema.
  - **Files**: (read-only verify) `dist/index.html`, `dist/never-hungover/ultimate-dhm-safety-guide-hub-2025/index.html`, `dist/never-hungover/complete-hangover-science-hub-2025/index.html`
  - **Done when**: Build exits 0; both hub slug strings appear ≥2 times each in `dist/index.html`; both hub HTMLs render with `Article` schema preserved.
  - **Verify**:
    ```
    bash -c "
    set -e
    npm run build
    SAFETY=\$(grep -c 'ultimate-dhm-safety-guide-hub-2025' dist/index.html)
    SCIENCE=\$(grep -c 'complete-hangover-science-hub-2025' dist/index.html)
    echo \"mega_menu safety=\$SAFETY science=\$SCIENCE\"
    if [ \"\$SAFETY\" -lt 2 ] || [ \"\$SCIENCE\" -lt 2 ]; then echo 'FAIL: hub slugs missing from mega-menu'; exit 1; fi
    test -f dist/never-hungover/ultimate-dhm-safety-guide-hub-2025/index.html
    test -f dist/never-hungover/complete-hangover-science-hub-2025/index.html
    grep -q '\"@type\":\"Article\"' dist/never-hungover/ultimate-dhm-safety-guide-hub-2025/index.html
    grep -q '\"@type\":\"Article\"' dist/never-hungover/complete-hangover-science-hub-2025/index.html
    echo 'PASS: build green, both hubs in mega-menu, both hub HTMLs render with Article schema'
    "
    ```
  - **Commit**: None (verification only)
  - _Requirements: FR-7, FR-8, AC-1.1, AC-1.2_
  - _Design: §Verification Commands_

- [x] 3.2 [VERIFY] broken internal link audit returns 0 broken refs
  - **Do**: Run `node scripts/check-broken-internal-links.mjs` and confirm exit 0 with 0 broken refs reported.
  - **Files**: (read-only verify) all post JSONs in `src/newblog/data/posts/`
  - **Done when**: Script exits 0; no broken-ref output.
  - **Verify**: `node scripts/check-broken-internal-links.mjs && echo PASS_BROKEN_LINKS`
  - **Commit**: None (verification only)
  - _Requirements: AC-3.1, NFR-3_
  - _Design: §Verification Commands_

## Phase 4: spec scaffold

- [x] 4.1 Stage and commit the 4 spec markdown files
  - **Do**: Stage the 4 spec markdown files and commit. Do NOT stage `.ralph-state.json` or `.progress.md` (state file is for the loop coordinator; progress notes are loop scratch, not part of the PR diff).
  - **Files**: `specs/issue-364-hub-promotion/research.md`, `specs/issue-364-hub-promotion/requirements.md`, `specs/issue-364-hub-promotion/design.md`, `specs/issue-364-hub-promotion/tasks.md`
  - **Done when**: 3rd commit appears in `git log`; only the 4 named markdown files are staged; no other files in the commit.
  - **Verify**:
    ```
    bash -c "
    set -e
    git add specs/issue-364-hub-promotion/research.md specs/issue-364-hub-promotion/requirements.md specs/issue-364-hub-promotion/design.md specs/issue-364-hub-promotion/tasks.md
    STAGED=\$(git diff --cached --name-only | sort)
    EXPECTED=\$(printf 'specs/issue-364-hub-promotion/design.md\nspecs/issue-364-hub-promotion/requirements.md\nspecs/issue-364-hub-promotion/research.md\nspecs/issue-364-hub-promotion/tasks.md\n')
    if [ \"\$STAGED\" != \"\$EXPECTED\" ]; then echo 'FAIL: unexpected staged files:'; echo \"\$STAGED\"; exit 1; fi
    git commit -m \"\$(cat <<'EOF'
chore(spec): scaffold ralph spec artifacts for issue #364

Add research.md, requirements.md, design.md, and tasks.md under
specs/issue-364-hub-promotion/. Documentation artifact only; no
code or content impact.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)\"
    git log --oneline -3
    echo PASS_SPEC_COMMIT
    "
    ```
  - **Commit**: This task IS commit #3 (executes the commit inside the Verify step using exact 4-file staging).
  - _Requirements: NFR-4 (≤3 files of production diff), NFR-5 (3 logical commits)_
  - _Design: §PR Strategy commit #3_

## Notes

- **Commit ordering enforced** (per design.md §PR Strategy):
  1. After 1.1 + 1.2 + 1.3 → `feat(cluster-config): add dhm-safety and hangover-science clusters (#364)` — stages `scripts/cluster-config.json` only.
  2. After 2.1 + 2.2 + 2.3 + 2.4 → `fix(content): rewrite 112 /blog/ links to /never-hungover/ in science hub (#364)` — stages `src/newblog/data/posts/complete-hangover-science-hub-2025.json` only.
  3. Task 4.1 → `chore(spec): scaffold ralph spec artifacts for issue #364` — stages 4 spec markdown files only.
- **Step ordering inside Phase 2** (per design.md §Implementation Steps): substitutions (2.1) → deletions (2.2) → bulk regex (2.3). Bulk regex MUST run last; otherwise it would prefix-rewrite dead targets to `/never-hungover/<dead-slug>` and require a 2nd substitution pass.
- **No `git add -A`**: every commit explicitly stages only the files documented above.
- **Out of scope** (per requirements §Scope): no `Layout.jsx` edits (data-driven mega-menu auto-handles new clusters), no `postRegistry.js` `pillar: true` flag (no consumer in codebase per CLAUDE.md Pattern #10), no `cluster-formalize.mjs --apply` invocation, no schema swap, no `mainEntityOfPage @id` placeholder cleanup.
- **No PR creation tasks**: branch already set to `cleanup/issue-364-hub-promotion` per `.progress.md`; PR creation is post-execution, out of this tasks.md scope.
