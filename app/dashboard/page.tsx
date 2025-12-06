import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <DashboardOverview />
      </div>
      <Footer />
    </main>
  )
}
