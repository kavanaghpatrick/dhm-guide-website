// DHM Calculator Form Component
// Agent 2 Implementation

import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Calculator } from 'lucide-react'

import { formSchema } from './utils'

export default function CalculatorForm({ onCalculate, isMobile }) {
  const form = useForm({
    defaultValues: {
      gender: '',
      weight: '',
      weightUnit: 'kg',
      duration: '2-4 hours',
      drinkCount: '',
      frequency: 'monthly'
    }
  })

  const handleSubmit = (data) => {
    onCalculate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Gender Selection */}
        <FormField
          control={form.control}
          name="gender"
          rules={formSchema.gender}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Biological Sex</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <label htmlFor="male" className="text-sm font-medium cursor-pointer">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <label htmlFor="female" className="text-sm font-medium cursor-pointer">
                      Female
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <label htmlFor="other" className="text-sm font-medium cursor-pointer">
                      Prefer not to say
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight Input */}
        <FormField
          control={form.control}
          name="weight"
          rules={formSchema.weight}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Your Weight</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Enter weight"
                    className="flex-1 touch-manipulation"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <ToggleGroup
                    type="single"
                    value={form.watch('weightUnit')}
                    onValueChange={(value) => form.setValue('weightUnit', value)}
                    className="touch-manipulation"
                  >
                    <ToggleGroupItem value="kg" className="min-w-[44px]">kg</ToggleGroupItem>
                    <ToggleGroupItem value="lbs" className="min-w-[44px]">lbs</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Drinking Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">How long will you be drinking?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="touch-manipulation">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                  <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                  <SelectItem value="4-6 hours">4-6 hours</SelectItem>
                  <SelectItem value="6+ hours">6+ hours</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Drink Count */}
        <FormField
          control={form.control}
          name="drinkCount"
          rules={formSchema.drinkCount}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                How many drinks will you have?
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Number of standard drinks"
                  className="touch-manipulation"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Drinking Frequency */}
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">How often do you drink?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rarely" id="rarely" />
                    <label htmlFor="rarely" className="text-sm font-medium cursor-pointer">
                      Rarely
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <label htmlFor="monthly" className="text-sm font-medium cursor-pointer">
                      Monthly
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <label htmlFor="weekly" className="text-sm font-medium cursor-pointer">
                      Weekly
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <label htmlFor="daily" className="text-sm font-medium cursor-pointer">
                      Daily
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 text-lg touch-manipulation hover:shadow-lg transition-all duration-300"
        >
          <Calculator className="mr-2 h-5 w-5" />
          Calculate My DHM Dosage
        </Button>
      </form>
    </Form>
  )
}