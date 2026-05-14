"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { DSAHero } from "@/components/dsa/dsa-hero"
import { DSAFilters } from "@/components/dsa/dsa-filters"
import { DSAProblemList } from "@/components/dsa/dsa-problem-list"

export default function DSAPage() {
  const [filters, setFilters] = useState({})

  return (
    // h-screen + overflow-y-auto kills the browser's own scrollbar on this page.
    // The hero scrolls away naturally inside this container.
    // Once past the hero, the sticky two-column grid takes over the remaining viewport.
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero — scrolls away on scroll-down */}
      <div className="pt-16">
        <DSAHero />
      </div>

      {/* Sticky two-column layout — sticks to just below the navbar */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 overflow-hidden">
        {/* Filter sidebar — independent scroll */}
        <aside className="w-72 shrink-0 overflow-y-auto no-scrollbar py-6">
          <DSAFilters onFilterChange={setFilters} />
        </aside>

        {/* Main content — independent scroll */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6">
          <DSAProblemList filters={filters} />
        </div>
      </div>
    </div>
  )
}
