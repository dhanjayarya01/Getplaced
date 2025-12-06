"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation(0.3)

  const stats = [
    { value: "50K+", label: "Active Users", company: "Growing daily" },
    { value: "98%", label: "Success Rate", company: "Placement success" },
    { value: "500+", label: "DSA Problems", company: "Curated collection" },
    { value: "100+", label: "Companies", company: "Interview patterns" },
  ]

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 border-y border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`text-center transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ 
                transitionDelay: isVisible ? `${i * 150}ms` : "0ms"
              }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-foreground font-medium mt-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.company}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
