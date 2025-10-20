# Legacy Blog System Removal - Parallel Work Plan

## Project Overview
Complete removal of the legacy `/src/blog/` system and all references, replacing with the superior NewBlog system at `/src/newblog/`.

## Success Criteria
- ✅ Zero broken links or functionality after removal
- ✅ All routing properly handled by NewBlog system
- ✅ Clean codebase with no orphaned references
- ✅ Successful build and deploy
- ✅ All tests pass
- ✅ SEO redirects remain intact

---

## WORKSTREAM 1: Code Analysis & Dependency Mapping
**Assignable to: Agent 1**
**Estimated Time: 30-45 minutes**
**Dependencies: None (can start immediately)**

### Tasks:
1. **Deep Code Analysis**
   - Search entire codebase for imports from `/src/blog/`
   - Find all references to `Blog`, `BlogPost`, `BlogLayout` components
   - Identify any utility functions or shared code
   - Document all files that need updates

2. **Route Mapping**
   - Document all `/blog/*` routes in App.jsx
   - Verify redirect configuration in vercel.json
   - Check for hardcoded blog URLs in content

3. **Test Coverage Check**
   - Identify any tests that depend on old blog system
   - Check for blog-specific test files
   - Document test updates needed

### Deliverables:
- Complete list of files requiring updates
- Dependency graph of blog system usage
- Test impact analysis
- Risk assessment document

### Verification Steps:
- Run grep/search for all blog imports
- Verify no hidden dependencies
- Check for dynamic imports or lazy loading

---

## WORKSTREAM 2: App.jsx Route Cleanup
**Assignable to: Agent 2**
**Estimated Time: 30-45 minutes**
**Dependencies: Workstream 1 analysis**

### Tasks:
1. **Remove Blog Imports**
   - Remove `import Blog from './blog/Blog';`
   - Remove `import BlogPost from './blog/BlogPost';`
   - Remove any blog-related utilities

2. **Update Routing Logic**
   - Remove `/blog` route handler
   - Remove `/blog/:slug` route handler
   - Ensure `/blog/*` URLs redirect properly
   - Verify fallback behavior

3. **Test Route Changes**
   - Test all blog URLs redirect correctly
   - Verify no 404 errors
   - Check navigation still works

### Deliverables:
- Updated App.jsx with blog routes removed
- Documentation of route changes
- Test results confirming redirects work

### Verification Steps:
- Test multiple blog URLs
- Check console for errors
- Verify build succeeds

---

## WORKSTREAM 3: Guide.jsx Link Updates
**Assignable to: Agent 3**
**Estimated Time: 20-30 minutes**
**Dependencies: None**

### Tasks:
1. **Update Legacy Blog Links**
   - Change `/blog/dhm-science-explained` → `/never-hungover/dhm-science-explained`
   - Change `/blog/dhm-dosage-guide-2025` → `/never-hungover/dhm-dosage-guide-2025`
   - Verify all other links use correct format

2. **Test Link Functionality**
   - Click all updated links
   - Verify correct page loads
   - Check for console errors

### Deliverables:
- Updated Guide.jsx with corrected links
- Test confirmation all links work
- Documentation of changes

### Verification Steps:
- Manual testing of each link
- Check browser network tab
- Verify no 404s

---

## WORKSTREAM 4: Build Script & Sitemap Updates
**Assignable to: Agent 4**
**Estimated Time: 20-30 minutes**
**Dependencies: None**

### Tasks:
1. **Update generate-sitemap.js**
   - Remove old blog post URL generation
   - Remove `/blog/posts` directory scanning
   - Ensure only NewBlog URLs included

2. **Check Other Build Scripts**
   - Review package.json scripts
   - Check for blog-specific build steps
   - Update any blog references

3. **Verify Build Process**
   - Run full build
   - Check for warnings/errors
   - Verify sitemap generates correctly

### Deliverables:
- Updated build scripts
- Clean sitemap generation
- Build verification report

### Verification Steps:
- Run `npm run build`
- Check generated sitemap
- Verify no build errors

---

## WORKSTREAM 5: Test File Cleanup
**Assignable to: Agent 5**
**Estimated Time: 15-20 minutes**
**Dependencies: Workstream 1 analysis**

### Tasks:
1. **Remove Test Blog Pages**
   - Delete all `Blog*.jsx` test files in src/pages/
   - Remove any blog-specific test utilities
   - Clean up unused imports

2. **Update Test References**
   - Fix any tests that import blog components
   - Update test routing if needed
   - Ensure all tests pass

### Deliverables:
- Cleaned test directory
- Updated test files
- Test run results

### Verification Steps:
- Run test suite
- Check for orphaned imports
- Verify no test failures

---

## WORKSTREAM 6: Final Cleanup & Deletion
**Assignable to: Agent 6**
**Estimated Time: 15-20 minutes**
**Dependencies: All other workstreams complete**

### Tasks:
1. **Delete Legacy Blog Folder**
   - Remove entire `/src/blog/` directory
   - Verify no broken imports result
   - Check build still succeeds

2. **Final Code Scan**
   - Search for any remaining "blog" references
   - Verify all imports resolved
   - Check for commented code

3. **Documentation Update**
   - Update any developer docs
   - Note the migration in changelog
   - Update README if needed

### Deliverables:
- Clean codebase with blog folder removed
- Final verification report
- Updated documentation

### Verification Steps:
- Full codebase search
- Successful build
- All tests pass

---

## WORKSTREAM 7: Quality Assurance & Deployment Test
**Assignable to: Agent 7**
**Estimated Time: 30-45 minutes**
**Dependencies: All other workstreams complete**

### Tasks:
1. **Comprehensive Testing**
   - Test all blog URLs redirect properly
   - Verify all internal links work
   - Check SEO meta tags
   - Test on multiple devices

2. **Performance Verification**
   - Check bundle size reduction
   - Verify faster load times
   - Test lazy loading still works

3. **Deployment Readiness**
   - Run production build
   - Test in production-like environment
   - Verify Vercel deployment config

### Deliverables:
- Complete QA report
- Performance comparison
- Deployment checklist
- Final go/no-go recommendation

### Verification Steps:
- Manual testing of all functionality
- Automated test suite
- Build and deploy test

---

## Coordination & Rollback Plan

### Execution Order:
1. **Phase 1**: Workstreams 1, 3, 4, 5 (can run in parallel)
2. **Phase 2**: Workstream 2 (after analysis complete)
3. **Phase 3**: Workstream 6 (after all updates done)
4. **Phase 4**: Workstream 7 (final validation)

### Rollback Strategy:
1. All changes in single commit
2. Can revert if issues found
3. Test on staging before production
4. Keep backup of blog folder locally

### Risk Mitigation:
- Comprehensive testing at each step
- Parallel workstreams for efficiency
- Clear verification steps
- Rollback plan ready

---

## Expected Outcomes

### Benefits:
- **14,000+ lines of code removed**
- **1MB+ reduction in codebase size**
- **Cleaner, more maintainable code**
- **Single source of truth for blog content**
- **Improved build times**
- **Reduced confusion for developers**

### Timeline:
- Total estimated time: 2-3 hours with parallel execution
- Can be completed in single session
- No downtime required

### Success Metrics:
- ✅ All blog URLs continue to work (via redirects)
- ✅ No broken internal links
- ✅ Successful production deployment
- ✅ Reduced bundle size
- ✅ All tests passing
- ✅ Clean codebase audit