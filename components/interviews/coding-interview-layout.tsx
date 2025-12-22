"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, PhoneOff, X } from "lucide-react"
import { useVapi } from "./vapi-provider"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { DSAWorkspace } from "@/components/dsa/dsa-workspace"

interface CodingInterviewLayoutProps {
  session: any
  interview: any
  systemPrompt?: string
}

export function CodingInterviewLayout({ session, interview, systemPrompt }: CodingInterviewLayoutProps) {
  const router = useRouter()
  const { isCallActive, isMuted, transcript, startCall, endCall, toggleMute } = useVapi()
  const [isAvatarHidden, setIsAvatarHidden] = useState(false)
  
  // Workspace State
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [activeResultTab, setActiveResultTab] = useState<"testcases" | "custom">("testcases")
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Ref to access current code in callbacks without dependency issues
  const codeRef = useRef(code)
  
  useEffect(() => {
    codeRef.current = code
  }, [code])

  // Load appropriate problem
  useEffect(() => {
      loadProblem()
  }, [interview])

  const loadProblem = async () => {
      // Logic:
      // 1. If session has a specific problem assigned, use that (future feature)
      // 2. Since this is a "Mock Interview" which might not be linked to a specific DB problem ID yet,
      //    we can either fetch a random one from DB or generate a "Generic" placeholder.
      
      // For now, let's try to fetch a random problem suitable for the interview level
      // Or just load the "mock-problem" if it exists in DB, else use a Generic "Interview Question"
      
      try {
          // Attempt to fetch a random problem - or a specific one if you have that logic
          // As a fallback for this demo, we create a generic problem object that allows free coding
          const genericProblem = {
              _id: "mock-session-problem",
              title: "Coding Interview Question",
              difficulty: "Medium",
              description: `
                <h3>Problem Description</h3>
                <p>The interviewer will ask you a specific algorithmic question. Use this editor to write your solution.</p>
                <p><strong>Listen carefully to the problem statement from the AI Interviewer.</strong></p>
                <p>You can ask clarifying questions if needed.</p>
              `,
              starterCode: {
                  javascript: "// Write your solution here\nfunction solution() {\n  \n}",
                  python: "# Write your solution here\ndef solution():\n    pass",
                  java: "// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}",
                  cpp: "// Write your solution here\nvoid solution() {\n    \n}"
              },
              examples: [],
              constraints: [],
              companies: []
          }
           setProblem(genericProblem)
           setCode(genericProblem.starterCode['javascript'])
      } catch (err) {
          console.error("Failed to load problem", err)
      }
  }


  useEffect(() => {
    // Use the backend-generated system prompt if available
    const prompt = systemPrompt || `You are conducting a ${interview.title} coding interview.
Stage: ${interview.interviewStages.find((s: any) => s.stage === session.currentStage)?.stageName}
Topics: ${interview.interviewStages.find((s: any) => s.stage === session.currentStage)?.topics.join(", ")}
Guide the candidate through the coding problem.`
    
    console.log('Using system prompt:', prompt.substring(0, 200) + '...')
    
    // Define the 'readCode' tool
    const additionalFunctions = [
        {
            name: "readCode",
            description: "Read the code currently written by the candidate in the editor. Use this to check their progress, syntax, or logic.",
            parameters: {
                type: "object",
                properties: {}, // No params needed
            }
        }
    ]
    
    // Auto-start VAPI call with voice and language preferences
    if (prompt && !isCallActive) {
      const voiceId = (session as any).voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel - default
      const language = (session as any).language || 'English'
      
      const handleFunctionCall = async (name: string, args: any) => {
           if (name === 'readCode') {
               const currentCode = codeRef.current
               console.log("👀 AI is reading code:", currentCode)
               // IMPORTANT: We need to give this info back to the AI.
               // Since VAPI's tool-call flow in the browser SDK doesn't always support direct return values easily 
               // (depending on version), a reliable hack is to 'inject' a system message or user message 
               // representing the result.
               
               // However, if we assume the standard "return result" flow works in the provider, we return it.
               // We will format it clearly.
               return `[Current Code Context]:\n\`\`\`${language}\n${currentCode}\n\`\`\``
           }
           
           // Handle submitFeedback (logic duplicated here or handled in provider? 
           // Provider handles 'submitFeedback' if passed to it or default? 
           // In our provider, we just forward calls. We need to handle submitFeedback here too if needed, 
           // OR let the provider handle it?
           // The provider has logic to generic 'onFunctionCall' but checking previous code,
           // the VoicLayout handled 'submitFeedback' explicitly. This Layout didn't have it before.
           
           if (name === 'submitFeedback') {
               // Logic similar to VoiceInterviewLayout
               await handleFeedbackSubmission(args)
           }
      }
      
      startCall(prompt, voiceId, language, handleFunctionCall, additionalFunctions).catch(err => console.error("Failed to start VAPI:", err))
    }
  }, [systemPrompt]) // Dependency array intentionally limited to avoid restarts

  const handleFeedbackSubmission = async (args: any) => {
      console.log('✅ AI submitted feedback:', args)
      
      // Build feedback text
      let feedbackText = `Interview completed with score ${args.score}/10\n\n`
      
      if (args.areasGoodIn?.length > 0) {
        feedbackText += "**What You Did Well:**\n"
        args.areasGoodIn.forEach((area: string, i: number) => {
          feedbackText += `${i + 1}. ${area}\n`
        })
        feedbackText += "\n"
      }
      
      if (args.areasToWorkOn?.length > 0) {
        feedbackText += "**Top Areas for Improvement:**\n"
        args.areasToWorkOn.forEach((area: string, i: number) => {
          feedbackText += `${i + 1}. ${area}\n`
        })
      }
      
      // Save to backend
      try {
        await apiService.interviewSessions.updateScore(session._id, {
          stage: session.currentStage,
          score: args.score,
          feedback: feedbackText
        })
        
        // End call
        await endCall()
        
        // Auto-redirect
        setTimeout(() => {
          router.push("/interviews")
        }, 1000) 
      } catch (error) {
        console.error("Failed to save feedback:", error)
      }
  }

  const handleEndInterview = async () => {
    // Manually end call
    await endCall()
    router.push("/interviews")
  }
  
  // Dummy Handlers for the Workspace (since we might not have a real backend runner for "Generic" problems yet)
  const handleRun = async () => {
      setIsRunning(true)
      // Simulate running for 1s
      setTimeout(() => {
          setIsRunning(false)
          setTestResults({
              type: 'run',
              accepted: true, 
              testResults: [{passed: true, input: 'custom', expectedOutput: 'N/A', actualOutput: 'Output from code...'}]
          })
          setActiveResultTab("testcases")
      }, 1000)
  }
  
  const handleSubmit = async () => {
      setIsSubmitting(true)
      setTimeout(() => {
          setIsSubmitting(false)
          setTestResults({
              type: 'submit',
              accepted: true, 
              testResults: []
          })
      }, 1000)
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Unified DSA Workspace */}
      <div className="h-full w-full">
         <DSAWorkspace 
            problem={problem}
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onRun={handleRun}
            onSubmit={handleSubmit}
            onReset={() => setCode(problem?.starterCode?.[language] || "")}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            testResults={testResults}
            activeResultTab={activeResultTab}
            setActiveResultTab={setActiveResultTab}
            backLink="/interviews"
            aiEnabled={false} // Sidebar not needed as we have avatars
         />
      </div>

      {/* Interview Avatars Overlay - Top Right */}
      {!isAvatarHidden && (
        <div className="fixed top-4 right-4 bg-card border rounded-xl shadow-2xl z-50 w-80">
          <div className="p-4">
            {/* Header with hide button */}
            <div className="flex items-center justify-between mb-3">
              <div className={`px-2 py-1 rounded-full text-xs ${
                isCallActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {isCallActive ? "● Live Interview" : "● Offline"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAvatarHidden(true)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* AI Avatar */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-secondary/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">AI Interviewer</h3>
                <p className="text-xs text-muted-foreground">{isCallActive ? "Monitoring..." : "Paused"}</p>
              </div>
              {/* Visual indicator when reading code? */}
            </div>

            {/* Transcript Preview */}
            <div className="mb-3 p-3 bg-secondary/20 rounded-lg max-h-32 overflow-y-auto">
              <h4 className="text-xs font-semibold mb-2">Recent Conversation</h4>
              {transcript.slice(-3).map((item, index) => (
                <div key={index} className="text-xs mb-1">
                  <span className="font-medium">{item.role === "assistant" ? "AI: " : "You: "}</span>
                  <span className="text-muted-foreground line-clamp-1">{item.content}</span>
                </div>
              ))}
              {transcript.length === 0 && (
                <p className="text-xs text-muted-foreground">No conversation yet...</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "default" : "outline"}
                size="sm"
                onClick={toggleMute}
                className="flex-1"
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndInterview}
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show Avatars Button (when hidden) */}
      {isAvatarHidden && (
        <Button
          onClick={() => setIsAvatarHidden(false)}
          className="fixed top-4 right-4 z-50"
          size="sm"
        >
          Show Interview Panel
        </Button>
      )}
    </div>
  )
}
