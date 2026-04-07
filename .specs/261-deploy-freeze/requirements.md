# Requirements: Resolve Feb 8 Deploy Break (#261)

## Problem
Commit `8c55df1` broke production deploys on Feb 8 by making `validate-posts.js` call `process.exit(1)` on ALL errors. The build pipeline runs validation first (`node scripts/validate-posts.js && ...`), so any validation error kills the entire build. Five posts have array-format `content` fields that crash with `post.content.trim is not a function`, and several posts are missing `date` or `metaDescription` fields. Zero commits to main since Feb 11 (~57 days frozen).

## Root Cause
The original commit promoted non-critical validation checks to hard errors without fixing the underlying data issues:
1. **Array content crash**: 5 posts have `content` as an array of section objects, not a string. `post.content.trim()` throws TypeError.
2. **Missing fields**: 3 posts missing `date`, 7 missing `metaDescription` - these were treated as errors instead of warnings.
3. **Alt text promotion**: Missing `alt_text` promoted from warning to error (affects 140+ posts).

## Acceptance Criteria
1. `npm run build` succeeds with zero errors
2. `node scripts/validate-posts.js` handles array content without crashing
3. Validation reports issues as warnings (non-blocking) for: missing alt_text, missing metaDescription, missing date
4. Validation reports issues as errors (non-blocking, logged but no exit(1)) for: empty content, content too short
5. Analytics privacy improvements re-shipped: session recording sampling at 10%, input masking enabled
6. Engagement tracking sampling re-shipped: 10% sampling for heavy engagement events
7. PostHog key kept as hardcoded fallback (env var not set in Vercel, removing fallback would break analytics entirely)
8. Prerender offscreen content removal NOT re-shipped (it was safe but provides minimal value and the offscreen content helps with SEO)

## Out of Scope
- Fixing all 140+ missing alt_text values
- Fixing all 44 meta description length warnings
- Changing build pipeline order
- Adding new validation rules
