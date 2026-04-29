# G4: Hydrate-Fix — Eliminate FOUC by Matching Prerender to React Render

**Date:** 2026-04-27
**Scope:** Eliminate the unstyled-article → spinner → real-page flash on `/never-hungover/{slug}` pages
**Approach:** Make prerender output match React's first paint, then switch `createRoot` → `hydrateRoot`

---

## Current State (the FOUC pipeline)

Step-by-step what the user sees today on a cold load of `/never-hungover/dhm-dosage-guide-2025`:

1. **0ms** — Browser receives `dist/never-hungover/dhm-dosage-guide-2025/index.html`. Inside `<div id="root">`, prerender wrote bare semantic HTML: `<article><h1>...</h1><div class="meta">…</div><p class="excerpt">…</p>…fullContentHtml</article>`. **Zero Tailwind classes.** User sees raw, unstyled article body in 16px Times.
2. **~100-300ms** — `main.jsx` parses, `createRoot(container)` runs, `root.render(<App />)` schedules. `createRoot` **wipes** the prerendered HTML and replaces it with React's tree.
3. **~150-350ms** — `App.jsx` evaluates. `currentPath = /never-hungover/dhm-dosage-guide-2025`. Route resolves to `lazy(() => import('./newblog/components/NewBlogPost.jsx'))` — chunk **not yet downloaded**. `Suspense` falls back to `<PageLoader />` (a green spinner).
4. **~400-700ms** — NewBlogPost chunk arrives, evaluates, renders. `loading=true` initial state shows `<Loader2 /> + "Loading post dynamically…"` panel.
5. **~700-1200ms** — `getPostBySlug(slug)` resolves (post JSON dynamic-import). State flips to `loading=false`, `post=…`. Final styled article renders.

The flash is two-stage: **(a)** unstyled prerender HTML for ~150ms, **(b)** spinner(s) for ~500ms. Total ≈ 700ms of broken UI before the real page paints.

The hypothesis is: emit something that **matches the final React tree byte-for-byte**, swap `createRoot` for `hydrateRoot`, and React reuses the existing DOM (just attaches event handlers). No replacement, no spinner, no flash.

---

## Option A: Hand-Roll Closer Match (no React-server-render)

### What it is

Rewrite `scripts/prerender-blog-posts-enhanced.js` to emit HTML that **structurally and class-wise mimics what `NewBlogPost.jsx` renders at first paint**, including the Layout shell. No React runtime at build time. Pure string templating with the same Tailwind classes the React component applies.

### What you have to reproduce

For `hydrateRoot` to work without warnings, the prerender HTML must match the React tree at the moment `useState` is initialized — i.e., the **first render**, before any `useEffect` runs.

Looking at `NewBlogPost.jsx`:

- `loading` initial = `true` → first render returns the **green spinner panel** (lines 662-677).
- `isClient` initial = `false` → reading-progress bar, share button, TOC are all gated off.
- `post` is null → no article body rendered.

So the literal first React render is the spinner panel — which is exactly what we don't want to prerender.

**This means hand-rolling is fundamentally a lie.** You cannot make prerender match React's first render unless you also change the React component to:

1. Accept post data as a prop / read from injected `window.__PRELOADED_POST__`.
2. Initialize `loading=false`, `post=preloadedPost` synchronously on first render.
3. Skip the loader path entirely when prerendered data is available.

So Option A is really **two coupled changes**:

**A1. Change `NewBlogPost.jsx` to accept preloaded post:**
```jsx
const preloaded = typeof window !== 'undefined' && window.__PRELOADED_POST__;
const [post, setPost] = useState(preloaded || null);
const [loading, setLoading] = useState(!preloaded);
const [isClient, setIsClient] = useState(typeof window !== 'undefined' && !!preloaded);
// then in the URL-change effect, only fetch if slug changes
```

Plus inject `<script>window.__PRELOADED_POST__ = {…};</script>` from prerender script before `<script type="module" src="/src/main.jsx">`.

**A2. Hand-roll matching HTML in `prerender-blog-posts-enhanced.js`:**
Reproduce the full structure with Tailwind classes:

