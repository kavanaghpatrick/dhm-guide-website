import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  ChevronDown, 
  Beaker, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight, 
  Menu, 
  X,
  Leaf,
  Brain,
  Heart,
  CheckCircle
} from 'lucide-react'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const heroY = useTransform(scrollY, [0, 300], [0, -50])

  // Navigation items
  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Guide', href: '#guide' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Research', href: '#research' },
    { name: 'About', href: '#about' }
  ]

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
      rating: 4.8,
      price: "$47.00",
      dhm: "450mg+",
      badge: "Editor's Choice",
      features: ["Highest DHM content", "Premium ingredients", "Third-party tested"]
    },
    {
      name: "Double Wood Supplements",
      rating: 4.6,
      price: "$18.99",
      dhm: "300mg",
      badge: "Best Value",
      features: ["98% pure DHM", "Great price", "Simple formula"]
    },
    {
      name: "Flyby Recovery",
      rating: 4.5,
      price: "$40.00",
      dhm: "300mg",
      badge: "Most Popular",
      features: ["Comprehensive formula", "B vitamins included", "Proven results"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Navigation Header */}
      <motion.header 
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-green-100"
        style={{ opacity: headerOpacity }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                DHM Guide
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-700 transition-colors duration-200 font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav 
              className="md:hidden mt-4 pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-green-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            style={{ y: heroY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
                Science-Backed Hangover Prevention
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
                The Ultimate Guide to DHM
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Discover the science behind <span className="font-semibold text-green-700">Dihydromyricetin</span> - 
                the most effective natural hangover prevention compound backed by clinical research.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg"
                >
                  Read Complete Guide
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 text-lg"
                >
                  View Product Reviews
                </Button>
              </div>
            </motion.div>

            {/* Hero Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
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
          </motion.div>
        </div>
      </section>

      {/* What is DHM Section */}
      <section id="guide" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What is DHM?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dihydromyricetin (DHM) is a natural flavonoid extracted from the Japanese raisin tree, 
              scientifically proven to enhance alcohol metabolism and prevent hangover symptoms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900">How DHM Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Enhances Alcohol Metabolism</h4>
                    <p className="text-gray-600">Increases production of alcohol-metabolizing enzymes by up to 60%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Reduces Acetaldehyde Toxicity</h4>
                    <p className="text-gray-600">Speeds up elimination of toxic alcohol byproducts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Protects GABA Receptors</h4>
                    <p className="text-gray-600">Prevents alcohol-induced changes in brain chemistry</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Provides Antioxidant Protection</h4>
                    <p className="text-gray-600">Reduces oxidative stress and inflammation</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Clinical Evidence</h3>
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">UCLA Study (2012)</h4>
                  <p className="text-gray-600 text-sm">
                    DHM reduced alcohol intoxication duration by 70% and prevented withdrawal symptoms in animal models.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">USC Research (2020)</h4>
                  <p className="text-gray-600 text-sm">
                    DHM provided significant liver protection and enhanced alcohol metabolism in chronic exposure studies.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Human Clinical Trial (2015)</h4>
                  <p className="text-gray-600 text-sm">
                    150mg twice daily improved liver function and reduced inflammation markers in 60 participants.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
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

      {/* Product Reviews Section */}
      <section id="reviews" className="py-16 px-4 bg-white">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-gradient-to-br from-white to-green-50 border-green-200 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-100 text-green-800">{product.badge}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{product.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-700">{product.price}</span>
                      <span className="text-sm text-gray-600">{product.dhm} DHM</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6 bg-green-700 hover:bg-green-800">
                      Read Full Review
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline" 
              size="lg"
              className="border-green-700 text-green-700 hover:bg-green-50"
            >
              View All Reviews & Rankings
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Try DHM?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have discovered the science-backed way to prevent hangovers 
              and protect their health while enjoying social drinking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 text-lg"
              >
                Download Complete Guide
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Find Best DHM Supplement
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DHM Guide</span>
              </div>
              <p className="text-gray-400">
                Your trusted source for science-backed information about DHM and hangover prevention.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Complete Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Reviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dosage Calculator</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">
                Get the latest research and product updates delivered to your inbox.
              </p>
              <Button className="bg-green-700 hover:bg-green-800">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DHM Guide. All rights reserved. This website is for educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

