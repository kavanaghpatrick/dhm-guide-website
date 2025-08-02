# CLAUDE.md - DHM Guide Website Development

## Quick Reference
**Every task**: Research → Plan → Code → Test → Deploy → Monitor  
**Research phase**: ALWAYS launch 3-5 parallel Tasks (never sequential) - this is non-negotiable  
**Content focus**: SEO, performance, user experience, conversion optimization  
**Stack**: Vite + Vue.js + Tailwind + Vercel deployment  

## Parallel Research Examples (Content/Web Focus)

**Example - Content Optimization**:
```
Task 1: Analyze current page performance and Core Web Vitals
Task 2: Research SEO best practices for health/supplement content
Task 3: Review competitor content structure and engagement patterns
Task 4: Check existing internal linking and content hierarchy
```

**Example - Technical Implementation**:
```
Task 1: Search existing component patterns in codebase
Task 2: Research Vite/Vue.js best practices for this feature
Task 3: Analyze performance impact and optimization opportunities
Task 4: Review accessibility and mobile responsiveness requirements
```

## DHM Guide Specific Workflow

### Content Strategy
- **Health content compliance** - Always verify medical claims against research
- **SEO-first approach** - Every change should consider search impact
- **User journey optimization** - Focus on conversion paths and user experience
- **Performance monitoring** - Track Core Web Vitals and loading times

### Technical Priorities
1. **Page Speed**: Sub-3 second loads, optimized images, lazy loading
2. **SEO Health**: Proper meta tags, structured data, internal linking
3. **Mobile First**: Responsive design, touch-friendly interactions
4. **Conversion**: Clear CTAs, optimized user flows, A/B testing

### Deployment & Monitoring
- **Vercel integration** - Automatic deploys from main branch
- **Performance tracking** - Monitor Web Vitals, SEO rankings
- **Content validation** - Check broken links, image optimization
- **User analytics** - Track engagement, conversion funnels

## Development Best Practices

### Content Guidelines
- **Evidence-based claims** - Always cite sources for health information
- **User-focused writing** - Address specific pain points and use cases
- **SEO optimization** - Target keywords naturally, optimize headings
- **Accessibility** - Alt text, proper heading hierarchy, readable contrast

### Code Quality
- **Component reusability** - DRY principles for Vue components
- **Performance first** - Optimize bundle size, lazy load non-critical resources
- **Mobile responsive** - Test all breakpoints, touch interactions
- **Cross-browser compatibility** - Test major browsers and devices

### Testing Strategy
- **Performance audits** - Lighthouse scores, Web Vitals monitoring
- **Content validation** - Spell check, fact verification, link testing
- **User testing** - Conversion funnel analysis, mobile usability
- **Technical testing** - Build validation, deployment verification