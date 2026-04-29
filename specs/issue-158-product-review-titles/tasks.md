# Tasks — Issue #158

## T-1: Trim No Days Wasted `title` field (single string change)

**File**: `src/newblog/data/posts/no-days-wasted-dhm-review-analysis.json`

**Edit**: replace line 3

```diff
-  "title": "No Days Wasted DHM Detox Review Analysis: What 201+ Amazon Customers Say About This Premium Formula",
+  "title": "No Days Wasted DHM Review 2025: 201+ Customer Analysis",
```

**Verification**:
1. `npm run build` exits 0.
2. `grep -oE '<title>[^<]+' dist/never-hungover/no-days-wasted-dhm-review-analysis/index.html` includes `No Days Wasted DHM Review 2025: 201+ Customer Analysis`.

**Estimated effort**: 5 min (edit) + 90 sec (build + verify).

## T-2: Confirm scope exclusions

Re-verify before commit that the following are NOT in `git diff`:
- `src/newblog/data/posts/dhm1000-review-2025.json`
- `src/newblog/data/posts/toniiq-ease-dhm-review-analysis.json`

If either appears modified, restore with `git restore <path>`.

## Commit plan

1. `fix(seo): trim no-days-wasted review title to under 60 chars (#158)` — JSON file only.
2. `chore(spec): scaffold ralph spec artifacts for issue #158` — `specs/issue-158-product-review-titles/{research,requirements,design,tasks}.md` only (`.progress.md` and `.ralph-state.json` are gitignored or not committed).

Both commits include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.

**Stage explicitly** (no `git add -A`) — working tree has unrelated WIP from the FOUC/dropdown investigation that must NOT be staged.
