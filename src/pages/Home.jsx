import React from 'react'
import { Link } from '../components/CustomLink.jsx'
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
  Leaf,
  Brain,
  Heart,
  CheckCircle
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
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4">
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
                  asChild
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg"
                >
                  <Link to="/guide">
                    Read Complete Guide
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 text-lg"
                >
                  <Link to="/reviews">View Product Reviews</Link>
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
                  <p className="text-gray-600 text-sm mb-3">
                    DHM reduced alcohol intoxication duration by 70% and prevented withdrawal symptoms in animal models.
                  </p>
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/22219299/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    View Full PubMed Study →
                  </a>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">USC Research (2020)</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    DHM provided significant liver protection and enhanced alcohol metabolism in chronic exposure studies.
                  </p>
                  <a 
                    href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7211127/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    View Full PubMed Study →
                  </a>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Human Clinical Trial (2015)</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    150mg twice daily improved liver function and reduced inflammation markers in 60 participants.
                  </p>
                  <a 
                    href="https://www.sciencedirect.com/science/article/abs/pii/S1043661815000936" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    View Full PubMed Study →
                  </a>
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
                      <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                        Read Full Review
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

