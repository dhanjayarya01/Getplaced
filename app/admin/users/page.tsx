"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Search, Shield, UserX, RefreshCw, ChevronLeft, ChevronRight, Crown, User, Trophy, Star, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// cookie-based auth — no localStorage token needed
const adminFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BACKEND}${path}`, { credentials: 'include', ...opts })

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ROLE_PILL: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  user:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<any[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [role,    setRole]    = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const limit = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (role) params.set('role', role)
    try {
      const res = await adminFetch(`/api/admin/users?${params}`)
      if (!res.ok) { setError(`Failed (${res.status})`); return }
      const d = await res.json()
      setUsers(d.data || [])
      setTotal(d.pagination?.total || 0)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, role])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const setRoleFor = async (userId: string, newRole: string) => {
    await adminFetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    fetchUsers()
  }

  const deactivate = async (userId: string) => {
    if (!confirm('Deactivate this user? They will be locked out.')) return
    await adminFetch(`/api/admin/users/${userId}/deactivate`, { method: 'PUT' })
    fetchUsers()
  }

  const pages = Math.ceil(total / limit)
  const visible = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total.toLocaleString()} registered users
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error} — make sure you are logged in as admin.
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1) }}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          Showing {visible.length} of {total}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">XP</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Submissions</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted/60 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                visible.map((u: any) => (
                  <tr key={u._id} className="hover:bg-muted/10 transition-colors">

                    {/* Avatar + name + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center border border-primary/20">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[180px]">{u.name || '—'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px] flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />{u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_PILL[u.role] || ROLE_PILL.user}`}>
                        {u.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        u.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10     text-red-400     border-red-500/20'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* XP */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono font-medium text-yellow-400 flex items-center justify-end gap-1">
                        <Star className="w-3 h-3" />
                        {(u.stats?.totalXP || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Submissions */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {u.stats?.totalSolved?.toLocaleString() ?? '0'}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {fmtDate(u.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' ? (
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                            onClick={() => setRoleFor(u._id, 'admin')}>
                            <Shield className="w-3 h-3" /> Make Admin
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs gap-1 border-border text-muted-foreground"
                            onClick={() => setRoleFor(u._id, 'user')}>
                            <User className="w-3 h-3" /> Remove Admin
                          </Button>
                        )}
                        {u.isActive !== false && (
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => deactivate(u._id)}>
                            <UserX className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {pages} · {total.toLocaleString()} total users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage(p => p - 1)} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            {/* Page number pills */}
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const pg = page <= 4 ? i + 1 : page + i - 3
              if (pg < 1 || pg > pages) return null
              return (
                <Button key={pg} variant={pg === page ? 'default' : 'outline'} size="sm"
                  className="w-8 h-8 p-0" onClick={() => setPage(pg)}>
                  {pg}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" disabled={page >= pages}
              onClick={() => setPage(p => p + 1)} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
