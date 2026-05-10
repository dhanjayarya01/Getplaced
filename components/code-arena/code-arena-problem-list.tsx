"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, Play, Clock, Star, Terminal } from "lucide-react"
import Link from "next/link"

import { useDevelopmentProblems } from "@/hooks/useDevelopment"
import { Loader2 } from "lucide-react"

export function CodeArenaProblemList() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: response, isLoading } = useDevelopmentProblems()

  const problems = response?.data || []
  const filteredProblems = problems.filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No problems found matching your search.
          </div>
        ) : filteredProblems.map((problem: any) => (
          <Link
            key={problem._id}
            href={`/code-arena/${problem._id}`}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {problem.userStatus === 'solved' && (
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
                  {problem.technologies?.map((tech: string) => (
                    <span key={tech} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{problem.rating || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{problem.estimatedTime || "N/A"}</span>
                </div>
                <div className="text-sm font-medium text-primary">+{problem.xpReward} XP</div>
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
