import { Navbar } from "@/components/navbar"
import { CodeArenaHero } from "@/components/code-arena/code-arena-hero"
import { CodeArenaFilters } from "@/components/code-arena/code-arena-filters"
import { CodeArenaProblemList } from "@/components/code-arena/code-arena-problem-list"

export default function CodeArenaPage() {
  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero — scrolls away */}
      <div className="pt-16">
        <CodeArenaHero />
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 overflow-hidden">
        {/* Filter sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto no-scrollbar py-6">
          <CodeArenaFilters />
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6">
          <CodeArenaProblemList />
        </div>
      </div>
    </div>
  )
}
