import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  X, 
  BarChart3, 
  Star, 
  DollarSign, 
  ExternalLink,
  Crown,
  Zap,
  ShoppingCart
} from 'lucide-react'

export default function ComparisonWidget({ 
  selectedProducts = [], 
  onRemoveProduct, 
  onClearAll, 
  onCompare,
  isVisible = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand when products are added
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setIsExpanded(true)
    }
  }, [selectedProducts.length])

  if (!isVisible || selectedProducts.length === 0) {
    return null
  }

  const getBestValue = () => {
    if (selectedProducts.length === 0) return null
    return selectedProducts.reduce((prev, current) => 
      parseFloat(prev.pricePerServing.replace('$', '')) < parseFloat(current.pricePerServing.replace('$', '')) ? prev : current
    )
  }

  const getHighestRated = () => {
    if (selectedProducts.length === 0) return null
    return selectedProducts.reduce((prev, current) => 
      prev.rating > current.rating ? prev : current
    )
  }

  const bestValue = getBestValue()
  const highestRated = getHighestRated()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 z-comparison max-w-sm"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-green-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">Compare ({selectedProducts.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </button>
                <button
                  onClick={onClearAll}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {/* Quick Stats */}
                  {selectedProducts.length > 1 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-xs text-green-600 font-medium">Best Value</div>
                        <div className="text-sm font-bold text-green-800">
                          {bestValue?.brand}
                        </div>
                        <div className="text-xs text-green-600">{bestValue?.pricePerServing}</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <div className="text-xs text-yellow-600 font-medium">Highest Rated</div>
                        <div className="text-sm font-bold text-yellow-800">
                          {highestRated?.brand}
                        </div>
                        <div className="text-xs text-yellow-600 flex items-center justify-center">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {highestRated?.rating}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product List */}
                  <div className="space-y-2">
                    {selectedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.brand}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span className="font-bold text-green-700">{product.price}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {product.rating}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveProduct(product.id)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <Button
                      onClick={onCompare}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={selectedProducts.length < 2}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare {selectedProducts.length > 1 ? `${selectedProducts.length} Products` : 'Products'}
                    </Button>
                    
                    {selectedProducts.length === 1 && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <a
                          href={selectedProducts[0].affiliateLink}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Urgency Indicator */}
                  {selectedProducts.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-orange-50 border border-orange-200 rounded p-2 text-center"
                    >
                      <div className="flex items-center justify-center text-orange-600 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        <span className="font-medium">Limited Time: Free Shipping on All Products</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

