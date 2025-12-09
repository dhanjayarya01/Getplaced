import { Code2 } from "lucide-react"

export function DSAHero() {
  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Code2 className="w-8 h-8 text-primary" />
              DSA Practice
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Master data structures and algorithms with our curated collection of 500+ problems. Filter by topic,
              pattern, difficulty, or company.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">45</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2,450</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
