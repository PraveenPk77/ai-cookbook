"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  const scrollToRecipeGenerator = () => {
    // Scroll to the recipe generator section
    const recipeGeneratorSection = document.getElementById("recipe-generator")
    if (recipeGeneratorSection) {
      recipeGeneratorSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-foreground/20 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 to-transparent" />

          <div className="relative z-10 px-6 py-12 md:py-16 lg:py-20 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="animate-fade-in">
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
                  Ready to Transform Your Cooking Experience?
                </h2>
                <p className="text-primary-foreground/90 text-lg mb-8 max-w-lg">
                  Join thousands of food enthusiasts who are discovering new recipes and culinary possibilities every
                  day with CulinaryAI.
                </p>
                <Button size="lg" variant="secondary" className="rounded-full" onClick={scrollToRecipeGenerator}>
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="hidden md:block relative">
                <div className="absolute -inset-1 rounded-2xl bg-secondary/20 opacity-70 blur-xl" />
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1556911073-38141963c9e0?q=80&w=1470&auto=format&fit=crop"
                    alt="Chef preparing gourmet meal"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
