import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DSAHero } from "@/components/dsa/dsa-hero"
import { DSAFilters } from "@/components/dsa/dsa-filters"
import { DSAProblemList } from "@/components/dsa/dsa-problem-list"
import { DSARoadmap } from "@/components/dsa/dsa-roadmap"

export default function DSAPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <DSAHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <DSAFilters />
            </aside>
            <div className="lg:col-span-3 space-y-8">
              <DSARoadmap />
              <DSAProblemList />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
