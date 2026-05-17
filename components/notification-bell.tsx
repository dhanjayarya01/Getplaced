"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Bell, Sparkles, X, ExternalLink, ShieldAlert, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  linkUrl: string | null
  createdAt: string
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/notifications`, {
        credentials: "include",
      })
      if (r.ok) {
        const d = await r.json()
        if (d.success) {
          setNotifications(d.data || [])
          setUnreadCount(d.unreadCount || 0)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchNotifications()

    // Connect to SSE stream
    const eventSource = new EventSource(`${API}/api/notifications/stream`, {
      withCredentials: true
    })

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'CONNECTED') {
          console.log('[SSE]', data.message)
          return
        }

        // It's a new notification!
        const newNotif = data as Notification
        
        // Push it to the top of the list and increment unread
        setNotifications((prev) => [newNotif, ...prev])
        setUnreadCount((prev) => prev + 1)
        
        // Optional: show a native browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message })
        }
      } catch (e) {
        console.error("Error parsing SSE message:", e)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[SSE] EventSource failed:', err)
      // SSE automatically attempts to reconnect, so we don't need to close it manually
      // unless we want to stop trying.
    }

    return () => {
      eventSource.close()
    }
  }, [isAuthenticated, fetchNotifications])

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

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      })
    } catch (error) {
      console.error("Failed to mark notification as read", error)
    }
  }

  const clearAllNotifications = async () => {
    setNotifications([])
    setUnreadCount(0)
    try {
      await fetch(`${API}/api/notifications/all`, {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (error) {
      console.error("Failed to clear notifications", error)
    }
  }

  if (!isAuthenticated) return null

  const getIconForType = (type: string) => {
    switch (type) {
      case 'JOB_MATCH': return <Sparkles className="w-4 h-4 text-emerald-500" />
      case 'CODE_EXECUTION': return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'ADMIN_ALERT': return <ShieldAlert className="w-4 h-4 text-rose-500" />
      default: return <Info className="w-4 h-4 text-purple-500" />
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 md:w-96 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications} 
                  className="text-[10px] font-medium text-muted-foreground hover:text-red-500 transition-colors ml-2 bg-muted/50 hover:bg-red-500/10 px-2 py-0.5 rounded-md"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/60 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-muted/60 rounded w-3/4" />
                      <div className="h-3 bg-muted/40 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later for updates and alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {notifications.map(notif => (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}
                    onClick={(e) => { 
                      if (!notif.isRead) markAsRead(notif._id, e as any);
                      setSelectedNotif(notif);
                      setOpen(false);
                    }}
                  >
                    <div className="mt-0.5 shrink-0 bg-background p-1.5 rounded-full border border-border shadow-sm">
                      {getIconForType(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                          {notif.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      
                      <div className={`text-xs mt-1 ${!notif.isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </div>
                      
                      {notif.linkUrl && (
                        <Link 
                          href={notif.linkUrl}
                          onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 mt-2"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    
                    {!notif.isRead && (
                      <div className="shrink-0 mt-1.5 flex flex-col items-center gap-2">
                        <span className="block h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            setNotifications(prev => prev.filter(n => n._id !== selectedNotif._id))
            setSelectedNotif(null)
          }}
        >
          <div
            style={{ position: 'relative', width: '90vw', maxWidth: '28rem', margin: 'auto' }}
            className="bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                  {getIconForType(selectedNotif.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedNotif.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(selectedNotif.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <button onClick={() => {
                setNotifications(prev => prev.filter(n => n._id !== selectedNotif._id))
                setSelectedNotif(null)
              }} className="text-muted-foreground hover:text-foreground p-1 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
              {selectedNotif.message}
            </div>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setNotifications(prev => prev.filter(n => n._id !== selectedNotif._id))
                setSelectedNotif(null)
              }}>Close</Button>
              {selectedNotif.linkUrl && (
                <Link 
                  href={selectedNotif.linkUrl} 
                  onClick={() => {
                    setNotifications(prev => prev.filter(n => n._id !== selectedNotif._id))
                    setSelectedNotif(null)
                  }} 
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  View Details <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
