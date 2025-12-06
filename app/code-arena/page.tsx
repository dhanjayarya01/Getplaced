import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CodeArenaHero } from "@/components/code-arena/code-arena-hero"
import { CodeArenaFilters } from "@/components/code-arena/code-arena-filters"
import { CodeArenaProblemList } from "@/components/code-arena/code-arena-problem-list"

export default function CodeArenaPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <CodeArenaHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <CodeArenaFilters />
            </aside>
            <div className="lg:col-span-3">
              <CodeArenaProblemList />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
