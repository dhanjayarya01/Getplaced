"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Check, RotateCcw, ChevronLeft, Lightbulb, BookOpen, MessageSquare, X } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { apiService } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dynamically import Monaco Editor (client-side only)
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface DSAProblemViewProps {
  problemId: string
}

export function DSAProblemView({ problemId }: DSAProblemViewProps) {
  const router = useRouter()
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "discussion">("problem")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  const fetchProblem = async () => {
    try {
      console.log('Fetching problem with ID/slug:', problemId)
      const response = await apiService.dsa.getById(problemId)
      console.log('Problem API response:', response)
      
      if (response.success) {
        // API returns { success: true, data: { problem, userProgress, recentSubmissions } }
        const problemData = response.data.problem || response.data
        console.log('Problem data:', problemData)
        setProblem(problemData)
        
        // Set starter code based on selected language
        const starterCode = problemData.starterCode?.[language] || `// Write your solution here\nfunction solution() {\n  \n}`
        setCode(starterCode)
      } else {
        const errorMsg = response.message || 'Failed to fetch problem'
        console.error('API returned error:', errorMsg)
        setError(errorMsg)
      }
    } catch (error: any) {
      console.error('Error fetching problem:', error)
      const errorMsg = error.message || error.toString() || 'Unknown error occurred'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    const starterCode = problem?.starterCode?.[newLanguage] || `// Write your solution here\nfunction solution() {\n  \n}`
    setCode(starterCode)
  }

  const handleReset = () => {
    const starterCode = problem?.starterCode?.[language] || `// Write your solution here\nfunction solution() {\n  \n}`
    setCode(starterCode)
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      // Run code against test cases
      const response = await apiService.dsa.submit(problemId, {
        code,
        language,
        isTest: true // Only run visible test cases
      })
      setTestResults(response.data)
    } catch (error) {
      console.error('Error running code:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Submit code for all test cases
      const response = await apiService.dsa.submit(problemId, {
        code,
        language,
        isTest: false // Run all test cases including hidden
      })
      setTestResults(response.data)
      if (response.data.accepted) {
        alert('✅ Accepted! All test cases passed!')
      }
    } catch (error) {
      console.error('Error submitting code:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500'
      case 'Hard': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">Error loading problem</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Link href="/dsa">
              <Button>Back to Problems</Button>
            </Link>
            <Button variant="outline" onClick={fetchProblem}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Problem not found</p>
          <Link href="/dsa">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 border-r border-border overflow-y-auto">
        <div className="p-6">
          <Link
            href="/dsa"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Problems
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "problem" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Problem
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "solution"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="w-4 h-4 inline mr-2" />
              Solution
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "discussion"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Discussion
            </button>
          </div>

          {/* Problem Tab */}
          {activeTab === "problem" && (
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />

              {/* Examples */}
              {problem.examples?.map((example: any, index: number) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Example {index + 1}:</h3>
                  <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                    <div>
                      <span className="text-muted-foreground">Input:</span> {example.input}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output:</span> {example.output}
                    </div>
                    {example.explanation && (
                      <div className="text-muted-foreground mt-2">
                        Explanation: {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {problem.constraints.map((constraint: string, index: number) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {problem.dataStructures?.map((ds: string) => (
                  <span key={ds} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {ds}
                  </span>
                ))}
                {problem.patterns?.map((pattern: string) => (
                  <span key={pattern} className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Solution Tab */}
          {activeTab === "solution" && (
            <div className="bg-secondary rounded-lg p-4">
              {problem.solution ? (
                <>
                  <p className="text-muted-foreground mb-4">{problem.solution.explanation}</p>
                  <div className="bg-[#1e1e1e] rounded p-4">
                    <pre className="font-mono text-sm overflow-x-auto text-foreground">
                      {problem.solution.code}
                    </pre>
                  </div>
                  {problem.solution.timeComplexity && (
                    <p className="mt-4 text-sm">
                      <span className="font-semibold">Time Complexity:</span> {problem.solution.timeComplexity}
                    </p>
                  )}
                  {problem.solution.spaceComplexity && (
                    <p className="text-sm">
                      <span className="font-semibold">Space Complexity:</span> {problem.solution.spaceComplexity}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Solution not available yet.</p>
              )}
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === "discussion" && (
            <div className="text-muted-foreground">
              <p>Discussion section coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRun}
              disabled={isRunning}
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
          <Button 
            size="sm" 
            className="bg-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>

        {/* Test Results */}
        <div className="h-48 bg-card border-t border-border p-4 overflow-y-auto">
          <div className="text-sm">
            <div className="font-medium mb-2">Test Results</div>
            {testResults ? (
              <div className="space-y-2">
                {testResults.testCases?.map((tc: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    {tc.passed ? (
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className={tc.passed ? 'text-green-500' : 'text-red-500'}>
                        Test case {index + 1} {tc.passed ? 'passed' : 'failed'}
                      </div>
                      {!tc.passed && tc.error && (
                        <div className="text-xs text-muted-foreground mt-1">{tc.error}</div>
                      )}
                    </div>
                  </div>
                ))}
                {testResults.accepted && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-500">
                    ✅ Accepted! All test cases passed.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">
                Run your code to see test results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
