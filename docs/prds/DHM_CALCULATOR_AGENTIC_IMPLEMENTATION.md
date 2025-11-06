# DHM Calculator Rewrite - 4 Agent Implementation Plan

## Pre-Implementation Verification (Human Coordinator)

Run these commands FIRST to verify all dependencies exist:

```bash
# Verify required hooks
ls -la src/hooks/useSEO.js
ls -la src/hooks/useMobileOptimization.js  
ls -la src/hooks/useHeaderHeight.js

# Verify required utilities
ls -la src/utils/engagement-tracker.js

# Verify required components
ls -la src/components/CustomLink.jsx
ls -la src/components/RelatedCalculators.jsx

# Verify CSS file
find src -name "calculator-enhancements.css"
```

If ANY file is missing, STOP and report the issue.

## Agent Assignments & Branch Strategy

Each agent works on a separate branch to avoid conflicts:

```bash
Agent 1: feature/calculator-utils-and-types
Agent 2: feature/calculator-form-component  
Agent 3: feature/calculator-results-education
Agent 4: feature/calculator-main-integration
```

## Pre-Implementation Setup (Human)

Create the directory structure and empty files:

```bash
mkdir -p src/pages/DosageCalculatorRewrite
touch src/pages/DosageCalculatorRewrite/utils.js
touch src/pages/DosageCalculatorRewrite/CalculatorForm.jsx
touch src/pages/DosageCalculatorRewrite/CalculatorResults.jsx
touch src/pages/DosageCalculatorRewrite/EducationSection.jsx
touch src/pages/DosageCalculatorRewrite/index.jsx
git add .
git commit -m "Create calculator rewrite structure"
git push origin main
```

---

## AGENT 1: Utils and Types Implementation

### Branch Setup
```bash
git checkout -b feature/calculator-utils-and-types
```

### Task: Create utils.js

Create `src/pages/DosageCalculatorRewrite/utils.js` with this EXACT content:

```javascript
// DHM Dosage Calculator Utilities
// Agent 1 Implementation

export const calculateDosage = (inputs) => {
  try {
    // Validate inputs
    if (!inputs || typeof inputs !== 'object') {
      console.error('Invalid inputs provided')
      return { preDrinking: 600, whileDrinking: 300, beforeBed: 300 }
    }
    
    const { gender, weight, weightUnit, duration, drinkCount, frequency } = inputs
    
    // Validate required fields
    if (!gender || !weight || !drinkCount) {
      console.error('Missing required fields')
      return { preDrinking: 600, whileDrinking: 300, beforeBed: 300 }
    }
    
    // Ensure numeric values
    const numWeight = Number(weight)
    const numDrinkCount = Number(drinkCount)
    
    if (isNaN(numWeight) || isNaN(numDrinkCount)) {
      console.error('Invalid numeric values')
      return { preDrinking: 600, whileDrinking: 300, beforeBed: 300 }
    }
    
    // Convert weight to kg
    const weightInKg = weightUnit === 'lbs' ? numWeight * 0.453592 : numWeight
  
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
    const intensityMultiplier = Math.min(1.5, 1 + (numDrinkCount - 4) * 0.1)
    
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
  } catch (error) {
    console.error('Calculation error:', error)
    // Return safe defaults
    return { preDrinking: 600, whileDrinking: 300, beforeBed: 300 }
  }
}

export const formSchema = {
  gender: {
    required: "Please select your biological sex",
    validate: (value) => ['male', 'female', 'other'].includes(value) || "Invalid selection"
  },
  weight: {
    required: "Please enter your weight",
    min: { value: 40, message: "Weight must be at least 40kg/88lbs" },
    max: { value: 200, message: "Weight must be less than 200kg/440lbs" }
  },
  drinkCount: {
    required: "Please enter number of drinks",
    min: { value: 1, message: "Must be at least 1 drink" },
    max: { value: 20, message: "Maximum 20 drinks" }
  }
}

// Export test data for other agents to use during development
export const testFormData = {
  gender: 'male',
  weight: 75,
  weightUnit: 'kg',
  duration: '2-4 hours',
  drinkCount: 5,
  frequency: 'monthly'
}

// Export test results for Agent 3
export const testResults = calculateDosage(testFormData)
```

### Commit and Push
```bash
git add src/pages/DosageCalculatorRewrite/utils.js
git commit -m "feat: implement calculator utilities and form schema"
git push origin feature/calculator-utils-and-types
```

### Create PR
Create PR titled: "feat: calculator utils and types (Agent 1)"

