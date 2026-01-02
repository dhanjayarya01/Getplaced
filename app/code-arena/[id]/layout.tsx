"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function CodeArenaDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
