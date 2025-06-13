"use server"

import type { Recipe, RecipeGenerationParams } from "@/lib/types"
import { fetchRecipeImage } from "@/lib/image-actions"

// Your Cohere API key - stored server-side only
const COHERE_API_KEY = "AcTtxDQOyN7bcVN7L1erCxIVE0hQXX5ujzbq38xs"

export async function generateRecipe(params: RecipeGenerationParams): Promise<Recipe> {
  const { ingredients, cuisine, dietary, mealType, additionalInstructions, _forceFallback } = params

  // If _forceFallback is true, skip the API call and go straight to fallback
  if (_forceFallback) {
    console.log("Forced fallback mode, using local recipe generator...")
    const recipe = createFallbackRecipe(ingredients, cuisine, dietary, mealType, additionalInstructions)

    // Fetch an image for the recipe
    try {
      recipe.image = await fetchRecipeImage(recipe)
    } catch (imageError) {
      console.error("Error fetching recipe image:", imageError)
      // Use a placeholder if image fetching fails
      recipe.image = "/placeholder.svg?height=400&width=800"
    }

    return recipe
  }

  try {
    // Try with direct fetch to Cohere API first
    try {
      console.log("Generating recipe with Cohere API...")
      const recipe = await fetchCohereRecipe(ingredients, cuisine, dietary, mealType, additionalInstructions)

      // Fetch an image for the recipe
      try {
        recipe.image = await fetchRecipeImage(recipe)
      } catch (imageError) {
        console.error("Error fetching recipe image:", imageError)
        // Use a placeholder if image fetching fails
        recipe.image = "/placeholder.svg?height=400&width=800"
      }

      return recipe
    } catch (cohereError) {
      console.error("Cohere API error:", cohereError)

      // If Cohere API call fails, fall back to the local recipe generator
      console.log("API call failed, falling back to local recipe generator...")
      const recipe = createFallbackRecipe(ingredients, cuisine, dietary, mealType, additionalInstructions)

      // Fetch an image for the recipe
      try {
        recipe.image = await fetchRecipeImage(recipe)
      } catch (imageError) {
        console.error("Error fetching recipe image:", imageError)
        // Use a placeholder if image fetching fails
        recipe.image = "/placeholder.svg?height=400&width=800"
      }

      return recipe
    }
  } catch (error) {
    console.error("Recipe generation error:", error)
    throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Function to fetch recipe from Cohere API directly
async function fetchCohereRecipe(
  ingredients: string,
  cuisine?: string,
  dietary?: string[],
  mealType?: string,
  additionalInstructions?: string,
): Promise<Recipe> {
  const prompt = buildPrompt(ingredients, cuisine, dietary, mealType, additionalInstructions)

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Cohere API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Extract the text from the response
    const text = data.generations[0].text
    console.log("Raw Cohere response:", text)

    // Try to find JSON in the response
    // Look for JSON object pattern - anything between curly braces including nested braces
    const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g
    const jsonMatches = text.match(jsonRegex)

    if (jsonMatches && jsonMatches.length > 0) {
      // Use the first match that looks like a complete JSON object
      let jsonText = jsonMatches[0]

      // Clean up the JSON text to handle common issues
      // 1. Fix trailing commas in arrays and objects which are invalid in JSON
      jsonText = jsonText.replace(/,(\s*[\]}])/g, "$1")

      // 2. Ensure all property names are double-quoted
      jsonText = jsonText.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')

      console.log("Extracted JSON:", jsonText)

      try {
        // Parse the JSON
        const recipeData = JSON.parse(jsonText.trim())
        return formatRecipeData(recipeData, ingredients, cuisine, mealType)
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError)
        throw new Error(`Failed to parse extracted JSON: ${parseError.message}`)
      }
    } else {
      // If no JSON object is found, try to extract structured data from the text
      console.log("No JSON object found, attempting to extract structured data")
      return extractRecipeFromText(text, ingredients, cuisine, dietary, mealType)
    }
  } catch (error) {
    console.error("Cohere API fetch error:", error)
    throw error
  }
}

