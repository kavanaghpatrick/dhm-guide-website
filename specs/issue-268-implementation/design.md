# Design: Issue #268 — Merge Pipeline for 10 Branches + 7 Follow-ups

## 1. Overview

This is an **operational design**, not a software-architecture design. No new system is being built. The "system" here is a **merge pipeline** that lands 12 commits on `main` (10 unmerged branches + 2 already-pushed) and 6 follow-up commits, each behind its own squash-merged PR, with a HogQL-based per-merge analytics gate.

**Why a pipeline (not a free-for-all merge)**: Vercel auto-deploys from `main` and **cancels in-flight production builds when a newer commit lands**. Naive rapid-fire merges collapse 10 PRs into 1 production deploy and erase per-PR attribution — meaning we cannot identify which PR caused a regression. The pipeline trades wall-clock (60–80 min merge phase) for clean attribution and per-merge revertibility.

**Three constraints that shape every decision below**:
1. Vercel build cancellation → sequential merges with ≥5 min spacing.
2. Per-PR attribution requirement → squash-merge (one SHA per PR; `git revert <sha>` is the rollback primitive).
3. No shared-CI quality gate beyond Vercel's build → HogQL event-volume sanity check is the only between-merge guardrail. Playwright tests exist (R4) but are post-merge-validation only; they do not block merges.

**Honest gaps**:
- Playwright suite (R4) does **not** run in CI (no GitHub Actions workflow runs it). It only runs locally via `npx playwright test`. We will not gate merges on it.
- `npm run build` runs locally per branch but is not enforced by branch-protection rules. Vercel preview build is the de facto pre-merge build gate.
- The HogQL gate is **event-volume sanity only** — it cannot detect subtle correctness regressions (e.g., wrong `product_name` attribution); those require post-deploy targeted queries from §8.

---

## 2. Architecture

```
                            ISSUE #268 MERGE PIPELINE
                            =========================

  ┌─────────────────────────────────────────────────────────────────────┐
  │ PHASE 1: Pre-merge baseline (one-shot, ~3 min)                      │
  │  scripts/posthog-baseline.sh  →  baseline-pre-merge.csv             │
  │  Anomaly check → block if Apr-7-style regression already in flight  │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ PHASE 2: PR-creation (parallel, ~10 min)                            │
  │   ┌──────────┐ ┌──────────┐ ┌──────────┐  ... 10 branches          │
  │   │ push B   │ │ push C   │ │ push R3  │   • fetch worktrees R6/R7 │
  │   │ gh pr… B │ │ gh pr… C │ │ gh pr… R3│   • force-with-lease E    │
  │   └──────────┘ └──────────┘ └──────────┘   • collect 10 PR URLs    │
  │      Vercel queues 10 parallel preview builds                       │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ PHASE 3: Merge sequence (sequential, ~50–70 min)                    │
  │                                                                     │
  │   3a  B  →  C            (already-pushed, smallest blast radius)    │
  │   3b  R10 → R3 → R5 → R2 → R9     (parallel-safe, sequential merge) │
  │   3c  E  →  R1  →  R6  →  R7     (file-contention, careful)         │
  │   3d  R4                  (test infra last, reflects final state)   │
  │                                                                     │
  │   Between each merge:                                               │
  │     • wait ≥5 min (Vercel deploy)                                   │
  │     • HogQL gate: $pageview & affiliate_link_click ≥50% of baseline │
  │     • PASS → next   FAIL → wait 3min, recheck   STILL FAIL → revert │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ PHASE 4: Follow-ups (~60–90 min)                                    │
  │   Independent (any order):  #3 #4 #6                                │
  │   Dependent (gated by upstream merge):                              │
  │     #1 ← after R5            #2 ← after R1            #5 ← after R6 │
  │   User-action (recommend only): #7 ~/.zshrc                         │
  └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ PHASE 5: Cleanup                                                    │
  │   • git push origin --delete fix/affiliate-dead-clicks              │
  │   • git branch -D fix/affiliate-dead-clicks                         │
  │   • Confirm PR #259 closed (after R6 deploy)                        │
  │   • Surface ~/.zshrc recommendation in final summary                │
  │   • Schedule 4–6w monitoring for R6 / R7                            │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Pre-merge Baseline

### 3.1 What runs

Create `scripts/posthog-baseline.sh` (does not exist yet; design includes its creation as Task-0 in the tasks phase). Output: `specs/issue-268-implementation/baseline-pre-merge.csv` with timestamp.

```bash
#!/usr/bin/env bash
# scripts/posthog-baseline.sh
set -euo pipefail
API_KEY="${POSTHOG_PERSONAL_API_KEY:-phx_REDACTED}"
BASE="https://us.posthog.com/api/projects/@current/query"
OUT="specs/issue-268-implementation/baseline-pre-merge.csv"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "metric,value,window,captured_at" > "$OUT"

