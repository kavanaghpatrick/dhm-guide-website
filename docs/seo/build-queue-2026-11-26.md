# Ranked Build Queue — 2026-11-26 prospecting round

**Licensed by the SERP gate: 37 pages (41 with the optional micro-tail) + 8 retrofits. Not 1,000.** See Caveats.

Source: 7 prospected spaces, live/historical SERPs pulled 2026-11-26. Receipts in `docs/seo/prospector-raws/2026-11-26/`. All volumes are DataForSEO US family volumes (head + merged variants); they over-count close variants, so discount ~30-40% when projecting clicks.

Ranking = expected clicks/mo x monetization fit (brand/comparison > ingredient/remedy > drink > symptom > explainer).

---

## Dedupe decisions (cross-space + vs existing posts)

| Consolidated page | Absorbs | Why |
|---|---|---|
| `alcohol-face-bloating` | puffy-face-after-drinking (1,070), bloating-after-drinking (480), alcohol bloating face (3,600), alcohol bloating (1,900) | Two spaces admitted the same bloat topic; one face+stomach page beats three thin ones. Dedupe vs `alcohol-skin-health` (aging-focused) and `alcohol-digestive-health` (GI general) — no conflict. |
| `diarrhea-after-drinking` | diarrhea after drinking liquor (2,400, from drink space) | Same symptom, liquor variant is an H2. |
| `drunk-spins` | dizzy day after drinking (320) | Acute spins + next-day dizziness, one inner-ear explainer. |
| `hangover-shakes` | how to get rid of the shakes after drinking (720) | Note: the bare "hangover shakes" head (1.3K) is authority-walled per the mechanism space — target the "shaking after drinking" phrasings only. |
| `heart-racing-after-drinking` | racing heart after drinking (720) | One holiday-heart page. |
| `body-aches-after-drinking` | legs ache (880), joint pain (590), muscle aches (390) | One consolidated page beats four thin ones. |
| `cant-sleep-after-drinking` | why do i wake up early after drinking (590) | Dedupe vs `alcohol-and-rem-sleep` + sleep-optimization posts (science/optimization intent, not this symptom) — builder's call confirmed as new page. |
| `does-exercise-help-a-hangover` | sauna (590), sweat it out (320), cold shower (320), hangover workout (~590) | One "sweat it out" myth page. |
| `best-soups-for-hangover` | pho (480), ramen (390), bone broth (390), chicken noodle (590), menudo | One soups page; menudo deduped vs the existing Mexican-remedies post. |
| `cough-medicine-and-alcohol` | robitussin (720), mucinex dm (880) | Sibling of existing `dayquil-and-alcohol`. |
| `melatonin-and-alcohol` | — (zzzquil kept separate but cross-linked) | Sleep-aid cluster. |
| `myrkl-review` | myrkl review (50), zbiotics vs myrkl (20), myrkl vs cheers (20) | One review page with comparison sections. |
| `blowfish-hangover-review` | does blowfish hangover work (50), ingredients/pills tails (~280) | One review page. |
| `drinking-on-an-empty-stomach` | what to do after (210), is it bad (480), vs full (210) | Dedupe vs `what-to-eat-before-drinking` (food choice, different head). |
| `zbiotics-vs-morning-recovery` | morning recovery vs zbiotics (reverse, 40) | Both directions, one page. |
| `zbiotics-alternatives` | party smart vs zbiotics (30), day guard vs zbiotics (0), myrkl vs zbiotics overflow | One alternatives page, not three near-zero pages. |
| `mezcal-hangover` | does mezcal give you a hangover (50), vs-tequila tails | ~150/mo cluster, no existing coverage. |
| `rum-hangover` | does rum give you a hangover (40), rum vs vodka (20) | `rum-health-analysis-...` exists but doesn't target hangover intent; new congeners page (or retrofit it — builder's call). |

