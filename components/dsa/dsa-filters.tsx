"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { apiService } from "@/lib/api"

interface FilterOptions {
  difficulties: Array<{ _id: string; count: number }>
  dataStructures: Array<{ _id: string; count: number }>
  patterns: Array<{ _id: string; count: number }>
  companies: Array<{ _id: string; count: number }>
}

interface DSAFiltersProps {
  onFilterChange: (filters: any) => void
}

export function DSAFilters({ onFilterChange }: DSAFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["ds", "patterns", "difficulty"])
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [selectedDataStructures, setSelectedDataStructures] = useState<string[]>([])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await apiService.admin.getDSAFilters()
      if (response.success) {
        setFilterOptions(response.data)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const toggleSelection = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const applyFilters = () => {
    onFilterChange({
      dataStructures: selectedDataStructures,
      patterns: selectedPatterns,
      difficulties: selectedDifficulties,
      companies: selectedCompanies
    })
  }

  const clearFilters = () => {
    setSelectedDataStructures([])
    setSelectedPatterns([])
    setSelectedDifficulties([])
    setSelectedCompanies([])
    onFilterChange({})
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500'
      case 'Medium': return 'text-yellow-500'
      case 'Hard': return 'text-red-500'
      default: return ''
    }
  }

  if (!filterOptions) {
    return <div className="bg-card rounded-xl border border-border p-4">Loading filters...</div>
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
            {filterOptions.dataStructures.map((ds) => (
              <label
                key={ds._id}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={selectedDataStructures.includes(ds._id)}
                  onChange={() => toggleSelection(selectedDataStructures, ds._id, setSelectedDataStructures)}
                />
                <span className="flex-1">{ds._id}</span>
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
            {filterOptions.patterns.map((pattern) => (
              <label
                key={pattern._id}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground"
              >
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={selectedPatterns.includes(pattern._id)}
                  onChange={() => toggleSelection(selectedPatterns, pattern._id, setSelectedPatterns)}
                />
                <span className="flex-1">{pattern._id}</span>
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
            {filterOptions.difficulties.map((diff) => (
              <label key={diff._id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={selectedDifficulties.includes(diff._id)}
                  onChange={() => toggleSelection(selectedDifficulties, diff._id, setSelectedDifficulties)}
                />
                <span className={`flex-1 ${getDifficultyColor(diff._id)}`}>{diff._id}</span>
                <span className="text-xs text-muted-foreground">{diff.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button variant="default" size="sm" className="w-full" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
