"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Globe, ExternalLink, Loader2, Search } from "lucide-react"
import Link from "next/link"

interface Job {
  title: string
  company: string
  location: string
  description: string
  url: string
  source: string
}

interface JobListProps {
  jobs: Job[]
  loading: boolean
}

export function JobList({ jobs, loading }: JobListProps) {
  if (loading) return ( <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> )

  if (jobs.length === 0) return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
      </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Latest Job Postings ({jobs.length})</h2>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="block bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg group relative"
          >
            {/* Badges Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {job.location?.toLowerCase().includes('remote') && (
                     <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                        <Globe className="w-3 h-3" />
                        Remote
                     </span>
                )}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground uppercase">
                {job.company?.charAt(0) || '?'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between pr-24">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-foreground font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-primary"><Briefcase className="w-4 h-4" />{job.company}</span>
                      {job.location && (
                        <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" />{job.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground line-clamp-3">
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