// Function to extract recipe data from text when JSON parsing fails
function extractRecipeFromText(
  text: string,
  ingredients: string,
  cuisine?: string,
  dietary?: string[],
  mealType?: string,
): Recipe {
  // Default recipe structure
  const recipe: Recipe = {
    title: `Recipe with ${ingredients}`,
    description: `A delicious recipe using ${ingredients}`,
    prepTime: "15 minutes",
    cookTime: "30 minutes",
    servings: 4,
    ingredients: ingredients.split(",").map((i) => i.trim()),
    instructions: ["Cook the ingredients", "Serve and enjoy"],
    tags: [cuisine || "homemade", mealType || "main dish"],
    tips: ["Use fresh ingredients for best results"],
    nutritionFacts: {
      calories: "Approximately 350-450 per serving",
      protein: "15-25g per serving",
      carbs: "30-45g per serving",
      fat: "10-20g per serving",
    },
  }

  // Try to extract title
  const titleMatch = text.match(/Title:?\s*([^\n]+)/i) || text.match(/Recipe:?\s*([^\n]+)/i)
  if (titleMatch && titleMatch[1]) {
    recipe.title = titleMatch[1].trim()
  }

  // Try to extract description
  const descMatch = text.match(/Description:?\s*([^\n]+(\n[^\n]+)*)/i)
  if (descMatch && descMatch[1]) {
    recipe.description = descMatch[1].trim()
  }

  // Try to extract prep time
  const prepMatch = text.match(/Prep\s*Time:?\s*([^\n]+)/i)
  if (prepMatch && prepMatch[1]) {
    recipe.prepTime = prepMatch[1].trim()
  }

  // Try to extract cook time
  const cookMatch = text.match(/Cook\s*Time:?\s*([^\n]+)/i)
  if (cookMatch && cookMatch[1]) {
    recipe.cookTime = cookMatch[1].trim()
  }

  // Try to extract servings
  const servingsMatch = text.match(/Servings:?\s*(\d+)/i)
  if (servingsMatch && servingsMatch[1]) {
    recipe.servings = Number.parseInt(servingsMatch[1], 10)
  }

  // Try to extract ingredients
  const ingredientsSection = text.match(/Ingredients:?\s*([\s\S]*?)(?=Instructions:|Directions:|Steps:|$)/i)
  if (ingredientsSection && ingredientsSection[1]) {
    const ingredientLines = ingredientsSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^ingredients:?$/i))
      .map((line) => line.replace(/^[•\-*]\s*/, "")) // Remove bullet points

    if (ingredientLines.length > 0) {
      recipe.ingredients = ingredientLines
    }
  }

  // Try to extract instructions
  const instructionsSection = text.match(
    /(?:Instructions|Directions|Steps):?\s*([\s\S]*?)(?=Tips:|Notes:|Nutrition:|$)/i,
  )
  if (instructionsSection && instructionsSection[1]) {
    const instructionLines = instructionsSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^(?:instructions|directions|steps):?$/i))
      .map((line) => line.replace(/^[•\-*\d]+\.?\s*/, "")) // Remove numbers, bullet points

    if (instructionLines.length > 0) {
      recipe.instructions = instructionLines
    }
  }

  // Try to extract tips
  const tipsSection = text.match(/(?:Tips|Notes|Chef's Tips):?\s*([\s\S]*?)(?=Nutrition:|$)/i)
  if (tipsSection && tipsSection[1]) {
    const tipLines = tipsSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^(?:tips|notes|chef's tips):?$/i))
      .map((line) => line.replace(/^[•\-*\d]+\.?\s*/, "")) // Remove numbers, bullet points

    if (tipLines.length > 0) {
      recipe.tips = tipLines
    }
  }

  // Try to extract tags
  const tagsMatch = text.match(/Tags:?\s*([^\n]+)/i)
  if (tagsMatch && tagsMatch[1]) {
    const tags = tagsMatch[1]
      .split(/,|;/)
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    if (tags.length > 0) {
      recipe.tags = tags
    }
  }

  // Try to extract nutrition facts
  const nutritionSection = text.match(/Nutrition(?:\s*Facts)?:?\s*([\s\S]*?)(?=$)/i)
  if (nutritionSection && nutritionSection[1]) {
    const nutritionText = nutritionSection[1]

    // Extract calories
    const caloriesMatch = nutritionText.match(/Calories:?\s*([^\n,;]+)/i)
    if (caloriesMatch && caloriesMatch[1]) {
      recipe.nutritionFacts!.calories = caloriesMatch[1].trim()
    }

    // Extract protein
    const proteinMatch = nutritionText.match(/Protein:?\s*([^\n,;]+)/i)
    if (proteinMatch && proteinMatch[1]) {
      recipe.nutritionFacts!.protein = proteinMatch[1].trim()
    }

    // Extract carbs
    const carbsMatch = nutritionText.match(/Carbs:?\s*([^\n,;]+)/i)
    if (carbsMatch && carbsMatch[1]) {
      recipe.nutritionFacts!.carbs = carbsMatch[1].trim()
    }

    // Extract fat
    const fatMatch = nutritionText.match(/Fat:?\s*([^\n,;]+)/i)
    if (fatMatch && fatMatch[1]) {
      recipe.nutritionFacts!.fat = fatMatch[1].trim()
    }
  }

  return recipe
}

// Helper function to format and validate recipe data
function formatRecipeData(recipeData: any, ingredients: string, cuisine?: string, mealType?: string): Recipe {
  // Ensure the recipe has all required fields
  return {
    title: recipeData.title || `Recipe with ${ingredients}`,
    description: recipeData.description || `A delicious recipe using ${ingredients}`,
    prepTime: recipeData.prepTime || "15 minutes",
    cookTime: recipeData.cookTime || "30 minutes",
    servings: Number(recipeData.servings) || 4,
    ingredients: Array.isArray(recipeData.ingredients)
      ? recipeData.ingredients
      : ingredients.split(",").map((i) => i.trim()),
    instructions: Array.isArray(recipeData.instructions)
      ? recipeData.instructions
      : ["Cook the ingredients", "Serve and enjoy"],
    tags: Array.isArray(recipeData.tags) ? recipeData.tags : [cuisine || "homemade", mealType || "main dish"],
    tips: Array.isArray(recipeData.tips) ? recipeData.tips : ["Use fresh ingredients for best results"],
    nutritionFacts: recipeData.nutritionFacts || {
      calories: "Approximately 350-450 per serving",
      protein: "15-25g per serving",
      carbs: "30-45g per serving",
      fat: "10-20g per serving",
    },
  }
}

// Helper function to build the prompt
function buildPrompt(
  ingredients: string,
  cuisine?: string,
  dietary?: string[],
  mealType?: string,
  additionalInstructions?: string,
): string {
  // Start with a clear instruction to return JSON only
  let prompt = `Return ONLY a JSON object with no additional text before or after. The JSON should contain a recipe using these ingredients: ${ingredients}.`

  if (cuisine) {
    prompt += ` The cuisine should be ${cuisine}.`
  }

  if (dietary && dietary.length > 0) {
    prompt += ` The recipe should be ${dietary.join(", ")}.`
  }

  if (mealType) {
    prompt += ` This should be a ${mealType} recipe.`
  }

  if (additionalInstructions) {
    prompt += ` Additional instructions: ${additionalInstructions}.`
  }

  prompt += ` The JSON object should have the following structure exactly:
{
  "title": "Recipe Title",
  "description": "Brief description of the recipe",
  "prepTime": "Preparation time",
  "cookTime": "Cooking time",
  "servings": number of servings,
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "tags": ["tag1", "tag2", ...],
  "tips": ["tip 1", "tip 2", ...],
  "nutritionFacts": {
    "calories": "calorie info",
    "protein": "protein info",
    "carbs": "carbs info",
    "fat": "fat info"
  }
}

Do not include any explanations, notes, or text outside of the JSON object. Return only valid JSON.`

  return prompt
}

// Function to create a fallback recipe when API fails
function createFallbackRecipe(
  ingredients: string,
  cuisine?: string,
  dietary?: string[],
  mealType?: string,
  additionalInstructions?: string,
): Recipe {
  const ingredientsList = ingredients.split(",").map((item) => item.trim())
  const mainIngredient = ingredientsList[0]

  // Generate a more descriptive title based on inputs
  let title = ""
  if (cuisine && mealType) {
    title = `${capitalize(cuisine)} ${capitalize(mealType)} with ${capitalize(mainIngredient)}`
  } else if (cuisine) {
    title = `${capitalize(cuisine)}-Style ${capitalize(mainIngredient)} Dish`
  } else if (mealType) {
    title = `${capitalize(mainIngredient)} ${capitalize(mealType)}`
  } else {
    title = `${capitalize(mainIngredient)} Delight`
  }

  // Generate a more descriptive description
  let description = `A delicious`
  if (dietary && dietary.length > 0) {
    description += ` ${dietary.join(", ")}`
  }
  if (cuisine) {
    description += ` ${cuisine}-inspired`
  }
  if (mealType) {
    description += ` ${mealType}`
  }
  description += ` featuring ${mainIngredient} and complementary ingredients.`
  if (additionalInstructions) {
    description += ` ${additionalInstructions}.`
  }

  // Generate more realistic cooking times based on meal type
  let prepTime = "15 minutes"
  let cookTime = "30 minutes"

  if (mealType === "breakfast") {
    prepTime = "10 minutes"
    cookTime = "15 minutes"
  } else if (mealType === "dessert") {
    prepTime = "20 minutes"
    cookTime = "25 minutes"
  } else if (mealType === "dinner") {
    prepTime = "20 minutes"
    cookTime = "40 minutes"
  }

  // Generate more realistic instructions based on ingredients and cuisine
  const instructions = generateInstructions(ingredientsList, cuisine, mealType)

  // Generate appropriate tags
  const tags = [
    cuisine || "homemade",
    mealType || "main dish",
    ...(dietary || []),
    `${mainIngredient}-based`,
    ingredientsList.length <= 5 ? "simple" : "complex",
    "quick",
  ]

  // Generate cooking tips
  const tips = generateCookingTips(ingredientsList, cuisine, dietary)

  return {
    title,
    description,
    prepTime,
    cookTime,
    servings: 4,
    ingredients: ingredientsList.map((ingredient) => formatIngredient(ingredient)),
    instructions,
    tags,
    tips,
    nutritionFacts: {
      calories: "Approximately 350-450 per serving",
      protein: "15-25g per serving",
      carbs: "30-45g per serving",
      fat: "10-20g per serving",
    },
  }
}

// Helper functions remain the same
function capitalize(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatIngredient(ingredient: string): string {
  // Common measurements
  const measurements = ["cup", "tablespoon", "teaspoon", "pound", "ounce", "gram"]
  const measurement = measurements[Math.floor(Math.random() * measurements.length)]
  const amount = Math.floor(Math.random() * 3) + 1

  // Format based on ingredient type
  if (
    ingredient.includes("salt") ||
    ingredient.includes("pepper") ||
    ingredient.includes("spice") ||
    ingredient.includes("herb")
  ) {
    return `${ingredient} - to taste`
  } else if (ingredient.includes("oil") || ingredient.includes("sauce") || ingredient.includes("vinegar")) {
    return `${amount} ${amount === 1 ? "tablespoon" : "tablespoons"} ${ingredient}`
  } else {
    return `${amount} ${amount === 1 ? measurement : measurement + "s"} ${ingredient}`
  }
}

function generateInstructions(ingredients: string[], cuisine?: string, mealType?: string): string[] {
  const mainIngredient = ingredients[0]
  const instructions = [`Prepare all ingredients: wash and chop ${ingredients.slice(0, 3).join(", ")} as needed.`]

  // Add cuisine-specific preparation step
  if (cuisine === "italian") {
    instructions.push(`Heat olive oil in a large pan over medium heat.`)
  } else if (cuisine === "asian" || cuisine === "chinese" || cuisine === "japanese" || cuisine === "thai") {
    instructions.push(`Heat a wok or large skillet over high heat.`)
  } else if (cuisine === "indian") {
    instructions.push(`In a large pot, heat ghee or oil over medium heat and add your spices to bloom.`)
  } else {
    instructions.push(`Heat a large pan over medium heat with a bit of oil or butter.`)
  }

  // Add main ingredient cooking step
  instructions.push(`Add ${mainIngredient} to the pan and cook until ${getMainIngredientCookingState(mainIngredient)}.`)

  // Add remaining ingredients
  if (ingredients.length > 1) {
    instructions.push(
      `Add ${ingredients.slice(1, 4).join(", ")} and continue cooking for another 5-7 minutes, stirring occasionally.`,
    )
  }

  // Add seasoning step
  instructions.push(`Season with salt, pepper, and your preferred herbs or spices.`)

  // Add final steps based on meal type
  if (mealType === "soup" || ingredients.some((i) => i.includes("broth") || i.includes("stock"))) {
    instructions.push(`Add broth or water, bring to a boil, then reduce heat and simmer for 15-20 minutes.`)
    instructions.push(`Serve hot with your favorite garnishes.`)
  } else if (mealType === "salad") {
    instructions.push(`Toss all ingredients together in a large bowl.`)
    instructions.push(`Drizzle with dressing and serve immediately.`)
  } else if (mealType === "dessert") {
    instructions.push(`Mix all ingredients until well combined.`)
    instructions.push(`Bake at 350°F (175°C) for 25-30 minutes or until golden brown.`)
    instructions.push(`Allow to cool before serving.`)
  } else {
    instructions.push(`Cook until all ingredients are properly cooked through and flavors have melded together.`)
    instructions.push(`Serve hot and enjoy your delicious meal!`)
  }

  return instructions
}

function getMainIngredientCookingState(ingredient: string): string {
  if (
    ingredient.includes("chicken") ||
    ingredient.includes("beef") ||
    ingredient.includes("pork") ||
    ingredient.includes("meat")
  ) {
    return "browned and cooked through"
  } else if (ingredient.includes("onion") || ingredient.includes("garlic") || ingredient.includes("shallot")) {
    return "translucent and fragrant"
  } else if (ingredient.includes("vegetable") || ingredient.includes("pepper") || ingredient.includes("carrot")) {
    return "slightly softened but still crisp"
  } else if (ingredient.includes("rice") || ingredient.includes("pasta") || ingredient.includes("grain")) {
    return "cooked according to package instructions"
  } else {
    return "properly cooked"
  }
}

function generateCookingTips(ingredients: string[], cuisine?: string, dietary?: string[]): string[] {
  const tips = [
    "Adjust seasoning to taste before serving.",
    "For best results, use fresh ingredients whenever possible.",
  ]

  // Add ingredient-specific tips
  if (
    ingredients.some((i) => i.includes("meat") || i.includes("chicken") || i.includes("beef") || i.includes("pork"))
  ) {
    tips.push("Let meat rest for 5 minutes before serving for juicier results.")
  }

  if (ingredients.some((i) => i.includes("garlic") || i.includes("onion"))) {
    tips.push("Don't burn the garlic or onions as they can become bitter.")
  }

  // Add cuisine-specific tips
  if (cuisine === "italian") {
    tips.push("For authentic Italian flavor, finish with a drizzle of high-quality olive oil and fresh basil.")
  } else if (cuisine === "mexican") {
    tips.push("Serve with fresh lime wedges to brighten the flavors.")
  } else if (cuisine === "indian") {
    tips.push("Blooming spices in hot oil at the beginning enhances their flavor significantly.")
  }

  // Add dietary-specific tips
  if (dietary?.includes("vegetarian") || dietary?.includes("vegan")) {
    tips.push("Add nutritional yeast for a savory, cheese-like flavor that's plant-based.")
  }

  if (dietary?.includes("gluten-free")) {
    tips.push("Always check packaged ingredients to ensure they're certified gluten-free.")
  }

  return tips
}
