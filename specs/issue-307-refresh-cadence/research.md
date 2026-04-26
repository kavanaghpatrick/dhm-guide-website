# Issue #307 — Quarterly Content Refresh Cadence (Research)

## Source material

| Source | Key takeaway |
|---|---|
| `docs/traffic-growth-2026-04-26/09-content-freshness.md` (T9) | Refresh strategy alone can 1.8-2.6x site traffic in 9 months. Top 5 = 47.7% of traffic. ~3.5 hrs work for +540 to +1,080 PV/mo. |
| `docs/traffic-growth-2026-04-26/00-MASTER-PLAN.md` §Phase 5 | Cadence: weekly (15min), monthly (2.5hrs), quarterly (8-12hrs), annual (40hrs), year-transition (6hrs). |
| `scripts/lib/get-date-modified.js` (#286) | Auto-resolves dateModified: explicit field > git commit date > publish date. Means refresh just requires touching the JSON in git or setting `dateModified` field. |
| `scripts/posthog-query.sh` (#308) | Subcommands: `top-pv` (top-20 by PV/30d), `daily-pv` (90d trend), `engagement-watchdog`, `top-ctr`. These power refresh-trigger detection. |
| CLAUDE.md Pattern #11 | Prerendered SPAs have dual SEO sources. After JSON edit + git commit, dateModified flows automatically because get-date-modified.js falls back to git commit date. |
| CLAUDE.md Pattern #12 | Batch small changes; backward compatibility on tracking. |

## Banned PMC IDs (verified broken in #299/#300/#301)

| PMC ID | Topic | Verified broken |
|---|---|---|
| PMC4082193 | Norway terror research | yes — not relevant to DHM |
| PMC8429066 | Transdermal alcohol biosensor | yes — broken/wrong topic |
| PMC8259720 | Gut microbiome / autoimmune | yes — broken/wrong topic |

These appeared in body content from a previous bulk citation pass. Future refreshes must NOT re-introduce them. Verify any new PMC ID via WebFetch before adding.

## Outline of `docs/content-refresh-workflow.md`

1. Why this matters (T9 quote: 1.8-2.6x traffic; YMYL freshness signal)
2. Quarterly refresh cycle (~30 min/post, top-10 by PV)
   - Per-post checklist: dateModified, 1-2 citations, product/price update, Quick Answer, link check
3. Year transition (Dec/Jan): -2025 → year-agnostic OR -2026 + 301
4. Annual full review (Apr or Sep): YMYL compliance, PMC re-verification
5. Refresh trigger signals: PV decay (top-pv), GSC position drop, new research, competitor outranks
6. Refresh checklist template (concrete, copy-pasteable)
7. Banned PMC IDs reference
8. Cadence metrics: PV delta 90d before/after, daily-pv aggregate, GSC position

## Key implementation decisions

- **Documentation only.** Reference existing scripts (#286 helper, #308 dashboard). Don't propose new tooling.
- **Runbook tone, not essay.** Concrete bullet lists, copy-pasteable commands.
- **Per-post effort target: 30 min.** Quarterly batch of top-10 = 5 hours.
- **Year-agnostic slugs by default.** Pattern #6 (pure deletion) applies — drop the year stamp where possible to avoid annual rotation cost.
- **dateModified resolution is automatic post-#286.** Just commit the JSON edit; git commit date becomes the dateModified. Explicit `dateModified` field only needed for back-dated refreshes.

## Constraints from spec

- No code changes
- No new scripts (reference existing)
- Practical runbook readability (executor friendly)
- Final commit message: `docs: add quarterly content refresh workflow (#307)`
- PR body: `Closes #307. Refs #283.`
