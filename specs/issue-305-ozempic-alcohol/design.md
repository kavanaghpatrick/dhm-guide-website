# Design

## File Structure

### New file
`src/newblog/data/posts/ozempic-glp1-alcohol-hangover-2026-research-guide.json`

### Modified files
- `scripts/cluster-config.json` — add slug to hangover-prevention spokes
- `src/newblog/data/postRegistry.js` — add dynamic import entry (alphabetical)
- `src/newblog/data/metadata/index.json` — append metadata entry

### Auto-generated update
- `relatedPosts` field on each linked post (via generate-related-posts.mjs)

## JSON Schema (mirrors magnesium post)

```
{
  title, slug, excerpt, metaDescription, date, dateModified, author,
  tags[], readTime, image (null), quickAnswer,
  content (markdown), id, faq[{question, answer}], relatedPosts[]
}
```

## Content Architecture (3,500w target)

| Section | Words | Citations |
|---|---|---|
| Quick Answer | 200 | — |
| GLP-1 Agonists Primer + table | 350 | 0 |
| Yale 2025 + JAMA RCT | 600 | 3 |
| How GLP-1s Change Alcohol Metabolism | 450 | 2 |
| Hangovers on GLP-1s | 350 | 1 |
| DHM + GLP-1 Stack | 350 | 1 (DHM) |
| Side Effects + Safety | 350 | 1 |
| Drinking Patterns + Risk | 250 | — |
| GLP-1 vs Naltrexone | 250 | 1 |
| Real-world Reports | 200 | 1 |
| FAQ-intro + Bottom Line | 250 | — |
| **Total** | **~3,600** | **9-10** |

## Comparison Table: 6 GLP-1 Agonists

| Drug | Generic | Class | Half-life | Alcohol craving evidence | GI risk + alcohol |

(Ozempic, Wegovy = semaglutide; Mounjaro, Zepbound = tirzepatide; Rybelsus = oral semaglutide; Saxenda = liraglutide)

## Internal Links Plan

Inline anchored:
1. hangover-supplements-complete-guide — main hangover stack reference
2. dhm-dosage-guide-2025 — dose specifics
3. dhm-science-explained — DHM mechanism for stacking section
4. hangxiety-complete-guide — anxiety considerations
5. magnesium-hangover-hangxiety — magnesium as GI-tolerant adjunct (some on Mounjaro deal with nausea)
6. what-to-eat-before-drinking — meal timing matters more on slowed-gastric-emptying drugs

## FAQ List (15 entries)

1. Can you drink alcohol on Ozempic?
2. Does Ozempic make hangovers worse?
3. Why do people on Ozempic feel drunker faster?
4. Does semaglutide reduce alcohol cravings?
5. Is Ozempic FDA-approved for alcohol use disorder?
6. What did the Yale 2025 study find about Ozempic and the liver?
7. What's the difference between Ozempic, Wegovy, and Mounjaro for alcohol?
8. Is tirzepatide (Mounjaro/Zepbound) safer than semaglutide with alcohol?
9. Can I take DHM if I'm on Ozempic?
10. Should I tell my doctor I drink alcohol on a GLP-1?
11. Will alcohol stop my Ozempic from working for weight loss?
12. How is GLP-1 different from naltrexone for drinking?
13. What about Rybelsus (oral semaglutide) and alcohol?
14. Is pancreatitis risk higher when drinking on GLP-1s?
15. How long after stopping Ozempic does alcohol response return to normal?

## YMYL Compliance Strategy

- Author byline + dateModified visible
- Every therapeutic claim cited
- "Speak to your doctor" before any protocol section
- No "Ozempic cures alcoholism" framing — phrase as "research suggests" / "preliminary trials"
- Disclaimer footer

## Cluster Decision

Place under `hangover-prevention` cluster as additional spoke (per spec default).
Pillar remains: `functional-medicine-hangover-prevention-2025`.
This post bridges hangover-prevention with health-impact themes — natural fit.