- `<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">` (line 715)
- The header div with breadcrumbs, back button, date/clock/author meta, h1+h2 split title, excerpt, tags
- The 6xl mx-auto flex container
- The `<motion.article class="bg-white rounded-xl shadow-lg overflow-hidden">` — **but motion adds inline styles for opacity/transform animations**. That's mismatch territory.
- Inside, the Picture component output (currently uses `<picture><source><img>` with srcset).
- Quick Answer + Key Takeaways + the prose container.
- `ReactMarkdown` output — micromark already produces close-to-equivalent HTML. But the React component overrides `h1/h2/h3/p/ul/li/a/strong/code/table/...` with Tailwind-classed wrappers, plus per-pattern InfoBox/ProductCard logic. **Reproducing all 30 component overrides in vanilla JS is a meaningful re-implementation.**
- Inline `<InlineReviewsCTA>` injection at 30% and end.
- Layout chrome: header (`fixed top-0 left-0 right-0 z-header bg-white/80 backdrop-blur-md`), main padding, footer. **Layout uses `useHeaderHeight` to set `--header-height` via `document.documentElement.style`** — won't run pre-hydration. Need to inline the CSS variable as a plausible default (80px).

### Effort

| Sub-task | Hours |
|---|---|
| A1: NewBlogPost accepts preloaded post + skips loader path | 1.5 |
| A1: Inject `window.__PRELOADED_POST__` script in prerender | 0.25 |
| A2: Reproduce Layout shell HTML | 1 |
| A2: Reproduce article header + meta block | 0.75 |
| A2: Reproduce article wrapper + container Tailwind classes | 0.5 |
| A2: Reproduce all 30 markdown component overrides | 4-6 (the long pole) |
| A2: Reproduce InlineReviewsCTA at 30% + end | 0.75 |
| A2: Reproduce Picture / hero image markup | 0.5 |
| A2: Reproduce Quick Answer + Key Takeaways inline | 0.5 |
| Switch `createRoot` → `hydrateRoot` in `main.jsx` | 0.05 |
| Test on 5-10 posts, fix mismatches | 3-4 |
| Handle framer-motion `initial={{opacity: 0, y: 20}}` mismatch | 1-2 |
| Handle TOC sidebar (gated by `isClient` + `tocItems.length > 0`) | 0.5 |
| Handle reading progress bar (gated by `isClient`) | 0.25 |
| Handle Share button (gated by `isClient`) | 0.25 |
| **Total** | **14-18 hours** |

### Risks

- **HIGH: Markdown override drift.** Each ReactMarkdown override (h1, h2, h3, p, ul, ol, li, blockquote, code, a, strong, em, table, thead, tbody, tr, th, td, img, hr) has subtle Tailwind classes + per-pattern conditional rendering (info boxes, product cards, percentage stat formatting, tooltip terms). Reproducing in JS is fragile — every component edit henceforth must be mirrored in the prerender script. **Two sources of truth = silent drift = subtle mismatches forever.**
- **MEDIUM: framer-motion mismatch.** `<motion.article initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>` writes `style="opacity:0;transform:translateY(20px);"` on first render, then animates to identity. Prerender must either match (and lose animation) or omit (and accept hydration warning). Same for `<motion.button>` on TOC toggle.
- **MEDIUM: Pre-hydration interactivity gap.** Between prerender HTML and hydration completing, `onClick` handlers don't exist. User click on "Back" or "Share" is dropped silently. With `hydrateRoot` this gap is the same length as today's createRoot gap (~400-700ms), but today's loader masks it; with hydrate the page looks done so users will click. Most clicks just silently no-op until React attaches. Acceptable for blog content, not for a CTA.
- **LOW: Layout state drift.** `useHeaderHeight` sets a CSS variable; `useFeatureFlag('nav-cta-copy-v1')` returns 'control' before flags load and may swap to 'see-top-picks' on a second render. The mobile menu state is `useState(false)` so safe. Topics dropdown is `mounted && isTopicsOpen` so safe.
- **LOW: Tooltip terms in inline code.** `<TooltipProvider><Tooltip>` from Radix renders a portal on hover only — should be SSR-safe.

