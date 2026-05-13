# 01 - Change Inventory: 2026-04-25 → 2026-05-12

Authoritative manifest of every shipped change between 2026-04-25 (Sun) and 2026-05-12 (Mon).
Agents A2-A9: use this to attribute lifts. Pre-cutoff baseline = before 2026-04-26 10:21 BST (the first merge in the range).

## 1. TL;DR

| Bucket | Count | Notes |
|---|---|---|
| Shipped PRs in range | 65 | merge commits between 2026-04-26 and 2026-04-30 |
| **Tracking-surface changes** | **12** | new events, schema changes, init-time filters, sampling restores |
| **UX changes (user-visible)** | **22** | CTAs, mega-menu, mobile layout, testimonial polish, hero CLS, content additions |
| **SEO / infra changes** | **27** | schemas, sitemap, redirects, prerender, robots, lockfile, cluster config |
| Pure chore / docs / ops | 4 | docs, gitignore stragglers, mass-edit moratorium CI |
| Not yet deployed (working tree) | 3 files | CompareCTA.jsx + NewBlogPost.jsx wiring + sitemap bump |

**Two ship clusters dominate everything:**
- **2026-04-26 (Sun)** — 41 PRs merged in a single 7-hour window. Massive launch.
- **2026-04-29 (Wed)** — 17 PRs merged (mostly SEO title trims + the #361 spec-artifact retro-commit). Second wave.

## 2. Tracking-surface changes

| PR # | Merged (BST) | Event added/changed | Component file | Pages affected |
|---|---|---|---|---|
| #269 | 04-26 10:21 | **Restored** `time_on_page_milestone`, `rage_click_detected`, `text_copied`, `tab_hidden`, `tab_visible`, `form_field_focused`, `page_exit` volume by removing `Math.random() < 0.1` gate (~7x ingest jump expected) | `src/hooks/useEngagementTracking.js` | All pages |
| #273 | 04-26 10:21 | Renamed `element_clicked` value `mobile-menu` → `mobile_menu`; product-name attribution unified (was `product.brand` "Double Wood", now `product.name` "Double Wood Supplements DHM") | `ComparisonWidget.jsx`, `MobileComparisonWidget.jsx`, `Layout.jsx`, `useElementTracking.js` | All pages (mobile menu); /reviews + /compare (product widgets) |
| #274 | 04-26 10:23 | `affiliate_link_click` now fires for **fullerhealth.com** clicks (regex `AFFILIATE_URL_PATTERN` extended); fixed 2 placeholder amzn URLs that earned $0 commission | `src/hooks/useAffiliateTracking.js`, `src/pages/Compare.jsx` | /compare |
| #275 | 04-26 10:21 | Inline blog Amazon links now emit `affiliate_link_click` with `placement`/`product`/`position` props (previously silent) | `src/newblog/components/NewBlogPost.jsx` | All blog posts with inline Amazon links |
| #277 | 04-26 10:21 | NEW: `element_clicked` events from template-injected `/reviews` CTAs at mid (~30%) and end of content. Props: `placement` ∈ `{blog_template_mid, blog_template_end}`, `destination`, `post_slug`, `element_name` | `src/newblog/components/NewBlogPost.jsx` (InlineReviewsCTA) | 188 of 189 blog posts (1 stub skipped) |
| #279 | 04-26 10:23 | Playwright regression suite asserts `affiliate_link_click` via `window.dataLayer` (not directly user-facing; locks tracking contract) | `tests/affiliate-tracking.spec.js`, `playwright.affiliate.config.js` | /reviews, /compare |
| #280 | 04-26 10:21 | Operational: `posthog-query.sh` now requires `POSTHOG_PERSONAL_API_KEY` env; new subcommands `dead-clicks-raw` + `dead-clicks-real` (filters affiliate target=_blank false positives) | `scripts/posthog-query.sh`, `scripts/utm-tag.sh` | n/a (query layer) |
| #208 (#353) | 04-29 15:41 | NEW: `testimonial_slide_view` event with props `{slide_index, trigger}` where trigger ∈ `{next, prev, dot, swipe, keyboard, auto}` | `src/components/UserTestimonials.jsx` | /reviews (UserTestimonials carousel) |
| #209 (#358) | 04-29 15:48 | NEW: `filter_clicked` event with `{filter_value: <id>}` from Best-For button row replacing native `<select>` | `src/pages/Reviews.jsx` | /reviews |
| #285 (#311) | 04-26 13:00 | NEW: PostHog events differentiating newsletter `captured` vs `delivered` (Buttondown serverless proxy now actually sends; previously console.log only — all prior signups silently dropped) | `src/pages/DosageCalculatorEnhanced.jsx`, `api/newsletter-subscribe.js` | /dhm-dosage-calculator (inline form + exit-intent popup) |
| #287 (#313) | 04-26 13:12 | Operational: added `lcp-real` HogQL subcommand to split bot vs real-user `$web_vitals` (no code path change, but unblocks correct LCP attribution) | `scripts/posthog-query.sh` | n/a (query layer) |
| #344 (#346) | 04-29 15:38 | **Major:** PostHog init now skips bots (`/bot\|crawler\|spider\|...\|headless\|lighthouse/i` UA regex) AND preview/local deploys (`vercel.app`, `localhost`, `127.*`). Will reduce total event volume but improve real-user signal | `src/lib/posthog.js:initPostHog` | All pages |

## 3. UX changes (user-visible)

| PR # | Merged (BST) | Change | Pages/components | Expected metric impact |
|---|---|---|---|---|
| #270 | 04-26 10:21 | Convert 2 comparison posts from typed-array to markdown (flyby-vs-cheers, flyby-vs-good-morning-pills) | 2 blog posts | Render fix — eliminates broken content |
| #271 | 04-26 10:21 | Remove `/canonical-fix.js` 404 script reference causing console SyntaxError every page load | `index.html` | All pages — fewer errors, marginal load improvement |
| #272 | 04-26 10:21 | Convert 3 more comparison posts to markdown | 3 blog posts | Render fix |
| #276 | 04-26 10:21 | NAC vs DHM article: replace 3 code-block protocols with bullet lists + 2 inline /reviews CTAs; convert "Q:" pills to h3 | `nac-vs-dhm-...` post JSON | Dead-click rate should drop from 107% → ~baseline on that URL |
| #277 | 04-26 10:21 | **High-impact:** template /reviews CTA injected mid + end of all 188 blog posts | All blog posts | Hypothesis: 6,000+ blog PV/mo with new /reviews bridges; +90-225 affiliate clicks/mo (doubling site-wide) |
| #278 | 04-26 10:22 | Mobile: front-load comparison table above-fold on /reviews and /compare via `order-first md:order-none` | `Reviews.jsx`, `Compare.jsx` | Mobile CR was 3.57% vs desktop 1.23% — closes that gap; reduces mobile bounce before converting element |
| #281 | 04-26 10:27 | DHM1000 brand: "Double Wood Supplements" → "Dycetin"; drop redundant ReviewsCTA conditional in NewBlogPost (now redundant w/ #277) | `Compare.jsx`, 3 post JSONs, `NewBlogPost.jsx` | Minor |
| #284 (#310) | 04-26 12:54 | **Major:** prerender now renders FULL article HTML (was 100-word stub before). dhm-dosage-guide went 0-1 `<p>` tags → 103 | `prerender-blog-posts-enhanced.js`, `index.html` | Crawlers see full content; potential AI search + organic indexing lift |
| #285 (#311) | 04-26 13:00 | Newsletter capture wired to Buttondown serverless proxy + sonner toast feedback (previously silent fail) | `DosageCalculatorEnhanced.jsx` | New conversion path: signups will start flowing |
| #292 (#320) | 04-26 13:48 | Quick Answer blue callout box added to 29 of top 30 posts | `NewBlogPost.jsx`, 29 post JSONs | Above-fold answer boxes; AI engine extraction; could affect bounce / time on page |
| #293 (#321) | 04-26 13:53 | Hero `<img>` swapped to `<Picture>` with width=1600/height=900 + fetchpriority=high (CLS fix) | `NewBlogPost.jsx`, `Picture.jsx` | All blog post hero images — CLS drop expected |
| #298 (#326) | 04-26 14:38 | **Big chrome change:** Mega-menu nav replaces single /never-hungover link with 6-cluster Topics dropdown (3-col grid on desktop, collapsible mobile) | `Layout.jsx` | All pages — navigation pattern shift |
| #299 (#327) | 04-26 14:47 | dhm-science-explained rewritten/expanded 1,435 → 2,000+ words | 1 blog post | Content depth |
| #300 (#330) | 04-26 15:42 | Hangover-supplements-complete-guide rewrite for head-term ranking | 1 blog post | Content |
| #301 (#331) | 04-26 15:51 | Refresh top-5 traffic posts (incl. dhm-dosage-guide 1,168 PV/mo) + remove broken PMC citations | 4-5 blog posts | Content freshness, fewer broken links |
| #302 (#332) | 04-26 16:09 | NEW pillar: Hangxiety Complete Guide 2026 (6,500 words, brand new cluster) | new post | New entry traffic |
| #303 (#333) | 04-26 16:23 | NEW spoke: Magnesium for Hangover & Hangxiety (3,784 words) | new post | Cluster spoke traffic |
| #304 (#334) | 04-26 16:37 | NEW: What to Eat Before Drinking guide (Healthline #1 killer) | new post | New entry traffic |
| #305 (#335) | 04-26 16:49 | NEW: Ozempic + GLP-1 alcohol guide (zero-competition mega-trend, 3,500 words) | new post | New entry traffic |
| #306 (#336) | 04-26 17:06 | NEW: 4 spirit-specific guides (vodka, whiskey, champagne, hard seltzer) | 4 new posts | Cluster completion |
| #117 (#352) | 04-29 15:41 | Mobile: hide 3 secondary columns (DHM mg, Per Serving, Reviews) on /reviews comparison table; 8 cols → 5 on <768px | `Reviews.jsx` | Mobile UX — reduces horizontal scroll, surfaces CTA column |
| #208 (#353) | 04-29 15:41 | Testimonial carousel: auto-rotate (5s), pause-on-hover, swipe gestures, keyboard nav, ARIA region semantics | `UserTestimonials.jsx` | /reviews (UserTestimonials) — engagement |
| #209 (#358) | 04-29 15:48 | Replace native `<select>` filter with 5-button row (All / Best Overall / Best Value / Heavy Drinkers / Health-Conscious); 44px touch targets | `Reviews.jsx` | /reviews — filter interaction |
| #246 (#359) | 04-29 15:50 | "Continue Your Research" 4-link footer added to all 197 blog post JSON contents (~756 new internal links) | 197 blog post JSONs | All blog posts — internal navigation depth |

## 4. SEO / infra changes (not user-visible but affects PV mix)

| PR # | Merged (BST) | Change | Files |
|---|---|---|---|
| #286 (#312) | 04-26 13:06 | Distinct `dateModified` from `datePublished` in JSON-LD + sitemap (git-log derived); sitemap lastmods went mostly 2025 → 2026 across 152/189 posts | `prerender-blog-posts-enhanced.js`, `generate-sitemap.js` |
| #287 (#313) | 04-26 13:12 | Bot-vs-real-user LCP split (query helper; no perf change) | `posthog-query.sh` |
| #288 (#316) | 04-26 13:25 | Slug rename `dhm-randomized-controlled-trials-2024` → `dhm-randomized-controlled-trials` + 301 redirect | `vercel.json`, JSON rename |
| #289 (#317) | 04-26 13:34 | FAQ schema backfilled across 62 posts (auto-extract) | 62 post JSONs |
| #290 (#318) | 04-26 13:39 | BreadcrumbList JSON-LD emitted on prerender; duplicate Article schema removed | `prerender-blog-posts-enhanced.js`, `prerender-main-pages.js` |
| #291 (#319) | 04-26 13:42 | robots.txt: explicit Allow for 10 AI crawlers (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, etc.) | `public/robots.txt` |
| #294 (#322) | 04-26 14:05 | PubMed citations backfilled on top 30 traffic posts (53-entry phrase→PMC map) | 30 post JSONs |
| #295 (#323) | 04-26 14:12 | New `cluster-config.json` foundation + cluster-aware relatedPosts fallback | `scripts/generate-related-posts.mjs`, new config |
| #296 (#324) | 04-26 14:23 | 26 hub→orphan inbound links injected across 28 high-priority orphan posts | 11 hub post JSONs |
| #297 (#325) | 04-26 14:32 | 6 topic clusters formalized (spoke→pillar + pillar→spoke links, sentinel-guarded) | many post JSONs |
| #308 (#314) | 04-26 13:18 | PostHog dashboard: 10 measurement tiles for traffic-growth plan (query layer) | `posthog-query.sh`, `posthog-dashboard-config.json` |
| #309 (#338) | 04-26 17:16 | Remove 109MB of unused PNG/WebP from /public (87MB final, 159 files deleted) | `public/` |
| #310 (#321 lockfile) | 04-26 15:06 | Regenerate pnpm-lock.yaml after micromark deps — **unblocked Vercel deploys** | `pnpm-lock.yaml` |
| #329 | 04-26 15:33 | CI gate for lockfile drift | `.github/workflows/lockfile-check.yml` |
| #339 | 04-26 19:14 | Mega-menu fix #1: remove header opacity animation (created stacking context) | `Layout.jsx` |
| #340 | 04-26 19:23 | Mega-menu fix #2: portal dropdown to document.body via createPortal | `Layout.jsx` |
| #341 | 04-27 11:47 | **Fix:** z-index tokens moved from `tailwind.config.js` → `@theme` in App.css. 12 classes (z-header, z-modal etc.) were emitting **nothing** for ~6 months. Page images had been scrolling over the fixed header | `src/App.css`, `tailwind.config.js` |
| #342 | 04-27 19:55 | Layering safety net: CI verify-z-classes + ESLint shell rule + CLAUDE.md patterns | scripts, eslint |
| #343 | 04-28 10:53 | Restore off-screen positioning on prerender div to eliminate FOUC (while keeping #310 full-content fix) | `index.html`, `prerender-blog-posts-enhanced.js` |
| #141 (#356) | 04-29 15:45 | FAQPage schema on /guide + /dhm-dosage-calculator; ItemList schema on /reviews; topProducts.json single-source extraction | `prerender-main-pages.js`, new `topProducts.json` |
| #143 (#347) | 04-29 15:39 | Title trim: DHM Clinical Trials 68 → 55 chars | 1 post JSON |
| #151 (#348) | 04-29 15:39 | Title trim: NAC vs DHM 71 → 55 chars + 2025 → 2026 freshness | 1 post JSON |
| #154 (#357) | 04-29 15:47 | HowTo schema emitted for /guide route | `prerender-main-pages.js` |
| #158 (#350) | 04-29 15:40 | Title trim: No Days Wasted 99 → 54 chars | 1 post JSON |
| #251 (#355) | 04-29 15:42 | HowTo schema data added to 4 Tier-1 hangover guides | 4 post JSONs |
| #345 (#349) | 04-29 15:40 | Meta description rewrites for #143 + #151 | 2 post JSONs |
| #84 (#351) | 04-29 15:41 | Remove 5 metadata orphan entries, generate 13 reverse-orphans | `metadata/index.json` |
| #86 (#354) | 04-29 15:42 | Repair 16 broken internal links across 8 posts + audit script | 8 post JSONs |
| #190 (#360) | 04-29 15:51 | DHM clinical studies database 11 → 25 entries; APA citation formatter | `/research`, new utils |
| #363 (#367) | 04-29 19:09 | 4 hard SEO bugs: gen-z slug `%` removal, social-media apostrophe removal, non-www→www 308, dead /dhm-dosage-calculator-new route removed | `vercel.json`, `App.jsx`, slugs |
| #364 (#368) | 04-29 19:32 | 2 hub pages promoted to cluster pillars (mega-menu now renders 10 clusters); 112 /blog/ → /never-hungover/ link rewrites in science hub | `cluster-config.json`, 1 hub post |
| #344 (#346) | 04-29 15:38 | (also UX) edge-to-edge viewport on notched devices, safe-area-inset on mobile CTA, decimal keypad on calculator duration input, og-image fallback unified, 5 unused deps removed | many files |
| #365 (#369) | 04-29 19:55 | DCNI bucketing infrastructure (operational; no user-facing) | scripts |
| #366 (#370) | 04-29 20:13 | Mass-edit moratorium CI guardrail (>20 post-JSON edits fail unless `[mass-edit-allowed]` in PR body) | `.github/workflows/lockfile-check.yml`, scripts |
| #371 | 04-30 10:55 | PostHog DCNI Recovery Watchlist dashboard provisioner | scripts |
| #372 | 04-30 10:57 | Amazon price refresh pipeline (Playwright); first run updated 10 products, DHM Depot $44.95 → $19.95 (-56%) | `topProducts.json`, `Home.jsx`, `Compare.jsx` |

## 5. NOT YET DEPLOYED (working tree only — DO NOT attribute lifts to these)

Agents A2-A9: PostHog data **will not** contain events from the following:

| File | Status | Description |
|---|---|---|
| `src/components/CompareCTA.jsx` | Untracked (new file, 59 lines) | New `<CompareCTA />` component — orange-50 callout card, links to `/compare`, fires `element_clicked` with `element_type: compare_cta`, `cta_destination: /compare`, `placement: in_post`. Data attrs: `data-track="cta"`, `data-cta-destination`, `data-placement` |
| `src/newblog/components/NewBlogPost.jsx` | Modified | Adds import + renders `<CompareCTA />` once per post (between article body and related-posts block), gated by `!post.hideCompareCTA && !/(?:^|-)vs-/ && !/^compare-/` slug pattern — skips already-comparison posts |
| `public/sitemap.xml` | Modified | Lastmod bumped 2026-04-29 → 2026-04-30 on main pages (cosmetic) |
| `scripts/screenshot-compare-cta.mjs` | Untracked | Playwright screenshot harness for the new CompareCTA |
| `docs/posthog-2026-04-30/`, `docs/posthog-investigation-2026-04-30/`, `docs/compare-cta-2026-04-30/` | Untracked dirs | Investigation/PRD docs |

**Implication:** new `compare_cta` `element_clicked` events do **not** exist in PostHog yet. Any analysis dated 2026-05-12 of compare-cta engagement is necessarily pre-deployment.

## 6. Attribution hot dates (user-visible ships only)

| Date | What shipped that real users would notice |
|---|---|
| **2026-04-26** (Sun) | Pre-existing tracking gaps **fixed** (#269 sampling restore — events 7x). Template /reviews CTA in every blog post (#277). Mobile comparison table front-loaded (#278). Quick Answer boxes on top-30 posts (#292). Hero CLS fix (#293). Mega-menu nav launched (#298). 6 new posts (Hangxiety, Magnesium, What-to-Eat, Ozempic, 4 spirit guides). dhm-science rewrite. Full-content prerender (#310). Newsletter capture wired (#311). NAC vs DHM dead-click cleanup (#276). Affiliate tracking fixes (#274, #275). **Day-of-day analysis is meaningless** — too many changes correlated. |
| **2026-04-26 evening** (19:14–19:23) | Mega-menu z-index emergency fixes (#339, #340) — dropdown was trapped under page content from launch at 14:38 until 19:23, ~5h window where users couldn't reach mega-menu links cleanly |
| **2026-04-27** (Mon) | Latent 6-month bug fixed: `z-header` class started emitting (#341). Layering CI safety net (#342). Page images no longer scrolling over header during scroll |
| **2026-04-28** (Tue) | FOUC fix restoring off-screen prerender div (#343) — cosmetic only |
| **2026-04-29** (Wed) | Testimonial carousel polish + new `testimonial_slide_view` event (#353). Best-For button row + new `filter_clicked` event (#358). Mobile column hiding on /reviews (#352). "Continue Your Research" footer on 197 posts (#359). 4 SEO title trims + meta description rewrites. FAQ + HowTo + ItemList schemas (#356, #357, #355). 2 cluster pillar promotions → mega-menu now shows 10 clusters (#368). **Bot+preview PostHog exclusion (#346)** — event volume from this date forward should drop slightly but signal quality improves |
| **2026-04-30** (Thu) | Amazon price refresh: DHM Depot $44.95 → $19.95 (-56%), 9 other product prices updated (#372). DCNI dashboard provisioner (#371) — query layer only |
| **2026-05-01 → 2026-05-12** | **No deploys.** 12-day quiet window — clean post-launch measurement window for everything shipped through 2026-04-30 |

**Key recommendation for A2-A9:** Use **2026-05-01 → 2026-05-12** as the clean "post" window. Pre-cutoff = **2026-04-14 → 2026-04-25** (12 days back from first ship). The PostHog bot-exclusion change in #346 (2026-04-29) means raw event totals will look like they dropped on 2026-04-30 — that's the bot filter, not a real drop. Compare like-for-like by filtering bots in the pre-window too via `lcp-real`-style UA splits.
