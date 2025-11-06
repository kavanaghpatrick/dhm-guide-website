# DHM Dosage Calculator Rewrite - Product Requirements Document

## Executive Summary

### Purpose
Complete rewrite of the DHM Dosage Calculator page to eliminate persistent rendering issues, z-index conflicts, and performance problems while maintaining all SEO value and content effectiveness.

### Key Goals
1. **Eliminate Rendering Issues**: Remove all z-index conflicts, overlay problems, and navigation blocking
2. **Improve Performance**: Achieve Lighthouse score >90 on all metrics
3. **Maintain SEO**: Preserve all keyword rankings and organic traffic
4. **Enhance UX**: Simplify user experience while maintaining conversion rate
5. **Mobile-First**: Prioritize mobile performance and usability
6. **Pattern Consistency**: Align with existing codebase patterns and utilities

### Success Metrics
- Zero rendering/navigation issues reported
- Lighthouse Performance Score >90
- Maintain current organic traffic levels
- <3s Time to Interactive on mobile
- Maintain or improve current conversion rate (baseline: track current)
- Full integration with existing hooks and utilities

### Key Updates from Codebase Analysis
Based on comprehensive analysis, this PRD has been updated to:
- **Use minimal animations** instead of removing them entirely
- **Integrate all existing hooks** (SEO, mobile optimization, header height)
- **Follow established navigation patterns** with CustomLink and scroll utilities
- **Apply existing button and card styling** patterns
- **Include engagement tracking** throughout the calculator
- **Use proper z-index CSS variables** from the design system
- **Apply touch optimization classes** from index.css

## Current State Analysis

### Existing Features
1. **Interactive Calculator**
   - Gender selection
   - Weight input (kg/lbs toggle)
   - Drinking duration slider
   - Drink count slider
   - Drinking frequency selector

2. **Results Display**
   - Base dosage recommendation
   - Three-tier protocol
   - Personalized timing instructions
   - Visual dosage cards
   - Safety warnings for high doses

3. **Engagement Features**
   - Quick quiz (3 questions)
   - Exit intent popup
   - Progress indicators
   - Email capture
   - Social sharing
   - Results download/email

4. **Educational Content**
   - Science behind dosage section
   - GABA receptor mechanism explanation
   - Enzyme activity information
   - Comprehensive FAQ
   - Safety considerations
   - Related calculators

### Problematic Patterns Identified
1. **Heavy Animation Usage**
   - Framer Motion throughout
   - Complex entrance/exit animations
   - Hover effects on every interactive element
   - AnimatePresence causing unmount issues

2. **Z-Index Complexity**
   - Exit intent popup creating invisible overlays
   - Multiple stacking contexts from transforms
   - Header/navigation conflicts
   - Modal/overlay z-index conflicts

3. **Performance Issues**
   - Large JavaScript bundle from animations
   - Multiple re-renders from complex state
   - Heavy component tree
   - Unnecessary effect chains

4. **State Management**
   - Deeply nested state updates
   - Multiple useState calls
   - Complex dependency arrays
   - Unnecessary re-calculations

### Valuable Content to Preserve

#### SEO Content
- Title: "DHM Dosage Calculator: Personalized Hangover Prevention | GABA Protection"
- Meta description focusing on GABA receptors and enzyme mechanisms
- All FAQ content
- Science explanations
- Structured data schemas

#### Calculator Logic
```javascript
// Core formula to preserve
const getBaseDosage = (weight, weightUnit) => {
  const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
  const baseDosage = Math.round(weightInKg * 15 / 50) * 50
  return Math.max(300, Math.min(baseDosage, 1200))
}

// Duration multiplier
const durationMultiplier = {
  '1-2 hours': 0.7,
  '2-4 hours': 1.0,
  '4-6 hours': 1.3,
  '6+ hours': 1.5
}

// Frequency multiplier
const frequencyMultiplier = {
  'rarely': 1.0,
  'monthly': 1.1,
  'weekly': 1.2,
  'daily': 1.3
}
```

## Proposed Solution

