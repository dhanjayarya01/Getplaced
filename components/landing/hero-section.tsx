"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Code2, Users, Building2, Terminal, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Glow effect */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground mb-8 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Trusted by 50,000+ developers preparing for placements</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            The complete platform to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">get placed</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Master DSA with structured learning, ace mock interviews with AI feedback, solve real dev problems, and
            prepare company-wise for your dream job.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
              { icon: Code2, label: "DSA Practice", desc: "500+ Problems", href: "/dsa" },
              { icon: Users, label: "Mock Interviews", desc: "AI Powered", href: "/interviews" },
              { icon: Terminal, label: "Code Arena", desc: "Live Coding", href: "/code-arena" },
              { icon: Building2, label: "Company Prep", desc: "100+ Companies", href: "/getplaced" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
              >
                <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold group-hover:text-primary transition-colors">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Code preview mockup */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center text-sm text-muted-foreground font-mono">two-sum.ts</div>
            </div>
            <div className="p-6 font-mono text-sm">
              <pre className="text-muted-foreground">
                <code>
                  <span className="text-chart-3">function</span> <span className="text-primary">twoSum</span>(
                  <span className="text-accent">nums</span>: <span className="text-chart-5">number</span>[],{" "}
                  <span className="text-accent">target</span>: <span className="text-chart-5">number</span>):{" "}
                  <span className="text-chart-5">number</span>[] {"{"}
                  {"\n"}
                  {"  "}
                  <span className="text-chart-3">const</span> map = <span className="text-chart-3">new</span>{" "}
                  <span className="text-chart-5">Map</span>
                  {"<"}
                  <span className="text-chart-5">number</span>, <span className="text-chart-5">number</span>
                  {">"};{"\n"}
                  {"\n"}
                  {"  "}
                  <span className="text-chart-3">for</span> (<span className="text-chart-3">let</span> i ={" "}
                  <span className="text-accent">0</span>; i {"<"} nums.length; i++) {"{"}
                  {"\n"}
                  {"    "}
                  <span className="text-chart-3">const</span> complement = target - nums[i];{"\n"}
                  {"\n"}
                  {"    "}
                  <span className="text-chart-3">if</span> (map.has(complement)) {"{"}
                  {"\n"}
                  {"      "}
                  <span className="text-chart-3">return</span> [map.get(complement)!, i];{"\n"}
                  {"    "}
                  {"}"}
                  {"\n"}
                  {"\n"}
                  {"    "}map.set(nums[i], i);{"\n"}
                  {"  "}
                  {"}"}
                  {"\n"}
                  {"\n"}
                  {"  "}
                  <span className="text-chart-3">return</span> [];{"\n"}
                  {"}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
