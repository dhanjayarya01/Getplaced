import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function InterviewsDynamicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
