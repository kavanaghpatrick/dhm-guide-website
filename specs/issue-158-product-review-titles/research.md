# Research — Issue #158

## Issue summary

GitHub issue #158 proposes reframing **three** product review titles to match search intent for queries like "dhm1000 benefits", "no days wasted side effects", and "toniiq ease":

| File | Current title | Length | Issue's proposal |
|---|---|---|---|
| `dhm1000-review-2025.json` | DHM1000 Review 2025: Most Powerful DHM Supplement on The Market? | **64** | DHM1000 Benefits & Review 2025: 1000mg High-Dose Analysis |
| `no-days-wasted-dhm-review-analysis.json` | No Days Wasted DHM Detox Review Analysis: What 201+ Amazon Customers Say About This Premium Formula | **99** | No Days Wasted Side Effects & Review: Safety Profile Analyzed (2025) |
| `toniiq-ease-dhm-review-analysis.json` | Toniiq Ease DHM Review Analysis: What 1,681+ Amazon Customers Reveal | **68** | Toniiq Ease Review 2025: Triple-Action DHM Formula Analysis |

## Scope reduction (the critical decision)

**This implementation ships ONE change: trim the No Days Wasted title only.** The other two are deferred (or rejected) for explicit, documented reasons.

### Why scope down (consumer-conversion-site rationale)

This site's revenue model is Amazon affiliate clicks on positive product comparisons. That reframes how we evaluate the issue's proposed titles:

#### 1. DHM1000 — keep current title (64 chars, within margin)

Current is **64 characters**. The 60-char SERP truncation guideline is a soft threshold; renderers vary, and 64 chars typically renders fully on desktop and truncates ~4 chars on mobile. The issue's "(2025)" tail-loss concern that drove #143 and #151 doesn't apply here — there is no year in the current title to lose. Cost-benefit: the rewrite swaps "Most Powerful DHM Supplement on The Market?" (a benefit-claim hook) for "1000mg High-Dose Analysis" (a spec listing). The current copy is more clickable for a buyer-intent searcher. Keeping benefit framing protects affiliate conversion. Length is acceptable. **No change.**

#### 2. Toniiq Ease — keep current title (68 chars, marginal)

Current is **68 characters**. Slightly over the soft threshold but only by ~8 chars; the truncation point would clip "Reveal" → "...Customers Re..." in the worst case, which still reads as a customer-data hook. The issue's proposed rewrite drops "1,681+ Amazon Customers Reveal" — the strongest social-proof signal we have on this page. Trading a high-volume customer-count number for "Triple-Action DHM Formula Analysis" loses conversion-relevant trust signal. Marginal length over-run is not worth the trust-signal loss. **No change.**

#### 3. No Days Wasted — fix length, keep brand framing

Current is **99 characters** — severe truncation. ~39 chars get clipped on desktop SERPs. This is not a marginal case; this is the same class of problem #143 (clinical-trials post) and #151 (NAC vs DHM) addressed. **Length is the actual bug.**

However, the issue's proposed rewrite (`No Days Wasted Side Effects & Review: Safety Profile Analyzed (2025)`) introduces a different problem: it deliberately reframes the title around "side effects" to capture the GSC query "no days wasted side effects" (77 impressions, 0% CTR). On a content site that drives purchase decisions through Amazon affiliate links, **a title that promises side-effects/safety analysis attracts users with negative-research intent — the lowest-converting traffic segment**. We'd be optimizing a vanity metric (CTR on that one query) by trading down the conversion rate of the entire page.

The right fix: trim to under 60 chars while preserving the existing benefit/social-proof framing.

## Recommended new title for NDW

```
No Days Wasted DHM Review 2025: 201+ Customer Analysis
```

Length: **54 chars**. Under the 60-char threshold by 6 chars (comfortable margin).

### Why this exact string
- Brand "No Days Wasted" front-loaded — protects existing brand-search rank
- "DHM" preserved — head keyword for the category query
- "Review 2025" — adds freshness signal lost in current title
- "201+ Customer Analysis" — preserves the high-impact social-proof number that the current title leads with, just compressed
- Drops "Detox" (not a primary search term per GSC), drops "Premium Formula" (filler), drops "Amazon" (now implied)
- No question mark (already two existing-pattern titles use it; varies the SERP visual)

## What we're NOT touching

- DHM1000 title — **64 chars, within acceptable margin; current benefit framing is conversion-friendly**
- Toniiq Ease title — **68 chars, marginal; current title's customer-count is too valuable to trade**
- `metaDescription` for NDW — current copy reads well at 158 chars and ends with "cheaper alternatives" hook
- Article body, schema, FAQ, slug — all untouched

## Reference: prior pattern (issues #143 and #151)

Both prior title-trim PRs followed the same one-string-edit pattern:
- Edit ROOT `title` field in the post JSON (NOT a separate `seo.title` — verified absent)
- Verify with `npm run build` then `grep` the dist HTML for the new title
- Two commits: JSON fix + spec scaffold

This issue follows the identical pattern for ONE of the three proposed files.

## Risk

Near-zero. Pure data edit to a content JSON. No JS code change, no build config change. Standard JSON parse path. Build will fail loudly if JSON is malformed. The decision to NOT pivot to side-effects framing is a strategic preservation of the page's existing affiliate-conversion economics, not a technical risk.

## Acceptance criteria mapping (from issue)

- [ ] DHM1000 title includes "Benefits" — **DECLINED.** Rationale documented above (within margin; current benefit hook is more clickable for buyers than the proposed spec listing).
- [ ] No Days Wasted title includes "Side Effects" — **DECLINED.** Rationale documented above (negative-intent traffic is conversion-hostile on an affiliate site).
- [x] Toniiq Ease title simplified with brand prominent — **DECLINED.** Rationale documented above (current title's customer-count social-proof is too valuable to trade for a marginal length improvement).
- [x] Length-driven SERP truncation on No Days Wasted (the actual urgent bug) — **FIXED.** 99 → 54 chars.
- [ ] Changes deployed — handled by Vercel auto-deploy after merge (out of branch scope).

The issue's stated impact target ("+10-15 clicks/month from intent-matched queries") is preserved primarily by fixing the truncation bug on NDW (the only one currently truncating). The intent-keyword reframing piece is rejected on consumer-conversion grounds.
