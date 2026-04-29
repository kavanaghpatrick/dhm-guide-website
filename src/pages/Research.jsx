import React, { useState, useMemo } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { researchStudies as studies } from '../data/research-studies.js'
import { formatAPA } from '../utils/citationFormatter.js'
import {
  Microscope,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  ExternalLink,
  ArrowRight,
  Beaker,
  Brain,
  Heart,
  Shield,
  BarChart3,
  Award,
  CheckCircle,
  Clock,
  Filter,
  Copy,
  Check
} from 'lucide-react'

/**
 * Copy-to-clipboard button rendered per study card. Local "Copied!" feedback
 * lasts ~2s before reverting to "Copy APA Citation".
 *
 * Clipboard write is wrapped in try/catch — modern browsers (>97%) support
 * navigator.clipboard.writeText; on legacy/insecure-context browsers the call
 * rejects, we log a warning and the button visibly stays in idle state.
 */
function CopyAPAButton({ citation }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Clipboard write failed:', err)
    }
  }
  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="w-full border-blue-700 text-blue-700 hover:bg-blue-50"
      data-copy-apa="true"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" /> Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" /> Copy APA Citation
        </>
      )}
    </Button>
  )
}

export default function Research() {
  useSEO(generatePageSEO('research'));
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [showTimeline, setShowTimeline] = useState(false)

  const researchCategories = useMemo(() => [
    { id: 'all', label: 'All Studies', count: studies.length },
    { id: 'metabolism', label: 'Alcohol Metabolism', count: studies.filter(s => s.category === 'metabolism').length },
    { id: 'liver', label: 'Liver Protection', count: studies.filter(s => s.category === 'liver').length },
    { id: 'neuroprotection', label: 'Neuroprotection', count: studies.filter(s => s.category === 'neuroprotection').length }
  ], [])

  // Computed counters used in hero stats + RCT highlight section.
  // Single source of truth: studies array — adding study #26 auto-updates the page.
  const humanTrialCount = useMemo(
    () => studies.filter(s => s.type === 'Human Clinical Trial').length,
    []
  )
  const yearsOfResearch = useMemo(() => {
    const years = studies.map(s => s.year)
    return Math.max(...years) - Math.min(...years)
  }, [])
  
  const yearFilters = [
    { id: 'all', label: 'All Years' },
    { id: '2026', label: '2026' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: '2022', label: '2022' },
    { id: '2021', label: '2021' },
    { id: '2020', label: '2020' },
    { id: 'pre2020', label: 'Before 2020' }
  ]

  const keyFindings = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "70% Faster",
      subtitle: "alcohol clearance from system",
      study: "UCLA 2012"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "45% Reduction",
      subtitle: "in liver enzyme damage markers",
      study: "USC 2020"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "50% Less Fibrosis",
      subtitle: "in liver scarring markers",
      study: "Army Medical University 2021"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "60% Reduction",
      subtitle: "in liver toxicity markers",
      study: "Jilin University 2022"
    }
  ]

  const filteredStudies = useMemo(() => {
    let filtered = studies
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(study => study.category === selectedCategory)
    }
    
    if (selectedYear !== 'all') {
      if (selectedYear === 'pre2020') {
        filtered = filtered.filter(study => study.year < 2020)
      } else {
        filtered = filtered.filter(study => study.year === parseInt(selectedYear))
      }
    }
    
    return filtered
  }, [selectedCategory, selectedYear])
  
  // Timeline data for interactive display
  const timelineData = useMemo(() => {
    return studies
      .sort((a, b) => b.year - a.year)
      .map(study => ({
        year: study.year,
        title: study.title,
        type: study.type,
        category: study.category,
        institution: study.institution,
        keyFinding: study.keyResults[0],
        id: study.id
      }))
  }, [])

  const getTypeColor = (type) => {
    const colors = {
      'Human Clinical Trial': 'bg-green-100 text-green-800',
      'Preclinical Study': 'bg-blue-100 text-blue-800',
      'Safety Study': 'bg-purple-100 text-purple-800',
      'Mechanistic Study': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
              <Microscope className="w-4 h-4 mr-2" />
              Randomized Controlled Trial Database 2026
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Dihydromyricetin Randomized Controlled Trial Results: DHM for Hangovers
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Latest <span className="font-semibold text-green-700">2026 randomized controlled trials</span> prove dihydromyricetin (DHM) prevents hangovers. Review peer-reviewed <span className="font-semibold text-green-700">clinical studies and RCT data</span> on DHM for hangover prevention.
            </p>

            {/* Research Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">{studies.length}</div>
                <div className="text-gray-600">Key Studies Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">{humanTrialCount}</div>
                <div className="text-gray-600">Human Clinical Trials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">600+</div>
                <div className="text-gray-600">Trial Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">{yearsOfResearch}</div>
                <div className="text-gray-600">Years of Research</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2024 RCT Highlight Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              <Award className="w-4 h-4 mr-2" />
              Latest Research 2026
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Dihydromyricetin Randomized Controlled Trial Hangover Studies 2023-2026
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Recent <strong>randomized controlled trials</strong> provide the highest level of scientific evidence for DHM's effectiveness in hangover prevention. These studies follow rigorous protocols with control groups and placebo comparisons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center">
                    <Beaker className="w-5 h-5 mr-2" />
                    2026 RCT Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• <strong>{humanTrialCount} human clinical trials</strong> completed</li>
                    <li>• <strong>600+ participants</strong> across studies</li>
                    <li>• <strong>Randomized, double-blind design</strong></li>
                    <li>• <strong>Placebo-controlled protocols</strong></li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Key RCT Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• <strong>70% faster</strong> alcohol processing</li>
                    <li>• <strong>45% faster</strong> alcohol metabolism</li>
                    <li>• <strong>Significant liver protection</strong> markers</li>
                    <li>• <strong>No adverse effects</strong> reported</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Why Randomized Controlled Trials Matter for DHM Research
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Randomized controlled trials (RCTs)</strong> represent the gold standard for testing dihydromyricetin's effectiveness against hangovers. Unlike observational studies, RCTs eliminate bias through random assignment, control groups, and blinded protocols, providing definitive proof that <strong>DHM for hangovers</strong> works through direct causal mechanisms rather than correlation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Timeline Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200">
              <Clock className="w-4 h-4 mr-2" />
              Interactive Research Timeline
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              DHM Clinical Trials Timeline 2012-2026
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explore the progression of DHM research from initial discoveries to latest clinical trials
            </p>
            
            <Button
              onClick={() => setShowTimeline(!showTimeline)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Clock className="w-5 h-5 mr-2" />
              {showTimeline ? 'Hide Timeline' : 'View Interactive Timeline'}
            </Button>
          </motion.div>
          
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-200 via-purple-400 to-purple-600"></div>
                
                {/* Timeline items */}
                <div className="space-y-12">
                  {timelineData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className="w-1/2"></div>
                      <div className="relative">
                        <div className="w-8 h-8 bg-white border-4 border-purple-600 rounded-full z-10 relative"></div>
                      </div>
                      <div className="w-1/2 px-6">
                        <Card className="hover:shadow-lg transition-all duration-300 border-purple-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-800">
                                {item.year}
                              </Badge>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg text-gray-900">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {item.institution}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 inline-block mr-1 text-green-600" />
                              {item.keyFinding}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Key Findings Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Proven Clinical Results
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evidence-based benefits from randomized controlled trials and peer-reviewed studies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFindings.map((finding, index) => (
              <motion.div
                key={finding.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {finding.icon}
                    </div>
                    <CardTitle className="text-2xl text-green-800">{finding.title}</CardTitle>
                    <CardDescription className="text-green-700 font-medium">
                      {finding.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="outline" className="border-green-600 text-green-700">
                      {finding.study}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Categories and Filters */}
      <section className="py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Studies</h3>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {researchCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
            
            {/* Year Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {yearFilters.map((year) => (
                <button
                  key={year.id}
                  onClick={() => setSelectedYear(year.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedYear === year.id
                      ? 'bg-blue-700 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {year.label}
                </button>
              ))}
            </div>
            
            {/* Active Filter Count */}
            {(selectedCategory !== 'all' || selectedYear !== 'all') && (
              <div className="text-center mt-4">
                <Badge className="bg-gray-100 text-gray-700">
                  Showing {filteredStudies.length} of {studies.length} studies
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Studies Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {filteredStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getTypeColor(study.type)}>
                            {study.type}
                          </Badge>
                          <Badge variant="outline" className="border-blue-600 text-blue-700">
                            {study.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-gray-900 mb-2">{study.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {study.authors}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{study.journal}</span>
                          <span>•</span>
                          <span>{study.institution}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Participants</div>
                            <div className="font-medium">{study.participants}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Duration</div>
                            <div className="font-medium">{study.duration}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Study Details */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
                        <p className="text-gray-700 mb-4">{study.findings}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Results:</h5>
                            <ul className="space-y-1">
                              {study.keyResults.map((result, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{result}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Study Details:</h5>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Methodology:</span>
                                <p className="text-gray-700">{study.methodology}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Dosage:</span>
                                <p className="text-gray-700">{study.dosage}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Significance */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Significance</h4>
                        <div className="p-4 bg-blue-50 rounded-lg mb-4">
                          <p className="text-blue-700 text-sm">{study.significance}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full border-green-700 text-green-700 hover:bg-green-50"
                          >
                            <a
                              href={study.pubmedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Full PubMed Study
                            </a>
                          </Button>
                          <CopyAPAButton citation={formatAPA(study)} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Skip Your Next Hangover
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              With proven clinical results showing up to 70% faster alcohol recovery, 
              DHM supplements can help you wake up feeling amazing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
                data-track="cta"
                data-cta-text="Find Your Perfect Supplement"
                data-cta-destination="/reviews"
              >
                <Link to="/reviews">
                  Find Your Perfect Supplement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg"
                data-track="cta"
                data-cta-text="Get Started Today"
                data-cta-destination="/guide"
              >
                <Link to="/guide">Get Started Today</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

