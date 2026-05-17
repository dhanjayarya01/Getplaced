"use client"

import { MapPin, Briefcase, Globe, ExternalLink, Loader2 } from "lucide-react"

interface Job {
  title: string
  company: string
  location: string
  description: string
  url: string
  source: string
  postedAt?: string
}

interface JobListProps {
  jobs: Job[]
  loading: boolean
  total?: number
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

export function JobList({ jobs, loading, total }: JobListProps) {
  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted/60 rounded w-2/3" />
              <div className="h-3 bg-muted/40 rounded w-1/3" />
              <div className="h-3 bg-muted/30 rounded w-full mt-2" />
              <div className="h-3 bg-muted/30 rounded w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (jobs.length === 0) return (
    <div className="text-center py-12 bg-card rounded-xl border border-border">
      <Briefcase className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-muted-foreground">No jobs found matching your criteria</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="block bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group relative"
          >
            {/* Remote Badge */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {job.location?.toLowerCase().includes('remote') && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                  <Globe className="w-3 h-3" />
                  Remote
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              {/* Gradient Company Avatar */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${companyGradient(job.company)} flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm`}>
                {job.company?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between pr-24">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-foreground font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-primary">
                        <Briefcase className="w-4 h-4" />{job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />{job.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {job.description}
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-xs px-2 py-1 bg-secondary rounded-md capitalize">via {job.source}</span>
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    View Job <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
