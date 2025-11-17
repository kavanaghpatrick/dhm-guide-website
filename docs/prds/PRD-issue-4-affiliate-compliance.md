# PRD: Fix Affiliate Link Compliance (Issue #4)

## Problem Statement
6 Amazon affiliate links missing required `rel="nofollow sponsored"` attributes AND missing FTC-required disclosure text, creating Google penalty risk + legal compliance violations.

## Current State (Evidence)
- **Total affiliate links**: 6
- **Current rel attribute**: `rel="noopener noreferrer"` (security only)
- **Missing**: `nofollow` + `sponsored` + FTC text disclosure
- **Risk**: Google manual action + FTC fines up to $50,120 per violation

**Files affected:**
1. `src/pages/Home.jsx` (line 815)
2. `src/pages/Compare.jsx` (lines 797, 991)
3. `src/pages/Reviews.jsx` (line 697)
4. `src/components/ComparisonWidget.jsx` (line 179)
5. `src/components/MobileComparisonWidget.jsx` (line 182)

**Current pattern:**
```jsx
<a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
  View on Amazon
</a>
```

## Proposed Solution (One Sentence)
**Add `nofollow sponsored` to rel attributes on all 6 affiliate links + add FTC-compliant disclosure text near affiliate links.**

## Expected Outcome
- ✅ Google affiliate link policy compliance
- ✅ FTC legal compliance (avoid regulatory fines)
- ✅ No PageRank leakage to Amazon
- ✅ Clear user disclosure (trust signal)

## Implementation Details

### Step 1: Fix rel Attributes (15 min)

**Pattern to apply:**
```jsx
// BEFORE
<a href={affiliateUrl} target="_blank" rel="noopener noreferrer">

// AFTER
<a href={affiliateUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">
```

**Files to update:**
1. `src/pages/Home.jsx:815`
2. `src/pages/Compare.jsx:797`
3. `src/pages/Compare.jsx:991`
4. `src/pages/Reviews.jsx:697`
5. `src/components/ComparisonWidget.jsx:179`
6. `src/components/MobileComparisonWidget.jsx:182`

**Note**: Also scan for any dynamically-generated affiliate links that might not be in these locations.

### Step 2: Add FTC/Amazon Disclosures (30 min)

**Per-product disclosure** (near each "View on Amazon" button):
```jsx
<p className="text-xs text-gray-600 mt-2">
  As an Amazon Associate I earn from qualifying purchases
</p>
```

**Site-wide footer disclosure**:
```jsx
<p className="text-sm text-gray-600">
  As an Amazon Associate I earn from qualifying purchases made through links
  on this site, at no additional cost to you.
</p>
```

**Implementation**: Add BOTH disclosures for maximum compliance:
- Footer disclosure covers all pages and meets FTC visibility requirements
- Per-product micro-disclosure meets Amazon Associates Program requirements
- Wording follows exact Amazon program terms

## Time Estimate
- **Step 1 (rel attributes)**: 15 minutes (6 line changes + automated scan)
- **Step 2 (FTC disclosures)**: 30 minutes (7 components + footer)
- **Total**: 45 minutes

## Testing Checklist
- [ ] All 6 affiliate links have `rel="nofollow sponsored noopener noreferrer"`
- [ ] Disclosure text visible on Home, Compare, Reviews pages
- [ ] Footer disclosure on all pages
- [ ] Links still open in new tab
- [ ] No console errors
- [ ] Verify with `curl | grep 'rel="nofollow sponsored'`

## Simplicity Check
- ✅ "Can I explain this in one sentence?" YES - Add rel attributes + disclosure text
- ✅ "Does this solve a problem we actually have?" YES - Legal + SEO compliance
- ✅ "Can we ship without this?" NO - Critical risk
- ✅ "Is there a 10x simpler solution?" NO - These are minimum requirements
- ✅ "Does this add more than 20 lines of code?" NO - 6 attribute changes + 7 text snippets

## Risks
- ❌ **None** - Pure compliance additions
- ✅ No functional changes to links
- ✅ Industry-standard practice

## Legal References
- **Google**: [Link Schemes Guidelines](https://developers.google.com/search/docs/essentials/spam-policies#link-spam) - "Use rel='sponsored' for affiliate links"
- **FTC**: [Endorsement Guides](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) - "Disclosures must be clear and conspicuous"

## Success Metrics
- All affiliate links compliant with Google guidelines
- FTC disclosures visible and clear
- No manual action warnings in Search Console
- Legal risk eliminated
