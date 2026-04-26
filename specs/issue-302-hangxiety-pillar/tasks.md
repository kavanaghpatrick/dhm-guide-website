# Tasks — Issue #302 Hangxiety Pillar

## T1 — Author post JSON (~6,500 words)
Create `src/newblog/data/posts/hangxiety-complete-guide-2026-supplements-research.json` with title, slug, dates, tags, readTime, quickAnswer, content (12 H2), 18 FAQ entries, image:null.

## T2 — Register post
Add entry to `src/newblog/data/postRegistry.js` (alphabetic position) + append metadata to `src/newblog/data/metadata/index.json`.

## T3 — Update cluster config
Append `hangxiety-mental-health` cluster to `scripts/cluster-config.json`.

## T4 — Generate related posts (auto-populate)
Run `node scripts/generate-related-posts.mjs --write-reciprocal`.

## T5 — Inject inbound links
Add 1 inline contextual link to the new pillar in each of 8 reverse-link target posts (per research).

## T6 — Build verification
- `npm run build` succeeds
- 190 prerendered HTML files (was 189)
- New dist file present
- Post body word count ≥ 6,000
- FAQPage schema in dist HTML
- dateModified in dist HTML

## T7 — Commit, PR, merge
- Branch: `spec/issue-302-hangxiety-pillar`
- Commit + PR + squash-merge --admin
