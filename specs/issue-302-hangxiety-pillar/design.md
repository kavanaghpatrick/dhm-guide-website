# Design — Issue #302 Hangxiety Pillar

## Architecture

Static-content pillar follows existing post pattern:
- JSON post → consumed by Vite dynamic import via `postRegistry.js`
- Metadata mirrored in `metadata/index.json` for list views
- relatedPosts auto-populated by cluster-aware generator
- FAQPage / Article / BreadcrumbList schema emitted automatically by render layer when fields present

## Content structure (12 H2)

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

## Citations (verified PMC IDs)

Mechanism: PMC10623140, PMC10887002, PMC2577853, PMC12238138, PMC3292407
Liver/oxidative: PMC11675335, PMC11033337, PMC8603706
Cognitive/sleep: PMC4397399
Adjunctive supplements: PMC10783196, PMC11136869, PMC10604027, PMC12242034
EXCLUDE globally: PMC4082193, PMC8429066, PMC8259720

## Internal linking

10 outbound links FROM pillar TO spokes — placed inline in relevant H2 sections.
8 inbound links injected into reverse-link target posts via sentinel-based safe insertion (regex find anchor sentence + insert markdown link inside same paragraph).

## Cluster config

Append to `scripts/cluster-config.json` clusters[]:
```json
{
  "name": "hangxiety-mental-health",
  "pillar": "hangxiety-complete-guide-2026-supplements-research",
  "spokes": [10 spoke slugs],
  "keywords": [...],
  "anchor_phrases": [...]
}
```

Generator picks this up automatically — pillar's relatedPosts will be filled with siblings + the cluster pillar will appear in spoke recommendations.
