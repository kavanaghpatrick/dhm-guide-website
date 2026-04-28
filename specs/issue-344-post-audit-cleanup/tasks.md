# Tasks: Issue #344 Post-Audit Cleanup

Quick mode, fine granularity. 5 independent verified items + 1 final integration check.
Each task is a single concrete unit; verify steps are automated bash + grep on `dist/` artifacts.
No PR creation tasks — branch is already `cleanup/issue-344-post-audit`; user handles push/PR.

---

## Group 1: Prerender body stubs (Item #1)

- [x] 1.1 Add `id="prerender-main-stub"` to off-screen FOUC div
  - **Do**: In `index.html` line 242, add `id="prerender-main-stub"` attribute to the existing off-screen `<div>`. Preserve inline `style` verbatim (PR #343 FOUC fix). Do NOT change content, position, or any other attributes.
  - **Files**: `index.html`
  - **Done when**: Div opening tag reads `<div id="prerender-main-stub" style="position: absolute; left: -9999px; ...">`
  - **Commit**: `feat(prerender): add stub id for per-route content injection`
  - _Requirements: AC-1.1, AC-1.4, NFR-4_

- [x] 1.2 Add `bodyStub` field per route + injection logic in prerender script
  - **Do**:
    1. In `scripts/prerender-main-pages.js`, add a `bodyStub` field to each of the 7 route entries (homepage, /reviews, /guide, /research, /about, /dhm-dosage-calculator, /compare). Each `bodyStub` is an HTML string containing one `<h1>` + 1-2 `<p>` matching that route's existing meta description (see design.md "Stub copy" section for exact per-route text).
    2. After the existing `<head>` mutation block (~line 190, inside the route loop), append:
       ```js
       const stub = document.getElementById('prerender-main-stub');
       if (stub && page.bodyStub) {
         stub.innerHTML = page.bodyStub;
       }
       ```
  - **Files**: `scripts/prerender-main-pages.js`
  - **Done when**: All 7 route entries have a `bodyStub` field; mutation block exists in route loop; no other route loop logic changed.
  - **Commit**: `feat(prerender): differentiate body stub per route`
  - _Requirements: AC-1.2, AC-1.5_

- [x] 1.3 [VERIFY] Build + grep all 7 dist HTML files for differentiated H1s
  - **Do**: Run build, then grep each main-page HTML for the stub id and capture H1 text.
  - **Verify**:
    ```bash
    npm run build && \
    for r in "" reviews guide research about dhm-dosage-calculator compare; do
      path="dist/$r/index.html"; [ -z "$r" ] && path="dist/index.html"
      echo "$r: $(grep -oE '<h1>[^<]+' "$path" | head -1)"
    done | sort -u | wc -l
    ```
    Output must be `>= 7` (each route's H1 unique). Also confirm `id="prerender-main-stub"` present in every file: `for r in "" reviews guide research about dhm-dosage-calculator compare; do path="dist/$r/index.html"; [ -z "$r" ] && path="dist/index.html"; grep -c 'id="prerender-main-stub"' "$path"; done` — every line must be `1`.
  - **Done when**: 7 distinct H1s across the 7 main pages; stub id present in all 7.
  - **Commit**: None (verification only)
  - _Requirements: AC-1.3, AC-1.4_

---

## Group 2: PostHog bot/preview gate (Item #2)

- [x] 2.1 Add bot UA + preview hostname guard to `initPostHog()`
  - **Do**: In `src/lib/posthog.js`, inside `initPostHog()`, AFTER the existing DEV check (line 23-26) and BEFORE the `try` block / `posthog.init()` call (line 28-29), insert:
    ```js
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|prerender|headless|lighthouse/i.test(ua);
    const host = window.location.hostname;
    const isPreview = host.includes('vercel.app') || host === 'localhost' || host.startsWith('127.');
    if (isBot || isPreview) {
      console.log('[PostHog] Skipping init: bot or preview environment');
      return;
    }
    ```
    Do NOT add `posthog.opt_out_capturing()` — secondary capture sites already gate on `posthog.__loaded` (per AC-2.5, research confirmed).
  - **Files**: `src/lib/posthog.js`
  - **Done when**: Guard exists between DEV check and init call; existing `typeof window === 'undefined'` SSR guard at line 20 still runs first.
  - **Commit**: `feat(posthog): exclude bots and preview deploys from analytics`
  - _Requirements: AC-2.1, AC-2.2, AC-2.3, AC-2.5_

- [x] 2.2 [VERIFY] Build + grep dist bundle for guard tokens
  - **Do**: Run build; verify the bot regex tokens and preview hostname check survive Vite minification.
  - **Verify**:
    ```bash
    npm run build && \
    grep -lE "googlebot" dist/assets/*.js | head -1 && \
    grep -lE "vercel\\.app" dist/assets/*.js | head -1
    ```
    Both commands must return at least one filename (guard not stripped). Also confirm event-shape preserved (no public API change): `grep -c "capture" src/lib/posthog.js` returns the same count as before this task — this verifies AC-2.4 (event names/properties unchanged).
  - **Done when**: Both `googlebot` and `vercel.app` strings appear in built JS; no other PostHog code paths changed.
  - **Commit**: None (verification only)
  - _Requirements: AC-2.4_

---

## Group 3: Mobile UX trio (Item #3)

- [x] 3.1 Add `inputMode="decimal"` to DosageCalculator duration input
  - **Do**: In `src/pages/DosageCalculator.jsx` at the duration input element (~line 519, the `type="number"` with `step="0.5"`), add the React prop `inputMode="decimal"`. Camelcase prop name; renders to `inputmode="decimal"` HTML attribute.
  - **Files**: `src/pages/DosageCalculator.jsx`
  - **Done when**: Duration input element has both `type="number"` and `inputMode="decimal"`. Other inputs (weight, drinks) untouched (out of scope per requirements).
  - **Commit**: `feat(calculator): show decimal keypad on duration input`
  - _Requirements: AC-3.1_

- [x] 3.2 Add `viewport-fit=cover` to index.html viewport meta
  - **Do**: In `index.html` line 27, append `, viewport-fit=cover` to the existing viewport meta `content` attribute. Result: `content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover"`.
  - **Files**: `index.html`
  - **Done when**: Viewport meta tag includes `viewport-fit=cover` after existing values.
  - **Commit**: `feat(viewport): enable edge-to-edge layout on notched devices`
  - _Requirements: AC-3.2_

- [x] 3.3 Add `pb-[env(safe-area-inset-bottom)]` to StickyMobileCTA
  - **Do**: In `src/components/StickyMobileCTA.jsx` at the root container className (line 72), insert `pb-[env(safe-area-inset-bottom)]` into the existing className list (between `p-3` and `z-50` is fine). Tailwind v4 emits arbitrary-value classes by default — no `@theme` token needed (per CLAUDE.md Pattern #15).
  - **Files**: `src/components/StickyMobileCTA.jsx`
  - **Done when**: Root container className includes `pb-[env(safe-area-inset-bottom)]` alongside existing `fixed bottom-0 ... p-3 ... z-50 md:hidden` classes.
  - **Commit**: `feat(mobile-cta): clear iPhone home indicator with safe-area inset`
  - _Requirements: AC-3.3, AC-3.4_

- [x] 3.4 [VERIFY] Build + grep dist for the 3 new attributes
  - **Do**: Build, verify all three changes survive bundling.
  - **Verify**:
    ```bash
    npm run build && \
    grep -o 'viewport-fit=cover' dist/index.html && \
    grep -lE 'inputmode="decimal"|inputMode:"decimal"' dist/assets/*.js | head -1 && \
    grep -lE 'safe-area-inset-bottom' dist/assets/*.css | head -1
    ```
    All 3 commands must return matches. The CSS arbitrary-value class `pb-[env(safe-area-inset-bottom)]` compiles to a CSS rule referencing `env(safe-area-inset-bottom)` — that's what the third grep tests.
  - **Done when**: All 3 mobile attributes present in dist artifacts.
  - **Commit**: None (verification only)
  - _Requirements: AC-3.1, AC-3.2, AC-3.3, AC-3.4_

---

## Group 4: OG image helper + cross-site unification (Item #4)

- [ ] 4.1 Create `src/lib/og-image.js` with `getOgImageForPost(post)` helper
  - **Do**: Create new file `src/lib/og-image.js` with the exact shape from design.md:
    - `DEFAULT_OG_IMAGE = '/og-image.jpg'` (named export AND used as fallback)
    - `RULES` array — first rule matches tags `['hangover-prevention', 'hangover-cure', 'hangover prevention', 'hangover cure']` → `/dhm-hangover-prevention.webp`
    - `getOgImageForPost(post)` named export: returns `post.image` if truthy, else evaluates RULES against lowercased `post.tags` (case-insensitive substring match, first wins), else returns `DEFAULT_OG_IMAGE`
    - JSDoc comment listing the two consumer files (`src/hooks/useSEO.js`, `scripts/prerender-blog-posts-enhanced.js`) so future devs update both together
    - Defensive: `Array.isArray(post?.tags) ? ... : []` (handles null/missing tags)
  - **Files**: `src/lib/og-image.js` (new)
  - **Done when**: File exists; `import { getOgImageForPost, DEFAULT_OG_IMAGE } from './lib/og-image.js'` resolves; calling `getOgImageForPost(null)` returns `/og-image.jpg`; calling with `{ tags: ['hangover-prevention'] }` returns `/dhm-hangover-prevention.webp`.
  - **Commit**: `feat(og-image): unified helper for post OG image fallback`
  - _Requirements: AC-4.1, AC-4.2_

- [ ] 4.2 Wire helper into `useSEO.js` (replace `/blog-default.webp` fallback)
  - **Do**: In `src/hooks/useSEO.js`:
    1. Add import at top of file: `import { getOgImageForPost } from '../lib/og-image.js';`
    2. Replace the existing fallback at lines 298-300:
       ```js
       // before
       const finalImage = extractedImage ? `${baseUrl}${extractedImage}` : `${baseUrl}/blog-default.webp`;
       // after
       const ogPath = extractedImage || getOgImageForPost({ tags });
       const finalImage = `${baseUrl}${ogPath}`;
       ```
    3. Confirm `tags` variable is in scope at this point (it should already be a function parameter or destructured prop; if not, pull from the post object).
  - **Files**: `src/hooks/useSEO.js`
  - **Done when**: No reference to `/blog-default.webp` remains in `useSEO.js`; helper imported and called for null-image fallback path.
  - **Commit**: `refactor(seo): use shared og-image helper in useSEO`
  - _Requirements: AC-4.3, AC-4.4_

- [ ] 4.3 Wire helper into all 4 prerender call sites
  - **Do**: In `scripts/prerender-blog-posts-enhanced.js`:
    1. Add import after line 17: `import { getOgImageForPost } from '../src/lib/og-image.js';`
    2. Replace 4 call sites (each currently has `post.image ? ... : '/og-image.jpg'` or only sets when `post.image` truthy):
       - **og:image** (lines 100-103): always set, use `getOgImageForPost(post)`
       - **twitter:image** (~line 117-119): always set, use `getOgImageForPost(post)`
       - **Article schema `image`** (~line 154): use `getOgImageForPost(post)` directly (no ternary)
       - **HowTo schema `image`** (~line 262): use `getOgImageForPost(post)` (always set, helper guarantees non-empty)
    3. Each call wraps with `escapeHtml(getOgImageForPost(post))` and prepends `https://www.dhmguide.com` exactly as existing code does.
  - **Files**: `scripts/prerender-blog-posts-enhanced.js`
  - **Done when**: All 4 call sites use `getOgImageForPost(post)`; no references to `/og-image.jpg` as a literal fallback remain in the script (only the helper's default produces it).
  - **Commit**: `refactor(prerender): use shared og-image helper at all 4 call sites`
  - _Requirements: AC-4.3, AC-4.4_

- [ ] 4.4 Set broken-reference post `image: null`
  - **Do**: In `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json`, change the `image` field from `"/images/flyby-vs-fuller-health-hero.jpg"` to `null`. The referenced file does not exist in `/public/`; setting null routes through the new helper to a real fallback.
  - **Files**: `src/newblog/data/posts/flyby-vs-fuller-health-complete-comparison.json`
  - **Done when**: `"image": null` (JSON null, not empty string) in the file.
  - **Commit**: `fix(content): null out broken image reference in flyby-vs-fuller-health post`
  - _Requirements: AC-4.5_

- [ ] 4.5 [VERIFY] Cross-site og:image consistency for hangover post + default-fallback post
  - **Do**: Build, then verify a known hangover-tagged null-image post resolves to `/dhm-hangover-prevention.webp` and a non-hangover null-image post resolves to `/og-image.jpg` in prerendered HTML. Also confirm zero references to defunct `/blog-default.webp` and that fallback files exist.
  - **Verify**:
    ```bash
    npm run build && \
    # Identify a hangover-tagged null-image post slug
    HANGOVER_SLUG=$(node -e "
      const fs=require('fs'),path=require('path');
      const dir='src/newblog/data/posts';
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const p=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
        const tags=(p.tags||[]).map(t=>String(t).toLowerCase()).join('|');
        if (!p.image && /hangover-prevention|hangover-cure/.test(tags)) {
          console.log(p.slug || f.replace(/\.json$/,''));
          break;
        }
      }
    ") && \
    DEFAULT_SLUG=$(node -e "
      const fs=require('fs'),path=require('path');
      const dir='src/newblog/data/posts';
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const p=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
        const tags=(p.tags||[]).map(t=>String(t).toLowerCase()).join('|');
        if (!p.image && !/hangover-prevention|hangover-cure/.test(tags)) {
          console.log(p.slug || f.replace(/\.json$/,''));
          break;
        }
      }
    ") && \
    echo "Hangover post: $HANGOVER_SLUG" && \
    echo "Default post: $DEFAULT_SLUG" && \
    grep -oE 'property="og:image" content="[^"]+"' "dist/never-hungover/$HANGOVER_SLUG/index.html" | head -1 | grep -q 'dhm-hangover-prevention.webp' && echo "PASS hangover" && \
    grep -oE 'property="og:image" content="[^"]+"' "dist/never-hungover/$DEFAULT_SLUG/index.html" | head -1 | grep -q 'og-image.jpg' && echo "PASS default" && \
    # AC-4.4: no /blog-default.webp anywhere
    ! grep -rE 'blog-default\.webp' dist/ src/ scripts/ 2>/dev/null && echo "PASS no blog-default refs" && \
    # AC-4.7: fallback files exist
    ls public/og-image.jpg public/dhm-hangover-prevention.webp >/dev/null && echo "PASS fallback files exist"
    ```
    All four PASS lines must print.
  - **Done when**: Hangover post resolves to `/dhm-hangover-prevention.webp`, default post resolves to `/og-image.jpg`, zero `blog-default.webp` references, both fallback files exist.
  - **Commit**: None (verification only)
  - _Requirements: AC-4.3, AC-4.4, AC-4.6, AC-4.7_

---

## Group 5: Remove unused dependencies (Item #5)

- [ ] 5.1 Uninstall 5 unused packages
  - **Do**: Run `npm uninstall recharts embla-carousel-react input-otp cmdk vaul` from repo root. This removes both `package.json` `dependencies` entries and `node_modules` artifacts. Do NOT touch `micromark`, `next-themes`, `posthog-js` (all confirmed in active use).
  - **Files**: `package.json`, `package-lock.json`
  - **Done when**: `package.json` no longer lists the 5 removed deps; lockfile updated.
  - **Commit**: `chore(deps): remove 5 unused packages (recharts, embla, otp, cmdk, vaul)`
  - _Requirements: AC-5.1, AC-5.4_

- [ ] 5.2 Delete the 5 wrapper component files
  - **Do**: Delete the 5 files:
    ```bash
    rm src/components/ui/chart.jsx \
       src/components/ui/carousel.jsx \
       src/components/ui/input-otp.jsx \
       src/components/ui/command.jsx \
       src/components/ui/drawer.jsx
    ```
    These wrappers are the ONLY consumers of the removed deps (research verified zero imports outside these files).
  - **Files**: `src/components/ui/chart.jsx`, `src/components/ui/carousel.jsx`, `src/components/ui/input-otp.jsx`, `src/components/ui/command.jsx`, `src/components/ui/drawer.jsx`
  - **Done when**: All 5 files deleted; no other source files modified.
  - **Commit**: `chore(ui): delete 5 wrapper components for removed deps`
  - _Requirements: AC-5.2_

- [ ] 5.3 [VERIFY] Build succeeds + zero references to removed deps
  - **Do**: Confirm build passes (no missing-import errors) and no source/bundle/package references to removed deps remain.
  - **Verify**:
    ```bash
    npm run build && \
    # AC-5.5: no source imports
    ! grep -rE "from ['\"](recharts|embla-carousel-react|input-otp|cmdk|vaul)" src/ scripts/ public/ 2>/dev/null && echo "PASS no source imports" && \
    # AC-5.1: no package.json refs
    ! grep -E "\"(recharts|embla-carousel-react|input-otp|cmdk|vaul)\"" package.json 2>/dev/null && echo "PASS no package.json refs" && \
    # bundle clean (allowing for accidental string mentions in legitimate code is fine; we check known symbols)
    ! grep -lE "embla-carousel|recharts|input-otp" dist/assets/*.js 2>/dev/null && echo "PASS no dep symbols in bundle"
    ```
    All three PASS lines must print. Build must exit 0.
  - **Done when**: `npm run build` exits 0; zero matches across source, package.json, and bundle for removed dep names.
  - **Commit**: None (verification only)
  - _Requirements: AC-5.3, AC-5.5_

---

## Group 6: Final integration verification

- [ ] 6.1 [VERIFY] End-to-end build + all 5 items pass design.md verification grep set
  - **Do**: Run a single clean `npm run build` after all 5 groups complete. Run the consolidated verification block from design.md "Build Artifact Verification" (lines 432-467) covering all 5 items at once. Also re-run the FOUC + z-class regression checks from the existing CLAUDE.md learnings (Patterns #14, #15, #16).
  - **Verify**:
    ```bash
    npm run build && \
    # Item #1: 7 distinct H1s
    UNIQ_H1S=$(for r in "" reviews guide research about dhm-dosage-calculator compare; do
      path="dist/$r/index.html"; [ -z "$r" ] && path="dist/index.html"
      grep -oE '<h1>[^<]+' "$path" | head -1
    done | sort -u | wc -l) && \
    [ "$UNIQ_H1S" -ge 7 ] && echo "PASS Item #1: $UNIQ_H1S distinct H1s" && \
    # Item #2: bot guards in bundle
    grep -lE "googlebot" dist/assets/*.js >/dev/null && grep -lE "vercel\\.app" dist/assets/*.js >/dev/null && echo "PASS Item #2: bot+preview guards present" && \
    # Item #3: 3 mobile attrs
    grep -q 'viewport-fit=cover' dist/index.html && \
    grep -lE 'inputmode="decimal"|inputMode:"decimal"' dist/assets/*.js >/dev/null && \
    grep -lE 'safe-area-inset-bottom' dist/assets/*.css >/dev/null && echo "PASS Item #3: mobile UX trio present" && \
    # Item #4: helper exists, no blog-default refs, hangover/default split works
    [ -f src/lib/og-image.js ] && \
    ! grep -rE 'blog-default\.webp' dist/ src/ scripts/ 2>/dev/null && \
    grep -lE 'dhm-hangover-prevention\.webp' dist/never-hungover/*/index.html | head -1 >/dev/null && \
    grep -lE 'og-image\.jpg' dist/never-hungover/*/index.html | head -1 >/dev/null && echo "PASS Item #4: og fallback unified" && \
    # Item #5: deps gone
    ! grep -E "\"(recharts|embla-carousel-react|input-otp|cmdk|vaul)\"" package.json && \
    [ ! -f src/components/ui/chart.jsx ] && \
    [ ! -f src/components/ui/carousel.jsx ] && echo "PASS Item #5: deps removed" && \
    # FOUC regression check (PR #343): off-screen positioning intact on stub
    grep -E 'id="prerender-main-stub"[^>]+left:\s*-9999px' dist/index.html >/dev/null && echo "PASS FOUC: stub still off-screen" && \
    # Z-class regression check (PR #341, Pattern #15): if verifier exists, run it
    ([ -f scripts/verify-z-classes.mjs ] && node scripts/verify-z-classes.mjs && echo "PASS z-classes: tokens emitted" || echo "SKIP z-class verifier (script not present)")
    ```
    All PASS lines must print; final build exit code must be 0. Any FAIL aborts the spec.
  - **Done when**: All 6 PASS lines emit; build exit 0; FOUC and z-class regressions confirmed absent.
  - **Commit**: None (verification only)
  - _Requirements: AC-1.1 through AC-5.5, NFR-2, NFR-4, NFR-6_

---

## Notes

- **Branch**: All commits land on `cleanup/issue-344-post-audit` (already created at session start).
- **No PR creation in scope**: User handles `git push` and `gh pr create` after spec completes. Tasks file only covers code/data/verification work.
- **Order**: Groups 1, 2, 3, 5 are independent; Group 4 has internal ordering (4.1 helper → 4.2/4.3 consumers → 4.4 data fix → 4.5 cross-site verify). Group 6 must be last.
- **Rollback**: Each group's commits are independent — `git revert <group-commits>` cleanly reverses any one item without affecting others (per design.md PR Strategy section).
- **Out of scope** (do NOT add tasks for): inputmode on weight/drinks fields, refactoring secondary PostHog capture sites, commissioning new OG artwork, removing `micromark`/`next-themes`/`posthog-js`, fixing comparison/header z-index "inversion", Tailwind v4 `@source` directive (auto-detected). All listed in requirements.md "Out of Scope".
