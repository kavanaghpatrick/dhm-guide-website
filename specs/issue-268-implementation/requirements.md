# Requirements: Issue #268 Implementation (PostHog Deep-Eval Action Plan)

## 1. Overview

### Problem Statement

The PostHog deep evaluation conducted Apr 25–26, 2026 produced 10 unmerged branches plus 7 small follow-ups. All work is already implemented and committed locally; none of the 10 fix branches have been pushed to origin (2 sibling branches `fix/time-on-page-milestone` and `fix/flyby-comparison-pages` are pushed but lack PRs). Until these land, three categories of regression persist on production:

- **Analytics regression**: `time_on_page_milestone` event volume crashed from ~70/day to ~10/day on Apr 7 because PR #261 silently re-shipped a `Math.random() < 0.1` sampling gate. The site's primary engagement signal is 7× under-counted.
- **Revenue regression / dead spots**: 89% of site traffic produces 0 affiliate clicks because most blog posts have no bridge to `/reviews` (which itself converts at 75% CTR but only sees ~60 PV/month). Fuller Health affiliate clicks are silently dropped because `fullerhealth.com` is missing from `AFFILIATE_URL_PATTERN`. Two `Compare.jsx` placeholder Amazon URLs route to non-existent products. Five comparison posts (~5% of cluster traffic) render blank or with broken array-section schemas (0% scroll-50). The worst dead-click hot spot on the site (`/never-hungover/nac-vs-dhm`) shows 78 dead clicks / 73 PV (~13/session).
- **Latent build/SEO debris**: A `/canonical-fix.js` script has been throwing `SyntaxError: Unexpected token '<'` on every page load for ~6 months because the file was committed to the repo root instead of `public/`, so Vite never deployed it. Likely degrading INP/Core Web Vitals.

### Constraints

