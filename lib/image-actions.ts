"use server"

import type { Recipe } from "@/lib/types"

// Collection of high-quality food images for fallback
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1374&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556911073-38141963c9e0?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1481&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1480&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1465&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482049016688-2d84fb2da28d?q=80&w=1470&auto=format&fit=crop",
]

// Function to get a random image from our fallback collection
function getRandomFallbackImage(): string {
  const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length)
  return FALLBACK_IMAGES[randomIndex]
}

// Function to get a relevant image based on recipe type
function getCategorizedFallbackImage(recipe: Recipe): string {
  const { title, tags, ingredients } = recipe
  const lowerTitle = title.toLowerCase()
  const lowerTags = tags.map((tag) => tag.toLowerCase())
  const lowerIngredients = ingredients.map((ing) => ing.toLowerCase())

  // Check for desserts
  if (
    lowerTitle.includes("dessert") ||
    lowerTitle.includes("cake") ||
    lowerTitle.includes("cookie") ||
    lowerTitle.includes("sweet") ||
    lowerTags.includes("dessert") ||
    lowerIngredients.some((ing) => ing.includes("sugar") || ing.includes("chocolate"))
  ) {
    return FALLBACK_IMAGES[9] // Dessert image
  }

  // Check for salads
  if (
    lowerTitle.includes("salad") ||
    lowerTags.includes("salad") ||
    lowerTags.includes("vegetarian") ||
    lowerTags.includes("vegan")
  ) {
    return FALLBACK_IMAGES[2] // Salad image
  }

  // Check for pasta
  if (
    lowerTitle.includes("pasta") ||
    lowerTitle.includes("spaghetti") ||
    lowerIngredients.some((ing) => ing.includes("pasta") || ing.includes("noodle"))
  ) {
    return FALLBACK_IMAGES[8] // Pasta image
  }

  // Check for breakfast
  if (
    lowerTitle.includes("breakfast") ||
    lowerTags.includes("breakfast") ||
    lowerIngredients.some((ing) => ing.includes("egg") || ing.includes("bacon") || ing.includes("toast"))
  ) {
    return FALLBACK_IMAGES[0] // Breakfast image
  }

  // Default to random image
  return getRandomFallbackImage()
}

/**
 * Fetches a relevant image for a recipe
 * Now with robust error handling and fallbacks
 */
export async function fetchRecipeImage(recipe: Recipe): Promise<string> {
  try {
    // Skip the Unsplash API call entirely since we're getting 401 errors
    // Return a categorized fallback image instead
    return getCategorizedFallbackImage(recipe)

    /* Keeping the original code commented out for reference
    const { title, ingredients, tags } = recipe

    // Create a search query based on recipe details
    const mainIngredient = ingredients[0]?.split(" ").pop() || ""
    const searchTerms = [title, mainIngredient, tags[0] || "", "food", "dish", "recipe"].filter(Boolean)

    // Use the first 3 most relevant terms to avoid overly specific queries
    const query = searchTerms.slice(0, 3).join(" ")

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check if we got any results
    if (data.results && data.results.length > 0) {
      // Return the regular sized image
      return data.results[0].urls.regular
    }

    // If no specific results, try a more generic food search
    return fetchGenericFoodImage()
    */
  } catch (error) {
    console.error("Error fetching recipe image:", error)
    // Return a categorized fallback image
    return getCategorizedFallbackImage(recipe)
  }
}

/**
 * This function is no longer used but kept for reference
 */
async function fetchGenericFoodImage(): Promise<string> {
  try {
    // Just return a random fallback image
    return getRandomFallbackImage()
  } catch (error) {
    console.error("Error fetching generic food image:", error)
    return getRandomFallbackImage()
  }
}
