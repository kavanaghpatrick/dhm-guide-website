# Requirements — Issue #344 Post-Audit Cleanup

## Goal

Post-audit defect bundle. Five independent, mechanical fixes verified by 10-agent audit + 10-agent verification round. Each item solves a real problem with minimal code; no new features. Total scope ≈ 2 hours, additive only (no behavior removal except dead deps).

## User Stories

### US-1: Per-route prerender body stub
**As a** social/search crawler that doesn't run JS
**I want** the off-screen body stub on each main page to reflect that page's content
**So that** the body I parse matches the `<head>` OG tags (currently every main page ships generic homepage body text).

### US-2: Bot/preview exclusion from PostHog
**As an** A/B-test analyst
**I want** bot traffic and Vercel preview deploys excluded from PostHog event capture
**So that** experiment cohorts and conversion rates reflect real users, not crawlers/CI.

### US-3: Mobile input + safe-area polish
**As a** mobile user filling out the dosage calculator or reaching for the sticky CTA
**I want** decimal keyboards on decimal inputs, viewport that extends under the notch, and a CTA that clears the home-indicator
**So that** the experience feels native instead of broken on edge-to-edge phones.

### US-4: Unified, categorized OG image fallback
**As a** social-share recipient seeing a DHM Guide link in a feed
**I want** posts without hero images to fall back to a category-relevant image consistently across prerender HTML and client SEO
**So that** previews look intentional, and the architecture has one fallback source-of-truth instead of two diverging defaults.

### US-5: Remove unused dependencies
**As a** future contributor / build pipeline
**I want** the 5 confirmed-unused npm packages (and their wrapper components) removed
**So that** the dep tree, install time, and bundle reflect actual usage.

## Acceptance Criteria