---

## AGENT 2: Form Component Implementation

### Branch Setup
```bash
git checkout main
git pull origin main
git checkout -b feature/calculator-form-component
```

### Task: Create CalculatorForm.jsx

Create `src/pages/DosageCalculatorRewrite/CalculatorForm.jsx` with this EXACT content:

```jsx
// DHM Calculator Form Component
// Agent 2 Implementation

import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Calculator } from 'lucide-react'

// Import schema from utils once Agent 1's PR is merged
// For now, using local schema to avoid blocking development
// TODO: After Agent 1 merges, replace with: import { formSchema } from './utils'
const formSchema = {
  gender: { required: "Please select your biological sex" },
  weight: { required: "Please enter your weight" },
  drinkCount: { required: "Please enter number of drinks" }
}

export default function CalculatorForm({ onCalculate, isMobile }) {
  const form = useForm({
    defaultValues: {
      gender: '',
      weight: '',
      weightUnit: 'kg',
      duration: '2-4 hours',
      drinkCount: '',
      frequency: 'monthly'
    }
  })

  const handleSubmit = (data) => {
    onCalculate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Gender Selection */}
        <FormField
          control={form.control}
          name="gender"
          rules={formSchema.gender}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Biological Sex</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <label htmlFor="male" className="text-sm font-medium cursor-pointer">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <label htmlFor="female" className="text-sm font-medium cursor-pointer">
                      Female
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <label htmlFor="other" className="text-sm font-medium cursor-pointer">
                      Prefer not to say
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight Input */}
        <FormField
          control={form.control}
          name="weight"
          rules={formSchema.weight}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Your Weight</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Enter weight"
                    className="flex-1 touch-manipulation"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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

        {/* Drinking Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">How long will you be drinking?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="touch-manipulation">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                  <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                  <SelectItem value="4-6 hours">4-6 hours</SelectItem>
                  <SelectItem value="6+ hours">6+ hours</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Drink Count */}
        <FormField
          control={form.control}
          name="drinkCount"
          rules={formSchema.drinkCount}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                How many drinks will you have?
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Number of standard drinks"
                  className="touch-manipulation"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Drinking Frequency */}
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">How often do you drink?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rarely" id="rarely" />
                    <label htmlFor="rarely" className="text-sm font-medium cursor-pointer">
                      Rarely
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <label htmlFor="monthly" className="text-sm font-medium cursor-pointer">
                      Monthly
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <label htmlFor="weekly" className="text-sm font-medium cursor-pointer">
                      Weekly
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <label htmlFor="daily" className="text-sm font-medium cursor-pointer">
                      Daily
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 text-lg touch-manipulation hover:shadow-lg transition-all duration-300"
        >
          <Calculator className="mr-2 h-5 w-5" />
          Calculate My DHM Dosage
        </Button>
      </form>
    </Form>
  )
}
```

### Commit and Push
```bash
git add src/pages/DosageCalculatorRewrite/CalculatorForm.jsx
git commit -m "feat: implement calculator form component with all inputs"
git push origin feature/calculator-form-component
```

### Create PR
Create PR titled: "feat: calculator form component (Agent 2)"

---

## AGENT 3: Results and Education Components

### Branch Setup
```bash
git checkout main
git pull origin main
git checkout -b feature/calculator-results-education
```

### Task 1: Create CalculatorResults.jsx

Create `src/pages/DosageCalculatorRewrite/CalculatorResults.jsx`:

```jsx
// DHM Calculator Results Component
// Agent 3 Implementation - Part 1

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, Wine, Moon, AlertCircle, Download, Share2 } from 'lucide-react'

// Default results for development - remove once integrated
// TODO: After Agent 1 merges, remove mockResults
const mockResults = {
  preDrinking: 600,
  whileDrinking: 300,
  beforeBed: 300
}

export default function CalculatorResults({ results, onReset, onShare }) {
  // Use mock results only during development if no results provided
  const displayResults = results || mockResults
  const isHighDose = displayResults.preDrinking > 900

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Primary Result */}
      <Card className="border-primary hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">Your Recommended DHM Dosage</CardTitle>
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
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-4 h-4 text-green-600" />
              Pre-Drinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.preDrinking}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              30-60 min before first drink
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wine className="w-4 h-4 text-blue-600" />
              While Drinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.whileDrinking}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Every 2-3 drinks
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="w-4 h-4 text-purple-600" />
              Before Bed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.beforeBed}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              With a glass of water
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Dose Warning */}
      {isHighDose && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Dosage Notice:</strong> This is a higher dosage recommendation. 
            We suggest starting with 600mg and gradually increasing if needed. 
            Always consult with a healthcare provider for personalized advice.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onReset}
          variant="outline"
          className="flex-1 touch-manipulation"
        >
          Calculate Again
        </Button>
        <Button 
          onClick={onShare}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white touch-manipulation"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </div>

      {/* Science Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> DHM protects your GABA-A receptors from alcohol 
            disruption and enhances alcohol-metabolizing enzymes (ADH and ALDH), reducing 
            acetaldehyde buildup by up to 87%.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### Task 2: Create EducationSection.jsx

Create `src/pages/DosageCalculatorRewrite/EducationSection.jsx`:

```jsx
// DHM Calculator Education Section
// Agent 3 Implementation - Part 2

