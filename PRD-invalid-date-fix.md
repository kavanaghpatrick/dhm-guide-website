# Product Requirements Document: Invalid Date Bug Fix

## 1. Problem Statement

### Current State
The blog post system crashes when attempting to display posts that lack date information in their JSON metadata files. This occurs because:
- The `getPostBySlug` function creates an Invalid Date object when both `datePublished` and `date` fields are missing
- Multiple downstream components attempt to format or serialize this Invalid Date, causing RangeError exceptions
- The application has no error handling for this scenario, resulting in a complete page crash

### Impact
- **User Experience**: Users encounter a white screen/crash when navigating to affected blog posts
- **Content Management**: Content creators cannot publish posts without date metadata
- **SEO**: Search engines cannot index affected posts due to crashes

## 2. Objectives

- Prevent application crashes when blog posts lack date information
- Provide graceful fallback behavior for missing dates
- Maintain backward compatibility with existing posts
- Ensure all date-dependent features continue to function

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Date Validation
- The system MUST validate date fields before creating Date objects
- The system MUST check for both `datePublished` and `date` fields in post metadata
- The system MUST verify that date strings are valid before parsing

#### FR2: Fallback Behavior
- When no valid date is found, the system MUST use the file's last modified timestamp as a fallback
- If file timestamp is unavailable, the system MUST use the current date as a last resort
- The system MUST log warnings when fallback dates are used

#### FR3: Error Handling
- The system MUST wrap date parsing in try-catch blocks
- The system MUST provide meaningful error messages in development mode
- The system MUST never throw unhandled exceptions due to date issues

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- Date validation MUST add less than 5ms to post loading time
- Fallback date retrieval MUST complete within 10ms

#### NFR2: Compatibility
- The fix MUST work with all existing blog posts
- The fix MUST not require changes to existing JSON files
- The fix MUST support both `datePublished` and `date` field names

#### NFR3: Maintainability
- Date handling logic MUST be centralized in a single utility function
- The solution MUST include unit tests for all edge cases
- Error messages MUST clearly indicate the affected post and missing field

## 4. Technical Specification

### 4.1 Implementation Location
- Primary fix in: `src/newblog/utils/postLoader.js`
- Supporting changes in:
  - `src/newblog/components/NewBlogPost.jsx`
  - `src/hooks/useSEO.js`

### 4.2 Proposed Solution

```javascript
// In postLoader.js
function getValidDate(post, postPath) {
  // Try primary date fields
  const dateString = post.datePublished || post.date;
  
  if (dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Fallback to file stats
  try {
    const stats = fs.statSync(postPath);
    console.warn(`No valid date found for ${post.slug}, using file modified time`);
    return new Date(stats.mtime);
  } catch (error) {
    // Last resort: current date
    console.error(`Could not get file stats for ${post.slug}, using current date`);
    return new Date();
  }
}
```

### 4.3 Affected Components
1. **postLoader.js**: Add date validation function
2. **NewBlogPost.jsx**: Add defensive checks before formatting
3. **useSEO.js**: Add try-catch around toISOString() calls

## 5. Testing Requirements

### 5.1 Unit Tests
- Test with valid datePublished field
- Test with valid date field
- Test with invalid date strings
- Test with missing date fields
- Test with malformed JSON

### 5.2 Integration Tests
- Verify blog post loads with valid date
- Verify blog post loads with fallback date
- Verify SEO metadata generates correctly
- Verify no console errors in production

### 5.3 Edge Cases
- Empty string dates
- Null/undefined dates
- Future dates
- Very old dates (before 1970)
- Invalid date formats

## 6. Success Metrics

- Zero crashes due to missing or invalid dates
- 100% of blog posts remain accessible
- No degradation in page load performance
- Clear logging for data quality issues

## 7. Rollout Plan

1. Implement fix in development environment
2. Test with all existing blog posts
3. Add monitoring for fallback date usage
4. Deploy to staging for QA
5. Monitor error rates for 24 hours
6. Deploy to production with feature flag
7. Remove feature flag after 48 hours of stability

## 8. Future Considerations

- Add validation to content creation workflow
- Create migration script to add dates to existing posts
- Add admin UI to manage post dates
- Consider making date field required in JSON schema