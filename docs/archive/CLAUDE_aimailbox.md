# AI Mailbox - Project Guidelines & Orchestration

## 🧘 SIMPLICITY FIRST - THE PRIME DIRECTIVE

### When facing ANY problem, ALWAYS ask in this order:
1. **"What can I DELETE to fix this?"** - Remove the cause, not add a bandaid
2. **"What existing code already does this?"** - Reuse before creating
3. **"Can I fix this by changing 1 line?"** - Smallest change that works
4. **"Is the problem a missing simple thing?"** - Often it's a typo or wrong parameter

### The Most Impactful Rule for Claude:
**"Every bug is an opportunity to DELETE code, not add it."**

When I encounter an issue, my instinct should be:
- First, look for what unnecessary code is CAUSING the problem
- Second, find what we ALREADY HAVE that solves it
- Last resort, add the MINIMUM new code possible

### Real Examples from This Project:
```
❌ BAD: Tab navigation breaks → Add state tracking, queue management, refresh coordination
✅ GOOD: Tab navigation breaks → Stop calling unnecessary reload, use in-memory data (2-line fix)

❌ BAD: AI tags not showing → Add complex refresh system with timers
✅ GOOD: AI tags not showing → Just show what's already in memory

❌ BAD: Search failing → Add error recovery and retry logic
✅ GOOD: Search failing → Fix the typo in the property name
```

### Red Flags That I'm Over-Engineering:
- Adding "just in case" error handling
- Creating new state variables to track things
- Writing coordination logic between components
- Adding queues, flags, or timers to "fix" race conditions
- The fix is longer than 10 lines

### The Simplicity Test:
Before implementing ANY fix, I MUST answer:
1. **What existing code am I NOT using that could solve this?**
2. **What can I DELETE instead of adding?**
3. **Can I explain this fix in one sentence?**
4. **Will this fix create new edge cases?** (If yes, find a simpler approach)

## 🔧 Environment Setup

### Required Environment Variables
Create a `.env` file in the project root with:
```bash
# GitHub Token for API access
GH_TOKEN=your_github_token

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost

# OpenAI API Key (for Phase 2)
OPENAI_API_KEY=your_openai_key

# Grok (xAI) API Key
GROK_API_KEY=your_grok_api_key
```

### Loading Environment Variables
Before running commands that need these tokens:
```bash
# Load environment variables
source .env
# OR
export $(cat .env | xargs)
```

## 🚀 DEVELOPMENT WORKFLOW (CRITICAL - FOLLOW EXACTLY)

### Complete Issue Implementation Process:
```
1. Research → Create GitHub Issue with pseudocode
2. Validate issue with Grok (technical) + Gemini (completeness)
3. Filter feedback through simplicity principles (reject complexity)
4. Update issue based on filtered feedback
5. Prepare environment (Claude installs dependencies, rebuilds modules)
6. Implement with Qwen Coder (code only)
   **🚨 MANDATORY**: One file, one method, <2 minutes per task
   **🚨 REFERENCE**: See global CLAUDE.md for Qwen patterns
   **🚨 FALLBACK**: If timeout, break into smaller tasks
7. Test implementation
8. Code review with Grok
9. Filter review feedback (apply only critical fixes)
10. Update issue, commit, close
```

**⚠️ STEP 6 RULE**: Work around 2-minute system timeout. Break large tasks into <2min chunks. If timeout happens: assess progress and continue with smaller, focused commands.

**IMPORTANT Todo List Creation Rules:**
- When creating todos with TodoWrite, follow this EXACT order
- If starting mid-workflow (e.g., issue already exists), begin todos from the appropriate step
- NEVER reorder steps - environment preparation (5) MUST come before implementation (6)
- Each todo should map directly to a workflow step

### 🎯 Simplicity Filter - ALWAYS APPLY:
**✅ ACCEPT feedback that:**
- Fixes bugs, security vulnerabilities, or crashes
- Prevents common failure cases
- Adds essential missing functionality
- Improves UX with minimal code

