import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Calculator,
  Wine,
  Clock,
  Activity,
  TrendingUp,
  ArrowRight,
  Zap,
  Brain,
  Heart,
  Users
} from 'lucide-react'

const RelatedCalculators = ({ currentCalculator = 'dhm-dosage' }) => {
  const calculators = [
    {
      id: 'alcohol-units',
      title: 'Alcohol Unit Converter',
      description: 'Convert between different types of alcoholic drinks',
      icon: Wine,
      color: 'purple',
      badge: 'Most Used',
      stats: '12k+ calculations',
      link: '/alcohol-unit-converter'
    },
    {
      id: 'bac-calculator',
      title: 'BAC Calculator',
      description: 'Estimate your blood alcohol content over time',
      icon: Activity,
      color: 'red',
      badge: 'Accurate',
      stats: '8k+ users',
      link: '/bac-calculator'
    },
    {
      id: 'hangover-predictor',
      title: 'Hangover Risk Predictor',
      description: 'Calculate your hangover risk based on multiple factors',
      icon: Brain,
      color: 'orange',
      badge: 'AI-Powered',
      stats: '15k+ predictions',
      link: '/hangover-predictor'
    },
    {
      id: 'recovery-timeline',
      title: 'Recovery Timeline',
      description: 'See when you\'ll feel better after drinking',
      icon: Clock,
      color: 'green',
      badge: 'New',
      stats: '5k+ timelines',
      link: '/recovery-timeline'
    },
    {
      id: 'supplement-stack',
      title: 'Supplement Stack Builder',
      description: 'Build your complete hangover prevention stack',
      icon: Heart,
      color: 'pink',
      badge: 'Advanced',
      stats: '3k+ stacks',
      link: '/supplement-stack-builder'
    },
    {
      id: 'party-planner',
      title: 'Smart Party Planner',
      description: 'Plan your drinking schedule for optimal enjoyment',
      icon: Zap,
      color: 'yellow',
      badge: 'Popular',
      stats: '7k+ plans',
      link: '/party-planner'
    }
  ]

  // Filter out current calculator
  const relatedCalculators = calculators.filter(calc => calc.id !== currentCalculator)
    .slice(0, 3) // Show top 3

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-blue-100 text-blue-800">
          <Calculator className="w-3 h-3 mr-1" />
          Related Tools
        </Badge>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Try Our Other Calculators
        </h2>
        <p className="text-gray-600">
          Get personalized recommendations with our suite of health tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedCalculators.map((calculator, index) => {
          const Icon = calculator.icon
          const colorClasses = {
            purple: 'from-purple-600 to-purple-700',
            red: 'from-red-600 to-red-700',
            orange: 'from-orange-600 to-orange-700',
            green: 'from-green-600 to-green-700',
            pink: 'from-pink-600 to-pink-700',
            yellow: 'from-yellow-600 to-yellow-700'
          }

          return (
            <motion.div
              key={calculator.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[calculator.color]} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {calculator.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-700 transition-colors">
                    {calculator.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {calculator.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {calculator.stats}
                    </div>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Try it</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <TrendingUp className="w-5 h-5" />
          <span>View All Calculators</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </section>
  )
}

export default RelatedCalculators