# Product Requirements Document: Recover De-indexed Pages

## Executive Summary
21 previously indexed pages have been removed from Google's index between June 29 - July 13, 2025, representing a significant loss of search visibility and organic traffic. This requires immediate investigation and recovery action.

## Problem Statement
Pages that were successfully indexed and driving traffic have been actively removed from Google's index, suggesting:
- Algorithm update penalties
- Quality threshold changes
- YMYL (Your Money Your Life) compliance issues
- Competitive displacement
- Technical problems

## Affected Content Analysis
- **Product Reviews**: DHM Depot, Good Morning, Flyby, Fuller reviews
- **Professional Guides**: Business travel, networking, executive wellness
- **Usage Guides**: Timing guides, emergency protocols, work-life balance
- **Timeline**: De-indexing occurred in two waves (June 29 and July 2)

## Success Metrics
- **Immediate**: Identify specific de-indexing triggers within 3 days
- **Short-term**: Recover 15+ pages to index within 30 days
- **Long-term**: Prevent future de-indexing with quality improvements

## Root Cause Investigation

### Phase 1: Algorithm Update Analysis (Day 1)

#### Google Update Timeline Check
```javascript
const checkAlgorithmUpdates = () => {
  const deindexingDates = ['2025-06-29', '2025-07-02'];
  const knownUpdates = {
    '2025-06-28': 'June 2025 Helpful Content Update',
    '2025-07-01': 'July 2025 Core Update',
    '2025-07-15': 'Link Spam Update'
  };
  
  const correlations = deindexingDates.map(date => {
    const nearbyUpdate = Object.entries(knownUpdates)
      .find(([updateDate]) => {
        const daysDiff = Math.abs(new Date(date) - new Date(updateDate)) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3;
      });
    
    return {
      deindexDate: date,
      possibleUpdate: nearbyUpdate
    };
  });
  
  return correlations;
};
```

#### YMYL Compliance Audit
```javascript
const ymylComplianceCheck = {
  // Health/medical content requirements
  medicalClaims: (content) => {
    const claims = extractMedicalClaims(content);
    return claims.map(claim => ({
      claim: claim.text,
      hasSource: claim.hasScientificSource,
      isQualified: claim.hasDisclaimer,
      riskLevel: assessClaimRisk(claim)
    }));
  },
  
  // Author expertise signals
  authorCredentials: (post) => {
    return {
      hasAuthorBio: !!post.authorBio,
      hasMedicalReview: !!post.medicalReviewer,
      hasExpertiseSignals: checkExpertiseSignals(post),
      hasDisclaimer: post.content.includes('medical disclaimer')
    };
  },
  
  // Trust signals
  trustIndicators: (post) => {
    return {
      lastUpdated: post.lastModified,
      isRecent: isWithinMonths(post.lastModified, 6),
      hasSources: countScientificSources(post) > 5,
      hasContactInfo: !!post.authorEmail
    };
  }
};
```

### Phase 2: Content Quality Deep Dive (Day 2)

#### Comparative Quality Analysis
```javascript
const compareIndexedVsDeindexed = async () => {
  const indexed = await getIndexedPosts();
  const deindexed = await getDeindexedPosts();
  
  const metrics = {
    indexed: calculateAverageMetrics(indexed),
    deindexed: calculateAverageMetrics(deindexed)
  };
  
  return {
    wordCountDiff: metrics.indexed.avgWords - metrics.deindexed.avgWords,
    linksDiff: metrics.indexed.avgLinks - metrics.deindexed.avgLinks,
    updateFreshness: metrics.indexed.daysSinceUpdate - metrics.deindexed.daysSinceUpdate,
    qualityScore: metrics.indexed.quality - metrics.deindexed.quality
  };
};

const calculateAverageMetrics = (posts) => {
  return {
    avgWords: average(posts.map(p => p.wordCount)),
    avgLinks: average(posts.map(p => p.externalLinks)),
    daysSinceUpdate: average(posts.map(p => daysSince(p.lastModified))),
    quality: average(posts.map(p => assessQuality(p)))
  };
};
```

#### Manual Action Check
```bash
# Check Search Console for manual actions
1. Go to Search Console
2. Security & Manual Actions > Manual actions
3. Check for any penalties

# Check for specific page issues
4. URL Inspection tool for each de-indexed URL
5. Document any specific errors or warnings
```

### Phase 3: Technical SEO Forensics (Day 3)

#### Historical Snapshot Analysis
```javascript
const analyzeHistoricalChanges = async () => {
  const changes = [];
  
  for (const url of deindexedUrls) {
    // Check Wayback Machine
    const historicalVersions = await getWaybackSnapshots(url);
    
    // Compare current vs indexed version
    const lastIndexed = historicalVersions.find(v => v.date < '2025-06-29');
    const current = await fetchCurrentVersion(url);
    
    changes.push({
      url,
      contentChanges: diffContent(lastIndexed, current),
      structuralChanges: diffStructure(lastIndexed, current),
      technicalChanges: diffTechnical(lastIndexed, current)
    });
  }
  
  return changes;
};
```

