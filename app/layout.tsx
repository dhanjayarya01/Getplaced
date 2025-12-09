import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import { SignInModal } from "@/components/SignInModal"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GetPlaced - Your Complete Placement Preparation Platform",
  description: "Master DSA, ace interviews, solve dev problems, and prepare for your dream company with GetPlaced",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased dark`}>
        <AuthProvider>
          {children}
          <SignInModal />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
