"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "DSA", href: "/dsa" },
  { name: "Interviews", href: "/interviews" },
  { name: "Code Arena", href: "/code-arena" },
  { name: "GetPlaced", href: "/getplaced" },
]

export function Navbar() {
  const { isAuthenticated, user, logout, setShowSignInModal, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleSignIn = () => {
    setShowSignInModal(true)
  }

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">GetPlaced</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 text-sm transition-colors rounded-lg ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="h-9 w-24 bg-secondary animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
                    {user.name}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSignIn} variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button
                  onClick={handleSignIn}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-2 rounded-lg ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="h-10 bg-secondary animate-pulse rounded-lg" />
              ) : isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      handleSignIn()
                      setIsOpen(false)
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      handleSignIn()
                      setIsOpen(false)
                    }}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
