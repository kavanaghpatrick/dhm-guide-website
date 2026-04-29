# Tasks — Issue #151

## T-1: Trim NAC vs DHM `title` field (single string change)

**File**: `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`

**Edit**: replace line 2

```diff
-  "title": "NAC vs DHM: Which Antioxidant Works Better for Liver Protection? (2025)",
+  "title": "NAC vs DHM: Which Liver Supplement Works Better? [2025]",
```

**Verification**:
1. `npm run build` exits 0.
2. `grep -oE '<title>[^<]+' dist/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025/index.html` includes `NAC vs DHM: Which Liver Supplement Works Better? [2025]`.

**Estimated effort**: 5 min (edit) + 90 sec (build + verify).

## Commit plan

1. `fix(seo): trim nac-vs-dhm title to under 60 chars (#151)` — JSON file only.
2. `chore(spec): scaffold ralph spec artifacts for issue #151` — `specs/issue-151-nac-dhm-title/tasks.md` only (`.progress.md` and `.ralph-state.json` are gitignored).

Both commits include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.
