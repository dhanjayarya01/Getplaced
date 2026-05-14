"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Briefcase, Sparkles, RefreshCw, Play, Clock, CheckCircle2,
  AlertCircle, Building2, MapPin, Users, Database, Zap, Search,
  ChevronLeft, ChevronRight, ExternalLink, TrendingUp, Calendar,
  MailCheck, Activity, Filter, Server, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${API}${path}`, { credentials: "include", ...opts })

// ── Countdown to next midnight IST ────────────────────────────────────────────
function useMidnightCountdown() {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      // Next midnight IST = next midnight UTC+5:30
      const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const nextMidnight = new Date(istNow)
      nextMidnight.setHours(24, 0, 0, 0)
      const diff = Math.max(0, nextMidnight.getTime() - istNow.getTime())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setRemaining({ h, m, s })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return remaining
}

function pad(n: number) { return String(n).padStart(2, "0") }

function ScorePill({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const cls =
    pct >= 85 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
    pct >= 70 ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${cls}`}>
      <Sparkles className="w-2.5 h-2.5" />{pct}%
    </span>
  )
}

type DateFilter = "all" | "today" | "week" | "month"

export default function JobRecommendationsAdminPage() {
  const countdown = useMidnightCountdown()

  const [stats, setStats]           = useState<any>(null)
  const [jobs, setJobs]             = useState<any[]>([])
  const [jobsTotal, setJobsTotal]   = useState(0)
  const [jobsPage, setJobsPage]     = useState(1)
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [search, setSearch]         = useState("")
  const [dSearch, setDSearch]       = useState("")
  const [loading, setLoading]       = useState(true)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [syncing, setSyncing]       = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncQuery, setSyncQuery]   = useState("software developer")
  const [syncLocation, setSyncLocation] = useState("Remote")
  const [syncLimit, setSyncLimit]   = useState("30")
  const [activeTab, setActiveTab]   = useState<"jobs"|"recs">("jobs")
  
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [deleting, setDeleting]         = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const r = await apiFetch("/api/jobs/admin/stats")
    if (r.ok) { const d = await r.json(); if (d.success) setStats(d.data) }
    setLoading(false)
  }, [])

  const fetchJobs = useCallback(async (page = 1, filter: DateFilter = dateFilter, q = dSearch) => {
    setJobsLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "15", filter, ...(q ? { q } : {}) })
    const r = await apiFetch(`/api/jobs/admin/list?${params}`)
    if (r.ok) {
      const d = await r.json()
      if (d.success) {
        if (page === 1) setJobs(d.data.jobs)
        else setJobs(prev => [...prev, ...d.data.jobs])
        setJobsTotal(d.data.pagination.total)
      }
    }
    setJobsLoading(false)
  }, [dateFilter, dSearch])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { setJobsPage(1); fetchJobs(1, dateFilter, dSearch) }, [dateFilter, dSearch])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const r = await apiFetch("/api/jobs/sync-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: syncQuery, location: syncLocation, limit: parseInt(syncLimit) }),
      })
      const d = await r.json()
      setSyncResult(d)
      if (d.success) { await fetchStats(); await fetchJobs(1) }
    } catch (e: any) {
      setSyncResult({ success: false, message: e.message })
    }
    setSyncing(false)
  }

  const loadMoreJobs = () => {
    const next = jobsPage + 1
    setJobsPage(next)
    fetchJobs(next)
  }

  const toggleJob = (id: string) => {
    const next = new Set(selectedJobs)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedJobs(next)
  }

  const toggleAll = () => {
    if (selectedJobs.size === jobs.length && jobs.length > 0) setSelectedJobs(new Set())
    else setSelectedJobs(new Set(jobs.map(j => j._id)))
  }

  const handleDeleteSelected = async () => {
    if (selectedJobs.size === 0) return
    if (!confirm(`Delete ${selectedJobs.size} selected jobs?`)) return
    
    setDeleting(true)
    try {
      const r = await apiFetch("/api/jobs/admin/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: Array.from(selectedJobs) })
      })
      if (r.ok) {
        setSelectedJobs(new Set())
        await fetchJobs(1)
        await fetchStats()
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete ALL jobs and recommendations? This cannot be undone.`)) return
    
    setDeleting(true)
    try {
      const r = await apiFetch("/api/jobs/admin/jobs/all", { method: "DELETE" })
      if (r.ok) {
        setSelectedJobs(new Set())
        await fetchJobs(1)
        await fetchStats()
      }
    } finally {
      setDeleting(false)
    }
  }

  const q = stats?.queue || {}
  const ml = stats?.mlService || {}
  const recs = stats?.recommendations?.list || []

  return (
    <div className="space-y-6 p-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Job Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor job scraping, ML evaluation pipeline, and all recommendations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: "Total Jobs", value: stats?.jobs?.total ?? "—", sub: `${stats?.jobs?.today ?? 0} today`, color: "text-blue-400" },
          { icon: Sparkles, label: "Recommendations", value: stats?.recommendations?.total ?? "—", sub: `${stats?.recommendations?.today ?? 0} today`, color: "text-purple-400" },
          { icon: Users, label: "Users w/ Resume", value: stats?.usersWithResume ?? "—", sub: "eligible for ML", color: "text-emerald-400" },
          { icon: Server, label: "ML Service", value: ml.model_loaded ? "Ready" : ml.status === "unreachable" ? "Offline" : "No Model", sub: ml.status || "—", color: ml.model_loaded ? "text-emerald-400" : "text-red-400" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card/40 p-4 space-y-1">
            <div className={`flex items-center gap-2 text-xs text-muted-foreground`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} />{label}
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Batch Operation Panel ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 rounded-xl"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="font-semibold">Batch ML Evaluation</div>
              <div className="text-xs text-muted-foreground">Scrape jobs → evaluate against all user resumes → store recommendations → send emails</div>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-3 bg-background/60 border border-border rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Next auto-run</div>
              <div className="text-lg font-mono font-bold tabular-nums">
                <span className="text-primary">{pad(countdown.h)}</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-primary">{pad(countdown.m)}</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-primary">{pad(countdown.s)}</span>
              </div>
              <div className="text-[9px] text-muted-foreground">midnight IST</div>
            </div>
          </div>
        </div>

        {/* Config inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Search Query", value: syncQuery, set: setSyncQuery, placeholder: "e.g. software developer" },
            { label: "Location", value: syncLocation, set: setSyncLocation, placeholder: "e.g. Remote" },
            { label: "Limit per source", value: syncLimit, set: setSyncLimit, placeholder: "30", type: "number" },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type={type || "text"}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>

        {/* Run button */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={handleSync} disabled={syncing} className="gap-2 min-w-[160px]">
            {syncing
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
              : <><Play className="w-4 h-4" /> Run Batch Now</>
            }
          </Button>
          {/* Queue Status */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {[
              { label: "Active",    val: q.active,    color: "text-blue-400" },
              { label: "Waiting",   val: q.waiting,   color: "text-yellow-400" },
              { label: "Completed", val: q.completed, color: "text-emerald-400" },
              { label: "Failed",    val: q.failed,    color: "text-red-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <div className={`text-base font-bold ${color}`}>{val ?? "—"}</div>
                <div className="text-[10px]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync result */}
        {syncResult && (
          <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 text-sm ${syncResult.success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
            {syncResult.success
              ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            }
            <div>
              {syncResult.success
                ? <>✅ Scraped <strong>{syncResult.jobsScraped}</strong> jobs · saved <strong>{syncResult.jobsSaved}</strong> new · queued ML for <strong>{syncResult.usersQueued}</strong> users</>
                : syncResult.message
              }
            </div>
          </div>
        )}
      </div>

      {/* ── Tab: Jobs / Recommendations ── */}
      <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit">
        {(["jobs", "recs"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "jobs" ? `All Jobs (${jobsTotal})` : `Recommendations (${stats?.recommendations?.total ?? 0})`}
          </button>
        ))}
      </div>

      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search jobs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 bg-muted/30 border border-border rounded-xl p-1">
              {(["all","today","week","month"] as DateFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setDateFilter(f); setJobsPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${dateFilter === f ? "bg-background text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "7 Days" : "30 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3">
             <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected} 
                disabled={selectedJobs.size === 0 || deleting}
                className="gap-2"
             >
                <Trash2 className="w-4 h-4" /> Delete Selected ({selectedJobs.size})
             </Button>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteAll} 
                disabled={jobsTotal === 0 || deleting}
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
             >
                <Trash2 className="w-4 h-4" /> Delete All
             </Button>
          </div>

          {/* Jobs table */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={jobs.length > 0 && selectedJobs.size === jobs.length}
                      onChange={toggleAll}
                      className="rounded border-border"
                    />
                  </th>
                  {["Title", "Company", "Location", "Source", "Skills", "Fetched", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {jobsLoading && jobs.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-muted/50 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : jobs.length === 0
                  ? <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No jobs found</td></tr>
                  : jobs.map((job: any) => (
                    <tr key={job._id} className={`hover:bg-muted/20 transition-colors ${selectedJobs.has(job._id) ? "bg-muted/30" : ""}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedJobs.has(job._id)}
                          onChange={() => toggleJob(job._id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium max-w-48 truncate">{job.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.company}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{job.location || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 border border-border capitalize">{job.source}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-32 truncate">
                        {job.skills?.slice(0,3).join(", ") || "—"}
                        {job.skills?.length > 3 && ` +${job.skills.length - 3}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {job.fetchedAt ? new Date(job.fetchedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs flex items-center gap-1">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {jobs.length < jobsTotal && (
            <div className="text-center">
              <Button variant="outline" onClick={loadMoreJobs} disabled={jobsLoading} className="gap-2">
                {jobsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Load more ({jobsTotal - jobs.length} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "recs" && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
            ))
          ) : recs.length === 0 ? (
            <div className="rounded-2xl border border-border p-12 text-center">
              <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No recommendations yet. Run a batch sync first!</p>
            </div>
          ) : (
            recs.map((rec: any) => {
              const job  = rec.jobId
              const user = rec.userId
              if (!job || !user) return null
              return (
                <div key={rec._id} className="rounded-xl border border-border bg-card/40 p-4 flex items-start gap-4 hover:bg-card/60 transition-colors">
                  {/* User avatar */}
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Briefcase className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">{job.title}</span>
                      <span className="text-xs text-muted-foreground">@ {job.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ScorePill score={rec.matchScore} />
                    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                      {rec.isViewed   && <span className="text-blue-400">Viewed</span>}
                      {rec.isSaved    && <span className="text-yellow-400">Saved</span>}
                      {rec.isApplied  && <span className="text-emerald-400">Applied</span>}
                    </div>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
