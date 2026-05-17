"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { JobList } from "@/components/getplaced/job-list"
import { useDebounce } from "@/hooks/use-debounce"
import { Briefcase, Search, Filter, X } from "lucide-react"
import { ResumeModal } from "@/components/resume/resume-modal"

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

  const [dateFilter, setDateFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [techStack, setTechStack] = useState("")
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({})

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
        if (isNewSearch) setJobs(data.data.jobs)
        else setJobs(prev => [...prev, ...data.data.jobs])
        setTotalJobs(data.data.pagination.total)
        setHasMore(pageNum < data.data.pagination.pages)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, dateFilter, locationFilter, techStack])

  const fetchFilterCounts = useCallback(async () => {
    try {
      const counts: Record<string, number> = {}
      await Promise.all(
        ["1", "7", "30"].map(async (days) => {
          const p = new URLSearchParams({ page: "1", limit: "1", days })
          if (debouncedSearch) p.set("q", debouncedSearch)
          const res = await apiFetch(`/api/jobs/all?${p}`)
          if (res.ok) {
            const d = await res.json()
            counts[days] = d.data?.pagination?.total ?? 0
          }
        })
      )
      setFilterCounts(counts)
    } catch (e) {
      console.error("Filter count error:", e)
    }
  }, [debouncedSearch])

  useEffect(() => {
    setPage(1)
    fetchJobs(1, true)
    fetchFilterCounts()
  }, [debouncedSearch, dateFilter, locationFilter, techStack, fetchJobs, fetchFilterCounts])

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
      entries => { if (entries[0].isIntersecting && hasMore && !isLoading) loadMore() },
      { threshold: 0.1 }
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  const predefinedTechs = ["React", "Node.js", "Python", "Java", "AWS", "SQL", "MongoDB", "TypeScript"]
  const hasActiveFilters = dateFilter || locationFilter || techStack

  const dateOptions = [
    { label: "Any Time", value: "" },
    { label: "Today", value: "1" },
    { label: "Past 7 Days", value: "7" },
    { label: "Past 30 Days", value: "30" },
  ]
  const locationOptions = [
    { label: "Anywhere", value: "" },
    { label: "Remote", value: "remote" },
    { label: "On-site", value: "onsite" },
  ]

  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero */}
      <div className="pt-16">
        <section className="relative overflow-hidden bg-background pt-16 pb-12 border-b border-border">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-semibold">Latest Opportunities</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Dream Job</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest roles at top tech companies, scraped in real-time.
            </p>
          </div>
          {/* Resume Button - Bottom Right Corner */}
          <div className="absolute bottom-4 right-4 sm:right-6 lg:right-8 z-10">
            <ResumeModal />
          </div>
        </section>
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-6 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-5 space-y-4">
          {/* Search */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary pl-12 pr-10"
                placeholder="Search by role, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                <span className="font-medium text-foreground">{totalJobs.toLocaleString()}</span> jobs found
                {dateFilter ? ` · past ${dateFilter === "1" ? "day" : dateFilter + " days"}` : ""}
                {locationFilter ? ` · ${locationFilter}` : ""}
              </p>
            )}
          </div>

          <JobList jobs={jobs} loading={isLoading && page === 1} total={totalJobs} />

          {hasMore && jobs.length > 0 && (
            <div ref={observerTarget} className="flex justify-center py-4">
              {isLoading && <span className="text-muted-foreground text-sm animate-pulse">Loading more...</span>}
            </div>
          )}
        </div>

        {/* Filter sidebar */}
        <aside className="w-60 shrink-0 overflow-y-auto no-scrollbar py-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { setDateFilter(""); setLocationFilter(""); setTechStack(""); setSearchQuery("") }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date Posted</h4>
              <div className="flex flex-col gap-0.5">
                {dateOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between gap-2 cursor-pointer px-2 py-2 rounded-lg transition-colors text-sm ${
                      dateFilter === opt.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="date"
                        className="accent-primary w-3.5 h-3.5"
                        checked={dateFilter === opt.value}
                        onChange={() => setDateFilter(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </div>
                    {opt.value && filterCounts[opt.value] !== undefined && (
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full tabular-nums ${
                        dateFilter === opt.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {filterCounts[opt.value].toLocaleString()}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</h4>
              <div className="flex flex-col gap-0.5">
                {locationOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg transition-colors text-sm ${
                      locationFilter === opt.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      className="accent-primary w-3.5 h-3.5"
                      checked={locationFilter === opt.value}
                      onChange={() => setLocationFilter(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {predefinedTechs.map(tech => (
                  <button
                    key={tech}
                    onClick={() => {
                      const current = techStack.split(',').filter(Boolean)
                      if (current.includes(tech)) setTechStack(current.filter(t => t !== tech).join(','))
                      else setTechStack([...current, tech].join(','))
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
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
          </div>
        </aside>
      </div>
    </div>
  )
}
