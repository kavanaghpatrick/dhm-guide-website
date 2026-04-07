# Tasks: Add /reviews CTA to 5 High-Traffic Zero-Conversion Blog Posts (#259)

## Task 1: Update ReviewsCTA Component
**File**: `src/components/ReviewsCTA.jsx`
- Add `placement` and `postSlug` props
- Add `data-track="cta"` to the CTA link
- Add `onClick` handler calling `trackElementClick` with experiment properties
- When `placement === 'end_of_post_cta'`, use CTA text "See Our Top-Rated DHM Supplements"
- Keep existing default/compact variants working unchanged

## Task 2: Add Feature Flag Logic in NewBlogPost.jsx
**File**: `src/newblog/components/NewBlogPost.jsx`
- Import `useFeatureFlag` from hooks
- Define `TARGET_SLUGS` array with the 5 slugs
- Replace unconditional `<ReviewsCTA />` with conditional logic:
  - Target slugs + test variant: render with tracking props
  - Target slugs + control: render nothing
  - Non-target slugs: render as before

## Task 3: Build Verification
- Run `npm run build`
- Verify no errors

## Task 4: Commit
- Commit with message: "feat: experiment to add /reviews CTA to 5 zero-conversion blog posts (#259)"
