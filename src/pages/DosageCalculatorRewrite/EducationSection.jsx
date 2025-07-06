// DHM Calculator Education Section
// Agent 3 Implementation - Part 2

import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Shield, Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EducationSection() {
  return (
    <div className="space-y-8">
      {/* Science Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">The Science Behind Your DHM Dosage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">GABA-A Receptor Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    DHM competitively binds to GABA-A receptors, preventing alcohol-induced 
                    dysfunction and reducing hangover symptoms like anxiety and restlessness.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Enhanced Enzyme Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    DHM increases ADH activity by 73.6% and significantly boosts ALDH, 
                    accelerating alcohol metabolism and reducing toxic acetaldehyde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Why does DHM dosage depend on body weight?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Like most supplements, DHM needs to be distributed throughout your body's water 
                volume. Larger individuals have more blood volume and tissue mass, requiring 
                proportionally more DHM to achieve the same protective concentration at GABA-A 
                receptors and in the liver.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Should I take more DHM if I'm drinking longer?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Yes. Longer drinking sessions mean more alcohol exposure and greater depletion 
                of your body's natural defenses. The calculator increases dosage for longer 
                sessions to maintain protective DHM levels throughout your drinking period.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Can I take too much DHM?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                DHM has been shown to be safe in doses up to 2,000mg in clinical studies. 
                However, we recommend not exceeding 1200mg total per day. Most people see 
                optimal benefits between 300-900mg total daily. Start with our recommended 
                dose and adjust based on your experience. Always consult a healthcare 
                provider if you have concerns.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              When should I take DHM for best results?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Take your first dose 30-60 minutes before drinking to allow DHM to reach your 
                liver and brain. For best results, follow our three-tier protocol: before 
                drinking, during drinking (every 2-3 drinks), and before bed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left">
              Does tolerance affect DHM dosage?
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Regular drinkers may have adapted liver enzymes but also accumulated damage. 
                The calculator slightly increases dosage for frequent drinkers to account for 
                potential reduced liver efficiency and higher oxidative stress.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Safety Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> DHM is not a license to drink excessively. Always 
          drink responsibly, stay hydrated, and never drive under the influence. Consult 
          your healthcare provider before starting any new supplement regimen.
        </AlertDescription>
      </Alert>
    </div>
  )
}