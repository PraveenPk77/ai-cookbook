import { Check } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Enter Your Ingredients",
    description: "Start by entering the ingredients you have on hand or want to use in your recipe.",
  },
  {
    number: "02",
    title: "Customize Your Preferences",
    description: "Select cuisine type, dietary restrictions, and meal type to personalize your recipe.",
  },
  {
    number: "03",
    title: "Generate Your Recipe",
    description: "Our AI analyzes your inputs and creates a custom recipe with detailed instructions.",
  },
  {
    number: "04",
    title: "Cook and Enjoy",
    description: "Follow the step-by-step instructions to prepare your delicious meal.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How CulinaryAI Works</h2>
          <p className="text-muted-foreground text-lg">
            Creating personalized recipes has never been easier. Follow these simple steps to generate your next
            culinary masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="mb-4">
                <span className="text-5xl font-bold text-primary/20 font-heading">{step.number}</span>
              </div>
              <h3 className="text-xl font-medium mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border">
                  <div className="absolute -right-3 -top-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
