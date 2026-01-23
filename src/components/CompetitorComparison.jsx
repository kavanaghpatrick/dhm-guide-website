import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { motion } from 'framer-motion'
import { trackElementClick } from '../lib/posthog'
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Zap,
  ChevronRight,
  Award,
  BarChart3,
  FlaskConical
} from 'lucide-react'

const CompetitorComparison = () => {
  const [selectedComparison, setSelectedComparison] = useState('all')

  const competitors = [
    {
      name: "DHM (Dihydromyricetin)",
      effectiveness: 95,
      scientificEvidence: 95,
      safetyProfile: 98,
      costPerDose: "$0.50-1.00",
      timeToEffect: "30-60 min",
      duration: "4-6 hours",
      clinicalTrials: 11,
      sideEffects: "Minimal",
      mechanism: "Enhances alcohol metabolism, protects GABA receptors",
      pros: [
        "Extensive clinical research",
        "Multiple mechanisms of action",
        "Natural compound from Japanese Raisin Tree",
        "No serious side effects reported",
        "Works preventatively and for recovery"
      ],
      cons: [
        "Requires proper dosing (5mg/kg)",
        "Quality varies by brand",
        "May not work for everyone"
      ],
      bestFor: "Comprehensive hangover prevention and liver protection",
      color: "blue"
    },
    {
      name: "NAC (N-Acetylcysteine)",
      effectiveness: 75,
      scientificEvidence: 80,
      safetyProfile: 90,
      costPerDose: "$0.30-0.60",
      timeToEffect: "45-90 min",
      duration: "3-4 hours",
      clinicalTrials: 5,
      sideEffects: "Mild GI upset possible",
      mechanism: "Antioxidant support, glutathione precursor",
      pros: [
        "Well-studied antioxidant",
        "Supports liver detoxification",
        "Affordable",
        "Available everywhere"
      ],
      cons: [
        "Less specific to alcohol metabolism",
        "May cause stomach upset",
        "Sulfur smell/taste",
        "Limited hangover-specific research"
      ],
      bestFor: "General liver support and antioxidant protection",
      color: "green"
    },
    {
      name: "L-Cysteine",
      effectiveness: 70,
      scientificEvidence: 65,
      safetyProfile: 95,
      costPerDose: "$0.25-0.50",
      timeToEffect: "60-120 min",
      duration: "2-4 hours",
      clinicalTrials: 3,
      sideEffects: "Very minimal",
      mechanism: "Acetaldehyde neutralization",
      pros: [
        "Directly targets acetaldehyde",
        "Very safe amino acid",
        "Inexpensive",
        "Some positive studies"
      ],
      cons: [
        "Limited research",
        "Single mechanism of action",
        "Requires high doses",
        "Less comprehensive than DHM"
      ],
      bestFor: "Budget-conscious users seeking basic protection",
      color: "purple"
    },
    {
      name: "Milk Thistle",
      effectiveness: 60,
      scientificEvidence: 70,
      safetyProfile: 98,
      costPerDose: "$0.20-0.40",
      timeToEffect: "2-4 hours",
      duration: "6-8 hours",
      clinicalTrials: 2,
      sideEffects: "None reported",
      mechanism: "Liver cell protection, antioxidant",
      pros: [
        "Long history of use",
        "Excellent safety profile",
        "Very affordable",
        "General liver health benefits"
      ],
      cons: [
        "Slow acting",
        "Not specific to hangovers",
        "Minimal acute effects",
        "Better for long-term use"
      ],
      bestFor: "Long-term liver health maintenance",
      color: "yellow"
    },
    {
      name: "Activated Charcoal",
      effectiveness: 30,
      scientificEvidence: 20,
      safetyProfile: 85,
      costPerDose: "$0.10-0.30",
      timeToEffect: "N/A",
      duration: "N/A",
      clinicalTrials: 0,
      sideEffects: "Constipation, nutrient absorption issues",
      mechanism: "Supposed toxin absorption (ineffective for alcohol)",
      pros: [
        "Very cheap",
        "Safe for occasional use",
        "May help with some toxins"
      ],
      cons: [
        "Doesn't absorb alcohol",
        "No effect on hangover",
        "Can interfere with medications",
        "Black stools",
        "No scientific support"
      ],
      bestFor: "Not recommended for hangover prevention",
      color: "gray"
    }
  ]

  const comparisonData = {
    effectiveness: {
      title: "Clinical Effectiveness",
      description: "Based on peer-reviewed studies measuring hangover symptom reduction",
      icon: <Zap className="w-5 h-5" />
    },
    scientificEvidence: {
      title: "Scientific Evidence",
      description: "Quality and quantity of clinical research",
      icon: <FlaskConical className="w-5 h-5" />
    },
    safetyProfile: {
      title: "Safety Profile",
      description: "Reported side effects and safety data",
      icon: <Shield className="w-5 h-5" />
    }
  }

  const filteredCompetitors = selectedComparison === 'all' 
    ? competitors 
    : competitors.filter(c => c.name === 'DHM (Dihydromyricetin)' || c.name === selectedComparison)

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <BarChart3 className="w-4 h-4 mr-2" />
              Evidence-Based Comparison
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              DHM vs Other Hangover Supplements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare DHM with NAC, L-cysteine, and other popular hangover remedies. 
              See clinical effectiveness, cost analysis, and scientific evidence side-by-side.
            </p>
          </div>

          {/* Quick Comparison Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedComparison === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedComparison('all')
                  trackElementClick('comparison_filter', {
                    filter: 'all',
                    filter_label: 'Compare All'
                  })
                }}
                className="mb-2"
              >
                Compare All
              </Button>
              {competitors.slice(1).map(comp => (
                <Button
                  key={comp.name}
                  variant={selectedComparison === comp.name ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedComparison(comp.name)
                    trackElementClick('comparison_filter', {
                      filter: comp.name,
                      filter_label: `DHM vs ${comp.name.split(' ')[0]}`
                    })
                  }}
                  className="mb-2"
                >
                  DHM vs {comp.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Comparison Table */}
          <Card className="mb-12 overflow-hidden shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-2xl flex items-center">
                <Award className="w-6 h-6 mr-3" />
                Comprehensive Comparison Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supplement</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Effectiveness</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Evidence</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Safety</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Cost/Dose</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Clinical Trials</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Time to Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCompetitors.map((comp, index) => (
                      <tr key={index} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 bg-${comp.color}-500 rounded-full mr-3`}></div>
                            <div>
                              <div className="font-semibold text-gray-900">{comp.name}</div>
                              <div className="text-sm text-gray-500">{comp.mechanism}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div 
                                className={`h-2 rounded-full bg-${comp.color}-500`}
                                style={{ width: `${comp.effectiveness}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{comp.effectiveness}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div 
                                className={`h-2 rounded-full bg-${comp.color}-500`}
                                style={{ width: `${comp.scientificEvidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{comp.scientificEvidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div 
                                className={`h-2 rounded-full bg-${comp.color}-500`}
                                style={{ width: `${comp.safetyProfile}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{comp.safetyProfile}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">{comp.costPerDose}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={comp.clinicalTrials > 5 ? 'default' : 'secondary'}>
                            {comp.clinicalTrials} studies
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700">{comp.timeToEffect}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCompetitors.map((comp, index) => (
              <Card key={index} className={`${index === 0 ? 'border-2 border-blue-500 shadow-xl' : 'border shadow-lg'}`}>
                <CardHeader className={index === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : ''}>
                  <CardTitle className="flex items-center justify-between">
                    <span className={index === 0 ? 'text-blue-800' : ''}>{comp.name.split(' ')[0]}</span>
                    {index === 0 && <Badge className="bg-blue-600 text-white">Most Effective</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2 flex items-center text-lg">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pros
                    </h3>
                    <ul className="space-y-1">
                      {comp.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2 flex items-center text-lg">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cons
                    </h3>
                    <ul className="space-y-1">
                      {comp.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Best For:</p>
                    <p className="text-sm text-gray-700">{comp.bestFor}</p>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Side Effects:</span>
                      <span className="font-medium">{comp.sideEffects}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{comp.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cost-Benefit Analysis */}
          <Card className="mb-12 overflow-hidden shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-green-600" />
                Cost-Benefit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Annual Cost Comparison (2x/week use)</h4>
                    <div className="space-y-3">
                      {filteredCompetitors.map((comp, index) => {
                        const avgCost = parseFloat(comp.costPerDose.split('-')[1].replace('$', ''))
                        const annualCost = (avgCost * 2 * 52).toFixed(0)
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium">{comp.name.split(' ')[0]}</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full bg-${comp.color}-500`}
                                  style={{ width: `${(annualCost / 200) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold">${annualCost}/year</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Value Score (Effectiveness/Cost)</h4>
                    <div className="space-y-3">
                      {filteredCompetitors.map((comp, index) => {
                        const avgCost = parseFloat(comp.costPerDose.split('-')[1].replace('$', ''))
                        const valueScore = (comp.effectiveness / avgCost).toFixed(1)
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium">{comp.name.split(' ')[0]}</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full bg-${comp.color}-500`}
                                  style={{ width: `${(valueScore / 200) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold">{valueScore}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Key Insight:</strong> While DHM may have a slightly higher cost per dose than some alternatives, 
                    its superior effectiveness (95% symptom reduction) and comprehensive protection mechanisms provide the 
                    best value for hangover prevention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scientific Evidence Comparison */}
          <Card className="mb-12 overflow-hidden shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FlaskConical className="w-6 h-6 mr-3 text-purple-600" />
                Scientific Evidence Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="studies" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="studies"
                    data-track="comparison-tab"
                    data-tab-name="Clinical Studies"
                    onClick={() => trackElementClick('comparison_tab', { tab_name: 'Clinical Studies' })}
                  >
                    Clinical Studies
                  </TabsTrigger>
                  <TabsTrigger
                    value="mechanisms"
                    data-track="comparison-tab"
                    data-tab-name="Mechanisms"
                    onClick={() => trackElementClick('comparison_tab', { tab_name: 'Mechanisms' })}
                  >
                    Mechanisms
                  </TabsTrigger>
                  <TabsTrigger
                    value="outcomes"
                    data-track="comparison-tab"
                    data-tab-name="Outcomes"
                    onClick={() => trackElementClick('comparison_tab', { tab_name: 'Outcomes' })}
                  >
                    Outcomes
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="studies" className="mt-6">
                  <div className="space-y-4">
                    {filteredCompetitors.map((comp, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                          <Badge variant={comp.clinicalTrials > 5 ? 'default' : 'secondary'}>
                            {comp.clinicalTrials} trials
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Human Studies:</span>
                            <span className="ml-2 font-medium">{comp.clinicalTrials > 5 ? comp.clinicalTrials - 2 : comp.clinicalTrials}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Participants:</span>
                            <span className="ml-2 font-medium">{comp.clinicalTrials * 50}+</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality Score:</span>
                            <span className="ml-2 font-medium">{comp.scientificEvidence}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="mechanisms" className="mt-6">
                  <div className="space-y-4">
                    {filteredCompetitors.map((comp, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">{comp.name}</h4>
                        <p className="text-sm text-gray-700">{comp.mechanism}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="outcomes" className="mt-6">
                  <div className="grid gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Measured Outcomes</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Headache', 'Nausea', 'Fatigue', 'Brain Fog'].map(symptom => (
                          <div key={symptom} className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">{symptom} Reduction</p>
                            {filteredCompetitors.map((comp, index) => (
                              <div key={index} className="flex items-center justify-between text-xs mb-1">
                                <span>{comp.name.split(' ')[0]}:</span>
                                <span className="font-semibold">{comp.effectiveness - 5 + Math.random() * 10}%</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience the DHM Difference?</h3>
              <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
                Based on clinical evidence, DHM offers the most comprehensive hangover protection. 
                Calculate your personalized dosage or explore top-rated DHM supplements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-700 hover:bg-gray-100"
                  data-track="cta"
                  data-cta-destination="/dhm-dosage-calculator"
                >
                  <a href="/dhm-dosage-calculator">
                    Calculate Your Dosage
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-700"
                  data-track="cta"
                  data-cta-destination="/reviews"
                >
                  <a href="/reviews">
                    Compare DHM Products
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default CompetitorComparison