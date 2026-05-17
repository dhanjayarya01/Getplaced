"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Search, Shield, UserX, RefreshCw, ChevronLeft, ChevronRight, Crown, User, Trophy, Star, Mail, Calendar, Bell } from "lucide-react"
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

  const [emailModal, setEmailModal] = useState({ isOpen: false, targetUserId: null as string | null, targetName: '', isSending: false })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [queueStatus, setQueueStatus] = useState<{ wait: number, active: number, completed: number, failed: number } | null>(null)

  const [notificationModal, setNotificationModal] = useState({ isOpen: false, targetUserId: null as string | null, targetName: '', isSending: false, sendStatus: 'idle' })
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

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

  const sendEmail = async () => {
    if (!emailSubject || !emailBody) return alert('Subject and Body are required')
    setEmailModal(prev => ({ ...prev, isSending: true }))
    try {
      const res = await adminFetch(`/api/admin/users/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: emailModal.targetUserId ? [emailModal.targetUserId] : [],
          sendToAll: !emailModal.targetUserId,
          subject: emailSubject,
          html: emailBody
        })
      })
      const data = await res.json()
      if (data.success) {
        // Just clear the form, the polling effect will show the queue status
        setEmailSubject('')
        setEmailBody('')
      } else {
        alert(data.message)
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setEmailModal(prev => ({ ...prev, isSending: false }))
    }
  }

  const sendNotification = async () => {
    if (!notificationTitle || !notificationMessage) return alert('Title and Message are required')
    setNotificationModal(prev => ({ ...prev, isSending: true }))
    try {
      const res = await adminFetch(`/api/admin/users/notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: notificationModal.targetUserId ? [notificationModal.targetUserId] : [],
          sendToAll: !notificationModal.targetUserId,
          title: notificationTitle,
          message: notificationMessage
        })
      })
      const data = await res.json()
      if (data.success) {
        setNotificationModal(prev => ({ ...prev, isSending: false, sendStatus: 'sent' }))
        setTimeout(() => {
          setNotificationTitle('')
          setNotificationMessage('')
          setNotificationModal({ isOpen: false, targetUserId: null, targetName: '', isSending: false, sendStatus: 'idle' })
        }, 1000)
      } else {
        console.error(data.message)
        setNotificationModal(prev => ({ ...prev, isSending: false }))
      }
    } catch (e: any) {
      console.error(e.message)
      setNotificationModal(prev => ({ ...prev, isSending: false }))
    }
  }

  // Poll queue status every 2s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await adminFetch('/api/admin/users/email/status')
        if (res.ok) {
          const data = await res.json()
          if (data.success) setQueueStatus(data.counts)
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchStatus()
    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const pages = Math.ceil(total / limit)
  const visible = search
    ? users.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, page * limit)
    : users.slice(0, page * limit)

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && page < pages) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )
    
    const bottomDiv = document.getElementById('infinite-scroll-trigger')
    if (bottomDiv) observer.observe(bottomDiv)
    
    return () => {
      if (bottomDiv) observer.unobserve(bottomDiv)
    }
  }, [page, pages])

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-0">

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
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => setNotificationModal({ isOpen: true, targetUserId: null, targetName: 'All Users', isSending: false })} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600">
            <Bell className="w-4 h-4" /> Notify All
          </Button>
          <Button variant="default" size="sm" onClick={() => setEmailModal({ isOpen: true, targetUserId: null, targetName: 'All Users', isSending: false })} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
            <Mail className="w-4 h-4" /> Email All Users
          </Button>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error} — make sure you are logged in as admin.
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap shrink-0 pb-1">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
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

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border min-h-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/80 backdrop-blur border-b border-border">
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
              {loading && page === 1 ? (
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
                        <Button size="sm" variant="outline"
                          className="h-7 text-xs gap-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                          onClick={() => setNotificationModal({ isOpen: true, targetUserId: u._id, targetName: u.name || u.email, isSending: false })}>
                          <Bell className="w-3 h-3" /> Notify
                        </Button>
                        <Button size="sm" variant="outline"
                          className="h-7 text-xs gap-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => setEmailModal({ isOpen: true, targetUserId: u._id, targetName: u.name || u.email, isSending: false })}>
                          <Mail className="w-3 h-3" /> Email
                        </Button>
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
          {page < pages && (
            <div id="infinite-scroll-trigger" className="h-10 w-full flex items-center justify-center text-muted-foreground text-sm py-4">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading more...
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Draft Email to {emailModal.targetName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {emailModal.targetUserId ? 'This will send a direct email to the selected user.' : 'Warning: This will send an email to ALL active users.'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="e.g., Important Platform Update"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">HTML Body</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background h-32 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                  placeholder="<p>Hello there...</p>"
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex flex-col items-end gap-2">
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" onClick={() => setEmailModal({ isOpen: false, isSending: false })}>
                  Close
                </Button>
                <Button onClick={sendEmail} disabled={emailModal.isSending || !emailSubject || !emailBody} className="gap-2">
                  {emailModal.isSending ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Queuing...</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send Email</>
                  )}
                </Button>
              </div>
              
              {queueStatus && (queueStatus.active > 0 || queueStatus.wait > 0 || queueStatus.completed > 0 || queueStatus.failed > 0) && (
                <div className="text-xs font-medium flex items-center gap-1.5 mt-1">
                  Queue Status: 
                  {(queueStatus.active > 0 || queueStatus.wait > 0) ? (
                    <span className="text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      {queueStatus.completed}/{queueStatus.completed + queueStatus.wait + queueStatus.active} sending...
                    </span>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {queueStatus.completed}/{queueStatus.completed} completed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Push Notification to {notificationModal.targetName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {notificationModal.targetUserId ? 'This will send an instant on-site notification to this user.' : 'Warning: This will send an instant on-site notification to ALL active users.'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="e.g., System Update"
                  value={notificationTitle}
                  onChange={e => setNotificationTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Message</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                  placeholder="Hello there..."
                  value={notificationMessage}
                  onChange={e => setNotificationMessage(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex flex-col items-end gap-2">
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" onClick={() => setNotificationModal({ isOpen: false, targetUserId: null, targetName: '', isSending: false, sendStatus: 'idle' })}>
                  Close
                </Button>
                <Button onClick={sendNotification} disabled={notificationModal.isSending || notificationModal.sendStatus === 'sent' || !notificationTitle || !notificationMessage} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 transition-all">
                  {notificationModal.isSending ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : notificationModal.sendStatus === 'sent' ? (
                    <><Shield className="w-4 h-4" /> Sent!</>
                  ) : (
                    <><Bell className="w-4 h-4" /> Send Notification</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
