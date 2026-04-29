# F8 — Industry Patterns for FOUC Prevention (2026)

**Date**: 2026-04-26
**Stack reference**: React 19 + Vite 6 + Tailwind v4 + custom prerender (`scripts/prerender-*.js`) + Vercel
**Scope**: Survey current best practices, rank by relevance, recommend actionable techniques.

---

## TL;DR — The 2026 Default

For React SPAs that prerender to static HTML, the **2026 industry default for FOUC prevention is "inline critical CSS at build time"** — extract above-the-fold styles into a `<style>` tag in `<head>` (under 14KB compressed) and async-load the rest. This is the only technique that fixes the *root cause*: render-blocking external CSS that arrives after first paint.

Everything else (skeleton screens, paint-holding, view-transition API, body-opacity-0, service workers) either masks the problem or only helps repeat/secondary navigation — not the cold first paint that prerendering is supposed to win.

---

## Top 3 Patterns Ranked for Our Stack

### #1 — Inline Critical CSS via Beasties (vite-plugin-beasties)

**Why it's #1 for us**: We already prerender HTML. Adding critical-CSS inlining is the single missing piece that converts "valid prerendered HTML" into "no-FOUC prerendered HTML." It's purpose-built for our exact architecture.

**What it does**:
- Reads each prerendered `index.html`
- Determines which CSS rules are referenced by the HTML
- Inlines those rules in `<style>` in `<head>`
- Rewrites the external `<link rel="stylesheet">` to `media="print" onload="this.media='all'"` so the rest loads async without blocking paint

**Maintenance status (2026)**:
- `critters` (GoogleChromeLabs) is **archived** — Nuxt team officially deprecated it
- `beasties` (danielroe fork) is the **maintained successor** — install `vite-plugin-beasties`
- No headless browser required → fast, deterministic, CI-friendly

**Effort**: ~30–60 minutes. Single dependency, ~10 lines of vite config, zero code changes elsewhere. Must run *after* our custom prerender script (post-build hook).

**Stack compatibility**:
- React 19: full
- Vite 6: full (first-class plugin)
- Tailwind v4: full — Tailwind v4 outputs ~15–22KB gzipped CSS already, so inlining the used subset will fit comfortably under the 14KB TCP-window budget
- Custom prerender: full — Beasties processes whatever `index.html` we hand it, so it works with any prerender approach
- Vercel: full — runs at build time, no runtime requirements

**Caveat**: Tailwind v4 dropped PostCSS for Lightning CSS. Beasties operates on output HTML+CSS so this is irrelevant — but verify the plugin runs against the post-prerender output, not the pre-prerender output.

---

### #2 — Skeleton from Prerender (Show-and-Replace, not Hide-and-Show)

**Why it's #2**: NN/g and 2026 UX consensus — skeleton screens beat "hide → flash content" because users perceive progress. Crucially for SEO, the skeleton is *real prerendered HTML*, so Googlebot sees the same DOM structure with text content (no cloaking risk).

**The 2026 industry verdict on "Hide and Show" (e.g. `body { opacity: 0 }` until React mounts)**:
- Still works, still common
- Carries **mild cloaking risk** if the hidden state contains text that crawlers see but users don't (Google explicitly flagged this in 2025 spam updates)
- Body-opacity-0 patterns must keep timeout < 500ms or they tank Core Web Vitals
- Generally considered a band-aid, not a fix — masks the FOUC instead of preventing it

**The 2026 industry verdict on "Show and Replace" (skeleton)**:
- Recommended pattern (NN/g, Smashing, LogRocket all 2025–2026)
- Prerender outputs a skeleton *that matches the final layout structure*
- React mounts and replaces skeleton with real content via normal hydration
- No FOUC because the skeleton IS styled prerendered HTML — there's nothing unstyled to flash
- Zero cloaking risk: skeleton structure = real structure, content is equivalent

**Effort**: 4–8 hours. Requires designing skeleton components for hero/blog-post/reviews-page, wiring them into the prerender output, and making React mount cleanly replace them. Real cost is design, not code.

**Stack compatibility**: Full across the stack but adds complexity to our custom prerender script.

---

### #3 — Service Worker Precache (Vite PWA) for Repeat-Visit FOUC Elimination

**Why it's #3**: Doesn't fix first-visit FOUC, but completely eliminates FOUC on repeat visits — which is most of our affiliate-conversion traffic (returning users). ~85%+ cache hit rate typical, 2–3x faster perceived load.

**What it does**:
- On first visit, SW caches HTML shell + CSS + JS
- On repeat visit, page loads from cache in milliseconds — no network roundtrip, no CSS gap, no FOUC
- Stale-while-revalidate strategy: instant load + silent background update

**Effort**: 2–4 hours. `vite-plugin-pwa` setup, choose `registerType: 'prompt'` (not `autoUpdate` — autoUpdate has reload-loop risks), add update-prompt UI.

**Stack compatibility**: Full. Vercel serves the SW correctly out-of-the-box. Works with any prerender approach.

