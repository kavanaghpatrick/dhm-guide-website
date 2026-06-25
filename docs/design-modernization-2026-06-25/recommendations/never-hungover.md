# Never Hungover Blog Hub — Modernization Recommendations

- Route: `/never-hungover`
- Source: see manifest
- Screenshots: `../screenshots/never-hungover/`

## Never Hungover Blog Hub — Modernization Recommendations

**Route:** `/never-hungover` · **Component:** `src/newblog/pages/NewBlogListing.jsx`

### What the screenshots show
A header band (gradient green "Never Hungover" wordmark, gray subtitle, a thin pulse-dot stat line, a search bar, and a wall of green filter chips) sits on a page-wide `from-green-50 to-blue-50` wash. Below it, **all ten desktop frames are the same thing**: an effectively endless 3-column grid of identical white `rounded-xl shadow-lg` cards. The **only** affiliate CTA anywhere is the **mobile sticky bar** (mobile-01/02: "No Days Wasted DHM… $28.99 ★4.3 Check Price"). The **desktop hub has no product CTA at all.**

### What feels dated (grounded in frames + code)
- **Gradient clip-text H1** with `hover:scale-105` (desktop-01, `L86–93`) — 2021 SaaS tell.
- **Green→blue page wash** `from-green-50 to-blue-50` (`L80`) — the canonical supplement-affiliate gradient.
- **Card monotony at scale** — ~100+ identical `shadow-lg` cards, no featured tier, no sectioning, no hierarchy (desktop-01→10).
- **Green-on-green pileup** — stat dot, filter chips, tag chips (`L102`, `L148–152`, `L245`) all green-fill.
- **Georgia/system type** reads default, not brand.
- **The entire desktop page does nothing for `affiliate_link_click`.**

### Before → After (highest value first)

| # | Change | Before | After | Effort | CTR risk | CWV |
|---|--------|--------|-------|--------|----------|-----|
| 1 | Foundation + heading | Green→blue wash + gradient clip-text H1 | Warm paper `#FAF8F4`, solid ink H1, one green accent word | S | none | low |
| 2 | Featured hero | 100+ identical cards, no hierarchy | One wide Editor's Pick hero routing to a CTA-bearing post | M | none | low |
| 3 | Card re-tier | White `shadow-lg` on every card | Border-first, hover-only soft shadow, brand-soft tag chips | M | none | low |
| 4 | Typography | Georgia + 16px system | Fraunces display + Inter 17px, zero-CLS self-host | M | none | **medium** |
| 5 | Trust strip | Gray throwaway stat line + pulse dot | Designed trust strip, icons, one-shot count-up | S | none | low |
| 6 | **Desktop product rail** | **No desktop CTA at all** | One orange "Check Price on Amazon" module above grid | M | **positive** | low |
| 7 | Header + grid perf | Green chip wall, all cards rendered | Neutral chips, paginate/virtualize the grid | M | none | low (perf win) |
| 8 | Motion | Looping `animate-pulse` dot | One-shot scroll reveals, reduced-motion gated | S | none | low |

### The key conversion insight
This is a **hub**, so its conversion job is twofold: (a) route readers efficiently into articles where the sticky CTA lives, and (b) **the desktop hub has no affiliate CTA whatsoever** — opportunity #6 is the single most direct lever to lift `affiliate_link_click` here. The featured hero (#2) compounds it by steering traffic toward CTA-bearing evergreen pages.

