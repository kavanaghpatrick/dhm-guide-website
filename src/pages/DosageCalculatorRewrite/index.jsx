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
                Master DHM Science
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}