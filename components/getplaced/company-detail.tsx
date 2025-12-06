"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  MapPin,
  Users,
  Globe,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle,
  Play,
  FileText,
  ArrowRight,
  Star,
  TrendingUp,
  Code,
  MessageSquare,
  Building2,
  Calendar,
  DollarSign,
  Target,
  BookOpen,
  Video,
} from "lucide-react"
import Link from "next/link"

interface CompanyDetailProps {
  companyId: string
}

const companyData: Record<
  string,
  {
    name: string
    logo: string
    locations: string[]
    employees: string
    website: string
    description: string
    avgPackage: string
    requirements: string
    interviewDuration: string
    successRate: string
    difficulty: "Easy" | "Medium" | "Hard"
    roles: { title: string; package: string; openings: number }[]
    interviewRounds: { name: string; duration: string; description: string; type: string; tips: string[] }[]
    popularQuestions: { title: string; type: string; difficulty: string; frequency: string }[]
  }
> = {
  amazon: {
    name: "Amazon",
    logo: "/amazon-logo.png",
    locations: ["Bangalore", "Hyderabad", "Chennai"],
    employees: "1.5M+",
    website: "amazon.com",
    description:
      "Amazon is a multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence. Known for their Leadership Principles and rigorous interview process.",
    avgPackage: "18-35 LPA",
    requirements: "B.Tech/M.Tech, 60%+ aggregate",
    interviewDuration: "4-6 weeks",
    successRate: "2-3%",
    difficulty: "Hard",
    roles: [
      { title: "SDE I", package: "18-24 LPA", openings: 150 },
      { title: "SDE II", package: "28-38 LPA", openings: 80 },
      { title: "Senior SDE", package: "45-60 LPA", openings: 40 },
    ],
    interviewRounds: [
      {
        name: "Online Assessment",
        duration: "90 min",
        description: "2 coding problems + work simulation",
        type: "coding",
        tips: ["Practice medium-hard LC problems", "Focus on optimal solutions", "Time management is key"],
      },
      {
        name: "Phone Screen",
        duration: "45 min",
        description: "1 coding problem + LP questions",
        type: "technical",
        tips: ["Explain your thought process", "Ask clarifying questions", "Practice STAR method"],
      },
      {
        name: "On-site Round 1",
        duration: "60 min",
        description: "DSA + Problem Solving",
        type: "dsa",
        tips: ["Master Trees, Graphs, DP", "Write clean code", "Discuss trade-offs"],
      },
      {
        name: "On-site Round 2",
        duration: "60 min",
        description: "System Design / LLD",
        type: "system-design",
        tips: ["Know scalability basics", "Practice common systems", "Draw clear diagrams"],
      },
      {
        name: "Bar Raiser",
        duration: "60 min",
        description: "Behavioral + Leadership Principles",
        type: "behavioral",
        tips: ["Know all 16 LPs", "Prepare 2-3 stories per LP", "Be specific with examples"],
      },
      {
        name: "Hiring Manager",
        duration: "45 min",
        description: "Team fit + Final assessment",
        type: "hr",
        tips: ["Research the team", "Show enthusiasm", "Ask thoughtful questions"],
      },
    ],
    popularQuestions: [
      { title: "Two Sum", type: "DSA", difficulty: "Easy", frequency: "Very High" },
      { title: "LRU Cache", type: "DSA", difficulty: "Medium", frequency: "High" },
      { title: "Merge K Sorted Lists", type: "DSA", difficulty: "Hard", frequency: "High" },
      { title: "Design URL Shortener", type: "System Design", difficulty: "Medium", frequency: "Very High" },
      {
        title: "Tell me about a time you disagreed with your manager",
        type: "Behavioral",
        difficulty: "Medium",
        frequency: "Very High",
      },
    ],
  },
  google: {
    name: "Google",
    logo: "/google-logo.png",
    locations: ["Bangalore", "Hyderabad", "Gurgaon"],
    employees: "180K+",
    website: "google.com",
    description:
      "Google is a leading technology company specializing in search, cloud computing, and AI. Known for their challenging coding interviews and focus on problem-solving ability.",
    avgPackage: "25-50 LPA",
    requirements: "B.Tech/M.Tech, Strong CS fundamentals",
    interviewDuration: "6-8 weeks",
    successRate: "0.5-1%",
    difficulty: "Hard",
    roles: [
      { title: "L3 SWE", package: "25-32 LPA", openings: 100 },
      { title: "L4 SWE", package: "40-55 LPA", openings: 60 },
      { title: "L5 Senior SWE", package: "65-85 LPA", openings: 30 },
    ],
    interviewRounds: [
      {
        name: "Phone Screen 1",
        duration: "45 min",
        description: "Coding + Algorithm",
        type: "coding",
        tips: ["Focus on optimal solutions", "Think aloud"],
      },
      {
        name: "Phone Screen 2",
        duration: "45 min",
        description: "Coding + Data Structures",
        type: "coding",
        tips: ["Practice graph algorithms", "Master recursion"],
      },
      {
        name: "On-site Coding 1",
        duration: "45 min",
        description: "Algorithm Design",
        type: "dsa",
        tips: ["Start with brute force", "Optimize step by step"],
      },
      {
        name: "On-site Coding 2",
        duration: "45 min",
        description: "Data Structures",
        type: "dsa",
        tips: ["Know all DS implementations", "Discuss complexity"],
      },
      {
        name: "System Design",
        duration: "45 min",
        description: "Distributed Systems",
        type: "system-design",
        tips: ["Know Google scale systems", "Discuss trade-offs"],
      },
      {
        name: "Googliness",
        duration: "45 min",
        description: "Culture fit + Behavioral",
        type: "behavioral",
        tips: ["Be yourself", "Show collaborative spirit"],
      },
    ],
    popularQuestions: [
      { title: "Median of Two Sorted Arrays", type: "DSA", difficulty: "Hard", frequency: "High" },
      { title: "Word Ladder", type: "DSA", difficulty: "Hard", frequency: "High" },
      { title: "Design Google Search", type: "System Design", difficulty: "Hard", frequency: "Medium" },
    ],
  },
  microsoft: {
    name: "Microsoft",
    logo: "/microsoft-logo.png",
    locations: ["Bangalore", "Hyderabad", "Noida"],
    employees: "220K+",
    website: "microsoft.com",
    description:
      "Microsoft is a global technology leader in software, cloud services, and enterprise solutions. Known for balanced interviews testing both technical skills and cultural fit.",
    avgPackage: "20-40 LPA",
    requirements: "B.Tech/M.Tech, Good problem-solving skills",
    interviewDuration: "3-5 weeks",
    successRate: "3-5%",
    difficulty: "Medium",
    roles: [
      { title: "SDE I", package: "20-28 LPA", openings: 200 },
      { title: "SDE II", package: "32-45 LPA", openings: 120 },
      { title: "Senior SDE", package: "50-70 LPA", openings: 50 },
    ],
    interviewRounds: [
      {
        name: "Online Assessment",
        duration: "75 min",
        description: "3 coding problems",
        type: "coding",
        tips: ["Practice medium problems", "Focus on correctness"],
      },
      {
        name: "Technical Round 1",
        duration: "60 min",
        description: "DSA + Coding",
        type: "dsa",
        tips: ["Write production-quality code", "Handle edge cases"],
      },
      {
        name: "Technical Round 2",
        duration: "60 min",
        description: "Problem Solving",
        type: "dsa",
        tips: ["Think about multiple approaches", "Communicate clearly"],
      },
      {
        name: "Design Round",
        duration: "60 min",
        description: "System/OOD Design",
        type: "system-design",
        tips: ["Know SOLID principles", "Practice common patterns"],
      },
      {
        name: "Hiring Manager",
        duration: "45 min",
        description: "Behavioral + Team fit",
        type: "behavioral",
        tips: ["Research the product team", "Show growth mindset"],
      },
    ],
    popularQuestions: [
      { title: "Reverse Linked List", type: "DSA", difficulty: "Easy", frequency: "Very High" },
      { title: "Binary Tree Level Order", type: "DSA", difficulty: "Medium", frequency: "High" },
      { title: "Design Parking Lot", type: "OOD", difficulty: "Medium", frequency: "High" },
    ],
  },
}

