"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

const stacks = [
  { name: "React" },
  { name: "Next.js" },
  { name: "Node.js" },
  { name: "TypeScript" },
  { name: "Python" },
  { name: "Spring Boot" },
  { name: "MongoDB" },
  { name: "PostgreSQL" },
]

const categories = [
  { name: "State Management" },
  { name: "API Integration" },
  { name: "Authentication" },
  { name: "Database Design" },
  { name: "Performance" },
  { name: "Testing" },
  { name: "DevOps" },
]

const difficulties = [
  { name: "Beginner", color: "text-green-500" },
  { name: "Intermediate", color: "text-yellow-500" },
  { name: "Advanced", color: "text-red-500" },
]

export function CodeArenaFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [expandedSections, setExpandedSections] = useState<string[]>(["stacks", "categories", "difficulty"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const getSelected = useCallback((key: string) => {
    const val = searchParams.get(key)
    return val ? val.split(",") : []
  }, [searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const current = getSelected(key)
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]

    const params = new URLSearchParams(searchParams.toString())
    if (updated.length > 0) {
      params.set(key, updated.join(","))
    } else {
      params.delete(key)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push(pathname, { scroll: false })
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
                <input 
                  type="checkbox" 
                  className="rounded border-border"
                  checked={getSelected("technology").includes(stack.name)}
                  onChange={() => handleFilterChange("technology", stack.name)}
                />
                <span className="flex-1">{stack.name}</span>
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
                <input 
                  type="checkbox" 
                  className="rounded border-border"
                  checked={getSelected("category").includes(cat.name)}
                  onChange={() => handleFilterChange("category", cat.name)}
                />
                <span className="flex-1">{cat.name}</span>
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
                <input 
                  type="checkbox" 
                  className="rounded border-border"
                  checked={getSelected("difficulty").includes(diff.name)}
                  onChange={() => handleFilterChange("difficulty", diff.name)}
                />
                <span className={`flex-1 ${diff.color}`}>{diff.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  )
}
