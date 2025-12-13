"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

interface DSAProblemListProps {
  filters: any
}

export function DSAProblemList({ filters }: DSAProblemListProps) {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchProblems()
  }, [filters, page])

  const fetchProblems = async () => {
    setLoading(true)
    try {
      // Build query params
      const params: any = { page, limit: 20 }
      
      if (filters.dataStructures?.length > 0) {
        params.dataStructure = filters.dataStructures.join(',')
      }
      if (filters.patterns?.length > 0) {
        params.pattern = filters.patterns.join(',')
      }
      if (filters.difficulties?.length > 0) {
        params.difficulty = filters.difficulties.join(',')
      }
      if (filters.companies?.length > 0) {
        params.company = filters.companies.join(',')
      }

      const response = await apiService.dsa.getAll(params)
      if (response.success) {
        console.log("response________", response)
        // Filter only active problems for public view
        const activeProblems = response.data.filter((p: any) => p.isActive !== false)
        setProblems(activeProblems)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
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
        return ""
    }
  }

  const filteredProblems = problems.filter((problem) =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    )
  }
console.log(
  "filtered problems ________",
  filteredProblems.map(p => ({
    title: p.title,
    status: p.userStatus === "solved" ? "solved" : "not solved"
  }))
);

  console.log("filter problem problems________", filteredProblems)

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Problems</h2>
          <div className="text-sm text-muted-foreground">
            {pagination?.total || 0} problems
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search problems..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredProblems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No problems found. Try adjusting your filters.
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <Link
              key={problem._id}
              href={`/dsa/${problem.slug || problem._id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              {/* Problem Number Badge */}
              <div className="flex-shrink-0">
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                  #{problem.problemNumber || '?'}
                </span>
              </div>

              {/* Status Icon */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {problem.userStatus === "solved" ? (
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border border-border rounded-full" />
                )}
              </div>

              {/* Problem Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{problem.title}</span>
                  <span className={`text-sm ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {problem.dataStructures?.slice(0, 2).map((topic: string) => (
                    <span 
                      key={topic} 
                      className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                  {problem.dataStructures?.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{problem.dataStructures.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Companies & Acceptance */}
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                {problem.companies && problem.companies.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{problem.companies.slice(0, 2).join(", ")}</span>
                  </div>
                )}
                {problem.acceptance && (
                  <div className="w-16 text-right">{problem.acceptance}%</div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
