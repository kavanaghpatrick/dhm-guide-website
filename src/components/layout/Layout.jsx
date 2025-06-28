import React, { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Menu, X, Leaf } from 'lucide-react'

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const currentPath = window.location.pathname

  // Navigation items
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Hangover Relief', href: '/guide' },
    { name: 'Best Supplements', href: '/reviews' },
    { name: 'Compare Solutions', href: '/compare' },
    { name: 'The Science', href: '/research' },
    { name: 'Recovery Tips', href: '/blog' },
    { name: 'About', href: '/about' }
  ]

  const isActive = (href) => {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
    setIsMenuOpen(false)
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-h-[40px]">
            {/* Logo */}
            <button onClick={() => handleNavigation('/')} className="flex items-center space-x-2 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center"
              >
                <Leaf className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent whitespace-nowrap">
                DHM Guide
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center max-w-4xl mx-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:block flex-shrink-0">
              <Button 
                onClick={() => handleNavigation('/guide')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 pb-4 border-t border-green-100 pt-4"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left min-h-[44px] ${
                      isActive(item.href)
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                <Button 
                  onClick={() => handleNavigation('/guide')}
                  className="mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  Get Started
                </Button>
              </div>
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DHM Guide</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Your comprehensive resource for understanding DHM (Dihydromyricetin) and its benefits for hangover prevention and liver health.
              </p>
              <p className="text-sm text-gray-400">
                © 2025 DHM Guide. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button onClick={() => handleNavigation(item.href)} className="hover:text-white transition-colors">
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => handleNavigation('/research')} className="hover:text-white transition-colors">Scientific Studies</button></li>
                <li><button onClick={() => handleNavigation('/reviews')} className="hover:text-white transition-colors">Product Reviews</button></li>
                <li><button onClick={() => handleNavigation('/guide')} className="hover:text-white transition-colors">Dosage Guide</button></li>
                <li><button onClick={() => handleNavigation('/about')} className="hover:text-white transition-colors">Safety Information</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

