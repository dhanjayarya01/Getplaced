"use client"

import { TrendingUp, Star } from "lucide-react"
import { ReactNode } from "react"

const historyItems = [
  { type: "Technical", score: 8.5, feedback: "Great problem-solving approach", date: "Dec 4", improvement: "+0.5" },
  { type: "Behavioral", score: 9.0, feedback: "Excellent STAR responses", date: "Dec 2", improvement: "+1.0" },
  {
    type: "System Design",
    score: 7.5,
    feedback: "Good fundamentals, work on scale",
    date: "Nov 30",
    improvement: "-0.5",
  },
  { type: "1:1 Voice", score: 8.0, feedback: "Clear communication", date: "Nov 28", improvement: "+0.3" },
]

interface InterviewHistoryProps {
  resumeButton?: ReactNode
}

export function InterviewHistory({ resumeButton }: InterviewHistoryProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Recent Performance
        </h2>
      </div>

      <div className="space-y-4">
        {historyItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{item.score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.type}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.improvement.startsWith("+") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {item.improvement}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">{item.feedback}</div>
            </div>
            <div className="text-sm text-muted-foreground">{item.date}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">AI Insight</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your technical scores have improved 15% this month. Focus more on system design to round out your preparation.
        </p>
      </div>

      {/* Resume Button Below Stats */}
      {resumeButton && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">RESUME</div>
          {resumeButton}
        </div>
      )}
    </div>
  )
}
