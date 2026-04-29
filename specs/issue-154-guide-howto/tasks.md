# Tasks: HowTo Schema for `/guide` Route (Issue #154)

## T1. Update prerender-main-pages.js

- [x] Add `generateHowToSchema` to the import from
      `../src/utils/structuredDataHelpers.js`.
- [x] Add `howToSchema` field to the `/guide` entry in the `pages` array,
      built with `generateHowToSchema({ name, description, totalTime,
      steps, supply })` mirroring the visible 3-step protocol.
- [x] Add conditional `<script type="application/ld+json">` emission in
      the prerender loop, parallel to the existing `faqSchema` block.

## T2. Build and verify

- [x] `npm run build` succeeds.
- [x] `grep -oE '"@type":"HowTo"' dist/guide/index.html` ≥ 1.
- [x] `grep -oE '"@type":"(BreadcrumbList|Article|HowTo)"' \
       dist/guide/index.html | sort -u` returns all three types.
- [x] Verify `dist/never-hungover/dhm-dosage-guide-2025/index.html` and
      the other 3 Tier-1 posts from #251 still emit HowTo.

## T3. Commit

- [x] `feat(seo): emit HowTo schema for /guide route (#154)` — staged file:
      `scripts/prerender-main-pages.js`.
- [x] `chore(spec): scaffold ralph spec artifacts for issue #154` — staged
      file: `specs/issue-154-guide-howto/tasks.md`.

## T4. Stay on branch

- [x] Branch `cleanup/issue-154-guide-howto` checked out, no push, no PR.