### Architecture Principles
1. **Simplicity First**: Remove complex animations while keeping minimal polish
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Mobile-First**: Design for mobile, enhance for desktop
4. **Performance Budget**: <50KB JavaScript, <3s TTI
5. **Semantic HTML**: Proper heading hierarchy and ARIA labels
6. **Design System Adherence**: Use only existing components and patterns
7. **Pattern Consistency**: Follow established navigation, tracking, and mobile patterns

### Existing Components to Use
Based on the current design system:

**Form Components:**
- `Form` (with react-hook-form) for validation
- `Input` for number inputs
- `Label` for all form fields
- `RadioGroup` and `RadioGroupItem` for gender selection
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` for dropdowns
- `Button` for actions
- `Switch` or `ToggleGroup` for unit switching

**Display Components:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` for results
- `Badge` for highlighting values
- `Alert` for warnings
- `Progress` for visual indicators
- `Accordion` for educational content
- `Separator` for visual breaks

**Layout Components:**
- Container patterns from existing pages
- Gradient backgrounds matching site theme
- Consistent padding/margin using Tailwind

**Icons:**
- All icons from Lucide React (no custom icons)
- Consistent icon sizing (w-4 h-4, w-5 h-5, etc.)

### Component Structure
```
DosageCalculator/
├── index.jsx (main container with hooks integration)
├── CalculatorForm.jsx (form using existing UI components)
├── CalculatorResults.jsx (results using Card components)
├── EducationSection.jsx (content using Accordion/Collapsible)
├── RelatedCalculators.jsx (reuse existing component)
└── utils.js (calculation logic)
```

### Required Hook Integrations
```jsx
// Essential hooks to use
import { useSEO } from '@/hooks/useSEO'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'
import engagementTracker from '@/utils/engagement-tracker'

// Navigation utilities
import { navigateWithScrollToTop } from '@/lib/mobileScrollUtils'
import { Link } from '@/components/CustomLink'
```

### Design System Usage
- **Use existing UI components** from `/components/ui/`
- **Follow established patterns** from Layout and other pages
- **Use global CSS variables** for colors and spacing
- **Apply existing Tailwind classes** consistently
- **Leverage calculator-enhancements.css** for specific enhancements
- **No new design patterns** - stick to what exists

### What NOT to Do
- **Don't create custom components** when existing ones work
- **Don't introduce new color values** - use CSS variables
- **Don't create complex animations** - only simple opacity/scale
- **Don't use inline styles** - use Tailwind utilities
- **Don't create new z-index values** - use CSS variables
- **Don't implement custom form validation** - use react-hook-form
- **Don't add new icon libraries** - Lucide React only
- **Don't create CSS modules** - use Tailwind classes
- **Don't override global styles** - work within the system
- **Don't skip engagement tracking** - integrate analytics
- **Don't ignore mobile utilities** - use existing hooks

### Animation Guidelines
Based on existing patterns, use minimal Framer Motion for:
- **Allowed animations**:
  - Simple opacity fades: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
  - Scale on mount: `initial={{ scale: 0.95 }} animate={{ scale: 1 }}`
  - No transforms that create stacking contexts
- **Avoid**:
  - Complex motion paths
  - 3D transforms
  - AnimatePresence for overlays
  - Will-change or transform styles
- **Mobile**: Reduce or remove animations on mobile devices

## Detailed Feature Requirements

### Calculator Inputs

#### Gender Selection
- Use existing `RadioGroup` component from UI library
- Default: not selected (require selection)
- Labels: "Male", "Female", "Prefer not to say"
- Apply consistent styling with other form elements
- Affects base calculation

#### Weight Input
- Use existing `Input` component with type="number"
- Use `Button` or `Switch` component for kg/lbs toggle
- Wrap in `Form` component with react-hook-form validation
- Range: 40-200kg or 88-440lbs
- Default: empty (require input)
- Use existing error styling patterns

#### Drinking Duration
- Use existing `Select` component
- Options: "1-2 hours", "2-4 hours", "4-6 hours", "6+ hours"
- Default: "2-4 hours"
- Follow existing Select styling patterns
- Include proper Label component

#### Drink Count
- Number input (not slider)
- Range: 1-20 drinks
- Default: empty (require input)
- Helper text: "Standard drinks (beer, wine, shot)"

