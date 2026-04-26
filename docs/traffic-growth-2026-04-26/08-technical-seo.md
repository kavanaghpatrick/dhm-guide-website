# Technical SEO + Core Web Vitals Audit — 2026-04-26

Agent 8 of 10. Site: https://www.dhmguide.com (Vite + React, Vercel, prerendered SPA, 189 blog posts).

---

## 1. Indexability

### robots.txt
| Check | Status |
|---|---|
| HTTP status | 200 |
| Served from edge cache | yes (`x-vercel-cache: HIT`) |
| `User-agent: *` Allow `/` | yes |
| Disallow `/search?q=%7B*` | yes (template placeholder block — correct) |
| Sitemap reference | `https://www.dhmguide.com/sitemap.xml` |
| GPTBot / ChatGPT / PerplexityBot / ClaudeBot / Google-Extended | **No explicit allow.** Uses `User-agent: *` only. |

**Severity: low.** Default-allow via `*` is fine for AI bots, but explicit `Allow:` lines for `GPTBot`, `Google-Extended`, `ClaudeBot`, `PerplexityBot`, `CCBot`, `Applebot-Extended` would future-proof against any AI provider that defaults to opt-in.

### sitemap.xml
| Check | Status |
|---|---|
| HTTP 200 | yes |
| Well-formed XML | yes |
| Total URLs | 197 (189 blog posts + 8 main pages) |
| Posts in sitemap vs `/src/newblog/data/posts/*.json` | 189 / 189 — **100% coverage** |
| Stale lastmod | many at `2025-07-28/29` despite recent edits |

**Severity: low.** Coverage is perfect. Could refresh `lastmod` for posts edited after July 2025 to encourage Google recrawl.

### Random 5-post audit (live HTTP)

| Slug | Status | Title len | Meta-desc len | Canonical | JSON-LD blocks | robots |
|---|---|---|---|---|---|---|
| nootropics-vs-alcohol-cognitive-enhancement | 200 | 96 chars | 168 chars (truncated) | correct | 5 | index, follow |
| chronic-illness-alcohol-managing-autoimmune-conditions-smart-drinking | 200 | 96 chars (`&amp;amp;` double-encode) | 159 chars (truncated) | correct | 5 | index, follow |
| double-wood-vs-nusapure-dhm-comparison-2025 | 200 | 67 chars | 132 chars | correct | 5 | index, follow |
| precision-nutrition-alcohol-metabolism-genetic-diet-guide-2025 | 200 | 80 chars | **111 chars (generic boilerplate)** | correct | 5 | index, follow |
| flyby-vs-double-wood-complete-comparison-2025 | 200 | 73 chars | 132 chars | correct | 5 | index, follow |

Issues found:
- `precision-nutrition-alcohol-metabolism-genetic-diet-guide-2025` ships a **generic boilerplate** meta description ("Expert guide to smart drinking & hangover prevention. Science-backed DHM strategies + top supplements. Feel great tomorrow!") — not unique. **Severity: medium.**
- Two titles contain double-encoded entities (`&amp;amp;`) — display literal `&amp;` to users. File: prerender escapes already-escaped strings. **Severity: low** (cosmetic) — fix in `scripts/prerender-blog-posts-enhanced.js` `escapeHtml()` to skip already-encoded ampersands or pass raw titles.
- All 5 returned `meta robots: index, follow`. No noindex anywhere unintended.

