import React, { useState, useMemo } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { useSEO } from '../hooks/useSEO.js'
import { 
  Calculator,
  Info,
  User,
  Weight,
  Clock,
  Wine,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
  Calendar,
  Activity
} from 'lucide-react'

export default function DosageCalculator() {
  // SEO configuration
  useSEO({
    title: 'DHM Dosage Calculator 2024: Personalized Hangover Prevention | DHM Guide',
    description: 'Calculate your optimal DHM dosage for hangover prevention. Get personalized recommendations based on body weight, alcohol consumption, and timing. Free scientific DHM calculator.',
    canonical: 'https://www.dhmguide.com/dhm-dosage-calculator',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'DHM Dosage Calculator',
      applicationCategory: 'HealthApplication',
      description: 'Scientific DHM dosage calculator for personalized hangover prevention recommendations',
      url: 'https://www.dhmguide.com/dhm-dosage-calculator',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  })

  // State for calculator inputs
  const [weight, setWeight] = useState(150)
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [drinks, setDrinks] = useState(4)
  const [drinkingDuration, setDrinkingDuration] = useState(3)
  const [tolerance, setTolerance] = useState('moderate')
  const [purpose, setPurpose] = useState('prevention')
  const [showResults, setShowResults] = useState(false)

  // Convert weight to kg if needed
  const weightInKg = useMemo(() => {
    return weightUnit === 'lbs' ? weight * 0.453592 : weight
  }, [weight, weightUnit])

  // Calculate personalized dosage
  const calculateDosage = useMemo(() => {
    // Base dosage calculation
    let baseDosage = 300 // mg

    // Adjust for body weight (5mg per kg)
    const weightAdjustment = weightInKg * 5
    baseDosage = Math.max(baseDosage, weightAdjustment)

    // Adjust for number of drinks
    if (drinks > 4) {
      baseDosage += (drinks - 4) * 50
    }

    // Adjust for drinking duration
    if (drinkingDuration > 4) {
      baseDosage += (drinkingDuration - 4) * 25
    }

    // Adjust for tolerance
    const toleranceMultipliers = {
      low: 0.8,
      moderate: 1.0,
      high: 1.2
    }
    baseDosage *= toleranceMultipliers[tolerance]

    // Adjust for purpose
    if (purpose === 'recovery') {
      baseDosage *= 1.3
    }

    // Round to nearest 50mg
    baseDosage = Math.round(baseDosage / 50) * 50

    // Cap at safe maximum
    baseDosage = Math.min(baseDosage, 1200)

    return baseDosage
  }, [weightInKg, drinks, drinkingDuration, tolerance, purpose])

  // Calculate timing recommendations
  const timingRecommendations = useMemo(() => {
    if (purpose === 'prevention') {
      return {
        primary: '30-60 minutes before drinking',
        secondary: 'Optional: Additional dose after drinking',
        notes: 'Take with water for optimal absorption'
      }
    } else {
      return {
        primary: 'Immediately after drinking',
        secondary: 'Additional dose before bed',
        notes: 'Take with plenty of water and electrolytes'
      }
    }
  }, [purpose])

  const handleCalculate = () => {
    setShowResults(true)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Calculator className="w-4 h-4 mr-2" />
              Scientific DHM Calculator
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 bg-clip-text text-transparent leading-tight">
              DHM Dosage Calculator
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Get personalized DHM dosage recommendations based on your body weight, drinking habits, and prevention goals. Scientifically calculated for optimal hangover prevention.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">5mg/kg</div>
                <div className="text-gray-600">Base Dosage Formula</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">30-60min</div>
                <div className="text-gray-600">Optimal Timing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">1200mg</div>
                <div className="text-gray-600">Maximum Safe Dose</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white shadow-xl border-blue-100">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-gray-900">Calculate Your DHM Dosage</CardTitle>
                <CardDescription className="text-lg">
                  Answer a few questions to get your personalized recommendation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Body Weight */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <Weight className="w-5 h-5 mr-2 text-blue-600" />
                    Body Weight
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Slider
                        value={[weight]}
                        onValueChange={(value) => setWeight(value[0])}
                        max={weightUnit === 'lbs' ? 350 : 160}
                        min={weightUnit === 'lbs' ? 90 : 40}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{weightUnit === 'lbs' ? '90 lbs' : '40 kg'}</span>
                        <span className="font-bold text-blue-700">{weight} {weightUnit}</span>
                        <span>{weightUnit === 'lbs' ? '350 lbs' : '160 kg'}</span>
                      </div>
                    </div>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => {
                          setWeightUnit('lbs')
                          setWeight(Math.round(weight * 2.20462))
                        }}
                        className={`px-3 py-1 text-sm ${weightUnit === 'lbs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        lbs
                      </button>
                      <button
                        onClick={() => {
                          setWeightUnit('kg')
                          setWeight(Math.round(weight * 0.453592))
                        }}
                        className={`px-3 py-1 text-sm ${weightUnit === 'kg' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        kg
                      </button>
                    </div>
                  </div>
                </div>

                {/* Number of Drinks */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <Wine className="w-5 h-5 mr-2 text-blue-600" />
                    Expected Number of Drinks
                  </label>
                  <Slider
                    value={[drinks]}
                    onValueChange={(value) => setDrinks(value[0])}
                    max={12}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>1 drink</span>
                    <span className="font-bold text-blue-700">{drinks} drinks</span>
                    <span>12 drinks</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <Info className="w-4 h-4 inline mr-1" />
                    1 drink = 12oz beer, 5oz wine, or 1.5oz spirits
                  </p>
                </div>

                {/* Drinking Duration */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Drinking Duration
                  </label>
                  <Slider
                    value={[drinkingDuration]}
                    onValueChange={(value) => setDrinkingDuration(value[0])}
                    max={8}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>1 hour</span>
                    <span className="font-bold text-blue-700">{drinkingDuration} hours</span>
                    <span>8 hours</span>
                  </div>
                </div>

                {/* Alcohol Tolerance */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Alcohol Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['low', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setTolerance(level)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          tolerance === level
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-semibold capitalize ${tolerance === level ? 'text-blue-700' : 'text-gray-700'}`}>
                          {level}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {level === 'low' && 'Rarely drink'}
                          {level === 'moderate' && 'Social drinker'}
                          {level === 'high' && 'Regular drinker'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['prevention', 'recovery'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setPurpose(goal)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          purpose === goal
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-semibold capitalize ${purpose === goal ? 'text-blue-700' : 'text-gray-700'}`}>
                          {goal === 'prevention' ? 'Hangover Prevention' : 'Hangover Recovery'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {goal === 'prevention' ? 'Take before drinking' : 'Take after drinking'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleCalculate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate My Dosage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section id="results" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                Your Personalized DHM Protocol
              </h2>

              <div className="grid gap-6">
                {/* Primary Dosage Recommendation */}
                <Card className="bg-white shadow-lg border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <CardTitle className="text-2xl flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Recommended Dosage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-700 mb-2">
                        {calculateDosage} mg
                      </div>
                      <p className="text-lg text-gray-600">
                        Based on your {weight} {weightUnit} body weight and {drinks} drinks over {drinkingDuration} hours
                      </p>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Dosage Breakdown:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Base dosage for {Math.round(weightInKg)}kg body weight: {Math.round(weightInKg * 5)}mg</li>
                        <li>• Adjustment for {drinks} drinks: +{drinks > 4 ? (drinks - 4) * 50 : 0}mg</li>
                        <li>• {tolerance} tolerance adjustment applied</li>
                        <li>• {purpose === 'recovery' ? 'Recovery dosage increased by 30%' : 'Prevention dosage optimized'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Timing Recommendations */}
                <Card className="bg-white shadow-lg border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center text-blue-800">
                      <Clock className="w-5 h-5 mr-2" />
                      Timing Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Primary Dose:</h4>
                        <p className="text-gray-700">{timingRecommendations.primary}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800">Secondary Dose:</h4>
                        <p className="text-gray-700">{timingRecommendations.secondary}</p>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{timingRecommendations.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Recommendations */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center text-gray-800">
                      <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                      Important Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Take DHM with plenty of water for optimal absorption</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Consider splitting doses for extended drinking sessions</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Combine with electrolytes for enhanced recovery</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Do not exceed 1200mg in a 24-hour period</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      // In a real app, this would generate a PDF
                      alert('PDF download functionality coming soon!')
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Protocol
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      // In a real app, this would share the results
                      alert('Share functionality coming soon!')
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Safety Information */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              DHM Dosage Guidelines & Safety
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">General Dosage Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    <li>• <strong>Standard dose:</strong> 300-600mg</li>
                    <li>• <strong>Prevention:</strong> 30-60 min before drinking</li>
                    <li>• <strong>Recovery:</strong> Immediately after drinking</li>
                    <li>• <strong>Maximum:</strong> 1200mg per 24 hours</li>
                    <li>• <strong>With food:</strong> Can be taken with or without</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Safety Considerations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    <li>• DHM is generally well-tolerated</li>
                    <li>• No known serious side effects</li>
                    <li>• May interact with some medications</li>
                    <li>• Consult healthcare provider if pregnant</li>
                    <li>• Not a substitute for responsible drinking</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Important Disclaimer
              </h3>
              <p className="text-gray-700">
                This calculator provides general recommendations based on scientific research. Individual responses may vary. 
                Always consult with a healthcare professional before starting any new supplement regimen. DHM is not intended 
                to encourage excessive alcohol consumption. Please drink responsibly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Try DHM?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Now that you know your optimal dosage, find the perfect DHM supplement 
              for your needs from our reviewed and tested products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                <Link to="/reviews">
                  Find DHM Supplements
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 text-lg"
              >
                <Link to="/guide">Learn More About DHM</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}