"use client"
import { useEffect, useState, useCallback } from "react"
import { Database, RefreshCw, Trash2, Plus, Search, Eye, X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const api = (path: string, opts?: RequestInit) =>
  fetch(`${BACKEND}${path}`, { credentials: 'include', ...opts })

function fmtTTL(ttl: number) {
  if (ttl === -1) return <span className="text-muted-foreground text-xs">no expiry</span>
  if (ttl === -2) return <span className="text-red-400 text-xs">expired</span>
  const m = Math.floor(ttl / 60), s = ttl % 60
  const color = ttl < 60 ? 'text-red-400' : ttl < 300 ? 'text-yellow-400' : 'text-emerald-400'
  return <span className={`font-mono text-xs ${color}`}>{m > 0 ? `${m}m ${s}s` : `${s}s`}</span>
}

const TYPE_COLORS: Record<string, string> = {
  string: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  hash:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  list:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  set:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  zset:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

export default function CachePage() {
  const [health, setHealth]     = useState<any>(null)
  const [stats,  setStats]      = useState<any>(null)
  const [keys,   setKeys]       = useState<any[]>([])
  const [total,  setTotal]      = useState(0)
  const [page,   setPage]       = useState(1)
  const [pattern, setPattern]   = useState('*')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [viewing, setViewing]   = useState<any>(null)
  const [setForm, setSetForm]   = useState({ key: '', value: '', ttl: '' })
  const [showSet, setShowSet]   = useState(false)
  const [msg, setMsg]           = useState('')
  const limit = 50

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.allSettled([
      fetch(`${BACKEND}/api/cache/health`).then(r => r.ok ? r.json() : null).then(d => d?.success && setHealth(d.data)),
      api('/api/cache/stats').then(r => r.ok ? r.json() : null).then(d => d?.success && setStats(d.data)),
      api(`/api/cache/keys?pattern=${encodeURIComponent(pattern)}&page=${page}&limit=${limit}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.success) { setKeys(d.data.keys); setTotal(d.data.pagination.total) } }),
    ])
    setLoading(false)
  }, [pattern, page])

  useEffect(() => { fetchAll() }, [fetchAll])

  const viewKey = async (key: string) => {
    const r = await api(`/api/cache/key/${encodeURIComponent(key)}`)
    const d = await r.json()
    if (d.success) setViewing(d.data)
  }

  const deleteOne = async (key: string) => {
    await api(`/api/cache/key/${encodeURIComponent(key)}`, { method: 'DELETE' })
    flash(`Deleted: ${key}`); fetchAll()
  }

  const deleteBulk = async () => {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} key(s)?`)) return
    await api('/api/cache/keys/bulk', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: [...selected] }),
    })
    setSelected(new Set()); flash(`Deleted ${selected.size} keys`); fetchAll()
  }

  const clearAll = async () => {
    if (!confirm('Clear ALL cache? This cannot be undone.')) return
    await api('/api/cache/clear', { method: 'POST' })
    flash('All cache cleared'); fetchAll()
  }

  const warmUp = async () => {
    const r = await api('/api/cache/warm', { method: 'POST' })
    const d = await r.json()
    flash(d.message || 'Cache warmed'); fetchAll()
  }

  const setKeySubmit = async () => {
    if (!setForm.key) return
    await api('/api/cache/key', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: setForm.key, value: setForm.value, ttl: setForm.ttl ? Number(setForm.ttl) : undefined }),
    })
    setSetForm({ key: '', value: '', ttl: '' }); setShowSet(false)
    flash(`Set: ${setForm.key}`); fetchAll()
  }

  const pages = Math.ceil(total / limit)
  const allSelected = keys.length > 0 && keys.every(k => selected.has(k.key))
  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(keys.map(k => k.key)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="w-6 h-6 text-primary" /> Redis Cache</h1>
          <p className="text-muted-foreground text-sm mt-1">Inspect and manage all cache keys</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={warmUp} className="gap-2 text-orange-400 border-orange-500/30 hover:bg-orange-500/10"><Flame className="w-4 h-4" /> Warm</Button>
          <Button variant="outline" size="sm" onClick={() => setShowSet(true)} className="gap-2"><Plus className="w-4 h-4" /> Set Key</Button>
          <Button variant="destructive" size="sm" onClick={clearAll}>Flush All</Button>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-2"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>
      </div>

      {msg && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">{msg}</div>}

      {/* Health + Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        {health && (
          <div className={`rounded-xl border p-4 flex items-start gap-4 ${health.status === 'healthy' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <div className={`p-2 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {health.status === 'healthy' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            </div>
            <div className="space-y-1 flex-1">
              <div className="font-semibold capitalize">{health.status} · {health.latency}</div>
              {[
                ['Memory', health.memoryUsed],
                ['Uptime', health.uptime],
                ['Version', health.version],
                ['Role', health.role],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats && (
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">App Metrics</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Hits',     v: stats.metrics?.hits,     c: 'text-emerald-400' },
                { l: 'Misses',   v: stats.metrics?.misses,   c: 'text-red-400' },
                { l: 'Hit Rate', v: stats.metrics?.hitRatio, c: 'text-blue-400' },
                { l: 'Keys',     v: stats.redis?.keys,       c: 'text-purple-400' },
                { l: 'Redis Hit%', v: stats.redis?.redisHitRatio, c: 'text-yellow-400' },
                { l: 'Clients',  v: stats.redis?.connectedClients, c: '' },
              ].map(({ l, v, c }) => (
                <div key={l} className="flex justify-between py-1 border-b border-border/40 last:border-0 text-xs">
                  <span className="text-muted-foreground">{l}</span>
                  <span className={`font-mono font-medium ${c}`}>{v ?? '—'}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={async () => { await api('/api/cache/stats/reset', { method: 'POST' }); flash('Stats reset'); fetchAll() }}>Reset Stats</Button>
            </div>
          </div>
        )}
      </div>

      {/* Key browser */}
      <div className="space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Pattern e.g. dsa:* or *" value={pattern}
              onChange={e => setPattern(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(1), fetchAll())} />
          </div>
          <Button size="sm" onClick={() => { setPage(1); fetchAll() }}>Search</Button>
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" className="gap-2" onClick={deleteBulk}>
              <Trash2 className="w-3 h-3" /> Delete {selected.size}
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{total} key{total !== 1 ? 's' : ''} matched</span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                </th>
                <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Key</th>
                <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-3 py-3 font-semibold text-muted-foreground">TTL</th>
                <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Size</th>
                <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-4 bg-muted/60 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : keys.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">No keys matched</td></tr>
              ) : keys.map(k => (
                <tr key={k.key} className={`hover:bg-muted/10 transition-colors ${selected.has(k.key) ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={selected.has(k.key)}
                      onChange={e => { const s = new Set(selected); e.target.checked ? s.add(k.key) : s.delete(k.key); setSelected(s) }}
                      className="rounded" />
                  </td>
                  <td className="px-3 py-2.5 max-w-xs">
                    <span className="font-mono text-xs truncate block">{k.key}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[k.type] || 'bg-muted text-muted-foreground border-border'}`}>{k.type}</span>
                  </td>
                  <td className="px-3 py-2.5">{fmtTTL(k.ttl)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {k.size != null ? k.size : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => viewKey(k.key)}><Eye className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={() => deleteOne(k.key)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="gap-1"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="gap-1"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* View key modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-sm font-semibold break-all">{viewing.key}</div>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[viewing.type] || ''}`}>{viewing.type}</span>
                  <span className="text-xs text-muted-foreground">TTL: {viewing.ttl === -1 ? 'no expiry' : viewing.ttl === -2 ? 'expired' : `${viewing.ttl}s`}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewing(null)}><X className="w-4 h-4" /></Button>
            </div>
            <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {JSON.stringify(viewing.value, null, 2)}
            </pre>
            <div className="flex justify-end mt-4">
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => { deleteOne(viewing.key); setViewing(null) }}>
                <Trash2 className="w-3 h-3" /> Delete Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Set key modal */}
      {showSet && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSet(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Set Cache Key</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSet(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Key name e.g. dsa:problem:123" value={setForm.key}
                onChange={e => setSetForm(f => ({ ...f, key: e.target.value }))} />
              <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono h-28 resize-none"
                placeholder='Value (string or JSON)' value={setForm.value}
                onChange={e => setSetForm(f => ({ ...f, value: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="TTL in seconds (leave blank = no expiry)" type="number" min="1" value={setForm.ttl}
                onChange={e => setSetForm(f => ({ ...f, ttl: e.target.value }))} />
              <Button className="w-full" onClick={setKeySubmit} disabled={!setForm.key}>Set Key</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
