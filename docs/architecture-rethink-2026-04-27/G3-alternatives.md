# G3 — Architectural Alternatives for DHM-Guide (2026-04-27)

> **Question being answered:** Is React 19 + Vite 6 SPA + custom prerender + Vercel the right architecture for a 196-page, 95% static, content + affiliate site? Or is the SPA model overkill?
>
> **Audience:** Decision document. Output ranks alternatives, recommends a path, and defines the criteria under which we'd revisit.
>
> **Companion docs:** `docs/fouc-2026-04-27/F2-prerender-html.md` (root cause: render-blocking CSS + `createRoot` destroying prerendered HTML), `F8-industry-patterns.md` (industry FOUC fixes).

---

## Executive Summary

**Recommendation: Stay React SPA + improve prerender (Alternative #1).** The current stack is salvageable with **2–4 days** of focused work that fixes FOUC at the root, preserves every SEO win, and risks zero regressions. A migration to Astro (the strongest "greener pasture") delivers superior peak performance but costs **3–6 weeks** of high-risk rewrite touching 189 posts, 14+ React-stateful components, the entire tracking layer, and the prerender pipeline that currently emits 6 schema blocks per post. **The migration's speedup does not justify a multi-week SEO regression risk.**

**Top 2 ranked:**

1. **Stay + fix prerender** — 2–4 junior-dev days. FOUC ~95% gone. Zero SEO/tracking risk. **Recommended.**
2. **Migrate to Astro 5** — 3–6 weeks. FOUC fully gone, 60–80% smaller JS payload. Real risk to FAQ schema, BreadcrumbList, custom canonical pipeline, and `useAffiliateTracking`'s document-level delegation. **Defer until Alternative #1's ceiling is reached.**

**Migrate vs stay decision criteria** (when to flip the recommendation):

- Migrate if Lighthouse mobile <70 after Alt #1 fixes
- Migrate if bundle JS >300KB on blog post route after tree-shake audit
- Migrate if maintainer ships substantially fewer features per quarter due to React tooling friction
- Stay otherwise — current stack works for our scale

---

## Current Architecture Snapshot

| Aspect | Current state | Source |
|--------|---------------|--------|
| Framework | React 19.1 + React Router 7 (custom `useRouter` hook) | `src/App.jsx`, `src/hooks/useRouter.js` |
| Build | Vite 6.3 + Tailwind 4 (Lightning CSS) | `package.json:98`, `vite.config.js` |
| Pages | 196 total: 189 blog posts in `src/newblog/data/posts/*.json` + 7 main routes | `src/App.jsx:14-25` |
| Prerender | Custom JSDOM-based scripts that inject HTML into `dist/<slug>/index.html` | `scripts/prerender-blog-posts-enhanced.js` (461 lines) |
| Hydration | `createRoot()` — **destroys prerendered HTML and rebuilds DOM** | `src/main.jsx:130` |
| Schema | 6 JSON-LD blocks per post (Article, Breadcrumb, FAQ, HowTo, Review, Quick Answer) | `prerender-blog-posts-enhanced.js:131-271` |
| Interactive components | 14 stateful (mega-menu, dosage calculator, comparison widget, mobile drawer, etc.) | grep `useState\|onClick` in `src/components/` |
| UI library | shadcn/ui (46 components) + 25+ Radix primitives + framer-motion 12 + lucide-react | `package.json:23-72` |
| Tracking | 5 hooks: `useAffiliateTracking`, `useScrollTracking`, `useElementTracking`, `useEngagementTracking`, `usePageTracking` (all use document-level event delegation) | `src/hooks/use*Tracking.js` |
| Hosting | Vercel free tier with `vercel.json` redirects + Speed Insights | `vercel.json` |
| Analytics | PostHog (proxied via `/ingest`) + GTM + Clarity | `src/lib/posthog.js` |

**Current pain (the immediate "why now"):**
- ~200ms FOUC window per `F2-prerender-html.md`: stylesheet link is loaded after the JS module, and `createRoot` destroys prerendered article HTML on mount.
- Render-blocking Tailwind CSS bundle.
- Article visible without hero image, sidebar, related posts, or comparison widget for 200–400ms before React mounts.

---

## Evaluation Criteria

For each alternative we score:

1. **Migration effort** (junior-dev days, honest estimate)
2. **FOUC outcome** — gone / reduced / same
3. **SEO regression risk** — preserves the 6 schema blocks, BreadcrumbList, FAQ schema, canonicals, sitemap, internal links, recent ranking gains
4. **Bundle size** delta
5. **Build time** delta (current: ~45s for 189 posts)
6. **Developer experience** — can existing JSX components be reused?
7. **Tracking compatibility** — does `useAffiliateTracking`'s document-level event delegation still work?
8. **PostHog compatibility** — proxy + `/ingest` rewrite still functions
9. **shadcn/Radix/framer-motion** all still work
10. **Content compatibility** — 189 JSON posts still load

---

## Alternative 1 — Stay React SPA + Improve Prerender (RECOMMENDED)

**Concept:** Fix the 4 actual bugs without changing the framework.

### What changes

1. **Switch `main.jsx` from `createRoot` → `hydrateRoot`.** React 19's `hydrateRoot` reuses prerendered DOM nodes instead of destroying them. This is the single biggest win and aligns with how React is designed to consume prerendered HTML (`react.dev/reference/react-dom/client/hydrateRoot`).
2. **Make prerendered HTML match React's first render exactly** (or use `suppressHydrationWarning` strategically). The prerender currently uses raw HTML strings via `micromark`; React renders via `react-markdown`. These produce subtly different output (whitespace, attribute order). Fix: render the article body using `renderToString(<NewBlogPost post={post} />)` in the prerender script instead of micromark.
3. **Inline critical CSS via `vite-plugin-beasties`** (per F8: industry default). 14KB of TCP-window-fitting CSS in `<style>`, async-load the rest. Fixes render-blocking CSS root cause.
4. **Move `<link rel="stylesheet">` before `<script type="module">`** in `index.html` template (cheap, mechanical fix).

### Effort breakdown

| Task | Days | Risk |
|------|------|------|
| Add `vite-plugin-beasties`, configure post-prerender | 0.5 | Low — drop-in plugin |
| Switch to `hydrateRoot()` | 0.25 | Low — 1-line change |
| Fix prerender to use `renderToString` (replace JSDOM + micromark string-stitching) | 1.5 | Medium — most of the rewrite |
| Resolve hydration mismatches (route by route) | 1 | Medium — each mismatch is a 5-minute fix; 196 routes possible but mostly same template |
| Move stylesheet link, manual smoke test 10 routes | 0.25 | Low |
| Re-run build, verify all 6 schema blocks still emit | 0.25 | Low |
| Verify PostHog, GTM, affiliate tracking still fire | 0.25 | Low |
| **Total** | **~4 days** (3 if no surprises) | **Low overall** |

### Scoring

| Criterion | Outcome |
|-----------|---------|
| FOUC | **~95% eliminated.** No DOM destruction + inlined critical CSS = first paint with final styles, hydration is invisible. |
| SEO regression risk | **Zero.** Same prerender pipeline emits same 6 schema blocks, same canonicals, same sitemap. Existing rankings preserved by definition. |
| Bundle size | **Unchanged** (~250KB gz today). Beasties only changes CSS delivery. |
| Build time | **+5–10s** (Beasties pass over 196 HTML files). Acceptable. |
| Developer experience | **No change** — same Vite + React + JSX flow developers know. |
| Tracking | **Preserved 100%.** `useAffiliateTracking` still attaches via `document.addEventListener('click', ...)` after hydrateRoot. |
| PostHog | **Preserved 100%.** No rewrite needed. |
| shadcn/Radix/framer-motion | **All work unchanged.** |
| 189 posts | **All work unchanged.** Same JSON loader. |

### Why this is the recommendation

It's the **simplicity test** answer: the smallest change that fixes the actual problem. Per CLAUDE.md Pattern #6 (pure deletion is safest) and Pattern #11 (prerendered SPAs have dual SEO sources — we already know our prerender pipeline well; replacing it adds risk we don't need to take). The current stack is not broken architecturally — it has a 200ms FOUC bug. Fix the bug.

