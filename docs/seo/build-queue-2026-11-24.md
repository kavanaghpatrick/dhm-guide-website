# Build Queue — 2026-11-24

**Honest total: 46 new pages + 6 retrofits of existing posts. The gate does not license 500 pages.**

The owner asked for 500 minimum. The verified demand (5 hand-verified KEEPs + ~60 ADMIT rows across 5 prospected spaces, deduped against each other and against ~200 existing posts) collapses to 46 buildable URLs. Every prospector independently reported the same thing: each space supports 6–15 pages, not hundreds. The site has 127/203 pages at zero impressions and just exited a trust-related collapse — scaled thin content is the one move that could make that permanent. 46 well-built pages is the whole licensed queue; anything past it would be invented demand.

**Expected combined clicks at maturity (pos 5–10, realistic CTR on [EXT] volumes): ~900–1,400/mo**, midpoint ~1,100/mo. For scale: current human baseline is ~40 DAU, so this queue done well roughly doubles-to-triples organic traffic. Page 1 of GSC receipts exists only for activate-dhm [OWN ~205 impressions]; everything else is [EXT] DataForSEO volume, so divide optimism accordingly.

## Data-quality caveats (read before building)

- DataForSEO live SERPs were degraded on 2026-11-23/24 (every organic domain masked as google.com). These verdicts were scored on Labs historical snapshots or hand-read breadcrumbs — trustworthy, but **re-pull before building**: ibuprofen-and-alcohol (authority-free top-5 at 18K volume is unusual), alka-seltzer (snapshot stale, 2026-09-09), zyrtec (marginal — GoodRx/SingleCare strong).
- Fix `scripts/seo/prospector/gate.mjs` authorityWall to match on `website_name`/breadcrumb before trusting any future batch.
- The 2026-11-23 ADMITS batch (e.g. liver-enzyme heads) is unverified from masked data — NOT in this queue.
- Affiliate links for new products (Activate, Cheers, ZBiotics, etc.) must come from the owner — never invent them.
- electrolytes-before-or-after-drinking: coordinate with in-flight ws7-pedialyte work before building.
- Raw receipts: docs/seo/prospector-raws/2026-11-24/

## Ranking method

Expected clicks/mo × monetization fit (brand/review > comparison > ingredient/medication > situational > informational). Volumes are head + cluster where the page absorbs variants.

---

## Batch 1 — Money + biggest verified demand (~10 pages, ~500 est clicks/mo)

| # | Slug | Cluster vol/mo | Est clicks/mo | Brief |
|---|------|------|------|-------|
| 1 | cheers-restore-review | ~6,000 | ~120 | Standalone honest Cheers Restore review; H2s: does it work, side effects, reddit sentiment; links existing zbiotics-vs-cheers + double-wood-vs-cheers. Top money page. |
| 2 | zbiotics-review | ~4,000 | ~80 | "Does ZBiotics work" evidence review (covers do-zbiotics-work, reddit, legit, side-effects tails); links dhm-vs-zbiotics, zbiotics-vs-cheers. |
| 3 | do-hangover-patches-work | ~4,000 | ~70 | Ingredient-by-ingredient transdermal B-vitamin explainer; covers Bytox, best-patch tails. Honest verdict framing. |
| 4 | ibuprofen-and-alcohol | 18,100 | ~150 | Sibling of tylenol-and-alcohol / pepto-bismol-and-alcohol. GI-bleed + kidney risk, cited. **Re-pull SERP first** (verified KEEP but authority-free top-5 at this volume is odd; one prospector treated the head as killed — the hand-verified KEEP wins, pending re-pull). |
| 5 | dayquil-and-alcohol | 3,600 + 1,900 | ~80 | Medication page; H2 "does DayQuil have alcohol in it"; rehab-blog SERP, 0 authorities. |
| 6 | beer-before-liquor-myth | ~15,000 cluster | ~120 | Myth-check: 2019 Witten/Herdecke trial; absorbs "liquor before beer", "saying", "is mixing alcohol bad". All-forum SERP. AIO will take a share. |
| 7 | two-day-hangover | ~3,300 | ~60 | Why hangovers last/arrive late; absorbs "can a hangover last 2 days", "delayed hangover", "worse second day". Owns why/delayed angle; links (not duplicates) how-long-does-hangover-last. |
| 8 | creatine-and-alcohol | ~3,500 | ~60 | Fitness-audience page; absorbs "can you drink while taking creatine", "does alcohol affect creatine", timing tail. Links fitness-enthusiast post. |
| 9 | dramamine-and-alcohol | 2,400 | ~45 | Cruise/travel drinking angle; weakest med SERP. Links dhm-medication-interactions. |
| 10 | aleve-and-alcohol | 2,400 | ~40 | Naproxen ≠ ibuprofen (distinct from that kill-border — confirm at build); hangover-headache intent; links tylenol page. |

