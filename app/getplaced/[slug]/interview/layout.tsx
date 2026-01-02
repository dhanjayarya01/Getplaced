"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function GetPlacedInterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
