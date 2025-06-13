import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { RecipeGenerator } from "@/components/recipe-generator"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <div id="recipe-generator" className="container px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Generate Your Recipe</h2>
            <p className="text-muted-foreground text-lg">
              Enter your ingredients and preferences below to create a custom recipe tailored just for you.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <RecipeGenerator />
          </div>
        </div>
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
