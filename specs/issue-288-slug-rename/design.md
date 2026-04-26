# Design: Issue #288

## Approach: pure mechanical rename + 301
Smallest change that works. No refactor of routing system; the existing `postRegistry.js` already keys posts by slug string, so we just swap the key + import path.

## Order of edits (to keep build valid at every step)
1. `git mv` the JSON file.
2. Update the JSON file's internal `id` and `slug` fields.
3. Update `src/newblog/data/posts/index.js` (import path).
4. Update `src/newblog/data/postRegistry.js` (key + import path).
5. Update `src/newblog/data/metadata/index.json` (`id` + `slug`).
6. Update 4 sibling-post `relatedPosts` arrays (3) + 1 with both `relatedPosts` and a markdown link in content (`does-dhm-work-honest-science-review-2025.json`).
7. Update markdown link in `complete-hangover-science-hub-2025.json`.
8. Update `public/blog-canonicals.json` (key + canonical).
9. Update `public/sitemap.xml` `<loc>`.
10. Add 301 to `vercel.json`.
11. Run `npm run build`.
12. Verify `dist/never-hungover/dhm-randomized-controlled-trials/index.html` exists.

## Redirect entry
```json
{
  "source": "/never-hungover/dhm-randomized-controlled-trials-2024",
  "destination": "/never-hungover/dhm-randomized-controlled-trials",
  "permanent": true
}
```
Inserted at end of `redirects` array in `vercel.json` to match existing pattern (the smart-sleep-tech entry already follows this exact form).

## Why no codemod / script
11 files, 12 string updates. Manual Edit tool calls are faster and reviewable.
