// Build trigger: 1767396396
import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import ComparisonWidgetWrapper from '../components/ComparisonWidgetWrapper.jsx'
import InlineComparisonTable from '../components/InlineComparisonTable.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { buildAffiliateUrl } from '../lib/utm-builder.js'
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
import { trackElementClick, trackEvent } from '../lib/posthog'
import topProductsData from '../data/topProducts.json'

export default function Reviews() {
  useSEO(generatePageSEO('reviews'));

  const [sortBy, setSortBy] = useState('rating')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedForComparison, setSelectedForComparison] = useState([])

  // Hero product: Always use control (quick pick bar) - hero-card was -77.7% conversion
  const heroProductVariant = 'control'

  // CTA Copy: Hardcoded after A/B tests concluded
  const getCtaCopy = (isTable = false) => isTable ? "Check Price" : "Check Price on Amazon"

  // Button Colors: Hardcoded to orange gradient (control)
  const buttonColorClasses = 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'

  // A/B Test #255: Scarcity badges - time urgency on product cards
  const scarcityVariant = useFeatureFlag('scarcity-badges-v1', 'control')

  // A/B Test #258: Make product card badges and trust signals clickable
  const clickableCardsVariant = useFeatureFlag('reviews-clickable-cards-v1', 'control')
  const isClickableCards = clickableCardsVariant === 'test'

  // A/B Test #139: Sticky Recommendation Bar - KEEPING this test
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

  // Single source of truth: shared with scripts/prerender-main-pages.js so
  // that ItemList schema on /reviews stays in sync with visible content.
  const topProducts = topProductsData

  // Issue #209: "Best For" quick-filter buttons. Each filter applies a
  // case-insensitive substring predicate to product.bestFor — see
  // specs/issue-209-best-for-buttons/research.md for the mapping rationale.
  const bestForFilters = [
    { id: 'all', label: 'All Products', match: null },
    { id: 'overall', label: 'Best Overall', match: (p) => /\b(best|trusted)\b/i.test(p.bestFor) },
    { id: 'value', label: 'Best Value', match: (p) => /value/i.test(p.bestFor) },
    { id: 'heavy', label: 'Heavy Drinkers', match: (p) => /(party|weekend|high-performer)/i.test(p.bestFor) },
    { id: 'health', label: 'Health-Conscious', match: (p) => /(health|liver)/i.test(p.bestFor) }
  ]

  const handleFilterClick = (id) => {
    // Toggle: clicking the active non-default button clears back to 'all'
    const next = (filterBy === id && id !== 'all') ? 'all' : id
    setFilterBy(next)
    trackEvent('filter_clicked', { filter_value: next })
  }

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price', label: 'Best Value' },
    { value: 'dhm', label: 'Highest DHM' },
    { value: 'reviews', label: 'Most Reviews' }
  ]

  const activeFilter = bestForFilters.find(f => f.id === filterBy)
  const filteredProducts = activeFilter?.match
    ? topProducts.filter(activeFilter.match)
    : topProducts

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
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

            {/* Quick Stats - Now visible on mobile (Issue #224) */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-700 mb-1">20+</div>
                <div className="text-gray-600 text-xs md:text-sm">Brands Tested</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-700 mb-1">5000+</div>
                <div className="text-gray-600 text-xs md:text-sm">Reviews Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-700 mb-1">6</div>
                <div className="text-gray-600 text-xs md:text-sm">Months Testing</div>
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
                href={buildAffiliateUrl(topProducts[0].affiliateLink, { componentId: 'reviews-herocard-cta-0' })}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                data-placement="hero"
                data-product-name={topProducts[0].name}
                data-component-id="reviews-herocard-cta-0"
                onClick={() => trackElementClick('quick-pick-cta', {
                  product_name: topProducts[0].name,
                  placement: 'above-fold-quick-pick',
                  price: topProducts[0].price
                })}
                className={`flex-shrink-0 ${buttonColorClasses} text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md min-h-[44px]`}
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
                href={buildAffiliateUrl(topProducts[0].affiliateLink, { componentId: 'reviews-herocard-fullcard-cta-0' })}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                data-placement="hero"
                data-product-name={topProducts[0].name}
                data-component-id="reviews-herocard-fullcard-cta-0"
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
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 mr-1">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Best For:</span>
              </div>
              {bestForFilters.map(f => {
                const active = filterBy === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFilterClick(f.id)}
                    aria-pressed={active}
                    data-filter-id={f.id}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      active
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm hover:bg-orange-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
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

      {/* Mobile-only: persistent #1-product CTA above the table (P1.5).
          Gated when the sticky-recommendation-bar A/B test variant flips on,
          to avoid two stacked sticky tops on mobile. */}
      {stickyBarVariant !== 'sticky-bar' && topProducts?.length > 0 && (
        <div className="md:hidden sticky top-16 z-30 bg-white border-b border-orange-200 shadow-sm px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">
                #1 {topProducts[0].brand}
              </div>
              <div className="text-xs text-gray-600">
                {topProducts[0].price} · ★{topProducts[0].rating}
              </div>
            </div>
          </div>
          <a
            href={buildAffiliateUrl(topProducts[0].affiliateLink, { componentId: 'reviews-mobile-sticky-top-cta' })}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            data-placement="mobile_sticky_top_reviews"
            data-product-name={topProducts[0].name}
            data-ratings-version="2026-01-01"
            data-component-id="reviews-mobile-sticky-top-cta"
            onClick={() => trackElementClick('reviews-mobile-sticky-top-cta-click', {
              product_name: topProducts[0].name,
              placement: 'mobile-sticky-table-top',
            })}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3 py-2 rounded-md min-h-[44px] flex items-center gap-1"
          >
            Check Price <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Quick Comparison Table - order-first on mobile to front-load above hero (Issue: mobile CR 2.9x desktop, but lower scroll depth) */}
      <section
        id="comparison-table"
        className="order-first md:order-none py-8 px-4 bg-gray-50 min-h-[520px] md:min-h-0"
      >
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

            <InlineComparisonTable variant="full" placement="comparison_table" mobilePillRowLimit={5} />

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
                data-track="product"
                data-product-name={product.name}
                data-product-position={index + 1}
              >
                <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          {isClickableCards ? (
                            <a
                              href={product.affiliateLink}
                              target="_blank"
                              rel="nofollow sponsored noopener noreferrer"
                              data-placement="product_card_badge"
                              data-product-name={product.name}
                              aria-label={`${product.badge} - ${product.name} on Amazon`}
                              className="inline-flex"
                            >
                              <Badge className={`${getBadgeColor(product.badgeColor)} hover:opacity-80 transition-opacity cursor-pointer`}>
                                {product.badge}
                              </Badge>
                            </a>
                          ) : (
                            <Badge className={getBadgeColor(product.badgeColor)}>
                              {product.badge}
                            </Badge>
                          )}
                          {/* A/B Test #255: scarcity-badges-v1 time-urgency variant */}
                          {scarcityVariant === 'time-urgency' && product.reviews > 100 && (
                            <span className="text-xs text-orange-600 font-medium">
                              {product.reviews > 500 ? `${Math.round(product.reviews / 10)}+ bought this month` : 'Selling fast'}
                            </span>
                          )}
                        </div>
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="block"
                          data-placement="product_card"
                          data-product-name={product.name}
                        >
                          <CardTitle className="text-2xl text-gray-900 mb-2 hover:text-green-700 hover:underline transition-colors">{product.name}</CardTitle>
                        </a>
                        <CardDescription className="text-lg text-gray-600">{product.brand}</CardDescription>

                        <div className="flex items-center space-x-4 mt-3">
                          <a
                            href={product.affiliateLink}
                            target="_blank"
                            rel="nofollow sponsored noopener noreferrer"
                            className="flex items-center space-x-1 hover:text-green-700 transition-colors"
                            data-placement="product_card"
                            data-product-name={product.name}
                          >
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium hover:underline">{product.rating}</span>
                            <span className="text-gray-500 hover:text-green-600">({product.reviews} reviews)</span>
                          </a>
                          <div className="text-sm text-gray-600">
                            Score: <span className="font-bold text-green-700">{product.score}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="block"
                          data-placement="product_card"
                          data-product-name={product.name}
                        >
                          <div className="text-3xl font-bold text-green-700 mb-1 hover:text-green-800 hover:underline transition-colors">{product.price}</div>
                        </a>
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
                              <Badge key={idx} variant="outline" className="text-xs cursor-default select-text" title="Ingredient">
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
                        
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="mt-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg block transition-colors group"
                          data-placement="product_card"
                          data-product-name={product.name}
                        >
                          <h5 className="font-medium text-blue-800 mb-2 group-hover:text-blue-900">Best For:</h5>
                          <p className="text-blue-700 text-sm group-hover:text-blue-800">{product.bestFor}</p>
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
                      <Button
                        asChild
                        size="lg"
                        className={`${buttonColorClasses} text-white flex-[2] shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold min-h-[48px]`}
                      >
                        <a
                          href={buildAffiliateUrl(product.affiliateLink, { componentId: `reviews-card-cta-${index}` })}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          data-placement="product_card"
                          data-product-name={product.name}
                          data-ratings-version="2026-01-01"
                          data-component-id={`reviews-card-cta-${index}`}
                          className="flex items-center justify-center gap-2 px-4"
                        >
                          <span className="flex items-center">{getCtaCopy()}</span>
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                            Free Shipping
                          </span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          handleComparisonToggle(product);
                          trackEvent?.('compare_toggle', {
                            product_id: product.id,
                            action: selectedForComparison.find(p => p.id === product.id) ? 'remove' : 'add'
                          });
                        }}
                        disabled={!selectedForComparison.find(p => p.id === product.id) && selectedForComparison.length >= 4}
                        className={`flex-1 sm:max-w-[160px] min-h-[44px] inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 hover:border-green-600 hover:bg-green-50 text-gray-700 hover:text-green-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedForComparison.find(p => p.id === product.id)
                            ? 'bg-green-50 text-green-700 border-green-600'
                            : ''
                        }`}
                      >
                        {selectedForComparison.find(p => p.id === product.id) ? (
                          <>
                            <Check className="w-3 h-3" />
                            Added to Compare
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Add to Compare
                          </>
                        )}
                      </button>
                    </div>
                    {/* Trust Signals Near CTA */}
                    {isClickableCards ? (
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        data-placement="product_card_trust"
                        data-product-name={product.name}
                        className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2 hover:text-green-700 transition-colors"
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span>{product.rating} ({product.reviews?.toLocaleString() || 'N/A'} reviews)</span>
                        {product.monthlyBuyers && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{product.monthlyBuyers} monthly buyers</span>
                          </>
                        )}
                      </a>
                    ) : (
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
                    )}
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
                data-track="cta"
                data-cta-text="Read Buying Guide"
                data-cta-destination="/guide"
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
                data-track="cta"
                data-cta-text="See Research Data"
                data-cta-destination="/research"
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
              href={buildAffiliateUrl(topProducts[0].affiliateLink, { componentId: 'reviews-sticky-recommendation-bar-cta' })}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              data-placement="sticky_bar"
              data-product-name={topProducts[0].name}
              data-component-id="reviews-sticky-recommendation-bar-cta"
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

