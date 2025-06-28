import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import ComparisonWidget from '../components/ComparisonWidget.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
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
  ExternalLink,
  Plus,
  Check
} from 'lucide-react'

export default function Reviews() {
  useSEO(generatePageSEO('reviews'));
  
  const [sortBy, setSortBy] = useState('rating')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedForComparison, setSelectedForComparison] = useState([])

  const handleComparisonToggle = (product) => {
    setSelectedForComparison(prev => {
      const isSelected = prev.find(p => p.id === product.id)
      if (isSelected) {
        return prev.filter(p => p.id !== product.id)
      } else if (prev.length < 4) { // Limit to 4 products
        return [...prev, product]
      }
      return prev
    })
  }

  const handleRemoveFromComparison = (productId) => {
    setSelectedForComparison(prev => prev.filter(p => p.id !== productId))
  }

  const handleClearComparison = () => {
    setSelectedForComparison([])
  }

  const handleCompare = () => {
    // Navigate to compare page with selected products
    const productIds = selectedForComparison.map(p => p.id).join(',')
    window.history.pushState({}, '', `/compare?products=${productIds}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const topProducts = [
    {
      id: 1,
      name: "No Days Wasted DHM Detox",
      brand: "No Days Wasted",
      rating: 4.3,
      reviews: 201,
      price: "$26.99",
      pricePerServing: "$1.80",
      servings: 15,
      dhm: "1000mg",
      purity: "98%+",
      badge: "Editor's Choice",
      badgeColor: "bg-yellow-500",
      score: 9.5,
      affiliateLink: "https://amzn.to/3HSHjgu",
      pros: [
        "1K+ bought this month - join 350,000+ satisfied customers",
        "Science-backed formula with 1000mg DHM + 200mg L-Cysteine per serving",
        "Plant-powered with essential electrolytes and B-vitamins",
        "Convenient 15-serving jar - perfect for nights out",
        "Research from Journal of Neuroscience on Japanese Raisin Tree Extract",
        "GMP certified manufacturing"
      ],
      cons: [
        "Higher price point",
        "Only 15 servings per package"
      ],
      bestFor: "Users seeking maximum effectiveness and willing to pay premium prices for quality",
      ingredients: ["DHM 1000mg", "L-Cysteine 200mg", "Milk Thistle", "Prickly Pear", "B-Complex", "Electrolytes"],
      category: "premium"
    },
    {
      id: 2,
      name: "Double Wood Supplements DHM",
      brand: "Double Wood",
      rating: 4.4,
      reviews: 552,
      price: "$19.75",
      pricePerServing: "$0.66",
      servings: 30,
      dhm: "1000mg",
      purity: "98%",
      badge: "Best Value",
      badgeColor: "bg-green-500",
      score: 9.2,
      affiliateLink: "https://amzn.to/44sczuq",
      pros: [
        "Amazon's Choice - 2K+ bought this month",
        "Most powerful DHM supplement with 1,000mg per tablet",
        "Enhanced with essential electrolytes for hydration",
        "Save up to 15% with Subscribe & Save",
        "552+ verified customer reviews",
        "Third-party tested for purity"
      ],
      cons: [
        "No additional supportive ingredients",
        "Basic packaging",
        "Single ingredient formula"
      ],
      bestFor: "Budget-conscious users who want pure DHM without extras",
      ingredients: ["DHM 1000mg", "Electrolytes", "Essential Minerals"],
      category: "budget"
    },
    {
      id: 3,
      name: "Toniiq Ease",
      brand: "Toniiq",
      rating: 4.3,
      reviews: 1681,
      price: "$24.97",
      pricePerServing: "$0.62",
      servings: 40,
      dhm: "300mg",
      purity: "98%",
      badge: "Most Popular",
      badgeColor: "bg-blue-500",
      score: 9.0,
      affiliateLink: "https://amzn.to/44E95Gi",
      pros: [
        "Amazon's Choice - 500+ bought this month",
        "50x Super Concentrated Extract with 1800mg per serving",
        "Triple-action formula: DHM + Reishi + Milk Thistle",
        "98% pure DHM with third-party testing",
        "40 servings per bottle - excellent value",
        "Take before and after drinking for maximum support",
        "GMP-certified manufacturing in USA"
      ],
      cons: [
        "Complex formula may not suit everyone",
        "Larger capsule size due to multiple ingredients",
        "Requires 3 capsules per serving"
      ],
      bestFor: "Users wanting comprehensive liver support with DHM plus additional beneficial ingredients",
      ingredients: ["DHM 300mg (98%)", "Red Duanwood Reishi", "Milk Thistle (80% Silymarin)"],
      category: "comprehensive"
    },
    {
      id: 4,
      name: "NusaPure Dihydromyricetin (DHM) 1,000mg",
      brand: "NusaPure",
      rating: 4.2,
      reviews: 89,
      price: "$19.95",
      pricePerServing: "$0.67",
      servings: 30,
      dhm: "1000mg",
      purity: "98%+",
      badge: "High Potency",
      badgeColor: "bg-orange-500",
      score: 8.8,
      affiliateLink: "https://amzn.to/44znXFU",
      pros: [
        "Highest DHM content per capsule (1000mg)",
        "Excellent value - 30 servings for under $20",
        "98%+ pure DHM extract",
        "Simple, clean formulation",
        "Third-party tested for purity",
        "Made in USA in FDA-registered facility"
      ],
      cons: [
        "Newer brand with fewer reviews",
        "No additional supportive ingredients",
        "Basic packaging"
      ],
      bestFor: "Users wanting maximum DHM potency at an affordable price",
      ingredients: ["DHM 1000mg"],
      category: "budget"
    },
    {
      id: 5,
      name: "Cheers Restore",
      brand: "Cheers®",
      rating: 3.9,
      reviews: 7419,
      price: "$34.99",
      pricePerServing: "$2.92",
      servings: 12,
      dhm: "Most DHM per dose",
      purity: "Patented blend",
      badge: "As Seen on Shark Tank",
      badgeColor: "bg-blue-500",
      score: 8.6,
      affiliateLink: "https://amzn.to/3T8cO8H",
      pros: [
        "Patented DHM + Cysteine formula",
        "Most DHM + Cysteine per dose on market",
        "No proprietary blends - full transparency",
        "25+ million better mornings delivered",
        "Academic research backing"
      ],
      cons: [
        "Higher price per serving",
        "Only 12 doses per package",
        "Mixed experiences with effectiveness"
      ],
      bestFor: "Users wanting maximum DHM content with proven formula",
      ingredients: ["DHM", "L-Cysteine", "Prickly Pear", "B-Vitamins", "Ginger", "Vine Tea"],
      category: "premium"
    },
    {
      id: 6,
      name: "Flyby Recovery",
      brand: "Flyby",
      rating: 4.3,
      reviews: 7200,
      price: "$17.99",
      pricePerServing: "$4.50",
      servings: 4,
      dhm: "300mg",
      purity: "Proprietary extraction",
      badge: "Comprehensive Formula",
      badgeColor: "bg-purple-500",
      score: 8.4,
      affiliateLink: "https://amzn.to/4kjCRVw",
      pros: [
        "Comprehensive formula with 18 amino acids and full B-vitamin complex",
        "Two-stage hangover protocol (take before and after drinking)",
        "7,200+ verified customer reviews",
        "Money-back satisfaction guarantee",
        "GMP certified, Non-GMO, and Gluten-Free",
        "Fast-acting with Prime 1-2 day shipping"
      ],
      cons: [
        "Higher cost per serving at $4.50",
        "Only 4 servings per package",
        "Complex ingredient list may not suit sensitive users"
      ],
      bestFor: "Users wanting a comprehensive two-stage hangover prevention protocol",
      ingredients: ["DHM 300mg", "Milk Thistle", "B-Vitamins (B1,B2,B6,B9,B12)", "18 Amino Acids", "Vitamin C", "Apple Cider Vinegar", "Electrolytes"],
      category: "comprehensive"
    },
    {
      id: 7,
      name: "Good Morning Hangover Pills",
      brand: "Good Health Co",
      rating: 4.2,
      reviews: 124,
      price: "$29.95",
      pricePerServing: "$1.00",
      servings: 30,
      dhm: "DHM + Milk Thistle Blend",
      purity: "80% Silymarin Milk Thistle",
      badge: "88.89% Effective",
      badgeColor: "bg-green-500",
      score: 8.2,
      affiliateLink: "https://amzn.to/44nKqo9",
      pros: [
        "Convenient single-pill dosing - no complicated protocols",
        "Contains 80% Silymarin Milk Thistle for liver protection",
        "88.89% effectiveness rating from verified users",
        "Prime overnight shipping available",
        "GMP certified and Non-GMO ingredients",
        "Good value at $1.00 per serving"
      ],
      cons: [
        "Newer brand with fewer customer reviews",
        "DHM content not precisely specified",
        "No money-back guarantee offered"
      ],
      bestFor: "Users seeking single-pill convenience with proven effectiveness",
      ingredients: ["DHM + Milk Thistle Blend", "Electrolytes", "B-Vitamins", "Vitamin C", "Vitamin E", "L-Cysteine", "White Willow Bark"],
      category: "convenience"
    },
    {
      id: 8,
      name: "DHM1000",
      brand: "Double Wood Supplements",
      rating: 4.3,
      reviews: 496,
      price: "$29.95",
      pricePerServing: "$1.00",
      servings: 30,
      dhm: "1000mg",
      purity: "High potency + electrolytes",
      badge: "Most Powerful",
      badgeColor: "bg-red-500",
      score: 8.6,
      affiliateLink: "https://amzn.to/44nvh65",
      pros: [
        "Maximum 1000mg DHM potency per serving",
        "Enhanced with electrolytes for hydration support",
        "496+ verified customer reviews",
        "Money-back satisfaction guarantee",
        "GMP certified and Non-GMO ingredients",
        "Prime 1-2 day shipping available"
      ],
      cons: [
        "Higher price point than basic DHM supplements",
        "Not third-party tested for purity verification",
        "Single-ingredient focus without additional liver support"
      ],
      bestFor: "Users seeking maximum DHM potency with electrolyte enhancement",
      ingredients: ["DHM 1000mg", "Electrolytes (Sodium, Potassium, Magnesium)"],
      category: "premium"
    },
    {
      id: 9,
      name: "Fuller Health After Party",
      brand: "Fuller Health",
      rating: 4.0,
      reviews: 92,
      price: "$49.95",
      pricePerServing: "$1.67",
      servings: 30,
      dhm: "650mg",
      purity: "Pure DHM + GABA support",
      badge: "Celebrity Endorsed",
      badgeColor: "bg-purple-500",
      score: 7.8,
      affiliateLink: "https://amzn.to/4eBbyEP",
      pros: [
        "Celebrity endorsement and premium positioning",
        "Pure DHM formula with GABA support mechanisms",
        "Organic and pure ingredient sourcing",
        "Money-back satisfaction guarantee",
        "Focus on premium purity standards",
        "Unique GABA receptor support approach"
      ],
      cons: [
        "Most expensive option at $1.67 per serving",
        "Limited customer reviews (only 92)",
        "Standard shipping only (3-5 days)"
      ],
      bestFor: "Users seeking premium purity with celebrity endorsement",
      ingredients: ["DHM 650mg", "GABA Support Mechanism"],
      category: "premium"
    },
    {
      id: 10,
      name: "DHM Depot",
      brand: "Double Wood Supplements",
      rating: 4.5,
      reviews: 1129,
      price: "$44.95",
      pricePerServing: "$0.90",
      servings: 50,
      dhm: "300mg",
      purity: "Third-party tested",
      badge: "Highest Rated",
      badgeColor: "bg-blue-500",
      score: 8.8,
      affiliateLink: "https://amzn.to/4l1ZoqN",
      pros: [
        "Highest customer rating at 4.5/5 stars",
        "1,129+ verified customer reviews",
        "Third-party tested for purity and potency",
        "Comprehensive certifications (GMP, Non-GMO, Gluten-Free)",
        "Excellent value at $0.90 per serving",
        "Pure DHM without unnecessary additives"
      ],
      cons: [
        "Lower DHM content at 300mg per serving",
        "Higher overall package price",
        "May require multiple doses for some users"
      ],
      bestFor: "Users prioritizing quality assurance and highest customer ratings",
      ingredients: ["DHM 300mg"],
      category: "premium"
    }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'premium', label: 'Premium' },
    { value: 'budget', label: 'Budget' },
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'convenience', label: 'Convenience' }
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
      <section className="pt-6 pb-8 md:pb-12 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Award className="w-4 h-4 mr-2" />
              2025 Reviews
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Best Hangover Prevention Pills 2025
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
              Expert reviews of hangover prevention supplements that actually work - stop hangovers before they start.
            </p>

            {/* Quick Stats - Hidden on mobile to save space */}
            <div className="hidden md:grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">20+</div>
                <div className="text-gray-600 text-sm">Brands Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">5000+</div>
                <div className="text-gray-600 text-sm">Reviews Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">6</div>
                <div className="text-gray-600 text-sm">Months Testing</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Sort Section */}
      <section className="py-4 md:py-6 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 md:mb-6">
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
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
                      <Button 
                        asChild 
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex-1 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold min-h-[48px]"
                      >
                        <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4">
                          <span className="flex items-center">🛒 Buy on Amazon</span>
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                            Free Shipping
                          </span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </Button>
                      <Button 
                        onClick={() => handleComparisonToggle(product)}
                        variant="outline" 
                        size="lg"
                        className={`border-2 border-green-700 hover:bg-green-50 transition-all duration-200 ${
                          selectedForComparison.find(p => p.id === product.id)
                            ? 'bg-green-50 text-green-800 border-green-800'
                            : 'text-green-700'
                        }`}
                        disabled={!selectedForComparison.find(p => p.id === product.id) && selectedForComparison.length >= 4}
                      >
                        {selectedForComparison.find(p => p.id === product.id) ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Added to Compare
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Compare
                          </>
                        )}
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
                className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-3 text-lg"
              >
                <Link to="/research">See Research Data</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Widget */}
      <ComparisonWidget
        selectedProducts={selectedForComparison}
        onRemoveProduct={handleRemoveFromComparison}
        onClearAll={handleClearComparison}
        onCompare={handleCompare}
        isVisible={selectedForComparison.length > 0}
      />
    </div>
  )
}

