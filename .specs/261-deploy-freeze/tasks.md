# Tasks: Resolve Feb 8 Deploy Break (#261)

## Task 1: Fix validate-posts.js content handling
- Add content normalization function to handle string and array formats
- Demote `metaDescription` and `date` from required errors to warnings
- Keep `alt_text` check as warning only
- Ensure NO `process.exit(1)` calls for validation errors
- Add thin content summary reporting
- Test: `node scripts/validate-posts.js` runs without crash, reports issues as warnings

## Task 2: Re-ship analytics privacy (posthog.js)
- Add input masking to session recording config
- Add 10% sample rate for session recordings
- Update comments to reflect privacy-safe config
- Keep hardcoded API key fallback
- Test: `npm run build` succeeds

## Task 3: Re-ship engagement sampling (useEngagementTracking.js)
- Add `shouldTrack` ref with 10% sampling
- Gate all tracking callbacks behind `shouldTrack.current`
- Test: `npm run build` succeeds

## Task 4: Update sitemap dates
- Update lastmod dates to current date (2026-04-07)
- Already done in working directory

## Task 5: Verify full build
- Run `npm run build` end-to-end
- Confirm zero errors
- Confirm validation reports issues as warnings only
