import React from 'react'
import { Link } from '../components/CustomLink.jsx'
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
  const tableOfContents = [
    { id: 'what-is-dhm', title: 'What is DHM?', icon: <Leaf className="w-4 h-4" /> },
    { id: 'traditional-medicine', title: 'Traditional Medicine', icon: <TreePine className="w-4 h-4" /> },
    { id: 'how-it-works', title: 'How DHM Works', icon: <Beaker className="w-4 h-4" /> },
    { id: 'clinical-studies', title: 'Clinical Studies', icon: <Microscope className="w-4 h-4" /> },
    { id: 'safety-dosage', title: 'Safety & Dosage', icon: <Shield className="w-4 h-4" /> },
    { id: 'choosing-supplements', title: 'Choosing Supplements', icon: <Award className="w-4 h-4" /> }
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
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              <BookOpen className="w-4 h-4 mr-2" />
              Complete Scientific Guide
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              The Complete Guide to DHM
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Everything you need to know about <span className="font-semibold text-green-700">Dihydromyricetin</span> - 
              from ancient traditional medicine to cutting-edge clinical research.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">1300+</div>
                <div className="text-gray-600">Years of Traditional Use</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">50+</div>
                <div className="text-gray-600">Clinical Studies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">98%</div>
                <div className="text-gray-600">Purity Available</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tableOfContents.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="text-green-600 group-hover:text-green-700">
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-green-700">
                    {item.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 ml-auto" />
                </motion.a>
              ))}
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
              DHM offers comprehensive benefits backed by over 50 clinical studies and 1,300 years of traditional use.
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

      {/* What is DHM Section */}
      <section id="what-is-dhm" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              What is DHM (Dihydromyricetin)?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Dihydromyricetin, commonly abbreviated as DHM, is a natural flavonoid compound with the chemical formula C15H12O8 and a molecular weight of 320.25. This bioactive compound belongs to the flavanonol subclass of flavonoids, characterized by its unique molecular structure featuring multiple hydroxyl groups that contribute to its powerful antioxidant properties.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                The compound's full chemical name is (2R,3R)-3,5,7-trihydroxy-2-(3,4,5-trihydroxyphenyl)-2,3-dihydrochromen-4-one, though it's also known by several other names including ampelopsin, ampeloptin, and vine tea extract. This complex molecular structure is what gives DHM its remarkable ability to interact with various biological systems in the human body, particularly those involved in alcohol metabolism and liver function.
              </p>

              <div className="bg-green-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Natural Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Hovenia dulcis</h4>
                    <p className="text-gray-700 text-sm">Japanese raisin tree, native to East Asia. Used for over 1,000 years in traditional medicine.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ampelopsis grossedentata</h4>
                    <p className="text-gray-700 text-sm">Chinese vine tea, particularly abundant in southern China's mountainous regions.</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                What makes DHM particularly interesting from a scientific perspective is its unique dual nature as both a metabolite and an antioxidant. Unlike many other flavonoids that primarily function as antioxidants, DHM has been shown to actively participate in alcohol metabolism pathways, making it uniquely suited for addressing alcohol-related health concerns.
              </p>
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

      {/* Traditional Medicine Section */}
      <section id="traditional-medicine" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              The Ancient Wisdom: DHM in Traditional Medicine
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Long before modern science could explain the mechanisms behind DHM's effects, traditional healers in East Asia were already harnessing its power. The use of Hovenia dulcis in traditional medicine dates back over 1,300 years, with the first recorded mention appearing in the Tang Materia Medica, China's first official pharmacopoeia, compiled in 659 AD.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white border-green-100">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Traditional Chinese Medicine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      "Zhi Ju Zi" prescribed for liver disorders, fever, and alcohol-related ailments. Viewed as having "cooling" properties.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-green-100">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Korean Medicine (Hanyak)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Used to "clear heat" from the liver and promote healthy qi flow through meridians.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-green-100">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Japanese Medicine (Kampo)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Incorporated into complex formulations for liver health and digestive function.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                What's remarkable about these traditional uses is how closely they align with modern scientific understanding of DHM's effects. The traditional emphasis on liver health, detoxification, and recovery from alcohol consumption mirrors exactly what contemporary research has validated about DHM's mechanisms of action.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clinical Studies Section */}
      <section id="clinical-studies" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              Clinical Studies & Research Evidence
            </h2>
            
            <div className="space-y-6 mb-8">
              {clinicalStudies.map((study, index) => (
                <motion.div
                  key={study.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-gray-900">{study.title}</CardTitle>
                          <CardDescription className="text-green-700 font-medium">
                            {study.institution} • {study.year}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-600 text-white">{study.significance}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Finding</h4>
                          <p className="text-gray-700">{study.finding}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Study Size</h4>
                          <p className="text-gray-700">{study.participants}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dosage Guidelines Section */}
      <section id="safety-dosage" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              Safety Profile & Dosage Guidelines
            </h2>
            
            <div className="bg-green-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Dosages</h3>
              <div className="space-y-4">
                {dosageGuidelines.map((guideline, index) => (
                  <div key={guideline.timing} className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                    <Clock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{guideline.timing}</h4>
                      <p className="text-green-700 font-medium">{guideline.dose}</p>
                      <p className="text-gray-600 text-sm">{guideline.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Safety Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-blue-700">Generally recognized as safe (GRAS) with over 1,300 years of traditional use</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-blue-700">No serious adverse effects reported in clinical studies</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-blue-700">Well-tolerated at doses up to 1,200mg daily</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-blue-700">Consult healthcare provider if pregnant, nursing, or taking medications</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Choose the Right DHM Supplement?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Now that you understand the science, explore our comprehensive reviews 
              of the best DHM supplements on the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                <Link to="/reviews">
                  View Product Reviews
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg"
              >
                <Link to="/research">See Research Studies</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

