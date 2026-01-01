"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { useInView } from "react-intersection-observer"
import { useInfiniteDSAProblems } from "@/hooks/useDSA"

interface DSAProblemListProps {
  filters: any
}

export function DSAProblemList({ filters }: DSAProblemListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteDSAProblems(filters, debouncedSearch)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  // Auto-fetch next page when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all pages into single problems array
  const problems = data?.pages.flatMap(page => page?.data || []) || []
  const totalProblems = data?.pages[0]?.pagination?.total || 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500"
      case "Medium": return "text-yellow-500"
      case "Hard": return "text-red-500"
      default: return ""
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Header & Search */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Problems</h2>
          <div className="text-sm text-muted-foreground">
            {totalProblems} problems
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

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto relative p-0">
        {/* Loading Overlay (only for initial load) */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        <div className="divide-y divide-border">
          {!isLoading && problems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">
              No problems found.
            </div>
          )}

          {problems.map((problem) => (
            <Link
              key={problem._id}
              href={`/dsa/${problem.slug || problem._id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0 relative">
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                  #{problem.problemNumber || '?'}
                </span>
                {/* Red dot for design problems (not executable) */}
                {problem.isSolvableLeetcode === false && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"
                    title="Design Problem - Manual Implementation Only"
                  />
                )}
              </div>

              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {problem.userStatus === "solved" ? (
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
                  <span className={`text-sm ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {problem.dataStructures?.slice(0, 2).map((topic: string) => (
                    <span key={topic} className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
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

              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                {problem.companies && problem.companies.length > 0 && (
                  <div className="flex items-center gap-1 group relative" title={problem.companies.map((c: any) => c.name).join(", ")}>
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                        {problem.companies.slice(0, 2).map((c: any) => c.name).join(", ")}
                        {problem.companies.length > 2 && ` +${problem.companies.length - 2}`}
                    </span>
                  </div>
                )}
                {problem.acceptance && (
                  <div className="w-16 text-right">{Math.round(problem.acceptance)}%</div>
                )}
              </div>
            </Link>
          ))}
          
          {/* Load More Trigger */}
          {hasNextPage && (
            <div ref={ref} className="p-4 flex justify-center">
              {isFetchingNextPage && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
            </div>
          )}
          
          {!hasNextPage && problems.length > 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No more problems to load
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
