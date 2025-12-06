"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

const stacks = [
  { name: "React", count: 45 },
  { name: "Next.js", count: 32 },
  { name: "Node.js", count: 38 },
  { name: "TypeScript", count: 50 },
  { name: "Python", count: 28 },
  { name: "Spring Boot", count: 22 },
  { name: "MongoDB", count: 18 },
  { name: "PostgreSQL", count: 25 },
]

const categories = [
  { name: "State Management", count: 15 },
  { name: "API Integration", count: 22 },
  { name: "Authentication", count: 18 },
  { name: "Database Design", count: 20 },
  { name: "Performance", count: 12 },
  { name: "Testing", count: 16 },
  { name: "DevOps", count: 10 },
]

const difficulties = [
  { name: "Beginner", count: 40, color: "text-green-500" },
  { name: "Intermediate", count: 55, color: "text-yellow-500" },
  { name: "Advanced", count: 25, color: "text-red-500" },
]

export function CodeArenaFilters() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["stacks", "categories", "difficulty"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
      <h3 className="font-semibold mb-4">Filters</h3>

      {/* Tech Stacks */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("stacks")}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          Tech Stack
          {expandedSections.includes("stacks") ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.includes("stacks") && (
          <div className="space-y-1 mt-2">
            {stacks.map((stack) => (
              <label
                key={stack.name}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input type="checkbox" className="rounded border-border" />
                <span className="flex-1">{stack.name}</span>
                <span className="text-xs">{stack.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          Category
          {expandedSections.includes("categories") ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.includes("categories") && (
          <div className="space-y-1 mt-2">
            {categories.map((cat) => (
              <label
                key={cat.name}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input type="checkbox" className="rounded border-border" />
                <span className="flex-1">{cat.name}</span>
                <span className="text-xs">{cat.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("difficulty")}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          Difficulty
          {expandedSections.includes("difficulty") ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.includes("difficulty") && (
          <div className="space-y-1 mt-2">
            {difficulties.map((diff) => (
              <label key={diff.name} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <input type="checkbox" className="rounded border-border" />
                <span className={`flex-1 ${diff.color}`}>{diff.name}</span>
                <span className="text-xs text-muted-foreground">{diff.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
        Clear All Filters
      </Button>
    </div>
  )
}
