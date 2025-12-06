"use client"

import { useState, useEffect } from "react"
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
  Send,
  Bot,
  User,
  Play,
  Terminal,
  Globe,
  ChevronUp,
  ChevronDown,
  Users,
  Maximize2,
  RotateCcw,
  Copy,
  FileCode,
  Building2,
  CheckCircle,
  ArrowRight,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface CompanyInterviewRoomProps {
  companyId: string
  initialRound: number
}

const companyData: Record<
  string,
  { name: string; rounds: { name: string; type: string; duration: string; questions: string[] }[] }
> = {
  amazon: {
    name: "Amazon",
    rounds: [
      {
        name: "Online Assessment",
        type: "coding",
        duration: "90 min",
        questions: ["Two Sum", "Valid Parentheses", "Work Simulation"],
      },
      {
        name: "Phone Screen",
        type: "technical",
        duration: "45 min",
        questions: ["Tell me about yourself", "LRU Cache implementation"],
      },
      {
        name: "On-site Round 1",
        type: "dsa",
        duration: "60 min",
        questions: ["Merge K Sorted Lists", "Binary Tree Maximum Path Sum"],
      },
      {
        name: "On-site Round 2",
        type: "system-design",
        duration: "60 min",
        questions: ["Design a URL Shortener", "Design Amazon's Shopping Cart"],
      },
      {
        name: "Bar Raiser",
        type: "behavioral",
        duration: "60 min",
        questions: ["Customer Obsession example", "Disagree and Commit scenario"],
      },
      {
        name: "Hiring Manager",
        type: "hr",
        duration: "45 min",
        questions: ["Why Amazon?", "Career goals", "Questions for us"],
      },
    ],
  },
  google: {
    name: "Google",
    rounds: [
      {
        name: "Phone Screen 1",
        type: "coding",
        duration: "45 min",
        questions: ["Array manipulation", "String algorithms"],
      },
      {
        name: "Phone Screen 2",
        type: "coding",
        duration: "45 min",
        questions: ["Graph traversal", "Dynamic programming"],
      },
      { name: "On-site Coding 1", type: "dsa", duration: "45 min", questions: ["Complex algorithm design"] },
      { name: "On-site Coding 2", type: "dsa", duration: "45 min", questions: ["Data structure optimization"] },
      {
        name: "System Design",
        type: "system-design",
        duration: "45 min",
        questions: ["Design Google Search", "Design YouTube"],
      },
      {
        name: "Googliness",
        type: "behavioral",
        duration: "45 min",
        questions: ["Collaboration example", "Handling ambiguity"],
      },
    ],
  },
  microsoft: {
    name: "Microsoft",
    rounds: [
      { name: "Online Assessment", type: "coding", duration: "75 min", questions: ["3 coding problems"] },
      { name: "Technical Round 1", type: "dsa", duration: "60 min", questions: ["Trees and Graphs"] },
      { name: "Technical Round 2", type: "dsa", duration: "60 min", questions: ["Dynamic Programming"] },
      { name: "Design Round", type: "system-design", duration: "60 min", questions: ["System Design / OOD"] },
      {
        name: "Hiring Manager",
        type: "behavioral",
        duration: "45 min",
        questions: ["Growth mindset", "Team collaboration"],
      },
    ],
  },
}

const dsaCode = `// Problem: Two Sum
// Given an array of integers nums and an integer target,
// return indices of two numbers that add up to target.

function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9));
`

const devCode = `// Build a Product Card Component
import React from 'react';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image || "/placeholder.svg"} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">\${product.price}</p>
      <button>Add to Cart</button>
    </div>
  );
}
`

