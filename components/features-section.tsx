import { UtensilsCrossed, Clock, Sparkles, Palette, Globe, Heart } from "lucide-react"

const features = [
  {
    icon: <UtensilsCrossed className="h-6 w-6" />,
    title: "Custom Recipes",
    description: "Generate unique recipes based on ingredients you have or dietary preferences.",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1470&auto=format&fit=crop",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Quick Generation",
    description: "Get complete recipes with instructions in seconds, not minutes.",
    image: "https://images.unsplash.com/photo-1556911073-38141963c9e0?q=80&w=1470&auto=format&fit=crop",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered",
    description: "Leveraging advanced AI models to create professional-quality recipes.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Cuisine Variety",
    description: "Explore recipes from Italian to Japanese and everything in between.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1374&auto=format&fit=crop",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Dietary Options",
    description: "Filter by vegetarian, vegan, gluten-free, and many more dietary needs.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Nutritional Info",
    description: "Get detailed nutritional information for each generated recipe.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1470&auto=format&fit=crop",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Powerful Features for Food Enthusiasts</h2>
          <p className="text-muted-foreground text-lg">
            Our AI-powered platform offers everything you need to create amazing recipes tailored to your preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all duration-200 animate-fade-in premium-card overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-40 -mx-6 -mt-6 mb-6 overflow-hidden">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2 premium-text">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