#### Drinking Frequency
- Radio buttons
- Options: "Rarely", "Monthly", "Weekly", "Daily"
- Default: "Monthly"
- Affects tolerance calculation

### Results Display

#### Primary Recommendation
- Use `Card` component with CardHeader and CardContent
- Apply existing badge styles for dosage display
- Use consistent text sizing from design system
- Include icon from Lucide React library

#### Three-Tier Protocol
- Display in separate `Card` components
- Use existing list styling patterns
- Apply consistent spacing utilities
- Use Badge component for dosage amounts
- Include relevant Lucide icons (Clock, Wine, Moon)

#### Safety Notice (when >900mg)
```
⚠️ High Dosage Notice
This is a higher dosage. Start with 600mg and increase gradually.
Always consult with a healthcare provider.
```

### Educational Sections

#### Science Behind Your Dosage
- Use existing `Accordion` component
- Collapsible sections with AccordionItem
- Apply consistent icon usage (ChevronDown)
- Focus on GABA receptors and enzyme mechanisms
- Follow existing content section patterns

#### FAQ Section
- Use existing `Collapsible` or `Accordion` component
- Preserve all current questions
- Add schema markup
- Consistent with FAQ patterns on other pages
- Use existing typography styles

### Mobile Experience
- Stack all inputs vertically
- Large touch targets (min 44x44px)
- Sticky calculate button
- Results above the fold
- Smooth scroll to results

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader labels
- Focus indicators
- Error messages linked to inputs
- High contrast mode support

## Technical Specifications

### Technology Stack
- React (existing)
- Existing UI component library (Radix UI based)
- Tailwind CSS (existing utility classes)
- React Hook Form (existing form solution)
- Framer Motion (minimal use for opacity/scale animations only)
- Existing icon library (Lucide React)
- Engagement tracking system (existing)
- Mobile optimization utilities (existing)

### State Management
```javascript
// Single state object
const [formData, setFormData] = useState({
  gender: '',
  weight: '',
  weightUnit: 'kg',
  duration: '2-4 hours',
  drinkCount: '',
  frequency: 'monthly'
})

// Single update function
const updateField = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

### Performance Optimization
- Lazy load educational content
- Static results (no animation)
- Debounce calculations
- Service worker for offline
- Preload critical fonts
- Optimize images

### Styling Approach
- Use existing Tailwind utility classes
- Apply global CSS variables for colors:
  - `bg-card` for card backgrounds
  - `text-card-foreground` for text
  - `border-border` for borders
  - `bg-primary` for primary actions
- Use existing spacing scale (p-4, mt-6, etc.)
- Leverage existing component variants
- Apply animations from calculator-enhancements.css
- Use CSS z-index variables:
  - `z-header` for fixed headers
  - `z-modal` for modals/popups
  - `z-dropdown` for dropdowns
- Apply touch optimization classes:
  - `touch-manipulation` for buttons
  - `fast-click` for immediate response
  - `min-h-[44px]` for touch targets
- Button patterns:
  - Gradient backgrounds for primary actions
  - `hover:shadow-lg transition-all duration-300` for desktop
- No custom CSS unless absolutely necessary

## Content Inventory

### SEO Metadata
```html
<title>DHM Dosage Calculator: Personalized Hangover Prevention | GABA Protection</title>
<meta name="description" content="Calculate your optimal DHM dosage based on body weight and drinking habits. Protect GABA-A receptors and enhance alcohol-metabolizing enzymes. Science-backed recommendations.">
```

### Hero Content
```
# DHM Dosage Calculator