**❌ REJECT feedback that:**
- Adds "nice to have" features
- Suggests enterprise patterns for MVP
- Introduces abstraction "for future flexibility"
- Adds complex error handling for rare cases
- Suggests performance optimization before problems exist
- Recommends security beyond industry standard

### Division of Responsibilities:
**Claude handles:** Dependencies, environment, testing, git, reviews, orchestration
**Qwen Coder handles:** ALL code writing, modifications, and implementations

**🚨 CRITICAL CODING RULES 🚨**
1. **NEVER write code directly** - Not even "simple" changes or "quick fixes"
2. **ALWAYS use Qwen** for ANY file modifications (`.ts`, `.js`, `.css`, `.html`, etc.)
3. **NO EXCEPTIONS** - Even for 1-line changes, use Qwen
4. **COMPLETE ALL ACCEPTANCE CRITERIA** - Keep using Qwen until 100% done
5. **IF TEMPTED TO CODE** - STOP and use `opencode run` instead

## 📋 Quick Issue Management Reference
```bash
# Start work on issue #1
gh issue edit 1 --add-label "in-progress"
gh issue comment 1 --body "Starting implementation"

# Update progress
gh issue comment 1 --body "Progress: Completed X, working on Y"

# Mark for review
gh issue edit 1 --remove-label "in-progress" --add-label "in-review"

# Close when FULLY complete
gh issue close 1 --comment "✅ All criteria met, tests passing"

# Check progress
gh issue list --milestone "AI Mailbox MVP" --state all
```

## 🎯 Project Goals
**PRIMARY OBJECTIVE**: Build functional Gmail client FIRST, then add AI enhancement (2-3 weeks)

### Core Architecture (Phase Priority):
```
Phase 1: Electron + SQLite + Gmail API = Email Client
Phase 2: + OpenAI API = AI Enhancement
```

### Success Criteria (Phase 1 FIRST):
- ✅ User can **read/send/reply/archive** emails (full email client)
- ✅ User can **organize and search** emails  
- ✅ **Syncs with Gmail** bidirectionally
- ✅ Local storage, zero server maintenance
- ✅ <3 second startup time

### Success Criteria (Phase 2 ONLY AFTER Phase 1):
- ✅ AI summaries appear for emails

### Scope Boundaries (DO NOT CROSS):
- **NO** elaborate sync resumption (just retry)
- **NO** vendor abstraction until we have 2+ vendors
- **NO** advanced cost management (simple counter is fine)
- **NO** enterprise features for MVP
- **NO** complex monitoring or analytics

### The Priority Questions for Every Decision:
**Phase 1: "Does this help users manage their emails better?"**
**Phase 2: "Does this add useful AI insights to the working email client?"**
- If NO → Don't build it
- If YES → Build the simplest version that works
- **NEVER start Phase 2 until Phase 1 is complete**

## 🎯 CSS SEPARATION RULE (CRITICAL)

**NEVER style email content. ONLY style app UI.**

- **App UI**: Use `.app-*` classes only
- **Email content**: Gets zero CSS from our app (use `.app-email-content` with no styles)

```html
<div class="app-email-document">    <!-- App styling -->
  <div class="app-email-content">   <!-- NO styling - preserve original -->
    [Email HTML]
  </div>
</div>
```

**Violating this breaks email rendering.**

## 🛡️ Simplicity Enforcement

### External AI Feedback Filter:
When Gemini/Grok suggest complexity:
1. **Does this solve a real user problem?** (Not theoretical)
2. **Can we ship the MVP without this?** (If yes, skip it)
3. **Would this add >20 lines of code?** (If yes, very suspicious)
4. **Is there a 10x simpler approach?** (Usually yes)

### The 5-Line Implementation Test:
```javascript
// Phase 1: Email client (must work first)
const emails = await gmail.getEmails();
await db.store(emails);
ui.showEmails(emails);
await gmail.sendEmail(userDraft);
await gmail.archiveEmail(emailId);

// Phase 2: AI enhancement (only after Phase 1 works)
// const aiSummary = await openai.summarize(email);
// ui.showSummary(aiSummary);
```

