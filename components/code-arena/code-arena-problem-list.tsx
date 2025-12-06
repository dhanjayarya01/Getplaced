"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, Play, Clock, Star, Terminal } from "lucide-react"
import Link from "next/link"

const problems = [
  {
    id: 1,
    title: "Implement useState Hook",
    description: "Create a custom useState hook from scratch in React",
    difficulty: "Intermediate",
    stack: ["React", "TypeScript"],
    xp: 150,
    solved: true,
    time: "45 min",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Build REST API with Auth",
    description: "Create a RESTful API with JWT authentication using Node.js",
    difficulty: "Intermediate",
    stack: ["Node.js", "Express", "MongoDB"],
    xp: 200,
    solved: false,
    time: "60 min",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Real-time Chat Application",
    description: "Build a chat app with WebSocket connections",
    difficulty: "Advanced",
    stack: ["React", "Node.js", "Socket.io"],
    xp: 300,
    solved: false,
    time: "90 min",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Redux Store from Scratch",
    description: "Implement a simplified Redux-like state management",
    difficulty: "Intermediate",
    stack: ["TypeScript", "React"],
    xp: 180,
    solved: true,
    time: "50 min",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Build a Form Validation Library",
    description: "Create a reusable form validation library with TypeScript",
    difficulty: "Intermediate",
    stack: ["TypeScript"],
    xp: 160,
    solved: false,
    time: "40 min",
    rating: 4.5,
  },
  {
    id: 6,
    title: "Implement Virtual DOM",
    description: "Build a simplified virtual DOM diffing algorithm",
    difficulty: "Advanced",
    stack: ["JavaScript", "TypeScript"],
    xp: 350,
    solved: false,
    time: "120 min",
    rating: 4.9,
  },
]

export function CodeArenaProblemList() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProblems = problems.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-500 bg-green-500/10"
      case "Intermediate":
        return "text-yellow-500 bg-yellow-500/10"
      case "Advanced":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProblems.map((problem) => (
          <Link
            key={problem.id}
            href={`/code-arena/${problem.id}`}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {problem.solved && (
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{problem.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{problem.description}</p>
                <div className="flex flex-wrap gap-2">
                  {problem.stack.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{problem.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{problem.time}</span>
                </div>
                <div className="text-sm font-medium text-primary">+{problem.xp} XP</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Terminal className="w-4 h-4" />
                <span>Live coding environment</span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Challenge
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
