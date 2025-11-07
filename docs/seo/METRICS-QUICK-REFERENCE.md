# Internal Linking Metrics - Quick Reference

**Last Updated**: October 21, 2025
**Full Documentation**: [INTERNAL-LINKING-METRICS-AND-MONITORING.md](./INTERNAL-LINKING-METRICS-AND-MONITORING.md)

---

## Current State (Baseline)

| Metric | Value | Status |
|--------|-------|--------|
| Internal Links (blog-to-blog) | 7 | 🔴 Critical |
| Avg Links per Post | 0.04 | 🔴 Critical |
| Orphaned Posts | 162 (93.6%) | 🔴 Critical |
| Indexed Pages | 74 (41.8%) | 🔴 Critical |
| Crawled-Not-Indexed | 103 (58.2%) | 🔴 Critical |
| Topic Clusters | 2 | 🟡 Warning |

**Assessment**: Severe internal linking deficit. Immediate action required.

---

## Targets by Timeline

### Week 2 Target
- Internal Links: **100+** (from 7)
- Avg Links/Post: **0.6** (from 0.04)
- Orphaned Posts: **140** (from 162)
- Indexed Pages: **76-80** (from 74)

### Month 1 Target
- Internal Links: **300+**
- Avg Links/Post: **1.7**
- Orphaned Posts: **90**
- Indexed Pages: **85-92** (48-52% coverage)
- Organic Traffic: **+5-10%**

### Month 3 Target
- Internal Links: **600+**
- Avg Links/Post: **3.5**
- Orphaned Posts: **20**
- Indexed Pages: **130-140** (73-79% coverage)
- Organic Traffic: **+25-35%**

### Month 6 Target (Final)
- Internal Links: **800+** ✅ Industry Standard
- Avg Links/Post: **4.6** ✅ Industry Standard
- Orphaned Posts: **<10 (5.8%)** ✅ Industry Standard
- Indexed Pages: **155-165** (87-93% coverage)
- Organic Traffic: **+40-60%**
- Pages per Session: **+30%**
- Bounce Rate: **-15%**

---

## Key Metrics to Track Weekly

### Internal Linking Health
- [ ] Total blog-to-blog links
- [ ] Average links per post
- [ ] Orphaned posts count
- [ ] Bidirectional link pairs
- [ ] Topic clusters count

### Indexing Performance (GSC)
- [ ] Indexed pages (number + %)
- [ ] Crawled-not-indexed (number + %)
- [ ] Coverage issues
- [ ] Pages indexed this week
- [ ] Pages de-indexed this week

### Organic Traffic (GA4)
- [ ] Organic sessions (WoW change)
- [ ] Organic landing pages
- [ ] Pages per session
- [ ] Avg session duration
- [ ] Bounce rate

### User Engagement
- [ ] Internal link CTR
- [ ] Related posts CTR
- [ ] Avg time on blog posts
- [ ] Scroll depth

---

## Red Flags (Immediate Action)

| Alert | Threshold | Action |
|-------|-----------|--------|
| 🔴 Index Drop | >5% decrease | Check GSC, review recent changes |
| 🔴 Mass De-index | >10 pages in 7 days | Audit content quality, fix issues |
| 🔴 Traffic Drop | >10% WoW decrease | Check for algorithm update, technical errors |
| 🔴 Keyword Drop | Top 10 drops >5 positions | Review competitors, enhance content |

## Warning Indicators

| Alert | Threshold | Action |
|-------|-----------|--------|
| 🟡 Crawled-Not-Indexed Up | >5% increase | Enhance content, add internal links |
| 🟡 Low Link CTR | <1% | Improve anchor text, link placement |
| 🟡 Bounce Rate Up | >5% WoW increase | Check traffic sources, page speed |
| 🟡 Page Depth Increase | Avg >3.5 clicks | Add more internal links to deep pages |

## Success Milestones

| Milestone | Target | Reward |
|-----------|--------|--------|
| 🟢 100 Links Added | Week 2 | Foundation established |
| 🟢 300 Links Added | Month 1 | Clusters connected |
| 🟢 65% Indexed | Month 1 | Indexing improving |
| 🟢 600 Links Added | Month 3 | Maturity reached |
| 🟢 79% Indexed | Month 3 | Strong coverage |
| 🟢 90% Indexed | Month 6 | Industry standard |

---

## Weekly Checklist (Every Monday)

### Data Collection (30 min)
- [ ] Run `node scripts/analyze-internal-links.js`
- [ ] Export GSC coverage report
- [ ] Export GA4 weekly summary
- [ ] Document any issues observed

### Review (30 min)
- [ ] Compare to previous week
- [ ] Check for red flags
- [ ] Identify top 5 orphaned priority posts
- [ ] Review dashboard alerts

### Planning (30 min)
- [ ] Plan links to add this week (target: 50+)
- [ ] Assign posts for enhancement
- [ ] Update internal linking plan
- [ ] Share progress with team

**Total Time**: 90 minutes/week

---

## Monthly Review (1st of Month)

### Full Analysis (3-4 hours)
1. Export all data sources
2. Run Screaming Frog crawl
3. Calculate all KPIs
4. Compare to targets
5. Document learnings
6. Create summary report
7. Plan next month's goals

### Key Questions
- Are we on track for targets?
- What's working well?
- What's not working?
- What should we change?
- What new opportunities exist?

---

## Tools Required

### Essential (Week 1)
- ✅ Google Search Console (already set up)
- ⚠️ Google Analytics 4 (NEEDS SETUP)
- ⚠️ Internal link analysis script (TO CREATE)
- ⚠️ Engagement tracking updates (TO ADD)

### Important (Week 2)
- ⚠️ GSC API integration (TO CREATE)
- ⚠️ Monitoring dashboard (TO BUILD)
- ⚠️ Alert system (TO CONFIGURE)

### Nice to Have (Month 1)
- Screaming Frog SEO Spider
- Google Data Studio
- Hotjar or Microsoft Clarity

---

## Next Immediate Actions

### Priority 1 (This Week)
1. **Set up GA4 tracking** - Critical for traffic baseline
2. **Create link analysis script** - Automate weekly tracking
3. **Add 50+ internal links** - Begin implementation
4. **Update engagement-tracker.js** - Add link click tracking

### Priority 2 (Next Week)
1. Create monitoring dashboard
2. Set up GSC API integration
3. Configure alerts (email/Slack)
4. Continue adding links (target: 100 total)

### Priority 3 (Month 1)
1. First monthly review
2. Screaming Frog crawl (page depth)
3. Reach 300+ links
4. Measure first indexing improvements

---

## Contact & Support

**Full Documentation**: `/docs/seo/INTERNAL-LINKING-METRICS-AND-MONITORING.md`
**Related Plans**: `/docs/seo/internal-linking-plan.md`
**Current Status**: `/docs/seo/internal-linking-report.md`

**Questions?** Review full documentation or contact SEO team.

---

**Remember**: Internal linking is a marathon, not a sprint. Consistent weekly progress beats sporadic large efforts.

**Target**: Add 50-75 links per week for 12 weeks = 600-900 links total ✅
