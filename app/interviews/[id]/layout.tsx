"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function InterviewSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
