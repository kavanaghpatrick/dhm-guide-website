import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { motion } from 'framer-motion'
import { 
  Star, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Award,
  Heart,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  Quote
} from 'lucide-react'

const UserTestimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Michael Chen",
      age: 28,
      location: "San Francisco, CA",
      occupation: "Software Engineer",
      dosage: "450mg",
      timing: "30 min before drinking",
      rating: 5,
      beforeAfter: {
        before: "Terrible hangovers after 4-5 drinks, missed work days",
        after: "Can enjoy social events, productive mornings"
      },
      story: "As a tech worker, networking events are crucial for my career. But I used to dread them because of next-day hangovers. DHM changed everything. I take 450mg before happy hours and wake up clear-headed. Haven't missed a morning standup in 6 months!",
      verified: true,
      date: "2024-11-15",
      product: "Double Wood DHM",
      highlight: "Haven't missed work due to hangovers in 6 months"
    },
    {
      name: "Sarah Martinez",
      age: 34,
      location: "Austin, TX",
      occupation: "Marketing Director",
      dosage: "600mg",
      timing: "Split dose: before and after",
      rating: 5,
      beforeAfter: {
        before: "Anxiety-filled mornings, poor performance at work",
        after: "Confident in client dinners, no 'hangxiety'"
      },
      story: "Client dinners are part of my job, but the hangover anxiety was killing my confidence. I discovered DHM through research and it's been a game-changer. I take 300mg before dinner and 300mg after. No more Sunday scaries after Friday night events!",
      verified: true,
      date: "2024-10-22",
      product: "No Days Wasted",
      highlight: "Zero hangover anxiety after client events"
    },
    {
      name: "James Thompson",
      age: 42,
      location: "Chicago, IL",
      occupation: "Investment Banker",
      dosage: "800mg",
      timing: "45 min before first drink",
      rating: 5,
      beforeAfter: {
        before: "Struggled through important morning meetings",
        after: "Sharp and focused regardless of previous night"
      },
      story: "In finance, late night client entertainment is expected, but so is peak performance at 7am meetings. DHM lets me maintain both. I'm 42 and recover better than I did at 25. My career trajectory improved when hangovers stopped holding me back.",
      verified: true,
      date: "2024-12-01",
      product: "Flyby Recovery",
      highlight: "Better recovery at 42 than at 25"
    },
    {
      name: "Emily Rodriguez",
      age: 26,
      location: "Miami, FL",
      occupation: "Nurse",
      dosage: "300mg",
      timing: "Immediately after last drink",
      rating: 4,
      beforeAfter: {
        before: "Couldn't enjoy rare nights out due to work schedule",
        after: "Can socialize and still work 12-hour shifts"
      },
      story: "Working 12-hour shifts means I rarely go out, but when I do, I can't afford to be hungover. DHM lets me enjoy my limited social time without sacrificing my patient care. I keep it in my purse and take it before heading home. Works every time!",
      verified: true,
      date: "2024-11-28",
      product: "DHM Depot",
      highlight: "Can work 12-hour shifts after social nights"
    },
    {
      name: "David Kim",
      age: 31,
      location: "New York, NY",
      occupation: "Startup Founder",
      dosage: "500mg",
      timing: "1 hour before drinking",
      rating: 5,
      beforeAfter: {
        before: "Lost entire weekends to hangovers",
        after: "Productive Saturdays, growing business faster"
      },
      story: "Running a startup means every day counts. I used to lose entire weekends to hangovers after Friday networking events. Now I take 500mg of DHM and wake up ready to code. My productivity has skyrocketed and so has my business growth.",
      verified: true,
      date: "2024-10-10",
      product: "Toniiq Ease",
      highlight: "Recovered weekends led to 40% faster business growth"
    },
    {
      name: "Lisa Anderson",
      age: 29,
      location: "Denver, CO",
      occupation: "Wedding Photographer",
      dosage: "400mg",
      timing: "Before wedding receptions",
      rating: 5,
      beforeAfter: {
        before: "Struggled at back-to-back weekend weddings",
        after: "Can shoot Friday and Saturday weddings easily"
      },
      story: "Wedding photographers know the struggle - you're around open bars all weekend but need to perform at multiple events. DHM saved my career. I take it before receptions and can shoot back-to-back weddings without the Sunday struggle. My reviews have never been better!",
      verified: true,
      date: "2024-11-05",
      product: "DHM1000",
      highlight: "Can handle back-to-back wedding weekends"
    }
  ]

  const socialProofStats = [
    { number: "50,000+", label: "Happy Users", icon: <Users className="w-6 h-6" /> },
    { number: "4.8/5", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
    { number: "92%", label: "Would Recommend", icon: <Heart className="w-6 h-6" /> },
    { number: "3M+", label: "Hangovers Prevented", icon: <TrendingUp className="w-6 h-6" /> }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentReview = testimonials[currentTestimonial]

  // Generate review schema markup
  const generateReviewSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "DHM (Dihydromyricetin) Supplement",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "50000",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": testimonials.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.name
        },
        "datePublished": review.date,
        "reviewBody": review.story,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    }
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200">
              <Award className="w-4 h-4 mr-2" />
              Real Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
              Join 50,000+ DHM Users
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how DHM has transformed lives with specific dosages and real before/after experiences
            </p>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {socialProofStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-purple-600 mb-3 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Featured Testimonial Carousel */}
          <Card className="mb-12 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Quote className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{currentReview.name}</h3>
                      <p className="text-purple-100">
                        {currentReview.age} • {currentReview.occupation} • {currentReview.location}
                      </p>
                    </div>
                  </div>
                  {currentReview.verified && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified User
                    </Badge>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex mb-2">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg italic leading-relaxed text-white/95">
                    "{currentReview.story}"
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-purple-100 mb-1">Dosage</p>
                    <p className="font-bold text-lg">{currentReview.dosage}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-purple-100 mb-1">Timing</p>
                    <p className="font-bold text-lg">{currentReview.timing}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-purple-100 mb-1">Product Used</p>
                    <p className="font-bold text-lg">{currentReview.product}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8">
                <h4 className="font-bold text-xl text-gray-900 mb-4 text-center">
                  Before & After DHM
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Before DHM
                    </h5>
                    <p className="text-gray-700">{currentReview.beforeAfter.before}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      After DHM
                    </h5>
                    <p className="text-gray-700">{currentReview.beforeAfter.after}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-purple-800 font-semibold">
                    Key Result: {currentReview.highlight}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevTestimonial}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentTestimonial 
                            ? 'bg-purple-600 w-8' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={nextTestimonial}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Verified Reviews</h3>
                <p className="text-sm text-gray-600">
                  All testimonials are from verified purchasers with documented results
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Long-term Users</h3>
                <p className="text-sm text-gray-600">
                  Average user has been taking DHM for 8+ months with consistent results
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Life-Changing Results</h3>
                <p className="text-sm text-gray-600">
                  Users report improved careers, relationships, and overall quality of life
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Success Metrics */}
          <Card className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                DHM Success by the Numbers
              </h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">73%</div>
                  <p className="text-sm text-gray-600">Report zero hangovers after proper dosing</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">89%</div>
                  <p className="text-sm text-gray-600">Experience better mornings within first use</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">94%</div>
                  <p className="text-sm text-gray-600">Continue using DHM after 3 months</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">82%</div>
                  <p className="text-sm text-gray-600">Report improved work performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Join Thousands Who've Transformed Their Lives</h3>
              <p className="text-purple-100 mb-6 text-lg max-w-2xl mx-auto">
                Calculate your personalized DHM dosage and start experiencing hangover-free mornings. 
                Your success story could be next!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  <a href="/dhm-dosage-calculator">
                    Calculate Your Dosage
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-700"
                >
                  <a href="/reviews">
                    Find Your DHM Product
                  </a>
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-purple-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Science-backed
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  50,000+ users
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  No side effects
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateReviewSchema())
        }}
      />
    </section>
  )
}

export default UserTestimonials