### Deletion test (CLAUDE.md prime directive)

Before adding ~600 lines of HTML-string-building, ask: can we **delete** anything?

- Delete the loader animation entirely → real fix, but adds visible blank state on cold load with no prerender.
- Delete the article enter animation (`initial={{opacity:0, y:20}}`) → eliminates one mismatch class.
- Delete `isClient` gates → would break Share button SSR-safety. Costly.

Pure deletion doesn't solve this — the architecture of "load post async after mount" is the root cause, and that requires actual code change, not deletion.

---

## Option B: Full SSR via `renderToString`

### What it is

Replace `prerender-blog-posts-enhanced.js` with a script that:

1. Imports React + the actual `NewBlogPost` component (and its tree).
2. For each post, calls `renderToString(<App initialPath="/never-hungover/{slug}" preloadedPost={post} />)`.
3. Writes the output as the full `<div id="root">…</div>` content into `dist/never-hungover/{slug}/index.html`.

Then in `main.jsx`: `hydrateRoot(container, <App preloadedPost={window.__PRELOADED_POST__} />)`.

### What needs to change in the React app

This is the deeper migration. SSR-incompatible code must be guarded:

1. **`React.lazy` route map** — `lazy()` doesn't work in SSR (can't await import during render). Two paths:
   - **Path B1**: Use `react-dom/server`'s `renderToReadableStream` (streaming SSR) which does support `Suspense` boundaries waiting for `lazy` chunks. Requires server runtime that supports streams (Node 18+ has them). More moving parts.
   - **Path B2**: Skip `lazy` for the prerender. Import `NewBlogPost` directly in the prerender script — bypass the App router entirely, just render `<Layout><NewBlogPost preloadedPost={post} /></Layout>` synchronously. Much simpler. Client still uses `lazy` for navigation between routes; only the initial render is non-lazy.
2. **`createPortal(... document.body)`** in Layout.jsx (mega-menu). Already guarded by `mounted` state initialized to `false`. SSR sees `mounted=false`, renders nothing for the portal. Hydration will match (`mounted=false` first render on client too, then `setMounted(true)` in useEffect). **Already correct per F4 notes.**
3. **`window.location.pathname`** in `useRouter` — already guarded with `typeof window !== 'undefined'`. SSR returns `'/'`. **Need to pass `initialPath` prop instead** so SSR knows which route to render.
4. **`window.location.pathname`** in `NewBlogPost.extractSlug` — runs in `useEffect`, SSR-safe. But `useEffect` doesn't run during SSR, so initial render must rely on prop or `useMemo` from a prop. Same change as A1: accept `preloadedPost` prop.
5. **`document.title`/`document.head` mutations** in `useSEO` — wrapped in `useEffect`, SSR-safe (just no-op on server). Title in HTML comes from prerender script's `<title>` tag write, same as today.
6. **`document.documentElement.style.setProperty`** in `useHeaderHeight` — `useEffect`, safe.
7. **`window.scrollY`** in scroll listeners — `useEffect`, safe.
8. **`navigator.share`/`navigator.clipboard`** in `sharePost` — runs on click only. Safe.
9. **`document.getElementById`** in TOC scroll-to — runs on click only. Safe.
10. **PostHog `initPostHog`** — `useEffect`-gated. Safe.
11. **framer-motion** — has SSR support out-of-the-box. `initial` state writes inline `style` on the first render; client renders the same `style` when hydrating; matches. Animation kicks in once mounted. **No special handling needed.**
12. **Date formatting (`Intl.DateTimeFormat`)** — deterministic given fixed date input. SSR and client produce identical strings as long as locale is fixed (`'en-US'` is hardcoded). Safe.
13. **TOC `tocItems` initial = `[]`** — first render shows no TOC. Client also starts with `[]` then populates via MutationObserver in useEffect. Match.
14. **`isClient` initial = `false`** — match between SSR (no window) and client first render. Both false.
15. **`useFeatureFlag` initial = `defaultValue`** — SSR returns default, client first render returns default before PostHog loads. Match. Flips after `useEffect`.
16. **Random IDs / time-based renders** — none in the post component. TOC heading IDs are deterministic from text. Safe.

