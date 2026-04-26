# Tasks — Issue #287

## T1: Add `lcp-real` subcommand to `scripts/posthog-query.sh`
- Insert new `lcp-real)` case (next to `dead-clicks-real)` for tonal consistency).
- Embed HogQL query from `design.md`.
- Format output as a small table (cohort / samples / avg / p50 / p75 / p95 in seconds).
- Add `echo "  lcp-real          - Desktop LCP split between real users and bot..."` to the `*)` help block.
- Add a short comment above the case explaining the bot fingerprint and pointing to `specs/issue-287-lcp-investigation/research.md`.

## T2: Verify
- Run `./scripts/posthog-query.sh lcp-real` locally with `POSTHOG_PERSONAL_API_KEY` set.
- Confirm real-user p50 < 2500ms.
- Confirm `./scripts/posthog-query.sh` (no args) lists the new command.

## T3: Commit + PR + merge
- Commit on `spec/issue-287-lcp-investigation`.
- Title: `feat: filter bot traffic from LCP measurement (#287)`.
- Body: `Closes #287. Refs #283.`
- Squash-merge with `--admin`.