#### Backlink Profile Analysis
```javascript
const checkBacklinkHealth = async () => {
  const deindexedBacklinks = await getBacklinks(deindexedUrls);
  const indexedBacklinks = await getBacklinks(indexedUrls);
  
  return {
    deindexedAvgDR: average(deindexedBacklinks.map(b => b.domainRating)),
    indexedAvgDR: average(indexedBacklinks.map(b => b.domainRating)),
    toxicLinks: deindexedBacklinks.filter(b => b.spamScore > 30),
    lostLinks: findLostBacklinks(deindexedUrls)
  };
};
```

## Recovery Strategy

### Phase 4: Content Rehabilitation (Day 4-10)

#### Medical Content Enhancement
```javascript
const enhanceMedicalCredibility = (post) => {
  const enhancements = [];
  
  // Add medical reviewer
  enhancements.push({
    type: 'add_medical_review',
    content: `
## Medical Review
This content has been reviewed for medical accuracy by [Medical Professional Name], 
[Credentials], on ${new Date().toLocaleDateString()}.
    `
  });
  
  // Add comprehensive disclaimer
  enhancements.push({
    type: 'add_disclaimer',
    content: `
<div class="medical-disclaimer">
⚠️ **Medical Disclaimer**: This content is for informational purposes only and is not 
intended as medical advice. Always consult with a qualified healthcare provider before 
making decisions about your health or alcohol consumption.
</div>
    `
  });
  
  // Add scientific sources
  enhancements.push({
    type: 'add_citations',
    content: formatScientificCitations(findRelevantStudies(post.topic))
  });
  
  // Add author expertise
  enhancements.push({
    type: 'add_author_bio',
    content: `
## About the Author
Written by ${post.author}, a health and wellness researcher with 10+ years of experience 
in nutritional supplementation and hangover prevention research. Reviewed scientific 
literature from PubMed, clinical trials, and peer-reviewed journals.
    `
  });
  
  return applyEnhancements(post, enhancements);
};
```

#### Content Freshness Injection
```javascript
const injectFreshness = (post) => {
  const updates = [];
  
  // Add 2025 specific content
  updates.push({
    section: 'intro',
    content: `*Updated ${new Date().toLocaleDateString()} with latest 2025 research and clinical findings.*`
  });
  
  // Add recent studies
  const recentStudies = getStudiesAfter('2024-01-01', post.topic);
  if (recentStudies.length > 0) {
    updates.push({
      section: 'research',
      content: formatRecentStudies(recentStudies)
    });
  }
  
  // Update statistics
  updates.push({
    section: 'statistics',
    content: updateStatistics(post.content, getCurrentStats())
  });
  
  // Add trending related topics
  updates.push({
    section: 'trends',
    content: `
## 2025 Trends in ${post.topic}
${formatTrendingTopics(getTrends(post.topic))}
    `
  });
  
  return applyUpdates(post, updates);
};
```

#### E-E-A-T Optimization
```javascript
const optimizeEEAT = {
  expertise: (post) => {
    // Add expert quotes
    post.content += getExpertQuotes(post.topic);
    // Add professional insights
    post.content += getProfessionalInsights(post.topic);
    // Add case studies
    post.content += getCaseStudies(post.topic);
  },
  
  experience: (post) => {
    // Add first-hand testing
    post.content += getFirstHandExperience(post.product);
    // Add user testimonials
    post.content += getRealUserTestimonials(post.product);
    // Add detailed methodology
    post.content += getTestingMethodology();
  },
  
  authoritativeness: (post) => {
    // Add brand credentials
    post.content += getBrandCredentials();
    // Add industry recognition
    post.content += getIndustryRecognition();
    // Add partnerships
    post.content += getPartnershipInfo();
  },
  
  trustworthiness: (post) => {
    // Add transparency disclosures
    post.content += getTransparencyDisclosures();
    // Add editorial process
    post.content += getEditorialProcess();
    // Add fact-checking info
    post.content += getFactCheckingProcess();
  }
};
```

### Phase 5: Technical Recovery (Day 10-14)

