# Tasks — Issue #84: Clean Up Orphaned Metadata Entries

Phase 2 data hygiene for `src/newblog/data/metadata/index.json`.

## Audit scope (per ultrathink)

The issue body names 4 known orphan slugs. The audit reveals the issue is bidirectional:

- **Orphans** — metadata entries pointing to a slug whose post file is missing.
  Forward direction: blog listing rendering an entry that 404s when clicked.
- **Reverse-orphans** — post files whose slug has no metadata entry.
  Reverse direction: post exists on disk but never appears in the listing.

We fix BOTH directions in a single pass, plus dedupe one literal duplicate slug
discovered during audit.

## Tasks

- [x] T1. Write `scripts/audit-orphan-metadata.mjs` that lists orphans, reverse-orphans, and duplicate slugs. Exit non-zero if any are found.
- [x] T2. Run audit on `main`. Confirm: 5 orphans, 13 reverse-orphans, 1 duplicate slug.
  - Orphans: 4 from issue body + `flyby-vs-fuller-health-complete-comparison-2025` (slug-rename casualty; the actual post lives at `flyby-vs-fuller-health-complete-comparison` without `-2025`).
  - Reverse-orphans: 13 post files lacking metadata entries.
  - Duplicate slug: `alcohol-work-performance-professional-impact-guide-2025` appears 2x with byte-identical entries.
- [x] T3. Write `scripts/fix-orphan-metadata.mjs`:
  - Filter out entries whose slug isn't on disk (orphan removal).
  - Filter out duplicate slug occurrences (keep first).
  - Append metadata entries for each reverse-orphan, derived from the post JSON's slug/title/excerpt/date/author/image/tags/readTime fields, schema-matched to existing entries.
  - Stable order: existing entries keep their position; new entries appended in slug order.
- [x] T4. Run fix script. Verify metadata count goes 190 → 197 (-5 orphans -1 dup +13 reverse-orphans).
- [x] T5. Re-run audit script: must report 0/0/0 (orphans/reverse-orphans/duplicates).
- [x] T6. `npm run build` — must succeed and prerender 197 posts.
- [x] T7. Spot-check dist output: at least one new reverse-orphan slug present in `dist/never-hungover/`, none of the removed orphan slugs present.
- [x] T8. Two commits with Co-Authored-By trailer:
  - `fix(metadata): remove 5 orphan entries, dedupe 1, generate 13 missing reverse-orphans (#84)` — stage only `src/newblog/data/metadata/index.json` and the two scripts (`scripts/audit-orphan-metadata.mjs`, `scripts/fix-orphan-metadata.mjs`).
  - `chore(spec): scaffold ralph spec artifacts for issue #84` — stage only this file.
- [x] T9. Stay on branch `cleanup/issue-84-orphan-metadata`. No push, no PR.

## Verification commands

```bash
node scripts/audit-orphan-metadata.mjs   # → 0/0/0, exit 0
npm run build                             # → "Found 197 valid blog posts to prerender"
```

## Out of scope

- The 23 comparison posts referenced in the issue body's "Phase 1" prerequisite — already restored prior to this branch.
- Slug normalization or post-content edits.
- The `index.backup.json`, `index.json.backup2`, `index.json.bak`, `index.json.tmp` sidecar files in the metadata directory (separate cleanup).
- The `stats.json` file in the metadata directory (different concern).
