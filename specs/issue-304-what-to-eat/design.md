# Design: What to Eat Before Drinking

## Files modified
1. NEW: `src/newblog/data/posts/what-to-eat-before-drinking-alcohol-evidence-based-guide.json`
2. EDIT: `src/newblog/data/postRegistry.js` — add slug → import mapping
3. EDIT: `src/newblog/data/metadata/index.json` — add metadata entry
4. EDIT: `scripts/cluster-config.json` — add as spoke under `hangover-prevention`
5. RUN: `node scripts/generate-related-posts.mjs --write-reciprocal`

## Post JSON schema (mirrors hangxiety-complete + magnesium-hangxiety patterns)

```json
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "metaDescription": "...",
  "date": "2026-04-26",
  "dateModified": "2026-04-26",
  "author": "DHM Guide Team",
  "tags": [...],
  "readTime": <int>,
  "image": null,
  "quickAnswer": "...150 words...",
  "content": "markdown body with inline [PMC links](URL)",
  "id": "<slug>",
  "faq": [{ "question": "...", "answer": "..." } x 15+],
  "relatedPosts": [...8 slugs...]
}
```

## Outline → section structure (markdown headings inside `content`)

```
## What Is the Best Food to Eat Before Drinking? (Quick Answer)
## Why What You Eat Before Drinking Matters
### How Alcohol Absorption Works
### Peak BAC Math: Fasting vs Fed
### First-Pass Metabolism
## The Science of Food Slowing Alcohol Absorption
### The Gastric Emptying Mechanism
### Fat, Protein, Carbs: Are They Equivalent?
### What the 2020 RCT Showed
## Top 10 Pre-Drink Foods Ranked (Comparison Table + Per-Food)
| food | absorption-slowing | satiety | nutrient density | cost | notes |
1. Greek yogurt
2. Eggs
3. Avocado + whole-grain toast
4. Salmon
5. Oatmeal with nut butter
6. Cottage cheese + fruit
7. Hummus + whole-grain pita
8. Lean steak + sweet potato
9. Beans + rice
10. Almonds + dark chocolate
## Pre-Drink Meal Timing: 1-2hr vs 30min vs With Drinks
## Worst Foods to Eat Before Drinking (Avoid These)
### Sugar-heavy meals
### Carbonated everything
### Salty / spicy
### Caffeine alone
### Raw vegetable salads only
## Alcohol-Specific Pre-Drink Foods (Wine vs Spirits vs Beer)
## Pre-Drink Foods + DHM Stack
## Real-World Pre-Drink Meal Examples (5 Templates)
### Dinner before a wedding
### Pre-bar weeknight quick fix
### Brunch before day-drinking
### Restaurant dinner with cocktails
### Pre-drink on a tight budget
## Common Myths Debunked
### "Bread soaks up alcohol"
### "Milk coats your stomach"
### "Only fat slows absorption"
### "Eat right before the first drink"
### "Pickle juice or vinegar prevents hangover"
### "A heavy meal = invincibility"
## Bottom Line
## References
```

## Comparison table approach
Markdown table inside `content`. Five columns:
- Food
- Absorption-slowing score (1-10)
- Satiety score (1-10)
- Nutrient density (1-10)
- Cost / accessibility
- Why it works (1-line)

## Tags
`pre-drink food`, `what to eat before drinking`, `alcohol absorption`, `gastric emptying`, `hangover prevention`, `nutrition`, `pre-drinking nutrition`, `pre-game food`

## Internal links (8-12 contextually placed)
- `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025`
- `/never-hungover/dhm-dosage-guide-2025`
- `/never-hungover/dhm-science-explained`
- `/never-hungover/hangxiety-complete-guide-2026-supplements-research`
- `/never-hungover/magnesium-hangover-hangxiety-glycinate-vs-citrate-2026`
- `/never-hungover/alcohol-pharmacokinetics-advanced-absorption-science-2025`
- `/never-hungover/alcohol-recovery-nutrition-complete-healing-protocol-2025`
- `/never-hungover/precision-nutrition-alcohol-metabolism-genetic-diet-guide-2025`
- `/never-hungover/emergency-hangover-protocol-2025`
- `/never-hungover/alcohol-headache-why-it-happens-how-to-prevent-2025`
- `/reviews`
- `/compare`

## Risk register
- **Citation accuracy** — every PMC ID verified by WebFetch in research phase. Avoid PMC4082193, PMC8429066, PMC8259720.
- **Word count drift** — keep section bounds in mind; bias toward 4,000 not 4,200 to leave room for FAQ schema render.
- **Bracket-balance / quotes** — the JSON content field is markdown-with-escapes; use existing post as reference for escaping.
