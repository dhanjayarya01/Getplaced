"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

const dataStructures = [
  { name: "Arrays", count: 85 },
  { name: "Linked Lists", count: 42 },
  { name: "Stacks", count: 28 },
  { name: "Queues", count: 22 },
  { name: "Trees", count: 65 },
  { name: "Graphs", count: 58 },
  { name: "Heaps", count: 25 },
  { name: "Hash Tables", count: 45 },
  { name: "Tries", count: 18 },
]

const patterns = [
  { name: "Two Pointers", count: 38 },
  { name: "Sliding Window", count: 32 },
  { name: "Binary Search", count: 45 },
  { name: "DFS/BFS", count: 52 },
  { name: "Dynamic Programming", count: 78 },
  { name: "Backtracking", count: 35 },
  { name: "Greedy", count: 28 },
  { name: "Divide & Conquer", count: 22 },
]

const difficulties = [
  { name: "Easy", count: 150, color: "text-green-500" },
  { name: "Medium", count: 250, color: "text-yellow-500" },
  { name: "Hard", count: 100, color: "text-red-500" },
]

export function DSAFilters() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["ds", "patterns", "difficulty"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
      <h3 className="font-semibold mb-4">Filters</h3>

      {/* Data Structures */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("ds")}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          Data Structures
          {expandedSections.includes("ds") ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expandedSections.includes("ds") && (
          <div className="space-y-1 mt-2">
            {dataStructures.map((ds) => (
              <label
                key={ds.name}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input type="checkbox" className="rounded border-border" />
                <span className="flex-1">{ds.name}</span>
                <span className="text-xs">{ds.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Patterns */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("patterns")}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          Patterns
          {expandedSections.includes("patterns") ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.includes("patterns") && (
          <div className="space-y-1 mt-2">
            {patterns.map((pattern) => (
              <label
                key={pattern.name}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input type="checkbox" className="rounded border-border" />
                <span className="flex-1">{pattern.name}</span>
                <span className="text-xs">{pattern.count}</span>
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
