"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  ChefHat,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Cpu,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { generateRecipe } from "@/lib/actions";
import type { Recipe } from "@/lib/types";
import { RecipeDisplay } from "@/components/recipe-display";
import { toast } from "@/components/ui/use-toast";
import { saveRecipeToFirestore } from "../lib/saveRecipeToFirestore";

const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: "Please enter at least one ingredient.",
  }),
  cuisine: z.string().optional(),
  dietary: z.array(z.string()).optional(),
  mealType: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
  { id: "low-carb", label: "Low Carb" },
];

export function RecipeGenerator() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      cuisine: "",
      dietary: [],
      mealType: "",
      additionalInstructions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setError(null);
    setUsingFallback(false);

    const toastId = toast({
      title: "Generating recipe...",
      description: "Please wait while we create your custom recipe with AI.",
    }).id;

    try {
      const generatedRecipe = await generateRecipe(values);
      setRecipe(generatedRecipe);
      setActiveTab("view");

      // ✅ Save to Firestore
      const id = await saveRecipeToFirestore({
        ...generatedRecipe,
        createdAt: new Date(),
      });

      // ✅ Toast confirmation
      toast({
        title: "Recipe saved!",
        description: "Your recipe has been saved to Firestore successfully.",
      });

      toast({
        title: "Recipe generated!",
        description:
          "Your custom recipe is ready to view with a beautiful image.",
      });
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate recipe. Please try again.";

      // Check if we're using fallback
      if (
        errorMessage.includes("falling back") ||
        errorMessage.includes("fallback")
      ) {
        setUsingFallback(true);

        try {
          const fallbackRecipe = await generateRecipe({
            ...values,
            _forceFallback: true,
          });

          setRecipe(fallbackRecipe);
          setActiveTab("view");

          // ✅ Save fallback to Firestore
          await saveRecipeToFirestore({
            ...fallbackRecipe,
            createdAt: new Date(),
            isFallback: true,
          });

          toast({
            title: "Recipe generated with fallback",
            description:
              "We used our built-in recipe generator due to API limitations.",
          });

          setError(null);
        } catch (fallbackError) {
          setError(`Failed to generate recipe: ${errorMessage}`);

          toast({
            title: "Error generating recipe",
            description:
              "Failed to generate recipe even with fallback. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setError(errorMessage);

        try {
          const fallbackRecipe = await generateRecipe({
            ...values,
            _forceFallback: true,
          });

          setRecipe(fallbackRecipe);
          setActiveTab("view");
          setUsingFallback(true);

          // ✅ Save fallback to Firestore
          await saveRecipeToFirestore({
            ...fallbackRecipe,
            createdAt: new Date(),
            isFallback: true,
          });

          toast({
            title: "Recipe generated with fallback",
            description:
              "We encountered an error but were able to generate a recipe using our built-in generator.",
          });
        } catch (fallbackError) {
          toast({
            title: "Error generating recipe",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    setUsingFallback(false);
    const values = form.getValues();
    onSubmit(values);
  };

  const handleForceFallback = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    setUsingFallback(true);
    const values = form.getValues();

    // Force fallback mode
    generateRecipe({
      ...values,
      _forceFallback: true,
    })
      .then((fallbackRecipe) => {
        setRecipe(fallbackRecipe);
        setActiveTab("view");

        toast({
          title: "Recipe generated with fallback",
          description:
            "Using our built-in recipe generator instead of the API.",
        });
      })
      .catch((error) => {
        setError(`Failed to generate fallback recipe: ${error.message}`);

        toast({
          title: "Error generating recipe",
          description:
            "Failed to generate even with fallback. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold premium-text">Recipe Generator</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="flex items-center gap-1 premium-border"
          >
            <Cpu className="h-3 w-3" />
            AI Powered
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 premium-border"
          >
            <ImageIcon className="h-3 w-3" />
            With Images
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry with API
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleForceFallback}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Use Built-in Generator
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {usingFallback && (
        <Alert className="animate-fade-in bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">
            Using Fallback Mode
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            We're currently using our built-in recipe generator due to API
            limitations. Images are still generated using Unsplash.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="generate" className="text-base py-3">
            <ChefHat className="mr-2 h-4 w-4" />
            Generate Recipe
          </TabsTrigger>
          <TabsTrigger
            value="view"
            disabled={!recipe}
            className="text-base py-3"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            View Recipe
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card className="border-2 shadow-lg premium-card">
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base premium-text">
                          Ingredients
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter ingredients separated by commas (e.g., chicken, rice, bell peppers)"
                            className="resize-none min-h-[100px] text-base premium-input"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List the ingredients you have or want to use.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base premium-text">
                            Cuisine Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="text-base premium-input">
                                <SelectValue placeholder="Select cuisine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="italian">Italian</SelectItem>
                              <SelectItem value="mexican">Mexican</SelectItem>
                              <SelectItem value="indian">Indian</SelectItem>
                              <SelectItem value="chinese">Chinese</SelectItem>
                              <SelectItem value="japanese">Japanese</SelectItem>
                              <SelectItem value="thai">Thai</SelectItem>
                              <SelectItem value="mediterranean">
                                Mediterranean
                              </SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="american">American</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a cuisine style (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base premium-text">
                            Meal Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="text-base premium-input">
                                <SelectValue placeholder="Select meal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="breakfast">
                                Breakfast
                              </SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="appetizer">
                                Appetizer
                              </SelectItem>
                              <SelectItem value="dessert">Dessert</SelectItem>
                              <SelectItem value="snack">Snack</SelectItem>
                              <SelectItem value="drink">Drink</SelectItem>
                              <SelectItem value="soup">Soup</SelectItem>
                              <SelectItem value="salad">Salad</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a meal type (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dietary"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base premium-text">
                            Dietary Preferences
                          </FormLabel>
                          <FormDescription>
                            Select any dietary restrictions or preferences.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {dietaryOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="dietary"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm premium-border"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                option.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-base cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base premium-text">
                          Additional Instructions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific instructions or preferences (e.g., quick meal, spicy, kid-friendly)"
                            className="resize-none min-h-[80px] text-base premium-input"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add any additional details to customize your recipe.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="flex-1 relative overflow-hidden group premium-button"
                      size="lg"
                      disabled={isGenerating}
                    >
                      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full bg-gradient-to-r from-primary-foreground/20 to-transparent group-hover:translate-x-0"></span>
                      <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-full bg-gradient-to-r from-transparent to-primary-foreground/20 group-hover:translate-x-0"></span>
                      <span className="relative flex items-center justify-center">
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ChefHat className="mr-2 h-5 w-5" />
                            Generate with AI
                          </>
                        )}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="sm:w-auto premium-border"
                      size="lg"
                      disabled={isGenerating}
                      onClick={handleForceFallback}
                    >
                      <span className="relative flex items-center justify-center">
                        <ChefHat className="mr-2 h-5 w-5" />
                        Use Built-in Generator
                      </span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view" className="animate-fade-in">
          {recipe && <RecipeDisplay recipe={recipe} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
