# Tasks: Issue #268 — Merge Pipeline for 10 Branches + 7 Follow-ups

Operational task list. Each numbered task is a single autonomous unit a `spec-executor` can run without additional context. Sequencing follows design.md §16. PR numbers from Phase 2 are referenced as `${PR_<label>}` and stored in `specs/issue-268-implementation/pr-urls.txt`.

---

## Phase 1 — Setup (pre-merge baseline)

- [ ] 1. Write `scripts/posthog-baseline.sh`
  - Create file with content per design.md §3.1 (executable bash, captures `pageview_24h`, `affiliate_link_click_24h`, `time_on_page_milestone_24h`, `exception_24h` to `specs/issue-268-implementation/baseline-pre-merge.csv`).
  - Append per-page scroll-50 baseline counts for the 5 fixed comparison posts: `flyby-vs-cheers-complete-comparison-2025`, `flyby-vs-good-morning-pills-complete-comparison-2025`, `double-wood-vs-toniiq-ease-dhm-comparison-2025`, `flyby-vs-dhm1000-complete-comparison-2025`, `flyby-vs-fuller-health-complete-comparison`.
  - `chmod +x scripts/posthog-baseline.sh`.
  - **Verify**: `test -x /Users/patrickkavanagh/dhm-guide-website/scripts/posthog-baseline.sh && bash -n /Users/patrickkavanagh/dhm-guide-website/scripts/posthog-baseline.sh && echo BASELINE_SCRIPT_OK`
  - _Maps to_: US-20 (AC-20.1), FR-10, design §3.1

- [ ] 2. Capture pre-merge baseline snapshot
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && ./scripts/posthog-baseline.sh`.
  - Confirm output file `specs/issue-268-implementation/baseline-pre-merge.csv` exists with at least 4 metric rows.
  - Record capture timestamp into the file (already done by script via `date -u`).
  - **Verify**: `test -s /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/baseline-pre-merge.csv && wc -l /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/baseline-pre-merge.csv`
  - _Maps to_: US-20 (AC-20.1, AC-20.2, AC-20.3), FR-10, design §3.1

- [ ] 3. Anomaly check on baseline (block-go gate)
  - Read baseline-pre-merge.csv; verify `pageview_24h` is non-zero and ≥ 1/2 of weekly average (use `./scripts/posthog-query.sh events` to spot weekly avg).
  - Verify `exception_24h` is not >3× a sane recent average (eyeball; spike → halt).
  - Verify `affiliate_link_click_24h` > 0 (tracker live).
  - If any condition fails, halt and document; do not proceed to Phase 2.
  - **Verify**: `python3 -c "import csv; rows=list(csv.DictReader(open('/Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/baseline-pre-merge.csv'))); pv=int([r for r in rows if r['metric']=='pageview_24h'][0]['value']); aff=int([r for r in rows if r['metric']=='affiliate_link_click_24h'][0]['value']); assert pv>0 and aff>0; print('ANOMALY_CHECK_PASS pv=',pv,'aff=',aff)"`
  - _Maps to_: US-20, design §3.2

---

## Phase 2 — Push branches + open PRs (parallel-safe within phase)

### 2.1 Worktree drift verification (R6, R7) — must run before pushing R6/R7

- [ ] 4. Verify R6 (`feat/template-reviews-cta`) ref matches worktree HEAD
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git rev-parse feat/template-reviews-cta`.
  - Assert SHA == `68372cd...`. If drift, run `git fetch /private/tmp/r6-template-cta feat/template-reviews-cta:feat/template-reviews-cta -f`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git rev-parse feat/template-reviews-cta | grep -q '^68372cd' && echo R6_REF_OK`
  - _Maps to_: US-9 (AC-9.1), design §7.1

- [ ] 5. Verify R7 (`feat/mobile-comparison-above-fold`) ref matches worktree HEAD
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git rev-parse feat/mobile-comparison-above-fold`.
  - Assert SHA == `4269916...`. If drift, run `git fetch /private/tmp/r7-mobile-comparison feat/mobile-comparison-above-fold:feat/mobile-comparison-above-fold -f`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git rev-parse feat/mobile-comparison-above-fold | grep -q '^4269916' && echo R7_REF_OK`
  - _Maps to_: US-10 (AC-10.1), design §7.1

### 2.2 Push branches (10 push tasks; B + C already pushed, no push needed)

- [ ] 6. Push R3 (`fix/canonical-script-404`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin fix/canonical-script-404`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/canonical-script-404 | grep -q 29cb210 && echo R3_PUSHED`
  - _Maps to_: US-3 (AC-3.1), design §4.1

- [ ] 7. Push R5 (`fix/comparison-posts-schema-audit`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin fix/comparison-posts-schema-audit`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/comparison-posts-schema-audit | grep -q d43c5af && echo R5_PUSHED`
  - _Maps to_: US-4 (AC-4.1), design §4.1

- [ ] 8. Push R2 (`fix/widget-attribution-and-mobile-menu`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin fix/widget-attribution-and-mobile-menu`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/widget-attribution-and-mobile-menu | grep -q b06e18b && echo R2_PUSHED`
  - _Maps to_: US-5 (AC-5.1), design §4.1

- [ ] 9. Push R9 (`fix/nac-vs-dhm-dead-clicks`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin fix/nac-vs-dhm-dead-clicks`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/nac-vs-dhm-dead-clicks | grep -q 3bfa474 && echo R9_PUSHED`
  - _Maps to_: US-8 (AC-8.1), design §4.1

- [ ] 10. Push R10 (`chore/hygiene-and-utm`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin chore/hygiene-and-utm`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin chore/hygiene-and-utm | grep -q 3abd076 && echo R10_PUSHED`
  - _Maps to_: US-12 (AC-12.1), design §4.1

- [ ] 11. Push E (`fix/affiliate-button-audit`) using force-with-lease recipe
  - Run the full design.md §6 recipe verbatim against `/Users/patrickkavanagh/dhm-guide-website`:
    ```
    git fetch origin fix/affiliate-button-audit
    REMOTE_SHA=$(git rev-parse origin/fix/affiliate-button-audit 2>/dev/null || echo NEW)
    if [ "$REMOTE_SHA" = "NEW" ]; then git push origin fix/affiliate-button-audit; else git push --force-with-lease=fix/affiliate-button-audit:$REMOTE_SHA origin fix/affiliate-button-audit; fi
    ```
  - On `force-with-lease rejected`, run §6 diagnostic; do NOT escalate to plain `--force`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/affiliate-button-audit | grep -q cdb436c && echo E_PUSHED`
  - _Maps to_: US-7 (AC-7.1), FR-3, design §6

