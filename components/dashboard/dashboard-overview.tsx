"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import {
  Code2, Mic, Terminal, Building2, TrendingUp,
  Flame, Trophy, ArrowRight, Star, Briefcase,
  RefreshCw, User, Calendar, CheckCircle, Zap,
  BarChart3, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UserStats {
  dsaSolved: number
  devSolved: number
  mockInterviewsCompleted: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string
}

interface JobRec {
  _id: string
  matchScore: number
  job?: { title: string; company: string }
}

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recs, setRecs] = useState<JobRec[]>([])
  const [rank, setRank] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingStats(true)
      try {
        // Fetch stats
        const sRes = await fetch(`${API}/api/users/stats`, { credentials: "include" })
        if (sRes.ok) {
          const d = await sRes.json()
          if (d.success) setStats(d.data)
        }

        // Fetch job recommendations
        const rRes = await fetch(`${API}/api/jobs/recommendations?page=1&limit=3`, { credentials: "include" })
        if (rRes.ok) {
          const rd = await rRes.json()
          if (rd.success) setRecs(rd.data?.recommendations || [])
        }

        // Fetch leaderboard rank
        const lRes = await fetch(`${API}/api/users/leaderboard?limit=1000`, { credentials: "include" })
        if (lRes.ok) {
          const ld = await lRes.json()
          if (ld.success && user) {
            const idx = ld.data.findIndex((u: any) => u.name === user.name)
            if (idx !== -1) setRank(idx + 1)
          }
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e)
      } finally {
        setLoadingStats(false)
      }
    }
    if (user) fetchAll()
  }, [user])

  const statCards = [
    {
      label: "DSA Solved",
      value: stats?.dsaSolved ?? 0,
      icon: Code2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      href: "/dsa"
    },
    {
      label: "Mock Interviews",
      value: stats?.mockInterviewsCompleted ?? 0,
      icon: Mic,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      href: "/interviews"
    },
    {
      label: "Dev Challenges",
      value: stats?.devSolved ?? 0,
      icon: Terminal,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      href: "/code-arena"
    },
    {
      label: "Total XP",
      value: (stats?.totalXP ?? 0).toLocaleString(),
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      href: "#"
    },
  ]

  const scoreColor = (s: number) =>
    s >= 0.85 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
    s >= 0.70 ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {user?.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePicture}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full border-2 border-primary/30 object-cover shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {loadingStats ? (
            <div className="flex gap-3">
              <div className="h-9 w-28 bg-secondary animate-pulse rounded-full" />
              <div className="h-9 w-24 bg-secondary animate-pulse rounded-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-sm text-orange-400">{stats?.currentStreak ?? 0} day streak</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-sm text-yellow-400">{(stats?.totalXP ?? 0).toLocaleString()} XP</span>
              </div>
              {rank && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm text-primary">#{rank} Rank</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} className={`bg-card rounded-xl border ${s.border} p-5 hover:shadow-lg hover:scale-[1.02] transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:${s.color} group-hover:translate-x-0.5 transition-all`} />
            </div>
            {loadingStats ? (
              <div className="h-8 w-16 bg-muted/60 rounded animate-pulse mt-2" />
            ) : (
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            )}
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Quick Actions + Job Recs ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/dsa" className="bg-card rounded-xl border border-border p-5 hover:border-blue-500/40 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold group-hover:text-blue-400 transition-colors">DSA Practice</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Solve coding problems and level up your algorithm skills</p>
              <div className="flex items-center text-blue-400 text-xs font-medium">
                Start Practicing <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/interviews" className="bg-card rounded-xl border border-border p-5 hover:border-purple-500/40 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold group-hover:text-purple-400 transition-colors">Mock Interview</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Practice behavioral & technical interviews with AI feedback</p>
              <div className="flex items-center text-purple-400 text-xs font-medium">
                Start Interview <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/code-arena" className="bg-card rounded-xl border border-border p-5 hover:border-emerald-500/40 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">Code Arena</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Build real projects in a full dev environment, in the browser</p>
              <div className="flex items-center text-emerald-400 text-xs font-medium">
                Open Arena <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/jobs" className="bg-card rounded-xl border border-border p-5 hover:border-orange-500/40 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="font-semibold group-hover:text-orange-400 transition-colors">Job Matches</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Browse AI-matched jobs based on your resume and skills</p>
              <div className="flex items-center text-orange-400 text-xs font-medium">
                View Jobs <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* AI Job Matches */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> AI Job Matches
              </h2>
              <Link href="/jobs" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {recs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No matches yet. Upload a resume to get AI-powered job recommendations!</p>
                <Link href="/settings" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Upload Resume <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recs.map(rec => (
                  <div key={rec._id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{rec.job?.title || "Job Match"}</div>
                      <div className="text-xs text-muted-foreground truncate">{rec.job?.company}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(rec.matchScore)}`}>
                      {Math.round(rec.matchScore * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-5">

          {/* Streak & XP Card */}
          <div className="bg-gradient-to-br from-primary/10 via-card to-card rounded-xl border border-primary/20 p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Your Progress
            </h3>
            {loadingStats ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-muted/60 rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "DSA Problems", value: stats?.dsaSolved ?? 0, max: 500, color: "bg-blue-500" },
                  { label: "Mock Interviews", value: stats?.mockInterviewsCompleted ?? 0, max: 50, color: "bg-purple-500" },
                  { label: "Dev Challenges", value: stats?.devSolved ?? 0, max: 100, color: "bg-emerald-500" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Streak Info */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Streak Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{stats?.currentStreak ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Current Streak</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats?.longestStreak ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Best Streak</div>
              </div>
            </div>
            {stats?.lastActiveDate && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Last active: {new Date(stats.lastActiveDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Leaderboard Rank */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Your Ranking
            </h3>
            {loadingStats ? (
              <div className="h-16 bg-muted/40 rounded animate-pulse" />
            ) : rank ? (
              <div className="text-center py-2">
                <div className="text-4xl font-bold text-primary">#{rank}</div>
                <div className="text-xs text-muted-foreground mt-1">on the leaderboard</div>
                <div className="text-xs text-yellow-400 mt-1">{(stats?.totalXP ?? 0).toLocaleString()} total XP</div>
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-muted-foreground">
                Complete challenges to appear on the leaderboard!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
