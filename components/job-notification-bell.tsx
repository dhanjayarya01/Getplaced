"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Bell, Sparkles, Briefcase, X, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Rec {
  _id: string
  matchScore: number
  isViewed: boolean
  batchDate: string
  job?: {
    title: string
    company: string
    url?: string
  }
}

export function JobNotificationBell() {
  const { isAuthenticated } = useAuth()
  const [recs, setRecs]         = useState<Rec[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const unread                  = recs.filter(r => !r.isViewed).length
  const panelRef                = useRef<HTMLDivElement>(null)

  const fetchRecs = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/jobs/recommendations?page=1&limit=8`, {
        credentials: "include",
      })
      if (r.ok) {
        const d = await r.json()
        setRecs(d.data?.recommendations || [])
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Fetch on mount + every 5 min
  useEffect(() => {
    fetchRecs()
    const t = setInterval(fetchRecs, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [fetchRecs])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  if (!isAuthenticated) return null

  const scoreColor = (s: number) =>
    s >= 0.85 ? "text-emerald-400" :
    s >= 0.70 ? "text-blue-400" :
                "text-yellow-400"

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchRecs() }}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Job notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">AI Job Matches</span>
              {unread > 0 && (
                <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary/20">
                  {unread} new
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && recs.length === 0 ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3.5 bg-muted/60 rounded w-3/4" />
                    <div className="h-3 bg-muted/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No matches yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Upload a resume to get AI job matches!</p>
              </div>
            ) : (
              recs.map(rec => (
                <Link
                  key={rec._id}
                  href={`/jobs`}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 ${!rec.isViewed ? "bg-primary/5" : ""}`}
                >
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0">
                    {!rec.isViewed
                      ? <span className="block h-2 w-2 rounded-full bg-primary" />
                      : <span className="block h-2 w-2 rounded-full bg-transparent" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {rec.job?.title || "Job Match"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {rec.job?.company}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${scoreColor(rec.matchScore)}`}>
                      {Math.round(rec.matchScore * 100)}% match
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-border p-3">
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors"
            >
              <Briefcase className="w-4 h-4" /> View all job matches <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
