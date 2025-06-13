"use client"

import { useState } from "react"
import { Clock, Users, ChefHat, Printer, Share2, Bookmark, Heart, Star, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Recipe } from "@/lib/types"

interface RecipeDisplayProps {
  recipe: Recipe
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCookNow = () => {
    // Scroll to the instructions tab
    const instructionsTab = document.querySelector('[value="instructions"]') as HTMLElement
    if (instructionsTab) {
      instructionsTab.click()
    }

    toast({
      title: "Let's start cooking!",
      description: `You're now ready to cook ${recipe.title}. Follow the instructions step by step.`,
    })
  }

  const handleShare = () => {
    // Copy recipe title and description to clipboard
    const text = `Check out this recipe: ${recipe.title} - ${recipe.description}`
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Recipe copied to clipboard",
          description: "You can now share it with your friends!",
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Failed to copy",
          description: "Could not copy the recipe to clipboard.",
          variant: "destructive",
        })
      },
    )
  }

  const handleImageError = () => {
    console.log("Image failed to load, using fallback")
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <Card className="overflow-hidden border-2 shadow-lg animate-fade-in premium-card">
      <div className="recipe-image-container h-[400px] w-full relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <Skeleton className="h-[400px] w-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center justify-center p-4">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2 animate-pulse" />
                <p className="text-muted-foreground">Loading recipe image...</p>
              </div>
            </div>
          </div>
        )}

        <img
          src={recipe.image || "/placeholder.svg?height=400&width=800"}
          alt={recipe.title}
          className={`object-cover w-full h-full transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />

        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl md:text-4xl font-heading font-bold">{recipe.title}</CardTitle>
            <CardDescription className="text-lg mt-2">{recipe.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full premium-border ${isLiked ? "text-red-500 border-red-500" : ""}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              <span className="sr-only">Like</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full premium-border ${isSaved ? "text-primary border-primary" : ""}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-primary" : ""}`} />
              <span className="sr-only">Save</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 premium-border">
            <Clock className="h-5 w-5 mb-1 text-primary" />
            <span className="text-sm text-muted-foreground">Prep Time</span>
            <span className="font-medium">{recipe.prepTime}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 premium-border">
            <Clock className="h-5 w-5 mb-1 text-primary" />
            <span className="text-sm text-muted-foreground">Cook Time</span>
            <span className="font-medium">{recipe.cookTime}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 premium-border">
            <Users className="h-5 w-5 mb-1 text-primary" />
            <span className="text-sm text-muted-foreground">Servings</span>
            <span className="font-medium">{recipe.servings}</span>
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="pt-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center premium-text">
                <ChefHat className="mr-2 h-5 w-5 text-primary" /> Ingredients
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-6">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start p-2 hover:bg-muted/50 rounded-md transition-colors">
                    <span className="mr-2 text-primary">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="instructions" className="pt-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 premium-text">Instructions</h3>
              <ol className="space-y-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="recipe-step" data-step={index + 1}>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </TabsContent>
          <TabsContent value="nutrition" className="pt-6">
            {recipe.nutritionFacts ? (
              <div>
                <h3 className="text-xl font-semibold mb-4 premium-text">Nutrition Facts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutritionFacts).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-muted/50 rounded-md premium-border">
                      <div className="text-sm text-muted-foreground capitalize">{key}</div>
                      <div className="font-medium text-lg">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nutrition information not available for this recipe.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {recipe.tips && recipe.tips.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center premium-text">
                <Star className="mr-2 h-5 w-5 text-primary" /> Chef's Tips
              </h3>
              <ul className="space-y-3">
                {recipe.tips.map((tip, index) => (
                  <li key={index} className="flex items-start bg-muted/30 p-3 rounded-lg premium-border">
                    <span className="mr-2 text-primary">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 pb-6">
        <Button variant="outline" onClick={() => window.print()} className="gap-2 premium-border">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 premium-border" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2 premium-button" onClick={handleCookNow}>
            <ChefHat className="h-4 w-4" />
            Cook Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
