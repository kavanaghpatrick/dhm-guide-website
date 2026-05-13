# B10: Ralph Stop-Hook Cleanup — Stale `issue-366-moratorium` State

## 1. TL;DR

**Wrong:** Ralph-specum stop hook was firing every turn with `Quick mode active — do NOT stop. Continue spec phase: complete for issue-366-moratorium`. Issue #366 shipped 2026-04-29 in PR #370 (`a8f3a8a`), but three gitignored runtime files survived the merge: `specs/.current-spec`, `specs/issue-366-moratorium/.ralph-state.json`, and `specs/issue-366-moratorium/.progress.md`. The state file pinned `phase: "complete"` with `quickMode: true`. The hook treated `"complete"` as a phase NAME (not a done state) and blocked stops via line 160 logic.

**Did:** Deleted the three gitignored runtime files. Committed spec artifacts (`research.md`, `requirements.md`, `design.md`, `tasks.md`) preserved per CLAUDE.md "Spec Artifact Commit Policy".

**Verified:** Replayed the hook with `{"cwd":"...","stop_hook_active":false}` on stdin — hook now exits 0 with NO output (no `block` JSON emitted). It will not fire again.

**Confidence:** 5/5.

## 2. Hook script — what state it reads

Path: `~/.claude/plugins/cache/smart-ralph/ralph-specum/4.9.1/hooks/scripts/stop-watcher.sh`

Two short-circuits decide whether the hook runs at all:

```bash
# Line 35-38: resolve spec from .current-spec
SPEC_PATH=$(ralph_resolve_current 2>/dev/null)
if [ -z "$SPEC_PATH" ]; then
    exit 0   # <-- silent exit if no .current-spec file
fi

# Line 43-46: bail if state file missing
STATE_FILE="$CWD/$SPEC_PATH/.ralph-state.json"
if [ ! -f "$STATE_FILE" ]; then
    exit 0   # <-- silent exit if state file missing
fi
```

The offending block (line 159-184):

```bash
# Quick mode guard: block stop during ANY phase when quickMode is active
if [ "$QUICK_MODE" = "true" ] && [ "$PHASE" != "execution" ]; then
    # ...emits decision:"block" with "Quick mode active — do NOT stop..." reason
```

This is the bug spot: when `phase == "complete"` (and `quickMode == true`), the predicate `PHASE != "execution"` is true → hook blocks. There is no special-case for `phase == "complete"`. The hook assumes the only valid "done" path is `phase == "execution" && taskIndex >= totalTasks` (line 192).

## 3. State file BEFORE cleanup

`specs/issue-366-moratorium/.ralph-state.json`:

```json
{
  "source": "spec",
  "name": "issue-366-moratorium",
  "basePath": "./specs/issue-366-moratorium",
  "phase": "complete",
  "taskIndex": 12,
  "totalTasks": 12,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 1,
  "maxGlobalIterations": 100,
  "commitSpec": true,
  "quickMode": true,
  "issueNumber": 366,
  "issueRepo": "kavanaghpatrick/dhm-guide-website",
  "discoveredSkills": [],
  "awaitingApproval": false
}
```

`specs/.current-spec`: contained `issue-366-moratorium`.

## 4. State AFTER cleanup

All three runtime files removed. Directory now contains only the committed artifacts:

```
specs/issue-366-moratorium/
├── design.md       (tracked)
├── requirements.md (tracked)
├── research.md     (tracked)
└── tasks.md        (tracked)
```

`specs/.current-spec`: does not exist.

`git status --short`: shows zero spec-related changes (the deleted files were gitignored, never staged).

## 5. What I changed

Three `rm` operations (all gitignored files, verified via `git check-ignore -v`):

1. `rm /Users/patrickkavanagh/dhm-guide-website/specs/issue-366-moratorium/.ralph-state.json` — matched `.gitignore:212:**/.ralph-state.json`
2. `rm /Users/patrickkavanagh/dhm-guide-website/specs/issue-366-moratorium/.progress.md` — matched `.gitignore:211:**/.progress.md`
3. `rm /Users/patrickkavanagh/dhm-guide-website/specs/.current-spec` — matched `.gitignore:208:specs/.current-spec`

No tracked files modified. No code changes. No edits to hook script (it's plugin-managed at `~/.claude/plugins/cache/smart-ralph/ralph-specum/4.9.1/`).

This mirrors the canonical `/ralph-specum:cancel` command (`commands/cancel.md`) which prescribes: delete `.ralph-state.json`, clear `.current-spec`. We intentionally skip step 2 ("remove spec directory") because the spec artifacts are committed to the repo per project policy — deleting them would create a dirty working tree against `main`.

## 6. Hook re-verification

Replayed the Stop hook input:

```bash
echo '{"cwd":"/Users/patrickkavanagh/dhm-guide-website","stop_hook_active":false}' \
  | bash ~/.claude/plugins/cache/smart-ralph/ralph-specum/4.9.1/hooks/scripts/stop-watcher.sh
# EXIT: 0
# (no stdout, no JSON block emitted)
```

Re-reading the logic against the new state:

1. Line 35 `ralph_resolve_current` reads `specs/.current-spec` → file missing → returns empty
2. Line 36-38 `[ -z "$SPEC_PATH" ]` → true → `exit 0` silently
3. Hook never reaches lines 142-184 where the quick-mode block lives. Cannot fire.

**Belt-and-suspenders:** even if `.current-spec` were somehow recreated pointing at `issue-366-moratorium`, the state file is also gone — line 44 short-circuits: `[ ! -f "$STATE_FILE" ]` → `exit 0`.

## 7. Should `specs/issue-366-moratorium/` be deleted?

**No.** Keep it.

Per CLAUDE.md "Spec Artifact Commit Policy" (line 575):
> For each `specs/issue-*/` directory, commit: `research.md`, `requirements.md`, `design.md`, `tasks.md`. Do NOT commit: `.progress.md`, `.ralph-state.json`.

The four committed artifacts ARE the spec history. They're already in `main` (tracked via `git ls-files`). Deleting them would create a dirty working tree against `main` for no benefit. The hook only cares about `.current-spec` and `.ralph-state.json`, both now gone.

The plugin's `/ralph-specum:cancel` command DOES remove the spec dir — but that's for canceling an in-progress spec before completion. Issue #366 is shipped; the artifacts are reviewable history, not in-progress drafts. Equivalent to: "completed PRs go in `git log`, you don't `rm -rf` the merged commits."

## 8. Root cause (for future hardening — not in scope here)

The hook's quick-mode predicate is over-broad:

```bash
if [ "$QUICK_MODE" = "true" ] && [ "$PHASE" != "execution" ]; then
```

When phase is `"complete"`, this is structurally a finished spec — but the predicate doesn't know that. A robust check would whitelist progress phases (`research`, `requirements`, `design`, `tasks`) rather than blacklist `execution`. Or treat `phase == "complete"` as a terminal state that the coordinator should have cleaned up via state-file deletion. Either way: a coordinator crash between "mark complete" and "delete state file" leaves a poison pill. This is a plugin-side bug to report upstream (`smart-ralph/ralph-specum`), not a project fix.

## Confidence: 5/5

- File operations were on gitignored runtime files (zero risk to repo state).
- Hook re-simulation confirms silent exit.
- Canonical cleanup pattern matches plugin's own `cancel.md` (minus spec-dir deletion, which would conflict with project's commit policy).
- PR #370 merged 12 days ago — no scenario where issue #366 is "still active."
