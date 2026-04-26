# Requirements

## Goal
Publish definitive 3,500-word evidence-based guide on Ozempic/GLP-1 + alcohol with first-mover SEO advantage.

## Functional
- New JSON post at `src/newblog/data/posts/ozempic-glp1-alcohol-hangover-2026-research-guide.json`
- Title: "Ozempic, GLP-1 Agonists, and Alcohol: Complete 2026 Research Guide"
- 3,200-3,800 words (target 3,500)
- 15+ FAQ entries
- 7-10 inline PubMed/primary citations as `[PMC######](url)` markdown links
- Quick Answer field
- Comparison table: 6 GLP-1 agonists ranked
- dateModified: 2026-04-26
- 6 internal links to specified anchor posts
- Author byline (Dr. Patrick Kavanagh / DHM Guide research team)
- FAQ schema items
- 5-8 H2 sections matching outline

## Outline
1. Quick Answer
2. What Are GLP-1 Agonists? (Ozempic, Wegovy, Mounjaro, etc.)
3. The Yale 2025 Research + JAMA Psychiatry RCT
4. How GLP-1s Change Alcohol Metabolism
5. Hangovers on GLP-1s: What Changes
6. DHM + GLP-1: Stacking Considerations
7. Side Effects + Safety
8. Drinking Patterns That Reduce Risk
9. GLP-1s vs Naltrexone for AUD
10. Real-World User Reports
11. FAQ
12. References

## Internal links (required, all verified existing)
- /never-hungover/hangover-supplements-complete-guide-what-actually-works-2025
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/dhm-science-explained
- /never-hungover/hangxiety-complete-guide-2026-supplements-research
- /never-hungover/magnesium-hangover-hangxiety-glycinate-vs-citrate-2026
- /never-hungover/what-to-eat-before-drinking-alcohol-evidence-based-guide

## Citations (verified PMCs)
- PMC11822619 (Hendershot 2025 RCT)
- PMC12043078 (Petrie & Mayo JCI review)
- PMC11786240 (Klausen 2025 review)
- PMC10684505 (Quddos 2023 tirzepatide)
- PMC12636227 (Wallach 2025 trends)
- PMC12729087 (Bernstein 2025 editorial)
- PMC8603706 (DHM alcohol metabolism)
- Yale Mehal 2025 npj Metabolic Health (medicine.yale.edu URL)
- Nature Communications Wang 2024 doi.org (10.1038/s41467-024-48780-6)

## Cluster + Registry
- Place under hangover-prevention cluster (default per spec)
- Add to post registry, metadata index
- Run generate-related-posts.mjs --write-reciprocal

## YMYL/Compliance
- Recommend doctor consultation for prescription decisions
- No unsupported medical claims
- Cite primary sources for all therapeutic claims
- Author byline required

## Out of scope
- New images/hero (use null per Issue #30 pattern)
- New cluster creation (use existing hangover-prevention)
- Phase 3 trial content (use "ongoing" qualifier)
