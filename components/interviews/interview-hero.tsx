import { Mic } from "lucide-react"
import { ReactNode } from "react"

interface InterviewHeroProps {
  resumeButton?: ReactNode
}

export function InterviewHero({ resumeButton }: InterviewHeroProps) {
  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Mic className="w-8 h-8 text-accent" />
              Mock Interviews
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Practice with AI-powered interviews that simulate real interview experiences. Get instant feedback and
              improve your communication skills.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">24</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8.5</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Top 15%</div>
              <div className="text-sm text-muted-foreground">Ranking</div>
            </div>
          </div>
        </div>
        
        {/* Resume Button - Bottom Right Corner */}
        {resumeButton && (
          <div className="absolute bottom-4 right-4 sm:right-6 lg:right-8">
            {resumeButton}
          </div>
        )}
      </div>
    </section>
  )
}
