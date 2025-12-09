"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, setShowSignInModal } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowSignInModal(true)
    }
  }, [isAuthenticated, loading, setShowSignInModal])

  // Show content regardless - modal will appear if not authenticated
  return <>{children}</>
}
