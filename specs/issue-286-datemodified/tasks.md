# Tasks: Issue #286

1. **T1** — Create `scripts/lib/` directory if missing
2. **T2** — Write `scripts/lib/get-date-modified.js` helper (cached git mtime + override)
3. **T3** — Patch `scripts/prerender-blog-posts-enhanced.js`: import helper, pass JSON file path through to schema generation, swap line 140
4. **T4** — Patch `scripts/generate-sitemap.js`: import helper, swap line 75 to use git mtime
5. **T5** — Patch `scripts/prerender-blog-posts.js` (legacy parity): same as T3
6. **T6** — Patch `src/utils/blogSchemaEnhancer.js` line 174: prefer `metadata.dateModified` first
7. **T7** — Run `npm run build` and confirm exit 0
8. **T8** — Verify `dist/sitemap.xml` contains git-derived `<lastmod>` for sample post
9. **T9** — Verify a prerendered HTML file contains distinct `datePublished` and `dateModified` in JSON-LD
10. **T10** — Stage public/sitemap.xml change (auto-regenerated) + new files + edits
11. **T11** — Commit on branch `spec/issue-286-datemodified` with proper message
12. **T12** — Push branch, open PR with `Closes #286. Refs #283.`, merge with `--squash --delete-branch --admin`
