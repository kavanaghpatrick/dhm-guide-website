---
spec: issue-345-residual
phase: research
created: 2026-04-28
mode: quick
---

# Research: issue-345-residual

## Executive Summary

Issue #345 is an umbrella cleanup ticket. This run scopes down to **Section A (immediately-actionable)** + **Section B (policy clarification)** only — the issue body itself defers Section C (merge guidance, not code), Section D (gated on external data: PostHog, GSC, etc.), and Section E (recommendations, not code). In-scope: 2 meta-description rewrites (#143, #151), 1 regex expansion + 1 match-count badge feature on the #209 branch's Reviews.jsx, and a documented spec-artifact policy.

## Critical Branch Topology

A3 + A4 (`Reviews.jsx` work) cannot land on this branch alone. The `bestFor` button row + `/\b(best|trusted)\b/i` regex live on `cleanup/issue-209-best-for-buttons`, NOT on main. Per `.progress.md` strategic note: this branch must merge AFTER #209. Two viable execution paths:

| Path | Description | Recommendation |
|---|---|---|
| **A** | Make the changes on this branch atop main; rely on merge-order to layer correctly | Risky — main lacks bestForFilters; edits would be against code that doesn't exist locally |
| **B** | Rebase this branch onto `cleanup/issue-209-best-for-buttons` for the A3/A4 portion, OR cherry-pick the bestForFilters block into this branch first | **Recommended** — gives concrete code to edit and verify |

A1 + A2 (post JSONs) and B1 (policy doc) are independent of this issue.

## Per-Item Current State

### A1 — #143 meta description (`src/newblog/data/posts/dhm-randomized-controlled-trials.json`)

