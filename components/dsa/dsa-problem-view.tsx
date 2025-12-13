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
  const [activeResultTab, setActiveResultTab] = useState<"testcases" | "custom">("testcases")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0)

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  const fetchProblem = async () => {
    try {
      const response = await apiService.dsa.getById(problemId)
      console.log("response__id________", response.data.recentSubmissions)
      if (response.success) {
        const problemData = response.data.problem || response.data
        setProblem(problemData)
        
        // Use last submitted code if available, otherwise use starter code
        if (response.data.lastSubmissionCode) {
          setCode(response.data.lastSubmissionCode)
          setLanguage(response.data.lastSubmissionLanguage || "javascript")
        } else {
          const starterCode = problemData.starterCode?.[language] || getDefaultStarterCode(language)
          setCode(starterCode)
        }
      } else {
        setError(response.message || 'Failed to fetch problem')
      }
    } catch (error: any) {
      setError(error.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultStarterCode = (lang: string) => {
    switch (lang) {
      case 'python': return '# Write your solution here\ndef solution():\n    pass'
      case 'java': return '// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}'
      case 'cpp': return '// Write your solution here\nvoid solution() {\n    \n}'
      case 'c': return '// Write your solution here\n#include <stdio.h>\n\nvoid solution() {\n    // Read from stdin, print to stdout\n}'
      default: return '// Write your solution here\nfunction solution() {\n  \n}'
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    const starterCode = problem?.starterCode?.[newLanguage] || getDefaultStarterCode(newLanguage)
    setCode(starterCode)
  }

  const handleReset = () => {
    const starterCode = problem?.starterCode?.[language] || getDefaultStarterCode(language)
    setCode(starterCode)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setTestResults(null)
    setActiveResultTab("testcases")
    try {
      const response = await apiService.dsa.run(problemId, {
        code,
        language
      })
      setTestResults({ ...response.data, type: 'run' })
      if (!response.data.accepted) {
        // Auto-select first failed test case
        const firstFailedIndex = response.data.testResults.findIndex((r: any) => !r.passed)
        if (firstFailedIndex !== -1) setSelectedTestCase(firstFailedIndex)
      }
    } catch (error: any) {
      console.error('Error running code:', error)
      setTestResults({ error: error.message || 'Execution failed', type: 'error' })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setTestResults(null)
    setActiveResultTab("testcases")
    try {
      const response = await apiService.dsa.submit(problemId, {
        code,
        language
      })
      setTestResults({ ...response.data, type: 'submit' })
    } catch (error: any) {
      console.error('Error submitting code:', error)
      setTestResults({ error: error.message || 'Submission failed', type: 'error' })
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

  if (error || !problem) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error || 'Problem not found'}</p>
          <div className="flex gap-2 justify-center">
            <Link href="/dsa">
              <Button>Back to Problems</Button>
            </Link>
            <Button variant="outline" onClick={fetchProblem}>Retry</Button>
          </div>
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
                    <div className="mb-2">
                       <span className="font-semibold text-foreground">Input:</span> <span className="text-muted-foreground">{example.input}</span>
                    </div>
                    <div>
                       <span className="font-semibold text-foreground">Output:</span> <span className="text-muted-foreground">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="text-muted-foreground mt-2">
                        <span className="font-semibold text-foreground">Explanation:</span> {example.explanation}
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
                  <div className="bg-[#1e1e1e] rounded p-4 mb-4">
                    <pre className="font-mono text-sm overflow-x-auto text-foreground">
                      {problem.solution.code}
                    </pre>
                  </div>
                  {problem.solution.timeComplexity && (
                    <p className="text-sm">
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
      <div className="w-1/2 flex flex-col h-full">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs">
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset
          </Button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden min-h-0">
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
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Test Results Panel */}
        <div className="shrink-0 bg-card border-t border-border flex flex-col max-h-[40%] flex-1">
          {/* Action Header */}
          <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-secondary/30">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveResultTab("testcases")}
                className={`text-sm font-medium transition-colors ${activeResultTab === "testcases" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                Test Cases
              </button>
              {/* Custom Input (Placeholder for future)
              <button
                onClick={() => setActiveResultTab("custom")}
                className={`text-sm font-medium transition-colors ${activeResultTab === "custom" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                Custom Input
              </button>
              */}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRun}
                disabled={isRunning}
                className="h-8"
              >
                <Play className="w-3 h-3 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {testResults ? (
               testResults.type === 'error' ? (
                  <div className="p-4 text-red-500 font-mono text-sm overflow-auto">
                    {testResults.error}
                  </div>
               ) : (
                <div className="flex h-full">
                  {/* Test Case List */}
                  <div className="w-40 border-r border-border overflow-y-auto p-2 space-y-1 bg-secondary/10">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase">Cases</div>
                    {testResults.testResults?.map((tc: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTestCase(index)}
                        className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${
                          selectedTestCase === index ? "bg-secondary text-foreground" : "hover:bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                         <span>Case {index + 1}</span>
                         {tc.passed ? <span className="text-green-500">●</span> : <span className="text-red-500">●</span>}
                      </button>
                    ))}
                  </div>
                  
                   {/* Test Case Details */}
                  <div className="flex-1 overflow-y-auto p-4">
                   {testResults.accepted && (
                      <div className="mb-4 text-green-500 font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        All Test Cases Passed!
                        <span className="text-xs text-muted-foreground ml-auto">
                           Runtime: {parseFloat(testResults.executionTime).toFixed(3)}s | Memory: {testResults.memoryUsed}KB
                        </span>
                      </div>
                    )}
                    
                    {testResults.testResults?.[selectedTestCase] && (
                        <div className="space-y-4 font-mono text-sm">
                           {/* Status Message */}
                           {!testResults.testResults[selectedTestCase].passed && (
                              <div className="text-red-500 font-medium mb-2">
                                 {testResults.testResults[selectedTestCase].status || 'Wrong Answer'}
                              </div>
                           )}

                           <div>
                              <div className="text-xs text-muted-foreground mb-1">Input</div>
                              <div className="bg-secondary/50 p-3 rounded text-foreground whitespace-pre-wrap">
                                 {testResults.testResults[selectedTestCase].input}
                              </div>
                           </div>
                           <div>
                              <div className="text-xs text-muted-foreground mb-1">Output</div>
                              <div className={`p-3 rounded whitespace-pre-wrap ${
                                 testResults.testResults[selectedTestCase].passed 
                                 ? "bg-secondary/50 text-foreground" 
                                 : "bg-red-500/10 text-red-500"
                              }`}>
                                 {testResults.testResults[selectedTestCase].actualOutput || <span className="italic text-muted-foreground">No output</span>}
                              </div>
                           </div>
                           <div>
                              <div className="text-xs text-muted-foreground mb-1">Expected</div>
                              <div className="bg-secondary/50 p-3 rounded text-foreground whitespace-pre-wrap">
                                 {testResults.testResults[selectedTestCase].expectedOutput}
                              </div>
                           </div>
                           
                           {testResults.testResults[selectedTestCase].error && (
                              <div>
                                 <div className="text-xs text-red-500 mb-1">Error</div>
                                 <div className="bg-red-500/10 p-3 rounded text-red-500 whitespace-pre-wrap">
                                    {testResults.testResults[selectedTestCase].error}
                                 </div>
                              </div>
                           )}
                        </div>
                    )}
                  </div>
                </div>
               )
            ) : (
               <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Run or submit your code to see results
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
