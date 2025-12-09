"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Authenticating with Google...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage('Verifying your credentials...')
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
        
        setMessage('Fetching your profile...')
        await refreshUser()
        
        setStatus('success')
        setMessage('Success! Redirecting to dashboard...')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } catch (error) {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleCallback()
  }, [refreshUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md px-4">
        {/* Google Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">GetPlaced</h1>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Your placement preparation platform
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === 'loading' && (
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              )}
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {status === 'loading' && 'Signing you in...'}
                {status === 'success' && 'Welcome back!'}
                {status === 'error' && 'Oops!'}
              </h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {/* Progress Dots */}
            {status === 'loading' && (
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-secondary/30 px-6 py-4 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Secured by Google OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
