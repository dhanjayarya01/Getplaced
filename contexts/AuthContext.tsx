"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

interface User {
  id: string
  googleId: string
  email: string
  name: string
  profilePicture?: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  showSignInModal: boolean
  setShowSignInModal: (show: boolean) => void
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignInModal, setShowSignInModal] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.auth.getCurrentUser()
      if (response.success && response.user) {
        setIsAuthenticated(true)
        setUser(response.user)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    
    apiService.auth.googleLogin()
  }

  const logout = async () => {
    try {
      await apiService.auth.logout()
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        showSignInModal,
        setShowSignInModal,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
