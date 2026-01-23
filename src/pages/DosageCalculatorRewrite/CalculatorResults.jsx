// DHM Calculator Results Component
// Agent 3 Implementation - Part 1

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, Wine, Moon, AlertCircle, Download, Share2 } from 'lucide-react'


export default function CalculatorResults({ results, onReset, onShare }) {
  if (!results) return null
  
  const isHighDose = results.preDrinking >= 500
  const totalDose = results.preDrinking + results.whileDrinking + results.beforeBed
  const isMaxDose = totalDose >= 1200

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Primary Result */}
      <Card className="border-primary hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">Your Recommended DHM Dosage</CardTitle>
          <CardDescription>Based on your personal factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className="text-3xl px-6 py-3 animate-pulse-glow">
              {results.preDrinking}mg
            </Badge>
            <p className="text-muted-foreground mt-2">
              Take 30-60 minutes before drinking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Three-Tier Protocol */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-4 h-4 text-green-600" />
              Pre-Drinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.preDrinking}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              30-60 min before first drink
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wine className="w-4 h-4 text-blue-600" />
              While Drinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.whileDrinking}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Every 2-3 drinks
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="w-4 h-4 text-purple-600" />
              Before Bed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xl">{results.beforeBed}mg</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              With a glass of water
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Dose Warning */}
      {isHighDose && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Dosage Notice:</strong> This is a higher dosage recommendation. 
            We suggest starting with 300mg and gradually increasing if needed. 
            Always consult with a healthcare provider for personalized advice.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Maximum Daily Dose Notice */}
      {isMaxDose && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Maximum Daily Dose:</strong> This recommendation totals {totalDose}mg, 
            which is our maximum recommended daily dose. Do not exceed this amount in a 
            24-hour period.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onReset}
          variant="outline"
          className="flex-1 touch-manipulation"
        >
          Calculate Again
        </Button>
        <Button 
          onClick={onShare}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white touch-manipulation"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </div>

      {/* Science Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> DHM protects your GABA-A receptors from alcohol 
            disruption and enhances alcohol-metabolizing enzymes (ADH and ALDH), reducing 
            acetaldehyde buildup by up to 70%.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}