# Canonical Tags Research - Complete Documentation Index

This directory contains a comprehensive investigation of how canonical tags are currently implemented in the DHM Guide website codebase.

## Quick Start

**New to this research?** Start here:
1. Read: `CANONICAL_QUICK_SUMMARY.md` (5 min read)
2. View: `CANONICAL_ARCHITECTURE_DIAGRAM.md` (visual overview)
3. Reference: `CANONICAL_LINE_NUMBERS_REFERENCE.md` (exact line numbers)

---

## Documentation Files (in recommended reading order)

### 1. CANONICAL_QUICK_SUMMARY.md
**Purpose**: Executive summary for busy developers  
**Length**: 4 KB (5 minute read)  
**Contains**:
- Where canonicals are injected (5 layers)
- Where canonical URLs are defined
- Critical SEO problem in plain English
- What works vs what doesn't
- Redundant code to consolidate
- Quick fix recommendations

**Read this if**: You just need to understand the problem quickly

---

### 2. CANONICAL_ARCHITECTURE_DIAGRAM.md
**Purpose**: Visual diagrams and flowcharts  
**Length**: 14 KB  
**Contains**:
- Multi-layer system flowchart
- Blog posts (working correctly) flow
- Competing implementations diagram
- Decision tree for which canonical gets used
- File organization tree
- Reliability matrix
- Conclusion comparison

**Read this if**: You're a visual learner or need to explain to others

---

### 3. CANONICAL_LINE_NUMBERS_REFERENCE.md
**Purpose**: Quick reference with exact line numbers  
**Length**: 9.7 KB  
**Contains**:
- Line-by-line code references for each implementation
- Base HTML (line 78)
- useSEO hook (lines 29-114, 79-88, 120-359)
- canonical-fix.js (lines 6-18)
- Prerender main pages (lines 122-126)
- Prerender blog posts (lines 102-109)
- All redundant implementations
- Summary table of key line numbers
- Critical issue timeline
- The two that work

**Read this if**: You need exact code locations and line numbers

---

### 4. CANONICAL_TAGS_INVESTIGATION_REPORT.md
**Purpose**: Complete technical deep-dive  
**Length**: 26 KB (793 lines)  
**Contains**:
- Executive summary
- Multi-layer architecture (5 layers)
- Detailed breakdown of each implementation:
  - useSEO hook (how it works, issues)
  - canonical-fix.js (how it works, issues)
  - prerender-meta-tags.js (large embedded script)
  - inject-canonical-tags.js (competing implementation)
  - Prerender main pages (build-time)
  - Prerender blog posts (build-time)
- Unused/deprecated implementations
- 5 critical issues identified
- File path reference table
- How canonicals are determined
- SEO risk assessment
- Detailed code walkthroughs
- How blog posts work (CORRECT)
- How dynamic pages work (BROKEN)
- Summary table of all implementations
- Recommendations
- Implementation status matrix

**Read this if**: You need comprehensive understanding for implementation

---

### 5. CANONICAL_TAGS_CODE_SNIPPETS.md
**Purpose**: Code examples for each implementation  
**Length**: 13 KB (461 lines)  
**Contains**:
- Full useSEO hook code
- generatePageSEO function code
- Prerender main pages script
- Prerender blog posts script
- canonical-fix.js code
- Meta tag injection script code
- Base HTML template
- Summary table with code examples

**Read this if**: You need to see actual code implementations

---

### 6. CANONICAL_TAGS_IMPLEMENTATION.md
**Purpose**: Current implementation overview  
**Length**: 10 KB (295 lines)  
**Contains**:
- Current architecture overview (hybrid approach)
- useSEO hook details
- Prerendering scripts details
- Client-side canonical fix script
- Meta tag injection script
- Generate blog canonicals script
- Inject canonical tags script
- Current implementation summary table
- Why blog posts work correctly
- Why dynamic pages have issues
- Base HTML template details
- Competing/redundant implementations
- Key findings

**Read this if**: You want a structured overview of current state

---

### 7. CANONICAL_QUICK_REFERENCE.md
**Purpose**: One-page quick reference card  
**Length**: 8.6 KB (239 lines)  
**Contains**:
- File locations
- What each file does
- Timing of each implementation
- Scope of each implementation
- When Google sees canonicals
- What works vs doesn't work
- Recommendations
- File reference guide

**Read this if**: You need a quick lookup reference

---

## File Reference: Absolute Paths

