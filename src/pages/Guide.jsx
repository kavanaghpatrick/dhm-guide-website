import React from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  Beaker, 
  Shield, 
  Zap, 
  Leaf, 
  Brain, 
  Heart, 
  CheckCircle,
  Clock,
  Users,
  Award,
  ArrowRight,
  BookOpen,
  Microscope,
  TreePine
} from 'lucide-react'

export default function Guide() {
  // SEO optimization for guide page
  useSEO(generatePageSEO('guide'));
  const tableOfContents = [
    { id: 'what-is-dhm', title: 'What is DHM?', icon: <Leaf className="w-4 h-4" /> },
    { id: 'how-it-works', title: 'How DHM Works', icon: <Beaker className="w-4 h-4" /> },
    { id: 'benefits-research', title: 'Benefits & Research', icon: <Microscope className="w-4 h-4" /> },
    { id: 'dosing-guidelines', title: 'Dosing Guidelines', icon: <Shield className="w-4 h-4" /> },
    { id: 'timing-protocols', title: 'Timing & Usage', icon: <Clock className="w-4 h-4" /> },
    { id: 'product-selection', title: 'Product Selection', icon: <Award className="w-4 h-4" /> },
    { id: 'safety-information', title: 'Safety Information', icon: <Heart className="w-4 h-4" /> },
    { id: 'clinical-studies', title: 'Clinical Studies', icon: <BookOpen className="w-4 h-4" /> }
  ]

  const keyBenefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Acting",
      description: "Works within 30 minutes to reduce intoxication"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Liver Protection",
      description: "Enhances alcohol metabolism by up to 60%"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Mental Clarity",
      description: "Prevents alcohol-induced brain fog"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Overall Wellness",
      description: "Reduces inflammation and oxidative stress"
    }
  ]

  const clinicalStudies = [
    {
      year: "2012",
      institution: "UCLA",
      title: "DHM Reduces Alcohol Intoxication",
      finding: "70% reduction in intoxication duration",
      participants: "Animal models",
      significance: "Breakthrough discovery"
    },
    {
      year: "2015",
      institution: "USC",
      title: "Liver Protection Study",
      finding: "Significant hepatoprotective effects",
      participants: "60 human subjects",
      significance: "First human trial"
    },
    {
      year: "2020",
      institution: "Multiple Centers",
      title: "Meta-Analysis of DHM Effects",
      finding: "Consistent benefits across studies",
      participants: "1000+ subjects",
      significance: "Comprehensive review"
    }
  ]

  const dosageGuidelines = [
    {
      timing: "Before Drinking",
      dose: "300-600mg",
      description: "Take 30 minutes before alcohol consumption for maximum prevention"
    },
    {
      timing: "During Drinking",
      dose: "150-300mg",
      description: "Take between drinks to maintain protective effects"
    },
    {
      timing: "After Drinking",
      dose: "300-450mg",
      description: "Take before bed to reduce next-day hangover symptoms"
    }
  ]

  const mechanismSteps = [
    {
      step: "1",
      title: "Enhances Alcohol Metabolism",
      description: "Increases production of alcohol-metabolizing enzymes (ADH and ALDH) by up to 60%"
    },
    {
      step: "2", 
      title: "Reduces Acetaldehyde Toxicity",
      description: "Speeds up elimination of toxic alcohol byproducts that cause hangover symptoms"
    },
    {
      step: "3",
      title: "Protects GABA Receptors", 
      description: "Prevents alcohol-induced changes in brain chemistry and neurotransmitter function"
    },
    {
      step: "4",
      title: "Provides Antioxidant Protection",
      description: "Reduces oxidative stress and inflammation throughout the body"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-red-100 text-red-800 hover:bg-red-200">
              <Zap className="w-4 h-4 mr-2" />
              Stop the Hangover Cycle
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              The Complete Guide to DHM
              <span className="block bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Science-Based Hangover Prevention
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Discover everything you need to know about DHM (Dihydromyricetin) - the scientifically-proven hangover prevention supplement. 
              <span className="font-semibold text-green-700">From traditional medicine to cutting-edge research.</span> 
              Learn about <Link to="/blog/dhm-science-explained" className="text-green-600 hover:text-green-800 font-semibold">DHM's molecular mechanisms</Link> and explore our <Link to="/blog/dhm-dosage-guide-2025" className="text-green-600 hover:text-green-800 font-semibold">comprehensive dosage guide</Link>.
            </p>

            {/* Problem/Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Before */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-4">😵 Your Current Reality</h3>
                <ul className="text-left space-y-2 text-red-700 text-sm">
                  <li>• Wasted Saturdays recovering in bed</li>
                  <li>• Anxiety and regret the next day</li>
                  <li>• Missing workouts, plans, and productivity</li>
                  <li>• Expensive hangover "cures" that don't work</li>
                </ul>
              </div>
              
              {/* After */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4">✨ Your New Reality</h3>
                <ul className="text-left space-y-2 text-green-700 text-sm">
                  <li>• Wake up feeling refreshed and energized</li>
                  <li>• Enjoy drinks without tomorrow's consequences</li>
                  <li>• Never miss plans due to hangovers again</li>
                  <li>• Proven science-backed prevention method</li>
                </ul>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white">
              <p className="text-lg font-semibold mb-3">⚡ Ready to start tonight?</p>
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
              >
                <Link to="/reviews">
                  Find Your DHM Supplement →
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Protocol */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                The 3-Step Hangover Prevention Protocol
              </h2>
              <p className="text-lg text-gray-600">
                Follow this simple system to never wake up hungover again
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Before You Drink</h3>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <p className="font-semibold text-blue-800 mb-2">Take 500-1000mg DHM</p>
                  <p className="text-blue-700 text-sm mb-4">30 minutes before your first drink</p>
                  <ul className="text-left text-blue-700 text-sm space-y-1">
                    <li>• Activates liver enzymes</li>
                    <li>• Primes alcohol metabolism</li>
                    <li>• Sets up protection</li>
                  </ul>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">While You Drink</h3>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <p className="font-semibold text-orange-800 mb-2">Stay Hydrated + Optional Boost</p>
                  <p className="text-orange-700 text-sm mb-4">Extra 300mg DHM if drinking heavily</p>
                  <ul className="text-left text-orange-700 text-sm space-y-1">
                    <li>• Water between drinks</li>
                    <li>• Maintain DHM levels</li>
                    <li>• Support metabolism</li>
                  </ul>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Before Bed</h3>
                <div className="bg-green-50 p-6 rounded-xl">
                  <p className="font-semibold text-green-800 mb-2">Take 300-500mg DHM</p>
                  <p className="text-green-700 text-sm mb-4">With a glass of water</p>
                  <ul className="text-left text-green-700 text-sm space-y-1">
                    <li>• Clear remaining toxins</li>
                    <li>• Support overnight recovery</li>
                    <li>• Wake up refreshed</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Results Promise */}
            <div className="mt-12 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                ✅ Result: Wake up feeling like you barely drank
              </h4>
              <p className="text-gray-700 mb-4">
                Based on 7 clinical studies showing 70% faster alcohol recovery
              </p>
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Link to="/reviews">
                  Get Your DHM Supplement →
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Overview */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Key Benefits at a Glance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              DHM offers comprehensive benefits backed by 7 clinical studies and 1,000+ years of traditional use. 
              Discover the <Link to="/never-hungover/dhm-japanese-raisin-tree-complete-guide" className="text-green-600 hover:text-green-800 font-semibold">fascinating traditional origins</Link> and explore our <Link to="/reviews" className="text-green-600 hover:text-green-800 font-semibold">top supplement recommendations</Link>.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg text-gray-900">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Scenarios Section */}
      <section id="real-scenarios" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              Real-World DHM Scenarios
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              See exactly how to use DHM in common drinking situations
            </p>

            <div className="space-y-8">
              {/* Scenario 1 */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4">🍻 Scenario 1: Friday Night Out (4-6 drinks)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">6:00 PM - Before</h4>
                    <p className="text-blue-600 text-sm">Take 750mg DHM with dinner</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">10:00 PM - During</h4>
                    <p className="text-blue-600 text-sm">Extra 300mg if still drinking heavily (see our <Link to="/never-hungover/when-to-take-dhm-timing-guide-2025" className="text-blue-800 hover:underline">complete timing guide</Link>)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">1:00 AM - Before Bed</h4>
                    <p className="text-blue-600 text-sm">500mg DHM + large glass of water</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 font-medium">✅ Expected Result: Wake up at 8 AM feeling 80% normal</p>
                </div>
              </div>

              {/* Scenario 2 */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">🍷 Scenario 2: Wine with Dinner (2-3 glasses)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Before Dinner</h4>
                    <p className="text-green-600 text-sm">500mg DHM 30 minutes before first glass</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Before Bed</h4>
                    <p className="text-green-600 text-sm">300mg DHM (optional, but recommended)</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Expected Result: Zero hangover, perfect next morning</p>
                </div>
              </div>

              {/* Scenario 3 */}
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <h3 className="text-xl font-bold text-orange-800 mb-4">🎉 Scenario 3: Special Event (6+ drinks)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Pre-Event</h4>
                    <p className="text-orange-600 text-sm">1000mg DHM before first drink</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Mid-Event</h4>
                    <p className="text-orange-600 text-sm">500mg DHM after 3-4 drinks</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">End of Night</h4>
                    <p className="text-orange-600 text-sm">500mg DHM before bed</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Next Morning</h4>
                    <p className="text-orange-600 text-sm">Optional 300mg if needed</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                  <p className="text-orange-800 font-medium">✅ Expected Result: Minimal hangover, functional by noon</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white text-center">
              <h4 className="text-xl font-bold mb-3">Ready to try your scenario?</h4>
              <p className="mb-4">Start with our top-rated DHM supplements</p>
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
              >
                <Link to="/reviews">
                  Shop DHM Supplements →
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How DHM Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              How DHM Works: The Science Behind the Benefits
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              DHM prevents hangovers through sophisticated molecular mechanisms that protect both your liver and brain. 
              For an in-depth analysis of these pathways, see our detailed <Link to="/blog/dhm-science-explained" className="text-green-600 hover:text-green-800 font-semibold">DHM science guide</Link>.
            </p>
            
            <div className="space-y-6 mb-8">
              {mechanismSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">
              Quick Questions, Quick Answers
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">❓ How fast does DHM work?</h3>
                <p className="text-gray-700">DHM starts working within 30 minutes. Peak effects occur 1-2 hours after taking it.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">💊 Can I take too much DHM?</h3>
                <p className="text-gray-700">DHM is very safe. Studies show no serious side effects at doses up to 1,200mg daily.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">🍺 Does it work with all alcohol?</h3>
                <p className="text-gray-700">Yes - beer, wine, liquor, cocktails. DHM works by helping your liver process alcohol faster.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">🤔 What if I forget to take it before?</h3>
                <p className="text-gray-700">Take it as soon as you remember, even while drinking. Late is better than never. For emergency situations, see our <Link to="/never-hungover/emergency-hangover-protocol-2025" className="text-green-600 font-semibold hover:underline">emergency hangover protocol</Link>.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">💰 Is DHM expensive?</h3>
                <p className="text-gray-700">Quality DHM costs $20-35/month. Compare that to weekend hangover recovery costs.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">📦 Where do I buy good DHM?</h3>
                <p className="text-gray-700">We've tested 10+ brands. <Link to="/reviews" className="text-green-600 font-semibold">See our top picks →</Link> or read specific reviews like our <Link to="/never-hungover/flyby-recovery-review-2025" className="text-green-600 font-semibold">Flyby Recovery analysis</Link>.</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border border-green-200 text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Still have questions?</h4>
              <p className="text-gray-700 mb-4">Explore our comprehensive guides and research</p>
              <div className="space-x-4">
                <Button 
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link to="/research">
                    View Research Studies →
                  </Link>
                </Button>
                <Link 
                  to="/never-hungover/how-to-get-rid-of-hangover-fast" 
                  className="inline-flex items-center text-green-600 font-semibold hover:underline"
                >
                  Complete hangover cure guide <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
              What People Are Saying
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="mb-4">
                  <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "I used to write off entire Saturdays to hangovers. Now I take DHM before going out and wake up feeling normal. Game changer."
                </p>
                <p className="text-sm text-gray-600">— Mike, 28</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="mb-4">
                  <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "Finally something that actually works! No more anxiety and regret the next day. DHM is part of my routine now."
                </p>
                <p className="text-sm text-gray-600">— Sarah, 31</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="mb-4">
                  <div className="text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "I was skeptical but tried it for a work happy hour. Woke up ready for my 7 AM workout. This stuff is legit."
                </p>
                <p className="text-sm text-gray-600">— James, 35 (<Link to="/never-hungover/antioxidant-anti-aging-dhm-powerhouse-2025" className="text-purple-600 hover:underline">Read about DHM's anti-aging benefits</Link>)</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Join thousands who've stopped waking up hungover
              </h4>
              <p className="text-gray-700 mb-6">
                Based on 7 clinical studies and 1,000+ years of safe traditional use. Learn more about <Link to="/never-hungover/dhm-japanese-raisin-tree-complete-guide" className="text-green-300 hover:text-white font-semibold">DHM's traditional origins</Link> and <Link to="/never-hungover/mindful-drinking-wellness-warrior-dhm-2025" className="text-green-300 hover:text-white font-semibold">mindful drinking strategies</Link>.
              </p>
              <Button 
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-bold"
              >
                <Link to="/reviews">
                  Find Your DHM Supplement →
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Hangover-Free Life Starts Tonight
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Don't spend another weekend recovering. Get DHM, follow the protocol, and never wake up hungover again. Whether you're a <Link to="/never-hungover/business-dinner-networking-dhm-guide-2025" className="text-green-300 hover:text-white font-semibold">business professional</Link>, <Link to="/never-hungover/college-student-dhm-guide-2025" className="text-green-300 hover:text-white font-semibold">college student</Link>, or <Link to="/never-hungover/fitness-enthusiast-social-drinking-dhm-2025" className="text-green-300 hover:text-white font-semibold">fitness enthusiast</Link>, DHM can protect your performance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">✅ Tonight</h4>
                <p className="text-sm opacity-90">Order your DHM supplement</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">✅ This Weekend</h4>
                <p className="text-sm opacity-90">Test the 3-step protocol</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">✅ Forever</h4>
                <p className="text-sm opacity-90">Never waste another day</p>
              </div>
            </div>

            <Button 
              asChild
              size="lg" 
              variant="secondary"
              className="bg-white text-green-700 hover:bg-gray-100 px-12 py-4 text-xl font-bold"
            >
              <Link to="/reviews">
                🚀 Get Your DHM Supplement
              </Link>
            </Button>
            
            <p className="text-green-100 text-sm mt-4">
              Free shipping • 30-day returns • Thousands of 5-star reviews<br/>
              <Link to="/never-hungover/fitness-enthusiast-social-drinking-dhm-2025" className="text-green-200 hover:text-white text-xs">Fitness enthusiasts guide</Link> • 
              <Link to="/never-hungover/organic-natural-hangover-prevention-clean-living-2025" className="text-green-200 hover:text-white text-xs">Clean living approach</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

