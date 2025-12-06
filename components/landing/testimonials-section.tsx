import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "GetPlaced helped me crack my Google interview. The company-specific prep was incredibly accurate!",
    author: "Priya Sharma",
    role: "SDE @ Google",
    avatar: "/indian-woman-professional.png",
  },
  {
    quote: "The AI mock interviews gave me the confidence I needed. Felt like talking to a real interviewer.",
    author: "Rahul Kumar",
    role: "SDE II @ Amazon",
    avatar: "/indian-man-developer.jpg",
  },
  {
    quote: "From 0 DSA knowledge to landing at Microsoft in 6 months. The structured roadmap is gold.",
    author: "Sneha Patel",
    role: "Software Engineer @ Microsoft",
    avatar: "/indian-woman-engineer.jpg",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Success stories from our community</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands who have landed their dream jobs using GetPlaced.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full bg-secondary"
                />
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
