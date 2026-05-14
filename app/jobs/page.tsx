"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { JobList } from "@/components/getplaced/job-list"
import { useDebounce } from "@/hooks/use-debounce"
import { Briefcase, Search, Filter } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${API}${path}`, { credentials: "include", ...opts })

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 400)
  
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)
  
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Filters
  const [dateFilter, setDateFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [techStack, setTechStack] = useState("")

  const fetchJobs = useCallback(async (pageNum: number, isNewSearch = false) => {
    setIsLoading(true)
    const params = new URLSearchParams({ page: String(pageNum), limit: "30" })
    
    if (debouncedSearch) params.set("q", debouncedSearch)
    if (dateFilter) params.set("days", dateFilter)
    if (locationFilter) params.set("location", locationFilter)
    if (techStack) params.set("tech", techStack)

    try {
      const res = await apiFetch(`/api/jobs/all?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (isNewSearch) {
          setJobs(data.data.jobs)
        } else {
          setJobs(prev => [...prev, ...data.data.jobs])
        }
        setTotalJobs(data.data.pagination.total)
        setHasMore(pageNum < data.data.pagination.pages)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, dateFilter, locationFilter, techStack])

  useEffect(() => {
    setPage(1)
    fetchJobs(1, true)
  }, [debouncedSearch, dateFilter, locationFilter, techStack, fetchJobs])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const next = page + 1
      setPage(next)
      fetchJobs(next, false)
    }
  }, [isLoading, hasMore, page, fetchJobs])

  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  const predefinedTechs = ["React", "Node.js", "Python", "Java", "AWS", "SQL", "MongoDB", "TypeScript"]

  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero — scrolls away */}
      <div className="pt-16">
        <section className="relative overflow-hidden bg-background pt-16 pb-12 border-b border-border">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-semibold">Latest Opportunities</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Dream Job</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest roles at top tech companies. Scraped in real-time to keep you ahead of the competition.
            </p>
          </div>
        </section>
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
          {/* Search Bar */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Search Job Postings</h2>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                className="flex h-14 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-lg shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary pl-12"
                placeholder="Search by role, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Search Results ({totalJobs})</h2>
          </div>
          
          <JobList jobs={jobs} loading={isLoading && page === 1} />
          
          {hasMore && jobs.length > 0 && (
            <div ref={observerTarget} className="flex justify-center py-6">
              {isLoading && <span className="text-muted-foreground text-sm font-medium animate-pulse">Loading more jobs...</span>}
            </div>
          )}
        </div>

        {/* Filter sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto no-scrollbar py-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Filters</h3>
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date Posted</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Any Time", value: "" },
                  { label: "Today", value: "1" },
                  { label: "Past 7 Days", value: "7" },
                  { label: "Past 30 Days", value: "30" }
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors">
                    <input 
                      type="radio" 
                      name="date" 
                      className="accent-primary w-4 h-4"
                      checked={dateFilter === opt.value}
                      onChange={() => setDateFilter(opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Anywhere", value: "" },
                  { label: "Remote", value: "remote" },
                  { label: "On-site", value: "onsite" }
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors">
                    <input 
                      type="radio" 
                      name="location" 
                      className="accent-primary w-4 h-4"
                      checked={locationFilter === opt.value}
                      onChange={() => setLocationFilter(opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tech Stack Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {predefinedTechs.map(tech => (
                  <button
                    key={tech}
                    onClick={() => {
                      const current = techStack.split(',').filter(Boolean)
                      if (current.includes(tech)) {
                        setTechStack(current.filter(t => t !== tech).join(','))
                      } else {
                        setTechStack([...current, tech].join(','))
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      techStack.split(',').includes(tech)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
            
            {(dateFilter || locationFilter || techStack) && (
              <button 
                onClick={() => { setDateFilter(""); setLocationFilter(""); setTechStack(""); setSearchQuery(""); }}
                className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors border border-red-500/20"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
