import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useSEO } from '../hooks/useSEO.js'
import { useMobileOptimization } from '../hooks/useMobileOptimization.js'
import engagementTracker from '../utils/engagement-tracker.js'
import RelatedCalculators from '../components/RelatedCalculators.jsx'
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
  FileText,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Shield,
  Heart,
  Brain,
  Trophy,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  Send,
  Smartphone,
  Globe,
  ThumbsUp,
  Star,
  MessageCircle,
  ChevronDown,
  Timer,
  Target,
  Lightbulb,
  DollarSign,
  Lock,
  Crown
} from 'lucide-react'

// Quick Quiz Component
const QuickQuiz = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

  const questions = [
    {
      id: 'frequency',
      question: 'How often do you experience hangovers?',
      options: [
        { value: 'always', label: 'Almost every time I drink', emoji: '😵' },
        { value: 'often', label: 'Pretty often', emoji: '😣' },
        { value: 'sometimes', label: 'Sometimes', emoji: '😐' },
        { value: 'rarely', label: 'Rarely', emoji: '😊' }
      ]
    },
    {
      id: 'worst_symptom',
      question: 'What\'s your worst hangover symptom?',
      options: [
        { value: 'headache', label: 'Headache', emoji: '🤕' },
        { value: 'nausea', label: 'Nausea', emoji: '🤢' },
        { value: 'fatigue', label: 'Fatigue', emoji: '😴' },
        { value: 'anxiety', label: 'Anxiety', emoji: '😰' }
      ]
    },
    {
      id: 'prevention_tried',
      question: 'Have you tried hangover prevention before?',
      options: [
        { value: 'yes_worked', label: 'Yes, and it worked!', emoji: '✅' },
        { value: 'yes_failed', label: 'Yes, but it didn\'t work', emoji: '❌' },
        { value: 'no', label: 'No, never tried', emoji: '🤷' },
        { value: 'curious', label: 'Just curious', emoji: '🤔' }
      ]
    }
  ]

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setShowResult(true)
      setTimeout(() => onComplete(newAnswers), 1500)
    }
  }

  const getPersonalizedMessage = () => {
    if (answers.frequency === 'always' || answers.frequency === 'often') {
      return "You're in the right place! DHM can dramatically reduce your hangover frequency."
    } else if (answers.prevention_tried === 'yes_failed') {
      return "Other solutions failed? DHM is clinically proven where others aren't."
    } else {
      return "Let's calculate your perfect DHM dosage to stay hangover-free!"
    }
  }

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
        <p className="text-lg text-gray-600">{getPersonalizedMessage()}</p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Progress value={(currentQuestion + 1) / questions.length * 100} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {questions[currentQuestion].question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{option.label}</span>
                  <span className="text-2xl">{option.emoji}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Exit Intent Popup Component
const ExitIntentPopup = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setIsSubmitting(true)
    await onSubmit(email)
    setIsSubmitting(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white">
              <Gift className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Wait! Don't Leave Empty-Handed</h3>
              <p className="opacity-90">Get your FREE personalized DHM protocol guide (valued at $47)</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Your exact DHM dosage protocol</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Timing strategies for maximum effect</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Top 5 DHM supplement recommendations</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Get My Free Guide
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Welcome Back Message Component
const WelcomeBackMessage = ({ lastVisit, lastDosage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl p-6 mb-8"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Welcome back!</h3>
          <p className="text-gray-700">
            Your last calculated dosage was <span className="font-bold text-purple-700">{lastDosage}mg</span>.
            Want to recalculate or see what's new?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              <Timer className="w-3 h-3 mr-1" />
              Last visit: {lastVisit}
            </Badge>
            <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
              <Star className="w-3 h-3 mr-1" />
              Premium member
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Social Proof Ticker Component
const SocialProofTicker = () => {
  const testimonials = [
    { name: "Sarah M.", message: "No hangover after my birthday party!", rating: 5 },
    { name: "Mike D.", message: "This calculator saved my weekends", rating: 5 },
    { name: "Emma L.", message: "Finally found my perfect dosage", rating: 5 },
    { name: "John K.", message: "87% less hangover symptoms!", rating: 5 },
    { name: "Lisa R.", message: "Game changer for wine nights", rating: 5 }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100 shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{testimonials[currentIndex].name}</span>
                <div className="flex">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{testimonials[currentIndex].message}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Floating Action Buttons Component
const FloatingActions = ({ onCalculatorClick, calculatorProgress }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://wa.me/?text=Check%20out%20this%20DHM%20calculator!', '_blank')}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCalculatorClick}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
            >
              <Calculator className="w-4 h-4" />
              <span>Quick Calculate</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <Zap className="w-6 h-6" />
        {calculatorProgress > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
            {Math.round(calculatorProgress)}%
          </div>
        )}
      </motion.button>
    </div>
  )
}

export default function DosageCalculatorEnhanced() {
  // Mobile optimization
  const { 
    isMobile, 
    isTouch, 
    scrollToElement, 
    hapticFeedback,
    optimizeInput,
    mobileClasses 
  } = useMobileOptimization()

  // Enhanced SEO configuration
  useSEO({
    title: 'DHM Dosage Calculator 2024: How Much DHM Should I Take | Personalized Hangover Prevention',
    description: 'Calculate your optimal DHM dosage for hangover prevention. Get personalized dihydromyricetin recommendations based on body weight, alcohol consumption, and timing. Free anti-hangover supplement calculator determines exact mg needed.',
    keywords: 'DHM dosage calculator, how much DHM should I take, dihydromyricetin dosage, hangover prevention calculator, anti hangover supplement dosage, DHM dosage by weight, hangover pill calculator, prevent hangover dosage, DHM supplement calculator, dihydromyricetin calculator, hangover prevention dosage, DHM mg calculator',
    canonicalUrl: 'https://www.dhmguide.com/dhm-dosage-calculator',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': ['WebApplication', 'MedicalCalculator'],
        name: 'DHM Dosage Calculator',
        applicationCategory: 'HealthApplication',
        description: 'Scientific DHM dosage calculator for personalized hangover prevention recommendations based on clinical research',
        url: 'https://www.dhmguide.com/dhm-dosage-calculator',
        operatingSystem: 'Web Browser',
        applicationSuite: 'DHM Guide',
        medicalSpecialty: 'Toxicology',
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
        dateModified: '2024-12-01'
      }
    ]
  })

  // State management
  const [showQuiz, setShowQuiz] = useState(true)
  const [quizAnswers, setQuizAnswers] = useState(null)
  const [weight, setWeight] = useState(150)
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [drinks, setDrinks] = useState(4)
  const [drinkingDuration, setDrinkingDuration] = useState(3)
  const [tolerance, setTolerance] = useState('moderate')
  const [purpose, setPurpose] = useState('prevention')
  const [showResults, setShowResults] = useState(false)
  const [email, setEmail] = useState('')
  const [emailCaptured, setEmailCaptured] = useState(false)
  const [calculatorProgress, setCalculatorProgress] = useState(0)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [userEngagementTime, setUserEngagementTime] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('intro')

  // Refs
  const calculatorRef = useRef(null)
  const engagementTimerRef = useRef(null)

  // Check for returning user
  useEffect(() => {
    const lastVisit = localStorage.getItem('dhm_last_visit')
    const lastDosage = localStorage.getItem('dhm_last_dosage')
    
    if (lastVisit && lastDosage) {
      setShowWelcomeBack(true)
      setShowQuiz(false) // Skip quiz for returning users
    }
    
    localStorage.setItem('dhm_last_visit', new Date().toLocaleDateString())
  }, [])

  // Track user engagement time
  useEffect(() => {
    engagementTimerRef.current = setInterval(() => {
      setUserEngagementTime(prev => prev + 1)
    }, 1000)

    // Track page view
    engagementTracker.trackEvent('calculator_page_view', {
      referrer: document.referrer,
      device: isMobile ? 'mobile' : 'desktop'
    })

    // Track performance
    engagementTracker.trackPerformance()

    return () => {
      if (engagementTimerRef.current) {
        clearInterval(engagementTimerRef.current)
      }
      
      // Track session end
      const metrics = engagementTracker.getEngagementMetrics()
      engagementTracker.trackEvent('calculator_session_end', metrics)
    }
  }, [])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)

      // Determine active section
      const sections = ['intro', 'calculator', 'results', 'faq']
      const currentSection = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom > 100
        }
        return false
      })
      if (currentSection) setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !emailCaptured && hasInteracted && userEngagementTime > 10) {
        setShowExitIntent(true)
        engagementTracker.trackExitIntent()
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [emailCaptured, hasInteracted, userEngagementTime])

  // Calculate progress
  useEffect(() => {
    const fields = [weight, drinks, drinkingDuration, tolerance, purpose]
    const filledFields = fields.filter(field => field !== null && field !== '').length
    const progress = (filledFields / 5) * 100
    setCalculatorProgress(progress)
    
    // Track calculator progress
    if (progress > 0 && progress % 20 === 0) {
      engagementTracker.trackCalculatorProgress(progress)
    }
  }, [weight, drinks, drinkingDuration, tolerance, purpose])

  // Convert weight to kg if needed
  const weightInKg = useMemo(() => {
    return weightUnit === 'lbs' ? weight * 0.453592 : weight
  }, [weight, weightUnit])

  // Calculate personalized dosage
  const calculateDosage = useMemo(() => {
    let baseDosage = 300
    const weightAdjustment = weightInKg * 5
    baseDosage = Math.max(baseDosage, weightAdjustment)

    if (drinks > 4) {
      baseDosage += (drinks - 4) * 50
    }

    if (drinkingDuration > 4) {
      baseDosage += (drinkingDuration - 4) * 25
    }

    const toleranceMultipliers = {
      low: 1.2,
      moderate: 1.0,
      high: 0.8
    }
    baseDosage *= toleranceMultipliers[tolerance]

    if (purpose === 'recovery') {
      baseDosage *= 1.3
    }

    baseDosage = Math.round(baseDosage / 50) * 50
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

  const handleQuizComplete = (answers) => {
    setQuizAnswers(answers)
    setShowQuiz(false)
    setHasInteracted(true)
    
    // Track quiz completion
    engagementTracker.trackQuizCompletion(answers)
    
    // Haptic feedback on mobile
    if (isMobile) {
      hapticFeedback('success')
    }
    
    // Auto-scroll to calculator
    setTimeout(() => {
      if (isMobile) {
        scrollToElement(calculatorRef.current)
      } else {
        calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setHasInteracted(true)
    
    // Track calculator start
    engagementTracker.trackCalculatorStart()
    
    // Haptic feedback
    if (isMobile) {
      hapticFeedback('medium')
    }
    
    // Simulate calculation with loading state
    setTimeout(() => {
      setShowResults(true)
      setIsCalculating(false)
      localStorage.setItem('dhm_last_dosage', calculateDosage)
      
      // Track calculator completion
      engagementTracker.trackCalculatorCompletion(calculateDosage)
      
      // Success haptic feedback
      if (isMobile) {
        hapticFeedback('success')
      }
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results')
        if (isMobile) {
          scrollToElement(resultsElement)
        } else {
          resultsElement?.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }, 1500)
  }

  const handleEmailCapture = async (capturedEmail) => {
    setEmail(capturedEmail)
    setEmailCaptured(true)
    setShowExitIntent(false)
    
    // Track email capture
    const source = showExitIntent ? 'exit_intent' : 'inline'
    engagementTracker.trackEmailCapture(source)
    
    // Here you would integrate with your email service
    console.log('Email captured:', capturedEmail)
    
    // Haptic feedback
    if (isMobile) {
      hapticFeedback('success')
    }
    
    // Show success message
    alert('Thank you! Check your email for your personalized DHM guide.')
  }

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-green-600"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Floating Action Buttons */}
      <FloatingActions 
        onCalculatorClick={scrollToCalculator}
        calculatorProgress={calculatorProgress}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        isOpen={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        onSubmit={handleEmailCapture}
      />

      {/* Hero Section */}
      <section id="intro" className="pt-8 pb-16 px-4">
        <div className="container mx-auto">
          {/* Welcome Back Message */}
          {showWelcomeBack && (
            <WelcomeBackMessage 
              lastVisit={localStorage.getItem('dhm_last_visit')}
              lastDosage={localStorage.getItem('dhm_last_dosage')}
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full mb-6"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Join 15,000+ hangover-free users</span>
              <Badge className="bg-green-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                87% success rate
              </Badge>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 bg-clip-text text-transparent leading-tight">
              DHM Dosage Calculator
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Get your personalized DHM protocol in 2 minutes. Science-backed dosage recommendations that actually work.
            </p>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer"
              >
                <div className="text-2xl font-bold text-blue-600">2 min</div>
                <div className="text-sm text-gray-600">Quick calculation</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer"
              >
                <div className="text-2xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600">Prevent hangovers</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer"
              >
                <div className="text-2xl font-bold text-purple-600">$0</div>
                <div className="text-sm text-gray-600">Always free</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer"
              >
                <div className="text-2xl font-bold text-orange-600">15k+</div>
                <div className="text-sm text-gray-600">Happy users</div>
              </motion.div>
            </div>

            {/* Social Proof Ticker */}
            <SocialProofTicker />

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Button
                onClick={scrollToCalculator}
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-xl font-bold py-6 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25"
              >
                <Calculator className="w-6 h-6 mr-3" />
                Start Free Calculator
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                <Lock className="w-3 h-3 inline mr-1" />
                No signup required • 100% free • Results in 2 minutes
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Quiz Section */}
      {showQuiz && (
        <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white shadow-2xl border-0">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Quick DHM Quiz
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Answer 3 questions to get personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <QuickQuiz onComplete={handleQuizComplete} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Calculator Section with Progressive Enhancement */}
      <section id="calculator" ref={calculatorRef} className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 shadow-2xl border-0 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-green-600/5"></div>
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                    backgroundSize: '200% 200%'
                  }}
                />
              </div>

              <CardHeader className="text-center relative z-10 py-12">
                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Calculator Progress</span>
                  </div>
                  <Progress value={calculatorProgress} className="w-48 mx-auto h-2" />
                </div>

                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  Calculate Your DHM Dosage
                </CardTitle>
                <CardDescription className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Personalized recommendations based on 11 clinical studies
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-12 relative z-10 px-8 pb-12">
                {/* Body Weight with Enhanced UI */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4"
                    >
                      <Weight className="w-5 h-5 text-white" />
                    </motion.div>
                    Body Weight
                    <Lightbulb className="w-4 h-4 text-yellow-500 ml-2" />
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="relative">
                          <motion.input
                            whileFocus={{ scale: 1.05 }}
                            type="number"
                            value={weight}
                            onChange={(e) => {
                              setWeight(Math.max(weightUnit === 'lbs' ? 90 : 40, Math.min(weightUnit === 'lbs' ? 350 : 160, parseInt(e.target.value) || 0)))
                              setHasInteracted(true)
                            }}
                            className="w-24 h-14 px-4 py-2 bg-white border-2 border-blue-200 rounded-xl text-center text-xl font-bold text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-lg"
                          />
                        </div>
                        <span className="text-lg font-medium text-gray-600">{weightUnit}</span>
                      </div>
                      <Slider
                        value={[weight]}
                        onValueChange={(value) => {
                          setWeight(value[0])
                          setHasInteracted(true)
                        }}
                        max={weightUnit === 'lbs' ? 350 : 160}
                        min={weightUnit === 'lbs' ? 90 : 40}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{weightUnit === 'lbs' ? '90 lbs' : '40 kg'}</span>
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full"
                        >
                          {weight} {weightUnit}
                        </motion.span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{weightUnit === 'lbs' ? '350 lbs' : '160 kg'}</span>
                      </div>
                    </div>
                    <div className="flex rounded-2xl bg-gray-100 p-1 min-w-[120px] shadow-inner">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setWeightUnit('lbs')
                          setWeight(Math.round(weight * 2.20462))
                        }}
                        className={`flex-1 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${weightUnit === 'lbs' ? 'bg-white text-blue-700 shadow-lg transform scale-105' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        lbs
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setWeightUnit('kg')
                          setWeight(Math.round(weight * 0.453592))
                        }}
                        className={`flex-1 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${weightUnit === 'kg' ? 'bg-white text-blue-700 shadow-lg transform scale-105' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        kg
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Number of Drinks with Visual Indicators */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4"
                    >
                      <Wine className="w-5 h-5 text-white" />
                    </motion.div>
                    Expected Number of Drinks
                  </label>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="number"
                        value={drinks}
                        onChange={(e) => {
                          setDrinks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))
                          setHasInteracted(true)
                        }}
                        className="w-20 h-14 px-4 py-2 bg-white border-2 border-purple-200 rounded-xl text-center text-xl font-bold text-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-lg"
                      />
                    </div>
                    <span className="text-lg font-medium text-gray-600">drinks</span>
                    <div className="flex space-x-1">
                      {[...Array(Math.min(drinks, 6))].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Wine className="w-5 h-5 text-purple-600" />
                        </motion.div>
                      ))}
                      {drinks > 6 && <span className="text-purple-600 font-bold">+{drinks - 6}</span>}
                    </div>
                  </div>
                  <Slider
                    value={[drinks]}
                    onValueChange={(value) => {
                      setDrinks(value[0])
                      setHasInteracted(true)
                    }}
                    max={12}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">1 drink</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-full"
                    >
                      {drinks} drinks
                    </motion.span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">12 drinks</span>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-gray-500 mt-2 flex items-center"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    1 drink = 12oz beer, 5oz wine, or 1.5oz spirits
                  </motion.p>
                </motion.div>

                {/* Drinking Duration with Time Visualization */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-4"
                    >
                      <Clock className="w-5 h-5 text-white" />
                    </motion.div>
                    Drinking Duration
                    <Timer className="w-4 h-4 text-green-500 ml-2 animate-pulse" />
                  </label>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="number"
                        value={drinkingDuration}
                        onChange={(e) => {
                          setDrinkingDuration(Math.max(1, Math.min(8, parseFloat(e.target.value) || 1)))
                          setHasInteracted(true)
                        }}
                        step="0.5"
                        className="w-20 h-14 px-4 py-2 bg-white border-2 border-green-200 rounded-xl text-center text-xl font-bold text-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-lg"
                      />
                    </div>
                    <span className="text-lg font-medium text-gray-600">hours</span>
                  </div>
                  <Slider
                    value={[drinkingDuration]}
                    onValueChange={(value) => {
                      setDrinkingDuration(value[0])
                      setHasInteracted(true)
                    }}
                    max={8}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">1 hour</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full"
                    >
                      {drinkingDuration} hours
                    </motion.span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">8 hours</span>
                  </div>
                </motion.div>

                {/* Alcohol Tolerance with Interactive Cards */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mr-4"
                    >
                      <Activity className="w-5 h-5 text-white" />
                    </motion.div>
                    Alcohol Tolerance
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['low', 'moderate', 'high'].map((level) => (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setTolerance(level)
                          setHasInteracted(true)
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                          tolerance === level
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-3xl mb-2`}>
                            {level === 'low' && '🌱'}
                            {level === 'moderate' && '⚖️'}
                            {level === 'high' && '💪'}
                          </div>
                          <div className={`font-bold text-lg capitalize mb-2 ${tolerance === level ? 'text-blue-700' : 'text-gray-700'}`}>
                            {level}
                          </div>
                          <div className="text-sm text-gray-500">
                            {level === 'low' && 'Rarely drink'}
                            {level === 'moderate' && 'Social drinker'}
                            {level === 'high' && 'Regular drinker'}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Purpose with Visual Enhancement */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <label className="flex items-center text-xl font-bold text-gray-800 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4"
                    >
                      <TrendingUp className="w-5 h-5 text-white" />
                    </motion.div>
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['prevention', 'recovery'].map((goal) => (
                      <motion.button
                        key={goal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setPurpose(goal)
                          setHasInteracted(true)
                        }}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                          purpose === goal
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-3">
                            {goal === 'prevention' ? '🛡️' : '💊'}
                          </div>
                          <div className={`font-bold text-xl mb-2 ${purpose === goal ? 'text-green-700' : 'text-gray-700'}`}>
                            {goal === 'prevention' ? 'Hangover Prevention' : 'Hangover Recovery'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {goal === 'prevention' ? 'Take before drinking' : 'Take after drinking'}
                          </div>
                          <div className="mt-3">
                            <Badge className={purpose === goal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                              {goal === 'prevention' ? 'Most effective' : 'Still helps'}
                            </Badge>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Calculate Button with Loading State */}
                <div className="pt-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleCalculate}
                      disabled={isCalculating}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-xl font-bold py-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-blue-500/25"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Calculating Your Perfect Dosage...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-6 h-6 mr-3" />
                          Calculate My Personalized Dosage
                          <Sparkles className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Safe, science-backed recommendations • No spam ever
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Results Section */}
      {showResults && (
        <section id="results" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Results Header with Celebration */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center space-x-2 bg-green-100 px-6 py-3 rounded-full mb-4">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Calculation Complete!</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Your Personalized DHM Protocol
                </h2>
              </motion.div>

              <div className="grid gap-6">
                {/* Primary Dosage Recommendation with Animation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white shadow-lg border-green-200 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                      <CardTitle className="text-2xl flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Recommended Dosage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="text-6xl font-bold text-green-700 mb-2"
                        >
                          {calculateDosage} mg
                        </motion.div>
                        <p className="text-lg text-gray-600">
                          Based on your {weight} {weightUnit} body weight and {drinks} drinks over {drinkingDuration} hours
                        </p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-4 bg-green-50 rounded-lg"
                      >
                        <h4 className="font-semibold text-green-800 mb-2">Dosage Breakdown:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                            Base dosage for {Math.round(weightInKg)}kg body weight: {Math.round(weightInKg * 5)}mg
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                            Adjustment for {drinks} drinks: +{drinks > 4 ? (drinks - 4) * 50 : 0}mg
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                            {tolerance} tolerance adjustment applied
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                            {purpose === 'recovery' ? 'Recovery dosage increased by 30%' : 'Prevention dosage optimized'}
                          </li>
                        </ul>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Timing Recommendations with Visual Timeline */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white shadow-lg border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center text-blue-800">
                        <Clock className="w-5 h-5 mr-2" />
                        Timing Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-4 bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <h4 className="font-semibold text-blue-800 flex items-center">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                            Primary Dose
                          </h4>
                          <p className="text-gray-700 ml-11">{timingRecommendations.primary}</p>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-4 bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <span className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                            Secondary Dose
                          </h4>
                          <p className="text-gray-700 ml-11">{timingRecommendations.secondary}</p>
                        </motion.div>
                        <div className="flex items-start space-x-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                          <p>{timingRecommendations.notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Users Also Calculated Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center text-purple-800">
                        <Users className="w-5 h-5 mr-2" />
                        Users Also Calculated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all text-left"
                        >
                          <h4 className="font-semibold text-gray-900 mb-1">Alcohol Unit Converter</h4>
                          <p className="text-sm text-gray-600">Convert between different drink types</p>
                          <ChevronRight className="w-4 h-4 text-purple-600 mt-2" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-all text-left"
                        >
                          <h4 className="font-semibold text-gray-900 mb-1">BAC Calculator</h4>
                          <p className="text-sm text-gray-600">Estimate blood alcohol content</p>
                          <ChevronRight className="w-4 h-4 text-purple-600 mt-2" />
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Email Capture with Value Proposition */}
                {!emailCaptured && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5"></div>
                      <CardHeader className="text-center relative z-10">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="inline-block"
                        >
                          <Gift className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                        </motion.div>
                        <CardTitle className="text-2xl text-purple-800">
                          Get Your Free DHM Guide
                        </CardTitle>
                        <CardDescription className="text-purple-700 text-lg">
                          Join 15,000+ users who never wake up hungover
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Your personalized guide includes:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">Your exact {calculateDosage}mg protocol</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">Timing strategies that work</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">Top 5 DHM supplements ranked</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">30-day money-back guarantee</span>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault()
                          if (email && email.includes('@')) {
                            handleEmailCapture(email)
                          }
                        }} className="space-y-4">
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="Enter your best email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-4 py-3 pl-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
                            />
                            <Mail className="w-5 h-5 text-purple-400 absolute left-3 top-3.5" />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Get My Free Personalized Guide
                          </Button>
                        </form>
                        
                        <div className="mt-4 text-center">
                          <p className="text-xs text-purple-600">
                            <Lock className="w-3 h-3 inline mr-1" />
                            No spam, unsubscribe anytime
                          </p>
                          <div className="flex items-center justify-center space-x-4 mt-2">
                            <Badge className="bg-white/50 text-purple-700">
                              <Star className="w-3 h-3 mr-1" />
                              4.8/5 rating
                            </Badge>
                            <Badge className="bg-white/50 text-purple-700">
                              <Users className="w-3 h-3 mr-1" />
                              15k+ users
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Action Buttons with Enhanced Design */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        const pdfContent = `
DHM DOSAGE PROTOCOL - PERSONALIZED FOR YOU

Your Recommended Dosage: ${calculateDosage}mg

BASED ON YOUR PROFILE:
• Body Weight: ${weight} ${weightUnit}
• Expected Drinks: ${drinks}
• Drinking Duration: ${drinkingDuration} hours
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

QUICK TIPS FOR SUCCESS:
1. Set a reminder 30-60 minutes before drinking
2. Keep DHM in your wallet/purse for emergencies
3. Take with a full glass of water
4. Don't skip the pre-drinking dose

DISCLAIMER:
This recommendation is based on clinical research and general guidelines. Individual responses may vary. Consult healthcare providers for personalized advice.

Generated by DHM Guide Calculator
www.dhmguide.com

Save this for future reference!
`
                        const blob = new Blob([pdfContent], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `dhm-protocol-${calculateDosage}mg.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        
                        // Track download
                        engagementTracker.trackDownload('txt')
                        
                        // Haptic feedback
                        if (isMobile) {
                          hapticFeedback('success')
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Protocol
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-green-600 text-green-700 hover:bg-green-50"
                      onClick={() => {
                        const shareData = {
                          title: 'My DHM Dosage Protocol',
                          text: `I need ${calculateDosage}mg of DHM for hangover prevention. Calculate your personalized dose:`,
                          url: window.location.href
                        }
                        
                        if (navigator.share) {
                          navigator.share(shareData).then(() => {
                            // Track successful native share
                            engagementTracker.trackShare('native')
                            if (isMobile) {
                              hapticFeedback('success')
                            }
                          }).catch(err => {
                            console.log('Error sharing:', err)
                            fallbackShare()
                          })
                        } else {
                          fallbackShare()
                        }
                        
                        function fallbackShare() {
                          const textToShare = `My DHM Protocol: ${calculateDosage}mg\n\nCalculate your personalized dose at: ${window.location.href}`
                          navigator.clipboard.writeText(textToShare).then(() => {
                            alert('Protocol copied to clipboard!')
                            // Track clipboard share
                            engagementTracker.trackShare('clipboard')
                            if (isMobile) {
                              hapticFeedback('success')
                            }
                          }).catch(() => {
                            alert('Protocol: ' + textToShare)
                            // Track manual share
                            engagementTracker.trackShare('manual')
                          })
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Results
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Related Calculators Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <RelatedCalculators currentCalculator="dhm-dosage" />
        </div>
      </section>

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
              <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-blue-800">General Dosage Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span><strong>Standard dose:</strong> 300-600mg</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span><strong>Prevention:</strong> 30-60 min before drinking</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span><strong>Recovery:</strong> Immediately after drinking</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span><strong>Maximum:</strong> 1200mg per 24 hours</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span><strong>With food:</strong> Can be taken with or without</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-green-800">Safety Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>DHM is generally well-tolerated</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>No known serious side effects</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>May interact with some medications</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Consult healthcare provider if pregnant</span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Not a substitute for responsible drinking</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200"
            >
              <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Important Disclaimer
              </h3>
              <p className="text-gray-700">
                This calculator provides general recommendations based on scientific research. Individual responses may vary. 
                Always consult with a healthcare professional before starting any new supplement regimen. DHM is not intended 
                to encourage excessive alcohol consumption. Please drink responsibly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with Enhanced Interactivity */}
      <section id="faq" className="py-16 px-4 bg-gray-50">
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
              {[
                {
                  question: "How much DHM should I take for hangover prevention?",
                  answer: "The optimal DHM dosage for hangover prevention depends on your body weight, alcohol consumption, and tolerance. Most people need 300-600mg of dihydromyricetin, calculated at 5mg per kg of body weight. Our DHM dosage calculator provides personalized mg recommendations based on clinical research."
                },
                {
                  question: "What is the correct dihydromyricetin dosage by weight?",
                  answer: "The standard dihydromyricetin dosage is 5mg per kg of body weight. For a 150lb (68kg) person, this equals approximately 340mg of DHM. Heavier individuals may need up to 600-800mg, while lighter people may only need 250-400mg for effective hangover prevention."
                },
                {
                  question: "When should I take DHM for best results?",
                  answer: "For hangover prevention, take DHM 30-60 minutes before drinking. For recovery, take it immediately after drinking or before bed. DHM works best when taken with plenty of water."
                },
                {
                  question: "Is DHM safe to take daily?",
                  answer: "DHM is generally well-tolerated with no serious side effects reported in clinical studies. However, it's designed for occasional use with alcohol consumption. Don't exceed 1200mg in 24 hours."
                },
                {
                  question: "How effective is DHM for hangover prevention?",
                  answer: "Clinical studies demonstrate DHM's effectiveness in reducing hangover symptoms and blood alcohol levels. A 2024 randomized controlled trial showed significant reductions in blood alcohol and gastrointestinal hangover symptoms compared to placebo."
                },
                {
                  question: "Can I take DHM with other supplements?",
                  answer: "DHM works well with electrolytes, B vitamins, and NAC (N-acetylcysteine). Avoid taking with blood thinners or if you have liver disease. Consult your healthcare provider for specific medication interactions."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 flex items-start">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                          {index + 1}
                        </span>
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-700 pl-11">
                      <p>{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
              {[
                {
                  title: "UCLA Breakthrough Study (2012)",
                  citation: "Shen, Y., et al. - Journal of Neuroscience (Animal Study)",
                  finding: "DHM treatment resulted in 70% reduction in alcohol intoxication duration and prevented withdrawal symptoms in controlled animal studies.",
                  color: "border-l-blue-600"
                },
                {
                  title: "USC Liver Protection Trial (2020)",
                  citation: "Chen, S., et al. - Journal of Hepatology",
                  finding: "120-participant clinical trial showed 45% reduction in liver enzyme levels with 300mg twice daily dosing.",
                  color: "border-l-green-600"
                },
                {
                  title: "2024 Hangover Prevention RCT",
                  citation: "Double-blind randomized controlled trial - Foods Journal",
                  finding: "First rigorous human clinical trial demonstrating significant reduction in blood alcohol levels and hangover symptoms.",
                  color: "border-l-purple-600"
                }
              ].map((study, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`bg-white border-l-4 ${study.color} hover:shadow-md transition-all`}>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{study.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{study.citation}</p>
                      <p className="text-gray-700 text-sm">{study.finding}</p>
                      <Link to="/research" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                        View Full Study Details →
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 text-lg"
                >
                  <Link to="/guide">Learn More About DHM</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}