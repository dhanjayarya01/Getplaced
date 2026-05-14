"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { GetPlacedHero } from "@/components/getplaced/getplaced-hero"
import { CompanyList } from "@/components/getplaced/company-list"
import { ResumeSection } from "@/components/getplaced/resume-section"
import { CompanyFilters } from "@/components/getplaced/company-filters"
import { useDebounce } from "@/hooks/use-debounce"
import { useCompanies } from "@/hooks/useCompanies"

export default function GetPlacedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [filters, setFilters] = useState({
    hiringFreshers: false,
    workMode: '',
    experience: 0,
    minPackage: 0
  })

  const queryParams: any = {
    limit: 50,
    sort: '-createdAt',
    search: debouncedSearch || undefined
  }
  if (filters.hiringFreshers) queryParams.hiringFreshers = true
  if (filters.workMode) queryParams.workMode = filters.workMode
  if (filters.experience > 0) queryParams.experience = filters.experience
  if (filters.minPackage > 0) queryParams.minPackage = filters.minPackage

  const { data, isLoading, error, refetch } = useCompanies(queryParams)
  const companies = data?.data?.filter((c: any) => c.isActive !== false) || []

  const clearFilters = () => {
    setFilters({ hiringFreshers: false, workMode: '', experience: 0, minPackage: 0 })
    setSearchQuery("")
  }

  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero — scrolls away */}
      <div className="pt-16">
        <GetPlacedHero />
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 overflow-hidden">
        {/* Main content (companies) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
          {/* Search bar */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Find Your Target Company</h2>
            <input
              className="flex h-12 w-full rounded-md border border-input bg-transparent px-4 py-1 text-lg shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Search companies (e.g., Google, TCS, Infosys...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CompanyList
            companies={companies}
            loading={isLoading}
            error={error?.message || null}
            onRetry={() => refetch()}
          />
        </div>

        {/* Filter sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto no-scrollbar py-6 space-y-6">
          <CompanyFilters filters={filters} setFilters={setFilters} onClear={clearFilters} />
          <ResumeSection />
        </aside>
      </div>
    </div>
  )
}