---

## Alternative 2 — Migrate to Astro 5 (DEFER)

**Concept:** Islands architecture. 189 posts become Astro pages; only mega-menu, dosage calculator, comparison widget, and newsletter signup ship JS.

### What changes

- 189 JSON posts → Astro Content Collections via `glob()` loader (`docs.astro.build/en/guides/content-collections/`). Astro 5's Content Layer can load JSON natively, no rewrite required.
- 7 main pages → `.astro` files with React islands for stateful UI.
- Custom prerender script → deleted (Astro handles this natively).
- `useRouter` hook → Astro file-based routing.
- shadcn/Radix components → wrapped with `client:visible` or `client:idle` directives.
- framer-motion components → require `client:load` (loses zero-JS benefit on those routes; OK because they're navigation only).
- Layout component → split: static parts in `.astro`, mega-menu in React island.

### Effort breakdown

| Task | Days | Risk |
|------|------|------|
| Astro project scaffold + Tailwind 4 + React 19 integration | 1 | Low — well-trodden path |
| Migrate 189 JSON posts to Content Collection | 1 | Low if loader works as advertised; medium if `_sourcePath` git-modified-date logic breaks |
| Recreate Layout.jsx as `.astro` + React island for mega-menu | 1 | Medium — 487 lines of Layout.jsx, much of it stateful |
| Recreate 6 schema generators (FAQ, BreadcrumbList, Article, HowTo, Review, Quick Answer) as Astro components | 1 | **High** — easy to lose subtle escaping/structure that Google currently reads |
| Port 14 stateful components, choose hydration directive per | 2 | Medium — context boundaries between islands break shared state (Astro docs: "React context is not shared between islands") |
| Port 5 tracking hooks (especially `useAffiliateTracking` document-delegation) | 1 | **High** — document-level event delegation works across islands but only on initial mount; navigation-triggered re-renders won't re-attach |
| Port `useRouter` to Astro routing + verify all internal `<a>` tags still work | 1 | Medium |
| Recreate 8 build/post-build scripts (validate-posts, generate-canonicals, generate-sitemap, etc.) as Astro integrations | 2 | Medium |
| Recreate vercel.json redirects (not Astro-managed) | 0.25 | Low |
| Smoke test all 196 routes, validate every schema block, every internal link | 2 | Medium |
| Fix hydration mismatches, fix Radix dropdown clipping in islands, fix framer-motion `LayoutGroup` issues | 2 | Medium |
| Vercel deploy preview, manual SEO audit (curl every page, check Google's URL Inspection on 10 priority posts) | 1 | Medium |
| Buffer for unknowns (Tailwind v4 + Astro edge cases, React 19 + Astro hydration gotchas) | 2 | — |
| **Total** | **15–20 days (3–4 weeks)** for migration only. Add 1 week stabilization on production after launch. | **High overall** |

### Scoring

| Criterion | Outcome |
|-----------|---------|
| FOUC | **Fully eliminated.** Static HTML by default, no hydration on most routes. |
| SEO regression risk | **High during migration**, low long-term. The 6 schema blocks must each be reimplemented; missing one = FAQ rich result loss. Per CLAUDE.md Pattern #11, prerender + crawler validation is non-trivial. |
| Bundle size | **60–80% reduction** on most pages (article pages ship near-zero JS); interactive pages similar to today. |
| Build time | **Faster.** Astro Content Layer 5x faster Markdown builds, 2x faster MDX (`astro.build/blog/content-layer-deep-dive`). 189 posts probably build in <30s. |
| Developer experience | **Mixed.** Can reuse React JSX components via `@astrojs/react`. New mental model (islands, hydration directives, no shared context). Real learning curve. |
| Tracking | **Compatible with caveats.** `document.addEventListener` works across islands. But each island re-mounts on island-specific state — hooks that rely on React lifecycle get fragmented. `useEngagementTracking` (which uses `setInterval` in a hook) needs to live on a `client:load` island shared across the whole layout. |
| PostHog | **Compatible.** Init in a global `client:load` island. Vercel `/ingest` rewrite unchanged. |
| shadcn/Radix | **Mostly compatible.** Dropdowns, dialogs, popovers all work but require `client:load` (not `client:visible`) due to portal rendering needing immediate mount. Some Radix components (`NavigationMenu`) ship more JS than the entire current page bundle. |
| framer-motion | **Compatible with caveats.** `LayoutGroup` shared context is broken across islands by definition (docs: islands don't share React context). Workarounds: use `LayoutGroup id={...}` per island, or scope animations to single islands. Our current `motion` usage is mostly fade-in / scroll-triggered, so likely fine. |
| 189 posts | **Compatible.** Content Collections support JSON natively via `file()` loader. Existing `_sourcePath`-based git-modified-date pipeline must be replicated. |

### Why this is "defer"

Astro is genuinely the best long-term architecture for our content profile (95% static + islands). But:

- The current pain (FOUC) is **fixable in 4 days, not 4 weeks**.
- Migration touches every SEO surface we just spent months optimizing (Issue #29, #30, #38, plus cluster pages, FAQ schema, BreadcrumbList).
- Per CLAUDE.md's simplicity prime directive: "What can I DELETE?" — the FOUC is fixed by deleting `createRoot`'s DOM-destruction, not by deleting React.
- Per Pattern #2 (Question Requirements Before Solving): the question "do we need to migrate?" answers "no, we need to fix prerender."

**When to revisit:** If after Alt #1, mobile Lighthouse <70, or if bundle audit shows JS shipping per post >300KB, or if interactive features grow beyond what islands handle gracefully.

---

## Alternatives 3–6 (Ranked, Brief)

### Alternative 3 — Vite SSG (Vike or vite-react-ssg)

- **Effort:** ~1.5–2 weeks. Less than Astro because we stay on Vite.
- **FOUC:** Fully eliminated (proper SSG output + automatic `hydrateRoot`).
- **SEO risk:** Medium. Schema injection logic must move from custom JSDOM script into Vike `onBeforeRender` hooks. 6 blocks × 196 pages.
- **Bundle:** Similar to today (Vike still ships full React app). No "islands" zero-JS benefit.
- **Tracking:** Fully preserved.
- **Reuse JSX components:** 100%.
- **Why not #1:** All the migration cost of moving routing + prerender pipeline, none of the bundle-size payoff Astro delivers. Awkward middle ground. Vike's React Router v7 integration still maturing per its docs (`vite-plugin-ssr.com/vike`).
- **When to choose:** If we love React-Router-style routing and refuse Astro's file-based model — but then Alt #1 is cheaper anyway.

### Alternative 4 — Next.js App Router (Static Export)

- **Effort:** ~3–5 weeks. Slightly longer than Astro because Vercel-native ergonomics tempt feature-creep into ISR/SSR/middleware (none of which we need).
- **FOUC:** Fully eliminated. RSC + static export = pure HTML on first paint.
- **SEO risk:** Medium-high. Migration of metadata API for 196 routes. App Router requires `'use client'` boundaries that don't naturally match our component structure (Layout.jsx has both static cluster nav + interactive dropdown).
- **Bundle:** ~80–120KB gz baseline + app code. Heavier than Astro, similar to current.
- **Tracking:** Compatible. `useAffiliateTracking` document-delegation works under Next.js App Router.
- **Reuse JSX components:** 100% but each needs `'use client'` directive added.
- **Why not #2:** Next.js's strength is full-stack apps with mixed dynamic/static. Our site is 95% static — paying Next.js's complexity tax (server components, two render contexts, App Router's particular client/server boundary semantics) for static export is overkill. Astro is purpose-built for our profile and ships 60–80% less JS.
- **Vercel hosting:** No advantage over Astro on Vercel; both deploy as static + edge functions.

### Alternative 5 — Remix / React Router v7 framework mode

- **Effort:** ~3–4 weeks.
- **FOUC:** Fully eliminated for SSR mode.
- **SEO risk:** Medium.
- **Bundle:** Similar to today.
- **Why not:** Remix is built for runtime SSR (data loaders, mutations, auth-gated routes). Our site has zero runtime data needs. We'd be paying SSR runtime cost for no runtime benefit. Static export is possible but loses Remix's value-prop. Skip.

### Alternative 6 — Pure SSG (Eleventy / Hugo / Jekyll)

- **Effort:** **6–10+ weeks.** Total rewrite. Lose React entirely.
- **FOUC:** Fully eliminated.
- **SEO risk:** Very high during migration; very low long-term.
- **Bundle:** ~0KB on most pages (vanilla JS for the few interactive widgets).
- **Why not:** Forces complete rewrite of:
  - 14 stateful React components (would become vanilla JS or Alpine/htmx)
  - 5 PostHog tracking hooks
  - Dosage calculator (most complex interactive piece)
  - Comparison widget with sortable rows
  - shadcn/Radix UI library (loses 46 ready-made components)
  - Mega-menu with cluster nav
- React knowledge becomes worthless for this site. Future hires must learn Eleventy/Hugo. **Cure worse than disease.**

---

## Comparison Table

| Alt | Effort | FOUC | SEO Risk | Bundle | Build | DX | JSX Reuse | Tracking | shadcn/Radix | framer-motion | 189 posts |
|-----|--------|------|----------|--------|-------|-----|-----------|----------|--------------|---------------|-----------|
| 1. Stay + improve | **2–4 days** | ~95% gone | **None** | Same | +5–10s | Same | 100% | Works | Works | Works | Works |
| 2. Astro 5 | **3–6 weeks** | Gone | High during, low after | **−60–80%** | Faster | New paradigm | 100% (with directives) | Works (caveat) | Works (`client:load`) | Works (caveat: LayoutGroup) | Native via Content Collections |
| 3. Vike SSG | 1.5–2 weeks | Gone | Medium | Same | Same | Familiar | 100% | Works | Works | Works | Loader rewrite |
| 4. Next.js App Router | 3–5 weeks | Gone | Med-high | Similar | Similar | New paradigm | 100% (`'use client'`) | Works | Works | Works | Migration needed |
| 5. Remix/RR v7 | 3–4 weeks | Gone | Medium | Same | Same | New paradigm | 100% | Works | Works | Works | Loader rewrite |
| 6. Eleventy/Hugo | 6–10+ weeks | Gone | Very high | ~0KB | Faster | Total rewrite | **0%** | Rewrite | **Lose** | **Lose** | Total rewrite |

---

## Decision Criteria — When Each Alternative Wins

| If… | Then… |
|-----|-------|
| FOUC is the only material issue | **Alt 1 (Stay + improve)** ← TODAY |
| Mobile Lighthouse stays <70 after Alt 1 fixes | Alt 2 (Astro) |
| Bundle audit shows >300KB JS shipping per post route | Alt 2 (Astro) |
| Site needs runtime data (user accounts, dynamic recommendations, A/B tests at edge) | Alt 4 (Next.js) |
| Team wants zero JS framework dependency | Alt 6 (Hugo/Eleventy) — but only if rewriting from scratch is worth it |
| Team wants to consolidate on Vite ecosystem | Alt 3 (Vike) — but Alt 1 is cheaper for same gains |

---

## Recommendation

**Execute Alternative 1 this sprint (~3–4 days):**

1. Day 1: Add `vite-plugin-beasties`, switch `createRoot` → `hydrateRoot`, move stylesheet link order.
2. Day 2: Replace JSDOM-based prerender with `renderToString(<NewBlogPost />)` so prerendered HTML matches React's output exactly.
3. Day 3: Resolve hydration mismatches across the 7 main pages + 1 representative blog post template; the 189 posts share the same component so one fix covers them all.
4. Day 4: Smoke test — curl 10 priority routes, validate all 6 schema blocks, run Speed Insights, push to production. Monitor for 48h.

**Defer Astro migration** until we've measured Alt 1's actual ceiling. Set a 90-day review.

**Decision principle (per CLAUDE.md Pattern #1, #6):** "Every bug is an opportunity to delete code, not add it." We delete the `createRoot` DOM destruction and the JSDOM prerender hack. We don't add a new framework.

---

## Sources

- React 19 hydrateRoot — `https://react.dev/reference/react-dom/client/hydrateRoot`
- React renderToString — `https://react.dev/reference/react-dom/server/renderToString`
- Astro Content Collections (Astro 5) — `https://docs.astro.build/en/guides/content-collections/`
- Astro Content Layer deep-dive — `https://astro.build/blog/content-layer-deep-dive/`
- Astro client directives — `https://docs.astro.build/en/reference/directives-reference/`
- Astro islands (no shared React context across islands) — `https://docs.astro.build/en/concepts/islands/`
- Astro migration from CRA/Vite — `https://docs.astro.build/en/guides/migrate-to-astro/from-create-react-app/`
- @astrojs/react integration — `https://docs.astro.build/en/guides/integrations-guide/react/`
- Vike (formerly vite-plugin-ssr) — `https://vike.dev/`
- vite-to-vike migration — `https://github.com/brillout/vite-to-vike`
- vite-react-ssg — `https://github.com/Daydreamer-riri/vite-react-ssg`
- Next.js App Router static exports — `https://nextjs.org/docs/app/guides/static-exports`
- Next.js server vs client components — `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- vite-plugin-beasties (critical CSS) — `https://github.com/danielroe/beasties`
- F2 prerender HTML inspection — `docs/fouc-2026-04-27/F2-prerender-html.md`
- F8 industry FOUC patterns — `docs/fouc-2026-04-27/F8-industry-patterns.md`
- CLAUDE.md Pattern #6 (pure deletion is safest), Pattern #11 (prerendered SPAs have dual SEO sources) — `CLAUDE.md`
