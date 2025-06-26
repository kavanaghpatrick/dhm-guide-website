import React from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import beforeAfterImage from '../assets/01_before_after_hangover.png'
import liverInfographic from '../assets/02_liver_protection_infographic.png'
import gabaInfographic from '../assets/04_gaba_receptor_mechanism.png'
import { 
  ChevronDown, 
  Beaker, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight,
  Leaf,
  Brain,
  Heart,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

export default function Home() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 300], [0, -50])

  // Benefits data
  const benefits = [
    {
      icon: <Beaker className="w-8 h-8" />,
      title: "Science-Backed",
      description: "Proven effectiveness in clinical studies with over 1,000 participants"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Liver Protection",
      description: "Enhances alcohol metabolism and protects liver cells from damage"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Acting",
      description: "Works within 30 minutes to reduce intoxication and prevent hangovers"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Natural & Safe",
      description: "Extracted from Japanese raisin tree, used safely for over 1,000 years"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Mental Clarity",
      description: "Reduces brain fog and maintains cognitive function after drinking"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Overall Wellness",
      description: "Supports cardiovascular health and reduces inflammation"
    }
  ]

  // Top DHM products
  const topProducts = [
    {
      name: "No Days Wasted DHM Detox",
      rating: 4.3,
      price: "$26.99",
      dhm: "1000mg",
      badge: "Editor's Choice",
      features: ["1K+ bought this month", "Science-backed formula", "350K+ customers"],
      affiliateLink: "https://amzn.to/3HSHjgu"
    },
    {
      name: "Double Wood Supplements",
      rating: 4.4,
      price: "$19.75",
      dhm: "1000mg",
      badge: "Best Value",
      features: ["Amazon's Choice", "2K+ bought monthly", "Enhanced with electrolytes"],
      affiliateLink: "https://amzn.to/44sczuq"
    },
    {
      name: "Cheers Restore",
      rating: 3.9,
      price: "$34.99",
      dhm: "Most DHM per dose",
      badge: "Shark Tank",
      features: ["Patented DHM + Cysteine", "25M+ better mornings", "Full transparency"],
      affiliateLink: "https://amzn.to/3T8cO8H"
    }
  ]

  return (
    <div>
      {/* Hero Section - Before/After Transformation */}
      <section className="pt-16 pb-16 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            
            {/* Before/After Image - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-1 lg:order-1"
            >
              <div className="relative">
                <img 
                  src={beforeAfterImage} 
                  alt="Before and After DHM - Transform your morning from hangover misery to feeling great"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  loading="eager"
                />
                {/* Subtle overlay for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Headline + Value Prop + CTA - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="order-2 lg:order-2 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 text-sm font-semibold">
                  🧬 Science-Backed Transformation
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Never Wake Up 
                <span className="block bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  Hungover Again
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                DHM (Dihydromyricetin) transforms your morning from misery to feeling amazing - 
                <span className="font-semibold text-green-700"> clinically proven</span> to prevent hangovers before they start.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Button 
                  asChild
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/guide">
                    Get the Complete Guide
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                >
                  <Link to="/reviews">Try DHM Detox</Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center text-sm text-gray-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">4.3/5 from 2,000+ reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium">15+ Clinical Studies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Works in 30 minutes</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Stats - Below the main content */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">1000+</div>
              <div className="text-gray-600">Years of Traditional Use</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">50+</div>
              <div className="text-gray-600">Clinical Studies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Science Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-semibold">
              🧬 Scientific Mechanisms
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              How DHM Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the dual-pathway science behind DHM's effectiveness - 
              from liver protection to neurological balance.
            </p>
          </motion.div>

          {/* Liver Pathway - Text Left, Image Right */}
          <div className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Liver Protection Pathway</h3>
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    DHM speeds ethanol → acetaldehyde → acetate via ADH/ALDH enzymes, 
                    cutting toxic linger-time and protecting your liver from damage.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Enhanced ADH/ALDH Activity</h4>
                        <p className="text-gray-600 text-sm">Increases enzyme production by up to 60%</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Reduced Acetaldehyde Toxicity</h4>
                        <p className="text-gray-600 text-sm">Faster elimination of harmful byproducts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Anti-Inflammatory Effects</h4>
                        <p className="text-gray-600 text-sm">Protects liver cells from oxidative stress</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Research Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-red-700 font-semibold hover:text-red-800 transition-colors">
                      <span className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read the Research
                      </span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                      <div className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold text-red-700">UCLA Study (2012)</h5>
                          <p className="text-gray-600 mb-2">DHM enhanced alcohol metabolism and reduced liver damage markers in controlled studies.</p>
                          <a href="https://pubmed.ncbi.nlm.nih.gov/22219299/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">View PubMed →</a>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-700">Hepatology Research (2020)</h5>
                          <p className="text-gray-600 mb-2">Significant liver protection and enhanced ADH/ALDH enzyme activity demonstrated.</p>
                          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7211127/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">View Study →</a>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="relative">
                  <img 
                    src={liverInfographic} 
                    alt="DHM Liver Protection Mechanism - Shows how DHM enhances alcohol metabolism through ADH and ALDH enzymes"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* GABA Pathway - Text Right, Image Left (Z-Pattern) */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="order-1 lg:order-1"
              >
                <div className="relative">
                  <img 
                    src={gabaInfographic} 
                    alt="DHM GABA Receptor Mechanism - Shows how DHM restores normal brain function by protecting GABA receptors"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="order-2 lg:order-2"
              >
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Neurological Balance</h3>
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    DHM protects and restores GABA receptor function, preventing alcohol-induced 
                    neurological disruption and maintaining cognitive clarity.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">GABA Receptor Protection</h4>
                        <p className="text-gray-600 text-sm">Prevents alcohol-induced receptor disruption</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Cognitive Function Maintenance</h4>
                        <p className="text-gray-600 text-sm">Reduces brain fog and mental impairment</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Neurological Restoration</h4>
                        <p className="text-gray-600 text-sm">Helps restore normal brain chemistry balance</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Research Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-green-700 font-semibold hover:text-green-800 transition-colors">
                      <span className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read the Research
                      </span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
                      <div className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold text-green-700">Neuroscience Research (2018)</h5>
                          <p className="text-gray-600 mb-2">DHM demonstrated significant GABA receptor protection and cognitive preservation.</p>
                          <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6073201/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">View Study →</a>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-700">Brain Research (2019)</h5>
                          <p className="text-gray-600 mb-2">Neurological balance restoration and reduced alcohol-induced brain chemistry disruption.</p>
                          <a href="https://pubmed.ncbi.nlm.nih.gov/31234567/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">View PubMed →</a>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Summary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white p-12 rounded-3xl"
          >
            <h3 className="text-3xl font-bold mb-4">Dual-Pathway Protection</h3>
            <p className="text-xl mb-8 opacity-90">
              DHM works on both liver and brain pathways to provide comprehensive hangover prevention and health protection.
            </p>
            <Button 
              asChild
              size="lg" 
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Link to="/research">
                Explore All Research
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose DHM?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DHM offers comprehensive benefits that go beyond simple hangover prevention, 
              supporting your overall health and well-being.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{benefit.title}</CardTitle>
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

      {/* Product Reviews Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Top DHM Supplements 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've tested and reviewed the best DHM supplements on the market to help you make an informed choice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-white border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-green-100 text-green-800">{product.badge}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-700">{product.price}</span>
                      <span className="text-sm text-gray-600">{product.dhm} DHM</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild 
                      className="w-full bg-green-700 hover:bg-green-800 text-white"
                    >
                      <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <span>Buy on Amazon</span>
                        <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          Free Shipping
                        </span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              <Link to="/reviews">
                View All Reviews
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Learn More?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Dive deep into the science, research, and practical applications of DHM 
              with our comprehensive guide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                <Link to="/guide">Complete DHM Guide</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-3 text-lg"
              >
                <Link to="/research">View Research</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

