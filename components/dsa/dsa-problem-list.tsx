"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Check, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import axios from "axios"
import { useInView } from "react-intersection-observer"

interface DSAProblemListProps {
  filters: any
}

export function DSAProblemList({ filters }: DSAProblemListProps) {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(false) // Initial loading state
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalProblems, setTotalProblems] = useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  // Reset list when filters or search change
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setProblems([]) // Clear list to avoid mixing results
    setInitialLoaded(false)
    // We don't trigger fetch here directly, rely on [page] or separate effect?
    // If we just reset page to 1, the page effect below will trigger fetch.
    // But we need to ensure we don't double fetch.
    // Let's use a ref or distinct effect.
  }, [filters, debouncedSearch])

  // Fetch when page changes or when reset (handled by page 1)
  useEffect(() => {
    const controller = new AbortController()
    fetchProblems(page, controller.signal)
    return () => controller.abort()
  }, [page, filters, debouncedSearch])

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasMore && !loading && initialLoaded) {
      setPage((prev) => prev + 1)
    }
  }, [inView, hasMore, loading, initialLoaded])

  const fetchProblems = async (pageNum: number, signal?: AbortSignal) => {
    setLoading(true)
    try {
      const params: any = { 
        page: pageNum, 
        limit: 20,
        isActive: true,
        search: debouncedSearch || undefined
      }
      
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

      const response = await apiService.dsa.getAll(params, { signal })
      
      if (response && response.success) {
        const newProblems = response.data
        const pagination = response.pagination

        if (pageNum === 1) {
          setProblems(newProblems)
        } else {
          setProblems((prev: any[]) => {
             // Create a map of existing IDs to prevent duplicates
             const existingIds = new Set(prev.map(p => p._id))
             const uniqueNewProblems = newProblems.filter((p: any) => !existingIds.has(p._id))
             return [...prev, ...uniqueNewProblems]
          })
        }
        
        setTotalProblems(pagination.total)
        setHasMore(pagination.page < pagination.pages)
        setInitialLoaded(true)
      }
    } catch (error: any) {
      if (!axios.isCancel(error) && error?.name !== 'CanceledError') {
        console.error('Error fetching problems:', error)
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

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
        {/* Loading Overlay (only for initial load or search reset) */}
        {loading && page === 1 && problems.length === 0 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        <div className="divide-y divide-border">
          {problems.length === 0 && !loading && (
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
          {hasMore && (
            <div ref={ref} className="p-4 flex justify-center">
              {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
            </div>
          )}
          
          {!hasMore && problems.length > 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No more problems to load
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
