"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/navbar"
import { DSAProblemView } from "@/components/dsa/dsa-problem-view"

export default function DSAProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = use(params) // Unwrap the Promise

  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to home')
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <DSAProblemView problemId={id} />
      </div>
    </main>
  )
}