Calculate your personalized DHM (Dihydromyricetin) dosage for maximum hangover prevention. Our science-backed calculator considers your body weight, drinking duration, and habits to protect your GABA-A receptors and enhance alcohol metabolism.
```

### Educational Content Sections

#### How DHM Protects Your GABA-A Receptors
When you drink alcohol, it binds to GABA-A receptors in your brain, initially enhancing their inhibitory effects (why you feel relaxed). However, as alcohol levels fluctuate, these receptors become dysregulated, leading to hangover symptoms like anxiety and restlessness.

DHM works by:
- Competitively binding to GABA-A receptors
- Preventing alcohol-induced receptor dysfunction
- Maintaining receptor homeostasis
- Reducing rebound hyperexcitability

#### DHM's Effect on Alcohol-Metabolizing Enzymes
DHM enhances the activity of two critical enzymes:

**Alcohol Dehydrogenase (ADH)**
- Converts ethanol → acetaldehyde
- DHM increases ADH activity by up to 73.6%
- Faster alcohol clearance from bloodstream

**Acetaldehyde Dehydrogenase (ALDH)**
- Converts toxic acetaldehyde → harmless acetate
- DHM boosts ALDH activity significantly
- Reduces acetaldehyde accumulation (hangover toxin)

### FAQ Content (Preserve All)
1. Why does DHM dosage depend on body weight?
2. Should I take more DHM if I'm drinking longer?
3. Can I take too much DHM?
4. When should I take DHM for best results?
5. Does tolerance affect DHM dosage?
6. Is DHM safe with medications?
7. Can I take DHM every day?
8. What if I forget to take DHM before drinking?

### Results Messages
- Low dose (<600mg): "Perfect for moderate drinking sessions"
- Medium dose (600-900mg): "Ideal for longer social events"
- High dose (>900mg): "Maximum protection for heavy drinking"

### CTA Content
- Primary: "Calculate My Dosage"
- Secondary: "Learn More About DHM"
- Email: "Get Your Personalized DHM Protocol"

## Implementation Approach

### Phase 1: Core Calculator (Week 1)
1. Create new component structure
2. Implement form with native validation
3. Add calculation logic
4. Basic styling with CSS Modules
5. Mobile responsive layout

### Phase 2: Results & Education (Week 2)
1. Static results display
2. Educational content sections
3. FAQ implementation
4. Print/download functionality
5. Email results option

### Phase 3: Polish & Migration (Week 3)
1. Accessibility audit and fixes
2. Performance optimization
3. SEO verification
4. A/B test setup
5. Gradual rollout

### Testing Strategy
1. **Unit Tests**: Calculator logic
2. **Integration Tests**: Form flow
3. **E2E Tests**: Full user journey
4. **Performance Tests**: Lighthouse CI
5. **Accessibility Tests**: axe-core
6. **Cross-browser Tests**: BrowserStack
7. **SEO Tests**: Structured data validation

### Migration Checklist
- [ ] Set up feature flag for gradual rollout
- [ ] Create URL redirect rules
- [ ] Migrate all content
- [ ] Verify SEO metadata
- [ ] Test all calculators
- [ ] Monitor Core Web Vitals
- [ ] Track conversion rates
- [ ] Gather user feedback
- [ ] Document lessons learned

## Success Criteria

### Technical Metrics
- Lighthouse Performance: >90
- Lighthouse Accessibility: >95
- Lighthouse SEO: 100
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1
- No JavaScript errors in production

### Business Metrics
- Maintain organic traffic (±5%)
- Maintain keyword rankings
- Conversion rate: ≥ current baseline
- Bounce rate: ≤ current baseline
- Email capture rate: ≥ current

### User Experience Metrics
- Task completion rate: >95%
- Error rate: <5%
- Mobile usability score: >95
- Support tickets related to calculator: <5/month

### Quality Metrics
- Zero rendering issues
- Zero navigation blocking
- Zero z-index conflicts
- Works without JavaScript
- Accessible via keyboard
- Screen reader compatible

## Risk Mitigation

### SEO Risk
- Maintain exact URL structure
- Preserve all content
- Add redirects if needed
- Monitor rankings daily
- Have rollback plan

### Performance Risk
- Set performance budgets
- Use CI performance tests
- Monitor Core Web Vitals
- Progressive enhancement

### User Experience Risk
- A/B test with small percentage
- Gather feedback early
- Monitor analytics closely
- Quick iteration capability

## Code Examples Using Existing Design System

### Example: Main Calculator Component with Hooks
```jsx
import { useSEO } from '@/hooks/useSEO'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'
import engagementTracker from '@/utils/engagement-tracker'
import { motion } from 'framer-motion'

