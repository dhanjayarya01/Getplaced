"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Clock,
  ChevronLeft,
  Volume2,
  Send,
  Bot,
  User,
  Play,
  Terminal,
  Globe,
  ChevronUp,
  ChevronDown,
  Users,
  Settings,
  Maximize2,
  RotateCcw,
  Copy,
  FileCode,
} from "lucide-react"
import Link from "next/link"

interface InterviewRoomProps {
  interviewType: string
}

const interviewTypeLabels: Record<string, string> = {
  voice: "1:1 Voice Interview",
  technical: "Technical Interview",
  behavioral: "Behavioral Interview",
  panel: "Panel Interview",
  "system-design": "System Design Interview",
  hr: "HR Round",
  gd: "Group Discussion",
  full: "Full Mock Interview",
}

const sampleMessages = [
  {
    role: "ai",
    content: "Hello! Welcome to your mock interview. I'm your AI interviewer today. Are you ready to begin?",
  },
  { role: "user", content: "Yes, I'm ready!" },
  {
    role: "ai",
    content:
      "Great! Let's start with a coding problem. Given an array of integers, find two numbers that add up to a specific target. Can you solve this?",
  },
]

const dsaStarterCode = `// Two Sum Problem
// Given an array of integers nums and an integer target,
// return indices of the two numbers that add up to target.

function twoSum(nums, target) {
  // Write your solution here
  
  return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6));      // Expected: [1, 2]
`

const devStarterCode = `// Build a simple counter component
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="counter">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}
`

