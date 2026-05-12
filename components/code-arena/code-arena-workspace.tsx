"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Editor from "@monaco-editor/react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import {
  Play, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff,
  Terminal, FileCode, FolderTree, Settings, Folder, Square,
  Loader2, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen,
  PanelBottomClose, PanelBottomOpen, Save
} from "lucide-react"
import Link from "next/link"

// NEXT_PUBLIC_ prefix is required for env vars to be readable in the browser (Next.js rule)
const FILE_SERVER = process.env.NEXT_PUBLIC_FILE_SERVER 
interface CodeArenaWorkspaceProps {   
  problemId: string
}

type FileNode = {
  name: string
  
  type: 'file' | 'directory'
  path: string
  size?: number
  children?: FileNode[]
}

type SessionState = 'idle' | 'preparing' | 'running' | 'stopping'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    html: 'html', css: 'css', scss: 'scss', json: 'json',
    md: 'markdown', py: 'python', sh: 'shell', yaml: 'yaml', yml: 'yaml',
  }
  return map[ext] || 'plaintext'
}

export function CodeArenaWorkspace({ problemId }: CodeArenaWorkspaceProps) {
  const [code, setCode] = useState('// Select a file to view its content')
  const [tree, setTree] = useState<FileNode[]>([])
  const [activeFilePath, setActiveFilePath] = useState('')
  const [activeFileName, setActiveFileName] = useState('')
  const [editorLanguage, setEditorLanguage] = useState('javascript')
  const [isLoadingTree, setIsLoadingTree] = useState(true)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [problemDetails, setProblemDetails] = useState<any>(null)

  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [pollSeconds, setPollSeconds] = useState(0)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [testState, setTestState] = useState<'idle' | 'running' | 'done'>('idle')
  const [testResult, setTestResult] = useState<{ success: boolean; logs: string } | null>(null)
  const [showTestModal, setShowTestModal] = useState(false)

  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ Click "Prepare to Run" to start a live container.'])
  const terminalRef = useRef<HTMLDivElement>(null)

  const [showFileTree, setShowFileTree] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false)

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [terminalOutput])

  const addLog = (line: string) => setTerminalOutput(prev => [...prev, line])

  // Load problem + file tree
  useEffect(() => {
    setIsLoadingTree(true)
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    fetch(`${API}/api/development/${problemId}`)
      .then(r => r.json())
      .then(db => {
        const pd = db.data?.problem || db.problem || db
        setProblemDetails(pd)
        if (!pd.slug) throw new Error('No slug')
        return fetch(`${FILE_SERVER}/api/tree/${pd.slug}`)
      })
      .then(r => r.json())
      .then(d => { if (d.tree) setTree(d.tree) })
      .catch(e => console.error(e))
      .finally(() => setIsLoadingTree(false))
  }, [problemId])

  const handleFileClick = async (node: FileNode) => {
    if (node.type === 'directory' || !problemDetails?.slug) return
    setActiveFilePath(node.path)
    setActiveFileName(node.name)
    setEditorLanguage(getLanguage(node.name))
    setIsLoadingContent(true)
    try {
      const r = await fetch(`${FILE_SERVER}/api/content?problem=${problemDetails.slug}&file=${encodeURIComponent(node.path)}`)
      const d = await r.json()
      setCode(d.content ?? '// Error loading content')
    } catch { setCode('// Error loading content') }
    finally { setIsLoadingContent(false) }
  }

  const handleSave = async () => {
    if (!sessionId || !activeFilePath) return
    try {
      await fetch(`${FILE_SERVER}/save-file`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, filePath: activeFilePath, content: code }),
      })
      addLog(`$ ✓ Saved: ${activeFilePath} → reloading...`)
    } catch (e: any) { addLog(`$ ✗ ${e.message}`) }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sessionId, activeFilePath, code])

  const startPolling = (sid: string, url: string) => {
    let elapsed = 0
    setPollSeconds(0); setIsPreviewReady(false)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    pollIntervalRef.current = setInterval(async () => {
      elapsed += 3; setPollSeconds(elapsed)
      addLog(`$ Waiting for dev server... (${elapsed}s)`)
      try {
        const d = await (await fetch(`${FILE_SERVER}/status/${sid}`)).json()
        if (d.ready) {
          clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null
          setIsPreviewReady(true); setSessionState('running')
          addLog('$ ✓ Dev server is live! Loading preview...')
        }
      } catch {}
      if (elapsed >= 180) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null
        setSessionState('running'); addLog(`$ Timed out. Open ${url} manually.`)
      }
    }, 3000)
  }

  const handlePrepareToRun = async () => {
    if (!problemDetails?.slug) return
    setSessionState('preparing'); setSessionError(null); setPreviewUrl(null); setIsPreviewReady(false)
    setTerminalOutput([`$ Preparing: ${problemDetails.slug}`, '$ Creating workspace...'])
    try {
      const r = await fetch(`${FILE_SERVER}/run-project`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug: problemDetails.slug,
          runtimeEnvironment: problemDetails.projectProblem?.runtimeEnvironment
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')

      // Backend now returns the correct subdomain URL (https://session-abc.cinemasync.me)
      setSessionId(d.sessionId); setPreviewUrl(d.previewUrl)
      addLog(`$ ✓ Session: ${d.sessionId}`)
      addLog(`$ ✓ Preview: ${d.previewUrl}`)
      
      const entrypoint = problemDetails.projectProblem?.runtimeEnvironment?.entrypoint || 'npm'
      const args = problemDetails.projectProblem?.runtimeEnvironment?.args?.join(' ') || 'run dev'
      addLog(`$ Running container with: ${entrypoint} ${args}...`)
      
      startPolling(d.sessionId, d.previewUrl)
    } catch (e: any) { setSessionError(e.message); setSessionState('idle'); addLog(`$ ✗ ${e.message}`) }
  }

  const handleStopProject = async () => {
    if (!sessionId) return
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null }
    setSessionState('stopping'); setIsPreviewReady(false); addLog(`$ Stopping ${sessionId}...`)
    try {
      const d = await (await fetch(`${FILE_SERVER}/stop-project`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })).json()
      addLog(`$ ✓ ${d.message || 'Stopped.'}`)
    } catch (e: any) { addLog(`$ ✗ ${e.message}`) }
    finally { setSessionId(null); setPreviewUrl(null); setSessionState('idle'); setTestState('idle'); setTestResult(null); }
  }

  const handleRunTests = async () => {
    if (!sessionId) return
    setTestState('running')
    addLog(`$ Executing hidden tests...`)
    try {
      const r = await fetch(`${FILE_SERVER}/run-tests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Test execution failed')
      
      setTestResult(d)
      setTestState('done')
      setShowTestModal(true)
      addLog(d.success ? `$ ✓ Tests Passed!` : `$ ✗ Tests Failed.`)
    } catch (e: any) { 
      setTestState('idle')
      addLog(`$ ✗ ${e.message}`) 
    }
  }

  // ── Sub-components ───────────────────────────────────────────────────

  const FileTreeNode = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
    const [open, setOpen] = useState(true)
    const isFile = node.type === 'file'
    const isActive = isFile && activeFilePath === node.path
    return (
      <div>
        <button
          onClick={() => isFile ? handleFileClick(node) : setOpen(!open)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`w-full flex items-center gap-1.5 py-1 pr-2 text-xs transition-colors rounded-sm ${isActive
            ? 'bg-primary/15 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
        >
          {!isFile && <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />}
          {isFile
            ? <FileCode className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            : <Folder className="w-3.5 h-3.5 shrink-0 text-yellow-400" />}
          <span className="truncate">{node.name}</span>
        </button>
        {!isFile && open && node.children?.map((c, i) => <FileTreeNode key={i} node={c} depth={depth + 1} />)}
      </div>
    )
  }

  const IconBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
      {children}
    </button>
  )

  // Drag handle between panels
  const HResize = () => (
    <PanelResizeHandle className="w-[3px] bg-[#30363d] hover:bg-primary/70 transition-colors duration-150 cursor-col-resize" />
  )
  const VResize = () => (
    <PanelResizeHandle className="h-[3px] bg-[#30363d] hover:bg-primary/70 transition-colors duration-150 cursor-row-resize" />
  )

  // Run/Stop button (shared in preview toolbar and slim column)
  const RunControls = ({ size = 'sm' }: { size?: 'sm' }) => (
    <>
      {sessionState === 'idle' && (
        <Button size={size} onClick={handlePrepareToRun} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Play className="w-3 h-3" />Prepare to Run
        </Button>
      )}
      {sessionState === 'preparing' && (
        <Button size={size} disabled className="h-7 text-xs gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />Preparing...
        </Button>
      )}
      {sessionState === 'running' && (
        <div className="flex items-center gap-2">
          <Button size={size} variant="destructive" onClick={handleStopProject} className="h-7 text-xs gap-1.5">
            <Square className="w-3 h-3" />Stop
          </Button>
          <Button size={size} onClick={handleRunTests} disabled={testState === 'running'} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            {testState === 'running' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
            {testState === 'running' ? 'Testing...' : 'Run Tests'}
          </Button>
          {testResult && (
             <Button size={size} variant="ghost" onClick={() => setShowTestModal(true)} className={`h-7 text-xs gap-1.5 ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
               {testResult.success ? '✓ Passed' : '✗ Failed'}
             </Button>
          )}
        </div>
      )}
      {sessionState === 'stopping' && (
        <Button size={size} disabled className="h-7 text-xs gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />Stopping...
        </Button>
      )}
    </>
  )

  return (
    <div className={`h-[calc(100vh-64px)] flex flex-col bg-[#0d1117] text-foreground overflow-hidden ${isEditorFullscreen ? 'fixed inset-0 z-50' : ''}`}>

      {/* TOP HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-2">
          {(!showFileTree || isEditorFullscreen) && (
            <IconBtn onClick={() => { setShowFileTree(true); setIsEditorFullscreen(false) }} title="Show explorer">
              <PanelLeftOpen className="w-4 h-4" />
            </IconBtn>
          )}
          <div>
            <h1 className="text-sm font-semibold leading-tight">{problemDetails?.title || problemId}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{problemDetails?.slug || 'Loading...'}</span>
              {sessionId && <span className="text-xs text-emerald-400">● Live</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">{problemDetails?.difficulty || 'Practice'}</span>
          <span className="text-xs text-muted-foreground">+{problemDetails?.xpReward || 0} XP</span>
          {!isEditorFullscreen && (
            <IconBtn onClick={() => setShowPreview(v => !v)} title={showPreview ? 'Hide preview' : 'Show preview'}>
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </IconBtn>
          )}
        </div>
      </div>

      {/* MAIN RESIZABLE LAYOUT */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">

        {/* FILE TREE PANEL */}
        {showFileTree && !isEditorFullscreen && (
          <>
            <Panel defaultSize={16} minSize={10} maxSize={35} className="bg-[#161b22] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0">
                <div className="flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</span>
                </div>
                <IconBtn onClick={() => setShowFileTree(false)} title="Hide explorer">
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </IconBtn>
              </div>
              <div className="px-3 py-2 border-b border-[#30363d] shrink-0">
                <Link href="/code-arena" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-3 h-3" />Back to Arena
                </Link>
              </div>
              <div className="px-3 py-1.5 shrink-0">
                <span className="text-xs text-muted-foreground">{problemDetails?.slug || '...'}</span>
              </div>
              <div className="flex-1 overflow-y-auto py-1">
                {isLoadingTree
                  ? <p className="px-3 py-2 text-xs text-muted-foreground">Loading...</p>
                  : tree.length > 0
                    ? tree.map((n, i) => <FileTreeNode key={i} node={n} />)
                    : <p className="px-3 py-2 text-xs text-muted-foreground">No files found.</p>}
              </div>
            </Panel>
            <HResize />
          </>
        )}

        {/* EDITOR + PREVIEW */}
        <Panel className="flex flex-col overflow-hidden">
          <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">

            {/* EDITOR + TERMINAL column */}
            <Panel className="flex flex-col overflow-hidden" minSize={25}>
              <PanelGroup direction="vertical" className="flex-1 overflow-hidden">

                {/* EDITOR */}
                <Panel className="flex flex-col overflow-hidden">
                  {/* Editor toolbar */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#1c2128] border-b border-[#30363d] shrink-0">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium">
                        {activeFileName || <span className="text-muted-foreground">No file selected</span>}
                      </span>
                      {activeFileName && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{editorLanguage}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {sessionId && activeFilePath && (
                        <IconBtn onClick={handleSave} title="Save (Ctrl+S)">
                          <Save className="w-3.5 h-3.5 text-emerald-400" />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => setShowTerminal(v => !v)} title={showTerminal ? 'Hide terminal' : 'Show terminal'}>
                        {showTerminal ? <PanelBottomClose className="w-3.5 h-3.5" /> : <PanelBottomOpen className="w-3.5 h-3.5" />}
                      </IconBtn>
                      <IconBtn onClick={() => setIsEditorFullscreen(v => !v)} title={isEditorFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                        {isEditorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </IconBtn>
                      <IconBtn onClick={() => {}} title="Settings">
                        <Settings className="w-3.5 h-3.5" />
                      </IconBtn>
                    </div>
                  </div>
                  {/* Monaco editor */}
                  <div className="flex-1 overflow-hidden relative">
                    {isLoadingContent && (
                      <div className="absolute inset-0 bg-[#0d1117]/80 flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                    <Editor
                      height="100%"
                      language={editorLanguage}
                      value={code}
                      onChange={val => setCode(val ?? '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",Menlo,monospace',
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        renderLineHighlight: 'line',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        padding: { top: 12 },
                        wordWrap: 'on',
                        tabSize: 2,
                      }}
                    />
                  </div>
                </Panel>

                {/* TERMINAL — resizable height */}
                {showTerminal && (
                  <>
                    <VResize />
                    <Panel defaultSize={22} minSize={8} maxSize={60} className="bg-[#0d1117] border-t border-[#30363d] flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1c2128] border-b border-[#30363d] shrink-0">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium">Terminal</span>
                          {sessionState === 'preparing' && <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />}
                          {sessionState === 'running' && <span className="text-[10px] text-emerald-400">● Running</span>}
                        </div>
                        <IconBtn onClick={() => setShowTerminal(false)} title="Hide terminal">
                          <PanelBottomClose className="w-3.5 h-3.5" />
                        </IconBtn>
                      </div>
                      <div ref={terminalRef} className="flex-1 overflow-auto p-2 font-mono text-[11px] text-green-400 leading-relaxed">
                        {terminalOutput.map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>

            {/* PREVIEW — resizable width */}
            {showPreview && !isEditorFullscreen && (
              <>
                <HResize />
                <Panel defaultSize={50} minSize={20} maxSize={75} className="flex flex-col overflow-hidden">
                  {/* Preview toolbar */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#1c2128] border-b border-[#30363d] shrink-0">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium truncate max-w-[150px]">{previewUrl || 'Preview'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isPreviewReady && previewUrl && (
                        <IconBtn
                          onClick={() => { setIsPreviewReady(false); setTimeout(() => setIsPreviewReady(true), 100) }}
                          title="Refresh preview"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => setShowPreview(false)} title="Hide preview">
                        <EyeOff className="w-3.5 h-3.5" />
                      </IconBtn>
                      <RunControls />
                    </div>
                  </div>
                  {/* Preview content */}
                  <div className="flex-1 overflow-hidden">
                    {sessionError && (
                      <div className="p-6 text-red-400 text-xs font-mono bg-[#0d1117] h-full">
                        <p className="font-bold mb-1">Error:</p><p>{sessionError}</p>
                      </div>
                    )}
                    {!sessionError && !previewUrl && (
                      <div className="h-full flex items-center justify-center bg-[#0d1117]">
                        <div className="text-center text-muted-foreground max-w-xs">
                          <Play className="w-10 h-10 mx-auto mb-3 text-primary opacity-30" />
                          <p className="text-sm font-medium mb-1">No active session</p>
                          <p className="text-xs">Click <span className="text-emerald-400">Prepare to Run</span> to start a container.</p>
                        </div>
                      </div>
                    )}
                    {previewUrl && !isPreviewReady && (
                      <div className="h-full flex items-center justify-center bg-[#0d1117]">
                        <div className="text-center max-w-xs">
                          <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                          <p className="text-sm font-medium mb-1">Container starting...</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Running <code className="bg-secondary px-1 rounded">npm install && vite</code>
                          </p>
                          <p className="text-xs text-muted-foreground">Elapsed: {pollSeconds}s</p>
                          <p className="text-xs text-emerald-400 mt-1">Auto-loading once ready ✓</p>
                        </div>
                      </div>
                    )}
                    {previewUrl && isPreviewReady && (
                      <iframe src={previewUrl} className="w-full h-full border-0" title="Project Preview" />
                      // <iframe src="https://getplaced.tech" className="w-full h-full border-0" title="Project Preview" />
                    )}
                   
                  </div>
                </Panel>
              </>
            )}

            {/* Slim run-button strip when preview hidden */}
            {!showPreview && !isEditorFullscreen && (
              <div className="w-10 bg-[#161b22] border-l border-[#30363d] flex flex-col items-center py-3 gap-2 shrink-0">
                {sessionState === 'idle' && (
                  <button onClick={handlePrepareToRun} title="Prepare to Run"
                    className="p-2 rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                )}
                {sessionState === 'running' && (
                  <button onClick={handleStopProject} title="Stop session"
                    className="p-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors">
                    <Square className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* TEST RESULTS MODAL */}
      {showTestModal && testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {testResult.success ? <span className="text-emerald-400">✓ Tests Passed</span> : <span className="text-red-400">✗ Tests Failed</span>}
              </h2>
              <button onClick={() => setShowTestModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs bg-black/40 flex-1">
              <pre className="whitespace-pre-wrap">{testResult.logs}</pre>
            </div>
            <div className="px-4 py-3 border-t border-[#30363d] flex justify-end">
              <Button onClick={() => setShowTestModal(false)} variant="outline" className="h-8">Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
