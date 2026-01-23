import React from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import FAQSection from '../components/FAQSection.jsx'
import CompetitorComparison from '../components/CompetitorComparison.jsx'
import UserTestimonials from '../components/UserTestimonials.jsx'
// Inline placeholder to avoid JSON import issues
const lcpPlaceholder = {
  base64: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAgCdASoUAA0APzmEulO/qKWisAgD8CcJZQCdAC5JAAD+w93fB761v0e6gClroICuMghCtMAAAA==",
  width: 20,
  height: 13
}
// Import all responsive image variants - Vite will hash these correctly
import liver380w from '../assets/02_liver_protection_infographic-380w.webp'
import liver760w from '../assets/02_liver_protection_infographic-760w.webp'
import liver1536w from '../assets/02_liver_protection_infographic-1536w.webp'
import gaba380w from '../assets/04_gaba_receptor_mechanism-380w.webp'
import gaba760w from '../assets/04_gaba_receptor_mechanism-760w.webp'
import gaba1536w from '../assets/04_gaba_receptor_mechanism-1536w.webp'

import LazyImage from '../components/LazyImage.jsx'
import {
  ChevronDown,
  Beaker,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Leaf,
  Brain,
  Heart,
  CheckCircle,
  ExternalLink,
  Award
} from 'lucide-react'
import { useFeatureFlag } from '../hooks/useFeatureFlag'
import { useFunnelTracking } from '../hooks/useFunnelTracking'
import { trackElementClick } from '../lib/posthog'

