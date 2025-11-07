# Simplicity Framework Filter: PRD Review Results

**Date:** 2025-11-07
**Reviewers:** Grok API (xAI) + Gemini CLI (Google)
**Verdict:** 70% of PRD should be CUT

---

## Simplicity Framework Questions

For each recommendation, we asked:
1. ✅ **"Does this solve a problem we actually have?"** (Not might have)
2. ✅ **"Can we ship without this?"** (If yes, skip it)
3. ✅ **"Is there a 10x simpler solution?"** (Usually yes)
4. ✅ **"Does this add more than 20 lines of code?"** (If yes, very suspicious)

---

## Both Reviews Agreed: Major Over-Engineering

### ❌ CUT: International Expansion (Priority #6)
**Recommendation:** "Brazil Hangover Culture" content for 82 impressions

**Simplicity Filter:**
- Does this solve a problem we actually have? **NO** - 254 impressions across 5 countries
- Can we ship without this? **YES** - not blocking anything
- Is there a 10x simpler solution? **YES** - don't do it
- Impact: 15-25 clicks for 10+ days work = **0.6 clicks/hour**

**VERDICT: CUT ENTIRELY** ❌

---

### ❌ CUT: Homepage Position Optimization (Priority #4)
**Recommendation:** Improve homepage from position 38 to top 10

**Simplicity Filter:**
- Does this solve a problem we actually have? **MAYBE** - but very low priority
- Can we ship without this? **YES**
- Is there a 10x simpler solution? **YES** - focus on high-traffic pages instead
- Time: 4-8 weeks for uncertain results

**VERDICT: DEFER TO LATER** ⏸️

---

### ❌ CUT: Elaborate Risk Mitigation Tables
**Recommendation:** 6x6 risk matrix with mitigation strategies

**Simplicity Filter:**
- Does this solve a problem we actually have? **NO** - just planning theater
- Can we ship without this? **YES**
- Is there a 10x simpler solution? **YES** - just execute and iterate

**VERDICT: CUT** ❌

---

### ❌ CUT: Google Data Studio Dashboard
**Recommendation:** Build comprehensive tracking dashboard

**Simplicity Filter:**
- Does this solve a problem we actually have? **NO** - GSC CSV exports work fine
- Can we ship without this? **YES**
- Is there a 10x simpler solution? **YES** - check GSC weekly
- Adds >20 lines of config? **YES**

**VERDICT: CUT** ❌

---

### ❌ CUT: Root Cause Analysis Sections
**Recommendation:** Essay-length analysis of why desktop CTR is low

**Simplicity Filter:**
- Does this solve a problem we actually have? **NO** - action beats speculation
- Can we ship without this? **YES** - just fix the titles and test
- Is there a 10x simpler solution? **YES** - rewrite meta, measure, iterate

**VERDICT: CUT** ❌

---

### ❌ CUT: Phased Acceptance Criteria Checklists
**Recommendation:** Detailed checklists for each phase

**Simplicity Filter:**
- Does this solve a problem we actually have? **NO** - corporate overkill for 317 clicks/month site
- Can we ship without this? **YES**
- Is there a 10x simpler solution? **YES** - simple todo list

**VERDICT: SIMPLIFY TO BASIC CHECKLIST** ⚠️

---

### ❌ CUT: Video Schema & Long-tail Expansion
**Recommendation:** Add 5 different schema types + long-tail keyword project

**Simplicity Filter:**
- Does this solve a problem we actually have? **PARTIALLY** - only FAQ schema matters
- Can we ship without this? **YES** - start with FAQ only
- Is there a 10x simpler solution? **YES** - FAQ schema on top 5 pages only

**VERDICT: SIMPLIFY TO FAQ ONLY** ⚠️

---

## ✅ KEEP: What Actually Matters

### ✅ Priority 1: URL Consolidation (MOVE TO WEEK 1)
**Current:** Week 3 | **New:** Week 1

**Simplicity Filter:**
- Does this solve a problem we actually have? **YES** - duplicate content splitting authority
- Can we ship without this? **NO** - blocks other improvements
- Is there a 10x simpler solution? **NO** - this IS simple
- Effort: 2-3 hours

**VERDICT: APPROVED - MOVE TO TOP PRIORITY** ✅

**Why Both Reviews Agree:**
- Grok: "1-hour job, immediate authority benefit"
- Gemini: "2-3 hrs, immediate authority boost"
- **Impact:** Consolidates link equity, improves all other metrics

---

### ✅ Priority 2: Title & Meta Rewrites (KEEP & EXPAND)
**Current:** Scattered across priorities | **New:** Single focused effort

**Simplicity Filter:**
- Does this solve a problem we actually have? **YES** - 0.66% desktop CTR is catastrophic
- Can we ship without this? **NO** - this is the core fix
- Is there a 10x simpler solution? **NO** - this IS the solution
- Effort: 6-8 hours for top 20 pages

**VERDICT: APPROVED - CONSOLIDATE INTO SINGLE EFFORT** ✅

**What Both Reviews Agree:**
- Fixes desktop CTR problem
- Fixes zero-click pages
- Improves US CTR
- **One action, three benefits**

---

### ✅ Priority 3: FAQ Schema (SIMPLIFIED)
**Current:** 5 schema types on 10+ pages | **New:** FAQ only on top 5 pages

