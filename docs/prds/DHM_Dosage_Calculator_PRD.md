# Product Requirements Document: DHM Dosage Calculator Rewrite

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Proposed Solution](#proposed-solution)
4. [Detailed Feature Requirements](#detailed-feature-requirements)
5. [Technical Specifications](#technical-specifications)
6. [Content Inventory](#content-inventory)
7. [Implementation Approach](#implementation-approach)
8. [Success Criteria](#success-criteria)

---

## 1. Executive Summary

### Purpose of the Rewrite
The DHM Dosage Calculator page requires a complete rewrite to address critical rendering issues, performance problems, and maintainability concerns while preserving all valuable content and SEO benefits.

### Key Goals
1. **Eliminate Rendering Issues**: Remove complex animations, z-index conflicts, and visual glitches
2. **Improve Performance**: Reduce JavaScript bundle size, optimize rendering, improve Core Web Vitals
3. **Maintain SEO**: Preserve all SEO-optimized content, metadata, and rankings
4. **Enhance User Experience**: Simplify interactions while maintaining engagement
5. **Improve Maintainability**: Create cleaner, more modular code structure

### Success Metrics
- **Performance**: Lighthouse score >90 across all metrics
- **SEO**: Maintain or improve current search rankings
- **User Engagement**: Maintain or improve calculator completion rate
- **Technical**: Zero rendering issues, <3s time to interactive
- **Accessibility**: WCAG 2.1 AA compliance

---

## 2. Current State Analysis

### Existing Features and Content

#### Core Calculator Features
1. **Input Methods**:
   - Body weight (lbs/kg) with slider and numeric input
   - Number of drinks (1-12) with visual indicators
   - Drinking duration (1-8 hours) with slider
   - Alcohol tolerance selection (low/moderate/high)
   - Purpose selection (prevention/recovery)

2. **Calculation Logic**:
   - Base dosage: 300mg minimum or 5mg per kg body weight
   - Drink adjustment: +50mg per drink over 4
   - Duration adjustment: +25mg per hour over 4
   - Tolerance multipliers: low (1.2x), moderate (1.0x), high (0.8x)
   - Recovery purpose: 1.3x multiplier
   - Maximum cap: 1200mg

3. **Results Display**:
   - Personalized dosage recommendation
   - Timing instructions (before/after drinking)
   - Dosage breakdown explanation
   - Download protocol feature
   - Share results functionality

#### Interactive Components
1. **Quick Quiz**: 3-question personalization quiz
2. **Progress Tracking**: Visual progress indicators
3. **Social Proof**: Testimonial ticker
4. **Exit Intent Popup**: Email capture with free guide offer
5. **Welcome Back**: Returning user recognition
6. **Floating Action Buttons**: Quick access to calculator

#### Educational Content
1. **Safety Guidelines**: Dosage limits and considerations
2. **FAQ Section**: 6 comprehensive Q&As
3. **Scientific References**: 3 key studies with citations
4. **Related Calculators**: Cross-promotion
5. **CTA Sections**: Guide users to next steps

### Problematic Patterns Identified

#### Performance Issues
1. **Heavy Animation Usage**:
   - Framer Motion on nearly every element
   - Complex background animations
   - Continuous ticker animations
   - Multiple simultaneous transitions

2. **JavaScript Overhead**:
   - 54+ icon imports from lucide-react
   - Complex state management for minimal benefit
   - Unnecessary re-renders from animation triggers
   - Heavy engagement tracking on every interaction

3. **CSS Complexity**:
   - Multiple gradient backgrounds
   - Backdrop filters and blurs
   - Complex z-index layering
   - Hover effects on every interactive element

#### Architectural Issues
1. **Component Size**: 1972 lines in single file
2. **State Management**: 17+ useState hooks
3. **Side Effects**: Multiple useEffect hooks with complex dependencies
4. **Coupling**: Mixing presentation, logic, and tracking

#### UX Complexity
1. **Cognitive Overload**: Too many animated elements
2. **Mobile Issues**: Complex interactions for touch devices
3. **Accessibility**: Focus management problems with popups
4. **Loading States**: Artificial delays added for "effect"

### Valuable Content to Preserve

#### SEO Content
1. **Title**: "DHM Dosage Calculator 2024: How Much DHM Should I Take"
2. **Meta Description**: Comprehensive 3-line description
3. **Keywords**: 12+ targeted keywords
4. **Structured Data**: WebApplication + MedicalCalculator schema

#### Calculator Content
1. **All calculation formulas and logic**
2. **Input labels and helper text**
3. **Results explanations**
4. **Safety disclaimers**

#### Educational Content
1. **All FAQ Q&As**
2. **Dosage guidelines**
3. **Safety considerations**
4. **Scientific study summaries**
5. **Disclaimer text**

---

## 3. Proposed Solution

### Simplified Architecture Approach

#### Component Structure
```
DosageCalculator/
├── index.jsx                    # Main container component
├── components/
│   ├── Calculator/
│   │   ├── index.jsx           # Calculator logic container
│   │   ├── InputSection.jsx    # All input controls
│   │   ├── ResultsSection.jsx  # Results display
│   │   └── styles.module.css   # Scoped styles
│   ├── EducationalContent/
│   │   ├── SafetyGuidelines.jsx
│   │   ├── FAQ.jsx
│   │   └── ScientificReferences.jsx
│   └── common/
│       ├── SEOHead.jsx         # SEO metadata
│       └── Card.jsx            # Reusable card component
└── utils/
    ├── calculateDosage.js      # Pure calculation logic
    └── constants.js            # Configuration values
```

#### Design Principles
1. **Progressive Enhancement**: Core functionality works without JavaScript
2. **Mobile-First**: Design for mobile, enhance for desktop
3. **Semantic HTML**: Proper heading hierarchy, form labels
4. **CSS Grid/Flexbox**: Modern layout without hacks
5. **Minimal JavaScript**: Only where necessary for UX

### Performance Optimization Strategies

#### JavaScript Optimization
1. **Reduce Bundle Size**:
   - Import only needed icons
   - Lazy load non-critical components
   - Remove animation library
   - Simplify state management

2. **Optimize Renders**:
   - Use React.memo for static components
   - Debounce slider inputs
   - Remove unnecessary effects
   - Batch state updates

#### CSS Strategy
1. **Replace Complex Animations**:
   - Use CSS transitions for simple effects
   - Remove continuous animations
   - Simplify hover states
   - Use transform/opacity for performance

2. **Simplify Styling**:
   - Single gradient background
   - Flat design with subtle shadows
   - Clear visual hierarchy
   - Consistent spacing system

### Mobile-First Design Principles

#### Touch Optimization
1. **Large Touch Targets**: Minimum 44x44px
2. **Native Controls**: Use native select/input where possible
3. **Simplified Interactions**: Remove drag/swipe requirements
4. **Clear Visual Feedback**: Simple active states

#### Responsive Layout
1. **Single Column Mobile**: Stack all elements vertically
2. **Progressive Enhancement**: Add columns on larger screens
3. **Fluid Typography**: Use clamp() for responsive text
4. **Flexible Images**: Responsive sizing with aspect ratios

---

## 4. Detailed Feature Requirements

### Core Calculator Functionality

#### Input Requirements
1. **Body Weight Input**
   - Numeric input field with validation
   - Unit toggle (lbs/kg) with clear labeling
   - Range: 90-350 lbs or 40-160 kg
   - Default: 150 lbs
   - Real-time conversion between units

2. **Drinks Input**
   - Numeric input or select dropdown
   - Range: 1-12 drinks
   - Default: 4 drinks
   - Helper text: "1 drink = 12oz beer, 5oz wine, or 1.5oz spirits"

3. **Duration Input**
   - Select dropdown with 0.5-hour increments
   - Range: 1-8 hours
   - Default: 3 hours
   - Clear labeling: "How long will you be drinking?"

4. **Tolerance Selection**
   - Radio buttons or segmented control
   - Options: Low (Rarely drink), Moderate (Social drinker), High (Regular drinker)
   - Default: Moderate
   - Brief descriptions for each option

5. **Purpose Selection**
   - Radio buttons or toggle
   - Options: Prevention (before) or Recovery (after)
   - Default: Prevention
   - Clear benefit explanation for each

#### Calculation Requirements
- Maintain exact calculation logic from current implementation
- Show calculation immediately (no artificial delay)
- Display result prominently
- Provide breakdown explanation

### User Input Methods

#### Desktop
- Keyboard navigation support
- Enter key submission
- Tab order optimization
- Clear focus indicators

#### Mobile
- Native form controls
- Number pad for numeric inputs
- Large, thumb-friendly controls
- Minimal scrolling required

### Results Display

#### Primary Result
- Large, clear dosage display (e.g., "450 mg")
- Contextual explanation
- Visual hierarchy emphasis

#### Supporting Information
1. **Timing Instructions**
   - When to take (before/after)
   - Additional dose guidance
   - Water intake reminder

2. **Breakdown Explanation**
   - Base calculation
   - Adjustments applied
   - Safety cap notation

3. **Action Options**
   - Download protocol (text file)
   - Copy to clipboard
   - Print-friendly version

### Educational Content Sections

#### Placement Strategy
1. **Above the Fold**: Calculator and key value prop
2. **Below Calculator**: Safety guidelines
3. **Bottom Sections**: FAQ, references, related content

#### Content Requirements
- Expandable/collapsible sections on mobile
- Clear headings and structure
- Scannable bullet points
- Internal anchor links

### SEO Requirements

#### Technical SEO
1. **Meta Tags**:
   - Preserve all current meta content
   - Add Open Graph tags
   - Twitter Card metadata

2. **Structured Data**:
   - Maintain WebApplication schema
   - Add FAQPage schema
   - Breadcrumb markup

3. **Performance SEO**:
   - Core Web Vitals optimization
   - Image optimization
   - Lazy loading for below-fold content

#### Content SEO
1. **Keyword Placement**:
   - H1: Primary keyword
   - H2s: Secondary keywords
   - Natural keyword density

2. **Internal Linking**:
   - Related calculators
   - Educational content
   - Product reviews

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
1. **Form Accessibility**:
   - Proper labels for all inputs
   - Error messages associated with fields
   - Required field indicators
   - Fieldset/legend for grouped inputs

2. **Keyboard Navigation**:
   - All interactive elements keyboard accessible
   - Logical tab order
   - Skip links for main content
   - Focus trap for modals (if any)

3. **Screen Reader Support**:
   - ARIA labels where needed
   - Live regions for results
   - Proper heading hierarchy
   - Alt text for images

4. **Visual Accessibility**:
   - 4.5:1 contrast ratio for normal text
   - 3:1 for large text and UI elements
   - No color-only information
   - Respects prefers-reduced-motion

---

## 5. Technical Specifications

### Recommended Tech Stack Changes

#### Remove
- Framer Motion (animation library)
- Complex animation hooks
- Excessive icon imports
- Exit intent popup (or simplify)
- Floating action buttons

#### Keep
- React (core framework)
- React Router (navigation)
- Basic UI components (simplified)
- SEO hook (if lightweight)

#### Add/Modify
- CSS Modules for scoped styling
- React.lazy for code splitting
- Simple toast notifications
- Native form validation

### State Management Approach

#### Simplified State Structure
```javascript
// Single state object instead of 17 useState calls
const [calculatorState, setCalculatorState] = useState({
  weight: 150,
  weightUnit: 'lbs',
  drinks: 4,
  duration: 3,
  tolerance: 'moderate',
  purpose: 'prevention',
  showResults: false
});

// Derived values with useMemo
const dosageResult = useMemo(() => 
  calculateDosage(calculatorState), 
  [calculatorState]
);
```

### CSS/Styling Strategy

#### Approach: Utility-First with CSS Modules
```css
/* Base utilities */
.container { max-width: 64rem; margin: 0 auto; padding: 1rem; }
.card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.button { /* Simple, consistent button styles */ }

/* Component-specific styles in modules */
.calculator { /* Scoped calculator styles */ }
.input-group { /* Consistent input styling */ }
```

#### Design System
1. **Colors**: 
   - Primary: Blue-600
   - Success: Green-600
   - Warning: Amber-600
   - Grays: 50-900 scale

2. **Typography**:
   - System font stack
   - Consistent scale (sm, base, lg, xl, 2xl)
   - Line height: 1.5 for body, 1.2 for headings

3. **Spacing**:
   - 4px base unit
   - Consistent scale (1, 2, 4, 6, 8, 12, 16)

4. **Breakpoints**:
   - Mobile: <640px
   - Tablet: 640px-1024px
   - Desktop: >1024px

### Performance Budgets

#### Loading Performance
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1

#### Bundle Size
- JavaScript: <100KB gzipped
- CSS: <20KB gzipped
- Total page weight: <500KB

#### Runtime Performance
- No animation jank
- 60fps scrolling
- Instant input response
- No layout thrashing

---

## 6. Content Inventory

### All Text Content to Migrate

#### Page Headers and Descriptions
```
Title: DHM Dosage Calculator 2024: How Much DHM Should I Take | Personalized Hangover Prevention
Subtitle: Get your personalized DHM protocol in 2 minutes. Science-backed dosage recommendations that actually work.
Stats: 2 min calculation | 87% prevent hangovers | $0 Always free | 15k+ Happy users
```

#### Calculator Labels and Help Text
```
Body Weight: 
- Label: "Body Weight"
- Help: Range indicators and unit conversion

Expected Number of Drinks:
- Label: "Expected Number of Drinks"
- Help: "1 drink = 12oz beer, 5oz wine, or 1.5oz spirits"

Drinking Duration:
- Label: "Drinking Duration"
- Help: Time in hours

Alcohol Tolerance:
- Low: "Rarely drink"
- Moderate: "Social drinker"
- High: "Regular drinker"

Primary Goal:
- Prevention: "Hangover Prevention - Take before drinking"
- Recovery: "Hangover Recovery - Take after drinking"
```

#### Results Content
```
Recommended Dosage: [X] mg
Based on your [weight] [unit] body weight and [drinks] drinks over [duration] hours

Dosage Breakdown:
- Base dosage for Xkg body weight: Xmg
- Adjustment for X drinks: +Xmg
- [tolerance] tolerance adjustment applied
- [Recovery dosage increased by 30% | Prevention dosage optimized]

Timing Recommendations:
Prevention:
- Primary: 30-60 minutes before drinking
- Secondary: Optional: Additional dose after drinking
- Notes: Take with water for optimal absorption

Recovery:
- Primary: Immediately after drinking
- Secondary: Additional dose before bed
- Notes: Take with plenty of water and electrolytes
```

#### Safety Guidelines
```
General Dosage Guidelines:
- Standard dose: 300-600mg
- Prevention: 30-60 min before drinking
- Recovery: Immediately after drinking
- Maximum: 1200mg per 24 hours
- With food: Can be taken with or without

Safety Considerations:
- DHM is generally well-tolerated
- No known serious side effects
- May interact with some medications
- Consult healthcare provider if pregnant
- Not a substitute for responsible drinking

Disclaimer: This calculator provides general recommendations based on scientific research. Individual responses may vary. Always consult with a healthcare professional before starting any new supplement regimen. DHM is not intended to encourage excessive alcohol consumption. Please drink responsibly.
```

#### FAQ Content
```
Q1: How much DHM should I take for hangover prevention?
A1: The optimal DHM dosage for hangover prevention depends on your body weight, alcohol consumption, and tolerance. Most people need 300-600mg of dihydromyricetin, calculated at 5mg per kg of body weight. Our DHM dosage calculator provides personalized mg recommendations based on clinical research.

Q2: What is the correct dihydromyricetin dosage by weight?
A2: The standard dihydromyricetin dosage is 5mg per kg of body weight. For a 150lb (68kg) person, this equals approximately 340mg of DHM. Heavier individuals may need up to 600-800mg, while lighter people may only need 250-400mg for effective hangover prevention.

Q3: When should I take DHM for best results?
A3: For hangover prevention, take DHM 30-60 minutes before drinking. For recovery, take it immediately after drinking or before bed. DHM works best when taken with plenty of water.

Q4: Is DHM safe to take daily?
A4: DHM is generally well-tolerated with no serious side effects reported in clinical studies. However, it's designed for occasional use with alcohol consumption. Don't exceed 1200mg in 24 hours.

Q5: How effective is DHM for hangover prevention?
A5: Clinical studies demonstrate DHM's effectiveness in reducing hangover symptoms and blood alcohol levels. A 2024 randomized controlled trial showed significant reductions in blood alcohol and gastrointestinal hangover symptoms compared to placebo.

Q6: Can I take DHM with other supplements?
A6: DHM works well with electrolytes, B vitamins, and NAC (N-acetylcysteine). Avoid taking with blood thinners or if you have liver disease. Consult your healthcare provider for specific medication interactions.
```

#### Scientific References
```
UCLA Breakthrough Study (2012)
- Citation: Shen, Y., et al. - Journal of Neuroscience (Animal Study)
- Finding: DHM treatment resulted in 70% reduction in alcohol intoxication duration and prevented withdrawal symptoms in controlled animal studies.

USC Liver Protection Trial (2020)
- Citation: Chen, S., et al. - Journal of Hepatology
- Finding: 120-participant clinical trial showed 45% reduction in liver enzyme levels with 300mg twice daily dosing.

2024 Hangover Prevention RCT
- Citation: Double-blind randomized controlled trial - Foods Journal
- Finding: First rigorous human clinical trial demonstrating significant reduction in blood alcohol levels and hangover symptoms.

Complete Research Database:
Access our comprehensive database of 11 peer-reviewed studies with detailed methodology, results, and significance analysis.
```

### SEO Metadata

#### Meta Tags
```html
<title>DHM Dosage Calculator 2024: How Much DHM Should I Take | Personalized Hangover Prevention</title>
<meta name="description" content="Calculate your optimal DHM dosage for hangover prevention. Get personalized dihydromyricetin recommendations based on body weight, alcohol consumption, and timing. Free anti-hangover supplement calculator determines exact mg needed.">
<meta name="keywords" content="DHM dosage calculator, how much DHM should I take, dihydromyricetin dosage, hangover prevention calculator, anti hangover supplement dosage, DHM dosage by weight, hangover pill calculator, prevent hangover dosage, DHM supplement calculator, dihydromyricetin calculator, hangover prevention dosage, DHM mg calculator">
<link rel="canonical" href="https://www.dhmguide.com/dhm-dosage-calculator">
```

#### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": ["WebApplication", "MedicalCalculator"],
  "name": "DHM Dosage Calculator",
  "applicationCategory": "HealthApplication",
  "description": "Scientific DHM dosage calculator for personalized hangover prevention recommendations based on clinical research",
  "url": "https://www.dhmguide.com/dhm-dosage-calculator",
  "operatingSystem": "Web Browser",
  "applicationSuite": "DHM Guide",
  "medicalSpecialty": "Toxicology",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "DHM Guide",
    "url": "https://www.dhmguide.com"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-12-01"
}
```

### Images and Assets
- No critical images in current implementation
- Icons should be replaced with SVG sprites or minimal icon font
- Consider adding: DHM molecule diagram, dosage infographic

---

## 7. Implementation Approach

### Phased Rollout Plan

#### Phase 1: Core Calculator (Week 1)
1. **Setup and Structure**:
   - Create component structure
   - Set up CSS modules
   - Implement base styles

2. **Calculator Implementation**:
   - Build input components
   - Implement calculation logic
   - Create results display

3. **Testing**:
   - Unit tests for calculations
   - Cross-browser testing
   - Mobile device testing

#### Phase 2: Content Migration (Week 2)
1. **Educational Content**:
   - Safety guidelines component
   - FAQ section
   - Scientific references

2. **SEO Implementation**:
   - Meta tags and structured data
   - Internal linking
   - Content optimization

3. **Accessibility**:
   - ARIA implementation
   - Keyboard navigation
   - Screen reader testing

#### Phase 3: Polish and Optimization (Week 3)
1. **Performance**:
   - Bundle optimization
   - Image optimization
   - Lazy loading

2. **User Experience**:
   - Loading states
   - Error handling
   - Success feedback

3. **Analytics**:
   - Event tracking
   - Conversion tracking
   - A/B test setup

### Testing Strategy

#### Functional Testing
1. **Calculator Logic**:
   - All input combinations
   - Edge cases (min/max values)
   - Unit conversion accuracy
   - Results accuracy

2. **Form Validation**:
   - Required fields
   - Input ranges
   - Error messages
   - Submit behavior

3. **Cross-Browser**:
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers
   - Different viewport sizes

#### Performance Testing
1. **Lighthouse Audits**:
   - Performance score >90
   - Accessibility score 100
   - SEO score 100
   - Best practices score >90

2. **Real User Metrics**:
   - Page load time
   - Time to interactive
   - Input responsiveness
   - Scroll performance

#### SEO Testing
1. **Technical SEO**:
   - Meta tags rendering
   - Structured data validation
   - Mobile-friendly test
   - Core Web Vitals

2. **Content SEO**:
   - Keyword placement
   - Content completeness
   - Internal linking
   - Readability score

### Migration Checklist

#### Pre-Launch
- [ ] All content migrated and verified
- [ ] SEO metadata matches current
- [ ] Calculator logic tested thoroughly
- [ ] Mobile experience optimized
- [ ] Accessibility audit passed
- [ ] Performance budgets met
- [ ] Analytics tracking verified
- [ ] Stakeholder approval

#### Launch Day
- [ ] Deploy during low-traffic period
- [ ] Monitor error logs
- [ ] Check analytics data flow
- [ ] Verify SEO elements rendering
- [ ] Test all interactive features
- [ ] Monitor Core Web Vitals

#### Post-Launch
- [ ] Monitor search rankings
- [ ] Track user engagement metrics
- [ ] Gather user feedback
- [ ] Address any bug reports
- [ ] Plan iterative improvements

---

## 8. Success Criteria

### Performance Metrics

#### Technical Performance
- **Lighthouse Scores**:
  - Performance: >90
  - Accessibility: 100
  - Best Practices: >90
  - SEO: 100

- **Core Web Vitals**:
  - LCP: <2.5s (Good)
  - FID: <100ms (Good)
  - CLS: <0.1 (Good)

- **Bundle Size**:
  - JavaScript: <100KB gzipped
  - CSS: <20KB gzipped
  - Total page: <500KB

#### User Experience Metrics
- **Calculator Completion Rate**: ≥85%
- **Average Time on Page**: ≥2 minutes
- **Bounce Rate**: <40%
- **Mobile Usage**: Smooth experience for 100% of mobile users

### SEO Preservation

#### Rankings
- Maintain or improve current keyword rankings
- No drop in organic traffic
- Maintain featured snippets (if any)

#### Technical SEO
- All meta tags preserved
- Structured data validates
- Mobile-friendly test passes
- No crawl errors

### User Experience Improvements

#### Quantitative
- Reduced time to calculate (<5 seconds)
- Zero rendering issues reported
- 100% form completion success rate
- <3 second page load time

#### Qualitative
- Positive user feedback
- Intuitive interface
- Clear results presentation
- Professional appearance

### Business Impact

#### Engagement
- Maintain or increase email capture rate
- Maintain or increase social shares
- Maintain or increase downloads

#### Conversions
- Maintain or increase click-through to product reviews
- Maintain or increase guide downloads
- Support overall site conversion goals

---

## Appendices

### A. Current Performance Baseline
- Current Lighthouse scores
- Current Core Web Vitals
- Current rankings for target keywords
- Current user engagement metrics

### B. Competitor Analysis
- Similar calculators in the space
- Best practices observed
- Opportunities for differentiation

### C. Future Enhancements
- A/B testing opportunities
- Additional features to consider
- Integration possibilities
- Personalization options

### D. Risk Mitigation
- Rollback plan if issues arise
- SEO monitoring strategy
- User feedback collection
- Performance monitoring setup

---

*This PRD serves as the definitive guide for the DHM Dosage Calculator rewrite. All development decisions should align with the goals and specifications outlined in this document.*