| Field | Value | Char count |
|---|---|---|
| Current `metaDescription` | `Peer-reviewed DHM clinical trials show 70% hangover reduction. UCLA and USC research explains exactly how DHM prevents hangovers.` | **129** |
| Recommended (verbatim from issue #143) | `Breakthrough 2024 study proves DHM cuts hangover severity by 70%. See the peer-reviewed results from Foods journal that explain exactly how it works.` | **149** |
| Under 160? | Yes (both) | — |

Field name in JSON: `metaDescription` (camelCase). Title field will be left untouched (already trimmed on `cleanup/issue-143-clinical-trials-title` to "DHM Clinical Trials 2026: 70% Hangover Reduction Proven").

### A2 — #151 meta description (`src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`)

| Field | Value | Char count |
|---|---|---|
| Current `metaDescription` | `NAC vs DHM for liver protection: NAC excels for daily support ($6-15/mo), DHM works best before drinking. Compare dosing, cost, and usage.` | **138** |
| Recommended (verbatim from issue #151) | `NAC vs DHM: Which protects your liver better? Complete comparison reveals when to use each (and why combining them may be the smartest choice).` | **143** |
| Under 160? | Yes (both) | — |

Field name in JSON: `metaDescription` (camelCase). Title untouched (already updated on `cleanup/issue-151-nac-dhm-title`).

### A3 — #209 match-count badge (`src/pages/Reviews.jsx` on `cleanup/issue-209-best-for-buttons`)

The `bestForFilters` array lives at lines 408–414 (on the #209 branch):

```js
const bestForFilters = [
  { id: 'all',     label: 'All Products',     match: () => true },
  { id: 'overall', label: 'Best Overall',     match: (p) => /\b(best|trusted)\b/i.test(p.bestFor) },
  { id: 'value',   label: 'Best Value',       match: (p) => /value/i.test(p.bestFor) },
  { id: 'heavy',   label: 'Heavy Drinkers',   match: (p) => /(party|weekend|high-performer)/i.test(p.bestFor) },
  { id: 'health',  label: 'Health-Conscious', match: (p) => /(health|liver)/i.test(p.bestFor) }
]
```

The render loop is at line 619: `{bestForFilters.map(f => { ... })}`.

**Recommended approach** (no useMemo overhead; topProducts is static): compute counts inline once before render:

```js
const filterCounts = bestForFilters.reduce((acc, f) => {
  acc[f.id] = topProducts.filter(f.match).length
  return acc
}, {})
```

Then render `{f.label} ({filterCounts[f.id]})` inside the button. This computes 5 filters × 10 products = 50 predicate calls per render, trivial.

### A4 — #209 regex expansion ("Best Overall" filter)

**Exhaustive match table** (current vs proposed, against all 10 product `bestFor` strings):

| ID | bestFor | Current `\b(best\|trusted)\b` | Expanded `\b(best\|trust)\w*` |
|---|---|---|---|
| 1 | Weekend warriors who want **the best** | match | match |
| 2 | Value hunters who want pure DHM | — | — |
| 3 | Health-conscious drinkers who protect their liver | — | — |
| 4 | Bulk buyers who want maximum value | — | — |
| 5 | Social drinkers who want **a trusted** brand | match | match |
| 6 | Party people who need serious protection | — | — |
| 7 | Travelers needing portable protection | — | — |
| 8 | High-performers who want max potency | — | — |
| 9 | Trendsetters who appreciate celebrity picks | — | — |
| 10 | Research-driven buyers who **trust** reviews | — | **NEW match** |

**Result**: expansion adds DHM Depot (id 10, "trust reviews") to "Best Overall" without over-matching anything else. No false positives across the 10 strings. Safe change.

Note: issue #345's wider audit also flagged products 7 (Good Morning, "portable protection") and 9 (Fuller Health, "celebrity picks") as filter dead-zones. The recommended A4 fix addresses **only product 10**. Products 7 and 9 are explicitly accepted as "All Products only" per the simplified scope (no new filter category added).

### B1 — Spec artifact policy (#251)

**Current state of `.gitignore`** (lines 132–138, "Spec internal state (per ralph-specum)"):

```
specs/.current-spec
specs/.current-epic
specs/.index/
**/.progress.md
**/.ralph-state.json
```

**What this means**:
- `tasks.md`, `research.md`, `requirements.md`, `design.md` — **NOT gitignored**, can be committed
- `.progress.md`, `.ralph-state.json`, `.current-spec`, `.current-epic`, `.index/` — gitignored

**Observed inconsistency**:
- Older specs (e.g., `issue-268-implementation`, `issue-285-newsletter` through `issue-304-what-to-eat`): commit all 4 artifacts (`research.md`, `requirements.md`, `design.md`, `tasks.md`). Some also commit `plan.md`.
- Recent April 2026 cleanup branches (`issue-117`, `issue-143`, `issue-151`, `issue-158`, `issue-208`, `issue-209`, `issue-251`, …): the issue #345 audit found these have **only `tasks.md` committed on their branches**, with `research.md`/`requirements.md`/`design.md` left untracked on disk.

**Canonical policy recommendation**: keep current `.gitignore` (no changes). Document the policy in a single sentence: **"All four ralph-specum artifacts (`research.md`, `requirements.md`, `design.md`, `tasks.md`) should be committed per spec — they form the durable spec record. Only `.progress.md` and `.ralph-state.json` are working-state and remain gitignored."**

**Why not extend gitignore to also exclude `research/requirements/design.md`?** Two reasons:
1. The 30+ older specs already establish the precedent of committing all 4. Reversing that would orphan that history.
2. These files are durable design records — useful to anyone reading the repo months later. They're not transient like `.progress.md`.

The April 2026 cleanup branches' inconsistency is a **per-branch hygiene gap**, not a policy gap. Per `.progress.md`, those branches are already sealed and out of scope for this run; the policy applies forward.

## Out-of-Scope Confirmation

This run does NOT implement:
- **Section C** (merge sequencing guidance for the 13 awaiting branches) — not code, just documentation
- **Section D** (6 deferred/gated items: #157, #200, #205+#214, #51, #249, #28+#85) — gated on external data (PostHog, GSC) or precursor work
- **Section E** (recommendations for next push) — not code
- **B2** (cosmetic checkbox toggling on #251's tasks.md) — that branch is sealed
- Cosmetic spec-dir cleanup on past sealed branches

Per the issue body: "These were intentionally NOT implemented because they're gated on external data or require precursor work."

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| A1/A2 conflict with existing #143/#151 branches | Low | Touch ONLY `metaDescription` field; leave `title` untouched. #143/#151 branches changed `title`; this branch changes `metaDescription`. Different fields = clean 3-way merge. |
| A3/A4 conflict because `bestForFilters` doesn't exist on main | **High** | Either (a) merge #209 first then rebase this branch, or (b) cherry-pick the bestForFilters block from #209 into this branch's working tree. **Recommend path (b)** — keeps execution self-contained. Alternative: scope A3/A4 out of this branch and add to #209 directly. |
| A4 regex over-matches | Very Low | Verified exhaustively against all 10 `bestFor` strings (table above). Adds 1 new match (id 10), removes none. No false positives. |
| B1 policy doc has no enforceable artifact | Low | Doc-only change. Policy is captured in this research.md and will be the canonical reference. No code/config change. |
| Both AC items in #143/#151 (title + meta) appear on different branches | Low | Issue #345 explicitly calls this out as the "deferred" portion. The path forward is clean: title on #143/#151 branches, meta on this branch. Merge order: #143 → #151 → this. |

## Verification Approach

| Item | Verification |
|---|---|
| A1 | `jq -r '.metaDescription \| length' src/newblog/data/posts/dhm-randomized-controlled-trials.json` returns ≤160; `jq -r '.title' …` unchanged from #143 branch's value |
| A2 | Same as A1 against `nac-vs-dhm-...json` |
| A3 | `npm run build` succeeds; `grep -oE 'All Products \([0-9]+\)\|Best Overall \([0-9]+\)\|Best Value \([0-9]+\)\|Heavy Drinkers \([0-9]+\)\|Health-Conscious \([0-9]+\)' dist/index.html` finds all 5 patterns; spot-check counts: All=10, Overall=3 (after A4), Value=2, Heavy=3, Health=2 |
| A4 | Manual verification: render reviews page, click "Best Overall" filter; DHM Depot (id 10) MUST appear. Or grep test: `node -e "const re=/\b(best\|trust)\w*/i; console.log(re.test('Research-driven buyers who trust reviews'))"` returns `true` |
| B1 | `grep -A2 'Spec internal state' .gitignore` confirms current entries unchanged. Policy text added to research.md is the canonical reference. |

## Quality Commands

| Type | Command | Source |
|---|---|---|
| Lint | `npm run lint` | package.json scripts.lint |
| Build | `npm run build` | package.json scripts.build (also runs `validate-posts`, `verify-z-classes`, prerender) |
| Validate posts | `npm run validate-posts` | package.json scripts.validate-posts (runs in build chain — catches malformed JSON) |

No separate typecheck/test scripts in this project (Vite + plain JSX). The `build` chain is the local CI.

## Sources

- `/Users/patrickkavanagh/dhm-guide-website/specs/issue-345-residual/.progress.md` — in-scope/out-of-scope split
- GitHub issue #345 (`gh issue view 345 --repo kavanaghpatrick/dhm-guide-website`) — full umbrella scope
- GitHub issue #143 — verbatim recommended `metaDescription` text
- GitHub issue #151 — verbatim recommended `metaDescription` text
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/dhm-randomized-controlled-trials.json` — current `metaDescription` value
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` — current `metaDescription` value
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/Reviews.jsx` (main) — confirms category-based filter still on main
- `cleanup/issue-209-best-for-buttons:src/pages/Reviews.jsx` lines 408–414 — `bestForFilters` array with current regex
- `/Users/patrickkavanagh/dhm-guide-website/.gitignore` lines 132–138 — current spec artifact policy
- `git ls-files specs/` — older specs commit all 4 artifacts (#268, #285–#304); cleanup branches don't

## Recommendations for Requirements Phase

1. Define A1 and A2 as data-only edits to `metaDescription` field; explicitly forbid changes to `title`, `excerpt`, `quickAnswer`, or any other field
2. For A3/A4, decide path: cherry-pick #209's bestForFilters into this branch, OR add A3/A4 to #209 branch and remove from this scope
3. B1 ships as documentation in `research.md` only — no `.gitignore` change, no spec-dir mass-cleanup
4. Verification gate: `npm run build` must pass before commit (catches malformed JSON, missing tokens, etc.)
5. Treat each item (A1, A2, A3, A4, B1) as an independent task — no cross-coupling
