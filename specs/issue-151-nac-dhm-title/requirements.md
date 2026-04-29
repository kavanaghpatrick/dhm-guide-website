# Requirements — Issue #151

## Acceptance criteria (from issue)

- [x] Title reduced to under 60 characters (target 55-58)
- [x] "Antioxidant" replaced with more relevant term ("Liver Supplement")
- [x] [2025] bracket pattern added (issue suggested `[2025 Test]`; we use `[2025]` per task spec — preserves bracket CTR boost without speculative "Test" claim)
- [ ] Meta creates curiosity about combining — **OUT OF SCOPE for this PR**; defer to a follow-up after measuring title impact (matches #143 pattern)
- [ ] Changes deployed — handled by Vercel auto-deploy after merge (out of branch scope)

## In-scope for this branch

1. Trim `title` field in `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` from 71 chars → 55 chars.
2. Verify build (`npm run build`) succeeds.
3. Verify dist HTML contains the new title.
4. Two clean commits, no unrelated WIP staged.

## Out of scope

- Meta description rewrite (defer; measure title impact first)
- GSC reindex (user task post-deploy)
- Any other content/code changes
