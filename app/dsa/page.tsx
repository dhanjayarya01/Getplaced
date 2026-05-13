"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { DSAHero } from "@/components/dsa/dsa-hero"
import { DSAFilters } from "@/components/dsa/dsa-filters"
import { DSAProblemList } from "@/components/dsa/dsa-problem-list"

export default function DSAPage() {
  const [filters, setFilters] = useState({})

  return (
    <main className="bg-background">
      <Navbar />

      {/* Hero scrolls away naturally when the user scrolls down */}
      <div className="pt-16">
        <DSAHero />
      </div>

      {/*
        Sticky two-column container.
        - Once the hero has scrolled past the navbar, this div "sticks" at top-16
          and fills the remaining viewport height.
        - overflow-hidden prevents the container itself from scrolling.
        - Each child column has overflow-y-auto + no-scrollbar for independent,
          invisible scroll.
      */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex overflow-hidden border-t border-border bg-background">
        {/* Filter sidebar */}
        <aside className="w-64 shrink-0 overflow-y-auto no-scrollbar border-r border-border">
          <div className="p-6">
            <DSAFilters onFilterChange={(f: any) => setFilters(f)} />
          </div>
        </aside>

        {/* Problem list */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <DSAProblemList filters={filters} />
          </div>
        </div>
      </div>
    </main>
  )
}
