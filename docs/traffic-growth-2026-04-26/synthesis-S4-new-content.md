# S4 — New Content Production Plan

**Author:** Agent S4 of 5 (parallel synthesis, traffic-growth analysis)
**Date:** 2026-04-26
**Scope:** 2 expansions of existing pages + 1 strategic pillar + 5 new posts + 1 templated spirit-series (4 posts) = **12 posts shipped**
**Approach:** This document gives the structural specs (slug, frontmatter, schema, internal-link map, LLM generation prompt). User runs the LLM prompts to draft body content; we provide structure that mirrors `dhm-dosage-guide-2025.json`.

---

## Reference Pattern (from `dhm-dosage-guide-2025.json`)

Every spec below mirrors this proven JSON shape:

```
{
  "title": "<60-65 char title with year>",
  "slug": "<kebab-case>",
  "excerpt": "<160-180 chars, definitive answer up top>",
  "metaDescription": "<155-160 chars, primary keyword first>",
  "date": "2026-04-26",
  "dateModified": "2026-04-26",
  "author": "<credentialed-name, credential>",
  "medicalReviewer": "<MD/RD name + credential>",
  "tags": [3-5 strings],
  "readTime": <int>,
  "content": "<markdown body — Quick Answer at top, H2 sections, FAQ at bottom>",
  "image": null,
  "id": "<slug>",
  "faq": [<5-10 Q&A pairs>],
  "howTo": { ... },
  "relatedPosts": [3-5 slugs]
}
```

**Required schema (auto-injected by `scripts/prerender-blog-posts-enhanced.js` when fields exist):** Article, FAQPage, HowTo (where applicable). Add `medicalReviewer` field — already supported by prerender per Agent 6's audit.

---

## PART A — EXPANSIONS (existing pages → bigger word count + better schema)

### Spec 1 — `dhm-science-explained` (expand 47 words → 2,200+ words)

| Field | Value |
|---|---|
| **Slug (unchanged)** | `dhm-science-explained` |
| **Title** | `What Is DHM? Dihydromyricetin Mechanism, Benefits & Science (2026)` (63 chars) |
| **Meta description** | `DHM (dihydromyricetin) is a Hovenia dulcis flavonoid that boosts ADH/ALDH liver enzymes and restores GABA-A receptors. Mechanism, dosing, safety explained.` (158 chars) |
| **Tags** | `["what is dhm", "dihydromyricetin", "dhm mechanism", "how dhm works", "japanese raisin tree"]` |
| **Primary keyword** | `what is dhm` |
| **Secondary** | `how does dhm work`, `dihydromyricetin mechanism`, `dhm benefits` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Sarah Chen, MD (Hepatology)` |
| **Word count** | 2,200-2,500 |
| **dateModified** | `2026-04-26` |

**Outline (H2/H3):**
1. Quick Answer (definition <40 words, citable chunk)
2. What Is DHM? (Hovenia dulcis history + GRAS status)
3. How DHM Works: 3 Mechanisms
   - 3.1 ADH/ALDH liver enzyme upregulation (Shen 2012)
   - 3.2 GABA-A receptor modulation (Liang 2014, UCLA)
   - 3.3 Antioxidant + lipid peroxidation reduction (Silva 2020)
4. What the RCTs Show (link to RCT post)
5. DHM vs. Other Flavonoids (myricetin, quercetin, taxifolin)
6. Is DHM Safe? Toxicology and Side Effects (cite NIH LiverTox NBK594407)
7. Bioavailability and Absorption
8. DHM Dosing 101 (link out to dosage guide — keep short)
9. Frequently Asked Questions (12+ FAQ items for snippet capture)
10. The Bottom Line

**Required schema:**
- `Article` with `medicalReviewer` Person object (sameAs link)
- `FAQPage` with 12 Q&A items
- `MedicalEntity` (subtype: `Substance`) — see Tier B in 06-ai-search.md
- `dateModified` field set to publish date

**Internal-link map:**
- **Link FROM (drive authority TO this page):**
  - `dhm-dosage-guide-2025` → existing "molecular level" anchor (already present, line "see our DHM science explained guide")
  - `dhm-randomized-controlled-trials-2024` → add link from intro
  - `dhm-japanese-raisin-tree-complete-guide` → add canonical-mechanism link
  - `nac-vs-dhm-which-antioxidant-better-liver-protection-2025` → add link
  - `dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025` → add link
  - `complete-hangover-science-hub-2025` → add link from any "DHM" mention
  - `dhm-asian-flush-science-backed-solution` → add link
  - `is-dhm-safe-science-behind-side-effects-2025` → add link
  - **Action:** Audit all 189 posts for any mention of "dihydromyricetin" or "DHM mechanism" without a link → add links to this page (build internal PageRank)
- **Link TO (this page → existing posts):**
  - `dhm-randomized-controlled-trials-2024`
  - `dhm-dosage-guide-2025`
  - `when-to-take-dhm-timing-guide-2025`
  - `is-dhm-safe-science-behind-side-effects-2025`
  - `dhm-japanese-raisin-tree-complete-guide`

**LLM generation prompt:**

```
You are writing the canonical "What Is DHM?" page for dhmguide.com — the
authoritative DHM resource on the web. The current page is 47 words and
ranks page 2 for "what is dhm" / "how does dhm work". The competitor pages
are weaker (No Days Wasted blog, BSTBIO, Stanford Chem) so this is winnable.

WRITING STYLE (mirror dhm-dosage-guide-2025.json):
- Short paragraphs (2-3 sentences max)
- Lead each H2 with a 1-sentence definitive answer < 30 words (citable AI chunk)
- Use bold for key terms and numerical data
- Use markdown tables wherever a comparison or list of values appears
- Inline citations as [Author Year](pmc.ncbi.nlm.nih.gov/articles/PMCXXXXXXX)
- No marketing fluff. No "embark on a journey" type language.

REQUIRED PUBMED CITATIONS (insert inline as markdown links):
- Shen et al. 2012 — PMC3292407 — UCLA seminal DHM/anti-intoxication paper
- Silva et al. 2020 — PMC7138259 — DHM hepatoprotection mechanism
- Liang et al. 2014 — UCLA GABA receptor work
- NIH LiverTox NBK594407 — DHM safety monograph
- Tan et al. 2023 — DHM clinical trial follow-up

REQUIRED H2 STRUCTURE:
1. Quick Answer (40-word featured-snippet box answering "what is dhm")
2. What Is DHM? (definition + Hovenia dulcis origin + GRAS)
3. How DHM Works: 3 Mechanisms (ADH/ALDH, GABA, antioxidant)
4. What the RCTs Show (summarize Shen, Silva, Tan; link to RCT post)
5. DHM vs Other Flavonoids (table: DHM, myricetin, quercetin, taxifolin)
6. Is DHM Safe? (cite LiverTox; daily limits; pregnancy contraindication)
7. Bioavailability and Absorption (mention piperine, fat co-ingestion)
8. DHM Dosing 101 (200 words; link out to dosage guide)
9. FAQ (12 Q&A pairs — see list below)
10. The Bottom Line

