"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"

const scheduledInterviews = [
  { type: "Technical", company: "Google Style", date: "Today", time: "3:00 PM", status: "upcoming" },
  { type: "Behavioral", company: "Amazon LP", date: "Tomorrow", time: "10:00 AM", status: "scheduled" },
  { type: "System Design", company: "Meta Style", date: "Dec 8", time: "2:00 PM", status: "scheduled" },
]

export function InterviewSchedule() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Scheduled Interviews
        </h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Schedule New
        </Button>
      </div>

      <div className="space-y-4">
        {scheduledInterviews.map((interview, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <div className="font-medium">{interview.type} Interview</div>
              <div className="text-sm text-muted-foreground">{interview.company}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{interview.date}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                {interview.time}
              </div>
            </div>
            {interview.status === "upcoming" && (
              <Button size="sm" className="ml-4 bg-primary text-primary-foreground">
                Join Now
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
