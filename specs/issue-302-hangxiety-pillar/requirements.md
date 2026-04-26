# Requirements — Issue #302 Hangxiety Pillar

## Functional

1. **New post JSON** at `src/newblog/data/posts/hangxiety-complete-guide-2026-supplements-research.json`:
   - Title: "The Complete Hangxiety Guide 2026: Why Alcohol Causes Post-Drinking Anxiety & How to Fix It"
   - Slug: `hangxiety-complete-guide-2026-supplements-research`
   - 6,000-7,000 words of body content
   - 12 H2 sections (per research outline)
   - 18 FAQ entries (~50 words/answer for AI-extractability)
   - quickAnswer field (~150 words, definitive head-term answer)
   - 10+ inline PubMed citation links from verified PMC ID list
   - 10 internal links FROM pillar TO spokes (anchor phrases per research)
   - dateModified: 2026-04-26 / date: 2026-04-26
   - readTime: 18, image: null

2. **Registry + index updates**:
   - `src/newblog/data/postRegistry.js` — add dynamic import entry alphabetically
   - `src/newblog/data/metadata/index.json` — append metadata entry

3. **Cluster config update** at `scripts/cluster-config.json`:
   - Append new cluster `hangxiety-mental-health` with pillar + 10 spokes per research

4. **Related posts auto-generation**:
   - Run `node scripts/generate-related-posts.mjs --write-reciprocal`
   - Pillar gets relatedPosts populated; spokes get reciprocal links back

5. **Inbound contextual links** to pillar from 8 high-traffic posts (research §reverse-link)

## Non-functional

- Use ONLY pre-validated PMC IDs (drop PMC4082193/PMC8429066/PMC8259720 globally)
- Medical/scientific tone (YMYL site)
- Match patterns of dhm-science-explained.json (#299) and hangover-supplements (#300)
- Build must succeed (190 prerendered, was 189)
