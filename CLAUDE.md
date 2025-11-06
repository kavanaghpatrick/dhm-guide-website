# CLAUDE.md - DHM Guide Website Development

## 🧘 SIMPLICITY FIRST - THE PRIME DIRECTIVE

### When facing ANY problem, ALWAYS ask in this order:
1. **"What can I DELETE to fix this?"** - Remove the cause, not add a bandaid
2. **"What existing code already does this?"** - Reuse before creating
3. **"Can I fix this by changing 1 line?"** - Smallest change that works
4. **"Is the problem a missing simple thing?"** - Often it's a typo or wrong parameter

### The Most Impactful Rule:
**"Every bug is an opportunity to DELETE code, not add it."**

When encountering issues:
- First, look for what unnecessary code is CAUSING the problem
- Second, find what we ALREADY HAVE that solves it
- Last resort, add the MINIMUM new code possible

### The Simplicity Test (Ask Before ANY Implementation):
1. **What existing code am I NOT using that could solve this?**
2. **What can I DELETE instead of adding?**
3. **Can I explain this fix in one sentence?**
4. **Will this fix create new edge cases?** (If yes, find a simpler approach)

---

## 🚀 COMPLETE DEVELOPMENT WORKFLOW (FOLLOW EXACTLY)

### The Proven Process:
```
1. Research (parallel Task agents - 3-6 minimum)
2. Create PRD/Plan with clear goals
3. External Validation (Grok API + Gemini CLI in parallel)
4. Simplicity Filter (reject 70-90% of complexity)
5. Update Plan based on filtered feedback
6. Implement (code or content changes)
7. Code Review (Grok API for critical issues)
8. Apply Filtered Fixes (only crashes, security, data loss)
9. Test & Deploy
10. Document learnings in this CLAUDE.md
```

### Step-by-Step Breakdown:

#### 1. Research Phase (MANDATORY PARALLEL EXECUTION)
**ALWAYS launch 3-6 parallel Task agents** - never sequential research

**Example - SEO Optimization**:
```
Task 1: Analyze current Google Search Console issues
Task 2: Review competitor SEO strategies
Task 3: Identify technical SEO problems in codebase
Task 4: Research best practices for health content SEO
Task 5: Check internal linking patterns
```

**Example - Feature Implementation**:
```
Task 1: Search existing component patterns
Task 2: Research Vue.js/Vite best practices for feature
Task 3: Analyze performance impact
Task 4: Review accessibility requirements
```

#### 2. Create PRD/Plan
Write clear, actionable plan with:
- **Problem statement** - What needs fixing and why
- **Current state** - Data showing the issue
- **Proposed solution** - Specific, measurable actions
- **Expected outcome** - Realistic impact estimates
- **Time estimate** - Honest, not padded

#### 3. External Validation (Grok + Gemini)
**Run BOTH in parallel** for cross-validation:

**Grok API (Technical/Pragmatic Review):**
```bash
python3 << 'EOF'
import json, subprocess, os
request = {
    "messages": [
        {"role": "system", "content": "You are a pragmatic technical reviewer. Focus on: 1) Is this over-engineered? 2) What can be cut? 3) What's the 80/20 fix?"},
        {"role": "user", "content": "[Your PRD/Plan content]"}
    ],
    "model": "grok-4",
    "temperature": 0
}
result = subprocess.run(
    ["curl", "-s", "-X", "POST", "https://api.x.ai/v1/chat/completions",
     "-H", f"Authorization: Bearer {os.environ.get('GROK_API_KEY')}",
     "-H", "Content-Type: application/json",
     "-d", json.dumps(request)],
    capture_output=True, text=True
)
response = json.loads(result.stdout)
print(response['choices'][0]['message']['content'])
EOF
```

**Gemini CLI (Completeness/Strategic Review):**
```bash
gemini --prompt "Review this plan for: 1) Missing details? 2) Realistic expectations? 3) Better approaches? [Your PRD/Plan]"
```

#### 4. Simplicity Filter (THE CRITICAL STEP)
**After receiving Grok + Gemini feedback, filter through these questions:**

**✅ ACCEPT feedback that:**
- Fixes bugs, security vulnerabilities, or crashes
- Prevents common failure cases
- Adds essential missing functionality
- Improves UX with minimal code
- Makes time estimates more realistic

**❌ REJECT feedback that:**
- Adds "nice to have" features
- Suggests enterprise patterns for simple sites
- Introduces abstraction "for future flexibility"
- Adds complex error handling for rare cases
- Suggests performance optimization before problems exist
- Extends timeline >2 weeks from original estimate
- Adds dependencies that don't save >4 hours of work

**The 4 Core Questions (MANDATORY):**
1. **"Does this solve a problem we actually have?"** (Not might have)
2. **"Can we ship without this?"** (If yes, skip it)
3. **"Is there a 10x simpler solution?"** (Usually yes)
4. **"Does this add more than 20 lines of code?"** (If yes, very suspicious)