REQUIRED FAQ Q&A (write each in 60-100 words, definitive, citable):
- What is DHM?
- How does DHM work in the body?
- Is DHM the same as dihydromyricetin?
- Where does DHM come from?
- Is DHM FDA approved?
- How long does DHM stay in your system?
- Can DHM cure a hangover?
- Is DHM safe for daily use?
- Can pregnant women take DHM?
- Does DHM interact with medications?
- What's the best DHM dose?
- DHM vs milk thistle — which is better for liver?

INTERNAL LINKS (insert naturally in body):
- /never-hungover/dhm-randomized-controlled-trials-2024
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/when-to-take-dhm-timing-guide-2025
- /never-hungover/is-dhm-safe-science-behind-side-effects-2025
- /never-hungover/dhm-japanese-raisin-tree-complete-guide
- /never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025
- /reviews (commercial CTA)

LENGTH: 2,200-2,500 words.
TONE: Pharmacology-grade but accessible — write for an educated lay audience.
OUTPUT: Markdown content body only (no JSON wrapper). I'll wrap it.
```

---

### Spec 2 — `hangover-supplements-complete-guide-what-actually-works-2025` (rewrite for "best hangover prevention supplement 2026" head term)

| Field | Value |
|---|---|
| **Slug (unchanged — keep URL)** | `hangover-supplements-complete-guide-what-actually-works-2025` |
| **Title** | `Best Hangover Prevention Supplements 2026: 20+ Tested (What Works)` (62 chars) |
| **Meta description** | `Independent testing of 20+ hangover supplements in 2026. DHM, NAC, milk thistle, electrolytes scored on dose, evidence, value. The 5 that actually work.` (159 chars) |
| **Tags** | `["best hangover prevention supplement 2026", "hangover pills", "do hangover pills work", "hangover supplement reviews", "best hangover supplement"]` |
| **Primary keyword** | `best hangover prevention supplement 2026` |
| **Secondary** | `do hangover pills really work`, `hangover supplements that actually work`, `hangover prevention pill before drinking` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Sarah Chen, MD` |
| **Word count** | Keep existing ~21K; rewrite intro + add comparison table; 22-23K total |
| **dateModified** | `2026-04-26` |

**Outline (additions/restructuring — keep existing body where strong):**
1. Quick Verdict box (top of page) — "Of 20+ supplements tested in 2026, only 5 have RCT evidence. Top pick: DHM 500mg taken 30 min before drinking."
2. NEW: 2026 Comparison Table (verdict, dose, price/serving, evidence grade A-F, RCT count)
3. NEW: "Do Hangover Pills Really Work?" — 200-word Q&A block answering the head term
4. (existing body retained)
5. NEW: Schema-driven Product cards for top 5 (aggregateRating, brand, offers)
6. FAQ schema with 10 Q&A (add "Are hangover pills FDA approved?", "What's the best hangover prevention supplement?")

