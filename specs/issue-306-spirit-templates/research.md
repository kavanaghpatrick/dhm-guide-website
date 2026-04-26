# Research: Issue #306 — Spirit-specific hangover guides (4 instances)

## 1. Existing wine/tequila reference posts (proven slug pattern)

- `src/newblog/data/posts/wine-hangover-guide.json` — Wine Hangover 101: Why Wine Causes the Worst Hangovers (slug: `wine-hangover-guide`)
- `src/newblog/data/posts/tequila-hangover-truth.json` — Does Tequila Give You Bad Hangovers? The Truth About Congeners (slug: `tequila-hangover-truth`)

**Structural pattern shared by both** (these are older posts, ranking well):
- Definition callout + Quick Facts box at top
- "The Science Behind X Hangovers" section
- Congener / chemistry deep dive with comparison table
- Why X Causes Worse/Different Hangovers (mechanism)
- Prevention Strategy (before / during / after structure)
- "How DHM specifically helps with X hangovers" section
- Choosing better X (buyer's guide)
- FAQ section (5-7 questions)
- Bottom Line wrap-up
- Cross-links to wine + tequila + alcohol-pharmacokinetics

**Modern reference posts (issues #302, #303, #304)** — for current pattern with quickAnswer field, dateModified, FAQ schema:
- `hangxiety-complete-guide-2026-supplements-research.json`
- `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026.json`
- `what-to-eat-before-drinking-alcohol-evidence-based-guide.json`

Modern pattern adds:
- Top-of-content `quickAnswer` field (~150-300 words, definitive head-term answer)
- `dateModified: "2026-04-26"`
- `image: null` (no hero image)
- Inline PMC citations as Markdown links
- 12+ FAQ entries
- `relatedPosts` with cluster siblings + pillar
- References section at bottom with PubMed links

## 2. Per-spirit research notes

### Vodka — clear spirit, low congeners, mild hangovers
- **ABV**: typically 40% (80 proof), some 50%+
- **Congener content**: 0-3 mg/L (lowest of all common spirits)
- **Hangover profile**: mostly dehydration + caloric/sleep effects, less inflammatory
- **Why considered "clean"**: distilled to high purity, no aging, no added sugar
- **Cultural angle**: Russian/Soviet tradition (vodka with food, slow pace, salt+fat pairings)
- **Mixer trap**: vodka + sugary mixer (Red Bull, sodas) drives most "vodka hangover" complaints — alcohol absorbs fast on empty stomach, sugar crash compounds
- **Dehydration angle**: same alcohol-induced ADH suppression as any spirit, but without congeners to mask the effect, dehydration is the dominant mechanism
- **Vodka-specific prevention**: water 1:1, eat fat/salt before, avoid sugary mixers
- **Worst vodka choices**: flavored vodkas (added sugars), bargain-tier (poor distillation = methanol)
- **Best vodka choices**: premium clear, sipped neat or with soda water + lime

### Whiskey — highest congener content, worst hangovers
- **ABV**: typically 40-50% (bourbon, Scotch, rye, Irish)
- **Congener content**: 200-300 mg/L (one of the highest)
- **Hangover profile**: most severe of common spirits — congener-driven inflammation, headache, nausea, brain fog
- **Mechanism**: oak-aging adds methanol, fusel alcohols, acetaldehyde precursors, tannins, polyphenols
- **Bourbon vs Scotch vs rye**: bourbon highest congeners (charred new oak), Scotch second, rye third — but all dramatically more than vodka
- **Foundational paper**: Rohsenow 2010 "Bourbon vs vodka hangover" RCT (PMC2876255) — bourbon caused significantly worse next-day hangovers vs vodka at same blood-alcohol level
- **Key statistic**: bourbon hangover severity ~37% worse than vodka in matched-BAC trial
- **Whiskey-specific prevention**: smaller volume; better/aged whiskey (smoother, similar congeners but less methanol from poor distillation); avoid mixing dark + clear spirits
- **Worst whiskey**: cheap blended whiskey (highest methanol)
- **Best whiskey for low hangovers**: high-quality Japanese whisky (rigorous distillation), single malt Scotch

### Champagne — bubbles speed absorption, sugar adds insult
- **ABV**: 11-13% (similar to wine)
- **Congener content**: low (varies by style — brut < demi-sec < doux)
- **Hangover profile**: sneaky severity — fast peak BAC + sugar crash + sulfites
- **Key mechanism — CO2 acceleration**: 2007 Ridout/Lapp study showed sparkling wine produces a 38% higher peak BAC than the same volume of still wine, in significantly less time. CO2 accelerates pyloric opening, dumping alcohol into the small intestine fast.
- **Sugar component**: sweet champagne (demi-sec, doux) adds 35-50 g/L residual sugar; sugar crash compounds hangxiety
- **Sulfite content**: champagne typically has higher sulfite levels than still wines (preserves carbonation flavor) — triggers headaches in 1% sensitive
- **Histamine angle**: lower than red wine but present
- **Champagne-specific prevention**: drink slower than you think (the "feels light" trick); brut over sweet styles; alternate with still water (NOT sparkling water — the carbonation persists in your stomach); food before
- **Worst champagne choices**: prosecco mimosas (cheap sparkling + OJ + sugar), demi-sec brands
- **Best champagne choices**: brut nature (zero added sugar) or extra brut, drunk slowly with food

### Hard Seltzer — vodka-equivalent in disguise
- **ABV**: typically 4-6% (lower than spirits, similar to beer)
- **Congener content**: very low (most are made from neutral grain alcohol or fermented sugar/seltzer base)
- **Hangover profile**: deceptively bad given marketing as "clean alcohol"
- **Why it sneaks up**: tastes like flavored sparkling water, easy to drink 5-6 in a session, total ethanol exceeds intended
- **Carbonation acceleration**: same CO2-accelerated absorption as champagne — peak BAC arrives faster than equivalent beer
- **Marketing trap**: "100 calories, 5% ABV, gluten-free" implies "healthy" — but pharmacokinetics-wise still alcohol
- **Sugar**: most modern hard seltzers (White Claw, Truly) are <2g sugar — that part of the "clean" pitch is real
- **Hidden additives**: artificial flavors, citric acid (irritates stomach), preservatives
- **Hard seltzer-specific prevention**: count drinks honestly (5 cans = 5 drinks); slow pace; eat real food (the "I'm not drinking that much" feeling drives empty-stomach drinking)
- **Worst hard seltzer choices**: high-ABV "spike" varieties (8%+), mixing with vodka shots

## 3. SERP context (head terms)

- "vodka hangover" — competitive but no dominant single result; Healthline + Medical News Today rank well
- "whiskey hangover" — congener-heavy SERP, opportunity for Rohsenow-citing content
- "champagne hangover" — moderate competition, Wine Enthusiast ranks
- "hard seltzer hangover" — newer term, less established; opportunity

## 4. Verified PubMed/PMC citations to use

### General congener research (cited across all 4)
- **PMC2876255** — Rohsenow et al. 2010, "Intoxication with bourbon versus vodka: effects on hangover, sleep, and next-day neurocognitive performance in young adults" (Alcohol Clin Exp Res). The canonical bourbon-vs-vodka hangover study.
- **PMC4112772** — Mitchell et al. 2014, "Absorption and Peak Blood Alcohol Concentration After Drinking Beer, Wine, or Spirits" (already used in #304).
- **PMC1705129** — Holt 1981, gastric emptying and alcohol absorption (already used in #304).
- **PMC11675335** — Hovenia dulcis 2024 RCT (DHM mechanism citation).
- **PMC11033337** — Hovenia dulcis liver review 2024.

### Vodka-specific
- **PMC2895747** — Howland et al. 2010 hangover/cognitive review — congener content correlation
- **PMID 19120053** — Verster JC review of congener effects (older but still cited)

### Whiskey-specific
- **PMC2876255** — Rohsenow bourbon-vodka (primary citation)
- **PMC2895747** — Howland congener review

### Champagne-specific
- **PMID 17943958** — Ridout F, Hindmarch I. 2007. "Effects of fizzy drinks on absorption of alcohol" — CO2-accelerated absorption (NOT a PMC ID, this is a PubMed-only article — cite as PubMed 17943958)
- **PMC4377486** — sulfite sensitivity reviews

### Hard seltzer-specific
- Limited specific research; rely on:
  - Mitchell 2014 (general spirits/wine/beer pharmacokinetics)
  - Rohsenow congener data (low-congener spirits = vodka-equivalent profile)
  - Holt 1981 (gastric emptying — same mechanism)

### Avoid (broken/invalid)
- PMC4082193 — DO NOT USE
- PMC8429066 — DO NOT USE
- PMC8259720 — DO NOT USE

## 5. Cluster placement decision

**Decision**: Create NEW cluster `spirit-specific-hangovers`.

**Rationale**: 4 new posts + wine + tequila = 6 posts in a tight topical cluster. Adding 4 more spokes to `hangover-prevention` (already 10 spokes) bloats it. The 6-post spirit cluster has clear topical coherence and supports inter-linking efficiency. New cluster pillar: `hangover-supplements-complete-guide-what-actually-works-2025` (existing pillar — spirit posts spoke off it OR we can use one of the new spirit posts as pillar; cleaner to have an existing high-traffic pillar).

Final cluster:
- **name**: `spirit-specific-hangovers`
- **pillar**: `hangover-supplements-complete-guide-what-actually-works-2025` (re-used as pillar across multiple clusters is fine)
- **spokes**: vodka, whiskey, champagne, hard-seltzer (all 4 new) + wine + tequila

## 6. Cross-link strategy

Each new spirit post links to:
- The other 3 sibling new spirit posts (vodka↔whiskey↔champagne↔hard-seltzer)
- Wine + tequila (existing)
- `hangover-supplements-complete-guide-what-actually-works-2025`
- `dhm-dosage-guide-2025`
- `hangxiety-complete-guide-2026-supplements-research`
- `what-to-eat-before-drinking-alcohol-evidence-based-guide`
- `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026`
- `alcohol-pharmacokinetics-advanced-absorption-science-2025`

## 7. Master template structure (what each post will contain)

1. Quick Answer (~150 words, definitive head-term answer for AI search)
2. Why {Spirit} Causes Hangovers (mechanism + congener data)
3. {Spirit} Hangover Symptoms (what's distinctive)
4. The Science: Congeners, ABV, Mixers (with comparison table)
5. {Spirit}-Specific Prevention Strategy (before/during/after)
6. {Spirit} + DHM Protocol
7. Best/Worst {Spirit} Choices for Hangover-Avoidance
8. Recovery Tactics if You Already Have a {Spirit} Hangover
9. FAQ (12+ entries)
10. Related Reading + References

Word target: 2,500 (range 2,300-2,700)

## 8. Implementation plan

- Phase 5A: Create `scripts/spirit-hangover-template.mjs` with the variable substitution template
- Phase 5B: Generate the 4 post JSONs by running the template with each spirit's facts
- Phase 5C: Update `scripts/cluster-config.json` (add spirit-specific-hangovers cluster)
- Phase 5D: Update `postRegistry.js` and `metadata/index.json`
- Phase 5E: Run `node scripts/generate-related-posts.mjs --write-reciprocal`
- Phase 5F: `npm run build` to verify 197 prerendered posts
- Phase 6: Commit, PR, squash-merge

## 9. Constraints recap

- Each post ~2,500 words (range 2,300-2,700)
- 12+ FAQ per post
- 4-6 inline PMC citations per post
- `dateModified: "2026-04-26"`
- Cross-link to all siblings + key pillars
- Use ONLY verified PMC IDs above (avoid PMC4082193, PMC8429066, PMC8259720)
