---
spec: issue-345-residual
phase: requirements
created: 2026-04-28
mode: quick
---

# Requirements: issue-345-residual

## Goal

Implement Section A items A1+A2 (meta description rewrites for #143 + #151 posts) and Section B item B1 (document spec artifact commit policy in CLAUDE.md). A3+A4 redirected to `cleanup/issue-209-best-for-buttons` per research finding — `bestForFilters` array does not exist on main, so editing it here would entangle branch state.

## User Stories

### US-1: Richer SERP snippets for #143 + #151 posts
**As a** Google search-result viewer
**I want** richer, click-motivating meta descriptions on the clinical-trials and NAC-vs-DHM posts
**So that** the snippet entices clicks instead of describing study mechanics flatly

**Acceptance Criteria:**
- [ ] AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 below

### US-2: Documented spec-artifact commit policy
**As a** future contributor opening this repo months from now
**I want** a single canonical place stating which ralph-spec files get committed
**So that** spec hygiene is consistent across branches and I don't have to reverse-engineer the convention

**Acceptance Criteria:**
- [ ] AC-7, AC-8, AC-9 below

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| **AC-1** | `src/newblog/data/posts/dhm-randomized-controlled-trials.json` `metaDescription` field equals verbatim text from issue #143: `"Breakthrough 2024 study proves DHM cuts hangover severity by 70%. See the peer-reviewed results from Foods journal that explain exactly how it works."` (149 chars) | `jq -r '.metaDescription' src/newblog/data/posts/dhm-randomized-controlled-trials.json` matches exactly |
| **AC-2** | That post's `title` field UNTOUCHED on this branch (title edit is on #143 branch; merging both layers cleanly because they're different fields) | `git diff main -- src/newblog/data/posts/dhm-randomized-controlled-trials.json` shows ONLY `metaDescription` change |
| **AC-3** | `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` `metaDescription` field equals verbatim text from issue #151: `"NAC vs DHM: Which protects your liver better? Complete comparison reveals when to use each (and why combining them may be the smartest choice)."` (143 chars) | `jq -r '.metaDescription' …` matches exactly |
| **AC-4** | That post's `title` field UNTOUCHED on this branch | `git diff main -- src/newblog/data/posts/nac-vs-dhm-…json` shows ONLY `metaDescription` change |
| **AC-5** | After build, both meta descriptions appear in their respective `dist/never-hungover/<slug>/index.html` files | `grep -oE 'name="description" content="[^"]*"' dist/never-hungover/dhm-randomized-controlled-trials/index.html` and `…/nac-vs-dhm-…/index.html` show new text |
| **AC-6** | `npm run build` exits 0; no JSON parse errors | `npm run build; echo $?` returns 0 |
| **AC-7** | Spec policy documented via CLAUDE.md addition (option a — recommended for global discoverability) | New section header present in `CLAUDE.md` referring to spec hygiene |
| **AC-8** | Policy text states: "For each spec under `specs/issue-*/`, commit all 4 markdown files (`research.md`, `requirements.md`, `design.md`, `tasks.md`). Do NOT commit `.progress.md` or `.ralph-state.json` — both are gitignored as working state." | `grep -A6 "Spec hygiene" CLAUDE.md` shows the policy text |
| **AC-9** | A3 + A4 redirect to #209 documented in this spec's `tasks.md` so a future reader knows where they went | `grep -A4 "A3.*#209\|redirect.*209" specs/issue-345-residual/tasks.md` finds explicit note |

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | Replace `metaDescription` in `dhm-randomized-controlled-trials.json` with verbatim issue #143 text | High | AC-1, AC-2 |
| FR-2 | Replace `metaDescription` in `nac-vs-dhm-…2025.json` with verbatim issue #151 text | High | AC-3, AC-4 |
| FR-3 | Add ~5-line "Spec hygiene" section to project `CLAUDE.md` stating commit policy | Medium | AC-7, AC-8 |
| FR-4 | Document A3+A4 redirect to `cleanup/issue-209-best-for-buttons` in this spec's `tasks.md` | High | AC-9 |
| FR-5 | Build remains green after all edits | High | AC-6 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | No fabricated meta-description text | Char-for-char match against issue body | 100% |
| NFR-2 | No collateral edits to post JSONs (only `metaDescription`) | `git diff` on each file | Single field change |
| NFR-3 | Build remains green | `npm run build` exit code | 0 |
| NFR-4 | No new dependencies | `package.json` diff | No additions |
| NFR-5 | CLAUDE.md edit uses unique section header to avoid future conflicts | Header text | "Spec hygiene" or similar non-collision-prone phrase |

