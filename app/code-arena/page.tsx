import { Navbar } from "@/components/navbar"
import { CodeArenaHero } from "@/components/code-arena/code-arena-hero"
import { CodeArenaFilters } from "@/components/code-arena/code-arena-filters"
import { CodeArenaProblemList } from "@/components/code-arena/code-arena-problem-list"

export default function CodeArenaPage() {
  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero scrolls away naturally */}
      <div className="pt-16">
        <CodeArenaHero />
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex overflow-hidden border-t border-border bg-background">
        <aside className="w-64 shrink-0 overflow-y-auto no-scrollbar border-r border-border">
          <div className="p-6">
            <CodeArenaFilters />
          </div>
        </aside>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <CodeArenaProblemList />
          </div>
        </div>
      </div>
    </main>
  )
}
