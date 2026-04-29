# Tasks — Issue #143

## Task 1: Trim DHM Clinical Trials title from 68 → 55 chars

**File**: `src/newblog/data/posts/dhm-randomized-controlled-trials.json`

**Edit**: Replace line 3
```diff
-  "title": "DHM Clinical Trials 2026: The Science Behind 70% Hangover Prevention",
+  "title": "DHM Clinical Trials 2026: 70% Hangover Reduction Proven",
```

**Verify steps**:
1. `npm run build` returns exit 0
2. `grep -oE '<title>[^<]+' dist/never-hungover/dhm-randomized-controlled-trials/index.html` includes the new 55-char title
3. JSON still parses (build will fail if not)
4. No unrelated files staged in commit

**Status**: complete (single-edit task)
