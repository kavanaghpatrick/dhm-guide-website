import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { 
  X, 
  ChevronUp, 
  BarChart3,
  Star,
  ShoppingCart,
  ExternalLink
} from 'lucide-react'

export default function MobileComparisonWidget({ 
  selectedProducts = [], 
  onRemoveProduct, 
  onClearAll, 
  onCompare,
  isVisible = false 
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  if (!isVisible || selectedProducts.length === 0) {
    return null;
  }

  const getBestValue = () => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts.reduce((prev, current) => 
      parseFloat(prev.pricePerServing.replace('$', '')) < parseFloat(current.pricePerServing.replace('$', '')) ? prev : current
    );
  };

  const getHighestRated = () => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts.reduce((prev, current) => 
      prev.rating > current.rating ? prev : current
    );
  };

  const bestValue = getBestValue();
  const highestRated = getHighestRated();

  return (
    <AnimatePresence>
      <motion.div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none"
      >
        <motion.div
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          initial={{ y: '100%' }}
          animate={{ y: isMinimized ? 'calc(100% - 60px)' : 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-comparison pointer-events-auto"
          style={{ maxHeight: '70vh' }}
        >
          {/* Drag Handle */}
          <div 
            className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center cursor-grab active:cursor-grabbing touch-manipulation"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 border-b">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">
                Comparing {selectedProducts.length} Products
              </h3>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-3 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <ChevronUp 
                  className={`h-5 w-5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <button
                onClick={onClearAll}
                className="p-3 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close comparison"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              {/* Quick Stats */}
              {selectedProducts.length > 1 && (
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-green-600 font-medium">Best Value</div>
                    <div className="text-sm font-bold text-green-800 mt-1">
                      {bestValue?.brand}
                    </div>
                    <div className="text-xs text-green-600">{bestValue?.pricePerServing}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-yellow-600 font-medium">Highest Rated</div>
                    <div className="text-sm font-bold text-yellow-800 mt-1">
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
              <div className="p-4 space-y-3">
                {selectedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-gray-900 truncate">
                        {product.brand}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
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
                      className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={`Remove ${product.brand}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Sticky Bottom Actions */}
              <div className="sticky bottom-0 p-4 bg-white border-t">
                <Button
                  onClick={onCompare}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white touch-manipulation min-h-[44px]"
                  disabled={selectedProducts.length < 2}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Comparison
                </Button>
                
                {selectedProducts.length === 1 && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-3 border-green-600 text-green-600 hover:bg-green-50 touch-manipulation min-h-[44px]"
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
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}