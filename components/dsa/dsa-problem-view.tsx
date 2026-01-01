"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { DSAWorkspace } from "./dsa-workspace"
import { VapiProvider } from "@/components/interviews/vapi-provider"
import { useCodeDraftAutoSave } from "@/hooks/useCodeDraftAutoSave"
import { localCache } from "@/lib/localCache"
import { toast } from "sonner"

export interface DSAProblemViewProps {
  problemId: string
  initialCode?: string
  initialLanguage?: string
  aiEnabled?: boolean
}

export function DSAProblemView({ problemId, initialCode, initialLanguage, aiEnabled = true }: DSAProblemViewProps) {
  const router = useRouter()
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState(initialCode || "")
  const [language, setLanguage] = useState(initialLanguage || "javascript")
  const [activeResultTab, setActiveResultTab] = useState<"testcases" | "custom">("testcases")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save hook
  useCodeDraftAutoSave(problemId, code, language, true)

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  const fetchProblem = async () => {
    try {
      setLoading(true)
      const response = await apiService.dsa.getById(problemId)
      if (response.success) {
        const problemData = response.data.problem || response.data
        setProblem(problemData)
        
        const formatCode = (c: string) => c ? c.replace(/\\n/g, '\n') : ''

        // Priority: Draft \u003e Last Submission \u003e Starter Code
        const draft = localCache.codeDrafts.get(problemId)
        
        if (draft && !initialCode) {
          // Load from draft
          setCode(formatCode(draft.code))
          setLanguage(draft.language || "javascript")
          console.log('📝 Loaded code draft from localStorage')
        } else if (response.data.lastSubmissionCode && !initialCode) {
          setCode(formatCode(response.data.lastSubmissionCode))
          setLanguage(response.data.lastSubmissionLanguage || "javascript")
        } else if (!initialCode) {
          const starterCode = problemData.starterCode?.[language] || getDefaultStarterCode(language)
          setCode(formatCode(starterCode))
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
    const newStarterCode = problem?.starterCode?.[newLanguage] || getDefaultStarterCode(newLanguage)
    setCode(newStarterCode ? newStarterCode.replace(/\\n/g, '\n') : '')
  }

  const handleReset = () => {
    const starterCode = problem?.starterCode?.[language] || getDefaultStarterCode(language)
    setCode(starterCode ? starterCode.replace(/\\n/g, '\n') : '')
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
    <div className="h-[calc(100vh-64px)]">
      <VapiProvider>
        <DSAWorkspace
          problem={problem}
          code={code}
          language={language}
          onCodeChange={setCode}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
          onSubmit={handleSubmit}
          onReset={handleReset}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          testResults={testResults}
          activeResultTab={activeResultTab}
          setActiveResultTab={setActiveResultTab}
          aiEnabled={aiEnabled}
        />
      </VapiProvider>
    </div>
  )
}