### Red Flags (Reject These Suggestions):
- **Working on AI before email client is functional** (BIGGEST RED FLAG)
- Complex sync resumption systems beyond simple retry
- Database schema with `raw_payload` storage
- Elaborate cost prediction algorithms
- Multi-provider abstraction layers
- Advanced encryption beyond SQLCipher
- Performance optimization before performance problems

## Claude's Role: Planning Orchestrator & Environment Manager
1. **Plan**: Break features into detailed GitHub Issues with pseudocode
2. **Validate**: Use Grok (technical) and Gemini (completeness) to review issues
3. **Filter**: Apply simplicity filter to validation feedback (see below)
4. **Update**: Revise issues based on filtered feedback
5. **Prepare Environment**: Install dependencies, rebuild native modules, handle configuration
6. **Orchestrate**: Direct Qwen Coder to implement each issue (code only)
7. **Code Review**: Get Grok to review the implementation
8. **Apply Fixes**: Filter review feedback and apply only critical fixes
9. **Complete**: Update issue, commit, and close when all criteria met

### Division of Responsibilities
**Claude handles:**
- Dependency installation (`npm install`)
- Native module rebuilding (`electron-rebuild`)
- Environment configuration (.env setup)
- Build tool configuration
- Testing setup and execution
- Git operations (commits, branches)

**Qwen Coder handles:**
- Writing code based on specifications
- Creating/modifying source files
- Implementing business logic
- Following patterns from existing code

**🚨 ENFORCEMENT RULES 🚨**
1. **Claude writing code = VIOLATION** - No Edit, Write, or MultiEdit tools for code
2. **"Just this once" = VIOLATION** - No exceptions for "simple" changes
3. **Partial implementation = VIOLATION** - Continue with Qwen until ALL criteria met
4. **Troubleshooting excuse = VIOLATION** - Use Qwen to add debug logs too
5. **CORRECT APPROACH**: Break work into chunks, use multiple Qwen commands

## 🚨 QWEN TIMEOUT RULE (CRITICAL)

**WORK AROUND Claude's bash timeout limitation.**
- Claude's Bash tool has a default 2-minute timeout (can extend to 10 minutes)
- opencode itself doesn't timeout (--timeout flag doesn't work)
- For longer tasks: Break into smaller focused chunks
- If timeout happens: assess what was completed and continue with focused commands
- Use multiple small commands instead of one large command

## Workflow
```
Research → GitHub Issues → Grok/Gemini Validation → Simplicity Filter → Update Issues → Environment Setup → Qwen Implementation → Grok Code Review → Apply Filtered Fixes → Complete
                                                       ↑                                  ↑                                                          ↑
                                                       └─────────────────────────────────┴──────────────────────────────────────────────────────────┘
                                                                                    Apply simplicity filter at each external validation step
```

## 🎯 Validation Feedback Filter

### After receiving Grok/Gemini feedback, ALWAYS filter through these criteria:

#### ✅ ACCEPT Feedback That:
- Fixes actual bugs or security vulnerabilities (e.g., missing CSRF protection)
- Prevents common failure cases (e.g., port conflicts)
- Adds essential functionality that was missing
- Improves user experience with minimal code
- Clarifies ambiguous requirements

#### ❌ REJECT Feedback That:
- Adds "nice to have" features not in original scope
- Suggests enterprise-grade patterns for MVP
- Introduces abstraction layers "for future flexibility"
- Adds complex error handling for rare edge cases
- Suggests performance optimizations before we have performance problems
- Recommends additional security beyond industry standard
- Proposes elaborate monitoring, logging, or analytics

#### 📝 Filter Example:
```
Grok suggests: "Add PKCE for OAuth security"
Filter decision: REJECT - Adds significant complexity, not required for desktop OAuth MVP

Gemini suggests: "Handle port conflicts with dynamic port selection"
Filter decision: ACCEPT - Prevents common failure case with simple solution

Grok suggests: "Implement comprehensive token encryption with safeStorage"
Filter decision: REJECT - Keytar already provides secure storage, additional encryption is overkill
```

## 📝 Code Review Process (Post-Implementation)