**Do NOT build (already covered — retrofit instead):**
- cleanest alcohol (1,900) → retrofit `least-hangover-alcohol-ranked` (add to title/H1/FAQ)
- white claw hangover (50) → `hard-seltzer-hangover-...` (add "White Claw" to title/H2)
- bourbon hangover (40) → `whiskey-hangover-...` already keyworded
- gin vs vodka hangover (40) → H2/FAQ on `gin-hangover` / `vodka-hangover-...`
- natural wine hangover (20) → H2 on `sulfites-in-wine-headaches` / `wine-hangover-guide`
- tomato juice for hangover (140) → FAQ on `does-hair-of-the-dog-work`
- apple cider vinegar (90) → FAQ, not a page
- what to do after drinking on empty stomach → section of the empty-stomach page

**Deferred, not licensed:** best fast food (480) + spicy food (210) — parked until the MIXED "best food for hangover" cluster decision; antibiotics-and-alcohol (18.1K) — likely data artifact, siblings all walled; moonshine (20) — edges into poisoning content; cider headache (10) — junk-tiny.

---

## Ranked queue

Est. clicks/mo = family volume x ~35% real-demand discount x ~3% blended pos 5-10 CTR (AI Overviews present on nearly every SERP, so this is deliberately conservative).

### Batch 1 (best 10 — build first)

| # | Slug | Family vol/mo | Fit | Est. clicks/mo | Brief |
|---|---|---|---|---|---|
| 1 | `eggs-for-hangover` | 12,100 | remedy | ~240 | Cysteine mechanism page; hard-link to `l-cysteine-for-hangover` and DHM money pages. Cleanest opportunity found. |
| 2 | `melatonin-and-alcohol` | 6,600 | medication | ~130 | "Sleep after a night out" safety + timing; cross-link zzzquil page and REM-sleep post. |
| 3 | `alcohol-face-bloating` | ~7,000 | symptom | ~130 | One page: morning-after puffy face + stomach bloat (sodium/electrolytes angle); social-drinker tone, not rehab before/after. |
| 4 | `blowfish-hangover-review` | ~3,200 | brand review | ~70 | Honest review (aspirin 1000mg + caffeine); lean on aspirin-and-alcohol safety. NO affiliate link yet — owner must supply. |
| 5 | `diarrhea-after-drinking` | ~6,000 | symptom | ~110 | Gut-motility explainer incl. liquor variant; "see a doctor" box (blood, >2 days). |
| 6 | `does-exercise-help-a-hangover` | ~3,100 | remedy/myth | ~60 | One "sweat it out" myth page: exercise, sauna, cold shower; dehydration safety. |
| 7 | `cough-medicine-and-alcohol` | ~2,900 | medication | ~55 | Drinking-with-a-cold page absorbing robitussin + mucinex dm; sibling of `dayquil-and-alcohol`. |
| 8 | `stomach-pain-after-drinking` | 3,600 | symptom | ~65 | Gastritis/irritation page; strong "see a doctor" section; cross-link hangover-nausea post. |
| 9 | `advil-or-tylenol-for-hangover` | 1,900 | comparison | ~40 | Head-to-head hub linking existing ibuprofen + tylenol safety pages; watch cannibalization. |
| 10 | `aspirin-and-alcohol` | 2,400 | medication | ~45 | Safety sibling of ibuprofen/tylenol/aleve pages; feeds the Blowfish review. |

### Batch 2 (11-20)