**Caveat**: SW versioning bugs are real (issue #33 in vite-plugin-pwa repo) — must invalidate cache on deploy. If you mis-cache `index.html` you can ship stale content. Use prompt-mode update flow.

---

## Patterns We're NOT Recommending (and Why)

### Chrome Paint-Holding
- Browser-default since Chrome 76 (2019). Already active for us with zero effort.
- **Same-origin navigation only** — does NOT help cold-first-load FOUC, which is our actual problem.
- Skip: it's already on, it doesn't address the bug.

### View Transitions API (`@view-transition` CSS at-rule)
- Chrome 111+, Edge 111+, Safari 18+, Firefox 133+ (broadly supported in 2026).
- The old `<meta name="view-transition" content="same-origin">` syntax is **obsolete** — replaced by the `@view-transition` CSS at-rule.
- Smooths *navigation* between pages; does NOT help cold-first-load FOUC.
- Skip for FOUC. Could revisit later for nav UX polish.

### Streaming SSR (React 19 `renderToReadableStream` + Suspense)
- Genuine fix, but requires migrating off our static-HTML prerender to true SSR.
- Major architectural change: needs a Node runtime per request (Vercel Functions), not static hosting.
- Effort: 2–4 weeks. Risk: high. Benefit over critical-CSS approach: low.
- Skip unless we have other reasons to migrate to SSR.

### Migrate to Astro or Next.js App Router
- **Astro** — strongest case: islands architecture ships zero JS by default for static content. Realistic migration of a 169-post content site: 1–3 weeks. The "many React components just work via the React integration" pitch is real but the rewrite of routing/data/SEO is not trivial.
- **Next.js App Router with PPR** — mature 2026 default for new React projects, but our site is mostly static content, so we'd be paying React-runtime + framework overhead for marginal gain.
- **Verdict**: Not worth migrating *just* for FOUC. A 30-minute Beasties install fixes 90% of the problem on our existing stack. Reserve framework migration for a separate, broader rebuild decision (DX, RSC, edge functions, etc.).

---

## 2026 Cloaking Guidance (Google Spam Updates)

Google's 2025 spam updates tightened cloaking detection. The relevant rule for any FOUC technique:
- **Equivalent content** between what crawlers see and what users see is fine.
- **Different content** (e.g. hidden SEO text never shown to users) gets de-indexed within weeks.

Implications:
- `body { opacity: 0 }` on prerendered HTML → safe (content is identical, just briefly invisible)
- Skeleton replaced by real content → safe (structurally equivalent)
- Inline critical CSS → safe (not content, just styling)
- "Bot-only" prerendered text branch (e.g. dynamic-rendering with crawler detection) → risky in 2026, no longer recommended

Our existing prerender approach is safe. None of the F8 recommendations introduce cloaking risk.

---

## Recommendation

1. **Now (this week)**: Install `vite-plugin-beasties`, add post-prerender hook, ship. ~30–60 min, fixes the immediate FOUC.
2. **Validate (next week)**: Re-run the F2/F3 FOUC tests in this directory to confirm the gap is gone.
3. **If FOUC persists on slow connections**: Add `vite-plugin-pwa` with prompt-mode SW for repeat-visit elimination. ~2–4 hr.
4. **Don't migrate frameworks for FOUC alone.** The 30-minute critical-CSS fix beats a 2-week Astro rewrite for this specific bug.

---

## Sources

Critical CSS / Beasties:
- https://github.com/danielroe/beasties
- https://www.npmjs.com/package/beasties
- https://github.com/GoogleChromeLabs/critters (archived, do not use)
- https://www.pagespeedmatters.com/resources/glossary/critical-css
- https://medium.com/@fadingbeat/how-i-improved-my-websites-lcp-and-seo-with-critical-css-in-vite-react-vercel-257aede4f22c

Skeleton vs hide-and-show:
- https://www.nngroup.com/articles/skeleton-screens/
- https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/
- https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk
- https://timkadlec.com/remembers/2020-11-02-skeleton-screens/

Service Worker / Vite PWA:
- https://vite-pwa-org.netlify.app/guide/service-worker-precache
- https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide

Paint Holding:
- https://developer.chrome.com/blog/paint-holding
- https://addyosmani.com/blog/paint-holding/

View Transitions API:
- https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition
- https://caniuse.com/view-transitions

React 19 / Streaming / RSC:
- https://react.dev/blog/2025/10/01/react-19-2
- https://www.sitepoint.com/react-server-components-streaming-performance-2026/
- https://react.dev/reference/rsc/server-components

Astro / Next.js comparison:
- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/migrate-to-astro/from-create-react-app/
- https://outplane.com/blog/astro-vs-nextjs

Google cloaking 2026:
- https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
- https://www.pepper.inc/blog/hidden-content-and-its-impact-on-seo/
- https://nexalgrowth.com/cloaking-seo/

Tailwind v4 + Vite 6:
- https://tailwindcss.com/blog/tailwindcss-v4
- https://thelinuxcode.com/how-to-set-up-tailwind-css-with-vite-2026-guide-tailwind-v4-plugin-legacy-v3-postcss/
