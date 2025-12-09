"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Fetching your profile...')
        // Refresh user data from backend
        await refreshUser()
        
        setStatus('Success! Redirecting...')
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } catch (error) {
        setStatus('Authentication failed. Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    handleCallback()
  }, [refreshUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{status}</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
}
