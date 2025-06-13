import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "CulinaryAI has transformed how I cook at home. I can now create restaurant-quality meals with whatever ingredients I have in my fridge!",
    author: "Sarah Johnson",
    role: "Home Cook",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "As a professional chef, I use CulinaryAI for inspiration. The recipes are creative and technically sound - a great starting point for my own creations.",
    author: "Chef Michael Rodriguez",
    role: "Executive Chef",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "I have dietary restrictions that make finding recipes difficult. CulinaryAI generates perfect recipes that meet all my needs without sacrificing flavor.",
    author: "Emma Thompson",
    role: "Nutrition Coach",
    rating: 4,
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied users who have transformed their cooking experience with CulinaryAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 shadow-sm border border-border/50 premium-card hover:shadow-md transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                  />
                ))}
              </div>
              <blockquote className="chef-quote mb-6">{testimonial.quote}</blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 mr-3 overflow-hidden">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
