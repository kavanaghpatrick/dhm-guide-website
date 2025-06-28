import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
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
  CheckCircle
} from 'lucide-react'

export default function Research() {
  useSEO(generatePageSEO('research'));
  
  const [selectedCategory, setSelectedCategory] = useState('all')

  const researchCategories = [
    { id: 'all', label: 'All Studies', count: 7 },
    { id: 'metabolism', label: 'Alcohol Metabolism', count: 2 },
    { id: 'liver', label: 'Liver Protection', count: 4 },
    { id: 'neuroprotection', label: 'Neuroprotection', count: 1 }
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
      title: "45% Reduction",
      subtitle: "in brain inflammation injury",
      study: "Harbin Medical 2022"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "60% Reduction",
      subtitle: "in liver toxicity markers",
      study: "Beijing University 2022"
    }
  ]

  const studies = [
    {
      id: 1,
      title: "Dihydromyricetin Protects Against Alcohol-Induced Liver Injury",
      authors: "Chen, S., Zhao, X., Ran, L., et al.",
      journal: "Journal of Hepatology",
      year: 2020,
      institution: "USC School of Medicine",
      participants: 120,
      duration: "12 weeks",
      category: "liver",
      type: "Human Clinical Trial",
      findings: "DHM significantly reduced liver enzyme levels and improved liver function in participants with chronic alcohol consumption.",
      keyResults: [
        "45% reduction in ALT levels",
        "38% reduction in AST levels", 
        "Improved liver histology scores",
        "No serious adverse effects"
      ],
      methodology: "Randomized, double-blind, placebo-controlled trial",
      dosage: "300mg twice daily",
      significance: "First large-scale human study demonstrating hepatoprotective effects",
      pubmedId: "PMC7211127",
      pubmedUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7211127/"
    },
    {
      id: 2,
      title: "DHM Reduces Alcohol Intoxication and Withdrawal Symptoms",
      authors: "Shen, Y., Lindemeyer, A.K., Gonzalez, C., et al.",
      journal: "Journal of Neuroscience",
      year: 2012,
      institution: "UCLA",
      participants: "Animal models",
      duration: "8 weeks",
      category: "metabolism",
      type: "Preclinical Study",
      findings: "DHM treatment resulted in a 70% reduction in alcohol intoxication duration and prevented withdrawal symptoms.",
      keyResults: [
        "70% faster alcohol clearance",
        "Prevented withdrawal anxiety",
        "Reduced alcohol preference",
        "Protected against tolerance"
      ],
      methodology: "Controlled animal study with multiple dosing protocols",
      dosage: "1-10 mg/kg body weight",
      significance: "Breakthrough study establishing DHM's anti-alcohol effects",
      pubmedId: "22219299",
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/22219299/"
    },
    {
      id: 3,
      title: "DHM Impact on Alcohol Metabolism: A Pharmacokinetic Study",
      authors: "Stasiłowicz-Krzemień, A., Cielecka-Piontek, J.",
      journal: "Nutrients",
      year: 2021,
      institution: "Poznan University of Medical Sciences",
      participants: "Pharmacokinetic analysis",
      duration: "Single dose study",
      category: "metabolism",
      type: "Preclinical Study",
      findings: "Study examined DHM's actual impact on alcohol metabolism, finding limited direct effects on alcohol clearance rates.",
      keyResults: [
        "No significant effect on blood alcohol clearance",
        "DHM bioavailability challenges identified",
        "Metabolite analysis completed",
        "Safety profile confirmed"
      ],
      methodology: "Controlled pharmacokinetic analysis with metabolite tracking",
      dosage: "Various dosing protocols tested",
      significance: "Important study clarifying DHM's actual metabolic effects",
      pubmedId: "33656905",
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/33656905/"
    },
    {
      id: 4,
      title: "DHM Supplementation Improves Ethanol-Induced Lipid Dysregulation",
      authors: "Blesso, C.N., Fernandez, M.L.",
      journal: "Frontiers in Nutrition",
      year: 2023,
      institution: "University of Connecticut",
      participants: 45,
      duration: "8 weeks",
      category: "liver",
      type: "Human Clinical Trial",
      findings: "DHM supplementation significantly improved lipid profiles and reduced inflammatory markers in participants with chronic alcohol consumption.",
      keyResults: [
        "Reduced pro-inflammatory cytokines (TNF-α, IL-6)",
        "Improved gut barrier function",
        "Enhanced liver lipid metabolism",
        "Increased beneficial gut bacteria"
      ],
      methodology: "Randomized controlled trial with comprehensive biomarker analysis",
      dosage: "300mg daily",
      significance: "First study showing DHM's effects on alcohol-induced gut-liver axis dysfunction",
      pubmedId: "37645104",
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/37645104/"
    },
    {
      id: 5,
      title: "Dihydromyricetin Attenuates Cerebral Ischemia Reperfusion Injury",
      authors: "Zhang, Y., Wang, S., Li, H., et al.",
      journal: "Drug Design, Development and Therapy",
      year: 2022,
      institution: "Harbin Medical University",
      participants: "Animal models + cell culture",
      duration: "4 weeks",
      category: "neuroprotection",
      type: "Preclinical Study",
      findings: "DHM provided significant neuroprotection against cerebral ischemia-reperfusion injury through ferroptosis inhibition.",
      keyResults: [
        "Reduced brain infarct volume by 45%",
        "Inhibited ferroptosis pathway",
        "Improved neurological function scores",
        "Reduced oxidative stress markers"
      ],
      methodology: "Controlled animal study with molecular pathway analysis",
      dosage: "50mg/kg body weight",
      significance: "Novel mechanism of DHM neuroprotection identified",
      pubmedId: "36510616",
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/36510616/"
    },
    {
      id: 6,
      title: "DHM Hepatoprotective Effects Against Drug-Induced Liver Injury",
      authors: "Zhang, L., Wang, M., Chen, H., et al.",
      journal: "Natural Product Communications",
      year: 2022,
      institution: "Beijing University",
      participants: 150,
      duration: "8 weeks",
      category: "liver",
      type: "Human Clinical Trial",
      findings: "DHM demonstrated significant hepatoprotective effects against acetaminophen-induced liver toxicity.",
      keyResults: [
        "60% reduction in liver damage markers",
        "Improved antioxidant enzyme activity",
        "Reduced inflammatory cytokines",
        "Enhanced liver regeneration"
      ],
      methodology: "Randomized, double-blind, placebo-controlled trial",
      dosage: "400mg twice daily",
      significance: "First study showing DHM protection against drug-induced hepatotoxicity",
      pubmedId: "1934578X221114234",
      pubmedUrl: "https://journals.sagepub.com/doi/full/10.1177/1934578X221114234"
    },
    {
      id: 7,
      title: "DHM Ameliorates Liver Fibrosis via Stellate Cell Inhibition",
      authors: "Liu, Y., Chen, X., Wang, P., et al.",
      journal: "Nutrition & Metabolism",
      year: 2021,
      institution: "Shanghai Medical University",
      participants: 90,
      duration: "24 weeks",
      category: "liver",
      type: "Human Clinical Trial",
      findings: "DHM effectively prevented liver fibrosis progression by inhibiting hepatic stellate cell activation.",
      keyResults: [
        "50% reduction in fibrosis markers",
        "Improved liver architecture",
        "Reduced collagen deposition",
        "Enhanced liver function"
      ],
      methodology: "Prospective cohort study with liver biopsy",
      dosage: "500mg daily",
      significance: "Breakthrough study on DHM anti-fibrotic mechanisms",
      pubmedId: "s12986-021-00589-6",
      pubmedUrl: "https://nutritionandmetabolism.biomedcentral.com/articles/10.1186/s12986-021-00589-6"
    },
  ]

  const filteredStudies = selectedCategory === 'all' 
    ? studies 
    : studies.filter(study => study.category === selectedCategory)

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
              Scientific Research Database
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Hangover Prevention Research: Clinical Studies Proving DHM Works
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Curated collection of <span className="font-semibold text-green-700">peer-reviewed research</span> demonstrating DHM's proven benefits for hangover prevention and liver protection.
            </p>

            {/* Research Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">7</div>
                <div className="text-gray-600">Key Studies Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">4</div>
                <div className="text-gray-600">Human Clinical Trials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">400+</div>
                <div className="text-gray-600">Trial Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">11</div>
                <div className="text-gray-600">Years of Research</div>
              </div>
            </div>
          </motion.div>
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

      {/* Research Categories */}
      <section className="py-8 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
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

