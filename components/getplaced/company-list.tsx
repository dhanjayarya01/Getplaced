"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Users, ChevronRight, Briefcase, Loader2, Globe, CheckCircle2, Building2 } from "lucide-react"
import Link from "next/link"

interface CompanyListProps {
    companies: any[]
    loading: boolean
    error: string | null
    onRetry: () => void
}

function companyGradient(name: string) {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-violet-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-600",
    "from-lime-500 to-green-600",
  ]
  let hash = 0
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function CompanyList({ companies, loading, error, onRetry }: CompanyListProps) {

  const formatPackage = (pkg: any) => {
    if (!pkg || (!pkg.min && !pkg.max)) return "Not specified"
    const currency = pkg.currency === 'INR' ? '₹' : '$'
    if (pkg.min && pkg.max) return `${currency}${pkg.min}-${pkg.max} LPA`
    if (pkg.min) return `${currency}${pkg.min}+ LPA`
    if (pkg.max) return `Up to ${currency}${pkg.max} LPA`
    return "Not specified"
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-muted/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted/60 rounded w-1/3" />
            <div className="h-3 bg-muted/40 rounded w-1/2" />
            <div className="h-3 bg-muted/30 rounded w-2/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-destructive mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">Try Again</Button>
    </div>
  )

  if (companies.length === 0) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">No companies found matching your criteria</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Companies ({companies.length})</h2>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <Link
            key={company._id}
            href={`/getplaced/${company.slug || company._id}`}
            className="block bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group relative"
          >
            {/* Badges Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {company.hiringFreshers && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Freshers
                </span>
              )}
              {company.workModes?.includes('Remote') && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                  <Globe className="w-3 h-3" />
                  Remote
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              {/* Logo / Gradient Avatar */}
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 rounded-xl bg-white object-contain p-1 border border-border shrink-0"
                />
              ) : (
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${companyGradient(company.name)} flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm`}>
                  {company.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between pr-24">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{company.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                      {(company.headquarters || company.locations?.[0]) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {company.headquarters || company.locations?.[0]}
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
                </div>

                {/* Experience Range */}
                {company.experienceRequired && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Exp: <span className="font-medium text-foreground">{company.experienceRequired.min}-{company.experienceRequired.max} Years</span>
                  </div>
                )}

                {/* Roles */}
                {company.rolesData && company.rolesData.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary">
                        {company.rolesData.length} {company.rolesData.length === 1 ? 'Role' : 'Roles'} Available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {company.rolesData.slice(0, 3).map((role: any, index: number) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                          {role.roleName}
                        </span>
                      ))}
                      {company.rolesData.length > 3 && (
                        <span className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">
                          +{company.rolesData.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formatPackage(company.averagePackage)}</span>
                    </span>
                    {company.isHiring && (
                      <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
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