#### 5. Update Plan Based on Filtered Feedback
- Document what was accepted and WHY
- Document what was rejected and WHY
- Create simplified version (typically 70-90% scope reduction)
- Reset expectations to realistic outcomes

#### 6. Implementation
**For Code Changes:**
- Create branch before risky changes
- Make smallest possible change that works
- Test locally before committing
- Follow existing patterns in codebase

**For Content/SEO Changes:**
- Update one aspect at a time (titles OR metas OR structure)
- Deploy to preview environment first
- Verify in Google Search Console tools
- Submit for reindexing if needed

#### 7. Code Review (Grok API)
**After implementation, get technical review:**
```bash
python3 << 'EOF'
import json, subprocess, os
with open('changed-file.js', 'r') as f:
    code = f.read()
request = {
    "messages": [
        {"role": "system", "content": "Focus on CRITICAL issues only: crashes, security, data loss. Ignore style, minor optimizations, and nice-to-haves."},
        {"role": "user", "content": f"Review this code:\\n{code}"}
    ],
    "model": "grok-4",
    "temperature": 0
}
# [curl command to Grok API]
EOF
```

#### 8. Apply Filtered Fixes
**ONLY implement fixes that prevent:**
- Application crashes
- Security vulnerabilities
- Data loss or corruption
- Common user-facing failures

**IGNORE suggestions for:**
- Type improvements (unless causing bugs)
- Code style changes
- Performance optimization (unless users complaining)
- Elaborate error handling
- Additional features

#### 9. Test & Deploy
- Run relevant tests
- Deploy to preview (Vercel preview deployments)
- Test 3-5 real scenarios
- Deploy to production
- Monitor for issues

#### 10. Document Learnings
**Add to this CLAUDE.md:**
- What worked well
- What was over-engineered initially
- How simplicity filter saved time
- New patterns discovered

---

## 🛡️ SIMPLICITY ENFORCEMENT EXAMPLES

### Real Patterns from This Project:
```
❌ BAD: Issue #30 - Create 154 custom hero images (2-3 hours)
✅ GOOD: Issue #30 - Remove hero image references (1 hour)
LESSON: Question the requirement before solving it

❌ BAD: Issue #31 - Expand all 9 thin content posts (3-5 hours)
✅ GOOD: Issue #31 - Pilot 2-3 posts, measure, then decide (1.5 hours)
LESSON: Data-driven pilots beat comprehensive planning

❌ BAD: Issue #33 - Custom meta descriptions for all 48 posts (4-8 hours)
✅ GOOD: Issue #33 - Top 10 custom + template rest (2.5 hours)
LESSON: 80/20 rule delivers same value in 1/3 the time

❌ BAD: Issue #34 - Create master tracking issue (60-80 hours overhead)
✅ GOOD: Issue #34 - Use GitHub Milestone (0 hours overhead)
LESSON: Use platform features instead of custom solutions
```

---

## 📁 DHM Guide Specific Context

### Content Strategy
- **Health content compliance** - Always verify medical claims against research
- **SEO-first approach** - Every change should consider search impact
- **User journey optimization** - Focus on conversion paths and user experience
- **Performance monitoring** - Track Core Web Vitals and loading times

### Technical Stack
- **Framework**: Vite + Vue.js + Tailwind CSS
- **Deployment**: Vercel (automatic deploys from main branch)
- **Analytics**: Google Search Console, Google Analytics
- **CMS**: JSON-based blog posts in `/src/newblog/data/posts/`

### SEO Priorities
1. **Indexability**: Ensure Google can crawl and index all pages
2. **Page Speed**: Sub-3 second loads, Core Web Vitals optimization
3. **Mobile First**: Responsive design, mobile CTR optimization
4. **Rich Snippets**: FAQ schema, structured data
5. **Internal Linking**: Topic clusters, hub architecture

### Common SEO Pitfalls to Avoid
- ❌ Canonical tags injected via JavaScript (move to server-side)
- ❌ Hero image 404 errors affecting Core Web Vitals
- ❌ Meta descriptions >160 chars truncated in desktop SERPs
- ❌ Redirect chains and soft 404s blocking indexing
- ❌ Thin content <1,000 words preventing ranking

---

## 🎯 Quick Command Reference

### Research (Parallel Task Agents)
```bash
# Always launch 3-6 parallel tasks
# Use Task tool with subagent_type="Explore" for codebase questions
# Use Task tool with subagent_type="general-purpose" for complex analysis
```

### Grok API Review
```bash
# Use Python for proper JSON escaping
python3 << 'EOF'
import json, subprocess, os
# [See Step 3 above for full example]
EOF
```

### Gemini CLI Review
```bash
gemini --prompt "Your question here"
```

### Git Workflow
```bash
# Create branch before risky changes
git checkout -b fix/issue-description

# Commit with clear message
git commit -m "Fix: [problem] by [solution] (closes #XX)"

# Push and create PR
git push origin fix/issue-description
gh pr create --title "Fix: [description]" --body "[details]"
```