export function CompanyDetail({ companyId }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rounds" | "questions" | "resources">("overview")
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  const company = companyData[companyId] || companyData.amazon

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/getplaced"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  company.difficulty === "Hard"
                    ? "bg-red-500/10 text-red-500"
                    : company.difficulty === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-green-500/10 text-green-500"
                }`}
              >
                {company.difficulty} Difficulty
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {company.locations.join(", ")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {company.employees} employees
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {company.website}
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">{company.description}</p>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <Link href={`/getplaced/${companyId}/interview`}>
              <Button size="lg" className="bg-primary text-primary-foreground w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Mock Interview
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              Download Prep Guide
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold">{company.avgPackage}</div>
            <div className="text-xs text-muted-foreground">Avg Package</div>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold">{company.interviewDuration}</div>
            <div className="text-xs text-muted-foreground">Process Duration</div>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold">{company.successRate}</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold">{company.interviewRounds.length}</div>
            <div className="text-xs text-muted-foreground">Interview Rounds</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: Building2 },
          { id: "rounds", label: "Interview Rounds", icon: Target },
          { id: "questions", label: "Questions", icon: Code },
          { id: "resources", label: "Resources", icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Requirements */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Requirements
                </h2>
                <p className="text-muted-foreground">{company.requirements}</p>
              </div>

              {/* Available Roles */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Available Roles
                </h2>
                <div className="space-y-3">
                  {company.roles.map((role) => (
                    <div
                      key={role.title}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{role.title}</div>
                        <div className="text-sm text-muted-foreground">{role.openings} openings</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">{role.package}</div>
                        <Link href={`/getplaced/${companyId}/interview`}>
                          <Button variant="ghost" size="sm" className="text-primary mt-1">
                            Prepare <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Interview Process Overview
                </h2>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {company.interviewRounds.map((round, i) => (
                    <div key={round.name} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            round.type === "coding"
                              ? "bg-blue-500/20 text-blue-500"
                              : round.type === "dsa"
                                ? "bg-primary/20 text-primary"
                                : round.type === "system-design"
                                  ? "bg-purple-500/20 text-purple-500"
                                  : round.type === "behavioral"
                                    ? "bg-accent/20 text-accent"
                                    : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap max-w-[80px] truncate">
                          {round.name}
                        </span>
                      </div>
                      {i < company.interviewRounds.length - 1 && <ArrowRight className="w-4 h-4 text-muted mx-2" />}
                    </div>
                  ))}
                </div>
                <Link href={`/getplaced/${companyId}/interview`} className="block mt-4">
                  <Button className="w-full bg-primary">
                    Start Preparation Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          {activeTab === "rounds" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Interview Rounds</h2>
              <div className="space-y-4">
                {company.interviewRounds.map((round, i) => (
                  <div
                    key={round.name}
                    className={`rounded-lg border transition-all cursor-pointer ${
                      selectedRound === i
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRound(selectedRound === i ? null : i)}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                          round.type === "coding"
                            ? "bg-blue-500/20 text-blue-500"
                            : round.type === "dsa"
                              ? "bg-primary/20 text-primary"
                              : round.type === "system-design"
                                ? "bg-purple-500/20 text-purple-500"
                                : round.type === "behavioral"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{round.name}</div>
                          <span className="text-sm text-muted-foreground">{round.duration}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{round.description}</div>
                      </div>
                      <Link href={`/getplaced/${companyId}/interview?round=${i}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" className="shrink-0">
                          <Video className="w-4 h-4 mr-1" />
                          Practice
                        </Button>
                      </Link>
                    </div>

                    {selectedRound === i && (
                      <div className="px-4 pb-4 pt-2 border-t border-border mt-2">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-accent" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {round.tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {company.popularQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{q.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            q.type === "DSA"
                              ? "bg-primary/10 text-primary"
                              : q.type === "System Design"
                                ? "bg-purple-500/10 text-purple-500"
                                : q.type === "Behavioral"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {q.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            q.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-500"
                              : q.difficulty === "Medium"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          q.frequency === "Very High" ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        {q.frequency}
                      </div>
                      <div className="text-xs text-muted-foreground">frequency</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                View All Questions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Preparation Resources</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Leadership Principles Guide", type: "PDF", downloads: "12.5K", icon: FileText },
                  {
                    title: `${company.name} Behavioral Questions`,
                    type: "Doc",
                    downloads: "8.2K",
                    icon: MessageSquare,
                  },
                  { title: "System Design for Interviews", type: "Video", downloads: "5.1K", icon: Video },
                  { title: "DSA Problem Set", type: "Practice", downloads: "15.3K", icon: Code },
                ].map((resource) => (
                  <div
                    key={resource.title}
                    className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <resource.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{resource.title}</div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{resource.type}</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Progress Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Your Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Readiness</span>
                  <span className="text-primary font-medium">65%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-xl font-bold text-primary">28</div>
                  <div className="text-xs text-muted-foreground">DSA Solved</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="text-xl font-bold text-accent">5</div>
                  <div className="text-xs text-muted-foreground">Mocks Done</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 p-6">
            <h3 className="font-semibold mb-2">Ready to Practice?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a mock interview simulation with AI interviewer tailored for {company.name}.
            </p>
            <Link href={`/getplaced/${companyId}/interview`}>
              <Button className="w-full bg-primary">
                <Play className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dsa">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Code className="w-4 h-4 mr-2" />
                  Practice DSA Problems
                </Button>
              </Link>
              <Link href="/interviews">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Behavioral Prep
                </Button>
              </Link>
              <Link href="/code-arena">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="w-4 h-4 mr-2" />
                  System Design Prep
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
