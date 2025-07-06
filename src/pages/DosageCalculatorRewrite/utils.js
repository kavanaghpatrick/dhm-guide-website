// DHM Dosage Calculator Utilities
// Agent 1 Implementation

export const calculateDosage = (inputs) => {
  try {
    // Validate inputs
    if (!inputs || typeof inputs !== 'object') {
      console.error('Invalid inputs provided')
      return { preDrinking: 300, whileDrinking: 150, beforeBed: 150 }
    }
    
    const { gender, weight, weightUnit, duration, drinkCount, frequency } = inputs
    
    // Validate required fields
    if (!gender || !weight || !drinkCount) {
      console.error('Missing required fields')
      return { preDrinking: 300, whileDrinking: 150, beforeBed: 150 }
    }
    
    // Ensure numeric values
    const numWeight = Number(weight)
    const numDrinkCount = Number(drinkCount)
    
    if (isNaN(numWeight) || isNaN(numDrinkCount)) {
      console.error('Invalid numeric values')
      return { preDrinking: 300, whileDrinking: 150, beforeBed: 150 }
    }
    
    // Convert weight to kg
    const weightInKg = weightUnit === 'lbs' ? numWeight * 0.453592 : numWeight
  
    // Base calculation - using more reasonable 4mg per kg base
    const baseDosage = Math.round(weightInKg * 4 / 50) * 50
    
    // Gender adjustment
    const genderMultiplier = gender === 'female' ? 0.85 : 1.0
    
    // Duration adjustment
    const durationMultipliers = {
      '1-2 hours': 0.7,
      '2-4 hours': 1.0,
      '4-6 hours': 1.3,
      '6+ hours': 1.5
    }
    
    // Frequency adjustment
    const frequencyMultipliers = {
      'rarely': 1.0,
      'monthly': 1.1,
      'weekly': 1.2,
      'daily': 1.3
    }
    
    // Drink intensity adjustment
    const intensityMultiplier = Math.min(1.5, 1 + (numDrinkCount - 4) * 0.1)
    
    // Calculate final dosage
    const finalDosage = baseDosage * 
      genderMultiplier * 
      durationMultipliers[duration] * 
      frequencyMultipliers[frequency] * 
      intensityMultiplier
  
    // Round to nearest 50mg and cap at reasonable levels
    return {
      preDrinking: Math.min(600, Math.max(150, Math.round(finalDosage / 50) * 50)),
      whileDrinking: Math.min(300, Math.max(150, Math.round(finalDosage * 0.5 / 50) * 50)),
      beforeBed: Math.min(300, Math.max(150, Math.round(finalDosage * 0.5 / 50) * 50))
    }
  } catch (error) {
    console.error('Calculation error:', error)
    // Return safe defaults
    return { preDrinking: 600, whileDrinking: 300, beforeBed: 300 }
  }
}

export const formSchema = {
  gender: {
    required: "Please select your biological sex",
    validate: (value) => ['male', 'female', 'other'].includes(value) || "Invalid selection"
  },
  weight: {
    required: "Please enter your weight",
    min: { value: 40, message: "Weight must be at least 40kg/88lbs" },
    max: { value: 200, message: "Weight must be less than 200kg/440lbs" }
  },
  drinkCount: {
    required: "Please enter number of drinks",
    min: { value: 1, message: "Must be at least 1 drink" },
    max: { value: 20, message: "Maximum 20 drinks" }
  }
}

// Export test data for other agents to use during development
export const testFormData = {
  gender: 'male',
  weight: 75,
  weightUnit: 'kg',
  duration: '2-4 hours',
  drinkCount: 5,
  frequency: 'monthly'
}

// Export test results for Agent 3
export const testResults = calculateDosage(testFormData)