### Guardrails honored
Buildable in Tailwind v4 + shadcn/Radix + CVA + Framer + Lucide. Orange CTA hue/size/copy untouched and isolated from the foundation change. No `transform`/`filter`/`opacity` on header/main/footer (z-index scale safe, Patterns #14–16). Font change is the only `medium` CWV item — ship only with self-hosted subset woff2, preload text font only, and `size-adjust`/ascent overrides for zero CLS; otherwise defer to a later isolated variant.

### Highest-value A/B variant
**`never-hungover-editorial-hub-v1`** — a `NewBlogListing.modern.jsx` gated on `useExperiment('never-hungover-editorial-hub-v1')` bundling: warm paper + solid H1 (#1), featured hero (#2), desktop product rail (#6, wired to existing `trackAffiliateClick`), and card re-tier (#3). Type pairing + trust strip ship as a later isolated variant to keep this test clean. **Primary metric: `affiliate_link_click`.** Secondary: article card CTR (scroll depth / time-on-page).


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Add desktop product/CTA rail above the grid (net-new affiliate path; desktop has NONE — StickyMobileCTA is md:hidden) — the direct conversion lever
- Swap green→blue wash → warm paper + retire gradient clip-text H1 (highest aesthetic ROI, zero CTR/CWV risk, utility-class only)
- Promote a single Featured/Editor's Pick hero card (adds the missing editorial hierarchy + routes to a CTA-bearing article)
- Re-tier cards to border-first + hover-only shadow + neutral tag chips, folding in the search/chip restyle (kills the green haze so orange CTA reads as the only saturated thing)


**Top A/B pick (build first):** `never-hungover-editorial-hub-v1` — Create NewBlogListing.modern.jsx, rendered by a thin wrapper that reads useExperiment('never-hungover-editorial-hub-v1') and gates the swap on isLoading to avoid flicker; control (NewBlogListing.jsx) stays untouched. The modern variant bundles four low-risk, mutually reinforcing changes: (1) replace the L80 green→blue wash with warm paper and rewrite the L86-94 gradient clip-text H1 to solid ink with ONE green accent word (drop bg-clip-text, gradient, hover:scale-105, gradient underline); (2) insert ONE compact orange 'Check Price on Amazon' product rail between the header band and the grid — net-new DESKTOP affiliate surface — reusing the sticky bar's existing topProductsData[0] + buildAffiliateUrl and wiring trackAffiliateClick({experimentKey:'never-hungover-editorial-hub-v1', variant}); (3) promote a single hardcoded Featured/Editor's Pick hero card above the grid to break the 169-card monotony and route readers to a CTA-bearing article; (4) re-tier grid cards to border-first with hover-only soft shadow and neutral/brand-soft tag chips so green stops being a page-wide haze. EXCLUDE web fonts (Fraunces/Inter), the scroll count-up, staggered grid reveals, and grid virtualization — they carry the only real CWV/SEO risk and ship as separate later variants. Orange stays the sole saturated accent, unchanged in hue/size/copy.
- Primary metric: affiliate_link_click (rate per visitor on /never-hungover); secondary: article click-through into CTA-bearing posts, scroll depth, time-on-page | Effort: M
- Why high value: It pairs the single move that can directly RAISE the primary metric (a desktop affiliate CTA where literally none exists today — StickyMobileCTA is md:hidden, verified L76) with the cheapest, lowest-risk credibility lifts (warm paper, solid headline, editorial hero, calmer cards). All four are pure utility/markup changes buildable with the current Tailwind v4 + React + existing PostHog hooks; useExperiment and trackAffiliateClick(experimentKey, variant) already exist and are proven in production. By deliberately excluding the font swap and animation work, attribution stays clean and CWV/CLS exposure stays near zero.


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Swap green→blue wash for warm paper + retire gradient clip-text heading | keep | True | VERIFIED: L80 has bg-gradient-to-br from-green-50 to-blue-50; L86-94 has the gradient bg-clip-text H1 + hover:scale-105 + gradient underline bar. This is the single highest signal-to-effort move and the clearest 'deal site → editorial' tell. Use plain Tailwind utilities (bg-stone-50 or bg-[#FAF8F4], text-gray-900, one green-700 accent word). The cited tokens (--color-paper/--color-ink) do NOT exist in App.css — do NOT add new @theme tokens for one page; just use utilities. Keep it to background + H1 + underline. Anchor of the v1 variant. |
| Promote a Featured / Editor's Pick hero card above the grid | keep | True | VERIFIED: grid (L193-267) renders ~169 identical cards with zero hierarchy — every desktop frame in the screenshots is an undifferentiated index. A single featured tier is the #1 missing editorial signal AND routes traffic to a CTA-bearing article (StickyMobileCTA is mobile-only, so article pages are where conversion lives). Pick the target slug from a hardcoded const, not a new data pipeline. Reuse existing post metadata (image/title/excerpt/slug). Keep it ONE card, no carousel. |
| Re-tier cards: border-first flat + hover-only raised shadow + warm tag chips | keep | True | VERIFIED: L195-197 cards are white rounded-xl shadow-lg (always-on shadow = the flat-2018 monotony); L245 tag chips are bg-green-100/green-700 (the green-on-green haze). Swap to border + shadow-on-hover-only, keep the existing hover:-translate-y-1 (good). Demote chips to neutral stone or a soft brand tint so green stops being page-wide haze — this makes orange (the only CTA hue) the sole saturated thing. Drop the '--color-surface/--color-border' token language; use border-gray-200 / hover:shadow-lg utilities. |
| Adopt Fraunces display + Inter text editorial type pairing | cut | True | VERIFIED: no web fonts loaded anywhere (index.html only dns-prefetches googleapis; no @font-face/Fraunces in src). Adding two variable fonts is the biggest CWV risk in the whole set and muddies attribution of the v1 conversion test. Per the concept's own words, type pairing ships 'in a later isolated variant.' Agree — cut from FIRST test. Defer to a dedicated typography-only experiment where the LCP/CLS delta can be measured cleanly. Buildable, but wrong order and wrong bundle. |
| Turn the stat line into a designed trust strip with count-up | simplify | True | VERIFIED: L100-109 is throwaway gray stat text with a looping animate-pulse green dot (L102). The leaner win: restyle the existing stats into a bordered brand-soft strip with Lucide icons and KILL the looping pulse dot (motion-must-earn-its-place) — but SKIP the scroll count-up animation. Count-up is decoration that adds above-fold JS and a moving-number distraction near the headline. Static designed strip = 90% of the credibility lift, near-zero risk. Belongs in a later variant (not v1) to keep the conversion test clean. |
| Add an above-the-grid desktop 'Best DHM Supplement' product/CTA rail | keep | True | VERIFIED as the highest-value move: StickyMobileCTA.jsx is md:hidden (L76) and rendered globally in Layout.jsx (L470), so DESKTOP genuinely has NO affiliate path on this hub. This is net-new conversion surface where there is none — the only opportunity here that directly moves affiliate_link_click. Reuse the EXISTING plumbing the sticky bar uses (topProductsData[0] + buildAffiliateUrl) rather than inventing a product; wire trackAffiliateClick({experimentKey, variant}). Keep orange as the sole saturated accent, one product, stationary, no entrance loop. This is the conversion spine of the v1 test. |
| Restyle chip/search header AND paginate/virtualize the 100+ card grid | simplify | True | PARTIALLY verified: grid does render the full corpus in one DOM (L193-267, all filteredPosts). BUT images are loading='lazy' (L211), so the LCP/CWV liability is far smaller than claimed — lazy images already defer the cost. Split this: KEEP the cheap, clean part (restyle search input + filter chips to neutral-default/single-brand-active so chips stop adding green fill, L148-152) — fold that into the card re-tier work. CUT react-virtual / windowing from any near-term test: it's an engineering project, an SEO/crawl risk for internal links, and not a togglable aesthetic variant. Revisit pagination only if real CWV field data (not assumption) shows a problem — per CLAUDE.md, don't optimize perf before a measured problem exists. |
| One-shot scroll reveals for grid rows; kill looping pulse-dot + decorative keyframes | simplify | True | VERIFIED: animate-pulse dot is at L102; no shimmer/float keyframes are imported on this page (those live in calculator-enhancements.css, not used here) so that half of the proposal is a non-issue. Take the free win — remove the looping pulse dot (already covered under the trust-strip simplify). SKIP the staggered grid scroll reveals: stagger across 100+ cards is the wrong altitude (jank + LCP competition for marginal polish) and it muddies a conversion test. Keep the existing card hover lift and button press scale (already present and good). Not part of v1. |


**Red flags:**
- CLS/LCP: the new desktop product-rail image and the featured-hero image are above/near the fold — give both explicit width/height or aspect-ratio and keep the hero image as the intended LCP element (fetchpriority='high') so they don't shift layout or regress LCP.
- CONVERSION attribution: keep the v1 bundle to the four named aesthetic+CTA changes only. Adding fonts or count-up animation in the same variant makes a lift impossible to attribute and adds CWV noise — they were correctly deferred.
- FONT/CWV (deferred item): Fraunces+Inter would be the first web fonts on a zero-web-font site; the metric-override @font-face work is real and must NOT ride in v1. Test typography in its own variant with before/after LCP/CLS field data.
- SEO/crawl (deferred item): grid virtualization or 'load more' can drop ~160 internal article links from prerendered HTML, hurting internal linking (a stated SEO priority). Do not virtualize without confirming crawlable links + real CWV field evidence; lazy images (L211) already blunt the LCP cost.
- Z-INDEX: the new desktop product rail is in-flow (not fixed/sticky) — keep it that way. Do NOT introduce position:fixed/sticky or any transform/opacity wrapper on the page container that could create a stacking context conflicting with the global StickyMobileCTA (z-40) or the header scale (CLAUDE.md Patterns #14-#16).
- FLICKER: gate all above-the-fold swaps on useExperiment isLoading; render control markup until flags resolve so users don't see paper→green or hero pop-in.
- DEDUP: do NOT add a per-button onClick for the new rail beyond trackAffiliateClick — the global affiliate click listener already fires affiliate_link_click; double-wiring double-counts (per project memory on affiliate tracking).