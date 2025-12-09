import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DSADynamicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
