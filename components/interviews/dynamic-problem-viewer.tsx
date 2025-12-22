"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Example {
  input: string
  output: string
  explanation?: string
}

interface DynamicProblem {
  title?: string
  difficulty?: string
  description?: string
  examples?: Example[]
  constraints?: string[]
  dataStructures?: string[]
  patterns?: string[]
}

interface DynamicProblemViewerProps {
  problem: DynamicProblem | null
  isLoading?: boolean
}

export function DynamicProblemViewer({ problem, isLoading }: DynamicProblemViewerProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500'
      case 'Hard': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading problem...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!problem || !problem.title) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="text-lg text-muted-foreground">No Problem Loaded</div>
            <div className="text-sm text-muted-foreground max-w-md">
              The interviewer will present a problem when the interview begins. 
              You can solve existing DSA problems or custom interview questions.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{problem.title}</CardTitle>
          {problem.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          )}
        </div>
        {(problem.dataStructures && problem.dataStructures.length > 0) || (problem.patterns && problem.patterns.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {problem.dataStructures?.map((ds) => (
              <span key={ds} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {ds}
              </span>
            ))}
            {problem.patterns?.map((pattern) => (
              <span key={pattern} className="px-2 py-1 bg-secondary text-muted-foreground rounded text-xs">
                {pattern}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          {problem.description && (
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            </div>
          )}

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="space-y-4">
              {problem.examples.map((example, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-3">Example {index + 1}:</h3>
                  <div className="bg-secondary rounded-lg p-4 font-mono text-sm space-y-2">
                    <div>
                      <span className="font-semibold text-foreground">Input:</span>{' '}
                      <span className="text-muted-foreground">{example.input}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Output:</span>{' '}
                      <span className="text-muted-foreground">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="text-muted-foreground mt-2">
                        <span className="font-semibold text-foreground">Explanation:</span> {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Constraints:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {problem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
