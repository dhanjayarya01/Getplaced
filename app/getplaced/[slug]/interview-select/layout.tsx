"use client"

import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function GetPlacedInterviewSelectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
