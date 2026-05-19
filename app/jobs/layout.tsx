"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