### What the SSR script looks like

Approximate shape (~80-120 lines):

```js
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import App from '../src/App.jsx';  // requires Vite SSR build or esbuild transform
// ...
for (const post of posts) {
  const html = renderToString(
    <App initialPath={`/never-hungover/${post.slug}`} preloadedPost={post} />
  );
  const dom = new JSDOM(baseHtml);
  // ... still set <title>, <meta>, JSON-LD as today
  dom.window.document.getElementById('root').innerHTML = html;
  // inject preloaded data
  const script = dom.window.document.createElement('script');
  script.textContent = `window.__PRELOADED_POST__ = ${JSON.stringify(post).replace(/</g, '\\u003c')};`;
  dom.window.document.body.insertBefore(script, dom.window.document.querySelector('script[type="module"]'));
  // write
  fs.writeFileSync(...)
}
```

The build pipeline change: `App.jsx` and its tree need to be **importable from Node** (not from Vite's dev server). Options:

- Run prerender via `vite-node` (already a dependency? probably not — would need to add) — handles JSX, CSS-as-side-effect, Vite-style imports.
- Run a separate Vite SSR build (`vite build --ssr src/entry-server.jsx`) producing `dist-ssr/entry-server.js` Node-importable. Standard pattern; ~30-50 lines of `entry-server.jsx`.

**`vite build --ssr` is the canonical Vite pattern.** That's the right tool.

### Effort

| Sub-task | Hours |
|---|---|
| Create `src/entry-server.jsx` exporting render fn | 0.5 |
| Add `vite build --ssr` step to `npm run build` | 0.5 |
| NewBlogPost: accept `preloadedPost` prop, skip loader path | 1 |
| App: accept `initialPath`, threaded into `useRouter` | 0.75 |
| useRouter: take `initialPath` arg | 0.25 |
| Bypass `lazy` for SSR (Path B2): conditionally direct-import in entry-server | 1 |
| Rewrite prerender script to call SSR render fn + inject preloaded JSON | 2 |
| Keep meta/title/JSON-LD logic from old prerender script | 1 |
| Switch `createRoot` → `hydrateRoot` | 0.05 |
| Handle portal SSR (already guarded — verify) | 0.25 |
| Test on 5-10 posts, fix mismatches reported by hydration warnings | 3-5 |
| Handle CSS bundle ordering (Tailwind classes must be in dist before HTML loads) | 0.5 (already works — Vite emits CSS in HTML head) |
| Handle styled-components/emotion if any (none in this project — just Tailwind) | 0 |
| Handle hydration of `useEffect`-driven URL state (back-button between SSR'd posts) | 0.75 |
| **Total** | **11-14 hours** |

### Risks

- **MEDIUM: First SSR run will surface 5-15 hydration warnings.** Each must be diagnosed and either fixed (deterministic both sides) or guarded with `useSyncExternalStore` / `<NoHydrate>` pattern. Standard SSR-migration pain, but real.
- **MEDIUM: `vite build --ssr` adds ~30s to build time** + a separate output bundle. Acceptable for 189 posts (vs current micromark approach).
- **MEDIUM: `react-markdown` SSR.** `react-markdown` v9+ supports SSR fine. The component overrides run on the server identically to client. **This eliminates the entire "reproduce 30 markdown overrides in vanilla JS" risk from Option A.** Single source of truth.
- **LOW: framer-motion SSR.** Officially supported. `initial` styles write on the server; client matches; animation runs after hydration. Tested pattern.
- **LOW: Radix UI portals.** `Tooltip`, `AlertDialog`, etc. from Radix render their trigger inline on first render and only mount the portal on open. SSR-safe.
- **LOW: PostHog feature flags.** `useFeatureFlag` returns `defaultValue` synchronously before PostHog loads. SSR sees default; client first render sees default; match. Flag-driven UI changes happen post-hydration.
- **LOW: Layout `mounted` state.** Already correctly initialized `false`. SSR renders `false` branch (no portal); client matches; `setMounted(true)` after hydration. Already SSR-safe.
- **LOWEST: `<SpeedInsights />` from `@vercel/speed-insights`.** Has SSR support per their docs. If breaks, gate with `typeof window` — trivial.

### Deletion test

What can we delete with Option B?
- **Delete the entire micromark-based content rendering** in prerender script (lines 311-318) — replaced by React's `react-markdown` running server-side.
- **Delete the hand-rolled article HTML template** (lines 327-342) — replaced by `renderToString(<NewBlogPost />)`.
- **Delete the loader path entirely from `NewBlogPost.jsx`** if `preloadedPost` is always provided (or keep as fallback for client-side route navigation between posts).

Net code change: roughly **−80 lines from prerender script, +50 lines for entry-server.jsx, +10 lines for NewBlogPost prop handling**. Net ≈ −20 lines.

---

## The Critical Insight: Option A is the Wrong Trade

Option A (hand-rolled match) sounds simpler because it skips the SSR build setup. But it permanently couples two implementations of every markdown override and Tailwind class. Every future edit to `NewBlogPost.jsx` (and there have been many — see git log) must be mirrored in the prerender script, or hydration mismatches reappear. **CLAUDE.md Pattern #11 directly warns against this:** "Prerendered SPAs Have Dual SEO Sources" — same principle, multiplied by 30 component overrides.

Option B (renderToString) consolidates to a single source of truth (React components) and uses Vite's standard SSR build pattern. Higher upfront cost (~11-14 hours) but no permanent maintenance tax.

---

## Recommendation

**Go with Option B (full SSR via `renderToString` + `vite build --ssr`).**

Concrete plan:

1. **Phase 1 (3-4 hrs)**: Get a single post rendering server-side. Create `entry-server.jsx`, run `renderToString`, write to `dist/never-hungover/{slug}/index.html`. Don't yet switch to `hydrateRoot` — verify visually that the prerender HTML matches what React renders client-side. Diff in DevTools.
2. **Phase 2 (2-3 hrs)**: Add `preloadedPost` prop path to `NewBlogPost.jsx`. Skip loader when present. Inject `window.__PRELOADED_POST__` in prerender script.
3. **Phase 3 (0.05 hrs)**: Flip `createRoot` → `hydrateRoot` in `main.jsx`. Run all 189 posts. Fix the 5-15 warnings that surface. Most will be either:
   - Date formatting drift → fix locale lock.
   - framer-motion `whileHover`-related styles → no-op, suppressHydrationWarning where needed.
   - PostHog flag value drift → fix default-value contract.
4. **Phase 4 (1-2 hrs)**: Verify on Vercel preview. Test cold loads on 10 different posts. Confirm no flash, no spinner, no replacement.

**Total realistic effort: 11-14 hours, single contiguous engineer-day.**

---

## Effort Summary

| Option | Effort | Risk Profile | Maintenance Cost |
|---|---|---|---|
| **A: Hand-roll match** | 14-18 hrs | Permanent drift between prerender + React. Two sources of truth. | HIGH (every component change requires duplicated edit) |
| **B: SSR via renderToString** | 11-14 hrs | Standard SSR-migration pain (5-15 hydration warnings to diagnose). | LOW (single source of truth) |

Option B is **both faster to implement AND cheaper to maintain**.

---

## The Single Biggest Risk

**Option B's biggest risk: hydration warning whack-a-mole during Phase 3.** The first run will surface 5-15 mismatches that must each be diagnosed and fixed. Most will be trivial (3-5 minutes each), but one or two might be subtle (a `Date` not honoring a locale, a tooltip ID generated from `Math.random()`, a feature-flag default mismatch). Worst case: 2-3 hours of debugging on a single stubborn warning. Mitigation: bisect by component (test Layout-only, then NewBlogPost-only, then with markdown content, then with InlineReviewsCTA). Fix one at a time. Don't ship with warnings — they correlate with subtle UI bugs in production.

**Mitigation pattern:** start with `<NewBlogPost preloadedPost={post} />` rendered standalone (no Layout, no Suspense, no router) and get that hydrating cleanly first. Then add Layout. Then App. Each step isolates a smaller mismatch surface.