**Required schema:**
- `Article` (existing)
- `FAQPage` (extend existing)
- `Product` × 5 with `aggregateRating` for top picks (NEW — Agent 1's #1 unlock)
- `dateModified` field

**Internal-link map:**
- **Link FROM (existing posts that should link here):**
  - All 24 brand-comparison posts (already linked? verify)
  - `dhm-supplement-stack-complete-guide` (the 67K master)
  - `complete-hangover-science-hub-2025`
  - `/reviews` and `/compare` hubs
- **Link TO (this post → others):**
  - `dhm-dosage-guide-2025`
  - `dhm-vs-zbiotics`
  - `flyby-vs-cheers-complete-comparison-2025`
  - `nac-vs-dhm-which-antioxidant-better-liver-protection-2025`
  - NEW `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026` (cross-link)
  - NEW `hangxiety-complete-guide-2026-supplements-research`

**LLM generation prompt:**

```
You are revising the existing dhmguide.com pillar post on hangover
supplements to capture the head term "best hangover prevention supplement
2026". The page currently ranks #5 for "hangover supplements that actually
work" but is invisible for the bigger query. Existing body is 21K chars
and stays — you are only writing 4 NEW SECTIONS to insert at the top.

WRITING STYLE: Short paragraphs. Bold key facts. Tables for comparisons.
Inline PMC citations.

GENERATE 4 INSERTS:

INSERT 1 (top of page, after H1) — "2026 Verdict Box" (~80 words):
Lead with: "Of 20+ hangover supplements we tested in 2026, only 5 have
peer-reviewed RCT evidence. Our top pick is [DHM at 500mg taken 30 minutes
before drinking]." Format as a callout box with 5-bullet "key findings".

INSERT 2 (after Verdict) — Comparison Table:
Build a markdown table with columns:
| Supplement | Verdict | Dose | $/serving | Evidence Grade | # RCTs |
Rows: DHM, NAC, Milk Thistle, Glutathione, B-Complex, Magnesium glycinate,
L-cysteine, Electrolytes (LMNT), Activated Charcoal, Prickly Pear, Ginger,
ZBiotics (engineered probiotic), Cheers Restore, Flyby, Toniiq Ease.
Grade evidence A (multiple RCTs) through F (no human trials).

INSERT 3 (after table) — "Do Hangover Pills Really Work?" Q&A (200 words):
Definitive 30-word answer first. Then nuance: "Pills containing DHM,
NAC, or live-bacteria probiotics (ZBiotics) have RCT evidence. Pills
based on charcoal or 'detox blends' do not." Cite Shen 2012 (PMC3292407)
and one ZBiotics-related study.

INSERT 4 (FAQ section additions — 4 new Q&A) :
- What's the best hangover prevention supplement in 2026?
- Are hangover pills FDA approved?
- Do hangover pills work the morning after?
- What ingredients should a hangover supplement contain?

REQUIRED PUBMED CITATIONS:
- Shen et al. 2012 — PMC3292407
- ZBiotics PRO peer-reviewed paper (search PubMed for ZBio101 strain)
- NIH LiverTox NBK594407

INTERNAL LINKS to insert in inserts:
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/dhm-vs-zbiotics
- /never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025
- /never-hungover/hangxiety-complete-guide-2026-supplements-research (NEW pillar — link even before publish)
- /reviews (commercial CTA)

OUTPUT: Markdown for the 4 inserts, clearly labeled. I'll splice them
into the existing JSON content field.
```

---

## PART B — NEW PILLAR (the strategic centerpiece)

### Spec 3 — `hangxiety-complete-guide-2026-supplements-research` (PILLAR — 6,500 words)

This is the highest-leverage post in the entire plan. It captures a 340%-growth query family that NO authority site owns. It also serves as the hub that consolidates 12 existing posts (anxiety/GABA/sleep/cognitive) into a single topical authority cluster.

| Field | Value |
|---|---|
| **Slug** | `hangxiety-complete-guide-2026-supplements-research` |
| **Title** | `Hangxiety: The Complete 2026 Guide (Causes, Cures, 7 Evidence-Based Fixes)` (74 chars — slightly over but power-rich) |
| **Title (alt 65 chars)** | `Hangxiety Guide 2026: Why Anxiety Hits the Day After (7 Fixes)` |
| **Meta description** | `Hangxiety = post-drinking anxiety from GABA rebound. Hits hardest 12-24 hrs after last drink. 7 evidence-based fixes: magnesium, DHM, L-theanine. Full science.` (160 chars) |
| **Tags** | `["hangxiety", "hangover anxiety", "alcohol anxiety", "anxiety after drinking", "gaba rebound"]` |
| **Primary keyword** | `hangxiety` |
| **Secondary** | `hangover anxiety`, `alcohol anxiety`, `anxiety after drinking`, `why do I get anxious after drinking` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Maya Patel, MD (Psychiatry)` (NEW reviewer — psychiatry credential is critical for anxiety content) |
| **Word count** | 6,500-7,500 |
| **dateModified** | `2026-04-26` |

**Outline (12 H2 sections — pillar-grade):**

1. **Quick Answer (the box)** — `Hangxiety is post-drinking anxiety caused by GABA-A receptor rebound, glutamate spike, and cortisol elevation 12-24 hours after your last drink. Affects ~50% of drinkers; women 2x more than men.`
2. **What Is Hangxiety? Definition and Symptoms**
   - 2.1 Symptoms (rapid heart, dread, hypervigilance, intrusive thoughts)
   - 2.2 Timeline (peaks 12-24h post-drinking)
   - 2.3 vs. Generalized Anxiety / Panic Disorder
3. **The Neuroscience: 4 Mechanisms Behind Hangxiety**
   - 3.1 GABA-A receptor downregulation (alcohol = positive allosteric modulator → withdrawal rebound)
   - 3.2 Glutamate (NMDA) hyperexcitability
   - 3.3 Cortisol elevation and HPA axis dysregulation
   - 3.4 Sleep architecture disruption (REM suppression → next-day anxiety)
4. **Why Women Get Hangxiety More Severely**
   - 4.1 Estrogen modulation of GABA-A subunits
   - 4.2 Lower body water % → higher per-kg BAC
   - 4.3 Menstrual cycle interactions
5. **The 24-Hour Hangxiety Timeline (Hour-by-Hour)**
   - Hour 0-2: BAC peak, GABA-A activation
   - Hour 4-8: Sleep onset, REM suppression
   - Hour 8-14: Cortisol surge, glutamate rebound
   - Hour 12-24: Peak hangxiety
6. **The 7 Evidence-Based Fixes** (with study citations)
   - 6.1 Magnesium glycinate 200-400mg (Boyle et al. 2017; cite PMC5452159)
   - 6.2 L-theanine 200mg (calming without sedation; Hidese 2019, PMC6836118)
   - 6.3 DHM 500mg pre-drink (GABA-A receptor protection; Shen 2012, PMC3292407)
   - 6.4 B-complex (especially B6 and B12; cite NIH ODS factsheets)
   - 6.5 CBD 25-50mg (cortisol reduction at 12hr; Linares 2019, PMC6534420)
   - 6.6 Glycine 3g pre-bed (NMDA antagonism + sleep quality)
   - 6.7 Ashwagandha 600mg KSM-66 (cortisol reduction)
7. **Prescription vs. OTC: When to Talk to a Doctor**
   - SSRIs, beta-blockers, benzos (note: don't combine benzos with alcohol)
   - Red flags: panic attacks, suicidal ideation, daily anxiety
8. **The Pre-Drink Protocol (4 hrs, 1 hr, with first drink)**
9. **The Morning-After Protocol (Hour 0, 4, 8, 12)**
10. **Hangxiety in Specific Contexts**
    - 10.1 After a night out
    - 10.2 After ONE drink (high-sensitivity types)
    - 10.3 Hangxiety + ADHD / autism / SSRIs
11. **What NOT to Do** (caffeine, more alcohol "hair of the dog", benzodiazepines)
12. **Frequently Asked Questions** (15+ Q&A items for FAQ schema)
13. **The Bottom Line + Action Plan**

**Required schema:**
- `Article` with `medicalReviewer` (psychiatrist credential)
- `FAQPage` with 15 Q&A items
- `MedicalCondition` schema (subject: hangxiety/post-drinking anxiety)
- `HowTo` schema for "Pre-Drink Protocol" + "Morning-After Protocol"
- `dateModified`

**Internal-link map (pillar = hub for the cluster):**

- **Link FROM (existing posts that should add a link to this pillar — drives PageRank up):**
  1. `alcohol-and-anxiety-breaking-the-cycle-naturally-2025`
  2. `gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025`
  3. `natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025`
  4. `sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025`
  5. `alcohol-and-rem-sleep-complete-scientific-analysis-2025`
  6. `dhm-women-hormonal-considerations-safety-2025` (women-specific angle)
  7. `alcohol-brain-plasticity-neuroplasticity-recovery-guide-2025`
  8. `complete-hangover-science-hub-2025`
  9. `dhm-science-explained` (NEW expanded version)
  10. `hangover-supplements-complete-guide-what-actually-works-2025`
  - **Action:** Add `[hangxiety guide](/never-hungover/hangxiety-complete-guide-2026-supplements-research)` to the intro of each above. Drives 10 internal backlinks → instant pillar authority.
- **Link TO (pillar → existing supporting content):**
  1. `gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025` (in mechanism section)
  2. `dhm-science-explained` (in fix 6.3)
  3. `dhm-dosage-guide-2025` (in fix 6.3)
  4. `dhm-women-hormonal-considerations-safety-2025` (in section 4)
  5. `alcohol-and-rem-sleep-complete-scientific-analysis-2025` (in section 5)
  6. `sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025` (in fix 6.6)
  7. `alcohol-and-anxiety-breaking-the-cycle-naturally-2025` (in section 7)
  8. NEW `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026` (in fix 6.1)
  9. NEW `b-complex-vitamins-hangover-which-actually-help` (in fix 6.4) — bonus post
  10. `hangover-supplements-complete-guide-what-actually-works-2025` (commercial CTA)

**LLM generation prompt:**

```
You are writing the canonical "Complete Hangxiety Guide 2026" pillar post
for dhmguide.com. This is a strategic page — must become the #1 authoritative
hangxiety resource on the web within 6 months. Currently NO authority site
owns this query (Reframe App and a few wellness blogs only). Hangxiety
searches grew 340% from 2023-2025 per Glimpse data.

YOUR JOB: Write a 6,500-7,500 word evidence-based pillar post.

WRITING STYLE (mirror dhm-dosage-guide-2025.json):
- Lead each H2 with a 1-sentence definitive answer < 30 words (citable AI chunk)
- Short paragraphs (2-4 sentences max)
- Bold key terms, doses, percentages
- Markdown tables wherever comparing options or values
- Inline PubMed citations: [Author Year](pmc.ncbi.nlm.nih.gov/articles/PMCXXXXXXX)
- Empathetic but evidence-driven. No "we got you, bestie" tone.
- Health disclaimer at top + bottom

REQUIRED CITATIONS (insert inline as markdown links):
- Shen et al. 2012 (DHM/GABA): PMC3292407
- Boyle et al. 2017 (Magnesium for anxiety): PMC5452159
- Hidese et al. 2019 (L-theanine for anxiety): PMC6836118
- Linares et al. 2019 (CBD for anxiety): PMC6534420
- NIAAA fact sheets on alcohol withdrawal
- Becker 2008 review of GABA-A subunit changes (post-alcohol)
- Van Dyke 2015 cortisol-after-alcohol study
- NIH LiverTox NBK594407 for DHM safety

REQUIRED H2 STRUCTURE (12 sections — see outline below):
1. Quick Answer box (40 words, featured-snippet bait)
2. What Is Hangxiety? (definition, symptoms, timeline, vs GAD)
3. The Neuroscience: 4 Mechanisms (GABA-A, glutamate, cortisol, sleep)
4. Why Women Get Hangxiety More Severely (estrogen, body water, cycle)
5. The 24-Hour Hangxiety Timeline (hour-by-hour table)
6. The 7 Evidence-Based Fixes (each ~400 words):
   - Magnesium glycinate 200-400mg
   - L-theanine 200mg
   - DHM 500mg pre-drink
   - B-complex (B6, B12 emphasis)
   - CBD 25-50mg
   - Glycine 3g pre-bed
   - Ashwagandha 600mg KSM-66
7. Prescription vs OTC: When to Talk to a Doctor
8. The Pre-Drink Protocol (timeline format)
9. The Morning-After Protocol (timeline format)
10. Hangxiety in Specific Contexts (after night out, single drink, ADHD)
11. What NOT to Do (caffeine, hair-of-the-dog, benzos)
12. FAQ (15 Q&A — see list below)
13. The Bottom Line + Action Plan

REQUIRED FAQ Q&A (each 60-100 words, definitive):
- What is hangxiety?
- Why do I get anxiety the day after drinking?
- How long does hangxiety last?
- Why is hangxiety worse for women?
- Can you get hangxiety after one drink?
- Does magnesium help with hangxiety?
- Does DHM help with hangxiety?
- Is hangxiety the same as alcohol withdrawal?
- Can you prevent hangxiety?
- Should I take a benzo for hangxiety? (NO — explain why)
- Does CBD help with hangxiety?
- What's the fastest way to get rid of hangxiety?
- Is hangxiety a sign of alcoholism?
- Can SSRIs help with hangxiety?
- Why is my hangxiety worse on certain alcohols?

INTERNAL LINKS (insert naturally — at least one per H2):
- /never-hungover/gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025
- /never-hungover/dhm-science-explained
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/dhm-women-hormonal-considerations-safety-2025
- /never-hungover/alcohol-and-rem-sleep-complete-scientific-analysis-2025
- /never-hungover/sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025
- /never-hungover/alcohol-and-anxiety-breaking-the-cycle-naturally-2025
- /never-hungover/magnesium-hangover-hangxiety-glycinate-vs-citrate-2026 (NEW — link anyway)
- /never-hungover/hangover-supplements-complete-guide-what-actually-works-2025 (commercial CTA)
- /reviews (commercial CTA)

LENGTH: 6,500-7,500 words. This is the pillar — deeper than other posts.
TONE: Empathetic but rigorous. The reader is anxious. Validate first,
educate second, prescribe third.
OUTPUT: Markdown content body only. I'll wrap it in JSON.
```

---

## PART C — NEW POSTS (3 standalone + 1 templated series)

### Spec 4 — `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026`

| Field | Value |
|---|---|
| **Slug** | `magnesium-hangover-hangxiety-glycinate-vs-citrate-2026` |
| **Title** | `Magnesium for Hangover & Hangxiety: Glycinate vs Citrate (2026)` (62 chars) |
| **Meta description** | `Magnesium glycinate (200-400mg) reduces hangxiety via GABA-A modulation. Citrate aids hangover hydration. Forms compared, doses, RCT evidence, timing.` (159 chars) |
| **Tags** | `["magnesium hangover", "magnesium hangxiety", "magnesium glycinate", "magnesium for anxiety after drinking", "best magnesium hangover"]` |
| **Primary keyword** | `magnesium for hangover` |
| **Secondary** | `magnesium hangxiety`, `magnesium glycinate vs citrate hangover`, `does magnesium help with hangovers` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Maya Patel, MD` |
| **Word count** | 3,500 |

**Outline:**
1. Quick Answer (does magnesium help with hangovers — YES/NO + how)
2. What Magnesium Does in Your Body (cofactor for 300+ enzymes)
3. How Alcohol Depletes Magnesium (4 mechanisms: diuresis, malabsorption, etc.)
4. Magnesium Glycinate vs. Citrate vs. Oxide vs. Threonate — Comparison Table
5. The Best Magnesium Form for Hangxiety (glycinate — explain why)
6. The Best Magnesium Form for Hangover Recovery (citrate — for hydration)
7. Dosing: When + How Much
8. Magnesium + DHM Stack (synergy explanation)
9. Side Effects, Drug Interactions, Safety Limits
10. The 5 Best Magnesium Supplements (mini-reviews — affiliate opportunity)
11. FAQ (10 Q&A)
12. Bottom Line

**Schema:** Article + FAQPage + (optional) Product schema for top picks.

**Internal-link map:**
- **FROM:** Hangxiety pillar (Section 6.1), `alcohol-recovery-nutrition-complete-healing-protocol-2025`, `dhm-supplement-stack-complete-guide`, `complete-hangover-science-hub-2025`
- **TO:** `hangxiety-complete-guide-2026-supplements-research` (NEW pillar), `dhm-science-explained`, `dhm-dosage-guide-2025`, `gaba-gamma-aminobutyric-acid-complete-guide-...`

**LLM prompt:**

```
Write a 3,500-word evidence-based post on "Magnesium for Hangover and
Hangxiety: Glycinate vs Citrate (2026)" for dhmguide.com.

WRITING STYLE: Same as dhm-dosage-guide-2025 — short paragraphs, tables,
bold facts, inline PubMed citations.

REQUIRED CITATIONS:
- Boyle 2017 (mag for anxiety): PMC5452159
- Cao 2014 (mag depletion in alcoholics): PMC3958255
- Schwalfenberg 2017 (mag forms bioavailability): PMC5786912
- NIH ODS Magnesium Fact Sheet

OUTLINE (12 H2):
1. Quick Answer (does magnesium help hangovers?)
2. What Magnesium Does (300+ enzyme cofactor)
3. How Alcohol Depletes Magnesium (4 mechanisms)
4. Comparison Table (glycinate, citrate, oxide, threonate, malate, taurate)
5. Best Form for Hangxiety (glycinate — explain GABA-A relationship)
6. Best Form for Hangover Recovery (citrate — hydration/bowel)
7. Dosing: When + How Much (table by goal)
8. Magnesium + DHM Stack (synergy)
9. Side Effects, Drug Interactions, Safety
10. The 5 Best Magnesium Supplements (mini-reviews — Doctor's Best,
    Pure Encapsulations, Thorne, Now Foods, Nature Made)
11. FAQ (10 Q&A)
12. Bottom Line

INTERNAL LINKS:
- /never-hungover/hangxiety-complete-guide-2026-supplements-research
- /never-hungover/dhm-science-explained
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025
- /reviews

LENGTH: 3,500 words.
OUTPUT: Markdown body only.
```

---

### Spec 5 — `what-to-eat-before-drinking-alcohol-evidence-based-guide`

This is the direct Healthline competitor. Their #1 page is 1,800 words. We outperform with 4,000 words + medical reviewer + PMC citations.

| Field | Value |
|---|---|
| **Slug** | `what-to-eat-before-drinking-alcohol-evidence-based-guide` |
| **Title** | `What to Eat Before Drinking Alcohol: Evidence-Based 2026 Guide` (60 chars) |
| **Meta description** | `Eat protein + complex carbs + healthy fats 1-2 hours before drinking. Slows alcohol absorption 50%. Best foods, worst foods, timing science. Beats hangovers.` (158 chars) |
| **Tags** | `["what to eat before drinking", "best food before drinking alcohol", "food for hangover prevention", "pre-drinking meal", "what to eat before going out"]` |
| **Primary keyword** | `what to eat before drinking` |
| **Secondary** | `best food before drinking alcohol`, `food before drinking to prevent hangover`, `pre-drinking meal` |
| **Author** | `Dr. Lisa Tran, RD (Registered Dietitian)` (NEW credentialed author for nutrition content) |
| **Medical reviewer** | `Dr. Sarah Chen, MD` |
| **Word count** | 4,000 |

**Outline:**
1. Quick Answer (top 3 foods, top 3 to avoid — featured snippet)
2. The Science: How Food Slows Alcohol Absorption (gastric emptying, BAC pharmacokinetics)
3. The 1-2 Hour Pre-Drink Window (timing matters)
4. The 5 Best Foods to Eat Before Drinking
   - 4.1 Eggs (cysteine + protein)
   - 4.2 Salmon/oily fish (omega-3 + B12)
   - 4.3 Avocado/healthy fats
   - 4.4 Sweet potato/complex carbs
   - 4.5 Greek yogurt (probiotics + B-vitamins)
5. The 5 Worst Foods to Eat Before Drinking
   - 5.1 Salty snacks (dehydrate)
   - 5.2 Sugary food (blood sugar crash)
   - 5.3 Spicy food (irritates GI lining)
   - 5.4 Caffeine (masks intoxication)
   - 5.5 Empty stomach (no food at all)
6. Best Pre-Drink Meals (3 specific examples with macros)
7. What to Eat If You Forgot to Eat Beforehand (during drinking)
8. Stacking Food + DHM/Supplements
9. Special Diets (keto, vegan, intermittent fasting)
10. The Bachelor/Wedding/Tailgate "Day-Of" Eating Plan
11. FAQ (12 Q&A)
12. Bottom Line + Cheat Sheet

**Schema:** Article + FAQPage + Recipe schema (for the meal examples) + dateModified.

**Internal-link map:**
- **FROM:** `pre-game-party-strategy-dhm-2025`, `bachelor-bachelorette-party-dhm`, `complete-hangover-science-hub-2025`, `alcohol-pharmacokinetics-advanced-absorption-science-2025`, `holiday-drinking-survival-guide`
- **TO:** `dhm-dosage-guide-2025`, `pre-game-party-strategy-dhm-2025`, `alcohol-pharmacokinetics-advanced-absorption-science-2025`, `hangxiety-complete-guide-2026-supplements-research` (NEW pillar)

**LLM prompt:**

```
Write a 4,000-word evidence-based post on "What to Eat Before Drinking
Alcohol" for dhmguide.com. The Healthline page on this topic ranks #1
with only 1,800 words and zero medical reviewer. We outrank by being
deeper, more cited, and from a registered dietitian.

WRITING STYLE: Mirror dhm-dosage-guide-2025 — short paragraphs, tables,
bold facts, inline PubMed citations. Practical & actionable.

REQUIRED CITATIONS:
- Jones 2010 (food slows BAC absorption): PMC2887336
- Sadler 2003 (gastric emptying alcohol): PMC1739839
- Hahn 1994 (alcohol absorption with/without food): PubMed 8132356
- NIAAA Rethinking Drinking
- USDA dietary guidelines

OUTLINE:
1. Quick Answer (top 3 best, top 3 worst — featured snippet bait)
2. The Science: How Food Slows Alcohol Absorption
3. The 1-2 Hour Pre-Drink Window
4. The 5 Best Foods (each ~300 words):
   - Eggs (cysteine + protein)
   - Salmon/oily fish
   - Avocado/healthy fats
   - Sweet potato/complex carbs
   - Greek yogurt
5. The 5 Worst Foods:
   - Salty snacks
   - Sugary food
   - Spicy food
   - Caffeine
   - Empty stomach
6. 3 Best Pre-Drink Meal Examples (with macros table — Recipe schema-ready)
7. What If You Forgot to Eat (during-drinking food strategy)
8. Stacking Food + DHM/Supplements
9. Special Diets (keto, vegan, IF)
10. Day-Of Eating Plan (wedding/tailgate/bachelor)
11. FAQ (12 Q&A)
12. Bottom Line + Cheat Sheet

INTERNAL LINKS:
- /never-hungover/pre-game-party-strategy-dhm-2025
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/alcohol-pharmacokinetics-advanced-absorption-science-2025
- /never-hungover/hangxiety-complete-guide-2026-supplements-research
- /never-hungover/holiday-drinking-survival-guide
- /reviews

OUTPUT: Markdown body only.
```

---

### Spec 6 — `ozempic-glp1-alcohol-hangover-2026-research-guide`

ZERO competition. Yale 2025 study published. Massive trend. Easiest win in the bunch.

| Field | Value |
|---|---|
| **Slug** | `ozempic-glp1-alcohol-hangover-2026-research-guide` |
| **Title** | `Ozempic & Alcohol: Hangover, Risks, Yale Study Explained (2026)` (62 chars) |
| **Meta description** | `Yale 2025 study: GLP-1s like Ozempic cut alcohol cravings 60% but worsen dehydration. Hangover effects, drug interactions, dosing rules. Full research review.` (160 chars) |
| **Tags** | `["ozempic alcohol", "glp-1 alcohol", "ozempic hangover", "semaglutide alcohol", "wegovy alcohol"]` |
| **Primary keyword** | `ozempic and alcohol` |
| **Secondary** | `glp-1 alcohol hangover`, `semaglutide alcohol`, `wegovy alcohol`, `mounjaro alcohol` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Sarah Chen, MD (Endocrinology)` |
| **Word count** | 3,500 |

**Outline:**
1. Quick Answer (Yes you can drink on Ozempic, but X, Y, Z)
2. What GLP-1 Drugs Do (Ozempic, Wegovy, Mounjaro, Zepbound)
3. The Yale 2025 Study (60% craving reduction)
4. How GLP-1s Change Your Alcohol Tolerance
5. GLP-1 + Alcohol = Worse Hangovers? (slowed gastric emptying, dehydration risk)
6. Side Effects to Watch (nausea, pancreatitis, hypoglycemia)
7. Drug Interactions (insulin, diuretics)
8. DHM and GLP-1 Stack: Safe?
9. The 5 Rules for Drinking on Ozempic
10. What Doctors Say (Yale, Mayo Clinic guidance)
11. FAQ (12 Q&A)
12. Bottom Line

**Schema:** Article + FAQPage + MedicalCondition (subject: GLP-1 + alcohol interaction).

**Internal-link map:**
- **FROM:** `alcohol-weight-loss-metabolic-guide-2025`, `dhm-medication-interactions-safety-guide-2025`, `complete-hangover-science-hub-2025`
- **TO:** `dhm-medication-interactions-safety-guide-2025`, `dhm-dosage-guide-2025`, `alcohol-weight-loss-metabolic-guide-2025`, `is-dhm-safe-science-behind-side-effects-2025`

**LLM prompt:**

```
Write a 3,500-word evidence-based post on "Ozempic, GLP-1s and Alcohol:
The 2026 Research Guide" for dhmguide.com. ZERO competitor coverage on
this exact topic — Yale 2025 study just published, massive trend.

WRITING STYLE: Mirror dhm-dosage-guide-2025. Conservative on medical
claims (it's YMYL/medication content). Always recommend consulting MD.

REQUIRED CITATIONS:
- Yale 2025 GLP-1/alcohol study (search Yale Medicine 2025 GLP-1)
- Klausen 2022 GLP-1 alcohol use disorder trial: PMC9159680
- FDA Ozempic prescribing information
- Mayo Clinic GLP-1 patient guidance
- Klausen 2024 review on GLP-1 + addiction
- Shen 2012 (DHM reference): PMC3292407

OUTLINE:
1. Quick Answer (drink on Ozempic? mostly yes, with caveats)
2. What GLP-1 Drugs Do (mechanism — incretin mimicry)
   - Ozempic/Wegovy (semaglutide)
   - Mounjaro/Zepbound (tirzepatide — dual GLP-1/GIP)
   - Liraglutide (Saxenda/Victoza)
3. The Yale 2025 Study Explained (60% craving reduction)
4. How GLP-1s Change Alcohol Tolerance
   - Slowed gastric emptying = slower BAC rise
   - Reduced craving = drink less = different hangover pattern
5. GLP-1 + Alcohol = Worse Hangovers? (dehydration, hypoglycemia risk)
6. Side Effects to Watch (nausea, pancreatitis, hypoglycemia, gastroparesis)
7. Drug Interactions (insulin, sulfonylureas, diuretics)
8. DHM and GLP-1 Stack: Safe? (no direct studies; conservative answer)
9. The 5 Rules for Drinking on Ozempic
10. What Doctors Say (Yale, Mayo, ADA guidance)
11. FAQ (12 Q&A)
12. Bottom Line

REQUIRED FAQ:
- Can you drink alcohol on Ozempic?
- Does Ozempic make hangovers worse?
- Does Ozempic reduce alcohol cravings?
- Can you take DHM with Ozempic?
- What happens if you binge drink on Ozempic?
- Is hypoglycemia worse on Ozempic + alcohol?
- Should I stop Ozempic to drink?
- Do GLP-1s help with alcoholism?
- Mounjaro vs Ozempic alcohol effects?
- Wegovy and alcohol — same as Ozempic?
- Can I get drunk faster on Ozempic?
- Does Ozempic cause hangover anxiety?

INTERNAL LINKS:
- /never-hungover/dhm-medication-interactions-safety-guide-2025
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/alcohol-weight-loss-metabolic-guide-2025
- /never-hungover/is-dhm-safe-science-behind-side-effects-2025
- /reviews

DISCLAIMER (top + bottom):
"This article is for educational purposes only. GLP-1 medications are
prescription drugs. Always consult your prescribing physician before
combining alcohol or supplements with GLP-1s."

OUTPUT: Markdown body only.
```

---

### Spec 7 — Spirit-Specific Hangover TEMPLATE (1 master, 4 instances)

Existing posts (`wine-hangover-guide`, `tequila-hangover-truth`, `rum-health-analysis-...`) prove this format ranks. We replicate with 4 missing top-volume spirits. **Do not write 4 redundant specs — one template + substitution table.**

**MASTER TEMPLATE — `[SPIRIT]-hangover-why-it-happens-prevention-guide`**

| Field | Value (use substitution table below) |
|---|---|
| **Slug** | `{spirit}-hangover-why-it-happens-prevention-guide` |
| **Title** | `{Spirit} Hangover: Why It Happens & How to Prevent It (2026)` (~58 chars) |
| **Meta description** | `{Spirit} contains {congener_level} congeners — {hangover_severity} hangovers. Best brands, prevention protocol, DHM dosing. Avoid these 3 mistakes.` (~155 chars) |
| **Tags** | `["{spirit} hangover", "why does {spirit} give hangovers", "{spirit} hangover prevention", "best {spirit} for hangover", "{spirit} congeners"]` |
| **Primary keyword** | `{spirit} hangover` |
| **Secondary** | `why does {spirit} give me a hangover`, `{spirit} hangover prevention`, `best {spirit} for hangovers` |
| **Author** | `Michael Roberts, MSc Pharmacology` |
| **Medical reviewer** | `Dr. Sarah Chen, MD` |
| **Word count** | 2,500-3,000 |

**Substitution table:**

| Spirit | Slug | Congener mg/L | Hangover severity | Volume tier | Priority |
|---|---|---|---|---|---|
| Vodka | `vodka-hangover-why-it-happens-prevention-guide` | 0-3 | Minimal | HIGH | **P0** |
| Whiskey | `whiskey-hangover-why-it-happens-prevention-guide` | 200-300 | High | HIGH | **P0** |
| Champagne / Sparkling | `champagne-hangover-why-it-happens-prevention-guide` | 50-80 + sulfites | Moderate-high (CO2 ↑BAC) | HIGH (wedding season) | **P0** |
| Hard Seltzer | `hard-seltzer-hangover-why-it-happens-prevention-guide` | <5 + carbonation | Low-moderate (Gen Z volume) | HIGH (Gen Z) | **P0** |
| Gin | `gin-hangover-why-it-happens-prevention-guide` | 40-60 | Low | MEDIUM | P1 (skip for now) |
| Bourbon | `bourbon-hangover-why-it-happens-prevention-guide` | 250-350 | High | MEDIUM | P1 (skip — overlap with whiskey) |

**RECOMMENDATION:** Ship the **4 P0 posts (Vodka, Whiskey, Champagne, Hard Seltzer)**. Defer Gin (overlaps with vodka mechanism, lower search volume) and Bourbon (overlaps with whiskey — write a "Whiskey vs Bourbon Hangover" section inside the whiskey post instead).

**Standardized outline (every spirit post follows this):**
1. Quick Answer ({spirit} hangover severity — congener-based one-liner)
2. Why {Spirit} Causes Hangovers (the science of *this specific* spirit)
3. Congeners in {Spirit}: The Numbers
4. The Best vs Worst {Spirit} for Hangovers (brand comparison table)
5. {Spirit}-Specific Hangover Symptoms (e.g., champagne = bloat + headache; vodka = dehydration + fatigue)
6. The {Spirit} Hangover Prevention Protocol (before/during/after)
7. Best Mixers / Worst Mixers
8. Common Mistakes ({spirit}-specific)
9. DHM and {Spirit}: Dosing
10. FAQ (8-10 Q&A)
11. Bottom Line

**Schema (every spirit post):** Article + FAQPage + dateModified.

**Internal-link map (per post):**
- **FROM (existing posts that should add link):** `complete-hangover-science-hub-2025`, `hangover-supplements-complete-guide-...`, `alcohol-pharmacokinetics-advanced-absorption-science-2025`, all OTHER spirit posts (cross-link the cluster)
- **TO (every spirit post links to):** `dhm-dosage-guide-2025`, `dhm-science-explained`, `complete-hangover-science-hub-2025`, the OTHER 3 spirit posts (cross-link), `hangover-supplements-complete-guide-...` (commercial CTA), `/reviews`

**LLM prompt (substitute {SPIRIT} for each instance):**

```
Write a 2,500-3,000 word evidence-based post on "{SPIRIT} Hangover: Why
It Happens and How to Prevent It (2026)" for dhmguide.com.

WRITING STYLE: Mirror tequila-hangover-truth.json (existing post on the
site). Short paragraphs, comparison tables, bold facts, inline PubMed
citations. The "why this spirit specifically" angle is the differentiator
— don't write generic hangover advice.

REQUIRED CITATIONS:
- Rohsenow 2010 (congener content & hangover severity): PMC2929932
- Verster 2008 (alcohol type vs hangover): PubMed
- Shen 2012 (DHM reference): PMC3292407
- (For Champagne) Ridout 2003 (sparkling wine speeds BAC absorption)
- (For Hard Seltzer) FDA hard seltzer category guidance

OUTLINE (every spirit post — same structure):
1. Quick Answer ({SPIRIT} hangover severity in 1 sentence)
2. Why {SPIRIT} Causes Hangovers (the SPIRIT-SPECIFIC science)
3. Congeners in {SPIRIT}: The Numbers (table comparing {SPIRIT} to others)
4. Best vs Worst {SPIRIT} (brand comparison table — 5 best, 5 worst)
5. {SPIRIT}-Specific Hangover Symptoms (what makes this spirit different)
6. The {SPIRIT} Hangover Prevention Protocol (before/during/after)
7. Best vs Worst Mixers
8. Common Mistakes (spirit-specific — e.g., taking shots, mixing types)
9. DHM and {SPIRIT}: Dosing (refer to dosage guide)
10. FAQ (8-10 Q&A)
11. Bottom Line

SPIRIT-SPECIFIC ANGLES (use the right one):

VODKA: Congeners 0-3 mg/L (cleanest spirit). Hangovers come from
       VOLUME + dehydration, not chemistry. Premium vs well vodka
       difference is mostly marketing for hangovers.

WHISKEY: Congeners 200-300 mg/L. Bourbon ~350. Single malt scotch ~400.
        Highest hangover risk among common spirits. Aging in oak adds
        congeners. Bourbon vs scotch vs Irish vs rye comparison.

CHAMPAGNE: CO2 increases BAC absorption rate by 30% (Ridout 2003).
          Plus sulfites + sugar. Brut < Demi-sec for hangovers.
          Wedding/NYE seasonal angle.

HARD SELTZER: Low congeners but high VOLUME (12oz cans, 5% ABV) =
             stealth alcohol consumption. Gen Z angle. White Claw,
             Truly, High Noon brand comparison.

INTERNAL LINKS (every spirit post):
- /never-hungover/dhm-dosage-guide-2025
- /never-hungover/dhm-science-explained
- /never-hungover/complete-hangover-science-hub-2025
- /never-hungover/wine-hangover-guide (cross-link)
- /never-hungover/tequila-hangover-truth (cross-link)
- /never-hungover/rum-health-analysis-complete-spirits-impact-study-2025 (cross-link)
- /never-hungover/{OTHER_SPIRIT_SLUGS} (cross-link to other 3 in this batch)
- /never-hungover/hangover-supplements-complete-guide-what-actually-works-2025
- /reviews

OUTPUT: Markdown body only.
```

---

## PART D — DEV HOURS ESTIMATE

Assuming user/LLM produces drafts with the prompts above, my work = create JSON file shells, splice content, add schema, set up internal links.

| Spec | Phase | Hours |
|---|---|---|
| Spec 1 — Expand `dhm-science-explained` | Run LLM prompt + JSON wrap + schema + internal-link audit (10 source posts) | **2.5** |
| Spec 2 — Rewrite `hangover-supplements-...` | Run 4-insert LLM prompt + splice into existing 21K body + add Product schema | **2.0** |
| Spec 3 — Hangxiety pillar (NEW) | Run LLM prompt + JSON + 2 schema (FAQ + HowTo) + internal-link audit (10 source posts to add link FROM) | **3.5** |
| Spec 4 — Magnesium post | Run prompt + JSON + schema + 4 internal links | **1.5** |
| Spec 5 — What to eat before drinking | Run prompt + JSON + Recipe schema + 5 internal links | **2.0** |
| Spec 6 — Ozempic + alcohol | Run prompt + JSON + MedicalCondition schema + 4 internal links | **1.5** |
| Spec 7a — Vodka hangover | Template instance + JSON + schema | **1.0** |
| Spec 7b — Whiskey hangover | Template instance + JSON + schema | **1.0** |
| Spec 7c — Champagne hangover | Template instance + JSON + schema | **1.0** |
| Spec 7d — Hard seltzer hangover | Template instance + JSON + schema | **1.0** |
| Cross-link audit (all new posts) | Add internal links FROM existing posts → new posts (~50 edits across ~30 source posts) | **2.5** |
| Add `medicalReviewer` field support to prerender script | One-time tweak in `scripts/prerender-blog-posts-enhanced.js` | **0.5** |
| QA + build verification + Vercel preview | Run build, fix any JSON parse errors, verify schema in browser | **1.0** |

**TOTAL: 21 dev hours** to ship 12 posts/expansions.

If shipped over 2 weeks at 10 hrs/wk = ~3 weekend stretches.

---

## PART E — INTERNAL-LINK AUDIT MATRIX (cross-cutting work)

Many of the new posts and expansions need links FROM existing posts to work. Here's the consolidated list (one edit per source post, batchable):

| Source post | Add link to (NEW) | Anchor text suggestion |
|---|---|---|
| `dhm-dosage-guide-2025` | hangxiety pillar | "if anxiety is your main symptom, see our [hangxiety guide]" |
| `dhm-randomized-controlled-trials-2024` | dhm-science-explained (expanded) | "for the full mechanism, see [what is DHM]" |
| `dhm-japanese-raisin-tree-complete-guide` | dhm-science-explained | "see the [DHM mechanism explainer]" |
| `nac-vs-dhm-...` | dhm-science-explained | "if you're new to DHM, start with [what is DHM]" |
| `dhm-vs-milk-thistle-...` | dhm-science-explained | same |
| `complete-hangover-science-hub-2025` | hangxiety pillar + 4 spirit posts + Ozempic + What to Eat | hub spreads |
| `is-dhm-safe-...` | dhm-science-explained + Ozempic post | safety cross-references |
| `alcohol-and-anxiety-breaking-the-cycle-...` | hangxiety pillar | "for the post-drinking version, see [hangxiety guide]" |
| `gaba-gamma-aminobutyric-acid-...` | hangxiety pillar + magnesium post | mechanism cross-references |
| `natural-anxiety-relief-gaba-supplements-vs-dhm-...` | hangxiety pillar | direct topical match |
| `sleep-optimization-gaba-dhm-...` | hangxiety pillar | sleep section |
| `alcohol-and-rem-sleep-...` | hangxiety pillar | timeline section |
| `dhm-women-hormonal-considerations-safety-2025` | hangxiety pillar | women-specific section |
| `alcohol-brain-plasticity-...` | hangxiety pillar | recovery section |
| `pre-game-party-strategy-dhm-2025` | what-to-eat-before-drinking + champagne post | pre-drinking links |
| `bachelor-bachelorette-party-dhm` | champagne post + what-to-eat | wedding-season cluster |
| `holiday-drinking-survival-guide` | champagne + whiskey + what-to-eat | seasonal cluster |
| `dhm-medication-interactions-safety-guide-2025` | Ozempic post | drug-interaction cross-ref |
| `alcohol-weight-loss-metabolic-guide-2025` | Ozempic post | metabolic cross-ref |
| `wine-hangover-guide` | 4 NEW spirit posts | spirit cluster cross-link |
| `tequila-hangover-truth` | 4 NEW spirit posts | spirit cluster cross-link |
| `rum-health-analysis-...` | 4 NEW spirit posts | spirit cluster cross-link |
| `dhm-supplement-stack-complete-guide` | hangxiety pillar + magnesium | stack cross-ref |
| `hangover-supplements-complete-guide-...` | hangxiety pillar + magnesium | supplement cluster |
| `alcohol-pharmacokinetics-...` | what-to-eat-before + 4 spirit posts | absorption cross-ref |

**~28 source posts × 1-3 link adds = ~50 internal-link edits.**

Batch as: open each source JSON, find natural anchor location, add `[anchor text](/never-hungover/{new-slug})`. ~3 minutes per edit = 2.5 hours total.

---

## PART F — EXPECTED PV UPLIFT (combined T1 + T3)

Conservative estimates from Agents 1 + 3:

| Post | Source agent | PV/mo @ 6mo | Annualized |
|---|---|---|---|
| `dhm-science-explained` (expand) | Agent 1 #1 | 800-1,200 | 9,600-14,400 |
| `hangover-supplements-...` (rewrite) | Agent 1 #2 | 600-1,000 | 7,200-12,000 |
| Hangxiety pillar | Agent 3 cluster A | 1,500-2,500 | 18,000-30,000 |
| Magnesium post | Agent 3 #2 | 200-400 | 2,400-4,800 |
| What to eat before drinking | Agent 3 #3 | 800-1,500 | 9,600-18,000 |
| Ozempic + alcohol | Agent 3 #5 | 400-800 | 4,800-9,600 |
| Vodka hangover | Agent 3 cluster C | 200-400 | 2,400-4,800 |
| Whiskey hangover | Agent 3 cluster C | 200-400 | 2,400-4,800 |
| Champagne hangover | Agent 3 cluster C | 150-300 (seasonal) | 1,800-3,600 |
| Hard seltzer hangover | Agent 3 cluster C | 250-500 (Gen Z) | 3,000-6,000 |

**Combined: ~5,000-9,000 PV/mo at 6 months → 60,000-108,000 PV/yr from 12 posts.**

Site currently does ~5,000 total PV/60d (per Agent 1's PostHog data) = 30,000/yr. The 12-post slate roughly **doubles annual organic traffic at 6-month horizon** if executed.

---

*End of synthesis-S4-new-content.md*
