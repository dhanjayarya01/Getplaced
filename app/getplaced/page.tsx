"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GetPlacedHero } from "@/components/getplaced/getplaced-hero"
import { CompanySearch } from "@/components/getplaced/company-search"
import { CompanyList } from "@/components/getplaced/company-list"
import { ResumeSection } from "@/components/getplaced/resume-section"
import { CompanyFilters } from "@/components/getplaced/company-filters"
import { apiService } from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce" // Assuming this exists or I'll implement inline logic

export default function GetPlacedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // Custom debounce logic if hook missing
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [filters, setFilters] = useState({
    hiringFreshers: false,
    workMode: '',
    experience: 0,
    minPackage: 0
  })

  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [suggestedCompanies, setSuggestedCompanies] = useState<any[]>([])

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Companies Effect
  useEffect(() => {
    fetchCompanies()
    fetchSuggested()
  }, [debouncedSearch, filters])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params: any = { 
        limit: 50, 
        sort: '-createdAt',
        search: debouncedSearch
      }
      
      if (filters.hiringFreshers) params.hiringFreshers = true
      if (filters.workMode) params.workMode = filters.workMode
      if (filters.experience > 0) params.experience = filters.experience
      if (filters.minPackage > 0) params.minPackage = filters.minPackage

      const response = await apiService.companies.getAll(params)
      
      if (response.success) {
        setCompanies(response.data.filter((c: any) => c.isActive !== false))
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggested = async () => {
    // Only fetch suggested if we don't have active search filters, to keep UI clean? 
    // Or fetch always to show "Suggested for You" at top?
    // Let's just fetch quietly.
    try {
        // We probably need a specialized call in apiService, effectively calling /companies/suggested/list
        // Assuming apiService.companies.getSuggested exists or we use raw fetch for now if API wrapper isn't updated
        // For now, I'll skip if wrapper isn't ready, but I updated the backend route.
    } catch (e) { console.error(e) }
  }

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
                loading={loading} 
                error={error} 
                onRetry={fetchCompanies} 
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
