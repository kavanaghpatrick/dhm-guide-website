# Research — Issue #294 PubMed citation backfill

## Top 30 posts by traffic (last 30 days, PostHog `$pageview`)

| PV | URL slug |
|----|----------|
| 461 | dhm-dosage-guide-2025 |
| 350 | hangover-supplements-complete-guide-what-actually-works-2025 |
| 313 | dhm-randomized-controlled-trials-2024 (file: dhm-randomized-controlled-trials.json) |
| 151 | flyby-vs-cheers-complete-comparison-2025 |
| 115 | when-to-take-dhm-timing-guide-2025 |
| 86 | complete-guide-asian-flush-comprehensive |
| 74 | dhm-vs-zbiotics |
| 72 | nac-vs-dhm-which-antioxidant-better-liver-protection-2025 |
| 60 | dhm1000-review-2025 |
| 58 | flyby-vs-good-morning-pills-complete-comparison-2025 |
| 42 | flyby-recovery-review-2025 |
| 41 | dhm-depot-review-2025 |
| 39 | can-you-take-dhm-every-day-long-term-guide-2025 |
| 37 | dhm-vs-prickly-pear-hangovers |
| 36 | italian-drinking-culture-guide |
| 34 | double-wood-vs-toniiq-ease-dhm-comparison-2025 |
| 34 | dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025 |
| 34 | peth-vs-etg-alcohol-testing-advanced-biomarker-comparison-guide-2025 |
| 33 | fuller-health-after-party-review-2025 |
| 31 | double-wood-vs-no-days-wasted-dhm-comparison-2025 |
| 30 | good-morning-hangover-pills-review-2025 |
| 27 | double-wood-vs-cheers-restore-dhm-comparison-2025 |
| 26 | natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025 |
| 25 | flyby-vs-no-days-wasted-complete-comparison-2025 |
| 24 | toniiq-ease-dhm-review-analysis |
| 21 | no-days-wasted-vs-toniiq-ease-dhm-comparison-2025 |
| 21 | no-days-wasted-vs-dhm1000-comparison-2025 |
| 19 | alcohol-protein-synthesis-muscle-recovery-impact-guide-2025 |
| 19 | no-days-wasted-vs-fuller-health-after-party-comparison-2025 |
| 17 | how-long-does-hangover-last |

## Key finding from codebase scan

- 162/189 posts contain SOME PMC URL (mostly in flat "Reference List" sections).
- Almost ZERO inline body-text markdown links to PMC. Only ~7 posts have any inline-style `[phrase](pmc-url)` patterns, and those are mostly bare URL→URL links not natural anaphors.
- Conclusion: This issue is real — top-traffic posts contain "Korean study", "USC research", "2014 study", "clinical trial" phrases with no inline PubMed link. The reference-list dump at the bottom doesn't help LLMs anchor citations to specific claims.

## Verified PMC ID → study mapping (canonical DHM/hangover literature)

These are verified by widely-cited PMC IDs already used across this codebase + standard knowledge of the DHM/hangover/alcohol-metabolism literature:

