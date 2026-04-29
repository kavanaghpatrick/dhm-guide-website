# Issue #86 — Phase 4: Fix Broken Internal Links in Existing Posts

**Branch:** `cleanup/issue-86-broken-links`
**Issue:** https://github.com/kavanaghpatrick/dhm-guide-website/issues/86

## Goal

Eliminate every broken `/never-hungover/<slug>` link in post JSON content. Post-Phase-1 verification work; the hub post already has 0 broken refs.

## Scope (after audit)

Initial audit reported 17 broken refs across 9 posts. After investigation, 1 was a false positive (the gen-z-mental-health post slug legitimately contains `%`, which the audit regex `[a-z0-9-]+` didn't accept). Net: **16 genuinely broken refs across 8 posts** were repaired, and the audit regex was widened to `[a-z0-9%-]+` so it stops false-flagging the legitimate slug. (Initial ultrathink estimate of ~15 was effectively correct.)

## Approach

1. Reusable audit script (`scripts/check-broken-internal-links.mjs`) walks every post JSON and matches every `/never-hungover/<slug>` against the live post-slug set. Recurses through arrays/objects so FAQ blocks etc. are covered.
2. Map each broken slug to one of three fates:
   - **rename** — the post exists under a different slug
   - **point-to** — semantic redirect to a closely-adjacent post
   - **remove** — strip the link, keep readable text
3. Re-run audit until 0 broken refs.
4. Verify build.

## Per-fix mapping

| # | Broken slug | Post(s) using it | Fate | Replacement |
|---|---|---|---|---|
| 1 | `dhm-fatty-liver-disease-nafld` | `can-you-take-dhm-every-day-long-term-guide-2025.json` | rename | `non-alcoholic-fatty-liver-disease-nafld-prevention-management-guide-2025` |
| 2 | `dhm-supplement-cost-price-guide` | `can-you-take-dhm-every-day-long-term-guide-2025.json` | point-to | `dhm-dosage-guide-2025` (cost discussed in dosage context; closest existing post) |
| 3 | `best-dhm-supplement-2025-detailed-reviews` | `dhm-availability-worldwide-guide-2025.json`, `dhm-vs-zbiotics.json` | point-to | `/reviews` (top-level review hub page) |
| 4 | `best-pre-drink-supplements-complete-protocol` | `dhm-vs-zbiotics.json` | rename | `what-to-eat-before-drinking-alcohol-evidence-based-guide` |
| 5 | `dhm-vs-prickly-pear-extract-hangover-comparison` | `does-dhm-work-honest-science-review-2025.json` | rename | `dhm-vs-prickly-pear-hangovers` |
| 6 | `dhm-vs-zbiotics-hangover-prevention-comparison` | `does-dhm-work-honest-science-review-2025.json` | rename | `dhm-vs-zbiotics` |
| 7 | `wine-hangover-complete-guide` | `emergency-hangover-protocol-2025.json` | rename | `wine-hangover-guide` |
| 8 | `tequila-hangover-truth-myths-facts` | `emergency-hangover-protocol-2025.json` | rename | `tequila-hangover-truth` |
| 9 | `whiskey-vs-vodka-hangovers-comparison` | `emergency-hangover-protocol-2025.json`, `wine-hangover-guide.json` | rename | `whiskey-hangover-why-it-happens-prevention-guide` (closest existing whiskey-focused post — no whiskey-vs-vodka comparison post exists) |
| 10 | `does-activated-charcoal-help-hangovers` | `emergency-hangover-protocol-2025.json` | rename | `activated-charcoal-hangover` |
| 11 | `dhm-randomized-controlled-trials-2024` | `hangover-supplements-complete-guide-what-actually-works-2025.json` (×2) | rename | `dhm-randomized-controlled-trials` (PR #316 dropped the year suffix) |
| 12 | `gen-z-mental-health-revolution-why-58` (truncated by regex at `%`) | `hangxiety-complete-guide-2026-supplements-research.json` | no-op (false positive) | The actual JSON link is `gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025`, which IS a real post slug — the registry key, sitemap, and filename all use raw `%`. The audit's initial regex `[a-z0-9-]+` didn't include `%` so it flagged the prefix. Fix: extended regex to `[a-z0-9%-]+` and confirmed link is valid. |
| 13 | `hangxiety-2025-dhm-prevention-post-drinking-anxiety` | `holiday-drinking-survival-guide-health-first-approach.json` | rename | `hangxiety-complete-guide-2026-supplements-research` |
| 14 | `whiskey-vs-vodka-hangover` | `wine-hangover-guide.json` (×2: content + faq[3].answer) | rename | `whiskey-hangover-why-it-happens-prevention-guide` (same as #9) |

Note on #9/#14: a true "whiskey vs vodka" comparison post doesn't exist; the closest semantic match is the whiskey-specific guide. Anchor text is preserved.

Note on #12: the JSON has `/never-hungover/gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025` (raw `%` in URL). The audit regex `[a-z0-9-]+` correctly stops at `%`, flagging only the bare prefix. Fix replaces `%` with `%25` to URL-encode it correctly so it round-trips through the router.

## Verification

- `node scripts/check-broken-internal-links.mjs` → 0 broken
- `npm run build` → success
- Spot-check `dist/` HTML for two fixed posts

## Commit plan

1. `feat(scripts): add broken-internal-link audit script (#86)` — `scripts/check-broken-internal-links.mjs`
2. `fix(content): repair 17 broken internal links across 9 posts (#86)` — the 9 edited post JSONs
3. `chore(spec): scaffold ralph spec artifacts for issue #86` — `specs/issue-86-broken-links/`
