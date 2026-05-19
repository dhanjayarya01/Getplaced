"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Activity, Container, Server, Zap, Users, RefreshCw,
  Square, Database, Cpu, MemoryStick, CheckCircle2,
  XCircle, AlertTriangle, Clock, Flame, BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ── API endpoints ──────────────────────────────────────────────────────────
const FILE_SERVER  = process.env.NEXT_PUBLIC_FILE_SERVER  || process.env.NEXT_PUBLIC_FILE_SERVER_URL  || 'http://localhost:5008'
const BACKEND      = process.env.NEXT_PUBLIC_API_URL      || 'http://localhost:5000'
const DSA_WORKER   = process.env.NEXT_PUBLIC_WORKER_API_URL || 'http://localhost:5001'

// cookie-based auth — no tokens needed
const backendFetch = (path: string) =>
  fetch(`${BACKEND}${path}`, { credentials: 'include' }).catch(() => null)

// ── Helpers ────────────────────────────────────────────────────────────────
function getTimestamp(v: any): number {
  if (!v) return 0
  const n = Number(v)
  if (!Number.isNaN(n)) return n
  const d = new Date(v).getTime()
  return Number.isNaN(d) ? 0 : d
}

function fmtUptime(startedAt: any): string {
  const ts = getTimestamp(startedAt)
  if (!ts) return '—'
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 0)  return '—'
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function fmtMs(ms: any): string {
  const n = Number(ms) || 0
  if (!n) return '—'
  const secs = Math.floor(n / 1000)
  const m = Math.floor(secs / 60), s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function fmtIdle(lastBeat: any, startedAt: any): string {
  const ts = getTimestamp(lastBeat) || getTimestamp(startedAt)
  if (!ts) return '—'
  return fmtMs(Date.now() - ts)
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Ping({ color }: { color: string }) {
  const colors: Record<string,string> = {
    green:  'bg-emerald-500', yellow: 'bg-yellow-400',
    red:    'bg-red-500',     blue:   'bg-blue-500', purple: 'bg-purple-500',
  }
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[color]}`} />
    </span>
  )
}

function Card({ icon: Icon, label, value, sub, color = 'blue' }: any) {
  const s: Record<string,string> = {
    blue:   'from-blue-500/15 to-transparent   border-blue-500/20   text-blue-400',
    green:  'from-emerald-500/15 to-transparent border-emerald-500/20 text-emerald-400',
    yellow: 'from-yellow-500/15 to-transparent  border-yellow-500/20  text-yellow-400',
    red:    'from-red-500/15 to-transparent     border-red-500/20     text-red-400',
    purple: 'from-purple-500/15 to-transparent  border-purple-500/20  text-purple-400',
  }
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${s[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-black/10"><Icon className="w-4 h-4" /></div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold text-foreground tabular-nums">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  )
}

function SectionHeader({ icon: Icon, color, title, badge }: any) {
  return (
    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
      <Icon className={`w-5 h-5 ${color}`} />
      {title}
      {badge != null && (
        <span className="ml-auto text-sm font-normal text-muted-foreground">{badge}</span>
      )}
    </h2>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">{text}</div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ActiveDataPage() {
  const [sessions,      setSessions]      = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState<any>(null)
  const [cacheStats,    setCacheStats]    = useState<any>(null)
  const [cacheHealth,   setCacheHealth]   = useState<any>(null)
  const [bullmq,        setBullmq]        = useState<any>(null)
  const [bullmqJobs,    setBullmqJobs]    = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [killing,       setKilling]       = useState<Record<string, boolean>>({})
  const [lastRefresh,   setLastRefresh]   = useState<Date>(new Date())
  const [tick,          setTick]          = useState(0)

  // 1-second live tick for uptime counters
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.allSettled([
      // Dev sessions
      fetch(`${FILE_SERVER}/sessions`).then(r => r.ok ? r.json() : null).then(d => {
        if (d) setSessions(Object.values(d.sessions || {}))
      }).catch(() => {}),

      // Platform stats (users, problems, submissions)
      backendFetch('/api/admin/stats').then(r => r?.ok ? r.json() : null).then(d => {
        if (d?.success) setPlatformStats(d.data)
      }),

      // Redis cache stats (admin)
      backendFetch('/api/cache/stats').then(r => r?.ok ? r.json() : null).then(d => {
        if (d?.success) setCacheStats(d.data)
      }),

      // Redis cache health (public)
      fetch(`${BACKEND}/api/cache/health`).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.success) setCacheHealth(d.data)
      }).catch(() => {}),

      // BullMQ queue stats
      fetch(`${DSA_WORKER}/api/queue/stats`).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.ok) setBullmq(d)
      }).catch(() => {}),

      // BullMQ queue jobs
      fetch(`${DSA_WORKER}/api/queue/jobs`).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.ok) setBullmqJobs(d.jobs || [])
      }).catch(() => {}),
    ])
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    const t = setInterval(fetchAll, 10_000)
    return () => clearInterval(t)
  }, [fetchAll])

  const killSession = async (sessionId: string) => {
    setKilling(prev => ({ ...prev, [sessionId]: true }))
    try {
      await fetch(`${FILE_SERVER}/stop-project`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } finally {
      await fetchAll()
      setKilling(prev => {
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
    }
  }

  const now = Date.now()
  const hiddenSessions = sessions.filter((s: any) => s.tabHiddenAt)

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Active Data
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live platform stats · auto-refreshes every 10s
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          Last: {lastRefresh.toLocaleTimeString()}
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-2 ml-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card icon={Container} label="Running Containers" color="green"
          value={sessions.length}
          sub={`${hiddenSessions.length} in grace period`} />
        <Card icon={Users} label="Total Users" color="blue"
          value={platformStats?.users?.total ?? '—'}
          sub={platformStats ? `${platformStats.users?.active ?? 0} active` : undefined} />
        <Card icon={BarChart3} label="DSA Submissions" color="yellow"
          value={platformStats?.activity?.submissions?.total ?? '—'}
          sub={platformStats ? `${platformStats.activity?.submissions?.acceptanceRate ?? 0}% accepted` : undefined} />
        <Card icon={Database} label="Redis Keys" color="purple"
          value={cacheStats?.redis?.keys ?? '—'}
          sub={cacheStats ? `${cacheStats.redis?.memoryUsed ?? '?'} used` : undefined} />
      </div>

      {/* ── Running Dev Sessions ── */}
      <section>
        <SectionHeader icon={Container} color="text-emerald-400"
          title="Running Dev Containers"
          badge={`${sessions.length} container${sessions.length !== 1 ? 's' : ''}`} />

        {sessions.length === 0
          ? <Empty text="No containers running — start a Code Arena session to see it here" />
          : (
            <div className="space-y-3">
              {sessions.map((s: any) => {
                const hidden    = !!s.tabHiddenAt
                const hiddenMs  = hidden ? now - getTimestamp(s.tabHiddenAt) : 0
                const graceLeft = Math.max(0, 60_000 - hiddenMs)
                const isDanger  = hidden && graceLeft < 15_000
                const isWarn    = hidden && graceLeft < 30_000
                const dotColor  = isDanger ? 'red' : isWarn ? 'yellow' : hidden ? 'yellow' : 'green'
                const rowClass  = isDanger ? 'border-red-500/40 bg-red-500/5'
                                : isWarn   ? 'border-yellow-500/40 bg-yellow-500/5'
                                : hidden   ? 'border-orange-500/30 bg-orange-500/5'
                                :            'border-border bg-card/40'

                return (
                  <div key={s.sessionId} className={`rounded-xl border px-4 py-3 flex items-center gap-4 ${rowClass}`}>
                    <Ping color={dotColor} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{s.sessionId}</span>
                        {s.slug && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{s.slug}</span>}
                        {hidden && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${isDanger ? 'text-red-400 border-red-400/40 bg-red-500/10' : 'text-orange-400 border-orange-400/40 bg-orange-500/10'}`}>
                            {graceLeft > 0 ? `TAB HIDDEN · ${fmtMs(graceLeft)} left` : `Auto clean executed at ${new Date(getTimestamp(s.tabHiddenAt) + 60_000).toLocaleTimeString()}`}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <span><span className="text-foreground">Uptime</span> {fmtUptime(s.startedAt)}</span>
                        <span><span className="text-foreground">Idle</span> {fmtIdle(s.lastHeartbeat, s.startedAt)}</span>
                        <span><span className="text-foreground">Port</span> {s.port}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${hidden ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {hidden ? '⏸ Grace' : '● Active'}
                    </span>
                    <Button size="sm" variant="destructive" className="h-7 text-xs shrink-0 gap-1" disabled={killing[s.sessionId]} onClick={() => killSession(s.sessionId)}>
                      {killing[s.sessionId] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                      Kill
                    </Button>
                  </div>
                )
              })}
            </div>
          )
        }
      </section>

      {/* ── Redis Cache ── */}
      <section>
        <SectionHeader icon={Database} color="text-purple-400" title="Redis Cache" />

        {/* Health pill */}
        {cacheHealth && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-4 ${
            cacheHealth.status === 'healthy'  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            cacheHealth.status === 'degraded' ? 'bg-yellow-500/10  text-yellow-400  border-yellow-500/20'  :
                                                'bg-red-500/10     text-red-400     border-red-500/20'
          }`}>
            {cacheHealth.status === 'healthy' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            Redis {cacheHealth.status} · {cacheHealth.latency} · {cacheHealth.memoryUsed} used · uptime {cacheHealth.uptime}
          </div>
        )}

        {cacheStats ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* App metrics */}
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">App Cache Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Cache Hits',         value: cacheStats.metrics?.hits?.toLocaleString() ?? '0',      color: 'text-emerald-400' },
                  { label: 'Cache Misses',        value: cacheStats.metrics?.misses?.toLocaleString() ?? '0',    color: 'text-red-400' },
                  { label: 'Errors',              value: cacheStats.metrics?.errors?.toLocaleString() ?? '0',    color: 'text-orange-400' },
                  { label: 'Hit Ratio',           value: cacheStats.metrics?.hitRatio ?? '0%',                   color: 'text-blue-400' },
                  { label: 'Total Requests',      value: cacheStats.metrics?.totalRequests?.toLocaleString() ?? '0', color: 'text-foreground' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className={`text-sm font-mono font-medium ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="pt-2 text-xs text-muted-foreground">
                  Reset: {cacheStats.metrics?.lastReset ? new Date(cacheStats.metrics.lastReset).toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {/* Redis server stats */}
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Redis Server</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Keys',         value: cacheStats.redis?.keys?.toLocaleString() ?? '—' },
                  { label: 'Memory Used',         value: cacheStats.redis?.memoryUsed ?? '—' },
                  { label: 'Peak Memory',         value: cacheStats.redis?.memoryPeak ?? '—' },
                  { label: 'Connected Clients',   value: cacheStats.redis?.connectedClients ?? '—' },
                  { label: 'Redis Hit Ratio',     value: cacheStats.redis?.redisHitRatio ?? '—' },
                  { label: 'Commands Processed',  value: Number(cacheStats.redis?.totalCommandsProcessed)?.toLocaleString() ?? '—' },
                  { label: 'Keyspace Hits',       value: Number(cacheStats.redis?.keyspaceHits)?.toLocaleString() ?? '—' },
                  { label: 'Keyspace Misses',     value: Number(cacheStats.redis?.keyspaceMisses)?.toLocaleString() ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-mono font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Empty text="Redis stats unavailable — make sure you are logged in as admin and the backend is running" />
        )}
      </section>

      {/* ── BullMQ DSA Queue ── */}
      <section>
        <SectionHeader icon={Zap} color="text-yellow-400" title="DSA Execution Queue (BullMQ)" />

        {bullmq ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Active',    value: bullmq.active,    bg: 'bg-blue-500/10   text-blue-400   border-blue-500/20' },
                { label: 'Waiting',   value: bullmq.waiting,   bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                { label: 'Delayed',   value: bullmq.delayed,   bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                { label: 'Completed', value: bullmq.completed, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                { label: 'Failed',    value: bullmq.failed,    bg: 'bg-red-500/10    text-red-400    border-red-500/20' },
              ].map(({ label, value, bg }) => (
                <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
                  <div className="text-3xl font-bold tabular-nums">{value ?? '—'}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* JOBS LIST */}
            {bullmqJobs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Jobs</h3>
                <div className="rounded-xl border border-border bg-card/40 overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Job ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Details</th>
                        <th className="px-4 py-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {bullmqJobs.map((job: any) => {
                         const sColors: any = { active: 'text-blue-400 bg-blue-500/10', waiting: 'text-yellow-400 bg-yellow-500/10', delayed: 'text-orange-400 bg-orange-500/10', completed: 'text-emerald-400 bg-emerald-500/10', failed: 'text-red-400 bg-red-500/10' }
                         return (
                          <tr key={job.id} className="hover:bg-secondary/20">
                            <td className="px-4 py-3 font-mono text-xs">{job.id}</td>
                            <td className="px-4 py-3 font-medium">{job.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase ${sColors[job.state] || 'text-muted-foreground bg-secondary'}`}>
                                {job.state}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate" title={job.state === 'failed' ? job.failedReason : JSON.stringify(job.data)}>
                              {job.state === 'failed' ? job.failedReason : (job.data?.problemId || JSON.stringify(job.data))}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {job.timestamp ? new Date(job.timestamp).toLocaleTimeString() : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <div className="font-medium text-sm">DSA Worker not reachable</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Run <code className="bg-muted px-1 rounded">npm run dev</code> in <code className="bg-muted px-1 rounded">workers/dsa-worker</code>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Platform Stats ── */}
      {platformStats && (
        <section>
          <SectionHeader icon={BarChart3} color="text-blue-400" title="Platform Overview" />
          <div className="grid md:grid-cols-3 gap-4">
            {/* Users */}
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Users
              </h3>
              {[
                { label: 'Total Registered', value: platformStats.users?.total },
                { label: 'Active Users',     value: platformStats.users?.active },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{value?.toLocaleString() ?? '—'}</span>
                </div>
              ))}
            </div>

            {/* Problems */}
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Server className="w-4 h-4" /> Problems
              </h3>
              {[
                { label: 'DSA',            value: platformStats.problems?.dsa },
                { label: 'Dev Projects',   value: platformStats.problems?.development },
                { label: 'Mock Interviews',value: platformStats.problems?.mockInterviews },
                { label: 'Total',          value: platformStats.problems?.total },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{value?.toLocaleString() ?? '—'}</span>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Activity
              </h3>
              {[
                { label: 'Submissions',        value: platformStats.activity?.submissions?.total },
                { label: 'Accepted',           value: platformStats.activity?.submissions?.accepted },
                { label: 'Acceptance Rate',    value: `${platformStats.activity?.submissions?.acceptanceRate ?? 0}%` },
                { label: 'Applications',       value: platformStats.activity?.applications },
                { label: 'Interview Sessions', value: platformStats.activity?.completedSessions },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
