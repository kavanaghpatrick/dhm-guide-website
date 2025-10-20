# DHM Guide Website - Deployment Checklist

## 🚀 Pre-Deployment Verification Process

**Always follow this checklist before considering any changes "complete":**

### 1. ✅ Code Quality Checks

- [ ] All React components have proper `import React` statements
- [ ] No console errors in browser developer tools
- [ ] All TypeScript/JavaScript syntax is valid
- [ ] All imports and exports are correctly defined

### 2. ✅ Git Status Verification

```bash
# Run the verification script
./verify-deployment.sh

# Or manually check:
git status                    # Should show "working tree clean"
git log --oneline -3         # Check recent commits
git show HEAD:src/App.jsx | head -5  # Verify critical files
```

### 3. ✅ GitHub Verification

- [ ] Visit GitHub repository in browser
- [ ] Verify latest commit appears with correct timestamp
- [ ] Check that modified files show the expected changes
- [ ] Confirm commit hash matches local `git log`

### 4. ✅ Deployment Pipeline

- [ ] Vercel build triggered (check Vercel dashboard)
- [ ] Build completes successfully (no errors)
- [ ] New deployment URL generated
- [ ] Wait 5-10 minutes for CDN propagation

### 5. ✅ Live Site Testing

- [ ] Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- [ ] Test specific functionality that was changed
- [ ] Check browser console for JavaScript errors
- [ ] Verify React components are rendering properly

## 🔧 Critical Files to Always Verify

These files are essential for site functionality:

1. **`src/App.jsx`** - Main React app component
   - Must have: `import React, { useState, useEffect } from 'react'`
   - Contains routing logic for blog posts

2. **`src/blog/components/BlogPost.jsx`** - Blog post component
   - Must have: `import React, { useState, useEffect, useRef } from 'react'`
   - Contains TOC and blog post rendering logic

3. **`src/components/ui/button.jsx`** - Button component
   - Contains styling for all site buttons

4. **`src/pages/Compare.jsx`** - Comparison page
   - Contains mobile-responsive comparison table

5. **`src/pages/Reviews.jsx`** - Reviews page
   - Contains affiliate link buttons

## 🚨 Common Issues to Watch For

### Missing React Imports
```javascript
// ❌ WRONG - Will cause component to fail
import Layout from './components/layout/Layout.jsx'
function App() {
  const [state, setState] = useState() // useState undefined!

// ✅ CORRECT - Component will work
import React, { useState, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
function App() {
  const [state, setState] = useState() // useState available
```

### Git Sync Issues
```bash
# Check if changes are actually committed
git diff HEAD src/App.jsx  # Should show no output if committed

# Check if commits are pushed
git status  # Should show "up to date with origin/main"

# Force verification of remote content
git show origin/main:src/App.jsx | head -5
```

## 🛠️ Emergency Recovery Commands

If changes aren't appearing on GitHub:

```bash
# Force add all changes
git add -A

# Commit with descriptive message
git commit -m "Fix: [describe the specific issue]"

# Force push to GitHub
git push origin main

# Verify push succeeded
git log --oneline -1
git status
```

## 📋 Quick Verification Script

Run this after any changes:

```bash
cd /home/ubuntu/dhm-guide-website
./verify-deployment.sh
```

This script will:
- Check for uncommitted changes
- Verify git sync status
- Check critical files for React imports
- Display latest commit information
- Confirm remote repository connection

## 🎯 Success Criteria

Changes are successfully deployed when:

1. ✅ Git status shows "working tree clean"
2. ✅ Latest commit visible on GitHub with correct content
3. ✅ Vercel build completes successfully
4. ✅ Live site shows expected functionality after hard refresh
5. ✅ No JavaScript errors in browser console

---

**Remember: Always run `./verify-deployment.sh` before considering any task complete!**

