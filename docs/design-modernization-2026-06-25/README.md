# Design Modernization Sprint — 2026-06-25

**Goal:** modernize the *look* of the 6 primary pages, then ship the best ideas as
**PostHog A/B variants** measured against the current design.

## Contents
- **`briefs/`** — shared context for the design team:
  - `design-system-brief.md` — the current system (tokens, fonts, components)
  - `posthog-ab-brief.md` — how a variant gets A/B-tested (existing `useExperiment` mechanism)
  - `modernization-goal.md` — goal + guardrails (simplicity, CWV/SEO, A/B-testability)
  - `modernized-design-language.md` — the shared modern direction (produced by the design lead)
- **`screenshots/`** — the screenshot library, by page (filmstrip frames `NN` = top→bottom),
  desktop (1440) + mobile (390), captured from production. See each page's `README.md` and
  `manifest.json`.
- **`recommendations/`** — per-page modernization recommendations (written from workflow output).
- **`PLAN.md`** — the master modernization + prioritized A/B experiment roadmap.

## The 6 primary pages
| Slug | Route | Source |
|------|-------|--------|
| home | `/` | `src/pages/Home.jsx` |
| reviews | `/reviews` | `src/pages/Reviews.jsx` |
| guide | `/guide` | `src/pages/Guide.jsx` |
| research | `/research` | `src/pages/Research.jsx` |
| compare | `/compare` | `src/pages/Compare.jsx` |
| never-hungover | `/never-hungover` | `src/newblog/pages/NewBlogListing.jsx` |

## How it was produced
A 10+ agent design workflow: **1 design-language lead → 6 per-page designers** (each *reads
its page's screenshots* + source component) **→ 6 feasibility reviewers** (simplicity / Core
Web Vitals / A/B-testability) **→ 1 synthesis lead**. Capture script:
`scripts/capture-design-library.mjs` (re-run anytime to refresh the library).
