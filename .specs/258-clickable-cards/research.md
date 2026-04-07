# Research: Make /reviews product cards and badges clickable (#258)

## Problem
/reviews has 90 dead clicks (48.9 per 100 views) -- worst on the site. Users tap product names and trust badges expecting them to be links.

## Current State (Reviews.jsx)

### Product Card Structure (lines 750-944)
Each product card is a `<Card>` component rendered inside a `<motion.div>`.

**Already clickable (wrapped in `<a>` tags):**
- Product name / CardTitle (line 771-779) -- links to `product.affiliateLink`
- Price (line 801-809) -- links to `product.affiliateLink`
- Rating/stars (line 783-793) -- links to `product.affiliateLink`
- "Best For" section (line 879-888) -- links to `product.affiliateLink`
- Main CTA button (line 893-905) -- "Check Price on Amazon"

**NOT clickable (dead click targets):**
- Badge (line 767-769): `<Badge>` with text like "Editor's Choice", "Best Value" -- plain component, no link
- Card background/container (line 761): `<Card>` with hover shadow but no link
- "Free Shipping" pill (line 900-902): Inside the CTA `<a>` so technically clickable, but its visual badge style makes users tap it independently
- Trust signals near CTA (lines 931-940): Rating repeat + monthly buyers -- not linked
- "per serving" text (line 810): Not linked
- "servings" text (line 811): Not linked

### Comparison Table (lines 623-744)
Most cells ARE already linked. Brand name (line 662-671), price, per-serving, rating, score, and action button all link to affiliate URLs. Reviews count (line 708) is NOT linked.

### Affiliate URL Source
Each product object has an `affiliateLink` property (e.g., "https://amzn.to/3HSHjgu"). All links use the same URL per product.

### Feature Flag Pattern
- `useFeatureFlag` hook from `src/hooks/useFeatureFlag.js`
- Returns flag value (boolean for simple, string for multivariate)
- Example usage: `const stickyBarVariant = useFeatureFlag('sticky-recommendation-bar-v1', 'control')`
- Conditional rendering: `{stickyBarVariant === 'sticky-bar' && ...}`

### Tracking
- `data-product-name` attribute used on links for affiliate tracking
- `detectPlacement()` in useAffiliateTracking.js uses DOM classes (`.product-card`, `.review-card`)
- `data-placement` attribute checked as override in detectPlacement (line 44)
- `trackElementClick` from posthog used for specific CTA tracking

### Dead Click Analysis (from issue)
- "No Days Wasted DHM Detox" (15 dead clicks) -- product name text (BUT name IS already linked -- likely clicking near it but missing the link, or tapping the badge next to it)
- "Double Wood Supplements DHM" (13) -- same pattern
- "Check Price on Amazon" (11) -- possibly small touch target or clicking badge area
- "Free Shipping" badge (7) -- visual badge style invites clicks

## Key Insight
Product names ARE already clickable links. The dead clicks are likely on:
1. The badge next to the product name (e.g., "Editor's Choice")
2. The card area around the product name (not the link itself)
3. The "Free Shipping" badge visual element
4. Trust signal text near the CTA

The fix should focus on: making badges clickable and potentially making the entire card header area a larger click target.
