import React, { useState, useEffect } from 'react'
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
  ExternalLink,
  X,
  Plus,
  Crown,
  Target,
  BarChart3,
  Microscope,
  Clock,
  Package,
  Truck,
  RefreshCw,
  ShoppingCart
} from 'lucide-react'

export default function Compare() {
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showAll, setShowAll] = useState(false)

  // Product data - same as Reviews page but with additional comparison fields
  const allProducts = [
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
      // Additional comparison fields
      dhmPerDollar: 37.0, // mg per dollar
      additionalIngredients: ["L-Cysteine 200mg", "Milk Thistle", "Prickly Pear", "B-Complex", "Electrolytes"],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: "Prime 1-2 days",
      manufacturingLocation: "USA",
      certifications: ["GMP", "FDA Registered"],
      bestForUseCase: "Premium effectiveness",
      valueScore: 8.5,
      effectivenessScore: 9.5,
      safetyScore: 9.0,
      customerSatisfaction: 4.3,
      monthlyBuyers: "1K+",
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
      // Additional comparison fields
      dhmPerDollar: 50.6,
      additionalIngredients: ["Electrolytes", "Essential Minerals"],
      thirdPartyTested: true,
      moneyBackGuarantee: false,
      shippingSpeed: "Prime 1-2 days",
      manufacturingLocation: "USA",
      certifications: ["Third-party tested"],
      bestForUseCase: "Budget-conscious users",
      valueScore: 9.8,
      effectivenessScore: 9.0,
      safetyScore: 8.5,
      customerSatisfaction: 4.4,
      monthlyBuyers: "2K+",
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
      affiliateLink: "https://amzn.to/4ejE4uq",
      // Additional comparison fields
      dhmPerDollar: 12.0,
      additionalIngredients: ["Red Duanwood Reishi", "Milk Thistle (80% Silymarin)"],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: "Prime 1-2 days",
      manufacturingLocation: "USA",
      certifications: ["GMP", "Third-party tested"],
      bestForUseCase: "Comprehensive liver support",
      valueScore: 9.0,
      effectivenessScore: 8.5,
      safetyScore: 9.2,
      customerSatisfaction: 4.3,
      monthlyBuyers: "500+",
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
      // Additional comparison fields
      dhmPerDollar: 50.1,
      additionalIngredients: [],
      thirdPartyTested: true,
      moneyBackGuarantee: false,
      shippingSpeed: "Standard 3-5 days",
      manufacturingLocation: "USA",
      certifications: ["FDA Registered"],
      bestForUseCase: "Maximum DHM potency",
      valueScore: 9.5,
      effectivenessScore: 8.8,
      safetyScore: 8.0,
      customerSatisfaction: 4.2,
      monthlyBuyers: "100+",
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
      // Additional comparison fields
      dhmPerDollar: 8.6, // Estimated based on "most DHM per dose"
      additionalIngredients: ["L-Cysteine", "Prickly Pear", "B-Vitamins", "Ginger", "Vine Tea"],
      thirdPartyTested: false,
      moneyBackGuarantee: true,
      shippingSpeed: "Prime 1-2 days",
      manufacturingLocation: "USA",
      certifications: ["Academic research backing"],
      bestForUseCase: "Maximum DHM content",
      valueScore: 6.5,
      effectivenessScore: 8.8,
      safetyScore: 8.2,
      customerSatisfaction: 3.9,
      monthlyBuyers: "Variable",
      category: "premium"
    }
  ]

  // Auto-select top 3 products by default or from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const productIds = urlParams.get('products')
    
    if (productIds) {
      // Pre-select products from URL parameters
      const ids = productIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      const validIds = ids.filter(id => allProducts.find(p => p.id === id))
      setSelectedProducts(validIds)
    } else {
      // Default to top 3 products
      const topThree = allProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(p => p.id)
      setSelectedProducts(topThree)
    }
  }, [])

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else if (prev.length < 4) { // Limit to 4 products for comparison
        return [...prev, productId]
      }
      return prev
    })
  }

  const selectedProductsData = allProducts.filter(p => selectedProducts.includes(p.id))
  const availableProducts = allProducts.filter(p => !selectedProducts.includes(p.id))

  const getWinner = (field) => {
    if (selectedProductsData.length === 0) return null
    
    switch (field) {
      case 'value':
        return selectedProductsData.reduce((prev, current) => 
          prev.valueScore > current.valueScore ? prev : current
        )
      case 'effectiveness':
        return selectedProductsData.reduce((prev, current) => 
          prev.effectivenessScore > current.effectivenessScore ? prev : current
        )
      case 'dhm':
        return selectedProductsData.reduce((prev, current) => 
          parseInt(prev.dhm.replace(/[^\d]/g, '')) > parseInt(current.dhm.replace(/[^\d]/g, '')) ? prev : current
        )
      case 'reviews':
        return selectedProductsData.reduce((prev, current) => 
          prev.reviews > current.reviews ? prev : current
        )
      case 'rating':
        return selectedProductsData.reduce((prev, current) => 
          prev.rating > current.rating ? prev : current
        )
      case 'dhmPerDollar':
        return selectedProductsData.reduce((prev, current) => 
          prev.dhmPerDollar > current.dhmPerDollar ? prev : current
        )
      default:
        return null
    }
  }

  const getBadgeColor = (color) => {
    const colorMap = {
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800',
      'bg-green-500': 'bg-green-100 text-green-800',
      'bg-blue-500': 'bg-blue-100 text-blue-800',
      'bg-purple-500': 'bg-purple-100 text-purple-800',
      'bg-orange-500': 'bg-orange-100 text-orange-800'
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
              <BarChart3 className="w-4 h-4 mr-2" />
              Side-by-Side Comparison
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Compare DHM Supplements
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Make an informed decision with our comprehensive <span className="font-semibold text-green-700">side-by-side comparison</span> of 
              the top DHM supplements - analyze effectiveness, value, ingredients, and more.
            </p>

            {/* Quick Comparison Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">{selectedProductsData.length}</div>
                <div className="text-gray-600">Products Selected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">15+</div>
                <div className="text-gray-600">Comparison Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">Real-time</div>
                <div className="text-gray-600">Price Updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">Expert</div>
                <div className="text-gray-600">Analysis</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Selection Section */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Products to Compare</h2>
            <p className="text-gray-600 mb-6">Choose up to 4 DHM supplements for detailed comparison. Top 3 products are pre-selected.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedProducts.includes(product.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => handleProductToggle(product.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{product.rating}</span>
                        <span className="ml-2 text-sm font-bold text-green-700">{product.price}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedProducts.includes(product.id)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProducts.includes(product.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      {selectedProductsData.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Detailed Comparison</h2>
              
              {/* Comparison Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold">Comparison Factor</th>
                          {selectedProductsData.map((product) => (
                            <th key={product.id} className="px-6 py-4 text-center font-semibold min-w-[200px]">
                              <div className="flex flex-col items-center">
                                <div className="text-sm">{product.brand}</div>
                                <div className="text-lg font-bold">{product.name.split(' ').slice(0, 3).join(' ')}</div>
                                <Badge className={`mt-2 ${getBadgeColor(product.badgeColor)}`}>
                                  {product.badge}
                                </Badge>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Overall Score */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Award className="w-5 h-5 mr-2 text-yellow-500" />
                              Overall Score
                            </div>
                          </td>
                          {selectedProductsData.map((product) => {
                            const isWinner = getWinner('effectiveness')?.id === product.id
                            return (
                              <td key={product.id} className="px-6 py-4 text-center">
                                <div className={`text-2xl font-bold ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                  {product.score}/10
                                  {isWinner && <Crown className="w-5 h-5 inline ml-2 text-yellow-500" />}
                                </div>
                              </td>
                            )
                          })}
                        </tr>

                        {/* Price */}
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                              Price
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-green-700">{product.price}</div>
                              <div className="text-sm text-gray-600">{product.pricePerServing} per serving</div>
                            </td>
                          ))}
                        </tr>

                        {/* DHM Content */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Microscope className="w-5 h-5 mr-2 text-blue-500" />
                              DHM Content
                            </div>
                          </td>
                          {selectedProductsData.map((product) => {
                            const isWinner = getWinner('dhm')?.id === product.id
                            return (
                              <td key={product.id} className="px-6 py-4 text-center">
                                <div className={`text-lg font-bold ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                  {product.dhm}
                                  {isWinner && <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">{product.purity} purity</div>
                              </td>
                            )
                          })}
                        </tr>

                        {/* Value (DHM per Dollar) */}
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Target className="w-5 h-5 mr-2 text-purple-500" />
                              Value (mg DHM per $)
                            </div>
                          </td>
                          {selectedProductsData.map((product) => {
                            const isWinner = getWinner('dhmPerDollar')?.id === product.id
                            return (
                              <td key={product.id} className="px-6 py-4 text-center">
                                <div className={`text-lg font-bold ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                  {product.dhmPerDollar.toFixed(1)} mg/$
                                  {isWinner && <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">Best value indicator</div>
                              </td>
                            )
                          })}
                        </tr>

                        {/* Customer Rating */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Star className="w-5 h-5 mr-2 text-yellow-500" />
                              Customer Rating
                            </div>
                          </td>
                          {selectedProductsData.map((product) => {
                            const isWinner = getWinner('rating')?.id === product.id
                            return (
                              <td key={product.id} className="px-6 py-4 text-center">
                                <div className={`flex items-center justify-center ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-lg font-bold">{product.rating}</span>
                                  {isWinner && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">({product.reviews} reviews)</div>
                              </td>
                            )
                          })}
                        </tr>

                        {/* Servings */}
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Package className="w-5 h-5 mr-2 text-indigo-500" />
                              Servings per Container
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <div className="text-lg font-bold text-gray-700">{product.servings}</div>
                              <div className="text-sm text-gray-600">servings</div>
                            </td>
                          ))}
                        </tr>

                        {/* Third-Party Testing */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Shield className="w-5 h-5 mr-2 text-green-500" />
                              Third-Party Tested
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              {product.thirdPartyTested ? (
                                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-6 h-6 text-red-500 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Money Back Guarantee */}
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <RefreshCw className="w-5 h-5 mr-2 text-blue-500" />
                              Money Back Guarantee
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              {product.moneyBackGuarantee ? (
                                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-6 h-6 text-red-500 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Shipping Speed */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Truck className="w-5 h-5 mr-2 text-orange-500" />
                              Shipping Speed
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <div className="text-sm font-medium text-gray-700">{product.shippingSpeed}</div>
                            </td>
                          ))}
                        </tr>

                        {/* Additional Ingredients */}
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Plus className="w-5 h-5 mr-2 text-purple-500" />
                              Additional Ingredients
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <div className="text-sm text-gray-700">
                                {product.additionalIngredients.length > 0 ? (
                                  <div className="space-y-1">
                                    {product.additionalIngredients.slice(0, 2).map((ingredient, idx) => (
                                      <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        {ingredient}
                                      </div>
                                    ))}
                                    {product.additionalIngredients.length > 2 && (
                                      <div className="text-xs text-gray-500">
                                        +{product.additionalIngredients.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">DHM only</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Best For */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Users className="w-5 h-5 mr-2 text-teal-500" />
                              Best For
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <div className="text-sm text-gray-700 font-medium">{product.bestForUseCase}</div>
                            </td>
                          ))}
                        </tr>

                        {/* Purchase Links */}
                        <tr className="bg-green-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center">
                              <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                              Purchase
                            </div>
                          </td>
                          {selectedProductsData.map((product) => (
                            <td key={product.id} className="px-6 py-4 text-center">
                              <Button 
                                asChild 
                                className="bg-green-700 hover:bg-green-800 text-white w-full min-h-[44px]"
                              >
                                <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3">
                                  <span>Buy on Amazon</span>
                                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                                    Free Shipping
                                  </span>
                                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                </a>
                              </Button>
                              <div className="text-xs text-gray-500 mt-2">
                                {product.monthlyBuyers} monthly buyers
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-6 p-4">
                    {selectedProductsData.map((product, index) => {
                      const isTopChoice = getWinner('effectiveness')?.id === product.id
                      const isBestValue = getWinner('dhmPerDollar')?.id === product.id
                      const isHighestRated = getWinner('rating')?.id === product.id
                      const isHighestDHM = getWinner('dhm')?.id === product.id
                      
                      return (
                        <Card key={product.id} className={`${isTopChoice ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-600">{product.brand}</div>
                                <CardTitle className="text-lg">{product.name}</CardTitle>
                              </div>
                              <Badge className={`${getBadgeColor(product.badgeColor)}`}>
                                {product.badge}
                              </Badge>
                            </div>
                            {isTopChoice && (
                              <div className="flex items-center text-green-700 text-sm font-medium">
                                <Crown className="w-4 h-4 mr-1" />
                                Top Choice
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Overall Score */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                <span className="font-medium">Overall Score</span>
                              </div>
                              <div className={`text-xl font-bold ${isTopChoice ? 'text-green-700' : 'text-gray-700'}`}>
                                {product.score}/10
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                                <span className="font-medium">Price</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-700">{product.price}</div>
                                <div className="text-sm text-gray-600">{product.pricePerServing} per serving</div>
                              </div>
                            </div>

                            {/* DHM Content */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Microscope className="w-5 h-5 mr-2 text-blue-500" />
                                <span className="font-medium">DHM Content</span>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${isHighestDHM ? 'text-green-700' : 'text-gray-700'}`}>
                                  {product.dhm}
                                  {isHighestDHM && <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">{product.purity} purity</div>
                              </div>
                            </div>

                            {/* Value */}
                            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-purple-500" />
                                <span className="font-medium">Value</span>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${isBestValue ? 'text-green-700' : 'text-gray-700'}`}>
                                  {product.dhmPerDollar.toFixed(1)} mg/$
                                  {isBestValue && <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">Best value indicator</div>
                              </div>
                            </div>

                            {/* Customer Rating */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                <span className="font-medium">Customer Rating</span>
                              </div>
                              <div className="text-right">
                                <div className={`flex items-center justify-end ${isHighestRated ? 'text-green-700' : 'text-gray-700'}`}>
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-lg font-bold">{product.rating}</span>
                                  {isHighestRated && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600">({product.reviews} reviews)</div>
                              </div>
                            </div>

                            {/* Servings */}
                            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Servings</span>
                              </div>
                              <div className="text-lg font-bold text-gray-700">{product.servings}</div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <Shield className="w-5 h-5 mx-auto mb-1 text-green-500" />
                                <div className="text-xs font-medium">Third-Party Tested</div>
                                {product.thirdPartyTested ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500 mx-auto mt-1" />
                                )}
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <RefreshCw className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                                <div className="text-xs font-medium">Money Back</div>
                                {product.moneyBackGuarantee ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500 mx-auto mt-1" />
                                )}
                              </div>
                            </div>

                            {/* Shipping */}
                            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div className="flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-orange-500" />
                                <span className="font-medium">Shipping</span>
                              </div>
                              <div className="text-sm font-medium text-gray-700">{product.shippingSpeed}</div>
                            </div>

                            {/* Additional Ingredients */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Plus className="w-5 h-5 mr-2 text-purple-500" />
                                <span className="font-medium">Additional Ingredients</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {product.additionalIngredients.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {product.additionalIngredients.map((ingredient, idx) => (
                                      <span key={idx} className="bg-white px-2 py-1 rounded text-xs border">
                                        {ingredient}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">DHM only</span>
                                )}
                              </div>
                            </div>

                            {/* Best For */}
                            <div className="p-3 bg-white border rounded-lg">
                              <div className="flex items-center mb-2">
                                <Users className="w-5 h-5 mr-2 text-teal-500" />
                                <span className="font-medium">Best For</span>
                              </div>
                              <div className="text-sm text-gray-700">{product.bestForUseCase}</div>
                            </div>

                            {/* Purchase Button */}
                            <div className="pt-4">
                              <Button 
                                asChild 
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                              >
                                <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4">
                                  <span className="flex items-center">🛒 Buy on Amazon</span>
                                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                                    Free Shipping
                                  </span>
                                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                </a>
                              </Button>
                              <div className="text-xs text-gray-500 text-center mt-2">
                                {product.monthlyBuyers} monthly buyers
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Winner Summary Section */}
      {selectedProductsData.length > 1 && (
        <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                <Crown className="w-8 h-8 inline mr-3 text-yellow-400" />
                Category Winners
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 rounded-lg p-6">
                  <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Best Overall</h3>
                  <p className="text-lg">{getWinner('effectiveness')?.name}</p>
                  <p className="text-sm opacity-80">Highest effectiveness score</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Best Value</h3>
                  <p className="text-lg">{getWinner('dhmPerDollar')?.name}</p>
                  <p className="text-sm opacity-80">Most DHM per dollar</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Most Popular</h3>
                  <p className="text-lg">{getWinner('reviews')?.name}</p>
                  <p className="text-sm opacity-80">Most customer reviews</p>
                </div>
              </div>

              <div className="mt-12">
                <Button 
                  asChild
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg mr-4"
                >
                  <Link to="/reviews">
                    View Detailed Reviews
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline"
                  className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-3 text-lg"
                >
                  <Link to="/guide">Read Buying Guide</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Comparison FAQ
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about comparing DHM supplements
            </p>
          </motion.div>

          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">How do you calculate the overall scores?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our overall scores are calculated using a weighted formula that considers effectiveness (40%), 
                  value for money (25%), safety and quality (20%), and customer satisfaction (15%). Each factor 
                  is scored based on scientific research, third-party testing results, and verified customer reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">What does "DHM per dollar" mean?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This metric shows how many milligrams of DHM you get per dollar spent. It's calculated by 
                  dividing the total DHM content per container by the product price. Higher values indicate 
                  better value for money in terms of active ingredient content.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Why are some products more expensive?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Price differences reflect factors like DHM concentration, additional beneficial ingredients, 
                  manufacturing quality, third-party testing, brand reputation, and packaging. Premium products 
                  often include complementary ingredients like L-Cysteine, Milk Thistle, or B-vitamins.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">How often are prices and ratings updated?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We update prices and customer ratings weekly to ensure accuracy. However, Amazon prices can 
                  change frequently, so always check the current price on the product page before purchasing. 
                  Our affiliate links always redirect to the most current pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

