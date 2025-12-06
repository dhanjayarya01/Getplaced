import { Building2 } from "lucide-react"

export function GetPlacedHero() {
  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              GetPlaced
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Company-specific interview preparation. Real hiring processes, actual question patterns, and role-based
              prep for 100+ companies.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-sm text-muted-foreground">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
