"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Map, ChevronRight, Check, Lock } from "lucide-react"

const roadmapSteps = [
  { name: "Arrays & Strings", status: "completed", problems: 25, solved: 25 },
  { name: "Two Pointers", status: "completed", problems: 15, solved: 15 },
  { name: "Sliding Window", status: "current", problems: 12, solved: 8 },
  { name: "Binary Search", status: "locked", problems: 18, solved: 0 },
  { name: "Linked Lists", status: "locked", problems: 20, solved: 0 },
  { name: "Trees & BST", status: "locked", problems: 30, solved: 0 },
]

export function DSARoadmap() {
  const [showRoadmap, setShowRoadmap] = useState(true)

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Your DSA Roadmap</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowRoadmap(!showRoadmap)}>
          {showRoadmap ? "Hide" : "Show"}
        </Button>
      </div>

      {showRoadmap && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {roadmapSteps.map((step, i) => (
              <div key={step.name} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                    step.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : step.status === "current"
                        ? "bg-accent/10 text-accent border border-accent"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : step.status === "locked" ? (
                    <Lock className="w-4 h-4" />
                  ) : null}
                  <span className="text-sm font-medium">{step.name}</span>
                  <span className="text-xs opacity-75">
                    {step.solved}/{step.problems}
                  </span>
                </div>
                {i < roadmapSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-primary">48/120 (40%)</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
