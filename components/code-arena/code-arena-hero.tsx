import { Terminal } from "lucide-react"

export function CodeArenaHero() {
  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Terminal className="w-8 h-8 text-primary" />
              Code Arena
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Solve real development challenges in a live coding environment. Monaco editor, integrated terminal, and
              instant preview.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">32</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">5</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1,850</div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