hog() {
  curl -s -X POST "$BASE" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$1" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["results"][0][0] if d.get("results") else 0)'
}

PV24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event=$pageview AND timestamp > now() - INTERVAL 24 HOUR"}}')
AFF24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event=affiliate_link_click AND timestamp > now() - INTERVAL 24 HOUR"}}')
TOP24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event=time_on_page_milestone AND timestamp > now() - INTERVAL 24 HOUR"}}')
EXC24=$(hog '{"query":{"kind":"HogQLQuery","query":"SELECT count() FROM events WHERE event=$exception AND timestamp > now() - INTERVAL 24 HOUR"}}')

echo "pageview_24h,$PV24,24h,$TS" >> "$OUT"
echo "affiliate_link_click_24h,$AFF24,24h,$TS" >> "$OUT"
echo "time_on_page_milestone_24h,$TOP24,24h,$TS" >> "$OUT"
echo "exception_24h,$EXC24,24h,$TS" >> "$OUT"
```

Plus the 5 per-page scroll-50 counts on the fixed comparison posts (separate query, appended to the same CSV).

### 3.2 Anomaly definition (block-go condition)

Block Phase 2 if **any** of:
- `pageview_24h` < 50% of weekly average (deploy-fail or DNS issue in flight)
- `exception_24h` > 3× weekly average (active site error spike)
- `affiliate_link_click_24h == 0` (tracker broken; fix tracking before merging revenue features)

Otherwise, log baseline and proceed.

---

## 4. Phase 2: PR-creation (parallel)

### 4.1 Branch → PR mapping (12 PRs)

| # | Branch | Commit | Push action | Worktree fetch? | PR title (= commit subject) |
|---|---|---|---|---|---|
| B | `fix/time-on-page-milestone` | `369dd0b` | already on origin | no | `fix: remove time_on_page_milestone sampling gate (#268)` |
| C | `fix/flyby-comparison-pages` | `d2b6b09` | already on origin | no | `fix: render flyby comparison pages (#268)` |
| R3 | `fix/canonical-script-404` | `29cb210` | `git push origin fix/canonical-script-404` | no | `fix: remove canonical-fix.js 404 reference (#268)` |
| R5 | `fix/comparison-posts-schema-audit` | `d43c5af` | `git push origin fix/comparison-posts-schema-audit` | no | `fix: convert 3 comparison posts from array-section to markdown (#268)` |
| R2 | `fix/widget-attribution-and-mobile-menu` | `b06e18b` | `git push origin fix/widget-attribution-and-mobile-menu` | no | `fix: canonical product_name + snake_case mobile_menu events (#268)` |
| R9 | `fix/nac-vs-dhm-dead-clicks` | `3bfa474` | `git push origin fix/nac-vs-dhm-dead-clicks` | no | `fix: nac-vs-dhm dead-click hot spot (#268)` |
| R10 | `chore/hygiene-and-utm` | `3abd076` | `git push origin chore/hygiene-and-utm` | no | `chore: rotate posthog API key + add dead-clicks-real query + UTM standard (#268)` |
| E | `fix/affiliate-button-audit` | `cdb436c` | **force-with-lease** (see §6) | no | `fix: tag inline blog Amazon links with rel + data-placement (#268)` |
| R1 | `fix/affiliate-regex-and-urls` | `f36e8dc` | `git push origin fix/affiliate-regex-and-urls` | no | `fix: add fullerhealth.com to affiliate regex; replace 2 placeholder Compare.jsx URLs (#268)` |
| R6 | `feat/template-reviews-cta` | `68372cd` | fetch worktree → push | **YES** `/private/tmp/r6-template-cta` | `feat: auto-render /reviews CTA at mid + end of every blog post (#268)` |
| R7 | `feat/mobile-comparison-above-fold` | `4269916` | fetch worktree → push | **YES** `/private/tmp/r7-mobile-comparison` | `feat: comparison table above-fold on mobile (#268)` |
| R4 | `test/affiliate-regression` | `a1f036c` | `git push origin test/affiliate-regression` | no | `test: playwright affiliate regression suite via dataLayer (#268)` |

### 4.2 Standard PR body template

```
Part of #268 — PostHog deep-eval action plan.

Spec: specs/issue-268-implementation/

<one-line summary from commit body>

Verification (post-merge):
- <metric from §8 verification matrix>
```

### 4.3 PR-creation command (per branch)

```bash
git push origin <branch>          # plain push for branches that have never been pushed
gh pr create \
  --base main \
  --head <branch> \
  --title "<title from table 4.1>" \
  --body "$(cat <<'EOF'
Part of #268 — PostHog deep-eval action plan.

Spec: specs/issue-268-implementation/

<one-line summary>

Verification (post-merge):
- <metric>
EOF
)"
```

### 4.4 Output of Phase 2

10 new PRs (B and C already need `gh pr create` only, no push). Total: 12 PRs collected with URLs in `specs/issue-268-implementation/pr-urls.txt`.

Vercel queues 12 parallel preview builds; we do **not** wait for previews to all finish before starting Phase 3 — we just need each individual preview to be green before its merge.

---

## 5. Phase 3: Merge sequence (5 sub-phases)

### 5.1 Per-merge gate spec (applies to every merge)

```
PRE-MERGE:
  1. gh pr checks <PR#>           → all required checks must be green
                                    (Vercel preview, no required GH Actions today)
  2. gh pr view <PR#> --json mergeable
                                  → must be "MERGEABLE"

MERGE:
  3. gh pr merge <PR#> --squash --delete-branch
                                  → squash-merge; delete remote branch
                                    (local branch retained until Phase 5)

POST-MERGE WAIT:
  4. sleep 300                    → 5 min for Vercel production deploy
                                    (Vercel build time = 3–5 min for this repo)

POST-MERGE GATE (HogQL sanity, see §8):
  5. ./scripts/posthog-query.sh events | tee gate-<PR#>.log
                                  → check $pageview ≥ 50% of baseline
                                  → check affiliate_link_click ≥ 50% of baseline
  6. PASS → next merge
     FAIL → sleep 180 (deploy lag); recheck once
            STILL FAIL → git revert <merge-sha>; halt; document
```

### 5.2 Phase 3a: B + C (already-pushed; smallest blast radius)

**Why first**: Both already on origin (only need PR-create). Smallest functional blast radius — B is pure JS deletion (sampling gate), C touches 2 JSON post files. If anything is broken in our Phase 2 setup (PR template, gate script, baseline), we discover it on the lowest-risk PRs.

| Step | Branch | Command |
|---|---|---|
| 1 | B | `gh pr merge <B#> --squash --delete-branch` |
| 2 | wait | 5 min |
| 3 | gate | `./scripts/posthog-query.sh events` ; verify drop < 50% |
| 4 | C | `gh pr merge <C#> --squash --delete-branch` |
| 5 | wait + gate | repeat |

**Special check for B**: 24h after merge, `time_on_page_milestone` daily count should rise from ~10/day toward ~70/day. This is a 24h post-merge metric, not a Phase 3a gate.

### 5.3 Phase 3b: Parallel-safe batch (R10, R3, R5, R2, R9)

Sequential merge order chosen for minimal-risk-first:

| Order | Branch | Risk | Why this position |
|---|---|---|---|
| 1 | R10 (`chore/hygiene-and-utm`) | None (scripts/docs only) | Drops `dead-clicks-real` query, which we use later |
| 2 | R3 (`fix/canonical-script-404`) | Very low (pure deletion of dead reference) | Pure deletion = lowest risk |
| 3 | R5 (`fix/comparison-posts-schema-audit`) | Low (3 JSON posts) | Data-only |
| 4 | R2 (`fix/widget-attribution-and-mobile-menu`) | Low–Med (changes event names) | Backward-compat noted in commit; verify post-deploy with `events` query |
| 5 | R9 (`fix/nac-vs-dhm-dead-clicks`) | Low (single JSON) | Data-only |

Per-merge: standard gate (§5.1). Add for R2: post-merge spot-check that no new `mobile-menu` (hyphen) events appear — run `./scripts/posthog-query.sh events` and grep for the literal string.

### 5.4 Phase 3c: NewBlogPost.jsx + Compare.jsx contention (E → R1 → R6 → R7)

This is the high-risk sub-phase. **Strict order required**:

```
E    fix/affiliate-button-audit          (Compare.jsx + inline links)
 │     touches NewBlogPost.jsx region for inline link tagging
 ▼
R1   fix/affiliate-regex-and-urls        (Compare.jsx URLs + regex)
 │     touches Compare.jsx:274,336 — must come AFTER E or merge conflicts
 ▼
R6   feat/template-reviews-cta           (NewBlogPost.jsx template)
 │     touches NewBlogPost.jsx — must come AFTER E
 ▼
R7   feat/mobile-comparison-above-fold   (Compare.jsx layout)
       touches Compare.jsx — must come AFTER R1 (URLs already settled)
```

**Rationale (from research.md §"Recommended merge order")**:
- E first because the commit was amended; settle the force-pushed state on `main` before any other branch tries to merge into it.
- R1 second to land Compare.jsx URL fixes before R7 reorders the page.
- R6 third because it is the **highest-leverage change** (#268's primary revenue driver). Wedged between R1 (Compare.jsx) and R7 (Compare.jsx) so its NewBlogPost.jsx changes don't have to rebase on top of subsequent E changes.
- R7 last because layout reorder over already-settled URLs is the safest order; also R7 is the **highest CLS risk** and benefits from being the last code change before R4 (tests).

**Special gate after R6 merge**: Beyond the standard event-volume gate, also `curl -s https://www.dhmguide.com/never-hungover/<sample-post> | grep -c "/reviews"` should return ≥ 2 (mid + end CTAs). This validates the template injection actually deployed.

**Special gate after R7 merge**: Mobile CLS check — capture Lighthouse mobile CLS for one `/compare/*` URL and compare against pre-R7 baseline (captured during Phase 1, line in `baseline-pre-merge.csv`). If CLS regressed > 0.1, revert R7.

### 5.5 Phase 3d: Test infra (R4)

R4 (`test/affiliate-regression`) merges last because it's +4 ahead of E and the Playwright assertions are calibrated to the final state of the affiliate-tracking surface (post-E, post-R1, post-R6, post-R7). Standard gate. Also locally run `npx playwright test --config=playwright.affiliate.config.js` against `https://www.dhmguide.com` after merge to confirm 4/4 pass.

---

## 6. Force-push protocol (E only)

E (`fix/affiliate-button-audit`) had its commit amended (to fix the message), so the local commit SHA differs from any prior. Branch has **never** been pushed, so the first push is plain. The research.md recipe defends against the case where some other process has pushed in between:

```bash
git fetch origin fix/affiliate-button-audit
REMOTE_SHA=$(git rev-parse origin/fix/affiliate-button-audit 2>/dev/null || echo NEW)
if [ "$REMOTE_SHA" = "NEW" ]; then
  git push origin fix/affiliate-button-audit
else
  git push --force-with-lease=fix/affiliate-button-audit:$REMOTE_SHA origin fix/affiliate-button-audit
fi
```

**Force-with-lease rejected diagnostic**:
1. `git fetch origin fix/affiliate-button-audit` again
2. `git log origin/fix/affiliate-button-audit..fix/affiliate-button-audit --oneline` — what does origin have that we don't?
3. If origin's HEAD is unrelated work: stop, investigate, do not auto-resolve.
4. If origin's HEAD is our prior amended attempt: re-run the recipe — `REMOTE_SHA` will pick up the new value.

---

## 7. Worktree handling (R6, R7)

Both branches were authored in isolated worktrees during the parallel R-batch (per plan.md "Coordination retro"). The local repo's `feat/template-reviews-cta` and `feat/mobile-comparison-above-fold` refs were updated by `git update-ref` during the recovery — so the branch refs are present in the main repo's `.git/refs/heads/`.

### 7.1 Verification before push

```bash
# Confirm local ref matches worktree HEAD
[ "$(git rev-parse feat/template-reviews-cta)" = "68372cd" ] || \
  echo "DRIFT: local feat/template-reviews-cta != 68372cd"
[ "$(git rev-parse feat/mobile-comparison-above-fold)" = "4269916" ] || \
  echo "DRIFT: local feat/mobile-comparison-above-fold != 4269916"
```

If drift detected:
```bash
# Re-pull the commit from the worktree explicitly
git fetch /private/tmp/r6-template-cta feat/template-reviews-cta:feat/template-reviews-cta -f
git fetch /private/tmp/r7-mobile-comparison feat/mobile-comparison-above-fold:feat/mobile-comparison-above-fold -f
```

### 7.2 Push (no special flags needed)

```bash
git push origin feat/template-reviews-cta
git push origin feat/mobile-comparison-above-fold
```

### 7.3 Fallback if worktree is gone

The branch ref lives in the main repo's `.git`. Even if `/private/tmp/r6-template-cta` is deleted (tmp gets cleaned), `git rev-parse feat/template-reviews-cta` still returns `68372cd` and `git push origin feat/template-reviews-cta` works without the worktree. The worktree is only needed if the local ref drifts and we need to re-fetch.

---

## 8. Verification gate design

### 8.1 HogQL gate query (between every merge)

```sql
-- Run via ./scripts/posthog-query.sh events (already exists)
-- Equivalent HogQL:
SELECT
  event,
  count() AS cnt
FROM events
WHERE timestamp > now() - INTERVAL 24 HOUR
  AND event IN ('$pageview', 'affiliate_link_click', '$exception')
GROUP BY event
```

### 8.2 Pass / fail / proceed-with-caution criteria

| Outcome | Condition | Action |
|---|---|---|
| **PASS** | `pageview_24h ≥ 0.5 × baseline.pageview_24h` AND `affiliate_link_click_24h ≥ 0.5 × baseline.affiliate_link_click_24h` AND `exception_24h ≤ 3 × baseline.exception_24h` | Proceed to next merge |
| **WAIT-RECHECK** | Any metric fails on first check | `sleep 180`; re-run gate once. Vercel deploys are 3–5 min; 5 min initial wait + 3 min recheck = 8 min total — covers slow deploys. |
| **FAIL** | Recheck still fails | `git revert <merge-sha>` on `main`; push; halt sequence; write incident note to `specs/issue-268-implementation/incidents/<merge-sha>.md` |

### 8.3 Why HogQL volume sanity is the right gate (and what it misses)

**Right for**: site-down, tracker-broken, deploy-cancelled regressions. These show up as steep volume drops within 5 minutes.

**Misses**: subtle correctness regressions (e.g., wrong `product_name` on `affiliate_link_click`). These need targeted post-deploy queries from §8 of requirements.md, run hours-to-days later. The gate is a tripwire, not a verifier.

**Why not regex/log-based**: Vercel logs are not free-text-queryable in <5 min from CLI. PostHog event data is. We use the data we can actually pull.

---

## 9. Phase 4: Follow-up implementation

### 9.1 Ordering

| FU# | Description | Depends on | PR strategy |
|---|---|---|---|
| #3 | Placeholder Amazon URLs in 3 blog JSONs | none | independent PR |
| #4 | Methodology caveat in `02-top-pages.md` | none | independent docs PR |
| #6 | Close PR #259 | R6 deployed | not a PR — `gh pr close 259 --comment "..."` |
| #1 | flyby-vs-fuller-health image dict→string | R5 merged (same file) | independent PR after R5 lands |
| #2 | DHM1000 brand mismatch (Compare.jsx) | R1 merged (same file) | independent PR after R1 lands |
| #5 | Drop redundant `<ReviewsCTA />` (NewBlogPost.jsx) | R6 merged (same file) | independent PR after R6 lands |
| #7 | Add `POSTHOG_PERSONAL_API_KEY` to `~/.zshrc` | none | **user action** — surfaced in final summary, NOT implemented |

### 9.2 Detection of "prerequisite landed"

```bash
# Check whether origin/main contains a given branch's tip
git fetch origin main
git merge-base --is-ancestor <branch-sha> origin/main && echo "LANDED" || echo "NOT YET"
```

For #1: gate on `git merge-base --is-ancestor d43c5af origin/main`.
For #2: gate on `git merge-base --is-ancestor f36e8dc origin/main`.
For #5: gate on `git merge-base --is-ancestor 68372cd origin/main`.

### 9.3 Bundling decision

**Each follow-up gets its own PR** (not bundled). Rationale:
- Per-PR revertibility (same property we care about for the 12 main PRs).
- Each follow-up touches a distinct file; no merge-conflict savings from bundling.
- PR overhead is ~2 min per follow-up (write title/body, `gh pr create`, `gh pr merge`); 12 min total for all 6 implementable follow-ups is acceptable.

**Exception**: #4 (docs-only methodology caveat) and #6 (close PR #259) can be done in any spare moment without waiting for upstream merges.

### 9.4 Per-follow-up command outline

| FU | Action sequence |
|---|---|
| #1 | `git checkout -b fix/268-fu1-flyby-fuller-image main`; edit JSON image field dict→string; `npm run build`; commit; push; `gh pr create`; merge |
| #2 | `git checkout -b fix/268-fu2-dhm1000-brand main`; update `Compare.jsx:262` "Double Wood Supplements" → "Dycetin"; commit; push; PR; merge |
| #3 | `git checkout -b fix/268-fu3-blog-amazon-urls main`; replace placeholder URLs in 3 JSONs (same `amzn.to` short links from R1); `npm run build`; commit; PR; merge |
| #4 | `git checkout -b docs/268-fu4-methodology-caveat main`; prepend "## Methodology Caveat" section to `docs/posthog-analysis-2026-04-25/02-top-pages.md`; commit; PR; merge |
| #5 | `git checkout -b fix/268-fu5-drop-redundant-reviewscta main`; remove `<ReviewsCTA />` block at `NewBlogPost.jsx:1390-1402`; `npm run build`; commit; PR; merge |
| #6 | `gh pr close 259 --comment "Superseded by #<R6-PR>; template-level CTA covers all posts. See #268."` |
| #7 | (no command) — append to final summary: "USER ACTION: add `export POSTHOG_PERSONAL_API_KEY=phx_...` to `~/.zshrc`. Working key currently in `scripts/posthog-query.sh` fallback." |

---

## 10. Phase 5: Cleanup

### 10.1 Delete `fix/affiliate-dead-clicks`

```bash
# Local
git branch -D fix/affiliate-dead-clicks

# Remote (if present — research.md says local-only, but verify)
git ls-remote --heads origin fix/affiliate-dead-clicks | grep -q . && \
  git push origin --delete fix/affiliate-dead-clicks || \
  echo "not on origin — local-only delete is sufficient"
```

Rationale already documented in requirements.md §7.

### 10.2 Confirm PR #259 closed

```bash
gh pr view 259 --json state | python3 -c 'import json,sys;assert json.load(sys.stdin)["state"]=="CLOSED"'
```

### 10.3 Surface ~/.zshrc recommendation

In final agent message, include:

> **USER ACTION REQUIRED**: Add the following line to `~/.zshrc` (per CLAUDE.md). I cannot edit your shell rc file. The working key is currently only in `scripts/posthog-query.sh`'s fallback default and `~/.claude/history.jsonl`.
>
> ```bash
> export POSTHOG_PERSONAL_API_KEY=phx_REDACTED
> ```

### 10.4 Schedule 4–6w monitoring

Append to spec docs `specs/issue-268-implementation/post-deploy-watchlist.md`:
- `[ ]` 2026-05-23 — R6 (`/reviews` PV; affiliate clicks)
- `[ ]` 2026-05-23 — R7 (mobile CR; mobile PV share)

These are not blocking; the spec completes when Phase 5 runs.

---

## 11. Failure modes & rollback

| Failure | Detection | Rollback |
|---|---|---|
| **Vercel build fails (pre-merge)** | `gh pr checks <PR#>` shows red Vercel preview | Do not merge. Investigate locally with `npm run build`. Fix on the branch, force-push, re-trigger preview. |
| **Vercel build fails (post-merge)** | Production deploy red in Vercel dashboard, or `curl https://www.dhmguide.com/` returns 5xx | `git revert <merge-sha>; git push origin main`. Then "Promote" prior known-good deploy in Vercel dashboard for instant restore. |
| **HogQL gate fails (one metric < 50%)** | §5.1 step 6 | `sleep 180`; recheck once. If still failing: `git revert <merge-sha>; git push origin main`. Halt merge sequence. Write `incidents/<merge-sha>.md`. |
| **Force-with-lease rejected** | `git push` exits non-zero with "stale info" | Re-run §6 diagnostic. Inspect origin's HEAD. Manual decision before retrying. Do NOT add `--force` (no lease). |
| **Worktree gone (R6 / R7)** | `ls /private/tmp/r6-template-cta` returns "No such file" | Local branch ref in `.git/refs/heads/` still works. `git push origin <branch>` succeeds without the worktree. Fallback only fails if both worktree AND local ref are gone — neither is the case here. |
| **Build validate-posts threshold violation (follow-up #1)** | `npm run build` fails locally before push | Fix the JSON content size, re-run build, then push. Validate-posts thresholds: ≥500 chars / ≥100 words. |
| **Mobile CLS regression (R7)** | Lighthouse mobile CLS > pre-baseline + 0.1 on `/compare/*` | `git revert <R7-merge-sha>`. R7 has `min-h-*` reservation but real-world CLS depends on font swap timing. |
| **3-CTAs-per-post window between R6 and FU#5** | Visible on any blog post post-R6, pre-FU#5 | Acceptable; documented in requirements.md §7. Land FU#5 immediately after R6 to minimize window. |
| **PR #259 accidentally merged before R6 closes it** | `gh pr view 259 --json state` returns `MERGED` | Acceptable; the `feat/template-reviews-cta` template will subsume #259's per-post CTAs. No action required other than noting the duplicate-CTA window until FU#5 lands. |

---

## 12. Out-of-band actions checklist (for user)

| Action | Who | When | What |
|---|---|---|---|
| Add `POSTHOG_PERSONAL_API_KEY` to `~/.zshrc` | **User** | Anytime after spec completes | `export POSTHOG_PERSONAL_API_KEY=phx_REDACTED` |
| Acknowledge PR #259 closure | User | After agent posts the close-comment | review the comment, no action required |
| 4–6w monitoring of R6 / R7 | User (or future spec) | 2026-05-23 onward | run `./scripts/posthog-query.sh affiliate` and `... events`; compare to baseline-pre-merge.csv |

---

## 13. Tooling rationale

### 13.1 Squash vs merge vs rebase

**Decision: squash-merge for all 12 PRs and all 6 follow-up PRs.**

- **Squash** ✓ — one SHA per PR. `git revert <sha>` is the rollback primitive. Matches existing commit-log style (`feat:`, `fix:`).
- Rebase-merge ✗ — preserves multi-commit history. R1 (+4 commits from cherry-pick recovery) and R4 (+4 atop E) would litter `main` with intermediate state.
- Merge-commit ✗ — adds merge-bubble noise; same multi-commit problem as rebase.

### 13.2 No automated CI gate beyond Vercel

- No GitHub Actions workflow runs `npm run build` on PR (verified: no `.github/workflows/build.yml` exists for this purpose).
- No GitHub Actions workflow runs Playwright (R4 lands a Playwright suite but does NOT add a CI workflow to run it; this is a pre-existing gap).
- Vercel preview build IS the de facto pre-merge build gate. If Vercel preview is red, `gh pr checks` shows red, and we do not merge.
- Adding GH Actions CI is **out of scope** for this spec — it is a separate platform decision.

### 13.3 Why HogQL gate, not page-level smoke tests

- Smoke tests (curl + grep) are appropriate for **content** verification (e.g., "post body renders") but cannot detect tracker regressions.
- HogQL gate sees the production tracker firing in real-time. It's the only signal that distinguishes "site loads" from "site loads AND analytics work".
- We supplement with targeted curl checks where shape matters (R3: `grep -c canonical-fix`; R6: `grep -c /reviews`; R7: viewport-conditional render is harder to verify with curl, so we accept Lighthouse + 4-6w CR signal).

### 13.4 Parallel PR-create + sequential merge

- Vercel **does** build PR previews in parallel — no contention.
- Vercel **cancels** in-flight production builds — sequential merge required.
- Result: parallel PR creation (saves ~10 min wall-time) + sequential merge (mandatory for attribution).

---

## 14. Acceptance traceability

| Requirement (US-#) | Phase | Step / section | Artifact |
|---|---|---|---|
| US-1 (B) | 3a | §5.2 step 1–3 | merge SHA on `main`; 24h `time_on_page_milestone` ≥ 50/day |
| US-2 (C) | 3a | §5.2 step 4–5 | merge SHA; curl returns body on flyby pages |
| US-3 (R3) | 3b | §5.3 row 2 | merge SHA; `grep -c canonical-fix` = 0 |
| US-4 (R5) | 3b | §5.3 row 3 | merge SHA; 3 posts return body |
| US-5 (R2) | 3b | §5.3 row 4 | merge SHA; no new `mobile-menu` events |
| US-6 (R1) | 3c | §5.4 step 2 | merge SHA after E; ≥1 Fuller Health click in 7d |
| US-7 (E) | 3c | §5.4 step 1 + §6 force-push | merge SHA; inline links carry `data-placement` |
| US-8 (R9) | 3b | §5.3 row 5 | merge SHA; dead-clicks-real drop on nac-vs-dhm 7d |
| US-9 (R6) | 3c | §5.4 step 3 + §7 worktree | merge SHA; `/reviews` CTA on 188+ posts |
| US-10 (R7) | 3c | §5.4 step 4 + §7 worktree | merge SHA; mobile-only above-fold layout; CLS not regressed |
| US-11 (R4) | 3d | §5.5 | merge SHA; Playwright 4/4 |
| US-12 (R10) | 3b | §5.3 row 1 | merge SHA; `dead-clicks-real` subcommand works |
| US-13 (FU #1) | 4 | §9 row "FU #1" | post-R5 PR merged |
| US-14 (FU #2) | 4 | §9 row "FU #2" | post-R1 PR merged |
| US-15 (FU #3) | 4 | §9 row "FU #3" | independent PR merged |
| US-16 (FU #4) | 4 | §9 row "FU #4" | docs PR merged |
| US-17 (FU #5) | 4 | §9 row "FU #5" | post-R6 PR merged |
| US-18 (FU #6 / close #259) | 4 + 5 | §9 row "FU #6" + §10.2 | PR #259 state = CLOSED |
| US-19 (FU #7) | 5 | §10.3 | recommendation in final summary |
| US-20 (baseline) | 1 | §3 | `baseline-pre-merge.csv` |
| US-21 (per-merge gate) | 3 (every step) | §5.1 + §8.2 | `gate-<PR#>.log` × 12 |
| US-22 (post-deploy monitoring) | 5 | §10.4 | `post-deploy-watchlist.md` |
| US-23 (delete dead-clicks branch) | 5 | §10.1 | branch absent locally + on origin |
| US-24 (close #259) | 5 | §10.2 | PR state CLOSED |
| US-25 (~/.zshrc recommendation) | 5 | §10.3 | line in final summary |

---

## 15. Open architectural questions

None blocking. Two optional improvements deferred:
1. Add a `pre-merge` GH Actions workflow that runs `npm run build` + Playwright on every PR. Would replace the manual `gh pr checks` step in §5.1 step 1. Out of scope for this spec.
2. Wire `scripts/posthog-baseline.sh` into a cron / PostHog scheduled query for ongoing trend tracking. Out of scope.

---

## 16. Implementation steps (ordered)

1. Write `scripts/posthog-baseline.sh` per §3.1.
2. Run `scripts/posthog-baseline.sh` → produce `baseline-pre-merge.csv`. Verify no anomaly per §3.2.
3. (Phase 2 — parallel) Push 8 unmerged branches via `git push origin <branch>` (R3, R5, R2, R9, R10, R1, R4 + worktree-fetch verification for R6, R7); push E via §6 force-with-lease recipe.
4. (Phase 2 — parallel) Open 12 PRs via `gh pr create` per §4.3; collect URLs into `pr-urls.txt`.
5. Wait for all 12 Vercel preview builds to go green (`gh pr checks` per PR).
6. (Phase 3a) Merge B, then C — 5-min gate between.
7. (Phase 3b) Merge R10 → R3 → R5 → R2 → R9 — 5-min gate between each.
8. (Phase 3c) Merge E → R1 → R6 → R7 — 5-min gate between each; extra curl + Lighthouse checks per §5.4.
9. (Phase 3d) Merge R4 — 5-min gate; run `npx playwright test --config=playwright.affiliate.config.js`.
10. (Phase 4) Run follow-ups: #4 + #3 anytime; #1 after R5; #2 after R1; #5 after R6; #6 close PR #259 after R6 deploy; #7 surface in summary.
11. (Phase 5) Delete `fix/affiliate-dead-clicks` local + origin; verify #259 closed; write `post-deploy-watchlist.md`; emit final summary with ~/.zshrc recommendation.
