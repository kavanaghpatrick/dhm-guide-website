import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import { HelpCircle, Clock, Shield, Activity, AlertCircle, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const FAQSection = () => {
  const faqCategories = [
    {
      category: "Dosage & Timing",
      icon: <Clock className="w-5 h-5" />,
      color: "blue",
      questions: [
        {
          question: "How much DHM should I take?",
          answer: "The optimal DHM dosage is 5mg per kg of body weight. For most adults, this translates to 300-600mg. A 150lb (68kg) person should take approximately 340mg. Use our dosage calculator for a personalized recommendation based on your weight, alcohol consumption, and other factors.",
          schema: {
            "@type": "Question",
            "name": "How much DHM should I take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The optimal DHM dosage is 5mg per kg of body weight. For most adults, this translates to 300-600mg. A 150lb (68kg) person should take approximately 340mg. Use our dosage calculator for a personalized recommendation based on your weight, alcohol consumption, and other factors."
            }
          }
        },
        {
          question: "When should I take DHM?",
          answer: "For hangover prevention, take DHM 30-60 minutes before your first drink. For recovery, take it immediately after drinking or before bed. You can also split your dose: half before drinking and half after. Always take DHM with water for better absorption.",
          schema: {
            "@type": "Question",
            "name": "When should I take DHM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For hangover prevention, take DHM 30-60 minutes before your first drink. For recovery, take it immediately after drinking or before bed. You can also split your dose: half before drinking and half after. Always take DHM with water for better absorption."
            }
          }
        },
        {
          question: "Should I take DHM before or after drinking?",
          answer: "Both timing strategies work, but taking DHM before drinking (30-60 minutes prior) provides better prevention. Pre-drinking dosing allows DHM to be active in your system when alcohol arrives. Post-drinking dosing helps with recovery but may be less effective for prevention.",
          schema: {
            "@type": "Question",
            "name": "Should I take DHM before or after drinking?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Both timing strategies work, but taking DHM before drinking (30-60 minutes prior) provides better prevention. Pre-drinking dosing allows DHM to be active in your system when alcohol arrives. Post-drinking dosing helps with recovery but may be less effective for prevention."
            }
          }
        },
        {
          question: "Can I take DHM while drinking?",
          answer: "Yes, you can take DHM during drinking sessions. For extended drinking periods (4+ hours), consider splitting your dose: take half before drinking and half midway through. This maintains protective DHM levels throughout your drinking session.",
          schema: {
            "@type": "Question",
            "name": "Can I take DHM while drinking?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can take DHM during drinking sessions. For extended drinking periods (4+ hours), consider splitting your dose: take half before drinking and half midway through. This maintains protective DHM levels throughout your drinking session."
            }
          }
        }
      ]
    },
    {
      category: "Effectiveness & Results",
      icon: <Zap className="w-5 h-5" />,
      color: "green",
      questions: [
        {
          question: "Does DHM work for everyone?",
          answer: "DHM effectiveness varies by individual, but clinical studies show positive results for most people. A 2024 randomized controlled trial found significant reductions in hangover symptoms for 73% of participants. Factors affecting effectiveness include genetics, liver health, dosage accuracy, and alcohol consumption patterns.",
          schema: {
            "@type": "Question",
            "name": "Does DHM work for everyone?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM effectiveness varies by individual, but clinical studies show positive results for most people. A 2024 randomized controlled trial found significant reductions in hangover symptoms for 73% of participants. Factors affecting effectiveness include genetics, liver health, dosage accuracy, and alcohol consumption patterns."
            }
          }
        },
        {
          question: "How quickly does DHM work?",
          answer: "DHM begins working within 30-60 minutes of ingestion. Peak blood levels occur at 1-2 hours. For hangover prevention, effects last 4-6 hours. Some users report feeling benefits within 30 minutes, while maximum protection develops over 1-2 hours.",
          schema: {
            "@type": "Question",
            "name": "How quickly does DHM work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM begins working within 30-60 minutes of ingestion. Peak blood levels occur at 1-2 hours. For hangover prevention, effects last 4-6 hours. Some users report feeling benefits within 30 minutes, while maximum protection develops over 1-2 hours."
            }
          }
        },
        {
          question: "Why didn't DHM work for me?",
          answer: "Common reasons DHM may not work include: insufficient dosage (less than 5mg/kg body weight), poor timing (taking too late), low-quality supplements, excessive alcohol consumption, dehydration, or individual genetic variations. Try adjusting your dosage and timing, ensure adequate hydration, and choose high-quality DHM supplements.",
          schema: {
            "@type": "Question",
            "name": "Why didn't DHM work for me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Common reasons DHM may not work include: insufficient dosage (less than 5mg/kg body weight), poor timing (taking too late), low-quality supplements, excessive alcohol consumption, dehydration, or individual genetic variations. Try adjusting your dosage and timing, ensure adequate hydration, and choose high-quality DHM supplements."
            }
          }
        },
        {
          question: "How effective is DHM compared to other hangover remedies?",
          answer: "Clinical studies show DHM is more effective than most traditional remedies. Unlike hydration alone (30% symptom reduction), DHM provides 70%+ reduction in hangover severity. It outperforms vitamin B complex, activated charcoal, and most herbal remedies in controlled trials.",
          schema: {
            "@type": "Question",
            "name": "How effective is DHM compared to other hangover remedies?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Clinical studies show DHM is more effective than most traditional remedies. Unlike hydration alone (30% symptom reduction), DHM provides 70%+ reduction in hangover severity. It outperforms vitamin B complex, activated charcoal, and most herbal remedies in controlled trials."
            }
          }
        }
      ]
    },
    {
      category: "Safety & Side Effects",
      icon: <Shield className="w-5 h-5" />,
      color: "purple",
      questions: [
        {
          question: "Can I take DHM daily?",
          answer: "DHM is safe for occasional use with alcohol consumption. While no serious side effects have been reported in studies using daily DHM for up to 3 months, it's designed for use when drinking alcohol. Daily use without alcohol hasn't been extensively studied. Most experts recommend using DHM only when consuming alcohol.",
          schema: {
            "@type": "Question",
            "name": "Can I take DHM daily?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM is safe for occasional use with alcohol consumption. While no serious side effects have been reported in studies using daily DHM for up to 3 months, it's designed for use when drinking alcohol. Daily use without alcohol hasn't been extensively studied. Most experts recommend using DHM only when consuming alcohol."
            }
          }
        },
        {
          question: "Is DHM safe for long-term use?",
          answer: "Current research shows DHM is well-tolerated for regular use when drinking. Studies up to 3 months show no adverse effects. DHM has been used in traditional Asian medicine for centuries. However, long-term studies beyond 3 months are limited. Always consult healthcare providers for extended use.",
          schema: {
            "@type": "Question",
            "name": "Is DHM safe for long-term use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Current research shows DHM is well-tolerated for regular use when drinking. Studies up to 3 months show no adverse effects. DHM has been used in traditional Asian medicine for centuries. However, long-term studies beyond 3 months are limited. Always consult healthcare providers for extended use."
            }
          }
        },
        {
          question: "What are DHM side effects?",
          answer: "DHM has minimal side effects. Clinical trials report no serious adverse events. Rare mild effects include slight drowsiness (2% of users), mild stomach upset if taken without food (3%), and headache (1%). These effects are typically less severe than hangover symptoms themselves.",
          schema: {
            "@type": "Question",
            "name": "What are DHM side effects?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM has minimal side effects. Clinical trials report no serious adverse events. Rare mild effects include slight drowsiness (2% of users), mild stomach upset if taken without food (3%), and headache (1%). These effects are typically less severe than hangover symptoms themselves."
            }
          }
        },
        {
          question: "Can I take DHM with medications?",
          answer: "DHM may interact with blood thinners, sedatives, and liver medications. Avoid DHM if taking warfarin, benzodiazepines, or hepatotoxic drugs. DHM is safe with most common medications including ibuprofen, acetaminophen (in moderation), and antacids. Always consult your healthcare provider about potential interactions.",
          schema: {
            "@type": "Question",
            "name": "Can I take DHM with medications?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM may interact with blood thinners, sedatives, and liver medications. Avoid DHM if taking warfarin, benzodiazepines, or hepatotoxic drugs. DHM is safe with most common medications including ibuprofen, acetaminophen (in moderation), and antacids. Always consult your healthcare provider about potential interactions."
            }
          }
        }
      ]
    },
    {
      category: "Usage & Combinations",
      icon: <Activity className="w-5 h-5" />,
      color: "orange",
      questions: [
        {
          question: "Can I take DHM with other supplements?",
          answer: "Yes, DHM works well with complementary supplements. Effective combinations include: DHM + Electrolytes (enhanced hydration), DHM + B-Complex (energy support), DHM + NAC (liver protection), DHM + Milk Thistle (additional liver support). Avoid combining with other sedatives or alcohol-metabolizing supplements.",
          schema: {
            "@type": "Question",
            "name": "Can I take DHM with other supplements?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, DHM works well with complementary supplements. Effective combinations include: DHM + Electrolytes (enhanced hydration), DHM + B-Complex (energy support), DHM + NAC (liver protection), DHM + Milk Thistle (additional liver support). Avoid combining with other sedatives or alcohol-metabolizing supplements."
            }
          }
        },
        {
          question: "Should I take DHM with food?",
          answer: "DHM can be taken with or without food. Taking with a light meal may reduce the rare chance of stomach upset. However, taking on an empty stomach may lead to faster absorption. If you experience any stomach discomfort, try taking DHM with food.",
          schema: {
            "@type": "Question",
            "name": "Should I take DHM with food?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DHM can be taken with or without food. Taking with a light meal may reduce the rare chance of stomach upset. However, taking on an empty stomach may lead to faster absorption. If you experience any stomach discomfort, try taking DHM with food."
            }
          }
        },
        {
          question: "Can I drink more alcohol when taking DHM?",
          answer: "No, DHM is not intended to increase alcohol consumption. While DHM helps process alcohol and reduce hangovers, it doesn't prevent intoxication or make drinking safer. Always drink responsibly. DHM is a recovery aid, not a license to drink excessively.",
          schema: {
            "@type": "Question",
            "name": "Can I drink more alcohol when taking DHM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, DHM is not intended to increase alcohol consumption. While DHM helps process alcohol and reduce hangovers, it doesn't prevent intoxication or make drinking safer. Always drink responsibly. DHM is a recovery aid, not a license to drink excessively."
            }
          }
        },
        {
          question: "How much water should I drink with DHM?",
          answer: "Take DHM with at least 8-16 oz of water for optimal absorption. Continue hydrating throughout your drinking session - aim for one glass of water per alcoholic drink. Proper hydration enhances DHM effectiveness and provides additional hangover protection.",
          schema: {
            "@type": "Question",
            "name": "How much water should I drink with DHM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Take DHM with at least 8-16 oz of water for optimal absorption. Continue hydrating throughout your drinking session - aim for one glass of water per alcoholic drink. Proper hydration enhances DHM effectiveness and provides additional hangover protection."
            }
          }
        }
      ]
    },
    {
      category: "Special Considerations",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "red",
      questions: [
        {
          question: "Can pregnant women take DHM?",
          answer: "Pregnant and breastfeeding women should avoid DHM. While no specific studies show harm, alcohol consumption during pregnancy is not recommended, and DHM hasn't been tested for prenatal safety. Always consult your healthcare provider before taking any supplements during pregnancy.",
          schema: {
            "@type": "Question",
            "name": "Can pregnant women take DHM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Pregnant and breastfeeding women should avoid DHM. While no specific studies show harm, alcohol consumption during pregnancy is not recommended, and DHM hasn't been tested for prenatal safety. Always consult your healthcare provider before taking any supplements during pregnancy."
            }
          }
        },
        {
          question: "Is DHM safe for people with liver disease?",
          answer: "People with liver disease should consult their doctor before taking DHM. While DHM has hepatoprotective properties in healthy individuals, those with existing liver conditions may process it differently. Your healthcare provider can assess whether DHM is appropriate for your specific condition.",
          schema: {
            "@type": "Question",
            "name": "Is DHM safe for people with liver disease?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "People with liver disease should consult their doctor before taking DHM. While DHM has hepatoprotective properties in healthy individuals, those with existing liver conditions may process it differently. Your healthcare provider can assess whether DHM is appropriate for your specific condition."
            }
          }
        },
        {
          question: "What's the maximum DHM dosage?",
          answer: "The maximum recommended DHM dosage is 1200mg in a 24-hour period. Higher doses haven't shown additional benefits and may increase the risk of side effects. Most people need 300-600mg for effective hangover prevention. Use our dosage calculator for personalized recommendations.",
          schema: {
            "@type": "Question",
            "name": "What's the maximum DHM dosage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The maximum recommended DHM dosage is 1200mg in a 24-hour period. Higher doses haven't shown additional benefits and may increase the risk of side effects. Most people need 300-600mg for effective hangover prevention. Use our dosage calculator for personalized recommendations."
            }
          }
        },
        {
          question: "Can I take DHM if I'm Asian and have alcohol flush reaction?",
          answer: "Yes, DHM may be especially beneficial for those with Asian flush (ALDH2 deficiency). DHM helps process acetaldehyde, the compound responsible for facial flushing. Studies show DHM reduces flush symptoms by 40-60% in affected individuals. Start with standard dosing and adjust based on response.",
          schema: {
            "@type": "Question",
            "name": "Can I take DHM if I'm Asian and have alcohol flush reaction?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, DHM may be especially beneficial for those with Asian flush (ALDH2 deficiency). DHM helps process acetaldehyde, the compound responsible for facial flushing. Studies show DHM reduces flush symptoms by 40-60% in affected individuals. Start with standard dosing and adjust based on response."
            }
          }
        }
      ]
    }
  ]

  // Generate schema markup
  const generateSchemaMarkup = () => {
    const allQuestions = faqCategories.flatMap(cat => cat.questions.map(q => q.schema))
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allQuestions
    }
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about DHM dosage, timing, safety, and effectiveness. 
              Get evidence-based answers to the most common questions.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {faqCategories.map((cat, index) => (
              <button
                key={index}
                onClick={() => document.getElementById(`faq-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className={`text-${cat.color}-600 mb-2 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {cat.category}
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} id={`faq-${categoryIndex}`} className="overflow-hidden border-0 shadow-lg">
                <CardHeader className={`bg-gradient-to-r from-${category.color}-50 to-${category.color}-100 border-b border-${category.color}-200`}>
                  <CardTitle className="flex items-center text-2xl">
                    <div className={`w-10 h-10 bg-${category.color}-600 rounded-xl flex items-center justify-center mr-4`}>
                      {category.icon}
                    </div>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`} className="border-b last:border-0">
                        <AccordionTrigger className="px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                          <span className="text-lg font-medium text-gray-900 pr-4">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Can't find the answer you're looking for? Check out our comprehensive guide or use our dosage calculator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/guide"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Read Complete Guide
                </a>
                <a
                  href="/dhm-dosage-calculator"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Calculate Your Dosage
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchemaMarkup())
        }}
      />
    </section>
  )
}

export default FAQSection