export default function Home() {
  // SEO optimization for homepage
  useSEO(generatePageSEO('home'));

  // Conversion funnel tracking
  const { trackStep } = useFunnelTracking();

  // A/B Test #128: Homepage above-fold mobile CTA
  const mobileCtaVariant = useFeatureFlag('homepage-mobile-cta-v1', 'control')

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 300], [0, -50])
  const traditionY = useTransform(scrollY, [0, 1000], [0, -100])

  // Benefits data
  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Wake Up Refreshed",
      description: "DHM's liver pathway clears toxic acetaldehyde 60% faster, eliminating morning nausea and headaches",
      mechanism: "Liver Protection"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Stay Sharp & Focused",
      description: "GABA receptor protection prevents alcohol-induced brain fog and cognitive impairment",
      mechanism: "Brain Protection"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Drink Without Worry",
      description: "Dual-pathway protection means you can enjoy social drinking with confidence",
      mechanism: "Dual Pathways"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Protect Your Health",
      description: "Enhanced enzyme production reduces long-term liver damage from alcohol consumption",
      mechanism: "Liver Protection"
    },
    {
      icon: <Beaker className="w-8 h-8" />,
      title: "Clinically-Proven Science",
      description: "11 peer-reviewed studies prove 70% faster alcohol recovery in 1,000+ participants",
      mechanism: "Clinical Evidence"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Ancient Wisdom",
      description: "1,000+ years of traditional use now validated by modern scientific research",
      mechanism: "Traditional Medicine"
    }
  ]

  // Top DHM products
  const topProducts = [
    {
      name: "No Days Wasted DHM Detox",
      rating: 4.3,
      price: "$26.99",
      dhm: "1000mg",
      badge: "Editor's Choice",
      features: ["1K+ bought this month", "Science-backed formula", "350K+ customers"],
      affiliateLink: "https://amzn.to/3HSHjgu"
    },
    {
      name: "Double Wood Supplements",
      rating: 4.4,
      price: "$19.75",
      dhm: "1000mg",
      badge: "Best Value",
      features: ["Amazon's Choice", "2K+ bought monthly", "Enhanced with electrolytes"],
      affiliateLink: "https://amzn.to/44sczuq"
    },
    {
      name: "Cheers Restore",
      rating: 3.9,
      price: "$34.99",
      dhm: "Most DHM per dose",
      badge: "Shark Tank",
      features: ["Patented DHM + Cysteine", "25M+ better mornings", "Full transparency"],
      affiliateLink: "https://amzn.to/3T8cO8H"
    }
  ]

  return (
    <div>
      {/* Hero Section - Before/After Transformation */}
      <section className="pt-8 pb-16 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          {/* A/B Test #128: Mobile Above-Fold CTA - Shows BEFORE the grid on mobile */}
          {(mobileCtaVariant === 'simple-cta' || mobileCtaVariant === 'urgency-cta') && (
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">
                Never Wake Up <span className="text-green-700">Hungover Again</span>
              </h2>
              <p className="text-gray-600 mb-4">UCLA-discovered. 70% effective. 350K+ customers.</p>
              {mobileCtaVariant === 'urgency-cta' && (
                <Badge className="mb-3 bg-orange-100 text-orange-800 motion-safe:animate-pulse inline-flex">
                  🔥 1,247 people bought DHM this week
                </Badge>
              )}
              <Link
                to="/reviews"
                onClick={() => trackElementClick('homepage-mobile-cta', {
                  variant: mobileCtaVariant,
                  placement: 'above-fold-mobile-top'
                })}
                className="inline-flex items-center justify-center gap-2 w-full max-w-sm mx-auto bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all min-h-[56px] text-lg"
              >
                See Top-Rated Supplements
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-2">Free shipping • 10+ products tested</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            
            {/* Before/After Image - Left Column */}
            <div className="order-1 lg:order-1">
              <div className="relative">
                <picture>
                  {/* WebP with responsive sizes */}
                  <source
                    type="image/webp"
                    sizes="(max-width: 480px) 380px, (max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 600px"
                    srcSet="/images/before-after-dhm-380w.webp 380w,
                            /images/before-after-dhm-500w.webp 500w,
                            /images/before-after-dhm-640w.webp 640w,
                            /images/before-after-dhm-768w.webp 768w,
                            /images/before-after-dhm-1024w.webp 1024w,
                            /images/before-after-dhm-1536w.webp 1536w"
                  />
                  {/* Fallback image with blur-up placeholder */}
                  <img 
                    src="/images/before-after-dhm-1536w.webp"
                    alt="Before and After DHM - Transform your morning from hangover misery to feeling great"
                    loading="eager"
                    fetchPriority="high"
                    width={1536}
                    height={1024}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '1rem',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      display: 'block',
                      backgroundImage: `url(${lcpPlaceholder.base64})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </picture>
              </div>
            </div>

            {/* Headline + Value Prop + CTA - Right Column */}
            <div className="order-2 lg:order-2 text-center lg:text-left">
              <div>
                <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 text-sm font-semibold">
                  🧬 Science-Backed Transformation
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                Never Wake Up 
                <span className="block bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  Hungover Again
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
                The UCLA-discovered supplement that prevents hangovers by blocking alcohol damage before it starts. <span className="font-semibold text-green-700">Proven 70% effective</span> in clinical studies.
              </p>

              {/* Trust Indicators - Above Fold */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  4.4 (1,000+ reviews)
                </span>
                <span className="text-gray-400" aria-hidden="true">•</span>
                <span>70% proven effective</span>
                <span className="text-gray-400" aria-hidden="true">•</span>
                <span>350K+ customers</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-5 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/guide">
                    🚀 Stop Your Next Hangover
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-10 py-5 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/reviews">🛡️ Find Best Supplements</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">4.4/5 from 1,000+ reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Science-Backed Formula</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Works in 30 minutes</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Science Preview Bridge Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 text-sm font-semibold">
              ⚡ How It Works in 30 Seconds
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              DHM Targets Alcohol's Damage at the Source
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              While other "hangover cures" treat symptoms after damage is done, DHM prevents the damage entirely through two proven pathways:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/80 p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Liver Protection</h3>
                <p className="text-gray-600">
                  Boosts alcohol-metabolizing enzymes by 60%, clearing toxic acetaldehyde before it causes nausea and headaches.
                </p>
              </div>
              
              <div className="bg-white/80 p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Brain Protection</h3>
                <p className="text-gray-600">
                  Protects GABA receptors from alcohol disruption, preventing brain fog and maintaining mental clarity.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl">
              <p className="text-lg text-gray-700 font-medium">
                <span className="text-green-700 font-bold">Result:</span> You wake up feeling refreshed instead of hungover - proven by clinical research showing 70% faster recovery.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Science Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-semibold">
              🧬 Scientific Mechanisms
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              How DHM Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the dual-pathway science behind DHM's effectiveness - 
              from liver protection to neurological balance.
            </p>
          </motion.div>

          {/* Liver Pathway - Text Left, Image Right */}
          <div className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Liver Protection Pathway</h3>
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    DHM speeds ethanol → acetaldehyde → acetate via ADH/ALDH enzymes, 
                    cutting toxic residence time and protecting your liver from damage.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Enhanced ADH/ALDH Activity</h4>
                        <p className="text-gray-600 text-sm">Increases enzyme production by up to 60%</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Reduced Acetaldehyde Toxicity</h4>
                        <p className="text-gray-600 text-sm">Faster elimination of harmful byproducts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Anti-Inflammatory Effects</h4>
                        <p className="text-gray-600 text-sm">Protects liver cells from oxidative stress</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Research Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-red-700 font-semibold hover:text-red-800 transition-colors">
                      <span className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read the Research
                      </span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                      <div className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold text-red-700">UCLA Study (2012)</h5>
                          <p className="text-gray-600 mb-2">DHM enhanced alcohol metabolism and reduced liver damage markers in controlled studies.</p>
                          <a href="https://pubmed.ncbi.nlm.nih.gov/22219299/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">View PubMed →</a>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-700">Journal of Hepatology (2020) - USC</h5>
                          <p className="text-gray-600 mb-2">45% reduction in liver enzyme damage and improved liver function in chronic alcohol users.</p>
                          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7211127/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">View Study →</a>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* What This Means For You */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      What This Means For You
                    </h4>
                    <p className="text-red-700 text-sm">
                      <strong>No more morning nausea or headaches.</strong> By clearing toxic acetaldehyde 60% faster, you wake up feeling refreshed instead of sick.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="relative">
                  <img
                    src={liver760w}
                    srcSet={`${liver380w} 380w, ${liver760w} 760w, ${liver1536w} 1536w`}
                    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 64px), 760px"
                    alt="DHM Liver Protection Mechanism - Shows how DHM enhances alcohol metabolism through ADH and ALDH enzymes"
                    width={1536}
                    height={1024}
                    loading="lazy"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* GABA Pathway - Text Right, Image Left (Z-Pattern) */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="order-1 lg:order-1"
              >
                <div className="relative">
                  <img
                    src={gaba760w}
                    srcSet={`${gaba380w} 380w, ${gaba760w} 760w, ${gaba1536w} 1536w`}
                    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 64px), 760px"
                    alt="DHM GABA Receptor Mechanism - Shows how DHM restores normal brain function by protecting GABA receptors"
                    width={1536}
                    height={1024}
                    loading="lazy"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="order-2 lg:order-2"
              >
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Neurological Balance</h3>
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    DHM protects and restores GABA receptor function, preventing alcohol-induced 
                    neurological disruption and maintaining cognitive clarity.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">GABA Receptor Protection</h4>
                        <p className="text-gray-600 text-sm">Prevents alcohol-induced receptor disruption</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Cognitive Function Maintenance</h4>
                        <p className="text-gray-600 text-sm">Reduces brain fog and mental impairment</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Neurological Restoration</h4>
                        <p className="text-gray-600 text-sm">Helps restore normal brain chemistry balance</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Research Section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-green-700 font-semibold hover:text-green-800 transition-colors">
                      <span className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read the Research
                      </span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
                      <div className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold text-green-700">Drug Design & Therapy (2022) - Harbin Medical</h5>
                          <p className="text-gray-600 mb-2">DHM reduced brain inflammation by 45% and provided significant neuroprotection against alcohol damage.</p>
                          <a href="https://pubmed.ncbi.nlm.nih.gov/36510616/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">View Study →</a>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-700">Frontiers in Nutrition (2023) - UConn</h5>
                          <p className="text-gray-600 mb-2">DHM improved gut-brain axis function and reduced inflammatory markers in alcohol users.</p>
                          <a href="https://pubmed.ncbi.nlm.nih.gov/37645104/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">View PubMed →</a>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* What This Means For You */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      What This Means For You
                    </h4>
                    <p className="text-green-700 text-sm">
                      <strong>Stay sharp and focused all day.</strong> GABA protection prevents brain fog, memory issues, and the mental sluggishness that typically follows drinking.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Summary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white p-12 rounded-3xl"
          >
            <h3 className="text-3xl font-bold mb-4">Dual-Pathway Protection</h3>
            <p className="text-xl mb-8 opacity-90">
              DHM works on both liver and brain pathways to provide comprehensive hangover prevention and health protection.
            </p>
            <Button 
              asChild
              size="lg" 
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Link to="/research">
                Explore All Research
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Rooted in Tradition - Parallax Storytelling Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: traditionY }}
          className="absolute inset-0 w-full h-full"
        >
          <LazyImage
            src="/assets/05_traditional_heritage-1536w.webp"
            srcSet="/assets/05_traditional_heritage-640w.webp 640w,
                    /assets/05_traditional_heritage-768w.webp 768w,
                    /assets/05_traditional_heritage-1024w.webp 1024w,
                    /assets/05_traditional_heritage-1536w.webp 1536w"
            sizes="100vw"
            alt="Traditional Japanese raisin tree harvesting"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.85)' }}
            threshold={0.1}
            rootMargin="100px"
          />
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-green-900/20" />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Translucent Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-6 bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-semibold">
                  🌿 Ancient Wisdom, Modern Science
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  What Ancient Healers Knew, 
                  <span className="block bg-gradient-to-r from-amber-600 to-green-700 bg-clip-text text-transparent">
                    Modern Science Proved
                  </span>
                </h2>
                
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  For over 1,000 years, Chinese emperors used Japanese raisin tree extract to prevent "wine sickness." Today, clinical research proves this ancient wisdom was scientifically accurate - DHM blocks alcohol toxicity through the same dual pathways traditional healers observed.
                </p>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-green-50 rounded-xl border border-amber-200 mb-8">
                  <p className="text-amber-800 font-medium text-lg">
                    <span className="font-bold">Ancient Use:</span> "Prevents wine sickness and morning suffering"<br/>
                    <span className="font-bold">Modern Science:</span> "70% faster alcohol recovery through dual-pathway protection"
                  </p>
                </div>

                <div className="flex justify-center items-center">
                  <Button 
                    asChild
                    size="lg" 
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link 
                      to="/about"
                    >
                      Our Heritage Story
                      <Leaf className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>

              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What DHM's Dual Pathways Mean for You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each of DHM's scientifically-proven mechanisms translates into real benefits you'll feel the next morning - and long-term health protection you can count on.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900 mb-2">{benefit.title}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {benefit.mechanism}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Reviews Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Top DHM Supplements 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based on the science above, here's how to choose the right DHM supplement for your drinking patterns and goals.
            </p>
          </motion.div>

          {/* Selection Guide */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <Beaker className="w-6 h-6 mr-3 text-green-600" />
                  DHM Dosage & Selection Guide
                </h3>
                <p className="text-gray-700">Choose based on your drinking frequency and liver protection needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-green-100">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🍺</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Light Drinkers</h4>
                    <p className="text-sm text-gray-600">1-3 drinks occasionally</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Dosage:</strong> 300-500mg DHM</p>
                    <p className="text-sm"><strong>Timing:</strong> 30 min before drinking</p>
                    <p className="text-sm"><strong>Best for:</strong> Basic liver support</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-green-100 ring-2 ring-green-200">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🍷</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Regular Drinkers</h4>
                    <p className="text-sm text-gray-600">3-6 drinks weekly</p>
                    <Badge className="bg-green-100 text-green-800 text-xs mt-1">Most Popular</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Dosage:</strong> 750-1000mg DHM</p>
                    <p className="text-sm"><strong>Timing:</strong> Before & during drinking</p>
                    <p className="text-sm"><strong>Best for:</strong> Dual-pathway protection</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-green-100">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🍸</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Heavy Occasions</h4>
                    <p className="text-sm text-gray-600">Events, celebrations</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Dosage:</strong> 1000mg+ DHM</p>
                    <p className="text-sm"><strong>Timing:</strong> Before, during, after</p>
                    <p className="text-sm"><strong>Best for:</strong> Maximum protection</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Pro Tip: Maximize DHM Effectiveness
                </h4>
                <p className="text-blue-700 text-sm">
                  Take DHM 30 minutes before your first drink for optimal liver enzyme activation. For best results, stay hydrated and take with food to enhance absorption.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-white border-green-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-green-100 text-green-800">{product.badge}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-700">{product.price}</span>
                      <span className="text-sm text-gray-600">{product.dhm} DHM</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <a href={product.affiliateLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className="flex items-center justify-center">
                        <span>Check Price on Amazon</span>
                        <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          Free Shipping
                        </span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    {/* Trust Signals Near CTA */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span>{product.rating} ({product.reviews?.toLocaleString() || '500+'} reviews)</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      As an Amazon Associate I earn from qualifying purchases
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              <Link to="/reviews">
                View All Reviews
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* User Testimonials Section */}
      <UserTestimonials />

      {/* DHM vs Competitors Comparison */}
      <CompetitorComparison />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Your Next Hangover
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              You know the science. You know what works. Don't wait for another morning of regret.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild
                size="lg" 
                variant="secondary"
                className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                <Link to="/reviews">Find Your DHM Supplement</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg"
              >
                <Link to="/dhm-dosage-calculator">Calculate Your Dosage</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center text-green-100 text-sm mt-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Free shipping • 70% proven reduction</span>
            </div>
            <p className="text-green-100 text-sm mt-4 max-w-md mx-auto">
              Join thousands who've switched from suffering to science-backed prevention
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