- Vercel auto-deploys from `main` and **cancels queued production builds when a newer commit lands**, so naive rapid-fire merges collapse 10 PRs into 1 deploy and lose per-PR attribution.
- One branch (`fix/affiliate-button-audit`) has an amended commit that needs `--force-with-lease` semantics on push.
- Two branches (`feat/template-reviews-cta`, `feat/mobile-comparison-above-fold`) live in isolated `/private/tmp/*` worktrees and must be fetched before push.
- `src/newblog/components/NewBlogPost.jsx` (E + R6 + follow-up #5) and `src/pages/Compare.jsx` (R1 + R7) have file-level conflicts that force sequential merging.
- One sibling branch (`fix/affiliate-dead-clicks`) must NOT be merged — it would globally disable `capture_dead_clicks` and kill genuine UX signal site-wide (e.g., the nac-vs-dhm hot spot we are actively fixing).

### Success Definition

All 12 branches (10 unmerged + 2 already on origin) land on `main` via squash-merge, each behind its own PR, with a per-merge HogQL event-count gate confirming no analytics regression. All 7 follow-ups are completed (or, for #7, surfaced as a user recommendation). Post-deploy metrics move per the verification matrix in §8 within their stated time horizons. The `fix/affiliate-dead-clicks` branch is deleted unmerged. PR #259 is resolved (closed or merged-then-superseded).

## 2. In Scope / Out of Scope

### In Scope

- Push, open PR, gate, and squash-merge each of the 10 unmerged branches.
- Open PRs for the 2 already-pushed branches (`fix/time-on-page-milestone`, `fix/flyby-comparison-pages`).
- Complete 6 of 7 follow-ups (recommend #7 as user action).
- Delete branch `fix/affiliate-dead-clicks`.
- Close PR #259 (superseded by `feat/template-reviews-cta`).
- Capture pre-merge PostHog baseline; run per-merge HogQL sanity gate; monitor post-deploy metrics across stated time windows.

### Out of Scope

- Any code refactor not already present in one of the 12 branches.
- Authoring novel PR descriptions beyond a standard template referencing issue #268.
- Manual end-to-end deploy testing of preview URLs (rely on Vercel auto-deploy + post-merge monitoring).
- Any change to `fix/affiliate-dead-clicks` except deletion.
- Methodology improvements to the PostHog analysis pipeline beyond the documentation note in follow-up #4.
- Re-running the PostHog deep evaluation; this spec consumes its outputs.
- Editing `~/.zshrc` on the user's machine (recommend only).

## 3. User Stories and Acceptance Criteria

Stories are grouped: **Engineering / Merge** (12 branches + 7 follow-ups = 19 stories), **Verification** (3 stories), **Cleanup** (3 stories).

### 3.1 Engineering / Merge Stories

#### US-1: Land `fix/time-on-page-milestone` (analytics regression fix)
**As a** site operator
**I want to** ship the removal of the 10× sampling gate on engagement tracking
**So that** `time_on_page_milestone` event volume returns to ~70/day from its current ~10/day

**Acceptance Criteria:**
- [ ] AC-1.1: PR opened against `main` from origin's `fix/time-on-page-milestone` (already pushed at `369dd0b`); body references issue #268.
- [ ] AC-1.2: PR squash-merged with title matching the commit subject.
- [ ] AC-1.3: Post-merge, `npm run build` passes locally on `main` (sanity).
- [ ] AC-1.4: Within 24h, daily count of `time_on_page_milestone` events returns to ≥50/day (target: ~70/day) per `./scripts/posthog-query.sh events`.

#### US-2: Land `fix/flyby-comparison-pages` (content render fix)
**As a** site operator
**I want to** ship the render fix for `flyby-vs-cheers` (#4 traffic) and `flyby-vs-good-morning-pills`
**So that** these previously-blank comparison posts produce content and scroll-50 events

**Acceptance Criteria:**
- [ ] AC-2.1: PR opened from origin's `fix/flyby-comparison-pages` (already pushed at `d2b6b09`); references issue #268.
- [ ] AC-2.2: PR squash-merged.
- [ ] AC-2.3: After deploy, `curl https://www.dhmguide.com/never-hungover/flyby-vs-cheers-complete-comparison-2025` returns rendered HTML body containing post body text (not empty).
- [ ] AC-2.4: Within 24h, scroll-50 events fire on both posts (count > 0 in HogQL).

#### US-3: Land `fix/canonical-script-404` (pure deletion)
**As a** site operator
**I want to** remove the broken `/canonical-fix.js` script reference from `index.html`
**So that** every page load stops throwing `SyntaxError: Unexpected token '<'` and INP/CWV improves

**Acceptance Criteria:**
- [ ] AC-3.1: Branch `fix/canonical-script-404` (`29cb210`) pushed to origin; PR opened referencing issue #268.
- [ ] AC-3.2: PR squash-merged; diff is pure deletion (no new files added; ~40 lines removed).
- [ ] AC-3.3: After deploy, `curl https://www.dhmguide.com/canonical-fix.js -sI` returns the SPA fallback (HTTP 200, `content-type: text/html`).
- [ ] AC-3.4: After deploy, `curl -s https://www.dhmguide.com/ | grep -c canonical-fix` returns `0`.
- [ ] AC-3.5: Browser DevTools console on any page shows no `SyntaxError: Unexpected token '<'`.

#### US-4: Land `fix/comparison-posts-schema-audit` (3 JSON post fixes)
**As a** site operator
**I want to** ship the array-section → markdown conversion for 3 broken comparison posts
**So that** these posts render content and produce scroll events

**Acceptance Criteria:**
- [ ] AC-4.1: Branch `fix/comparison-posts-schema-audit` (`d43c5af`) pushed; PR opened.
- [ ] AC-4.2: PR squash-merged.
- [ ] AC-4.3: After deploy, all three posts (`double-wood-vs-toniiq-ease-dhm-comparison-2025`, `flyby-vs-dhm1000-complete-comparison-2025`, `flyby-vs-fuller-health-complete-comparison`) return non-empty HTML bodies.
- [ ] AC-4.4: Within 24h, scroll-50 events appear in HogQL for at least 2 of the 3 posts.

#### US-5: Land `fix/widget-attribution-and-mobile-menu` (analytics correctness)
**As a** site operator
**I want to** unify `data-product-name` to the canonical `name` field and snake_case the mobile-menu event names
**So that** PostHog product attribution and event naming are consistent

**Acceptance Criteria:**
- [ ] AC-5.1: Branch `fix/widget-attribution-and-mobile-menu` (`b06e18b`) pushed; PR opened.
- [ ] AC-5.2: PR squash-merged.
- [ ] AC-5.3: After deploy, no new `mobile-menu` (hyphen) events appear in HogQL; `mobile_menu` (snake_case) events continue.
- [ ] AC-5.4: After deploy, `affiliate_link_click` events show `product_name` matching canonical names from `Reviews.jsx` (not brand strings).

#### US-6: Land `fix/affiliate-regex-and-urls` (revenue fix)
**As a** site operator
**I want to** ship `fullerhealth.com` regex extension + 2 placeholder Amazon URL replacements at `Compare.jsx:274,336`
**So that** Fuller Health clicks are tracked and 2 broken Amazon links route to real products

**Acceptance Criteria:**
- [ ] AC-6.1: Branch `fix/affiliate-regex-and-urls` (`f36e8dc`) pushed; PR opened. (Note: this branch is +4 ahead due to cherry-pick recovery.)
- [ ] AC-6.2: PR squash-merged.
- [ ] AC-6.3: Merge ordering: this PR merges AFTER `fix/affiliate-button-audit` (E) due to shared ownership of `Compare.jsx` and to land regex first before R6/R7 layout work.
- [ ] AC-6.4: Within 7 days, ≥1 Fuller Health `affiliate_link_click` event appears in HogQL (was 0 attributable).
- [ ] AC-6.5: After deploy, the two replaced URLs at `Compare.jsx:274,336` are valid `amzn.to/*` short links (visible in built HTML, not the placeholder strings).

#### US-7: Land `fix/affiliate-button-audit` (amended; needs force-with-lease)
**As a** site operator
**I want to** ship the inline-blog Amazon link tagging (`rel`, `data-placement="blog_content_inline"`)
**So that** in-content affiliate clicks are properly attributed in PostHog

**Acceptance Criteria:**
- [ ] AC-7.1: Branch pushed using the explicit-SHA `--force-with-lease` recipe from research.md §"Force-push for amended branch" (or plain `git push` since branch has never been pushed).
- [ ] AC-7.2: PR opened; commit message reflects the amended subject.
- [ ] AC-7.3: PR squash-merged BEFORE `fix/affiliate-regex-and-urls` (R1), per merge order in research.md.
- [ ] AC-7.4: After deploy, inline blog Amazon `<a>` tags carry `data-placement="blog_content_inline"` (verifiable via `curl` + grep on a sample post).

#### US-8: Land `fix/nac-vs-dhm-dead-clicks` (dead-click hot spot fix)
**As a** site operator
**I want to** convert the dosing code-blocks → bullet lists, add 2 inline `/reviews` CTAs, and replace `**Q:**` markers with `### ` h3 on the worst dead-click page
**So that** the 78-dead-click/73-PV ratio collapses

**Acceptance Criteria:**
- [ ] AC-8.1: Branch `fix/nac-vs-dhm-dead-clicks` (`3bfa474`) pushed; PR opened.
- [ ] AC-8.2: PR squash-merged.
- [ ] AC-8.3: Within 7 days post-deploy, dead-clicks-real (per R10's `./scripts/posthog-query.sh dead-clicks-real`) on the nac-vs-dhm page drops measurably from the 78/30d baseline.
- [ ] AC-8.4: After deploy, page renders dosing as bullet list (no green `**Q:**` pill markers) and contains 2 `/reviews` link anchors.

#### US-9: Land `feat/template-reviews-cta` (highest-leverage change)
**As a** site operator
**I want to** auto-render the `/reviews` CTA at mid-content (~30%) and at end on every blog post
**So that** the 89% of traffic with 0 affiliate clicks gets a bridge to the 75%-CTR `/reviews` page

**Acceptance Criteria:**
- [ ] AC-9.1: Branch fetched from worktree `/private/tmp/r6-template-cta` (`68372cd`) into local repo, then pushed to origin; PR opened.
- [ ] AC-9.2: PR squash-merged AFTER R1 (`fix/affiliate-regex-and-urls`) and BEFORE R7 (`feat/mobile-comparison-above-fold`), per research.md §"Recommended merge order" Phase 3.
- [ ] AC-9.3: After deploy, every blog post (188 of 189) renders the mid-content + end `/reviews` CTA. Verifiable via `curl` on 3 sample posts grepping for the CTA anchor.
- [ ] AC-9.4: Over 4–6 weeks, `/reviews` PV rises 2–5× from the ~60/mo baseline.
- [ ] AC-9.5: Over 4–6 weeks, site-wide `affiliate_link_click` count rises +60–120% from the ~56/30d baseline.

#### US-10: Land `feat/mobile-comparison-above-fold`
**As a** site operator
**I want to** move the comparison table above-fold on mobile (`order-first md:order-none`) with `min-h-*` reservation for CLS
**So that** the 2.9× mobile CR advantage gets exercised on more sessions

**Acceptance Criteria:**
- [ ] AC-10.1: Branch fetched from worktree `/private/tmp/r7-mobile-comparison` (`4269916`); pushed; PR opened.
- [ ] AC-10.2: PR squash-merged LAST in Phase 3 (after E, R1, R6).
- [ ] AC-10.3: After deploy, mobile viewport (≤768px) renders the comparison table before the prose body on `/compare/*` pages; desktop layout unchanged.
- [ ] AC-10.4: Lighthouse mobile CLS for `/compare/*` does not regress (baseline captured pre-merge).
- [ ] AC-10.5: Over 4–6 weeks, mobile conversion rate trends up from 3.57% baseline; mobile PV share trends up from 15% baseline toward 25%+.

#### US-11: Land `test/affiliate-regression`
**As a** site operator
**I want to** ship the Playwright regression suite that asserts via `window.dataLayer`
**So that** future click-handler regressions are caught in CI

**Acceptance Criteria:**
- [ ] AC-11.1: Branch `test/affiliate-regression` (`a1f036c`) pushed; PR opened.
- [ ] AC-11.2: PR squash-merged AFTER all of Phase 3 (E, R1, R6, R7) so tests reflect final code state.
- [ ] AC-11.3: `npx playwright test --config=playwright.affiliate.config.js` passes 4/4 against `main` after merge.

#### US-12: Land `chore/hygiene-and-utm`
**As a** site operator
**I want to** rotate the dead PostHog API key fallback, add `dead-clicks-raw`/`dead-clicks-real` query subcommands, and document the UTM standard
**So that** the `posthog-query.sh` helper works and dead-click analysis can filter the amzn `target="_blank"` false-positives

**Acceptance Criteria:**
- [ ] AC-12.1: Branch `chore/hygiene-and-utm` (`3abd076`) pushed; PR opened.
- [ ] AC-12.2: PR squash-merged in Phase 2 (parallel-safe with R3, R5, R2, R9).
- [ ] AC-12.3: After merge, `./scripts/posthog-query.sh dead-clicks-real` executes successfully and returns a count smaller than `dead-clicks-raw` by exactly the amzn false-positive delta (~11 events).
- [ ] AC-12.4: `docs/posthog-analysis-2026-04-25/r10-utm-standard.md` exists on `main`.

#### US-13: Follow-up #1 — `flyby-vs-fuller-health` image dict→string fix
**As a** site operator
**I want to** apply the Pattern #8 image-as-dict fix to the `flyby-vs-fuller-health` post JSON
**So that** the pre-existing build warning `unsafe.replace is not a function` is eliminated

**Acceptance Criteria:**
- [ ] AC-13.1: Fix applied AFTER `fix/comparison-posts-schema-audit` (R5) merges (same file).
- [ ] AC-13.2: `npm run build` produces zero `unsafe.replace is not a function` warnings.
- [ ] AC-13.3: Committed as a separate PR referencing issue #268, squash-merged.

#### US-14: Follow-up #2 — DHM1000 brand mismatch
**As a** site operator
**I want to** unify the DHM1000 product name across `Compare.jsx` ("Double Wood Supplements") and `Reviews.jsx` ("Dycetin")
**So that** PostHog product attribution does not split across two names

**Acceptance Criteria:**
- [ ] AC-14.1: Fix applied AFTER `fix/affiliate-regex-and-urls` (R1) merges (same file). Default to the Reviews.jsx canonical name "Dycetin" matching the live Amazon listing.
- [ ] AC-14.2: After deploy, all `affiliate_link_click` events for DHM1000 carry the same `product_name`.
- [ ] AC-14.3: Committed as a separate PR referencing issue #268, squash-merged.

#### US-15: Follow-up #3 — Placeholder Amazon URLs in 3 blog JSONs
**As a** site operator
**I want to** apply the same Compare.jsx URL fix to the 3 blog post JSONs that reference `amazon.com/dhm1000-dihydromyricetin` and `amazon.com/dhm-depot-dihydromyricetin`
**So that** in-post links route to real products consistently with Compare.jsx

**Acceptance Criteria:**
- [ ] AC-15.1: 3 JSON files identified and updated with the same `amzn.to` short links used in `fix/affiliate-regex-and-urls`.
- [ ] AC-15.2: `npm run build` passes (validate-posts threshold satisfied).
- [ ] AC-15.3: Committed as a separate PR referencing issue #268; independent of merge order.

#### US-16: Follow-up #4 — Methodology caveat in `02-top-pages.md`
**As a** site operator
**I want to** add a methodology caveat to `docs/posthog-analysis-2026-04-25/02-top-pages.md` warning that period-over-period framing is fooled by isolated direct-traffic spikes
**So that** future readers do not repeat the dhm-vs-zbiotics false-regression mistake

**Acceptance Criteria:**
- [ ] AC-16.1: A clearly-labelled "Methodology Caveat" section added near the top of the file.
- [ ] AC-16.2: Caveat references the dhm-vs-zbiotics misread and recommends longer baselines or referrer-broken-out comparisons.
- [ ] AC-16.3: Docs-only PR; squash-merged.

#### US-17: Follow-up #5 — Drop redundant `<ReviewsCTA />` from related-posts area
**As a** site operator
**I want to** remove the `<ReviewsCTA />` card from the related-posts area in `NewBlogPost.jsx` (around lines 1390-1402)
**So that** posts do not have 3 `/reviews` CTAs once the template adds mid + end CTAs

**Acceptance Criteria:**
- [ ] AC-17.1: Fix applied AFTER `feat/template-reviews-cta` (R6) merges (same file).
- [ ] AC-17.2: After deploy, blog posts show exactly 2 `/reviews` CTAs (mid + end), not 3.
- [ ] AC-17.3: Committed as a separate PR referencing issue #268, squash-merged.

#### US-18: Follow-up #6 — Resolve PR #259
**As a** site operator
**I want to** close PR #259 (now superseded by `feat/template-reviews-cta`)
**So that** the template-level CTA is the single source of truth and #259 does not introduce duplicate CTAs

**Acceptance Criteria:**
- [ ] AC-18.1: After R6 merges, PR #259 is closed unmerged with a comment linking to the merged R6 PR and to issue #268.
- [ ] AC-18.2: The 5 zero-conversion posts that #259 originally targeted are confirmed to be receiving the template CTA via `curl` spot-check.

#### US-19: Follow-up #7 — Recommend `~/.zshrc` edit
**As a** site operator
**I want to** surface a recommendation to the user to add `POSTHOG_PERSONAL_API_KEY` to `~/.zshrc`
**So that** the working key is in the documented location per CLAUDE.md, not just in `~/.claude/history.jsonl` and the `posthog-query.sh` fallback

**Acceptance Criteria:**
- [ ] AC-19.1: User-facing recommendation documented in the spec output (this requirements file + final task summary), explicitly noted as a USER ACTION (not implemented by the agent).
- [ ] AC-19.2: The exact line to add (`export POSTHOG_PERSONAL_API_KEY=...`) is provided in the recommendation.

### 3.2 Verification Stories

#### US-20: Capture pre-merge baseline
**As a** site operator
**I want to** capture a PostHog baseline snapshot before any PR merges
**So that** post-merge metric movements have a defensible "before" reading

**Acceptance Criteria:**
- [ ] AC-20.1: A baseline file is produced (per research.md `.research-metrics.md` script reference) capturing prior-24h totals for `$pageview`, `affiliate_link_click`, `time_on_page_milestone`, `$exception`, dead-clicks-real, and per-page scroll-50 counts on the 5 fixed comparison posts.
- [ ] AC-20.2: Baseline is captured BEFORE the first PR (US-1) is merged.
- [ ] AC-20.3: Baseline timestamp is recorded so the 24h, 7d, and 4–6w windows are well-defined.

#### US-21: Per-merge HogQL event-volume gate
**As a** site operator
**I want to** run a 5-minute HogQL sanity check between each squash-merge
**So that** if any deploy crashes analytics or revenue events, we catch it before merging the next PR

**Acceptance Criteria:**
- [ ] AC-21.1: Between each merge, wait approximately 5 minutes for Vercel to deploy.
- [ ] AC-21.2: Run `./scripts/posthog-query.sh events` and confirm `$pageview` and `affiliate_link_click` counts in the trailing window are not <50% of the prior-24h baseline rate (no >50% drop).
- [ ] AC-21.3: If the gate fails, halt the merge sequence; investigate; only proceed once gate passes or the cause is identified as deploy lag (and re-checked).
- [ ] AC-21.4: Gate result is recorded against each PR (pass/fail + timestamp).

#### US-22: Post-deploy metric monitoring against the verification matrix
**As a** site operator
**I want to** monitor each branch's target metric over its stated window (24h / 7d / 4–6w)
**So that** we can confirm each fix produced its expected outcome (or roll back if not)

**Acceptance Criteria:**
- [ ] AC-22.1: For each branch in §8 verification matrix, the listed metric is checked at the end of its time window.
- [ ] AC-22.2: Misses are documented; rollback decisions are made per §7 risks-and-rollback.
- [ ] AC-22.3: 4–6w monitoring (R6, R7) is scheduled but not blocking on completion of this spec.

### 3.3 Cleanup Stories

#### US-23: Delete `fix/affiliate-dead-clicks`
**As a** site operator
**I want to** delete the local and (if it exists) remote branch `fix/affiliate-dead-clicks`
**So that** the overbroad `capture_dead_clicks: false` change cannot be accidentally merged

**Acceptance Criteria:**
- [ ] AC-23.1: `git branch -D fix/affiliate-dead-clicks` runs cleanly locally.
- [ ] AC-23.2: If the branch exists on origin, it is deleted there too.
- [ ] AC-23.3: Decision and rationale (would kill genuine UX signal site-wide; use R10's `dead-clicks-real` query-time filter instead) are recorded in this requirements file (§7) and in the issue thread.

#### US-24: Close PR #259
**As a** site operator
**I want to** close PR #259 unmerged after R6 lands
**So that** the template-level CTA is the canonical solution and #259 does not introduce duplicate CTAs

**Acceptance Criteria:**
- [ ] AC-24.1: Per US-18, PR is closed with explanatory comment.
- [ ] AC-24.2: Close happens AFTER R6 (`feat/template-reviews-cta`) has merged and deployed.

#### US-25: Surface `~/.zshrc` recommendation to user
**As a** site operator
**I want to** clearly surface the recommended `~/.zshrc` edit
**So that** the user (not the agent) can complete it

**Acceptance Criteria:**
- [ ] AC-25.1: Per US-19, recommendation appears in this requirements file and in the final spec summary returned to the user.
- [ ] AC-25.2: Recommendation explicitly states this is NOT done by the agent.

## 4. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | All 12 branches squash-merged via individual PRs to `main` | High | One squash-merge commit per branch on `main`; no force-merges |
| FR-2 | Sequential merge protocol with ~5-minute deploy gap between PRs | High | Each PR's merge timestamp ≥ ~5 min after prior; per-PR Vercel deploy attribution preserved (not cancelled) |
| FR-3 | `fix/affiliate-button-audit` pushed via `--force-with-lease` (or plain push if remote is empty) | High | Push command matches research.md recipe |
| FR-4 | Two worktree-resident branches fetched into local repo before push | High | `feat/template-reviews-cta` and `feat/mobile-comparison-above-fold` SHAs match `/private/tmp/*` worktree heads |
| FR-5 | All PR descriptions reference issue #268 | Medium | `gh pr view <num>` shows reference |
| FR-6 | Branch `fix/affiliate-dead-clicks` deleted locally (and on origin if present) | High | `git branch -a | grep affiliate-dead-clicks` returns empty |
| FR-7 | PR #259 closed (not merged) after R6 lands | High | `gh pr view 259 --json state` returns `CLOSED` (not `MERGED`) |
| FR-8 | All 6 implementable follow-ups (#1–#6) merged via separate PRs | High | 6 additional squash-merge commits on `main`, each in correct ordering |
| FR-9 | Follow-up #7 (`~/.zshrc`) recommended to user | High | Recommendation present in spec output; agent does not edit user's `~/.zshrc` |
| FR-10 | Pre-merge PostHog baseline captured | High | Baseline snapshot file exists with timestamp before US-1 merge |
| FR-11 | HogQL event-volume sanity gate run between each merge | High | Gate result recorded per PR |
| FR-12 | Post-deploy metric monitoring per §8 verification matrix | Medium | Each metric checked at the close of its time window; results documented |

## 5. Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Build sanity | `npm run build` exit code | 0 on each branch and on `main` after each merge |
| NFR-2 | Validate-posts thresholds | Per-post content size | Each modified post ≥ 500 chars / ≥ 100 words (build will block otherwise) |
| NFR-3 | Playwright regression | `npx playwright test --config=playwright.affiliate.config.js` | 4/4 pass after US-11 lands |
| NFR-4 | Analytics non-regression | `$pageview` and `affiliate_link_click` 24h trailing rate | No >50% drop vs prior-24h baseline at any per-merge gate |
| NFR-5 | Engagement recovery | `time_on_page_milestone` daily count | ≥50/day within 24h of US-1 deploy (target ~70/day) |
| NFR-6 | CLS non-regression | Lighthouse mobile CLS on `/compare/*` | No regression vs pre-US-10 baseline |
| NFR-7 | Reversibility | Rollback path | Each PR revertible via single `git revert <merge-sha>`; Vercel instant rollback available for any production deploy |
| NFR-8 | Wall-clock budget | Total merge phase + follow-ups | ≈ 2–3 hours (60–80 min merge phase + 60–90 min follow-ups), excluding 4–6w monitoring |

## 6. Operational Requirements

| ID | Requirement |
|----|-------------|
| OR-1 | Open ALL 10 unmerged-branch PRs in parallel BEFORE merging any (Vercel builds previews in parallel; per-PR preview deploys do not collide). |
| OR-2 | Merge sequentially per the order in research.md §"Recommended merge order": Phase 1 (B, C) → Phase 2 parallel-safe (R10, R3, R5, R2, R9) → Phase 3 file-contention (E → R1 → R6 → R7) → Phase 4 (R4 test infra). |
| OR-3 | Use squash-and-merge for every PR. No rebase-merge, no merge-commit. |
| OR-4 | Wait ~5 minutes between merges for Vercel production deploy attribution; run HogQL sanity gate (US-21) before merging the next PR. |
| OR-5 | Use the explicit-SHA `--force-with-lease` form documented in research.md for `fix/affiliate-button-audit` to defeat the background-fetch race. Plain `git push` is acceptable since branch has never been pushed. |
| OR-6 | Capture pre-deploy baseline (US-20) BEFORE any PR merges. |
| OR-7 | Do not promote preview-to-prod; treat each merge as a fresh production deploy (preview env vars differ from production per research.md §"Preview vs production differences"). |
| OR-8 | Skip `fix/affiliate-dead-clicks` and delete the branch (US-23). Use R10's `./scripts/posthog-query.sh dead-clicks-real` query-time filter instead. |
| OR-9 | Standard PR description template: 1-line summary, link to issue #268, link to the relevant `specs/issue-268-implementation/*.md` doc if applicable. |

## 7. Risks and Rollback

### Rollback path

- **Per-PR rollback**: `git revert <merge-sha>` on `main` (squash-merge yields a single SHA per PR).
- **Production hot-rollback**: Vercel dashboard → Deployments → "Promote" a known-good prior production deployment. Instant, no rebuild.
- **Sequencing**: If any HogQL gate (US-21) fails after a merge, rollback that merge before merging the next PR.

### Top risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Vercel cancels in-flight prod build when next merge lands; per-PR attribution lost | High if rapid-merged | OR-4 sequential merge protocol with 5-min gap |
| `fix/affiliate-button-audit` force-push clobbers a peer's work | Low (branch never pushed) | Explicit-SHA `--force-with-lease`; verify `origin/fix/affiliate-button-audit` is absent |
| Worktree-resident branches (R6, R7) get stale or diverge from local | Low | Fetch fresh from `/private/tmp/*` immediately before push; verify SHAs match |
| `feat/template-reviews-cta` introduces 3-CTA-per-post period until follow-up #5 lands | Medium | Stack follow-up #5 immediately after R6 merges; document expected 3-CTA window |
| `feat/mobile-comparison-above-fold` causes mobile CLS regression | Medium | Pre-merge Lighthouse baseline; `min-h-*` reservation already present in branch; rollback if Lighthouse mobile CLS regresses |
| `fix/affiliate-dead-clicks` accidentally merged | Low | OR-8: explicit do-not-merge; delete branch (US-23); document rationale in PR queue and issue #268 |
| HogQL gate false-fires on deploy lag | Medium | Recheck after additional 2–3 min before halting merge sequence |
| Build validate-posts blocks on follow-up #1 fix | Low | Local `npm run build` before pushing follow-up #1 PR |

### `fix/affiliate-dead-clicks` skip rationale (recorded)

Globally setting `capture_dead_clicks: false` solves the amzn `target="_blank"` false-positive cluster but kills genuine UX signal site-wide — including the nac-vs-dhm hot spot we are explicitly fixing in US-8. R10 (`chore/hygiene-and-utm`) provides a query-time filter (`dead-clicks-real`) that strips the false-positives without losing the underlying capture. Use that instead.

## 8. Success Metrics (Verification Matrix)

The 8 metric queries referenced in research.md (`.research-metrics.md` is embedded in research.md per spec instructions). Each branch has an expected metric movement and a time horizon.

| # | Branch | Watch metric | Window | Pre-baseline | Post-target |
|---|--------|--------------|--------|--------------|-------------|
| 1 | `fix/time-on-page-milestone` (B) | `time_on_page_milestone` daily count | 24h | ~10/day | ≥50/day, target ~70/day |
| 2 | `fix/flyby-comparison-pages` (C) + `fix/canonical-script-404` (R3) + `fix/comparison-posts-schema-audit` (R5) | scroll-50 events on the 5 fixed comparison posts | 24h | 0 | non-zero on each |
| 3 | `fix/nac-vs-dhm-dead-clicks` (R9) | dead-clicks-real on `/never-hungover/nac-vs-dhm-*` | 7d | 78/30d | measurable drop |
| 4 | `feat/template-reviews-cta` (R6) | `/reviews` PV | 4–6w | ~60/mo | 2–5× |
| 5 | `feat/template-reviews-cta` (R6) | site-wide `affiliate_link_click` | 4–6w | ~56/30d | +60–120% |
| 6 | `feat/mobile-comparison-above-fold` (R7) | mobile conversion rate | 4–6w | 3.57% | trending up |
| 7 | `feat/mobile-comparison-above-fold` (R7) | mobile PV share | 4–6w | 15% | trending toward 25%+ |
| 8 | `fix/affiliate-regex-and-urls` (R1) | Fuller Health `affiliate_link_click` count | 7d | 0 attributable | ≥1 |

### Sanity queries (run after every merge per US-21)

- Total `$pageview` (last 24h trailing)
- Total `affiliate_link_click` (last 24h trailing)
- Total `$exception` (last 24h trailing) — should not spike

## 9. Glossary

- **HogQL**: PostHog's SQL dialect for analytics queries.
- **CLS**: Cumulative Layout Shift, a Core Web Vitals metric.
- **INP**: Interaction to Next Paint, a Core Web Vitals metric.
- **PR attribution**: Mapping a single production deploy to a single PR (preserved when merges are spaced; lost when Vercel cancels the in-flight build).
- **Squash-merge**: Collapses all branch commits into one commit on `main` with the PR title as subject.
- **Force-with-lease**: A safer form of `git push --force` that refuses if the remote has changed since last fetch. Used here in explicit-SHA form to defeat a background-fetch race.
- **Worktree**: A separate working directory for the same git repository, used by R6 and R7 for isolation (`/private/tmp/r6-template-cta`, `/private/tmp/r7-mobile-comparison`).
- **Dead click**: PostHog's `$dead_click` heuristic — a click that produces no DOM mutation. Fires false-positives on `target="_blank"` links because the source tab does not change.
- **Validate-posts thresholds**: Build-time checks blocking posts shorter than 500 chars / 100 words.
- **/reviews**: The product comparison/review hub page (75% CTR but only ~60 PV/month).

## 10. Unresolved Questions

- **PR description tone/length**: Defaulting to a 1-line summary + link to issue #268 + link to the relevant `specs/issue-268-implementation/*.md` doc. Not a blocker.
- **Whether to assign labels** to the 12 PRs: Defaulting to no labels (matches recent commit history; no project label convention is documented).
- **Whether US-15 (3 blog post JSONs follow-up #3) truly is independent**: Defaulting to "yes" per research.md table; flagged so reviewer can spot-check shared file contention.
- **4–6 week monitoring ownership**: This spec defines the windows and targets but assumes the user (or a future spec) closes the loop. Defaulting to: schedule but do not block this spec's completion on those checks.
- **Reviewer assignment / approval requirements**: Not specified in plan.md or research.md. Defaulting to: author self-review, no required reviewers (matches project's recent solo-merge cadence).

## 11. Next Steps

1. Capture pre-merge PostHog baseline (US-20 / FR-10).
2. Push the 10 unmerged branches and open all 12 PRs in parallel (US-1 through US-12 push/open subset of ACs).
3. Squash-merge in the order from OR-2 (Phase 1 → 2 → 3 → 4), running the per-merge HogQL gate (US-21) between each.
4. Land follow-ups #1, #2, #5 immediately after their dependent branches (R5, R1, R6 respectively).
5. Land follow-ups #3, #4, #6 in any order; close PR #259 (US-18 / US-24) after R6 ships.
6. Surface the `~/.zshrc` recommendation (US-19 / US-25) to the user as the final agent step.
7. Delete `fix/affiliate-dead-clicks` (US-23).
8. Schedule the 4–6 week post-deploy metric checks (US-22) for R6 and R7.
