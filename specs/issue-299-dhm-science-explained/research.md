# Research — Issue #299: Expand dhm-science-explained

## Reality check vs spec
- Spec says "47 words" — actual current word count is **1,435 words**.
- Page is still THIN by 2026 standards (need 2,000+ for striking-distance ranking on "what is DHM").
- Existing post is missing: `quickAnswer`, `faq[]`, primary-source PubMed inline citations (currently 0), and a "What Is DHM?"-led title.

## Verified PMC sources (each fetched and confirmed to contain the claim made)

| PMC ID | Citation | What it supports |
|---|---|---|
| PMC3292407 | Shen et al. 2012, J Neurosci. "Dihydromyricetin As a Novel Anti-Alcohol Intoxication Medication" | DHM as GABA-A modulator; 1 mg/kg IP in rats; ~96% reduction in loss-of-righting-reflex; flumazenil blocks effect → benzodiazepine binding site; IC50 4.36 µM |
| PMC7211127 | Silva et al. 2020, Alcohol Clin Exp Res. "DHM Protects the Liver via Changes in Lipid Metabolism and Enhanced Ethanol Metabolism" | DHM at 5 & 10 mg/kg increases ADH/ALDH expression; reduces ethanol & acetaldehyde; AMPK activation; reduces inflammation/triglycerides |
| PMC7902334 | Silva et al. 2020, Alcohol. "DHM Improves Mitochondrial Biogenesis ... AMPK/Sirt-1/PGC-1α" | DHM 5 mg/kg IP 5x/week × 8 wk; restored AMPK/Sirt1/Sirt3; 20% mtDNA increase; ATP 2.43 → 3.898 nmol/mg |
| PMC10481966 | Janilkarn-Urena et al. 2023, Front Nutr. "DHM supplementation improves ethanol-induced lipid accumulation and inflammation" | DHM ↓ TNF-α/IL-6/IL-17; ↑ IL-27; restored mitochondrial complex II; lipophagy via p62/LC3B |
| PMC7914479 | Sferrazza et al. 2021, Molecules. "Hovenia dulcis Thunberg: Phytochemistry, Pharmacology, Toxicology" | DHM history (isolated 1997); ↑ ADH/ALDH; reduces AST/ALT in CCl4/alcohol/APAP/LPS models; antioxidant via Nrf2 |
| PMC11033337 | He et al. 2024, Front Pharmacol. "Hovenia dulcis: a Chinese medicine ... in alcohol-associated liver disease" | Mechanism review: ADH/ALDH up-regulation, Nrf2 pathway, suppression of LPS/TLR4/NF-κB, AMPK/PPAR for lipid mgmt |
| PMC8603706 | Skotnicová et al. 2020, Physiol Res. "Does Dihydromyricetin Impact on Alcohol Metabolism" | **Negative result** — gastric gavage in rats showed no effect on ADH/ALDH/CYP2E1; only ROS reduction. Honest counter-evidence. |
| PMC11675335 | 2024 Foods. "Clinical Evaluation of Hovenia dulcis Extract Combinations for Effective Hangover Relief in Humans" | Human RCT, n=25 crossover; HD+Pueraria reduced GI hangover symptoms p<0.05; lower BAC at 0.25/0.5h; higher acetaldehyde at 6h (faster turnover) |
| PMC2680547 | Brooks et al. 2009, PLoS Med | ALDH2 deficiency → acetaldehyde accumulation; relevant for Asian-flush context |

## Citations to NOT use (verified inaccurate in current map)
- **PMC4082193** — actually unrelated paper about Norwegian terror attack research coordination. **Do not cite as Wang 2014.** The "Wang 2014 USC follow-up" the spec references appears to be Silva et al. 2020 (PMC7211127) and the original USC liver work — fold into Silva 2020 cite.
- **PMC8429066** — actually a transdermal alcohol biosensor paper (Fairbairn 2021). **Do not cite as Hovenia dulcis review.** Use PMC7914479 or PMC11033337 instead.
- **PMC8259720** — actually a gut-microbiome/autoimmune paper (Caslin 2021). **Do not cite as Silverman/Foods RCT.** No verifiable Silverman 2020 RCT in PMC; use PMC11675335 (the 2024 Hovenia RCT) for human clinical evidence.

## Outline (mirror dhm-dosage-guide-2025 structure)

1. **Quick Answer paragraph** (top, extractable for `quickAnswer`)
2. **What Is DHM?** — chemistry, source, history (Hovenia dulcis, isolated 1997 [PMC7914479])
3. **How Does DHM Work?** — three mechanisms
   - 3a. GABA-A modulation [PMC3292407]
   - 3b. Liver enzyme support — ADH/ALDH [PMC7211127, PMC11033337, PMC7914479]
   - 3c. Antioxidant + anti-inflammatory + mitochondrial [PMC7902334, PMC10481966]
4. **What Does the Research Say?** — Shen 2012, Silva 2020, Janilkarn-Urena 2023, Hovenia RCT 2024, Skotnicová 2020 negative
5. **How to Take DHM** — short summary, link to /dhm-dosage-guide-2025
6. **Is DHM Safe?** — toxicology + LiverTox NIH ref + link to /is-dhm-safe-...
7. **DHM vs Other Hangover Supplements** — quick table vs NAC, milk thistle, Hovenia full extract; link to /dhm-vs-zbiotics, /dhm-vs-milk-thistle
8. **FAQ (15+)** — auto-extracted to faq field
9. **References** — PubMed-linked

## Internal link targets (5-8)
- /never-hungover/dhm-dosage-guide-2025 — "How to Take" section
- /never-hungover/dhm-randomized-controlled-trials — "Research" section
- /never-hungover/is-dhm-safe-science-behind-side-effects-2025 — "Safety" section
- /never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025 — "Vs" section
- /never-hungover/dhm-asian-flush-science-backed-solution — ALDH2 mention
- /never-hungover/sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025 — GABA mechanism
- /never-hungover/dhm-japanese-raisin-tree-complete-guide — Hovenia origins
- /never-hungover/can-you-take-dhm-every-day-long-term-guide-2025 — daily-use FAQ

## Schema additions
- `quickAnswer` (string, ~30-50 words, top-30 style)
- `faq` (array of {question, answer}, target 15+)
- Keep existing fields: title, slug, excerpt, metaDescription, date, author, tags, readTime, content, id, relatedPosts
- Add `dateModified: 2026-04-26`

## Word-count plan
- Current: 1,435
- Target: 2,000+ (floor)
- Need: ~600 net new words via expanded mechanism detail + 15 FAQ entries (FAQ counts toward word count via JSON-LD render)
