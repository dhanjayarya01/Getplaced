"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

export function InterviewTypes() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await apiService.mockInterviews.getAll()
      setInterviews(response.data || [])
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Interview Type</h2>
        <div className="text-center py-12">Loading interviews...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Choose Interview Type</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviews.map((interview: any) => (
          <Link
            key={interview._id}
            href={`/interviews/${interview._id}`}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group"
          >
            <div className="text-4xl mb-4 h-10 w-10 flex items-center justify-center">
              {interview.image ? (
                <img src={interview.image} alt={interview.title} className="w-10 h-10 object-contain rounded-md" />
              ) : (
                interview.icon
              )}
            </div>
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors capitalize">
              {interview.title.replace(/-/g, ' ')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {interview.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{interview.duration} min</span>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                  interview.codingType 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {interview.codingType ? 'Coding' : 'Behavioral'}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="text-primary group-hover:bg-primary/10">
                Start
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
