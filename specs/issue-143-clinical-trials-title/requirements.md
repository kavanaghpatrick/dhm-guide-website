# Requirements — Issue #143

## Acceptance criteria (from issue)

- [x] Title updated to under 60 characters (target ≤55)
- [ ] Meta description updated with benefit-focused copy — **OUT OF SCOPE for this PR**; current meta already includes "70% hangover reduction" and reads well. Defer to a follow-up if data warrants.
- [ ] Changes deployed to production — handled by Vercel auto-deploy after merge (out of branch scope)
- [ ] GSC reindex requested for the page — manual user step post-merge

## In-scope for this branch

1. Trim `title` field in `src/newblog/data/posts/dhm-randomized-controlled-trials.json` from 68 chars → 55 chars.
2. Verify build (`npm run build`) succeeds.
3. Verify dist HTML contains the new title.
4. Two clean commits, no unrelated WIP staged.

## Out of scope

- Meta description rewrite (defer; measure title impact first)
- GSC reindex (user task post-deploy)
- Any other content/code changes