## Batch 2 — Medications + wine/headache science (~10 pages, ~290 est clicks/mo)

| # | Slug | Cluster vol/mo | Est clicks/mo | Brief |
|---|------|------|------|-------|
| 11 | zofran-and-alcohol | 2,400 | ~40 | Rx-only, careful sourcing; hangover-nausea + IV-drip intent; links hangover-nausea post. |
| 12 | zyrtec-and-alcohol | 3,600 | ~50 | Antihistamine + alcohol-flush angle; links asian-flush guide. Marginal — GoodRx/SingleCare strong; skip if re-pull shows them entrenched. |
| 13 | red-wine-headache | ~3,000 | ~50 | UC Davis quercetin finding + histamine/tannin/sulfite-myth; absorbs "why does wine give me a headache", "how to get rid of" H2. Check cannibalization vs wine-hangover-guide + alcohol-headache post. |
| 14 | ashwagandha-and-alcohol | ~1,900 | ~35 | Interaction-safety framing (both sedating); absorbs timing tails. Best supplement-fit in med space. |
| 15 | does-hair-of-the-dog-work | ~1,900 | ~35 | Myth check (KD 3, weakest SERP in its space); absorbs "does drinking a beer help a hangover". Frame as myth, not cure. |
| 16 | congeners-in-alcohol | 4,400 (shared) | ~40 | Definitional hub linking every drink page (tequila/vodka/whiskey/wine/champagne/seltzer). Part of volume is dictionary intent. |
| 17 | hangover-kit-ideas | ~1,800 | ~35 | Head: "hangover kit ideas" (KD 0). Strongest affiliate fit — DHM + electrolytes in the kit. Bachelorette angle as a section only (those heads are shopping-walled). |
| 18 | ginger-for-hangover | 1,900 | ~30 | Tea + shots + nausea (320); ginger-ale question as H2 only (its own SERP is walled). |
| 19 | vitamins-for-hangover | ~1,800 | ~30 | B + C + B1 in one page (vitamin-c head folds in; NIH at #6 there). Keep distinct from queued "b vitamins for alcohol recovery" — only one becomes a page. |
| 20 | sulfites-in-wine-headaches | ~2,100 | ~30 | "What are sulfites in wine" + headache-myth evidence ("do sulfites cause headaches"). All-retailer SERP. |

## Batch 3 — Ingredients + hangover-science (~10 pages, ~190 est clicks/mo)

| # | Slug | Cluster vol/mo | Est clicks/mo | Brief |
|---|------|------|------|-------|
| 21 | least-hangover-alcohol-ranked | ~2,500 + 300 + 480 | ~45 | Congener-ranked drink list w/ DHM CTA; absorbs best-alcohol-no-hangover, worst-hangover variants, AND dark-vs-light liquor as H2s. One URL, three source rows. |
| 22 | more-labs-morning-recovery-review | ~900 | ~20 | DHM product review; covers does-it-work, ingredients, side effects. |
| 23 | why-do-i-get-hangovers-so-easily | ~800 | ~15 | Genetics/ALDH2, congeners, sleep, age; absorbs "after one drink", "never get hangovers" H2s. |
| 24 | hangover-probiotics | ~700 | ~12 | "Do hangover probiotics work" explainer (ZBiotics, Myrkl, VITA-PB2); links not duplicates the vs pages. |
| 25 | liverite-liver-aid-review | ~700 | ~15 | Liver-support brand review; fits liver cluster. |
| 26 | excedrin-and-alcohol | 720 | ~15 | Acetaminophen+aspirin+caffeine combo; links tylenol-and-alcohol. |
| 27 | what-to-take-before-drinking | ~800 (merged KEEP+ADMIT) | ~15 | THE stack page: absorbs "supplements to take before drinking" (KEEP) + both variant heads; links hangover-supplements guide + how-to-prevent-a-hangover. |
| 28 | why-hangovers-get-worse-with-age | ~600 | ~12 | Absorbs "in your 30s". Distinct intent from dhm-adults-over-50 (safety page). |
| 29 | glutathione-for-hangover | ~800 | ~12 | Evidence-led page vs all-vendor SERP; covers liposomal tail. |
| 30 | electrolytes-before-or-after-drinking | ~600 | ~12 | Timing page. **Coordinate with ws7-pedialyte first** to avoid cannibalizing pedialyte-vs-gatorade-hangover. |

## Batch 4 — Smaller brands + drink pages (~10 pages, ~110 est clicks/mo)

| # | Slug | Cluster vol/mo | Est clicks/mo | Brief |
|---|------|------|------|-------|
| 31 | coconut-water-for-hangover | ~1,000–1,500 real | ~20 | Ingredient-specific (not a killed cure head); 18.1K figure is variant-inflated — write to the 1K reality. Links best-hangover-recovery-drinks. |
| 32 | h-proof-review | ~500 | ~12 | Brand review; covers ingredients/side-effects/does-it-work tails. |
| 33 | afterdrink-review | ~400 | ~10 | Brand review; "afterdrink pills" head; nav head mostly navigational. |
| 34 | korean-japanese-hangover-pills | ~400 | ~8 | One page both heads; ties to asian-flush + dhm-japanese-raisin-tree. Check overlap with korean-pear page (below). |
| 35 | how-to-speed-up-alcohol-metabolism | ~130 + tails | ~5 | Merges BOTH metabolism KEEPs: honest "you mostly can't" + what helps + evidence-hedged DHM enzyme research; absorbs slow-metabolism tails; links pharmacokinetics post. |
| 36 | alka-seltzer-and-alcohol | 320 | ~7 | Literally sold as hangover remedy. **Re-pull SERP first (stale snapshot).** |
| 37 | purple-tree-review | ~280 | ~8 | Junkiest SERP in the brand set; small. |
| 38 | korean-pear-juice-hangover | ~260 + tails | ~6 | CSIRO Asian pear study anchor; can host the Korean-remedies angle (drink/jelly heads). |
| 39 | beer-hangover | ~300 | ~6 | First beer-hangover page (existing beer posts are culture pieces); absorbs best-beer-no-hangover + NA-beer tails. |
| 40 | activate-dhm | [OWN: 205 impr, pos 18] | ~3 | Honest small-brand review; folds "activate dhm reviews". **Affiliate link must come from owner.** Only page with our own GSC receipts. |

## Batch 5 — Long tail + completions (~6 pages, ~25 est clicks/mo)

| # | Slug | Cluster vol/mo | Est clicks/mo | Brief |
|---|------|------|------|-------|
| 41 | l-cysteine-for-hangover | 210 | ~5 | Has the one real human trial (2020 Alcohol & Alcoholism). Alternative: fold as H2 into nac-vs-dhm retrofit — decide at build. |
| 42 | gin-hangover | ~120 | ~4 | Completes spirits set beside vodka/whiskey/tequila. |
| 43 | soju-hangover | ~140 | ~4 | Small; single page. |
| 44 | sake-hangover | ~140 | ~3 | Small; single page. |
| 45 | no-days-wasted-vs-zbiotics | <20 | ~2 | Cheap extension of existing NDW vs series only. |
| 46 | flyby-vs-zbiotics | <20 | ~2 | Cheap extension of existing Flyby vs series only. |
| — | drinkwel-review | 110 | ~3 | OPTIONAL — semi-dormant brand, junk-reseller SERP. Build only if batch has slack. |

## Retrofits (existing posts — no new URLs, do alongside batches 1–2)

| Target post | Action | Demand |
|---|---|---|
| hangxiety-complete-guide-2026 | Refresh/strengthen — largest head in its space (18,100 + 2,400), SERP winnable | ~20K |
| nac-vs-dhm-which-antioxidant-better | Retitle/add "NAC for hangover" sections (590) — do NOT build a new URL | 590 |
| dhm-vs-milk-thistle | Add timing H2 ("before or after drinking", ~250 cluster) | ~250 |
| hangover-career-impact | Retarget to "hangover at work" survive-today intent (~700) | ~700 |
| altitude-alcohol / business-travel | Add "drinking on a plane" H2 (~300) | ~300 |
| tequila/vodka/whiskey/wine posts | Extend with mezcal, white wine, "best wine for no hangover" sections | small |

## Recommended pace

**10 pages/week, one batch at a time, with a day-21 GSC read on each batch before starting the one after next.** The site just exited a trust penalty; publishing velocity is itself a signal. Concretely:

- Week 1: Batch 1 + hangxiety refresh. Week 2: Batch 2 + remaining retrofits. Then hold until Batch 1's day-21 read.
- Gate to continue: new pages getting impressions within 21 days and no sitewide impression decline. If Batch 1 pages sit at zero impressions at day 21, STOP and diagnose — do not publish Batch 3.
- Full queue ships in ~6–8 weeks, not one drop. 46 pages at once onto a just-recovered domain with 127 zero-impression pages reads as scaled content abuse to Google.
- Every page: real citations, medical-safety care on drug pages (ibuprofen GI/kidney, Zofran Rx-only), honest verdicts on brand reviews, interlinked to the named existing posts, affiliate links only from the owner.
- The 500-page target would require inventing ~454 pages with no gated demand. The correct number is 46 + 6 retrofits; re-run the prospector on new spaces (untested med long-tails: Advil PM, Tylenol PM, Theraflu, Robitussin, fluconazole, etc.) after the gate.mjs domain-masking fix if more inventory is wanted.
