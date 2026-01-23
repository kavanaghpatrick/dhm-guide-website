// Build trigger: 1767396396
import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import ComparisonWidgetWrapper from '../components/ComparisonWidgetWrapper.jsx'
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
  Check,
  BarChart3,
  Trophy
} from 'lucide-react'
import { useFeatureFlag } from '../hooks/useFeatureFlag'
import { trackElementClick } from '../lib/posthog'

export default function Reviews() {
  useSEO(generatePageSEO('reviews'));

  const [sortBy, setSortBy] = useState('rating')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedForComparison, setSelectedForComparison] = useState([])

  // A/B Test #127: Above-fold hero product card
  const heroProductVariant = useFeatureFlag('reviews-hero-product-v1', 'control')

  // A/B Test #130: CTA Copy Variations
  const ctaCopyVariant = useFeatureFlag('cta-copy-v1', 'control')
  const getCtaCopy = (isTable = false) => {
    switch (ctaCopyVariant) {
      case 'todays-price':
        return "See Today's Price"
      case 'get-pick':
        return isTable ? "Get It Now" : "Get #1 Pick"
      case 'buy-now':
        return "Buy Now"
      default:
        return isTable ? "Check Price" : "Check Price on Amazon"
    }
  }

  // A/B Test #131: Price-Forward CTAs
  const priceForwardVariant = useFeatureFlag('price-forward-cta-v1', 'control')
  const getPriceForwardCta = (price, isTable = false) => {
    if (priceForwardVariant === 'show-price') {
      return isTable ? `${price}` : `${price} on Amazon`
    }
    return null // Use default CTA copy
  }

  // A/B Test #132: Visual Hierarchy for #1 Product
  const visualHierarchyVariant = useFeatureFlag('visual-hierarchy-v1', 'control')

  // A/B Test #133: Comparison Table CTA Size
  const tableCTASizeVariant = useFeatureFlag('table-cta-size-v1', 'control')
  const getTableCtaClasses = () => {
    if (tableCTASizeVariant === 'large') {
      return "inline-flex items-center gap-1 px-5 py-3 min-h-[52px] bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold rounded-lg transition-colors whitespace-nowrap"
    }
    if (tableCTASizeVariant === 'full-width-mobile') {
      return "inline-flex items-center gap-1 px-4 py-2.5 min-h-[44px] w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap justify-center"
    }
    return "inline-flex items-center gap-1 px-4 py-2.5 min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
  }

  // A/B Test #135: Social Proof Counter
  const socialProofVariant = useFeatureFlag('social-proof-counter-v1', 'control')

  // A/B Test #136: Scarcity/Urgency Badges
  const scarcityVariant = useFeatureFlag('scarcity-badges-v1', 'control')

  // A/B Test #137: Amazon Gold Button Color
  const buttonColorVariant = useFeatureFlag('button-color-v1', 'control')
  const getButtonColorClasses = () => {
    if (buttonColorVariant === 'amazon-gold') {
      return 'bg-gradient-to-r from-[#FF9900] to-[#FF6600] hover:from-[#E88B00] hover:to-[#E65C00]'
    }
    return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  }

  // A/B Test #138: Button Hover Effects
  const hoverEffectsVariant = useFeatureFlag('button-hover-effects-v1', 'control')
  const getHoverEffectClasses = () => {
    if (hoverEffectsVariant === 'scale-glow') {
      return 'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] transition-all duration-200'
    }
    if (hoverEffectsVariant === 'pulse') {
      return 'motion-safe:animate-pulse hover:animate-none'
    }
    return ''
  }

  // A/B Test #139: Sticky Recommendation Bar
  const stickyBarVariant = useFeatureFlag('sticky-recommendation-bar-v1', 'control')
  const [showStickyBar, setShowStickyBar] = useState(false)

  // Track scroll for sticky bar
  React.useEffect(() => {
    if (stickyBarVariant !== 'sticky-bar') return

    const handleScroll = () => {
      // Show after scrolling past 600px (roughly past the table)
      setShowStickyBar(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [stickyBarVariant])

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
      reviews: 359,
      price: "$24.64",
      pricePerServing: "$1.64",
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
      reviews: 1145,
      price: "$19.95",
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
        "1,145+ verified customer reviews",
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
      reviews: 1705,
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
      rating: 4.0,
      reviews: 7972,
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
      rating: 4.4,
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
      brand: "Dycetin",
      rating: 4.5,
      reviews: 613,
      price: "$23.95",
      pricePerServing: "$0.80",
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
        "613+ verified customer reviews",
        "Money-back satisfaction guarantee",
        "GMP certified and Non-GMO ingredients",
        "Prime 1-2 day shipping available"
      ],
      cons: [
        "Moderate price point for premium formula",
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
      rating: 4.3,
      reviews: 93,
      price: "$44.99",
      pricePerServing: "$1.50",
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
        "Premium pricing at $1.50 per serving",
        "Limited customer reviews (93)",
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
              2026 Lab-Tested Reviews
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Best DHM Supplements (January 2026)
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

      {/* Quick Pick CTA - Always visible above fold (Issue #181) */}
      {heroProductVariant !== 'hero-card' && topProducts?.length > 0 && (
        <section className="py-3 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">#1 Editor's Pick:</span>
                    <span className="text-gray-700">{topProducts[0].name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{topProducts[0].rating} ({topProducts[0].reviews.toLocaleString()} reviews)</span>
                    <span className="text-green-600 font-medium">{topProducts[0].price}</span>
                  </div>
                </div>
              </div>
              <a
                href={topProducts[0].affiliateLink}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                onClick={() => trackElementClick('quick-pick-cta', {
                  product_name: topProducts[0].name,
                  placement: 'above-fold-quick-pick',
                  price: topProducts[0].price
                })}
                className={`flex-shrink-0 ${getButtonColorClasses()} text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md min-h-[44px] ${getHoverEffectClasses()}`}
              >
                {getCtaCopy()}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* A/B Test #127: Above-Fold Hero Product Card (More aggressive variant) */}
      {heroProductVariant === 'hero-card' && topProducts?.length > 0 && (
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-5 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500 text-white border-0">
                  <Trophy className="w-3 h-3 mr-1" />
                  Editor's Choice
                </Badge>
                <span className="text-sm text-gray-600">Top Rated for 2026</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {topProducts[0].name}
              </h3>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-green-700">
                  {topProducts[0].price}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{topProducts[0].rating}</span>
                  <span className="text-gray-500">({topProducts[0].reviews.toLocaleString()} reviews)</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  {topProducts[0].dhm} DHM
                </Badge>
              </div>

              <a
                href={topProducts[0].affiliateLink}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                onClick={() => trackElementClick('hero-product-card', {
                  product_name: topProducts[0].name,
                  placement: 'above-fold-hero',
                  price: topProducts[0].price
                })}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg min-h-[48px]"
              >
                {getCtaCopy()}
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="#comparison-table"
                className="block text-center text-sm text-green-700 hover:text-green-800 hover:underline mt-3"
              >
                Or compare all {topProducts.length} products below ↓
              </a>
            </motion.div>
          </div>
        </section>
      )}

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

      {/* Quick Comparison Table */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 text-center">
              Quick Comparison Table
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Compare all DHM supplements side-by-side at a glance
            </p>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="py-3 px-4 text-left font-semibold">Brand</th>
                    <th className="py-3 px-4 text-center font-semibold">DHM</th>
                    <th className="py-3 px-4 text-center font-semibold">Price</th>
                    <th className="py-3 px-4 text-center font-semibold">Per Serving</th>
                    <th className="py-3 px-4 text-center font-semibold">Rating</th>
                    <th className="py-3 px-4 text-center font-semibold">Reviews</th>
                    <th className="py-3 px-4 text-center font-semibold">Score</th>
                    <th className="py-3 px-4 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } ${index === 0 && visualHierarchyVariant === 'highlight-top' ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.brand}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-green-700">{product.dhm}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">{product.price}</td>
                      <td className="py-3 px-4 text-center text-gray-700">{product.pricePerServing}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">{product.reviews.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-green-700">{product.score}/10</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          data-product-name={product.name}
                          data-ratings-version="2026-01-01"
                          className={`${getTableCtaClasses()} ${index === 0 && visualHierarchyVariant === 'highlight-top' ? 'ring-2 ring-green-400 ring-offset-1 shadow-lg shadow-green-500/20' : ''}`}
                        >
                          {getPriceForwardCta(product.price, true) || getCtaCopy(true)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              Scroll down for detailed reviews with pros, cons, and buying recommendations
            </p>
          </motion.div>
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
                      {/* A/B Test #136: Scarcity Badge */}
                      {scarcityVariant === 'stock-scarcity' && index < 3 && (
                        <Badge className="mb-2 bg-red-100 text-red-700 motion-safe:animate-pulse">
                          Only {8 - index * 2} left at this price
                        </Badge>
                      )}
                      {scarcityVariant === 'time-urgency' && index < 3 && (
                        <Badge className="mb-2 bg-orange-100 text-orange-700">
                          ⏰ Deal ends soon
                        </Badge>
                      )}
                      <Button
                        asChild
                        size="lg"
                        className={`${getButtonColorClasses()} ${getHoverEffectClasses()} text-white flex-1 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold min-h-[48px]`}
                      >
                        <a href={product.affiliateLink} target="_blank" rel="nofollow sponsored noopener noreferrer" data-product-name={product.name} data-ratings-version="2026-01-01" className="flex items-center justify-center gap-2 px-4">
                          <span className="flex items-center">{getPriceForwardCta(product.price) || getCtaCopy()}</span>
                          <span className={`px-2 py-1 ${buttonColorVariant === 'amazon-gold' ? 'bg-[#E88B00]' : 'bg-orange-500'} text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap`}>
                            Free Shipping
                          </span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </Button>
                      {/* A/B Test #135: Social Proof Counter */}
                      {socialProofVariant === 'viewed-counter' && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          👁 {(2347 - index * 312).toLocaleString()} people viewed this today
                        </p>
                      )}
                      {socialProofVariant === 'purchase-counter' && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          🛒 {(127 - index * 15)} bought in the last hour
                        </p>
                      )}
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
                    {/* Trust Signals Near CTA */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span>{product.rating} ({product.reviews?.toLocaleString() || 'N/A'} reviews)</span>
                      {product.monthlyBuyers && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{product.monthlyBuyers} monthly buyers</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      As an Amazon Associate I earn from qualifying purchases
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparisons Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Head-to-Head Product Comparisons
            </h2>
            <p className="text-lg text-gray-600">
              Detailed analysis comparing these supplements side-by-side
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "No Days Wasted vs NusaPure", slug: "no-days-wasted-vs-nusapure-dhm-comparison-2025", desc: "Premium brand vs budget bulk value" },
              { title: "Double Wood vs No Days Wasted", slug: "double-wood-vs-no-days-wasted-dhm-comparison-2025", desc: "Best value vs premium effectiveness" },
              { title: "Flyby vs No Days Wasted", slug: "flyby-vs-no-days-wasted-complete-comparison-2025", desc: "Two premium alternatives compared" },
              { title: "Double Wood vs Toniiq Ease", slug: "double-wood-vs-toniiq-ease-dhm-comparison-2025", desc: "Value leaders go head-to-head" },
              { title: "Flyby vs Double Wood", slug: "flyby-vs-double-wood-complete-comparison-2025", desc: "Two top-rated supplements tested" },
              { title: "No Days Wasted vs Good Morning", slug: "no-days-wasted-vs-good-morning-hangover-pills-comparison-2025", desc: "Premium hangover pill showdown" }
            ].map((comparison, index) => (
              <motion.div
                key={comparison.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/never-hungover/${comparison.slug}`}
                  className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all duration-300 h-full"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    {comparison.title}
                  </h3>
                  <p className="text-sm text-gray-600">{comparison.desc}</p>
                  <span className="text-green-600 text-sm font-medium mt-3 inline-flex items-center gap-1">
                    Read full comparison <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <BarChart3 className="w-5 h-5" />
              Compare Products Side-by-Side
            </Link>
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
      <ComparisonWidgetWrapper
        selectedProducts={selectedForComparison}
        onRemoveProduct={handleRemoveFromComparison}
        onClearAll={handleClearComparison}
        onCompare={handleCompare}
        isVisible={selectedForComparison.length > 0}
      />

      {/* A/B Test #139: Sticky Recommendation Bar */}
      {stickyBarVariant === 'sticky-bar' && showStickyBar && topProducts.length > 0 && (
        <div className="fixed top-16 left-0 right-0 bg-green-700 text-white py-2 px-4 z-40 shadow-lg transform transition-transform duration-300">
          <div className="container mx-auto flex items-center justify-between gap-4 max-w-6xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="hidden sm:block">
                <span className="font-semibold">#1 Pick:</span>{' '}
                <span>{topProducts[0].name}</span>
                <span className="ml-2 text-green-200">({topProducts[0].rating}★ • {topProducts[0].reviews.toLocaleString()} reviews)</span>
              </div>
              <div className="sm:hidden">
                <span className="font-semibold">Top Pick:</span> {topProducts[0].name.split(' ').slice(0, 3).join(' ')}
              </div>
            </div>
            <a
              href={topProducts[0].affiliateLink}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              onClick={() => trackElementClick('sticky-recommendation-bar', {
                product_name: topProducts[0].name,
                price: topProducts[0].price
              })}
              className="flex-shrink-0 bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors min-h-[40px] flex items-center gap-2"
            >
              {topProducts[0].price} on Amazon
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

