# [Phase 4] Spirit-specific hangover template + 4 instances (vodka/whiskey/champagne/hard seltzer)

Refs #283. Wine and tequila already exist as posts; spirit-specific is a proven slug pattern.

## Dependencies

- **Should follow #289** (FAQ schema backfill — each spirit-instance benefits from FAQ structure being in place)
- **Should follow #292** (Quick Answer template — applies to each instance for AI-search citation)


## Spec (~6 hrs LLM-assisted)
1. Write ONE master template (variables: spirit name, congener level, distinctive symptoms, why-it-happens explainer, prevention steps, recovery)
2. Generate 4 instances:
   - vodka-hangover-why-it-happens-prevention-guide
   - whiskey-hangover-why-it-happens-prevention-guide
   - champagne-hangover-why-it-happens-prevention-guide
   - hard-seltzer-hangover-why-it-happens-prevention-guide
3. Each ~2,500 words
4. Cross-link siblings (template generates relatedPosts)

Cut from synthesis-S4: gin (overlaps vodka), bourbon (folds into whiskey).

Expected: each instance ranks for its head term within 60 days. Source: synthesis-S4 §6, 03-content-gaps.md cluster #3.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
