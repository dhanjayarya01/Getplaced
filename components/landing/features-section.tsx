"use client"

import { Code2, Mic, Terminal, Building2, Brain, TrendingUp } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  {
    icon: Code2,
    title: "Structured DSA Learning",
    description:
      "Master data structures and algorithms with our curated roadmap. Filter by topic, pattern, or difficulty level.",
  },
  {
    icon: Mic,
    title: "AI Mock Interviews",
    description:
      "Practice with voice-based AI interviews. Get real-time feedback on technical, behavioral, and system design rounds.",
  },
  {
    icon: Terminal,
    title: "Live Code Arena",
    description:
      "Solve real development problems with our Monaco-powered editor. Run code with live preview and terminal access.",
  },
  {
    icon: Building2,
    title: "Company-Wise Prep",
    description:
      "Prepare for specific companies with their actual interview patterns, question types, and hiring processes.",
  },
  {
    icon: Brain,
    title: "Smart Analytics",
    description:
      "Track your progress with detailed analytics. Identify weak areas and get personalized improvement suggestions.",
  },
  {
    icon: TrendingUp,
    title: "Resume Builder",
    description: "Create ATS-friendly resumes with our AI-powered builder. Get instant feedback and optimization tips.",
  },
]

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">Everything you need to land your dream job</h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            A comprehensive platform designed to take you from learning to landing with structured preparation and
            AI-powered guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:scale-105 hover:-translate-y-2 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              }`}
              style={{ 
                transitionDelay: isVisible ? `${i * 100}ms` : "0ms",
                transitionDuration: "700ms"
              }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
