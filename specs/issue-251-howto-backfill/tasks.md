# Tasks — Issue #251

## T1. Verify environment
- [x] Confirm prerender script reads `post.howTo` (line 258, prerender-blog-posts-enhanced.js)
- [x] Confirm helper `generateHowToSchema` in `src/utils/structuredDataHelpers.js`
- [x] Confirm 2 existing posts have `howTo` field (dhm-dosage-guide-2025, when-to-take-dhm-timing-guide-2025)
- [x] Capture exact key shape: `{name, description, totalTime, supply, steps:[{name,text}]}`

## T2. Add howTo to how-to-cure-a-hangover-complete-science-guide.json
- [ ] Read existing JSON
- [ ] Append howTo block (6 steps: DHM dose, electrolyte hydration, antioxidants/B-complex, light food, headache management with NSAID-not-acetaminophen note, continued hydration)
- [ ] Verify with `node -e "JSON.parse(...)"`

## T3. Add howTo to how-to-get-rid-of-hangover-fast.json
- [ ] Read existing JSON
- [ ] Append howTo block (6 steps from post's "15-Minute Emergency Protocol")
- [ ] Verify with `node -e "JSON.parse(...)"`

## T4. Add howTo to hangover-headache-fast-relief-methods-2025.json
- [ ] Read existing JSON
- [ ] Append howTo block (5 steps from "15-Minute Emergency Hangover Headache Relief Protocol")
- [ ] Verify with `node -e "JSON.parse(...)"`

## T5. Add howTo to hangover-nausea-complete-guide-fast-stomach-relief-2025.json
- [ ] Read existing JSON
- [ ] Append howTo block (6 steps from "5-Minute Nausea Relief Technique" + Tier 1 remedies)
- [ ] Verify with `node -e "JSON.parse(...)"`

## T6. Build verification
- [ ] Run `npm run build`
- [ ] Build exits 0
- [ ] All 4 dist HTML files emit `"@type":"HowTo"` (grep verification)

## T7. Confirm scope
- [ ] `git diff --name-only main` shows ONLY: 4 post JSONs + 4 spec files
- [ ] `dhm-dosage-guide-2025.json` NOT modified
- [ ] `when-to-take-dhm-timing-guide-2025.json` NOT modified

## T8. Commit
- [ ] `feat(content): add HowTo schema data to 4 Tier-1 hangover guide JSONs (#251)` — 4 post JSONs only
- [ ] `chore(spec): scaffold ralph spec artifacts for issue #251` — 4 spec files only
- [ ] Both commits include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer
- [ ] Stay on branch; do NOT push

## Reset expectations note
HowTo schema is ineligible for Google rich-result surfaces post-Sept 2023
for YMYL/health content. Real ROI is **AI Overview / LLM grounding**, not
SERP CTR. PRD's "+20-35% CTR" claim should be reset to 0–5%.
