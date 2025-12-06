"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Code2, Users, Building2, Terminal, Sparkles } from "lucide-react"
import Link from "next/link"
import { TypingText } from "@/components/ui/typing-text"
import { CodePreview } from "@/components/landing/code-preview"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Glow effect */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-8 border border-border opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Trusted by 50,000+ developers preparing for placements</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
            The complete
            <br />
            platform to{" "}
            <span className="inline-block min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[480px] text-left">
              <TypingText text="get placed" />
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
            Master DSA with structured learning, ace mock interviews with AI feedback, solve real dev problems, and
            prepare company-wise for your dream job.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base">
                Start Preparing Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="group bg-transparent h-12 text-base">
              <Play className="mr-2 w-4 h-4 group-hover:text-primary transition-colors" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Code2, label: "DSA Practice", desc: "500+ Problems", href: "/dsa", delay: "1.0s" },
              { icon: Users, label: "Mock Interviews", desc: "AI Powered", href: "/interviews", delay: "1.1s" },
              { icon: Terminal, label: "Code Arena", desc: "Live Coding", href: "/code-arena", delay: "1.2s" },
              { icon: Building2, label: "Company Prep", desc: "100+ Companies", href: "/getplaced", delay: "1.3s" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group opacity-0"
                style={{ animation: `fadeInUp 0.6s ease-out ${item.delay} forwards` }}
              >
                <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold group-hover:text-primary transition-colors">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Code preview mockup with animation */}
        <CodePreview />
      </div>
    </section>
  )
}