- [ ] 12. Push R1 (`fix/affiliate-regex-and-urls`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin fix/affiliate-regex-and-urls`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/affiliate-regex-and-urls | grep -q f36e8dc && echo R1_PUSHED`
  - _Maps to_: US-6 (AC-6.1), design §4.1

- [ ] 13. Push R6 (`feat/template-reviews-cta`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin feat/template-reviews-cta` (worktree drift already verified in task 4).
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin feat/template-reviews-cta | grep -q 68372cd && echo R6_PUSHED`
  - _Maps to_: US-9 (AC-9.1), FR-4, design §7.2

- [ ] 14. Push R7 (`feat/mobile-comparison-above-fold`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin feat/mobile-comparison-above-fold` (worktree drift already verified in task 5).
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin feat/mobile-comparison-above-fold | grep -q 4269916 && echo R7_PUSHED`
  - _Maps to_: US-10 (AC-10.1), FR-4, design §7.2

- [ ] 15. Push R4 (`test/affiliate-regression`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && git push origin test/affiliate-regression`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin test/affiliate-regression | grep -q a1f036c && echo R4_PUSHED`
  - _Maps to_: US-11 (AC-11.1), design §4.1

### 2.3 Open PRs (12 PR-create tasks)

For each PR, body uses the design.md §4.2 template. Capture each PR number into `specs/issue-268-implementation/pr-urls.txt` (one line: `<label> <PR_URL> <PR_NUM>`).

- [ ] 16. Open PR for B (`fix/time-on-page-milestone`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/time-on-page-milestone --title "fix: remove time_on_page_milestone sampling gate (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nRemoves Math.random() < 0.1 sampling gate from engagement tracking restored by PR #261.\n\nVerification (post-merge):\n- time_on_page_milestone daily count returns to ~70/day within 24h.\n')"`.
  - Append `B <PR_URL> <PR_NUM>` to `specs/issue-268-implementation/pr-urls.txt`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/time-on-page-milestone --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo B_PR_OPEN`
  - _Maps to_: US-1 (AC-1.1), FR-5, design §4.3

- [ ] 17. Open PR for C (`fix/flyby-comparison-pages`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/flyby-comparison-pages --title "fix: render flyby comparison pages (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nFixes flyby-vs-cheers (#4 traffic) and flyby-vs-good-morning-pills which were rendering blank.\n\nVerification (post-merge):\n- curl returns rendered body; scroll-50 events fire within 24h.\n')"`.
  - Append `C <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/flyby-comparison-pages --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo C_PR_OPEN`
  - _Maps to_: US-2 (AC-2.1), FR-5, design §4.3

- [ ] 18. Open PR for R3 (`fix/canonical-script-404`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/canonical-script-404 --title "fix: remove canonical-fix.js 404 reference (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nPure deletion of broken /canonical-fix.js reference (~40 lines). File was committed to repo root, never deployed by Vite. Throws SyntaxError on every page load.\n\nVerification (post-merge):\n- curl /canonical-fix.js returns SPA fallback (text/html); grep canonical-fix on / returns 0.\n')"`.
  - Append `R3 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/canonical-script-404 --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R3_PR_OPEN`
  - _Maps to_: US-3 (AC-3.1), FR-5, design §4.3

- [ ] 19. Open PR for R5 (`fix/comparison-posts-schema-audit`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/comparison-posts-schema-audit --title "fix: convert 3 comparison posts from array-section to markdown (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nConverts 3 broken comparison posts (double-wood-vs-toniiq-ease, flyby-vs-dhm1000, flyby-vs-fuller-health) from array-section schema to markdown.\n\nVerification (post-merge):\n- curl returns non-empty body on all 3 posts; scroll-50 events appear in 24h.\n')"`.
  - Append `R5 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/comparison-posts-schema-audit --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R5_PR_OPEN`
  - _Maps to_: US-4 (AC-4.1), FR-5, design §4.3

- [ ] 20. Open PR for R2 (`fix/widget-attribution-and-mobile-menu`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/widget-attribution-and-mobile-menu --title "fix: canonical product_name + snake_case mobile_menu events (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\ndata-product-name now uses canonical name field (was brand). mobile-menu/mobile_menu event names unified to snake_case.\n\nVerification (post-merge):\n- No new mobile-menu (hyphen) events; affiliate_link_click product_name matches canonical.\n')"`.
  - Append `R2 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/widget-attribution-and-mobile-menu --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R2_PR_OPEN`
  - _Maps to_: US-5 (AC-5.1), FR-5, design §4.3

- [ ] 21. Open PR for R9 (`fix/nac-vs-dhm-dead-clicks`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/nac-vs-dhm-dead-clicks --title "fix: nac-vs-dhm dead-click hot spot (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nWorst dead-click hot spot on site (78 dead-clicks / 73 PV, ~13/session). Code-block dosing → bullet lists; 2 inline /reviews CTAs added; FAQ Q-pills → h3.\n\nVerification (post-merge):\n- dead-clicks-real on nac-vs-dhm drops from 78/30d baseline within 7d.\n')"`.
  - Append `R9 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/nac-vs-dhm-dead-clicks --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R9_PR_OPEN`
  - _Maps to_: US-8 (AC-8.1), FR-5, design §4.3

- [ ] 22. Open PR for R10 (`chore/hygiene-and-utm`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head chore/hygiene-and-utm --title "chore: rotate posthog API key + add dead-clicks-real query + UTM standard (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nRotates dead PostHog API key fallback in scripts/posthog-query.sh; adds dead-clicks-raw and dead-clicks-real subcommands; adds scripts/utm-tag.sh + UTM standard doc.\n\nVerification (post-merge):\n- dead-clicks-real returns count smaller than dead-clicks-raw by ~11 (amzn false-positives).\n')"`.
  - Append `R10 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head chore/hygiene-and-utm --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R10_PR_OPEN`
  - _Maps to_: US-12 (AC-12.1), FR-5, design §4.3

- [ ] 23. Open PR for E (`fix/affiliate-button-audit`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/affiliate-button-audit --title "fix: tag inline blog Amazon links with rel + data-placement (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nInline blog Amazon links (in markdown) now tagged with proper rel and data-placement=\"blog_content_inline\" for PostHog attribution.\n\nVerification (post-merge):\n- Inline anchors in sample post carry data-placement=blog_content_inline.\n')"`.
  - Append `E <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/affiliate-button-audit --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo E_PR_OPEN`
  - _Maps to_: US-7 (AC-7.2), FR-5, design §4.3

- [ ] 24. Open PR for R1 (`fix/affiliate-regex-and-urls`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head fix/affiliate-regex-and-urls --title "fix: add fullerhealth.com to affiliate regex; replace 2 placeholder Compare.jsx URLs (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nAdds fullerhealth.com to AFFILIATE_URL_PATTERN; replaces 2 placeholder Amazon URLs at Compare.jsx:274,336.\n\nVerification (post-merge):\n- ≥1 Fuller Health affiliate_link_click within 7d (was 0 attributable).\n')"`.
  - Append `R1 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head fix/affiliate-regex-and-urls --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R1_PR_OPEN`
  - _Maps to_: US-6 (AC-6.1), FR-5, design §4.3

- [ ] 25. Open PR for R6 (`feat/template-reviews-cta`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head feat/template-reviews-cta --title "feat: auto-render /reviews CTA at mid + end of every blog post (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nHighest-leverage change. Template-level /reviews CTA at mid-content (~30%%) + end on every blog post (188/189). Estimated +90–225 affiliate clicks/month, ~2x site total.\n\nVerification (post-merge):\n- Every blog post has 2 /reviews anchors (verifiable via curl + grep).\n- /reviews PV rises 2–5x from ~60/mo over 4–6w.\n- Site-wide affiliate_link_click rises +60–120%% over 4–6w.\n')"`.
  - Append `R6 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head feat/template-reviews-cta --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R6_PR_OPEN`
  - _Maps to_: US-9 (AC-9.1), FR-5, design §4.3

- [ ] 26. Open PR for R7 (`feat/mobile-comparison-above-fold`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head feat/mobile-comparison-above-fold --title "feat: comparison table above-fold on mobile (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nComparison table moved above-fold on mobile only (order-first md:order-none). Targets the 2.9x mobile CR advantage. CLS reserved with min-h-*.\n\nVerification (post-merge):\n- Mobile viewport renders comparison before prose; desktop unchanged.\n- Lighthouse mobile CLS does not regress (>0.1 = revert).\n- Mobile CR trends up over 4–6w from 3.57%% baseline.\n')"`.
  - Append `R7 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head feat/mobile-comparison-above-fold --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R7_PR_OPEN`
  - _Maps to_: US-10 (AC-10.1), FR-5, design §4.3

- [ ] 27. Open PR for R4 (`test/affiliate-regression`)
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && gh pr create --base main --head test/affiliate-regression --title "test: playwright affiliate regression suite via dataLayer (#268)" --body "$(printf 'Part of #268 — PostHog deep-eval action plan.\n\nSpec: specs/issue-268-implementation/\n\nPlaywright regression suite asserts via window.dataLayer (PostHog suppresses init in headless Chromium). 4/4 pass.\n\nVerification (post-merge):\n- npx playwright test --config=playwright.affiliate.config.js passes 4/4 against main.\n')"`.
  - Append `R4 <PR_URL> <PR_NUM>` to pr-urls.txt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr list --head test/affiliate-regression --json number --jq '.[0].number' | grep -E '^[0-9]+$' && echo R4_PR_OPEN`
  - _Maps to_: US-11 (AC-11.1), FR-5, design §4.3

### 2.4 Wait for Vercel preview builds to go green

- [ ] 28. Wait for all 12 Vercel preview builds to go green
  - For each PR number in `specs/issue-268-implementation/pr-urls.txt`, run `gh pr checks <PR_NUM> --watch` (or poll with `gh pr checks <PR_NUM>` until all show ✓).
  - Maximum total wait: 15 min. If any preview is red, do not proceed; investigate locally with `npm run build` on that branch.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && for n in $(awk '{print $3}' specs/issue-268-implementation/pr-urls.txt); do gh pr checks "$n" | grep -q -E 'fail|pending|error' && echo "PR $n NOT GREEN" && exit 1 || true; done && echo ALL_PREVIEWS_GREEN`
  - _Maps to_: NFR-1, design §5.1 step 1

---

## Phase 3a — Merge B + C (already-pushed; smallest blast radius)

Each merge task embeds the standard per-merge gate (design.md §5.1): merge → wait 5 min → HogQL gate → pass-or-revert.

- [ ] 29. Merge B (`fix/time-on-page-milestone`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR_B=$(grep '^B ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr checks $PR_B | grep -q fail && echo HALT && exit 1 || true`.
  - `gh pr merge $PR_B --squash --delete-branch`.
  - `sleep 300` (5 min for Vercel deploy).
  - Run gate: `./scripts/posthog-query.sh events | tee specs/issue-268-implementation/gate-${PR_B}.log`. Compare `$pageview` and `affiliate_link_click` counts to baseline-pre-merge.csv (must be ≥50%).
  - On gate fail: `sleep 180`; recheck. Still fail: `git fetch origin main && git revert --no-edit $(gh pr view $PR_B --json mergeCommit --jq '.mergeCommit.oid') && git push origin main`; halt.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^B ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo B_MERGED`
  - _Maps to_: US-1 (AC-1.2, AC-1.4), US-21, FR-1, FR-2, design §5.1, §5.2

- [ ] 30. Merge C (`fix/flyby-comparison-pages`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR_C=$(grep '^C ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr checks $PR_C | grep -q fail && echo HALT && exit 1 || true`.
  - `gh pr merge $PR_C --squash --delete-branch`.
  - `sleep 300`. Run gate as task 29; revert on fail.
  - Smoke check: `curl -sf https://www.dhmguide.com/never-hungover/flyby-vs-cheers-complete-comparison-2025 | grep -q -i 'cheers' && echo FLYBY_CHEERS_RENDERS`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^C ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo C_MERGED`
  - _Maps to_: US-2 (AC-2.2, AC-2.3, AC-2.4), US-21, design §5.2

- [ ] 31. Phase 3a checkpoint: log baseline-vs-post-deploy comparison command for 24h follow-up
  - Append to `specs/issue-268-implementation/post-deploy-watchlist.md` (create if missing): `[ ] (B+C 24h) ./scripts/posthog-query.sh events  # compare to baseline-pre-merge.csv pageview_24h, time_on_page_milestone_24h`.
  - Note: `time_on_page_milestone` recovery (~10/day → ~70/day) is a 24h horizon — cannot be fully verified in this session.
  - **Verify**: `test -s /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/post-deploy-watchlist.md && grep -q 'B+C 24h' /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/post-deploy-watchlist.md && echo CHECKPOINT_3A_OK`
  - _Maps to_: US-1 (AC-1.4), US-22, design §10.4

---

## Phase 3b — Parallel-safe merge sequence (R10 → R3 → R5 → R2 → R9)

Sequential merges; standard gate (design.md §5.1) between each. Order chosen for minimal-risk-first (design.md §5.3).

- [ ] 32. Merge R10 (`chore/hygiene-and-utm`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R10 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard HogQL gate; revert on fail.
  - Smoke check (R10-specific): `./scripts/posthog-query.sh dead-clicks-real | head -1 && echo DEAD_CLICKS_REAL_WORKS`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R10 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R10_MERGED`
  - _Maps to_: US-12 (AC-12.2, AC-12.3, AC-12.4), US-21, design §5.3

- [ ] 33. Merge R3 (`fix/canonical-script-404`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R3 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Smoke checks (R3-specific):
    - `curl -s https://www.dhmguide.com/ | grep -c canonical-fix` must return `0`.
    - `curl -sI https://www.dhmguide.com/canonical-fix.js | grep -E 'HTTP/|content-type' | head -2` should show 200 + text/html.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R3 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && curl -s https://www.dhmguide.com/ | grep -c canonical-fix | grep -q '^0$' && echo R3_MERGED_AND_CLEAN`
  - _Maps to_: US-3 (AC-3.2, AC-3.3, AC-3.4), US-21, design §5.3

- [ ] 34. Merge R5 (`fix/comparison-posts-schema-audit`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R5 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Smoke check: `for slug in double-wood-vs-toniiq-ease-dhm-comparison-2025 flyby-vs-dhm1000-complete-comparison-2025 flyby-vs-fuller-health-complete-comparison; do curl -sf "https://www.dhmguide.com/never-hungover/$slug" | wc -c | awk -v s=$slug '$1<5000{print s" SHORT "$1; exit 1}'; done && echo R5_POSTS_RENDER`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R5 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R5_MERGED`
  - _Maps to_: US-4 (AC-4.2, AC-4.3, AC-4.4), US-21, design §5.3

- [ ] 35. Merge R2 (`fix/widget-attribution-and-mobile-menu`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R2 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - R2-specific spot-check: `./scripts/posthog-query.sh events | grep -E 'mobile-menu|mobile_menu' || true` — record current counts for the 24h watchlist.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R2 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R2_MERGED`
  - _Maps to_: US-5 (AC-5.2, AC-5.3, AC-5.4), US-21, design §5.3

- [ ] 36. Merge R9 (`fix/nac-vs-dhm-dead-clicks`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R9 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Smoke check: `curl -s https://www.dhmguide.com/never-hungover/nac-vs-dhm-which-is-better-for-hangover-prevention | grep -c '/reviews' | awk '$1<2{exit 1}' && echo R9_REVIEWS_CTAS_PRESENT`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R9 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R9_MERGED`
  - _Maps to_: US-8 (AC-8.2, AC-8.4), US-21, design §5.3

- [ ] 37. Phase 3b checkpoint: cumulative event-volume sanity
  - Run `cd /Users/patrickkavanagh/dhm-guide-website && ./scripts/posthog-query.sh events | tee specs/issue-268-implementation/checkpoint-3b.log`.
  - Compare `$pageview`, `affiliate_link_click`, `$exception` counts to baseline-pre-merge.csv. Confirm no >50% drop and no >3× exception spike.
  - Log scroll-50 events for the 5 fixed comparison posts (24h horizon — log query for follow-up). Append to post-deploy-watchlist.md.
  - **Verify**: `test -s /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/checkpoint-3b.log && python3 -c "import csv; b=int([r['value'] for r in csv.DictReader(open('/Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/baseline-pre-merge.csv')) if r['metric']=='pageview_24h'][0]); assert b>0; print('CHECKPOINT_3B_OK baseline_pv=',b)"`
  - _Maps to_: US-21, US-22, NFR-4, design §5.1

---

## Phase 3c — File-contention sequence (E → R1 → R6 → R7)

Strict order required (design.md §5.4). Standard gate (§5.1) between each, plus extra checks per task.

- [ ] 38. Merge E (`fix/affiliate-button-audit`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^E ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Smoke check: pick a sample blog post with inline Amazon links and `curl -s <URL> | grep -c 'data-placement="blog_content_inline"'` ≥ 1.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^E ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo E_MERGED`
  - _Maps to_: US-7 (AC-7.3, AC-7.4), US-21, design §5.4

- [ ] 39. Merge R1 (`fix/affiliate-regex-and-urls`) + post-merge gate
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R1 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Smoke check: `curl -s https://www.dhmguide.com/compare | grep -c 'amzn.to' | awk '$1<2{exit 1}' && echo R1_AMZN_LINKS_LIVE`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R1 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R1_MERGED`
  - _Maps to_: US-6 (AC-6.2, AC-6.3, AC-6.5), US-21, design §5.4

- [ ] 40. Merge R6 (`feat/template-reviews-cta`) + post-merge gate + CTA injection check
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R6 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - Special CTA-injection check (design.md §5.4): `for slug in benefits-of-dhm dhm-guide hangover-prevention; do curl -s "https://www.dhmguide.com/never-hungover/$slug" | grep -c '/reviews' | awk -v s=$slug '$1<2{print s" CTA_MISSING "$1; exit 1}'; done && echo R6_TEMPLATE_CTA_LIVE`.
  - Append 4–6w watchlist row: `[ ] 2026-05-23 R6: /reviews PV (target 2–5x); affiliate_link_click +60–120%`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R6 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R6_MERGED`
  - _Maps to_: US-9 (AC-9.2, AC-9.3, AC-9.4, AC-9.5), US-21, design §5.4

- [ ] 41. Merge R7 (`feat/mobile-comparison-above-fold`) + post-merge gate + Lighthouse CLS check
  - **Pre-merge**: capture pre-R7 mobile CLS baseline: `cd /Users/patrickkavanagh/dhm-guide-website && npx --yes lighthouse https://www.dhmguide.com/compare --preset=desktop --only-categories=performance --output=json --output-path=specs/issue-268-implementation/lighthouse-pre-r7.json --quiet --chrome-flags="--headless" || echo LIGHTHOUSE_PRE_SKIPPED`.
  - `PR=$(grep '^R7 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - **Post-merge mobile CLS check**: `npx --yes lighthouse https://www.dhmguide.com/compare --form-factor=mobile --only-categories=performance --output=json --output-path=specs/issue-268-implementation/lighthouse-post-r7.json --quiet --chrome-flags="--headless"`. Compare `audits["cumulative-layout-shift"].numericValue` pre vs post; if delta > 0.1, revert R7 via `git revert <merge-sha> && git push origin main`.
  - Append 4–6w watchlist row: `[ ] 2026-05-23 R7: mobile CR (target trending up from 3.57%); mobile PV share (target 25%+)`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R7 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && echo R7_MERGED`
  - _Maps to_: US-10 (AC-10.2, AC-10.3, AC-10.4, AC-10.5), US-21, NFR-6, design §5.4

- [ ] 42. Phase 3c checkpoint: log /reviews PV trend command for 4–6w follow-up
  - Append to `specs/issue-268-implementation/post-deploy-watchlist.md`: `[ ] (R6 4–6w 2026-05-23) ./scripts/posthog-query.sh events  # compare /reviews pageview to baseline ~60/mo, target 2–5x`.
  - Note: /reviews PV trend (4–6w horizon) cannot be fully verified in this session — log query for later.
  - **Verify**: `grep -q 'R6 4–6w' /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/post-deploy-watchlist.md && echo CHECKPOINT_3C_OK`
  - _Maps to_: US-9 (AC-9.4, AC-9.5), US-22, design §10.4

---

## Phase 3d — Test infra (R4)

- [ ] 43. Merge R4 (`test/affiliate-regression`) + post-merge gate + Playwright run
  - `cd /Users/patrickkavanagh/dhm-guide-website && PR=$(grep '^R4 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr merge $PR --squash --delete-branch`. `sleep 300`. Run standard gate; revert on fail.
  - **Run Playwright suite** locally against deployed site: `cd /Users/patrickkavanagh/dhm-guide-website && PLAYWRIGHT_BASE_URL=https://www.dhmguide.com npx playwright test --config=playwright.affiliate.config.js`.
  - Expect 4/4 pass. If fail, do NOT revert (tests are post-merge-validation only); investigate test calibration vs deployed state.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view $(grep '^R4 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}') --json state --jq .state | grep -q MERGED && PLAYWRIGHT_BASE_URL=https://www.dhmguide.com npx playwright test --config=playwright.affiliate.config.js 2>&1 | grep -E '4 passed|4/4' && echo R4_MERGED_AND_TESTS_PASS`
  - _Maps to_: US-11 (AC-11.2, AC-11.3), US-21, NFR-3, design §5.5

---

## Phase 4 — Follow-ups (6 implementable + 1 user-action surfaced)

Detection helper: `git fetch origin main && git merge-base --is-ancestor <sha> origin/main` (design.md §9.2).

- [ ] 44. Follow-up #4 — Add methodology caveat to `02-top-pages.md` (independent, no upstream gate)
  - `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git checkout -b docs/268-fu4-methodology-caveat origin/main`.
  - Edit `docs/posthog-analysis-2026-04-25/02-top-pages.md`: prepend a `## Methodology Caveat` section near the top warning that period-over-period framing is fooled by isolated direct-traffic spikes; reference the dhm-vs-zbiotics misread; recommend longer baselines or referrer-broken-out comparisons.
  - `git add docs/posthog-analysis-2026-04-25/02-top-pages.md && git commit -m "docs(posthog-analysis): add methodology caveat re period-over-period framing (#268)" && git push -u origin docs/268-fu4-methodology-caveat`.
  - `gh pr create --base main --title "docs: methodology caveat for period-over-period framing (#268)" --body "Part of #268 follow-up #4. Adds caveat referencing dhm-vs-zbiotics misread."`.
  - `gh pr merge --squash --delete-branch` after Vercel preview green.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git show origin/main:docs/posthog-analysis-2026-04-25/02-top-pages.md | grep -q 'Methodology Caveat' && echo FU4_LANDED`
  - _Maps to_: US-16 (AC-16.1, AC-16.2, AC-16.3), FR-8, design §9.4

- [ ] 45. Follow-up #3 — Replace placeholder Amazon URLs in 3 blog JSONs (independent)
  - `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git checkout -b fix/268-fu3-blog-amazon-urls origin/main`.
  - `grep -rl 'amazon.com/dhm1000-dihydromyricetin\|amazon.com/dhm-depot-dihydromyricetin' src/newblog/data/posts/` → 3 JSON files. Replace each placeholder with the same `amzn.to` short link used in R1 (read R1's `git show f36e8dc -- src/pages/Compare.jsx` to identify exact target URL).
  - `npm run build` locally — must pass validate-posts thresholds.
  - `git add src/newblog/data/posts/*.json && git commit -m "fix(blog): replace placeholder Amazon URLs in 3 posts to match Compare.jsx (#268)" && git push -u origin fix/268-fu3-blog-amazon-urls`.
  - `gh pr create --base main --title "fix: replace placeholder Amazon URLs in 3 blog post JSONs (#268)" --body "Part of #268 follow-up #3. Mirrors R1's Compare.jsx URL fix into 3 referenced post JSONs."`.
  - `gh pr merge --squash --delete-branch` after preview green.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && ! git grep 'amazon.com/dhm1000-dihydromyricetin\|amazon.com/dhm-depot-dihydromyricetin' origin/main -- 'src/newblog/data/posts/*.json' && echo FU3_LANDED`
  - _Maps to_: US-15 (AC-15.1, AC-15.2, AC-15.3), FR-8, NFR-2, design §9.4

- [ ] 46. Follow-up #1 — `flyby-vs-fuller-health` image dict→string fix (gated on R5 merged)
  - **Gate**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git merge-base --is-ancestor d43c5af origin/main && echo R5_LANDED || (echo NOT_YET; exit 1)`.
  - `git checkout -b fix/268-fu1-flyby-fuller-image origin/main`.
  - Open `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json`; convert the `image` field from dict to string per Pattern #8 (extract nested `src`/path or set to `null`).
  - `npm run build` — must produce zero `unsafe.replace is not a function` warnings.
  - `git add src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json && git commit -m "fix(blog): flyby-vs-fuller-health image dict to string (Pattern #8) (#268)" && git push -u origin fix/268-fu1-flyby-fuller-image`.
  - `gh pr create --base main --title "fix: flyby-vs-fuller-health image dict to string (#268)" --body "Part of #268 follow-up #1. Pattern #8 fix; eliminates unsafe.replace build warning."`.
  - `gh pr merge --squash --delete-branch` after preview green.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && npm run build 2>&1 | grep -c 'unsafe.replace is not a function' | grep -q '^0$' && echo FU1_LANDED`
  - _Maps to_: US-13 (AC-13.1, AC-13.2, AC-13.3), FR-8, NFR-1, design §9.4

- [ ] 47. Follow-up #2 — DHM1000 brand mismatch in `Compare.jsx:262` (gated on R1 merged)
  - **Gate**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git merge-base --is-ancestor f36e8dc origin/main && echo R1_LANDED || (echo NOT_YET; exit 1)`.
  - `git checkout -b fix/268-fu2-dhm1000-brand origin/main`.
  - Edit `src/pages/Compare.jsx` near line 262: change "Double Wood Supplements" → "Dycetin" (the canonical name from `Reviews.jsx`, matching the live Amazon listing).
  - `npm run build` (sanity).
  - `git add src/pages/Compare.jsx && git commit -m "fix(compare): unify DHM1000 brand name to Dycetin (#268)" && git push -u origin fix/268-fu2-dhm1000-brand`.
  - `gh pr create --base main --title "fix: unify DHM1000 brand name to Dycetin in Compare.jsx (#268)" --body "Part of #268 follow-up #2. Matches Reviews.jsx and the live Amazon listing; prevents PostHog product attribution split."`.
  - `gh pr merge --squash --delete-branch` after preview green.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git show origin/main:src/pages/Compare.jsx | grep -A2 -B2 -i 'dhm1000\|dycetin\|double wood' | grep -q -i Dycetin && echo FU2_LANDED`
  - _Maps to_: US-14 (AC-14.1, AC-14.2, AC-14.3), FR-8, design §9.4

- [ ] 48. Follow-up #5 — Drop redundant `<ReviewsCTA />` from related-posts area (gated on R6 merged)
  - **Gate**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git merge-base --is-ancestor 68372cd origin/main && echo R6_LANDED || (echo NOT_YET; exit 1)`.
  - `git checkout -b fix/268-fu5-drop-redundant-reviewscta origin/main`.
  - Open `src/newblog/components/NewBlogPost.jsx`; locate the `<ReviewsCTA />` block in the related-posts area (was at lines 1390-1402; line numbers may have shifted post-R6 — search for `ReviewsCTA`).
  - Remove the redundant block (template adds mid + end CTAs; related-posts CTA = third = overkill).
  - `npm run build` (sanity).
  - `git add src/newblog/components/NewBlogPost.jsx && git commit -m "fix(blog): drop redundant ReviewsCTA from related-posts area (#268)" && git push -u origin fix/268-fu5-drop-redundant-reviewscta`.
  - `gh pr create --base main --title "fix: drop redundant ReviewsCTA from related-posts area (#268)" --body "Part of #268 follow-up #5. R6 added template-level mid+end CTAs; this related-posts CTA is now the third per post."`.
  - `gh pr merge --squash --delete-branch` after preview green.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && SAMPLE=$(curl -s https://www.dhmguide.com/never-hungover/dhm-guide); echo "$SAMPLE" | grep -c '/reviews' | awk '$1==2{print "FU5_TWO_CTAS_OK"; exit 0} {print "FU5_CTA_COUNT="$1; exit 1}'`
  - _Maps to_: US-17 (AC-17.1, AC-17.2, AC-17.3), FR-8, design §9.4

- [ ] 49. Follow-up #6 — Close PR #259 (gated on R6 deployed)
  - **Gate**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && git merge-base --is-ancestor 68372cd origin/main && echo R6_LANDED || (echo NOT_YET; exit 1)`.
  - Spot-check: confirm 5 zero-conversion posts that #259 originally targeted now receive the template CTA: `for slug in <slug1> <slug2> ...; do curl -s "https://www.dhmguide.com/never-hungover/$slug" | grep -c '/reviews' | awk -v s=$slug '$1<2{print s" CTA_MISSING"; exit 1}'; done` (replace placeholder slugs by reading PR #259's diff: `gh pr view 259 --json files --jq '.files[].path'`).
  - `R6_PR=$(grep '^R6 ' specs/issue-268-implementation/pr-urls.txt | awk '{print $3}')`.
  - `gh pr close 259 --comment "Superseded by #${R6_PR} (feat/template-reviews-cta) — template-level CTA covers all blog posts. See issue #268."`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view 259 --json state --jq .state | grep -q CLOSED && echo FU6_PR_259_CLOSED`
  - _Maps to_: US-18 (AC-18.1, AC-18.2), US-24, FR-7, design §9.4, §10.2

---

## Phase 5 — Cleanup

- [ ] 50. Delete `fix/affiliate-dead-clicks` (local + origin if present)
  - Local: `cd /Users/patrickkavanagh/dhm-guide-website && git branch -D fix/affiliate-dead-clicks`.
  - Origin: `cd /Users/patrickkavanagh/dhm-guide-website && git ls-remote --heads origin fix/affiliate-dead-clicks | grep -q . && git push origin --delete fix/affiliate-dead-clicks || echo not-on-origin`.
  - Append rationale to issue #268 thread: `gh issue comment 268 --body "Closing branch fix/affiliate-dead-clicks unmerged. Globally setting capture_dead_clicks: false would kill genuine UX signal site-wide (e.g., the nac-vs-dhm hot spot R9 just fixed). R10's dead-clicks-real query-time filter is the right approach."`.
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && ! git branch -a | grep -q affiliate-dead-clicks && echo BRANCH_DELETED`
  - _Maps to_: US-23 (AC-23.1, AC-23.2, AC-23.3), FR-6, design §10.1

- [ ] 51. Confirm PR #259 closed
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && gh pr view 259 --json state --jq .state | grep -q CLOSED && echo PR_259_CONFIRMED_CLOSED`
  - _Maps to_: US-24 (AC-24.1, AC-24.2), FR-7, design §10.2

- [ ] 52. Surface `~/.zshrc` recommendation in final summary (USER ACTION)
  - Append to `specs/issue-268-implementation/.user-actions.md` (create if missing):
    ```
    ## USER ACTION REQUIRED
    Add the following line to ~/.zshrc per CLAUDE.md (the agent cannot edit your shell rc file):
    
        export POSTHOG_PERSONAL_API_KEY=phx_REDACTED
    
    The working key is currently only in scripts/posthog-query.sh's fallback default and ~/.claude/history.jsonl.
    ```
  - The agent's final response message MUST include this recommendation block verbatim.
  - **Verify**: `test -s /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/.user-actions.md && grep -q POSTHOG_PERSONAL_API_KEY /Users/patrickkavanagh/dhm-guide-website/specs/issue-268-implementation/.user-actions.md && echo USER_ACTION_DOCUMENTED`
  - _Maps to_: US-19 (AC-19.1, AC-19.2), US-25 (AC-25.1, AC-25.2), FR-9, design §10.3

- [ ] 53. Schedule 4–6w post-deploy monitoring for R6 / R7
  - Append to `specs/issue-268-implementation/post-deploy-watchlist.md` (create if missing):
    ```
    [ ] 2026-05-23 R6 — /reviews PV (baseline ~60/mo, target 2–5x); site-wide affiliate_link_click (baseline ~56/30d, target +60–120%)
    [ ] 2026-05-23 R7 — mobile CR (baseline 3.57%, target trending up); mobile PV share (baseline 15%, target 25%+)
    [ ] 2026-05-02 R1 — Fuller Health affiliate_link_click count (baseline 0, target ≥1 within 7d)
    [ ] 2026-05-02 R9 — dead-clicks-real on /never-hungover/nac-vs-dhm (baseline 78/30d, target measurable drop within 7d)
    ```
  - These 4–6w / 7d checks are NOT blocking on this spec's completion (per US-22 AC-22.3).
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && grep -c '2026-05-' specs/issue-268-implementation/post-deploy-watchlist.md | awk '$1>=4{exit 0}{exit 1}' && echo WATCHLIST_OK`
  - _Maps to_: US-22 (AC-22.1, AC-22.3), FR-12, design §10.4

- [ ] 54. Final verification: all 18 PRs squash-merged or closed appropriately on `main`
  - `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main`.
  - For each commit SHA in: `369dd0b d2b6b09 29cb210 d43c5af b06e18b 3bfa474 3abd076 cdb436c f36e8dc 68372cd 4269916 a1f036c` — verify `git merge-base --is-ancestor <sha> origin/main`.
  - For follow-up PRs (FU#1–FU#6) — verify each merged PR appears in `git log origin/main --oneline -50 | grep '#268'` (count ≥ 18 = 12 main + 6 follow-ups, minus FU#7 user-action and FU#6 close-only = at least 17 commits referencing #268).
  - **Verify**: `cd /Users/patrickkavanagh/dhm-guide-website && git fetch origin main && for s in 369dd0b d2b6b09 29cb210 d43c5af b06e18b 3bfa474 3abd076 cdb436c f36e8dc 68372cd 4269916 a1f036c; do git merge-base --is-ancestor "$s" origin/main || (echo "MISSING $s"; exit 1); done && echo ALL_12_BRANCHES_LANDED`
  - _Maps to_: US-1 through US-24, FR-1, FR-8, design §14

---

## Notes

- **Pre-existing analytics regression**: `time_on_page_milestone` ~10/day → ~70/day recovery is a 24h horizon — the in-session HogQL gate (task 29) confirms volume non-regression, but full recovery validation logged for the user via task 31 + post-deploy-watchlist.md.
- **/reviews PV trend (R6) and mobile CR (R7)**: 4–6 week horizons; tasks 42 + 53 log the queries for the user.
- **Wall-clock budget**: tasks 28 (preview wait) + 12 merges × ~5 min gate (~60–80 min) + follow-ups (~60–90 min) ≈ 2–3 hours total (matches NFR-8).
- **Skipped branch**: `fix/affiliate-dead-clicks` is deleted unmerged (task 50). Rationale documented in requirements.md §7 and posted to issue #268.
- **No CI gating beyond Vercel preview**: design.md §13.2 — Playwright (R4) is post-merge validation only; no GH Actions workflow runs it.
- **Force-push only on E (task 11)**: per design.md §6 explicit-SHA `--force-with-lease`. All other pushes are plain.
- **Worktree drift defense**: tasks 4–5 verify R6/R7 SHAs match `/private/tmp/*` worktree heads before push (design.md §7.1).
- **Squash-merge throughout**: every `gh pr merge` uses `--squash --delete-branch` (FR-1, OR-3, design.md §13.1).
- **USER ACTION (FU#7)**: `~/.zshrc` recommendation surfaced in task 52; agent does NOT edit user's shell rc file (FR-9, US-19/US-25).
