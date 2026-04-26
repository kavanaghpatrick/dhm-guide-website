# Requirements: Issue #288

## Functional
1. Rename JSON file `dhm-randomized-controlled-trials-2024.json` → `dhm-randomized-controlled-trials.json` using `git mv` (preserve history).
2. Internal `id` and `slug` fields in the renamed JSON must equal `dhm-randomized-controlled-trials`.
3. All live source/public references updated (postRegistry, posts/index.js, metadata/index.json, sibling post `relatedPosts`, in-content markdown links).
4. `public/blog-canonicals.json` key + canonical URL updated.
5. `public/sitemap.xml` `<loc>` updated.
6. 301 redirect added in `vercel.json` `redirects` array: `/never-hungover/dhm-randomized-controlled-trials-2024` → `/never-hungover/dhm-randomized-controlled-trials`, `permanent: true`.

## Non-functional
- `npm run build` passes cleanly (post must still load via dynamic import).
- `dist/never-hungover/dhm-randomized-controlled-trials/` exists post-build (prerendered new path).
- No edit to backups, encoding-backup snapshots, historical docs, or analysis artifacts.

## Acceptance
- All 11 live files updated; 0 references to old slug remain in `src/`, `public/sitemap.xml`, `public/blog-canonicals.json`, or `vercel.json` (except as the 301 source).
- Build green.
- PR squash-merged with `--admin`, closes #288.
