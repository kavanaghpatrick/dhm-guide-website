import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useSEO } from '../hooks/useSEO.js'
import { useMobileOptimization } from '../hooks/useMobileOptimization.js'
import engagementTracker from '../utils/engagement-tracker.js'
import { trackEvent } from '../lib/posthog'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import { toast } from 'sonner'
import '../styles/theme-modern.css'
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        style={{ paddingBlock: 'var(--space-8)' }}
      >
        <div
          className="pathway__icon"
          style={{ width: 64, height: 64, margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-pill)' }}
        >
          <CheckCircle2 style={{ width: 32, height: 32, color: 'var(--color-brand-strong)' }} />
        </div>
        <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Quiz Complete!</h3>
        <p className="lead" style={{ marginInline: 'auto' }}>{getPersonalizedMessage()}</p>
      </motion.div>
    )
  }

  const quizProgress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div style={{ maxWidth: '42rem', marginInline: 'auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(quizProgress)}>
          <div className="progress__bar" style={{ width: `${quizProgress}%` }} />
        </div>
        <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-2)' }}>Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
            {questions[currentQuestion].question}
          </h3>
          <div className="choice-group choice-group--2">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAnswer(option.value)}
                className="choice"
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}
              >
                <span className="choice__title">{option.label}</span>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{option.emoji}</span>
              </button>
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
          className="card-raised"
          style={{ maxWidth: '28rem', width: '100%', overflow: 'hidden', padding: 0 }}
        >
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', zIndex: 10, background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-ink-soft)', width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X style={{ width: 24, height: 24 }} />
            </button>

            <div className="surface-brand" style={{ padding: 'var(--space-8)', borderBlockStart: 0 }}>
              <div className="pathway__icon" style={{ marginBottom: 'var(--space-4)' }}>
                <Gift style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
              </div>
              <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Wait! Don't Leave Empty-Handed</h3>
              <p className="text-soft" style={{ margin: 0 }}>Get your FREE personalized DHM protocol guide (valued at $47)</p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 'var(--space-8)' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>What you'll get:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>Your exact DHM dosage protocol</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>Timing strategies for maximum effect</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>Top 5 DHM supplement recommendations</span>
                  </li>
                </ul>
              </div>

              <div className="field">
                <label className="label" htmlFor="exit-intent-email">Email address</label>
                <input
                  id="exit-intent-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-block"
                  style={{ backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'var(--color-on-brand)' }}
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
                </button>
              </div>

              <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
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
      className="card"
      style={{ marginBottom: 'var(--space-8)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
        <div className="pathway__icon" style={{ borderRadius: 'var(--radius-pill)', flex: '0 0 auto' }}>
          <Crown style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="card-title" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-1)' }}>Welcome back!</h3>
          <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
            Your last calculated dosage was <strong style={{ color: 'var(--color-brand-strong)' }}>{lastDosage}mg</strong>.
            Want to recalculate or see what's new?
          </p>
          <div className="cluster" style={{ marginTop: 'var(--space-3)', gap: 'var(--space-2)' }}>
            <span className="badge">
              <Timer className="w-3 h-3 mr-1" />
              Last visit: {lastVisit}
            </span>
            <span className="badge">
              <Star className="w-3 h-3 mr-1" />
              Premium member
            </span>
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
    { name: "John K.", message: "70% faster recovery with DHM!", rating: 5 },
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
    <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'left' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="quote__avatar" style={{ flex: '0 0 auto' }}>
              <User style={{ width: 20, height: 20, color: 'var(--color-brand-strong)' }} />
            </div>
            <div>
              <div className="cluster" style={{ gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{testimonials[currentIndex].name}</span>
                <span className="stars" aria-label={`${testimonials[currentIndex].rating} out of 5 stars`}>
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} style={{ width: 13, height: 13, fill: 'currentColor' }} />
                  ))}
                </span>
              </div>
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>{testimonials[currentIndex].message}</p>
            </div>
          </div>
          <span className="badge-brand badge">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </span>
        </motion.div>
      </AnimatePresence>
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
  const [openFaq, setOpenFaq] = useState(0)

  // Refs
  const calculatorRef = useRef(null)
  const engagementTimerRef = useRef(null)

  // Modern design system: preload the self-hosted display/body fonts on mount
  // (mirrors Reviews.modern.jsx — the page body is wrapped in .theme-modern).
  useEffect(() => {
    preloadModernFonts()
  }, [])

  // Check for returning user
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const lastVisit = localStorage.getItem('dhm_last_visit')
        const lastDosage = localStorage.getItem('dhm_last_dosage')
        
        if (lastVisit && lastDosage) {
          setShowWelcomeBack(true)
          setShowQuiz(false) // Skip quiz for returning users
        }
        
        localStorage.setItem('dhm_last_visit', new Date().toLocaleDateString())
      }
    } catch (error) {
      // Silently fail if localStorage is not available (e.g., private browsing)
      console.log('localStorage not available:', error)
    }
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

    // Track form submission with PostHog
    trackEvent('calculator_form_submitted', {
      weight: weight,
      weight_unit: weightUnit,
      drinks_planned: drinks,
      drinking_duration: drinkingDuration,
      tolerance: tolerance,
      purpose: purpose,
      page_path: window.location.pathname
    })

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
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('dhm_last_dosage', calculateDosage)
        }
      } catch (error) {
        console.log('Unable to save dosage to localStorage:', error)
      }

      // Track calculator completion
      engagementTracker.trackCalculatorCompletion(calculateDosage)

      // Track results viewed with PostHog
      trackEvent('calculator_results_viewed', {
        recommended_dose: calculateDosage,
        weight: weight,
        weight_unit: weightUnit,
        drinks: drinks,
        purpose: purpose,
        page_path: window.location.pathname
      })

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
    // Capture source BEFORE we close the popup, since showExitIntent flips below.
    const source = showExitIntent ? 'exit_intent' : 'inline'

    // Existing PostHog event for "user attempted to subscribe" — keep firing regardless of ESP outcome.
    engagementTracker.trackEmailCapture(source)

    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: capturedEmail, source }),
      })

      let payload = null
      try { payload = await res.json() } catch { payload = null }

      if (res.ok && payload && payload.ok) {
        setEmailCaptured(true)
        setShowExitIntent(false)
        if (isMobile) hapticFeedback('success')

        trackEvent('newsletter_subscribe_succeeded', {
          source,
          esp: 'buttondown',
          status: payload.status || 'subscribed',
          page_path: window.location.pathname,
        })

        toast.success('Subscribed — check your inbox for your DHM guide.')
        return
      }

      // Failure path: keep form open so user can retry.
      const status = res.status
      const errorMessage = (payload && payload.error) || 'Subscription failed'

      trackEvent('newsletter_subscribe_failed', {
        source,
        esp: 'buttondown',
        status,
        error: errorMessage,
        page_path: window.location.pathname,
      })

      if (status === 400) {
        toast.error('That email looks invalid — please check and try again.')
      } else {
        toast.error("Couldn't reach our newsletter service — please try again in a minute.")
      }
    } catch (err) {
      console.error('newsletter subscribe failed:', err)
      trackEvent('newsletter_subscribe_failed', {
        source,
        esp: 'buttondown',
        status: 0,
        error: 'network',
        page_path: window.location.pathname,
      })
      toast.error("Couldn't reach our newsletter service — please try again in a minute.")
    }
  }

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="theme-modern" style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      {/* Scroll Progress Bar — border track, single brand-green fill */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 4, backgroundColor: 'var(--color-border)' }}>
        <motion.div
          style={{ height: '100%', width: `${scrollProgress}%`, backgroundColor: 'var(--color-brand)' }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        isOpen={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        onSubmit={handleEmailCapture}
      />

      {/* Hero Section */}
      <section id="intro" className="surface-wash" style={{ paddingBlock: 'var(--section-y)' }}>
        <div className="container">
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
            style={{ textAlign: 'center', maxWidth: '56rem', marginInline: 'auto' }}
          >
            {/* Social Proof chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="cluster"
              style={{ justifyContent: 'center', marginBottom: 'var(--space-6)' }}
            >
              <span className="chip">
                <Users style={{ width: 16, height: 16 }} />
                Join 15,000+ hangover-free users
              </span>
              <span className="badge-brand badge">
                <Sparkles className="w-3 h-3 mr-1" />
                70% faster recovery
              </span>
            </motion.div>

            <h1 style={{ marginBottom: 'var(--space-6)' }}>
              DHM Dosage <span className="accent">Calculator</span>
            </h1>

            <p className="lead" style={{ marginInline: 'auto', marginBottom: 'var(--space-8)' }}>
              Get your personalized DHM protocol in 2 minutes. Science-backed dosage recommendations that actually work.
            </p>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 'var(--space-8)' }}>
              <div className="card stat" style={{ padding: 'var(--space-4)', alignItems: 'center' }}>
                <div className="stat-value" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>2 min</div>
                <div className="stat-label">Quick calculation</div>
              </div>
              <div className="card stat" style={{ padding: 'var(--space-4)', alignItems: 'center' }}>
                <div className="stat-value" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>70%</div>
                <div className="stat-label">Faster recovery</div>
              </div>
              <div className="card stat" style={{ padding: 'var(--space-4)', alignItems: 'center' }}>
                <div className="stat-value" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>$0</div>
                <div className="stat-label">Always free</div>
              </div>
              <div className="card stat" style={{ padding: 'var(--space-4)', alignItems: 'center' }}>
                <div className="stat-value" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>15k+</div>
                <div className="stat-label">Happy users</div>
              </div>
            </div>

            {/* Social Proof Ticker */}
            <SocialProofTicker />

            {/* CTA Button — internal scroll action (tool, not affiliate): brand green */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: 'var(--space-8)' }}
            >
              <button
                type="button"
                onClick={scrollToCalculator}
                className="btn btn-lg"
                style={{ backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'var(--color-on-brand)' }}
              >
                <Calculator className="w-6 h-6 mr-3" />
                Start Free Calculator
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-3)' }}>
                <Lock className="w-3 h-3 inline mr-1" />
                No signup required • 100% free • Results in 2 minutes
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Quiz Section */}
      {showQuiz && (
        <section className="section surface-brand">
          <div className="container" style={{ maxWidth: '56rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div className="pathway__icon" style={{ margin: '0 auto var(--space-4)' }}>
                    <Brain style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
                  </div>
                  <h2 style={{ marginBottom: 'var(--space-2)' }}>
                    Quick DHM Quiz
                  </h2>
                  <p className="text-soft" style={{ margin: 0 }}>
                    Answer 3 questions to get personalized recommendations
                  </p>
                </div>
                <QuickQuiz onComplete={handleQuizComplete} />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Calculator Section with Progressive Enhancement */}
      <section id="calculator" ref={calculatorRef} className="section">
        <div className="container" style={{ maxWidth: '64rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                {/* Progress Indicator */}
                <div style={{ marginBottom: 'var(--space-6)', maxWidth: '18rem', marginInline: 'auto' }}>
                  <div className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <Target style={{ width: 18, height: 18, color: 'var(--color-brand)' }} />
                    <span className="text-soft" style={{ fontSize: 'var(--text-small)', fontWeight: 600 }}>Calculator Progress</span>
                  </div>
                  <div className="progress" role="progressbar" aria-label="Calculator progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(calculatorProgress)}>
                    <div className="progress__bar" style={{ width: `${calculatorProgress}%` }} />
                  </div>
                </div>

                <div className="pathway__icon" style={{ margin: '0 auto var(--space-6)' }}>
                  <Calculator style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
                </div>
                <h2 style={{ marginBottom: 'var(--space-4)' }}>
                  Calculate Your DHM Dosage
                </h2>
                <p className="lead" style={{ marginInline: 'auto', margin: 0 }}>
                  Personalized recommendations based on 11 clinical studies
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {/* Body Weight with Enhanced UI */}
                <div className="card">
                  <label className="label" htmlFor="calc-weight" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
                    <span className="pathway__icon" style={{ width: 40, height: 40 }}>
                      <Weight style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    </span>
                    Body Weight
                    <Lightbulb style={{ width: 16, height: 16, color: 'var(--color-star)' }} />
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                      <div className="input-affix">
                        <input
                          id="calc-weight"
                          type="number"
                          value={weight}
                          onChange={(e) => {
                            setWeight(Math.max(weightUnit === 'lbs' ? 90 : 40, Math.min(weightUnit === 'lbs' ? 350 : 160, parseInt(e.target.value) || 0)))
                            setHasInteracted(true)
                          }}
                          className="input input-num"
                          style={{ width: '6rem' }}
                        />
                        <span className="input__unit">{weightUnit}</span>
                      </div>
                      {/* Unit toggle — segmented control (brand green, not orange) */}
                      <div className="segmented" role="group" aria-label="Weight unit">
                        <button
                          type="button"
                          className="segmented__btn"
                          aria-pressed={weightUnit === 'lbs'}
                          onClick={() => {
                            setWeightUnit('lbs')
                            setWeight(Math.round(weight * 2.20462))
                          }}
                        >
                          lbs
                        </button>
                        <button
                          type="button"
                          className="segmented__btn"
                          aria-pressed={weightUnit === 'kg'}
                          onClick={() => {
                            setWeightUnit('kg')
                            setWeight(Math.round(weight * 0.453592))
                          }}
                        >
                          kg
                        </button>
                      </div>
                    </div>
                    <div>
                      <input
                        className="range"
                        type="range"
                        aria-label="Body weight"
                        value={weight}
                        onChange={(e) => {
                          setWeight(parseInt(e.target.value, 10))
                          setHasInteracted(true)
                        }}
                        max={weightUnit === 'lbs' ? 350 : 160}
                        min={weightUnit === 'lbs' ? 90 : 40}
                        step={1}
                        aria-label="Body weight slider"
                      />
                      <div className="range-scale">
                        <span>{weightUnit === 'lbs' ? '90 lbs' : '40 kg'}</span>
                        <span className="range-scale__value">{weight} {weightUnit}</span>
                        <span>{weightUnit === 'lbs' ? '350 lbs' : '160 kg'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Number of Drinks with Visual Indicators */}
                <div className="card">
                  <label className="label" htmlFor="calc-drinks" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
                    <span className="pathway__icon" style={{ width: 40, height: 40 }}>
                      <Wine style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    </span>
                    Expected Number of Drinks
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div className="input-affix">
                      <input
                        id="calc-drinks"
                        type="number"
                        value={drinks}
                        onChange={(e) => {
                          setDrinks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))
                          setHasInteracted(true)
                        }}
                        className="input input-num"
                        style={{ width: '5rem' }}
                      />
                      <span className="input__unit">drinks</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {[...Array(Math.min(drinks, 6))].map((_, i) => (
                        <Wine key={i} style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                      ))}
                      {drinks > 6 && <span style={{ color: 'var(--color-brand-strong)', fontWeight: 700 }}>+{drinks - 6}</span>}
                    </div>
                  </div>
                  <input
                    className="range"
                    type="range"
                    aria-label="Number of drinks"
                    value={drinks}
                    onChange={(e) => {
                      setDrinks(parseInt(e.target.value, 10))
                      setHasInteracted(true)
                    }}
                    max={12}
                    min={1}
                    step={1}
                    aria-label="Number of drinks slider"
                  />
                  <div className="range-scale">
                    <span>1 drink</span>
                    <span className="range-scale__value">{drinks} drinks</span>
                    <span>12 drinks</span>
                  </div>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Info style={{ width: 16, height: 16 }} />
                    1 drink = 12oz beer, 5oz wine, or 1.5oz spirits
                  </p>
                </div>

                {/* Drinking Duration with Time Visualization */}
                <div className="card">
                  <label className="label" htmlFor="calc-duration" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
                    <span className="pathway__icon" style={{ width: 40, height: 40 }}>
                      <Clock style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    </span>
                    Drinking Duration
                    <Timer style={{ width: 16, height: 16, color: 'var(--color-brand)' }} />
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div className="input-affix">
                      <input
                        id="calc-duration"
                        type="number"
                        inputMode="decimal"
                        value={drinkingDuration}
                        onChange={(e) => {
                          setDrinkingDuration(Math.max(1, Math.min(8, parseFloat(e.target.value) || 1)))
                          setHasInteracted(true)
                        }}
                        step="0.5"
                        className="input input-num"
                        style={{ width: '5rem' }}
                      />
                      <span className="input__unit">hours</span>
                    </div>
                  </div>
                  <input
                    className="range"
                    type="range"
                    aria-label="Drinking duration in hours"
                    value={drinkingDuration}
                    onChange={(e) => {
                      setDrinkingDuration(parseFloat(e.target.value))
                      setHasInteracted(true)
                    }}
                    max={8}
                    min={1}
                    step={0.5}
                    aria-label="Drinking duration slider"
                  />
                  <div className="range-scale">
                    <span>1 hour</span>
                    <span className="range-scale__value">{drinkingDuration} hours</span>
                    <span>8 hours</span>
                  </div>
                </div>

                {/* Alcohol Tolerance with Interactive Cards */}
                <div className="card">
                  <span className="label" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
                    <span className="pathway__icon" style={{ width: 40, height: 40 }}>
                      <Activity style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    </span>
                    Alcohol Tolerance
                  </span>
                  <div className="choice-group choice-group--3" role="radiogroup" aria-label="Alcohol tolerance">
                    {['low', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={tolerance === level}
                        onClick={() => {
                          setTolerance(level)
                          setHasInteracted(true)
                        }}
                        className="choice choice--center"
                      >
                        <span style={{ fontSize: '1.875rem', lineHeight: 1, marginBottom: 'var(--space-1)' }}>
                          {level === 'low' && '🌱'}
                          {level === 'moderate' && '⚖️'}
                          {level === 'high' && '💪'}
                        </span>
                        <span className="choice__title" style={{ textTransform: 'capitalize' }}>{level}</span>
                        <span className="choice__desc">
                          {level === 'low' && 'Rarely drink'}
                          {level === 'moderate' && 'Social drinker'}
                          {level === 'high' && 'Regular drinker'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose with Visual Enhancement */}
                <div className="card">
                  <span className="label" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>
                    <span className="pathway__icon" style={{ width: 40, height: 40 }}>
                      <TrendingUp style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    </span>
                    Primary Goal
                  </span>
                  <div className="choice-group choice-group--2" role="radiogroup" aria-label="Primary goal">
                    {['prevention', 'recovery'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        role="radio"
                        aria-checked={purpose === goal}
                        onClick={() => {
                          setPurpose(goal)
                          setHasInteracted(true)
                        }}
                        className="choice choice--center"
                      >
                        <span style={{ fontSize: '2.25rem', lineHeight: 1, marginBottom: 'var(--space-2)' }}>
                          {goal === 'prevention' ? '🛡️' : '💊'}
                        </span>
                        <span className="choice__title" style={{ fontSize: '1.125rem' }}>
                          {goal === 'prevention' ? 'Hangover Prevention' : 'Hangover Recovery'}
                        </span>
                        <span className="choice__desc">
                          {goal === 'prevention' ? 'Take before drinking' : 'Take after drinking'}
                        </span>
                        <span className={purpose === goal ? 'badge-brand badge' : 'badge'} style={{ marginTop: 'var(--space-2)' }}>
                          {goal === 'prevention' ? 'Most effective' : 'Still helps'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Button with Loading State — internal tool action: brand green (orange reserved for affiliate CTAs) */}
                <div style={{ paddingTop: 'var(--space-8)' }}>
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="btn btn-lg btn-block"
                    style={{ backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'var(--color-on-brand)', whiteSpace: 'normal', flexWrap: 'wrap' }}
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
                  </button>
                  <p className="text-soft" style={{ textAlign: 'center', fontSize: 'var(--text-small)', marginTop: 'var(--space-3)' }}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    Safe, science-backed recommendations • No spam ever
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Results Section */}
      {showResults && (
        <section id="results" className="section surface-brand">
          <div className="container" style={{ maxWidth: '56rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Results Header */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
                  <Trophy style={{ width: 16, height: 16 }} />
                  Calculation Complete!
                </span>
                <h2 style={{ margin: 0 }}>
                  Your Personalized DHM Protocol
                </h2>
              </div>

              <div className="grid gap-6">
                {/* Primary Dosage Recommendation */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="surface-brand" style={{ padding: 'var(--space-6)', borderBlockStart: 0 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0, color: 'var(--color-brand-strong)' }}>
                      <CheckCircle style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
                      Recommended Dosage
                    </h3>
                  </div>
                  <div style={{ padding: 'var(--space-6)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="stat-value" style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: 'var(--space-2)' }}>
                        {calculateDosage} mg
                      </div>
                      <p className="text-soft" style={{ marginInline: 'auto' }}>
                        Based on your {weight} {weightUnit} body weight and {drinks} drinks over {drinkingDuration} hours
                      </p>
                    </div>

                    <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--color-brand-soft)', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ fontWeight: 600, color: 'var(--color-brand-strong)', marginBottom: 'var(--space-2)' }}>Dosage Breakdown:</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-small)' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-brand)', flex: '0 0 auto' }} />
                          Base dosage for {Math.round(weightInKg)}kg body weight: {Math.round(weightInKg * 5)}mg
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-brand)', flex: '0 0 auto' }} />
                          Adjustment for {drinks} drinks: +{drinks > 4 ? (drinks - 4) * 50 : 0}mg
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-brand)', flex: '0 0 auto' }} />
                          {tolerance} tolerance adjustment applied
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                          <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-brand)', flex: '0 0 auto' }} />
                          {purpose === 'recovery' ? 'Recovery dosage increased by 30%' : 'Prevention dosage optimized'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Timing Recommendations with Visual Timeline */}
                <div className="card">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Clock style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    Timing Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-brand-soft)', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ fontWeight: 600, color: 'var(--color-brand-strong)', display: 'flex', alignItems: 'center', margin: 0 }}>
                        <span style={{ width: 32, height: 32, backgroundColor: 'var(--color-brand)', color: 'var(--color-on-brand)', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-small)', marginRight: 'var(--space-3)', flex: '0 0 auto' }}>1</span>
                        Primary Dose
                      </h4>
                      <p style={{ color: 'var(--color-ink-soft)', marginLeft: '2.75rem', marginBottom: 0 }}>{timingRecommendations.primary}</p>
                    </div>
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', margin: 0 }}>
                        <span style={{ width: 32, height: 32, backgroundColor: 'var(--color-ink-soft)', color: '#fff', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-small)', marginRight: 'var(--space-3)', flex: '0 0 auto' }}>2</span>
                        Secondary Dose
                      </h4>
                      <p style={{ color: 'var(--color-ink-soft)', marginLeft: '2.75rem', marginBottom: 0 }}>{timingRecommendations.secondary}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-small)', color: 'var(--color-ink-soft)', backgroundColor: 'var(--color-brand-soft)', padding: 'var(--space-3)', borderRadius: 'var(--radius)' }}>
                      <Info style={{ width: 16, height: 16, marginTop: 2, flex: '0 0 auto', color: 'var(--color-star)' }} />
                      <p style={{ margin: 0 }}>{timingRecommendations.notes}</p>
                    </div>
                  </div>
                </div>

                {/* Users Also Calculated Section */}
                <div className="card">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Users style={{ width: 20, height: 20, color: 'var(--color-brand)' }} />
                    Users Also Calculated
                  </h3>
                  <div className="choice-group choice-group--2">
                    <button type="button" className="choice">
                      <span className="choice__title">Alcohol Unit Converter</span>
                      <span className="choice__desc">Convert between different drink types</span>
                      <ChevronRight style={{ width: 16, height: 16, color: 'var(--color-brand)', marginTop: 'var(--space-2)' }} />
                    </button>
                    <button type="button" className="choice">
                      <span className="choice__title">BAC Calculator</span>
                      <span className="choice__desc">Estimate blood alcohol content</span>
                      <ChevronRight style={{ width: 16, height: 16, color: 'var(--color-brand)', marginTop: 'var(--space-2)' }} />
                    </button>
                  </div>
                </div>

                {/* Enhanced Email Capture with Value Proposition */}
                {!emailCaptured && (
                  <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                      <div className="pathway__icon" style={{ margin: '0 auto var(--space-3)' }}>
                        <Gift style={{ width: 22, height: 22, color: 'var(--color-brand)' }} />
                      </div>
                      <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                        Get Your Free DHM Guide
                      </h3>
                      <p className="text-soft" style={{ margin: 0 }}>
                        Join 15,000+ users who never wake up hungover
                      </p>
                    </div>
                    <div>
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>Your personalized guide includes:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                            <span style={{ fontSize: 'var(--text-small)' }}>Your exact {calculateDosage}mg protocol</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                            <span style={{ fontSize: 'var(--text-small)' }}>Timing strategies that work</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                            <span style={{ fontSize: 'var(--text-small)' }}>Top 5 DHM supplements ranked</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                            <CheckCircle style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                            <span style={{ fontSize: 'var(--text-small)' }}>30-day money-back guarantee</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault()
                        if (email && email.includes('@')) {
                          handleEmailCapture(email)
                        }
                      }} className="field">
                        <label className="label" htmlFor="results-email">Email address</label>
                        <input
                          id="results-email"
                          type="email"
                          placeholder="Enter your best email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input"
                          required
                        />
                        <button
                          type="submit"
                          className="btn btn-block"
                          style={{ backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'var(--color-on-brand)' }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Get My Free Personalized Guide
                        </button>
                      </form>

                      <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                        <p className="text-soft" style={{ fontSize: 'var(--text-small)' }}>
                          <Lock className="w-3 h-3 inline mr-1" />
                          No spam, unsubscribe anytime
                        </p>
                        <div className="cluster" style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}>
                          <span className="badge">
                            <Star className="w-3 h-3 mr-1" />
                            4.4/5 rating
                          </span>
                          <span className="badge">
                            <Users className="w-3 h-3 mr-1" />
                            15k+ users
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons with Enhanced Design */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="sm:flex-row">
                  <div style={{ flex: 1 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
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
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
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
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Safety Information */}
      <section className="section">
        <div className="container" style={{ maxWidth: '56rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              DHM Dosage Guidelines &amp; Safety
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card" style={{ height: '100%', borderLeft: '3px solid var(--color-info)' }}>
                <h3 className="card-title" style={{ color: 'var(--color-info)' }}>General Dosage Guidelines</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--color-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-info)', marginTop: 2, flex: '0 0 auto' }} />
                    <span><strong>Standard dose:</strong> 300-600mg</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-info)', marginTop: 2, flex: '0 0 auto' }} />
                    <span><strong>Prevention:</strong> 30-60 min before drinking</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-info)', marginTop: 2, flex: '0 0 auto' }} />
                    <span><strong>Recovery:</strong> Immediately after drinking</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-info)', marginTop: 2, flex: '0 0 auto' }} />
                    <span><strong>Maximum:</strong> 1200mg per 24 hours</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-info)', marginTop: 2, flex: '0 0 auto' }} />
                    <span><strong>With food:</strong> Can be taken with or without</span>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ height: '100%', borderLeft: '3px solid var(--color-brand)' }}>
                <h3 className="card-title" style={{ color: 'var(--color-brand-strong)' }}>Safety Considerations</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--color-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <Shield style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>DHM is generally well-tolerated</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <Shield style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>No known serious side effects</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <Shield style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>May interact with some medications</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <Shield style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>Consult healthcare provider if pregnant</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', margin: 0 }}>
                    <Shield style={{ width: 20, height: 20, color: 'var(--color-brand)', marginTop: 2, flex: '0 0 auto' }} />
                    <span>Not a substitute for responsible drinking</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-8)', backgroundColor: 'var(--color-brand-soft)', borderLeft: '3px solid var(--color-star)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertCircle style={{ width: 20, height: 20, color: 'var(--color-star)' }} />
                Important Disclaimer
              </h3>
              <p style={{ color: 'var(--color-ink-soft)', margin: 0 }}>
                This calculator provides general recommendations based on scientific research. Individual responses may vary.
                Always consult with a healthcare professional before starting any new supplement regimen. DHM is not intended
                to encourage excessive alcohol consumption. Please drink responsibly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with Enhanced Interactivity */}
      <section id="faq" className="section surface-brand">
        <div className="container" style={{ maxWidth: '56rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              Frequently Asked Questions
            </h2>

            <div className="faq">
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
              ].map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div className="faq-item" data-open={isOpen} key={index}>
                    <button
                      type="button"
                      className="faq-q"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown style={{ width: 20, height: 20, flex: '0 0 auto', color: 'var(--color-ink-soft)', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    <div className="faq-a">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Scientific References Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: '56rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              Scientific Foundation
            </h2>

            <div className="card" style={{ marginBottom: 'var(--space-8)', borderLeft: '3px solid var(--color-info)' }}>
              <h3 className="card-title" style={{ color: 'var(--color-info)' }}>Clinical Evidence</h3>
              <p style={{ color: 'var(--color-ink-soft)', margin: 0 }}>
                Our dosage recommendations are based on peer-reviewed clinical studies examining dihydromyricetin's effects on alcohol metabolism and liver protection. View our comprehensive research database for detailed study information.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  title: "UCLA Breakthrough Study (2012)",
                  citation: "Shen, Y., et al. - Journal of Neuroscience (Animal Study)",
                  finding: "DHM treatment resulted in 70% reduction in alcohol intoxication duration and prevented withdrawal symptoms in controlled animal studies."
                },
                {
                  title: "USC Liver Protection Trial (2020)",
                  citation: "Chen, S., et al. - Journal of Hepatology",
                  finding: "120-participant clinical trial showed 45% reduction in liver enzyme levels with 300mg twice daily dosing."
                },
                {
                  title: "2024 Hangover Prevention RCT",
                  citation: "Double-blind randomized controlled trial - Foods Journal",
                  finding: "First rigorous human clinical trial demonstrating significant reduction in blood alcohol levels and hangover symptoms."
                }
              ].map((study, index) => (
                <div className="card" key={index} style={{ borderLeft: '3px solid var(--color-brand)' }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>{study.title}</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-2)' }}>{study.citation}</p>
                  <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-2)' }}>{study.finding}</p>
                  <Link to="/research" style={{ fontSize: 'var(--text-small)', fontWeight: 600, display: 'inline-block' }}>
                    Read the Research →
                  </Link>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>Complete Research Database</h3>
              <p style={{ color: 'var(--color-ink-soft)', marginBottom: 'var(--space-4)' }}>Access our comprehensive database of 11 peer-reviewed studies with detailed methodology, results, and significance analysis.</p>
              <Link to="/research" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                <FileText className="w-4 h-4 mr-2" />
                Explore Clinical Evidence
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section surface-brand">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="cta-band"
          >
            <h2 style={{ marginBottom: 'var(--space-6)' }}>
              Ready to Find Your DHM?
            </h2>
            <p className="lead">
              Keep this page pure education. When you’re ready, explore our independent reviews or compare products side-by-side.
            </p>
            <div className="cta-band__actions">
              <Link to="/reviews" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                See Top-Rated DHM Supplements
              </Link>
              <Link to="/compare" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                Compare Products
              </Link>
            </div>
            <p className="cta-band__reassure">
              As an Amazon Associate, we earn from qualifying purchases. This does not affect our recommendations.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}