**Simplicity Filter:**
- Does this solve a problem we actually have? **YES** - research page needs FAQs
- Can we ship without this? **MAYBE** - but high ROI
- Is there a 10x simpler solution? **YES** - just FAQ, skip others
- Effort: 4-6 hours (was 8-10)

**VERDICT: APPROVED BUT SIMPLIFIED** ⚠️

**Why Simplified:**
- Grok: "Skip video schema entirely"
- Gemini: "FAQ only, 5 schema types = low impact"

---

## 📊 Reality Check: Expectations

### ❌ REJECTED: 300-500% Growth Claims
**Original:** 317 → 950-1,500 clicks/month in 12 weeks

**Simplicity Filter:**
- Does this solve a problem we actually have? **YES** - over-promising
- More realistic: 50-100% over 3-6 months

**Both Reviews Agree:**
- Grok: "Claims 300-500% from meta tweaks—realistically 50-100%"
- Gemini: "300-500% is fantasy. Realistic: 50-100% over 3-6 months"

**VERDICT: RESET EXPECTATIONS** ⚠️

**New Realistic Target:**
- **Week 4:** 317 → 400-450 clicks (+26-42%)
- **Week 12:** 317 → 475-635 clicks (+50-100%)
- **Month 6:** 317 → 550-750 clicks (+75-135%)

---

### ❌ REJECTED: 60-80 Hour Timeline
**Original:** 60-80 hours over 12 weeks

**Simplicity Filter:**
- Does this solve a problem we actually have? **YES** - bloated scope
- Can we ship faster? **YES** - 70% is overhead

**Both Reviews Agree:**
- Grok: "20 hours parallel work delivers 70% of value"
- Gemini: "12-17 hours (vs. 60-80 promised)"

**VERDICT: CUT SCOPE TO 12-20 HOURS** ✅

---

## 📋 Simplified Execution Plan

### Week 1: Foundation (6-8 hours)
**Priority:**
1. **URL Consolidation** (2-3 hrs)
   - Redirect all `/blog/` to `/never-hungover/`
   - Update internal links
   - Submit sitemap

2. **Title/Meta Batch Rewrite** (4-5 hrs)
   - Top 10 pages only
   - Focus on zero-click pages first (research, flyby review, etc.)
   - 155-160 char meta descriptions for desktop
   - Numbers + urgency in titles

**Expected:** +50-100 clicks within 2 weeks

---

### Week 2: Monitor & Iterate (2-3 hours)
**Priority:**
1. **Check GSC data** - Are changes working?
2. **Adjust underperformers** - If page still at 0 clicks, try different approach
3. **Document learnings** - What worked? What didn't?

**Expected:** Compounding effects, +80-120 total clicks

---

### Week 3: Quick Wins Only (4-6 hours)
**Priority:**
1. **FAQ Schema** - Top 5 pages only
   - Research page (1,714 impressions!)
   - Dosage guide (99 clicks)
   - Top 3 comparison posts

2. **Second Round Meta Optimization** - Based on Week 2 data

**Expected:** +100-150 total clicks

---

### Week 4+: Iterate Based on Data (2 hrs/week)
**Priority:**
1. Monitor GSC weekly
2. Optimize underperformers
3. Scale what works

**Expected:** +150-200 total clicks by Week 8-12

---

## 📈 Realistic Outcome

### Old Plan (REJECTED)
- Time: 60-80 hours
- Result: 950-1,500 clicks (+200-373%)
- ROI: 2-4 clicks/hour

### New Plan (APPROVED)
- **Time: 12-20 hours**
- **Result: 425-550 clicks (+35-75%) in 4 weeks**
- **ROI: 5-12 clicks/hour**

**Simplicity Win:** 3x better ROI with 70% less work

---

## 🎯 The 5-Line Pseudocode Test

**Can we explain this plan in 5 lines?**

```
1. Consolidate duplicate URLs → boost authority
2. Rewrite titles/metas on top 10 pages → fix CTR
3. Add FAQ schema to research page + top 5 → rich snippets
4. Monitor GSC weekly → iterate on data
5. Stop after 20 hours → measure ROI
```

**PASS** ✅ - This is simple enough to execute

---

## Summary: What Changed

### ❌ CUT (70% reduction):
- International expansion
- Homepage position optimization (defer)
- Elaborate risk tables
- Data Studio dashboard
- Root cause essays
- Video/How-to schemas
- Long-tail keyword project
- Detailed acceptance criteria
- 40-60 hours of overhead

### ✅ KEEP (Core 30%):
1. URL consolidation (Week 1)
2. Title/meta rewrites (Week 1)
3. FAQ schema only (Week 3)
4. Weekly monitoring

### ⚠️ RESET:
- Expectations: 50-100% growth (not 300-500%)
- Timeline: 12-20 hours (not 60-80)
- ROI: 5-12 clicks/hour (not 2-4)

---

## Next Step: Update PRD

Apply these filters to create:
- **PRD-SIMPLIFIED.md** - 2-page action plan
- **GitHub Issue #35 Update** - Realistic expectations
- **CLAUDE.md Learning** - Document what we cut and why

**Simplicity Framework Verdict:** ✅ **APPROVED WITH 70% SCOPE REDUCTION**