### Cloaking / hidden-content red flag (CRITICAL)
File: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js:319`

```html
<div id="prerender-content" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
```

The prerendered blog content (only title + excerpt + first paragraph — ~100 words of a 2,200-word article) is hidden offscreen via the classic CSS-cloaking pattern. The comment in the file even says "removed display:none to prevent cloaking" but then re-introduces an equivalent hidden technique. Google's docs explicitly call this out.

**Severity: HIGH.** Two problems:
1. Cloaking risk: Google's crawler runs JS, so it sees the React-rendered article — but Bingbot, AI crawlers, and many others don't, and they will see only the hidden 100-word stub. The off-screen wrapper is the canonical "trying to look bigger than you are" pattern Google penalizes.
2. Content depth: even ignoring cloaking, the prerendered HTML contains only 9 `<p>` tags total per post (the full article has 50+). Bingbot, ChatGPT, Perplexity, social crawlers see almost no content.

Recommended fix: render the full article body server-side (or at build time via `marked`/`react-markdown`) into the prerendered HTML, **without** the off-screen positioning. React can hydrate over visible content with `hydrateRoot()` — that's the whole point of SSR/SSG. Files affected: `scripts/prerender-blog-posts-enhanced.js`, `scripts/prerender-main-pages.js`.

---

## 2. Core Web Vitals (PostHog `$web_vitals` last 30 days)

| Metric | Good (count) | Needs-improvement | Poor | Avg poor (ms) | p75 poor (ms) |
|---|---|---|---|---|---|
| **LCP** | 311 | 92 | **394** | **22,267** | 30,647 |
| **FCP** | 695 | 180 | **942** | **20,317** | 28,039 |
| CLS | 132 | 7 | 3 | 0.71 | 0.90 |
| INP | 109 | 9 | **25** | 3,464 | 2,152 |
| TTFB | (no field captured) | — | — | — | — |

### LCP by device (last 30d)
| Device | Rating | Avg LCP (ms) | Count |
|---|---|---|---|
| Desktop | poor | **22,401** | 391 |
| Desktop | good | 1,499 | 108 |
| Desktop | needs-improvement | 3,190 | 70 |
| Mobile | good | 1,210 | 202 |
| Mobile | needs-improvement | 2,836 | 20 |
| Mobile | poor | 4,449 | 2 |

**Severity: CRITICAL.** Desktop LCP averages **22.4 seconds** for ~70% of desktop sessions. Mobile is healthy. The huge desktop disparity strongly suggests one of:
- Bot/preview-renderer traffic with throttled JS execution
- A small set of crawler-style sessions skewing the avg
- Real users on tab-restored / background-loaded tabs hitting `web_vitals` on visibilitychange

**Validate with `properties.$lib === 'web' AND properties.$session_initial_referring_domain != ''` filter** to exclude bot-like sessions before declaring an emergency. But even excluding those, the FCP poor count (942) is too large to dismiss.

### Top 10 worst-LCP URLs (last 7 days)
1. `/never-hungover/flyby-vs-cheers-complete-comparison-2025` — 24,520 ms (49 samples)
2. `/never-hungover/dhm-randomized-controlled-trials-2024` — 22,746 ms (13)
3. `/never-hungover/double-wood-vs-toniiq-ease-dhm-comparison-2025` — 26,113 ms (8)
4. `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` — 29,983 ms (4)
5. `/never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025` — 17,607 ms (4)

These are all comparison/review posts — the same ones with code-split JS chunks of 30-60 KB plus the 368 KB main `index.js` bundle (gzipped: **121 KB**). Heavy comparison-table component is likely TBT culprit.

### CLS
| Rating | Avg | Count |
|---|---|---|
| good | 0.037 | 132 |
| needs-improvement | 0.123 | 7 |
| poor | 0.714 | 3 |

96% of measured page-views pass CLS. **Severity: low** but the 3 sessions at 0.71 deserve investigation — likely the blog-post hero image (`loading="eager"` but no `width`/`height` attrs in `src/newblog/components/NewBlogPost.jsx:921`).

### INP
**Severity: medium.** 25 sessions at 3.46s INP. The same massive `index.js` plus first-render React reconciliation on long blog pages (50+ paragraphs hydrated in one tick) is the likely cause.

---

## 3. Structured-data audit

| Page type | Article | Product | Organization | WebSite | FAQ | HowTo | Review | Breadcrumb |
|---|---|---|---|---|---|---|---|---|
| Homepage | yes | yes | yes | yes | no | no | no | **no** |
| `/reviews` | yes | yes | yes | yes | no | no | no | **no** |
| `/compare` | yes | yes | yes | yes | no | no | no | **no** |
| Blog post (typical) | yes (2x) | yes | yes | yes | rare | rare | rare | **no** |
| `dhm-dosage-guide-2025` | yes (2x) | yes | yes | yes | **yes** | **yes** | no | no |

JSON-LD parses cleanly (validated 7 blocks on dosage page).

### FAQ/HowTo coverage in `src/newblog/data/posts/*.json`
| Schema | Posts with field | % of 189 |
|---|---|---|
| `faq[]` | 10 | 5.3% |
| `howTo` | 2 | 1.1% |
| `review` | 9 | 4.8% |

**Severity: HIGH (opportunity).** Only 10/189 posts emit FAQ schema. Comparison posts (`X-vs-Y-2025`) almost universally have Q&A sections in the prose but lack the `faq` JSON field, so no `FAQPage` schema is emitted. Adding FAQ schema to the ~40 comparison + review posts is one of the highest-leverage wins for AI-overview/rich-result eligibility.

### Duplicate Article schema
Every blog post emits **two** Article blocks (1 from `index.html` template hardcoded, 1 from prerender script). Search Console may flag this as "Multiple Article structured data elements". Fix: remove the template Article block from `index.html` (or have prerender remove it before adding the page-specific one). File: `/Users/patrickkavanagh/dhm-guide-website/index.html` lines containing the second `<script type="application/ld+json">`.

### Missing Breadcrumb schema (site-wide)
No `BreadcrumbList` JSON-LD on any page. Blog posts have a clear hierarchy (`Home > never-hungover > slug`) — easy add to the prerender script.

---

## 4. HTTP / security headers

| Header | Homepage | Blog post | JS asset | Comment |
|---|---|---|---|---|
| `strict-transport-security` | yes (`max-age=63072000`, no `includeSubDomains`/`preload`) | yes | yes | OK |
| `x-frame-options` | **missing** | missing | missing | low risk |
| `x-content-type-options` | **missing** | missing | missing | medium |
| `content-security-policy` | **missing** | missing | missing | medium |
| `referrer-policy` | **missing** | missing | missing | low |
| `permissions-policy` | **missing** | missing | missing | low |
| `cache-control` | `public, max-age=0, must-revalidate` | same | same | acceptable (etag handles it; 304s confirmed) |
| `etag` / `last-modified` | yes | yes | yes | OK |
| `content-encoding` | `br` (HTML) / `gzip` (JS) | `br` | `br` (HTML) `gzip` (JS) | OK |

**Severity: low/medium.** Vercel sets sane defaults; missing headers mostly affect security score, not SEO. Add via `vercel.json` `headers` (`X-Content-Type-Options: nosniff` is the cheapest win).

---

## 5. Image optimization

| Stat | Value |
|---|---|
| Total images in `/public` | ~464 |
| Total `/public` image bytes | **194.5 MB** |
| Images > 200 KB | 154 |
| Images > 1 MB | **71** |
| PNGs > 500 KB | 61 (109.9 MB total) |
| WebP files | 379 |
| AVIF files | 1 |

**Largest offenders (`/public/*-hero.png`)** — most are 1.7-2.4 MB:
- `study-abroad-international-student-hero.png` — 2.2 MB
- `german-beer-culture-guide-hero.png` — 2.4 MB
- `college-student-dhm-guide-hero.png` — 2.3 MB
- `longevity-biohacking-hero.png` — 2.3 MB
- ...50+ more in 1-2 MB range

WebP versions exist for most (`/public/images/*-hero.webp`) and are 5-10× smaller. **No blog post JSON references the .png variants** (verified via grep), so the giant PNGs are dead weight on the build but unused at runtime. **Severity: low** for current SEO impact; deleting them shrinks deploys.

### `<img>` tag attributes
| Source | `loading` | `width`/`height` | Format |
|---|---|---|---|
| `src/pages/Home.jsx:154` (hero) | `eager` | yes (1536/1024) | webp + srcset | 
| `src/pages/About.jsx:227` (mission) | **missing** | **missing** | imported asset |
| `src/newblog/components/NewBlogPost.jsx:921` (post hero) | `eager` | **missing** | post.image (varies) |
| `src/components/Picture.jsx` | `lazy` (default) | passes through props | webp + fallback |
| Body images in markdown content | depends on react-markdown defaults | **missing** | varies |

`Picture.jsx` (the proper component) is **never imported anywhere** in `src/`. Dead code. **Severity: medium.** Adopt it in `NewBlogPost.jsx` (or just add `width={1200} height={630}` literals to the `<img>` at line 921) — one of the easier CLS wins.

---

## 6. Internationalization

- Site is English-only (US affiliate links).
- No `<link rel="alternate" hreflang="...">` anywhere on homepage or blog posts.
- `<html lang="en">` is set.

**Recommendation: do not pursue i18n.** Affiliate links are amzn.to / Amazon US. Adding hreflang only matters if you build a /uk or /au variant. Skip.

---

## 7. Recent regressions (CLAUDE.md context)

| Pattern | Status |
|---|---|
| #11: prerendered SPA dual SEO sources | **Verified intact.** `<title>`, meta-description, canonical correct in initial HTML for all 5 sampled posts. |
| #29: redirect rule blocking comparison posts | Verified absent in `vercel.json`; comparison posts return 200. |
| #271: canonical-fix.js 404 | Verified removed from `index.html`. **However:** `https://www.dhmguide.com/canonical-fix.js` still returns 200 with the SPA HTML body (because `vercel.json` rewrites `/((?!never-hungover/).*)` → `/index.html`). Any cached browser still trying to load it as JS will get a `<!DOCTYPE` SyntaxError. **Severity: low** (no fresh references, browser cache will expire). |

---

## 8. Site speed / TTFB (live timing)

| URL | DNS | Connect | TLS | TTFB | Total | Size (uncompressed HTML) |
|---|---|---|---|---|---|---|
| `/` | 2 ms | 95 ms | 141 ms | 176 ms | 181 ms | 12.8 KB |
| `/never-hungover/dhm-dosage-guide-2025` | 2 ms | 31 ms | 63 ms | 95 ms | 95 ms | 18.5 KB |
| `/compare` | 3 ms | 38 ms | 71 ms | 103 ms | 108 ms | 12.9 KB |
| `/reviews` | 3 ms | 34 ms | 64 ms | 168 ms | 168 ms | 12.8 KB |

TTFB is excellent (<200 ms from London). Vercel edge cache is HIT on all four. Initial HTML is small (compressed: 4-5 KB). **Server response is not the LCP problem.**

The LCP problem is **client-side**: 121 KB main JS bundle (gzip) + 26 KB CSS + per-route chunk + React mounting + content rendering. On slow desktop CPUs / throttled tabs / bot crawlers, this stack pushes LCP past 22 s.

---

## Prioritized fixes

### Critical (ranking-impacting, fix this week)
1. **Prerender full article HTML, not 100-word stub.** Replace the off-screen-positioned `#prerender-content` div with a normally-positioned, full-content `<article>` that React hydrates over. Affects `scripts/prerender-blog-posts-enhanced.js:319-330`. Eliminates cloaking risk and dramatically improves Bingbot/AI-bot indexability.
2. **Investigate the desktop-LCP 22 s outlier** in PostHog. Filter by `$browser`, `$device_type=Desktop`, `$session_id` cohorts, and look for whether these are real users or headless/bot sessions. If real, code-split the comparison-table component out of `index.js`.

### High (clear wins, 2-4h each)
3. **Add FAQ schema to comparison + review posts** (~40 posts). Most already contain Q&A markdown; just populate the `faq` array in JSON. Coverage goes from 5.3% → ~25%.
4. **Fix duplicate Article JSON-LD.** Remove the static Article schema block from `index.html`; let prerender script be the single source. ~10 lines deleted.
5. **Add `width`/`height` to blog post hero `<img>`** in `src/newblog/components/NewBlogPost.jsx:921`. Eliminates CLS contribution.

### Quick wins (under 2 h, ranking-relevant)
6. **Add BreadcrumbList JSON-LD** in prerender script. Trivial — Home → never-hungover → slug.
7. **Fix double-encoded titles** (`&amp;amp;`) in `scripts/prerender-blog-posts-enhanced.js`. Pass raw titles, escape exactly once.
8. **Replace generic meta-description** on `precision-nutrition-alcohol-metabolism-genetic-diet-guide-2025` and any other posts with the boilerplate "Expert guide to smart drinking..." text. Audit `metaDescription` field across all posts.
9. **Add explicit `Allow:` rules in robots.txt** for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`. Future-proofs AI-overview surfaces.
10. **Refresh sitemap `<lastmod>`** on posts edited after July 2025. The generator script already runs at build — check why it's emitting stale dates.

### High-leverage, multi-day project
**Migrate from `prerender + React hydration` to true SSR/SSG.** Vite + React supports `vite-plugin-ssr` or migrate to Next.js / Astro / Remix. The current architecture works but the off-screen prerender hack is fragile and the React hydration is what's pushing LCP/INP past good thresholds. A real SSG approach would: ship full article HTML to crawlers and humans, let React take over for interactivity, eliminate the cloaking-pattern risk, and likely cut LCP in half. Estimated effort: 5-10 days. Expected gain: significant traffic uplift from AI-search surfaces (ChatGPT, Perplexity, Google AI Overviews) that don't execute JavaScript well.