#### Schema Enhancement
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "about": {
    "@type": "MedicalCondition",
    "name": "Hangover Prevention"
  },
  "medicalAudience": {
    "@type": "MedicalAudience",
    "audienceType": "Adult health-conscious consumers"
  },
  "reviewedBy": {
    "@type": "Person",
    "name": "[Medical Reviewer]",
    "credential": "[Medical Degree]"
  },
  "dateReviewed": "2025-08-06",
  "disclaimer": "This content is for informational purposes only...",
  "citation": [
    {
      "@type": "ScholarlyArticle",
      "headline": "[Study Title]",
      "datePublished": "[Date]",
      "author": "[Authors]"
    }
  ]
}
```

#### Page Authority Building
```javascript
const buildPageAuthority = async (url) => {
  const strategies = [];
  
  // Internal linking boost
  strategies.push({
    action: 'internal_links',
    implementation: async () => {
      const highAuthorityPages = await getTopPages(10);
      for (const page of highAuthorityPages) {
        await addContextualLink(page, url);
      }
    }
  });
  
  // Create supporting content
  strategies.push({
    action: 'supporting_content',
    implementation: async () => {
      const supportingTopics = generateSupportingTopics(url);
      for (const topic of supportingTopics) {
        await createSupportingPost(topic, url);
      }
    }
  });
  
  // External mention campaign
  strategies.push({
    action: 'external_mentions',
    implementation: async () => {
      await submitToRelevantDirectories(url);
      await createSocialSignals(url);
      await outreachToRelevantSites(url);
    }
  });
  
  for (const strategy of strategies) {
    await strategy.implementation();
  }
};
```

### Phase 6: Re-indexing Campaign (Day 14-21)

#### Graduated Re-indexing Strategy
```javascript
const reindexingCampaign = {
  week1: async () => {
    // Start with highest quality improved pages
    const topPages = selectTopImprovedPages(5);
    for (const page of topPages) {
      await requestIndexing(page);
      await wait(24 * 60 * 60 * 1000); // 24 hours between requests
    }
  },
  
  week2: async () => {
    // Submit next batch if first successful
    const firstBatchStatus = await checkIndexingStatus(week1Pages);
    if (firstBatchStatus.successRate > 0.6) {
      const nextBatch = selectNextBatch(10);
      for (const page of nextBatch) {
        await requestIndexing(page);
        await wait(12 * 60 * 60 * 1000); // 12 hours between
      }
    }
  },
  
  week3: async () => {
    // Final push for remaining pages
    const remaining = getRemainingPages();
    for (const page of remaining) {
      await requestIndexing(page);
      await wait(6 * 60 * 60 * 1000); // 6 hours between
    }
  }
};
```

## Monitoring & Prevention

### Real-time De-indexing Detection
```javascript
const deindexingMonitor = {
  async checkDaily() {
    const indexedPages = await getIndexedPages();
    const previousCount = await getPreviousIndexCount();
    
    if (indexedPages.length < previousCount) {
      const droppedPages = await identifyDroppedPages();
      await alert({
        type: 'CRITICAL',
        message: `${droppedPages.length} pages de-indexed`,
        pages: droppedPages
      });
      
      // Immediate action
      for (const page of droppedPages) {
        await investigateDeindexing(page);
        await applyQuickFix(page);
        await requestReindexing(page);
      }
    }
    
    await saveIndexCount(indexedPages.length);
  }
};
```

### Quality Maintenance System
```javascript
const qualityMaintenance = {
  monthlyAudit: async () => {
    const allPosts = await getAllPosts();
    
    for (const post of allPosts) {
      const issues = [];
      
      // Check freshness
      if (daysSince(post.lastModified) > 180) {
        issues.push('needs_update');
      }
      
      // Check medical accuracy
      if (hasMedicalClaims(post) && !hasRecentMedicalReview(post)) {
        issues.push('needs_medical_review');
      }
      
      // Check broken links
      const brokenLinks = await checkLinks(post);
      if (brokenLinks.length > 0) {
        issues.push('has_broken_links');
      }
      
      // Check competitive position
      const rankingPosition = await checkRanking(post);
      if (rankingPosition > 10) {
        issues.push('losing_rankings');
      }
      
      if (issues.length > 0) {
        await scheduleUpdate(post, issues);
      }
    }
  }
};
```

## Success Criteria Checklist

### Immediate (Days 1-3)
- [ ] Identify specific de-indexing triggers
- [ ] Document correlation with algorithm updates
- [ ] Complete YMYL compliance audit
- [ ] Check for manual actions

### Short-term (Days 4-14)
- [ ] Enhance medical credibility for all affected pages
- [ ] Add E-E-A-T signals to content
- [ ] Update all pages with fresh 2025 content
- [ ] Implement comprehensive schema markup
- [ ] Build internal link authority

### Medium-term (Days 15-30)
- [ ] Submit enhanced pages for re-indexing
- [ ] Achieve 50% re-indexing rate
- [ ] Monitor organic traffic recovery
- [ ] Document successful recovery patterns

### Long-term (30+ days)
- [ ] Achieve 75% recovery rate
- [ ] Implement automated monitoring
- [ ] Create prevention protocols
- [ ] Maintain quality standards
- [ ] Regular YMYL compliance checks

## Risk Mitigation

### Risk Matrix
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Pages don't get re-indexed | Medium | High | Multiple recovery strategies |
| Further de-indexing | Low | Critical | Daily monitoring system |
| Medical content penalties | Medium | High | Professional medical review |
| Competitive displacement | High | Medium | Content differentiation |
| Technical issues | Low | Medium | Regular technical audits |

## Resource Requirements
- **Engineering**: 40 hours for technical fixes
- **Content Team**: 60 hours for content enhancement
- **Medical Reviewer**: 10 hours for YMYL compliance
- **SEO Specialist**: 20 hours for strategy and monitoring

## Timeline Summary
- **Week 1**: Investigation and root cause analysis
- **Week 2**: Content enhancement and E-E-A-T optimization
- **Week 3**: Technical fixes and re-indexing campaign
- **Week 4**: Monitoring and adjustment
- **Month 2**: Full recovery and prevention system implementation