export function InterviewRoom({ interviewType }: InterviewRoomProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [messages, setMessages] = useState(sampleMessages)
  const [inputMessage, setInputMessage] = useState("")
  const [isAISpeaking, setIsAISpeaking] = useState(false)

  const [codeMode, setCodeMode] = useState<"dsa" | "dev">("dsa")
  const [code, setCode] = useState(dsaStarterCode)
  const [output, setOutput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalInput, setTerminalInput] = useState("")
  const [showParticipants, setShowParticipants] = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState<"output" | "browser" | "console">("output")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAISpeaking])

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCodeModeSwitch = (mode: "dsa" | "dev") => {
    setCodeMode(mode)
    setCode(mode === "dsa" ? dsaStarterCode : devStarterCode)
    setOutput("")
    setConsoleOutput([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleRunCode = () => {
    setConsoleOutput((prev) => [...prev, `> Running ${codeMode === "dsa" ? "JavaScript" : "React"}...`])

    if (codeMode === "dsa") {
      // Simulate DSA output
      setTimeout(() => {
        setOutput(`[0, 1]\n[1, 2]\n\n✓ All test cases passed!`)
        setConsoleOutput((prev) => [...prev, "✓ Execution completed in 12ms"])
      }, 500)
    } else {
      // Simulate dev output
      setTimeout(() => {
        setOutput("Component rendered successfully!")
        setConsoleOutput((prev) => [...prev, "✓ Build successful", "✓ No errors found"])
      }, 500)
    }
  }

  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return
    setConsoleOutput((prev) => [...prev, `$ ${terminalInput}`])

    // Simulate terminal responses
    if (terminalInput.includes("npm")) {
      setTimeout(() => {
        setConsoleOutput((prev) => [...prev, "added 0 packages in 1.2s"])
      }, 300)
    } else if (terminalInput.includes("node")) {
      setTimeout(() => {
        setConsoleOutput((prev) => [...prev, "Executing script..."])
      }, 300)
    } else {
      setTimeout(() => {
        setConsoleOutput((prev) => [...prev, `Command executed: ${terminalInput}`])
      }, 300)
    }
    setTerminalInput("")
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setMessages([...messages, { role: "user", content: inputMessage }])
    setInputMessage("")

    setIsAISpeaking(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "That's a great approach! Your solution has O(n) time complexity using a hash map. Can you optimize it further or handle edge cases?",
        },
      ])
      setIsAISpeaking(false)
    }, 2000)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/interviews" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-sm">{interviewTypeLabels[interviewType] || "Mock Interview"}</h1>
            <div className="text-xs text-muted-foreground">Practice Session</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <button
            onClick={() => handleCodeModeSwitch("dsa")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              codeMode === "dsa" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            DSA
          </button>
          <button
            onClick={() => handleCodeModeSwitch("dev")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              codeMode === "dev" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dev
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className={showParticipants ? "bg-secondary" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="text-xs">2</span>
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>
          <Button variant="destructive" size="sm">
            <PhoneOff className="w-4 h-4 mr-2" />
            End
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showParticipants && (
          <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Participants (2)
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-4">
              {/* AI Interviewer */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${isAISpeaking ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                >
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">AI Interviewer</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAISpeaking ? "bg-green-500" : "bg-muted"}`} />
                    {isAISpeaking ? "Speaking" : "Listening"}
                  </div>
                </div>
                <Volume2 className={`w-4 h-4 ${isAISpeaking ? "text-primary animate-pulse" : "text-muted"}`} />
              </div>

              {/* User */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center ${!isMuted ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
                >
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">You</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${isMuted ? "bg-red-500" : "bg-green-500"}`} />
                    {isMuted ? "Muted" : "Active"}
                  </div>
                </div>
                {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-green-500" />}
              </div>
            </div>

            {/* Interview Info */}
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">INTERVIEW INFO</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{interviewTypeLabels[interviewType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className={codeMode === "dsa" ? "text-primary" : "text-accent"}>
                    {codeMode === "dsa" ? "DSA Problem" : "Dev Challenge"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex">
            {/* Code Editor Section */}
            <div className="flex-1 flex flex-col border-r border-border min-w-0">
              {/* Editor Header */}
              <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{codeMode === "dsa" ? "solution.js" : "Counter.jsx"}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      codeMode === "dsa" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}
                  >
                    {codeMode === "dsa" ? "JavaScript" : "React"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-background p-4 font-mono text-sm resize-none outline-none"
                  spellCheck={false}
                  placeholder="Write your code here..."
                />
              </div>

              {/* Run Button Bar */}
              <div className="px-4 py-2 bg-secondary/50 border-t border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleRunCode} className={codeMode === "dsa" ? "bg-primary" : "bg-accent"}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </Button>
                  <Button variant="outline" size="sm">
                    Submit
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">Ctrl + Enter to run</span>
              </div>
            </div>

            <div className="w-[400px] flex flex-col shrink-0">
              {/* Output Tabs */}
              <div className="px-2 py-1.5 bg-secondary/50 border-b border-border flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveOutputTab("output")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeOutputTab === "output"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Output
                </button>
                {codeMode === "dev" && (
                  <button
                    onClick={() => setActiveOutputTab("browser")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeOutputTab === "browser"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    Browser
                  </button>
                )}
                <button
                  onClick={() => setActiveOutputTab("console")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeOutputTab === "console"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  Console
                </button>
              </div>

              {/* Output Content */}
              <div className="flex-1 overflow-hidden">
                {activeOutputTab === "output" && (
                  <div className="h-full p-4 bg-background overflow-auto">
                    {output ? (
                      <pre className="font-mono text-sm text-green-500 whitespace-pre-wrap">{output}</pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Run your code to see output
                      </div>
                    )}
                  </div>
                )}

                {activeOutputTab === "browser" && codeMode === "dev" && (
                  <div className="h-full flex flex-col bg-background">
                    <div className="px-3 py-2 bg-secondary border-b border-border flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 mx-2">
                        <div className="bg-background rounded px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          localhost:3000
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {/* Browser Preview */}
                    <div className="flex-1 p-8 flex items-center justify-center">
                      <div className="text-center space-y-4 bg-card p-8 rounded-xl border border-border">
                        <h2 className="text-4xl font-bold">Count: 0</h2>
                        <div className="flex items-center gap-3 justify-center">
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                            Increment
                          </button>
                          <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium">
                            Decrement
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeOutputTab === "console" && (
                  <div className="h-full flex flex-col bg-[#1a1a1a]">
                    <div className="flex-1 p-3 overflow-auto font-mono text-xs">
                      {consoleOutput.length > 0 ? (
                        consoleOutput.map((log, i) => (
                          <div
                            key={i}
                            className={`py-0.5 ${
                              log.startsWith("✓")
                                ? "text-green-500"
                                : log.startsWith(">")
                                  ? "text-blue-400"
                                  : log.startsWith("$")
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                            }`}
                          >
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">Console output will appear here...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {codeMode === "dev" && (
            <div className={`border-t border-border bg-[#1a1a1a] transition-all ${terminalOpen ? "h-48" : "h-8"}`}>
              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="w-full h-8 px-4 flex items-center justify-between text-xs text-gray-400 hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </div>
                {terminalOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {terminalOpen && (
                <div className="h-[calc(100%-32px)] flex flex-col">
                  <div className="flex-1 p-3 overflow-auto font-mono text-xs">
                    <div className="text-green-500">~/interview-workspace $</div>
                    {consoleOutput
                      .filter((log) => log.startsWith("$"))
                      .map((cmd, i) => (
                        <div key={i} className="text-gray-300">
                          {cmd}
                        </div>
                      ))}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-700 flex items-center gap-2">
                    <span className="text-green-500 text-xs font-mono">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTerminalCommand()}
                      placeholder="Enter command..."
                      className="flex-1 bg-transparent outline-none text-xs font-mono text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-card border-l border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Interview Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, i) => (
              <div key={i} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "ai" ? "bg-primary/20" : "bg-accent/20"
                  }`}
                >
                  {message.role === "ai" ? (
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-accent" />
                  )}
                </div>
                <div
                  className={`rounded-xl px-3 py-2 max-w-[85%] ${
                    message.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-xs leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isAISpeaking && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-secondary rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your response..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="icon" onClick={handleSendMessage} className="bg-primary text-primary-foreground h-8 w-8">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Controls at bottom of sidebar */}
          <div className="p-3 border-t border-border bg-secondary/50">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
                className="rounded-full h-10 w-10 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="sm"
                className="rounded-full h-10 w-10 p-0"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