| # | Slug | Family vol/mo | Fit | Est. clicks/mo | Brief |
|---|---|---|---|---|---|
| 11 | `drinking-on-an-empty-stomach` | ~2,000 | explainer (monetizes) | ~40 | BAC/absorption curve; feeds `what-to-take-before-drinking`. Re-pull (stale snapshot). |
| 12 | `body-aches-after-drinking` | ~2,900 | symptom | ~50 | One page: legs/joints/muscles; dehydration + inflammation + gout flag in doctor box. |
| 13 | `do-hangover-pills-actually-work` | family 6,600 | category hub | ~45 | Cross-category evidence page (DHM, Myrkl, Blowfish, charcoal, Korean pills); must LINK to existing reviews, not repeat them. |
| 14 | `best-soups-for-hangover` | ~1,900 | remedy | ~35 | Pho/ramen/bone broth/chicken noodle/menudo; dedupe menudo vs Mexican-remedies post. |
| 15 | `hangover-shakes` | ~2,600 | symptom | ~45 | "Hangover shakes vs withdrawal tremors"; stay firmly on next-morning shakes; dependence-warning section mandatory. |
| 16 | `heart-racing-after-drinking` | ~2,300 | symptom | ~40 | Holiday heart / AFib risk; firm "see a doctor if" box (chest pain, fainting, >few hours). |
| 17 | `myrkl-review` | ~1,000 | brand review | ~25 | Review + vs-ZBiotics and vs-Cheers sections. NO affiliate link yet. |
| 18 | `heartburn-after-drinking` | ~1,700 | symptom | ~30 | Worst drinks + antacid timing; link tums page (#19) once live. |
| 19 | `tums-and-alcohol` | 1,300 | medication | ~25 | Antacid-for-hangover-stomach safety page. |
| 20 | `cant-sleep-after-drinking` | ~1,300 | symptom | ~25 | 3am wake-up / rebound arousal; cross-link REM post, don't duplicate it. |

### Batch 3 (21-30)

| # | Slug | Family vol/mo | Fit | Est. clicks/mo | Brief |
|---|---|---|---|---|---|
| 21 | `drunk-spins` | ~1,100 | symptom | ~20 | Inner-ear mechanism; spins while drunk + next-day dizziness. Re-pull (stale). |
| 22 | `zzzquil-and-alcohol` | 720 | medication | ~15 | Sleep-aid-after-drinking; cluster with melatonin page. |
| 23 | `tudca-vs-milk-thistle` | 480 | comparison | ~12 | Liver-support head-to-head; absorb "tudca vs nac vs milk thistle" tails; link DHM-vs-milk-thistle. |
| 24 | `benadryl-for-hangover` | 590 | medication | ~12 | Absorbs the misuse-skewed "benadryl and alcohol" head; safety-first framing. |
| 25 | `why-does-alcohol-make-you-hungry` | ~1,000 | explainer | ~18 | Drunk munchies: AgRP neurons + blood sugar. |
| 26 | `night-sweats-after-drinking` | 720 | symptom | ~12 | Lowest-confidence ADMITS; must separate one-night sweats from withdrawal signs. |
| 27 | `himalaya-partysmart-review` | ~360 | brand review | ~10 | Ayurvedic product; SERP is all eBay. NO affiliate link yet. |
| 28 | `wine-drunk-vs-beer-drunk` | 320 | myth/comparison | ~8 | Pairs with beer-before-liquor-myth. Re-pull (stale). |
| 29 | `electrolyte-drinks-for-hangover-compared` | ~200 | comparison | ~6 | ONE page: Liquid IV / Pedialyte / Drip Drop / LMNT / Electrolit. MUST coordinate with ws7-pedialyte branch + `pedialyte-vs-gatorade-hangover`. |
| 30 | `alcohol-and-hrv` | ~310 | explainer | ~6 | Wearable-tracker audience; check `wearable-technology-and-alcohol` post first. Re-pull (stale). |

### Batch 4 (31-37 + optional micro-tail; build only if Batches 1-3 earn their keep)

| # | Slug | Family vol/mo | Fit | Est. clicks/mo | Brief |
|---|---|---|---|---|---|
| 31 | `mezcal-hangover` | ~150 | drink | ~4 | Best new drink URL; folds "does mezcal give you a hangover"; tequila post only mentions mezcal in passing. |
| 32 | `rum-hangover` | ~120 | drink | ~3 | Dark-rum congeners; OR retrofit `rum-health-analysis-...` — builder's call. |
| 33 | `brain-fog-after-drinking` | 320 | symptom | ~6 | Or fold as a section into shakes/body-aches; low priority. |
| 34 | `nac-vs-milk-thistle` | 90 | comparison | ~3 | Interlink nac-vs-dhm and dhm-vs-milk-thistle; not a dupe of either. |
| 35 | `zbiotics-vs-morning-recovery` | ~90 | comparison | ~3 | Both reviews exist; no head-to-head. 238 impressions in own GSC data. |
| 36 | `drinkwel-review` | ~120 | brand review | ~3 | Reseller-junk SERP. NO affiliate link yet. |
| 37 | `zbiotics-alternatives` | ~50 | comparison hub | ~2 | PartySmart / Myrkl / Day Guard in one page. |
| opt | `espresso-martini-hangover` (10), `absinthe-hangover` (20), `jagermeister-hangover` (30), `mead-hangover` (20) | ~80 | drink | ~2 | Micro-demand, genuinely useful angles. Only as filler work. |

### Retrofits (8, do alongside Batch 1-2 — cheaper than new pages)

1. `least-hangover-alcohol-ranked` ← "cleanest alcohol" (1,900) in title/H1/FAQ — highest-value single retrofit in the round
2. `hard-seltzer-hangover-...` ← "White Claw" in title/H2 (50)
3. `gin-hangover` + `vodka-hangover-...` ← gin-vs-vodka H2/FAQ (40)
4. `sulfites-in-wine-headaches` or `wine-hangover-guide` ← natural wine H2 (20)
5. `does-hair-of-the-dog-work` ← tomato juice / Bloody Mary FAQ (140)
6. `hangover-nausea-...` ← "does throwing up help" / "how to stop throwing up" sections
7. `hangxiety-...` ← depression-after-drinking section
8. `complete-guide-asian-flush` ← rash angle; `alcohol-eye-health` ← red eyes

---

## Caveats (read before dispatching builders)

1. **Licensed count vs the ask: the owner asked for 1,000 pages minimum. The SERP gate licenses 37 (max 41 with micro-tail), plus 8 retrofits.** The seven space summaries independently converged on single digits per space (5-8, 8-10, 3-5, 2-6, 6-8, <10, 4-5). Standing policy, told to the owner twice, is that the gate decides the number. Shipping ~960 unlicensed pages into authority-walled or zero-demand SERPs is scaled thin content — the one thing flagged as able to kill the domain permanently, three weeks after a trust-related ranking collapse. This queue is the honest maximum.
2. **45 pages shipped 2026-11-24 have zero performance data until the day-21 read (~2026-12-15).** Recommend shipping at most Batch 1 + retrofits before that read, and gating Batches 2-4 on it.
3. **The DataForSEO US desktop feed was degraded on pull day** (tiny result counts, foreign-language results, masked google.com domains, top-5 instability). Every ADMITS should be re-pulled under the 2-run rule on a clean day before its batch is built. Explicitly stale snapshots: empty-stomach, drunk-spins, wine-vs-beer, HRV, cold-shower (2025-12-29).
4. **YMYL guardrails:** every symptom page needs a "when to see a doctor" box; shakes and night-sweats pages must clearly separate morning-after symptoms from dependence/withdrawal warning signs; moonshine was dropped on poisoning-content grounds.
5. **No affiliate coverage** for Blowfish, Myrkl, PartySmart, Drinkwel (none in topProducts.json). Owner must supply links or accept unlinked reviews; new-product affiliate links must come from the owner (standing rule).
6. **Coordination:** electrolyte comparison page (#29) must not collide with the in-flight ws7-pedialyte branch; advil-or-tylenol (#9) must not cannibalize the existing ibuprofen/tylenol safety pages; "hangover shakes" bare head is walled — target "shaking after drinking" phrasings.
7. **Click math:** ~73K/mo nominal family volume across the queue; after a 30-40% close-variant discount and ~3% blended pos 5-10 CTR under near-universal AI Overviews, realistic maturity is **~900-1,600 clicks/mo total (midpoint ~1,200)**, reached 3-6 months post-index. Volumes are estimates, not promises.
8. **Recovery work beats new pages for money terms:** dhmguide is absent from the top-10 of several weak branded-review SERPs it already has posts for (survivorlife/enjoyupside outrank us). That's existing-page recovery work, out of scope for this queue but likely higher ROI than Batch 3-4.
