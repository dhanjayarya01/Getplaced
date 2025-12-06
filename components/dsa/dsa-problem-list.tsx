"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"

const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    companies: ["Google", "Amazon", "Meta"],
    solved: true,
    acceptance: 49.2,
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Stacks", "Strings"],
    companies: ["Amazon", "Microsoft"],
    solved: true,
    acceptance: 40.8,
  },
  {
    id: 3,
    title: "Merge Intervals",
    difficulty: "Medium",
    topics: ["Arrays", "Sorting"],
    companies: ["Google", "Meta", "Apple"],
    solved: false,
    acceptance: 45.5,
  },
  {
    id: 4,
    title: "LRU Cache",
    difficulty: "Medium",
    topics: ["Hash Table", "Linked List"],
    companies: ["Amazon", "Microsoft", "Google"],
    solved: false,
    acceptance: 40.2,
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topics: ["Arrays", "DP"],
    companies: ["Amazon", "Apple", "Microsoft"],
    solved: true,
    acceptance: 50.1,
  },
  {
    id: 6,
    title: "Word Ladder",
    difficulty: "Hard",
    topics: ["BFS", "Hash Table"],
    companies: ["Amazon", "Meta", "Google"],
    solved: false,
    acceptance: 36.8,
  },
  {
    id: 7,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topics: ["Arrays", "Binary Search"],
    companies: ["Google", "Amazon"],
    solved: false,
    acceptance: 35.5,
  },
  {
    id: 8,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    topics: ["Strings", "DP"],
    companies: ["Amazon", "Microsoft"],
    solved: false,
    acceptance: 32.4,
  },
]

export function DSAProblemList() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProblems = problems.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "Hard":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredProblems.map((problem) => (
          <Link
            key={problem.id}
            href={`/dsa/${problem.id}`}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              {problem.solved ? (
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              ) : (
                <div className="w-6 h-6 border border-border rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{problem.title}</span>
                <span className={`text-sm ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {problem.topics.slice(0, 2).map((topic) => (
                  <span key={topic} className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{problem.companies.slice(0, 2).join(", ")}</span>
              </div>
              <div className="w-16 text-right">{problem.acceptance}%</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border text-center">
        <Button variant="ghost">Load More Problems</Button>
      </div>
    </div>
  )
}