### After Qwen Coder implements, ALWAYS:
1. **Get Grok Code Review**: Send the implemented code to Grok for security, error handling, and quality review
2. **Filter the Feedback**: Apply the same simplicity filter to code review suggestions
3. **Apply Critical Fixes Only**: Implement only the fixes that prevent crashes, security issues, or data loss
4. **Update GitHub Issue**: Document what was fixed and what was intentionally rejected

### Code Review Filter Examples:
```
Grok review: "Add try-catch to JSON.parse to prevent crashes"
Decision: ACCEPT - Prevents crashes with 3 lines of code

Grok review: "Implement PKCE for OAuth flow"
Decision: REJECT - Adds significant complexity, not required for desktop OAuth MVP

Grok review: "Replace 'any' types with specific TypeScript types"
Decision: ACCEPT - Improves maintainability without adding complexity

Grok review: "Add comprehensive unit test suite"
Decision: REJECT - Important but not blocking for MVP functionality
```

## GitHub Issue Template
```markdown
## Overview
[What needs to be built and why]

## Technical Context
- **Dependencies**: [packages]
- **Files**: [exact paths to create/modify]
- **Integration**: [connection points]

## Implementation
### Pseudocode
```
[Logic flow]
```

### Key Interfaces
```typescript
[Critical types/interfaces]
```

## Acceptance Criteria
- [ ] [Specific, testable criteria]

## Testing
[How to verify it works]
```

## Issue Creation Process

### 1. Draft Issue
```bash
cat > issue-draft.md << 'EOF'
[Issue content following template]
EOF
```

### 2. Validate
```bash
# Technical review with Grok
ISSUE=$(cat issue-draft.md | jq -Rs .)
curl -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $GROK_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"messages\": [{\"role\": \"user\", \"content\": \"Review issue: $ISSUE\"}], \"model\": \"grok-4\"}"

# Completeness check with Gemini
gemini --prompt "Validate implementation details: $(cat issue-draft.md)"
```

### 3. Create GitHub Issue
```bash
# Create issue with labels and milestone
gh issue create \
  --title "[Title]" \
  --body "$(cat issue-draft.md)" \
  --label "mvp" \
  --label "3 hours" \
  --milestone "AI Mailbox MVP"

# Or create via API
curl -X POST https://api.github.com/repos/kavanaghpatrick/ai-mailbox/issues \
  -H "Authorization: token $GH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[Title]",
    "body": "[Markdown content]",
    "labels": ["mvp", "3 hours"],
    "milestone": 1
  }'
```

## Qwen Implementation Orchestration

### 🚨 CONTINUOUS QWEN USAGE UNTIL COMPLETE 🚨
**NEVER STOP USING QWEN UNTIL ALL ACCEPTANCE CRITERIA ARE MET**

1. **Start Implementation**
   ```bash
   # Note: When running from Claude, can use extended timeout in Bash tool (up to 10 min)
   # This is Claude's bash timeout, not opencode's timeout
   opencode run -m "cerebras/qwen-3-coder-480b" "Implement GitHub issue #X: [issue content]"
   ```

2. **If Partially Complete**
   ```bash
   # WRONG: Claude writes the remaining code
   # RIGHT: Continue with Qwen
   opencode run --continue "Continue implementing [specific remaining items]"
   ```

3. **If Debugging Needed**
   ```bash
   # WRONG: Claude adds console.log statements
   # RIGHT: Use Qwen for debugging too
   opencode run --continue "Add debugging logs to trace [specific issue]"
   ```

4. **Keep Going Until Done**
   ```bash
   # Check acceptance criteria
   # If not all met, continue with Qwen:
   opencode run --continue "Complete remaining criteria: [list items]"
   ```

### Single Issue Example
```bash
# Get issue content
gh issue view 1 --json body -q .body > issue-1.md

# Start implementation
opencode run -m "cerebras/qwen-3-coder-480b" "Implement GitHub issue #1:
$(cat issue-1.md)

Current project structure:
$(tree -I 'node_modules')

Related files:
$(cat src/relevant-file.ts)"

# If not complete, continue
opencode run --continue "Complete the remaining acceptance criteria from issue #1"

# Keep going until ALL criteria are met
opencode run --continue "Finish implementing [specific missing features]"
```

