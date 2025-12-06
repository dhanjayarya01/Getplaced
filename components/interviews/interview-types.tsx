"use client"

import { Button } from "@/components/ui/button"
import { Mic, Users, Brain, Code2, MessageSquare, Briefcase, Video, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"

const interviewTypes = [
  {
    icon: Mic,
    title: "1:1 Voice Interview",
    description: "Practice with AI voice interviewer. Real-time conversation and instant feedback.",
    color: "bg-primary/10 text-primary",
    duration: "30-45 min",
    href: "/interviews/voice",
  },
  {
    icon: Code2,
    title: "Technical Interview",
    description: "DSA problems with live coding. Explain your approach while solving.",
    color: "bg-accent/10 text-accent",
    duration: "45-60 min",
    href: "/interviews/technical",
  },
  {
    icon: Brain,
    title: "Behavioral Interview",
    description: "STAR method based questions. Build your story bank.",
    color: "bg-chart-3/10 text-chart-3",
    duration: "30 min",
    href: "/interviews/behavioral",
  },
  {
    icon: Users,
    title: "Panel Interview",
    description: "Multiple AI interviewers asking varied questions simultaneously.",
    color: "bg-chart-4/10 text-chart-4",
    duration: "45 min",
    href: "/interviews/panel",
  },
  {
    icon: Layers,
    title: "System Design",
    description: "Design scalable systems. Discuss trade-offs and architecture decisions.",
    color: "bg-chart-5/10 text-chart-5",
    duration: "60 min",
    href: "/interviews/system-design",
  },
  {
    icon: Briefcase,
    title: "HR Round",
    description: "Salary negotiation, company fit, and career goal discussions.",
    color: "bg-primary/10 text-primary",
    duration: "20 min",
    href: "/interviews/hr",
  },
  {
    icon: MessageSquare,
    title: "Group Discussion",
    description: "Practice articulating ideas in group settings with AI participants.",
    color: "bg-accent/10 text-accent",
    duration: "30 min",
    href: "/interviews/gd",
  },
  {
    icon: Video,
    title: "Full Mock Interview",
    description: "Complete interview simulation including all rounds.",
    color: "bg-chart-3/10 text-chart-3",
    duration: "2-3 hours",
    href: "/interviews/full",
  },
]

export function InterviewTypes() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Choose Interview Type</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {interviewTypes.map((type) => (
          <Link
            key={type.title}
            href={type.href}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${type.color}`}>
              <type.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{type.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{type.duration}</span>
              <Button size="sm" variant="ghost" className="text-primary group-hover:bg-primary/10">
                Start
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
