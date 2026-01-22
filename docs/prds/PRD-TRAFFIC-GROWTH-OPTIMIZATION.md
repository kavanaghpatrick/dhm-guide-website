# PRD: Traffic Growth Optimization & Retention Strategy

## Executive Summary

Based on comprehensive traffic analysis showing **+49% week-over-week DAU growth**, this PRD outlines actionable improvements to sustain momentum, fix identified issues, and improve user retention (currently only 10.9% returning visitors).

**Key Metrics:**
- DAU: 24.1 → 36.0 (+49% WoW)
- Google Organic: +33% WoW
- Bounce Rate: 95.4% (needs improvement)
- Pages/Session: 1.05 (needs improvement)
- Returning Users: 10.9% (needs improvement)

---

## Problem Statement

While traffic is growing due to recent SEO improvements, we have three critical issues:

1. **High Bounce Rate (95.4%)** - Users find what they need but don't explore
2. **Low Retention (10.9%)** - Few users return to the site
3. **Conversion Bottlenecks** - No CTAs above fold on key pages

---

## Root Cause Analysis Findings

### What's Working
- SEO title/meta fixes driving +33% Google traffic
- DHM Dosage Guide is the traffic engine (72% of Google traffic)
- Core Web Vitals are excellent (LCP <900ms, CLS <0.05)
- Content quality on top posts is strong

### What's Broken
1. **NAC vs DHM page dropped 70%** - Title change removed "antioxidant" keyword
2. **No above-fold CTAs** on /reviews page - first CTA at 747px
3. **Weak internal linking** - Hangover Supplements Guide has only 3 internal links
4. **Email capture exists but doesn't work** - Forms submit to nowhere
5. **Germany "traffic" was bot activity** - 100% from Hetzner data center
6. **Related content at bottom only** - Users don't scroll that far

---

## Proposed Solutions

### Phase 1: Quick Wins (This Week)

#### 1.1 Fix NAC vs DHM Traffic Drop
**Problem:** Title change from "Antioxidant" to "Liver Supplement" broke search alignment
**Solution:** Revert title and meta description

```
OLD (broken): "NAC vs DHM: Which Liver Supplement Works Better? [2025 Test]"
NEW (fixed): "NAC vs DHM: Which Antioxidant Works Better for Liver Protection? (2025)"
```

**File:** `src/newblog/data/posts/nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json`
**Expected Impact:** Restore 70% lost traffic (~7 sessions/week)
**Effort:** 5 minutes

#### 1.2 Add Above-Fold CTA to Reviews Page
**Problem:** No product CTAs visible without scrolling
**Solution:** Add featured #1 product card above the comparison table

**File:** `src/pages/Reviews.jsx`
**Expected Impact:** +15-25% affiliate click rate
**Effort:** 30 minutes

#### 1.3 Hide Broken Email Forms (AI RECOMMENDED - P0)
**Problem:** Email forms submit to nowhere - destroys user trust
**Solution:** Temporarily hide forms until fixed, or quick-fix with Formspree

**Files:**
- `src/pages/DosageCalculatorEnhanced.jsx` (exit intent popup + results section)

**Expected Impact:** Prevent trust damage
**Effort:** 10 minutes (hide) or 30 minutes (Formspree)

#### 1.4 External Links Open in New Tab (AI RECOMMENDED)
**Problem:** Users clicking external/affiliate links bounce and don't return
**Solution:** Add `target="_blank" rel="noopener noreferrer"` to all external links

**Files:** Global link component or individual pages
**Expected Impact:** Reduce bounce attribution, retain users
**Effort:** 15 minutes

#### 1.5 Fix Oversized Homepage Images (Demoted to P2)
**Problem:** Serving 1536w images when 760w would suffice (wasting 70KB)
**Solution:** Use proper srcset/sizes attributes

**File:** `src/pages/Home.jsx`
**Expected Impact:** -70KB page weight, faster mobile loads
**Effort:** 20 minutes

### Phase 2: Internal Linking Improvements (This Week)

#### 2.1 Add Missing Links to Hangover Supplements Guide
**Problem:** Only 3 internal links (should have 8-10)
**Solution:** Add links to /guide, /reviews, dosage guide, timing guide

**File:** `src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json`
**Expected Impact:** Better topic cluster authority, reduced bounce
**Effort:** 20 minutes

#### 2.2 Add Mid-Article Related Content
**Problem:** Related articles only at bottom (5000px down)
**Solution:** Add related content callout after 50% of content

**File:** `src/newblog/components/NewBlogPost.jsx`
**Expected Impact:** -10% bounce rate, +0.2 pages/session
**Effort:** 1 hour

#### 2.3 Fix URL Paths in Comparison Center
**Problem:** Uses `/posts/` prefix instead of `/never-hungover/`
**Solution:** Update all quickComparisons links

**File:** `src/newblog/data/posts/dhm-supplements-comparison-center-2025.json`
**Expected Impact:** Fix broken internal links
**Effort:** 15 minutes

### Phase 3: Retention & Conversion (Next Week)

#### 3.1 Connect Email Capture to ESP
**Problem:** Email forms exist but don't send anywhere
**Solution:** Integrate with ConvertKit or similar

**Files:**
- `src/pages/DosageCalculatorEnhanced.jsx`
- New: `api/subscribe.js` (Vercel serverless)

**Expected Impact:** Start building email list
**Effort:** 2 hours

