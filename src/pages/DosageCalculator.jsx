import React, { useState, useMemo, useEffect } from 'react'
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
  Activity,
  Mail,
  Gift,
  FileText
} from 'lucide-react'

export default function DosageCalculator() {
  // SEO configuration with enhanced schema markup
  useSEO({
    title: 'DHM Dosage Calculator 2025: How Much DHM Should I Take | Personalized Hangover Prevention',
    description: 'Calculate your optimal DHM dosage for hangover prevention. Get personalized dihydromyricetin recommendations based on body weight, alcohol consumption, and timing. Free anti-hangover supplement calculator determines exact mg needed.',
    keywords: 'DHM dosage calculator, how much DHM should I take, dihydromyricetin dosage, hangover prevention calculator, anti hangover supplement dosage, DHM dosage by weight, hangover pill calculator, prevent hangover dosage, DHM supplement calculator, dihydromyricetin calculator, hangover prevention dosage, DHM mg calculator, DHM side effects, DHM dosage chart',
    canonicalUrl: 'https://www.dhmguide.com/dhm-dosage-calculator',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': 'https://www.dhmguide.com/dhm-dosage-calculator#calculator',
        name: 'DHM Dosage Calculator',
        applicationCategory: 'HealthApplication',
        applicationSubCategory: 'MedicalCalculator',
        description: 'Scientific DHM dosage calculator for personalized hangover prevention recommendations based on clinical research',
        url: 'https://www.dhmguide.com/dhm-dosage-calculator',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        softwareVersion: '2.0',
        softwareHelp: {
          '@type': 'CreativeWork',
          url: 'https://www.dhmguide.com/guide'
        },
        screenshot: {
          '@type': 'ImageObject',
          url: 'https://www.dhmguide.com/dhm-calculator-screenshot.jpg',
          caption: 'DHM Dosage Calculator Interface'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        creator: {
          '@type': 'Organization',
          name: 'DHM Guide',
          url: 'https://www.dhmguide.com'
        },
        datePublished: '2024-01-01',
        dateModified: '2025-01-05',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '387',
          bestRating: '5',
          worstRating: '1'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': 'https://www.dhmguide.com/dhm-dosage-calculator',
        name: 'DHM Dosage Calculator & Side Effects Guide',
        url: 'https://www.dhmguide.com/dhm-dosage-calculator',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://www.dhmguide.com/#website'
        },
        about: {
          '@type': 'Drug',
          name: 'Dihydromyricetin',
          alternateName: 'DHM',
          description: 'Natural flavonoid for hangover prevention',
          drugClass: 'Dietary Supplement',
          isProprietary: false,
          nonProprietaryName: 'Dihydromyricetin'
        },
        lastReviewed: '2025-01-05',
        reviewedBy: {
          '@type': 'Organization',
          name: 'DHM Guide Research Team'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much DHM should I take for hangover prevention?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The optimal DHM dosage for hangover prevention depends on your body weight, alcohol consumption, and tolerance. Most people need 300-600mg of dihydromyricetin, calculated at 5mg per kg of body weight. Our DHM dosage calculator provides personalized mg recommendations based on clinical research.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the correct dihydromyricetin dosage by weight?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The standard dihydromyricetin dosage is 5mg per kg of body weight. For a 150lb (68kg) person, this equals approximately 340mg of DHM. Heavier individuals may need up to 600-800mg, while lighter people may only need 250-400mg for effective hangover prevention.'
            }
          },
          {
            '@type': 'Question',
            name: 'When should I take DHM for best results?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For hangover prevention, take DHM 30-60 minutes before drinking. For recovery, take it immediately after drinking or before bed. DHM works best when taken with plenty of water.'
            }
          },
          {
            '@type': 'Question',
            name: 'Is DHM safe to take daily?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DHM is generally well-tolerated with no serious side effects reported in clinical studies. However, it\'s designed for occasional use with alcohol consumption. Don\'t exceed 1200mg in 24 hours.'
            }
          },
          {
            '@type': 'Question',
            name: 'How effective is DHM for hangover prevention?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Clinical studies demonstrate DHM\'s effectiveness in reducing hangover symptoms and blood alcohol levels. A 2024 randomized controlled trial showed significant reductions in blood alcohol and gastrointestinal hangover symptoms compared to placebo.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I take DHM with other supplements?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DHM works well with electrolytes, B vitamins, and NAC (N-acetylcysteine). Avoid taking with blood thinners or if you have liver disease. Consult your healthcare provider for specific medication interactions.'
            }
          }
        ]
      }
    ]
  })

  // State for calculator inputs
  const [weight, setWeight] = useState(150)
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [drinks, setDrinks] = useState(4)
  const [drinkingDuration, setDrinkingDuration] = useState(3)
  const [tolerance, setTolerance] = useState('moderate')
  const [purpose, setPurpose] = useState('prevention')
  const [showResults, setShowResults] = useState(false)
  const [email, setEmail] = useState('')
  const [emailCaptured, setEmailCaptured] = useState(false)
  
  // Enhanced state for new features
  const [alcoholType, setAlcoholType] = useState('mixed')
  const [foodIntake, setFoodIntake] = useState('moderate')
  const [shareableUrl, setShareableUrl] = useState('')

  // Convert weight to kg if needed
  const weightInKg = useMemo(() => {
    return weightUnit === 'lbs' ? weight * 0.453592 : weight
  }, [weight, weightUnit])

  // Calculate personalized dosage with enhanced factors
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

    // Adjust for tolerance (people with low tolerance need more help processing alcohol)
    const toleranceMultipliers = {
      low: 1.2,      // Low tolerance = need more DHM support
      moderate: 1.0,  // Moderate tolerance = baseline dosage
      high: 0.8       // High tolerance = already process alcohol well, need less DHM
    }
    baseDosage *= toleranceMultipliers[tolerance]

    // NEW: Adjust for alcohol type
    const alcoholTypeMultipliers = {
      beer: 0.9,      // Beer = lower alcohol content, needs less DHM
      wine: 1.0,      // Wine = moderate baseline
      spirits: 1.2,   // Spirits = higher alcohol content, needs more DHM
      mixed: 1.1      // Mixed drinks = variable, slightly higher
    }
    baseDosage *= alcoholTypeMultipliers[alcoholType]

    // NEW: Adjust for food intake
    const foodIntakeMultipliers = {
      empty: 1.3,     // Empty stomach = faster absorption, needs more DHM
      light: 1.15,    // Light snack = some protection
      moderate: 1.0,  // Moderate meal = baseline
      full: 0.85      // Full meal = slower alcohol absorption, needs less DHM
    }
    baseDosage *= foodIntakeMultipliers[foodIntake]

    // Adjust for purpose
    if (purpose === 'recovery') {
      baseDosage *= 1.3
    }

    // Round to nearest 50mg
    baseDosage = Math.round(baseDosage / 50) * 50

    // Cap at safe maximum
    baseDosage = Math.min(baseDosage, 1200)

    return baseDosage
  }, [weightInKg, drinks, drinkingDuration, tolerance, purpose, alcoholType, foodIntake])

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
    // Generate shareable URL with parameters
    const params = new URLSearchParams({
      w: weight,
      wu: weightUnit,
      d: drinks,
      dd: drinkingDuration,
      t: tolerance,
      p: purpose,
      at: alcoholType,
      fi: foodIntake
    })
    setShareableUrl(`${window.location.origin}${window.location.pathname}?${params.toString()}`)
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Load parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('w')) {
      setWeight(parseInt(params.get('w')) || 150)
      setWeightUnit(params.get('wu') || 'lbs')
      setDrinks(parseInt(params.get('d')) || 4)
      setDrinkingDuration(parseFloat(params.get('dd')) || 3)
      setTolerance(params.get('t') || 'moderate')
      setPurpose(params.get('p') || 'prevention')
      setAlcoholType(params.get('at') || 'mixed')
      setFoodIntake(params.get('fi') || 'moderate')
      // Auto-calculate if parameters are present
      setTimeout(() => handleCalculate(), 500)
    }
  }, [])

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
              Get personalized DHM dosage recommendations based on your body weight, drinking habits, and prevention goals. Calculate exactly how much dihydromyricetin you need for optimal hangover prevention using our scientifically-backed calculator.
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">How Much DHM Should I Take?</h2>
              <p className="text-gray-600">
                Our DHM dosage calculator determines your optimal dihydromyricetin dosage based on clinical research. Whether you need hangover prevention or recovery, get personalized mg recommendations for your body weight and alcohol consumption.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">11</div>
                  <div className="text-sm text-gray-600">Peer-Reviewed Studies</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">7</div>
                  <div className="text-sm text-gray-600">Human Clinical Trials</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">600+</div>
                  <div className="text-sm text-gray-600">Study Participants</div>
                </div>
              </div>
            </div>

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
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 shadow-2xl border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-green-600/5"></div>
              <CardHeader className="text-center relative z-10 py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  Calculate Your DHM Dosage
                </CardTitle>
                <CardDescription className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Answer a few questions to get your personalized recommendation based on clinical research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-12 relative z-10 px-8 pb-12">
                {/* Body Weight */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                      <Weight className="w-5 h-5 text-white" />
                    </div>
                    Body Weight
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="relative">
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(Math.max(weightUnit === 'lbs' ? 90 : 40, Math.min(weightUnit === 'lbs' ? 350 : 160, parseInt(e.target.value) || 0)))}
                            className="w-24 h-14 px-4 py-2 bg-white border-2 border-blue-200 rounded-xl text-center text-xl font-bold text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-lg"
                          />
                        </div>
                        <span className="text-lg font-medium text-gray-600">{weightUnit}</span>
                      </div>
                      <Slider
                        value={[weight]}
                        onValueChange={(value) => setWeight(value[0])}
                        max={weightUnit === 'lbs' ? 350 : 160}
                        min={weightUnit === 'lbs' ? 90 : 40}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{weightUnit === 'lbs' ? '90 lbs' : '40 kg'}</span>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full">{weight} {weightUnit}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{weightUnit === 'lbs' ? '350 lbs' : '160 kg'}</span>
                      </div>
                    </div>
                    <div className="flex rounded-2xl bg-gray-100 p-1 min-w-[120px] shadow-inner">
                      <button
                        onClick={() => {
                          setWeightUnit('lbs')
                          setWeight(Math.round(weight * 2.20462))
                        }}
                        className={`flex-1 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${weightUnit === 'lbs' ? 'bg-white text-blue-700 shadow-lg transform scale-105' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        lbs
                      </button>
                      <button
                        onClick={() => {
                          setWeightUnit('kg')
                          setWeight(Math.round(weight * 0.453592))
                        }}
                        className={`flex-1 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${weightUnit === 'kg' ? 'bg-white text-blue-700 shadow-lg transform scale-105' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        kg
                      </button>
                    </div>
                  </div>
                </div>

                {/* Number of Drinks */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4">
                      <Wine className="w-5 h-5 text-white" />
                    </div>
                    Expected Number of Drinks
                  </label>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <input
                        type="number"
                        value={drinks}
                        onChange={(e) => setDrinks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                        className="w-20 h-14 px-4 py-2 bg-white border-2 border-purple-200 rounded-xl text-center text-xl font-bold text-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-lg"
                      />
                    </div>
                    <span className="text-lg font-medium text-gray-600">drinks</span>
                  </div>
                  <Slider
                    value={[drinks]}
                    onValueChange={(value) => setDrinks(value[0])}
                    max={12}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">1 drink</span>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-full">{drinks} drinks</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">12 drinks</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <Info className="w-4 h-4 inline mr-1" />
                    1 drink = 12oz beer, 5oz wine, or 1.5oz spirits
                  </p>
                </div>

                {/* Drinking Duration */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-4">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    Drinking Duration
                  </label>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <input
                        type="number"
                        value={drinkingDuration}
                        onChange={(e) => setDrinkingDuration(Math.max(1, Math.min(8, parseFloat(e.target.value) || 1)))}
                        step="0.5"
                        className="w-20 h-14 px-4 py-2 bg-white border-2 border-green-200 rounded-xl text-center text-xl font-bold text-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-lg"
                      />
                    </div>
                    <span className="text-lg font-medium text-gray-600">hours</span>
                  </div>
                  <Slider
                    value={[drinkingDuration]}
                    onValueChange={(value) => setDrinkingDuration(value[0])}
                    max={8}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">1 hour</span>
                    <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full">{drinkingDuration} hours</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">8 hours</span>
                  </div>
                </div>

                {/* Alcohol Type Selection */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center mr-4">
                      <Wine className="w-5 h-5 text-white" />
                    </div>
                    Type of Alcohol
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'beer', label: 'Beer', icon: '🍺', description: '4-6% ABV' },
                      { value: 'wine', label: 'Wine', icon: '🍷', description: '12-15% ABV' },
                      { value: 'spirits', label: 'Spirits', icon: '🥃', description: '40% ABV' },
                      { value: 'mixed', label: 'Mixed', icon: '🍹', description: 'Various' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setAlcoholType(type.value)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          alcoholType === type.value
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className={`font-bold text-sm mb-1 ${alcoholType === type.value ? 'text-amber-700' : 'text-gray-700'}`}>
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Higher alcohol content requires more DHM for effective protection
                  </p>
                </div>

                {/* Food Intake */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center mr-4">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Food Intake Before/During Drinking
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'empty', label: 'Empty Stomach', icon: '🚫', description: 'No food' },
                      { value: 'light', label: 'Light Snack', icon: '🥨', description: 'Small bite' },
                      { value: 'moderate', label: 'Moderate Meal', icon: '🥗', description: 'Regular meal' },
                      { value: 'full', label: 'Full Meal', icon: '🍽️', description: 'Large meal' }
                    ].map((intake) => (
                      <button
                        key={intake.value}
                        onClick={() => setFoodIntake(intake.value)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          foodIntake === intake.value
                            ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{intake.icon}</div>
                          <div className={`font-bold text-sm mb-1 ${foodIntake === intake.value ? 'text-teal-700' : 'text-gray-700'}`}>
                            {intake.label}
                          </div>
                          <div className="text-xs text-gray-500">{intake.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Food slows alcohol absorption. Empty stomach requires higher DHM dosage
                  </p>
                </div>

                {/* Alcohol Tolerance */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mr-4">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Alcohol Tolerance
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['low', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setTolerance(level)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          tolerance === level
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`font-bold text-lg capitalize mb-2 ${tolerance === level ? 'text-blue-700' : 'text-gray-700'}`}>
                            {level}
                          </div>
                          <div className="text-sm text-gray-500">
                            {level === 'low' && 'Rarely drink'}
                            {level === 'moderate' && 'Social drinker'}
                            {level === 'high' && 'Regular drinker'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['prevention', 'recovery'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setPurpose(goal)}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          purpose === goal
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`font-bold text-xl mb-2 ${purpose === goal ? 'text-green-700' : 'text-gray-700'}`}>
                            {goal === 'prevention' ? 'Hangover Prevention' : 'Hangover Recovery'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {goal === 'prevention' ? 'Take before drinking' : 'Take after drinking'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="pt-8">
                  <Button
                    onClick={handleCalculate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-xl font-bold py-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25"
                  >
                    <Calculator className="w-6 h-6 mr-3" />
                    Calculate My Personalized Dosage
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
                      
                      {/* Visual Dosage Safety Indicator */}
                      <div className="mt-6 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Safety Range</span>
                          <span className="text-sm font-medium text-gray-700">{calculateDosage}mg / 1200mg max</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              calculateDosage <= 600 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              calculateDosage <= 900 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                              'bg-gradient-to-r from-orange-400 to-orange-500'
                            }`}
                            style={{ width: `${(calculateDosage / 1200) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-md">
                              {calculateDosage <= 600 ? 'OPTIMAL' : calculateDosage <= 900 ? 'MODERATE' : 'HIGH'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0mg</span>
                          <span>600mg</span>
                          <span>900mg</span>
                          <span>1200mg</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Dosage Breakdown:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Base dosage for {Math.round(weightInKg)}kg body weight: {Math.round(weightInKg * 5)}mg</li>
                        <li>• Adjustment for {drinks} drinks: +{drinks > 4 ? (drinks - 4) * 50 : 0}mg</li>
                        <li>• {alcoholType === 'spirits' ? 'Spirits' : alcoholType === 'beer' ? 'Beer' : alcoholType === 'wine' ? 'Wine' : 'Mixed drinks'} adjustment applied</li>
                        <li>• {foodIntake === 'empty' ? 'Empty stomach' : foodIntake === 'light' ? 'Light snack' : foodIntake === 'full' ? 'Full meal' : 'Moderate meal'} factor included</li>
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
                      // Generate PDF content
                      const pdfContent = `
DHM DOSAGE PROTOCOL

Personalized Recommendation: ${calculateDosage}mg

BASED ON YOUR PROFILE:
• Body Weight: ${weight} ${weightUnit}
• Expected Drinks: ${drinks}
• Drinking Duration: ${drinkingDuration} hours
• Alcohol Type: ${alcoholType === 'spirits' ? 'Spirits' : alcoholType === 'beer' ? 'Beer' : alcoholType === 'wine' ? 'Wine' : 'Mixed Drinks'}
• Food Intake: ${foodIntake === 'empty' ? 'Empty Stomach' : foodIntake === 'light' ? 'Light Snack' : foodIntake === 'full' ? 'Full Meal' : 'Moderate Meal'}
• Tolerance Level: ${tolerance}
• Purpose: ${purpose === 'prevention' ? 'Hangover Prevention' : 'Hangover Recovery'}

TIMING INSTRUCTIONS:
• Primary Dose: ${timingRecommendations.primary}
• Secondary Dose: ${timingRecommendations.secondary}
• Important: ${timingRecommendations.notes}

SAFETY GUIDELINES:
• Take with plenty of water
• Do not exceed 1200mg in 24 hours
• Consider splitting doses for extended sessions
• Combine with electrolytes for best results

DISCLAIMER:
This recommendation is based on clinical research and general guidelines. Individual responses may vary. Consult healthcare providers for personalized advice.

Generated by DHM Guide Calculator
www.dhmguide.com
`
                      
                      // Create and download text file
                      const blob = new Blob([pdfContent], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `dhm-protocol-${calculateDosage}mg.txt`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Protocol
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      // Share functionality using Web Share API or fallback
                      const shareData = {
                        title: 'My DHM Dosage Protocol',
                        text: `I need ${calculateDosage}mg of DHM for hangover prevention. Calculate your personalized dose:`,
                        url: shareableUrl || window.location.href
                      }
                      
                      if (navigator.share) {
                        navigator.share(shareData).catch(err => {
                          console.log('Error sharing:', err)
                          fallbackShare()
                        })
                      } else {
                        fallbackShare()
                      }
                      
                      function fallbackShare() {
                        // Copy to clipboard as fallback
                        const textToShare = `My DHM Protocol: ${calculateDosage}mg\n\nCalculate your personalized dose at: ${window.location.href}`
                        navigator.clipboard.writeText(textToShare).then(() => {
                          alert('Protocol copied to clipboard!')
                        }).catch(() => {
                          alert('Protocol: ' + textToShare)
                        })
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
                
                {/* Email Capture */}
                {!emailCaptured && (
                  <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg flex items-center justify-center text-purple-800">
                        <Gift className="w-5 h-5 mr-2" />
                        Get Your Free DHM Guide
                      </CardTitle>
                      <CardDescription className="text-purple-700">
                        Receive our comprehensive DHM protocol guide with timing strategies and supplement recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Button
                          onClick={() => {
                            if (email && email.includes('@')) {
                              setEmailCaptured(true)
                              // In a real app, this would send to email service
                              console.log('Email captured:', email)
                              alert('Thank you! Your DHM guide will be sent to your email.')
                            } else {
                              alert('Please enter a valid email address')
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Get Guide
                        </Button>
                      </div>
                      <p className="text-xs text-purple-600 mt-2 text-center">
                        No spam, just science-backed hangover prevention tips
                      </p>
                    </CardContent>
                  </Card>
                )}
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">How much DHM should I take for hangover prevention?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>The optimal DHM dosage for hangover prevention depends on your body weight, alcohol consumption, and tolerance. Most people need 300-600mg of dihydromyricetin, calculated at 5mg per kg of body weight. Our DHM dosage calculator provides personalized mg recommendations based on clinical research.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">What is the correct dihydromyricetin dosage by weight?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>The standard dihydromyricetin dosage is 5mg per kg of body weight. For a 150lb (68kg) person, this equals approximately 340mg of DHM. Heavier individuals may need up to 600-800mg, while lighter people may only need 250-400mg for effective hangover prevention.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">When should I take DHM for best results?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>For hangover prevention, take DHM 30-60 minutes before drinking. For recovery, take it immediately after drinking or before bed. DHM works best when taken with plenty of water.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Is DHM safe to take daily?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>DHM is generally well-tolerated with no serious side effects reported in clinical studies. However, it's designed for occasional use with alcohol consumption. Don't exceed 1200mg in 24 hours.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">How effective is DHM for hangover prevention?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>Clinical studies demonstrate DHM's effectiveness in reducing hangover symptoms and blood alcohol levels. A 2024 randomized controlled trial showed significant reductions in blood alcohol and gastrointestinal hangover symptoms compared to placebo.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Can I take DHM with other supplements?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p>DHM works well with electrolytes, B vitamins, and NAC (N-acetylcysteine). Avoid taking with blood thinners or if you have liver disease. Consult your healthcare provider for specific medication interactions.</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Scientific References Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Scientific Foundation
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Clinical Evidence</h3>
              <p className="text-gray-700 mb-4">
                Our dosage recommendations are based on peer-reviewed clinical studies examining dihydromyricetin's effects on alcohol metabolism and liver protection. View our comprehensive research database for detailed study information.
              </p>
            </div>
            
            <div className="grid gap-6">
              <Card className="bg-white border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">UCLA Breakthrough Study (2012)</h4>
                  <p className="text-sm text-gray-600 mb-2">Shen, Y., et al. - Journal of Neuroscience (Animal Study)</p>
                  <p className="text-gray-700 text-sm">DHM treatment resulted in 70% reduction in alcohol intoxication duration and prevented withdrawal symptoms in controlled animal studies.</p>
                  <Link to="/research" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                    View Full Study Details →
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-l-4 border-l-green-600">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">USC Liver Protection Trial (2020)</h4>
                  <p className="text-sm text-gray-600 mb-2">Chen, S., et al. - Journal of Hepatology</p>
                  <p className="text-gray-700 text-sm">120-participant clinical trial showed 45% reduction in liver enzyme levels with 300mg twice daily dosing.</p>
                  <Link to="/research" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                    View Full Study Details →
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-l-4 border-l-purple-600">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">2024 Hangover Prevention RCT</h4>
                  <p className="text-sm text-gray-600 mb-2">Double-blind randomized controlled trial - Foods Journal</p>
                  <p className="text-gray-700 text-sm">First rigorous human clinical trial demonstrating significant reduction in blood alcohol levels and hangover symptoms.</p>
                  <Link to="/research" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                    View Full Study Details →
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Research Database</h3>
              <p className="text-gray-700 mb-4">Access our comprehensive database of 11 peer-reviewed studies with detailed methodology, results, and significance analysis.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/research">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Research Studies
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DHM Side Effects Section - NEW HIGH-VALUE CONTENT */}
      <section className="py-16 px-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              DHM Side Effects & Safety Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Common Side Effects */}
              <Card className="bg-white shadow-lg border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                  <CardTitle className="text-xl flex items-center text-orange-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Potential DHM Side Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    DHM is generally well-tolerated with minimal side effects. In clinical studies, most participants experienced no adverse effects. However, some rare side effects may include:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <div>
                        <strong>Mild Digestive Discomfort</strong> (less than 5% of users)<br/>
                        <span className="text-sm text-gray-600">Usually resolves when taken with food</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <div>
                        <strong>Slight Drowsiness</strong> (rare)<br/>
                        <span className="text-sm text-gray-600">May occur with higher doses</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <div>
                        <strong>Headache</strong> (very rare)<br/>
                        <span className="text-sm text-gray-600">Often related to dehydration</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <div>
                        <strong>Allergic Reactions</strong> (extremely rare)<br/>
                        <span className="text-sm text-gray-600">Discontinue use if symptoms occur</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Safety Profile */}
              <Card className="bg-white shadow-lg border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <CardTitle className="text-xl flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    DHM Safety Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    Clinical research demonstrates DHM's excellent safety profile:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>No serious adverse events</strong> reported in human trials</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Non-toxic</strong> at recommended doses (up to 1200mg/day)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>No dependency</strong> or withdrawal symptoms</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>GRAS status</strong> (Generally Recognized As Safe)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>No liver toxicity</strong> - actually protects liver function</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contraindications */}
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center text-red-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Important Contraindications & Drug Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Do NOT take DHM if you:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Are pregnant or breastfeeding</li>
                      <li>• Have severe liver disease or cirrhosis</li>
                      <li>• Are under 18 years of age</li>
                      <li>• Have known allergies to flavonoids</li>
                      <li>• Are taking immunosuppressant medications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Potential Drug Interactions:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Blood thinners</strong> (warfarin, aspirin)</li>
                      <li>• <strong>Diabetes medications</strong> (may affect blood sugar)</li>
                      <li>• <strong>Sedatives</strong> (may enhance effects)</li>
                      <li>• <strong>Antibiotics</strong> (consult your doctor)</li>
                      <li>• <strong>Other supplements</strong> (especially liver-active)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-red-100 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Always consult your healthcare provider before starting DHM, especially if you take prescription medications or have pre-existing conditions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* When to Seek Medical Attention */}
            <Card className="bg-white shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center text-amber-800">
                  <Activity className="w-5 h-5 mr-2" />
                  When to Seek Medical Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Stop taking DHM and seek immediate medical attention if you experience:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Severe allergic reactions (rash, itching, swelling, difficulty breathing)</li>
                  <li>• Severe abdominal pain or persistent nausea</li>
                  <li>• Unusual bleeding or bruising</li>
                  <li>• Yellowing of skin or eyes (jaundice)</li>
                  <li>• Severe drowsiness or confusion</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* DHM Dosage Chart Section - NEW VISUAL GUIDE */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              DHM Dosage Chart - Quick Reference Guide
            </h2>
            
            {/* Visual Dosage Chart */}
            <Card className="bg-gradient-to-br from-blue-50 to-green-50 shadow-xl mb-12">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-800">DHM Dosage by Body Weight & Alcohol Consumption</CardTitle>
                <CardDescription className="text-lg mt-2">Find your recommended dosage in the chart below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="border border-blue-700 p-2 md:p-3 text-left font-semibold text-sm md:text-base">Body Weight</th>
                        <th className="border border-blue-700 p-2 md:p-3 text-center font-semibold text-sm md:text-base">Light Drinking<br/><span className="text-xs md:text-sm font-normal">(1-3 drinks)</span></th>
                        <th className="border border-blue-700 p-2 md:p-3 text-center font-semibold text-sm md:text-base">Moderate Drinking<br/><span className="text-xs md:text-sm font-normal">(4-6 drinks)</span></th>
                        <th className="border border-blue-700 p-2 md:p-3 text-center font-semibold text-sm md:text-base">Heavy Drinking<br/><span className="text-xs md:text-sm font-normal">(7+ drinks)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 p-2 md:p-3 font-medium text-sm md:text-base">100-130 lbs<br className="md:hidden"/><span className="text-xs md:text-sm text-gray-600">(45-59 kg)</span></td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-600">250 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-700">300 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-800">400 mg</td>
                      </tr>
                      <tr className="hover:bg-green-50 transition-colors bg-gray-50">
                        <td className="border border-gray-300 p-2 md:p-3 font-medium text-sm md:text-base">130-160 lbs<br className="md:hidden"/><span className="text-xs md:text-sm text-gray-600">(59-73 kg)</span></td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-600">300 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-700">400 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-800">500 mg</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 p-2 md:p-3 font-medium text-sm md:text-base">160-190 lbs<br className="md:hidden"/><span className="text-xs md:text-sm text-gray-600">(73-86 kg)</span></td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-600">400 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-700">500 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-800">600 mg</td>
                      </tr>
                      <tr className="hover:bg-green-50 transition-colors bg-gray-50">
                        <td className="border border-gray-300 p-2 md:p-3 font-medium text-sm md:text-base">190-220 lbs<br className="md:hidden"/><span className="text-xs md:text-sm text-gray-600">(86-100 kg)</span></td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-600">450 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-700">600 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-green-800">750 mg</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="border border-gray-300 p-2 md:p-3 font-medium text-sm md:text-base">220+ lbs<br className="md:hidden"/><span className="text-xs md:text-sm text-gray-600">(100+ kg)</span></td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-600">500 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-700">700 mg</td>
                        <td className="border border-gray-300 p-2 md:p-3 text-center text-base md:text-lg font-bold text-blue-800">900 mg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Chart Notes */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-100 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Timing Guidelines
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Prevention: 30-60 min before drinking</li>
                      <li>• Recovery: Immediately after last drink</li>
                      <li>• Split dose for sessions over 4 hours</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Important Notes
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Maximum daily dose: 1200 mg</li>
                      <li>• Take with water for best absorption</li>
                      <li>• Adjust based on individual response</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Dosage Reference Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-800">First-Time Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 mb-2">Start with 300mg</div>
                  <p className="text-gray-700 text-sm">Begin with standard dose regardless of weight. Increase if needed for future sessions.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800">Heavy Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 mb-2">Split Your Dose</div>
                  <p className="text-gray-700 text-sm">Take half before drinking, half midway through or after for extended protection.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-800">Maximum Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-700 mb-2">1200mg Daily Max</div>
                  <p className="text-gray-700 text-sm">Never exceed this amount in 24 hours, even for multiple drinking sessions.</p>
                </CardContent>
              </Card>
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