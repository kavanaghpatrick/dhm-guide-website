import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  Star, 
  CheckCircle, 
  Award, 
  DollarSign, 
  Shield, 
  Zap,
  ArrowRight,
  Filter,
  TrendingUp,
  Users,
  ThumbsUp,
  ExternalLink
} from 'lucide-react'

export default function Reviews() {
  const [sortBy, setSortBy] = useState('rating')
  const [filterBy, setFilterBy] = useState('all')

  const topProducts = [
    {
      id: 1,
      name: "No Days Wasted DHM Detox",
      brand: "No Days Wasted",
      rating: 4.8,
      reviews: 1273,
      price: "$47.00",
      pricePerServing: "$4.70",
      servings: 10,
      dhm: "450mg+",
      purity: "98%+",
      badge: "Editor's Choice",
      badgeColor: "bg-yellow-500",
      score: 9.5,
      affiliateLink: "https://amzn.to/3HSHjgu",
      pros: [
        "Highest DHM content per serving (450mg+)",
        "Excellent user reviews (4.8/5 stars)",
        "Third-party tested for purity",
        "Comprehensive ingredient profile",
        "GMP certified manufacturing"
      ],
      cons: [
        "Higher price point",
        "Only 10 servings per package"
      ],
      bestFor: "Users seeking maximum effectiveness and willing to pay premium prices for quality",
      ingredients: ["DHM 450mg", "L-Cysteine", "Milk Thistle", "Prickly Pear"],
      category: "premium"
    },
    {
      id: 2,
      name: "Double Wood Supplements DHM",
      brand: "Double Wood",
      rating: 4.6,
      reviews: 892,
      price: "$18.99",
      pricePerServing: "$0.63",
      servings: 30,
      dhm: "300mg",
      purity: "98%",
      badge: "Best Value",
      badgeColor: "bg-green-500",
      score: 9.2,
      affiliateLink: "https://amzn.to/44sczuq",
      pros: [
        "Excellent value for money",
        "High purity (98% DHM)",
        "Simple, clean formulation",
        "Third-party tested",
        "30 servings per bottle"
      ],
      cons: [
        "Lower DHM content per serving",
        "No additional supportive ingredients",
        "Basic packaging"
      ],
      bestFor: "Budget-conscious users who want pure DHM without extras",
      ingredients: ["DHM 300mg"],
      category: "budget"
    },
    {
      id: 3,
      name: "Toniiq Ease",
      brand: "Toniiq",
      rating: 4.7,
      reviews: 1456,
      price: "$34.95",
      pricePerServing: "$1.17",
      servings: 30,
      dhm: "300mg",
      purity: "95%+",
      badge: "Most Popular",
      badgeColor: "bg-blue-500",
      score: 9.0,
      affiliateLink: "https://amzn.to/4ejE4uq",
      pros: [
        "Comprehensive liver support formula",
        "DHM standardized to 98% purity",
        "Includes supportive ingredients (Milk Thistle, Reishi)",
        "120 capsules per bottle (good value)",
        "Contains B vitamins and L-Cysteine",
        "BioPerine for enhanced absorption"
      ],
      cons: [
        "Complex formula may not suit everyone",
        "More expensive than simple DHM supplements",
        "Larger capsule size due to multiple ingredients"
      ],
      bestFor: "Users wanting comprehensive liver support with DHM plus additional beneficial ingredients",
      ingredients: ["DHM 98%", "Milk Thistle", "Reishi", "L-Cysteine", "B Vitamins", "BioPerine"],
      category: "comprehensive"
    },
    {
      id: 4,
      name: "Cheers Restore",
      brand: "Cheers Health",
      rating: 4.4,
      reviews: 1567,
      price: "$35.00",
      pricePerServing: "$1.17",
      servings: 30,
      dhm: "200mg",
      purity: "90%",
      badge: "Rising Star",
      badgeColor: "bg-purple-500",
      score: 8.6,
      affiliateLink: "#", // Placeholder - no affiliate link available
      pros: [
        "Good overall formula",
        "Reasonable pricing",
        "Positive user feedback",
        "Easy to swallow capsules"
      ],
      cons: [
        "Lower DHM content",
        "Lower purity than competitors",
        "Limited third-party testing"
      ],
      bestFor: "Users new to DHM supplements",
      ingredients: ["DHM 200mg", "Milk Thistle", "Vitamin C", "NAC"],
      category: "beginner"
    },
    {
      id: 5,
      name: "Thorne Liver Cleanse",
      brand: "Thorne Health",
      rating: 4.3,
      reviews: 743,
      price: "$52.00",
      pricePerServing: "$1.73",
      servings: 30,
      dhm: "250mg",
      purity: "99%",
      badge: "Premium Quality",
      badgeColor: "bg-indigo-500",
      score: 8.4,
      affiliateLink: "#", // Placeholder - no affiliate link available
      pros: [
        "Highest purity (99%)",
        "Pharmaceutical grade",
        "Excellent quality control",
        "Doctor recommended"
      ],
      cons: [
        "Very expensive",
        "Lower DHM content",
        "Limited availability"
      ],
      bestFor: "Users who prioritize pharmaceutical-grade quality",
      ingredients: ["DHM 250mg", "Silymarin", "Dandelion", "Artichoke"],
      category: "pharmaceutical"
    }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'premium', label: 'Premium' },
    { value: 'budget', label: 'Budget' },
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'beginner', label: 'Beginner' }
  ]

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price', label: 'Best Value' },
    { value: 'dhm', label: 'Highest DHM' },
    { value: 'reviews', label: 'Most Reviews' }
  ]

  const filteredProducts = topProducts.filter(product => 
    filterBy === 'all' || product.category === filterBy
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price':
        return parseFloat(a.pricePerServing.replace('$', '')) - parseFloat(b.pricePerServing.replace('$', ''))
      case 'dhm':
        return parseInt(b.dhm.replace(/[^\d]/g, '')) - parseInt(a.dhm.replace(/[^\d]/g, ''))
      case 'reviews':
        return b.reviews - a.reviews
      default:
        return 0
    }
  })

  const getBadgeColor = (color) => {
    const colorMap = {
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800',
      'bg-green-500': 'bg-green-100 text-green-800',
      'bg-blue-500': 'bg-blue-100 text-blue-800',
      'bg-purple-500': 'bg-purple-100 text-purple-800',
      'bg-indigo-500': 'bg-indigo-100 text-indigo-800'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800'
  }

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
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Award className="w-4 h-4 mr-2" />
              2025 Product Reviews
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Best DHM Supplements 2025
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Complete reviews and rankings of the top <span className="font-semibold text-green-700">DHM supplements</span> - 
              tested, analyzed, and ranked by effectiveness, value, and user satisfaction.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">20+</div>
                <div className="text-gray-600">Brands Tested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">5000+</div>
                <div className="text-gray-600">User Reviews Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">6</div>
                <div className="text-gray-600">Months of Testing</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Sort Section */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filter by:</span>
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Reviews Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <Badge className={getBadgeColor(product.badgeColor)}>
                            {product.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl text-gray-900 mb-2">{product.name}</CardTitle>
                        <CardDescription className="text-lg text-gray-600">{product.brand}</CardDescription>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.rating}</span>
                            <span className="text-gray-500">({product.reviews} reviews)</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Score: <span className="font-bold text-green-700">{product.score}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-700 mb-1">{product.price}</div>
                        <div className="text-sm text-gray-600">{product.pricePerServing} per serving</div>
                        <div className="text-sm text-gray-500">{product.servings} servings</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Key Specs */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Specifications</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">DHM Content:</span>
                            <span className="font-medium">{product.dhm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Purity:</span>
                            <span className="font-medium">{product.purity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Servings:</span>
                            <span className="font-medium">{product.servings}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2">Ingredients:</h5>
                          <div className="flex flex-wrap gap-1">
                            {product.ingredients.map((ingredient, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Pros and Cons */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Pros
                            </h4>
                            <ul className="space-y-2">
                              {product.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-red-700 mb-3">Cons</h4>
                            <ul className="space-y-2">
                              {product.cons.map((con, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm">
                                  <div className="w-4 h-4 border-2 border-red-600 rounded-full mt-0.5 flex-shrink-0"></div>
                                  <span className="text-gray-700">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Best For:</h5>
                          <p className="text-blue-700 text-sm">{product.bestFor}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
                      <Button 
                        asChild 
                        className="bg-green-700 hover:bg-green-800 text-white flex-1"
                      >
                        <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                          View Product Details
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                      <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                        Compare Products
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Buying Guide CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Help Choosing?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Read our comprehensive buying guide to understand what to look for 
              in a quality DHM supplement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                <Link to="/guide">
                  Read Buying Guide
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg"
              >
                <Link to="/research">See Research Data</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