#### 3.2 Add Footer Newsletter Signup
**Problem:** No site-wide email capture
**Solution:** Add simple newsletter form to Layout footer

**File:** `src/components/layout/Layout.jsx`
**Expected Impact:** +5-10 email captures/week
**Effort:** 30 minutes

#### 3.3 Add Blog Post Email Capture
**Problem:** Blog posts have no email CTAs
**Solution:** Add inline CTA after 50% scroll

**File:** `src/newblog/components/NewBlogPost.jsx`
**Expected Impact:** +10-20 email captures/week
**Effort:** 45 minutes

### Phase 4: Content Quality (Ongoing)

#### 4.1 Expand Thin Content Posts
**Problem:** Several posts under 500 words with no schema
**Priority Posts:**
- `alcohol-mitochondrial-function-cellular-energy-recovery-2025.json` (119 words)
- `ai-powered-alcohol-health-optimization-machine-learning-guide-2025.json` (389 words)

**Expected Impact:** Potential ranking for additional keywords
**Effort:** 2-3 hours per post

#### 4.2 Add FAQ Schema to All Posts
**Problem:** Only top performers have FAQ schema
**Solution:** Add 5 FAQs to each post without schema

**Expected Impact:** Rich snippet eligibility
**Effort:** 30 min per post

---

## Success Metrics (Conservative - Per AI Review)

| Metric | Current | Target (30 days) | Target (90 days) |
|--------|---------|------------------|------------------|
| DAU | 36 | 42 (+17%) | 55 (+53%) |
| Bounce Rate | 95.4% | 90% | 85% |
| Pages/Session | 1.05 | 1.15 | 1.25 |
| Returning Users | 10.9% | 13% | 16% |
| Email Subscribers | 0 | 15 | 50 |
| Affiliate Clicks/Day | 0.7 | 1.0 | 1.5 |

---

## Implementation Priority (Updated Per AI Review)

| Priority | Issue | Effort | Impact | ROI |
|----------|-------|--------|--------|-----|
| P0 | Fix NAC vs DHM title | 10 min | High | Immediate |
| P0 | Hide/fix broken email forms | 10 min | High | Trust |
| P0 | Add above-fold CTA to /reviews | 1-1.5 hr | High | High |
| P1 | External links open in new tab | 15 min | Medium | High |
| P1 | Add internal links to Hangover Guide | 30 min | Medium | High |
| P1 | Fix Comparison Center URLs | 20 min | Medium | High |
| P2 | Fix homepage image sizes | 20 min | Low | Medium |
| P2 | Mid-article related content | 2 hr | Medium | Medium |
| P2 | Simple email capture (Formspree) | 30 min | Medium | Medium |
| P3 | Full ESP integration (ConvertKit) | 4-6 hr | Medium | Low |
| P3 | Footer newsletter | 45 min | Low | Low |
| P3 | Expand thin content | 3-4 hr/post | Low | Low |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Title changes hurt other rankings | Low | High | Monitor GSC for 2 weeks |
| Email integration complexity | Medium | Low | Start with Formspree (5 min) before full ESP |
| Mid-content CTAs hurt reading flow | Low | Medium | A/B test placement |
| GDPR/Privacy compliance | Medium | High | Add privacy policy checkbox to forms |
| SEO volatility from algo changes | Medium | High | Diversify traffic sources |
| Broken email forms destroy trust | High | High | **P0: Hide or fix immediately** |

---

## External AI Review Feedback (Applied)

### Gemini Review
1. **ACCEPTED**: Broken email forms elevated to P0 - hide immediately
2. **ACCEPTED**: Homepage images demoted to P2 (LCP already good)
3. **ACCEPTED**: Added external links target="_blank" as quick win
4. **ACCEPTED**: Increased email integration estimate to 4-6 hours
5. **ACCEPTED**: Added GDPR/privacy risk

### Grok Review
1. **ACCEPTED**: Use Formspree.io as quick email fix (5 min) before full ESP
2. **ACCEPTED**: Added bot traffic filtering to scope
3. **ACCEPTED**: Made success metrics more conservative
4. **ACCEPTED**: Double effort estimates for realistic planning
5. **REJECTED**: Social sharing - low priority for this traffic level

---

## Out of Scope

- Major redesign of any pages
- New feature development beyond email capture
- Paid advertising
- Social media strategy
- Content for Germany market (bot traffic)

---

## Dependencies

- PostHog API key with query:read scope (already configured)
- ConvertKit or similar ESP account (needs setup)
- No external dependencies for Phase 1-2

---

## Timeline

**Week 1 (Phase 1 + 2):**
- Day 1: P0 issues (NAC title, Reviews CTA)
- Day 2: P1 issues (images, internal linking)
- Day 3-4: Mid-article related content

**Week 2 (Phase 3):**
- Day 1-2: Email capture integration
- Day 3: Footer newsletter, blog email CTA

**Ongoing (Phase 4):**
- Expand 1-2 thin content posts per week
- Add FAQ schema to 2-3 posts per week

---

## Appendix: Research Sources

1. PostHog DAU analysis (Jan 8-22, 2026)
2. Playwright screenshots of /reviews, competitor sites
3. Internal linking audit of top 5 posts
4. Git history of SEO changes (last 30 days)
5. Core Web Vitals performance audit
6. Email capture functionality audit
7. Germany traffic bot analysis