### Multi-Issue Feature
```bash
# First issue
opencode run -m "cerebras/qwen-3-coder-480b" "Implement issue #1: $(gh issue view 1)"

# Continue until issue #1 is FULLY complete
opencode run --continue "Complete all remaining acceptance criteria for issue #1"

# Only then move to next issue
opencode run --continue "Now implement issue #2: $(gh issue view 2)"

# Integration
opencode run --continue "Integrate and test both features"
```

## Validation Commands

### Grok (Architecture/Technical)
```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $GROK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "[query]"}], "model": "grok-4"}'
```

### Gemini (Completeness/Clarity)
```bash
gemini --prompt "[query]"
```

## Debugging & Development Tools

### State Debugging
The app now includes built-in state debugging helpers:

```javascript
// Open browser DevTools (Cmd+Option+I) and run:
window.debugState()  // Get current state snapshot
window.appState      // Direct access to EmailApp instance

// Useful for debugging state issues:
window.appState.validateState()  // Fix inconsistent state
window.appState.resetViewState() // Clean slate for view
```

### Debug Output Example
```javascript
window.debugState()
// Returns:
{
  folder: "inbox",
  emailOpen: null,
  searching: false,
  query: "",
  selected: [],
  focused: 0,
  totalEmails: 150,
  displayedEmails: 20,
  page: 0,
  hasMore: true,
  totalFilters: 3,
  activeFilter: null,
  previousView: null
}
```

### When to Use Debug Tools
- User reports weird state: `window.debugState()` to inspect
- Navigation issues: Check `previousView` and `currentFolder`
- Selection problems: Check `selected`, `focused`, `lastSelected`
- Search/filter issues: Check `searching`, `query`, `activeFilter`
- After major changes: `window.appState.validateState()` to ensure consistency

## Best Practices

### Planning
- **3-8 issues per feature**: Balance granularity with context
- **Dependencies**: Mark blockers in issue description
- **Time estimates**: 1-4 hours per issue (use labels)
- **Self-contained**: Each issue must have ALL needed context

### Validation
- **Grok**: Architecture, security, performance implications
- **Gemini**: Missing details, edge cases, testing approach
- **Both must approve** before creating GitHub issue

### Implementation
- **Provide context**: Include project structure and related files
- **Chain related work**: Use --continue for dependent tasks
- **Review output**: Verify all specified files were created
- **Test immediately**: Run the implementation before moving on

## Project Configuration
- **GitHub Repository**: https://github.com/kavanaghpatrick/ai-mailbox
- **Issue Labels**: `Phase 1: Email Client`, `Phase 2: AI Enhancement`, `3 hours`, `4 hours`, `mvp`
- **Milestone**: `AI Mailbox MVP`
- **Branch Pattern**: `feature/issue-[number]-description`

## 🔐 Google OAuth Configuration (For Issue #2)
- **Project**: [Your Google Cloud Project]
- **Client ID**: `$GOOGLE_CLIENT_ID` (stored in .env)
- **Redirect URI**: `$GOOGLE_REDIRECT_URI` (stored in .env)
- **Credentials Location**: 
  - `.env` file (gitignored)
  - `google-oauth-credentials.json` (gitignored)
- **Required Gmail API Scopes**:
  ```javascript
  const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',  // Read emails
    'https://www.googleapis.com/auth/gmail.send',      // Send emails
    'https://www.googleapis.com/auth/gmail.modify',    // Archive/delete
    'https://www.googleapis.com/auth/gmail.compose'    // Compose drafts
  ];
  ```
- **Implementation Notes**:
  - Use OAuth 2.0 for installed applications flow
  - Store refresh tokens with Electron's safeStorage API
  - Implement automatic token refresh

## 🔄 GitHub Issue Lifecycle (CRITICAL)

### Issue States & When to Transition