### Primary Implementation Files

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `/index.html` | 78 | Base canonical tag | Active ❌ |
| `/src/hooks/useSEO.js` | 29-114, 79-88, 120-359 | React SEO hook | Active |
| `/canonical-fix.js` | 6-18 | Early JS fix | Active |
| `/scripts/prerender-main-pages.js` | 122-126 | Prerender main pages | Active ✅ |
| `/scripts/prerender-blog-posts.js` | 102-109 | Prerender blog posts | Active ✅ |
| `/scripts/prerender-meta-tags.js` | 38-200+ | Embedded script (redundant) | Redundant ⚠️ |
| `/scripts/inject-canonical-tags.js` | 18-81 | Competing inline script | Duplicate ❌ |
| `/scripts/generate-blog-canonicals.js` | 1-105 | Unused JSON generator | Unused ❌ |

---

## Critical Findings Summary

### The Core Problem
Google's crawler sees the **wrong canonical tag** for dynamic pages because:
1. Initial HTML has base canonical: `https://www.dhmguide.com`
2. Google crawls at T=0ms (gets wrong canonical)
3. JavaScript updates canonical at T=50ms+ (too late)
4. Dynamic pages appear as duplicates of home page to Google

### What Works
- Blog posts (fully prerendered) - canonical in static HTML
- Main pages (fully prerendered) - canonical in static HTML

### What Doesn't Work
- Dynamic React pages - canonical updated via JavaScript
- All pages initially show base canonical to Google

### Redundancy Issues
- 4 different client-side approaches updating same tag
- prerender-meta-tags.js duplicates prerender-blog-posts.js
- inject-canonical-tags.js duplicates prerender-meta-tags.js
- generate-blog-canonicals.js output never used

---

## How to Use This Documentation

### For Quick Troubleshooting
1. CANONICAL_QUICK_SUMMARY.md → understand the issue
2. CANONICAL_LINE_NUMBERS_REFERENCE.md → find exact location
3. CANONICAL_TAGS_CODE_SNIPPETS.md → see the code

### For Implementation/Fixing
1. CANONICAL_TAGS_INVESTIGATION_REPORT.md → full analysis
2. CANONICAL_TAGS_CODE_SNIPPETS.md → code examples
3. CANONICAL_ARCHITECTURE_DIAGRAM.md → visual reference

### For Documentation/Explanation
1. CANONICAL_ARCHITECTURE_DIAGRAM.md → visual overview
2. CANONICAL_TAGS_IMPLEMENTATION.md → structured breakdown
3. CANONICAL_QUICK_REFERENCE.md → one-page summary

### For Code Review
1. CANONICAL_LINE_NUMBERS_REFERENCE.md → exact locations
2. CANONICAL_TAGS_CODE_SNIPPETS.md → code examples
3. CANONICAL_TAGS_INVESTIGATION_REPORT.md → detailed analysis

---

## Key Metrics

- **Total Documentation**: 3,037 lines across 8 files
- **Files Analyzed**: 8 primary files, 10+ supporting files
- **Line Numbers Mapped**: 30+ specific code locations
- **Critical Issues**: 5 identified with impact assessment
- **Redundant Implementations**: 4 competing systems
- **Unused Files**: 3 files that should be deleted

---

## Recommendations Summary

**Immediate**: Check Google Search Console for canonical issues

**Short-term**: Consolidate and delete redundant files
- Delete prerender-meta-tags.js
- Delete inject-canonical-tags.js
- Delete generate-blog-canonicals.js

**Long-term**: Make dynamic pages prerendered (like blog posts)
- Option A: Build-time static generation
- Option B: Server-side canonical injection
- Option C: Vercel prerendering for dynamic routes

---

## Document Quality Notes

All documents include:
- Specific file paths (absolute)
- Line numbers (exact)
- Code snippets (real examples)
- Status indicators (active, redundant, unused)
- Visual diagrams and flowcharts
- Summary tables
- Risk assessments
- Actionable recommendations

---

## Last Updated

Generated: 2025-11-07  
Research Tool: Claude Code (Haiku 4.5)  
Codebase: DHM Guide Website  
Framework: Vite + React hybrid SPA  
Deployment: Vercel  

---

## Questions This Research Answers

1. **Where are canonical tags currently injected?** → See CANONICAL_QUICK_SUMMARY.md (section 1)
2. **When does Google see the canonical?** → See CANONICAL_ARCHITECTURE_DIAGRAM.md (timeline)
3. **What's the exact line number for X?** → See CANONICAL_LINE_NUMBERS_REFERENCE.md
4. **Why don't dynamic pages work?** → See CANONICAL_TAGS_INVESTIGATION_REPORT.md (Issue 1)
5. **Why do blog posts work?** → See CANONICAL_TAGS_INVESTIGATION_REPORT.md (section 9.1)
6. **What code is redundant?** → See CANONICAL_QUICK_SUMMARY.md (redundant code)
7. **How do I fix this?** → See CANONICAL_TAGS_INVESTIGATION_REPORT.md (recommendations)
8. **Which files should I delete?** → See CANONICAL_QUICK_SUMMARY.md (consolidate)