export function CompanyInterviewRoom({ companyId, initialRound }: CompanyInterviewRoomProps) {
  const [currentRound, setCurrentRound] = useState(initialRound)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [codeMode, setCodeMode] = useState<"dsa" | "dev">("dsa")
  const [code, setCode] = useState(dsaCode)
  const [output, setOutput] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalInput, setTerminalInput] = useState("")
  const [showParticipants, setShowParticipants] = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState<"output" | "browser" | "console">("output")
  const [interviewStarted, setInterviewStarted] = useState(false)

  const company = companyData[companyId] || companyData.amazon
  const round = company.rounds[currentRound] || company.rounds[0]

  useEffect(() => {
    if (!interviewStarted) return
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [interviewStarted])

  useEffect(() => {
    if (interviewStarted) {
      // Initialize with round-specific greeting
      setMessages([
        {
          role: "ai",
          content: `Hello! Welcome to your ${company.name} ${round.name}. I'll be your AI interviewer today. This round will focus on ${round.type === "dsa" ? "Data Structures and Algorithms" : round.type === "coding" ? "Coding Problems" : round.type === "system-design" ? "System Design" : round.type === "behavioral" ? "Behavioral Questions" : "Technical Discussion"}. Are you ready to begin?`,
        },
      ])
    }
  }, [interviewStarted, currentRound, company.name, round.name, round.type])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCodeModeSwitch = (mode: "dsa" | "dev") => {
    setCodeMode(mode)
    setCode(mode === "dsa" ? dsaCode : devCode)
    setOutput("")
    setConsoleOutput([])
  }

  const handleRunCode = () => {
    setConsoleOutput((prev) => [...prev, `> Running ${codeMode === "dsa" ? "JavaScript" : "React"}...`])
    setTimeout(() => {
      if (codeMode === "dsa") {
        setOutput(`[0, 1]\n\n✓ Test case passed!`)
      } else {
        setOutput("Component rendered successfully!")
      }
      setConsoleOutput((prev) => [...prev, "✓ Execution completed in 8ms"])
    }, 500)
  }

  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return
    setConsoleOutput((prev) => [...prev, `$ ${terminalInput}`])
    setTimeout(() => {
      setConsoleOutput((prev) => [...prev, `Command executed: ${terminalInput}`])
    }, 300)
    setTerminalInput("")
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: inputMessage }])
    setInputMessage("")
    setIsAISpeaking(true)

    setTimeout(() => {
      const responses = [
        "That's a solid approach! Can you walk me through the time complexity of your solution?",
        "Good thinking! Now, how would you handle edge cases like empty arrays or duplicate values?",
        "Excellent! Can you optimize this further? Think about space complexity.",
        "Great explanation! Let's move on to the next part of the problem.",
      ]
      setMessages((prev) => [...prev, { role: "ai", content: responses[Math.floor(Math.random() * responses.length)] }])
      setIsAISpeaking(false)
    }, 2000)
  }

  const handleNextRound = () => {
    if (currentRound < company.rounds.length - 1) {
      setCurrentRound(currentRound + 1)
      setElapsedTime(0)
      setMessages([])
      setInterviewStarted(false)
    }
  }

  // Pre-interview screen
  if (!interviewStarted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <Link
            href={`/getplaced/${companyId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {company.name}
          </Link>

          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{company.name} Interview</h1>
                <p className="text-muted-foreground">
                  Round {currentRound + 1} of {company.rounds.length}
                </p>
              </div>
            </div>

            {/* Round Info */}
            <div className="bg-secondary rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {round.name}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{round.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">{round.type.replace("-", " ")}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Topics Covered</div>
                <div className="flex flex-wrap gap-2">
                  {round.questions.map((q, i) => (
                    <span key={i} className="px-3 py-1 bg-background rounded-full text-sm">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/10 rounded-xl p-4 mb-6">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                Quick Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Think out loud and explain your approach</li>
                <li>• Ask clarifying questions before coding</li>
                <li>• Test your code with examples</li>
              </ul>
            </div>

            {/* Round Progress */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-3">Interview Progress</div>
              <div className="flex items-center gap-2">
                {company.rounds.map((r, i) => (
                  <div key={i} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        i < currentRound
                          ? "bg-primary text-primary-foreground"
                          : i === currentRound
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i < currentRound ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < company.rounds.length - 1 && (
                      <div className={`w-8 h-0.5 ${i < currentRound ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full bg-primary" onClick={() => setInterviewStarted(true)}>
              <Play className="w-5 h-5 mr-2" />
              Start {round.name}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Interview room
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/getplaced/${companyId}`} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-sm">
              {company.name} - {round.name}
            </h1>
            <div className="text-xs text-muted-foreground">
              Round {currentRound + 1} of {company.rounds.length}
            </div>
          </div>
        </div>

        {/* DSA/Dev toggle */}
        {(round.type === "coding" || round.type === "dsa") && (
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => handleCodeModeSwitch("dsa")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                codeMode === "dsa"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
        )}

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
            <Users className="w-4 h-4 mr-2" />
            <span className="text-xs">2</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>
          {currentRound < company.rounds.length - 1 && (
            <Button variant="outline" size="sm" onClick={handleNextRound}>
              Next Round
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          <Button variant="destructive" size="sm">
            <PhoneOff className="w-4 h-4 mr-2" />
            End
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Participants (2)
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${isAISpeaking ? "ring-2 ring-primary" : ""}`}
                >
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{company.name} Interviewer</div>
                  <div className="text-xs text-muted-foreground">{isAISpeaking ? "Speaking" : "Listening"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">You</div>
                  <div className="text-xs text-muted-foreground">{isMuted ? "Muted" : "Active"}</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company</span>
                <span>{company.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Round</span>
                <span>{round.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{round.type}</span>
              </div>
            </div>
          </div>
        )}

        {/* Code Arena */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col border-r border-border min-w-0">
              <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{codeMode === "dsa" ? "solution.js" : "ProductCard.jsx"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-background p-4 font-mono text-sm resize-none outline-none"
                  spellCheck={false}
                />
              </div>
              <div className="px-4 py-2 bg-secondary/50 border-t border-border flex items-center justify-between">
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

            {/* Output Section */}
            <div className="w-[400px] flex flex-col shrink-0">
              <div className="px-2 py-1.5 bg-secondary/50 border-b border-border flex items-center gap-1">
                <button
                  onClick={() => setActiveOutputTab("output")}
                  className={`px-3 py-1 rounded text-xs font-medium ${activeOutputTab === "output" ? "bg-background" : "text-muted-foreground"}`}
                >
                  Output
                </button>
                {codeMode === "dev" && (
                  <button
                    onClick={() => setActiveOutputTab("browser")}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${activeOutputTab === "browser" ? "bg-background" : "text-muted-foreground"}`}
                  >
                    <Globe className="w-3 h-3" />
                    Browser
                  </button>
                )}
                <button
                  onClick={() => setActiveOutputTab("console")}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${activeOutputTab === "console" ? "bg-background" : "text-muted-foreground"}`}
                >
                  <Terminal className="w-3 h-3" />
                  Console
                </button>
              </div>

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
                    <div className="flex-1 p-6 flex items-center justify-center">
                      <div className="bg-card p-6 rounded-xl border border-border w-64">
                        <div className="w-full h-32 bg-secondary rounded-lg mb-4" />
                        <h3 className="font-semibold mb-1">Product Name</h3>
                        <p className="text-primary font-bold mb-3">$99.00</p>
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                          Add to Cart
                        </button>
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
                            className={`py-0.5 ${log.startsWith("✓") ? "text-green-500" : log.startsWith(">") ? "text-blue-400" : "text-gray-400"}`}
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

          {/* Terminal (Dev mode) */}
          {codeMode === "dev" && (
            <div className={`border-t border-border bg-[#1a1a1a] transition-all ${terminalOpen ? "h-48" : "h-8"}`}>
              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="w-full h-8 px-4 flex items-center justify-between text-xs text-gray-400 hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal
                </div>
                {terminalOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              {terminalOpen && (
                <div className="h-[calc(100%-32px)] flex flex-col">
                  <div className="flex-1 p-3 overflow-auto font-mono text-xs">
                    <div className="text-green-500">~/project $</div>
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
          <div className="p-3 border-b border-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Interview Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, i) => (
              <div key={i} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${message.role === "ai" ? "bg-primary/20" : "bg-accent/20"}`}
                >
                  {message.role === "ai" ? (
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-accent" />
                  )}
                </div>
                <div
                  className={`rounded-xl px-3 py-2 max-w-[85%] ${message.role === "ai" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}
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
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
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
              <Button size="icon" onClick={handleSendMessage} className="bg-primary h-8 w-8">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Controls */}
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
