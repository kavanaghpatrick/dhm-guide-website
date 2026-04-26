# Research: issue-302-hangxiety-pillar

## Executive summary
NEW pillar "The Complete Hangxiety Guide 2026" (~6,500 words). Captures 340% search-growth trend with no authority owning it. Hubs 10 existing posts. Recommend NEW cluster `hangxiety-mental-health` (alternative: expand `hangover-prevention`). Frontmatter, outline, FAQ, citations all drafted in this doc.

## Slug + frontmatter
- Slug: `hangxiety-complete-guide-2026-supplements-research`
- Title: "The Complete Hangxiety Guide 2026: Why Alcohol Causes Post-Drinking Anxiety & How to Fix It"
- dateModified: 2026-04-26
- readTime: 18

## Target keywords
"hangxiety", "hangover anxiety", "alcohol anxiety", "post-drinking mood", "rebound anxiety"

## 10 spoke posts (link FROM pillar TO these)

| # | Slug | Anchor phrase |
|---|---|---|
| 1 | natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025 | "GABA supplements vs DHM modulation" |
| 2 | gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025 | "understanding GABA as your brain's natural brake" |
| 3 | alcohol-and-anxiety-breaking-the-cycle-naturally-2025 | "alcohol-induced anxiety patterns" |
| 4 | sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025 | "sleep optimization strategies for hangxiety recovery" |
| 5 | alcohol-and-cognitive-decline-2025-brain-research-reveals-hidden-risks | "cognitive recovery from post-drinking brain changes" |
| 6 | dhm-women-hormonal-considerations-safety-2025 | "how hormonal cycles amplify hangxiety in women" |
| 7 | alcohol-and-rem-sleep-complete-scientific-analysis-2025 | "how alcohol disrupts REM sleep cycles" |
| 8 | alcohol-fertility-reproductive-health-guide-2025 | "reproductive health and alcohol-anxiety cycles" |
| 9 | alcohol-and-nootropics-cognitive-enhancement-interactions-2025 | "nootropics for cognitive restoration" |
| 10 | gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025 | "younger generations prioritizing hangxiety prevention" |

## Reverse-link strategy (8 posts to add inbound links to pillar)

1. functional-medicine-hangover-prevention-2025
2. hangover-supplements-complete-guide-what-actually-works-2025 (just refreshed in #300)
3. dhm-science-explained (just refreshed in #299)
4. dhm-dosage-guide-2025
5. emergency-hangover-protocol-2025
6. alcohol-and-cognitive-decline-2025-brain-research-reveals-hidden-risks
7. sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025
8. natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025

## Cluster placement: create NEW cluster `hangxiety-mental-health`

Add to `scripts/cluster-config.json`:

```json
{
  "name": "hangxiety-mental-health",
  "pillar": "hangxiety-complete-guide-2026-supplements-research",
  "spokes": [<10 slugs from above>],
  "keywords": ["hangxiety", "hangover anxiety", "alcohol anxiety", "post-drinking mood", "alcohol-induced anxiety", "rebound anxiety"],
  "anchor_phrases": [
    "complete hangxiety guide",
    "hangover anxiety science",
    "alcohol-induced anxiety relief strategies",
    "hangxiety GABA rebound mechanisms"
  ]
}
```

## PMC citation candidates (15 IDs, verified valid)

Pre-validated (from prior issue work):
- PMC3292407 — Shen 2012, GABA-A modulation
- PMC11675335 — 2024 Foods journal RCT
- PMC11033337 — He 2024 Hovenia review
- PMC8603706 — Skotnicová 2020 negative finding

New (for hangxiety mechanisms):
- PMC10623140 — GABAergic signaling in AUD/withdrawal
- PMC10887002 — Astrocytic GABAergic regulation in AUD/MDD
- PMC2577853 — GABAA receptors in alcoholism
- PMC12238138 — 2025 therapeutic targets review
- PMC10783196 — Magnesium for depression meta-analysis
- PMC11136869 — Magnesium for anxiety/sleep meta-analysis (2024)
- PMC10604027 — Cysteine + glutathione for hangover/liver
- PubMed32808029 — L-Cysteine RCT mentioning anxiety
- PMC12242034 — Ashwagandha for cortisol/stress/anxiety meta-analysis (2024)
- PubMed39286132 — Shoden ashwagandha RCT (2024)
- PMC4397399 — Glycine sleep mechanism

**EXCLUDE** (verified broken globally — see #300/#301 work): PMC4082193, PMC8429066, PMC8259720.

## Outline (12 H2 + 18 FAQ)

H2 structure:
1. What Is Hangxiety? (Definition & Scope)
2. The Neuroscience: GABA Rebound Mechanism
3. Sleep Disruption & Hangxiety Amplification
4. How Acetaldehyde Drives Anxiety
5. Hangxiety in Women (Hormonal Considerations)
6. Cognitive Hangxiety: Racing Thoughts, Decision-Making, Rumination
7. Supplement Stack for Hangxiety Relief (Evidence-Based)
8. Hangxiety Prevention Protocol (Pre-Drinking)
9. Acute Hangxiety Relief (Post-Drinking Emergency)
10. Lifestyle & Behavioral Hangxiety Hacks
11. Hangxiety in Special Populations (Gen Z, Athletes, High-Stress Professionals)
12. When to Seek Professional Help (Red Flags)

FAQ: 18 questions drafted in agent output (kept in execution-agent prompt).

## Word count breakdown

| Section | Target words |
|---|---|
| Intro + Quick Answer + Key Takeaways | 400 |
| H2 #1-3 | 1,200 |
| H2 #4-6 | 1,100 |
| H2 #7-9 | 1,300 |
| H2 #10-12 | 1,000 |
| FAQ section | 800 |
| Conclusion + CTA | 300 |
| **TOTAL** | **6,100-6,500** |

## Schema emission verified
- Article + BreadcrumbList: always emitted
- FAQPage: emits if `post.faq` non-empty (set 18-entry array)
- Quick Answer callout: emits if `post.quickAnswer` set
- relatedPosts: auto-populated by `scripts/generate-related-posts.mjs --write-reciprocal` after post lands
