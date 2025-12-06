"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, TrendingUp } from "lucide-react"

const trendingCompanies = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"]

export function CompanySearch() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Find Your Target Company</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search companies (e.g., Google, TCS, Infosys...)"
            className="pl-12 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button size="lg" className="bg-primary text-primary-foreground h-12">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          Trending:
        </span>
        {trendingCompanies.map((company) => (
          <button
            key={company}
            className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
            onClick={() => setSearchQuery(company)}
          >
            {company}
          </button>
        ))}
      </div>
    </div>
  )
}