## Glossary

- **`metaDescription`**: camelCase field in post JSONs at `src/newblog/data/posts/*.json` — the SEO description rendered into prerendered HTML's `<meta name="description">`.
- **`bestForFilters`**: array in `src/pages/Reviews.jsx` defining filter-button predicates. Lives on `cleanup/issue-209-best-for-buttons`, NOT on main.
- **Spec artifact**: one of `research.md`, `requirements.md`, `design.md`, `tasks.md` under `specs/issue-*/`. Per-policy: all 4 are committed.
- **Working-state files**: `.progress.md`, `.ralph-state.json`, `.current-spec`, `.current-epic`, `.index/` — all gitignored.

## Scope

### In Scope
- `src/newblog/data/posts/dhm-randomized-controlled-trials.json` — `metaDescription` field only
- `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json` — `metaDescription` field only
- `CLAUDE.md` — add "Spec hygiene" section (~5 lines)
- `specs/issue-345-residual/tasks.md` — document A3+A4 redirect

### Out of Scope (Deferred to #209 branch)
- **A3** match-count badges on `bestForFilters` buttons — implement on `cleanup/issue-209-best-for-buttons` directly
- **A4** "Best Overall" regex expansion `\b(best|trusted)\b` → `\b(best|trust)\w*` — same redirect

### Out of Scope (Per issue body)
- Section C (merge sequencing — guidance, not code)
- Section D (6 gated/deferred items: #157, #200, #205+#214, #51, #249, #28+#85)
- Section E (recommendations, not code)
- B2 cosmetic checkboxes on #251 (sealed branch)
- Title field edits on the 2 target posts (those are on #143/#151 branches)
- `.gitignore` changes (current state already correct per research)
- Cosmetic spec-dir cleanup on past sealed branches

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Field name might be `seo.description` instead of `metaDescription` | Research confirmed `metaDescription` (camelCase) on both files. No nested `seo` object. |
| Recommended meta exceeds 160 chars | Verified: #143 = 149 chars, #151 = 143 chars. Both under 160 with safety margin. No trimming needed. |
| CLAUDE.md merge conflict with parallel branches | Low risk — no other April 2026 branches edit CLAUDE.md. Use unique "Spec hygiene" section header to minimize collision surface. |
| #143/#151 branches haven't merged when this lands | Clean — different JSON keys (title vs metaDescription) layer cleanly via 3-way merge regardless of order. |

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Future reader asks "why didn't A3/A4 ship on #345?" | Medium | Explicit, prominent note in `tasks.md` and PR body explaining the #209-branch redirect (AC-9 enforces this) |
| Conflict with #143/#151 branches | Low | Title and metaDescription are different keys — clean 3-way merge guaranteed. AC-2 and AC-4 enforce title untouched. |
| CLAUDE.md merge conflict | Low | No other live branches editing CLAUDE.md per April 2026 audit. |
| Verbatim text typo (drifts from issue #143/#151 body) | Medium | Copy-paste from issue body; verify with `jq -r '.metaDescription' \| wc -c` matches expected char count (149 / 143) |
| Build breaks from malformed JSON edit | Medium | `npm run validate-posts` runs in build chain; AC-6 catches this. |

## Unresolved Questions

None. Research phase resolved all ambiguities:
- Field name confirmed (`metaDescription` camelCase, no nested `seo`)
- Verbatim text and char counts confirmed (149 / 143)
- A3/A4 redirect path confirmed (`cleanup/issue-209-best-for-buttons` is the correct branch)
- CLAUDE.md location confirmed as the right venue for B1 policy doc

## Success Criteria

- 2 post JSONs have new `metaDescription` matching issues #143 + #151 verbatim
- 1 CLAUDE.md addition documents spec-artifact commit policy in ~5 lines
- 1 `tasks.md` note redirects A3+A4 to #209 branch
- `npm run build` exits 0
- New meta descriptions appear in prerendered HTML for both posts
- No `title` field changes, no `.gitignore` changes, no other collateral edits

## Next Steps

1. Generate `design.md` — straightforward 4-task plan: 2 JSON edits, 1 CLAUDE.md addition, 1 tasks.md redirect note
2. Generate `tasks.md` from design (must include AC-9 redirect documentation prominently)
3. Execute tasks (data + doc edits only — no code logic changes)
4. Verify build green; verify prerendered HTML contains new meta descriptions
5. Open PR; reference issues #143, #151, #251, and #345; explicitly call out A3+A4 redirect to #209 in PR body