### US-1 Prerender body stub
- [ ] AC-1.1: `index.html` contains a `<div id="prerender-main-stub">` (id added to existing off-screen div); off-screen positioning style preserved (FOUC fix from PR #343 not regressed).
- [ ] AC-1.2: `scripts/prerender-main-pages.js` defines a `bodyStub` field per route entry for all 7 routes (homepage, /reviews, /guide, /research, /about, /dhm-dosage-calculator, /compare).
- [ ] AC-1.3: After `npm run build`, the `<h1>` text inside `#prerender-main-stub` differs between `dist/reviews/index.html`, `dist/about/index.html`, `dist/guide/index.html`, `dist/research/index.html`, `dist/dhm-dosage-calculator/index.html`, and `dist/compare/index.html` (no two main pages share identical stub copy).
- [ ] AC-1.4: The stub div remains off-screen in the built HTML (computed style: `position: absolute; left: -9999px;` or equivalent).
- [ ] AC-1.5: Existing `<head>` mutations (title, description, OG, Twitter, canonical, schemas) for the 7 routes unchanged.

### US-2 PostHog bot/preview exclusion
- [ ] AC-2.1: `initPostHog()` in `src/lib/posthog.js` returns early (skips `posthog.init`) when `navigator.userAgent` matches a bot regex covering at minimum: `bot`, `crawler`, `spider`, `googlebot`, `bingbot`, `yandexbot`, `duckduckbot`, `slurp`, `baiduspider`, `prerender`, `headless`, `phantomjs`, `lighthouse` (case-insensitive).
- [ ] AC-2.2: `initPostHog()` returns early when `window.location.hostname` includes `vercel.app`, equals `localhost`, or starts with `127.`.
- [ ] AC-2.3: Real-user production traffic still initializes PostHog (no regression on `dhmguide.com`).
- [ ] AC-2.4: Existing event names, properties, and dashboards unchanged. Backward compatible — no event-shape break.
- [ ] AC-2.5: Secondary capture sites (`engagement-tracker.js`, `identifyUser`) need no per-call gating — they already check `posthog.__loaded`, which stays false when init is skipped.

### US-3 Mobile inputmode + safe-area-inset
- [ ] AC-3.1: `src/pages/DosageCalculator.jsx` duration input (~line 519) carries `inputMode="decimal"` (React prop; renders as `inputmode="decimal"` in HTML).
- [ ] AC-3.2: `index.html` viewport meta tag includes `viewport-fit=cover` after existing values.
- [ ] AC-3.3: `src/components/StickyMobileCTA.jsx` root container className includes `pb-[env(safe-area-inset-bottom)]` (or arbitrary-value equivalent that emits the CSS env() function).
- [ ] AC-3.4: No layout regression in the desktop view of either the calculator or the sticky CTA (visual/build check).

### US-4 OG image fallback unification
- [ ] AC-4.1: A single `getCategoryImage(post)` helper exists (one definition, one source of truth) that maps post tags to an existing image path under `/public/`. No new artwork commissioned.
- [ ] AC-4.2: Mapping table includes at minimum: hangover-prevention/hangover-cure tags → `/dhm-hangover-prevention.webp` (or equivalent existing public image); all other categories → unified default (`/og-image.jpg`).
- [ ] AC-4.3: Both fallback sites use the same helper and the same default:
  - `scripts/prerender-blog-posts-enhanced.js` (the `og:image` fallback path AND the Article schema `image` fallback path)
  - `src/hooks/useSEO.js` (`finalImage` fallback)
- [ ] AC-4.4: After this fix, prerendered HTML and runtime client SEO produce the **same** `og:image` URL for a post with `image: null` (no more `/og-image.jpg` vs `/blog-default.webp` divergence).
- [ ] AC-4.5: `flyby-vs-fuller-health-complete-comparison.json` has its broken `image` reference (`/images/flyby-vs-fuller-health-hero.jpg`) set to `null` so it falls through to the new categorized fallback.
- [ ] AC-4.6: Posts with valid hero images continue to use them — fallback only triggers when `post.image` is null/falsy.
- [ ] AC-4.7: All ~62 affected posts resolve to a real, existing file under `/public/` (no new 404s introduced).

### US-5 Remove unused dependencies
- [ ] AC-5.1: `package.json` no longer lists `recharts`, `embla-carousel-react`, `input-otp`, `cmdk`, `vaul` (5 deps removed).
- [ ] AC-5.2: The 5 wrapper files removed: `src/components/ui/chart.jsx`, `src/components/ui/carousel.jsx`, `src/components/ui/input-otp.jsx`, `src/components/ui/command.jsx`, `src/components/ui/drawer.jsx`.
- [ ] AC-5.3: `npm run build` succeeds — Vite/Rollup raise no resolution errors.
- [ ] AC-5.4: Confirmed-in-use packages (`micromark`, `next-themes`, `posthog-js`) untouched in `package.json`.
- [ ] AC-5.5: No imports of the 5 removed packages remain anywhere in `src/`, `scripts/`, or `public/` (grep clean).

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Backward compatibility — event names, schema fields, public APIs | Zero breaking changes |
| NFR-2 | Build passes after each item | `npm run build` exit 0 |
| NFR-3 | No new test infrastructure required | Visual + build-output verification only |
| NFR-4 | FOUC fix (PR #343) preserved | Off-screen positioning intact on prerender stub |
| NFR-5 | Z-index/stacking-context state (PRs #339–#341) preserved | No header/dropdown/CTA interactions altered |
| NFR-6 | Tailwind v4 token system (PR #341) preserved | No `tailwind.config.js` regressions |

## Glossary

- **Stub** — Off-screen `<div>` rendered into prerendered HTML so non-JS crawlers see body content matching the `<head>`.
- **Prerender** — Build-time HTML generation via `scripts/prerender-*.js`, producing static HTML in `dist/` per route.
- **Init guard** — Early-return at the top of `initPostHog()` that prevents `posthog.init()` from being called.
- **OG fallback** — The image used for `<meta property="og:image">` when a post has `image: null`.
- **Wrapper component** — A `src/components/ui/<name>.jsx` file that re-exports a third-party UI library; deletable when the underlying lib is unused.

## Scope

### In Scope (5 items)
1. Per-route prerender body stub for the 7 main pages
2. PostHog bot/preview exclusion via init guard
3. Mobile inputmode (duration only) + viewport-fit=cover + safe-area-inset on sticky CTA
4. Unified categorized OG image fallback across prerender + useSEO + one broken-reference cleanup
5. Removal of 5 confirmed-unused deps + their wrappers

### Out of Scope
**False positives rejected by audit verification:**
- /reviews experiment overlap (flags isolated)
- Tailwind v4 `@source` directive (v4 auto-detects)
- Blog inline affiliate placement gap (already has `data-placement`)
- lucide-react bundle reduction (39.2KB Brotli is fine, tree-shaking works)
- engagement-tracker.js orphan removal (actively imported)
- Comparison/header z-index "inversion" (no actual geometric overlap)

**Deferred opportunities found during research (NOT this scope):**
- `inputMode="numeric"` for weight/drinks fields in `DosageCalculator.jsx` (issue specified duration only)
- Refactoring secondary capture sites (`engagement-tracker.js`, `identifyUser`) — `posthog.__loaded` check is sufficient
- Commissioning new category-specific OG artwork (beyond reusing `/public/` images)

## Edge Cases & Risks

- **Post with no recognizable category tag** → `getCategoryImage` falls through to unified default (`/og-image.jpg`). Acceptable; same behavior as today for that post.
- **Bot UA we didn't list slips through** → Captures one extra non-human visit. Dashboards reach ≈95% clean, which is the goal — perfect bot detection is not a requirement.
- **Vercel preview hostname pattern changes** → Current check uses `vercel.app` substring; if Vercel rebrands preview domains, the check stops working. Acceptable risk; documented behavior.
- **New main page added later without `bodyStub` field** → Falls back to current generic stub (no regression vs today). Documented in design.
- **Dep removal breaks a hidden import** → `npm run build` fails fast; rollback is a 1-line revert per package.

## Unresolved Questions

- Item #4: Confirm the canonical default image filename (`/og-image.jpg` vs another) before unification — research notes both `og-image.jpg` and `blog-default.webp` exist; design phase should pick one and document why.

## Next Steps

1. Design phase: file-by-file change plan, grouped by item; pick canonical OG default; map existing `/public/` images to category tags.
2. Tasks phase: split into 5 independently-shippable tasks (one per item), each with build verification.
3. Implementation: 5 PRs against `cleanup/issue-344-post-audit` branch, verify build per PR.
