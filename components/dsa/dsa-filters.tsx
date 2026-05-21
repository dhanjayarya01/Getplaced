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

/**
 * Canonical set of tags that are classified as "Data Structures".
 * Everything else in the `patterns` API field is treated as an algorithm pattern.
 *
 * NOTE: The DB stores ALL tags (both DS and algorithm patterns) under the
 * `patterns` field. The `dataStructures` field is sparsely populated and
 * should NOT be used for counts. We split the `patterns` list here on the
 * frontend using this known set.
 */
const DATA_STRUCTURE_TAGS = new Set([
  'Array',
  'String',
  'Linked List',
  'Doubly-Linked List',
  'Stack',
  'Queue',
  'Monotonic Queue',
  'Monotonic Stack',
  'Tree',
  'Binary Tree',
  'Binary Search Tree',
  'Graph',
  'Heap',
  'Heap (Priority Queue)',
  'Hash Table',
  'Trie',
  'Matrix',
  'Ordered Set',
  'Segment Tree',
  'Binary Indexed Tree',
  'Suffix Array',
  'Iterator',
])

const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export function DSAFilters({ onFilterChange }: DSAFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["ds", "patterns", "difficulty"])
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  // Both DS and pattern selections are tracked together as "patternTags" because
  // the backend queries the `patterns` field for both.
  const [selectedDataStructures, setSelectedDataStructures] = useState<string[]>([])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await apiService.dsa.getFilters()
      if (response.success) {
        setFilterOptions(response.data)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      setFilterOptions({
        difficulties: [],
        dataStructures: [],
        patterns: [],
        companies: []
      })
    }
  }

  /**
   * Split the `patterns` API array into Data Structure tags vs Algorithm Pattern tags.
   * The `dataStructures` API field is ignored because it is sparsely populated.
   */
  const getDataStructuresWithCounts = () => {
    const allPatterns = filterOptions?.patterns || []
    const dsTags = allPatterns.filter((item) => DATA_STRUCTURE_TAGS.has(item._id))
    return [...dsTags].sort((a, b) => a._id.localeCompare(b._id))
  }

  const getPatternsWithCounts = () => {
    const allPatterns = filterOptions?.patterns || []
    const algoTags = allPatterns.filter((item) => !DATA_STRUCTURE_TAGS.has(item._id))
    return [...algoTags].sort((a, b) => a._id.localeCompare(b._id))
  }

  const getDifficultiesWithCounts = () => {
    return ALL_DIFFICULTIES.map(diff => {
      const found = filterOptions?.difficulties.find(f => f._id === diff)
      return { _id: diff, count: found?.count || 0 }
    })
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
    // Both data structure tags and pattern tags are sent as `pattern` because
    // the backend queries the `patterns` field for both (that's where the DB has them).
    const allPatternSelections = [...selectedDataStructures, ...selectedPatterns]
    onFilterChange({
      patterns: allPatternSelections,
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
    <div className="bg-card rounded-xl border border-border p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
      <h3 className="font-semibold mb-4">Filters</h3>

      {/* Data Structures */}
      <div className="mb-4 border-b border-border/50 pb-4">
        <button
          onClick={() => toggleSection("ds")}
          className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-primary transition-colors"
        >
          Data Structures
          {expandedSections.includes("ds") ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expandedSections.includes("ds") && (
          <div className="space-y-1 mt-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {getDataStructuresWithCounts().map((ds) => (
              <label
                key={ds._id}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground transition-colors"
              >
                <input
                  type="checkbox"
                  className="rounded border-border w-4 h-4"
                  checked={selectedDataStructures.includes(ds._id)}
                  onChange={() => toggleSelection(selectedDataStructures, ds._id, setSelectedDataStructures)}
                />
                <span className="flex-1 truncate" title={ds._id}>{ds._id}</span>
                <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded-full">{ds.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Patterns */}
      <div className="mb-4 border-b border-border/50 pb-4">
        <button
          onClick={() => toggleSection("patterns")}
          className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-primary transition-colors"
        >
          Patterns
          {expandedSections.includes("patterns") ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.includes("patterns") && (
          <div className="space-y-1 mt-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {getPatternsWithCounts().map((pattern) => (
              <label
                key={pattern._id}
                className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:text-foreground text-muted-foreground transition-colors"
              >
                <input
                  type="checkbox"
                  className="rounded border-border w-4 h-4"
                  checked={selectedPatterns.includes(pattern._id)}
                  onChange={() => toggleSelection(selectedPatterns, pattern._id, setSelectedPatterns)}
                />
                <span className="flex-1 truncate" title={pattern._id}>{pattern._id}</span>
                <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded-full">{pattern.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("difficulty")}
          className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-primary transition-colors"
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
            {getDifficultiesWithCounts().map((diff) => (
              <label key={diff._id} className="flex items-center gap-2 text-sm cursor-pointer py-1 hover:bg-muted/30 rounded px-1 -mx-1 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-border w-4 h-4"
                  checked={selectedDifficulties.includes(diff._id)}
                  onChange={() => toggleSelection(selectedDifficulties, diff._id, setSelectedDifficulties)}
                />
                <span className={`flex-1 ${getDifficultyColor(diff._id)}`}>{diff._id}</span>
                <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded-full">{diff.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 sticky bottom-0 bg-card pt-2 mt-4 border-t border-border">
        <Button variant="default" size="sm" className="w-full" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
