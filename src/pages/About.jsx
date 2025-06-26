import React from 'react'
import { Link } from '../components/CustomLink.jsx'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  Users, 
  Target, 
  Award, 
  BookOpen, 
  Microscope, 
  Shield,
  ArrowRight,
  CheckCircle,
  Heart,
  Lightbulb,
  Globe,
  Mail
} from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: <Microscope className="w-8 h-8" />,
      title: "Science-Based",
      description: "Every recommendation is backed by peer-reviewed research and clinical studies."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Unbiased Reviews",
      description: "Independent testing and analysis with no affiliate bias or sponsored content."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "User-Focused",
      description: "Prioritizing real user experiences and practical effectiveness over marketing claims."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Accessible Knowledge",
      description: "Making complex scientific research understandable and actionable for everyone."
    }
  ]

  const expertise = [
    {
      area: "Biochemistry & Pharmacology",
      description: "Deep understanding of DHM's molecular mechanisms and interactions",
      years: "10+ years"
    },
    {
      area: "Clinical Research Analysis",
      description: "Systematic review and interpretation of peer-reviewed studies",
      years: "8+ years"
    },
    {
      area: "Supplement Industry",
      description: "Comprehensive knowledge of manufacturing, quality, and regulations",
      years: "12+ years"
    },
    {
      area: "Traditional Medicine",
      description: "Historical context and traditional uses of DHM-containing plants",
      years: "6+ years"
    }
  ]

  const achievements = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "50+ Studies Analyzed",
      description: "Comprehensive review of all major DHM research"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "20+ Brands Tested",
      description: "Independent testing of leading DHM supplements"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Industry Recognition",
      description: "Cited by researchers and health professionals"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "100K+ Users Helped",
      description: "Trusted resource for DHM information worldwide"
    }
  ]

  const methodology = [
    {
      step: "1",
      title: "Literature Review",
      description: "Systematic analysis of peer-reviewed research from PubMed, clinical databases, and academic journals."
    },
    {
      step: "2",
      title: "Product Testing",
      description: "Independent laboratory analysis of DHM supplements for purity, potency, and quality."
    },
    {
      step: "3",
      title: "User Feedback",
      description: "Collection and analysis of real user experiences and effectiveness reports."
    },
    {
      step: "4",
      title: "Expert Review",
      description: "Validation by biochemists, pharmacologists, and healthcare professionals."
    }
  ]

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
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              <Users className="w-4 h-4 mr-2" />
              About DHM Guide
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight">
              Your Trusted DHM Resource
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Dedicated to providing <span className="font-semibold text-green-700">evidence-based information</span> 
              about Dihydromyricetin through rigorous research, independent testing, and unbiased analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                asChild
                size="lg" 
                className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg"
              >
                <Link to="/guide">
                  Explore Our Research
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 text-lg"
              >
                <Link to="/reviews">View Product Reviews</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">
              Our Mission
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6 text-center text-xl">
                To bridge the gap between cutting-edge DHM research and practical, actionable information 
                that helps people make informed decisions about hangover prevention and liver health.
              </p>
              
              <div className="bg-green-50 p-8 rounded-lg mb-8">
                <h3 className="text-2xl font-semibold text-green-800 mb-4 text-center">Why DHM Guide Exists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">The Problem</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Conflicting information about DHM online</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Marketing claims without scientific backing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Complex research difficult to understand</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>No comprehensive product comparisons</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Our Solution</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Evidence-based information only</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Independent product testing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Clear, accessible explanations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Comprehensive product database</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at DHM Guide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">
              Our Expertise
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expertise.map((area, index) => (
                <motion.div
                  key={area.area}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-green-800">{area.area}</CardTitle>
                        <Badge className="bg-green-600 text-white">{area.years}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-green-700">
                        {area.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">
              Our Research Methodology
            </h2>
            
            <div className="space-y-6">
              {methodology.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
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
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Measurable contributions to DHM knowledge and user education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {achievement.icon}
                    </div>
                    <CardTitle className="text-lg text-blue-800">{achievement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-blue-700">
                      {achievement.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Have questions about DHM or suggestions for our research? 
              We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg"
              >
                <Link to="/research">
                  View Our Research
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