1. **Created** → **In Progress**
   ```bash
   # When starting work on issue #4
   gh issue edit 4 --add-label "in-progress"
   gh issue comment 4 --body "Started implementation"
   ```

2. **In Progress** → **In Review**
   ```bash
   # After implementation complete
   gh issue comment 4 --body "Implementation complete. Testing..."
   gh issue edit 4 --remove-label "in-progress" --add-label "in-review"
   ```

3. **In Review** → **Closed**
   ```bash
   # ONLY close when ALL criteria met:
   # ✅ Code implemented and tested
   # ✅ Tests pass
   # ✅ Code committed to branch
   # ✅ No blocking issues found
   
   gh issue close 4 --comment "Completed in commit abc123. All tests passing."
   ```

4. **Reopening Issues**
   ```bash
   # If bugs found or requirements not met
   gh issue reopen 4 --comment "Found bug: [description]. Reopening."
   ```

### ⚠️ NEVER Close Issues When:
- Code is written but not tested
- Tests are failing
- Implementation is partial
- There are known bugs
- Code isn't committed

### Issue Update Protocol
```bash
# Start of work
gh issue comment $ISSUE_NUM --body "Starting work on this issue"
gh issue edit $ISSUE_NUM --add-label "in-progress"

# During work (update regularly)
gh issue comment $ISSUE_NUM --body "Progress update: Completed OAuth flow, working on token storage"

# Blockers
gh issue comment $ISSUE_NUM --body "Blocked: Need clarity on token refresh strategy"
gh issue edit $ISSUE_NUM --add-label "blocked"

# Completion
gh issue comment $ISSUE_NUM --body "✅ Implementation complete
- All acceptance criteria met
- Tests passing
- Code in branch: feature/issue-4-gmail-sync"
gh issue close $ISSUE_NUM
```

## Example Full Lifecycle Flow
```bash
# 1. Create issue
ISSUE_NUM=$(gh issue create \
  --title "Implement Gmail sync" \
  --body "$(cat sync-issue.md)" \
  --label "Phase 1: Email Client" \
  --label "4 hours" \
  --milestone "AI Mailbox MVP" \
  | grep -o '[0-9]*$')

echo "Created issue #$ISSUE_NUM"

# 2. Start work
gh issue edit $ISSUE_NUM --add-label "in-progress"
gh issue comment $ISSUE_NUM --body "Starting implementation"

# 3. Create feature branch
git checkout -b "feature/issue-$ISSUE_NUM-gmail-sync"

# 4. Implement with Qwen
opencode run -m "cerebras/qwen-3-coder-480b" --timeout 900 "$(gh issue view $ISSUE_NUM)"

# 5. Test implementation
npm test
if [ $? -eq 0 ]; then
  gh issue comment $ISSUE_NUM --body "✅ All tests passing"
else
  gh issue comment $ISSUE_NUM --body "❌ Tests failing, debugging..."
  gh issue edit $ISSUE_NUM --add-label "bug"
fi

# 6. Commit and push
git add .
git commit -m "Implement Gmail sync (closes #$ISSUE_NUM)"
git push origin feature/issue-$ISSUE_NUM-gmail-sync

# 7. Close issue ONLY if everything works
gh issue close $ISSUE_NUM --comment "Completed in branch feature/issue-$ISSUE_NUM-gmail-sync
- ✅ All acceptance criteria met
- ✅ Tests passing
- ✅ Code reviewed and working"

# 8. Track completion
gh issue list --milestone "AI Mailbox MVP" --state closed
```

## Issue Tracking Dashboard Commands
```bash
# View active work
gh issue list --label "in-progress"

# View blocked issues  
gh issue list --label "blocked"

# View completed work
gh issue list --milestone "AI Mailbox MVP" --state closed

# Progress report
echo "=== AI Mailbox MVP Progress ==="
echo "Completed: $(gh issue list --milestone 'AI Mailbox MVP' --state closed | wc -l)"
echo "In Progress: $(gh issue list --label 'in-progress' | wc -l)"
echo "Remaining: $(gh issue list --milestone 'AI Mailbox MVP' --state open | wc -l)"
```