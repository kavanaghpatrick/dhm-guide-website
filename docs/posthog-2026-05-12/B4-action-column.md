# B4 — Tag /reviews action-column "Check Price" button with `placement: action_column`

## TL;DR

- **Button location:** `src/pages/Reviews.jsx:465-478` — the `<a>` inside the table `<td>` rendered for each row's `Action` column.
- **Current tag:** `data-placement="comparison_table"` (identical to all 5 other affiliate links in the same `<tr>`).
- **Proposed approach:** Option A — **change the single attribute** from `"comparison_table"` to `"action_column"`. Existing `useAffiliateTracking.detectPlacement()` already reads `link.dataset.placement` (`src/hooks/useAffiliateTracking.js:44`), so no JS / hook changes needed. Naming is snake_case, matches existing precedent (`compare_table`, `comparison_table`, `product_card`, `sticky_bar`, `hero`).
- **Why not Option B (explicit `trackElementClick` onClick):** redundant. `affiliate_link_click` already fires via the delegated capture-phase listener and is the high-value conversion event — A5's question is "which placement converts?", which lives on `affiliate_link_click.placement`, not on `element_clicked`.

## Current code (Reviews.jsx:465-478)

```jsx
<td className="py-3 px-4 text-center">
  <a
    href={product.affiliateLink}
    target="_blank"
    rel="nofollow sponsored noopener noreferrer"
    data-placement="comparison_table"          {/* ← conflated with 5 other links in row */}
    data-product-name={product.name}
    data-ratings-version="2026-01-01"
    className={tableCtaClasses}
  >
    {getCtaCopy(true)}
    <ExternalLink className="w-3 h-3" />
  </a>
</td>
```

Other links in the same `<tr>` (Brand@402, Price@416, Per Serving@428, Rating@440, Score@454) all carry `data-placement="comparison_table"` — so every PostHog `affiliate_link_click` event from that row is indistinguishable by placement.

## Proposed patch (UNIFIED DIFF — DO NOT APPLY)

```diff
--- a/src/pages/Reviews.jsx
+++ b/src/pages/Reviews.jsx
@@ -463,11 +463,11 @@ export default function Reviews() {
                       </td>
                       <td className="py-3 px-4 text-center text-gray-700 hidden md:table-cell">{product.reviews.toLocaleString()}</td>
                       <td className="py-3 px-4 text-center">
                         <a
                           href={product.affiliateLink}
                           target="_blank"
                           rel="nofollow sponsored noopener noreferrer"
-                          data-placement="comparison_table"
+                          data-placement="action_column"
                           data-product-name={product.name}
                           data-ratings-version="2026-01-01"
                           className={tableCtaClasses}
                         >
                           {getCtaCopy(true)}
                           <ExternalLink className="w-3 h-3" />
                         </a>
                       </td>
```

That's the entire change. **1 line.** No new state, no new hook calls, no behaviour change in the click handler — `useAffiliateTracking` already passes `link.dataset.placement` straight through to `trackAffiliateClick` → PostHog event `affiliate_link_click.placement`.

## Verification plan

1. **Pre-deploy local check** (60s):
   - `npm run build` — ensure no build break.
   - `npm run dev`, open `/reviews`, DevTools → Network → filter `posthog`, click the orange "Check Price" button in the table. In the request body, confirm `properties.placement === "action_column"` on the `affiliate_link_click` event. Confirm the Brand-name link still emits `"comparison_table"`.
2. **Post-deploy PostHog SQL** (24-48h after merge, mobile + desktop):
   ```
   SELECT properties.placement, count() AS clicks, uniq(distinct_id) AS users
   FROM events
   WHERE event = 'affiliate_link_click'
     AND properties.$current_url ILIKE '%/reviews%'
     AND timestamp > now() - INTERVAL 48 HOUR
   GROUP BY properties.placement
   ORDER BY clicks DESC
   ```
   Expect: a new row with `placement = 'action_column'` and non-zero clicks. Adjacent row `comparison_table` count should *drop by roughly the same amount* (it loses the button's share but keeps the other 5 link types in the row).
3. **Compare to A5's baseline** (`docs/posthog-2026-05-12/03-affiliate.md`): `/reviews` `affiliate_link_click` was 80→121 last window; after the rename, the breakdown should now isolate how much the action-column button contributes vs. the brand/price/rating links. That answers the open question: "did PR #117 add affiliate clicks, or just redistribute them?"
4. **Dashboard backward compatibility:** if any saved PostHog insights filter on `placement = 'comparison_table'` and care about the action button specifically, update them to `placement IN ('comparison_table', 'action_column')` — though A5 found no such consumers in the existing dashboards directory.

## Why not also add `data-track` / `element_type`

`element_clicked` events on `/reviews` already collapse the entire `<tr>` (ancestor has `data-track="product"`, lines 503-506 on the *detail card*, but NOT on the table row — see `Reviews.jsx`). Inside the table, the delegated `useElementTracking.detectElementType` falls through to `internal_link` for the brand link (none of these table links match `[data-track="product"]` since `data-track` lives only on the detail-card `motion.div`). So the action-column button does NOT currently emit `element_clicked` of type `product_card` from inside the table — A5's "no new element_type" finding is the *desired* state. The single source of truth for this button's conversion contribution is `affiliate_link_click.placement`, which is exactly what this 1-line patch fixes.

## Confidence: 5/5

- One-attribute change, no logic, no new dependencies, no rollback risk.
- `useAffiliateTracking.detectPlacement` precedence (`link.dataset.placement` returned before fallback heuristics, line 44) is already proven for `hero`, `sticky_bar`, `product_card_badge`, `product_card_trust`, `compare_table` — `action_column` will behave identically.
- Snake_case matches existing values; PostHog dashboard breakdowns accept any new string value automatically (no schema migration).
- Matches DHM Guide CLAUDE.md "Simplicity First": 1 line deleted-and-replaced, zero added code, follows existing pattern.

---

**Task #14 — investigation + patch proposal — COMPLETE.**
