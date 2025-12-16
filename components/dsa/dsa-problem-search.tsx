"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"

interface DSAProblemSearchProps {
  currentProblemId?: string
}

export function DSAProblemSearch({ currentProblemId }: DSAProblemSearchProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [filteredProblems, setFilteredProblems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(true)

  useEffect(() => {
    if (isOpen && problems.length === 0) {
      fetchProblems()
    }
  }, [isOpen])

  useEffect(() => {
    filterProblems()
  }, [searchQuery, problems, showAll])

  const fetchProblems = async () => {
    setLoading(true)
    try {
      const response = await apiService.dsa.getAll()
      if (response.success) {
        setProblems(response.data.problems || response.data)
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProblems = () => {
    if (!searchQuery.trim()) {
      setFilteredProblems(showAll ? problems : [])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = problems.filter((problem) => {
      const titleMatch = problem.title?.toLowerCase().includes(query)
      const idMatch = problem.problemNumber?.toString().includes(query)
      const difficultyMatch = problem.difficulty?.toLowerCase().includes(query)
      return titleMatch || idMatch || difficultyMatch
    })
    setFilteredProblems(filtered)
  }

  const handleProblemClick = (problemId: string) => {
    router.push(`/dsa/${problemId}`)
    setIsOpen(false)
    setSearchQuery("")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "Hard":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
    if (!showAll) {
      setSearchQuery("")
    }
  }

  return (
    <>
      {/* Floating Search Icon */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
      </Button>

      {/* Search Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold mb-3">Search Problems</h2>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by ID, title, or difficulty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Show All Toggle */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={toggleShowAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${showAll ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                  {showAll && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>
                Show all problems when search is empty
              </button>
            </div>

            {/* Results count */}
            <div className="mt-2 text-xs text-muted-foreground">
              {loading ? (
                "Loading..."
              ) : searchQuery ? (
                `${filteredProblems.length} result${filteredProblems.length !== 1 ? "s" : ""}`
              ) : showAll ? (
                `${problems.length} total problems`
              ) : (
                "Start typing to search..."
              )}
            </div>
          </div>

          {/* Problems List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (searchQuery || showAll) && filteredProblems.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredProblems.map((problem) => (
                  <button
                    key={problem._id}
                    onClick={() => handleProblemClick(problem._id)}
                    className={`w-full text-left p-4 hover:bg-secondary transition-colors ${
                      currentProblemId === problem._id ? "bg-secondary/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            #{problem.problemNumber || "N/A"}
                          </span>
                          <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 text-foreground">
                          {problem.title}
                        </h3>
                        {problem.dataStructures && problem.dataStructures.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {problem.dataStructures.slice(0, 2).map((ds: string) => (
                              <span
                                key={ds}
                                className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                              >
                                {ds}
                              </span>
                            ))}
                            {problem.dataStructures.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{problem.dataStructures.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {currentProblemId === problem._id && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : !loading && searchQuery && filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No problems found</p>
              </div>
            ) : !showAll ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Start typing to search</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