export default function DosageCalculator() {
  const { isMobile, hapticFeedback } = useMobileOptimization()
  const { headerHeight } = useHeaderHeight()
  
  useSEO({
    title: 'DHM Dosage Calculator: Personalized Hangover Prevention | GABA Protection',
    description: 'Calculate your optimal DHM dosage...',
    keywords: ['dhm dosage', 'hangover prevention calculator']
  })

  useEffect(() => {
    engagementTracker.trackEvent('calculator_page_view', {
      device: isMobile ? 'mobile' : 'desktop'
    })
  }, [isMobile])

  const handleCalculate = () => {
    hapticFeedback('medium')
    engagementTracker.trackEvent('calculator_submit')
    // calculation logic
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
      style={{ paddingTop: headerHeight }}
    >
      {/* Calculator content */}
    </motion.div>
  )
}
```

### Example: Weight Input Component
```jsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function WeightInput({ form }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Your Weight
            </FormLabel>
            <FormControl>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Enter weight"
                  className="flex-1 touch-manipulation"
                  {...field}
                />
                <ToggleGroup
                  type="single"
                  value={form.watch('weightUnit')}
                  onValueChange={(value) => form.setValue('weightUnit', value)}
                  className="touch-manipulation"
                >
                  <ToggleGroupItem value="kg" className="min-w-[44px]">kg</ToggleGroupItem>
                  <ToggleGroupItem value="lbs" className="min-w-[44px]">lbs</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

### Example: Results Display Component
```jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Wine, Moon, AlertCircle } from 'lucide-react'

function DosageResults({ results }) {
  const isHighDose = results.preDrinking > 900

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <Card className="border-primary hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">Your Recommended Dosage</CardTitle>
          <CardDescription>Based on your personal factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className="text-3xl px-6 py-3 animate-pulse-glow">
              {results.preDrinking}mg
            </Badge>
            <p className="text-muted-foreground mt-2">
              Take 30-60 minutes before drinking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Three-Tier Protocol */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-4 h-4" />
              Pre-Drinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{results.preDrinking}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              30-60 min before
            </p>
          </CardContent>
        </Card>
        
        {/* Similar cards for While Drinking and Before Bed */}
      </div>

      {/* High Dose Warning */}
      {isHighDose && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a higher dosage. Start with 600mg and increase gradually.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

## Appendix: Current Calculator Formula

```javascript
// Complete formula for reference
const calculateDosage = (inputs) => {
  const { gender, weight, weightUnit, duration, drinkCount, frequency } = inputs
  
  // Convert weight to kg
  const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
  
  // Base calculation
  const baseDosage = Math.round(weightInKg * 15 / 50) * 50
  
  // Gender adjustment
  const genderMultiplier = gender === 'female' ? 0.85 : 1.0
  
  // Duration adjustment
  const durationMultipliers = {
    '1-2 hours': 0.7,
    '2-4 hours': 1.0,
    '4-6 hours': 1.3,
    '6+ hours': 1.5
  }
  
  // Frequency adjustment
  const frequencyMultipliers = {
    'rarely': 1.0,
    'monthly': 1.1,
    'weekly': 1.2,
    'daily': 1.3
  }
  
  // Drink intensity adjustment
  const intensityMultiplier = Math.min(1.5, 1 + (drinkCount - 4) * 0.1)
  
  // Calculate final dosage
  const finalDosage = baseDosage * 
    genderMultiplier * 
    durationMultipliers[duration] * 
    frequencyMultipliers[frequency] * 
    intensityMultiplier
  
  // Round to nearest 50mg and cap
  return {
    preDrinking: Math.min(1200, Math.max(300, Math.round(finalDosage / 50) * 50)),
    whileDrinking: Math.min(600, Math.round(finalDosage * 0.5 / 50) * 50),
    beforeBed: Math.min(600, Math.round(finalDosage * 0.5 / 50) * 50)
  }
}
```

---

This PRD provides a comprehensive guide for rewriting the DHM Dosage Calculator with a focus on simplicity, performance, and maintainability while preserving all valuable content and SEO benefits.