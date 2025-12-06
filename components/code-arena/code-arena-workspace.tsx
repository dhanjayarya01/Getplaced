"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, ChevronLeft, Eye, Terminal, FileCode, FolderTree, Settings } from "lucide-react"
import Link from "next/link"

interface CodeArenaWorkspaceProps {
  problemId: string
}

const files = [
  { name: "App.tsx", type: "file", active: true },
  { name: "useState.ts", type: "file", active: false },
  { name: "index.css", type: "file", active: false },
]

export function CodeArenaWorkspace({ problemId }: CodeArenaWorkspaceProps) {
  const [code, setCode] = useState(`import { useState } from './useState';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default App;`)

  const [terminalOutput, setTerminalOutput] = useState([
    "$ npm start",
    "Starting development server...",
    "Compiled successfully!",
    "",
    "You can now view the app in the browser.",
    "Local: http://localhost:3000",
  ])

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Sidebar - File Explorer */}
      <div className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <Link
            href="/code-arena"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FolderTree className="w-4 h-4 text-primary" />
            Files
          </div>
        </div>

        <div className="flex-1 p-2 space-y-1">
          {files.map((file) => (
            <button
              key={file.name}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                file.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <FileCode className="w-4 h-4" />
              {file.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Problem Header */}
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Implement useState Hook</h1>
              <p className="text-sm text-muted-foreground">Create a custom useState hook from scratch</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm">Intermediate</span>
              <span className="text-sm text-muted-foreground">+150 XP</span>
            </div>
          </div>
        </div>

        {/* Editor and Preview Split */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="w-1/2 flex flex-col border-r border-border">
            <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">App.tsx</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm overflow-auto">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none text-foreground"
                spellCheck={false}
              />
            </div>

            {/* Terminal */}
            <div className="h-40 bg-[#1e1e1e] border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Terminal</span>
              </div>
              <div className="p-3 font-mono text-xs text-muted-foreground overflow-auto h-[calc(100%-36px)]">
                {terminalOutput.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            </div>

            <div className="flex-1 bg-background p-8 flex items-center justify-center">
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Counter: 0</h2>
                <Button className="bg-primary text-primary-foreground">Increment</Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="h-48 bg-card border-t border-border p-4 overflow-y-auto">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  1. Create a custom <code className="bg-secondary px-1 rounded">useState</code> hook in the useState.ts
                  file
                </p>
                <p>2. Your hook should return a tuple with the current state and a setter function</p>
                <p>3. The counter in the preview should work correctly when clicking the button</p>
                <p>4. Do not use React&apos;s built-in useState</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