import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Shield, Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EducationSection() {
  return (
    <div className="space-y-8">
      {/* Science Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">The Science Behind Your DHM Dosage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">GABA-A Receptor Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    DHM competitively binds to GABA-A receptors, preventing alcohol-induced 
                    dysfunction and reducing hangover symptoms like anxiety and restlessness.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Enhanced Enzyme Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    DHM increases ADH activity by 73.6% and significantly boosts ALDH, 
                    accelerating alcohol metabolism and reducing toxic acetaldehyde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Why does DHM dosage depend on body weight?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Like most supplements, DHM needs to be distributed throughout your body's water 
                volume. Larger individuals have more blood volume and tissue mass, requiring 
                proportionally more DHM to achieve the same protective concentration at GABA-A 
                receptors and in the liver.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Should I take more DHM if I'm drinking longer?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Yes. Longer drinking sessions mean more alcohol exposure and greater depletion 
                of your body's natural defenses. The calculator increases dosage for longer 
                sessions to maintain protective DHM levels throughout your drinking period.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Can I take too much DHM?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                DHM has been shown to be safe in doses up to 2,000mg in clinical studies. 
                However, most people see optimal benefits between 300-1200mg. Start with our 
                recommended dose and adjust based on your experience. Always consult a 
                healthcare provider if you have concerns.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              When should I take DHM for best results?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Take your first dose 30-60 minutes before drinking to allow DHM to reach your 
                liver and brain. For best results, follow our three-tier protocol: before 
                drinking, during drinking (every 2-3 drinks), and before bed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Does tolerance affect DHM dosage?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Regular drinkers may have adapted liver enzymes but also accumulated damage. 
                The calculator slightly increases dosage for frequent drinkers to account for 
                potential reduced liver efficiency and higher oxidative stress.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Safety Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> DHM is not a license to drink excessively. Always 
          drink responsibly, stay hydrated, and never drive under the influence. Consult 
          your healthcare provider before starting any new supplement regimen.
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

### Commit and Push
```bash
git add src/pages/DosageCalculatorRewrite/CalculatorResults.jsx
git add src/pages/DosageCalculatorRewrite/EducationSection.jsx
git commit -m "feat: implement results display and education components"
git push origin feature/calculator-results-education
```

### Create PR
Create PR titled: "feat: calculator results and education (Agent 3)"

---

## AGENT 4: Main Component and Integration

### Branch Setup (Wait for other PRs to be merged first)
```bash
git checkout main
git pull origin main
git checkout -b feature/calculator-main-integration
```

### Task 1: Create index.jsx

Create `src/pages/DosageCalculatorRewrite/index.jsx`:

```jsx
// DHM Calculator Main Component
// Agent 4 Implementation

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSEO } from '@/hooks/useSEO'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'
import engagementTracker from '@/utils/engagement-tracker'
import { Link } from '@/components/CustomLink'
import { Button } from '@/components/ui/button'
import RelatedCalculators from '@/components/RelatedCalculators'
import CalculatorForm from './CalculatorForm'
import CalculatorResults from './CalculatorResults'
import EducationSection from './EducationSection'
import { calculateDosage } from './utils'
import { Sparkles } from 'lucide-react'

export default function DosageCalculatorRewrite() {
  const [results, setResults] = useState(null)
  const { isMobile, hapticFeedback } = useMobileOptimization()
  const { headerHeight } = useHeaderHeight()
  
  // SEO Setup
  useSEO({
    title: 'DHM Dosage Calculator: Personalized Hangover Prevention | GABA Protection',
    description: 'Calculate your optimal DHM dosage based on body weight and drinking habits. Protect GABA-A receptors and enhance alcohol-metabolizing enzymes. Science-backed recommendations.',
    keywords: ['dhm dosage', 'hangover prevention calculator', 'gaba receptor protection', 'alcohol metabolism', 'dihydromyricetin calculator']
  })

  // Track page view
  useEffect(() => {
    engagementTracker.trackEvent('calculator_page_view', {
      device: isMobile ? 'mobile' : 'desktop'
    })
  }, [isMobile])

  const handleCalculate = (formData) => {
    hapticFeedback('medium')
    engagementTracker.trackEvent('calculator_submit', formData)
    
    const calculatedResults = calculateDosage(formData)
    setResults(calculatedResults)
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('calculator-results')
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleReset = () => {
    hapticFeedback('light')
    setResults(null)
    window.scrollTo({ top: headerHeight, behavior: 'smooth' })
  }

  const handleShare = () => {
    hapticFeedback('success')
    engagementTracker.trackEvent('results_shared')
    
    if (navigator.share) {
      navigator.share({
        title: 'My DHM Dosage',
        text: `My personalized DHM dosage: ${results.preDrinking}mg before drinking`,
        url: window.location.href
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
      style={{ paddingTop: headerHeight }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Science-Based Calculator
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            DHM Dosage Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your personalized DHM (Dihydromyricetin) dosage for maximum 
            hangover prevention. Our science-backed calculator considers your body 
            weight, drinking duration, and habits to protect your GABA-A receptors 
            and enhance alcohol metabolism.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Calculator Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Calculate Your Dosage</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <CalculatorForm 
                onCalculate={handleCalculate} 
                isMobile={isMobile}
              />
            </div>
          </div>

          {/* Results or Placeholder */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Results</h2>
            <div id="calculator-results">
              {results ? (
                <CalculatorResults 
                  results={results} 
                  onReset={handleReset}
                  onShare={handleShare}
                />
              ) : (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-500">
                    Fill out the calculator to see your personalized DHM dosage recommendation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <EducationSection />
        </div>

        {/* Related Calculators */}
        <div className="mt-16">
          <RelatedCalculators />
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Stay Hangover-Free?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Now that you know your optimal dosage, find the perfect DHM supplement for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reviews">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg">
                View Top DHM Supplements
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Learn More About DHM
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

### Task 2: Update App.jsx

Update `src/App.jsx` by adding:

```jsx
// At the top with other imports (around line 14)
const DosageCalculatorRewrite = lazy(() => import('./pages/DosageCalculatorRewrite/index.jsx'))

// In renderPage() function, add this case (around line 73)
case '/dhm-dosage-calculator-new':
  return <DosageCalculatorRewrite />
```

### Commit and Push
```bash
git add src/pages/DosageCalculatorRewrite/index.jsx
git add src/App.jsx
git commit -m "feat: integrate calculator main component and add route"
git push origin feature/calculator-main-integration
```

### Create PR
Create PR titled: "feat: calculator main integration (Agent 4)"

---

## Merge Order & Testing Protocol

### Merge Order (Human Coordinator)
1. Merge Agent 1 PR first (utils)
2. Merge Agent 2 PR (form)
3. Merge Agent 3 PR (results/education)
4. Merge Agent 4 PR (main integration)

### Post-Merge Testing
```bash
# After all PRs merged
git checkout main
git pull origin main
npm run dev

# Navigate to http://localhost:3000/dhm-dosage-calculator-new
# Run through test checklist
```

### Testing Checklist
- [ ] Form validation works correctly
- [ ] Calculations match expected values
- [ ] Results display properly
- [ ] Education accordions expand/collapse
- [ ] Mobile responsive at all breakpoints
- [ ] No console errors
- [ ] Navigation not blocked
- [ ] Engagement tracking fires (check console)

### Final Deployment Steps
1. Deploy to production
2. Monitor for 48 hours at `/dhm-dosage-calculator-new`
3. If stable, update route from `/dhm-dosage-calculator` to new implementation
4. Remove old calculator after 7 days

## Agent Communication Protocol

### If Agent Needs Clarification
Create issue in GitHub with title: "[Agent X] Question: [topic]"

### If Agent Finds Blocking Issue
1. Stop work immediately
2. Create issue with title: "[Agent X] Blocker: [description]"
3. Wait for resolution before continuing

### If Agent Completes Early
Review other agent PRs and add review comments (no changes to their code)

## Success Criteria
- All 4 PRs merged without conflicts
- Calculator works identically to specification
- No custom CSS or components added
- All existing patterns followed
- Clean git history with atomic commits