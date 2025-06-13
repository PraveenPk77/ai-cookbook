"use client"

import { Button } from "@/components/ui/button"
import { ChefHat, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()

  const scrollToRecipeGenerator = () => {
    // Scroll to the recipe generator section
    const recipeGeneratorSection = document.getElementById("recipe-generator")
    if (recipeGeneratorSection) {
      recipeGeneratorSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToHowItWorks = () => {
    // Scroll to the how it works section
    const howItWorksSection = document.getElementById("how-it-works")
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 hero-gradient" aria-hidden="true" />
      <div
        className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background shadow-xl shadow-primary/10 ring-1 ring-primary/5 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"
        aria-hidden="true"
      />

      <div className="container px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <ChefHat className="h-4 w-4" />
              <span>AI-Powered Recipe Generation</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Transform Ingredients into <span className="text-secondary">Culinary Masterpieces</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Generate professional, customized recipes using advanced AI technology. Simply describe what you're
              looking for, and let our AI chef do the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="rounded-full premium-button" onClick={scrollToRecipeGenerator}>
                Create Recipe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full premium-border" onClick={scrollToHowItWorks}>
                Learn More
              </Button>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">1,000+</span> recipes generated today
              </p>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-secondary/50 opacity-20 blur-xl" />
            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl premium-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1470&auto=format&fit=crop"
                alt="Gourmet dish with herbs and spices"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