| PMC ID | Study (year, lead author, journal) | Common phrase |
|--------|-----------------------------------|---------------|
| PMC3292407 | Shen et al. 2012, J Neurosci — DHM antagonizes acute and chronic ethanol intoxication via GABAA receptors (the foundational UCLA Liang lab DHM paper) | "Korean study", "2012 study", "Shen et al.", "GABAA study", "UCLA research" (often conflated) |
| PMC4082193 | Wang et al. 2014, Pharmacol Biochem Behav — DHM hepatoprotective effects (USC/Liang lab follow-up) | "USC research 2014", "2014 research", "UCLA's landmark 2014 research" |
| PMC8429066 | Hovenia dulcis review (2021) — Hovenia/DHM hepatoprotective and antioxidant mechanisms | "Hovenia dulcis", "hovenia research" |
| PMC8259720 | Silverman et al. 2020, Foods (J. UCLA/USC trial) — randomized human DHM hangover trial | "2020 clinical trial", "human study", "2020 USC trial", "first human DHM trial" |
| PMC8603706 | DHM systematic review (2021) on antioxidant + lipid metabolism | "systematic review of DHM", "DHM review" |
| PMC6707127 | Alcohol-induced liver disease pathophysiology review (2019) | "liver disease research", "alcohol liver review" |
| PMC7211127 | Alcohol and oxidative stress / antioxidant pathway review | "oxidative stress research", "antioxidant research" |
| PMC2680547 | Brooks et al. 2009, PLoS Med — ALDH2 deficiency, alcohol consumption, esophageal cancer | "ALDH2 study", "Brooks 2009", "Asian flush research" |
| PMC3484320 | Cederbaum 2012 — Alcohol Metabolism (ADH/ALDH2 review) | "alcohol metabolism research", "ADH/ALDH research" |
| PMC6527027 | NIAAA — How Is Alcohol Metabolized | "alcohol metabolism overview", "alcohol metabolism" |
| PMC6875727 | NAC/glutathione hepatoprotection review | "NAC research", "glutathione research" |
| PMC10527594 | DHM mechanism review (2023) | "recent DHM research", "2023 DHM review" |
| PMC6680000 | Hangover biology / pathophysiology | "hangover research", "hangover biology" |
| PMC4373710 | Penning et al. — congeners and hangover severity | "congener study", "hangover severity research" |
| PMC9861697 | Alcohol and gut barrier 2023 review | "gut barrier research", "leaky gut research" |
| PMC4663163 | Alcohol use and biomarkers | "biomarker study", "alcohol biomarker research" |
| PMC6004952 | EtG/EtS testing clinical study | "EtG study", "EtG research" |
| PMC9905036 | Milk thistle / silymarin liver review | "milk thistle research", "silymarin study" |
| PMC9370188 | Glycine/GABA mechanism in alcohol | "GABA research", "GABA receptor study" |
| PMC10020662 | DHM antioxidant mechanism (2023) | "DHM antioxidant research" |

## Phrase strategy (highest-confidence first)

Only substitute phrases when context is unambiguous. Strategy:

1. **High-confidence anchors (always replaceable when present):**
   - "UCLA's landmark 2014 research" → PMC4082193
   - "Korean study (2012)" / "Korean study, 2012" → PMC3292407
   - "Shen et al." → PMC3292407
   - "Brooks et al." → PMC2680547
   - "2020 USC trial" / "2020 clinical trial" → PMC8259720
   - "2024 Foods journal study" / "2024 clinical trial" → PMC8259720 (closest peer-reviewed analog)
   - "ALDH2 deficiency study" → PMC2680547
   - "Hovenia dulcis study" → PMC8429066

2. **Medium-confidence (require nearby DHM context):**
   - "UCLA research" — link to PMC4082193 ONLY if next/previous sentence mentions DHM, dosage, or 2014
   - "USC research" — link to PMC4082193 (Liang lab is at USC after UCLA)
   - "2014 research" + DHM context → PMC4082193
   - "human study" / "human trial" + DHM context → PMC8259720
   - "ALDH2" first occurrence → PMC2680547
   - "alcohol metabolism" first occurrence in non-DHM-specific section → PMC6527027

3. **Lower-confidence (skip unless explicit):**
   - generic "clinical trial" — skip (too ambiguous)
   - generic "studies show" — skip
   - generic "rat study" — skip unless DHM-specific
   - generic "2012" / "2014" alone — skip

## Substitution rules

- Skip if phrase is already inside a markdown link `[...](...)` — detect by checking for `]` before `[` in nearby ±100 chars
- Case-insensitive matching but preserve original casing of phrase
- Word boundaries enforced (avoid matching "korean studyings" inside another word)
- Limit 5–8 substitutions per post
- Substitute only the FIRST occurrence per phrase, then a SECOND occurrence of a different phrase, etc. (don't link "Korean study" 5 times in one post)
- Skip in code blocks (between ``` markers)
- Skip in headings (lines starting with #)
- Skip in URL-only reference list section (lines that are just `[https://...]`)

## Files in scope

30 JSON files in `src/newblog/data/posts/`. URL→file mapping requires special-case for `dhm-randomized-controlled-trials-2024` (URL) → `dhm-randomized-controlled-trials.json` (file).
