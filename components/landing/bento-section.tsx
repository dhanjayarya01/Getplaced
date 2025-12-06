"use client"

import { Code2, Mic, Terminal, FileText, BarChart3 } from "lucide-react"

export function BentoSection() {
  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Built for serious preparation</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every feature designed to maximize your chances of getting placed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Large card - DSA */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border p-8 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">DSA Mastery</h3>
                <p className="text-muted-foreground max-w-md">
                  500+ curated problems organized by data structure and algorithmic pattern. Track your progress and
                  identify weak areas.
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-3">
              {["Arrays", "Trees", "Graphs", "DP", "Strings", "Stacks", "Heaps", "Linked Lists"].map((topic) => (
                <div key={topic} className="px-3 py-2 bg-secondary rounded-lg text-sm text-center">
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Small card - Analytics */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track progress across all areas with detailed insights.
            </p>
            <div className="space-y-2">
              {[
                { label: "DSA Progress", value: 72 },
                { label: "Interview Ready", value: 85 },
                { label: "Dev Skills", value: 60 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.label}</span>
                    <span className="text-primary">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Small card - Resume */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
            <p className="text-sm text-muted-foreground">
              Create ATS-optimized resumes with AI suggestions and instant feedback.
            </p>
          </div>

          {/* Large card - Mock Interviews */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border p-8 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Mock Interviews</h3>
                <p className="text-muted-foreground">
                  Practice with realistic AI-powered interviews. Choose from technical, behavioral, system design, or
                  company-specific rounds.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["1:1 Voice", "Panel", "Behavioral", "Technical", "System Design", "HR Round"].map((type) => (
                    <span key={type} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full width - Code Arena */}
          <div className="md:col-span-3 bg-card rounded-2xl border border-border p-8 hover:border-primary/50 transition-colors">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Live Code Arena</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Solve real development challenges with our cloud-based coding environment. Monaco editor, live
                  terminal, instant preview - everything you need to practice like you would in a real job.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["React", "Node.js", "Python", "TypeScript", "MongoDB", "Spring Boot", "Docker"].map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-80 bg-secondary rounded-xl p-4 font-mono text-sm">
                <div className="text-muted-foreground">{"// Implement useState hook"}</div>
                <div className="mt-2">
                  <span className="text-accent">function</span> <span className="text-primary">useState</span>
                  <span className="text-muted-foreground">{"<T>(initial: T)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
