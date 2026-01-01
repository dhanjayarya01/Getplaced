"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GetPlacedHero } from "@/components/getplaced/getplaced-hero"
import { CompanySearch } from "@/components/getplaced/company-search"
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

  // Build query params
  const queryParams: any = { 
    limit: 50, 
    sort: '-createdAt',
    search: debouncedSearch || undefined
  }
  
  if (filters.hiringFreshers) queryParams.hiringFreshers = true
  if (filters.workMode) queryParams.workMode = filters.workMode
  if (filters.experience > 0) queryParams.experience = filters.experience
  if (filters.minPackage > 0) queryParams.minPackage = filters.minPackage

  // Use React Query hook
  const {data, isLoading, error, refetch} = useCompanies(queryParams)

  const companies = data?.data?.filter((c: any) => c.isActive !== false) || []

  const clearFilters = () => {
      setFilters({
        hiringFreshers: false,
        workMode: '',
        experience: 0,
        minPackage: 0
      })
      setSearchQuery("")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <GetPlacedHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
          {/* We pass props to Search to control it from here */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Find Your Target Company</h2>
            <div className="relative">
                 <input 
                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-4"
                    placeholder="Search companies (e.g., Google, TCS, Infosys...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CompanyList 
                companies={companies} 
                loading={isLoading} 
                error={error?.message || null} 
                onRetry={() => refetch()} 
              />
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <CompanyFilters filters={filters} setFilters={setFilters} onClear={clearFilters} />
                <ResumeSection />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
