"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { LayoutDashboard, Code, Briefcase, Building2, MessageSquare, Users, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Admin Layout - Loading:', loading, 'User:', user)
    if (!loading && (!user || user.role !== 'admin')) {
      console.log('Redirecting to home - Not admin or not logged in')
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Access Denied - Admin Only</p>
          <p className="text-sm text-muted-foreground mt-2">User: {user?.email || 'Not logged in'}</p>
          <p className="text-sm text-muted-foreground">Role: {user?.role || 'N/A'}</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/dsa', icon: Code, label: 'DSA Problems' },
    { href: '/admin/development', icon: Briefcase, label: 'Dev Problems' },
    { href: '/admin/companies', icon: Building2, label: 'Companies' },
    { href: '/admin/mock-interviews', icon: MessageSquare, label: 'Mock Interviews' },
    { href: '/admin/users', icon: Users, label: 'Users' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border min-h-[calc(100vh-5rem)] bg-card/50 sticky top-20">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 px-3">Admin Panel</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={logout}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
