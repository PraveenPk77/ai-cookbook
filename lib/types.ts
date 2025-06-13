export interface Recipe {
  title: string
  description: string
  image?: string
  prepTime: string
  cookTime: string
  servings: number
  ingredients: string[]
  instructions: string[]
  tags: string[]
  tips?: string[]
  nutritionFacts?: {
    calories?: string
    protein?: string
    carbs?: string
    fat?: string
    [key: string]: string | undefined
  }
}

export interface RecipeGenerationParams {
  ingredients: string
  cuisine?: string
  dietary?: string[]
  mealType?: string
  additionalInstructions?: string
  _forceFallback?: boolean // Added flag to force fallback generation
}
