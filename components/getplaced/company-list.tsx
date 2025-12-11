"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Users, ChevronRight, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

export function CompanyList() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await apiService.companies.getAll({ limit: 20, sort: '-createdAt' })
      
      if (response.success) {
        // Filter only active companies for public view
        const activeCompanies = response.data.filter((c: any) => c.isActive !== false)
        setCompanies(activeCompanies)
      } else {
        setError(response.message || 'Failed to fetch companies')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching companies')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Very Hard":
        return "text-red-500 bg-red-500/10"
      case "Hard":
        return "text-orange-500 bg-orange-500/10"
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "Easy":
        return "text-green-500 bg-green-500/10"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  const formatPackage = (pkg: any) => {
    if (!pkg || (!pkg.min && !pkg.max)) return "Not specified"
    const currency = pkg.currency === 'INR' ? '₹' : '$'
    if (pkg.min && pkg.max) {
      return `${currency}${pkg.min}-${pkg.max} LPA`
    } else if (pkg.min) {
      return `${currency}${pkg.min}+ LPA`
    } else if (pkg.max) {
      return `Up to ${currency}${pkg.max} LPA`
    }
    return "Not specified"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCompanies} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No companies found</p>
        <p className="text-sm text-muted-foreground">Companies will appear here once they are added</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Popular Companies</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <Link
            key={company._id}
            href={`/getplaced/${company.slug || company._id}`}
            className="block bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start gap-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 rounded-xl bg-secondary object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {company.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{company.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {(company.headquarters || company.locations?.[0]) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {company.headquarters || company.locations?.[0] || 'Multiple Locations'}
                        </span>
                      )}
                      {company.employeeCount && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {company.employeeCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {company.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(company.difficulty)}`}>
                      {company.difficulty}
                    </span>
                  )}
                </div>

                {company.roles && company.roles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {company.roles.slice(0, 3).map((role: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-secondary rounded-full text-sm">
                        {role}
                      </span>
                    ))}
                    {company.roles.length > 3 && (
                      <span className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">
                        +{company.roles.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formatPackage(company.averagePackage)}</span>
                    </span>
                    {company.stats?.preparing && (
                      <span className="text-muted-foreground">{company.stats.preparing.toLocaleString()} preparing</span>
                    )}
                    {company.isHiring && (
                      <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                        Hiring
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
