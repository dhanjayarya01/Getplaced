"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Check, RotateCcw, ChevronLeft, Lightbulb, BookOpen, MessageSquare, Building2, Bot } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DSAAiTutor } from "@/components/dsa/dsa-ai-tutor"
import { PanelGroup, Panel, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels"
import { useVapi } from "@/components/interviews/vapi-provider"
import { cn } from "@/lib/utils"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

export interface DSAWorkspaceProps {
  problem: any
  code: string
  language: string
  onCodeChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onRun: () => void
  onSubmit: () => void
  onReset: () => void
  isRunning: boolean
  isSubmitting: boolean
  testResults: any
  activeResultTab: "testcases" | "custom"
  setActiveResultTab: (tab: "testcases" | "custom") => void
  backLink?: string
  aiEnabled?: boolean
}

export function DSAWorkspace({
  problem,
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  isSubmitting,
  testResults,
  activeResultTab,
  setActiveResultTab,
  backLink = "/dsa",
  aiEnabled = false,
}: DSAWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "discussion">("problem")
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const aiPanelRef = useRef<ImperativePanelHandle>(null)
  const { isCallActive } = useVapi()

  const tutorRunningInBackground = aiEnabled && isCallActive && !aiSidebarOpen

  const hideAiSidebar = () => {
    setAiSidebarOpen(false)
    aiPanelRef.current?.collapse()
  }

  const showAiSidebar = () => {
    setAiSidebarOpen(true)
    aiPanelRef.current?.expand()
  }

  const handleToggleAiSidebar = () => {
    if (aiSidebarOpen) hideAiSidebar()
    else showAiSidebar()
  }

  useEffect(() => {
    if (testResults?.type === 'run' && !testResults.accepted) {
      const firstFailedIndex = testResults.testResults?.findIndex((r: any) => !r.passed)
      if (firstFailedIndex !== -1 && firstFailedIndex !== undefined) {
         setSelectedTestCase(firstFailedIndex)
      }
    }
  }, [testResults])

  if (!problem) return null

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500'
      case 'Hard': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  
  return (
    <PanelGroup
      direction="horizontal"
      className="h-full overflow-hidden bg-background"
      autoSaveId={aiEnabled ? "dsa-workspace-with-ai" : "dsa-workspace"}
    >

      {/* ── LEFT: Problem Description ───────────────────────────── */}
      <Panel
        id="dsa-problem"
        order={1}
        defaultSize={aiEnabled ? 32 : 45}
        minSize={20}
        maxSize={aiEnabled ? 50 : 60}
        className="overflow-hidden flex flex-col border-r border-border"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Link href={backLink} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="w-4 h-4" />Back
            </Link>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
              </div>
              {aiEnabled && (
                <Button
                  variant={aiSidebarOpen ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleToggleAiSidebar}
                  title={tutorRunningInBackground ? "AI Tutor is active — click to show" : undefined}
                  className={cn(
                    "gap-2 relative",
                    tutorRunningInBackground &&
                      "border-green-500 text-green-600 dark:text-green-400 ring-2 ring-green-500/70 animate-pulse shadow-[0_0_14px_rgba(34,197,94,0.4)]"
                  )}
                >
                  <Bot className="w-4 h-4" />
                  {aiSidebarOpen ? "Hide AI" : "AI Tutor"}
                  {tutorRunningInBackground && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                  )}
                </Button>
              )}
            </div>

            {problem.companies?.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-muted-foreground mr-1">Asked in:</span>
                {problem.companies.map((company: any) => (
                  <Link key={company._id} href={`/companies/${company.slug}`}
                    className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs rounded-md transition-colors">
                    <Building2 className="w-3 h-3" />{company.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {(["problem", "solution", "discussion"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors capitalize ${activeTab === tab ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === "problem" && <BookOpen className="w-4 h-4 inline mr-2" />}
                  {tab === "solution" && <Lightbulb className="w-4 h-4 inline mr-2" />}
                  {tab === "discussion" && <MessageSquare className="w-4 h-4 inline mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "problem" && (
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: problem.description }} />
                {problem.examples?.map((example: any, index: number) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Example {index + 1}:</h3>
                    <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                      <div className="mb-2"><span className="font-semibold text-foreground">Input:</span> <span className="text-muted-foreground">{example.input}</span></div>
                      <div><span className="font-semibold text-foreground">Output:</span> <span className="text-muted-foreground">{example.output}</span></div>
                      {example.explanation && <div className="text-muted-foreground mt-2"><span className="font-semibold text-foreground">Explanation:</span> {example.explanation}</div>}
                    </div>
                  </div>
                ))}
                {problem.constraints?.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Constraints:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {problem.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  {problem.dataStructures?.map((ds: string) => (
                    <span key={ds} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{ds}</span>
                  ))}
                  {problem.patterns?.map((p: string) => (
                    <span key={p} className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "solution" && (
              <div className="bg-secondary rounded-lg p-4">
                {problem.solution ? (
                  <>
                    <p className="text-muted-foreground mb-4">{problem.solution.explanation}</p>
                    <div className="bg-[#1e1e1e] rounded p-4 mb-4"><pre className="font-mono text-sm overflow-x-auto text-foreground">{problem.solution.code}</pre></div>
                    {problem.solution.timeComplexity && <p className="text-sm"><span className="font-semibold">Time:</span> {problem.solution.timeComplexity}</p>}
                    {problem.solution.spaceComplexity && <p className="text-sm"><span className="font-semibold">Space:</span> {problem.solution.spaceComplexity}</p>}
                  </>
                ) : <p className="text-muted-foreground">Solution not available yet.</p>}
              </div>
            )}
            {activeTab === "discussion" && <p className="text-muted-foreground">Discussion section coming soon...</p>}
          </div>
        </div>
      </Panel>

      {/* Horizontal drag handle — problem ↔ AI (or problem ↔ editor when AI collapsed) */}
      <PanelResizeHandle
        id="dsa-problem-ai-handle"
        className="w-[4px] bg-border hover:bg-primary/60 transition-colors cursor-col-resize"
      />

      {/* ── MIDDLE: AI Sidebar (always mounted when enabled; collapsed = hidden but session keeps running) */}
      {aiEnabled && (
        <>
          <Panel
            ref={aiPanelRef}
            id="dsa-ai-tutor"
            order={2}
            collapsible
            collapsedSize={0}
            defaultSize={0}
            minSize={18}
            maxSize={42}
            onCollapse={() => setAiSidebarOpen(false)}
            onExpand={() => setAiSidebarOpen(true)}
            className="border-r border-border bg-card flex flex-col overflow-hidden"
          >
            <DSAAiTutor
              problem={problem}
              code={code}
              language={language as "javascript" | "python" | "java" | "cpp" | "c"}
              onClose={hideAiSidebar}
              onCodeChange={onCodeChange}
            />
          </Panel>
          <PanelResizeHandle
            id="dsa-ai-editor-handle"
            disabled={!aiSidebarOpen}
            className={cn(
              "w-[4px] bg-border hover:bg-primary/60 transition-colors cursor-col-resize",
              !aiSidebarOpen && "w-0 min-w-0 p-0 border-0 opacity-0 pointer-events-none"
            )}
          />
        </>
      )}

      {/* ── RIGHT: Editor + Test Cases (vertical split) ─────────── */}
      <Panel id="dsa-editor" order={aiEnabled ? 3 : 2} minSize={25} className="flex flex-col overflow-hidden">
        <PanelGroup direction="vertical" className="flex-1 overflow-hidden">

          {/* Editor section */}
          <Panel defaultSize={62} minSize={25} className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
                <RotateCcw className="w-3 h-3 mr-2" />Reset
              </Button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => onCodeChange(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  smoothScrolling: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
          </Panel>

          {/* Vertical drag handle between editor and test cases */}
          <PanelResizeHandle className="h-[4px] bg-border hover:bg-primary/60 transition-colors cursor-row-resize" />

          {/* Test Cases section */}
          <Panel defaultSize={38} minSize={12} maxSize={65} className="bg-card border-t border-border flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
              <div className="flex gap-4">
                <button onClick={() => setActiveResultTab("testcases")}
                  className={`text-sm font-medium transition-colors ${activeResultTab === "testcases" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Test Cases
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={onRun} disabled={isRunning} className="h-8">
                  <Play className="w-3 h-3 mr-2" />{isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <Button size="sm" onClick={onSubmit} disabled={isSubmitting} className="h-8 bg-green-600 hover:bg-green-700 text-white">
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {testResults ? (
                testResults.type === 'error' ? (
                  <div className="p-4 text-red-500 font-mono text-sm overflow-auto">{testResults.error}</div>
                ) : (
                  <div className="flex h-full overflow-hidden">
                    <div className="w-40 border-r border-border overflow-y-auto p-2 space-y-1 bg-secondary/10 shrink-0">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase">Cases</div>
                      {testResults.testResults?.map((tc: any, index: number) => (
                        <button key={index} onClick={() => setSelectedTestCase(index)}
                          className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${selectedTestCase === index ? "bg-secondary text-foreground" : "hover:bg-secondary/50 text-muted-foreground"}`}>
                          <span>Case {index + 1}</span>
                          {tc.passed ? <span className="text-green-500">●</span> : <span className="text-red-500">●</span>}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {testResults.accepted && (
                        <div className="mb-4 text-green-500 font-medium flex items-center gap-2">
                          <Check className="w-4 h-4" />All Test Cases Passed!
                          <span className="text-xs text-muted-foreground ml-auto">Runtime: {parseFloat(testResults.executionTime).toFixed(3)}s | Memory: {testResults.memoryUsed}KB</span>
                        </div>
                      )}
                      {testResults.testResults?.[selectedTestCase] && (
                        <div className="space-y-4 font-mono text-sm">
                          {!testResults.testResults[selectedTestCase].passed && (
                            <div className="text-red-500 font-medium mb-2">{testResults.testResults[selectedTestCase].status || 'Wrong Answer'}</div>
                          )}
                          {[['Input', 'input'], ['Output', 'actualOutput'], ['Expected', 'expectedOutput']].map(([label, key]) => (
                            <div key={key}>
                              <div className="text-xs text-muted-foreground mb-1">{label}</div>
                              <div className={`p-3 rounded whitespace-pre-wrap ${key === 'actualOutput' && !testResults.testResults[selectedTestCase].passed ? 'bg-red-500/10 text-red-500' : 'bg-secondary/50 text-foreground'}`}>
                                {testResults.testResults[selectedTestCase][key] || <span className="italic text-muted-foreground">No output</span>}
                              </div>
                            </div>
                          ))}
                          {testResults.testResults[selectedTestCase].error && (
                            <div>
                              <div className="text-xs text-red-500 mb-1">Error</div>
                              <div className="bg-red-500/10 p-3 rounded text-red-500 whitespace-pre-wrap">{testResults.testResults[selectedTestCase].error}</div>
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
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  )
}
