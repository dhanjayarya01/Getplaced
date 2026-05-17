"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
        await refreshUser()
        
        router.push('/dashboard')
      } catch (err) {
        setError(true)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleCallback()
  }, [refreshUser, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-500">Authentication Failed</h2>
          <p className="text-muted-foreground">Redirecting back to home...</p>
        </div>
      </div>
    )
  }

  // Show a skeleton screen that looks like the dashboard loading
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar Skeleton */}
      <header className="h-16 border-b border-border flex items-center px-6 justify-between shrink-0">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24 hidden sm:block" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        {/* Large Chart/Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-1" />
        </div>
      </main>
    </div>
  )
}