### Vercel Preview Testing
```bash
# Deploy creates automatic preview
git push origin branch-name
# Vercel bot comments with preview URL
# Test 3-5 URLs on preview before merging
```

---

## 📋 Proven Patterns from Real Work

### Pattern 1: External AI Validation Prevents Over-Engineering
**What we learned:** Creating a comprehensive PRD without external review led to 60-80 hours of planned work. After Grok + Gemini + Simplicity Filter, we cut it to 12-20 hours while preserving 100% of core value.

**Application:** ALWAYS validate plans with external AIs before implementing.

### Pattern 2: Question Requirements Before Solving
**What we learned:** Issue #30 assumed hero images were required and planned to create them. Both Grok and Gemini asked "Why do you need hero images?" Removing references took 1 hour vs 2-3 hours to create images.

**Application:** Ask "Can we delete this requirement?" before building solutions.

### Pattern 3: Pilot Before Scaling
**What we learned:** Issue #31 planned to expand all 9 thin content posts. Without traffic data, we don't know which are worth expanding. Pilot 2-3, measure 4-6 weeks, then scale winners.

**Application:** Data-driven pilots beat comprehensive upfront work.

### Pattern 4: 80/20 Rule for Content Work
**What we learned:** Issue #33 planned custom meta descriptions for 48 posts. Top 10 by traffic = 80% of value. Template the rest.

**Application:** Prioritize by impact, use templates for long tail.

### Pattern 5: Platform Features Beat Custom Solutions
**What we learned:** Issue #34 created elaborate master tracking issue. This duplicated sub-issues and created 6-location update burden. GitHub Milestones solve this natively.

**Application:** Check if platform has built-in solution before building custom.

### Pattern 6: Pure Deletion Is the Safest Change (Issue #29)
**What we learned:** Issue #29 had an overly aggressive redirect rule blocking 16 comparison posts from Google indexing. The fix was pure deletion - removed 5 lines from vercel.json. No new code added, no complexity introduced. External validation (Gemini) confirmed zero critical issues. Actual time: 35 minutes (matched estimate).

**Application:**
- When debugging, ask "What can I DELETE?" before adding fixes
- Pure deletion changes have near-zero risk (no crashes, no security issues, no new edge cases)
- Question original decisions - the redirect was solving a non-existent problem
- Deletion is faster to implement AND review than addition

**Key insight:** The safest code change is removing unnecessary code. This had 100% success rate with zero risk.

### Pattern 7: Trust Existing Code - Check Before Building (Issue #30)
**What we learned:** Issue #30 needed to remove 40 missing hero image references. ULTRATHINK research revealed components ALREADY handled null images gracefully (line 822: `{post.image && ...}`). Zero code changes needed - just updated 40 JSON files to `"image": null`. Actual time: 45 minutes (25% faster than 1 hour estimate).

**Application:**
- ALWAYS research existing code behavior before implementing fixes
- Modern components often handle edge cases you don't expect
- Data changes are safer than code changes (no crashes, easy rollback)
- Question the scope: "Do we need to add anything, or just change data?"

**Key insight:** The best code fix is realizing you don't need to write code. Components already handled the edge case perfectly.

**Hidden Discovery:** Found 8 posts with malformed `image` field (dictionaries instead of strings) causing prerendering errors. Filed as separate issue - demonstrates value of ULTRATHINK deep analysis.

---

## 🔄 Continuous Improvement

### After Each Task, Ask:
1. **What complexity did we add that we could delete?**
2. **What existing solution did we overlook?**
3. **How could this have been 10x simpler?**
4. **What pattern should we document for next time?**

### Update This File When:
- You discover a new simplification pattern
- External AI review reveals systematic over-engineering
- A "simple" fix takes 3x longer than expected (document why)
- You find a platform feature that replaces custom code

---

## ⚠️ Red Flags (STOP and Simplify)

If you find yourself:
- Adding >20 lines of code for a "simple" fix
- Creating new state variables to coordinate components
- Writing "just in case" error handling
- Building abstraction layers "for future flexibility"
- Spending >30 minutes on implementation before testing
- Creating custom solutions when platform features exist
- Estimating >4 hours without breaking into sub-tasks

**STOP. Apply the simplicity test. Find the 10x simpler approach.**

---

## 📈 Success Metrics

### How We Know This Workflow Works:
- **Issue #29-#33**: Reduced from 11.5-17 hours to 8.5-10.5 hours (35% savings)
- **Issue #34**: Converted to Milestone (saved 60-80 hours of overhead)
- **Traffic PRD**: Cut from 60-80 hours to 12-20 hours (70% reduction)
- **Total Savings**: ~84 hours (89% reduction) while preserving core value

### Target for Future Work:
- **70-90% scope reduction** after external AI review
- **80/20 approach** for content work (focus on top 20%, template the rest)
- **Pilot-first strategy** for uncertain ROI (test 2-3, measure, scale winners)
- **<20 lines of code** for most fixes (if more, question the approach)
